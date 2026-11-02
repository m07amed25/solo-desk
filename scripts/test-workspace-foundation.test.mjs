import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadServerModule } from "./workspace-test-service.mjs";

const capabilities = {
  isWorkspacesEnabled: () => true,
  isWorkspaceInvitesEnabled: () => false,
  isOwnershipTransferEnabled: () => false,
};
function workspace(adapters = {}) {
  return loadServerModule("../lib/workspaces.ts", {
    "@/lib/db": { db: {} },
    "@/lib/auth/server": { currentSession: async () => null },
    "@/lib/auth/capabilities": capabilities,
    "@/lib/workspace-invitations": {}, ...adapters,
  });
}

test("workspace services reject supplied identity and transaction bypasses", async () => {
  let queries = 0;
  const client = { query: async () => { queries++; return { rows: [] }; } };
  const ws = workspace();
  await assert.rejects(() => ws.listWorkspaces({ user: { id: "forged" } }, {}, client),
    (err) => err.code === "AUTH_REQUIRED");
  assert.equal(queries, 0);
});

test("transaction rollback failure and uncertain commit discard the connection", async () => {
  const ws = workspace();
  const queries = [];
  let discarded;
  const client = {
    async query(sql) {
      queries.push(sql);
      if (/^COMMIT/.test(sql) || /^ROLLBACK/.test(sql)) throw new Error("connection lost");
      return { rows: [] };
    },
    release(broken) { discarded = broken; },
  };
  await assert.rejects(() => ws.withTransaction(async () => "accepted", { connect: async () => client }),
    (err) => err.code === "OUTCOME_UNKNOWN");
  assert.ok(discarded);
  assert.match(queries[0], /^BEGIN/);
  assert.ok(queries.some((sql) => /SET LOCAL statement_timeout/.test(sql)));
});

test("revision inputs stay within PostgreSQL BIGINT and enabled auth rejects unknown operations", () => {
  const ws = workspace();
  for (const validate of [ws.validateRevisionString, ws.validateDecimalString]) {
    assert.equal(validate("9223372036854775807"), "9223372036854775807");
    assert.throws(() => validate("9223372036854775808"), (err) => err.code === "VALIDATION");
    assert.throws(() => validate("9".repeat(10000)), (err) => err.code === "VALIDATION");
  }
  const auth = loadServerModule("../lib/auth/capabilities.ts", {}, { SOLODESK_AUTH_CREDENTIALS_ENABLED: "true" });
  assert.equal(auth.isAllowedAuthPath("/api/auth/unknown-operation").allowed, false);
  assert.equal(auth.isAllowedAuthPath("/api/auth/change-password").allowed, false);
  assert.equal(auth.isAllowedAuthPath("/api/auth/sign-in/email").allowed, true);
});

test("unfinished invitation and managed step-up capabilities cannot be activated by flags", () => {
  const auth = loadServerModule("../lib/auth/capabilities.ts", {}, {
    SOLODESK_WORKSPACE_INVITES_ENABLED: "true", SOLODESK_OWNERSHIP_TRANSFER_ENABLED: "true",
  });
  assert.equal(auth.isWorkspaceInvitesEnabled(), false);
  assert.equal(auth.isOwnershipTransferEnabled(), false);
  assert.throws(() => workspace().verifyFreshReauth({ session: { authAt: new Date() } }),
    (err) => err.code === "CAPABILITY_DISABLED");
});

test("invitation encryption requires its independent key and authenticates context", () => {
  const encryption = loadServerModule("../lib/workspace-invitations.ts", {}, { AUTH_SECRET: "shared-secret" });
  assert.throws(() => encryption.getInvitationKey(), /SOLODESK_INVITATION_ENCRYPTION_KEY/);
  assert.throws(() => encryption.getInvitationKey("short"), /32-byte/);
  const { key, keyId } = encryption.getInvitationKey("12".repeat(32));
  const context = { workspaceId: "synthetic", invitationId: "synthetic-invite", generation: 1 };
  const encrypted = encryption.encryptInvitationDelivery({ token: "synthetic-proof" }, context, key, keyId).encrypted;
  assert.equal(encryption.decryptInvitationDelivery(encrypted, context, key).token, "synthetic-proof");
  assert.throws(() => encryption.decryptInvitationDelivery(encrypted, { ...context, generation: 2 }, key));
});

test("a manifest file alone never reports operational invitation delivery", () => {
  const dir = mkdtempSync(join(tmpdir(), "solodesk-dispatch-"));
  const manifest = join(dir, "manifest.json");
  writeFileSync(manifest, "{}");
  const result = spawnSync(process.execPath, ["scripts/dispatch-workspace-invitations.mjs", "--manifest", manifest], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /BLOCKED/);
  assert.doesNotMatch(result.stdout, /completed batch|PASS/);
});
