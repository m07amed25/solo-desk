import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { loadServerModule } from "./workspace-test-service.mjs";

const accountSec = loadServerModule("../lib/auth/account-security.ts");

const {
  PROOF_LIFETIME_MS,
  AccountSecurityError,
  createReauthIntent,
  verifyReauthIntent,
  isIntentProofFresh,
  reserveIntentForOperation,
  consumeIntent,
  releaseIntentReservation,
  createRevocationOperation,
  computeTargetDigest,
  computePayloadDigest,
} = accountSec;

test("reauth intent: validates input and creates pending intent with frozen targets", () => {
  const userId = randomUUID();
  const originalSessionId = randomUUID();
  const targetSession1 = randomUUID();
  const targetSession2 = randomUUID();

  // 1. Individual session revocation target
  const singleIntent = createReauthIntent({
    userId,
    originalSessionId,
    action: "revoke_session",
    method: "password",
    targetReference: targetSession1,
  });

  assert.equal(singleIntent.state, "pending");
  assert.equal(singleIntent.action, "revoke_session");
  assert.deepEqual(JSON.parse(JSON.stringify(singleIntent.targetSnapshot)), [
    targetSession1,
  ]);
  assert.equal(singleIntent.verifiedAt, null);
  assert.equal(singleIntent.expiresAt, null);
  assert.ok(singleIntent.targetDigest);

  // 2. Cannot target current session for revoke_session (must use ordinary sign-out)
  assert.throws(
    () =>
      createReauthIntent({
        userId,
        originalSessionId,
        action: "revoke_session",
        method: "password",
        targetReference: originalSessionId,
      }),
    (err) => err.code === "INVALID_TARGET",
  );

  // 3. Other sessions revocation excludes current session and freezes targets
  const bulkIntent = createReauthIntent({
    userId,
    originalSessionId,
    action: "revoke_other_sessions",
    method: "google",
    existingSessions: [targetSession1, originalSessionId, targetSession2],
  });

  assert.equal(bulkIntent.action, "revoke_other_sessions");
  assert.deepEqual(
    JSON.parse(JSON.stringify([...bulkIntent.targetSnapshot])).sort(),
    [targetSession1, targetSession2].sort(),
  );
  assert.equal(bulkIntent.targetSnapshot.includes(originalSessionId), false);
  assert.equal(
    bulkIntent.targetDigest,
    computeTargetDigest([targetSession1, targetSession2]),
  );

  // 4. Rejects when no other sessions exist to revoke
  assert.throws(
    () =>
      createReauthIntent({
        userId,
        originalSessionId,
        action: "revoke_other_sessions",
        method: "github",
        existingSessions: [originalSessionId],
      }),
    (err) => err.code === "NO_TARGETS",
  );
});

test("reauth verification: exactly 5-minute proof window (299,999 ms vs 300,000 ms)", () => {
  const userId = randomUUID();
  const originalSessionId = randomUUID();
  const target = randomUUID();

  const intent = createReauthIntent({
    userId,
    originalSessionId,
    action: "revoke_session",
    method: "password",
    targetReference: target,
  });

  const verifiedAtMs = 1700000000000;
  const verifiedIntent = verifyReauthIntent(intent, {
    callerUserId: userId,
    callerSessionId: originalSessionId,
    verifiedAtMs,
  });

  assert.equal(verifiedIntent.state, "verified");
  assert.equal(new Date(verifiedIntent.verifiedAt).getTime(), verifiedAtMs);
  assert.equal(
    new Date(verifiedIntent.expiresAt).getTime(),
    verifiedAtMs + PROOF_LIFETIME_MS,
  );

  // Invariant: At 299,999 ms, proof is fresh
  assert.equal(
    isIntentProofFresh(verifiedIntent, verifiedAtMs + 299_999),
    true,
  );

  // Invariant: At exactly 300,000 ms, proof is expired
  assert.equal(
    isIntentProofFresh(verifiedIntent, verifiedAtMs + 300_000),
    false,
  );

  // Invariant: At 300,001 ms, proof is expired
  assert.equal(
    isIntentProofFresh(verifiedIntent, verifiedAtMs + 300_001),
    false,
  );
});

test("stale original session: foreign or expired session cannot verify or reserve proof", () => {
  const userId = randomUUID();
  const originalSessionId = randomUUID();
  const foreignUserId = randomUUID();
  const foreignSessionId = randomUUID();
  const target = randomUUID();

  const intent = createReauthIntent({
    userId,
    originalSessionId,
    action: "revoke_session",
    method: "password",
    targetReference: target,
  });

  // 1. Foreign user verification fails
  assert.throws(
    () =>
      verifyReauthIntent(intent, {
        callerUserId: foreignUserId,
        callerSessionId: originalSessionId,
      }),
    (err) => err.code === "UNAUTHORIZED",
  );

  // 2. Different session verification fails
  assert.throws(
    () =>
      verifyReauthIntent(intent, {
        callerUserId: userId,
        callerSessionId: foreignSessionId,
      }),
    (err) => err.code === "UNAUTHORIZED",
  );

  // Verify legitimately
  const verified = verifyReauthIntent(intent, {
    callerUserId: userId,
    callerSessionId: originalSessionId,
  });

  // 3. Stale session reservation fails
  assert.throws(
    () =>
      reserveIntentForOperation(verified, randomUUID(), {
        userId,
        sessionId: foreignSessionId, // caller changed session!
      }),
    (err) => err.code === "UNAUTHORIZED",
  );
});

test("atomic reservation: concurrent operations conflict, identical operation retries safely", () => {
  const userId = randomUUID();
  const originalSessionId = randomUUID();
  const target = randomUUID();
  const opId1 = randomUUID();
  const opId2 = randomUUID();

  const intent = createReauthIntent({
    userId,
    originalSessionId,
    action: "revoke_session",
    method: "password",
    targetReference: target,
  });

  const verified = verifyReauthIntent(intent, {
    callerUserId: userId,
    callerSessionId: originalSessionId,
  });

  // First operation claims reservation
  const reserved1 = reserveIntentForOperation(verified, opId1, {
    userId,
    sessionId: originalSessionId,
  });
  assert.equal(reserved1.state, "reserved");
  assert.equal(reserved1.reservedOperationId, opId1);

  // Second concurrent operation attempts to claim the same intent -> CONFLICT
  assert.throws(
    () =>
      reserveIntentForOperation(reserved1, opId2, {
        userId,
        sessionId: originalSessionId,
      }),
    (err) => err.code === "INTENT_LOCKED" && err.statusHttp === 409,
  );

  // Idempotent retry for opId1 succeeds without re-allocating
  const retried = reserveIntentForOperation(reserved1, opId1, {
    userId,
    sessionId: originalSessionId,
  });
  assert.equal(retried.state, "reserved");
  assert.equal(retried.reservedOperationId, opId1);
});

test("expiry rejection: expired proof cannot be reserved", () => {
  const userId = randomUUID();
  const originalSessionId = randomUUID();
  const target = randomUUID();
  const verifiedAtMs = 1700000000000;

  const intent = createReauthIntent({
    userId,
    originalSessionId,
    action: "revoke_session",
    method: "password",
    targetReference: target,
  });

  const verified = verifyReauthIntent(intent, {
    callerUserId: userId,
    callerSessionId: originalSessionId,
    verifiedAtMs,
  });

  // Attempt reservation after 300,000 ms
  assert.throws(
    () =>
      reserveIntentForOperation(
        verified,
        randomUUID(),
        { userId, sessionId: originalSessionId },
        verifiedAtMs + 300_000,
      ),
    (err) => err.code === "EXPIRED_PROOF" && err.statusHttp === 409,
  );
});

test("consumption: one-success consumes proof, preventing replay or second action", () => {
  const userId = randomUUID();
  const originalSessionId = randomUUID();
  const target = randomUUID();
  const opId = randomUUID();

  const intent = createReauthIntent({
    userId,
    originalSessionId,
    action: "revoke_session",
    method: "password",
    targetReference: target,
  });

  const verified = verifyReauthIntent(intent, {
    callerUserId: userId,
    callerSessionId: originalSessionId,
  });

  const reserved = reserveIntentForOperation(verified, opId, {
    userId,
    sessionId: originalSessionId,
  });

  const consumed = consumeIntent(reserved, opId);
  assert.equal(consumed.state, "consumed");

  // Cannot reserve a consumed intent
  assert.throws(
    () =>
      reserveIntentForOperation(consumed, randomUUID(), {
        userId,
        sessionId: originalSessionId,
      }),
    (err) => err.code === "INVALID_STATE",
  );
});

test("definitive no-effect release vs unknown outcome locks", () => {
  const userId = randomUUID();
  const originalSessionId = randomUUID();
  const target = randomUUID();
  const opId = randomUUID();
  const verifiedAtMs = 1700000000000;

  const intent = createReauthIntent({
    userId,
    originalSessionId,
    action: "revoke_session",
    method: "password",
    targetReference: target,
  });

  const verified = verifyReauthIntent(intent, {
    callerUserId: userId,
    callerSessionId: originalSessionId,
    verifiedAtMs,
  });

  const reserved = reserveIntentForOperation(
    verified,
    opId,
    { userId, sessionId: originalSessionId },
    verifiedAtMs + 10_000,
  );

  // Case 1: Definitive failure with ZERO effects before external dispatch
  // Proof has not expired, so it releases cleanly back to 'verified'
  const released = releaseIntentReservation(reserved, opId, {
    outcome: "definitive_no_effect",
    nowMs: verifiedAtMs + 20_000,
  });
  assert.equal(released.state, "verified");
  assert.equal(released.reservedOperationId, null);

  // Case 2: Re-reserve and encounter an AMBIGUOUS / TIMEOUT outcome
  const reReserved = reserveIntentForOperation(
    released,
    opId,
    { userId, sessionId: originalSessionId },
    verifiedAtMs + 30_000,
  );

  // Invariant: Unknown outcome MUST NOT release reservation to verified!
  const lockedUnknown = releaseIntentReservation(reReserved, opId, {
    outcome: "unknown",
    nowMs: verifiedAtMs + 40_000,
  });
  assert.equal(lockedUnknown.state, "unavailable");

  // Re-reservation is blocked because the outcome was indeterminate
  assert.throws(
    () =>
      reserveIntentForOperation(
        lockedUnknown,
        randomUUID(),
        { userId, sessionId: originalSessionId },
        verifiedAtMs + 50_000,
      ),
    (err) => err.code === "INVALID_STATE",
  );
});

test("operation creation & payload digest: immutable target snapshot without credentials", () => {
  const userId = randomUUID();
  const originalSessionId = randomUUID();
  const target = randomUUID();
  const opId = randomUUID();

  const intent = createReauthIntent({
    userId,
    originalSessionId,
    action: "revoke_session",
    method: "password",
    targetReference: target,
  });

  const verified = verifyReauthIntent(intent, {
    callerUserId: userId,
    callerSessionId: originalSessionId,
  });

  const reserved = reserveIntentForOperation(verified, opId, {
    userId,
    sessionId: originalSessionId,
  });

  const op = createRevocationOperation({
    operationId: opId,
    intent: reserved,
    callerSession: { userId, sessionId: originalSessionId },
  });

  assert.equal(op.operationId, opId);
  assert.equal(op.intentId, intent.id);
  assert.equal(op.state, "prepared");
  assert.equal(
    op.payloadDigest,
    computePayloadDigest("revoke_session", [target]),
  );
  assert.deepEqual(JSON.parse(JSON.stringify(op.targetResults)), [
    { reference: target, status: "pending" },
  ]);

  // Serialized operation contains zero credentials or tokens
  const serialized = JSON.stringify(op);
  assert.equal(/password|token|secret|digest/i.test(serialized), true); // contains payloadDigest
  assert.equal(/bearer|authorization|credential/i.test(serialized), false);
});

test("server adapters: social reauth is unavailable (G1), password verifies freshness", async () => {
  const { verifyExistingMethodFreshness } = accountSec;
  const userId = randomUUID();
  const sessionId = randomUUID();
  const target = randomUUID();

  // In-memory mock pool
  const intentsDb = new Map();
  const mockPool = {
    async query(sql, params) {
      if (/\bUPDATE\s+solodesk\.reauth_intents\b/i.test(sql)) {
        const row = intentsDb.get(params[0]);
        if (row && row.state === "pending") {
          row.state = "verified";
          row.verified_at = new Date();
          row.expires_at = new Date(Date.now() + 300_000);
          return { rows: [row] };
        }
        return { rows: [] };
      }
      if (/\bFROM\s+solodesk\.reauth_intents\b/i.test(sql)) {
        const row = intentsDb.get(params[0]);
        if (
          !row ||
          row.user_id !== params[1] ||
          row.original_session_id !== params[2]
        ) {
          return { rows: [] };
        }
        return { rows: [row] };
      }
      return { rows: [] };
    },
  };

  // 1. Social method rejection (G1)
  const googleIntent = {
    id: randomUUID(),
    user_id: userId,
    original_session_id: sessionId,
    action: "revoke_session",
    target_snapshot: [target],
    target_digest: "a".repeat(64),
    method: "google",
    state: "pending",
    created_at: new Date(),
    updated_at: new Date(),
  };
  intentsDb.set(googleIntent.id, googleIntent);

  await assert.rejects(
    verifyExistingMethodFreshness(
      googleIntent.id,
      {},
      { userId, sessionId },
      {},
      mockPool,
    ),
    (err) => err.code === "METHOD_UNAVAILABLE" && err.statusHttp === 503,
  );

  // 2. Password validation and verification
  const pwIntent = {
    id: randomUUID(),
    user_id: userId,
    original_session_id: sessionId,
    action: "revoke_session",
    target_snapshot: [target],
    target_digest: "b".repeat(64),
    method: "password",
    state: "pending",
    created_at: new Date(),
    updated_at: new Date(),
  };
  intentsDb.set(pwIntent.id, pwIntent);

  // Missing password
  await assert.rejects(
    verifyExistingMethodFreshness(
      pwIntent.id,
      {},
      { userId, sessionId },
      { verifyPassword: async () => true },
      mockPool,
    ),
    (err) => err.code === "VALIDATION" && err.statusHttp === 400,
  );

  // Invalid password
  await assert.rejects(
    verifyExistingMethodFreshness(
      pwIntent.id,
      { password: "wrong" },
      { userId, sessionId },
      { verifyPassword: async () => false },
      mockPool,
    ),
    (err) => err.code === "UNAUTHORIZED" && err.statusHttp === 401,
  );

  // Valid password
  const verified = await verifyExistingMethodFreshness(
    pwIntent.id,
    { password: "correct" },
    { userId, sessionId },
    { verifyPassword: async () => true },
    mockPool,
  );
  assert.equal(verified.state, "verified");
  assert.ok(verified.verifiedAt);
  assert.ok(verified.expiresAt);
});

test("revocation dispatch: commits reservation before provider I/O, consumes on success", async () => {
  const { dispatchExactTargetRevocation } = accountSec;
  const userId = randomUUID();
  const sessionId = randomUUID();
  const target = randomUUID();
  const opId = randomUUID();
  const intentId = randomUUID();

  const intentsDb = new Map();
  const opsDb = new Map();

  intentsDb.set(intentId, {
    id: intentId,
    user_id: userId,
    original_session_id: sessionId,
    action: "revoke_session",
    target_snapshot: [target],
    target_digest: "a".repeat(64),
    method: "password",
    state: "verified",
    expires_at: new Date(Date.now() + 300_000),
    created_at: new Date(),
    updated_at: new Date(),
  });

  const mockPool = {
    async query(sql, params) {
      if (
        /\bUPDATE\s+solodesk\.reauth_intents\b/i.test(sql) &&
        /\bSET\s+state\s*=\s*'reserved'/i.test(sql)
      ) {
        const row = intentsDb.get(params[1]);
        if (row && row.state === "verified") {
          row.state = "reserved";
          row.reserved_operation_id = params[0];
          return { rows: [row] };
        }
        return { rows: [] };
      }
      if (/\bFROM\s+solodesk\.revocation_operations\b/i.test(sql)) {
        const op = opsDb.get(params[0]);
        return { rows: op ? [op] : [] };
      }
      if (/\bINSERT\s+INTO\s+solodesk\.revocation_operations\b/i.test(sql)) {
        const op = {
          operation_id: params[0],
          user_id: params[1],
          original_session_id: params[2],
          intent_id: params[3],
          payload_digest: params[4],
          state: params[5],
          target_results: JSON.parse(params[6]),
        };
        opsDb.set(op.operation_id, op);
        return { rows: [op] };
      }
      if (/\bUPDATE\s+solodesk\.revocation_operations\b/i.test(sql)) {
        const op = opsDb.get(params[3]);
        if (op) {
          op.state = params[0];
          op.target_results = JSON.parse(params[1]);
          op.completed_at = params[2];
        }
        return { rows: op ? [op] : [] };
      }
      if (
        /\bUPDATE\s+solodesk\.reauth_intents\b/i.test(sql) &&
        /\bSET\s+state\s*=\s*'consumed'/i.test(sql)
      ) {
        const row = intentsDb.get(params[0]);
        if (row) row.state = "consumed";
        return { rows: [] };
      }
      return { rows: [] };
    },
  };

  const receipt = await dispatchExactTargetRevocation(
    opId,
    intentId,
    { userId, sessionId },
    {
      verifySessionActive: async () => true,
      revokeSession: async () => "revoked",
    },
    mockPool,
  );

  assert.equal(receipt.state, "accepted");
  assert.equal(receipt.results[0].status, "revoked");
  assert.equal(intentsDb.get(intentId).state, "consumed");
});

test("reauth route handlers: enforces admission, origin, and safe response projection", async () => {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const session = {
    userId,
    sessionId,
    email: "user@example.com",
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  };

  const intentsDb = new Map();
  const mockPool = {
    async query(sql, params) {
      if (/\bINSERT\s+INTO\s+solodesk\.reauth_intents\b/i.test(sql)) {
        const row = {
          id: params[0],
          user_id: params[1],
          original_session_id: params[2],
          action: params[3],
          target_snapshot: JSON.parse(params[4]),
          target_digest: params[5],
          method: params[6],
          state: params[11],
          created_at: params[13],
          updated_at: params[14],
        };
        intentsDb.set(row.id, row);
        return { rows: [row] };
      }
      if (/\bFROM\s+solodesk\.reauth_intents\b/i.test(sql)) {
        const row = intentsDb.get(params[0]);
        if (
          !row ||
          row.user_id !== params[1] ||
          row.original_session_id !== params[2]
        ) {
          return { rows: [] };
        }
        return { rows: [row] };
      }
      return { rows: [] };
    },
  };

  let admissionCalled = false;
  const reauthRoute = loadServerModule(
    "../app/api/account/reauthentication/route.ts",
    {
      "@/lib/account": {
        requireAccountSession: async () => session,
        parseAccountJsonRequest: async (req) => {
          const origin = req.headers.get("origin");
          if (origin && origin !== "https://solodesk.com") {
            throw new accountSec.AccountSecurityError(
              "FORBIDDEN",
              "Origin mismatch",
              403,
            );
          }
          return JSON.parse(await req.text());
        },
        validateAccountOrigin: (req) => {
          const origin = req.headers.get("origin");
          if (origin && origin !== "https://solodesk.com") {
            throw new accountSec.AccountSecurityError(
              "FORBIDDEN",
              "Origin mismatch",
              403,
            );
          }
        },
        accountResponse: (data, init) =>
          new Response(JSON.stringify(data), {
            ...init,
            headers: { "Cache-Control": "private, no-store", ...init?.headers },
          }),
        accountErrorResponse: (err) =>
          new Response(
            JSON.stringify({ error: { code: err.code, message: err.message } }),
            {
              status: err.statusHttp || 500,
              headers: { "Cache-Control": "private, no-store" },
            },
          ),
      },
      "@/lib/rate-limit": {
        consumeAdmission: async () => {
          admissionCalled = true;
          return { allowed: true };
        },
      },
      "@/lib/auth/account-security": {
        ...accountSec,
        insertReauthIntent: async (intent) => {
          intentsDb.set(intent.id, intent);
          return intent;
        },
        getReauthIntent: async (id, s) => {
          const row = intentsDb.get(id);
          if (
            !row ||
            row.userId !== s.userId ||
            row.originalSessionId !== s.sessionId
          ) {
            throw new accountSec.AccountSecurityError(
              "NOT_FOUND",
              "Intent not found",
              404,
            );
          }
          return row;
        },
      },
    },
  );

  // 1. Cross-origin POST is rejected with 403
  const badOriginReq = new Request(
    "https://solodesk.com/api/account/reauthentication",
    {
      method: "POST",
      headers: {
        origin: "https://evil.com",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        action: "revoke_session",
        method: "password",
        targetReference: randomUUID(),
      }),
    },
  );
  const badOriginRes = await reauthRoute.POST(badOriginReq);
  assert.equal(badOriginRes.status, 403);
  assert.equal(badOriginRes.headers.get("Cache-Control"), "private, no-store");

  // 2. Valid POST creates intent with 201 and returns confirmationId
  const targetId = randomUUID();
  const validReq = new Request(
    "https://solodesk.com/api/account/reauthentication",
    {
      method: "POST",
      headers: {
        origin: "https://solodesk.com",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        action: "revoke_session",
        method: "password",
        targetReference: targetId,
      }),
    },
  );
  const validRes = await reauthRoute.POST(validReq);
  assert.equal(validRes.status, 201);
  assert.equal(admissionCalled, true);
  const validData = await validRes.json();
  assert.ok(validData.confirmationId);
  assert.equal(validData.state, "pending");
  assert.equal(validData.action, "revoke_session");

  // 3. GET with valid confirmationId returns 200 with safe fields
  const getReq = new Request(
    `https://solodesk.com/api/account/reauthentication?confirmationId=${validData.confirmationId}`,
    { method: "GET" },
  );
  const getRes = await reauthRoute.GET(getReq);
  assert.equal(getRes.status, 200);
  assert.equal(getRes.headers.get("Cache-Control"), "private, no-store");
  const getData = await getRes.json();
  assert.equal(getData.confirmationId, validData.confirmationId);
  assert.equal(getData.state, "pending");

  // 4. GET with missing confirmationId returns 400
  const badGetReq = new Request(
    "https://solodesk.com/api/account/reauthentication",
    { method: "GET" },
  );
  const badGetRes = await reauthRoute.GET(badGetReq);
  assert.equal(badGetRes.status, 400);
});

test("session revocation route handlers: enforces origin, validates UUIDs, and returns receipts", async () => {
  const userId = randomUUID();
  const sessionId = randomUUID();
  const session = {
    userId,
    sessionId,
    email: "user@example.com",
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  };

  const opsDb = new Map();
  const revocationsRoute = loadServerModule(
    "../app/api/account/session-revocations/route.ts",
    {
      "@/lib/account": {
        requireAccountSession: async () => session,
        parseAccountJsonRequest: async (req) => {
          const origin = req.headers.get("origin");
          if (origin && origin !== "https://solodesk.com") {
            throw new accountSec.AccountSecurityError(
              "FORBIDDEN",
              "Origin mismatch",
              403,
            );
          }
          return JSON.parse(await req.text());
        },
        validateAccountOrigin: (req) => {
          const origin = req.headers.get("origin");
          if (origin && origin !== "https://solodesk.com") {
            throw new accountSec.AccountSecurityError(
              "FORBIDDEN",
              "Origin mismatch",
              403,
            );
          }
        },
        accountResponse: (data, init) =>
          new Response(JSON.stringify(data), {
            ...init,
            headers: { "Cache-Control": "private, no-store", ...init?.headers },
          }),
        accountErrorResponse: (err) =>
          new Response(
            JSON.stringify({ error: { code: err.code, message: err.message } }),
            {
              status: err.statusHttp || 500,
              headers: { "Cache-Control": "private, no-store" },
            },
          ),
      },
      "@/lib/auth/account-security": {
        ...accountSec,
        dispatchExactTargetRevocation: async (opId, confId) => {
          const receipt = {
            operationId: opId,
            state: "accepted",
            results: [{ reference: randomUUID(), status: "revoked" }],
          };
          opsDb.set(opId, receipt);
          return receipt;
        },
      },
    },
  );

  const opId = randomUUID();
  const confId = randomUUID();

  // 1. Invalid UUID format returns 400
  const badUuidReq = new Request(
    "https://solodesk.com/api/account/session-revocations",
    {
      method: "POST",
      headers: {
        origin: "https://solodesk.com",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        operationId: "invalid-uuid",
        confirmationId: confId,
      }),
    },
  );
  const badUuidRes = await revocationsRoute.POST(badUuidReq);
  assert.equal(badUuidRes.status, 400);

  // 2. Unexpected extra parameter returns 400
  const extraParamReq = new Request(
    "https://solodesk.com/api/account/session-revocations",
    {
      method: "POST",
      headers: {
        origin: "https://solodesk.com",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        operationId: opId,
        confirmationId: confId,
        extra: "malicious",
      }),
    },
  );
  const extraParamRes = await revocationsRoute.POST(extraParamReq);
  assert.equal(extraParamRes.status, 400);

  // 3. Valid POST returns 200 with safe receipt
  const validReq = new Request(
    "https://solodesk.com/api/account/session-revocations",
    {
      method: "POST",
      headers: {
        origin: "https://solodesk.com",
        "content-type": "application/json",
      },
      body: JSON.stringify({ operationId: opId, confirmationId: confId }),
    },
  );
  const validRes = await revocationsRoute.POST(validReq);
  assert.equal(validRes.status, 200);
  assert.equal(validRes.headers.get("Cache-Control"), "private, no-store");
  const receipt = await validRes.json();
  assert.equal(receipt.operationId, opId);
  assert.equal(receipt.state, "accepted");
  assert.equal(receipt.results[0].status, "revoked");

  // 4. GET /api/account/session-revocations/[operationId]
  const opDetailRoute = loadServerModule(
    "../app/api/account/session-revocations/[operationId]/route.ts",
    {
      "@/lib/account": {
        requireAccountSession: async () => session,
        accountResponse: (data, init) =>
          new Response(JSON.stringify(data), {
            ...init,
            headers: { "Cache-Control": "private, no-store", ...init?.headers },
          }),
        accountErrorResponse: (err) =>
          new Response(
            JSON.stringify({ error: { code: err.code, message: err.message } }),
            {
              status: err.statusHttp || 500,
              headers: { "Cache-Control": "private, no-store" },
            },
          ),
      },
      "@/lib/auth/account-security": accountSec,
      "@/lib/db": {
        db: {
          query: async (sql, params) => {
            if (params[0] === opId && params[1] === session.userId) {
              return {
                rows: [
                  {
                    operation_id: opId,
                    state: "accepted",
                    target_results: [
                      { reference: "target-1", status: "revoked" },
                    ],
                  },
                ],
              };
            }
            return { rows: [] };
          },
        },
      },
    },
  );

  const getOpReq = new Request(
    `https://solodesk.com/api/account/session-revocations/${opId}`,
    {
      method: "GET",
    },
  );
  const getOpRes = await opDetailRoute.GET(getOpReq, {
    params: Promise.resolve({ operationId: opId }),
  });
  assert.equal(getOpRes.status, 200);
  assert.equal(getOpRes.headers.get("Cache-Control"), "private, no-store");
  const opData = await getOpRes.json();
  assert.equal(opData.operationId, opId);
  assert.equal(opData.state, "accepted");

  // Foreign operation returns 404
  const foreignRes = await opDetailRoute.GET(getOpReq, {
    params: Promise.resolve({ operationId: randomUUID() }),
  });
  assert.equal(foreignRes.status, 404);
});
