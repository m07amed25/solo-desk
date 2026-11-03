import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import pg from "pg";
import { applyMigrations, readMigrations } from "./migrate.mjs";

function loadAccountModule(path, adapters = {}) {
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
      if (name === "@/lib/site") {
        return {
          isLocale: (v) => v === "en" || v === "ar",
        };
      }
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
      throw new Error(`Unexpected test dependency: ${name}`);
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
      env: {},
    },
  });
  return exports;
}

export function runSelfCheck() {
  const sql003 = readFileSync(
    new URL("../migrations/003-account-completion.sql", import.meta.url),
    "utf8",
  );

  assert.ok(sql003.includes("CREATE TABLE solodesk.account_preferences"));
  assert.ok(sql003.includes("CREATE TABLE solodesk.account_security_events"));
  assert.ok(sql003.includes("CHECK (locale IN ('en', 'ar'))"));
  assert.ok(sql003.includes("revision bigint NOT NULL DEFAULT 1"));
  assert.ok(
    sql003.includes("optional_account_email boolean NOT NULL DEFAULT false"),
  );
  assert.ok(
    sql003.includes("REVOKE ALL ON solodesk.account_preferences FROM PUBLIC"),
  );
  assert.ok(
    sql003.includes(
      "REVOKE ALL ON solodesk.account_security_events FROM PUBLIC",
    ),
  );

  console.log(
    "PASS: SQL source self-check only; no database or authorization acceptance.",
  );
}

export function validateTargetManifest(manifestPath) {
  if (!manifestPath) {
    throw new Error(
      "BLOCKED: Remote target isolation is not independently verified (Gate G5); use --local for disposable PostgreSQL evidence only.",
    );
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (err) {
    throw new Error(`BLOCKED: Failed to read target manifest: ${err.message}`);
  }

  if (manifest.environment !== "isolated") {
    throw new Error(
      `BLOCKED: Target environment must be 'isolated', got '${manifest.environment}'`,
    );
  }
  if (!manifest.neonBranch || /prod|main/i.test(manifest.neonBranch)) {
    throw new Error(
      `BLOCKED: Non-isolated or production branch detected: '${manifest.neonBranch}'`,
    );
  }
  if (
    !manifest.webhookSinkId ||
    !/(?:sink-synth|solodesk-(?:sink|synthetic)-[a-z0-9-]+|synthetic-sink)/i.test(
      manifest.webhookSinkId,
    )
  ) {
    throw new Error(
      `BLOCKED: Webhook sink '${manifest.webhookSinkId}' does not match synthetic pattern`,
    );
  }
  if (
    !manifest.fixtureNamespace ||
    !manifest.fixtureNamespace.startsWith("solodesk-synthetic-")
  ) {
    throw new Error(
      `BLOCKED: Fixture namespace '${manifest.fixtureNamespace}' must start with 'solodesk-synthetic-'`,
    );
  }
  if (
    !manifest.sampleAccount ||
    !manifest.sampleAccount.endsWith("@example.com")
  ) {
    throw new Error(
      `BLOCKED: Sample account '${manifest.sampleAccount}' must use synthetic domain '@example.com'`,
    );
  }
  if (!manifest.authorizationToken || manifest.authorizationToken.length < 16) {
    throw new Error(
      "BLOCKED: Missing or insufficient authorizationToken in target manifest",
    );
  }

  return manifest;
}

export async function runLocalPostgresTests() {
  const bindir = execFileSync("pg_config", ["--bindir"], {
    encoding: "utf8",
  }).trim();
  const directory = mkdtempSync(join(tmpdir(), "solodesk-account-pg-"));
  const data = join(directory, "data");
  const migrationRole = "solodesk_test_migration";

  execFileSync(
    join(bindir, "initdb"),
    [
      "-D",
      data,
      "-U",
      migrationRole,
      "--auth-local=trust",
      "--auth-host=reject",
      "--no-locale",
    ],
    { stdio: "pipe" },
  );

  let started = false;
  let admin, runtime;

  try {
    execFileSync(
      join(bindir, "pg_ctl"),
      [
        "-D",
        data,
        "-l",
        join(directory, "server.log"),
        "-o",
        `-F -k ${directory} -h ''`,
        "-w",
        "start",
      ],
      { stdio: "pipe" },
    );
    started = true;

    const config = {
      host: directory,
      database: "postgres",
      connectionTimeoutMillis: 5000,
      max: 5,
    };

    admin = new pg.Pool({ ...config, user: migrationRole });
    const before = await admin.query(
      "SELECT version(), current_database(), current_user, to_regnamespace('neon_auth') as auth_schema, to_regnamespace('solodesk') as application_schema",
    );
    assert.equal(before.rows[0].auth_schema, null);
    assert.equal(before.rows[0].application_schema, null);
    console.log(
      `LOCAL: ${before.rows[0].version}; independently initialized empty Unix-socket cluster, no TCP listener.`,
    );

    // 1. Synthetic provider schema exists only in this temporary test cluster; never a managed migration.
    await admin.query(`
      CREATE SCHEMA neon_auth;
      CREATE TABLE neon_auth."user" (
        id uuid PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL,
        "emailVerified" boolean NOT NULL DEFAULT true,
        banned boolean NOT NULL DEFAULT false,
        password_hash text
      );
      CREATE TABLE neon_auth.session (
        id uuid PRIMARY KEY,
        "userId" uuid NOT NULL REFERENCES neon_auth."user",
        "expiresAt" timestamptz NOT NULL,
        token text
      );
      CREATE ROLE solodesk_test_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
      REVOKE CREATE ON SCHEMA public FROM PUBLIC;
    `);

    // 2. Apply migrations (001, 002, 003)
    const migrationClient = await admin.connect();
    try {
      await applyMigrations(migrationClient, readMigrations(), console.log);
    } finally {
      migrationClient.release();
    }

    // 3. Grant strict least-privilege permissions to solodesk_test_runtime
    await admin.query(`
      GRANT USAGE ON SCHEMA solodesk, neon_auth TO solodesk_test_runtime;
      GRANT SELECT, INSERT, UPDATE, DELETE ON solodesk.account_preferences, solodesk.rate_limit_buckets TO solodesk_test_runtime;
      GRANT SELECT, INSERT ON solodesk.account_security_events, solodesk.audit_events TO solodesk_test_runtime;
      GRANT SELECT (id, name, email, "emailVerified", banned) ON neon_auth."user" TO solodesk_test_runtime;
      GRANT SELECT (id, "userId", "expiresAt") ON neon_auth.session TO solodesk_test_runtime;
    `);

    runtime = new pg.Pool({ ...config, user: "solodesk_test_runtime" });

    // Load account modules with runtime pool adapter
    let activeAccountSession = null;
    const accountMod = loadAccountModule("../lib/account.ts", {
      "@/lib/db": runtime,
      "@/lib/auth/server": {
        currentSession: async () => activeAccountSession,
      },
    });
    const localeMod = loadAccountModule("../lib/account-locale.ts", {
      "@/lib/db": runtime,
    });

    const {
      getAccountPreferences,
      saveAccountPreferences,
      withAccountTransaction,
      AccountError,
    } = accountMod;
    const { getAccountLocaleByUserId, resolvePresentationLocale } = localeMod;

    // 4. Assert role attributes: NOSUPERUSER, NOBYPASSRLS
    const roleAttrs = await runtime.query(
      "SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user",
    );
    assert.deepEqual(roleAttrs.rows[0], {
      rolsuper: false,
      rolbypassrls: false,
    });

    // 5. Assert direct protected identity, session, and DDL denial (SEC-041/043/044/048)
    for (const forbiddenQuery of [
      'SELECT password_hash FROM neon_auth."user"',
      "SELECT token FROM neon_auth.session",
      "CREATE TABLE solodesk.forbidden (id int)",
      "DROP TABLE solodesk.account_preferences",
      "DROP TABLE solodesk.account_security_events",
      "TRUNCATE TABLE solodesk.account_security_events",
      "DELETE FROM solodesk.account_security_events",
      "UPDATE solodesk.account_security_events SET action = 'forged'",
      "TRUNCATE TABLE solodesk.audit_events",
      "DELETE FROM solodesk.audit_events",
      "UPDATE solodesk.audit_events SET action = 'forged'",
    ]) {
      await assert.rejects(
        runtime.query(forbiddenQuery),
        (err) => err.code === "42501",
        `Expected 42501 permission denied for: ${forbiddenQuery}`,
      );
    }
    console.log(
      "PASS: SEC-041/043/044/048 direct protected identity, session, and DDL denial verified.",
    );

    // 6. Test Default & Account-Locale Reads and Presentation Resolution
    const user1 = randomUUID();
    const user2 = randomUUID();

    await admin.query(
      `INSERT INTO neon_auth."user" (id, name, email) VALUES ($1, $2, $3), ($4, $5, $6)`,
      [
        user1,
        "Synth User One",
        "synth1@example.test",
        user2,
        "Synth User Two",
        "synth2@example.test",
      ],
    );

    const session1 = {
      userId: user1,
      sessionId: randomUUID(),
      email: "synth1@example.test",
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };

    const session2 = {
      userId: user2,
      sessionId: randomUUID(),
      email: "synth2@example.test",
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };

    await admin.query(
      `INSERT INTO neon_auth.session (id, "userId", "expiresAt") VALUES ($1, $2, $3), ($4, $5, $6)`,
      [
        session1.sessionId,
        user1,
        session1.expiresAt,
        session2.sessionId,
        user2,
        session2.expiresAt,
      ],
    );
    const asSession = (session) => ({
      user: {
        id: session.userId,
        email: session.email,
        emailVerified: true,
        banned: false,
      },
      session: { id: session.sessionId, expiresAt: session.expiresAt },
    });
    activeAccountSession = asSession(session1);

    // For user1 without preferences row:
    const defaultPrefs = await getAccountPreferences(session1, runtime);
    assert.equal(defaultPrefs.isDefault, true);
    assert.equal(defaultPrefs.preferences.locale, null);
    assert.equal(defaultPrefs.preferences.timezone, "UTC");
    assert.equal(defaultPrefs.preferences.revision, "0");

    // Account locale resolution when no row exists:
    const noLocale = await getAccountLocaleByUserId(user1, runtime);
    assert.equal(noLocale, null);

    const fallbackLocale = await resolvePresentationLocale(
      null,
      user1,
      runtime,
    );
    assert.equal(fallbackLocale, "en");

    activeAccountSession = asSession(session2);
    const created = await saveAccountPreferences(
      session2,
      {
        expectedRevision: "0",
        locale: "ar",
        timezone: "Asia/Riyadh",
        optionalAccountEmail: true,
      },
      runtime,
    );
    assert.equal(created.preferences.locale, "ar");
    assert.equal(created.preferences.timezone, "Asia/Riyadh");
    assert.equal(created.preferences.optionalAccountEmail, true);
    assert.equal(created.preferences.revision, "1");

    // Read back via getAccountLocaleByUserId and resolvePresentationLocale
    const user2Locale = await getAccountLocaleByUserId(user2, runtime);
    assert.equal(user2Locale, "ar");

    const resolvedNoCookie = await resolvePresentationLocale(
      null,
      user2,
      runtime,
    );
    assert.equal(resolvedNoCookie, "ar");

    // Cookie precedence rule: presentation cookie overrides account preference
    const resolvedWithCookie = await resolvePresentationLocale(
      "en",
      user2,
      runtime,
    );
    assert.equal(resolvedWithCookie, "en");

    console.log(
      "PASS: Default and account-locale reads and cookie precedence verified against live PostgreSQL.",
    );

    // 7. Transaction Rollback & Concurrency / Revision CAS
    // Begin transaction, update, deliberately rollback
    await withAccountTransaction(async (client) => {
      await client.query(
        `UPDATE solodesk.account_preferences SET locale = 'en', revision = 99 WHERE user_id = $1::uuid`,
        [user2],
      );
      // Rollback by throwing
      throw new Error("TEST_ROLLBACK");
    }, runtime).catch((err) => {
      assert.equal(err.message, "TEST_ROLLBACK");
    });

    // Verify rollback preserved previous values
    const afterRollback = await getAccountPreferences(session2, runtime);
    assert.equal(afterRollback.preferences.locale, "ar");
    assert.equal(afterRollback.preferences.revision, "1");

    // Concurrent/Stale Revision conflict check
    await assert.rejects(
      saveAccountPreferences(
        session2,
        {
          expectedRevision: "0", // Stale! Current is "1"
          locale: "en",
          timezone: "UTC",
          optionalAccountEmail: false,
        },
        runtime,
      ),
      (err) =>
        err instanceof AccountError &&
        err.code === "CONFLICT" &&
        err.statusHttp === 409,
    );

    // Valid update with matching revision
    const updated = await saveAccountPreferences(
      session2,
      {
        expectedRevision: "1",
        locale: "en",
        timezone: "Europe/London",
        optionalAccountEmail: false,
      },
      runtime,
    );
    assert.equal(updated.preferences.revision, "2");
    assert.equal(updated.preferences.locale, "en");

    // 8. Pool reuse across sequential queries
    for (let i = 0; i < 5; i++) {
      const p = await getAccountPreferences(session2, runtime);
      assert.equal(p.preferences.revision, "2");
    }

    console.log(
      "PASS: Transaction rollback, revision CAS (HTTP 409), and connection pool reuse verified.",
    );
    console.log(
      "LIMIT: local PostgreSQL evidence only; remote Neon hosted G5 gate remains BLOCKED pending owner target provisioning.",
    );
  } finally {
    await Promise.allSettled([runtime?.end(), admin?.end()]);
    if (started) {
      execFileSync(
        join(bindir, "pg_ctl"),
        ["-D", data, "-m", "fast", "-w", "stop"],
        {
          stdio: "pipe",
        },
      );
    }
  }
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  try {
    if (process.argv.includes("--self-check")) {
      runSelfCheck();
    } else if (process.argv.length === 3 && process.argv[2] === "--local") {
      await runLocalPostgresTests();
    } else if (process.argv.includes("--manifest")) {
      const idx = process.argv.indexOf("--manifest");
      const manifestPath = process.argv[idx + 1];
      validateTargetManifest(manifestPath);
    } else {
      validateTargetManifest();
    }
  } catch (error) {
    const blocked = error.message?.startsWith("BLOCKED:");
    console.error(
      blocked
        ? error.message
        : `FAIL: local PostgreSQL checks${error.code ? ` (${error.code})` : ""}; ${error.message}`,
    );
    process.exitCode = blocked ? 2 : 1;
  }
}
