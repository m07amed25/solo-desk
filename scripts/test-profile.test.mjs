import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRealtimeClient } from "@neon/realtime/client";

// Exercise the real service code with synthetic adapters; this never connects to Neon.
function service(path, adapters, env = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    fileName: path,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
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
        NEON_REALTIME_URL: "wss://realtime.example.invalid",
        ...env,
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

  // 7. Banned user returns null
  result = {
    data: {
      user: { id: userId, emailVerified: true, banned: true },
      session: {
        id: sessionId,
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      },
    },
    error: null,
  };
  assert.equal(await currentSession(), null);

  // 8. Auth service failure throws unavailable
  result = { data: null, error: { code: "unavailable" } };
  await assert.rejects(currentSession, /Authentication unavailable/);
  assert.equal(calls, 8);
});

test("account page passes the configured server Realtime URL and handles missing or unsafe configuration", async () => {
  let loads = 0;
  let profile = { userId };
  const urls = [];
  const redirects = [];
  const adapters = {
    "react/jsx-runtime": await import("react/jsx-runtime"),
    "next/link": {
      default: ({ children, href }) => createElement("a", { href }, children),
    },
    "next/server": { connection: async () => {} },
    "next/navigation": {
      redirect: (path) => {
        redirects.push(path);
        throw new Error("REDIRECT");
      },
    },
    "next-intl/server": { getTranslations: async () => (key) => key },
    "@/components/application-shell": {
      ApplicationShell: ({ children }) => children,
    },
    "@/components/live-profile": {
      LiveProfile: ({ realtimeUrl }) => {
        urls.push(realtimeUrl);
        const client = createRealtimeClient({ url: realtimeUrl });
        client.close();
        return createElement("div", null, "Profile");
      },
    },
    "@/components/account-reauthentication": {
      AccountReauthentication: () => null,
    },
    "@/components/ui/alert": {
      Alert: ({ children }) => children,
      AlertDescription: ({ children }) => children,
    },
    "@/lib/profile": {
      loadProfile: async () => {
        loads++;
        return profile;
      },
    },
  };
  const path = "../app/(site)/[locale]/[theme]/app/account/page.tsx";
  const valid = service(path, adapters);
  assert.match(renderToStaticMarkup(await valid.default()), /Profile/);
  assert.deepEqual(urls, ["wss://realtime.example.invalid/"]);
  assert.equal(loads, 1);
  for (const value of [
    undefined,
    "",
    "invalid",
    "https://realtime.example.invalid",
    "postgresql://synthetic:synthetic@example.invalid/db",
    "wss://synthetic:synthetic@example.invalid",
  ]) {
    const page = service(path, adapters, { NEON_REALTIME_URL: value });
    const html = renderToStaticMarkup(await page.default());
    assert.match(html, /unavailable/);
    assert.match(html, /retry/);
    assert.doesNotMatch(html, /synthetic|example\.invalid/);
  }
  assert.equal(
    loads,
    1,
    "Invalid transport configuration must not start profile reads",
  );
  assert.equal(
    urls.length,
    1,
    "Invalid transport configuration must not reach the browser client",
  );
  profile = null;
  await assert.rejects(valid.default(), /REDIRECT/);
  assert.deepEqual(redirects, ["/sign-in?returnTo=%2Fapp%2Faccount#"]);
});

test("profile service denies unverified, mismatched, expired or revoked users and seals only current verified own rows", async () => {
  let session = identity();
  let queries = 0;
  let seals = 0;
  let rows = [{ id: userId, name: "Synthetic member" }];
  let shouldFailQuery = false;
  const { loadProfile } = service("../lib/profile.ts", {
    "@/lib/auth/server": { currentSession: async () => session },
    "@/lib/db": {
      db: {
        async query(sql, params) {
          if (shouldFailQuery) throw new Error("DB connection unavailable");
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

  // Database failure propagates as rejected promise
  shouldFailQuery = true;
  await assert.rejects(
    async () => await loadProfile(userId),
    /DB connection unavailable/,
  );
  shouldFailQuery = false;

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

test("saveProfile action preserves parameter contracts, error codes, and own-user authorization", async () => {
  let profileMock = { userId };
  let updateResult = { error: null };
  const { saveProfile } = service("../app/actions.ts", {
    "@/lib/profile": {
      loadProfile: async (id) =>
        id === profileMock?.userId ? profileMock : null,
    },
    "@/lib/auth/server": {
      auth: {
        updateUser: async ({ name }) => {
          assert.equal(name, "Updated Name");
          return updateResult;
        },
      },
    },
  });

  // Invalid name checks
  assert.equal((await saveProfile(userId, "")).error, "invalidName");
  assert.equal((await saveProfile(userId, "   ")).error, "invalidName");
  assert.equal(
    (await saveProfile(userId, "a".repeat(101))).error,
    "invalidName",
  );

  // Unauthorized when loadProfile returns null (e.g. foreign user or unverified)
  assert.equal(
    (await saveProfile(otherId, "Updated Name")).error,
    "unauthorized",
  );

  // Save failed when auth.updateUser returns error or throws
  updateResult = { error: { code: "FAILED" } };
  assert.equal((await saveProfile(userId, "Updated Name")).error, "saveFailed");

  // Successful save
  updateResult = { error: null };
  assert.equal((await saveProfile(userId, "Updated Name")).error, null);
});

test("AP-01: generic shell identity reads require neither workspace membership nor Realtime envelope", async () => {
  let sessionResult = { data: identity(), error: null };
  const { currentSession } = service("../lib/auth/server.ts", {
    "@neondatabase/auth/next/server": {
      createNeonAuth() {
        return {
          async getSession() {
            return sessionResult;
          },
        };
      },
    },
  });

  // 1. Fresh active session returns user and session directly without workspace or realtime
  const active = await currentSession();
  assert.ok(active);
  assert.equal(active.user.id, userId);
  assert.equal(active.user.emailVerified, true);
  assert.equal(active.user.banned, undefined);
  assert.equal(typeof active.session.expiresAt, "string");
  // Proves no workspace or realtime query was invoked to resolve account identity

  // 2. Missing session returns null (anonymous visitor)
  sessionResult = { data: null, error: null };
  assert.equal(await currentSession(), null);

  // 3. Authority outage throws standard Authentication unavailable
  sessionResult = { data: null, error: { message: "Auth service down" } };
  await assert.rejects(
    async () => await currentSession(),
    /Authentication unavailable/,
  );
});
