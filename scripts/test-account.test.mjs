import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Service loader executing TypeScript with synthetic adapters (no live network/DB)
function loadAccountModule(path, adapters) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    require(name) {
      if (name === "server-only") return {};
      if (name === "@/lib/request-body") {
        return {
          readRequestBody: async (req, maxBytes = 16384) => {
            const text = typeof req.text === "function" ? await req.text() : "";
            if (Buffer.byteLength(text) > maxBytes) {
              throw new RangeError("Request body too large");
            }
            return text;
          },
        };
      }
      if (name in adapters) {
        const ad = adapters[name];
        if (name === "@/lib/db" && ad && typeof ad === "object" && !ad.db) {
          return { ...ad, db: ad };
        }
        return ad;
      }
      assert.fail(`Unexpected module dependency: ${name}`);
    },
    Date,
    URL,
    Set,
    Math,
    BigInt,
    Intl,
    Buffer,
    Response,
    Request,
    Headers,
    RangeError,
    process: {
      env: {
        DATABASE_URL: "postgres://synthetic:synthetic@localhost:9/synthetic",
      },
    },
  });
  return exports;
}

const userA = "00000000-0000-0000-0000-000000000001";
const userB = "00000000-0000-0000-0000-000000000002";
const sessionA = "10000000-0000-0000-0000-000000000001";

function makeSession({
  userId = userA,
  sessionId = sessionA,
  expiresAt = new Date(Date.now() + 60_000).toISOString(),
  emailVerified = true,
  banned = false,
} = {}) {
  return {
    user: {
      id: userId,
      email: `${userId}@example.com`,
      emailVerified,
      banned,
    },
    session: {
      id: sessionId,
      expiresAt,
    },
  };
}

test("account authority guard requires fresh, verified, unbanned, unexpired identity", async () => {
  let activeSession = makeSession();

  const mod = loadAccountModule("../lib/account.ts", {
    "@/lib/auth/server": {
      currentSession: async () => activeSession,
    },
    "@/lib/db": {
      query: async () => ({ rows: [] }),
      transaction: async (cb) => cb({ query: async () => ({ rows: [] }) }),
    },
  });

  // 1. Valid session resolves account authority
  const auth = await mod.requireAccountSession();
  assert.equal(auth.userId, userA);
  assert.equal(auth.sessionId, sessionA);

  // 2. Unverified identity throws UNAUTHORIZED
  activeSession = makeSession({ emailVerified: false });
  await assert.rejects(
    async () => mod.requireAccountSession(),
    (err) => err.code === "UNAUTHORIZED" && err.statusHttp === 401,
  );

  // 3. Expired session throws UNAUTHORIZED
  activeSession = makeSession({
    expiresAt: new Date(Date.now() - 10_000).toISOString(),
  });
  await assert.rejects(
    async () => mod.requireAccountSession(),
    (err) => err.code === "UNAUTHORIZED" && err.statusHttp === 401,
  );

  // 4. Banned identity throws FORBIDDEN
  activeSession = makeSession({ banned: true });
  await assert.rejects(
    async () => mod.requireAccountSession(),
    (err) => err.code === "FORBIDDEN" && err.statusHttp === 403,
  );

  // 5. Null session throws UNAUTHORIZED
  activeSession = null;
  await assert.rejects(
    async () => mod.requireAccountSession(),
    (err) => err.code === "UNAUTHORIZED" && err.statusHttp === 401,
  );
});

test("account preferences require no workspace membership and return explicit defaults on missing row without insert", async () => {
  let queryCount = 0;
  let insertCount = 0;
  const dbRows = [];

  const mod = loadAccountModule("../lib/account.ts", {
    "@/lib/auth/server": {
      currentSession: async () => makeSession(),
    },
    "@/lib/db": {
      query: async (sql, params) => {
        queryCount++;
        if (/insert/i.test(sql)) insertCount++;
        assert.ok(
          !/workspace/i.test(sql),
          "Account preference reads must not join or query workspace tables",
        );
        assert.equal(params[0], userA, "Must query only for current user ID");
        if (/neon_auth/.test(sql)) {
          assert.equal(params[1], sessionA);
          return { rows: [{ id: userA }] };
        }
        assert.equal(params.length, 1);
        return { rows: dbRows };
      },
      transaction: async (cb) => cb({ query: async () => ({ rows: [] }) }),
    },
  });

  const session = await mod.requireAccountSession();
  const res = await mod.getAccountPreferences(session);

  // Must return explicit default projection with revision "0", timezone "UTC", and isDefault: true
  assert.equal(res.isDefault, true);
  assert.equal(res.preferences.locale, null);
  assert.equal(res.preferences.timezone, "UTC");
  assert.equal(res.preferences.optionalAccountEmail, false);
  assert.equal(res.preferences.revision, "0");
  assert.equal(
    insertCount,
    0,
    "GET on missing row must perform zero database writes",
  );
  assert.equal(queryCount, 2);
});

test("input validation enforces strict allowlisting, recognized IANA zones, and bounds", async () => {
  const mod = loadAccountModule("../lib/account.ts", {
    "@/lib/auth/server": { currentSession: async () => makeSession() },
    "@/lib/db": { query: async () => ({ rows: [] }) },
  });

  // Valid inputs
  const valid = mod.validatePreferencesInput({
    expectedRevision: "0",
    locale: "ar",
    timezone: "Africa/Cairo",
    optionalAccountEmail: true,
  });
  assert.equal(valid.expectedRevision, "0");
  assert.equal(valid.locale, "ar");
  assert.equal(valid.timezone, "Africa/Cairo");
  assert.equal(valid.optionalAccountEmail, true);

  // Disallowed extra fields
  assert.throws(
    () =>
      mod.validatePreferencesInput({
        expectedRevision: "0",
        locale: "en",
        timezone: "UTC",
        optionalAccountEmail: false,
        extraField: "hacker",
      }),
    /VALIDATION/,
  );

  // Invalid locale
  assert.throws(
    () =>
      mod.validatePreferencesInput({
        expectedRevision: "0",
        locale: "fr",
        timezone: "UTC",
        optionalAccountEmail: false,
      }),
    /VALIDATION/,
  );

  // Invalid / unrecognized timezone
  assert.throws(
    () =>
      mod.validatePreferencesInput({
        expectedRevision: "0",
        locale: "en",
        timezone: "Invalid/Fake_Zone",
        optionalAccountEmail: false,
      }),
    /VALIDATION/,
  );

  // Oversized timezone (>100 chars)
  assert.throws(
    () =>
      mod.validatePreferencesInput({
        expectedRevision: "0",
        locale: "en",
        timezone: "A".repeat(101),
        optionalAccountEmail: false,
      }),
    /VALIDATION/,
  );

  // Non-boolean optionalAccountEmail
  assert.throws(
    () =>
      mod.validatePreferencesInput({
        expectedRevision: "0",
        locale: "en",
        timezone: "UTC",
        optionalAccountEmail: "true",
      }),
    /VALIDATION/,
  );

  // Negative or non-canonical revision
  assert.throws(
    () =>
      mod.validatePreferencesInput({
        expectedRevision: "-1",
        locale: "en",
        timezone: "UTC",
        optionalAccountEmail: false,
      }),
    /VALIDATION/,
  );
});

test("compare-and-set prevents stale updates and isolates foreign targets", async () => {
  let storedRow = {
    user_id: userA,
    locale: "en",
    timezone: "UTC",
    optional_account_email: false,
    revision: "1",
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mod = loadAccountModule("../lib/account.ts", {
    "@/lib/auth/server": { currentSession: async () => makeSession() },
    "@/lib/db": {
      transaction: async (cb) => {
        const client = {
          query: async (sql, params) => {
            if (/neon_auth/.test(sql)) return { rows: [{ id: userA }] };
            if (/select[\s\S]*from[\s\S]*account_preferences/i.test(sql)) {
              const requestedUser = params[0];
              if (requestedUser === userA && storedRow) {
                return { rows: [storedRow] };
              }
              return { rows: [] };
            }
            if (/update[\s\S]*account_preferences/i.test(sql)) {
              const [locale, tz, optEmail, nextRev, userId, expectedRev] =
                params;
              if (userId === userA && storedRow.revision === expectedRev) {
                storedRow = {
                  ...storedRow,
                  locale,
                  timezone: tz,
                  optional_account_email: optEmail,
                  revision: nextRev,
                  updated_at: new Date(),
                };
                return { rowCount: 1, rows: [storedRow] };
              }
              return { rowCount: 0, rows: [] };
            }
            if (/insert.*into.*account_security_events/i.test(sql)) {
              return { rowCount: 1, rows: [] };
            }
            return { rows: [] };
          },
        };
        return cb(client);
      },
    },
  });

  const session = await mod.requireAccountSession();

  // 1. Successful CAS write from revision "1" -> "2"
  const updated = await mod.saveAccountPreferences(session, {
    expectedRevision: "1",
    locale: "ar",
    timezone: "Africa/Cairo",
    optionalAccountEmail: true,
  });
  assert.equal(updated.preferences.revision, "2");
  assert.equal(updated.preferences.locale, "ar");

  // 2. Stale CAS update with old revision "1" must throw CONFLICT (409) with accepted own projection
  await assert.rejects(
    async () =>
      mod.saveAccountPreferences(session, {
        expectedRevision: "1",
        locale: "en",
        timezone: "UTC",
        optionalAccountEmail: false,
      }),
    (err) => {
      assert.equal(err.code, "CONFLICT");
      assert.equal(err.statusHttp, 409);
      assert.equal(err.currentPreferences.revision, "2");
      return true;
    },
  );
});

test("preference revisions are canonical PostgreSQL bigint values and fields are exact", () => {
  const mod = loadAccountModule("../lib/account.ts", {
    "@/lib/auth/server": { currentSession: async () => makeSession() },
    "@/lib/db": {},
  });
  const input = {
    expectedRevision: "0",
    locale: "en",
    timezone: "UTC",
    optionalAccountEmail: false,
  };
  for (const revision of [
    "00",
    "01",
    " 1",
    "+1",
    "1.0",
    "1e2",
    "9223372036854775808",
    "9".repeat(10000),
    1,
  ]) {
    assert.throws(
      () =>
        mod.validatePreferencesInput({ ...input, expectedRevision: revision }),
      /VALIDATION/,
    );
  }
  assert.equal(
    mod.validatePreferencesInput({
      ...input,
      expectedRevision: "9223372036854775807",
    }).expectedRevision,
    "9223372036854775807",
  );
  for (const field of Object.keys(input)) {
    const missing = { ...input };
    delete missing[field];
    assert.throws(() => mod.validatePreferencesInput(missing), /VALIDATION/);
  }
  for (const field of [
    "userId",
    "sessionId",
    "name",
    "workspaceId",
    "revision",
  ]) {
    assert.throws(
      () => mod.validatePreferencesInput({ ...input, [field]: userB }),
      /VALIDATION/,
    );
  }
});

test("preference services recheck original identity and current database authority before exposing or changing data", async () => {
  let identity = makeSession();
  let authority = true;
  let effects = 0;
  const queries = [];
  const query = async (sql, params) => {
    queries.push({ sql, params });
    if (/neon_auth/.test(sql))
      return { rows: authority ? [{ id: userA }] : [] };
    if (/account_preferences/.test(sql)) effects++;
    return { rows: [] };
  };
  const mod = loadAccountModule("../lib/account.ts", {
    "@/lib/auth/server": { currentSession: async () => identity },
    "@/lib/db": { query, transaction: async (fn) => fn({ query }) },
  });
  const session = await mod.requireAccountSession();
  const input = {
    expectedRevision: "0",
    locale: "en",
    timezone: "UTC",
    optionalAccountEmail: false,
  };
  for (const replacement of [
    null,
    makeSession({ userId: userB }),
    makeSession({ sessionId: userB }),
    makeSession({ emailVerified: false }),
    makeSession({ banned: true }),
    makeSession({ expiresAt: new Date(0).toISOString() }),
  ]) {
    identity = replacement;
    await assert.rejects(mod.getAccountPreferences(session), (err) =>
      [401, 403].includes(err.statusHttp),
    );
    await assert.rejects(mod.saveAccountPreferences(session, input), (err) =>
      [401, 403].includes(err.statusHttp),
    );
  }
  assert.equal(effects, 0);
  identity = makeSession();
  authority = false;
  await assert.rejects(
    mod.getAccountPreferences(session),
    (err) => err.statusHttp === 401,
  );
  await assert.rejects(
    mod.saveAccountPreferences(session, input),
    (err) => err.statusHttp === 401,
  );
  assert.equal(
    effects,
    0,
    "A revoked database session cannot read defaults or write settings",
  );
  for (const { sql, params } of queries) {
    assert.match(sql, /"emailVerified"/);
    assert.match(sql, /banned/);
    assert.match(sql, /"expiresAt"\s*>\s*CURRENT_TIMESTAMP/);
    assert.deepEqual(Array.from(params), [userA, sessionA]);
  }
});

test("competing first saves have one winner and return only accepted own preferences to the loser", async () => {
  const accepted = {
    locale: "ar",
    timezone: "Africa/Cairo",
    optional_account_email: true,
    revision: "1",
  };
  let preferenceReads = 0;
  let events = 0;
  let inserts = 0;
  let finishReads;
  const bothReads = new Promise((resolve) => {
    finishReads = resolve;
  });
  const query = async (sql, params) => {
    if (/neon_auth/.test(sql)) return { rows: [{ id: userA }] };
    if (/SELECT[\s\S]*account_preferences/.test(sql)) {
      assert.equal(params[0], userA);
      if (++preferenceReads <= 2) {
        if (preferenceReads === 2) finishReads();
        await bothReads;
        return { rows: [] };
      }
      return { rows: [accepted] };
    }
    if (/INSERT INTO solodesk.account_preferences/.test(sql)) {
      inserts++;
      assert.match(sql, /ON CONFLICT\s*\(user_id\)\s*DO NOTHING/);
      return { rows: inserts === 1 ? [accepted] : [] };
    }
    if (/account_security_events/.test(sql)) events++;
    return { rows: [] };
  };
  const mod = loadAccountModule("../lib/account.ts", {
    "@/lib/auth/server": { currentSession: async () => makeSession() },
    "@/lib/db": { query, transaction: async (fn) => fn({ query }) },
  });
  const session = await mod.requireAccountSession();
  const input = {
    expectedRevision: "0",
    locale: "ar",
    timezone: "Africa/Cairo",
    optionalAccountEmail: true,
  };
  const outcomes = await Promise.allSettled([
    mod.saveAccountPreferences(session, input),
    mod.saveAccountPreferences(session, input),
  ]);
  assert.equal(
    outcomes.filter((result) => result.status === "fulfilled").length,
    1,
  );
  const loser = outcomes.find((result) => result.status === "rejected").reason;
  assert.equal(loser.statusHttp, 409);
  assert.deepEqual(JSON.parse(JSON.stringify(loser.currentPreferences)), {
    locale: "ar",
    timezone: "Africa/Cairo",
    optionalAccountEmail: true,
    revision: "1",
  });
  assert.equal(inserts, 2);
  assert.equal(events, 1);
});

test("preference event failure rolls back; unknown commit is reconciled by an own read", async () => {
  let failEvent = true;
  let unknownCommit = false;
  let accepted = false;
  let pending = false;
  const statements = [];
  const releases = [];
  const row = {
    locale: "ar",
    timezone: "Africa/Cairo",
    optional_account_email: true,
    revision: "1",
  };
  const query = async (sql, params) => {
    statements.push(sql);
    if (/neon_auth/.test(sql)) return { rows: [{ id: userA }] };
    if (/SELECT[\s\S]*account_preferences/.test(sql)) {
      assert.equal(params[0], userA);
      return { rows: accepted ? [row] : [] };
    }
    if (/INSERT INTO solodesk.account_preferences/.test(sql)) {
      pending = true;
      return { rows: [row] };
    }
    if (/INSERT INTO solodesk.account_security_events/.test(sql)) {
      if (failEvent) throw new Error("event store unavailable");
    }
    if (sql === "ROLLBACK") pending = false;
    if (sql === "COMMIT") {
      accepted = pending;
      if (unknownCommit)
        throw Object.assign(new Error("connection lost after commit"), {
          code: "57P01",
        });
    }
    return { rows: [] };
  };
  const pool = {
    query,
    connect: async () => ({
      query,
      release: (discard) => releases.push(discard),
    }),
  };
  const mod = loadAccountModule("../lib/account.ts", {
    "@/lib/auth/server": { currentSession: async () => makeSession() },
    "@/lib/db": pool,
  });
  const session = await mod.requireAccountSession();
  const input = {
    expectedRevision: "0",
    locale: "ar",
    timezone: "Africa/Cairo",
    optionalAccountEmail: true,
  };
  await assert.rejects(
    mod.saveAccountPreferences(session, input),
    /event store unavailable/,
  );
  assert.equal(accepted, false);
  assert.equal(statements.at(-1), "ROLLBACK");
  assert.ok(!statements.includes("COMMIT"));
  failEvent = false;
  unknownCommit = true;
  await assert.rejects(
    mod.saveAccountPreferences(session, input),
    (err) => err.code === "OUTCOME_UNKNOWN" && err.statusHttp === 503,
  );
  assert.equal(
    releases.at(-1),
    true,
    "Unknown commit must discard its connection",
  );
  const reconciled = await mod.getAccountPreferences(session);
  assert.equal(reconciled.preferences.revision, "1");
  assert.equal(reconciled.preferences.timezone, input.timezone);
  const insertCount = statements.filter((sql) =>
    /INSERT INTO solodesk.account_preferences/.test(sql),
  ).length;
  await assert.rejects(
    mod.saveAccountPreferences(session, input),
    (err) => err.statusHttp === 409 && err.currentPreferences.revision === "1",
  );
  assert.equal(
    statements.filter((sql) =>
      /INSERT INTO solodesk.account_preferences/.test(sql),
    ).length,
    insertCount,
    "Retry must not duplicate a committed write",
  );
});

test("database preference projections and updates stay bound to the original account", async () => {
  let active = makeSession({ userId: userB });
  const operations = [];
  const query = async (sql, params) => {
    if (/neon_auth/.test(sql)) {
      assert.deepEqual(Array.from(params), [userB, sessionA]);
      return { rows: [{ id: userB }] };
    }
    if (/account_preferences/.test(sql)) {
      operations.push(sql);
      assert.ok(params.includes(userB));
      assert.ok(!params.includes(userA));
      if (/SELECT/.test(sql))
        return {
          rows: [
            {
              locale: "en",
              timezone: "UTC",
              optional_account_email: false,
              revision: "9223372036854775807",
            },
          ],
        };
    }
    return { rows: [] };
  };
  const mod = loadAccountModule("../lib/account.ts", {
    "@/lib/auth/server": { currentSession: async () => active },
    "@/lib/db": { query, transaction: async (fn) => fn({ query }) },
  });
  const session = await mod.requireAccountSession();
  assert.equal(
    (await mod.getAccountPreferences(session)).preferences.revision,
    "9223372036854775807",
  );
  await assert.rejects(
    mod.saveAccountPreferences(session, {
      expectedRevision: "9223372036854775807",
      locale: "ar",
      timezone: "UTC",
      optionalAccountEmail: false,
    }),
    (err) => err.code === "CONFLICT",
  );
  assert.ok(
    operations.every((sql) => /SELECT/.test(sql)),
    "Revision exhaustion cannot wrap or write",
  );
  active = makeSession();
  await assert.rejects(
    mod.getAccountPreferences(session),
    (err) => err.statusHttp === 401,
  );
});

test("security events enforce redaction, closed types, and omit sensitive fields", async () => {
  const recordedEvents = [];
  const mod = loadAccountModule("../lib/account.ts", {
    "@/lib/auth/server": { currentSession: async () => makeSession() },
    "@/lib/db": {
      transaction: async (cb) => {
        const client = {
          query: async (sql, params) => {
            if (/insert.*into.*account_security_events/i.test(sql)) {
              recordedEvents.push(params);
              return { rowCount: 1, rows: [] };
            }
            return { rows: [] };
          },
        };
        return cb(client);
      },
    },
  });

  const client = {
    query: async (sql, params) => {
      recordedEvents.push({ sql, params });
      return { rowCount: 1, rows: [] };
    },
  };

  await mod.recordAccountSecurityEvent(client, {
    eventType: "account_preferences_updated",
    outcome: "confirmed",
    actorId: userA,
    correlationId: "corr-12345",
    action: "update_preferences",
    targetReference: "own-account",
  });

  assert.equal(recordedEvents.length, 1);
  const event = recordedEvents[0];
  const params = event.params;
  // params: [event_type, outcome, actor_id, correlation_id, action, target_ref, policy_version]
  assert.equal(params[0], "account_preferences_updated");
  assert.equal(params[1], "confirmed");
  assert.equal(params[2], userA);
  assert.equal(params[3], "corr-12345");
  assert.equal(params[4], "update_preferences");
  assert.equal(params[5], "own-account");
  assert.equal(params[6], "1.0");

  // Verify prohibited arbitrary fields / credentials cannot be stored in event
  await assert.rejects(async () => {
    await mod.recordAccountSecurityEvent(client, {
      eventType: "invalid_type",
      outcome: "confirmed",
    });
  }, /VALIDATION/);
});

test("request body parsing enforces origin, 4 KiB limits, Content-Type, and Cache-Control: private, no-store", async () => {
  const mod = loadAccountModule("../lib/account.ts", {
    "@/lib/auth/server": { currentSession: async () => makeSession() },
    "@/lib/db": { query: async () => ({ rows: [] }) },
  });

  // 1. Cross-origin forbidden (Sec-Fetch-Site: cross-site)
  const crossSiteReq = new Request(
    "http://localhost:3000/api/account/preferences",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "sec-fetch-site": "cross-site",
      },
      body: JSON.stringify({ expectedRevision: "0" }),
    },
  );
  await assert.rejects(
    async () => mod.parseAccountJsonRequest(crossSiteReq),
    (err) => {
      assert.equal(err.code, "FORBIDDEN");
      assert.equal(err.statusHttp, 403);
      return true;
    },
  );

  // 2. Unsupported Content-Type (not application/json)
  const badContentTypeReq = new Request(
    "http://localhost:3000/api/account/preferences",
    {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        host: "localhost:3000",
      },
      body: "hello world",
    },
  );
  await assert.rejects(
    async () => mod.parseAccountJsonRequest(badContentTypeReq),
    (err) => {
      assert.equal(err.code, "UNSUPPORTED_MEDIA_TYPE");
      assert.equal(err.statusHttp, 415);
      return true;
    },
  );

  // 3. Payload exceeds 4 KiB (4096 bytes)
  const bigPayload = { data: "x".repeat(5000) };
  const bigReq = new Request("http://localhost:3000/api/account/preferences", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "localhost:3000",
    },
    body: JSON.stringify(bigPayload),
  });
  await assert.rejects(
    async () => mod.parseAccountJsonRequest(bigReq, 4096),
    (err) => {
      assert.equal(err.code, "PAYLOAD_TOO_LARGE");
      assert.equal(err.statusHttp, 413);
      return true;
    },
  );

  // 4. Valid payload parses cleanly
  const validReq = new Request(
    "http://localhost:3000/api/account/preferences",
    {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({ expectedRevision: "1", locale: "en" }),
    },
  );
  const parsed = await mod.parseAccountJsonRequest(validReq, 4096);
  assert.equal(parsed.expectedRevision, "1");
  assert.equal(parsed.locale, "en");

  // 5. Responses enforce Cache-Control: private, no-store
  const okRes = mod.accountResponse({ ok: true });
  assert.equal(okRes.headers.get("Cache-Control"), "private, no-store");

  const errRes = mod.accountErrorResponse(
    new mod.AccountError("CONFLICT", "Stale revision", 409),
  );
  assert.equal(errRes.status, 409);
  assert.equal(errRes.headers.get("Cache-Control"), "private, no-store");
});

test("account locale resolver enforces browser -> account -> English precedence without mutating DB", async () => {
  const ts = (await import("typescript")).default;
  const { readFileSync } = await import("node:fs");
  const vm = await import("node:vm");

  function loadAccountLocale(customDb) {
    const source = readFileSync(
      new URL("../lib/account-locale.ts", import.meta.url),
      "utf8",
    );
    const output = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    const exports = {};
    vm.runInNewContext(output, {
      exports,
      require(name) {
        if (name === "server-only") return {};
        if (name === "@/lib/db") return { db: customDb };
        if (name === "@/lib/site") {
          return { isLocale: (v) => v === "en" || v === "ar" };
        }
        throw new Error(`Unexpected import in test: ${name}`);
      },
    });
    return exports;
  }

  let dbQueries = 0;
  const mockDb = {
    async query(sql, params) {
      dbQueries++;
      if (params?.[0] === "user-with-ar") {
        return { rows: [{ locale: "ar" }] };
      }
      return { rows: [] };
    },
  };

  const localeMod = loadAccountLocale(mockDb);

  // 1. Explicit valid browser cookie wins without checking DB
  dbQueries = 0;
  const locFromCookie = await localeMod.resolvePresentationLocale(
    "ar",
    "user-with-ar",
  );
  assert.equal(locFromCookie, "ar");
  assert.equal(dbQueries, 0, "Valid browser choice must not query database");

  // 2. Absent browser cookie resolves from account preference
  dbQueries = 0;
  const locFromAccount = await localeMod.resolvePresentationLocale(
    null,
    "user-with-ar",
  );
  assert.equal(locFromAccount, "ar");
  assert.equal(dbQueries, 1, "Must query DB when browser cookie is absent");

  // 3. Absent browser cookie and missing account preference falls back to English
  dbQueries = 0;
  const locDefault = await localeMod.resolvePresentationLocale(
    null,
    "user-without-prefs",
  );
  assert.equal(locDefault, "en");
  assert.equal(dbQueries, 1);

  // 4. Absent browser cookie and unauthenticated user falls back to English with zero DB queries
  dbQueries = 0;
  const locAnon = await localeMod.resolvePresentationLocale(null, null);
  assert.equal(locAnon, "en");
  assert.equal(dbQueries, 0, "Unauthenticated request must not query DB");

  // 5. Database failure safely falls back to English without throwing
  const faultDb = {
    async query() {
      throw new Error("DB connection timeout");
    },
  };
  const faultMod = loadAccountLocale(faultDb);
  const locFault = await faultMod.resolvePresentationLocale(
    null,
    "user-with-ar",
  );
  assert.equal(locFault, "en");
});
