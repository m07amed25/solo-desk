import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise the real service code with synthetic adapters; this never connects to Neon.
function service(path, adapters) {
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
      assert.ok(name in adapters, `Unexpected dependency: ${name}`);
      return adapters[name];
    },
    Date,
    URL,
    process: {
      env: {
        DATABASE_URL: "postgres://synthetic:synthetic@localhost:9/synthetic",
        NEON_AUTH_BASE_URL: "https://auth-unavailable.invalid",
        NEON_AUTH_COOKIE_SECRET: "synthetic",
        NEON_REALTIME_SECRET: "synthetic",
      },
    },
  });
  return exports;
}
const userId = "00000000-0000-0000-0000-000000000001";
const otherId = "00000000-0000-0000-0000-000000000002";
const sessionId = "00000000-0000-0000-0000-000000000003";
function identity(
  expiresAt = new Date(Date.now() + 60000).toISOString(),
  emailVerified = true,
) {
  return {
    user: { id: userId, emailVerified },
    session: { id: sessionId, expiresAt },
  };
}

test("fresh session helper rejects unverified, expired, revoked, malformed and unavailable authority", async () => {
  let result = { data: identity(), error: null };
  let calls = 0;
  const { currentSession } = service("../lib/auth/server.ts", {
    "@neondatabase/auth/next/server": {
      createNeonAuth() {
        return {
          async getSession(options) {
            calls++;
            assert.equal(options.query.disableCookieCache, "true");
            return result;
          },
        };
      },
    },
  });

  // 1. Verified active session returns user
  assert.equal((await currentSession()).user.id, userId);

  // 2. Unverified session (emailVerified: false) must be rejected as null authority
  result = {
    data: identity(new Date(Date.now() + 60000).toISOString(), false),
    error: null,
  };
  assert.equal(await currentSession(), null);

  // 3. Unverified session (missing emailVerified) must be rejected
  result = {
    data: {
      user: { id: userId },
      session: {
        id: sessionId,
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      },
    },
    error: null,
  };
  assert.equal(await currentSession(), null);

  // 4. Expired session returns null
  result = {
    data: identity(new Date(Date.now() - 1000).toISOString()),
    error: null,
  };
  assert.equal(await currentSession(), null);

  // 5. Malformed expiry returns null
  result = { data: identity("invalid"), error: null };
  assert.equal(await currentSession(), null);

  // 6. Revoked / null session returns null
  result = { data: null, error: null };
  assert.equal(await currentSession(), null);

  // 7. Auth service failure throws unavailable
  result = { data: null, error: { code: "unavailable" } };
  await assert.rejects(currentSession, /Authentication unavailable/);
  assert.equal(calls, 7);
});

test("profile service denies unverified, mismatched, expired or revoked users and seals only current verified own rows", async () => {
  let session = identity();
  let queries = 0;
  let seals = 0;
  let rows = [{ id: userId, name: "Synthetic member" }];
  const { loadProfile } = service("../lib/profile.ts", {
    "@/lib/auth/server": { currentSession: async () => session },
    "@/lib/db": {
      db: {
        async query(sql, params) {
          queries++;
          assert.equal(params[0], userId);
          assert.equal(params[1], sessionId);
          assert.equal(params.length, 2);
          assert.match(sql, /s\."expiresAt" > CURRENT_TIMESTAMP/);
          assert.match(sql, /u\."emailVerified" IS TRUE/);
          return { rows };
        },
      },
    },
    "@neon/realtime/server": {
      rawSql(query, params) {
        return { query, params };
      },
      createRealtime() {
        return {
          async seal() {
            seals++;
            return { syntheticCapability: true };
          },
        };
      },
    },
  });

  // Foreign user request denied
  assert.equal(await loadProfile(otherId), null);
  assert.equal(await loadProfile("not-an-id"), null);

  // Revoked / unauthenticated session denied before query
  session = null;
  assert.equal(await loadProfile(userId), null);
  assert.equal(queries, 0);
  assert.equal(seals, 0);

  // Expired session denied before query
  session = identity(new Date(Date.now() - 1000).toISOString());
  assert.equal(await loadProfile(userId), null);
  assert.equal(queries, 0);

  // Unverified user denied before query
  session = identity(new Date(Date.now() + 60000).toISOString(), false);
  assert.equal(await loadProfile(userId), null);
  assert.equal(queries, 0);

  // Active verified user with no DB row (e.g. banned or unverified in DB) denied
  session = identity();
  rows = [];
  assert.equal(await loadProfile(userId), null);
  assert.equal(seals, 0);

  // Active verified user with valid DB row succeeds and query is sealed
  rows = [{ id: userId, name: "Synthetic member" }];
  const profile = await loadProfile(userId);
  assert.equal(profile.userId, userId);
  assert.equal(profile.initialData[0].name, "Synthetic member");
  assert.equal(profile.sessionExpiresAt, session.session.expiresAt);
  assert.ok(profile.sealedQuery.syntheticCapability);
  assert.deepEqual(Object.keys(profile).sort(), [
    "initialData",
    "sealedQuery",
    "sessionExpiresAt",
    "userId",
  ]);
  assert.equal(seals, 1);
});
