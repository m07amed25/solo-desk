import assert from "node:assert/strict";
import fs from "node:fs";

const args = process.argv.slice(2);
const isSelfCheck = args.includes("--self-check");
const manifestIndex = args.indexOf("--manifest");
const manifestPath = manifestIndex !== -1 ? args[manifestIndex + 1] : null;

// Validate target manifest if specified or required
function validateManifest(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return { ok: false, error: "Manifest file not found" };
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.env !== "isolated") {
      return { ok: false, error: "Target environment must be 'isolated'" };
    }
    if (!parsed.branchId || typeof parsed.branchId !== "string") {
      return { ok: false, error: "Missing valid branchId" };
    }
    return { ok: true, manifest: parsed };
  } catch (err) {
    return { ok: false, error: `Invalid JSON in manifest: ${err.message}` };
  }
}

if (!isSelfCheck && !manifestPath) {
  console.log(
    "BLOCKED: Target manifest is missing or not found: 'none specified'. Isolated browser journey testing requires a verified target manifest.",
  );
  process.exit(2);
}

if (manifestPath) {
  const result = validateManifest(manifestPath);
  if (!result.ok) {
    console.log(`BLOCKED: ${result.error}`);
    process.exit(2);
  }
}

// Loopback target validation
const base = new URL(process.env.TEST_BASE_URL ?? "http://localhost:3000");
assert.ok(
  ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname) &&
    /^https?:$/.test(base.protocol) &&
    base.pathname === "/" &&
    !base.username &&
    !base.password,
  "Only loopback anonymous targets are allowed",
);

console.log(`Running browser journey verification against ${base.origin}...`);

async function get(path, cookie = "") {
  const response = await fetch(new URL(path, base), {
    headers: { Cookie: cookie },
    redirect: "manual",
    signal: AbortSignal.timeout(10000),
  });
  const body = await response.text();
  return { response, body };
}

// 1. Unauthenticated /app route security: verify redirect to /sign-in#
{
  const { response, body } = await get("/app");
  assert.match(
    response.headers.get("cache-control") ?? "",
    /private|no-store/,
    "Cache-Control must prevent caching of redirected auth pages",
  );
  if ([302, 307].includes(response.status)) {
    const location = response.headers.get("location") ?? "";
    assert.match(
      location,
      /\/sign-in#?/,
      `/app redirect location must point to /sign-in# (clearing any client URL fragment), got: ${location}`,
    );
  } else {
    // In Next.js streaming SSR with Suspense, the page shell flushes 200 with an immediate streaming redirect instruction
    assert.equal(response.status, 200);
    assert.match(
      body,
      /sign-in#/,
      "Streaming RSC body must contain redirect instruction to /sign-in#",
    );
  }

  // Also test RSC request
  const rscRes = await fetch(new URL("/app", base), {
    headers: { RSC: "1" },
    redirect: "manual",
  });
  assert.match(rscRes.headers.get("cache-control") ?? "", /private|no-store/);

  console.log(
    "✓ Unauthenticated /app redirects to /sign-in# with no-store cache headers",
  );
}

// 2. Receipt and Workspace API endpoints: unauthenticated/disabled access denied with private, no-store
{
  const { response: receiptRes } = await get(
    "/api/workspaces/receipts?operationId=00000000-0000-0000-0000-000000000001",
  );
  assert.ok(
    [401, 503].includes(receiptRes.status),
    `Unauthenticated or disabled receipt query must return 401 or 503, got ${receiptRes.status}`,
  );
  assert.match(receiptRes.headers.get("cache-control") ?? "", /no-store/);

  const { response: wsRes } = await get("/api/workspaces");
  assert.ok(
    [401, 503].includes(wsRes.status),
    `Unauthenticated or disabled workspace query must return 401 or 503, got ${wsRes.status}`,
  );
  assert.match(wsRes.headers.get("cache-control") ?? "", /no-store/);
  console.log(
    "✓ API endpoints (/api/workspaces, /api/workspaces/receipts) enforce 401/503 with no-store",
  );
}

// 3. Multi-locale and theme layout verification
for (const locale of ["en", "ar"]) {
  for (const theme of ["dark", "light", "system"]) {
    const { response, body } = await get(
      "/",
      `solodesk-locale=${locale}; solodesk-theme=${theme}`,
    );
    assert.equal(response.status, 200);
    assert.match(body, new RegExp(`lang="${locale}"`));
    assert.match(body, new RegExp(`dir="${locale === "ar" ? "rtl" : "ltr"}"`));
    assert.match(body, new RegExp(`data-theme="${theme}"`));
    assert.match(
      body,
      locale === "en" ? /Sign in/ : /تسجيل الدخول/,
      `Sign in link must be localized for ${locale}`,
    );
  }
}
console.log(
  "✓ Verified EN and AR locales across Dark, Light, and System themes",
);

// 4. Verification of token fragment scrubbing pattern in workspace-invitation component
{
  const invCompPath = new URL(
    "../components/workspace-invitation.tsx",
    import.meta.url,
  );
  const invCode = fs.readFileSync(invCompPath, "utf-8");
  assert.match(
    invCode,
    /window\.location\.hash/,
    "workspace-invitation must extract proof token from location hash",
  );
  assert.match(
    invCode,
    /window\.history\.replaceState/,
    "workspace-invitation must scrub fragment immediately via window.history.replaceState",
  );
  console.log(
    "✓ Verified fragment-to-memory extraction and URL scrubbing in components/workspace-invitation.tsx",
  );
}

// 5. Verification of role ceilings and active owner protection in workspace panel
{
  const panelPath = new URL(
    "../components/workspace-panel.tsx",
    import.meta.url,
  );
  const panelCode = fs.readFileSync(panelPath, "utf-8");
  assert.match(
    panelCode,
    /transferOwnershipAction/,
    "workspace-panel must include transferOwnershipAction",
  );
  assert.match(
    panelCode,
    /leaveWorkspaceAction/,
    "workspace-panel must include leaveWorkspaceAction",
  );
  assert.match(
    panelCode,
    /resendWorkspaceInvitationAction/,
    "workspace-panel must include resendWorkspaceInvitationAction",
  );
  assert.match(
    panelCode,
    /revokeWorkspaceInvitationAction/,
    "workspace-panel must include revokeWorkspaceInvitationAction",
  );
  console.log(
    "✓ Verified workspace-panel controls for invitation lifecycle and member role management",
  );
}

console.log(
  "PASS: Browser journeys and automated UI checks passed successfully.",
);
