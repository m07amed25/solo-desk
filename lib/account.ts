import "server-only";
import { currentSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { readRequestBody } from "@/lib/request-body";
import type { Pool, PoolClient } from "pg";

export class AccountError extends Error {
  code: string;
  statusHttp: number;
  currentPreferences?: AccountPreferences;

  constructor(
    code: string,
    message: string,
    statusHttp: number = 400,
    currentPreferences?: AccountPreferences,
  ) {
    super(`[${code}] ${message}`);
    this.name = "AccountError";
    this.code = code;
    this.statusHttp = statusHttp;
    this.currentPreferences = currentPreferences;
  }
}

export type AccountSession = {
  userId: string;
  sessionId: string;
  email: string;
  expiresAt: string;
};

export type AccountPreferences = {
  locale: "en" | "ar" | null;
  timezone: string;
  optionalAccountEmail: boolean;
  revision: string; // canonical decimal string
};

export type AccountPreferencesResult = {
  preferences: AccountPreferences;
  isDefault: boolean;
};

export type PreferencesInput = {
  expectedRevision: string;
  locale: "en" | "ar";
  timezone: string;
  optionalAccountEmail: boolean;
};

export type AccountSecurityEventInput = {
  eventType: string;
  outcome: "started" | "confirmed" | "denied" | "unknown";
  actorId?: string | null;
  correlationId?: string | null;
  action?: string | null;
  targetReference?: string | null;
  policyVersion?: string;
};

const DEFAULT_PREFERENCES: AccountPreferences = {
  locale: null,
  timezone: "UTC",
  optionalAccountEmail: false,
  revision: "0",
};

/**
 * Requires a fresh, verified, unbanned, unexpired account authority.
 * Derives trusted identity server-side; rejects unverified or expired sessions.
 */
export async function requireAccountSession(
  expected?: AccountSession,
): Promise<AccountSession> {
  const session = await currentSession().catch(() => null);
  if (!session?.user?.id || !session?.session?.id) {
    throw new AccountError("UNAUTHORIZED", "Authentication required", 401);
  }
  if (session.user.emailVerified !== true) {
    throw new AccountError("UNAUTHORIZED", "Verified account required", 401);
  }
  if ((session.user as { banned?: boolean }).banned === true) {
    throw new AccountError("FORBIDDEN", "Account is banned", 403);
  }
  const expiry = new Date(session.session.expiresAt).getTime();
  if (!Number.isFinite(expiry) || expiry <= Date.now()) {
    throw new AccountError("UNAUTHORIZED", "Session expired", 401);
  }
  if (
    expected &&
    (session.user.id !== expected.userId ||
      session.session.id !== expected.sessionId)
  ) {
    throw new AccountError("UNAUTHORIZED", "Original session required", 401);
  }
  return {
    userId: session.user.id,
    sessionId: session.session.id,
    email: session.user.email || "",
    expiresAt: new Date(expiry).toISOString(),
  };
}

async function requireDatabaseSession(
  session: AccountSession,
  client: Pick<PoolClient, "query">,
) {
  const { rows } = await client.query(
    `SELECT u.id FROM neon_auth."user" u
     JOIN neon_auth.session s ON s."userId" = u.id
     WHERE u.id = $1::uuid AND s.id = $2::uuid AND u.banned IS NOT TRUE
       AND u."emailVerified" IS TRUE AND s."expiresAt" > CURRENT_TIMESTAMP
     LIMIT 1`,
    [session.userId, session.sessionId],
  );
  if (!rows.length)
    throw new AccountError("UNAUTHORIZED", "Current session required", 401);
}

/**
 * Validates input for account preferences update.
 * Enforces strict allowlisting, recognized IANA timezone, and boundary constraints.
 */
export function validatePreferencesInput(input: unknown): PreferencesInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AccountError("VALIDATION", "Invalid preferences payload", 400);
  }

  const allowedKeys = new Set([
    "expectedRevision",
    "locale",
    "timezone",
    "optionalAccountEmail",
  ]);
  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) {
      throw new AccountError("VALIDATION", `Unexpected property: ${key}`, 400);
    }
  }

  const { expectedRevision, locale, timezone, optionalAccountEmail } =
    input as Record<string, unknown>;

  if (
    typeof expectedRevision !== "string" ||
    !/^(0|[1-9][0-9]{0,18})$/.test(expectedRevision) ||
    BigInt(expectedRevision) > BigInt("9223372036854775807")
  ) {
    throw new AccountError(
      "VALIDATION",
      "Invalid expectedRevision format",
      400,
    );
  }

  if (locale !== "en" && locale !== "ar") {
    throw new AccountError("VALIDATION", "Locale must be 'en' or 'ar'", 400);
  }

  if (
    typeof timezone !== "string" ||
    timezone.trim().length === 0 ||
    timezone.length > 100
  ) {
    throw new AccountError(
      "VALIDATION",
      "Timezone must be a nonempty string up to 100 characters",
      400,
    );
  }

  // Validate server runtime IANA timezone support
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    throw new AccountError("VALIDATION", "Unrecognized IANA timezone", 400);
  }

  if (typeof optionalAccountEmail !== "boolean") {
    throw new AccountError(
      "VALIDATION",
      "optionalAccountEmail must be a boolean",
      400,
    );
  }

  return {
    expectedRevision,
    locale,
    timezone,
    optionalAccountEmail,
  };
}

/**
 * Runs a transactional block with short timeouts.
 */
export async function withAccountTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
  poolInput?: Pool,
): Promise<T> {
  const pool: Pool & {
    transaction?: <R>(
      callback: (client: PoolClient) => Promise<R>,
    ) => Promise<R>;
  } = poolInput ?? db;
  if (typeof pool.transaction === "function") {
    return pool.transaction(callback);
  }

  const client = await pool.connect();
  let committing = false;
  let discard = false;
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL statement_timeout = 5000");
    await client.query("SET LOCAL lock_timeout = 1000");
    const result = await callback(client);
    committing = true;
    await client.query("COMMIT");
    return result;
  } catch (err) {
    discard = committing;
    try {
      await client.query("ROLLBACK");
    } catch {
      discard = true;
    }
    if (committing) {
      throw new AccountError(
        "OUTCOME_UNKNOWN",
        "Reconcile the original operation before retrying",
        503,
      );
    }
    throw err;
  } finally {
    client.release?.(discard);
  }
}

/**
 * Reads account preferences for current verified identity.
 * Performs NO database insert on missing row; returns explicit defaults.
 */
export async function getAccountPreferences(
  session: AccountSession,
  clientOrPoolInput?: PoolClient | Pool,
): Promise<AccountPreferencesResult> {
  session = await requireAccountSession(session);
  const clientOrPool = clientOrPoolInput ?? db;
  await requireDatabaseSession(session, clientOrPool);
  return readAccountPreferences(session.userId, clientOrPool);
}

async function readAccountPreferences(
  userId: string,
  clientOrPool: Pick<PoolClient, "query">,
): Promise<AccountPreferencesResult> {
  const { rows } = await clientOrPool.query(
    `SELECT locale, timezone, optional_account_email, revision
     FROM solodesk.account_preferences
     WHERE user_id = $1::uuid
     LIMIT 1`,
    [userId],
  );

  if (!rows || rows.length === 0) {
    return {
      preferences: { ...DEFAULT_PREFERENCES },
      isDefault: true,
    };
  }

  const row = rows[0];
  return {
    preferences: {
      locale: row.locale,
      timezone: row.timezone,
      optionalAccountEmail: row.optional_account_email,
      revision: row.revision.toString(),
    },
    isDefault: false,
  };
}

/**
 * Compare-and-set update or creation of account preferences.
 * Rejects stale revisions with HTTP 409 and returns the current accepted projection.
 */
export async function saveAccountPreferences(
  session: AccountSession,
  rawInput: unknown,
  poolInput?: Pool,
): Promise<AccountPreferencesResult> {
  const validated = validatePreferencesInput(rawInput);
  session = await requireAccountSession(session);

  return withAccountTransaction(async (client) => {
    await requireDatabaseSession(session, client);
    // Read current state under lock
    const { rows } = await client.query(
      `SELECT locale, timezone, optional_account_email, revision
       FROM solodesk.account_preferences
       WHERE user_id = $1::uuid
       FOR UPDATE`,
      [session.userId],
    );

    const existingRow = rows && rows.length > 0 ? rows[0] : null;

    if (!existingRow) {
      // Creation case: expected revision must be "0"
      if (validated.expectedRevision !== "0") {
        throw new AccountError(
          "CONFLICT",
          "Stale revision on initial create",
          409,
          { ...DEFAULT_PREFERENCES },
        );
      }

      const insertRes = await client.query(
        `INSERT INTO solodesk.account_preferences (user_id, locale, timezone, optional_account_email, revision, created_at, updated_at)
         VALUES ($1::uuid, $2, $3, $4, 1, clock_timestamp(), clock_timestamp())
         ON CONFLICT (user_id) DO NOTHING
         RETURNING locale, timezone, optional_account_email, revision`,
        [
          session.userId,
          validated.locale,
          validated.timezone,
          validated.optionalAccountEmail,
        ],
      );

      const created = insertRes.rows[0];
      if (!created) {
        const current = await readAccountPreferences(session.userId, client);
        throw new AccountError(
          "CONFLICT",
          "Concurrent preferences creation",
          409,
          current.preferences,
        );
      }

      await recordAccountSecurityEvent(client, {
        eventType: "account_preferences_updated",
        outcome: "confirmed",
        actorId: session.userId,
        action: "create_preferences",
        targetReference: "own-account",
      });

      return {
        preferences: {
          locale: created.locale,
          timezone: created.timezone,
          optionalAccountEmail: created.optional_account_email,
          revision: created.revision.toString(),
        },
        isDefault: false,
      };
    }

    // Update case: CAS check on revision
    const currentRevStr = existingRow.revision.toString();
    const currentProjection: AccountPreferences = {
      locale: existingRow.locale,
      timezone: existingRow.timezone,
      optionalAccountEmail: existingRow.optional_account_email,
      revision: currentRevStr,
    };

    if (currentRevStr !== validated.expectedRevision) {
      throw new AccountError(
        "CONFLICT",
        "Stale revision on preferences update",
        409,
        currentProjection,
      );
    }

    if (currentRevStr === "9223372036854775807") {
      throw new AccountError(
        "CONFLICT",
        "Preference revision exhausted",
        409,
        currentProjection,
      );
    }
    const nextRev = (BigInt(existingRow.revision) + BigInt(1)).toString();
    const updateRes = await client.query(
      `UPDATE solodesk.account_preferences
       SET locale = $1, timezone = $2, optional_account_email = $3, revision = $4::bigint, updated_at = clock_timestamp()
       WHERE user_id = $5::uuid AND revision = $6::bigint
       RETURNING locale, timezone, optional_account_email, revision`,
      [
        validated.locale,
        validated.timezone,
        validated.optionalAccountEmail,
        nextRev,
        session.userId,
        existingRow.revision,
      ],
    );

    if (!updateRes.rows || updateRes.rows.length === 0) {
      throw new AccountError(
        "CONFLICT",
        "Concurrent update detected",
        409,
        currentProjection,
      );
    }

    const updated = updateRes.rows[0];

    await recordAccountSecurityEvent(client, {
      eventType: "account_preferences_updated",
      outcome: "confirmed",
      actorId: session.userId,
      action: "update_preferences",
      targetReference: "own-account",
    });

    return {
      preferences: {
        locale: updated.locale,
        timezone: updated.timezone,
        optionalAccountEmail: updated.optional_account_email,
        revision: updated.revision.toString(),
      },
      isDefault: false,
    };
  }, poolInput);
}

/**
 * Records a strictly allowlisted and redacted account security event.
 * Prohibits credentials, raw payload dumps, tokens, or untrusted client fields.
 */
export async function recordAccountSecurityEvent(
  client: { query: (sql: string, params: unknown[]) => Promise<unknown> },
  event: AccountSecurityEventInput,
): Promise<void> {
  if (!event || typeof event !== "object") {
    throw new AccountError("VALIDATION", "Invalid event payload", 400);
  }

  const validTypes = new Set([
    "account_preferences_updated",
    "account_signed_in",
    "account_signed_out",
    "session_revoked",
    "other_sessions_revoked",
    "reauthentication_confirmed",
    "reauthentication_denied",
    "password_reset_requested",
    "password_reset_completed",
    "verification_otp_sent",
    "verification_otp_verified",
    "admission_rate_limited",
  ]);

  if (!event.eventType || !validTypes.has(event.eventType)) {
    throw new AccountError(
      "VALIDATION",
      `Invalid event type: ${event.eventType}`,
      400,
    );
  }

  const validOutcomes = new Set(["started", "confirmed", "denied", "unknown"]);
  if (!event.outcome || !validOutcomes.has(event.outcome)) {
    throw new AccountError(
      "VALIDATION",
      `Invalid event outcome: ${event.outcome}`,
      400,
    );
  }

  const actorId =
    event.actorId &&
    /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(event.actorId)
      ? event.actorId
      : null;

  const correlationId =
    event.correlationId && typeof event.correlationId === "string"
      ? event.correlationId.slice(0, 128)
      : null;

  const action =
    event.action && typeof event.action === "string"
      ? event.action.slice(0, 64)
      : null;

  const targetReference =
    event.targetReference && typeof event.targetReference === "string"
      ? event.targetReference.slice(0, 128)
      : null;

  const policyVersion =
    event.policyVersion && typeof event.policyVersion === "string"
      ? event.policyVersion.slice(0, 32)
      : "1.0";

  await client.query(
    `INSERT INTO solodesk.account_security_events
     (id, occurred_at, event_type, outcome, actor_id, correlation_id, action, target_reference, policy_version)
     VALUES (gen_random_uuid(), clock_timestamp(), $1, $2, $3, $4, $5, $6, $7)`,
    [
      event.eventType,
      event.outcome,
      actorId,
      correlationId,
      action,
      targetReference,
      policyVersion,
    ],
  );
}

/**
 * Validates request origin against forbidden cross-site requests.
 */
export function validateAccountOrigin(request: Request): void {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") {
    throw new AccountError(
      "FORBIDDEN",
      "Cross-origin requests are forbidden",
      403,
    );
  }

  const origin = request.headers.get("origin");
  if (!origin) return;

  let requestHost = request.headers.get("host") || "";
  if (!requestHost) {
    try {
      const url = new URL(request.url);
      requestHost = url.host;
    } catch {
      // ignore
    }
  }

  try {
    const originUrl = new URL(origin);
    if (requestHost && originUrl.host !== requestHost) {
      throw new AccountError(
        "FORBIDDEN",
        "Origin does not match request host",
        403,
      );
    }
  } catch (e) {
    if (e instanceof AccountError) throw e;
    throw new AccountError("FORBIDDEN", "Invalid origin header", 403);
  }
}

/**
 * Validates origin, Content-Type, 4 KiB size limit, and JSON parsing.
 */
export async function parseAccountJsonRequest<T = unknown>(
  request: Request,
  maxBytes = 4096,
): Promise<T> {
  validateAccountOrigin(request);

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new AccountError(
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type must be application/json",
      415,
    );
  }

  let raw = "";
  try {
    raw = await readRequestBody(request, maxBytes);
  } catch (err) {
    if (err instanceof RangeError) {
      throw new AccountError(
        "PAYLOAD_TOO_LARGE",
        `Request body exceeds ${maxBytes} bytes limit`,
        413,
      );
    }
    throw new AccountError("VALIDATION", "Failed to read request body", 400);
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new AccountError("VALIDATION", "JSON body must be an object", 400);
    }
    return parsed as T;
  } catch (err) {
    if (err instanceof AccountError) throw err;
    throw new AccountError("VALIDATION", "Malformed JSON body", 400);
  }
}

/**
 * Wraps responses with mandatory Cache-Control: private, no-store headers.
 */
export function accountResponse(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: {
      "Cache-Control": "private, no-store",
      ...init?.headers,
    },
  });
}

/**
 * Formats standardized error responses with Cache-Control: private, no-store.
 */
export function accountErrorResponse(err: unknown): Response {
  const headers: Record<string, string> = {
    "Cache-Control": "private, no-store",
  };

  if (err instanceof AccountError) {
    return Response.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.currentPreferences
            ? { currentPreferences: err.currentPreferences }
            : {}),
        },
      },
      { status: err.statusHttp, headers },
    );
  }

  if (
    err &&
    typeof err === "object" &&
    "name" in err &&
    err.name === "AccountSecurityError"
  ) {
    const ase = err as unknown as {
      code: string;
      message: string;
      statusHttp: number;
    };
    return Response.json(
      { error: { code: ase.code, message: ase.message } },
      { status: ase.statusHttp, headers },
    );
  }

  if (
    err &&
    typeof err === "object" &&
    "name" in err &&
    err.name === "RateLimitError"
  ) {
    const rle = err as unknown as {
      code: string;
      message: string;
      statusHttp: number;
      retryAfter?: number;
    };
    if (rle.retryAfter) {
      headers["Retry-After"] = String(rle.retryAfter);
    }
    return Response.json(
      { error: { code: rle.code, message: rle.message } },
      { status: rle.statusHttp, headers },
    );
  }

  return Response.json(
    {
      error: {
        code: "UNAVAILABLE",
        message: "Service temporarily unavailable",
      },
    },
    { status: 503, headers },
  );
}
