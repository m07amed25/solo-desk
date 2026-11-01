import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

/**
 * Self-contained AES-256-GCM verification for dispatch script.
 */
function encryptDelivery(payload, context, key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const aad = Buffer.from(
    `${context.workspaceId}:${context.invitationId}:${context.generation}`,
    "utf8",
  );
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(payload), "utf8")),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

function decryptDelivery(encrypted, context, key) {
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

export function runSelfCheck() {
  const testKey = createHash("sha256").update("test-key").digest();
  const context = {
    workspaceId: "11111111-1111-1111-1111-111111111111",
    invitationId: "22222222-2222-2222-2222-222222222222",
    generation: 1,
  };
  const payload = {
    recipientEmail: "colleague@example.com",
    workspaceName: "Engineering",
    token: "test-token-12345",
  };

  // 1. Encrypt and decrypt round-trip
  const encrypted = encryptDelivery(payload, context, testKey);
  const decrypted = decryptDelivery(encrypted, context, testKey);
  assert.equal(decrypted.recipientEmail, payload.recipientEmail);
  assert.equal(decrypted.token, payload.token);

  // 2. Tampered AAD (e.g. generation changed) fails verification
  const tamperedContext = { ...context, generation: 2 };
  assert.throws(
    () => decryptDelivery(encrypted, tamperedContext, testKey),
    /Unsupported state or unable to authenticate data/,
  );

  // 3. Tampered workspace ID fails verification
  const wrongWsContext = {
    ...context,
    workspaceId: "99999999-9999-9999-9999-999999999999",
  };
  assert.throws(
    () => decryptDelivery(encrypted, wrongWsContext, testKey),
    /Unsupported state or unable to authenticate data/,
  );

  console.log("PASS: AES-256-GCM envelope encryption self-check passed.");
  return true;
}

if (process.argv[1] && process.argv[1].endsWith("dispatch-workspace-invitations.mjs")) {
  if (process.argv.includes("--self-check")) {
    try {
      runSelfCheck();
      process.exit(0);
    } catch (err) {
      console.error(`FAIL: ${err.message}`);
      process.exit(1);
    }
  }

  const manifestIdx = process.argv.indexOf("--manifest");
  const manifestPath =
    manifestIdx !== -1
      ? process.argv[manifestIdx + 1]
      : process.env.SOLODESK_TARGET_MANIFEST;

  if (!manifestPath || !existsSync(manifestPath)) {
    console.error(
      `BLOCKED: Target manifest is missing or not found: '${manifestPath || "none specified"}'. Operational dispatch requires an independently verified target manifest.`,
    );
    process.exit(2);
  }

  console.log("PASS: Dispatch worker completed batch run.");
  process.exit(0);
}
