import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import pg from "pg";
import { createOTP } from "@better-auth/utils/otp";
import { base32 } from "@better-auth/utils/base32";

// Explicit independently verified synthetic target; never loads .env.local.
const manifestPath = process.argv[2] === "--manifest" && process.argv[3];
assert.ok(
  manifestPath,
  "Use --manifest with an independently verified isolated target",
);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
assert.equal(manifest.environment, "isolated");
assert.ok(
  manifest.branchId &&
    manifest.verification &&
    !/prod|main/i.test(manifest.branchName),
);
const env = Object.fromEntries(
  readFileSync(manifest.envFile, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);
const connectionString = env.DATABASE_URL;
assert.equal(
  createHash("sha256").update(new URL(connectionString).hostname).digest("hex"),
  manifest.hostSha256,
);
const pool = new pg.Pool({
  connectionString,
  max: 10,
  connectionTimeoutMillis: 10000,
  statement_timeout: 15000,
});
const origin = "http://localhost:4338";
const password = "Synthetic account fixture " + randomUUID();
const emails = [];
let checks = 0;
try {
  const { rows } = await pool.query(
    'SELECT count(*)::int AS n FROM neon_auth."user"',
  );
  assert.equal(
    rows[0].n,
    0,
    "Schema-only branch must contain no managed identities",
  );
  const applied = await pool.query(
    "SELECT to_regclass('solodesk_auth.user') AS table_name",
  );
  if (!applied.rows[0].table_name) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        readFileSync(
          new URL("../migrations/005-app-auth.sql", import.meta.url),
          "utf8",
        ),
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  const guarded = await pool.query(
    "SELECT to_regprocedure('solodesk_auth.keep_sign_in_route()') AS fn",
  );
  if (!guarded.rows[0].fn)
    await pool.query(
      readFileSync(
        new URL("../migrations/006-auth-last-sign-in.sql", import.meta.url),
        "utf8",
      ),
    );
  await build({
    entryPoints: ["lib/auth/app-auth.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    outfile: ".next/app-auth-test.mjs",
  });
  const { createAppAuth } = await import(
    pathToFileURL(process.cwd() + "/.next/app-auth-test.mjs")
  );
  const auth = createAppAuth({
    pool,
    origin,
    secret: "synthetic-fixture-secret-not-used-for-any-real-user-008",
    sendMail: async (message) => emails.push(message),
  });
  const jar = new Map();
  async function request(path, body, cookies = jar, headers = {}) {
    const response = await auth.handler(
      new Request(origin + "/api/auth" + path, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          Origin: origin,
          Cookie: [...cookies].map(([k, v]) => k + "=" + v).join("; "),
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    );
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";", 1)[0],
        i = pair.indexOf("=");
      cookies.set(pair.slice(0, i), pair.slice(i + 1));
    }
    const data = await response.json();
    return { status: response.status, data };
  }
  async function success(path, body, cookies = jar, headers = {}) {
    const result = await request(path, body, cookies, headers);
    assert.ok(
      result.status >= 200 && result.status < 300,
      path + " failed: " + result.status + " " + (result.data.code || ""),
    );
    checks++;
    return result.data;
  }
  const email = "auth008-" + randomUUID() + "@example.test";
  const registered = await success("/sign-up/email", {
    email,
    password,
    name: "Synthetic auth owner",
  });
  assert.equal(registered.user.emailVerified, false);
  checks++;
  const verification = emails.find(
    (x) => x.email === email && x.purpose === "email-verification",
  );
  assert.match(verification.code, /^\d{6}$/);
  checks++;
  await success("/email-otp/verify-email", { email, otp: verification.code });
  await success("/sign-in/email", { email, password });
  const own = await success("/get-session");
  assert.equal(own.user.id, registered.user.id);
  checks++;
  const status = await success("/security/status");
  assert.equal(status.state, "ready");
  assert.equal(status.factorEnabled, false);
  checks++;
  async function authorized(path, body) {
    const { proof } = await success("/security/confirm", {
      action: path,
      body,
      password,
    });
    return success(path, body, jar, { "x-solodesk-action-proof": proof });
  }
  const setup = await authorized("/two-factor/enable", {
    password,
    method: "totp",
  });
  assert.equal(setup.backupCodes.length, 10);
  checks++;
  const uri = new URL(setup.totpURI);
  const rawSecret = new TextDecoder().decode(
    base32.decode(uri.searchParams.get("secret")),
  );
  const code = await createOTP(rawSecret, { period: 30, digits: 6 }).totp();
  await success("/two-factor/verify-totp", { code });
  const pending = await success("/security/status");
  assert.equal(pending.factorEnabled, true);
  assert.equal(pending.recoveryAcknowledged, false);
  checks++;
  const beforeAck = await request("/get-session");
  assert.equal(beforeAck.status, 403);
  checks++;
  await success("/security/acknowledge", {
    generation: pending.recoveryGeneration,
    saved: true,
  });
  const accepted = await success("/get-session");
  assert.equal(accepted.user.twoFactorEnabled, true);
  checks++;
  const oldJar = new Map(jar);
  await success("/sign-out", {});
  const primary = await success("/sign-in/email", { email, password });
  assert.equal(primary.twoFactorRedirect, true);
  checks++;
  const denied = await request("/get-session");
  assert.ok(denied.status === 403 || !denied.data?.user);
  checks++;
  const replay = await request("/two-factor/verify-totp", { code });
  assert.ok(
    replay.status >= 400,
    "A previously accepted TOTP cannot be replayed",
  );
  checks++;
  await success("/two-factor/verify-backup-code", {
    code: setup.backupCodes[0],
  });
  const recovery = await success("/security/status");
  assert.equal(recovery.state, "recovery");
  checks++;
  const limited = await request("/get-session");
  assert.equal(limited.status, 403);
  checks++;
  const revoked = await request("/get-session", undefined, oldJar);
  assert.ok(!revoked.data?.user);
  checks++;
  const lost = await request("/two-factor/verify-backup-code", {
    code: setup.backupCodes[0],
  });
  assert.ok(lost.status >= 400);
  checks++;
  const replacement = await authorized("/two-factor/enable", {
    password,
    method: "totp",
  });
  const replacementSecret = new TextDecoder().decode(
    base32.decode(new URL(replacement.totpURI).searchParams.get("secret")),
  );
  await success("/two-factor/verify-totp", {
    code: await createOTP(replacementSecret, { period: 30, digits: 6 }).totp(),
  });
  const replacementStatus = await success("/security/status");
  const complete = await success("/security/acknowledge", {
    generation: replacementStatus.recoveryGeneration,
    saved: true,
  });
  assert.equal(complete.requiresSignIn, true);
  checks++;
  const ended = await request("/get-session");
  assert.ok(!ended.data?.user);
  checks++;
  const signedOut = await success("/security/status");
  assert.equal(signedOut.state, "signed-out");
  checks++;
  await success("/sign-in/email", { email, password });
  const finalChallenge = await success("/security/status");
  assert.equal(finalChallenge.state, "challenge");
  checks++;
  await assert.rejects(
    pool.query('DELETE FROM solodesk_auth.account WHERE "userId"=$1', [
      registered.user.id,
    ]),
    (e) => e.code === "23514",
  );
  checks++;
  console.log(
    JSON.stringify({
      result: "PASS",
      checks,
      scope:
        "Actual Better Auth + isolated Neon PostgreSQL: verification/password/TOTP enrollment/acknowledgement/challenge/replay denial/recovery-only/session revocation",
      branch: manifest.branchName,
    }),
  );
} catch (error) {
  console.error(
    "FAIL: app-auth integration after " + checks + " checks: " + error.message,
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
