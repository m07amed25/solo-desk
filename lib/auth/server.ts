import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET!, sessionDataTtl: 1 },
});

// Fresh session authority shared by pages and the profile service; never shared-cached.
// Note: Valid session checks and ordinary sign-out are strictly exempt from admission rate limits.
export async function currentSession() {
  const { data: session, error } = await auth.getSession({
    query: { disableCookieCache: "true" },
  });
  if (error) throw new Error("Authentication unavailable");
  const expiry =
    session?.session && new Date(session.session.expiresAt).getTime();
  return session?.user &&
    session.user.emailVerified === true &&
    session.user.banned !== true &&
    expiry &&
    Number.isFinite(expiry) &&
    expiry > Date.now()
    ? session
    : null;
}

export const AUTH_ADMISSION_POLICIES = {
  sign_in: { purpose: "auth:sign_in", limit: 5, windowSeconds: 60 },
  register: { purpose: "auth:register", limit: 3, windowSeconds: 60 },
  verify_otp: { purpose: "auth:verify_otp", limit: 3, windowSeconds: 60 },
  resend_otp: { purpose: "auth:resend_otp", limit: 3, windowSeconds: 60 },
  reset_password: {
    purpose: "auth:reset_password",
    limit: 3,
    windowSeconds: 60,
  },
} as const;

export async function consumeAuthAdmission(
  signals: { clientIp?: string | null; identifier?: string | null },
  purposeKey: keyof typeof AUTH_ADMISSION_POLICIES | string,
  poolInput?: any,
) {
  const { consumeAdmission } = await import("@/lib/rate-limit");
  const policy =
    typeof purposeKey === "string" && purposeKey in AUTH_ADMISSION_POLICIES
      ? AUTH_ADMISSION_POLICIES[
          purposeKey as keyof typeof AUTH_ADMISSION_POLICIES
        ]
      : { purpose: purposeKey, limit: 3, windowSeconds: 60 };
  return consumeAdmission(signals, policy, poolInput);
}

export function getAuthAdmissionPolicy(
  cleanPath: string,
  body?: any,
): { purpose: string; limit: number; windowSeconds: number } | null {
  // Session checks, sign-out, ok, and callbacks are strictly exempt
  if (
    cleanPath === "get-session" ||
    cleanPath === "session" ||
    cleanPath === "sign-out" ||
    cleanPath === "ok" ||
    cleanPath.startsWith("callback/") ||
    cleanPath === "callback"
  ) {
    return null;
  }

  if (cleanPath === "sign-in/email" || cleanPath === "sign-in/social") {
    return AUTH_ADMISSION_POLICIES.sign_in;
  }
  if (cleanPath === "sign-up/email") {
    return AUTH_ADMISSION_POLICIES.register;
  }
  if (cleanPath === "email-otp/verify-email") {
    return AUTH_ADMISSION_POLICIES.verify_otp;
  }
  if (cleanPath === "email-otp/send-verification-otp") {
    const type = body?.type;
    if (type === "forget-password" || type === "reset-password") {
      return AUTH_ADMISSION_POLICIES.reset_password;
    }
    return AUTH_ADMISSION_POLICIES.resend_otp;
  }
  if (
    cleanPath === "email-otp/reset-password" ||
    cleanPath === "request-password-reset" ||
    cleanPath === "email-otp/request-password-reset" ||
    cleanPath === "forget-password/email-otp"
  ) {
    return AUTH_ADMISSION_POLICIES.reset_password;
  }

  return null;
}
