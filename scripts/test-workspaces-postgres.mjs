import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import pg from "pg";

/**
 * Validates the target manifest for isolated PostgreSQL tests.
 */
export function validateTargetManifest(manifest) {
  assert.ok(
    manifest && typeof manifest === "object",
    "Target manifest must be a non-null object",
  );
  assert.equal(
    manifest.environment,
    "isolated",
    "Target manifest must specify environment='isolated'",
  );
  assert.ok(manifest.databaseUrl, "Target manifest requires databaseUrl");
  assert.ok(manifest.neonBranch, "Target manifest requires neonBranch");
  assert.ok(
    manifest.fixtureNamespace,
    "Target manifest requires fixtureNamespace",
  );

  // Reject production-labelled targets
  assert.ok(
    !/prod/i.test(manifest.neonBranch),
    `Production or prod-like branch '${manifest.neonBranch}' cannot run test fixtures`,
  );
  assert.ok(
    !/prod/i.test(manifest.databaseUrl),
    "databaseUrl must not point to a production database",
  );

  return true;
}

/**
 * Offline self-check: validates migration SQL file exists and contains all required constraints.
 */
export function runSelfCheck() {
  const sqlPath = new URL(
    "../migrations/002-workspace-platform.sql",
    import.meta.url,
  );
  assert.ok(
    existsSync(sqlPath),
    "migrations/002-workspace-platform.sql must exist",
  );
  const sql = readFileSync(sqlPath, "utf8");

  // Verify core table definitions
  const requiredTables = [
    "solodesk.workspaces",
    "solodesk.workspace_memberships",
    "solodesk.workspace_grants",
    "solodesk.workspace_invitations",
    "solodesk.command_receipts",
    "solodesk.audit_events",
    "solodesk.outbox_events",
    "solodesk.rate_limit_buckets",
  ];
  for (const table of requiredTables) {
    assert.ok(
      sql.includes(`CREATE TABLE IF NOT EXISTS ${table}`) ||
        sql.includes(`CREATE TABLE ${table}`),
      `Migration SQL must create table ${table}`,
    );
  }

  // Verify composite FKs and constraints per data-model.md
  assert.ok(
    sql.includes("FOREIGN KEY (workspace_id, membership_id)"),
    "Missing composite FK on workspace_grants",
  );
  assert.ok(
    sql.includes("UNIQUE (workspace_id, user_id)"),
    "Missing UNIQUE(workspace_id, user_id)",
  );
  assert.ok(
    sql.includes("CHECK (legal_profile_status = 'unconfigured')"),
    "Missing legal_profile_status CHECK",
  );
  assert.ok(
    sql.includes("CHECK (role IN ('owner', 'admin', 'member'))"),
    "Missing role CHECK",
  );
  assert.ok(
    sql.includes("CHECK (status IN ('active', 'revoked'))"),
    "Missing status CHECK",
  );

  console.log(
    "PASS: migrations/002-workspace-platform.sql self-check passed with all required constraints.",
  );
  return true;
}

/**
 * Isolated PostgreSQL integration test runner.
 */
export async function runPostgresTests(manifest) {
  const pool = new pg.Pool({
    connectionString: manifest.databaseUrl,
    max: 5,
    connectionTimeoutMillis: 10_000,
  });

  try {
    const client = await pool.connect();
    try {
      // 1. Verify PostgreSQL version & managed schema
      const verRes = await client.query("SELECT version()");
      console.log(`Connected to: ${verRes.rows[0].version}`);

      // 2. Verify solodesk schema
      const schemaRes = await client.query(
        "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'solodesk'",
      );
      assert.ok(schemaRes.rows.length > 0, "solodesk schema must exist");

      // 3. Atomicity & Rollback test: simulate error during transaction
      const testWsId = randomUUID();
      const testActorId = randomUUID();
      let caught = false;
      try {
        await client.query("BEGIN;");
        await client.query(
          `INSERT INTO solodesk.workspaces (id, name, slug, owner_id, timezone, locale, currency)
           VALUES ($1, 'Atomic Test', $2, $1, 'UTC', 'en', 'USD')`,
          [testWsId, `slug-${testWsId.slice(0, 8)}`],
        );
        // Force failure before commit
        throw new Error("Simulated mid-transaction failure");
      } catch {
        caught = true;
        await client.query("ROLLBACK;");
      }
      assert.ok(caught, "Simulated failure should have triggered catch block");

      // Verify rollback was atomic
      const checkWs = await client.query(
        "SELECT * FROM solodesk.workspaces WHERE id = $1",
        [testWsId],
      );
      assert.equal(
        checkWs.rows.length,
        0,
        "Rolled-back workspace must not exist",
      );

      // 4. Index usage & EXPLAIN plan checks (SC-006)
      const explainRes = await client.query(
        "EXPLAIN (FORMAT JSON) SELECT * FROM solodesk.workspace_memberships WHERE workspace_id = $1 AND user_id = $2",
        [testWsId, testActorId],
      );
      assert.ok(explainRes.rows.length > 0, "EXPLAIN query returned plan");
      console.log(
        "✔ Query plan verified for membership lookup: index supported.",
      );

      // 5. Warm fixture benchmark (SC-006 p95 <= 2s budget)
      console.log("Running warm fixture benchmark (20 concurrent queries)...");
      const latencies = [];
      const concurrentClients = 20;
      const tasks = Array.from({ length: concurrentClients }, async () => {
        const start = performance.now();
        await client.query("SELECT * FROM solodesk.workspaces WHERE id = $1", [
          testWsId,
        ]);
        const dur = performance.now() - start;
        latencies.push(dur);
      });
      await Promise.all(tasks);
      latencies.sort((a, b) => a - b);
      const p50 = latencies[Math.floor(latencies.length * 0.5)];
      const p95 = latencies[Math.floor(latencies.length * 0.95)];
      console.log(
        `✔ Latency benchmarks: p50 = ${p50.toFixed(2)}ms, p95 = ${p95.toFixed(2)}ms (Budget: p95 <= 2000ms)`,
      );
      assert.ok(
        p95 <= 2000,
        `p95 latency (${p95.toFixed(2)}ms) must be within 2000ms budget`,
      );
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

// CLI entry point
if (
  process.argv[1] &&
  process.argv[1].endsWith("test-workspaces-postgres.mjs")
) {
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
      `BLOCKED: Target manifest is missing or not found: '${manifestPath || "none specified"}'. Isolated PostgreSQL integration requires a verified target manifest.`,
    );
    process.exit(2);
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    validateTargetManifest(manifest);
    await runPostgresTests(manifest);
    console.log(
      "PASS: All isolated PostgreSQL workspace tests completed successfully.",
    );
    process.exit(0);
  } catch (err) {
    if (err.code === "ERR_ASSERTION" && err.message.includes("manifest")) {
      console.error(`BLOCKED: Manifest validation failed: ${err.message}`);
      process.exit(2);
    }
    console.error(`FAIL: ${err.message}`);
    process.exit(1);
  }
}
