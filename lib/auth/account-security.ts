import "server-only";
import { createHash, randomUUID } from "node:crypto";

export const PROOF_LIFETIME_MS = 300_000; // Exactly 5 minutes (300,000 ms)

export type ReauthAction = "revoke_session" | "revoke_other_sessions";
export type ReauthMethod = "password" | "google" | "github";

export type IntentState =
  | "pending"
  | "verified"
  | "reserved"
  | "consumed"
  | "cancelled"
  | "expired"
  | "unavailable";

export type OperationState =
  "prepared" | "executing" | "accepted" | "rejected" | "partial" | "unknown";

export type TargetRevocationResult =
  "revoked" | "alreadyAbsent" | "failed" | "unknown" | "pending";

export class AccountSecurityError extends Error {
  code: string;
  statusHttp: number;

  constructor(code: string, message: string, statusHttp: number = 400) {
    super(`[${code}] ${message}`);
    this.name = "AccountSecurityError";
    this.code = code;
    this.statusHttp = statusHttp;
  }
}

export interface ReauthIntent {
  id: string;
  userId: string;
  originalSessionId: string;
  action: ReauthAction;
  targetSnapshot: string[];
  targetDigest: string;
  method: ReauthMethod;
  challengeStateDigest?: string | null;
  challengeExpiresAt?: string | null;
  verifiedAt?: string | null;
  expiresAt?: string | null;
  state: IntentState;
  reservedOperationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RevocationTargetResult {
  reference: string;
  status: TargetRevocationResult;
  error?: string;
}

export interface RevocationOperation {
  operationId: string;
  userId: string;
  originalSessionId: string;
  intentId: string;
  payloadDigest: string;
  state: OperationState;
  targetResults: RevocationTargetResult[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export function computeSha256Hex(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

export function computeTargetDigest(targets: string[]): string {
  const canonical = JSON.stringify([...targets].sort());
  return computeSha256Hex(canonical);
}

export function computePayloadDigest(
  action: ReauthAction,
  targetSnapshot: string[],
): string {
  const canonical = JSON.stringify({
    action,
    targets: [...targetSnapshot].sort(),
  });
  return computeSha256Hex(canonical);
}

/**
 * Creates a new reauthentication intent.
 * Freezes the target snapshot and computes its immutable digest.
 */
export function createReauthIntent(params: {
  userId: string;
  originalSessionId: string;
  action: ReauthAction;
  method: ReauthMethod;
  targetReference?: string | null;
  existingSessions?: string[];
  challengeStateDigest?: string | null;
  challengeExpiresAt?: string | null;
}): ReauthIntent {
  const {
    userId,
    originalSessionId,
    action,
    method,
    targetReference,
    existingSessions = [],
    challengeStateDigest = null,
    challengeExpiresAt = null,
  } = params;

  if (!userId || typeof userId !== "string") {
    throw new AccountSecurityError("VALIDATION", "Invalid user identity", 400);
  }
  if (!originalSessionId || typeof originalSessionId !== "string") {
    throw new AccountSecurityError(
      "VALIDATION",
      "Invalid session identity",
      400,
    );
  }

  const validActions = new Set<ReauthAction>([
    "revoke_session",
    "revoke_other_sessions",
  ]);
  if (!validActions.has(action)) {
    throw new AccountSecurityError(
      "VALIDATION",
      `Unsupported action '${action}'`,
      400,
    );
  }

  const validMethods = new Set<ReauthMethod>(["password", "google", "github"]);
  if (!validMethods.has(method)) {
    throw new AccountSecurityError(
      "VALIDATION",
      `Unsupported confirmation method '${method}'`,
      400,
    );
  }

  let targetSnapshot: string[] = [];

  if (action === "revoke_session") {
    if (
      !targetReference ||
      typeof targetReference !== "string" ||
      targetReference.trim() === ""
    ) {
      throw new AccountSecurityError(
        "VALIDATION",
        "Individual session targetReference required",
        400,
      );
    }
    if (targetReference === originalSessionId) {
      throw new AccountSecurityError(
        "INVALID_TARGET",
        "Current session must be ended via ordinary sign-out, not reauthentication revocation",
        400,
      );
    }
    targetSnapshot = [targetReference];
  } else if (action === "revoke_other_sessions") {
    // Exclude current session
    const others = Array.from(
      new Set(existingSessions.filter((s) => s && s !== originalSessionId)),
    );
    if (others.length === 0) {
      throw new AccountSecurityError(
        "NO_TARGETS",
        "No other active sessions exist to revoke",
        400,
      );
    }
    targetSnapshot = others;
  }

  const now = new Date().toISOString();
  const targetDigest = computeTargetDigest(targetSnapshot);

  return {
    id: randomUUID(),
    userId,
    originalSessionId,
    action,
    targetSnapshot: Object.freeze([...targetSnapshot]) as unknown as string[],
    targetDigest,
    method,
    challengeStateDigest,
    challengeExpiresAt,
    verifiedAt: null,
    expiresAt: null,
    state: "pending",
    reservedOperationId: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Verifies an intent with fresh proof.
 * Sets verifiedAt and expiresAt = verifiedAt + 5 minutes (300,000 ms).
 */
export function verifyReauthIntent(
  intent: ReauthIntent,
  authContext: {
    callerUserId: string;
    callerSessionId: string;
    verifiedAtMs?: number;
  },
): ReauthIntent {
  if (intent.userId !== authContext.callerUserId) {
    throw new AccountSecurityError(
      "UNAUTHORIZED",
      "Account identity mismatch",
      401,
    );
  }
  if (intent.originalSessionId !== authContext.callerSessionId) {
    throw new AccountSecurityError(
      "UNAUTHORIZED",
      "Session identity mismatch",
      401,
    );
  }
  if (intent.state !== "pending") {
    throw new AccountSecurityError(
      "INVALID_STATE",
      `Cannot verify intent in state '${intent.state}'`,
      409,
    );
  }

  const verifiedMs = authContext.verifiedAtMs ?? Date.now();
  const expiresMs = verifiedMs + PROOF_LIFETIME_MS;

  const updated: ReauthIntent = {
    ...intent,
    verifiedAt: new Date(verifiedMs).toISOString(),
    expiresAt: new Date(expiresMs).toISOString(),
    state: "verified",
    updatedAt: new Date().toISOString(),
  };

  return updated;
}

/**
 * Checks if the verified proof remains fresh (< 300,000 ms from verifiedAt).
 */
export function isIntentProofFresh(
  intent: ReauthIntent,
  nowMs: number = Date.now(),
): boolean {
  if (intent.state !== "verified" && intent.state !== "reserved") {
    return false;
  }
  if (!intent.expiresAt) return false;
  const expiry = new Date(intent.expiresAt).getTime();
  return nowMs < expiry;
}

/**
 * Atomically reserves a verified intent for a specific revocation operation.
 * Concurrency protection: Reject if already claimed by a different operation.
 */
export function reserveIntentForOperation(
  intent: ReauthIntent,
  operationId: string,
  callerSession: { userId: string; sessionId: string },
  nowMs: number = Date.now(),
): ReauthIntent {
  if (intent.userId !== callerSession.userId) {
    throw new AccountSecurityError("UNAUTHORIZED", "Identity mismatch", 401);
  }
  if (intent.originalSessionId !== callerSession.sessionId) {
    throw new AccountSecurityError(
      "UNAUTHORIZED",
      "Original session mismatch",
      401,
    );
  }

  // Idempotent retry for the same operation
  if (intent.state === "reserved") {
    if (intent.reservedOperationId === operationId) {
      return intent;
    }
    throw new AccountSecurityError(
      "INTENT_LOCKED",
      "Confirmation intent is currently reserved by another operation",
      409,
    );
  }

  if (intent.state !== "verified") {
    throw new AccountSecurityError(
      "INVALID_STATE",
      `Cannot reserve intent in state '${intent.state}'`,
      409,
    );
  }

  // Check 5-minute proof freshness
  if (!isIntentProofFresh(intent, nowMs)) {
    throw new AccountSecurityError(
      "EXPIRED_PROOF",
      "Confirmation proof has expired",
      409,
    );
  }

  return {
    ...intent,
    state: "reserved",
    reservedOperationId: operationId,
    updatedAt: new Date(nowMs).toISOString(),
  };
}

/**
 * Consumes the proof upon successful revocation action execution.
 */
export function consumeIntent(
  intent: ReauthIntent,
  operationId: string,
): ReauthIntent {
  if (intent.reservedOperationId !== operationId) {
    throw new AccountSecurityError(
      "UNAUTHORIZED",
      "Operation does not hold reservation",
      403,
    );
  }
  if (intent.state !== "reserved") {
    throw new AccountSecurityError(
      "INVALID_STATE",
      `Cannot consume intent in state '${intent.state}'`,
      409,
    );
  }

  return {
    ...intent,
    state: "consumed",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Releases or locks an intent reservation based on operation outcome.
 *
 * CRITICAL SECURITY INVARIANT:
 * - If outcome is "definitive_no_effect" and proof is unexpired, release back to 'verified'.
 * - If outcome is "unknown" or "partial", DO NOT release back to 'verified'!
 *   Lock the reservation to prevent replay or concurrent duplicate execution.
 */
export function releaseIntentReservation(
  intent: ReauthIntent,
  operationId: string,
  options: {
    outcome: "definitive_no_effect" | "unknown" | "partial";
    nowMs?: number;
  },
): ReauthIntent {
  if (intent.reservedOperationId !== operationId) {
    throw new AccountSecurityError(
      "UNAUTHORIZED",
      "Operation does not hold reservation",
      403,
    );
  }

  const nowMs = options.nowMs ?? Date.now();

  if (options.outcome === "definitive_no_effect") {
    if (isIntentProofFresh(intent, nowMs)) {
      return {
        ...intent,
        state: "verified",
        reservedOperationId: null,
        updatedAt: new Date(nowMs).toISOString(),
      };
    }
    return {
      ...intent,
      state: "expired",
      reservedOperationId: null,
      updatedAt: new Date(nowMs).toISOString(),
    };
  }

  // For "unknown" or "partial" outcomes:
  // LOCK the intent. Retain reservedOperationId and set state to 'unavailable' (or keep reserved).
  return {
    ...intent,
    state: "unavailable",
    updatedAt: new Date(nowMs).toISOString(),
  };
}

/**
 * Creates a new revocation operation in 'prepared' state.
 */
export function createRevocationOperation(params: {
  operationId: string;
  intent: ReauthIntent;
  callerSession: { userId: string; sessionId: string };
}): RevocationOperation {
  const { operationId, intent, callerSession } = params;

  if (
    intent.userId !== callerSession.userId ||
    intent.originalSessionId !== callerSession.sessionId
  ) {
    throw new AccountSecurityError(
      "UNAUTHORIZED",
      "Identity or session mismatch",
      401,
    );
  }
  if (
    intent.state !== "reserved" ||
    intent.reservedOperationId !== operationId
  ) {
    throw new AccountSecurityError(
      "CONFLICT",
      "Operation does not hold active intent reservation",
      409,
    );
  }

  const payloadDigest = computePayloadDigest(
    intent.action,
    intent.targetSnapshot,
  );
  const now = new Date().toISOString();

  const targetResults: RevocationTargetResult[] = intent.targetSnapshot.map(
    (ref) => ({
      reference: ref,
      status: "pending",
    }),
  );

  return {
    operationId,
    userId: intent.userId,
    originalSessionId: intent.originalSessionId,
    intentId: intent.id,
    payloadDigest,
    state: "prepared",
    targetResults,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

function resolvePool(p?: unknown): any {
  if (p && typeof (p as any).query === "function") return p;
  if (p && typeof (p as any).db?.query === "function") return (p as any).db;
  try {
    const { db } = require("@/lib/db");
    if (db && typeof db.query === "function") return db;
    if (db && typeof db.db?.query === "function") return db.db;
  } catch {}
  return p;
}

/**
 * Persists a newly created reauth intent to solodesk.reauth_intents.
 */
export async function insertReauthIntent(
  intent: ReauthIntent,
  poolInput?: unknown,
): Promise<ReauthIntent> {
  const pool = resolvePool(poolInput);
  await pool.query(
    `INSERT INTO solodesk.reauth_intents (
       id, user_id, original_session_id, action, target_snapshot, target_digest,
       method, challenge_state_digest, challenge_expires_at, verified_at, expires_at,
       state, reserved_operation_id, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5::jsonb, $6,
       $7, $8, $9, $10, $11,
       $12, $13, $14, $15
     )`,
    [
      intent.id,
      intent.userId,
      intent.originalSessionId,
      intent.action,
      JSON.stringify(intent.targetSnapshot),
      intent.targetDigest,
      intent.method,
      intent.challengeStateDigest ?? null,
      intent.challengeExpiresAt ?? null,
      intent.verifiedAt ?? null,
      intent.expiresAt ?? null,
      intent.state,
      intent.reservedOperationId ?? null,
      intent.createdAt,
      intent.updatedAt,
    ],
  );
  return intent;
}

/**
 * Reads a reauth intent for the current session.
 * Rejects foreign or mismatched accounts with 404 without disclosing presence.
 */
export async function getReauthIntent(
  intentId: string,
  callerSession: { userId: string; sessionId: string },
  poolInput?: unknown,
): Promise<ReauthIntent> {
  const pool = resolvePool(poolInput);
  const { rows } = await pool.query(
    `SELECT id, user_id, original_session_id, action, target_snapshot, target_digest,
            method, challenge_state_digest, challenge_expires_at, verified_at, expires_at,
            state, reserved_operation_id, created_at, updated_at
     FROM solodesk.reauth_intents
     WHERE id = $1 AND user_id = $2 AND original_session_id = $3
     LIMIT 1`,
    [intentId, callerSession.userId, callerSession.sessionId],
  );

  if (!rows || rows.length === 0) {
    throw new AccountSecurityError(
      "NOT_FOUND",
      "Confirmation intent not found",
      404,
    );
  }

  const row = rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    originalSessionId: row.original_session_id,
    action: row.action,
    targetSnapshot: row.target_snapshot,
    targetDigest: row.target_digest,
    method: row.method,
    challengeStateDigest: row.challenge_state_digest,
    challengeExpiresAt: row.challenge_expires_at
      ? new Date(row.challenge_expires_at).toISOString()
      : null,
    verifiedAt: row.verified_at
      ? new Date(row.verified_at).toISOString()
      : null,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    state: row.state,
    reservedOperationId: row.reserved_operation_id,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

/**
 * Atomically reserves a verified intent for an operation in PostgreSQL.
 * Handles idempotent re-claims and locks out competing operations.
 */
export async function atomicReserveIntentInDb(
  intentId: string,
  operationId: string,
  callerSession: { userId: string; sessionId: string },
  poolInput?: unknown,
): Promise<ReauthIntent> {
  const pool = resolvePool(poolInput);

  // Attempt atomic reservation: Must be owned by caller and either fresh verified OR already reserved by this same operationId
  const { rows } = await pool.query(
    `UPDATE solodesk.reauth_intents
     SET state = 'reserved', reserved_operation_id = $1, updated_at = clock_timestamp()
     WHERE id = $2 AND user_id = $3 AND original_session_id = $4
       AND (
         (state = 'verified' AND expires_at > clock_timestamp()) OR
         (state = 'reserved' AND reserved_operation_id = $1)
       )
     RETURNING id, user_id, original_session_id, action, target_snapshot, target_digest,
               method, challenge_state_digest, challenge_expires_at, verified_at, expires_at,
               state, reserved_operation_id, created_at, updated_at`,
    [operationId, intentId, callerSession.userId, callerSession.sessionId],
  );

  if (rows && rows.length > 0) {
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      originalSessionId: row.original_session_id,
      action: row.action,
      targetSnapshot: row.target_snapshot,
      targetDigest: row.target_digest,
      method: row.method,
      challengeStateDigest: row.challenge_state_digest,
      challengeExpiresAt: row.challenge_expires_at
        ? new Date(row.challenge_expires_at).toISOString()
        : null,
      verifiedAt: row.verified_at
        ? new Date(row.verified_at).toISOString()
        : null,
      expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
      state: row.state,
      reservedOperationId: row.reserved_operation_id,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  // Not updated: Check why
  const checkRes = await pool.query(
    `SELECT state, reserved_operation_id, expires_at
     FROM solodesk.reauth_intents
     WHERE id = $1 AND user_id = $2 AND original_session_id = $3`,
    [intentId, callerSession.userId, callerSession.sessionId],
  );

  if (!checkRes.rows || checkRes.rows.length === 0) {
    throw new AccountSecurityError(
      "NOT_FOUND",
      "Confirmation intent not found",
      404,
    );
  }

  const existing = checkRes.rows[0];
  if (
    existing.state === "reserved" &&
    existing.reserved_operation_id !== operationId
  ) {
    throw new AccountSecurityError(
      "INTENT_LOCKED",
      "Intent is reserved by another operation",
      409,
    );
  }
  if (
    existing.expires_at &&
    new Date(existing.expires_at).getTime() <= Date.now()
  ) {
    throw new AccountSecurityError(
      "EXPIRED_PROOF",
      "Confirmation proof has expired",
      409,
    );
  }

  throw new AccountSecurityError(
    "INVALID_STATE",
    `Cannot reserve intent in state '${existing.state}'`,
    409,
  );
}

/**
 * Persists a prepared revocation operation in PostgreSQL.
 */
export async function insertRevocationOperation(
  operation: RevocationOperation,
  poolInput?: unknown,
): Promise<RevocationOperation> {
  const pool = resolvePool(poolInput);
  await pool.query(
    `INSERT INTO solodesk.revocation_operations (
       operation_id, user_id, original_session_id, intent_id, payload_digest,
       state, target_results, created_at, updated_at, completed_at
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7::jsonb, $8, $9, $10
     )`,
    [
      operation.operationId,
      operation.userId,
      operation.originalSessionId,
      operation.intentId,
      operation.payloadDigest,
      operation.state,
      JSON.stringify(operation.targetResults),
      operation.createdAt,
      operation.updatedAt,
      operation.completedAt ?? null,
    ],
  );
  return operation;
}

/**
 * Updates revocation operation status and per-target execution results.
 */
export async function updateRevocationOperation(
  operation: RevocationOperation,
  poolInput?: unknown,
): Promise<RevocationOperation> {
  const pool = resolvePool(poolInput);
  await pool.query(
    `UPDATE solodesk.revocation_operations
     SET state = $1, target_results = $2::jsonb, completed_at = $3, updated_at = clock_timestamp()
     WHERE operation_id = $4 AND user_id = $5 AND original_session_id = $6`,
    [
      operation.state,
      JSON.stringify(operation.targetResults),
      operation.completedAt ?? null,
      operation.operationId,
      operation.userId,
      operation.originalSessionId,
    ],
  );
  return operation;
}

/**
 * Consumes an intent upon successful action completion.
 */
export async function atomicConsumeIntentInDb(
  intentId: string,
  operationId: string,
  poolInput?: unknown,
): Promise<void> {
  const pool = resolvePool(poolInput);
  await pool.query(
    `UPDATE solodesk.reauth_intents
     SET state = 'consumed', updated_at = clock_timestamp()
     WHERE id = $1 AND reserved_operation_id = $2 AND state = 'reserved'`,
    [intentId, operationId],
  );
}

/**
 * Releases or locks an intent reservation based on outcome.
 */
export async function atomicReleaseIntentInDb(
  intentId: string,
  operationId: string,
  outcome: "definitive_no_effect" | "unknown" | "partial",
  poolInput?: unknown,
): Promise<void> {
  const pool = resolvePool(poolInput);
  if (outcome === "definitive_no_effect") {
    await pool.query(
      `UPDATE solodesk.reauth_intents
       SET state = CASE WHEN expires_at > clock_timestamp() THEN 'verified' ELSE 'expired' END,
           reserved_operation_id = NULL,
           updated_at = clock_timestamp()
       WHERE id = $1 AND reserved_operation_id = $2 AND state = 'reserved'`,
      [intentId, operationId],
    );
  } else {
    // Unknown or partial: LOCK the reservation
    await pool.query(
      `UPDATE solodesk.reauth_intents
       SET state = 'unavailable', updated_at = clock_timestamp()
       WHERE id = $1 AND reserved_operation_id = $2 AND state = 'reserved'`,
      [intentId, operationId],
    );
  }
}

export interface SecurityProviderAdapters {
  listSessions?: (session: {
    userId: string;
    sessionId: string;
  }) => Promise<any[]>;
  verifyPassword?: (
    session: { userId: string; sessionId: string },
    password: string,
  ) => Promise<boolean>;
  verifySessionActive?: (session: {
    userId: string;
    sessionId: string;
  }) => Promise<boolean>;
  revokeSession?: (targetReference: string) => Promise<TargetRevocationResult>;
}

/**
 * Server adapter verifying existing-method freshness for an intent.
 * Enforces:
 * - Social methods (Google/GitHub) remain unavailable without fake token/consent counting.
 * - Password verification preserves existing session cookie.
 * - Exactly 5-minute proof window.
 */
export async function verifyExistingMethodFreshness(
  intentId: string,
  credentials: { password?: string },
  callerSession: { userId: string; sessionId: string },
  adapters?: SecurityProviderAdapters,
  poolInput?: unknown,
): Promise<ReauthIntent> {
  const intent = await getReauthIntent(intentId, callerSession, poolInput);

  if (intent.state !== "pending") {
    throw new AccountSecurityError(
      "INVALID_STATE",
      `Cannot verify intent in state '${intent.state}'`,
      409,
    );
  }

  // Social methods are unsupported in managed provider without session overwrite (Gate G1)
  if (intent.method === "google" || intent.method === "github") {
    throw new AccountSecurityError(
      "METHOD_UNAVAILABLE",
      `Social confirmation method '${intent.method}' is currently unavailable under the managed provider`,
      503,
    );
  }

  if (intent.method === "password") {
    if (
      !credentials ||
      typeof credentials.password !== "string" ||
      credentials.password.trim() === ""
    ) {
      throw new AccountSecurityError(
        "VALIDATION",
        "Password required for confirmation",
        400,
      );
    }

    if (!adapters?.verifyPassword) {
      throw new AccountSecurityError(
        "METHOD_UNAVAILABLE",
        "Password confirmation provider is currently unavailable",
        503,
      );
    }

    const isValid = await adapters.verifyPassword(
      callerSession,
      credentials.password,
    );
    if (!isValid) {
      throw new AccountSecurityError("UNAUTHORIZED", "Invalid password", 401);
    }

    const pool = resolvePool(poolInput);
    const { rows } = await pool.query(
      `UPDATE solodesk.reauth_intents
       SET state = 'verified',
           verified_at = clock_timestamp(),
           expires_at = clock_timestamp() + interval '5 minutes',
           updated_at = clock_timestamp()
       WHERE id = $1 AND user_id = $2 AND original_session_id = $3 AND state = 'pending'
       RETURNING id, user_id, original_session_id, action, target_snapshot, target_digest,
                 method, challenge_state_digest, challenge_expires_at, verified_at, expires_at,
                 state, reserved_operation_id, created_at, updated_at`,
      [intentId, callerSession.userId, callerSession.sessionId],
    );

    if (!rows || rows.length === 0) {
      throw new AccountSecurityError(
        "CONFLICT",
        "Intent was modified or cancelled",
        409,
      );
    }

    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      originalSessionId: row.original_session_id,
      action: row.action,
      targetSnapshot: row.target_snapshot,
      targetDigest: row.target_digest,
      method: row.method,
      challengeStateDigest: row.challenge_state_digest,
      challengeExpiresAt: row.challenge_expires_at
        ? new Date(row.challenge_expires_at).toISOString()
        : null,
      verifiedAt: row.verified_at
        ? new Date(row.verified_at).toISOString()
        : null,
      expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
      state: row.state,
      reservedOperationId: row.reserved_operation_id,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  throw new AccountSecurityError(
    "VALIDATION",
    `Unsupported confirmation method '${intent.method}'`,
    400,
  );
}

/**
 * Dispatches exact-target session revocation with full reconciliation.
 *
 * Invariants enforced:
 * - Commit local reservation before provider I/O.
 * - Recheck original caller authority and proof expiry before each target.
 * - No undispatched target started after proof expiry.
 * - Unknown/partial states lock the reservation; never release proof on timeout.
 * - One successful action consumes proof.
 */
export async function dispatchExactTargetRevocation(
  operationId: string,
  intentId: string,
  callerSession: { userId: string; sessionId: string },
  adapters?: SecurityProviderAdapters,
  poolInput?: unknown,
): Promise<{
  operationId: string;
  state: OperationState;
  results: RevocationTargetResult[];
}> {
  const pool = resolvePool(poolInput);

  // 1. Atomically reserve proof in DB
  const intent = await atomicReserveIntentInDb(
    intentId,
    operationId,
    callerSession,
    pool,
  );

  // 2. Load or create operation record
  let op: RevocationOperation;
  const existingOpRes = await pool.query(
    `SELECT operation_id, user_id, original_session_id, intent_id, payload_digest,
            state, target_results, created_at, updated_at, completed_at
     FROM solodesk.revocation_operations
     WHERE operation_id = $1 AND user_id = $2 AND original_session_id = $3`,
    [operationId, callerSession.userId, callerSession.sessionId],
  );

  if (existingOpRes.rows && existingOpRes.rows.length > 0) {
    const row = existingOpRes.rows[0];
    op = {
      operationId: row.operation_id,
      userId: row.user_id,
      originalSessionId: row.original_session_id,
      intentId: row.intent_id,
      payloadDigest: row.payload_digest,
      state: row.state,
      targetResults: row.target_results,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      completedAt: row.completed_at
        ? new Date(row.completed_at).toISOString()
        : null,
    };

    // If operation is already in a terminal state, return existing receipt
    if (["accepted", "rejected", "partial", "unknown"].includes(op.state)) {
      return {
        operationId: op.operationId,
        state: op.state,
        results: op.targetResults,
      };
    }
  } else {
    op = createRevocationOperation({
      operationId,
      intent,
      callerSession,
    });
    await insertRevocationOperation(op, pool);
  }

  // 3. Set state to executing
  op.state = "executing";
  await updateRevocationOperation(op, pool);

  if (!adapters?.revokeSession) {
    // Provider unavailable: lock as unknown
    op.state = "unknown";
    op.completedAt = new Date().toISOString();
    await updateRevocationOperation(op, pool);
    await atomicReleaseIntentInDb(intent.id, operationId, "unknown", pool);
    return {
      operationId: op.operationId,
      state: op.state,
      results: op.targetResults,
    };
  }

  // 4. Dispatch each target with pre-checks
  let hasUnknown = false;
  let hasFailed = false;
  let hasSuccess = false;

  for (const targetResult of op.targetResults) {
    if (
      targetResult.status === "revoked" ||
      targetResult.status === "alreadyAbsent"
    ) {
      hasSuccess = true;
      continue;
    }

    // Recheck proof expiry immediately before new target dispatch
    if (
      intent.expiresAt &&
      new Date(intent.expiresAt).getTime() <= Date.now()
    ) {
      targetResult.status = "failed";
      targetResult.error = "Confirmation proof expired before target dispatch";
      hasFailed = true;
      continue;
    }

    // Recheck original session authority
    if (adapters?.verifySessionActive) {
      const isActive = await adapters.verifySessionActive(callerSession);
      if (!isActive) {
        targetResult.status = "failed";
        targetResult.error = "Caller session was revoked or expired";
        hasFailed = true;
        break;
      }
    }

    try {
      const res = await adapters.revokeSession(targetResult.reference);
      targetResult.status = res;
      if (res === "revoked" || res === "alreadyAbsent") {
        hasSuccess = true;
      } else if (res === "unknown") {
        hasUnknown = true;
      } else {
        hasFailed = true;
      }
    } catch {
      targetResult.status = "unknown";
      hasUnknown = true;
    }
  }

  // 5. Determine terminal state and commit intent outcome
  op.completedAt = new Date().toISOString();

  if (hasUnknown) {
    op.state = "unknown";
    await updateRevocationOperation(op, pool);
    await atomicReleaseIntentInDb(intent.id, operationId, "unknown", pool);
  } else if (hasSuccess && !hasFailed) {
    op.state = "accepted";
    await updateRevocationOperation(op, pool);
    await atomicConsumeIntentInDb(intent.id, operationId, pool);
  } else if (hasSuccess && hasFailed) {
    op.state = "partial";
    await updateRevocationOperation(op, pool);
    await atomicReleaseIntentInDb(intent.id, operationId, "partial", pool);
  } else {
    // Definitive failure with zero successful effects
    op.state = "rejected";
    await updateRevocationOperation(op, pool);
    await atomicReleaseIntentInDb(
      intent.id,
      operationId,
      "definitive_no_effect",
      pool,
    );
  }

  return {
    operationId: op.operationId,
    state: op.state,
    results: op.targetResults,
  };
}

export interface SessionDto {
  reference: string;
  current: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  deviceLabel: string;
}

export interface SessionListingResult {
  items: SessionDto[];
  nextCursor: string | null;
  complete: boolean;
}

/**
 * Sanitizes untrusted user-agent strings into safe, bounded display text.
 */
export function sanitizeDeviceLabel(rawUa?: string | null): string {
  if (!rawUa || typeof rawUa !== "string" || rawUa.trim().length === 0) {
    return "Unknown device";
  }
  const ua = rawUa.trim();
  if (/iPhone|iPad/i.test(ua)) return "Mobile Safari on iOS";
  if (/Android/i.test(ua)) return "Chrome on Android";
  if (/Macintosh|Mac OS X/i.test(ua)) {
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return "Chrome on macOS";
    if (/Firefox/i.test(ua)) return "Firefox on macOS";
    return "Safari on macOS";
  }
  if (/Windows/i.test(ua)) {
    if (/Edg/i.test(ua)) return "Edge on Windows";
    if (/Firefox/i.test(ua)) return "Firefox on Windows";
    return "Chrome on Windows";
  }
  if (/Linux/i.test(ua)) return "Browser on Linux";
  return ua.slice(0, 60);
}

/**
 * Projects a raw provider session object into the contract SessionDto.
 * Excludes raw tokens, IPs, and internal provider identifiers.
 */
export function projectSessionDto(
  raw: any,
  currentSessionId: string,
): SessionDto {
  const reference = String(raw.id || raw.reference || "");
  const createdAt = raw.createdAt
    ? new Date(raw.createdAt).toISOString()
    : new Date().toISOString();
  const lastActiveAt = raw.updatedAt
    ? new Date(raw.updatedAt).toISOString()
    : raw.lastActiveAt
      ? new Date(raw.lastActiveAt).toISOString()
      : createdAt;
  const expiresAt = raw.expiresAt
    ? new Date(raw.expiresAt).toISOString()
    : new Date().toISOString();

  return {
    reference,
    current: reference === currentSessionId,
    createdAt,
    lastActiveAt,
    expiresAt,
    deviceLabel: sanitizeDeviceLabel(raw.userAgent),
  };
}

/**
 * Parses and validates query pagination limits and cursors.
 * Defaults to 20; enforces upper bound of 100.
 */
export function parseSessionPagination(query: {
  limit?: unknown;
  cursor?: unknown;
}): { limit: number; cursor: string | null } {
  let limit = 20;
  if (query.limit !== undefined && query.limit !== null && query.limit !== "") {
    const rawLimit = String(query.limit).trim();
    if (!/^\d+$/.test(rawLimit)) {
      throw new AccountSecurityError(
        "VALIDATION",
        "Limit must be a positive integer",
        400,
      );
    }
    const parsed = parseInt(rawLimit, 10);
    if (parsed < 1 || parsed > 100) {
      throw new AccountSecurityError(
        "VALIDATION",
        "Limit must be between 1 and 100",
        400,
      );
    }
    limit = parsed;
  }

  let cursor: string | null = null;
  if (
    query.cursor !== undefined &&
    query.cursor !== null &&
    typeof query.cursor === "string" &&
    query.cursor.trim().length > 0
  ) {
    cursor = query.cursor.trim();
  }

  return { limit, cursor };
}

/**
 * Encodes an opaque pagination cursor bound to the account ID.
 */
export function encodeSessionCursor(userId: string, offset: number): string {
  const payload = JSON.stringify({ u: userId, o: offset, t: Date.now() });
  return Buffer.from(payload).toString("base64url");
}

/**
 * Decodes and verifies a pagination cursor against the current account.
 */
export function decodeSessionCursor(
  cursor: string,
  expectedUserId: string,
): { offset: number } {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.u !== expectedUserId ||
      typeof parsed.o !== "number" ||
      parsed.o < 0
    ) {
      throw new Error();
    }
    return { offset: parsed.o };
  } catch {
    throw new AccountSecurityError(
      "VALIDATION",
      "Invalid or foreign pagination cursor",
      400,
    );
  }
}

/**
 * Lists own sessions for the caller, projecting safe DTOs and applying pagination.
 * Fails closed with 503 if provider listing fails or is unavailable under G1.
 */
export async function listOwnSessions(
  callerSession: { userId: string; sessionId: string },
  paginationQuery: { limit?: unknown; cursor?: unknown },
  adapters?: SecurityProviderAdapters,
): Promise<SessionListingResult> {
  if (!adapters?.listSessions) {
    throw new AccountSecurityError(
      "UNAVAILABLE",
      "Session listing service is currently unavailable",
      503,
    );
  }

  let rawSessions: any[];
  try {
    rawSessions = await adapters.listSessions(callerSession);
    if (!Array.isArray(rawSessions)) {
      throw new Error("Invalid provider response");
    }
  } catch {
    throw new AccountSecurityError(
      "UNAVAILABLE",
      "Session listing service is currently unavailable",
      503,
    );
  }

  const { limit, cursor } = parseSessionPagination(paginationQuery);
  const offset = cursor
    ? decodeSessionCursor(cursor, callerSession.userId).offset
    : 0;

  const page = rawSessions.slice(offset, offset + limit);
  const hasMore = offset + limit < rawSessions.length;
  const nextCursor = hasMore
    ? encodeSessionCursor(callerSession.userId, offset + limit)
    : null;

  const items = page.map((s) => projectSessionDto(s, callerSession.sessionId));

  return {
    items,
    nextCursor,
    complete: !hasMore,
  };
}
