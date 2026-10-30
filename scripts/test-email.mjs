import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
await mkdir(".next", { recursive: true });
const outfile = path.resolve(".next/email-tests.cjs");
await build({
  entryPoints: ["tests/email.test.mjs"], outfile, bundle: true,
  platform: "node", format: "cjs", packages: "external", jsx: "automatic",
  alias: { "server-only": path.resolve("node_modules/server-only/empty.js") },
});
await import(pathToFileURL(outfile).href);
