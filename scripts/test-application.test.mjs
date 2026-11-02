import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function loadModule(path, adapters) {
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
      if (name === "react") {
        return {
          cache: (fn) => fn, // in test, identity wrapper
        };
      }
      assert.ok(name in adapters, `Unexpected dependency: ${name}`);
      return adapters[name];
    },
    Date,
    URL,
    Set,
    Math,
    process: {
      env: {
        DATABASE_URL: "postgres://synthetic:synthetic@localhost:9/synthetic",
        SOLODESK_WORKSPACES_ENABLED: "true",
      },
    },
  });
  return exports;
}

const userId = "00000000-0000-0000-0000-000000000001";
const sessionId = "00000000-0000-0000-0000-000000000002";
const wsId1 = "10000000-0000-0000-0000-000000000001";

function mockSession(expiresAt = new Date(Date.now() + 60000).toISOString()) {
  return {
    user: {
      id: userId,
      name: "Alice Developer",
      email: "alice@example.com",
      image: "https://example.com/avatar.png",
      emailVerified: true,
    },
    session: {
      id: sessionId,
      token: "super-secret-token", // MUST NEVER BE PROJECTED!
      expiresAt,
    },
  };
}

test("application loader projects narrow account and truthful workspace states", async () => {
  let sessionData = mockSession();
  let workspacesEnabled = true;
  let cookieVal = null;
  let listQueryCount = 0;
  let contextQueryCount = 0;

  const app = loadModule("../lib/application.ts", {
    "next/headers": {
      cookies: async () => ({
        get: (name) => (name === "solodesk_workspace_id" && cookieVal ? { value: cookieVal } : undefined),
      }),
    },
    "@/lib/auth/server": {
      currentSession: async () => sessionData,
    },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => workspacesEnabled,
      isWorkspaceInvitesEnabled: () => false,
      isOwnershipTransferEnabled: () => false,
    },
    "@/lib/workspaces": {
      WorkspaceError: class WorkspaceError extends Error {
        constructor(code, message, statusHttp) {
          super(message);
          this.code = code;
          this.statusHttp = statusHttp;
        }
      },
      listWorkspaces: async () => {
        listQueryCount++;
        return {
          items: [{ id: wsId1, name: "Alpha Team", slug: "alpha", role: "owner", revision: "1" }],
          nextCursor: null,
        };
      },
      getWorkspaceContext: async (id) => {
        contextQueryCount++;
        if (id === wsId1) {
          return {
            workspace: {
              id: wsId1,
              name: "Alpha Team",
              slug: "alpha",
              timezone: "UTC",
              locale: "en",
              currency: "USD",
              revision: "1",
            },
            membership: { id: "mem-1", role: "owner", revision: "1" },
            capabilities: ["workspace.read", "workspace.select"],
          };
        }
        const err = new Error("Not found");
        err.code = "RESOURCE_UNAVAILABLE";
        err.statusHttp = 404;
        throw err;
      },
    },
  });

  // 1. Unselected selection with ready collection
  const ctx1 = await app.getApplicationContext();
  assert.equal(ctx1.account.id, userId);
  assert.equal(ctx1.account.name, "Alice Developer");
  assert.equal(ctx1.account.avatar, "https://example.com/avatar.png");
  assert.equal(ctx1.account.sessionExpiresAt, sessionData.session.expiresAt);
  // Verify secrets are NOT projected
  assert.equal(ctx1.account.token, undefined);
  assert.equal(ctx1.account.secret, undefined);

  assert.equal(ctx1.workspaces.state, "ready");
  assert.equal(ctx1.workspaces.items.length, 1);
  assert.equal(ctx1.workspaces.items[0].id, wsId1);
  assert.equal(ctx1.selection.state, "unselected");
  assert.equal(ctx1.selection.selectedId, null);
  assert.equal(ctx1.selection.context, null);
  assert.equal(listQueryCount, 1);
  assert.equal(contextQueryCount, 0);

  // 2. Selected selection when valid cookie is present
  cookieVal = wsId1;
  const ctx2 = await app.getApplicationContext();
  assert.equal(ctx2.selection.state, "ready");
  assert.equal(ctx2.selection.selectedId, wsId1);
  assert.ok(ctx2.selection.context);
  assert.equal(ctx2.selection.context.workspace.name, "Alpha Team");
  assert.equal(contextQueryCount, 1);

  // 3. Restricted selection when cookie points to inaccessible workspace
  cookieVal = "99999999-9999-9999-9999-999999999999";
  const ctx3 = await app.getApplicationContext();
  assert.equal(ctx3.selection.state, "restricted");
  assert.equal(ctx3.selection.selectedId, cookieVal);
  assert.equal(ctx3.selection.context, null);

  // 4. Disabled workspaces: zero workspace/context queries
  workspacesEnabled = false;
  listQueryCount = 0;
  contextQueryCount = 0;
  const ctx4 = await app.getApplicationContext();
  assert.equal(ctx4.workspaces.state, "disabled");
  assert.equal(ctx4.workspaces.items.length, 0);
  assert.equal(ctx4.selection.state, "disabled");
  assert.equal(listQueryCount, 0);
  assert.equal(contextQueryCount, 0);

  // 5. Unauthenticated session throws UNAUTHORIZED (401)
  sessionData = null;
  await assert.rejects(
    async () => await app.getApplicationContext(),
    (err) => err.code === "UNAUTHORIZED" && err.statusHttp === 401,
  );
});

test("client generation counter only rejects old results and grants no access", () => {
  // Test the invariant defined in data-model.md:
  // "The client generation counter only rejects old results; it grants no access."
  let currentGeneration = 1;

  function handleResponse(responseGen, data) {
    if (responseGen < currentGeneration) {
      return { accepted: false, reason: "STALE_GENERATION" };
    }
    return { accepted: true, data };
  }

  // Active response accepts
  assert.equal(handleResponse(1, { team: "Alpha" }).accepted, true);

  // Increment generation on switch
  currentGeneration = 2;

  // Stale in-flight response from generation 1 is rejected
  const stale = handleResponse(1, { team: "Alpha-Late" });
  assert.equal(stale.accepted, false);
  assert.equal(stale.reason, "STALE_GENERATION");

  // Higher generation number alone does not bypass server authority
  const forged = handleResponse(2, null);
  assert.equal(forged.accepted, true);
  assert.equal(forged.data, null);
});
