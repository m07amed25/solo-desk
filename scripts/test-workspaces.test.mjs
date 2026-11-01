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
  return exports;
}

test("workspace validators enforce C01/C02 constraints and reserved slugs", () => {
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": { isWorkspacesEnabled: () => true },
  });

  // 1. Slug validation
  assert.equal(ws.validateSlug("my-team"), "my-team");
  assert.equal(ws.validateSlug("team123"), "team123");
  assert.throws(() => ws.validateSlug("ab"), /between 3 and 63/);
  assert.throws(() => ws.validateSlug("a".repeat(64)), /between 3 and 63/);
  assert.throws(() => ws.validateSlug("My-Team"), /lowercase alphanumeric/);
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
    "@/lib/auth/capabilities": { isWorkspacesEnabled: () => true },
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
    () => ws.createWorkspace(input, actor),
    (err) => err.code === "CAPABILITY_DISABLED" && err.statusCode === 503,
  );
  workspacesEnabled = true;

  // 2. In-memory client simulation
  const queries = [];
  const receipts = new Map();
  const slugs = new Set();

  const mockClient = {
    async query(sql, params = []) {
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
  const res1 = await ws.createWorkspace(input, actor, mockClient);
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
  const resReplay = await ws.createWorkspace(input, actor, mockClient);
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
    () => ws.createWorkspace(conflictingInput, actor, mockClient),
    (err) => err.code === "OPERATION_CONFLICT" && err.statusCode === 409,
  );

  // 6. New operationId with conflicting slug returns 409 SLUG_UNAVAILABLE
  const duplicateSlugInput = {
    ...input,
    operationId: "30000000-0000-0000-0000-000000000002",
  };
  await assert.rejects(
    () => ws.createWorkspace(duplicateSlugInput, actor, mockClient),
    (err) => err.code === "SLUG_UNAVAILABLE" && err.statusCode === 409,
  );
});

test("updateWorkspaceSettings checks revision, enforces member grants, and writes receipt", async () => {
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": { isWorkspacesEnabled: () => true },
  });

  const actor = { user: { id: "10000000-0000-0000-0000-000000000001" } };
  const workspaceId = "40000000-0000-0000-0000-000000000001";
  let workspaceRevision = 1n;
  let hasGrant = true;

  const mockClient = {
    async query(sql) {
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
      ws.updateWorkspaceSettings(
        { ...updateInput, expectedRevision: "99" },
        actor,
        mockClient,
      ),
    (err) => err.code === "REVISION_CONFLICT" && err.statusCode === 409,
  );

  // 2. Forbidden if member lacks grant
  hasGrant = false;
  await assert.rejects(
    () => ws.updateWorkspaceSettings(updateInput, actor, mockClient),
    (err) => err.code === "FORBIDDEN" && err.statusCode === 403,
  );
  hasGrant = true;

  // 3. Successful update increments revision
  const res = await ws.updateWorkspaceSettings(updateInput, actor, mockClient);
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
    "@/lib/auth/capabilities": { isWorkspacesEnabled: () => true },
  });

  // 1. List workspaces returns own workspaces
  const list = await ws.listWorkspaces(actor, { limit: 10 }, mockClient);
  assert.equal(list.items.length, 1);
  assert.equal(list.items[0].id, wsId1);

  // Foreign actor gets empty list, not foreign workspaces
  const foreignList = await ws.listWorkspaces(
    foreignActor,
    { limit: 10 },
    mockClient,
  );
  assert.equal(foreignList.items.length, 0);

  // Cursor validation: malformed cursor rejected
  await assert.rejects(
    () => ws.listWorkspaces(actor, { cursor: "invalid-uuid" }, mockClient),
    (err) => err.code === "VALIDATION" && err.statusCode === 400,
  );

  // 2. Context projection for own workspace
  const ctx = await ws.getWorkspaceContext(wsId1, actor, mockClient);
  assert.equal(ctx.workspace.id, wsId1);
  assert.equal(ctx.membership.role, "owner");
  assert.ok(ctx.capabilities.includes("workspace.read"));
  assert.ok(ctx.capabilities.includes("workspace.settings.update"));

  // Foreign/unknown workspace returns RESOURCE_UNAVAILABLE (404)
  await assert.rejects(
    () => ws.getWorkspaceContext(wsIdForeign, actor, mockClient),
    (err) => err.code === "RESOURCE_UNAVAILABLE" && err.statusCode === 404,
  );

  // Revocation of membership denies context projection
  isRevoked = true;
  await assert.rejects(
    () => ws.getWorkspaceContext(wsId1, actor, mockClient),
    (err) => err.code === "RESOURCE_UNAVAILABLE" && err.statusCode === 404,
  );
  isRevoked = false;

  // 3. Receipt reconciliation
  const rMockClient = {
    ...mockClient,
    async query(sql, params) {
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

  const receiptRes = await ws.getReceiptStatus(
    "10000000-0000-0000-0000-000000000001",
    actor,
    rMockClient,
  );
  assert.equal(receiptRes.status, "accepted");
  assert.equal(receiptRes.code, "UPDATED");
  assert.equal(receiptRes.revision, "2");
  // Ensure sensitive digest or payload is NOT returned
  assert.equal(receiptRes.intent_digest, undefined);
  assert.equal(receiptRes.result, undefined);

  // Foreign actor trying to view Alice's receipt returns RESOURCE_UNAVAILABLE
  await assert.rejects(
    () =>
      ws.getReceiptStatus(
        "10000000-0000-0000-0000-000000000001",
        foreignActor,
        mockClient,
      ),
    (err) => err.code === "RESOURCE_UNAVAILABLE" && err.statusCode === 404,
  );

  // Revoked member attempting to view prior receipt returns RESOURCE_UNAVAILABLE
  isRevoked = true;
  await assert.rejects(
    () =>
      ws.getReceiptStatus(
        "10000000-0000-0000-0000-000000000001",
        actor,
        rMockClient,
      ),
    (err) => err.code === "RESOURCE_UNAVAILABLE" && err.statusCode === 404,
  );
  isRevoked = false;
});

test("invitation issuance and acceptance enforce role ceilings, recipient matching, and outbox encryption", async () => {
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": { isWorkspacesEnabled: () => true },
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
  const resAdminInvite = await ws.issueWorkspaceInvitation(
    {
      operationId: "30000000-0000-0000-0000-000000000001",
      workspaceId: wsId,
      expectedRevision: "1",
      recipientEmail: "new-admin@example.com",
      role: "admin",
    },
    ownerActor,
    mockClient,
  );
  assert.equal(resAdminInvite.status, "accepted");
  assert.equal(resAdminInvite.code, "INVITATION_ISSUED");

  // Admin cannot invite an Admin (role ceiling)
  await assert.rejects(
    () =>
      ws.issueWorkspaceInvitation(
        {
          operationId: "30000000-0000-0000-0000-000000000002",
          workspaceId: wsId,
          expectedRevision: "1",
          recipientEmail: "another-admin@example.com",
          role: "admin",
        },
        adminActor,
        mockClient,
      ),
    (err) => err.code === "FORBIDDEN" && err.statusCode === 403,
  );

  // Admin can invite a Member
  const resMemberInvite = await ws.issueWorkspaceInvitation(
    {
      operationId: "30000000-0000-0000-0000-000000000003",
      workspaceId: wsId,
      expectedRevision: "1",
      recipientEmail: "new-member@example.com",
      role: "member",
    },
    adminActor,
    mockClient,
  );
  assert.equal(resMemberInvite.status, "accepted");
  assert.equal(resMemberInvite.code, "INVITATION_ISSUED");

  // Member without invites grant is denied
  await assert.rejects(
    () =>
      ws.issueWorkspaceInvitation(
        {
          operationId: "30000000-0000-0000-0000-000000000004",
          workspaceId: wsId,
          expectedRevision: "1",
          recipientEmail: "friend@example.com",
          role: "member",
        },
        memberActor,
        mockClient,
      ),
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
    async query(sql) {
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
  const acceptRes = await ws.acceptWorkspaceInvitation(
    {
      operationId: "40000000-0000-0000-0000-000000000001",
      token: "valid-invite-token-abc",
    },
    inviteeActor,
    acceptMockClient,
  );
  assert.equal(acceptRes.status, "accepted");
  assert.equal(acceptRes.role, "member");
  assert.equal(acceptRes.workspaceId, wsId);

  // Accepting with mismatched recipient email fails generically
  await assert.rejects(
    () =>
      ws.acceptWorkspaceInvitation(
        {
          operationId: "40000000-0000-0000-0000-000000000002",
          token: "valid-invite-token-abc",
        },
        wrongActor,
        acceptMockClient,
      ),
    (err) => err.code === "INVITATION_UNAVAILABLE" && err.statusCode === 400,
  );

  // Expired invitation fails
  const expiredMockClient = {
    ...acceptMockClient,
    async query(sql, params) {
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
      ws.acceptWorkspaceInvitation(
        {
          operationId: "40000000-0000-0000-0000-000000000003",
          token: "expired-token",
        },
        inviteeActor,
        expiredMockClient,
      ),
    (err) => err.code === "INVITATION_UNAVAILABLE" && err.statusCode === 400,
  );
});

test("invitation resend and revoke enforce role ceilings, generation rotation, and outbox cancellation", async () => {
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": { isWorkspacesEnabled: () => true },
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
      ws.resendWorkspaceInvitation(
        {
          operationId: "50000000-0000-0000-0000-000000000003",
          workspaceId: wsId,
          invitationId: invId,
          expectedInvitationRevision: "1",
        },
        adminActor,
        mockClient,
      ),
    (err) => err.code === "FORBIDDEN" && err.statusCode === 403,
  );

  // 2. Owner can resend an admin invitation
  const resendRes = await ws.resendWorkspaceInvitation(
    {
      operationId: "50000000-0000-0000-0000-000000000004",
      workspaceId: wsId,
      invitationId: invId,
      expectedInvitationRevision: "1",
    },
    ownerActor,
    mockClient,
  );
  assert.equal(resendRes.status, "accepted");
  assert.equal(resendRes.code, "INVITATION_RESENT");
  assert.equal(resendRes.revision, "2");
  assert.equal(cancelledOutboxEvents.length, 1);
  assert.ok(updatedInvitation);

  // 3. Admin cannot revoke an admin invitation (role ceiling)
  await assert.rejects(
    () =>
      ws.revokeWorkspaceInvitation(
        {
          operationId: "50000000-0000-0000-0000-000000000005",
          workspaceId: wsId,
          invitationId: invId,
          expectedInvitationRevision: "1",
        },
        adminActor,
        mockClient,
      ),
    (err) => err.code === "FORBIDDEN" && err.statusCode === 403,
  );

  // 4. Owner revoking succeeds
  const revokeRes = await ws.revokeWorkspaceInvitation(
    {
      operationId: "50000000-0000-0000-0000-000000000006",
      workspaceId: wsId,
      invitationId: invId,
      expectedInvitationRevision: "1",
    },
    ownerActor,
    mockClient,
  );
  assert.equal(revokeRes.status, "accepted");
  assert.equal(revokeRes.code, "INVITATION_REVOKED");
});

test("membership controls enforce active-owner invariant, role ceilings, leaving, and ownership transfer", async () => {
  const ws = loadWorkspacesService({
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": { isWorkspacesEnabled: () => true },
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
      ws.changeWorkspaceMemberRole(
        {
          operationId: "60000000-0000-0000-0000-000000000002",
          workspaceId: wsId,
          membershipId: "60000000-0000-0000-0000-000000000020",
          expectedMembershipRevision: "1",
          role: "owner",
        },
        staleOwnerActor,
        mockClient,
      ),
    (err) => err.code === "REAUTH_REQUIRED" && err.statusCode === 403,
  );

  // 2. Owner promotion succeeds with fresh auth
  const promoRes = await ws.changeWorkspaceMemberRole(
    {
      operationId: "60000000-0000-0000-0000-000000000003",
      workspaceId: wsId,
      membershipId: "60000000-0000-0000-0000-000000000020",
      expectedMembershipRevision: "1",
      role: "owner",
    },
    ownerActor,
    mockClient,
  );
  assert.equal(promoRes.status, "accepted");
  assert.equal(promoRes.code, "MEMBER_ROLE_CHANGED");

  // 3. Demoting designated owner is rejected
  await assert.rejects(
    () =>
      ws.changeWorkspaceMemberRole(
        {
          operationId: "60000000-0000-0000-0000-000000000004",
          workspaceId: wsId,
          membershipId: "60000000-0000-0000-0000-000000000010",
          expectedMembershipRevision: "1",
          role: "admin",
        },
        ownerActor,
        mockClient,
      ),
    (err) => err.code === "LAST_OWNER" && err.statusCode === 409,
  );

  // 4. Admin cannot remove Admin
  await assert.rejects(
    () =>
      ws.removeWorkspaceMember(
        {
          operationId: "60000000-0000-0000-0000-000000000005",
          workspaceId: wsId,
          membershipId: "60000000-0000-0000-0000-000000000021",
          expectedMembershipRevision: "1",
        },
        adminActor,
        mockClient,
      ),
    (err) => err.code === "FORBIDDEN" && err.statusCode === 403,
  );

  // 5. Admin can remove Member
  const removeRes = await ws.removeWorkspaceMember(
    {
      operationId: "60000000-0000-0000-0000-000000000006",
      workspaceId: wsId,
      membershipId: "60000000-0000-0000-0000-000000000030",
      expectedMembershipRevision: "1",
    },
    adminActor,
    mockClient,
  );
  assert.equal(removeRes.status, "accepted");
  assert.equal(removeRes.code, "MEMBER_REMOVED");

  // 6. Designated owner cannot leave without transferring ownership
  await assert.rejects(
    () =>
      ws.leaveWorkspace(
        {
          operationId: "60000000-0000-0000-0000-000000000007",
          workspaceId: wsId,
          expectedMembershipRevision: "1",
        },
        ownerActor,
        mockClient,
      ),
    (err) => err.code === "LAST_OWNER" && err.statusCode === 409,
  );

  // 7. Member can leave workspace
  const leaveRes = await ws.leaveWorkspace(
    {
      operationId: "60000000-0000-0000-0000-000000000008",
      workspaceId: wsId,
      expectedMembershipRevision: "1",
    },
    memberActor,
    mockClient,
  );
  assert.equal(leaveRes.status, "accepted");
  assert.equal(leaveRes.code, "MEMBER_LEFT");

  // 8. Ownership transfer requires fresh reauth
  await assert.rejects(
    () =>
      ws.transferWorkspaceOwnership(
        {
          operationId: "60000000-0000-0000-0000-000000000009",
          workspaceId: wsId,
          targetMembershipId: "60000000-0000-0000-0000-000000000020",
          expectedWorkspaceRevision: "1",
          expectedTargetRevision: "1",
          expectedInitiatorRevision: "1",
        },
        staleOwnerActor,
        mockClient,
      ),
    (err) => err.code === "REAUTH_REQUIRED" && err.statusCode === 403,
  );

  // 9. Ownership transfer succeeds with fresh reauth
  const transferRes = await ws.transferWorkspaceOwnership(
    {
      operationId: "60000000-0000-0000-0000-000000000010",
      workspaceId: wsId,
      targetMembershipId: "60000000-0000-0000-0000-000000000020",
      expectedWorkspaceRevision: "1",
      expectedTargetRevision: "1",
      expectedInitiatorRevision: "1",
    },
    ownerActor,
    mockClient,
  );
  assert.equal(transferRes.status, "accepted");
  assert.equal(transferRes.code, "OWNERSHIP_TRANSFERRED");
  assert.equal(transferRes.revision, "2");
});
