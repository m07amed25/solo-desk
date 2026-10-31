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
