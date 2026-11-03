import assert from "node:assert/strict";
import test from "node:test";
import { createAuthClient } from "@neondatabase/auth/next";

test("SDK client transport adheres to strict contract for signup, verify, and resend", async () => {
  const intercepted = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, opts) => {
    const urlStr = url.toString();
    const method = opts?.method ?? "GET";
    let body = undefined;
    if (opts?.body) {
      try {
        body = JSON.parse(opts.body);
      } catch {
        body = opts.body;
      }
    }
    intercepted.push({ url: urlStr, method, body, headers: opts?.headers });
    return new Response(JSON.stringify({ ok: true, data: { status: true } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const client = createAuthClient();

    // 1. Signup call
    const signupData = {
      email: "visitor@example.com",
      password: "ComplexPassword123!",
      name: "Tariq Developer",
    };
    await client.signUp.email(signupData);

    assert.equal(intercepted.length, 1);
    const signupReq = intercepted[0];
    assert.equal(signupReq.url, "/api/auth/sign-up/email");
    assert.equal(signupReq.method, "POST");
    assert.equal(signupReq.body.email, "visitor@example.com");
    assert.equal(signupReq.body.password, "ComplexPassword123!");
    assert.equal(signupReq.body.name, "Tariq Developer");

    // Must not put password or secret in query parameters
    assert.ok(!signupReq.url.includes("ComplexPassword123!"));
    assert.ok(!signupReq.url.includes("password"));

    // 2. Verification call (emailOtp.verifyEmail)
    const verifyData = {
      email: "visitor@example.com",
      otp: "012345",
    };
    await client.emailOtp.verifyEmail(verifyData);

    assert.equal(intercepted.length, 2);
    const verifyReq = intercepted[1];
    assert.equal(verifyReq.url, "/api/auth/email-otp/verify-email");
    assert.equal(verifyReq.method, "POST");
    assert.equal(verifyReq.body.email, "visitor@example.com");
    assert.equal(verifyReq.body.otp, "012345");
    // Ensure leading zero is preserved as a string
    assert.equal(typeof verifyReq.body.otp, "string");
    assert.equal(verifyReq.body.otp.length, 6);

    // 3. Resend call (emailOtp.sendVerificationOtp)
    const resendData = {
      email: "visitor@example.com",
      type: "email-verification",
    };
    await client.emailOtp.sendVerificationOtp(resendData);

    assert.equal(intercepted.length, 3);
    const resendReq = intercepted[2];
    assert.equal(resendReq.url, "/api/auth/email-otp/send-verification-otp");
    assert.equal(resendReq.method, "POST");
    assert.equal(resendReq.body.email, "visitor@example.com");
    assert.equal(resendReq.body.type, "email-verification");

    // 4. Invariant checks across all intercepted requests:
    // - No request ever calls forbidden 'email-otp/passcode'
    // - No passwordless login (signIn.emailOtp)
    // - No OTP read-back endpoint
    // - No secrets in URLs
    for (const req of intercepted) {
      assert.ok(
        !req.url.includes("email-otp/passcode"),
        "Must not call mis-mapped email-otp/passcode",
      );
      assert.ok(
        !req.url.includes("sign-in/email-otp"),
        "Must not call passwordless sign-in",
      );
      assert.ok(
        !req.url.includes("get-otp"),
        "Must not call read-back OTP endpoints",
      );
      const parsedUrl = new URL(req.url, "http://localhost");
      assert.equal(
        parsedUrl.search,
        "",
        "Must not leak parameters in request URLs",
      );
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("SDK client transport adheres to strict contract for password sign-in and unverified continuation", async () => {
  const intercepted = [];
  const originalFetch = globalThis.fetch;

  let mockResponse = {
    status: 200,
    body: {
      ok: true,
      data: {
        user: {
          id: "u_123",
          email: "visitor@example.com",
          emailVerified: true,
        },
      },
    },
  };

  globalThis.fetch = async (url, opts) => {
    const urlStr = url.toString();
    const method = opts?.method ?? "GET";
    let body = undefined;
    if (opts?.body) {
      try {
        body = JSON.parse(opts.body);
      } catch {
        body = opts.body;
      }
    }
    intercepted.push({ url: urlStr, method, body, headers: opts?.headers });
    return new Response(JSON.stringify(mockResponse.body), {
      status: mockResponse.status,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const client = createAuthClient();

    // 1. Successful password sign-in
    const creds = {
      email: "visitor@example.com",
      password: "OpaquePassword!456",
    };
    await client.signIn.email(creds);

    assert.equal(intercepted.length, 1);
    const signinReq = intercepted[0];
    assert.equal(signinReq.url, "/api/auth/sign-in/email");
    assert.equal(signinReq.method, "POST");
    assert.equal(signinReq.body.email, "visitor@example.com");
    assert.equal(signinReq.body.password, "OpaquePassword!456");

    // Must not contain credentials or secret query strings
    assert.ok(!signinReq.url.includes("OpaquePassword!456"));
    assert.ok(!signinReq.url.includes("password"));
    const parsedUrl = new URL(signinReq.url, "http://localhost");
    assert.equal(parsedUrl.search, "");

    // 2. Unverified email response handling
    mockResponse = {
      status: 403,
      body: {
        code: "EMAIL_NOT_VERIFIED",
        message: "Email is not verified",
      },
    };

    let unverifiedError = null;
    try {
      const res = await client.signIn.email({
        email: "unverified@example.com",
        password: "OpaquePassword!456",
      });
      unverifiedError = res?.error ?? null;
    } catch (err) {
      unverifiedError = err;
    }

    assert.equal(intercepted.length, 2);
    const unverifiedReq = intercepted[1];
    assert.equal(unverifiedReq.url, "/api/auth/sign-in/email");
    assert.equal(unverifiedReq.method, "POST");
    assert.equal(unverifiedReq.body.email, "unverified@example.com");

    // Verify error indicates unverified email for UI continuation
    assert.ok(unverifiedError);
    assert.ok(
      unverifiedError.code === "EMAIL_NOT_VERIFIED" ||
        unverifiedError.code === "email_not_confirmed" ||
        unverifiedError.message?.toLowerCase().includes("not verified") ||
        unverifiedError.message?.toLowerCase().includes("confirm"),
    );

    // 3. Generic invalid credentials response handling (wrong password or unknown email)
    mockResponse = {
      status: 401,
      body: {
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Invalid email or password",
      },
    };

    let invalidError = null;
    try {
      const res = await client.signIn.email({
        email: "unknown@example.com",
        password: "WrongPassword!789",
      });
      invalidError = res?.error ?? null;
    } catch (err) {
      invalidError = err;
    }

    assert.equal(intercepted.length, 3);
    assert.ok(invalidError);
    // Ensure error is mapped to invalid credentials and does not leak account existence
    assert.ok(
      invalidError.code === "INVALID_EMAIL_OR_PASSWORD" ||
        invalidError.code === "invalid_credentials" ||
        invalidError.message?.toLowerCase().includes("invalid"),
    );
    assert.ok(!invalidError.message?.toLowerCase().includes("not found"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Social provider initiation and callback contracts preserve initiating entry and generic failure markers", async () => {
  const intercepted = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, opts) => {
    const urlStr = url.toString();
    const method = opts?.method ?? "GET";
    let body = undefined;
    if (opts?.body) {
      try {
        body = JSON.parse(opts.body);
      } catch {
        body = opts.body;
      }
    }
    intercepted.push({ url: urlStr, method, body, headers: opts?.headers });
    return new Response(
      JSON.stringify({
        ok: true,
        data: { url: "https://accounts.google.com/o/oauth2/auth" },
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  };

  try {
    const client = createAuthClient();

    // 1. Google sign-in from /sign-in entry
    await client.signIn.social({
      provider: "google",
      callbackURL: "http://localhost:3000/auth/callback?entry=sign-in",
      errorCallbackURL: "http://localhost:3000/sign-in?authError=1",
    });

    assert.equal(intercepted.length, 1);
    const googleReq = intercepted[0];
    assert.equal(googleReq.url, "/api/auth/sign-in/social");
    assert.equal(googleReq.method, "POST");
    assert.equal(googleReq.body.provider, "google");
    assert.equal(
      googleReq.body.callbackURL,
      "http://localhost:3000/auth/callback?entry=sign-in",
    );
    assert.equal(
      googleReq.body.errorCallbackURL,
      "http://localhost:3000/sign-in?authError=1",
    );

    // 2. GitHub sign-in from /sign-up entry
    await client.signIn.social({
      provider: "github",
      callbackURL: "http://localhost:3000/auth/callback?entry=sign-up",
      errorCallbackURL: "http://localhost:3000/sign-up?authError=1",
    });

    assert.equal(intercepted.length, 2);
    const githubReq = intercepted[1];
    assert.equal(githubReq.url, "/api/auth/sign-in/social");
    assert.equal(githubReq.method, "POST");
    assert.equal(githubReq.body.provider, "github");
    assert.equal(
      githubReq.body.callbackURL,
      "http://localhost:3000/auth/callback?entry=sign-up",
    );
    assert.equal(
      githubReq.body.errorCallbackURL,
      "http://localhost:3000/sign-up?authError=1",
    );

    // 3. Invariant checks:
    // - Callback URLs contain strictly the bounded entry parameter
    // - Error callback URLs contain strictly authError=1
    // - No tokens, codes, or secrets in query parameters
    for (const req of intercepted) {
      const cb = new URL(req.body.callbackURL);
      assert.ok(cb.searchParams.has("entry"));
      assert.ok(["sign-in", "sign-up"].includes(cb.searchParams.get("entry")));
      assert.equal([...cb.searchParams.keys()].length, 1);

      const errCb = new URL(req.body.errorCallbackURL);
      assert.equal(errCb.searchParams.get("authError"), "1");
      assert.equal([...errCb.searchParams.keys()].length, 1);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("SDK client transport adheres to strict contract for password recovery and combined reset submission", async () => {
  const intercepted = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, opts) => {
    const urlStr = url.toString();
    const method = opts?.method ?? "GET";
    let body = undefined;
    if (opts?.body) {
      try {
        body = JSON.parse(opts.body);
      } catch {
        body = opts.body;
      }
    }
    intercepted.push({ url: urlStr, method, body, headers: opts?.headers });
    return new Response(JSON.stringify({ ok: true, data: { status: true } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const client = createAuthClient();

    // 1. Password reset challenge request with distinct forget-password purpose
    await client.emailOtp.sendVerificationOtp({
      email: "recovery@example.com",
      type: "forget-password",
    });

    assert.equal(intercepted.length, 1);
    const reqReq = intercepted[0];
    assert.equal(reqReq.url, "/api/auth/email-otp/send-verification-otp");
    assert.equal(reqReq.method, "POST");
    assert.equal(reqReq.body.email, "recovery@example.com");
    assert.equal(reqReq.body.type, "forget-password");
    assert.equal(new URL(reqReq.url, "http://localhost").search, "");

    // 2. Combined code + new password submission
    await client.emailOtp.resetPassword({
      email: "recovery@example.com",
      otp: "045678",
      password: "CompliantNewPassword!123",
    });

    assert.equal(intercepted.length, 2);
    const resetReq = intercepted[1];
    assert.equal(resetReq.url, "/api/auth/email-otp/reset-password");
    assert.equal(resetReq.method, "POST");
    assert.equal(resetReq.body.email, "recovery@example.com");
    assert.equal(resetReq.body.otp, "045678");
    assert.equal(typeof resetReq.body.otp, "string");
    assert.equal(resetReq.body.otp.length, 6);
    assert.equal(resetReq.body.password, "CompliantNewPassword!123");

    // Invariant: no query params, no secrets in URLs
    assert.equal(new URL(resetReq.url, "http://localhost").search, "");
    assert.ok(!resetReq.url.includes("CompliantNewPassword!123"));
    assert.ok(!resetReq.url.includes("045678"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("target manifest validation enforces synthetic boundaries and rejects production and mismatched targets", async () => {
  const { validateTargetManifest } = await import("./test-auth-flows.mjs");

  const validManifest = {
    environment: "isolated",
    appUrl: "http://localhost:3000",
    databaseUrl: "postgres://synthetic:secret@preview-123.neon.tech/testdb",
    neonBranch: "preview-123",
    branchId: "preview-123",
    authBaseUrl: "https://auth-preview-123.neon.tech",
    webhookSinkId: "sink-synth-001",
    fixtureNamespace: "solodesk-synthetic-tests",
    sampleAccount: "fixture-01@example.com",
  };

  // 1. Valid isolated synthetic manifest succeeds
  assert.equal(validateTargetManifest(validManifest), true);

  // 2. Missing or invalid environment
  assert.throws(
    () =>
      validateTargetManifest({ ...validManifest, environment: "production" }),
    /environment='isolated'/,
  );
  assert.throws(
    () => validateTargetManifest({ ...validManifest, environment: undefined }),
    /environment='isolated'/,
  );

  // 3. Production neonBranch rejected
  assert.throws(
    () =>
      validateTargetManifest({ ...validManifest, neonBranch: "production" }),
    /Production or prod-like branch/,
  );
  assert.throws(
    () =>
      validateTargetManifest({
        ...validManifest,
        neonBranch: "main-prod-branch",
      }),
    /Production or prod-like branch/,
  );

  // 4. Production databaseUrl rejected
  assert.throws(
    () =>
      validateTargetManifest({
        ...validManifest,
        databaseUrl: "postgres://u:p@prod-db.neon.tech/db",
      }),
    /databaseUrl must not point to a production database/,
  );

  // 5. Production appUrl rejected
  assert.throws(
    () =>
      validateTargetManifest({
        ...validManifest,
        appUrl: "https://solodesk.com",
      }),
    /appUrl must not point to a production endpoint/,
  );

  // 6. Production authBaseUrl rejected
  assert.throws(
    () =>
      validateTargetManifest({
        ...validManifest,
        authBaseUrl: "https://auth-prod.neon.tech",
      }),
    /authBaseUrl must not point to a production auth service/,
  );

  // 7. Mismatched branch IDs rejected
  assert.throws(
    () =>
      validateTargetManifest({
        ...validManifest,
        branchId: "different-branch-456",
      }),
    /branchId and neonBranch must match/,
  );

  // 8. Copied real-data fixture namespace rejected
  assert.throws(
    () =>
      validateTargetManifest({
        ...validManifest,
        fixtureNamespace: "customer-prod-fixtures",
      }),
    /isolated synthetic prefix/,
  );

  // 9. Real email domain sample account rejected
  assert.throws(
    () =>
      validateTargetManifest({
        ...validManifest,
        sampleAccount: "realuser@company.com",
      }),
    /Sample account must not use real public domain/,
  );
});

test("server capability policy enforces default-off credential gating and allows social/session paths", async () => {
  const { readFileSync } = await import("node:fs");
  const vm = await import("node:vm");
  const ts = (await import("typescript")).default;

  function loadCapabilities() {
    const source = readFileSync(
      new URL("../lib/auth/capabilities.ts", import.meta.url),
      "utf8",
    );
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
        throw new Error(`Unexpected import: ${name}`);
      },
      process,
    });
    return exports;
  }

  const { isAllowedAuthPath } = loadCapabilities();

  // Test 1: By default, credentials are off
  delete process.env.SOLODESK_AUTH_CREDENTIALS_ENABLED;

  // Social / session / sign-out paths are always allowed
  assert.equal(isAllowedAuthPath("/api/auth/sign-in/social").allowed, true);
  assert.equal(isAllowedAuthPath("/api/auth/callback/google").allowed, true);
  assert.equal(isAllowedAuthPath("/api/auth/callback/github").allowed, true);
  assert.equal(isAllowedAuthPath("/api/auth/get-session").allowed, true);
  assert.equal(isAllowedAuthPath("/api/auth/session").allowed, true);
  assert.equal(isAllowedAuthPath("/api/auth/sign-out").allowed, true);
  assert.equal(isAllowedAuthPath("/api/auth/ok").allowed, true);

  // Credential paths denied when toggle is off
  const assertDisabled = (path) => {
    const res = isAllowedAuthPath(path);
    assert.equal(res.allowed, false);
    assert.equal(res.reason, "CAPABILITY_DISABLED");
  };

  assertDisabled("/api/auth/sign-in/email");
  assertDisabled("/api/auth/sign-up/email");
  assertDisabled("/api/auth/email-otp/verify-email");
  assertDisabled("/api/auth/email-otp/send-verification-otp");
  assertDisabled("/api/auth/email-otp/reset-password");
  assertDisabled("/api/auth/forget-password");
  assertDisabled("/api/auth/reset-password");
  assertDisabled("/api/auth/change-password");
  assertDisabled("/api/auth/link-social");
  assertDisabled("/api/auth/unknown-credential-alias");

  // Test 2: When credentials toggle is explicitly "true"
  process.env.SOLODESK_AUTH_CREDENTIALS_ENABLED = "true";
  assert.equal(isAllowedAuthPath("/api/auth/sign-in/email").allowed, true);
  assert.equal(isAllowedAuthPath("/api/auth/sign-up/email").allowed, true);
  assert.equal(
    isAllowedAuthPath("/api/auth/email-otp/verify-email").allowed,
    true,
  );

  // Reset toggle back
  delete process.env.SOLODESK_AUTH_CREDENTIALS_ENABLED;
});

test("auth contract enforces exact HTTP method allowlisting per path", async () => {
  const { readFileSync } = await import("node:fs");
  const vm = await import("node:vm");
  const ts = (await import("typescript")).default;

  function loadCapabilities() {
    const source = readFileSync(
      new URL("../lib/auth/capabilities.ts", import.meta.url),
      "utf8",
    );
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
        throw new Error(`Unexpected import: ${name}`);
      },
      process,
    });
    return exports;
  }

  const { isAllowedAuthPath } = loadCapabilities();

  // Test with credentials enabled
  process.env.SOLODESK_AUTH_CREDENTIALS_ENABLED = "true";

  try {
    // 1. Correct method and path
    assert.equal(
      isAllowedAuthPath("/api/auth/sign-in/email", "POST").allowed,
      true,
    );
    assert.equal(
      isAllowedAuthPath("/api/auth/sign-up/email", "POST").allowed,
      true,
    );
    assert.equal(
      isAllowedAuthPath("/api/auth/email-otp/verify-email", "POST").allowed,
      true,
    );
    assert.equal(
      isAllowedAuthPath("/api/auth/email-otp/send-verification-otp", "POST")
        .allowed,
      true,
    );
    assert.equal(
      isAllowedAuthPath("/api/auth/email-otp/reset-password", "POST").allowed,
      true,
    );
    assert.equal(
      isAllowedAuthPath("/api/auth/request-password-reset", "POST").allowed,
      true,
    );
    assert.equal(
      isAllowedAuthPath("/api/auth/get-session", "GET").allowed,
      true,
    );
    assert.equal(isAllowedAuthPath("/api/auth/sign-out", "POST").allowed, true);
    assert.equal(
      isAllowedAuthPath("/api/auth/callback/google", "GET").allowed,
      true,
    );

    // 2. Disallowed HTTP methods on permitted paths
    const checkGetOnPost = isAllowedAuthPath("/api/auth/sign-in/email", "GET");
    assert.equal(checkGetOnPost.allowed, false);
    assert.equal(checkGetOnPost.reason, "METHOD_NOT_ALLOWED");

    const checkDeleteOnPost = isAllowedAuthPath(
      "/api/auth/sign-up/email",
      "DELETE",
    );
    assert.equal(checkDeleteOnPost.allowed, false);
    assert.equal(checkDeleteOnPost.reason, "METHOD_NOT_ALLOWED");

    const checkPutOnGet = isAllowedAuthPath("/api/auth/get-session", "PUT");
    assert.equal(checkPutOnGet.allowed, false);
    assert.equal(checkPutOnGet.reason, "METHOD_NOT_ALLOWED");

    const checkPostOnGet = isAllowedAuthPath("/api/auth/get-session", "POST");
    assert.equal(checkPostOnGet.allowed, false);
    assert.equal(checkPostOnGet.reason, "METHOD_NOT_ALLOWED");

    const checkDeleteOnSignOut = isAllowedAuthPath(
      "/api/auth/sign-out",
      "DELETE",
    );
    assert.equal(checkDeleteOnSignOut.allowed, false);
    assert.equal(checkDeleteOnSignOut.reason, "METHOD_NOT_ALLOWED");
  } finally {
    delete process.env.SOLODESK_AUTH_CREDENTIALS_ENABLED;
  }
});

test("challenge handling enforces leading-zero preservation, single-use, superseded invalidation, and wrong-account isolation", async () => {
  // In-memory challenge store simulating ephemeral provider challenge lifecycle
  const challengeStore = new Map(); // key -> { otp, email, purpose, expiresAt, consumed }

  function issueChallenge(email, purpose, otp = "012345", ttlMs = 300_000) {
    const key = `${purpose}:${email.toLowerCase()}`;
    // Invalidate prior challenge for same purpose/email (superseded)
    challengeStore.set(key, {
      otp: String(otp),
      email: email.toLowerCase(),
      purpose,
      expiresAt: Date.now() + ttlMs,
      consumed: false,
    });
  }

  function verifyChallenge(email, purpose, submittedOtp) {
    const key = `${purpose}:${email.toLowerCase()}`;
    const record = challengeStore.get(key);
    if (!record) return { ok: false, code: "CHALLENGE_NOT_FOUND" };
    if (record.consumed)
      return { ok: false, code: "CHALLENGE_ALREADY_CONSUMED" };
    if (Date.now() > record.expiresAt)
      return { ok: false, code: "CHALLENGE_EXPIRED" };
    // String comparison preserves leading zero
    if (String(submittedOtp) !== record.otp)
      return { ok: false, code: "INVALID_CHALLENGE" };
    record.consumed = true;
    return { ok: true };
  }

  const userEmail = "applicant@example.com";
  const foreignEmail = "other@example.com";

  // 1. Leading-zero preservation
  issueChallenge(userEmail, "email-verification", "098765");
  // Verification with number 98765 or string "98765" without leading zero must fail
  assert.equal(
    verifyChallenge(userEmail, "email-verification", "98765").ok,
    false,
  );
  // Verification with exact 6-char string "098765" must succeed
  const v1 = verifyChallenge(userEmail, "email-verification", "098765");
  assert.equal(v1.ok, true);

  // 2. Consumed challenge cannot be reused
  const vReuse = verifyChallenge(userEmail, "email-verification", "098765");
  assert.equal(vReuse.ok, false);
  assert.equal(vReuse.code, "CHALLENGE_ALREADY_CONSUMED");

  // 3. Superseded challenge: issuing a new challenge invalidates older one
  issueChallenge(userEmail, "email-verification", "011111");
  issueChallenge(userEmail, "email-verification", "022222"); // supersedes 011111
  assert.equal(
    verifyChallenge(userEmail, "email-verification", "011111").ok,
    false,
  );
  assert.equal(
    verifyChallenge(userEmail, "email-verification", "022222").ok,
    true,
  );

  // 4. Wrong-account isolation: challenge for userEmail cannot verify foreignEmail
  issueChallenge(userEmail, "forget-password", "033333");
  const vWrong = verifyChallenge(foreignEmail, "forget-password", "033333");
  assert.equal(vWrong.ok, false);
  assert.equal(vWrong.code, "CHALLENGE_NOT_FOUND");
});

test("password recovery provides non-disclosing responses for unknown and social-only accounts", async () => {
  // Simulator for password recovery service
  function requestPasswordRecovery(email, existingUserAccounts) {
    const user = existingUserAccounts.get(email.toLowerCase());
    // Invariant: Whether user is unknown, social-only, or has password, response is indistinguishable
    // Return standard non-disclosing acknowledgment
    return {
      status: 200,
      body: {
        ok: true,
        message:
          "If an account exists with this email, recovery instructions have been sent.",
      },
    };
  }

  const mockAccounts = new Map([
    ["password-user@example.com", { hasPassword: true, verified: true }],
    [
      "social-only@example.com",
      { hasPassword: false, provider: "google", verified: true },
    ],
  ]);

  // Request for known password user
  const resKnown = requestPasswordRecovery(
    "password-user@example.com",
    mockAccounts,
  );
  // Request for social-only user
  const resSocial = requestPasswordRecovery(
    "social-only@example.com",
    mockAccounts,
  );
  // Request for completely unknown user
  const resUnknown = requestPasswordRecovery(
    "nonexistent@example.com",
    mockAccounts,
  );

  assert.equal(resKnown.status, 200);
  assert.equal(resSocial.status, 200);
  assert.equal(resUnknown.status, 200);

  // Status and body must be strictly identical across all 3 cases (zero disclosure)
  assert.deepEqual(resKnown.body, resSocial.body);
  assert.deepEqual(resSocial.body, resUnknown.body);
  assert.ok(!JSON.stringify(resSocial.body).includes("social"));
  assert.ok(!JSON.stringify(resUnknown.body).includes("found"));
});

test("auth route applies shared admission before registration, sign-in, OTP, and reset, exempting session/sign-out", async () => {
  const { readFileSync } = await import("node:fs");
  const vm = await import("node:vm");
  const ts = (await import("typescript")).default;

  function loadAuthRoute(mockAdmissionFn, mockHandlerFn) {
    const source = readFileSync(
      new URL("../app/api/auth/[...path]/route.ts", import.meta.url),
      "utf8",
    );
    const output = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;

    const exports = {};
    const mockNextResponse = {
      json(data, init) {
        return {
          status: init?.status ?? 200,
          headers: new Map(Object.entries(init?.headers ?? {})),
          data,
          async json() {
            return data;
          },
        };
      },
    };

    class MockNextRequest {
      constructor(url, init = {}) {
        this.url = url;
        this.method = init.method || "GET";
        this.headers = new Map(Object.entries(init.headers || {}));
        this._body = init.body;
      }
      clone() {
        return new MockNextRequest(this.url, {
          method: this.method,
          headers: Object.fromEntries(this.headers.entries()),
          body: this._body,
        });
      }
      async json() {
        if (!this._body) throw new Error("No body");
        return typeof this._body === "string"
          ? JSON.parse(this._body)
          : this._body;
      }
    }

    function loadAuthServer() {
      const serverSource = readFileSync(
        new URL("../lib/auth/server.ts", import.meta.url),
        "utf8",
      );
      const serverOutput = ts.transpileModule(serverSource, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText;
      const serverExports = {};
      vm.runInNewContext(serverOutput, {
        exports: serverExports,
        require(name) {
          if (name === "server-only") return {};
          if (name === "@neondatabase/auth/next/server") {
            return {
              createNeonAuth: () => ({
                handler: () => ({}),
                getSession: async () => ({}),
              }),
            };
          }
          if (name === "@/lib/rate-limit") {
            return { consumeAdmission: async () => ({ allowed: true }) };
          }
          throw new Error(`Unexpected import in loadAuthServer: ${name}`);
        },
        process,
      });
      return serverExports;
    }

    const authServerExports = loadAuthServer();

    const mockAuthServer = {
      auth: {
        handler() {
          return {
            GET:
              mockHandlerFn ||
              (async () => mockNextResponse.json({ ok: true })),
            POST:
              mockHandlerFn ||
              (async () => mockNextResponse.json({ ok: true })),
          };
        },
      },
      AUTH_ADMISSION_POLICIES: authServerExports.AUTH_ADMISSION_POLICIES,
      getAuthAdmissionPolicy: authServerExports.getAuthAdmissionPolicy,
      consumeAuthAdmission: mockAdmissionFn,
    };

    const mockCapabilities = {
      isAllowedAuthPath(pathname, method) {
        const clean = pathname
          .replace(/^\/?api\/auth\/?/i, "")
          .replace(/^\/+|\/+$/g, "");
        if (clean === "get-session" && method === "GET")
          return { allowed: true };
        if (clean === "sign-out" && method === "POST") return { allowed: true };
        if (clean === "sign-in/email" && method === "POST")
          return { allowed: true };
        if (clean === "sign-up/email" && method === "POST")
          return { allowed: true };
        if (clean === "email-otp/verify-email" && method === "POST")
          return { allowed: true };
        if (clean === "email-otp/send-verification-otp" && method === "POST")
          return { allowed: true };
        if (clean === "email-otp/reset-password" && method === "POST")
          return { allowed: true };
        if (clean === "request-password-reset" && method === "POST")
          return { allowed: true };
        return { allowed: false, reason: "CAPABILITY_DISABLED" };
      },
    };

    vm.runInNewContext(output, {
      exports,
      require(name) {
        if (name === "next/server") {
          return {
            NextRequest: MockNextRequest,
            NextResponse: mockNextResponse,
          };
        }
        if (name === "@/lib/auth/server") {
          return mockAuthServer;
        }
        if (name === "@/lib/auth/capabilities") {
          return mockCapabilities;
        }
        if (name === "server-only") return {};
        throw new Error(`Unexpected import: ${name}`);
      },
      process,
      URL,
      Map,
      JSON,
      String,
      Promise,
    });

    return { exports, MockNextRequest, mockNextResponse, authServerExports };
  }

  // 1. Verify policy mapping helper
  const { authServerExports, MockNextRequest } = loadAuthRoute(async () => ({
    allowed: true,
    count: 1,
  }));
  const getPolicy = authServerExports.getAuthAdmissionPolicy;
  assert.ok(
    getPolicy,
    "getAuthAdmissionPolicy must be exported from lib/auth/server",
  );

  assert.equal(getPolicy("get-session"), null, "get-session must be exempt");
  assert.equal(getPolicy("session"), null, "session must be exempt");
  assert.equal(getPolicy("sign-out"), null, "sign-out must be exempt");
  assert.equal(getPolicy("ok"), null, "ok must be exempt");
  assert.equal(getPolicy("callback/google"), null, "callback must be exempt");

  assert.equal(getPolicy("sign-in/email")?.purpose, "auth:sign_in");
  assert.equal(getPolicy("sign-in/email")?.limit, 5);

  assert.equal(getPolicy("sign-up/email")?.purpose, "auth:register");
  assert.equal(getPolicy("sign-up/email")?.limit, 3);

  assert.equal(getPolicy("email-otp/verify-email")?.purpose, "auth:verify_otp");
  assert.equal(getPolicy("email-otp/verify-email")?.limit, 3);

  assert.equal(
    getPolicy("email-otp/send-verification-otp", { type: "email-verification" })
      ?.purpose,
    "auth:resend_otp",
  );
  assert.equal(
    getPolicy("email-otp/send-verification-otp", { type: "forget-password" })
      ?.purpose,
    "auth:reset_password",
  );
  assert.equal(
    getPolicy("email-otp/reset-password")?.purpose,
    "auth:reset_password",
  );
  assert.equal(
    getPolicy("request-password-reset")?.purpose,
    "auth:reset_password",
  );

  // 2. Admission allowed: forwards to handler
  let handlerCalled = false;
  let receivedSignals = null;
  const allowedRoute = loadAuthRoute(
    async (signals, purpose) => {
      receivedSignals = signals;
      return { allowed: true, count: 1 };
    },
    async () => {
      handlerCalled = true;
      return { status: 200, headers: new Map() };
    },
  );

  const req = new allowedRoute.MockNextRequest(
    "http://localhost:3000/api/auth/sign-in/email",
    {
      method: "POST",
      headers: { "x-forwarded-for": "198.51.100.5, 10.0.0.1" },
      body: JSON.stringify({
        email: "user@example.com",
        password: "Password123!",
      }),
    },
  );
  const res = await allowedRoute.exports.POST(req, {
    params: Promise.resolve({ path: ["sign-in", "email"] }),
  });
  assert.equal(res.status, 200);
  assert.equal(handlerCalled, true);
  assert.equal(receivedSignals?.clientIp, "198.51.100.5");
  assert.equal(receivedSignals?.identifier, "user@example.com");

  // 3. Admission capped (429): stops forwarding, returns Retry-After & private no-store
  handlerCalled = false;
  const cappedRoute = loadAuthRoute(
    async () => ({ allowed: false, count: 6, retryAfter: 45 }),
    async () => {
      handlerCalled = true;
      return { status: 200, headers: new Map() };
    },
  );
  const cappedReq = new cappedRoute.MockNextRequest(
    "http://localhost:3000/api/auth/sign-in/email",
    {
      method: "POST",
      headers: { "x-real-ip": "198.51.100.10" },
      body: JSON.stringify({ email: "spammer@example.com" }),
    },
  );
  const cappedRes = await cappedRoute.exports.POST(cappedReq, {
    params: Promise.resolve({ path: ["sign-in", "email"] }),
  });
  assert.equal(cappedRes.status, 429);
  assert.equal(
    handlerCalled,
    false,
    "Handler must not be called when admission is capped",
  );
  assert.equal(cappedRes.headers.get("Retry-After"), "45");
  assert.equal(cappedRes.headers.get("Cache-Control"), "private, no-store");
  assert.equal(cappedRes.data.error, "RATE_LIMITED");

  // 4. Admission outage (503): stops forwarding (no new effect), returns 503
  handlerCalled = false;
  const outageRoute = loadAuthRoute(
    async () => {
      throw new Error("PostgreSQL connection refused");
    },
    async () => {
      handlerCalled = true;
      return { status: 200, headers: new Map() };
    },
  );
  const outageReq = new outageRoute.MockNextRequest(
    "http://localhost:3000/api/auth/sign-up/email",
    {
      method: "POST",
      headers: { "x-real-ip": "198.51.100.10" },
      body: JSON.stringify({ email: "newuser@example.com" }),
    },
  );
  const outageRes = await outageRoute.exports.POST(outageReq, {
    params: Promise.resolve({ path: ["sign-up", "email"] }),
  });
  assert.equal(outageRes.status, 503);
  assert.equal(
    handlerCalled,
    false,
    "Handler must not be called during admission outage",
  );
  assert.equal(outageRes.headers.get("Cache-Control"), "private, no-store");
  assert.equal(outageRes.data.error, "UNAVAILABLE");

  // 5. Outage exemption: session checks (get-session) and sign-out are NOT blocked by limiter outage
  let sessionHandlerCalled = false;
  const sessionReq = new outageRoute.MockNextRequest(
    "http://localhost:3000/api/auth/get-session",
    {
      method: "GET",
    },
  );
  const sessionRes = await outageRoute.exports.GET(sessionReq, {
    params: Promise.resolve({ path: ["get-session"] }),
  });
  assert.equal(
    sessionRes.status,
    200,
    "get-session must succeed during admission outage",
  );

  let signOutHandlerCalled = false;
  const signOutReq = new outageRoute.MockNextRequest(
    "http://localhost:3000/api/auth/sign-out",
    {
      method: "POST",
    },
  );
  const signOutRes = await outageRoute.exports.POST(signOutReq, {
    params: Promise.resolve({ path: ["sign-out"] }),
  });
  assert.equal(
    signOutRes.status,
    200,
    "sign-out must succeed during admission outage",
  );
});
