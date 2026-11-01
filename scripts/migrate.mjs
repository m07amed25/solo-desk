import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { pathToFileURL } from "node:url";
import pg from "pg";

const root = new URL("../", import.meta.url);
const migrationDirectory = new URL("migrations/", root);
class MigrationError extends Error {}

export function readMigrations(selectors = [], directory = migrationDirectory) {
  const files = readdirSync(directory, { withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && /^\d+-[a-z0-9-]+\.sql$/.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  if (!files.length)
    throw new MigrationError("No numbered SQL migrations found.");

  const selected = new Set();
  for (const selector of selectors) {
    const matches = files.filter(
      (name) =>
        name === selector ||
        (/^\d+$/.test(selector) && name.startsWith(`${selector}-`)),
    );
    if (matches.length !== 1)
      throw new MigrationError(
        "Unknown or ambiguous migration; use its full filename or exact numeric prefix.",
      );
    selected.add(matches[0]);
  }
  return files.map((name) => {
    const sql = readFileSync(new URL(name, directory), "utf8");
    return {
      name,
      sql,
      checksum: createHash("sha256").update(sql).digest("hex"),
      selected: !selectors.length || selected.has(name),
    };
  });
}

export function migrationConnection(connectionString) {
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new MigrationError(
      "Set DATABASE_URL_UNPOOLED to a direct PostgreSQL migration connection.",
    );
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    [url.hostname, url.searchParams.get("host") ?? ""].some((host) =>
      host.includes("-pooler"),
    )
  )
    throw new MigrationError(
      "DATABASE_URL_UNPOOLED must use a direct PostgreSQL endpoint, not a pooled endpoint.",
    );
  if (url.searchParams.get("sslmode") === "require")
    url.searchParams.set("sslmode", "verify-full");
  return { connectionString: url.toString(), connectionTimeoutMillis: 10_000 };
}

// The caller closes this dedicated connection, releasing the session advisory lock.
export async function applyMigrations(client, migrations, log = console.log) {
  await client.query("SET lock_timeout = '10s'");
  await client.query("SELECT pg_advisory_lock(1936682084, 1)");
  await client.query(`CREATE TABLE IF NOT EXISTS public.solodesk_schema_migrations (
    name text PRIMARY KEY,
    checksum text NOT NULL CHECK (checksum ~ '^[a-f0-9]{64}$'),
    applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
  )`);
  await client.query(
    "REVOKE ALL ON public.solodesk_schema_migrations FROM PUBLIC",
  );
  const { rows } = await client.query(
    "SELECT name, checksum FROM public.solodesk_schema_migrations",
  );
  const history = new Map(rows.map((row) => [row.name, row.checksum]));
  for (const row of rows) {
    if (
      migrations.find((migration) => migration.name === row.name)?.checksum !==
      row.checksum
    )
      throw new MigrationError(
        "An applied migration is missing or changed. Restore the original file and add a new migration instead.",
      );
  }

  for (const migration of migrations.filter((entry) => entry.selected)) {
    if (history.has(migration.name)) {
      log(`Skipped ${migration.name} (already applied)`);
      continue;
    }
    log(`Applying ${migration.name}`);
    await client.query("BEGIN");
    try {
      // shortcut: files must be transactional SQL without transaction control; use a reviewed separate procedure for nontransactional DDL.
      await client.query(migration.sql);
      await client.query(
        "INSERT INTO public.solodesk_schema_migrations (name, checksum) VALUES ($1, $2)",
        [migration.name, migration.checksum],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    }
    log(`Applied ${migration.name}`);
  }
}

async function main() {
  const selectors = process.argv.slice(2);
  if (selectors.length === 1 && selectors[0] === "--help") {
    console.log(`Usage:
  npm run db:migrate                              Apply all pending migrations
  npm run db:migrate -- 001                        Apply migration 001 if pending
  npm run db:migrate -- 001-email-deliveries.sql    Select by filename
  npm run db:migrate -- 001 002                    Select multiple migrations

Uses DATABASE_URL_UNPOOLED; loads .env.local then .env without overriding existing environment values.`);
    return;
  }
  const migrations = readMigrations(selectors);
  for (const filename of [".env.local", ".env"]) {
    const path = new URL(filename, root);
    if (existsSync(path)) loadEnvFile(path);
  }
  const client = new pg.Client(
    migrationConnection(process.env.DATABASE_URL_UNPOOLED),
  );
  try {
    await client.connect();
    await applyMigrations(client, migrations);
    console.log("Migrations complete.");
  } finally {
    await client.end();
  }
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  main().catch((error) => {
    const code = /^[A-Z0-9]{5}$/.test(error.code ?? "")
      ? ` (SQLSTATE ${error.code})`
      : "";
    console.error(
      error instanceof MigrationError
        ? error.message
        : `Migration failed${code}. Check the target database; rerun unchanged files to reconcile committed migrations.`,
    );
    process.exitCode = 1;
  });
}
