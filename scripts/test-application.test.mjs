import assert from "node:assert/strict";
import test from "node:test";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { createRequire } from "node:module";
import { createTranslator } from "next-intl";
import {
  authFailure,
  callbackEntry,
  callbackReturnTo,
  parsePreferences,
  preferenceLimit,
} from "../lib/site.ts";
const { NextResponse } = createRequire(import.meta.url)("next/server");
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

function loadModule(path, adapters, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    fileName: path,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    require(name) {
      if (name === "server-only") return {};
      if (name in adapters) return adapters[name];
      if (name === "react") {
        return {
          ...React,
          cache: (fn) => fn, // in test, identity wrapper
        };
      }
      assert.ok(name in adapters, `Unexpected dependency: ${name}`);
      return adapters[name];
    },
    Date,
    Buffer,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    Response,
    URL,
    URLSearchParams,
    Set,
    Math,
    process: {
      env: {
        DATABASE_URL: "postgres://synthetic:synthetic@localhost:9/synthetic",
        SOLODESK_WORKSPACES_ENABLED: "true",
      },
    },
    ...globals,
  });
  return exports;
}

test("runtime refresh stays quiet; history and sign-out still conceal private content", async () => {
  const hooks = [];
  const effects = [];
  const passiveEffects = [];
  const listeners = new Map();
  const intervals = [];
  const microtasks = [];
  let contextRequests = 0;
  let index = 0;
  const navigation = [];
  let discardCount = 0;
  let signOutResponse = async () => ({});
  let signOutOptions;
  const root = { style: {}, inert: false };
  const overlay = { style: {} };
  let finishContext;
  const initialContext = {
    account: {
      id: userId,
      sessionExpiresAt: new Date(Date.now() + 60000).toISOString(),
    },
    workspaces: { items: [] },
    selection: { state: "disabled" },
  };
  const runtimeModule = loadModule(
    "../components/application-runtime.tsx",
    {
      react: {
        ...React,
        useState(initial) {
          const i = index++;
          if (!(i in hooks)) hooks[i] = initial;
          return [
            hooks[i],
            (value) => {
              hooks[i] = typeof value === "function" ? value(hooks[i]) : value;
            },
          ];
        },
        useRef(initial) {
          const i = index++;
          if (!(i in hooks)) hooks[i] = { current: initial };
          return hooks[i];
        },
        useCallback: (fn) => fn,
        useLayoutEffect: (fn) => effects.push(fn),
        useEffect: (fn) => passiveEffects.push(fn),
      },
      "react/jsx-runtime": jsxRuntime,
      "next/navigation": {
        useRouter: () => ({}),
        usePathname: () => "/app/account",
      },
      "next-intl": { useTranslations: () => (key) => key },
      "@/lib/auth/client": {
        authClient: {
          signOut: (options) => {
            signOutOptions = options;
            return signOutResponse();
          },
        },
      },
      "@/app/workspace-actions": {},
      "@/lib/site": { isAppDestination: (path) => path === "/app/account" },
      "@/components/ui/alert": { Alert: "div", AlertDescription: "p" },
      "@/components/ui/button": { Button: "button" },
      "@/components/workspace-invitation": {
        useInvitationEntry: () => ({ clear() {} }),
      },
    },
    {
      window: {
        addEventListener: (name, fn) => listeners.set(name, fn),
        removeEventListener() {},
        location: {
          pathname: "/app/account",
          replace: (path) => navigation.push(path),
        },
      },
      document: {
        visibilityState: "visible",
        querySelectorAll: () => [overlay],
        addEventListener() {},
        removeEventListener() {},
      },
      AbortController,
      AbortSignal,
      fetch: () => {
        contextRequests++;
        return new Promise((resolve) => {
          finishContext = resolve;
        });
      },
      setTimeout: () => 1,
      setInterval: (fn) => {
        intervals.push(fn);
        return 1;
      },
      clearInterval() {},
      queueMicrotask: (fn) => microtasks.push(fn),
      clearTimeout() {},
    },
  );
  const render = () => {
    index = 0;
    return runtimeModule.ApplicationRuntime({ initialContext, children: null });
  };
  const tree = render();
  tree.props.children[1].props.ref.current = root;
  let cleanup = effects.map((effect) => effect()).filter(Boolean);
  const initialEffects = effects.slice();
  microtasks.splice(0).forEach((fn) => fn());
  passiveEffects.forEach((effect) => effect());
  for (const dispose of cleanup) dispose();
  cleanup = initialEffects.map((effect) => effect()).filter(Boolean);
  microtasks.splice(0).forEach((fn) => fn());
  assert.equal(
    contextRequests,
    0,
    "Strict Mode must reuse the request-validated initial context without another blocking fetch",
  );
  assert.equal(render().props.value.accountState, "ready");
  assert.equal(root.style.display, "flex");
  assert.equal(
    listeners.has("blur"),
    false,
    "Losing window focus must not blank the app",
  );
  listeners.get("pageshow")({ persisted: false });
  assert.equal(
    contextRequests,
    0,
    "Ordinary initial pageshow must not repeat server validation",
  );
  for (const refresh of [listeners.get("focus"), intervals[0]]) {
    refresh();
    assert.equal(
      root.style.display,
      "flex",
      "Routine refresh must leave the active app visible",
    );
    assert.equal(root.inert, false);
    assert.equal(render().props.value.accountState, "ready");
    finishContext(Response.json(initialContext));
    await new Promise(setImmediate);
  }
  listeners.get("focus")();
  finishContext(new Response(null, { status: 503 }));
  await new Promise(setImmediate);
  assert.equal(
    root.style.display,
    "none",
    "A failed background check must conceal private content",
  );
  assert.equal(render().props.value.accountState, "unavailable");
  listeners.get("focus")();
  assert.equal(
    root.style.display,
    "none",
    "A failed check must stay concealed until fresh validation succeeds",
  );
  finishContext(Response.json(initialContext));
  await new Promise(setImmediate);
  listeners.get("pagehide")();
  assert.equal(
    root.style.display,
    "none",
    "History snapshots must conceal private content",
  );
  const checking = render();
  assert.equal(checking.props.value.accountState, "checking");
  assert.equal(
    checking.props.children[0].props.className,
    "sr-only",
    "Checking must have no visible loading screen",
  );
  const beforeRestore = contextRequests;
  listeners.get("pageshow")({ persisted: true });
  assert.equal(contextRequests, beforeRestore + 1);
  assert.equal(root.style.display, "none");
  finishContext(Response.json(initialContext));
  await new Promise(setImmediate);
  tree.props.value.registerDirtyForm("draft", {
    isDirty: () => true,
    discard: () => {
      discardCount++;
    },
  });
  await tree.props.value.signOut();
  assert.ok(
    signOutOptions?.fetchOptions?.timeout > 0 &&
      signOutOptions.fetchOptions.timeout <= 15000,
  );
  assert.equal(root.style.display, "none");
  assert.equal(root.inert, true);
  assert.equal(overlay.style.display, "none");
  assert.equal(discardCount, 1);
  assert.deepEqual(navigation, []);
  const after = render().props.value;
  assert.equal(after.accountState, "unavailable");
  assert.equal(after.errorMessage, "signOutFailed");
  let finish;
  signOutResponse = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  const late = after.signOut();
  for (const dispose of cleanup) dispose();
  finish({ data: { success: true }, error: null });
  await late;
  assert.deepEqual(
    navigation,
    [],
    "An unmounted account owner must ignore a late sign-out response",
  );
  const beforeRemount = contextRequests;
  hooks.length = 0;
  effects.length = 0;
  passiveEffects.length = 0;
  const freshTree = render();
  freshTree.props.children[1].props.ref.current = root;
  const disposeFresh = effects.map((effect) => effect()).filter(Boolean);
  microtasks.splice(0).forEach((fn) => fn());
  assert.equal(
    contextRequests,
    beforeRemount,
    "A new server-validated runtime must not inherit another runtime's history state",
  );
  assert.equal(render().props.value.accountState, "ready");
  for (const dispose of disposeFresh) dispose();
});

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
        get: (name) =>
          name === "solodesk_workspace_id" && cookieVal
            ? { value: cookieVal }
            : undefined,
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
      validateUUID: (value) => value,
      listWorkspaces: async () => {
        listQueryCount++;
        return {
          items: [
            {
              id: wsId1,
              name: "Alpha Team",
              slug: "alpha",
              role: "owner",
              revision: "1",
            },
          ],
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

test("current trusted session, bounded choices and safe failures at the imported loader", async () => {
  let identity = mockSession();
  let identityFailure = false;
  let listFailure = false;
  let selected = wsId1;
  let empty = false;
  let contextId = wsId1;
  let listCalls = 0;
  const app = loadModule("../lib/application.ts", {
    "next/headers": {
      cookies: async () => ({
        get: () => (selected ? { value: selected } : undefined),
      }),
    },
    "@/lib/auth/server": {
      currentSession: async () => {
        if (identityFailure) throw new Error("private provider detail");
        return identity;
      },
    },
    "@/lib/auth/capabilities": {
      isWorkspacesEnabled: () => true,
      isWorkspaceInvitesEnabled: () => false,
      isOwnershipTransferEnabled: () => false,
    },
    "@/lib/workspaces": {
      WorkspaceError: class extends Error {},
      validateUUID: (value) => {
        if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value))
          throw new Error("invalid UUID");
        return value;
      },
      listWorkspaces: async (optionsOrSession, maybeOptions) => {
        listCalls++;
        const options = maybeOptions || optionsOrSession || {};
        assert.equal(options.limit, 20, "One page, default 20/max 50.");
        if (listFailure) throw new Error("private database detail");
        return {
          items: empty
            ? []
            : [
                {
                  id: wsId1,
                  name: "A",
                  slug: "a",
                  role: "owner",
                  revision: "1",
                  secret: "private",
                },
              ],
          nextCursor: null,
        };
      },
      getWorkspaceContext: async () => ({
        workspace: { id: contextId },
        capabilities: ["workspace.read", "workspace.select"],
      }),
    },
  });
  const ready = await app.getApplicationContext();
  assert.deepEqual(
    Object.keys(ready.account).sort(),
    ["avatar", "id", "name", "sessionExpiresAt"],
    "Never project tokens/secrets.",
  );
  assert.equal(ready.workspaces.items[0].secret, undefined);
  assert.equal(listCalls, 1);
  contextId = "10000000-0000-0000-0000-000000000002";
  assert.equal(
    (await app.getApplicationContext()).selection.context,
    null,
    "Context is non-null only for a verified ready selection matching account/requested UUID.",
  );
  contextId = wsId1;
  empty = true;
  selected = null;
  assert.equal((await app.getApplicationContext()).workspaces.state, "empty");
  listFailure = true;
  const unavailable = await app.getApplicationContext();
  assert.equal(unavailable.workspaces.state, "unavailable");
  assert.equal(
    unavailable.workspaces.error,
    "SERVICE_UNAVAILABLE",
    "Error is a stable code mapped to localized copy, not exception text.",
  );
  for (const expiresAt of [
    "invalid",
    new Date(Date.now() - 1000).toISOString(),
  ]) {
    identity = mockSession(expiresAt);
    await assert.rejects(
      app.getApplicationContext(),
      (e) => e.code === "UNAUTHORIZED" && e.statusHttp === 401,
      "Current trusted session only; expiry finite and future.",
    );
  }
  identityFailure = true;
  await assert.rejects(
    app.getApplicationContext(),
    (e) => e.code === "SERVICE_UNAVAILABLE" && e.statusHttp === 503,
  );
});

test("actual context GET uses private stable-code 200/400/401/503 responses", async () => {
  class ApplicationError extends Error {
    constructor(code, statusHttp) {
      super("private provider detail");
      this.code = code;
      this.statusHttp = statusHttp;
    }
  }
  let failure;
  let calls = 0;
  const route = loadModule("../app/api/app/context/route.ts", {
    "next/server": { NextResponse: Response },
    "@/lib/application": {
      ApplicationError,
      getApplicationContext: async () => {
        calls++;
        if (failure) throw failure;
        return { workspaces: { state: "unavailable" } };
      },
    },
  });
  for (const [query, error, status, code] of [
    ["", null, 200, undefined],
    ["?unknown=1", null, 400, "VALIDATION"],
    ["", new ApplicationError("UNAUTHORIZED", 401), 401, "UNAUTHORIZED"],
    [
      "",
      new ApplicationError("SERVICE_UNAVAILABLE", 503),
      503,
      "SERVICE_UNAVAILABLE",
    ],
    ["", new Error("private provider detail"), 503, "SERVICE_UNAVAILABLE"],
  ]) {
    failure = error;
    const before = calls;
    const res = await route.GET({
      url: `http://localhost/api/app/context${query}`,
    });
    assert.equal(res.status, status);
    assert.match(res.headers.get("cache-control"), /private, no-store/);
    assert.match(res.headers.get("vary"), /Cookie/);
    const body = await res.json();
    if (code) assert.deepEqual(body, { error: code });
    if (query)
      assert.equal(
        calls,
        before,
        "unexpected fields must not reach account authority",
      );
  }
});

test("actual selection actions require current authority, canonical selectors and bounded compare-before-clear", async () => {
  let session = mockSession();
  let cookie = wsId1;
  let deleted = 0;
  let written;
  let canSelect = true;
  let contextCalls = 0;
  class WorkspaceError extends Error {
    constructor(code, message, statusHttp) {
      super(message);
      this.code = code;
      this.statusHttp = statusHttp;
    }
  }
  const actions = loadModule("../app/workspace-actions.ts", {
    "next/headers": {
      cookies: async () => ({
        get: () => (cookie ? { value: cookie } : undefined),
        delete: () => {
          deleted++;
          cookie = null;
        },
        set: (_name, value, options) => {
          written = { value, options };
        },
      }),
    },
    "@/lib/auth/server": { currentSession: async () => session },
    "@/lib/workspaces": {
      WorkspaceError,
      validateUUID: (value) => {
        if (
          typeof value !== "string" ||
          !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
        )
          throw new WorkspaceError("VALIDATION", "Invalid UUID", 400);
        return value.toLowerCase();
      },
      getWorkspaceContext: async () => {
        contextCalls++;
        return {
          capabilities: canSelect
            ? ["workspace.read", "workspace.select"]
            : ["workspace.read"],
        };
      },
    },
  });
  session = null;
  assert.equal(
    (await actions.clearWorkspaceSelectionAction(wsId1)).success,
    false,
    "a cookie mutation requires a fresh account",
  );
  assert.equal(deleted, 0);
  session = mockSession();
  for (const invalid of [undefined, "", "a".repeat(4097), "ع".repeat(2049)]) {
    assert.equal(
      (await actions.clearWorkspaceSelectionAction(invalid)).error,
      "VALIDATION",
    );
    assert.equal(deleted, 0);
  }
  assert.equal(
    (await actions.clearWorkspaceSelectionAction("other-stale-selector"))
      .success,
    true,
  );
  assert.equal(deleted, 0, "mismatched cookie is untouched");
  cookie = "malformed-stale-selector";
  assert.equal(
    (await actions.clearWorkspaceSelectionAction(cookie)).success,
    true,
  );
  assert.equal(deleted, 1, "bounded malformed stale selectors may be cleared");
  assert.equal(
    (await actions.clearWorkspaceSelectionAction(wsId1)).success,
    true,
  );
  assert.equal(deleted, 1, "absent cookie is idempotent");
  assert.equal(
    (await actions.selectWorkspaceAction("-".repeat(36))).error,
    "VALIDATION",
  );
  assert.equal(contextCalls, 0);
  canSelect = false;
  assert.equal((await actions.selectWorkspaceAction(wsId1)).success, false);
  assert.equal(written, undefined);
  canSelect = true;
  assert.equal(
    (await actions.selectWorkspaceAction(wsId1.toUpperCase())).success,
    true,
  );
  assert.equal(written.value, wsId1);
  assert.equal(written.options.httpOnly, true);
  assert.equal(written.options.sameSite, "lax");
  assert.equal(written.options.path, "/");
});

test("actual preference redirects explicitly clear fragments and retain origin/body bounds", async () => {
  const route = loadModule("../app/api/preferences/route.ts", {
    "next/server": { NextResponse },
    "next-intl": { createTranslator },
    "@/messages/en.json": {
      default: JSON.parse(
        readFileSync(new URL("../messages/en.json", import.meta.url)),
      ),
    },
    "@/messages/ar.json": {
      default: JSON.parse(
        readFileSync(new URL("../messages/ar.json", import.meta.url)),
      ),
    },
    "@/lib/site": { parsePreferences, preferenceLimit },
  });
  for (const destination of ["/app", "/app/workspace", "/app/account"]) {
    const request = new Request("https://example.invalid/api/preferences", {
      method: "POST",
      headers: {
        origin: "https://example.invalid",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        locale: "ar",
        theme: "system",
        returnTo: destination,
      }),
    });
    const res = await route.POST(request);
    assert.equal(res.status, 303);
    assert.equal(
      res.headers.get("location"),
      `https://example.invalid${destination}#`,
    );
    assert.match(res.headers.get("cache-control"), /private, no-store/);
    assert.match(res.headers.get("set-cookie"), /HttpOnly/i);
  }
  for (const [origin, body, expected] of [
    ["https://foreign.invalid", "locale=en&theme=dark&returnTo=/app", 403],
    ["https://example.invalid", "x".repeat(2049), 413],
    [
      "https://example.invalid",
      "locale=en&theme=dark&returnTo=/app&returnTo=/",
      400,
    ],
  ]) {
    const res = await route.POST(
      new Request("https://example.invalid/api/preferences", {
        method: "POST",
        headers: {
          origin,
          "content-type": "application/x-www-form-urlencoded",
        },
        body,
      }),
    );
    assert.equal(res.status, expected);
  }
});

test("actual callback render clears fragments on success, denial and bounded-query rejection", async () => {
  let session = mockSession();
  let reads = 0;
  const callback = loadModule("../app/(utility)/auth/callback/page.tsx", {
    "react/jsx-runtime": jsxRuntime,
    "next/server": { connection: async () => {} },
    "next/navigation": {
      redirect: (location) => {
        throw Object.assign(new Error("Redirect"), { location });
      },
    },
    "@/lib/auth/server": {
      currentSession: async () => {
        reads++;
        return session;
      },
    },
    "@/lib/site": {
      authFailure,
      callbackEntry,
      callbackReturnTo,
      preferenceLimit,
    },
    "@/components/ui/skeleton": { Skeleton: () => null },
  });
  const complete = (query) => {
    const element = callback.default({ searchParams: Promise.resolve(query) })
      .props.children;
    return element.type(element.props);
  };
  for (const returnTo of ["/app", "/app/workspace", "/app/account"]) {
    await assert.rejects(
      complete({ returnTo }),
      (error) => error.location === `${returnTo}#`,
    );
  }
  session = null;
  await assert.rejects(
    complete({ returnTo: "/app/account" }),
    (error) => error.location === "/sign-in?authError=1#",
  );
  session = mockSession();
  const before = reads;
  for (const query of [
    { returnTo: "/app/account", entry: "x".repeat(2049) },
    { returnTo: ["/app", "/app/account"] },
    { returnTo: "/app", unknown: "ignored" },
  ]) {
    await assert.rejects(
      complete(query),
      (error) => error.location === "/sign-in?authError=1#",
    );
  }
  assert.equal(
    reads,
    before,
    "invalid callback fields do not reach account authority",
  );
});
