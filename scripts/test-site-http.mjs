import assert from "node:assert/strict";
const base = new URL(process.env.TEST_BASE_URL ?? "http://localhost:3000");
assert.ok(
  ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname) &&
    /^https?:$/.test(base.protocol) &&
    base.pathname === "/" &&
    !base.username &&
    !base.password,
  "Only loopback anonymous targets are allowed",
);
async function get(path, cookie = "") {
  const response = await fetch(new URL(path, base), {
    headers: { Cookie: cookie },
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
  const body = await response.text();
  assert.match(response.headers.get("cache-control") ?? "", /private|no-store/);
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  assert.doesNotMatch(
    body,
    /sealedQuery|sessionExpiresAt|Neon integration test/,
  );
  return { response, body };
}
for (const locale of ["en", "ar"])
  for (const theme of ["dark", "light", "system"]) {
    const { response, body } = await get(
      "/",
      `solodesk-locale=${locale}; solodesk-theme=${theme}`,
    );
    assert.equal(response.status, 200);
    assert.match(body, new RegExp(`lang="${locale}"`));
    assert.match(body, new RegExp(`dir="${locale === "ar" ? "rtl" : "ltr"}"`));
    assert.match(body, new RegExp(`data-theme="${theme}"`));
    for (const href of ["/sign-in", "/sign-up", "/#features", "/#how-it-works"])
      assert.ok(body.includes(`href="${href}"`), href);
    for (const id of ["features", "how-it-works", "main-content"])
      assert.ok(body.includes(`id="${id}"`));
    assert.match(body, locale === "en" ? /Illustrative preview/ : /عرض توضيحي/);
    assert.doesNotMatch(body, /<form[^>]*action="\/api\/auth|type="password"/);
  }
for (const alias of [
  "/en/dark",
  "/ar/light/sign-in",
  "/en/system/app",
  "/ar/invalid",
  "/en/dark?bypass=1",
])
  assert.equal((await get(alias)).response.status, 404);
async function preferences(
  body,
  origin = base.origin,
  type = "application/x-www-form-urlencoded",
) {
  const response = await fetch(new URL("/api/preferences", base), {
    method: "POST",
    headers: { ...(origin ? { Origin: origin } : {}), "Content-Type": type },
    body,
    redirect: "manual",
  });
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  return response;
}
const valid = "locale=ar&theme=system&returnTo=%2Fsign-up";
const result = await preferences(valid);
assert.equal(result.status, 303);
assert.equal(new URL(result.headers.get("location")).pathname, "/sign-up");
assert.equal(result.headers.getSetCookie().length, 2);
for (const cookie of result.headers.getSetCookie()) {
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.match(cookie, /Path=\//i);
  assert.match(cookie, /Max-Age=31536000/i);
  assert.doesNotMatch(cookie, /Domain=/i);
}
for (const [body, origin, type, status] of [
  [valid, "https://untrusted.example", undefined, 403],
  [valid, "", undefined, 403],
  [valid, base.origin, "application/json", 415],
  ["x".repeat(2049), base.origin, undefined, 413],
  [`${valid}&locale=en`, base.origin, undefined, 400],
  [`${valid}&extra=1`, base.origin, undefined, 400],
  [
    "locale=en&theme=light&returnTo=https://evil.example",
    base.origin,
    undefined,
    400,
  ],
  ["locale=en&theme=auto&returnTo=/", base.origin, undefined, 400],
]) {
  const response = await preferences(body, origin, type);
  assert.equal(response.status, status);
  assert.equal(response.headers.getSetCookie().length, 0);
}
console.log(
  "PASS anonymous landing variants, canonical links/anchors, private headers, alias denial and bounded preferences",
);
for (const locale of ["en", "ar"]) {
  const cookie = `solodesk-locale=${locale}; solodesk-theme=dark`;
  for (const entry of ["sign-in", "sign-up"]) {
    const { response, body } = await get(`/${entry}`, cookie);
    assert.equal(response.status, 200);
    assert.ok(
      body.includes(
        entry === "sign-up"
          ? locale === "en"
            ? "Create your SoloDesk account"
            : "أنشئ حسابك على SoloDesk"
          : locale === "en"
            ? "Sign in to SoloDesk"
            : "تسجيل الدخول إلى SoloDesk",
      ),
    );
    if (process.env.TEST_AUTH_UNAVAILABLE === "1") {
      assert.ok(
        body.includes(
          locale === "en" ? "temporarily unavailable" : "غير متاح مؤقتًا",
        ),
      );
      assert.doesNotMatch(body, /id="profile-name"/);
    } else {
      assert.ok(body.includes("Google") && body.includes("GitHub"));
      assert.ok(
        body.includes(`href="/${entry === "sign-up" ? "sign-in" : "sign-up"}"`),
      );
      assert.match(body, /name="email"/);
      assert.match(body, /name="password"/);
      assert.match(body, /type="password"/);

      // Form before visual pane in DOM order
      const formPos = body.indexOf("account-form-pane");
      const visualPos = body.indexOf("account-visual-pane");
      assert.ok(
        formPos !== -1 && visualPos !== -1 && formPos < visualPos,
        "Form must appear before visual pane in DOM order",
      );

      // Localized illustrative preview caption
      const caption =
        locale === "en"
          ? "SoloDesk workspace illustrative preview"
          : "معاينة توضيحية لمساحة عمل سولو ديسك";
      assert.ok(
        body.includes(caption),
        `Illustrative caption must be present for ${locale}`,
      );

      // Required labels
      assert.ok(
        body.includes(locale === "en" ? "Email address" : "البريد الإلكتروني"),
      );
      assert.ok(body.includes(locale === "en" ? "Password" : "كلمة المرور"));

      if (entry === "sign-up") {
        assert.match(body, /autocomplete="new-password"/i);
        assert.match(body, /name="firstName"/);
        assert.ok(
          body.includes(locale === "en" ? "First name" : "الاسم الأول"),
        );
      } else {
        assert.match(body, /autocomplete="current-password"/i);
        assert.doesNotMatch(body, /name="firstName"/);
        assert.ok(
          body.includes(
            locale === "en" ? "Forgot password?" : "نسيت كلمة المرور؟",
          ),
        );
      }
    }
    assert.match(body, new RegExp(`lang="${locale}"`));
    assert.match(body, new RegExp(`dir="${locale === "ar" ? "rtl" : "ltr"}"`));
    assert.match(body, new RegExp(`data-theme="dark"`));
    assert.ok(body.includes('href="/"'));
    assert.doesNotMatch(body, /name="cardNumber"|name="billing"/);
    assert.doesNotMatch(
      body,
      /href="[^"]*(password|token|code=|otp=)[^"]*"/i,
      "No secrets permitted in navigation hrefs",
    );
    for (const query of [
      "error=technical-secret&error_description=raw-secret",
      "authError=1&next=https://evil.example",
      "authError=1&authError=1",
    ]) {
      const result = await get(`/${entry}?${query}`, cookie);
      const location = result.response.headers.get("location");
      assert.ok(
        location === `/${entry}?authError=1` ||
          result.body.includes(`/${entry}?authError=1`),
      );
      assert.doesNotMatch(
        result.body,
        /<p[^>]*>[^<]*technical-secret|<p[^>]*>[^<]*raw-secret/,
      );
    }
  }
  const account = await get("/app", cookie);
  if (process.env.TEST_AUTH_UNAVAILABLE === "1")
    assert.ok(
      account.body.includes(
        locale === "en" ? "Could not connect" : "تعذّر الاتصال",
      ),
    );
  else
    assert.ok(
      account.response.headers.get("location") === "/sign-in" ||
        account.body.includes("/sign-in"),
    );
  assert.doesNotMatch(account.body, /id="profile-name"/);
}
for (const [query, entry] of [
  ["entry=sign-up", "sign-up"],
  ["entry=bad&next=https://evil.example", "sign-in"],
  ["entry=sign-up&entry=sign-in", "sign-in"],
]) {
  const result = await get(`/auth/callback?${query}`);
  const location = result.response.headers.get("location");
  assert.ok(
    location === `/${entry}?authError=1` ||
      result.body.includes(`/${entry}?authError=1`),
  );
}
const missing = await fetch(new URL("/api/profile", base));
assert.equal(missing.status, 400);
const denied = await fetch(
  new URL("/api/profile?userId=00000000-0000-0000-0000-000000000001", base),
);
assert.equal(
  denied.status,
  process.env.TEST_AUTH_UNAVAILABLE === "1" ? 503 : 401,
);
assert.match(denied.headers.get("cache-control"), /no-store/);
console.log(
  "PASS distinct bilingual account entry, fixed generic error returns, anonymous profile denial and callback fallback",
);

const rsc = await fetch(new URL("/?_rsc=site-check", base), {
  headers: { RSC: "1", Cookie: "solodesk-locale=ar; solodesk-theme=light" },
});
assert.equal(rsc.status, 200);
assert.match(rsc.headers.get("cache-control"), /(?:private,\s*)?no-store/);
assert.match(rsc.headers.get("vary"), /rsc/i);
assert.match(rsc.headers.get("content-type"), /text\/x-component/);
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode("x".repeat(2049)));
    controller.close();
  },
});
const oversized = await fetch(new URL("/api/preferences", base), {
  method: "POST",
  headers: {
    Origin: base.origin,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: stream,
  duplex: "half",
  redirect: "manual",
});
assert.equal(oversized.status, 413);
assert.equal(oversized.headers.getSetCookie().length, 0);
console.log(
  "PASS RSC cache/Vary preservation and streamed preference body bound",
);

await Promise.all(
  Array.from({ length: 18 }, async (_, i) => {
    const locale = i % 2 ? "ar" : "en";
    const theme = ["dark", "light", "system"][i % 3];
    const { body } = await get(
      "/",
      `solodesk-locale=${locale}; solodesk-theme=${theme}`,
    );
    assert.match(body, new RegExp(`lang="${locale}"`));
    assert.match(body, new RegExp(`data-theme="${theme}"`));
    assert.ok(
      body.includes(locale === "ar" ? "عملك. وقتك." : "Your work. Your time."),
    );
  }),
);
const fallback = await get(
  "/",
  "solodesk-locale=../../invalid; solodesk-theme=invalid",
);
assert.match(fallback.body, /lang="en"/);
assert.match(fallback.body, /data-theme="dark"/);
const duplicateId = await fetch(
  new URL("/api/profile?userId=a&userId=b", base),
);
assert.equal(duplicateId.status, 400);
console.log(
  "PASS concurrent locale isolation, invalid-cookie defaults and ambiguous profile input denial",
);
