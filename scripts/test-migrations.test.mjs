import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { applyMigrations, migrationConnection, readMigrations } from "./migrate.mjs";

test("selection is ordered, deduplicated and limited to existing migration files", (t) => {
  const path = mkdtempSync(join(tmpdir(), "solodesk-migrations-"));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  for (const name of ["010-last.sql", "002-next.sql", "001-first.sql"])
    writeFileSync(join(path, name), "SELECT 1;");
  writeFileSync(join(path, "notes.md"), "Not executable");
  const directory = pathToFileURL(`${path}/`);
  const all = readMigrations([], directory);
  assert.deepEqual(all.map((entry) => entry.name), ["001-first.sql", "002-next.sql", "010-last.sql"]);
  assert.ok(all.every((entry) => entry.selected && /^[a-f0-9]{64}$/.test(entry.checksum)));
  const selected = readMigrations(["010", "001-first.sql", "001"], directory);
  assert.deepEqual(selected.filter((entry) => entry.selected).map((entry) => entry.name), ["001-first.sql", "010-last.sql"]);
  for (const invalid of ["999", "../001-first.sql", "--force"])
    assert.throws(() => readMigrations([invalid], directory), /Unknown or ambiguous/);
  writeFileSync(join(path, "001-conflict.sql"), "SELECT 2;");
  assert.throws(() => readMigrations(["001"], directory), /ambiguous/);
});

test("migration connections require a direct URL and retain certificate verification", () => {
  for (const invalid of [undefined, "", "https://example.com", "postgres://user:secret@ep-test-pooler.neon.tech/db", "postgres://user:secret@example.com/db?host=ep-test-pooler.neon.tech"])
    assert.throws(() => migrationConnection(invalid), /DATABASE_URL_UNPOOLED/);
  const config = migrationConnection("postgres://user:synthetic@example.com/db?sslmode=require");
  assert.equal(new URL(config.connectionString).searchParams.get("sslmode"), "verify-full");
});

const migration = { name: "001-test.sql", sql: "CREATE TABLE example (id int)", checksum: "a".repeat(64), selected: true };
function database(rows = [], failOn) {
  const calls = [];
  return {
    calls,
    async query(sql, params) {
      calls.push({ sql, params });
      if (sql === failOn) throw new Error("Synthetic database failure");
      return { rows: sql.startsWith("SELECT name, checksum") ? rows : [] };
    },
  };
}

test("migration SQL and checksum commit together after acquiring the runner lock", async () => {
  const client = database();
  const logs = [];
  await applyMigrations(client, [migration], (message) => logs.push(message));
  const calls = client.calls;
  assert.match(calls[1].sql, /pg_advisory_lock/);
  assert.deepEqual(calls.slice(-4).map((call) => call.sql), ["BEGIN", migration.sql, "INSERT INTO public.solodesk_schema_migrations (name, checksum) VALUES ($1, $2)", "COMMIT"]);
  assert.deepEqual(calls.at(-2).params, [migration.name, migration.checksum]);
  assert.equal(logs.at(-1), `Applied ${migration.name}`);
});

test("applied files are skipped and changed or missing history stops before new effects", async () => {
  const client = database([migration]);
  const logs = [];
  await applyMigrations(client, [migration], (message) => logs.push(message));
  assert.ok(!client.calls.some((call) => call.sql === "BEGIN"));
  assert.match(logs[0], /^Skipped/);
  for (const entries of [[], [{ ...migration, checksum: "b".repeat(64) }]]) {
    const changed = database([migration]);
    await assert.rejects(applyMigrations(changed, entries, () => {}), /missing or changed/);
    assert.ok(!changed.calls.some((call) => call.sql === "BEGIN"));
  }
});

test("SQL, receipt and deferred-commit failures roll back without reporting acceptance", async () => {
  for (const failure of [migration.sql, "INSERT INTO public.solodesk_schema_migrations (name, checksum) VALUES ($1, $2)", "COMMIT"]) {
    const client = database([], failure);
    const logs = [];
    await assert.rejects(applyMigrations(client, [migration], (message) => logs.push(message)), /Synthetic database failure/);
    assert.equal(client.calls.at(-1).sql, "ROLLBACK");
    assert.ok(!logs.some((message) => message.startsWith("Applied ")));
  }
});

test("CLI help and invalid selections need no database and expose no credentials", () => {
  const script = new URL("./migrate.mjs", import.meta.url);
  const env = { ...process.env, DATABASE_URL_UNPOOLED: "https://user:synthetic-secret@example.invalid/db" };
  delete env.NODE_TEST_CONTEXT;
  const help = spawnSync(process.execPath, [script.pathname, "--help"], { encoding: "utf8", env });
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Apply all pending/);
  const invalid = spawnSync(process.execPath, [script.pathname, "../unknown.sql"], { encoding: "utf8", env });
  assert.equal(invalid.status, 1);
  const connection = spawnSync(process.execPath, [script.pathname], { encoding: "utf8", env });
  assert.equal(connection.status, 1);
  assert.match(connection.stderr, /DATABASE_URL_UNPOOLED/);
  assert.ok(!`${help.stdout}${invalid.stderr}${connection.stderr}`.includes("synthetic-secret"));
});
