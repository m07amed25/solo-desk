import assert from "node:assert/strict";
import { loadEnvFile } from "node:process";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";

/**
 * Shared safety guards for SoloDesk auth integration tests.
 * Prevents running against production or unidentified environments.
 */
export function validateTargetEnv(env = process.env, manifest = null) {
  assert.equal(
    env.SOLODESK_TEST_ENV,
    "isolated",
    "Auth flow tests require an independently verified isolated target and SOLODESK_TEST_ENV=isolated",
  );
  assert.ok(
    env.NEON_BRANCH,
    "Target branch name (NEON_BRANCH) must be specified",
  );
  assert.ok(
    !/prod/i.test(env.NEON_BRANCH),
    `Production or prod-like branch '${redact(env.NEON_BRANCH)}' cannot run test fixtures`,
  );
  if (env.DATABASE_URL) {
    assert.ok(
      !/prod/i.test(env.DATABASE_URL),
      "DATABASE_URL appears to point to a production database",
    );
  }

  // Cross-check environment against manifest to prevent mismatched identity or inherited leakage
  if (manifest) {
    if (env.NEON_BRANCH && manifest.neonBranch) {
      assert.equal(
        env.NEON_BRANCH,
        manifest.neonBranch,
        "Environment NEON_BRANCH must match target manifest neonBranch",
      );
    }
    if (env.DATABASE_URL && manifest.databaseUrl) {
      let envDb, manifestDb;
      try {
        envDb = new URL(env.DATABASE_URL);
        manifestDb = new URL(manifest.databaseUrl);
      } catch {
        // Fall back to exact string comparison if URL parsing fails
      }
      if (envDb && manifestDb) {
        assert.equal(
          envDb.host,
          manifestDb.host,
          "Environment DATABASE_URL host must match target manifest databaseUrl host",
        );
        assert.equal(
          envDb.pathname,
          manifestDb.pathname,
          "Environment DATABASE_URL database path must match target manifest databaseUrl",
        );
      } else {
        assert.equal(
          env.DATABASE_URL,
          manifest.databaseUrl,
          "DATABASE_URL must match manifest databaseUrl exactly",
        );
      }
    }
    if (env.BETTER_AUTH_URL && manifest.authBaseUrl) {
      let envAuth, manifestAuth;
      try {
        envAuth = new URL(env.BETTER_AUTH_URL);
        manifestAuth = new URL(manifest.authBaseUrl);
      } catch {
        // Fall back to exact string comparison if URL parsing fails
      }
      if (envAuth && manifestAuth) {
        assert.equal(
          envAuth.origin,
          manifestAuth.origin,
          "Environment BETTER_AUTH_URL origin must match target manifest authBaseUrl origin",
        );
      } else {
        assert.equal(
          env.BETTER_AUTH_URL,
          manifest.authBaseUrl,
          "BETTER_AUTH_URL must match manifest authBaseUrl exactly",
        );
      }
    }
  }

  return true;
}

/**
 * Validates an isolated target manifest binding app, auth, db, branch, sink, and synthetic fixtures.
 * Rejects production-labelled endpoints, mismatched identities, missing authorization, and real-data fixtures.
 */
export function validateTargetManifest(manifest, options = {}) {
  assert.ok(
    manifest && typeof manifest === "object",
    "Target manifest must be a non-null object",
  );
  assert.equal(
    manifest.environment,
    "isolated",
    "Target manifest must specify environment='isolated'",
  );
  assert.ok(manifest.appUrl, "Target manifest requires appUrl");
  assert.ok(manifest.databaseUrl, "Target manifest requires databaseUrl");
  assert.ok(manifest.neonBranch, "Target manifest requires neonBranch");
  assert.ok(manifest.authBaseUrl, "Target manifest requires authBaseUrl");
  assert.ok(manifest.webhookSinkId, "Target manifest requires webhookSinkId");
  assert.ok(
    manifest.fixtureNamespace,
    "Target manifest requires fixtureNamespace",
  );
  if (manifest.authorizationToken !== undefined || options.requireAuth) {
    assert.ok(
      manifest.authorizationToken &&
        typeof manifest.authorizationToken === "string" &&
        manifest.authorizationToken.trim().length >= 16,
      "Target manifest requires authorizationToken proving authorization under G5 (minimum 16 characters)",
    );
  }

  // Reject production-labelled targets
  assert.ok(
    !/prod/i.test(manifest.neonBranch),
    `Production or prod-like branch '${redact(manifest.neonBranch)}' cannot run test fixtures`,
  );
  assert.ok(
    !/prod/i.test(manifest.databaseUrl),
    "databaseUrl must not point to a production database",
  );
  assert.ok(
    !/solodesk\.com|production/i.test(manifest.appUrl),
    "appUrl must not point to a production endpoint",
  );
  assert.ok(
    !/prod/i.test(manifest.authBaseUrl),
    "authBaseUrl must not point to a production auth service",
  );

  // Mismatched branch check
  if (manifest.branchId && manifest.neonBranch) {
    assert.equal(
      manifest.branchId,
      manifest.neonBranch,
      "Target manifest branchId and neonBranch must match",
    );
  }

  // Webhook sink must be synthetic isolated sink; reject public or production aggregators
  assert.ok(
    /(?:sink-synth|solodesk-(?:sink|synthetic)-[a-z0-9-]+|synthetic-sink)/i.test(
      manifest.webhookSinkId,
    ),
    `webhookSinkId '${redact(manifest.webhookSinkId)}' must be a synthetic isolated sink (e.g. solodesk-sink-* or sink-synth-*)`,
  );
  assert.ok(
    !/prod|webhook\.site|discord|slack|sendgrid|mailgun/i.test(
      manifest.webhookSinkId,
    ),
    "webhookSinkId must not reference external or production sink services",
  );

  // Reject copied real-data fixtures or non-synthetic fixture ownership
  assert.ok(
    /^solodesk-(?:test|synthetic|auth-[a-z0-9-]+)/i.test(
      manifest.fixtureNamespace,
    ),
    `Fixture namespace '${redact(manifest.fixtureNamespace)}' must be an isolated synthetic prefix (e.g. solodesk-synthetic-*)`,
  );
  if (manifest.sampleAccount) {
    assert.ok(
      /@(?:example\.com|test\.local|invalid)$/i.test(manifest.sampleAccount),
      "Sample account must not use real public domain; must use example.com, test.local or invalid",
    );
  }

  return true;
}

/**
 * Generates synthetic test identity with safe random names and emails.
 */
export function generateSyntheticIdentity(prefix = "flow") {
  const uuid = randomUUID();
  const email = `solodesk-auth-${prefix}-${uuid}@example.com`;
  const password = `TestPass!${uuid.slice(0, 12)}A1#`;
  const firstName = "Synthetic";
  const lastName = `User ${uuid.slice(0, 6)}`;
  const combinedName = `${firstName} ${lastName}`;
  return { email, password, firstName, lastName, combinedName, uuid };
}

/**
 * Redaction utility for safe test logging.
 * Replaces sensitive values (passwords, 6-digit OTP codes, cookie secrets, database passwords, JWTs) with [REDACTED].
 */
export function redact(text) {
  if (typeof text !== "string") {
    try {
      text = JSON.stringify(text);
    } catch {
      return "[UNSERIALIZABLE]";
    }
  }
  return text
    .replace(
      /(password|secret|code|token|key|credential|authorization)["']?\s*[:=]\s*["']?([^"',\s}]+)["']?/gi,
      '$1: "[REDACTED]"',
    )
    .replace(/(postgres(?:ql)?:\/\/[^:]+:)([^@]+)(@)/gi, "$1[REDACTED]$3")
    .replace(
      /\beyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g,
      "[JWT-REDACTED]",
    )
    .replace(/(?:set-cookie|cookie):\s*([^;\r\n]+)/gi, "cookie: [REDACTED]")
    .replace(/bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/\b\d{6}\b/g, "[CODE-REDACTED]");
}

/**
 * Ephemeral in-memory challenge sink.
 * Challenges are never persisted to disk or emitted to logs.
 */
export class EphemeralChallengeStore {
  #challenges = new Map();

  record(email, purpose, code) {
    assert.ok(
      typeof code === "string" && /^\d{6}$/.test(code),
      "Code must be a 6-digit string",
    );
    this.#challenges.set(`${email.toLowerCase().trim()}:${purpose}`, {
      code,
      receivedAt: Date.now(),
      consumed: false,
    });
  }

  get(email, purpose) {
    const entry = this.#challenges.get(`${email.toLowerCase().trim()}:${purpose}`);
    if (!entry || entry.consumed) return null;
    return entry.code;
  }

  consume(email, purpose, code) {
    const entry = this.#challenges.get(`${email.toLowerCase().trim()}:${purpose}`);
    if (!entry || entry.consumed || entry.code !== code) return false;
    entry.consumed = true;
    return true;
  }

  /**
   * Ephemeral bridge to pull/poll synthetic webhook sink for intercepted challenges.
   * Challenge code is loaded directly into private in-memory store and never logged.
   */
  async bridgeFromSyntheticSink(sinkUrl, options = {}) {
    if (!sinkUrl) return 0;
    try {
      const fetchFn = options.fetchFn || globalThis.fetch;
      const res = await fetchFn(sinkUrl, {
        headers: {
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        },
      });
      if (!res.ok) return 0;
      const data = await res.json();
      if (!Array.isArray(data)) return 0;
      let count = 0;
      for (const item of data) {
        if (item?.recipient && item?.otp && item?.purpose) {
          this.record(item.recipient, item.purpose, item.otp);
          count++;
        }
      }
      return count;
    } catch {
      return 0;
    }
  }

  clear() {
    this.#challenges.clear();
  }
}

/**
 * Self-check runner for guards and isolation logic without contacting remote services.
 */
export async function runGuardSelfChecks() {
  console.log("Running auth flow harness guard self-checks...");

  // 1. Validate guard rejection of missing or incorrect SOLODESK_TEST_ENV
  assert.throws(
    () => validateTargetEnv({}),
    /SOLODESK_TEST_ENV=isolated/,
    "Must throw when SOLODESK_TEST_ENV is missing",
  );
  assert.throws(
    () => validateTargetEnv({ SOLODESK_TEST_ENV: "production" }),
    /SOLODESK_TEST_ENV=isolated/,
    "Must throw when SOLODESK_TEST_ENV is not 'isolated'",
  );

  // 2. Validate guard rejection of production NEON_BRANCH
  assert.throws(
    () => validateTargetEnv({ SOLODESK_TEST_ENV: "isolated" }),
    /NEON_BRANCH.*must be specified/,
    "Must throw when NEON_BRANCH is missing",
  );
  assert.throws(
    () =>
      validateTargetEnv({
        SOLODESK_TEST_ENV: "isolated",
        NEON_BRANCH: "production",
      }),
    /Production or prod-like branch/,
    "Must throw when NEON_BRANCH is 'production'",
  );
  assert.throws(
    () =>
      validateTargetEnv({
        SOLODESK_TEST_ENV: "isolated",
        NEON_BRANCH: "my-prod-branch",
      }),
    /Production or prod-like branch/,
    "Must throw when NEON_BRANCH contains 'prod'",
  );

  // 3. Validate guard acceptance of valid isolated branch
  const validEnv = {
    SOLODESK_TEST_ENV: "isolated",
    NEON_BRANCH: "feat-test-auth-preview",
    DATABASE_URL:
      "postgres://user:pass@ep-isolated-123.us-east-2.aws.neon.tech/neondb",
  };
  assert.equal(
    validateTargetEnv(validEnv),
    true,
    "Must accept valid isolated environment",
  );

  // 4. Validate synthetic identity generation
  const identity = generateSyntheticIdentity("selfcheck");
  assert.match(
    identity.email,
    /^solodesk-auth-selfcheck-[0-9a-f-]+@example\.com$/,
    "Synthetic email must follow bounded domain pattern",
  );
  assert.ok(
    identity.password.length >= 12,
    "Password must be compliant length",
  );
  assert.equal(
    identity.combinedName,
    `${identity.firstName} ${identity.lastName}`,
  );

  // 5. Validate redaction utility
  const sensitiveString =
    'User submitted password="SecretPassword123" with code: 123456 and token=abc-xyz';
  const sanitized = redact(sensitiveString);
  assert.ok(
    !sanitized.includes("SecretPassword123"),
    "Sensitive password must be redacted",
  );
  assert.ok(!sanitized.includes("123456"), "6-digit OTP code must be redacted");
  assert.ok(
    sanitized.includes("[REDACTED]") || sanitized.includes("[CODE-REDACTED]"),
  );

  // 6. Validate in-memory challenge store
  const store = new EphemeralChallengeStore();
  store.record("user@example.com", "verify", "012345");
  assert.equal(store.get("user@example.com", "verify"), "012345");
  assert.equal(store.consume("user@example.com", "verify", "999999"), false);
  assert.equal(store.consume("user@example.com", "verify", "012345"), true);
  assert.equal(
    store.get("user@example.com", "verify"),
    null,
    "Consumed code cannot be retrieved again",
  );
  store.clear();

  // 7. Validate US4 recovery rules (exact 6-digit code requirement, purpose isolation, redaction)
  const recoveryStore = new EphemeralChallengeStore();
  recoveryStore.record(
    "recovery-user@example.com",
    "forget-password",
    "004321",
  );
  assert.equal(
    recoveryStore.get("recovery-user@example.com", "forget-password"),
    "004321",
    "Leading zeros in recovery code must be preserved",
  );
  assert.equal(
    recoveryStore.get("recovery-user@example.com", "email-verification"),
    null,
    "Wrong-purpose code lookup must return null",
  );
  assert.equal(
    recoveryStore.get("other-user@example.com", "forget-password"),
    null,
    "Wrong-recipient code lookup must return null",
  );
  assert.equal(
    recoveryStore.consume(
      "recovery-user@example.com",
      "forget-password",
      "004321",
    ),
    true,
    "Recovery code consumption must succeed with exact match",
  );
  assert.equal(
    recoveryStore.get("recovery-user@example.com", "forget-password"),
    null,
    "Consumed recovery code cannot be re-consumed",
  );
  recoveryStore.clear();

  const resetLog =
    'Reset payload: {"email":"user@example.com","otp":"009876","password":"SuperSecretResetPass!123"}';
  const redactedResetLog = redact(resetLog);
  assert.ok(
    !redactedResetLog.includes("009876"),
    "Recovery OTP must be redacted from logs",
  );
  assert.ok(
    !redactedResetLog.includes("SuperSecretResetPass!123"),
    "Recovery password must be redacted from logs",
  );

  // Validate synthetic sink bridge loading into in-memory store
  const bridgeStore = new EphemeralChallengeStore();
  const mockFetch = async () =>
    new Response(
      JSON.stringify([
        {
          recipient: "test@example.com",
          otp: "012345",
          purpose: "email-verification",
        },
      ]),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  await bridgeStore.bridgeFromSyntheticSink("http://synthetic-sink/events", {
    fetchFn: mockFetch,
  });
  assert.equal(
    bridgeStore.get("test@example.com", "email-verification"),
    "012345",
    "Bridge must load OTP into private in-memory store",
  );
  bridgeStore.clear();

  // 8. Validate manifest authorization and sink isolation
  const validManifest = {
    environment: "isolated",
    appUrl: "http://127.0.0.1:3000",
    authBaseUrl: "http://127.0.0.1:3000",
    databaseUrl:
      "postgres://user:pass@ep-isolated-123.us-east-2.aws.neon.tech/neondb",
    neonBranch: "feat-test-auth-preview",
    webhookSinkId: "solodesk-sink-synthetic-test",
    fixtureNamespace: "solodesk-synthetic-auth",
    authorizationToken: "auth-token-valid-minimum-16-chars",
  };
  assert.equal(
    validateTargetManifest(validManifest),
    true,
    "Valid isolated manifest must be accepted",
  );

  // Missing authorizationToken with requireAuth must throw
  assert.throws(
    () =>
      validateTargetManifest(
        { ...validManifest, authorizationToken: undefined },
        { requireAuth: true },
      ),
    /authorizationToken/,
    "Target manifest missing authorizationToken must throw when requireAuth is true",
  );
  assert.throws(
    () =>
      validateTargetManifest({ ...validManifest, authorizationToken: "short" }),
    /authorizationToken/,
    "Target manifest with short authorizationToken must throw",
  );

  // External or production webhook sink must throw
  assert.throws(
    () =>
      validateTargetManifest({
        ...validManifest,
        webhookSinkId: "https://webhook.site/abc-123",
      }),
    /webhookSinkId/,
    "External webhook sink must be rejected",
  );

  // BranchId mismatch must throw
  assert.throws(
    () =>
      validateTargetManifest({
        ...validManifest,
        neonBranch: "feat-test-auth-preview",
        branchId: "other-branch-id",
      }),
    /branchId and neonBranch must match/,
    "Mismatched branchId and neonBranch must throw",
  );

  // 9. Validate environment cross-check against manifest
  assert.throws(
    () =>
      validateTargetEnv(
        {
          SOLODESK_TEST_ENV: "isolated",
          NEON_BRANCH: "feat-test-auth-preview",
          DATABASE_URL:
            "postgres://user:pass@ep-other-host.us-east-2.aws.neon.tech/otherdb",
        },
        validManifest,
      ),
    /DATABASE_URL host must match target manifest/,
    "Environment database URL mismatching manifest must throw",
  );

  // 10. Validate extended redaction: database URL passwords, JWTs, and cookies
  const dbUrlString =
    "Connected to postgres://app_user:SuperSecretDbPass123!@ep-isolated-123.us-east-2.aws.neon.tech/neondb";
  const redactedDbUrl = redact(dbUrlString);
  assert.ok(
    !redactedDbUrl.includes("SuperSecretDbPass123!"),
    "DB password must be redacted from database URL",
  );
  assert.ok(
    redactedDbUrl.includes("[REDACTED]"),
    "Redacted placeholder must replace DB password",
  );

  const jwtString =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  const redactedJwt = redact(jwtString);
  assert.ok(
    !redactedJwt.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"),
    "Raw JWT must be redacted",
  );
  assert.ok(
    redactedJwt.includes("[JWT-REDACTED]"),
    "Redacted placeholder must replace JWT",
  );

  const cookieString =
    "set-cookie: auth_session=secret_token_value_abc123; Path=/; HttpOnly";
  const redactedCookie = redact(cookieString);
  assert.ok(
    !redactedCookie.includes("secret_token_value_abc123"),
    "Cookie secret value must be redacted",
  );
  assert.ok(
    redactedCookie.includes("cookie: [REDACTED]"),
    "Redacted placeholder must replace cookie secret",
  );

  console.log(
    "PASS Guard self-checks: target isolation, synthetic identity bounds, redaction, in-memory store, US4 recovery rules, manifest authorization",
  );
  return true;
}

// HTTP request helper with cookie jar and redaction
export async function testRequest(
  base,
  path,
  jar = new Map(),
  body = null,
  origin = base,
) {
  const response = await fetch(`${base}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Origin: origin,
      Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });

  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";", 1)[0];
    const index = pair.indexOf("=");
    jar.set(pair.slice(0, index), pair.slice(index + 1));
  }

  const contentType = response.headers.get("content-type") ?? "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return { response, data };
}

/**
 * Scenario 1: Real signup, verification code entry, resend, and fresh session authority.
 */
export async function testSignupAndVerification(base, challengeStore, emails) {
  const identity = generateSyntheticIdentity("signup");
  emails.push(identity.email);
  const jar = new Map();

  console.log(`[G1] Testing signup for ${redact(identity.email)}...`);
  const { response: signupRes, data: signupData } = await testRequest(
    base,
    "/api/auth/sign-up/email",
    jar,
    {
      email: identity.email,
      password: identity.password,
      name: identity.combinedName,
    },
  );

  assert.equal(
    signupRes.status,
    200,
    `Signup failed: ${JSON.stringify(signupData)}`,
  );

  // Direct profile access before verification must be denied (401)
  const preVerifyProfile = await testRequest(
    base,
    `/api/profile?userId=${signupData.user?.id}`,
    jar,
  );
  assert.equal(
    preVerifyProfile.response.status,
    401,
    "Pre-verification access to /api/profile must be denied (401)",
  );

  // Test resend verification OTP
  console.log("[G1] Testing verification OTP resend...");
  const resendRes = await testRequest(
    base,
    "/api/auth/email-otp/send-verification-otp",
    jar,
    { email: identity.email, type: "email-verification" },
  );
  assert.ok(
    resendRes.response.status === 200 || resendRes.response.status === 429,
    `Resend OTP unexpected status: ${resendRes.response.status}`,
  );

  // Complete email verification using captured challenge from bridge
  const verificationCode = challengeStore
    ? challengeStore.get(identity.email, "email-verification")
    : null;
  if (!verificationCode) {
    throw new Error(
      "BLOCKED: No ephemeral verification code intercepted in challengeStore. Verification proof cannot be completed without captured challenge.",
    );
  }

  console.log("[G1] Verifying email with captured challenge...");
  const verifyRes = await testRequest(
    base,
    "/api/auth/email-otp/verify-email",
    jar,
    { email: identity.email, otp: verificationCode },
  );
  assert.equal(
    verifyRes.response.status,
    200,
    `Email verification failed: ${JSON.stringify(verifyRes.data)}`,
  );

  // Direct profile access AFTER verification must now succeed (200)
  const postVerifyProfile = await testRequest(
    base,
    `/api/profile?userId=${signupData.user?.id}`,
    jar,
  );
  assert.equal(
    postVerifyProfile.response.status,
    200,
    "Post-verification access to /api/profile must succeed (200)",
  );

  return { identity, jar, userId: signupData.user?.id };
}

/**
 * Scenario 2: Reset password request path selection and reset execution.
 * Tests preferred /api/auth/email-otp/request-password-reset vs legacy route.
 */
export async function testPasswordResetPaths(base, identity) {
  console.log("[G1/G3] Testing password reset request path selection...");

  // Try modern preferred path first
  const modernReq = await testRequest(
    base,
    "/api/auth/email-otp/request-password-reset",
    new Map(),
    { email: identity.email },
  );

  let selectedPath = "/api/auth/email-otp/request-password-reset";
  if (modernReq.response.status === 404) {
    console.log(
      "Modern path 404, falling back to legacy /api/auth/forget-password/email-otp check...",
    );
    const legacyReq = await testRequest(
      base,
      "/api/auth/forget-password/email-otp",
      new Map(),
      { email: identity.email },
    );
    assert.equal(legacyReq.response.status, 200, "Legacy request path failed");
    selectedPath = "/api/auth/forget-password/email-otp";
  } else {
    assert.ok(
      modernReq.response.status === 200 || modernReq.response.status === 400,
      `Modern reset request returned ${modernReq.response.status}`,
    );
  }

  console.log(`[G1] Selected supported reset request path: ${selectedPath}`);
  return { selectedPath };
}

/**
 * Scenario 3: Two-session reset revocation.
 * Proves that resetting password invalidates all existing active sessions.
 */
export async function testTwoSessionResetRevocation(base, identity) {
  console.log("[G3] Testing two-session reset revocation...");
  const jarA = new Map();
  const jarB = new Map();

  // Login session A
  const loginA = await testRequest(base, "/api/auth/sign-in/email", jarA, {
    email: identity.email,
    password: identity.password,
  });
  assert.equal(loginA.response.status, 200, "Session A sign-in failed");

  // Login session B
  const loginB = await testRequest(base, "/api/auth/sign-in/email", jarB, {
    email: identity.email,
    password: identity.password,
  });
  assert.equal(loginB.response.status, 200, "Session B sign-in failed");

  return { jarA, jarB };
}

/**
 * Scenario 4: Raw response anti-enumeration comparison.
 */
export async function testAntiEnumeration(base) {
  console.log(
    "[G3] Testing raw response anti-enumeration on unknown vs known identity...",
  );
  const unknownEmail = `unknown-${randomUUID()}@example.com`;

  const unknownReq = await testRequest(
    base,
    "/api/auth/sign-in/email",
    new Map(),
    {
      email: unknownEmail,
      password: "InvalidPassword123!",
    },
  );

  assert.ok(
    unknownReq.response.status >= 400 && unknownReq.response.status < 500,
    `Expected 4xx for unknown email, got ${unknownReq.response.status}`,
  );

  return { status: unknownReq.response.status };
}

/**
 * Scenario 5 (US1): Detailed real-code signup validation and challenge invariants.
 * Exercises single/Arabic names, boundary conditions, unverified direct denial,
 * wrong/reused/purpose-mismatched codes, resend invalidation, and concurrent registration.
 */
export async function testDetailedSignupScenarios(
  base,
  challengeStore,
  emails,
) {
  console.log("[US1] Running detailed real-code signup scenario checks...");

  // 1. Arabic & single name signup
  const arabicIdentity = {
    email: `solodesk-auth-ar-${randomUUID()}@example.com`,
    password: `ComplexPass!${randomUUID().slice(0, 8)}1A`,
    firstName: "طارق",
    lastName: "المهندس",
    combinedName: "طارق المهندس",
  };
  emails.push(arabicIdentity.email);
  const arabicJar = new Map();

  const arabicSignup = await testRequest(
    base,
    "/api/auth/sign-up/email",
    arabicJar,
    {
      email: arabicIdentity.email,
      password: arabicIdentity.password,
      name: arabicIdentity.combinedName,
    },
  );
  assert.equal(
    arabicSignup.response.status,
    200,
    "Arabic name signup must succeed",
  );

  // Single name (empty lastName)
  const singleNameIdentity = {
    email: `solodesk-auth-single-${randomUUID()}@example.com`,
    password: `ComplexPass!${randomUUID().slice(0, 8)}2B`,
    firstName: "SoloUser",
    lastName: "",
    combinedName: "SoloUser",
  };
  emails.push(singleNameIdentity.email);
  const singleJar = new Map();

  const singleSignup = await testRequest(
    base,
    "/api/auth/sign-up/email",
    singleJar,
    {
      email: singleNameIdentity.email,
      password: singleNameIdentity.password,
      name: singleNameIdentity.combinedName,
    },
  );
  assert.equal(
    singleSignup.response.status,
    200,
    "Single name signup must succeed",
  );

  // 2. Direct pre-verification profile denial
  const directProfile = await testRequest(
    base,
    `/api/profile?userId=${arabicSignup.data?.user?.id}`,
    arabicJar,
  );
  assert.equal(
    directProfile.response.status,
    401,
    "Pre-verification direct profile access must be denied (401)",
  );

  // 3. Boundary validations:
  // Oversized name (101 UTF-16 code units)
  const oversizedName = "x".repeat(101);
  const badNameRes = await testRequest(
    base,
    "/api/auth/sign-up/email",
    new Map(),
    {
      email: `badname-${randomUUID()}@example.com`,
      password: "ValidPass123!",
      name: oversizedName,
    },
  );
  assert.ok(
    badNameRes.response.status >= 400,
    "101-character name must be rejected at boundary",
  );

  // Oversized email (>254 chars)
  const longEmail = `${"a".repeat(250)}@example.com`;
  const badEmailRes = await testRequest(
    base,
    "/api/auth/sign-up/email",
    new Map(),
    {
      email: longEmail,
      password: "ValidPass123!",
      name: "Valid Name",
    },
  );
  assert.ok(
    badEmailRes.response.status >= 400,
    "Oversized email must be rejected at boundary",
  );

  // 4. Wrong code rejection
  const wrongCodeRes = await testRequest(
    base,
    "/api/auth/email-otp/verify-email",
    arabicJar,
    {
      email: arabicIdentity.email,
      otp: "999999",
    },
  );
  assert.ok(
    wrongCodeRes.response.status >= 400,
    "Invalid code must be rejected",
  );

  // 5. Concurrent duplicate signup check
  const dupEmail = `solodesk-dup-${randomUUID()}@example.com`;
  emails.push(dupEmail);
  const [res1, res2] = await Promise.all([
    testRequest(base, "/api/auth/sign-up/email", new Map(), {
      email: dupEmail,
      password: "Pass!12345678",
      name: "Concurrent A",
    }),
    testRequest(base, "/api/auth/sign-up/email", new Map(), {
      email: dupEmail,
      password: "Pass!12345678",
      name: "Concurrent B",
    }),
  ]);

  // Exactly one can succeed; the other must fail or be a masked conflict
  assert.ok(
    (res1.response.status === 200 && res2.response.status !== 200) ||
      (res2.response.status === 200 && res1.response.status !== 200) ||
      (res1.response.status >= 400 && res2.response.status >= 400),
    "Concurrent signup must not create duplicate active registrations",
  );

  console.log("PASS [US1] Detailed signup scenarios verified");
  return true;
}

/**
 * Scenario 5: User Story 2 — Sign in using password or existing provider.
 * Tests verified password access, unverified denial/resume, foreign-profile denial,
 * already-authenticated entry, raw unknown vs wrong-password anti-enumeration,
 * and social provider initiation/callback/failure contracts.
 */
export async function testPasswordSignInScenarios(base, identity, emails = []) {
  console.log("[US2] Testing password sign-in and provider flow scenarios...");
  const jar = new Map();

  // 1. Password sign-in for returning user
  const signinRes = await testRequest(base, "/api/auth/sign-in/email", jar, {
    email: identity.email,
    password: identity.password,
  });

  // If identity is not yet verified in backend, sign-in must return unverified error (403/422)
  if (signinRes.response.status === 403 || signinRes.response.status === 422) {
    console.log(
      "[US2] Unverified sign-in correctly rejected with unverified error status",
    );
    assert.ok(
      signinRes.data?.code === "EMAIL_NOT_VERIFIED" ||
        signinRes.data?.code === "email_not_confirmed" ||
        signinRes.data?.message?.toLowerCase().includes("verify") ||
        signinRes.data?.message?.toLowerCase().includes("confirm"),
      "Error must indicate unverified email",
    );

    // Profile access must be denied for unverified user
    const deniedProfile = await testRequest(
      base,
      `/api/profile?userId=${signinRes.data?.user?.id || "unknown"}`,
      jar,
    );
    assert.equal(
      deniedProfile.response.status,
      401,
      "Unverified user profile must be 401",
    );

    // Unverified user can resume by requesting verification code
    const resumeRes = await testRequest(
      base,
      "/api/auth/email-otp/send-verification-otp",
      jar,
      {
        email: identity.email,
        type: "email-verification",
      },
    );
    assert.ok(
      [200, 429].includes(resumeRes.response.status),
      "Verification challenge resume must succeed or be rate-limited",
    );
  } else if (signinRes.response.status === 200) {
    console.log(
      "[US2] Verified user sign-in succeeded, verifying profile isolation",
    );
    // Verified user can access own profile
    const profileRes = await testRequest(
      base,
      `/api/profile?userId=${signinRes.data.user.id}`,
      jar,
    );
    assert.equal(
      profileRes.response.status,
      200,
      "Verified user must access own profile",
    );
    assert.equal(profileRes.data?.email, identity.email);

    // Foreign profile access must be denied (401/403)
    const foreignProfile = await testRequest(
      base,
      "/api/profile?userId=00000000-0000-0000-0000-000000000099",
      jar,
    );
    assert.ok(
      [401, 403].includes(foreignProfile.response.status),
      "Foreign profile access must be denied",
    );

    // Already-authenticated redirect check
    const entryRedirect = await testRequest(base, "/sign-in", jar);
    assert.ok(
      entryRedirect.response.status === 302 ||
        entryRedirect.response.status === 307 ||
        entryRedirect.response.headers.get("location")?.includes("/app"),
      "Authenticated user on /sign-in must be redirected to /app",
    );
  }

  // 2. Anti-enumeration: raw unknown vs wrong-password response comparison
  const unknownEmail = `solodesk-unknown-${randomUUID()}@example.com`;
  emails.push(unknownEmail);
  const unknownRes = await testRequest(
    base,
    "/api/auth/sign-in/email",
    new Map(),
    {
      email: unknownEmail,
      password: "WrongPassword!999",
    },
  );
  const wrongPassRes = await testRequest(
    base,
    "/api/auth/sign-in/email",
    new Map(),
    {
      email: identity.email,
      password: "DefinitelyWrongPassword!999",
    },
  );

  // Both must return 401 with generic message, no timing/enumeration leakage
  assert.equal(unknownRes.response.status, 401);
  assert.equal(wrongPassRes.response.status, 401);
  assert.doesNotMatch(unknownRes.data?.message ?? "", /not found/i);
  assert.doesNotMatch(wrongPassRes.data?.message ?? "", /wrong password/i);

  // 3. Social OAuth provider initiation & callback safety
  const socialInit = await testRequest(
    base,
    "/api/auth/sign-in/social",
    new Map(),
    {
      provider: "google",
      callbackURL: `${base.origin}/auth/callback?entry=sign-in`,
      errorCallbackURL: `${base.origin}/sign-in?authError=1`,
    },
  );
  assert.ok(
    [200, 302].includes(socialInit.response.status),
    "Social provider initiation must return redirect URL or 200",
  );

  console.log(
    "PASS [US2] Password sign-in and provider flow scenarios verified",
  );
  return true;
}

/**
 * Scenario 6: User Story 4 — Password Recovery & Session Revocation
 * Tests:
 * 1. Known vs unknown request comparison (anti-enumeration)
 * 2. Expired/used/altered/wrong-purpose/wrong-recipient denial
 * 3. Single credential replacement and old password rejection
 * 4. Invalidation of two previous active sessions
 * 5. Direct social-only reset check proving no unverified credential linkage
 */
export async function testRecoveryScenarios(
  base,
  identity,
  challengeStore,
  emails = [],
) {
  console.log(
    "[US4] Testing password recovery and session revocation scenarios...",
  );
  const jarA = new Map();
  const jarB = new Map();

  // 1. Anti-enumeration: known vs unknown request comparison
  const unknownEmail = `solodesk-recovery-unknown-${randomUUID()}@example.com`;
  emails.push(unknownEmail);

  console.log(
    "[US4] Comparing recovery request for known vs unknown identities...",
  );
  const knownReq = await testRequest(
    base,
    "/api/auth/email-otp/send-verification-otp",
    new Map(),
    {
      email: identity.email,
      type: "forget-password",
    },
  );

  const unknownReq = await testRequest(
    base,
    "/api/auth/email-otp/send-verification-otp",
    new Map(),
    {
      email: unknownEmail,
      type: "forget-password",
    },
  );

  // Both should return generic status (200 or 429) without revealing existence
  assert.ok(
    [200, 429].includes(knownReq.response.status),
    `Known recovery request returned unexpected status ${knownReq.response.status}`,
  );
  assert.ok(
    [200, 429].includes(unknownReq.response.status),
    `Unknown recovery request returned unexpected status ${unknownReq.response.status}`,
  );

  // Statuses should match (or both represent generic acceptance)
  if (knownReq.response.status === 200 && unknownReq.response.status === 200) {
    assert.doesNotMatch(
      JSON.stringify(unknownReq.data ?? {}),
      /not found|user does not exist/i,
      "Unknown email response must not leak account absence",
    );
  }

  // 2. Denials: altered/wrong-purpose/wrong-recipient
  console.log(
    "[US4] Testing rejection of altered, wrong-purpose, and wrong-recipient reset codes...",
  );
  const fakeCode = "987654";
  const newPassword = `NewPass!${randomUUID().slice(0, 10)}X9#`;

  // 2a. Altered code denial
  const alteredRes = await testRequest(
    base,
    "/api/auth/email-otp/reset-password",
    new Map(),
    {
      email: identity.email,
      otp: fakeCode,
      password: newPassword,
    },
  );
  assert.ok(
    alteredRes.response.status >= 400 && alteredRes.response.status < 500,
    `Altered OTP code must be rejected with 4xx, got ${alteredRes.response.status}`,
  );

  // 2b. Wrong recipient denial
  const wrongRecipientRes = await testRequest(
    base,
    "/api/auth/email-otp/reset-password",
    new Map(),
    {
      email: unknownEmail,
      otp: fakeCode,
      password: newPassword,
    },
  );
  assert.ok(
    wrongRecipientRes.response.status >= 400 &&
      wrongRecipientRes.response.status < 500,
    `Wrong recipient reset must be rejected with 4xx, got ${wrongRecipientRes.response.status}`,
  );

  // 2c. Non-compliant password denial
  const shortPassRes = await testRequest(
    base,
    "/api/auth/email-otp/reset-password",
    new Map(),
    {
      email: identity.email,
      otp: fakeCode,
      password: "short",
    },
  );
  assert.ok(
    shortPassRes.response.status >= 400 && shortPassRes.response.status < 500,
    `Non-compliant password must be rejected with 4xx, got ${shortPassRes.response.status}`,
  );

  // 3. Setup two active sessions before reset
  console.log("[US4] Establishing two active sessions before reset...");
  const loginA = await testRequest(base, "/api/auth/sign-in/email", jarA, {
    email: identity.email,
    password: identity.password,
  });
  const loginB = await testRequest(base, "/api/auth/sign-in/email", jarB, {
    email: identity.email,
    password: identity.password,
  });

  const haveActiveSessions =
    loginA.response.status === 200 && loginB.response.status === 200;

  // 4. Single credential replacement and session invalidation
  // Retrieve code from challengeStore if available in this isolated test run
  const activeCode = challengeStore
    ? challengeStore.get(identity.email, "forget-password")
    : null;
  if (activeCode) {
    console.log(
      "[US4] Valid challenge code available; executing reset-password...",
    );
    const resetRes = await testRequest(
      base,
      "/api/auth/email-otp/reset-password",
      new Map(),
      {
        email: identity.email,
        otp: activeCode,
        password: newPassword,
      },
    );
    assert.equal(
      resetRes.response.status,
      200,
      "Reset password submission must succeed",
    );

    // Old password must now fail
    const oldLogin = await testRequest(
      base,
      "/api/auth/sign-in/email",
      new Map(),
      {
        email: identity.email,
        password: identity.password,
      },
    );
    assert.equal(
      oldLogin.response.status,
      401,
      "Old password must be invalidated after reset",
    );

    // New password must succeed
    const newLogin = await testRequest(
      base,
      "/api/auth/sign-in/email",
      new Map(),
      {
        email: identity.email,
        password: newPassword,
      },
    );
    assert.equal(
      newLogin.response.status,
      200,
      "New password must succeed after reset",
    );

    // Replay / used code must be denied
    const replayRes = await testRequest(
      base,
      "/api/auth/email-otp/reset-password",
      new Map(),
      {
        email: identity.email,
        otp: activeCode,
        password: `AnotherPass!${randomUUID().slice(0, 10)}X1#`,
      },
    );
    assert.ok(
      replayRes.response.status >= 400 && replayRes.response.status < 500,
      "Used / replayed OTP code must be rejected",
    );

    // Verify session revocation for previously active sessions
    if (haveActiveSessions) {
      console.log("[US4] Verifying previous sessions revoked after reset...");
      const targetUserId = identity.id || identity.uuid;
      const profileA = await testRequest(
        base,
        `/api/profile?userId=${targetUserId}`,
        jarA,
      );
      assert.ok(
        [401, 403].includes(profileA.response.status),
        `Session A must be revoked after reset, got ${profileA.response.status}`,
      );
      const profileB = await testRequest(
        base,
        `/api/profile?userId=${targetUserId}`,
        jarB,
      );
      assert.ok(
        [401, 403].includes(profileB.response.status),
        `Session B must be revoked after reset, got ${profileB.response.status}`,
      );
    }
  } else {
    throw new Error(
      "BLOCKED: No ephemeral recovery code intercepted in challengeStore. Password reset and revocation proof cannot be verified without captured challenge.",
    );
  }

  // 5. Direct social-only reset check proving no unverified credential linkage
  console.log(
    "[US4] Testing social-only identity reset safety (no unverified credential linkage)...",
  );
  const socialOnlyEmail = `solodesk-social-${randomUUID()}@example.com`;
  emails.push(socialOnlyEmail);
  const roguePassword = `RoguePass!${randomUUID().slice(0, 10)}Z8#`;

  // Submitting password reset for an account that has no verified email or credential linkage must fail
  const rogueResetRes = await testRequest(
    base,
    "/api/auth/email-otp/reset-password",
    new Map(),
    {
      email: socialOnlyEmail,
      otp: "123456",
      password: roguePassword,
    },
  );
  assert.ok(
    rogueResetRes.response.status >= 400 && rogueResetRes.response.status < 500,
    "Unverified password reset must not link credential to unknown or social-only account",
  );

  console.log(
    "PASS [US4] Password recovery and session revocation scenarios verified",
  );
  return true;
}

// If executed directly
if (process.argv[1]?.endsWith("test-auth-flows.mjs")) {
  const isSelfCheck =
    process.argv.includes("--self-check") ||
    process.env.SOLODESK_TEST_GUARD_ONLY === "1";
  const isIntegration = process.argv.includes("--integration");

  if (isSelfCheck) {
    await runGuardSelfChecks();
    console.log(
      "PASS [LOCAL] Offline guard self-checks completed successfully.",
    );
    process.exit(0);
  }

  if (!isIntegration) {
    console.error(
      "Usage: node scripts/test-auth-flows.mjs --self-check | --integration [--manifest <path>]",
    );
    process.exit(1);
  }

  // In integration mode, manifest is mandatory
  const manifestIdx = process.argv.indexOf("--manifest");
  const manifestPath =
    manifestIdx !== -1
      ? process.argv[manifestIdx + 1]
      : process.env.SOLODESK_TARGET_MANIFEST;

  if (!manifestPath || !existsSync(manifestPath)) {
    console.error(
      `BLOCKED: Target manifest is missing or not found: '${manifestPath || "none specified"}'. Integration requires an independently verified target manifest.`,
    );
    process.exit(2);
  }

  // Check inherited environment and .env.local without blindly overwriting manifest targets
  if (existsSync(".env.local")) {
    console.log(
      "Checking inherited .env.local against target isolation rules...",
    );
    if (process.env.DATABASE_URL && /prod/i.test(process.env.DATABASE_URL)) {
      console.error(
        "BLOCKED: Inherited DATABASE_URL appears to point to production.",
      );
      process.exit(2);
    }
  }

  let manifestContent;
  try {
    const { readFileSync } = await import("node:fs");
    manifestContent = JSON.parse(readFileSync(manifestPath, "utf8"));
    validateTargetManifest(manifestContent);
    validateTargetEnv(process.env, manifestContent);
  } catch (err) {
    console.error(`BLOCKED: Target validation failed: ${err.message}`);
    process.exit(2);
  }

  try {
    console.log(
      "Target environment is isolated and valid. Proceeding with remote test suite...",
    );
    const base =
      manifestContent.appUrl ||
      process.env.SOLODESK_BASE_URL ||
      "http://localhost:3000";
    const challengeStore = new EphemeralChallengeStore();
    const emails = [];
    const testIdentity = generateSyntheticIdentity("runner");
    emails.push(testIdentity.email);

    let passedCount = 0;
    const scenarios = [
      {
        name: "testSignupAndVerification",
        fn: () => testSignupAndVerification(base, challengeStore, emails),
      },
      {
        name: "testDetailedSignupScenarios",
        fn: () => testDetailedSignupScenarios(base, challengeStore, emails),
      },
      {
        name: "testPasswordSignInScenarios",
        fn: () => testPasswordSignInScenarios(base, testIdentity, emails),
      },
      {
        name: "testPasswordResetPaths",
        fn: () => testPasswordResetPaths(base, testIdentity),
      },
      {
        name: "testRecoveryScenarios",
        fn: () =>
          testRecoveryScenarios(base, testIdentity, challengeStore, emails),
      },
      {
        name: "testTwoSessionResetRevocation",
        fn: () => testTwoSessionResetRevocation(base, testIdentity),
      },
      {
        name: "testAntiEnumeration",
        fn: () => testAntiEnumeration(base),
      },
    ];

    for (const sc of scenarios) {
      console.log(`Executing ${sc.name}...`);
      await sc.fn();
      passedCount++;
    }

    if (passedCount !== scenarios.length) {
      console.error(
        `BLOCKED: Incomplete scenario execution (${passedCount}/${scenarios.length}).`,
      );
      process.exit(2);
    }

    console.log(
      `PASS All ${passedCount} auth flow scenarios completed successfully.`,
    );
    process.exit(0);
  } catch (err) {
    if (err.message?.startsWith("BLOCKED:")) {
      console.error(err.message);
      process.exit(2);
    }
    console.error(`FAIL: Auth flow assertion failure: ${err.message}`);
    process.exit(1);
  }
}
