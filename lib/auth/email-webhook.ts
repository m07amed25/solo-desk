import "server-only";
import { createHash, createPublicKey, verify, type JsonWebKey } from "node:crypto";
import { authSubjects, type AuthMessageProps } from "../../emails/auth-message";

type SigningKey = JsonWebKey & { kid: string };
let keyCache: { keys: SigningKey[]; fetchedAt: number } | undefined;

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export async function verifyEmailWebhook(rawBody: string, headers: Headers) {
  const signature = headers.get("x-neon-signature") ?? "";
  const kid = headers.get("x-neon-signature-kid");
  const timestamp = headers.get("x-neon-timestamp") ?? "";
  const [header, empty, signed, extra] = signature.split(".");
  if (!kid || !header || empty !== "" || !signed || extra !== undefined ||
      !/^\d{13}$/.test(timestamp) || Math.abs(Date.now() - Number(timestamp)) > 300_000) {
    throw new Error("Invalid webhook signature");
  }
  const protectedHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8"));
  if (!record(protectedHeader) || protectedHeader.alg !== "EdDSA" || protectedHeader.kid !== kid ||
      protectedHeader.crit !== undefined || protectedHeader.b64 !== undefined) {
    throw new Error("Invalid webhook algorithm");
  }

  if (!keyCache || Date.now() - keyCache.fetchedAt > 300_000 ||
      (!keyCache.keys.some((key) => key.kid === kid) && Date.now() - keyCache.fetchedAt > 30_000)) {
    const baseUrl = process.env.NEON_AUTH_BASE_URL;
    if (!baseUrl || new URL(baseUrl).protocol !== "https:") throw new Error("Missing managed Auth URL");
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/.well-known/jwks.json`, {
      signal: AbortSignal.timeout(3000), redirect: "error", cache: "no-store",
    });
    if (!response.ok) throw new Error("Signing keys unavailable");
    const jwks = await response.json();
    if (!record(jwks) || !Array.isArray(jwks.keys)) throw new Error("Invalid signing keys");
    keyCache = { keys: jwks.keys, fetchedAt: Date.now() };
  }
  const jwk = keyCache.keys.find((key) => key.kid === kid && key.kty === "OKP" && key.crv === "Ed25519");
  if (!jwk) throw new Error("Unknown signing key");
  const payload = Buffer.from(`${timestamp}.${Buffer.from(rawBody).toString("base64url")}`).toString("base64url");
  if (!verify(null, Buffer.from(`${header}.${payload}`), createPublicKey({ key: jwk, format: "jwk" }), Buffer.from(signed, "base64url"))) {
    throw new Error("Invalid webhook signature");
  }
  return parseEmailEvent(JSON.parse(rawBody));
}

export function parseEmailEvent(value: unknown) {
  if (!record(value) || !record(value.user) || !record(value.event_data) ||
      typeof value.event_id !== "string" || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value.event_id) ||
      typeof value.user.email !== "string" || value.user.email.length > 254 ||
      !/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(value.user.email) || value.user.banned === true) {
    throw new Error("Invalid email event");
  }
  const data = value.event_data;
  const purpose = value.event_type === "send.otp" ? data.otp_type : data.link_type;
  if ((value.event_type !== "send.otp" && value.event_type !== "send.magic_link") ||
      typeof purpose !== "string" || !Object.hasOwn(authSubjects, purpose) ||
      (data.delivery_preference !== undefined && data.delivery_preference !== "email") ||
      typeof data.expires_at !== "string" || !Number.isFinite(Date.parse(data.expires_at)) || Date.parse(data.expires_at) <= Date.now()) {
    throw new Error("Unsupported or expired email event");
  }
  const common = {
    name: typeof value.user.name === "string" ? value.user.name.slice(0, 100) : "",
    purpose: purpose as keyof typeof authSubjects,
    expiresAt: data.expires_at,
  };
  let props: AuthMessageProps;
  if (value.event_type === "send.otp") {
    if (typeof data.otp_code !== "string" || !/^\d{6}$/.test(data.otp_code)) throw new Error("Invalid code");
    props = { ...common, code: data.otp_code };
  } else {
    if (typeof data.link_url !== "string" || data.link_url.length > 4096) throw new Error("Invalid link");
    const url = new URL(data.link_url);
    if (url.protocol !== "https:" || url.username || url.password || url.origin !== new URL(process.env.NEON_AUTH_BASE_URL!).origin) {
      throw new Error("Untrusted Auth link");
    }
    props = { ...common, url: url.href };
  }
  return { id: value.event_id, to: value.user.email, props, subject: authSubjects[common.purpose] };
}

// A committed claim prevents concurrent sends; uncertain SMTP outcomes require reconciliation.
export async function deliverAuthEmailOnce(rawBody: string, eventId: string, send: () => Promise<void>) {
  const { db } = await import("../db");
  const digest = createHash("sha256").update(rawBody).digest("hex");
  const claim = await db.query(
    "INSERT INTO public.solodesk_email_deliveries (event_id, payload_hash) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING event_id",
    [eventId, digest],
  );
  if (!claim.rowCount) {
    const result = await db.query("SELECT payload_hash, sent_at FROM public.solodesk_email_deliveries WHERE event_id = $1", [eventId]);
    if (result.rows[0]?.payload_hash === digest && result.rows[0]?.sent_at) return;
    throw new Error("Email delivery requires reconciliation");
  }
  await send();
  await db.query("UPDATE public.solodesk_email_deliveries SET sent_at = now() WHERE event_id = $1", [eventId]);
}
