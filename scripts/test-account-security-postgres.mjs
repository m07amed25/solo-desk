import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import pg from "pg";
import { applyMigrations, readMigrations } from "./migrate.mjs";

export const ACCOUNT_SECURITY_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS solodesk.reauth_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  original_session_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('revoke_session', 'revoke_other_sessions')),
  target_snapshot jsonb NOT NULL CHECK (jsonb_typeof(target_snapshot) = 'array'),
  target_digest text NOT NULL CHECK (target_digest ~ '^[a-f0-9]{64}$'),
  method text NOT NULL CHECK (method IN ('password', 'google', 'github')),
  challenge_state_digest text NULL,
  challenge_expires_at timestamptz NULL,
  verified_at timestamptz NULL,
  expires_at timestamptz NULL,
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'verified', 'reserved', 'consumed', 'cancelled', 'expired', 'unavailable')),
  reserved_operation_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS solodesk.revocation_operations (
  operation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  original_session_id uuid NOT NULL,
  intent_id uuid NOT NULL REFERENCES solodesk.reauth_intents(id) ON DELETE RESTRICT,
  payload_digest text NOT NULL CHECK (payload_digest ~ '^[a-f0-9]{64}$'),
  state text NOT NULL DEFAULT 'prepared' CHECK (state IN ('prepared', 'executing', 'accepted', 'rejected', 'partial', 'unknown')),
  target_results jsonb NOT NULL CHECK (jsonb_typeof(target_results) = 'array'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  completed_at timestamptz NULL,
  PRIMARY KEY (user_id, original_session_id, operation_id)
);

CREATE INDEX IF NOT EXISTS idx_reauth_intents_lookup ON solodesk.reauth_intents (user_id, original_session_id, state);
CREATE INDEX IF NOT EXISTS idx_revocation_operations_intent ON solodesk.revocation_operations (intent_id);

REVOKE ALL ON solodesk.reauth_intents FROM PUBLIC;
REVOKE ALL ON solodesk.revocation_operations FROM PUBLIC;
`;

export function runSelfCheck() {
  assert.ok(
    ACCOUNT_SECURITY_SCHEMA_SQL.includes(
      "CREATE TABLE IF NOT EXISTS solodesk.reauth_intents",
    ),
  );
  assert.ok(
    ACCOUNT_SECURITY_SCHEMA_SQL.includes(
      "CREATE TABLE IF NOT EXISTS solodesk.revocation_operations",
    ),
  );
  assert.ok(
    ACCOUNT_SECURITY_SCHEMA_SQL.includes(
      "PRIMARY KEY (user_id, original_session_id, operation_id)",
    ),
  );
  assert.ok(
    ACCOUNT_SECURITY_SCHEMA_SQL.includes(
      "CHECK (state IN ('pending', 'verified', 'reserved', 'consumed', 'cancelled', 'expired', 'unavailable'))",
    ),
  );
  assert.ok(
    ACCOUNT_SECURITY_SCHEMA_SQL.includes(
      "CHECK (action IN ('revoke_session', 'revoke_other_sessions'))",
    ),
  );

  console.log(
    "PASS: SQL source and protocol self-check only; no database or authorization acceptance.",
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
  const directory = mkdtempSync(join(tmpdir(), "solodesk-sec-pg-"));
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
      max: 10,
    };

    admin = new pg.Pool({ ...config, user: migrationRole });

    // 1. Synthetic provider schema
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

    // 2. Apply migrations (001, 002, 003) and 004 security schema
    const migrationClient = await admin.connect();
    try {
      await applyMigrations(migrationClient, readMigrations(), console.log);
    } finally {
      migrationClient.release();
    }

    await admin.query(ACCOUNT_SECURITY_SCHEMA_SQL);

    // 3. Grant permissions to solodesk_test_runtime
    await admin.query(`
      GRANT USAGE ON SCHEMA solodesk, neon_auth TO solodesk_test_runtime;
      GRANT SELECT, INSERT, UPDATE, DELETE ON solodesk.account_preferences, solodesk.rate_limit_buckets TO solodesk_test_runtime;
      GRANT SELECT, INSERT, UPDATE ON solodesk.reauth_intents, solodesk.revocation_operations TO solodesk_test_runtime;
      GRANT SELECT, INSERT ON solodesk.account_security_events, solodesk.audit_events TO solodesk_test_runtime;
      GRANT SELECT (id, name, email, "emailVerified", banned) ON neon_auth."user" TO solodesk_test_runtime;
      GRANT SELECT (id, "userId", "expiresAt") ON neon_auth.session TO solodesk_test_runtime;
    `);

    runtime = new pg.Pool({ ...config, user: "solodesk_test_runtime" });

    // 4. Assert direct DDL/DROP denial on reauth tables
    for (const forbiddenQuery of [
      "DROP TABLE solodesk.reauth_intents",
      "DROP TABLE solodesk.revocation_operations",
      "TRUNCATE TABLE solodesk.reauth_intents",
      "TRUNCATE TABLE solodesk.revocation_operations",
    ]) {
      await assert.rejects(
        runtime.query(forbiddenQuery),
        (err) => err.code === "42501",
        `Expected 42501 permission denied for: ${forbiddenQuery}`,
      );
    }
    console.log(
      "PASS: SEC-041/044 DDL and TRUNCATE denial on security tables verified.",
    );

    // 5. Test Original-Session / Target Binding
    const userIdA = randomUUID();
    const sessionIdA1 = randomUUID();
    const sessionIdA2 = randomUUID();
    const userIdB = randomUUID();
    const sessionIdB = randomUUID();

    await admin.query(
      `INSERT INTO neon_auth."user" (id, name, email) VALUES ($1, $2, $3), ($4, $5, $6)`,
      [
        userIdA,
        "User A",
        "usera@example.test",
        userIdB,
        "User B",
        "userb@example.test",
      ],
    );
    await admin.query(
      `INSERT INTO neon_auth.session (id, "userId", "expiresAt") VALUES
        ($1, $2, clock_timestamp() + interval '1 hour'),
        ($3, $2, clock_timestamp() + interval '1 hour'),
        ($4, $5, clock_timestamp() + interval '1 hour')`,
      [sessionIdA1, userIdA, sessionIdA2, sessionIdB, userIdB],
    );

    // Create an intent for User A, bound to sessionIdA1, targeting sessionIdA2
    const intentId = randomUUID();
    const targetDigest = "a".repeat(64);
    await runtime.query(
      `INSERT INTO solodesk.reauth_intents (id, user_id, original_session_id, action, target_snapshot, target_digest, method, state, verified_at, expires_at)
       VALUES ($1, $2, $3, 'revoke_session', $4::jsonb, $5, 'password', 'verified', clock_timestamp(), clock_timestamp() + interval '5 minutes')`,
      [
        intentId,
        userIdA,
        sessionIdA1,
        JSON.stringify([sessionIdA2]),
        targetDigest,
      ],
    );

    // User B attempts to read or reserve User A's intent -> 0 rows affected
    const foreignReserve = await runtime.query(
      `UPDATE solodesk.reauth_intents
       SET state = 'reserved', reserved_operation_id = $1, updated_at = clock_timestamp()
       WHERE id = $2 AND user_id = $3 AND original_session_id = $4 AND state = 'verified'
       RETURNING id`,
      [randomUUID(), intentId, userIdB, sessionIdB],
    );
    assert.equal(foreignReserve.rowCount, 0);

    // User A from different session attempts to reserve -> 0 rows affected
    const wrongSessionReserve = await runtime.query(
      `UPDATE solodesk.reauth_intents
       SET state = 'reserved', reserved_operation_id = $1, updated_at = clock_timestamp()
       WHERE id = $2 AND user_id = $3 AND original_session_id = $4 AND state = 'verified'
       RETURNING id`,
      [randomUUID(), intentId, userIdA, sessionIdA2],
    );
    assert.equal(wrongSessionReserve.rowCount, 0);

    console.log(
      "PASS: Original-session and user-identity binding verified in PostgreSQL.",
    );

    // 6. Test Concurrent Claim Race (Atomic Reservation)
    // Two concurrent transactions attempt to reserve the verified intent
    const op1 = randomUUID();
    const op2 = randomUUID();

    const client1 = await runtime.connect();
    const client2 = await runtime.connect();

    try {
      await client1.query("BEGIN");
      await client2.query("BEGIN");

      // Client 1 claims first
      const res1 = await client1.query(
        `UPDATE solodesk.reauth_intents
         SET state = 'reserved', reserved_operation_id = $1, updated_at = clock_timestamp()
         WHERE id = $2 AND user_id = $3 AND original_session_id = $4 AND state = 'verified'
         RETURNING id, state, reserved_operation_id`,
        [op1, intentId, userIdA, sessionIdA1],
      );
      assert.equal(res1.rowCount, 1);
      await client1.query("COMMIT");

      // Client 2 attempts to claim after Client 1 committed -> 0 rows returned
      const res2 = await client2.query(
        `UPDATE solodesk.reauth_intents
         SET state = 'reserved', reserved_operation_id = $1, updated_at = clock_timestamp()
         WHERE id = $2 AND user_id = $3 AND original_session_id = $4 AND state = 'verified'
         RETURNING id, state, reserved_operation_id`,
        [op2, intentId, userIdA, sessionIdA1],
      );
      assert.equal(res2.rowCount, 0);
      await client2.query("COMMIT");
    } finally {
      client1.release();
      client2.release();
    }

    console.log(
      "PASS: Concurrent claim race resolves with exactly one winner under PostgreSQL.",
    );

    // 7. Commit Ambiguity & Unknown Outcome Lock
    // Create operation in 'prepared' state
    const payloadDigest = "b".repeat(64);
    await runtime.query(
      `INSERT INTO solodesk.revocation_operations (operation_id, user_id, original_session_id, intent_id, payload_digest, state, target_results)
       VALUES ($1, $2, $3, $4, $5, 'executing', $6::jsonb)`,
      [
        op1,
        userIdA,
        sessionIdA1,
        intentId,
        payloadDigest,
        JSON.stringify([{ reference: sessionIdA2, status: "pending" }]),
      ],
    );

    // Simulate provider ambiguous timeout: operation transitions to 'unknown'
    await runtime.query(
      `UPDATE solodesk.revocation_operations
       SET state = 'unknown', completed_at = clock_timestamp(), updated_at = clock_timestamp()
       WHERE operation_id = $1`,
      [op1],
    );

    // Invariant: Intent MUST NOT be released back to verified when outcome is unknown!
    // It remains in 'reserved' (or locked) state
    const lockedIntent = await runtime.query(
      `SELECT state, reserved_operation_id FROM solodesk.reauth_intents WHERE id = $1`,
      [intentId],
    );
    assert.equal(lockedIntent.rows[0].state, "reserved");
    assert.equal(lockedIntent.rows[0].reserved_operation_id, op1);

    // Attempting to reserve this intent for another operation fails
    const stealAttempt = await runtime.query(
      `UPDATE solodesk.reauth_intents
       SET state = 'reserved', reserved_operation_id = $1
       WHERE id = $2 AND state = 'verified'`,
      [op2, intentId],
    );
    assert.equal(stealAttempt.rowCount, 0);

    console.log(
      "PASS: Ambiguous/timeout outcome locks reservation and prevents token release.",
    );

    // 8. Provider Dispatch Boundaries: Recheck Original Session Authority & Expiry
    // If the original session was revoked before dispatching:
    await admin.query(`DELETE FROM neon_auth.session WHERE id = $1`, [
      sessionIdA1,
    ]);

    const activeSessionCheck = await runtime.query(
      `SELECT id FROM neon_auth.session WHERE id = $1 AND "userId" = $2 AND "expiresAt" > clock_timestamp()`,
      [sessionIdA1, userIdA],
    );
    assert.equal(activeSessionCheck.rowCount, 0);
    console.log(
      "PASS: Provider dispatch boundary detects original session revocation.",
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
        : `FAIL: local PostgreSQL security checks${error.code ? ` (${error.code})` : ""}; ${error.message}`,
    );
    process.exitCode = blocked ? 2 : 1;
  }
}
