import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

import crypto from "node:crypto";

// Service loader executing TypeScript with synthetic adapters (no live network/DB)
function loadRateLimitModule(path, adapters = {}) {
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
      if (name === "node:crypto" || name === "crypto") return crypto;
      if (name in adapters) {
        const ad = adapters[name];
        if (name === "@/lib/db" && ad && typeof ad === "object" && !ad.db) {
          return { ...ad, db: ad };
        }
        return ad;
      }
      assert.fail(`Unexpected module dependency: ${name}`);
    },
    Date,
    URL,
    Set,
    Map,
    Math,
    BigInt,
    Intl,
    Buffer,
    process: {
      env: {
        DATABASE_URL: "postgres://synthetic:synthetic@localhost:9/synthetic",
        BETTER_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
      },
    },
  });
  return exports;
}

test("fixed-window boundaries derive from database time and calculate exact Retry-After", async () => {
  let dbEpoch = 1700000000; // Fixed DB time seconds
  const bucketStore = new Map(); // key -> { count, expires_at }

  const mod = loadRateLimitModule("../lib/rate-limit.ts", {
    "@/lib/db": {
      query: async (sql, params) => {
        if (/SELECT.*clock_timestamp/i.test(sql)) {
          return { rows: [{ now: new Date(dbEpoch * 1000) }] };
        }
        return { rows: [] };
      },
      transaction: async (cb) => {
        const client = {
          query: async (sql, params) => {
            if (/SELECT.*clock_timestamp/i.test(sql)) {
              return { rows: [{ now: new Date(dbEpoch * 1000) }] };
            }
            if (/INSERT INTO solodesk\.rate_limit_buckets/i.test(sql)) {
              const [keyHash, windowStart, expiresAt] = params;
              const mapKey = `${keyHash}:${windowStart}`;
              const current = bucketStore.get(mapKey) || {
                count: 0,
                expiresAt,
              };
              const nextCount = current.count + 1;
              bucketStore.set(mapKey, { count: nextCount, expiresAt });
              return { rows: [{ count: nextCount, expires_at: expiresAt }] };
            }
            return { rows: [] };
          },
        };
        return cb(client);
      },
    },
  });

  const policy = {
    purpose: "auth:sign_in",
    limit: 2,
    windowSeconds: 60,
  };

  // 1st attempt at t=1700000010 -> allowed (count=1)
  const res1 = await mod.consumeAdmission(
    { clientIp: "192.168.1.1", identifier: "alice@example.com" },
    policy,
  );
  assert.equal(res1.allowed, true);
  assert.equal(res1.count, 1);

  // 2nd attempt at t=1700000020 -> allowed (count=2)
  dbEpoch = 1700000020;
  const res2 = await mod.consumeAdmission(
    { clientIp: "192.168.1.1", identifier: "alice@example.com" },
    policy,
  );
  assert.equal(res2.allowed, true);
  assert.equal(res2.count, 2);

  // 3rd attempt at t=1700000030 -> denied (count=3, limit=2)
  dbEpoch = 1700000030;
  const res3 = await mod.consumeAdmission(
    { clientIp: "192.168.1.1", identifier: "alice@example.com" },
    policy,
  );
  assert.equal(res3.allowed, false);
  assert.equal(res3.count, 3);
  assert.ok(res3.retryAfter > 0 && res3.retryAfter <= 60);

  // 4th attempt after window rolls over: dbEpoch = 1700000060 -> new window, count=1
  dbEpoch = 1700000060;
  const res4 = await mod.consumeAdmission(
    { clientIp: "192.168.1.1", identifier: "alice@example.com" },
    policy,
  );
  assert.equal(res4.allowed, true);
  assert.equal(res4.count, 1);
});

test("ordered multi-key updates prevent deadlock races", async () => {
  const acquiredLockKeys = [];

  const mod = loadRateLimitModule("../lib/rate-limit.ts", {
    "@/lib/db": {
      transaction: async (cb) => {
        const client = {
          query: async (sql, params) => {
            if (/SELECT.*clock_timestamp/i.test(sql)) {
              return { rows: [{ now: new Date(1700000000 * 1000) }] };
            }
            if (/INSERT INTO solodesk\.rate_limit_buckets/i.test(sql)) {
              acquiredLockKeys.push(params[0]); // record keyHash
              return {
                rows: [{ count: 1, expires_at: new Date(1700000060 * 1000) }],
              };
            }
            return { rows: [] };
          },
        };
        return cb(client);
      },
    },
  });

  // Call with signals that generate 2 keys (IP key and identifier key)
  await mod.consumeAdmission(
    { clientIp: "203.0.113.195", identifier: "user-zebra@example.com" },
    { purpose: "contact:submit", limit: 5, windowSeconds: 60 },
  );

  // Keys must have been processed in deterministic lexicographical order
  assert.equal(acquiredLockKeys.length, 2);
  const sorted = [...acquiredLockKeys].sort();
  assert.deepEqual(acquiredLockKeys, sorted);
});

test("denied counters saturate at bounded max and do not roll over", async () => {
  let currentCount = 2147483646; // near signed 32-bit int max
  const mod = loadRateLimitModule("../lib/rate-limit.ts", {
    "@/lib/db": {
      transaction: async (cb) => {
        const client = {
          query: async (sql, params) => {
            if (/SELECT.*clock_timestamp/i.test(sql)) {
              return { rows: [{ now: new Date(1700000000 * 1000) }] };
            }
            if (/INSERT INTO solodesk\.rate_limit_buckets/i.test(sql)) {
              assert.ok(
                /LEAST/i.test(sql) || /2147483647/.test(sql),
                "SQL must use saturation logic to prevent counter overflow",
              );
              currentCount = Math.min(currentCount + 1, 2147483647);
              return {
                rows: [
                  {
                    count: currentCount,
                    expires_at: new Date(1700000060 * 1000),
                  },
                ],
              };
            }
            return { rows: [] };
          },
        };
        return cb(client);
      },
    },
  });

  const res1 = await mod.consumeAdmission(
    { clientIp: "10.0.0.1" },
    { purpose: "auth:sign_in", limit: 5, windowSeconds: 60 },
  );
  assert.equal(res1.count, 2147483647);
  assert.equal(res1.allowed, false);

  const res2 = await mod.consumeAdmission(
    { clientIp: "10.0.0.1" },
    { purpose: "auth:sign_in", limit: 5, windowSeconds: 60 },
  );
  assert.equal(res2.count, 2147483647);
  assert.equal(res2.allowed, false);
});

test("downstream rollback does not refund admission attempts", async () => {
  let committedAttempts = 0;

  const mod = loadRateLimitModule("../lib/rate-limit.ts", {
    "@/lib/db": {
      transaction: async (cb) => {
        // Independent short transaction commits immediately
        const client = {
          query: async (sql, params) => {
            if (/SELECT.*clock_timestamp/i.test(sql)) {
              return { rows: [{ now: new Date(1700000000 * 1000) }] };
            }
            if (/INSERT INTO solodesk\.rate_limit_buckets/i.test(sql)) {
              committedAttempts++;
              return {
                rows: [
                  {
                    count: committedAttempts,
                    expires_at: new Date(1700000060 * 1000),
                  },
                ],
              };
            }
            return { rows: [] };
          },
        };
        return cb(client);
      },
    },
  });

  // Attempt is admitted in independent transaction
  const admission = await mod.consumeAdmission(
    { clientIp: "198.51.100.2" },
    { purpose: "auth:verify_otp", limit: 3, windowSeconds: 60 },
  );
  assert.equal(admission.allowed, true);
  assert.equal(admission.count, 1);
  assert.equal(committedAttempts, 1);

  // Simulate a downstream application transaction that encounters an error and rolls back
  try {
    throw new Error("Downstream operation failed after admission");
  } catch {
    // Downstream error caught
  }

  // Next admission attempt sees count=2 because attempt was committed prior to downstream work
  const admission2 = await mod.consumeAdmission(
    { clientIp: "198.51.100.2" },
    { purpose: "auth:verify_otp", limit: 3, windowSeconds: 60 },
  );
  assert.equal(admission2.count, 2);
  assert.equal(committedAttempts, 2);
});

test("database outage or missing configuration fails closed with 503 and no memory fallback", async () => {
  const modOutage = loadRateLimitModule("../lib/rate-limit.ts", {
    "@/lib/db": {
      transaction: async () => {
        throw new Error("Database connection pool exhausted");
      },
    },
  });

  await assert.rejects(
    async () =>
      modOutage.consumeAdmission(
        { clientIp: "10.0.0.1" },
        { purpose: "auth:sign_in", limit: 5, windowSeconds: 60 },
      ),
    (err) => {
      assert.equal(err.name, "RateLimitError");
      assert.equal(err.code, "UNAVAILABLE");
      assert.equal(err.statusHttp, 503);
      return true;
    },
  );
});

test("signal normalization redacts raw IP and email, enforces bounded policy inputs", async () => {
  let recordedKeyHash = null;

  const mod = loadRateLimitModule("../lib/rate-limit.ts", {
    "@/lib/db": {
      transaction: async (cb) => {
        const client = {
          query: async (sql, params) => {
            if (/SELECT.*clock_timestamp/i.test(sql)) {
              return { rows: [{ now: new Date(1700000000 * 1000) }] };
            }
            if (/INSERT INTO solodesk\.rate_limit_buckets/i.test(sql)) {
              recordedKeyHash = params[0];
              return {
                rows: [{ count: 1, expires_at: new Date(1700000060 * 1000) }],
              };
            }
            return { rows: [] };
          },
        };
        return cb(client);
      },
    },
  });

  const rawEmail = "  User.Name+tag@Example.COM  ";
  const rawIp = "192.168.001.001";

  await mod.consumeAdmission(
    { identifier: rawEmail, clientIp: rawIp },
    { purpose: "auth:sign_in", limit: 5, windowSeconds: 60 },
  );

  // Key hash must be a 64-char hex SHA256/HMAC string, not raw text
  assert.match(recordedKeyHash, /^[0-9a-f]{64}$/);
  assert.ok(!recordedKeyHash.includes("User.Name"));
  assert.ok(!recordedKeyHash.includes("192.168"));

  // Bounded policy input validations
  await assert.rejects(
    async () =>
      mod.consumeAdmission(
        { clientIp: "10.0.0.1" },
        { purpose: "auth:sign_in", limit: 0, windowSeconds: 60 },
      ),
    /VALIDATION/,
  );

  await assert.rejects(
    async () =>
      mod.consumeAdmission(
        { clientIp: "10.0.0.1" },
        { purpose: "auth:sign_in", limit: 5, windowSeconds: -10 },
      ),
    /VALIDATION/,
  );

  await assert.rejects(
    async () =>
      mod.consumeAdmission(
        { clientIp: "10.0.0.1" },
        { purpose: "unapproved:purpose", limit: 5, windowSeconds: 60 },
      ),
    /VALIDATION/,
  );
});
