import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
import ts from "typescript";

// Service loader to test lib/workspaces.ts without server-only or live DB
function loadWorkspacesService(adapters = {}) {
  const source = readFileSync(
    new URL("../lib/workspaces.ts", import.meta.url),
    "utf8",
  );
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
      if (name in adapters) return adapters[name];
      if (name === "node:crypto") return crypto;
      if (name === "@/lib/workspace-invitations") {
        return {
          encryptInvitationDelivery: () => ({
            encrypted: Buffer.from("mock-encrypted-delivery"),
            keyId: "mock-key-id",
          }),
        };
      }
      throw new Error(`Unexpected import in lib/workspaces.ts: ${name}`);
    },
    Intl,
    Array,
    BigInt,
    Buffer,
    Date,
    JSON,
    Set,
    String,
    process,
  });
  return {
    ...exports,
    // Keep synthetic identity and client injection at the test import boundary only.
    as(actor, client) {
      return loadWorkspacesService({
        ...adapters,
        "@/lib/auth/server": { currentSession: async () => actor },
        "@/lib/db": { db: { connect: async () => ({
          query: (sql, params) => /^(BEGIN|SET LOCAL|COMMIT|ROLLBACK)/.test(sql) ? Promise.resolve({ rows: [] }) : client.query(sql, params), release() {},
        }) } },
      });
    },
  };
}

function grantedWorkspaceActions(actorId) {
  const role =
    actorId === "user-member"
      ? "member"
      : actorId === "user-admin"
        ? "admin"
        : "owner";
  return {
    rows: [
      "workspace.read",
      "workspace.select",
      "workspace.settings.update",
      "workspace.members.read",
      "workspace.invites.manage",
      "workspace.members.remove",
      "workspace.members.role.change",
      "workspace.ownership.transfer",
      "workspace.members.leave",
    ].map((action) => ({ role, action })),
  };
}

test("workspace validators enforce C01/C02 constraints and reserved slugs", () => {
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => true,
      isOwnershipTransferEnabled: () => true,
    },
  });

  // 1. Slug validation
  assert.equal(ws.validateSlug("my-team"), "my-team");
  assert.equal(ws.validateSlug("team123"), "team123");
  assert.throws(() => ws.validateSlug("ab"), /between 3 and 63/);
  assert.throws(() => ws.validateSlug("a".repeat(64)), /between 3 and 63/);
  assert.equal(ws.validateSlug("My-Team"), "my-team");
  assert.throws(() => ws.validateSlug("-team"), /lowercase alphanumeric/);
  assert.throws(() => ws.validateSlug("team-"), /lowercase alphanumeric/);
  assert.throws(() => ws.validateSlug("app"), /Slug is reserved/);
  assert.throws(() => ws.validateSlug("api"), /Slug is reserved/);
  assert.throws(() => ws.validateSlug("auth"), /Slug is reserved/);
  assert.throws(() => ws.validateSlug("sign-in"), /Slug is reserved/);

  // 2. Name validation (Unicode code points)
  assert.equal(ws.validateWorkspaceName("Solo Studio"), "Solo Studio");
  assert.equal(ws.validateWorkspaceName("فريق العمل"), "فريق العمل");
  assert.throws(() => ws.validateWorkspaceName(""), /between 1 and 100/);
  assert.throws(() => ws.validateWorkspaceName("   "), /between 1 and 100/);
  assert.throws(
    () => ws.validateWorkspaceName("a".repeat(101)),
    /between 1 and 100/,
  );

  // 3. Timezone validation
  assert.equal(ws.validateTimezone("UTC"), "UTC");
  assert.equal(ws.validateTimezone("America/New_York"), "America/New_York");
  assert.equal(ws.validateTimezone("Asia/Riyadh"), "Asia/Riyadh");
  assert.throws(() => ws.validateTimezone("Fake/Zone"), /Invalid IANA/);

  // 4. Currency validation
  assert.equal(ws.validateCurrency("USD"), "USD");
  assert.equal(ws.validateCurrency("sar"), "SAR");
  assert.equal(ws.validateCurrency("EGP"), "EGP");
  assert.throws(() => ws.validateCurrency("XYZ"), /not an approved/);
  assert.throws(() => ws.validateCurrency("USDT"), /not an approved/);

  // 5. Locale validation
  assert.equal(ws.validateLocale("en"), "en");
  assert.equal(ws.validateLocale("ar"), "ar");
  assert.throws(() => ws.validateLocale("fr"), /must be 'en' or 'ar'/);

  // 6. Revision validation
  assert.equal(ws.validateRevisionString("1"), "1");
  assert.equal(ws.validateRevisionString("42"), "42");
  assert.throws(
    () => ws.validateRevisionString("0"),
    /positive decimal string/,
  );
  assert.throws(
    () => ws.validateRevisionString("-5"),
    /positive decimal string/,
  );
  assert.throws(
    () => ws.validateRevisionString("3.14"),
    /positive decimal string/,
  );
  assert.throws(
    () => ws.validateRevisionString(123),
    /positive decimal string/,
  );
});

test("canonical v1 intent digest is deterministic and sensitive to all payload mutations", () => {
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => true,
      isOwnershipTransferEnabled: () => true,
    },
  });

  const baseEnvelope = {
    kind: "workspace.create",
    commandVersion: 1,
    payload: {
      name: "Engineering Desk",
      slug: "eng-desk",
      timezone: "UTC",
      locale: "en",
      currency: "USD",
    },
  };

  const digest1 = ws.computeIntentDigest(baseEnvelope);
  const digest2 = ws.computeIntentDigest(baseEnvelope);
  assert.equal(digest1, digest2);
  assert.match(digest1, /^[a-f0-9]{64}$/);

  // Changing name changes digest
  const digestNameChange = ws.computeIntentDigest({
    ...baseEnvelope,
    payload: { ...baseEnvelope.payload, name: "Other Desk" },
  });
  assert.notEqual(digest1, digestNameChange);

  // Changing currency changes digest
  const digestCurrencyChange = ws.computeIntentDigest({
    ...baseEnvelope,
    payload: { ...baseEnvelope.payload, currency: "EUR" },
  });
  assert.notEqual(digest1, digestCurrencyChange);

  // Changing kind changes digest
  const digestKindChange = ws.computeIntentDigest({
    ...baseEnvelope,
    kind: "workspace.other",
  });
  assert.notEqual(digest1, digestKindChange);
});

test("createWorkspace executes atomic creation, prevents conflicts, and supports idempotent replay", async () => {
  let workspacesEnabled = true;
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": { isWorkspacesEnabled: () => workspacesEnabled },
  });

  const actor = { user: { id: "10000000-0000-0000-0000-000000000001" } };
  const input = {
    operationId: "20000000-0000-0000-0000-000000000001",
    name: "Alpha Workspace",
    slug: "alpha-workspace",
    timezone: "UTC",
    locale: "en",
    currency: "USD",
  };

  // 1. When capability is disabled, throws CAPABILITY_DISABLED
  workspacesEnabled = false;
  await assert.rejects(
    () => ws.as(actor, undefined).createWorkspace(input),
    (err) => err.code === "CAPABILITY_DISABLED" && err.statusCode === 503,
  );
  workspacesEnabled = true;

  // 2. In-memory client simulation
  const queries = [];
  const receipts = new Map();
  const slugs = new Set();

  const mockClient = {
    async query(sql, params = []) {
      if (
        sql.startsWith(
          "SELECT m.role, g.action FROM solodesk.workspace_memberships m",
        )
      ) {
        return grantedWorkspaceActions(params[1]);
      }

      queries.push({ sql, params });

      // Check receipt
      if (sql.includes("FROM solodesk.command_receipts")) {
        const key = `${params[0]}:${params[1]}`;
        const existing = receipts.get(key);
        return { rows: existing ? [existing] : [] };
      }

      // Check slug
      if (sql.includes("FROM solodesk.workspaces WHERE slug = $1")) {
        const slug = params[0];
        return { rows: slugs.has(slug) ? [{ id: "existing" }] : [] };
      }

      // Insert workspace
      if (sql.includes("INSERT INTO solodesk.workspaces")) {
        slugs.add(params[2]);
        return { rows: [] };
      }

      // Insert receipt
      if (sql.includes("INSERT INTO solodesk.command_receipts")) {
        const key = `${params[0]}:${params[1]}`;
        receipts.set(key, {
          actor_id: params[0],
          operation_id: params[1],
          workspace_id: params[2],
          intent_digest: params[3],
          target_id: params[2],
          result_code: "CREATED",
          result_revision: 1,
          result: JSON.parse(params[4]),
          correlation_id: params[5],
        });
        return { rows: [] };
      }

      return { rows: [] };
    },
  };

  // 3. Initial create succeeds
  const res1 = await ws.as(actor, mockClient).createWorkspace(input);
  assert.equal(res1.status, "accepted");
  assert.equal(res1.code, "CREATED");
  assert.equal(res1.revision, "1");
  assert.ok(res1.workspaceId);
  assert.equal(res1.operationId, input.operationId);

  // Verify grants were inserted for owner
  const grantQueries = queries.filter((q) =>
    q.sql.includes("solodesk.workspace_grants"),
  );
  assert.equal(grantQueries.length, ws.ROLE_GRANTS.owner.length);

  // 4. Same operation replay returns accepted with replayed: true
  const resReplay = await ws.as(actor, mockClient).createWorkspace(input);
  assert.equal(resReplay.status, "accepted");
  assert.equal(resReplay.replayed, true);
  assert.equal(resReplay.workspaceId, res1.workspaceId);
  assert.equal(resReplay.operationId, input.operationId);

  // 5. Same operationId with DIFFERENT intent returns 409 OPERATION_CONFLICT
  const conflictingInput = {
    ...input,
    name: "Different Name",
  };
  await assert.rejects(
    () => ws.as(actor, mockClient).createWorkspace(conflictingInput),
    (err) => err.code === "OPERATION_CONFLICT" && err.statusCode === 409,
  );

  // 6. New operationId with conflicting slug returns 409 SLUG_UNAVAILABLE
  const duplicateSlugInput = {
    ...input,
    operationId: "30000000-0000-0000-0000-000000000002",
  };
  await assert.rejects(
    () => ws.as(actor, mockClient).createWorkspace(duplicateSlugInput),
    (err) => err.code === "SLUG_UNAVAILABLE" && err.statusCode === 409,
  );
});

test("updateWorkspaceSettings checks revision, enforces member grants, and writes receipt", async () => {
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => true,
      isOwnershipTransferEnabled: () => true,
    },
  });

  const actor = { user: { id: "10000000-0000-0000-0000-000000000001" } };
  const workspaceId = "40000000-0000-0000-0000-000000000001";
  let workspaceRevision = 1n;
  let hasGrant = true;

  const mockClient = {
    async query(sql, params = []) {
      if (
        sql.startsWith(
          "SELECT m.role, g.action FROM solodesk.workspace_memberships m",
        )
      ) {
        if (!hasGrant) return { rows: [] };
        return grantedWorkspaceActions(params[1]);
      }

      if (sql.includes("FROM solodesk.command_receipts")) {
        return { rows: [] };
      }
      if (sql.includes("FROM solodesk.workspaces WHERE id = $1 FOR UPDATE")) {
        return {
          rows: [
            {
              id: workspaceId,
              name: "Old Name",
              slug: "old-slug",
              timezone: "UTC",
              locale: "en",
              currency: "USD",
              revision: workspaceRevision.toString(),
            },
          ],
        };
      }
      if (sql.includes("FROM solodesk.workspace_memberships")) {
        if (!hasGrant) return { rows: [] };
        return {
          rows: [
            {
              id: "mem-1",
              role: "admin",
              status: "active",
              action: "workspace.settings.update",
            },
          ],
        };
      }
      if (sql.includes("UPDATE solodesk.workspaces")) {
        workspaceRevision++;
        return { rows: [] };
      }
      return { rows: [] };
    },
  };

  const updateInput = {
    operationId: "50000000-0000-0000-0000-000000000001",
    workspaceId,
    expectedRevision: "1",
    name: "Updated Name",
    timezone: "Europe/London",
    locale: "en",
    currency: "GBP",
  };

  // 1. Revision conflict rejection
  await assert.rejects(
    () =>
      ws.as(actor, mockClient).updateWorkspaceSettings({ ...updateInput, expectedRevision: "99" }),
    (err) => err.code === "REVISION_CONFLICT" && err.statusCode === 409,
  );

  // 2. Forbidden if member lacks grant
  hasGrant = false;
  await assert.rejects(
    () => ws.as(actor, mockClient).updateWorkspaceSettings(updateInput),
    (err) => err.code === "FORBIDDEN" && err.statusCode === 403,
  );
  hasGrant = true;

  // 3. Successful update increments revision
  const res = await ws.as(actor, mockClient).updateWorkspaceSettings(updateInput);
  assert.equal(res.status, "accepted");
  assert.equal(res.revision, "2");
  assert.equal(res.code, "UPDATED");
});

test("list, context, and receipt access controls enforce tenant isolation and prevent authority leakage", async () => {
  const actor = { user: { id: "user-alice" } };
  const foreignActor = { user: { id: "user-eve" } };
  const wsId1 = "10000000-0000-0000-0000-000000000001";
  const wsIdForeign = "90000000-0000-0000-0000-000000000009";

  let isRevoked = false;

  const mockClient = {
    async query(sql, params = []) {
      if (
        sql.startsWith(
          "SELECT m.role, g.action FROM solodesk.workspace_memberships m",
        )
      ) {
        if (isRevoked) return { rows: [] };
        return grantedWorkspaceActions(params[1]);
      }

      // List workspaces
      if (
        sql.includes("FROM solodesk.workspace_memberships m") &&
        sql.includes("JOIN solodesk.workspaces w")
      ) {
        const actorId = params[0];
        if (actorId === "user-alice") {
          return {
            rows: [
              {
                id: wsId1,
                name: "Alice Team",
                slug: "alice-team",
                role: "owner",
                revision: "1",
              },
            ],
          };
        }
        return { rows: [] };
      }

      // Get workspace context
      if (
        sql.includes("SELECT w.id, w.name, w.slug") &&
        sql.includes("FROM solodesk.workspaces w")
      ) {
        const targetWsId = params[0];
        const actorId = params[1];
        if (targetWsId === wsId1 && actorId === "user-alice" && !isRevoked) {
          return {
            rows: [
              {
                id: wsId1,
                name: "Alice Team",
                slug: "alice-team",
                timezone: "UTC",
                locale: "en",
                currency: "USD",
                revision: 1,
                membership_id: "mem-alice",
                role: "owner",
                membership_revision: 1,
              },
            ],
          };
        }
        return { rows: [] };
      }

      // Grants query
      if (sql.includes("FROM solodesk.workspace_grants")) {
        return {
          rows: [
            { action: "workspace.read" },
            { action: "workspace.settings.update" },
          ],
        };
      }

      // Receipts query
      if (sql.includes("FROM solodesk.command_receipts")) {
        const actorId = params[0];
        const opId = params[1];
        if (actorId === "user-alice" && opId === "op-1") {
          return {
            rows: [
              {
                actor_id: "user-alice",
                operation_id: "op-1",
                workspace_id: wsId1,
                target_id: wsId1,
                kind: "workspace.settings.update",
                result_code: "UPDATED",
                result_revision: 2,
                correlation_id: "corr-1",
              },
            ],
          };
        }
        if (actorId === "user-alice" && opId === "op-leave") {
          return {
            rows: [
              {
                actor_id: "user-alice",
                operation_id: "op-leave",
                workspace_id: wsId1,
                target_id: wsId1,
                kind: "workspace.member.leave",
                result_code: "LEFT",
                result_revision: 3,
                correlation_id: "corr-leave",
              },
            ],
          };
        }
        return { rows: [] };
      }

      // Member check in receipt status
      if (
        sql.includes(
          "SELECT 1 FROM solodesk.workspace_memberships WHERE workspace_id = $1 AND user_id = $2 AND status = 'active'",
        )
      ) {
        const actorId = params[1];
        if (actorId === "user-alice" && !isRevoked) {
          return { rows: [{ 1: 1 }] };
        }
        return { rows: [] };
      }

      return { rows: [] };
    },
  };

  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => actor },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => true,
      isOwnershipTransferEnabled: () => true,
    },
  });

  // 1. List workspaces returns own workspaces
  const list = await ws.as(actor, mockClient).listWorkspaces({ limit: 10 });
  assert.equal(list.items.length, 1);
  assert.equal(list.items[0].id, wsId1);

  // Foreign actor gets empty list, not foreign workspaces
  const foreignList = await ws.as(foreignActor, mockClient).listWorkspaces({ limit: 10 });
  assert.equal(foreignList.items.length, 0);

  // Cursor validation: malformed cursor rejected
  await assert.rejects(
    () => ws.as(actor, mockClient).listWorkspaces({ cursor: "invalid-uuid" }),
    (err) => err.code === "VALIDATION" && err.statusCode === 400,
  );

  // 2. Context projection for own workspace
  const ctx = await ws.as(actor, mockClient).getWorkspaceContext(wsId1);
  assert.equal(ctx.workspace.id, wsId1);
  assert.equal(ctx.membership.role, "owner");
  assert.ok(ctx.capabilities.includes("workspace.read"));
  assert.ok(ctx.capabilities.includes("workspace.settings.update"));

  // Foreign/unknown workspace returns RESOURCE_UNAVAILABLE (404)
  await assert.rejects(
    () => ws.as(actor, mockClient).getWorkspaceContext(wsIdForeign),
    (err) => err.code === "RESOURCE_UNAVAILABLE" && err.statusCode === 404,
  );

  // Revocation of membership denies context projection
  isRevoked = true;
  await assert.rejects(
    () => ws.as(actor, mockClient).getWorkspaceContext(wsId1),
    (err) => err.code === "RESOURCE_UNAVAILABLE" && err.statusCode === 404,
  );
  isRevoked = false;

  // 3. Receipt reconciliation
  const rMockClient = {
    ...mockClient,
    async query(sql, params = []) {
      if (
        sql.startsWith(
          "SELECT m.role, g.action FROM solodesk.workspace_memberships m",
        )
      ) {
        if (isRevoked) return { rows: [] };
        return grantedWorkspaceActions(params[1]);
      }

      if (sql.includes("FROM solodesk.command_receipts")) {
        return {
          rows: [
            {
              actor_id: params[0],
              operation_id: params[1],
              workspace_id: wsId1,
              target_id: wsId1,
              kind: "workspace.settings.update",
              result_code: "UPDATED",
              result_revision: 2,
              correlation_id: "corr-1",
            },
          ],
        };
      }
      return mockClient.query(sql, params);
    },
  };

  const receiptRes = await ws.as(actor, rMockClient).getReceiptStatus("10000000-0000-0000-0000-000000000001");
  assert.equal(receiptRes.status, "accepted");
  assert.equal(receiptRes.code, "UPDATED");
  assert.equal(receiptRes.revision, "2");
  // Ensure sensitive digest or payload is NOT returned
  assert.equal(receiptRes.intent_digest, undefined);
  assert.equal(receiptRes.result, undefined);

  // Foreign actor trying to view Alice's receipt returns RESOURCE_UNAVAILABLE
  await assert.rejects(
    () =>
      ws.as(foreignActor, mockClient).getReceiptStatus("10000000-0000-0000-0000-000000000001"),
    (err) => err.code === "RESOURCE_UNAVAILABLE" && err.statusCode === 404,
  );

  // Revoked member attempting to view prior receipt returns RESOURCE_UNAVAILABLE
  isRevoked = true;
  await assert.rejects(
    () =>
      ws.as(actor, rMockClient).getReceiptStatus("10000000-0000-0000-0000-000000000001"),
    (err) => err.code === "RESOURCE_UNAVAILABLE" && err.statusCode === 404,
  );
  isRevoked = false;
});

test("invitation issuance and acceptance enforce role ceilings, recipient matching, and outbox encryption", async () => {
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => true,
      isOwnershipTransferEnabled: () => true,
    },
  });

  // 1. Email validation
  assert.equal(
    ws.validateEmail("colleague@example.com"),
    "colleague@example.com",
  );
  assert.equal(ws.validateEmail("  user@domain.co.uk  "), "user@domain.co.uk");
  assert.throws(() => ws.validateEmail(""), /required/);
  assert.throws(() => ws.validateEmail("not-an-email"), /Invalid email/);
  assert.throws(
    () => ws.validateEmail("a".repeat(250) + "@domain.com"),
    /Invalid email/,
  );

  // 2. Issue invitation
  const ownerActor = { user: { id: "user-owner", name: "Alice Owner" } };
  const adminActor = { user: { id: "user-admin", name: "Bob Admin" } };
  const memberActor = { user: { id: "user-member", name: "Charlie Member" } };

  const wsId = "20000000-0000-0000-0000-000000000001";
  let outboxEvents = [];
  let insertedReceipts = [];
  let pendingInvitations = [];

  const mockClient = {
    async query(sql, params = []) {
      if (
        sql.startsWith(
          "SELECT m.role, g.action FROM solodesk.workspace_memberships m",
        )
      ) {
        return grantedWorkspaceActions(params[1]);
      }

      if (sql.includes("FROM solodesk.command_receipts")) {
        return { rows: [] };
      }
      if (sql.includes("FROM solodesk.rate_limit_buckets")) {
        return { rows: [{ count: 1 }] };
      }
      if (sql.includes("INSERT INTO solodesk.rate_limit_buckets")) {
        return { rows: [{ count: 1 }] };
      }
      if (sql.includes("FROM solodesk.workspaces WHERE id = $1")) {
        return { rows: [{ id: wsId, name: "Acme Team", revision: "1" }] };
      }
      if (
        sql.includes("FROM solodesk.workspace_memberships m") &&
        sql.includes("solodesk.workspace_grants g")
      ) {
        const actorId = params[1];
        if (actorId === "user-owner") {
          return {
            rows: [
              {
                id: "mem-owner",
                role: "owner",
                status: "active",
                action: "workspace.invites.manage",
              },
            ],
          };
        }
        if (actorId === "user-admin") {
          return {
            rows: [
              {
                id: "mem-admin",
                role: "admin",
                status: "active",
                action: "workspace.invites.manage",
              },
            ],
          };
        }
        return { rows: [] };
      }
      if (
        sql.includes(
          "FROM solodesk.workspace_invitations WHERE workspace_id = $1 AND recipient_email = $2",
        )
      ) {
        return {
          rows: pendingInvitations.filter(
            (i) =>
              i.workspace_id === params[0] &&
              i.recipient_email === params[1] &&
              i.status === "pending",
          ),
        };
      }
      if (sql.includes("INSERT INTO solodesk.workspace_invitations")) {
        const inv = {
          id: params[0],
          workspace_id: params[1],
          recipient_email: params[2],
          role: params[3],
          token_digest: params[5],
          generation: 1,
          status: "pending",
          expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        };
        pendingInvitations.push(inv);
        return { rows: [] };
      }
      if (sql.includes("INSERT INTO solodesk.outbox_events")) {
        outboxEvents.push({
          workspace_id: params[0],
          actor_id: params[1],
          operation_id: params[2],
          target_id: params[3],
          generation: params[4],
          payload: params[5],
          encrypted_delivery: params[6],
          key_id: params[7],
        });
        return { rows: [] };
      }
      if (sql.includes("INSERT INTO solodesk.command_receipts")) {
        insertedReceipts.push({
          actor_id: params[0],
          operation_id: params[1],
          result_code: params[6],
        });
        return { rows: [] };
      }
      if (sql.includes("INSERT INTO solodesk.audit_events")) {
        return { rows: [] };
      }
      if (sql.includes("UPDATE solodesk.workspaces")) {
        return { rows: [] };
      }
      return { rows: [] };
    },
  };

  // Owner can invite an Admin
  const resAdminInvite = await ws.as(ownerActor, mockClient).issueWorkspaceInvitation({
      operationId: "30000000-0000-0000-0000-000000000001",
      workspaceId: wsId,
      expectedRevision: "1",
      recipientEmail: "new-admin@example.com",
      role: "admin",
    });
  assert.equal(resAdminInvite.status, "accepted");
  assert.equal(resAdminInvite.code, "INVITATION_ISSUED");

  // Admin cannot invite an Admin (role ceiling)
  await assert.rejects(
    () =>
      ws.as(adminActor, mockClient).issueWorkspaceInvitation({
          operationId: "30000000-0000-0000-0000-000000000002",
          workspaceId: wsId,
          expectedRevision: "1",
          recipientEmail: "another-admin@example.com",
          role: "admin",
        }),
    (err) => err.code === "FORBIDDEN" && err.statusCode === 403,
  );

  // Admin can invite a Member
  const resMemberInvite = await ws.as(adminActor, mockClient).issueWorkspaceInvitation({
      operationId: "30000000-0000-0000-0000-000000000003",
      workspaceId: wsId,
      expectedRevision: "1",
      recipientEmail: "new-member@example.com",
      role: "member",
    });
  assert.equal(resMemberInvite.status, "accepted");
  assert.equal(resMemberInvite.code, "INVITATION_ISSUED");

  // Member without invites grant is denied
  await assert.rejects(
    () =>
      ws.as(memberActor, mockClient).issueWorkspaceInvitation({
          operationId: "30000000-0000-0000-0000-000000000004",
          workspaceId: wsId,
          expectedRevision: "1",
          recipientEmail: "friend@example.com",
          role: "member",
        }),
    (err) => err.code === "FORBIDDEN" && err.statusCode === 403,
  );

  // Verifying outbox event has encrypted delivery and no plaintext bearer token
  assert.equal(outboxEvents.length, 2);
  const outboxItem = outboxEvents[0];
  assert.ok(outboxItem.encrypted_delivery);
  assert.equal(
    outboxItem.encrypted_delivery.toString(),
    "mock-encrypted-delivery",
  );
  // Ensure payload does not contain the plaintext token
  const parsedPayload = JSON.parse(outboxItem.payload);
  assert.equal(parsedPayload.token, undefined);

  // 3. Accept invitation
  const inviteeActor = {
    user: { id: "user-invitee", email: "new-member@example.com" },
  };
  const wrongActor = { user: { id: "user-wrong", email: "eve@example.com" } };

  const acceptMockClient = {
    async query(sql, params = []) {
      if (
        sql.startsWith(
          "SELECT m.role, g.action FROM solodesk.workspace_memberships m",
        )
      ) {
        return grantedWorkspaceActions(params[1]);
      }

      if (sql.includes("INSERT INTO solodesk.rate_limit_buckets")) {
        return { rows: [{ count: 1 }] };
      }
      if (
        sql.includes(
          "FROM solodesk.workspace_invitations WHERE token_digest = $1",
        )
      ) {
        return {
          rows: [
            {
              id: "inv-1",
              workspace_id: wsId,
              recipient_email: "new-member@example.com",
              role: "member",
              status: "pending",
              expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
              inviter_membership_id: "mem-owner",
            },
          ],
        };
      }
      if (sql.includes("SELECT clock_timestamp() as now")) {
        return { rows: [{ now: new Date().toISOString() }] };
      }
      if (
        sql.includes(
          "SELECT * FROM solodesk.workspaces WHERE id = $1 FOR UPDATE",
        )
      ) {
        return { rows: [{ id: wsId, name: "Acme Team" }] };
      }
      if (
        sql.includes(
          "FROM solodesk.workspace_memberships WHERE workspace_id = $1 AND user_id = $2",
        )
      ) {
        return { rows: [] };
      }
      return { rows: [] };
    },
  };

  // Accepting with matching email succeeds
  const acceptRes = await ws.as(inviteeActor, acceptMockClient).acceptWorkspaceInvitation({
      operationId: "40000000-0000-0000-0000-000000000001",
      token: "valid-invite-token-abc",
    });
  assert.equal(acceptRes.status, "accepted");
  assert.equal(acceptRes.role, "member");
  assert.equal(acceptRes.workspaceId, wsId);

  // Accepting with mismatched recipient email fails generically
  await assert.rejects(
    () =>
      ws.as(wrongActor, acceptMockClient).acceptWorkspaceInvitation({
          operationId: "40000000-0000-0000-0000-000000000002",
          token: "valid-invite-token-abc",
        }),
    (err) => err.code === "INVITATION_UNAVAILABLE" && err.statusCode === 400,
  );

  // Expired invitation fails
  const expiredMockClient = {
    ...acceptMockClient,
    async query(sql, params = []) {
      if (
        sql.startsWith(
          "SELECT m.role, g.action FROM solodesk.workspace_memberships m",
        )
      ) {
        return grantedWorkspaceActions(params[1]);
      }

      if (
        sql.includes(
          "FROM solodesk.workspace_invitations WHERE token_digest = $1",
        )
      ) {
        return {
          rows: [
            {
              id: "inv-expired",
              workspace_id: wsId,
              recipient_email: "new-member@example.com",
              role: "member",
              status: "pending",
              expires_at: new Date(Date.now() - 3600 * 1000).toISOString(), // Expired 1 hour ago
              inviter_membership_id: "mem-owner",
            },
          ],
        };
      }
      return acceptMockClient.query(sql, params);
    },
  };

  await assert.rejects(
    () =>
      ws.as(inviteeActor, expiredMockClient).acceptWorkspaceInvitation({
          operationId: "40000000-0000-0000-0000-000000000003",
          token: "expired-token",
        }),
    (err) => err.code === "INVITATION_UNAVAILABLE" && err.statusCode === 400,
  );
});

test("invitation resend and revoke enforce role ceilings, generation rotation, and outbox cancellation", async () => {
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => true,
      isOwnershipTransferEnabled: () => true,
    },
  });

  const wsId = "50000000-0000-0000-0000-000000000001";
  const invId = "50000000-0000-0000-0000-000000000002";
  const ownerActor = {
    user: { id: "user-owner", name: "Alice Owner", email: "alice@example.com" },
  };
  const adminActor = {
    user: { id: "user-admin", name: "Bob Admin", email: "bob@example.com" },
  };

  let cancelledOutboxEvents = [];
  let updatedInvitation = null;

  const mockClient = {
    async query(sql, params = []) {
      if (
        sql.startsWith(
          "SELECT m.role, g.action FROM solodesk.workspace_memberships m",
        )
      ) {
        return grantedWorkspaceActions(params[1]);
      }

      if (sql.includes("FROM solodesk.command_receipts")) {
        return { rows: [] };
      }
      if (sql.includes("FROM solodesk.rate_limit_buckets")) {
        return { rows: [{ count: 1 }] };
      }
      if (sql.includes("INSERT INTO solodesk.rate_limit_buckets")) {
        return { rows: [{ count: 1 }] };
      }
      if (sql.includes("FROM solodesk.workspaces WHERE id = $1")) {
        return { rows: [{ id: wsId, name: "Acme Team", revision: "1" }] };
      }
      if (
        sql.includes("FROM solodesk.workspace_memberships m") &&
        sql.includes("solodesk.workspace_grants g")
      ) {
        const actorId = params[1];
        if (actorId === "user-owner") {
          return {
            rows: [
              {
                id: "mem-owner",
                role: "owner",
                status: "active",
                action: "workspace.invites.manage",
              },
            ],
          };
        }
        if (actorId === "user-admin") {
          return {
            rows: [
              {
                id: "mem-admin",
                role: "admin",
                status: "active",
                action: "workspace.invites.manage",
              },
            ],
          };
        }
        return { rows: [] };
      }
      if (
        sql.includes(
          "FROM solodesk.workspace_invitations WHERE id = $1 AND workspace_id = $2",
        )
      ) {
        return {
          rows: [
            {
              id: invId,
              workspace_id: wsId,
              recipient_email: "colleague@example.com",
              role: "admin",
              generation: 1,
              status: "pending",
              revision: "1",
            },
          ],
        };
      }
      if (
        sql.includes("UPDATE solodesk.outbox_events SET status = 'cancelled'")
      ) {
        cancelledOutboxEvents.push({
          workspaceId: params[0],
          targetId: params[1],
        });
        return { rows: [] };
      }
      if (sql.includes("UPDATE solodesk.workspace_invitations")) {
        updatedInvitation = params;
        return { rows: [] };
      }
      if (sql.includes("INSERT INTO solodesk.outbox_events")) {
        return { rows: [] };
      }
      if (sql.includes("INSERT INTO solodesk.command_receipts")) {
        return { rows: [] };
      }
      if (sql.includes("INSERT INTO solodesk.audit_events")) {
        return { rows: [] };
      }
      return { rows: [] };
    },
  };

  // 1. Admin cannot resend an admin invitation (role ceiling)
  await assert.rejects(
    () =>
      ws.as(adminActor, mockClient).resendWorkspaceInvitation({
          operationId: "50000000-0000-0000-0000-000000000003",
          workspaceId: wsId,
          invitationId: invId,
          expectedInvitationRevision: "1",
        }),
    (err) => err.code === "FORBIDDEN" && err.statusCode === 403,
  );

  // 2. Owner can resend an admin invitation
  const resendRes = await ws.as(ownerActor, mockClient).resendWorkspaceInvitation({
      operationId: "50000000-0000-0000-0000-000000000004",
      workspaceId: wsId,
      invitationId: invId,
      expectedInvitationRevision: "1",
    });
  assert.equal(resendRes.status, "accepted");
  assert.equal(resendRes.code, "INVITATION_RESENT");
  assert.equal(resendRes.revision, "2");
  assert.equal(cancelledOutboxEvents.length, 1);
  assert.ok(updatedInvitation);

  // 3. Admin cannot revoke an admin invitation (role ceiling)
  await assert.rejects(
    () =>
      ws.as(adminActor, mockClient).revokeWorkspaceInvitation({
          operationId: "50000000-0000-0000-0000-000000000005",
          workspaceId: wsId,
          invitationId: invId,
          expectedInvitationRevision: "1",
        }),
    (err) => err.code === "FORBIDDEN" && err.statusCode === 403,
  );

  // 4. Owner revoking succeeds
  const revokeRes = await ws.as(ownerActor, mockClient).revokeWorkspaceInvitation({
      operationId: "50000000-0000-0000-0000-000000000006",
      workspaceId: wsId,
      invitationId: invId,
      expectedInvitationRevision: "1",
    });
  assert.equal(revokeRes.status, "accepted");
  assert.equal(revokeRes.code, "INVITATION_REVOKED");
});

test("membership controls enforce active-owner invariant, role ceilings, leaving, and ownership transfer", async () => {
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => true,
      isOwnershipTransferEnabled: () => true,
    },
  });

  const wsId = "60000000-0000-0000-0000-000000000001";
  const ownerActor = {
    user: { id: "user-owner" },
    session: { authAt: new Date().toISOString() }, // Fresh auth
  };
  const staleOwnerActor = {
    user: { id: "user-owner" },
    session: { authAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() }, // 10 min old auth (> 5 min)
  };
  const adminActor = {
    user: { id: "user-admin" },
    session: { authAt: new Date().toISOString() },
  };
  const memberActor = {
    user: { id: "user-member" },
    session: { authAt: new Date().toISOString() },
  };

  let activeOwnerCount = 1;
  const mockClient = {
    async query(sql, params = []) {
      if (
        sql.startsWith(
          "SELECT m.role, g.action FROM solodesk.workspace_memberships m",
        )
      ) {
        return grantedWorkspaceActions(params[1]);
      }

      if (sql.includes("FROM solodesk.command_receipts")) {
        return { rows: [] };
      }
      if (sql.includes("FROM solodesk.workspaces WHERE id = $1")) {
        return {
          rows: [
            {
              id: wsId,
              name: "Acme Corp",
              owner_id: "user-owner",
              revision: "1",
            },
          ],
        };
      }
      if (
        sql.includes("FROM solodesk.workspace_memberships m") &&
        sql.includes("solodesk.workspace_grants g")
      ) {
        const actorId = params[1];
        if (actorId === "user-owner") {
          return {
            rows: [
              {
                id: "mem-owner",
                role: "owner",
                status: "active",
                action: params[0] || "workspace.members.role.change",
              },
            ],
          };
        }
        if (actorId === "user-admin") {
          return {
            rows: [
              {
                id: "mem-admin",
                role: "admin",
                status: "active",
                action: "workspace.members.remove",
              },
            ],
          };
        }
        return { rows: [] };
      }
      if (
        sql.includes(
          "SELECT count(*)::int as count FROM solodesk.workspace_memberships",
        )
      ) {
        return { rows: [{ count: activeOwnerCount }] };
      }
      if (
        sql.includes(
          "FROM solodesk.workspace_memberships WHERE id = $1 AND workspace_id = $2",
        )
      ) {
        const memId = params[0];
        if (memId === "60000000-0000-0000-0000-000000000020") {
          return {
            rows: [
              {
                id: "60000000-0000-0000-0000-000000000020",
                user_id: "user-admin",
                role: "admin",
                status: "active",
                revision: "1",
              },
            ],
          };
        }
        if (memId === "60000000-0000-0000-0000-000000000021") {
          return {
            rows: [
              {
                id: "60000000-0000-0000-0000-000000000021",
                user_id: "user-admin-2",
                role: "admin",
                status: "active",
                revision: "1",
              },
            ],
          };
        }
        if (memId === "60000000-0000-0000-0000-000000000030") {
          return {
            rows: [
              {
                id: "60000000-0000-0000-0000-000000000030",
                user_id: "user-member",
                role: "member",
                status: "active",
                revision: "1",
              },
            ],
          };
        }
        if (memId === "60000000-0000-0000-0000-000000000010") {
          return {
            rows: [
              {
                id: "60000000-0000-0000-0000-000000000010",
                user_id: "user-owner",
                role: "owner",
                status: "active",
                revision: "1",
              },
            ],
          };
        }
        return { rows: [] };
      }
      if (
        sql.includes("workspace_id = $1 AND user_id = $2 AND status = 'active'")
      ) {
        const userId = params[1];
        if (userId === "user-owner") {
          return {
            rows: [
              {
                id: "60000000-0000-0000-0000-000000000010",
                user_id: "user-owner",
                role: "owner",
                status: "active",
                revision: "1",
              },
            ],
          };
        }
        if (userId === "user-admin") {
          return {
            rows: [
              {
                id: "60000000-0000-0000-0000-000000000020",
                user_id: "user-admin",
                role: "admin",
                status: "active",
                revision: "1",
              },
            ],
          };
        }
        if (userId === "user-member") {
          return {
            rows: [
              {
                id: "60000000-0000-0000-0000-000000000030",
                user_id: "user-member",
                role: "member",
                status: "active",
                revision: "1",
              },
            ],
          };
        }
        return { rows: [] };
      }
      return { rows: [] };
    },
  };

  // 1. Owner promotion requires fresh step-up auth
  await assert.rejects(
    () =>
      ws.as(staleOwnerActor, mockClient).changeWorkspaceMemberRole({
          operationId: "60000000-0000-0000-0000-000000000002",
          workspaceId: wsId,
          membershipId: "60000000-0000-0000-0000-000000000020",
          expectedMembershipRevision: "1",
          role: "owner",
        }),
    (err) => err.code === "CAPABILITY_DISABLED" && err.statusCode === 503,
  );

  // 2. Owner can promote Member to Admin without unsupported ownership step-up
  const promoRes = await ws.as(ownerActor, mockClient).changeWorkspaceMemberRole({
      operationId: "60000000-0000-0000-0000-000000000003",
      workspaceId: wsId,
      membershipId: "60000000-0000-0000-0000-000000000020",
      expectedMembershipRevision: "1",
      role: "admin",
    });
  assert.equal(promoRes.status, "accepted");
  assert.equal(promoRes.code, "MEMBER_ROLE_CHANGED");

  // 3. Demoting designated owner is rejected
  await assert.rejects(
    () =>
      ws.as(ownerActor, mockClient).changeWorkspaceMemberRole({
          operationId: "60000000-0000-0000-0000-000000000004",
          workspaceId: wsId,
          membershipId: "60000000-0000-0000-0000-000000000010",
          expectedMembershipRevision: "1",
          role: "admin",
        }),
    (err) => err.code === "CAPABILITY_DISABLED" && err.statusCode === 503,
  );

  // 4. Admin cannot remove Admin
  await assert.rejects(
    () =>
      ws.as(adminActor, mockClient).removeWorkspaceMember({
          operationId: "60000000-0000-0000-0000-000000000005",
          workspaceId: wsId,
          membershipId: "60000000-0000-0000-0000-000000000021",
          expectedMembershipRevision: "1",
        }),
    (err) => err.code === "FORBIDDEN" && err.statusCode === 403,
  );

  // 5. Admin can remove Member
  const removeRes = await ws.as(adminActor, mockClient).removeWorkspaceMember({
      operationId: "60000000-0000-0000-0000-000000000006",
      workspaceId: wsId,
      membershipId: "60000000-0000-0000-0000-000000000030",
      expectedMembershipRevision: "1",
    });
  assert.equal(removeRes.status, "accepted");
  assert.equal(removeRes.code, "MEMBER_REMOVED");

  // 6. Designated owner cannot leave without transferring ownership
  await assert.rejects(
    () =>
      ws.as(ownerActor, mockClient).leaveWorkspace({
          operationId: "60000000-0000-0000-0000-000000000007",
          workspaceId: wsId,
          expectedMembershipRevision: "1",
        }),
    (err) => err.code === "LAST_OWNER" && err.statusCode === 409,
  );

  // 7. Member can leave workspace
  const leaveRes = await ws.as(memberActor, mockClient).leaveWorkspace({
      operationId: "60000000-0000-0000-0000-000000000008",
      workspaceId: wsId,
      expectedMembershipRevision: "1",
    });
  assert.equal(leaveRes.status, "accepted");
  assert.equal(leaveRes.code, "MEMBER_LEFT");

  // 8. Ownership transfer requires fresh reauth
  await assert.rejects(
    () =>
      ws.as(staleOwnerActor, mockClient).transferWorkspaceOwnership({
          operationId: "60000000-0000-0000-0000-000000000009",
          workspaceId: wsId,
          targetMembershipId: "60000000-0000-0000-0000-000000000020",
          expectedWorkspaceRevision: "1",
          expectedTargetRevision: "1",
          expectedInitiatorRevision: "1",
        }),
    (err) => err.code === "CAPABILITY_DISABLED" && err.statusCode === 503,
  );

  // 9. Even a recent timestamp cannot substitute for provider-supported step-up.
  await assert.rejects(() => ws.as(ownerActor, mockClient).transferWorkspaceOwnership({
    operationId: "60000000-0000-0000-0000-000000000010", workspaceId: wsId,
    targetMembershipId: "60000000-0000-0000-0000-000000000020",
    expectedWorkspaceRevision: "1", expectedTargetRevision: "1", expectedInitiatorRevision: "1",
  }), (err) => err.code === "CAPABILITY_DISABLED");
});

test("AP-02–05: persisted grant removal, capability gates, and reauth safeguards (local evidence)", async () => {
  const wsId = "70000000-0000-0000-0000-000000000001";
  const actor = { user: { id: "user-owner" } };

  // 1. AP-02: Removing workspace.read grant without role change denies getWorkspaceContext
  let grants = [{ action: "workspace.select" }]; // workspace.read intentionally omitted
  const mockClient = {
    async query(sql, params = []) {
      if (
        sql.startsWith(
          "SELECT m.role, g.action FROM solodesk.workspace_memberships m",
        )
      ) {
        return grantedWorkspaceActions(params[1]);
      }

      if (sql.includes("FROM solodesk.workspaces w")) {
        return {
          rows: [
            {
              id: wsId,
              name: "Grant Test Team",
              slug: "grant-test",
              timezone: "UTC",
              locale: "en",
              currency: "USD",
              revision: 1,
              membership_id: "mem-owner",
              role: "owner",
              membership_revision: 1,
            },
          ],
        };
      }
      if (sql.includes("FROM solodesk.workspace_grants")) {
        return { rows: grants };
      }
      return { rows: [] };
    },
  };

  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => actor },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => true,
      isOwnershipTransferEnabled: () => true,
    },
  });

  // Without workspace.read, getWorkspaceContext must throw RESOURCE_UNAVAILABLE
  await assert.rejects(
    () => ws.as(actor, mockClient).getWorkspaceContext(wsId),
    (err) => err.code === "RESOURCE_UNAVAILABLE" && err.statusCode === 404,
  );

  // When workspace.read is restored, getWorkspaceContext succeeds and projects only effective grants
  grants = [{ action: "workspace.read" }];
  const ctx = await ws.as(actor, mockClient).getWorkspaceContext(wsId);
  assert.equal(ctx.workspace.id, wsId);
  assert.deepEqual(ctx.capabilities, ["workspace.read"]);
  assert.equal(ctx.capabilities.includes("workspace.select"), false);

  // 2. AP-03: Narrower invitation gate fails closed when invitations disabled
  const wsNoInvites = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => actor },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => false,
      isOwnershipTransferEnabled: () => true,
    },
  });

  await assert.rejects(
    () =>
      wsNoInvites.as(actor, mockClient).issueWorkspaceInvitation({
          operationId: "70000000-0000-0000-0000-000000000010",
          workspaceId: wsId,
          expectedRevision: "1",
          recipientEmail: "colleague@example.com",
          role: "member",
        }),
    (err) => err.code === "CAPABILITY_DISABLED" && err.statusCode === 503,
  );

  await assert.rejects(
    () => wsNoInvites.as(actor, mockClient).listWorkspaceInvitations(wsId),
    (err) => err.code === "CAPABILITY_DISABLED" && err.statusCode === 503,
  );

  // 3. AP-03: Global workspace gate fails closed before SQL
  const wsDisabled = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => actor },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => false,
      isWorkspaceInvitesEnabled: () => false,
      isOwnershipTransferEnabled: () => false,
    },
  });

  await assert.rejects(
    () => wsDisabled.as(actor, mockClient).listWorkspaces({}),
    (err) => err.code === "CAPABILITY_DISABLED" && err.statusCode === 503,
  );

  // 4. AP-05: verifyFreshReauth rejects missing authAt, createdAt fallback, future timestamps, and expired auth
  // Rejects missing authAt / createdAt fallback
  assert.throws(
    () =>
      ws.verifyFreshReauth({
        session: { createdAt: new Date().toISOString() },
      }),
    (err) => err.code === "CAPABILITY_DISABLED" && err.statusCode === 503,
  );

  // Rejects future authAt timestamp
  assert.throws(
    () =>
      ws.verifyFreshReauth({
        session: { authAt: new Date(Date.now() + 60000).toISOString() },
      }),
    (err) => err.code === "CAPABILITY_DISABLED" && err.statusCode === 503,
  );

  // Rejects authAt older than 5 minutes
  assert.throws(
    () =>
      ws.verifyFreshReauth({
        session: { authAt: new Date(Date.now() - 6 * 60 * 1000).toISOString() },
      }),
    (err) => err.code === "CAPABILITY_DISABLED" && err.statusCode === 503,
  );

  // Fresh authAt alone is unsupported proof.
  assert.throws(() => ws.verifyFreshReauth({ session: { authAt: new Date() } }),
    (err) => err.code === "CAPABILITY_DISABLED");
});

test("removed action grants deny direct private receipt replay before returning accepted fields", async () => {
  const actor = { user: { id: "synthetic-owner" } };
  const workspaceId = "70000000-0000-0000-0000-000000000001";
  const operationId = "70000000-0000-0000-0000-000000000099";
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => actor },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => true,
      isOwnershipTransferEnabled: () => true,
    },
  });
  const input = {
    operationId,
    workspaceId,
    expectedRevision: "1",
    name: "Synthetic",
    timezone: "UTC",
    locale: "en",
    currency: "USD",
  };
  const receipt = {
    actor_id: actor.user.id,
    operation_id: operationId,
    workspace_id: workspaceId,
    target_id: workspaceId,
    kind: "workspace.settings.update",
    result_code: "UPDATED",
    result_revision: "2",
    correlation_id: operationId,
    intent_digest: ws.computeIntentDigest({
      kind: "workspace.settings.update",
      commandVersion: 1,
      workspaceId,
      expectedRevision: "1",
      payload: {
        name: input.name,
        timezone: input.timezone,
        locale: input.locale,
        currency: input.currency,
      },
    }),
  };
  const client = {
    async query(sql) {
      if (sql.includes("FROM solodesk.command_receipts"))
        return { rows: [receipt] };
      if (sql.includes("SELECT 1 FROM solodesk.workspace_memberships"))
        return { rows: [{ active: 1 }] };
      // Membership/role still exists; its persisted action grants were removed.
      return { rows: [] };
    },
  };
  await assert.rejects(
    ws.as(actor, client).updateWorkspaceSettings(input),
    (e) => e.code === "RESOURCE_UNAVAILABLE" || e.code === "FORBIDDEN",
  );
  await assert.rejects(
    ws.as(actor, client).getReceiptStatus(operationId),
    (e) => e.code === "RESOURCE_UNAVAILABLE" || e.code === "FORBIDDEN",
  );
});

test("bounded choices and current scoped role ceilings reach the actual query boundary", async () => {
  const actor = { user: { id: "synthetic-member" } };
  const workspaceId = "70000000-0000-0000-0000-000000000001";
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => actor },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => true,
      isOwnershipTransferEnabled: () => true,
    },
  });
  let queries = 0;
  const listClient = {
    async query(sql, params) {
      queries++;
      assert.ok(sql.includes("g.action = 'workspace.read'"));
      assert.ok(sql.includes("g.action = 'workspace.select'"));
      assert.ok(sql.includes("g.scope_type = 'workspace'"));
      assert.ok(sql.includes("g.scope_id = w.id"));
      assert.equal(params.at(-1), 51, "One page, default 20/max 50.");
      return { rows: [] };
    },
  };
  await ws.as(actor, listClient).listWorkspaces({ limit: 500 });
  assert.equal(queries, 1);
  const foreignGrantClient = {
    async query(sql, params) {
      assert.ok(sql.includes("g.scope_id = $1"));
      assert.equal(params[0], workspaceId);
      return { rows: [{ role: "member", action: "workspace.members.read" }] };
    },
  };
  await assert.rejects(
    ws.as(actor, foreignGrantClient).listWorkspaceMembers(workspaceId),
    (e) => e.code === "FORBIDDEN",
    "persisted grants cannot exceed the member role ceiling",
  );
});
