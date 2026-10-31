import assert from "node:assert/strict";

const base = new URL(process.env.TEST_BASE_URL ?? "http://localhost:3000");
assert.ok(
  ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname) &&
    /^https?:$/.test(base.protocol) && base.pathname === "/" &&
    !base.username && !base.password,
  "Only loopback anonymous targets are allowed",
);

async function missing(path, cookie, locale, theme) {
  const response = await fetch(new URL(path, base), {
    headers: { Cookie: cookie },
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
  const body = await response.text();
  assert.equal(response.status, 404, path);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/);
  assert.match(response.headers.get("cache-control") ?? "", /private|no-store/);
  assert.match(body, new RegExp(`lang="${locale}"`));
  assert.match(body, new RegExp(`dir="${locale === "ar" ? "rtl" : "ltr"}"`));
  assert.match(body, new RegExp(`data-theme="${theme}"`));
  assert.match(body, locale === "ar" ? /الصفحة غير موجودة/ : /Page not found/);
  assert.match(body, /name="robots" content="[^"]*noindex/);
  for (const href of ["/", "/sign-in", "/#contact"])
    assert.ok(body.includes(`href="${href}"`), href);
  const visibleMarkup = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  assert.ok(!visibleMarkup.includes("404-secret-probe"), "Recovery UI does not reflect the query");
  assert.doesNotMatch(body, /sealedQuery|sessionExpiresAt/);
  assert.equal(response.headers.getSetCookie().length, 0);
}

for (const locale of ["en", "ar"])
  for (const theme of ["dark", "light", "system"]) {
    const cookie = `solodesk-locale=${locale}; solodesk-theme=${theme}`;
    for (const path of ["/missing-page?token=404-secret-probe", "/app/missing", "/ar/invalid", "/en/dark/app", "/unknown/nested.png"])
      await missing(path, cookie, locale, theme);
  }
await missing("/missing-page", "", "en", "dark");
await missing("/en/dark", "solodesk-locale=__proto__; solodesk-theme=invalid", "en", "dark");
const home = await fetch(base, { redirect: "manual" });
assert.equal(home.status, 200, "The home route still renders");
for (const path of ["/design-system", "/solodesk_logo_transparent.png", "/auth/architecture.webp", "/fonts/rugis.otf"])
  assert.equal((await fetch(new URL(path, base))).status, 200, path);
console.log("PASS 32 real 404 responses, bilingual themes, alias denials, fixed recovery links, private headers, safe defaults and existing assets");
