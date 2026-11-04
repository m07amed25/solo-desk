import { readRequestBody } from "../request-body";

const posts: Record<string, readonly string[]> = {
  "/security/revoke-sessions": ["ids"],
  "/sign-up/email": ["name", "email", "password", "callbackURL", "rememberMe"],
  "/sign-in/email": ["email", "password", "callbackURL", "rememberMe"],
  "/sign-in/social": [
    "provider",
    "callbackURL",
    "errorCallbackURL",
    "newUserCallbackURL",
  ],
  "/sign-out": [],
  "/email-otp/send-verification-otp": ["email", "type"],
  "/email-otp/verify-email": ["email", "otp"],
  "/email-otp/request-password-reset": ["email"],
  "/forget-password/email-otp": ["email"],
  "/email-otp/reset-password": ["email", "otp", "password"],
  "/email-otp/request-email-change": ["newEmail", "otp"],
  "/email-otp/change-email": ["newEmail", "otp"],
  "/update-user": ["name"],
  "/two-factor/enable": ["password", "method"],
  "/two-factor/disable": ["password"],
  "/two-factor/generate-backup-codes": ["password"],
  "/two-factor/verify-totp": ["code"],
  "/two-factor/verify-backup-code": ["code"],
  "/security/confirm": ["action", "body", "password", "code"],
  "/security/acknowledge": ["generation", "saved"],
  "/security/cancel": [],
  "/passkey/verify-registration": ["response", "name"],
  "/passkey/verify-authentication": ["response"],
  "/passkey/delete-passkey": ["id"],
  "/passkey/update-passkey": ["id", "name"],
  "/link-social": ["provider", "callbackURL", "errorCallbackURL"],
  "/unlink-account": ["accountId"],
};
const gets: Record<string, readonly string[]> = {
  "/get-session": [],
  "/security/status": [],
  "/passkey/generate-register-options": ["authenticatorAttachment"],
  "/passkey/generate-authenticate-options": [],
};

export function parseAuthJSON(text: string): Record<string, unknown> {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("JSON object required");
  const tokens = text.match(/"(?:\\.|[^"\\])*"|[{}\[\]:,]/g) || [];
  const stack: Array<Set<string> | null> = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "{" || token === "[") {
      stack.push(token === "{" ? new Set() : null);
      if (stack.length > 12) throw new Error("JSON nesting limit exceeded");
    } else if (token === "}" || token === "]") stack.pop();
    else if (token.startsWith('"') && tokens[i + 1] === ":") {
      const key: string = JSON.parse(token);
      const keys = stack.at(-1);
      if (
        !keys ||
        keys.has(key) ||
        ["__proto__", "prototype", "constructor"].includes(key)
      )
        throw new Error("Duplicate or unsafe JSON field");
      keys.add(key);
    }
  }
  return value as Record<string, unknown>;
}

export async function validateAppAuthRequest(request: Request, origin: string) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/auth/, "");
  if (/^\/callback\/(google|github)$/.test(path)) {
    if (!["GET", "POST"].includes(request.method)) return 405;
    const keys = ["code", "state", "error", "error_description", "iss", "user"];
    if (
      [...url.searchParams.keys()].some(
        (key) =>
          !keys.includes(key) || url.searchParams.getAll(key).length !== 1,
      )
    )
      return 400;
    if (request.method === "GET") return url.search.length > 8192 ? 413 : null;
    const body = await readRequestBody(request.clone(), 8192);
    const fields = new URLSearchParams(body);
    if (
      [...fields.keys()].some(
        (key) =>
          !keys.includes(key) ||
          fields.getAll(key).length !== 1 ||
          url.searchParams.has(key),
      )
    )
      return 400;
    return null;
  }
  const allowed =
    request.method === "GET"
      ? gets[path]
      : request.method === "POST"
        ? posts[path]
        : undefined;
  if (!allowed)
    return request.method === "GET" || request.method === "POST" ? 403 : 405;
  if (request.method === "GET") {
    if (
      [...url.searchParams.keys()].some(
        (key) =>
          !allowed.includes(key) || url.searchParams.getAll(key).length !== 1,
      )
    )
      return 400;
    return null;
  }
  if (
    request.headers.get("origin") !== origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return 403;
  if (url.search) return 400;
  if (
    request.headers.get("content-type")?.split(";", 1)[0] !== "application/json"
  )
    return 415;
  try {
    const body = parseAuthJSON(
      await readRequestBody(
        request.clone(),
        path.startsWith("/passkey/") ? 32768 : 4096,
      ),
    );
    if (Object.keys(body).some((key) => !allowed.includes(key))) return 400;
    if (
      body.provider !== undefined &&
      !["google", "github"].includes(String(body.provider))
    )
      return 400;
    if (
      body.type !== undefined &&
      !["email-verification", "forget-password", "change-email"].includes(
        String(body.type),
      )
    )
      return 400;
    if (body.method !== undefined && body.method !== "totp") return 400;
    for (const field of [
      "name",
      "email",
      "newEmail",
      "password",
      "code",
      "otp",
    ])
      if (
        body[field] !== undefined &&
        (typeof body[field] !== "string" ||
          String(body[field]).length >
            (field === "password" ? 128 : field === "name" ? 100 : 254))
      )
        return 400;
    for (const field of [
      "callbackURL",
      "errorCallbackURL",
      "newUserCallbackURL",
    ]) {
      if (body[field] === undefined) continue;
      const target = new URL(String(body[field]), origin);
      if (
        target.origin !== origin ||
        target.username ||
        target.password ||
        ![
          "/auth/callback",
          "/sign-in",
          "/sign-up",
          "/app/account",
          "/app/account/security",
        ].includes(target.pathname) ||
        target.searchParams.has("token")
      )
        return 400;
    }
    return null;
  } catch (error) {
    return error instanceof RangeError ? 413 : 400;
  }
}
