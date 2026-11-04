import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";

const output = await build({
  entryPoints: ["lib/auth/app-requests.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const { parseAuthJSON, validateAppAuthRequest } = await import(
  `data:text/javascript;base64,${Buffer.from(output.outputFiles[0].text).toString("base64")}`
);
const origin = "https://solodesk.example";
function request(path, body, headers = {}) {
  return new Request(origin + "/api/auth" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { Origin: origin, "Content-Type": "application/json", ...headers },
    body,
  });
}

test("auth JSON rejects duplicate, escaped, nested and prototype fields", () => {
  for (const json of [
    '{"email":"a","email":"b"}',
    '{"email":"a","em\\u0061il":"b"}',
    '{"response":{"id":1,"id":2}}',
    '{"__proto__":{}}',
    '{"response":{"constructor":1}}',
    "[]",
    "null",
  ])
    assert.throws(() => parseAuthJSON(json), json);
  assert.deepEqual(
    parseAuthJSON(
      '{"password":"a\\\"b", "response":{"items":[{"id":1},{"id":2}]}}',
    ),
    { password: 'a"b', response: { items: [{ id: 1 }, { id: 2 }] } },
  );
});

test("auth boundary enforces origin, exact fields, callbacks, methods and byte limits", async () => {
  assert.equal(
    await validateAppAuthRequest(
      request(
        "/sign-in/email",
        '{"email":"a@example.test","password":"synthetic"}',
      ),
      origin,
    ),
    null,
  );
  assert.equal(
    await validateAppAuthRequest(
      request("/sign-in/email", "{}", { Origin: "https://foreign.example" }),
      origin,
    ),
    403,
  );
  assert.equal(
    await validateAppAuthRequest(
      request("/sign-in/email", "{}", { "Sec-Fetch-Site": "cross-site" }),
      origin,
    ),
    403,
  );
  assert.equal(
    await validateAppAuthRequest(
      request("/sign-in/email", "{}", { "Content-Type": "text/plain" }),
      origin,
    ),
    415,
  );
  assert.equal(
    await validateAppAuthRequest(
      request("/sign-in/email", '{"userId":"foreign"}'),
      origin,
    ),
    400,
  );
  assert.equal(
    await validateAppAuthRequest(
      request(
        "/sign-in/social",
        '{"provider":"google","callbackURL":"https://foreign.example/auth/callback"}',
      ),
      origin,
    ),
    400,
  );
  assert.equal(
    await validateAppAuthRequest(
      request(
        "/sign-in/social",
        '{"provider":"google","additionalData":{"trusted":true}}',
      ),
      origin,
    ),
    400,
  );
  assert.equal(
    await validateAppAuthRequest(
      request("/sign-in/email", JSON.stringify({ password: "x".repeat(5000) })),
      origin,
    ),
    413,
  );
  assert.equal(
    await validateAppAuthRequest(
      request("/sign-in/email", new Uint8Array([0xc3, 0x28])),
      origin,
    ),
    400,
  );
  assert.equal(
    await validateAppAuthRequest(
      request("/get-session?userId=foreign"),
      origin,
    ),
    400,
  );
  assert.equal(
    await validateAppAuthRequest(
      request("/callback/google?state=a&state=b"),
      origin,
    ),
    400,
  );
  assert.equal(
    await validateAppAuthRequest(
      request("/callback/google?state=a", "state=b", {
        "Content-Type": "application/x-www-form-urlencoded",
      }),
      origin,
    ),
    400,
  );
  for (const path of [
    "/two-factor/view-backup-codes",
    "/two-factor/get-totp-uri",
    "/two-factor/verify-otp",
    "/sign-in/email-otp",
    "/get-access-token",
    "/admin/list-users",
  ])
    assert.equal(
      await validateAppAuthRequest(request(path, "{}"), origin),
      403,
      path,
    );
});
