import assert from "node:assert/strict";
import { loadEnvFile } from "node:process";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { createRealtimeClient } from "@neon/realtime/client";

// This check precedes env loading, client construction and every remote operation.
assert.equal(
  process.env.SOLODESK_TEST_ENV,
  "isolated",
  "Remote tests require an independently verified isolated target and SOLODESK_TEST_ENV=isolated",
);
loadEnvFile(".env.local");
assert.ok(
  process.env.NEON_BRANCH && !/prod/i.test(process.env.NEON_BRANCH),
  "Production or unidentified branches cannot run fixtures",
);
const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL.replace(
    "sslmode=require",
    "sslmode=verify-full",
  ),
  connectionTimeoutMillis: 10_000,
});
const realtime = createRealtimeClient({
  url: process.env.NEON_REALTIME_URL,
  logLevel: "silent",
});
const emails = [];

async function saveName(userId, name, jar) {
  const manifest = JSON.parse(
    readFileSync(".next/server/server-reference-manifest.json", "utf8"),
  );
  const actionId = Object.entries(manifest.node).find(
    ([, value]) => value.exportedName === "saveProfile",
  )?.[0];
  assert.ok(
    actionId,
    "Build the app before running the production integration test",
  );
  const response = await fetch(`${base}/app`, {
    method: "POST",
    headers: {
      Origin: base,
      "Next-Action": actionId,
      "Content-Type": "text/plain;charset=UTF-8",
      Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
    },
    body: JSON.stringify([userId, name]),
    signal: AbortSignal.timeout(30_000),
  });
  assert.equal(response.status, 200);
  return response.text();
}

async function request(path, jar = new Map(), body, origin = base) {
  const response = await fetch(`${base}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Origin: origin,
      Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";", 1)[0];
    const index = pair.indexOf("=");
    jar.set(pair.slice(0, index), pair.slice(index + 1));
  }
  assert.match(
    response.headers.get("content-type") ?? "",
    /application\/json/,
    `Non-JSON app response (${response.status}) at ${path.split("?")[0]}`,
  );
  const data = await response.json();
  return { response, data };
}

async function account() {
  const email = `solodesk-e2e-${randomUUID()}@example.com`;
  emails.push(email);
  const password = randomUUID() + randomUUID();
  const jar = new Map();
  const { response, data } = await request("/api/auth/sign-up/email", jar, {
    email,
    password,
    name: "Neon integration test",
  });
  assert.equal(
    response.status,
    200,
    `Signup failed: ${data.code ?? response.status}`,
  );
  assert.ok(data.user?.id, "Signup must return a user");
  const unverifiedCheck = await request(
    `/api/profile?userId=${data.user.id}`,
    jar,
  );
  assert.equal(
    unverifiedCheck.response.status,
    401,
    "Unverified user profile read must be denied (401)",
  );
  // Synthetic fixture only; preserve the branch policy and skip mailbox delivery.
  await pool.query(
    'UPDATE neon_auth."user" SET "emailVerified" = true WHERE id = $1 AND email = $2',
    [data.user.id, email],
  );
  const login = await request("/api/auth/sign-in/email", jar, {
    email,
    password,
  });
  assert.equal(
    login.response.status,
    200,
    `Fixture login failed: ${login.data.code ?? login.response.status}`,
  );
  return { jar, email, password, id: data.user.id };
}

try {
  const { rows } = await pool.query("SELECT 1 AS connected");
  assert.equal(rows[0].connected, 1);
  console.log("PASS Postgres: pooled TLS query");

  const anonymous = await request(`/api/profile?userId=${randomUUID()}`);
  assert.equal(anonymous.response.status, 401);
  assert.match(anonymous.response.headers.get("cache-control"), /no-store/);
  for (const provider of ["google", "github"]) {
    const oauth = await request("/api/auth/sign-in/social", new Map(), {
      provider,
      callbackURL: `${base}/auth/callback`,
      disableRedirect: true,
    });
    assert.equal(
      oauth.response.status,
      200,
      `${provider} OAuth initiation failed`,
    );
    const destination = new URL(oauth.data.url);
    assert.equal(destination.protocol, "https:");
    assert.equal(
      destination.origin,
      new URL(process.env.NEON_AUTH_BASE_URL).origin,
    );
    assert.ok(destination.pathname.endsWith("/sign-in/social/init"));
    console.log(
      `PASS OAuth: ${provider} managed sign-in initiated through app proxy`,
    );
  }
  const first = await account();
  const second = await account();
  console.log("PASS Auth: sign-up through app proxy (two isolated accounts)");

  const restored = await request(
    "/api/auth/get-session?disableCookieCache=true",
    first.jar,
  );
  assert.equal(restored.data.user.id, first.id);
  const foreign = await request(`/api/profile?userId=${second.id}`, first.jar);
  assert.equal(foreign.response.status, 401);
  const profile = await request(`/api/profile?userId=${first.id}`, first.jar);
  assert.equal(profile.response.status, 200);
  assert.deepEqual(profile.data.initialData, [
    { id: first.id, name: "Neon integration test" },
  ]);
  assert.ok(
    Date.parse(profile.data.sessionExpiresAt) > Date.now(),
    "Profile envelope must contain a future session expiry",
  );
  console.log(
    "PASS App: session restoration, protected Postgres read, cross-account denial",
  );

  const subscription = realtime.subscribe(profile.data.sealedQuery);
  await subscription.awaitRows(
    (data) => data.length === 1 && data[0].id === first.id,
    20_000,
  );
  console.log(
    "PASS Realtime: initial subscription from app-issued sealed query",
  );

  const csrf = await request(
    "/api/auth/update-user",
    first.jar,
    { name: "Must not be saved" },
    "https://untrusted.example",
  );
  assert.equal(csrf.response.status, 403);
  const name = `Live profile ${randomUUID().slice(0, 8)}`;
  assert.match(
    await saveName(second.id, "Must not be saved", first.jar),
    /unauthorized/,
  );
  assert.match(
    await saveName(first.id, "x".repeat(101), first.jar),
    /invalidName/,
  );
  assert.match(await saveName(first.id, name, first.jar), /"error":null/);
  await subscription.awaitRows((data) => data[0]?.name === name, 20_000);
  const saved = await pool.query(
    'SELECT name FROM neon_auth."user" WHERE id = $1',
    [first.id],
  );
  assert.equal(saved.rows[0].name, name);
  console.log(
    "PASS Realtime: committed profile update delivered live; Postgres confirms persistence",
  );
  console.log(
    "PASS Security: hostile origin, cross-account action, oversized name denied",
  );

  // Real database unverified status removes row from live query
  await pool.query(
    'UPDATE neon_auth."user" SET "emailVerified" = false WHERE id = $1',
    [first.id],
  );
  await subscription.awaitRows((data) => data.length === 0, 20_000);
  console.log(
    "PASS Realtime: unverified user row removed live from subscription",
  );
  await pool.query(
    'UPDATE neon_auth."user" SET "emailVerified" = true WHERE id = $1',
    [first.id],
  );
  await subscription.awaitRows(
    (data) => data.length === 1 && data[0].id === first.id,
    20_000,
  );

  const renew = await request(`/api/profile?userId=${first.id}`, first.jar);
  assert.equal(
    renew.data.sealedQuery.queryFingerprint,
    profile.data.sealedQuery.queryFingerprint,
  );
  subscription.renew(renew.data.sealedQuery);
  const oldCookies = new Map(first.jar);
  assert.equal(
    (await request("/api/auth/sign-out", first.jar, {})).response.status,
    200,
  );
  await subscription.awaitRows((data) => data.length === 0, 20_000);
  assert.equal(
    (await request(`/api/profile?userId=${first.id}`, oldCookies)).response
      .status,
    401,
  );
  console.log(
    "PASS Security: renewal, sign-out, live access removal, revoked-cookie replay denied",
  );

  const wrong = await request("/api/auth/sign-in/email", new Map(), {
    email: first.email,
    password: randomUUID(),
  });
  assert.ok(wrong.response.status >= 400);
  const login = await request("/api/auth/sign-in/email", first.jar, {
    email: first.email,
    password: first.password,
  });
  assert.equal(login.response.status, 200);
  assert.equal(
    (await request(`/api/profile?userId=${first.id}`, first.jar)).response
      .status,
    200,
  );
  console.log(
    "PASS Auth: wrong password rejected; sign-in restores protected access",
  );
} finally {
  realtime.close();
  // Only remove identities minted by this run; managed FK cascades remove their sessions/accounts.
  if (emails.length)
    await pool.query(
      'DELETE FROM neon_auth."user" WHERE email = ANY($1::text[])',
      [emails],
    );
  await pool.end();
  console.log("CLEANUP removed this run's synthetic accounts");
}

// shortcut: SDK timers can retain the process after cleanup, remove when SDK teardown drains them.
process.exit(0);
