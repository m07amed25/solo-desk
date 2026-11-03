import "server-only";
import { db } from "@/lib/db";
import { isLocale, type SiteLocale } from "@/lib/site";
import type { Pool } from "pg";

function resolvePool(p?: unknown): any {
  if (p && typeof (p as any).query === "function") return p;
  if (p && typeof (p as any).db?.query === "function") return (p as any).db;
  if (db && typeof (db as any).query === "function") return db;
  if (db && typeof (db as any).db?.query === "function") return (db as any).db;
  return db;
}

/**
 * Resolves the account locale for a given user ID directly from PostgreSQL
 * solodesk.account_preferences without triggering session validation,
 * HTTP fetches, or recursion.
 *
 * If no preference exists, or on database errors, returns null.
 */
export async function getAccountLocaleByUserId(
  userId: string,
  poolInput?: Pool,
): Promise<SiteLocale | null> {
  if (!userId || typeof userId !== "string") return null;
  try {
    const pool = resolvePool(poolInput);
    const res = await pool.query(
      `SELECT locale FROM solodesk.account_preferences WHERE user_id = $1::uuid LIMIT 1`,
      [userId],
    );
    const loc = res.rows[0]?.locale;
    return isLocale(loc) ? loc : null;
  } catch {
    return null;
  }
}

/**
 * Language resolution precedence rule (confirmed by Q-08 / Decision 3):
 * Browser Presentation Hint (e.g. solodesk-locale cookie)
 *   → Verified Account Preference (solodesk.account_preferences.locale)
 *   → English ("en") Fallback
 *
 * Presentation hints remain non-authoritative for account state.
 */
export async function resolvePresentationLocale(
  browserLocaleCookie?: string | null,
  userId?: string | null,
  poolInput?: Pool,
): Promise<SiteLocale> {
  // 1. Browser presentation choice wins if explicitly set and valid
  if (isLocale(browserLocaleCookie)) {
    return browserLocaleCookie;
  }

  // 2. If browser choice absent, resolve saved account locale if authenticated
  if (userId) {
    const accountLocale = await getAccountLocaleByUserId(userId, poolInput);
    if (accountLocale) {
      return accountLocale;
    }
  }

  // 3. Fallback to English
  return "en";
}
