import "server-only";
import { createHmac } from "node:crypto";
import { db } from "@/lib/db";
import type { Pool, PoolClient } from "pg";

export class RateLimitError extends Error {
  code: string;
  statusHttp: number;
  retryAfter?: number;

  constructor(
    code: string,
    message: string,
    statusHttp: number = 503,
    retryAfter?: number,
  ) {
    super(`[${code}] ${message}`);
    this.name = "RateLimitError";
    this.code = code;
    this.statusHttp = statusHttp;
    this.retryAfter = retryAfter;
  }
}

export const APPROVED_PURPOSES = new Set([
  "auth:sign_in",
  "auth:register",
  "auth:reset_password",
  "auth:verify_otp",
  "auth:resend_otp",
  "reauth:confirm",
  "contact:submit",
]);

export interface AdmissionPolicy {
  purpose: string;
  limit: number;
  windowSeconds: number;
  policyVersion?: string;
}

export interface AdmissionSignals {
  clientIp?: string | null;
  identifier?: string | null;
}

export interface AdmissionResult {
  allowed: boolean;
  count: number;
  retryAfter?: number;
  keyHashes: string[];
}

function resolvePool(p?: unknown): any {
  if (p && typeof (p as any).query === "function") return p;
  if (p && typeof (p as any).db?.query === "function") return (p as any).db;
  if (db && typeof (db as any).query === "function") return db;
  if (db && typeof (db as any).db?.query === "function") return (db as any).db;
  return db;
}

function getAdmissionSecret(): string {
  const secret =
    process.env.RATE_LIMIT_SECRET || process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new RateLimitError(
      "UNAVAILABLE",
      "Admission service secret is not configured or insufficient under G3",
      503,
    );
  }
  return secret;
}

/**
 * Normalizes client IP address to protect against raw logging and varied representation.
 */
export function normalizeClientIp(rawIp?: string | null): string | null {
  if (!rawIp || typeof rawIp !== "string") return null;
  let ip = rawIp.trim();
  // Strip IPv6-mapped IPv4 prefix if present
  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }
  // Strip port if formatted as ip:port
  if (/^(\d{1,3}\.){3}\d{1,3}:\d+$/.test(ip)) {
    ip = ip.split(":")[0];
  }
  // Remove brackets in [ipv6]
  if (ip.startsWith("[") && ip.endsWith("]")) {
    ip = ip.slice(1, -1);
  }
  return ip.toLowerCase();
}

/**
 * Normalizes identifier (e.g. email) before hashing.
 */
export function normalizeIdentifier(rawId?: string | null): string | null {
  if (!rawId || typeof rawId !== "string") return null;
  return rawId.trim().toLowerCase();
}

/**
 * Validates bounded admission policy configuration.
 */
export function validateAdmissionPolicy(policy: AdmissionPolicy): void {
  if (!policy || typeof policy !== "object") {
    throw new RateLimitError("VALIDATION", "Invalid admission policy", 400);
  }
  if (!policy.purpose || !APPROVED_PURPOSES.has(policy.purpose)) {
    throw new RateLimitError(
      "VALIDATION",
      `Unapproved admission purpose: ${policy.purpose}`,
      400,
    );
  }
  if (
    !Number.isInteger(policy.limit) ||
    policy.limit <= 0 ||
    policy.limit > 100_000
  ) {
    throw new RateLimitError(
      "VALIDATION",
      "Admission limit must be a positive integer <= 100,000",
      400,
    );
  }
  if (
    !Number.isInteger(policy.windowSeconds) ||
    policy.windowSeconds <= 0 ||
    policy.windowSeconds > 86_400
  ) {
    throw new RateLimitError(
      "VALIDATION",
      "Admission windowSeconds must be a positive integer <= 86,400",
      400,
    );
  }
}

/**
 * Derives purpose-separated, environment-bound HMAC key hash.
 * Never stores or exposes raw IP, raw email, or caller-selected authority.
 */
export function deriveKeyHash(
  purpose: string,
  signal: string,
  policyVersion = "1.0",
): string {
  const secret = getAdmissionSecret();
  const environment = process.env.NODE_ENV || "development";
  return createHmac("sha256", secret)
    .update(`${purpose}:${environment}:${policyVersion}:${signal}`)
    .digest("hex");
}

/**
 * Runs a self-contained, short independent transaction for admission.
 * Commits immediately and is isolated from downstream application transactions.
 */
async function withIndependentAdmissionTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
  poolInput?: Pool,
): Promise<T> {
  const pool = resolvePool(poolInput);
  if (typeof pool.transaction === "function") {
    return pool.transaction(callback);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL statement_timeout = 2000");
    await client.query("SET LOCAL lock_timeout = 1000");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback errors
    }
    throw new RateLimitError(
      "UNAVAILABLE",
      "Admission check failed or timed out",
      503,
    );
  } finally {
    client.release?.();
  }
}

/**
 * Consumes an admission attempt against shared PostgreSQL rate_limit_buckets.
 * Enforces fixed database-time windows, deterministic multi-key ordering,
 * saturated counters, independent commit, and fail-closed 503 on database outage.
 */
export async function consumeAdmission(
  signals: AdmissionSignals,
  policy: AdmissionPolicy,
  poolInput?: Pool,
): Promise<AdmissionResult> {
  validateAdmissionPolicy(policy);

  const policyVersion = policy.policyVersion || "1.0";
  const normalizedIp = normalizeClientIp(signals.clientIp);
  const normalizedId = normalizeIdentifier(signals.identifier);

  const keyHashes: string[] = [];
  if (normalizedIp) {
    keyHashes.push(
      deriveKeyHash(policy.purpose, `ip:${normalizedIp}`, policyVersion),
    );
  }
  if (normalizedId) {
    keyHashes.push(
      deriveKeyHash(policy.purpose, `id:${normalizedId}`, policyVersion),
    );
  }

  if (keyHashes.length === 0) {
    // Default fallback bucket key if no signal was provided
    keyHashes.push(
      deriveKeyHash(policy.purpose, "anon:default", policyVersion),
    );
  }

  // Deterministic lexicographical key sorting prevents multi-key lock deadlocks
  const sortedKeyHashes = Array.from(new Set(keyHashes)).sort();

  return withIndependentAdmissionTransaction(async (client) => {
    // 1. Fetch current database time for exact fixed-window alignment
    const timeRes = await client.query("SELECT clock_timestamp() AS now");
    const dbNow: Date = timeRes.rows[0]?.now || new Date();
    const dbEpochMs = dbNow.getTime();

    const windowMs = policy.windowSeconds * 1000;
    const windowStartMs = Math.floor(dbEpochMs / windowMs) * windowMs;
    const windowStart = new Date(windowStartMs);
    const expiresAt = new Date(windowStartMs + windowMs);

    let maxCount = 0;
    let anyDenied = false;

    // 2. Update each key bucket in sorted order
    for (const keyHash of sortedKeyHashes) {
      const res = await client.query(
        `INSERT INTO solodesk.rate_limit_buckets (key_hash, window_start, count, expires_at)
         VALUES ($1, $2, 1, $3)
         ON CONFLICT (key_hash, window_start)
         DO UPDATE SET count = LEAST(solodesk.rate_limit_buckets.count + 1, 2147483647)
         RETURNING count, expires_at`,
        [keyHash, windowStart.toISOString(), expiresAt.toISOString()],
      );

      const count = Number(res.rows[0]?.count ?? 1);
      if (count > maxCount) {
        maxCount = count;
      }
      if (count > policy.limit) {
        anyDenied = true;
      }
    }

    const retryAfter = anyDenied
      ? Math.max(1, Math.ceil((expiresAt.getTime() - dbEpochMs) / 1000))
      : undefined;

    return {
      allowed: !anyDenied,
      count: maxCount,
      retryAfter,
      keyHashes: sortedKeyHashes,
    };
  }, poolInput).catch((err) => {
    if (err instanceof RateLimitError) throw err;
    throw new RateLimitError(
      "UNAVAILABLE",
      `Admission check unavailable: ${err?.message || "database error"}`,
      503,
    );
  });
}
