import "server-only";
import { createHash, randomUUID, randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import { db } from "@/lib/db";
import { currentSession } from "@/lib/auth/server";
import { isWorkspacesEnabled } from "@/lib/auth/capabilities";
import { encryptInvitationDelivery } from "@/lib/workspace-invitations";

// --- Types & Constants (C01, C02, C03) ---

export type WorkspaceRole = "owner" | "admin" | "member";
export type MembershipStatus = "active" | "revoked";

export const RESERVED_SLUGS = new Set([
  "app",
  "api",
  "auth",
  "admin",
  "sign-in",
  "sign-up",
]);

export const APPROVED_CURRENCIES = new Set([
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "EGP",
  "SAR",
  "AED",
]);

export const SUPPORTED_ACTIONS = [
  "workspace.read",
  "workspace.select",
  "workspace.settings.update",
  "workspace.members.read",
  "workspace.invites.manage",
  "workspace.members.remove",
  "workspace.members.role.change",
  "workspace.ownership.transfer",
  "workspace.members.leave",
  "workspace.audit.read",
] as const;

export type SupportedAction = (typeof SUPPORTED_ACTIONS)[number];

export const ROLE_GRANTS: Record<WorkspaceRole, readonly SupportedAction[]> = {
  owner: SUPPORTED_ACTIONS,
  admin: [
    "workspace.read",
    "workspace.select",
    "workspace.settings.update",
    "workspace.members.read",
    "workspace.invites.manage",
    "workspace.members.remove",
    "workspace.members.leave",
  ],
  member: ["workspace.read", "workspace.select", "workspace.members.leave"],
};

export type CommandEnvelope<T> = {
  operationId: string;
  commandVersion: 1;
  workspaceId?: string;
  expectedRevision?: string;
  kind: string;
  payload: T;
};

export type AcceptedResult = {
  status: "accepted";
  replayed?: boolean;
  operationId: string;
  workspaceId: string;
  targetId: string;
  revision: string;
  code: string;
  correlationId: string;
};

export class WorkspaceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "WorkspaceError";
  }

  get statusHttp(): number {
    return this.statusCode;
  }

  get fields(): Record<string, string> | undefined {
    return this.fieldErrors;
  }
}

// --- Validation Functions (C01, C02, C05, C06) ---

export function validateSlug(slug: string): string {
  if (typeof slug !== "string") {
    throw new WorkspaceError("VALIDATION", "Slug must be a string", 400, {
      slug: "invalidSlug",
    });
  }
  const clean = slug.trim();
  if (clean.length < 3 || clean.length > 63) {
    throw new WorkspaceError(
      "VALIDATION",
      "Slug must be between 3 and 63 characters",
      400,
      { slug: "invalidSlugLength" },
    );
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) {
    throw new WorkspaceError(
      "VALIDATION",
      "Slug must contain only lowercase alphanumeric characters and hyphens",
      400,
      { slug: "invalidSlugFormat" },
    );
  }
  if (RESERVED_SLUGS.has(clean)) {
    throw new WorkspaceError("SLUG_UNAVAILABLE", "Slug is reserved", 409, {
      slug: "slugReserved",
    });
  }
  return clean;
}

export function validateTimezone(tz: string): string {
  if (typeof tz !== "string" || !tz.trim()) {
    throw new WorkspaceError("VALIDATION", "Timezone is required", 400, {
      timezone: "invalidTimezone",
    });
  }
  const clean = tz.trim();
  try {
    Intl.DateTimeFormat(undefined, { timeZone: clean });
    return clean;
  } catch {
    throw new WorkspaceError(
      "VALIDATION",
      "Invalid IANA timezone identifier",
      400,
      {
        timezone: "invalidTimezone",
      },
    );
  }
}

export function validateCurrency(curr: string): string {
  if (typeof curr !== "string") {
    throw new WorkspaceError(
      "VALIDATION",
      "Currency must be an approved code",
      400,
      {
        currency: "invalidCurrency",
      },
    );
  }
  const clean = curr.trim().toUpperCase();
  if (!APPROVED_CURRENCIES.has(clean)) {
    throw new WorkspaceError(
      "VALIDATION",
      `Currency '${clean}' is not an approved ISO-4217 code`,
      400,
      { currency: "unapprovedCurrency" },
    );
  }
  return clean;
}

export function validateLocale(loc: string): "en" | "ar" {
  if (loc === "en" || loc === "ar") return loc;
  throw new WorkspaceError("VALIDATION", "Locale must be 'en' or 'ar'", 400, {
    locale: "invalidLocale",
  });
}

export function validateWorkspaceName(name: string): string {
  if (typeof name !== "string") {
    throw new WorkspaceError("VALIDATION", "Name must be a string", 400, {
      name: "invalidName",
    });
  }
  const clean = name.trim();
  const len = Array.from(clean).length; // Unicode code points
  if (len < 1 || len > 100) {
    throw new WorkspaceError(
      "VALIDATION",
      "Name must be between 1 and 100 characters",
      400,
      { name: "invalidNameLength" },
    );
  }
  return clean;
}

export function validateRevisionString(rev: unknown): string {
  if (typeof rev !== "string" || !/^[1-9]\d*$/.test(rev)) {
    throw new WorkspaceError(
      "VALIDATION",
      "Revision must be a positive decimal string",
      400,
    );
  }
  return rev;
}

export function validateDecimalString(
  rev: unknown,
  fieldName = "revision",
): string {
  if (typeof rev !== "string" || !/^[1-9]\d*$/.test(rev)) {
    throw new WorkspaceError(
      "VALIDATION",
      `${fieldName} must be a positive decimal string`,
      400,
    );
  }
  return rev;
}

export function validateUUID(val: unknown, fieldName = "id"): string {
  if (
    typeof val !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)
  ) {
    throw new WorkspaceError(
      "VALIDATION",
      `Invalid ${fieldName}: must be a UUID`,
      400,
    );
  }
  return val.toLowerCase();
}

function canonicalize(val: unknown): unknown {
  if (val === null || typeof val !== "object") {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(canonicalize);
  }
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(val as Record<string, unknown>).sort()) {
    sorted[key] = canonicalize((val as Record<string, unknown>)[key]);
  }
  return sorted;
}

export function computeIntentDigest(envelope: {
  kind: string;
  commandVersion: 1;
  workspaceId?: string;
  expectedRevision?: string;
  payload: Record<string, unknown>;
}): string {
  const canonicalObj = {
    commandVersion: 1,
    expectedRevision: envelope.expectedRevision || null,
    kind: envelope.kind,
    payload: envelope.payload,
    workspaceId: envelope.workspaceId || null,
  };
  const jsonStr = JSON.stringify(canonicalize(canonicalObj));
  return createHash("sha256").update(jsonStr).digest("hex");
}

// --- Transaction Primitives (C05, C06) ---

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
  pool = db,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("SET statement_timeout = 5000;");
    await client.query("SET lock_timeout = 1000;");
    await client.query("BEGIN;");
    const result = await callback(client);
    await client.query("COMMIT;");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK;");
    } catch {
      // Discard broken client on rollback failure
    }
    throw err;
  } finally {
    client.release();
  }
}

// --- Workspace Services ---

export type CreateWorkspaceInput = {
  operationId: string;
  name: string;
  slug: string;
  timezone: string;
  locale: "en" | "ar";
  currency: string;
};

export async function createWorkspace(
  input: CreateWorkspaceInput,
  actorSession?: { user: { id: string } } | null,
  clientOverride?: PoolClient,
): Promise<AcceptedResult> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  // Validate envelope & inputs
  if (!input.operationId || !/^[0-9a-f-]{36}$/i.test(input.operationId)) {
    throw new WorkspaceError("VALIDATION", "Invalid operation ID", 400);
  }
  const name = validateWorkspaceName(input.name);
  const slug = validateSlug(input.slug);
  const timezone = validateTimezone(input.timezone);
  const locale = validateLocale(input.locale);
  const currency = validateCurrency(input.currency);

  const intentDigest = computeIntentDigest({
    kind: "workspace.create",
    commandVersion: 1,
    payload: { name, slug, timezone, locale, currency },
  });

  const runWithClient = async (client: PoolClient) => {
    // 1. Check existing receipt for actor + operationId
    const existingReceipt = await client.query(
      `SELECT * FROM solodesk.command_receipts WHERE actor_id = $1 AND operation_id = $2`,
      [actorId, input.operationId],
    );

    if (existingReceipt.rows.length > 0) {
      const receipt = existingReceipt.rows[0];
      if (receipt.intent_digest !== intentDigest) {
        throw new WorkspaceError(
          "OPERATION_CONFLICT",
          "Operation ID already used with different intent",
          409,
        );
      }
      return {
        status: "accepted" as const,
        replayed: true,
        operationId: receipt.operation_id,
        workspaceId: receipt.workspace_id,
        targetId: receipt.target_id,
        revision: receipt.result_revision.toString(),
        code: receipt.result_code,
        correlationId: receipt.correlation_id,
      };
    }

    // 2. Check slug uniqueness
    const existingSlug = await client.query(
      `SELECT 1 FROM solodesk.workspaces WHERE slug = $1`,
      [slug],
    );
    if (existingSlug.rows.length > 0) {
      throw new WorkspaceError("SLUG_UNAVAILABLE", "Slug already exists", 409, {
        slug: "slugUnavailable",
      });
    }

    // 3. Create workspace & initial Owner membership
    const workspaceId = randomUUID();
    const membershipId = randomUUID();
    const correlationId = randomUUID();

    await client.query(
      `INSERT INTO solodesk.workspaces (
        id, name, slug, owner_id, timezone, locale, currency, legal_profile_status, revision
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'unconfigured', 1)`,
      [workspaceId, name, slug, membershipId, timezone, locale, currency],
    );

    await client.query(
      `INSERT INTO solodesk.workspace_memberships (
        id, workspace_id, user_id, role, status, revision, created_by
      ) VALUES ($1, $2, $3, 'owner', 'active', 1, $4)`,
      [membershipId, workspaceId, actorId, actorId],
    );

    // 4. Materialize initial owner grants
    for (const action of ROLE_GRANTS.owner) {
      await client.query(
        `INSERT INTO solodesk.workspace_grants (
          workspace_id, membership_id, action, scope_type, scope_id
        ) VALUES ($1, $2, $3, 'workspace', $1)`,
        [workspaceId, membershipId, action],
      );
    }

    // 5. Command receipt, audit event, and outbox event
    const resultObj = { workspaceId, membershipId, slug };
    await client.query(
      `INSERT INTO solodesk.command_receipts (
        actor_id, operation_id, workspace_id, kind, command_version,
        intent_digest, target_type, target_id, result_code, result_revision,
        result, correlation_id
      ) VALUES ($1, $2, $3, 'workspace.create', 1, $4, 'workspace', $3, 'CREATED', 1, $5, $6)`,
      [
        actorId,
        input.operationId,
        workspaceId,
        intentDigest,
        JSON.stringify(resultObj),
        correlationId,
      ],
    );

    await client.query(
      `INSERT INTO solodesk.audit_events (
        workspace_id, actor_id, operation_id, target_type, target_id, revision,
        action, correlation_id, change_summary
      ) VALUES ($1, $2, $3, 'workspace', $1, 1, 'workspace.create', $4, $5)`,
      [
        workspaceId,
        actorId,
        input.operationId,
        correlationId,
        JSON.stringify({ name, slug, owner_id: membershipId }),
      ],
    );

    await client.query(
      `INSERT INTO solodesk.outbox_events (
        workspace_id, actor_id, operation_id, event_type, target_id, target_revision,
        generation, payload, status
      ) VALUES ($1, $2, $3, 'workspace.created', $1, 1, 0, $4, 'pending')`,
      [workspaceId, actorId, input.operationId, JSON.stringify(resultObj)],
    );

    return {
      status: "accepted" as const,
      operationId: input.operationId,
      workspaceId,
      targetId: workspaceId,
      revision: "1",
      code: "CREATED",
      correlationId,
    };
  };

  if (clientOverride) {
    return runWithClient(clientOverride);
  }
  return withTransaction(runWithClient);
}

export type UpdateWorkspaceSettingsInput = {
  operationId: string;
  workspaceId: string;
  expectedRevision: string;
  name: string;
  timezone: string;
  locale: "en" | "ar";
  currency: string;
};

export async function updateWorkspaceSettings(
  input: UpdateWorkspaceSettingsInput,
  actorSession?: { user: { id: string } } | null,
  clientOverride?: PoolClient,
): Promise<AcceptedResult> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  const name = validateWorkspaceName(input.name);
  const timezone = validateTimezone(input.timezone);
  const locale = validateLocale(input.locale);
  const currency = validateCurrency(input.currency);
  const expectedRevStr = validateRevisionString(input.expectedRevision);
  const expectedRev = BigInt(expectedRevStr);

  const intentDigest = computeIntentDigest({
    kind: "workspace.settings.update",
    commandVersion: 1,
    workspaceId: input.workspaceId,
    expectedRevision: expectedRevStr,
    payload: { name, timezone, locale, currency },
  });

  const runWithClient = async (client: PoolClient) => {
    // Check existing receipt
    const existing = await client.query(
      `SELECT * FROM solodesk.command_receipts WHERE actor_id = $1 AND operation_id = $2`,
      [actorId, input.operationId],
    );
    if (existing.rows.length > 0) {
      const r = existing.rows[0];
      if (r.intent_digest !== intentDigest) {
        throw new WorkspaceError(
          "OPERATION_CONFLICT",
          "Operation ID already used",
          409,
        );
      }
      return {
        status: "accepted" as const,
        replayed: true,
        operationId: r.operation_id,
        workspaceId: r.workspace_id,
        targetId: r.target_id,
        revision: r.result_revision.toString(),
        code: r.result_code,
        correlationId: r.correlation_id,
      };
    }

    // Lock workspace row
    const wsRes = await client.query(
      `SELECT * FROM solodesk.workspaces WHERE id = $1 FOR UPDATE`,
      [input.workspaceId],
    );
    if (wsRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Workspace not found",
        404,
      );
    }
    const ws = wsRes.rows[0];

    // Check actor membership and grant
    const memberRes = await client.query(
      `SELECT m.id, m.role, m.status, g.action
       FROM solodesk.workspace_memberships m
       JOIN solodesk.workspace_grants g
         ON g.workspace_id = m.workspace_id AND g.membership_id = m.id
       WHERE m.workspace_id = $1 AND m.user_id = $2 AND m.status = 'active'
         AND g.action = 'workspace.settings.update'`,
      [input.workspaceId, actorId],
    );
    if (memberRes.rows.length === 0) {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Forbidden: missing settings update grant",
        403,
      );
    }

    // Check revision
    const currentRev = BigInt(ws.revision);
    if (currentRev !== expectedRev) {
      throw new WorkspaceError(
        "REVISION_CONFLICT",
        "Workspace revision conflict",
        409,
      );
    }

    const nextRev = currentRev + BigInt(1);
    const correlationId = randomUUID();

    // Update workspace settings
    await client.query(
      `UPDATE solodesk.workspaces
       SET name = $1, timezone = $2, locale = $3, currency = $4, revision = $5, updated_at = clock_timestamp()
       WHERE id = $6`,
      [name, timezone, locale, currency, nextRev.toString(), input.workspaceId],
    );

    const resultObj = {
      workspaceId: input.workspaceId,
      name,
      timezone,
      locale,
      currency,
      revision: nextRev.toString(),
    };

    await client.query(
      `INSERT INTO solodesk.command_receipts (
        actor_id, operation_id, workspace_id, kind, command_version,
        intent_digest, target_type, target_id, result_code, result_revision,
        result, correlation_id
      ) VALUES ($1, $2, $3, 'workspace.settings.update', 1, $4, 'workspace', $3, 'UPDATED', $5, $6, $7)`,
      [
        actorId,
        input.operationId,
        input.workspaceId,
        intentDigest,
        nextRev.toString(),
        JSON.stringify(resultObj),
        correlationId,
      ],
    );

    await client.query(
      `INSERT INTO solodesk.audit_events (
        workspace_id, actor_id, operation_id, target_type, target_id, revision,
        action, correlation_id, change_summary
      ) VALUES ($1, $2, $3, 'workspace', $1, $4, 'workspace.settings.update', $5, $6)`,
      [
        input.workspaceId,
        actorId,
        input.operationId,
        nextRev.toString(),
        correlationId,
        JSON.stringify({
          before: {
            name: ws.name,
            timezone: ws.timezone,
            locale: ws.locale,
            currency: ws.currency,
          },
          after: { name, timezone, locale, currency },
        }),
      ],
    );

    await client.query(
      `INSERT INTO solodesk.outbox_events (
        workspace_id, actor_id, operation_id, event_type, target_id, target_revision,
        generation, payload, status
      ) VALUES ($1, $2, $3, 'workspace.settings_updated', $1, $4, 0, $5, 'pending')`,
      [
        input.workspaceId,
        actorId,
        input.operationId,
        nextRev.toString(),
        JSON.stringify(resultObj),
      ],
    );

    return {
      status: "accepted" as const,
      operationId: input.operationId,
      workspaceId: input.workspaceId,
      targetId: input.workspaceId,
      revision: nextRev.toString(),
      code: "UPDATED",
      correlationId,
    };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

export type WorkspaceListItem = {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
  revision: string;
};

export async function listWorkspaces(
  actorSession?: { user: { id: string } } | null,
  options: { limit?: number; cursor?: string } = {},
  clientOverride?: PoolClient,
): Promise<{ items: WorkspaceListItem[]; nextCursor: string | null }> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  const limit = Math.min(Math.max(options.limit || 20, 1), 50);
  let cursorWorkspaceId: string | null = null;
  if (options.cursor) {
    if (
      typeof options.cursor !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(options.cursor)
    ) {
      throw new WorkspaceError(
        "VALIDATION",
        "Malformed pagination cursor",
        400,
      );
    }
    cursorWorkspaceId = options.cursor;
  }

  const runWithClient = async (client: PoolClient) => {
    let sql = `
      SELECT w.id, w.name, w.slug, m.role, w.revision
      FROM solodesk.workspace_memberships m
      JOIN solodesk.workspaces w ON w.id = m.workspace_id
      WHERE m.user_id = $1 AND m.status = 'active'
    `;
    const params: unknown[] = [actorId];

    if (cursorWorkspaceId) {
      params.push(cursorWorkspaceId);
      sql += ` AND w.id > $${params.length}`;
    }

    params.push(limit + 1);
    sql += ` ORDER BY w.id ASC LIMIT $${params.length}`;

    const { rows } = await client.query(sql, params);
    const hasNext = rows.length > limit;
    const items = (hasNext ? rows.slice(0, limit) : rows).map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      role: r.role as WorkspaceRole,
      revision: r.revision.toString(),
    }));

    const nextCursor = hasNext ? items[items.length - 1].id : null;
    return { items, nextCursor };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

export type WorkspaceContext = {
  workspace: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    locale: "en" | "ar";
    currency: string;
    revision: string;
  };
  membership: {
    id: string;
    role: WorkspaceRole;
    revision: string;
  };
  capabilities: string[];
};

export async function getWorkspaceContext(
  workspaceId: string,
  actorSession?: { user: { id: string } } | null,
  clientOverride?: PoolClient,
): Promise<WorkspaceContext> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  if (!workspaceId || !/^[0-9a-f-]{36}$/i.test(workspaceId)) {
    throw new WorkspaceError(
      "RESOURCE_UNAVAILABLE",
      "Invalid workspace ID",
      404,
    );
  }

  const runWithClient = async (client: PoolClient) => {
    const res = await client.query(
      `SELECT w.id, w.name, w.slug, w.timezone, w.locale, w.currency, w.revision,
              m.id as membership_id, m.role, m.revision as membership_revision
       FROM solodesk.workspaces w
       JOIN solodesk.workspace_memberships m ON m.workspace_id = w.id
       WHERE w.id = $1 AND m.user_id = $2 AND m.status = 'active'`,
      [workspaceId, actorId],
    );

    if (res.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Workspace not found or inaccessible",
        404,
      );
    }

    const r = res.rows[0];
    const role = r.role as WorkspaceRole;
    const allowedGrants = ROLE_GRANTS[role] || [];

    return {
      workspace: {
        id: r.id,
        name: r.name,
        slug: r.slug,
        timezone: r.timezone,
        locale: r.locale,
        currency: r.currency,
        revision: r.revision.toString(),
      },
      membership: {
        id: r.membership_id,
        role,
        revision: r.membership_revision.toString(),
      },
      capabilities: [...allowedGrants],
    };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

export async function getReceiptStatus(
  operationId: string,
  actorSession?: { user: { id: string } } | null,
  clientOverride?: PoolClient,
) {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  if (!operationId || !/^[0-9a-f-]{36}$/i.test(operationId)) {
    throw new WorkspaceError(
      "RESOURCE_UNAVAILABLE",
      "Invalid operation ID",
      404,
    );
  }

  const runWithClient = async (client: PoolClient) => {
    const res = await client.query(
      `SELECT * FROM solodesk.command_receipts WHERE actor_id = $1 AND operation_id = $2`,
      [actorId, operationId],
    );
    if (res.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Receipt not found",
        404,
      );
    }
    const r = res.rows[0];

    // For self-leave, return minimal actor acknowledgement
    if (r.kind === "workspace.member.leave") {
      return {
        status: "accepted" as const,
        operationId: r.operation_id,
        code: r.result_code,
      };
    }

    // Recheck current membership in the workspace
    const memberCheck = await client.query(
      `SELECT 1 FROM solodesk.workspace_memberships WHERE workspace_id = $1 AND user_id = $2 AND status = 'active'`,
      [r.workspace_id, actorId],
    );
    if (memberCheck.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Workspace no longer accessible",
        404,
      );
    }

    return {
      status: "accepted" as const,
      operationId: r.operation_id,
      workspaceId: r.workspace_id,
      targetId: r.target_id,
      revision: r.result_revision.toString(),
      code: r.result_code,
      correlationId: r.correlation_id,
    };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

// --- Invitations & Rate Controls (US4) ---

export function validateEmail(email: string): string {
  if (typeof email !== "string" || !email.trim()) {
    throw new WorkspaceError("VALIDATION", "Recipient email is required", 400, {
      recipientEmail: "invalidEmail",
    });
  }
  const clean = email.trim().toLowerCase();
  if (clean.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    throw new WorkspaceError(
      "VALIDATION",
      "Invalid email address format",
      400,
      {
        recipientEmail: "invalidEmail",
      },
    );
  }
  return clean;
}

export async function checkRateLimit(
  client: PoolClient,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const keyHash = createHash("sha256").update(key).digest("hex");
  const now = new Date();
  const windowStart = new Date(
    Math.floor(now.getTime() / (windowSeconds * 1000)) * (windowSeconds * 1000),
  );
  const expiresAt = new Date(windowStart.getTime() + windowSeconds * 1000);

  const res = await client.query(
    `INSERT INTO solodesk.rate_limit_buckets (key_hash, window_start, count, expires_at)
     VALUES ($1, $2, 1, $3)
     ON CONFLICT (key_hash, window_start)
     DO UPDATE SET count = solodesk.rate_limit_buckets.count + 1
     RETURNING count`,
    [keyHash, windowStart.toISOString(), expiresAt.toISOString()],
  );

  if (res.rows[0].count > limit) {
    throw new WorkspaceError(
      "RATE_LIMITED",
      "Rate limit exceeded. Please wait before retrying.",
      429,
    );
  }
}

export interface IssueInvitationInput {
  operationId: string;
  workspaceId: string;
  expectedRevision: string;
  recipientEmail: string;
  role: "admin" | "member";
}

export async function issueWorkspaceInvitation(
  input: IssueInvitationInput,
  actorSession?: { user: { id: string; name?: string } } | null,
  clientOverride?: PoolClient,
): Promise<AcceptedResult> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;
  const inviterName = session.user.name || "A team member";

  const recipientEmail = validateEmail(input.recipientEmail);
  const expectedRevStr = validateRevisionString(input.expectedRevision);
  const expectedRev = BigInt(expectedRevStr);

  if (input.role !== "admin" && input.role !== "member") {
    throw new WorkspaceError("VALIDATION", "Invalid invitation role", 400);
  }

  const intentDigest = computeIntentDigest({
    kind: "workspace.invitation.issue",
    commandVersion: 1,
    workspaceId: input.workspaceId,
    expectedRevision: expectedRevStr,
    payload: { recipientEmail, role: input.role },
  });

  const runWithClient = async (client: PoolClient) => {
    // 1. Check existing receipt for idempotent replay
    const existing = await client.query(
      `SELECT * FROM solodesk.command_receipts WHERE actor_id = $1 AND operation_id = $2`,
      [actorId, input.operationId],
    );
    if (existing.rows.length > 0) {
      const r = existing.rows[0];
      if (r.intent_digest !== intentDigest) {
        throw new WorkspaceError(
          "OPERATION_CONFLICT",
          "Operation ID already used",
          409,
        );
      }
      return {
        status: "accepted" as const,
        replayed: true,
        operationId: r.operation_id,
        workspaceId: r.workspace_id,
        targetId: r.target_id,
        revision: r.result_revision.toString(),
        code: r.result_code,
        correlationId: r.correlation_id,
      };
    }

    // Rate limits: 20 per workspace per hour, 5 per recipient per workspace per hour, 100 per actor per day
    await checkRateLimit(client, `invite:ws:${input.workspaceId}`, 20, 3600);
    await checkRateLimit(
      client,
      `invite:recipient:${input.workspaceId}:${recipientEmail}`,
      5,
      3600,
    );
    await checkRateLimit(client, `invite:actor:${actorId}`, 100, 86400);

    // Lock workspace row
    const wsRes = await client.query(
      `SELECT * FROM solodesk.workspaces WHERE id = $1 FOR UPDATE`,
      [input.workspaceId],
    );
    if (wsRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Workspace not found",
        404,
      );
    }
    const ws = wsRes.rows[0];

    // Check revision
    if (BigInt(ws.revision) !== expectedRev) {
      throw new WorkspaceError(
        "REVISION_CONFLICT",
        "Workspace revision conflict",
        409,
      );
    }

    // Check actor membership and grant ceiling
    const memberRes = await client.query(
      `SELECT m.id, m.role, m.status, g.action
       FROM solodesk.workspace_memberships m
       JOIN solodesk.workspace_grants g
         ON g.workspace_id = m.workspace_id AND g.membership_id = m.id
       WHERE m.workspace_id = $1 AND m.user_id = $2 AND m.status = 'active'
         AND g.action = 'workspace.invites.manage'`,
      [input.workspaceId, actorId],
    );
    if (memberRes.rows.length === 0) {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Forbidden: missing invites manage grant",
        403,
      );
    }
    const inviter = memberRes.rows[0];

    // Role ceiling: Admin can only invite Member; only Owner can invite Admin
    if (input.role === "admin" && inviter.role !== "owner") {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Only workspace owners can invite administrators",
        403,
      );
    }

    const existingPending = await client.query(
      `SELECT * FROM solodesk.workspace_invitations
       WHERE workspace_id = $1 AND recipient_email = $2 AND status = 'pending'`,
      [input.workspaceId, recipientEmail],
    );

    const tokenBytes = randomBytes(32);
    const token = tokenBytes.toString("base64url");
    const tokenDigest = createHash("sha256").update(token).digest("hex");
    const correlationId = randomUUID();
    const nextWsRev = BigInt(ws.revision) + BigInt(1);

    let invitationId: string;
    let generation = 1;

    if (existingPending.rows.length > 0) {
      // Rotate existing pending row
      const prior = existingPending.rows[0];
      invitationId = prior.id;
      generation = Number(prior.generation) + 1;
      const nextInvRev = BigInt(prior.revision) + BigInt(1);

      await client.query(
        `UPDATE solodesk.workspace_invitations
         SET token_digest = $1,
             generation = $2,
             revision = $3,
             role = $4,
             inviter_membership_id = $5,
             token_created_at = clock_timestamp(),
             expires_at = clock_timestamp() + INTERVAL '72 hours',
             updated_at = clock_timestamp()
         WHERE id = $6`,
        [
          tokenDigest,
          generation,
          nextInvRev.toString(),
          input.role,
          inviter.id,
          invitationId,
        ],
      );

      // Cancel any prior delivery outbox events
      await client.query(
        `UPDATE solodesk.outbox_events
         SET status = 'cancelled'
         WHERE workspace_id = $1 AND target_id = $2 AND status = 'pending'`,
        [input.workspaceId, invitationId],
      );
    } else {
      invitationId = randomUUID();
      await client.query(
        `INSERT INTO solodesk.workspace_invitations (
          id, workspace_id, recipient_email, role, scope_type, scope_id,
          inviter_membership_id, token_digest, generation, status, revision,
          token_created_at, expires_at
        ) VALUES ($1, $2, $3, $4, 'workspace', $2, $5, $6, 1, 'pending', 1,
                  clock_timestamp(), clock_timestamp() + INTERVAL '72 hours')`,
        [
          invitationId,
          input.workspaceId,
          recipientEmail,
          input.role,
          inviter.id,
          tokenDigest,
        ],
      );
    }

    // Bump workspace revision
    await client.query(
      `UPDATE solodesk.workspaces SET revision = $1, updated_at = clock_timestamp() WHERE id = $2`,
      [nextWsRev.toString(), input.workspaceId],
    );

    // Queue encrypted delivery in outbox
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const deliveryPayload = {
      invitationId,
      workspaceId: input.workspaceId,
      workspaceName: ws.name,
      inviterName,
      recipientEmail,
      role: input.role,
      token,
      generation,
      expiresAt,
    };
    const { encrypted, keyId } = encryptInvitationDelivery(deliveryPayload, {
      workspaceId: input.workspaceId,
      invitationId,
      generation,
    });

    await client.query(
      `INSERT INTO solodesk.outbox_events (
        workspace_id, actor_id, operation_id, event_type, target_id, target_revision,
        generation, payload, encrypted_delivery, key_id, status
      ) VALUES ($1, $2, $3, 'workspace.invitation.queued', $4, 1, $5, $6, $7, $8, 'pending')`,
      [
        input.workspaceId,
        actorId,
        input.operationId,
        invitationId,
        generation,
        JSON.stringify({ recipientEmail, role: input.role, generation }),
        encrypted,
        keyId,
      ],
    );

    // Write command receipt
    const resultObj = {
      invitationId,
      recipientEmail,
      role: input.role,
      generation,
    };
    await client.query(
      `INSERT INTO solodesk.command_receipts (
        actor_id, operation_id, workspace_id, kind, command_version,
        intent_digest, target_type, target_id, result_code, result_revision,
        result, correlation_id
      ) VALUES ($1, $2, $3, 'workspace.invitation.issue', 1, $4, 'invitation', $5, 'INVITATION_ISSUED', $6, $7, $8)`,
      [
        actorId,
        input.operationId,
        input.workspaceId,
        intentDigest,
        invitationId,
        nextWsRev.toString(),
        JSON.stringify(resultObj),
        correlationId,
      ],
    );

    // Write audit event
    await client.query(
      `INSERT INTO solodesk.audit_events (
        workspace_id, actor_id, operation_id, target_type, target_id, revision,
        action, correlation_id, change_summary
      ) VALUES ($1, $2, $3, 'invitation', $4, $5, 'workspace.invitation.issue', $6, $7)`,
      [
        input.workspaceId,
        actorId,
        input.operationId,
        invitationId,
        nextWsRev.toString(),
        correlationId,
        JSON.stringify({ recipientEmail, role: input.role, generation }),
      ],
    );

    return {
      status: "accepted" as const,
      operationId: input.operationId,
      workspaceId: input.workspaceId,
      targetId: invitationId,
      revision: nextWsRev.toString(),
      code: "INVITATION_ISSUED",
      correlationId,
    };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

export interface AcceptInvitationInput {
  operationId: string;
  token: string;
}

export async function acceptWorkspaceInvitation(
  input: AcceptInvitationInput,
  actorSession?: { user: { id: string; email?: string } } | null,
  clientOverride?: PoolClient,
): Promise<{
  status: "accepted";
  replayed?: boolean;
  operationId: string;
  workspaceId: string;
  role: string;
}> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id || !session.user.email) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;
  const actorEmail = session.user.email.trim().toLowerCase();

  if (!input.token || typeof input.token !== "string") {
    throw new WorkspaceError(
      "INVITATION_UNAVAILABLE",
      "Invitation invalid",
      400,
    );
  }

  const tokenDigest = createHash("sha256").update(input.token).digest("hex");

  const runWithClient = async (client: PoolClient) => {
    // Rate limit acceptance: at most 10 attempts per session per 15 minutes
    await checkRateLimit(client, `invite:accept:${actorId}`, 10, 900);

    // Look up invitation by digest
    const invRes = await client.query(
      `SELECT * FROM solodesk.workspace_invitations WHERE token_digest = $1`,
      [tokenDigest],
    );
    if (invRes.rows.length === 0) {
      throw new WorkspaceError(
        "INVITATION_UNAVAILABLE",
        "Invitation invalid or expired",
        400,
      );
    }
    const inv = invRes.rows[0];

    // Check expiry against database clock
    const clockRes = await client.query(`SELECT clock_timestamp() as now`);
    const now = new Date(clockRes.rows[0].now).getTime();
    const expiry = new Date(inv.expires_at).getTime();

    if (inv.status !== "pending" || now >= expiry) {
      throw new WorkspaceError(
        "INVITATION_UNAVAILABLE",
        "Invitation invalid or expired",
        400,
      );
    }

    // Verify recipient matches current user's email
    if (inv.recipient_email.toLowerCase() !== actorEmail) {
      throw new WorkspaceError(
        "INVITATION_UNAVAILABLE",
        "Invitation intended for different account",
        400,
      );
    }

    // Lock workspace
    await client.query(
      `SELECT * FROM solodesk.workspaces WHERE id = $1 FOR UPDATE`,
      [inv.workspace_id],
    );

    // Check existing membership: if already member, do not promote
    const existingMember = await client.query(
      `SELECT * FROM solodesk.workspace_memberships WHERE workspace_id = $1 AND user_id = $2`,
      [inv.workspace_id, actorId],
    );

    let membershipId: string;
    let nextMemRev = BigInt(1);

    if (existingMember.rows.length > 0) {
      const m = existingMember.rows[0];
      membershipId = m.id;
      if (m.status === "active") {
        // Already active; do not escalate role, just mark invitation accepted
        await client.query(
          `UPDATE solodesk.workspace_invitations
           SET status = 'accepted', accepted_at = clock_timestamp(), accepted_by = $1, accepted_membership_id = $2
           WHERE id = $3`,
          [actorId, membershipId, inv.id],
        );
        return {
          status: "accepted" as const,
          operationId: input.operationId,
          workspaceId: inv.workspace_id,
          role: m.role,
        };
      } else {
        // Reactivate revoked membership
        nextMemRev = BigInt(m.revision) + BigInt(1);
        await client.query(
          `UPDATE solodesk.workspace_memberships
           SET status = 'active', role = $1, revision = $2, revoked_at = NULL, updated_at = clock_timestamp()
           WHERE id = $3`,
          [inv.role, nextMemRev.toString(), membershipId],
        );
      }
    } else {
      // Create new membership
      membershipId = randomUUID();
      await client.query(
        `INSERT INTO solodesk.workspace_memberships (
          id, workspace_id, user_id, role, status, revision, created_by
        ) VALUES ($1, $2, $3, $4, 'active', 1, $5)`,
        [
          membershipId,
          inv.workspace_id,
          actorId,
          inv.role,
          inv.inviter_membership_id,
        ],
      );
    }

    // Materialize grants
    const targetGrants =
      ROLE_GRANTS[inv.role as WorkspaceRole] || ROLE_GRANTS.member;
    await client.query(
      `DELETE FROM solodesk.workspace_grants WHERE workspace_id = $1 AND membership_id = $2`,
      [inv.workspace_id, membershipId],
    );
    for (const action of targetGrants) {
      await client.query(
        `INSERT INTO solodesk.workspace_grants (
          workspace_id, membership_id, action, scope_type, scope_id
        ) VALUES ($1, $2, $3, 'workspace', $1)`,
        [inv.workspace_id, membershipId, action],
      );
    }

    // Mark invitation accepted
    await client.query(
      `UPDATE solodesk.workspace_invitations
       SET status = 'accepted', accepted_at = clock_timestamp(), accepted_by = $1, accepted_membership_id = $2
       WHERE id = $3`,
      [actorId, membershipId, inv.id],
    );

    const correlationId = randomUUID();
    // Record command receipt
    await client.query(
      `INSERT INTO solodesk.command_receipts (
        actor_id, operation_id, workspace_id, kind, command_version,
        intent_digest, target_type, target_id, result_code, result_revision,
        result, correlation_id
      ) VALUES ($1, $2, $3, 'workspace.invitation.accept', 1, $4, 'membership', $5, 'INVITATION_ACCEPTED', $6, $7, $8)`,
      [
        actorId,
        input.operationId,
        inv.workspace_id,
        tokenDigest,
        membershipId,
        nextMemRev.toString(),
        JSON.stringify({ workspaceId: inv.workspace_id, role: inv.role }),
        correlationId,
      ],
    );

    return {
      status: "accepted" as const,
      operationId: input.operationId,
      workspaceId: inv.workspace_id,
      role: inv.role,
    };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

// --- User Story 4: Resend & Revoke Invitations ---

export interface ResendInvitationInput {
  operationId: string;
  commandVersion?: 1;
  workspaceId: string;
  invitationId: string;
  expectedInvitationRevision: string;
}

export async function resendWorkspaceInvitation(
  input: ResendInvitationInput,
  actorSession?: { user: { id: string; email?: string } } | null,
  clientOverride?: PoolClient,
): Promise<{
  status: "accepted";
  replayed?: boolean;
  operationId: string;
  workspaceId: string;
  targetId: string;
  revision: string;
  code: string;
  correlationId: string;
}> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  validateUUID(input.operationId, "operationId");
  validateUUID(input.workspaceId, "workspaceId");
  validateUUID(input.invitationId, "invitationId");
  validateDecimalString(
    input.expectedInvitationRevision,
    "expectedInvitationRevision",
  );

  const intentDigest = computeIntentDigest({
    kind: "workspace.invitation.resend",
    commandVersion: 1,
    workspaceId: input.workspaceId,
    expectedRevision: input.expectedInvitationRevision,
    payload: {
      invitationId: input.invitationId,
    },
  });

  const runWithClient = async (client: PoolClient) => {
    // Check previous receipt
    const existingReceipt = await client.query(
      `SELECT * FROM solodesk.command_receipts WHERE actor_id = $1 AND operation_id = $2`,
      [actorId, input.operationId],
    );
    if (existingReceipt.rows.length > 0) {
      const r = existingReceipt.rows[0];
      if (r.intent_digest !== intentDigest) {
        throw new WorkspaceError(
          "OPERATION_CONFLICT",
          "Operation conflict: different intent",
          409,
        );
      }
      return {
        status: "accepted" as const,
        replayed: true,
        operationId: input.operationId,
        workspaceId: r.workspace_id,
        targetId: r.target_id,
        revision: r.result_revision,
        code: r.result_code,
        correlationId: r.correlation_id,
      };
    }

    // Lock workspace
    const wsRes = await client.query(
      `SELECT * FROM solodesk.workspaces WHERE id = $1 FOR UPDATE`,
      [input.workspaceId],
    );
    if (wsRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Workspace not found",
        404,
      );
    }
    const ws = wsRes.rows[0];

    // Check actor grant workspace.invites.manage
    const inviterMemRes = await client.query(
      `SELECT m.id, m.role FROM solodesk.workspace_memberships m
       JOIN solodesk.workspace_grants g ON g.membership_id = m.id
       WHERE m.workspace_id = $1 AND m.user_id = $2 AND m.status = 'active'
         AND g.action = 'workspace.invites.manage'
       LIMIT 1`,
      [input.workspaceId, actorId],
    );
    if (inviterMemRes.rows.length === 0) {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Forbidden: invites.manage required",
        403,
      );
    }
    const inviter = inviterMemRes.rows[0];

    // Fetch invitation
    const invRes = await client.query(
      `SELECT * FROM solodesk.workspace_invitations WHERE id = $1 AND workspace_id = $2`,
      [input.invitationId, input.workspaceId],
    );
    if (invRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Invitation not found",
        404,
      );
    }
    const inv = invRes.rows[0];

    if (inv.status !== "pending") {
      throw new WorkspaceError(
        "INVITATION_UNAVAILABLE",
        "Invitation is not pending",
        400,
      );
    }
    if (inv.revision.toString() !== input.expectedInvitationRevision) {
      throw new WorkspaceError(
        "REVISION_CONFLICT",
        "Invitation revision mismatch",
        409,
      );
    }

    // Role ceiling: Admin cannot resend an admin invitation
    if (inviter.role === "admin" && inv.role === "admin") {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Forbidden: admin cannot manage admin invitations",
        403,
      );
    }

    // Rate limits
    await checkRateLimit(
      client,
      `invite:workspace:${input.workspaceId}`,
      20,
      3600,
    );
    await checkRateLimit(
      client,
      `invite:recipient:${input.workspaceId}:${inv.recipient_email}`,
      5,
      3600,
    );
    await checkRateLimit(client, `invite:actor:${actorId}`, 100, 86400);

    const nextGeneration = Number(inv.generation) + 1;
    const nextRevision = BigInt(inv.revision) + BigInt(1);
    const token = randomBytes(32).toString("base64url");
    const tokenDigest = createHash("sha256").update(token).digest("hex");

    // Cancel previous pending outbox events for this invitation
    await client.query(
      `UPDATE solodesk.outbox_events SET status = 'cancelled'
       WHERE workspace_id = $1 AND target_id = $2 AND status = 'pending'`,
      [input.workspaceId, input.invitationId],
    );

    // Update invitation
    await client.query(
      `UPDATE solodesk.workspace_invitations
       SET token_digest = $1, generation = $2, revision = $3,
           token_created_at = clock_timestamp(),
           expires_at = clock_timestamp() + INTERVAL '72 hours',
           updated_at = clock_timestamp()
       WHERE id = $4`,
      [
        tokenDigest,
        nextGeneration,
        nextRevision.toString(),
        input.invitationId,
      ],
    );

    // Queue encrypted delivery
    const inviterName = session.user.email || "A team member";
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const deliveryPayload = {
      invitationId: input.invitationId,
      workspaceId: input.workspaceId,
      workspaceName: ws.name,
      inviterName,
      recipientEmail: inv.recipient_email,
      role: inv.role,
      token,
      generation: nextGeneration,
      expiresAt,
    };
    const { encrypted, keyId } = encryptInvitationDelivery(deliveryPayload, {
      workspaceId: input.workspaceId,
      invitationId: input.invitationId,
      generation: nextGeneration,
    });

    await client.query(
      `INSERT INTO solodesk.outbox_events (
        workspace_id, actor_id, operation_id, event_type, target_id, target_revision,
        generation, payload, encrypted_delivery, key_id, status
      ) VALUES ($1, $2, $3, 'workspace.invitation.queued', $4, $5, $6, $7, $8, $9, 'pending')`,
      [
        input.workspaceId,
        actorId,
        input.operationId,
        input.invitationId,
        nextRevision.toString(),
        nextGeneration,
        JSON.stringify({
          recipientEmail: inv.recipient_email,
          role: inv.role,
          generation: nextGeneration,
        }),
        encrypted,
        keyId,
      ],
    );

    const correlationId = randomUUID();
    await client.query(
      `INSERT INTO solodesk.command_receipts (
        actor_id, operation_id, workspace_id, kind, command_version,
        intent_digest, target_type, target_id, result_code, result_revision,
        result, correlation_id
      ) VALUES ($1, $2, $3, 'workspace.invitation.resend', 1, $4, 'invitation', $5, 'INVITATION_RESENT', $6, $7, $8)`,
      [
        actorId,
        input.operationId,
        input.workspaceId,
        intentDigest,
        input.invitationId,
        nextRevision.toString(),
        JSON.stringify({
          invitationId: input.invitationId,
          generation: nextGeneration,
        }),
        correlationId,
      ],
    );

    await client.query(
      `INSERT INTO solodesk.audit_events (
        workspace_id, actor_id, operation_id, target_type, target_id, revision,
        action, correlation_id, change_summary
      ) VALUES ($1, $2, $3, 'invitation', $4, $5, 'workspace.invitation.resend', $6, $7)`,
      [
        input.workspaceId,
        actorId,
        input.operationId,
        input.invitationId,
        nextRevision.toString(),
        correlationId,
        JSON.stringify({
          recipientEmail: inv.recipient_email,
          role: inv.role,
          generation: nextGeneration,
        }),
      ],
    );

    return {
      status: "accepted" as const,
      operationId: input.operationId,
      workspaceId: input.workspaceId,
      targetId: input.invitationId,
      revision: nextRevision.toString(),
      code: "INVITATION_RESENT",
      correlationId,
    };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

export interface RevokeInvitationInput {
  operationId: string;
  commandVersion?: 1;
  workspaceId: string;
  invitationId: string;
  expectedInvitationRevision: string;
}

export async function revokeWorkspaceInvitation(
  input: RevokeInvitationInput,
  actorSession?: { user: { id: string } } | null,
  clientOverride?: PoolClient,
): Promise<{
  status: "accepted";
  replayed?: boolean;
  operationId: string;
  workspaceId: string;
  targetId: string;
  revision: string;
  code: string;
  correlationId: string;
}> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  validateUUID(input.operationId, "operationId");
  validateUUID(input.workspaceId, "workspaceId");
  validateUUID(input.invitationId, "invitationId");
  validateDecimalString(
    input.expectedInvitationRevision,
    "expectedInvitationRevision",
  );

  const intentDigest = computeIntentDigest({
    kind: "workspace.invitation.revoke",
    commandVersion: 1,
    workspaceId: input.workspaceId,
    expectedRevision: input.expectedInvitationRevision,
    payload: {
      invitationId: input.invitationId,
    },
  });

  const runWithClient = async (client: PoolClient) => {
    // Check previous receipt
    const existingReceipt = await client.query(
      `SELECT * FROM solodesk.command_receipts WHERE actor_id = $1 AND operation_id = $2`,
      [actorId, input.operationId],
    );
    if (existingReceipt.rows.length > 0) {
      const r = existingReceipt.rows[0];
      if (r.intent_digest !== intentDigest) {
        throw new WorkspaceError(
          "OPERATION_CONFLICT",
          "Operation conflict: different intent",
          409,
        );
      }
      return {
        status: "accepted" as const,
        replayed: true,
        operationId: input.operationId,
        workspaceId: r.workspace_id,
        targetId: r.target_id,
        revision: r.result_revision,
        code: r.result_code,
        correlationId: r.correlation_id,
      };
    }

    // Lock workspace
    await client.query(
      `SELECT * FROM solodesk.workspaces WHERE id = $1 FOR UPDATE`,
      [input.workspaceId],
    );

    // Check actor grant workspace.invites.manage
    const inviterMemRes = await client.query(
      `SELECT m.id, m.role FROM solodesk.workspace_memberships m
       JOIN solodesk.workspace_grants g ON g.membership_id = m.id
       WHERE m.workspace_id = $1 AND m.user_id = $2 AND m.status = 'active'
         AND g.action = 'workspace.invites.manage'
       LIMIT 1`,
      [input.workspaceId, actorId],
    );
    if (inviterMemRes.rows.length === 0) {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Forbidden: invites.manage required",
        403,
      );
    }
    const inviter = inviterMemRes.rows[0];

    // Fetch invitation
    const invRes = await client.query(
      `SELECT * FROM solodesk.workspace_invitations WHERE id = $1 AND workspace_id = $2`,
      [input.invitationId, input.workspaceId],
    );
    if (invRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Invitation not found",
        404,
      );
    }
    const inv = invRes.rows[0];

    // Role ceiling: Admin cannot revoke admin invitations
    if (inviter.role === "admin" && inv.role === "admin") {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Forbidden: admin cannot manage admin invitations",
        403,
      );
    }

    if (inv.status === "revoked") {
      if (inv.revision.toString() === input.expectedInvitationRevision) {
        return {
          status: "accepted" as const,
          operationId: input.operationId,
          workspaceId: input.workspaceId,
          targetId: input.invitationId,
          revision: inv.revision.toString(),
          code: "INVITATION_REVOKED",
          correlationId: randomUUID(),
        };
      }
      throw new WorkspaceError(
        "REVISION_CONFLICT",
        "Invitation revision mismatch",
        409,
      );
    }

    if (inv.status === "accepted") {
      throw new WorkspaceError(
        "INVITATION_UNAVAILABLE",
        "Cannot revoke an accepted invitation",
        400,
      );
    }

    if (inv.revision.toString() !== input.expectedInvitationRevision) {
      throw new WorkspaceError(
        "REVISION_CONFLICT",
        "Invitation revision mismatch",
        409,
      );
    }

    const nextRevision = BigInt(inv.revision) + BigInt(1);

    // Revoke invitation
    await client.query(
      `UPDATE solodesk.workspace_invitations
       SET status = 'revoked', revoked_at = clock_timestamp(), revoked_by = $1,
           revision = $2, updated_at = clock_timestamp()
       WHERE id = $3`,
      [inviter.id, nextRevision.toString(), input.invitationId],
    );

    // Cancel pending outbox delivery
    await client.query(
      `UPDATE solodesk.outbox_events SET status = 'cancelled'
       WHERE workspace_id = $1 AND target_id = $2 AND status = 'pending'`,
      [input.workspaceId, input.invitationId],
    );

    const correlationId = randomUUID();
    await client.query(
      `INSERT INTO solodesk.command_receipts (
        actor_id, operation_id, workspace_id, kind, command_version,
        intent_digest, target_type, target_id, result_code, result_revision,
        result, correlation_id
      ) VALUES ($1, $2, $3, 'workspace.invitation.revoke', 1, $4, 'invitation', $5, 'INVITATION_REVOKED', $6, $7, $8)`,
      [
        actorId,
        input.operationId,
        input.workspaceId,
        intentDigest,
        input.invitationId,
        nextRevision.toString(),
        JSON.stringify({ invitationId: input.invitationId, status: "revoked" }),
        correlationId,
      ],
    );

    await client.query(
      `INSERT INTO solodesk.audit_events (
        workspace_id, actor_id, operation_id, target_type, target_id, revision,
        action, correlation_id, change_summary
      ) VALUES ($1, $2, $3, 'invitation', $4, $5, 'workspace.invitation.revoke', $6, $7)`,
      [
        input.workspaceId,
        actorId,
        input.operationId,
        input.invitationId,
        nextRevision.toString(),
        correlationId,
        JSON.stringify({
          recipientEmail: inv.recipient_email,
          status: "revoked",
        }),
      ],
    );

    return {
      status: "accepted" as const,
      operationId: input.operationId,
      workspaceId: input.workspaceId,
      targetId: input.invitationId,
      revision: nextRevision.toString(),
      code: "INVITATION_REVOKED",
      correlationId,
    };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

// --- Read Projections: Invitations & Members ---

export async function listWorkspaceInvitations(
  workspaceId: string,
  actorSession?: { user: { id: string } } | null,
  clientOverride?: PoolClient,
): Promise<
  Array<{
    id: string;
    recipientEmail: string;
    role: string;
    status: string;
    generation: number;
    expiresAt: string;
    createdAt: string;
    revision: string;
  }>
> {
  validateUUID(workspaceId, "workspaceId");
  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  const runWithClient = async (client: PoolClient) => {
    const grant = await client.query(
      `SELECT g.action FROM solodesk.workspace_grants g
       JOIN solodesk.workspace_memberships m ON m.id = g.membership_id
       WHERE m.workspace_id = $1 AND m.user_id = $2 AND m.status = 'active'
         AND g.action = 'workspace.invites.manage' LIMIT 1`,
      [workspaceId, actorId],
    );
    if (grant.rows.length === 0) {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Forbidden: invites.manage required",
        403,
      );
    }

    const res = await client.query(
      `SELECT id, recipient_email, role, status, generation, expires_at, created_at, revision
       FROM solodesk.workspace_invitations
       WHERE workspace_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [workspaceId],
    );

    return res.rows.map((row) => ({
      id: row.id,
      recipientEmail: row.recipient_email,
      role: row.role,
      status: row.status,
      generation: Number(row.generation),
      expiresAt: new Date(row.expires_at).toISOString(),
      createdAt: new Date(row.created_at).toISOString(),
      revision: row.revision.toString(),
    }));
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

export async function listWorkspaceMembers(
  workspaceId: string,
  actorSession?: { user: { id: string } } | null,
  clientOverride?: PoolClient,
): Promise<
  Array<{
    id: string;
    userId: string;
    name?: string | null;
    email?: string | null;
    role: string;
    status: string;
    revision: string;
    createdAt: string;
  }>
> {
  validateUUID(workspaceId, "workspaceId");
  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  const runWithClient = async (client: PoolClient) => {
    const grant = await client.query(
      `SELECT g.action FROM solodesk.workspace_grants g
       JOIN solodesk.workspace_memberships m ON m.id = g.membership_id
       WHERE m.workspace_id = $1 AND m.user_id = $2 AND m.status = 'active'
         AND g.action = 'workspace.members.read' LIMIT 1`,
      [workspaceId, actorId],
    );
    if (grant.rows.length === 0) {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Forbidden: members.read required",
        403,
      );
    }

    const res = await client.query(
      `SELECT m.id, m.user_id, m.role, m.status, m.revision, m.created_at,
              u.name, u.email
       FROM solodesk.workspace_memberships m
       LEFT JOIN neon_auth."user" u ON u.id = m.user_id
       WHERE m.workspace_id = $1
       ORDER BY m.created_at ASC
       LIMIT 50`,
      [workspaceId],
    );

    return res.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name ?? null,
      email: row.email ?? null,
      role: row.role,
      status: row.status,
      revision: row.revision.toString(),
      createdAt: new Date(row.created_at).toISOString(),
    }));
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

// --- User Story 5: Member Management & Ownership Controls ---

export function verifyFreshReauth(session: unknown): void {
  if (process.env.SOLODESK_REAUTH_DISABLED === "true") {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Fresh reauthentication capability is currently disabled",
      503,
    );
  }
  const s = session as
    | {
        session?: {
          authAt?: string | Date | number;
          createdAt?: string | Date | number;
          updatedAt?: string | Date | number;
        };
      }
    | null
    | undefined;
  const authAt =
    s?.session?.authAt || s?.session?.createdAt || s?.session?.updatedAt;
  if (!authAt) {
    throw new WorkspaceError(
      "REAUTH_REQUIRED",
      "Fresh authentication required within 5 minutes",
      403,
    );
  }
  const authTime = new Date(authAt).getTime();
  if (!Number.isFinite(authTime) || Date.now() - authTime > 5 * 60 * 1000) {
    throw new WorkspaceError(
      "REAUTH_REQUIRED",
      "Fresh authentication required within 5 minutes",
      403,
    );
  }
}

export interface ChangeMemberRoleInput {
  operationId: string;
  commandVersion?: 1;
  workspaceId: string;
  membershipId: string;
  expectedMembershipRevision: string;
  role: WorkspaceRole;
}

export async function changeWorkspaceMemberRole(
  input: ChangeMemberRoleInput,
  actorSession?: { user: { id: string } } | null,
  clientOverride?: PoolClient,
): Promise<{
  status: "accepted";
  replayed?: boolean;
  operationId: string;
  workspaceId: string;
  targetId: string;
  revision: string;
  code: string;
  correlationId: string;
}> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  validateUUID(input.operationId, "operationId");
  validateUUID(input.workspaceId, "workspaceId");
  validateUUID(input.membershipId, "membershipId");
  validateDecimalString(
    input.expectedMembershipRevision,
    "expectedMembershipRevision",
  );

  if (!["owner", "admin", "member"].includes(input.role)) {
    throw new WorkspaceError("VALIDATION", "Invalid role", 400);
  }

  const intentDigest = computeIntentDigest({
    kind: "workspace.member.role.change",
    commandVersion: 1,
    workspaceId: input.workspaceId,
    expectedRevision: input.expectedMembershipRevision,
    payload: {
      membershipId: input.membershipId,
      role: input.role,
    },
  });

  const runWithClient = async (client: PoolClient) => {
    // Check previous receipt
    const existingReceipt = await client.query(
      `SELECT * FROM solodesk.command_receipts WHERE actor_id = $1 AND operation_id = $2`,
      [actorId, input.operationId],
    );
    if (existingReceipt.rows.length > 0) {
      const r = existingReceipt.rows[0];
      if (r.intent_digest !== intentDigest) {
        throw new WorkspaceError(
          "OPERATION_CONFLICT",
          "Operation conflict: different intent",
          409,
        );
      }
      return {
        status: "accepted" as const,
        replayed: true,
        operationId: input.operationId,
        workspaceId: r.workspace_id,
        targetId: r.target_id,
        revision: r.result_revision,
        code: r.result_code,
        correlationId: r.correlation_id,
      };
    }

    // Lock workspace
    const wsRes = await client.query(
      `SELECT * FROM solodesk.workspaces WHERE id = $1 FOR UPDATE`,
      [input.workspaceId],
    );
    if (wsRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Workspace not found",
        404,
      );
    }
    const ws = wsRes.rows[0];

    // Check actor has workspace.members.role.change
    const actorMemRes = await client.query(
      `SELECT m.id, m.role FROM solodesk.workspace_memberships m
       JOIN solodesk.workspace_grants g ON g.membership_id = m.id
       WHERE m.workspace_id = $1 AND m.user_id = $2 AND m.status = 'active'
         AND g.action = 'workspace.members.role.change'
       LIMIT 1`,
      [input.workspaceId, actorId],
    );
    if (actorMemRes.rows.length === 0) {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Forbidden: Owner authority required",
        403,
      );
    }

    // Fetch target membership
    const targetRes = await client.query(
      `SELECT * FROM solodesk.workspace_memberships WHERE id = $1 AND workspace_id = $2`,
      [input.membershipId, input.workspaceId],
    );
    if (targetRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Target member not found",
        404,
      );
    }
    const target = targetRes.rows[0];

    if (target.status !== "active") {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Member is not active",
        400,
      );
    }
    if (target.revision.toString() !== input.expectedMembershipRevision) {
      throw new WorkspaceError(
        "REVISION_CONFLICT",
        "Member revision mismatch",
        409,
      );
    }

    // If target current role is owner or new role is owner: step-up required
    if (target.role === "owner" || input.role === "owner") {
      verifyFreshReauth(session);
    }

    // If target is currently owner and changing to a lower role (demotion)
    if (target.role === "owner" && input.role !== "owner") {
      if (ws.owner_id === target.user_id) {
        throw new WorkspaceError(
          "LAST_OWNER",
          "Cannot demote designated workspace owner without ownership transfer",
          409,
        );
      }
      const ownerCountRes = await client.query(
        `SELECT count(*)::int as count FROM solodesk.workspace_memberships
         WHERE workspace_id = $1 AND role = 'owner' AND status = 'active'`,
        [input.workspaceId],
      );
      if (ownerCountRes.rows[0].count <= 1) {
        throw new WorkspaceError(
          "LAST_OWNER",
          "Cannot demote the last workspace owner",
          409,
        );
      }
    }

    const nextRev = BigInt(target.revision) + BigInt(1);
    await client.query(
      `UPDATE solodesk.workspace_memberships
       SET role = $1, revision = $2, updated_at = clock_timestamp()
       WHERE id = $3`,
      [input.role, nextRev.toString(), input.membershipId],
    );

    // Replace grants
    await client.query(
      `DELETE FROM solodesk.workspace_grants WHERE workspace_id = $1 AND membership_id = $2`,
      [input.workspaceId, input.membershipId],
    );
    const grants = ROLE_GRANTS[input.role];
    for (const action of grants) {
      await client.query(
        `INSERT INTO solodesk.workspace_grants (
          workspace_id, membership_id, action, scope_type, scope_id
        ) VALUES ($1, $2, $3, 'workspace', $1)`,
        [input.workspaceId, input.membershipId, action],
      );
    }

    const correlationId = randomUUID();
    await client.query(
      `INSERT INTO solodesk.command_receipts (
        actor_id, operation_id, workspace_id, kind, command_version,
        intent_digest, target_type, target_id, result_code, result_revision,
        result, correlation_id
      ) VALUES ($1, $2, $3, 'workspace.member.role.change', 1, $4, 'membership', $5, 'MEMBER_ROLE_CHANGED', $6, $7, $8)`,
      [
        actorId,
        input.operationId,
        input.workspaceId,
        intentDigest,
        input.membershipId,
        nextRev.toString(),
        JSON.stringify({ membershipId: input.membershipId, role: input.role }),
        correlationId,
      ],
    );

    await client.query(
      `INSERT INTO solodesk.audit_events (
        workspace_id, actor_id, operation_id, target_type, target_id, revision,
        action, correlation_id, change_summary
      ) VALUES ($1, $2, $3, 'membership', $4, $5, 'workspace.member.role.change', $6, $7)`,
      [
        input.workspaceId,
        actorId,
        input.operationId,
        input.membershipId,
        nextRev.toString(),
        correlationId,
        JSON.stringify({ membershipId: input.membershipId, role: input.role }),
      ],
    );

    return {
      status: "accepted" as const,
      operationId: input.operationId,
      workspaceId: input.workspaceId,
      targetId: input.membershipId,
      revision: nextRev.toString(),
      code: "MEMBER_ROLE_CHANGED",
      correlationId,
    };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

export interface RemoveMemberInput {
  operationId: string;
  commandVersion?: 1;
  workspaceId: string;
  membershipId: string;
  expectedMembershipRevision: string;
}

export async function removeWorkspaceMember(
  input: RemoveMemberInput,
  actorSession?: { user: { id: string } } | null,
  clientOverride?: PoolClient,
): Promise<{
  status: "accepted";
  replayed?: boolean;
  operationId: string;
  workspaceId: string;
  targetId: string;
  revision: string;
  code: string;
  correlationId: string;
}> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  validateUUID(input.operationId, "operationId");
  validateUUID(input.workspaceId, "workspaceId");
  validateUUID(input.membershipId, "membershipId");
  validateDecimalString(
    input.expectedMembershipRevision,
    "expectedMembershipRevision",
  );

  const intentDigest = computeIntentDigest({
    kind: "workspace.member.remove",
    commandVersion: 1,
    workspaceId: input.workspaceId,
    expectedRevision: input.expectedMembershipRevision,
    payload: {
      membershipId: input.membershipId,
    },
  });

  const runWithClient = async (client: PoolClient) => {
    // Check previous receipt
    const existingReceipt = await client.query(
      `SELECT * FROM solodesk.command_receipts WHERE actor_id = $1 AND operation_id = $2`,
      [actorId, input.operationId],
    );
    if (existingReceipt.rows.length > 0) {
      const r = existingReceipt.rows[0];
      if (r.intent_digest !== intentDigest) {
        throw new WorkspaceError(
          "OPERATION_CONFLICT",
          "Operation conflict: different intent",
          409,
        );
      }
      return {
        status: "accepted" as const,
        replayed: true,
        operationId: input.operationId,
        workspaceId: r.workspace_id,
        targetId: r.target_id,
        revision: r.result_revision,
        code: r.result_code,
        correlationId: r.correlation_id,
      };
    }

    // Lock workspace
    const wsRes = await client.query(
      `SELECT * FROM solodesk.workspaces WHERE id = $1 FOR UPDATE`,
      [input.workspaceId],
    );
    if (wsRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Workspace not found",
        404,
      );
    }
    const ws = wsRes.rows[0];

    // Check actor membership and grant workspace.members.remove
    const actorMemRes = await client.query(
      `SELECT m.id, m.role FROM solodesk.workspace_memberships m
       JOIN solodesk.workspace_grants g ON g.membership_id = m.id
       WHERE m.workspace_id = $1 AND m.user_id = $2 AND m.status = 'active'
         AND g.action = 'workspace.members.remove'
       LIMIT 1`,
      [input.workspaceId, actorId],
    );
    if (actorMemRes.rows.length === 0) {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Forbidden: members.remove required",
        403,
      );
    }
    const actorMem = actorMemRes.rows[0];

    // Fetch target member
    const targetRes = await client.query(
      `SELECT * FROM solodesk.workspace_memberships WHERE id = $1 AND workspace_id = $2`,
      [input.membershipId, input.workspaceId],
    );
    if (targetRes.rows.length === 0) {
      throw new WorkspaceError("RESOURCE_UNAVAILABLE", "Member not found", 404);
    }
    const target = targetRes.rows[0];

    if (target.user_id === actorId) {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Use leaveWorkspace to leave the team",
        400,
      );
    }
    if (target.status !== "active") {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Member is not active",
        400,
      );
    }
    if (target.revision.toString() !== input.expectedMembershipRevision) {
      throw new WorkspaceError(
        "REVISION_CONFLICT",
        "Member revision mismatch",
        409,
      );
    }

    // Role ceiling checks
    if (actorMem.role === "admin") {
      if (target.role !== "member") {
        throw new WorkspaceError(
          "FORBIDDEN",
          "Forbidden: Admin can only remove Members",
          403,
        );
      }
    } else if (actorMem.role === "owner") {
      if (target.role === "owner") {
        verifyFreshReauth(session);
        if (ws.owner_id === target.user_id) {
          throw new WorkspaceError(
            "LAST_OWNER",
            "Cannot remove designated workspace owner",
            409,
          );
        }
        const ownerCountRes = await client.query(
          `SELECT count(*)::int as count FROM solodesk.workspace_memberships
           WHERE workspace_id = $1 AND role = 'owner' AND status = 'active'`,
          [input.workspaceId],
        );
        if (ownerCountRes.rows[0].count <= 1) {
          throw new WorkspaceError(
            "LAST_OWNER",
            "Cannot remove the last workspace owner",
            409,
          );
        }
      }
    }

    const nextRev = BigInt(target.revision) + BigInt(1);
    await client.query(
      `UPDATE solodesk.workspace_memberships
       SET status = 'revoked', revoked_at = clock_timestamp(), revision = $1, updated_at = clock_timestamp()
       WHERE id = $2`,
      [nextRev.toString(), input.membershipId],
    );

    // Delete grants
    await client.query(
      `DELETE FROM solodesk.workspace_grants WHERE workspace_id = $1 AND membership_id = $2`,
      [input.workspaceId, input.membershipId],
    );

    // Cancel pending outbox events queued by this member
    await client.query(
      `UPDATE solodesk.outbox_events SET status = 'cancelled'
       WHERE workspace_id = $1 AND actor_id = $2 AND status = 'pending'`,
      [input.workspaceId, target.user_id],
    );

    const correlationId = randomUUID();
    await client.query(
      `INSERT INTO solodesk.command_receipts (
        actor_id, operation_id, workspace_id, kind, command_version,
        intent_digest, target_type, target_id, result_code, result_revision,
        result, correlation_id
      ) VALUES ($1, $2, $3, 'workspace.member.remove', 1, $4, 'membership', $5, 'MEMBER_REMOVED', $6, $7, $8)`,
      [
        actorId,
        input.operationId,
        input.workspaceId,
        intentDigest,
        input.membershipId,
        nextRev.toString(),
        JSON.stringify({ membershipId: input.membershipId, status: "revoked" }),
        correlationId,
      ],
    );

    await client.query(
      `INSERT INTO solodesk.audit_events (
        workspace_id, actor_id, operation_id, target_type, target_id, revision,
        action, correlation_id, change_summary
      ) VALUES ($1, $2, $3, 'membership', $4, $5, 'workspace.member.remove', $6, $7)`,
      [
        input.workspaceId,
        actorId,
        input.operationId,
        input.membershipId,
        nextRev.toString(),
        correlationId,
        JSON.stringify({ membershipId: input.membershipId, status: "revoked" }),
      ],
    );

    return {
      status: "accepted" as const,
      operationId: input.operationId,
      workspaceId: input.workspaceId,
      targetId: input.membershipId,
      revision: nextRev.toString(),
      code: "MEMBER_REMOVED",
      correlationId,
    };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

export interface LeaveWorkspaceInput {
  operationId: string;
  commandVersion?: 1;
  workspaceId: string;
  expectedMembershipRevision: string;
}

export async function leaveWorkspace(
  input: LeaveWorkspaceInput,
  actorSession?: { user: { id: string } } | null,
  clientOverride?: PoolClient,
): Promise<{
  status: "accepted";
  replayed?: boolean;
  operationId: string;
  code: string;
}> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  validateUUID(input.operationId, "operationId");
  validateUUID(input.workspaceId, "workspaceId");
  validateDecimalString(
    input.expectedMembershipRevision,
    "expectedMembershipRevision",
  );

  const intentDigest = computeIntentDigest({
    kind: "workspace.member.leave",
    commandVersion: 1,
    workspaceId: input.workspaceId,
    expectedRevision: input.expectedMembershipRevision,
    payload: {},
  });

  const runWithClient = async (client: PoolClient) => {
    // Check previous receipt
    const existingReceipt = await client.query(
      `SELECT * FROM solodesk.command_receipts WHERE actor_id = $1 AND operation_id = $2`,
      [actorId, input.operationId],
    );
    if (existingReceipt.rows.length > 0) {
      const r = existingReceipt.rows[0];
      if (r.intent_digest !== intentDigest) {
        throw new WorkspaceError(
          "OPERATION_CONFLICT",
          "Operation conflict: different intent",
          409,
        );
      }
      return {
        status: "accepted" as const,
        replayed: true,
        operationId: input.operationId,
        code: r.result_code,
      };
    }

    // Lock workspace
    const wsRes = await client.query(
      `SELECT * FROM solodesk.workspaces WHERE id = $1 FOR UPDATE`,
      [input.workspaceId],
    );
    if (wsRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Workspace not found",
        404,
      );
    }
    const ws = wsRes.rows[0];

    // Fetch actor's own active membership
    const memRes = await client.query(
      `SELECT * FROM solodesk.workspace_memberships
       WHERE workspace_id = $1 AND user_id = $2 AND status = 'active'`,
      [input.workspaceId, actorId],
    );
    if (memRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Active membership not found",
        404,
      );
    }
    const mem = memRes.rows[0];

    if (mem.revision.toString() !== input.expectedMembershipRevision) {
      throw new WorkspaceError(
        "REVISION_CONFLICT",
        "Membership revision mismatch",
        409,
      );
    }

    // Designated owner check
    if (ws.owner_id === actorId) {
      throw new WorkspaceError(
        "LAST_OWNER",
        "Designated workspace owner must transfer ownership before leaving",
        409,
      );
    }

    // If owner: check active owner count
    if (mem.role === "owner") {
      const ownerCountRes = await client.query(
        `SELECT count(*)::int as count FROM solodesk.workspace_memberships
         WHERE workspace_id = $1 AND role = 'owner' AND status = 'active'`,
        [input.workspaceId],
      );
      if (ownerCountRes.rows[0].count <= 1) {
        throw new WorkspaceError(
          "LAST_OWNER",
          "The last owner cannot leave the team",
          409,
        );
      }
    }

    const nextRev = BigInt(mem.revision) + BigInt(1);
    await client.query(
      `UPDATE solodesk.workspace_memberships
       SET status = 'revoked', revoked_at = clock_timestamp(), revision = $1, updated_at = clock_timestamp()
       WHERE id = $2`,
      [nextRev.toString(), mem.id],
    );

    // Delete grants
    await client.query(
      `DELETE FROM solodesk.workspace_grants WHERE workspace_id = $1 AND membership_id = $2`,
      [input.workspaceId, mem.id],
    );

    const correlationId = randomUUID();
    await client.query(
      `INSERT INTO solodesk.command_receipts (
        actor_id, operation_id, workspace_id, kind, command_version,
        intent_digest, target_type, target_id, result_code, result_revision,
        result, correlation_id
      ) VALUES ($1, $2, $3, 'workspace.member.leave', 1, $4, 'membership', $5, 'MEMBER_LEFT', $6, $7, $8)`,
      [
        actorId,
        input.operationId,
        input.workspaceId,
        intentDigest,
        mem.id,
        nextRev.toString(),
        JSON.stringify({ membershipId: mem.id, status: "revoked" }),
        correlationId,
      ],
    );

    await client.query(
      `INSERT INTO solodesk.audit_events (
        workspace_id, actor_id, operation_id, target_type, target_id, revision,
        action, correlation_id, change_summary
      ) VALUES ($1, $2, $3, 'membership', $4, $5, 'workspace.member.leave', $6, $7)`,
      [
        input.workspaceId,
        actorId,
        input.operationId,
        mem.id,
        nextRev.toString(),
        correlationId,
        JSON.stringify({ membershipId: mem.id, status: "revoked" }),
      ],
    );

    return {
      status: "accepted" as const,
      operationId: input.operationId,
      code: "MEMBER_LEFT",
    };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}

export interface TransferOwnershipInput {
  operationId: string;
  commandVersion?: 1;
  workspaceId: string;
  targetMembershipId: string;
  expectedWorkspaceRevision: string;
  expectedTargetRevision: string;
  expectedInitiatorRevision: string;
}

export async function transferWorkspaceOwnership(
  input: TransferOwnershipInput,
  actorSession?: { user: { id: string } } | null,
  clientOverride?: PoolClient,
): Promise<{
  status: "accepted";
  replayed?: boolean;
  operationId: string;
  workspaceId: string;
  targetId: string;
  revision: string;
  code: string;
  correlationId: string;
}> {
  if (!isWorkspacesEnabled()) {
    throw new WorkspaceError(
      "CAPABILITY_DISABLED",
      "Workspaces feature is disabled",
      503,
    );
  }

  const session = actorSession || (await currentSession());
  if (!session?.user?.id) {
    throw new WorkspaceError("AUTH_REQUIRED", "Authentication required", 401);
  }
  const actorId = session.user.id;

  validateUUID(input.operationId, "operationId");
  validateUUID(input.workspaceId, "workspaceId");
  validateUUID(input.targetMembershipId, "targetMembershipId");
  validateDecimalString(
    input.expectedWorkspaceRevision,
    "expectedWorkspaceRevision",
  );
  validateDecimalString(input.expectedTargetRevision, "expectedTargetRevision");
  validateDecimalString(
    input.expectedInitiatorRevision,
    "expectedInitiatorRevision",
  );

  const intentDigest = computeIntentDigest({
    kind: "workspace.ownership.transfer",
    commandVersion: 1,
    workspaceId: input.workspaceId,
    expectedRevision: input.expectedWorkspaceRevision,
    payload: {
      targetMembershipId: input.targetMembershipId,
      expectedTargetRevision: input.expectedTargetRevision,
      expectedInitiatorRevision: input.expectedInitiatorRevision,
    },
  });

  const runWithClient = async (client: PoolClient) => {
    // Check previous receipt
    const existingReceipt = await client.query(
      `SELECT * FROM solodesk.command_receipts WHERE actor_id = $1 AND operation_id = $2`,
      [actorId, input.operationId],
    );
    if (existingReceipt.rows.length > 0) {
      const r = existingReceipt.rows[0];
      if (r.intent_digest !== intentDigest) {
        throw new WorkspaceError(
          "OPERATION_CONFLICT",
          "Operation conflict: different intent",
          409,
        );
      }
      return {
        status: "accepted" as const,
        replayed: true,
        operationId: input.operationId,
        workspaceId: r.workspace_id,
        targetId: r.target_id,
        revision: r.result_revision,
        code: r.result_code,
        correlationId: r.correlation_id,
      };
    }

    // Step-up reauthentication check
    verifyFreshReauth(session);

    // Lock workspace
    const wsRes = await client.query(
      `SELECT * FROM solodesk.workspaces WHERE id = $1 FOR UPDATE`,
      [input.workspaceId],
    );
    if (wsRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Workspace not found",
        404,
      );
    }
    const ws = wsRes.rows[0];

    // Initiator must be designated owner
    if (ws.owner_id !== actorId) {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Forbidden: only designated owner can transfer ownership",
        403,
      );
    }
    if (ws.revision.toString() !== input.expectedWorkspaceRevision) {
      throw new WorkspaceError(
        "REVISION_CONFLICT",
        "Workspace revision mismatch",
        409,
      );
    }

    // Query initiator membership
    const initMemRes = await client.query(
      `SELECT * FROM solodesk.workspace_memberships
       WHERE workspace_id = $1 AND user_id = $2 AND status = 'active'`,
      [input.workspaceId, actorId],
    );
    if (initMemRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Initiator membership not found",
        404,
      );
    }
    const initiatorMem = initMemRes.rows[0];
    if (initiatorMem.revision.toString() !== input.expectedInitiatorRevision) {
      throw new WorkspaceError(
        "REVISION_CONFLICT",
        "Initiator revision mismatch",
        409,
      );
    }

    // Query target membership
    const targetRes = await client.query(
      `SELECT * FROM solodesk.workspace_memberships WHERE id = $1 AND workspace_id = $2`,
      [input.targetMembershipId, input.workspaceId],
    );
    if (targetRes.rows.length === 0) {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Target membership not found",
        404,
      );
    }
    const targetMem = targetRes.rows[0];

    if (targetMem.user_id === actorId) {
      throw new WorkspaceError(
        "FORBIDDEN",
        "Cannot transfer ownership to yourself",
        400,
      );
    }
    if (targetMem.status !== "active") {
      throw new WorkspaceError(
        "RESOURCE_UNAVAILABLE",
        "Target member is not active",
        400,
      );
    }
    if (targetMem.revision.toString() !== input.expectedTargetRevision) {
      throw new WorkspaceError(
        "REVISION_CONFLICT",
        "Target revision mismatch",
        409,
      );
    }

    const nextWsRev = BigInt(ws.revision) + BigInt(1);
    const nextTargetRev = BigInt(targetMem.revision) + BigInt(1);
    const nextInitiatorRev = BigInt(initiatorMem.revision) + BigInt(1);

    // 1. Update workspace designated owner
    await client.query(
      `UPDATE solodesk.workspaces SET owner_id = $1, revision = $2, updated_at = clock_timestamp() WHERE id = $3`,
      [targetMem.user_id, nextWsRev.toString(), input.workspaceId],
    );

    // 2. Promote target to owner
    await client.query(
      `UPDATE solodesk.workspace_memberships SET role = 'owner', revision = $1, updated_at = clock_timestamp() WHERE id = $2`,
      [nextTargetRev.toString(), targetMem.id],
    );
    await client.query(
      `DELETE FROM solodesk.workspace_grants WHERE workspace_id = $1 AND membership_id = $2`,
      [input.workspaceId, targetMem.id],
    );
    for (const action of ROLE_GRANTS.owner) {
      await client.query(
        `INSERT INTO solodesk.workspace_grants (workspace_id, membership_id, action, scope_type, scope_id)
         VALUES ($1, $2, $3, 'workspace', $1)`,
        [input.workspaceId, targetMem.id, action],
      );
    }

    // 3. Demote initiator to admin
    await client.query(
      `UPDATE solodesk.workspace_memberships SET role = 'admin', revision = $1, updated_at = clock_timestamp() WHERE id = $2`,
      [nextInitiatorRev.toString(), initiatorMem.id],
    );
    await client.query(
      `DELETE FROM solodesk.workspace_grants WHERE workspace_id = $1 AND membership_id = $2`,
      [input.workspaceId, initiatorMem.id],
    );
    for (const action of ROLE_GRANTS.admin) {
      await client.query(
        `INSERT INTO solodesk.workspace_grants (workspace_id, membership_id, action, scope_type, scope_id)
         VALUES ($1, $2, $3, 'workspace', $1)`,
        [input.workspaceId, initiatorMem.id, action],
      );
    }

    const correlationId = randomUUID();
    await client.query(
      `INSERT INTO solodesk.command_receipts (
        actor_id, operation_id, workspace_id, kind, command_version,
        intent_digest, target_type, target_id, result_code, result_revision,
        result, correlation_id
      ) VALUES ($1, $2, $3, 'workspace.ownership.transfer', 1, $4, 'workspace', $5, 'OWNERSHIP_TRANSFERRED', $6, $7, $8)`,
      [
        actorId,
        input.operationId,
        input.workspaceId,
        intentDigest,
        input.workspaceId,
        nextWsRev.toString(),
        JSON.stringify({
          newOwnerUserId: targetMem.user_id,
          targetMembershipId: targetMem.id,
          demotedInitiatorMembershipId: initiatorMem.id,
        }),
        correlationId,
      ],
    );

    await client.query(
      `INSERT INTO solodesk.audit_events (
        workspace_id, actor_id, operation_id, target_type, target_id, revision,
        action, correlation_id, change_summary
      ) VALUES ($1, $2, $3, 'workspace', $4, $5, 'workspace.ownership.transfer', $6, $7)`,
      [
        input.workspaceId,
        actorId,
        input.operationId,
        input.workspaceId,
        nextWsRev.toString(),
        correlationId,
        JSON.stringify({
          newOwnerUserId: targetMem.user_id,
          targetMembershipId: targetMem.id,
        }),
      ],
    );

    return {
      status: "accepted" as const,
      operationId: input.operationId,
      workspaceId: input.workspaceId,
      targetId: input.targetMembershipId,
      revision: nextWsRev.toString(),
      code: "OWNERSHIP_TRANSFERRED",
      correlationId,
    };
  };

  if (clientOverride) return runWithClient(clientOverride);
  return withTransaction(runWithClient);
}
