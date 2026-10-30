import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const CONTACT_TOPICS = [
  "general",
  "team",
  "billing",
  "security",
  "feedback",
] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export interface ValidatedContactInput {
  readonly name: string;
  readonly email: string;
  readonly topic: ContactTopic;
  readonly message: string;
  readonly consent: boolean;
  readonly submittedAt: string;
  readonly ipHash: string;
}

export interface ContactValidationSuccess {
  readonly ok: true;
  readonly data: ValidatedContactInput;
}

export interface ContactValidationFailure {
  readonly ok: false;
  readonly error: "validationFailed" | "rateLimited" | "serviceUnavailable";
  readonly fields?: Record<string, string>;
  readonly retryAfter?: number;
  readonly message?: string;
}

export type ContactValidationResult =
  ContactValidationSuccess | ContactValidationFailure;

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function tokenSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Contact token secret is not configured");
  return secret;
}

/**
 * Generate a signed timestamp token for the contact form render time.
 */
export function generateTimestampToken(timestampMs = Date.now()): string {
  const hmac = createHmac("sha256", tokenSecret())
    .update(String(timestampMs))
    .digest("hex")
    .slice(0, 16);
  return `ts_${timestampMs}_${hmac}`;
}

/**
 * Verify render timestamp token to prevent instant bot submissions (<3s) or expired sessions (>1h).
 */
export function verifyTimestampToken(token: unknown): {
  valid: boolean;
  reason?: string;
} {
  if (typeof token !== "string" || !token.startsWith("ts_")) {
    return { valid: false, reason: "invalidTokenFormat" };
  }

  const parts = token.split("_");
  if (parts.length !== 3 || !/^\d{13}$/.test(parts[1]) || !/^[a-f0-9]{16}$/.test(parts[2])) {
    return { valid: false, reason: "malformedToken" };
  }

  const timestampMs = Number.parseInt(parts[1], 10);
  const signature = parts[2];

  if (Number.isNaN(timestampMs)) {
    return { valid: false, reason: "invalidTimestamp" };
  }

  const expectedHmac = createHmac("sha256", tokenSecret())
    .update(String(timestampMs))
    .digest("hex")
    .slice(0, 16);

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
    return { valid: false, reason: "invalidSignature" };
  }

  const now = Date.now();
  const elapsedSeconds = (now - timestampMs) / 1000;

  if (elapsedSeconds < 3.0) {
    return { valid: false, reason: "tooFast" };
  }

  if (elapsedSeconds > 3600) {
    return { valid: false, reason: "tokenExpired" };
  }

  return { valid: true };
}

// In-memory sliding window rate limiter: IP Hash -> Array of submission timestamps (ms)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 3;

/**
 * Hash an IP address for privacy-compliant rate limiting and operational metrics.
 * Raw IP addresses are never persisted or logged in plain text.
 */
export function hashClientIp(clientIp: string): string {
  return createHash("sha256")
    .update((clientIp || "unknown-ip") + tokenSecret())
    .digest("hex")
    .slice(0, 16);
}

/**
 * Check IP-keyed sliding window rate limiting.
 */
export function checkRateLimit(clientIp: string): {
  allowed: boolean;
  retryAfter?: number;
  ipHash: string;
} {
  const ipHash = hashClientIp(clientIp);
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const timestamps = (rateLimitMap.get(ipHash) || []).filter(
    (ts) => ts > windowStart,
  );

  if (timestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    const oldest = timestamps[0];
    const retryAfter = Math.max(
      1,
      Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000),
    );
    rateLimitMap.set(ipHash, timestamps);
    return { allowed: false, retryAfter, ipHash };
  }

  timestamps.push(now);
  rateLimitMap.set(ipHash, timestamps);
  return { allowed: true, ipHash };
}

/**
 * Testing utility to reset in-memory rate limiting state.
 */
export function resetRateLimitsForTesting(): void {
  rateLimitMap.clear();
}

/**
 * Validate incoming contact submission fields against strict schema constraints.
 */
export function validateContactSubmission(
  body: Record<string, unknown>,
  clientIp: string,
): ContactValidationResult {
  const fields: Record<string, string> = {};

  // 1. Honeypot check: website_url must be empty
  const websiteUrl = body.website_url;
  if (typeof websiteUrl === "string" && websiteUrl.trim().length > 0) {
    // Honeypot tripped: silently fail or return validation error
    return {
      ok: false,
      error: "validationFailed",
      fields: { website_url: "invalidSubmission" },
      message: "Submission could not be validated.",
    };
  }

  // 2. Token check (render timestamp bot defense)
  const token = body._token;
  const tokenCheck = verifyTimestampToken(token);
  if (!tokenCheck.valid) {
    return {
      ok: false,
      error: "validationFailed",
      fields: { _token: tokenCheck.reason || "invalidToken" },
      message: "Session token validation failed. Please refresh and try again.",
    };
  }

  // 3. Name validation (1–100 chars, stripped of control characters)
  const rawName = typeof body.name === "string" ? body.name : "";
  const cleanedName = rawName.replace(/[\x00-\x1F\x7F-\x9F]/g, "").trim();
  if (cleanedName.length < 1 || cleanedName.length > 100) {
    fields.name = "nameLength";
  }

  // 4. Email validation (RFC 5322 regex, 5–254 chars, normalized lowercase)
  const rawEmail =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (
    rawEmail.length < 5 ||
    rawEmail.length > 254 ||
    !EMAIL_REGEX.test(rawEmail)
  ) {
    fields.email = "invalidEmail";
  }

  // 5. Topic validation (allowlisted enum)
  const rawTopic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (!CONTACT_TOPICS.includes(rawTopic as ContactTopic)) {
    fields.topic = "invalidTopic";
  }

  // 6. Message validation (10–2000 chars plain text)
  const rawMessage =
    typeof body.message === "string" ? body.message.trim() : "";
  if (rawMessage.length < 10 || rawMessage.length > 2000) {
    fields.message = "messageLength";
  }

  // 7. Consent validation (must be strictly true)
  const consent =
    body.consent === true || body.consent === "true" || body.consent === "on";
  if (!consent) {
    fields.consent = "consentRequired";
  }

  // If any fields failed, return error dictionary
  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      error: "validationFailed",
      fields,
      message: "One or more fields are invalid.",
    };
  }

  // 8. Rate limit check
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      error: "rateLimited",
      retryAfter: rateLimit.retryAfter ?? 600,
      message: "Too many submissions. Please wait before trying again.",
    };
  }

  return {
    ok: true,
    data: {
      name: cleanedName,
      email: rawEmail,
      topic: rawTopic as ContactTopic,
      message: rawMessage,
      consent: true,
      submittedAt: new Date().toISOString(),
      ipHash: rateLimit.ipHash,
    },
  };
}
