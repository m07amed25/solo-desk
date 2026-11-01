import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
import type { PoolClient } from "pg";

export interface InvitationDeliveryPayload {
  invitationId: string;
  workspaceId: string;
  workspaceName: string;
  inviterName: string;
  recipientEmail: string;
  role: "admin" | "member";
  token: string;
  generation: number;
  expiresAt: string;
}

export interface EncryptionContext {
  workspaceId: string;
  invitationId: string;
  generation: number;
}

/**
 * Derives a 32-byte AES-256 key from environment or returns test key.
 */
export function getInvitationKey(rawKey = process.env.SOLODESK_INVITATION_KEY || process.env.AUTH_SECRET || "solodesk-dev-invitation-key-32b"): {
  key: Buffer;
  keyId: string;
} {
  const key = createHash("sha256").update(rawKey).digest();
  const keyId = createHash("sha256").update(key).digest("hex").slice(0, 16);
  return { key, keyId };
}

/**
 * Encrypts invitation delivery payload using AES-256-GCM with AAD binding.
 * AAD: workspaceId:invitationId:generation
 * Binary format: [12-byte IV][16-byte AuthTag][Ciphertext]
 */
export function encryptInvitationDelivery(
  payload: InvitationDeliveryPayload,
  context: EncryptionContext,
  key = getInvitationKey().key,
  keyId = getInvitationKey().keyId,
): { encrypted: Buffer; keyId: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  // Authenticate context (AAD) to prevent ciphertext transplanting
  const aad = Buffer.from(
    `${context.workspaceId}:${context.invitationId}:${context.generation}`,
    "utf8",
  );
  cipher.setAAD(aad);

  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  const encrypted = Buffer.concat([iv, tag, ciphertext]);
  return { encrypted, keyId };
}

/**
 * Decrypts invitation delivery payload and verifies authenticated context.
 */
export function decryptInvitationDelivery(
  encrypted: Buffer,
  context: EncryptionContext,
  key = getInvitationKey().key,
): InvitationDeliveryPayload {
  if (encrypted.length < 28) {
    throw new Error("Invalid encrypted delivery payload: too short");
  }

  const iv = encrypted.subarray(0, 12);
  const tag = encrypted.subarray(12, 28);
  const ciphertext = encrypted.subarray(28);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  const aad = Buffer.from(
    `${context.workspaceId}:${context.invitationId}:${context.generation}`,
    "utf8",
  );
  decipher.setAAD(aad);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8"));
}

/**
 * Leases pending outbox events for delivery.
 */
export async function leasePendingOutboxEvents(
  client: PoolClient,
  batchSize = 20,
  leaseDurationMs = 60_000,
): Promise<Array<{
  id: string;
  workspace_id: string;
  event_type: string;
  target_id: string;
  generation: number;
  encrypted_delivery: Buffer;
  key_id: string;
  lease_token: string;
}>> {
  const leaseToken = randomBytes(16).toString("hex");

  const res = await client.query(
    `UPDATE solodesk.outbox_events
     SET status = 'leased',
         lease_token = $1,
         lease_until = clock_timestamp() + ($2 || ' milliseconds')::interval,
         attempts = attempts + 1
     WHERE id IN (
       SELECT id FROM solodesk.outbox_events
       WHERE (status = 'pending' OR (status = 'leased' AND lease_until < clock_timestamp()))
         AND available_at <= clock_timestamp()
         AND attempts < 5
       ORDER BY available_at ASC, id ASC
       LIMIT $3
       FOR UPDATE SKIP LOCKED
     )
     RETURNING id, workspace_id, event_type, target_id, generation, encrypted_delivery, key_id, lease_token`,
    [leaseToken, leaseDurationMs, batchSize],
  );

  return res.rows;
}

/**
 * Completes outbox delivery: updates status to 'sent' and clears terminal ciphertext.
 */
export async function completeOutboxEvent(
  client: PoolClient,
  eventId: string,
  leaseToken: string,
): Promise<void> {
  await client.query(
    `UPDATE solodesk.outbox_events
     SET status = 'sent',
         sent_at = clock_timestamp(),
         encrypted_delivery = NULL,
         lease_token = NULL,
         lease_until = NULL
     WHERE id = $1 AND lease_token = $2`,
    [eventId, leaseToken],
  );
}

/**
 * Fails outbox delivery with exponential backoff or dead-letter status.
 */
export async function failOutboxEvent(
  client: PoolClient,
  eventId: string,
  leaseToken: string,
  errorCode: string,
  isRetryable: boolean,
): Promise<void> {
  if (isRetryable) {
    await client.query(
      `UPDATE solodesk.outbox_events
       SET status = 'pending',
           last_error_code = $3,
           available_at = clock_timestamp() + (POWER(2, attempts) * INTERVAL '5 seconds'),
           lease_token = NULL,
           lease_until = NULL
       WHERE id = $1 AND lease_token = $2`,
      [eventId, leaseToken, errorCode],
    );
  } else {
    await client.query(
      `UPDATE solodesk.outbox_events
       SET status = 'dead',
           last_error_code = $3,
           encrypted_delivery = NULL,
           lease_token = NULL,
           lease_until = NULL
       WHERE id = $1 AND lease_token = $2`,
      [eventId, leaseToken, errorCode],
    );
  }
}
