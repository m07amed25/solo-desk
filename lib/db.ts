import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & { databasePool?: Pool };

export const db =
  globalForDb.databasePool ??
  new Pool({
    connectionString: process.env.DATABASE_URL!.replace(
      "sslmode=require",
      "sslmode=verify-full",
    ),
    max: 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    statement_timeout: 10_000,
  });

if (!globalForDb.databasePool) {
  db.on("error", () => console.error("Idle database connection failed"));
  if (process.env.VERCEL) attachDatabasePool(db);
  globalForDb.databasePool = db;
}
