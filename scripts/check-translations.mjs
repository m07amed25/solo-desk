#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const enPath = path.join(rootDir, "messages", "en.json");
const arPath = path.join(rootDir, "messages", "ar.json");

if (!fs.existsSync(enPath) || !fs.existsSync(arPath)) {
  console.error("Translation files not found at:", { enPath, arPath });
  process.exit(1);
}

const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
const ar = JSON.parse(fs.readFileSync(arPath, "utf-8"));

function collectKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      keys.push(...collectKeys(val, fullKey));
    } else if (Array.isArray(val)) {
      keys.push(`${fullKey}[]#${val.length}`);
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = new Set(collectKeys(en));
const arKeys = new Set(collectKeys(ar));

const missingInAr = [...enKeys].filter((k) => !arKeys.has(k));
const missingInEn = [...arKeys].filter((k) => !enKeys.has(k));

if (missingInAr.length > 0 || missingInEn.length > 0) {
  console.error("❌ Translation key mismatch found!");
  if (missingInAr.length > 0) {
    console.error("\nKeys missing in messages/ar.json:");
    for (const key of missingInAr) {
      console.error(`  - ${key}`);
    }
  }
  if (missingInEn.length > 0) {
    console.error("\nKeys missing in messages/en.json:");
    for (const key of missingInEn) {
      console.error(`  - ${key}`);
    }
  }
  process.exit(1);
}

console.log(
  `✓ Translation key parity confirmed: ${enKeys.size} keys and structures match 100% between en and ar.`,
);
process.exit(0);
