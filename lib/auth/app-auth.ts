import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import { twoFactor } from "better-auth/plugins/two-factor";
import { passkey } from "@better-auth/passkey";
import { PostgresDialect } from "kysely";
import type { Pool } from "pg";
import { runWithTransaction } from "@better-auth/core/context";
import { appSecurity } from "./app-security";
import { validateAppAuthRequest } from "./app-requests";
import { getAuthoritativeSessionFromCtx, getOAuthState } from "better-auth/api";

export type AuthMail = {
  email: string;
  code: string;
  purpose: "email-verification" | "forget-password" | "change-email";
};

export function createAppAuth({
  pool,
  secret,
  origin,
  sendMail,
  google,
  github,
}: {
  pool: Pool;
  secret: string;
  origin: string;
  sendMail: (message: AuthMail) => Promise<void>;
  google?: { clientId: string; clientSecret: string };
  github?: { clientId: string; clientSecret: string };
}) {
  const url = new URL(origin);
  if (
    url.origin !== origin ||
    (url.protocol !== "https:" &&
      !["localhost", "127.0.0.1"].includes(url.hostname)) ||
    secret.length < 32
  )
    throw new Error("Invalid application authentication configuration");

  const auth = betterAuth({
    appName: "SoloDesk",
    baseURL: origin,
    secret,
    trustedOrigins: [origin],
    database: {
      dialect: new PostgresDialect({ pool }),
      type: "postgres",
      schemaName: "solodesk_auth",
      transaction: true,
    },
    advanced: {
      database: { generateId: "uuid" },
      cookiePrefix: "solodesk",
      useSecureCookies: url.protocol === "https:",
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax", path: "/" },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
    },
    account: {
      encryptOAuthTokens: true,
      accountLinking: {
        enabled: true,
        disableImplicitLinking: true,
        trustedProviders: [],
        allowUnlinkingAll: true,
      },
    },
    socialProviders: {
      ...(google ? { google } : {}),
      ...(github ? { github } : {}),
    },
    user: {
      async validateUserInfo({ source, user }, ctx) {
        if (source.action !== "link-account") return;
        const state = await getOAuthState();
        const intent = state?.serverContext?.solodeskLink as
          | {
              userId?: string;
              sessionId?: string;
              provider?: string;
              expiresAt?: number;
            }
          | undefined;
        const session = await getAuthoritativeSessionFromCtx(ctx);
        if (
          !intent ||
          !session ||
          intent.userId !== user.id ||
          intent.userId !== session.user.id ||
          intent.sessionId !== session.session.id ||
          intent.provider !== source.oauth?.providerId ||
          !intent.expiresAt ||
          intent.expiresAt <= Date.now()
        )
          return { error: "LINK_CONFIRMATION_EXPIRED" };
      },
      additionalFields: {
        banned: {
          type: "boolean",
          defaultValue: false,
          input: false,
          returned: false,
        },
        recoveryRequired: {
          type: "boolean",
          defaultValue: false,
          input: false,
        },
        recoveryAcknowledged: {
          type: "boolean",
          defaultValue: false,
          input: false,
        },
        recoveryRemaining: {
          type: "number",
          defaultValue: 0,
          input: false,
          returned: false,
        },
        recoveryGeneration: {
          type: "string",
          required: false,
          input: false,
          returned: false,
        },
        setupSessionId: {
          type: "string",
          required: false,
          input: false,
          returned: false,
        },
        setupExpiresAt: {
          type: "date",
          required: false,
          input: false,
          returned: false,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      freshAge: 300,
      cookieCache: { enabled: false },
      additionalFields: {
        mfaVerified: { type: "boolean", defaultValue: false, input: false },
        recoveryOnly: { type: "boolean", defaultValue: false, input: false },
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 3 },
        "/two-factor/*": { window: 300, max: 5 },
        "/security/confirm": { window: 300, max: 5 },
        "/sign-out": false,
        "/get-session": false,
      },
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 3,
        storeOTP: "hashed",
        sendVerificationOnSignUp: true,
        disableSignUp: true,
        changeEmail: { enabled: true, verifyCurrentEmail: true },
        async sendVerificationOTP({ email, otp, type }) {
          if (type === "sign-in")
            throw new Error("Email passwordless sign-in is not enabled");
          await sendMail({ email, code: otp, purpose: type });
        },
      }),
      twoFactor({
        issuer: "SoloDesk",
        twoFactorCookieMaxAge: 300,
        totpOptions: { digits: 6, period: 30 },
        backupCodeOptions: {
          amount: 10,
          length: 12,
          storeBackupCodes: "encrypted",
        },
        accountLockout: {
          enabled: true,
          maxFailedAttempts: 10,
          durationSeconds: 300,
        },
      }),
      passkey({
        rpID: url.hostname,
        rpName: "SoloDesk",
        origin,
        authenticatorSelection: { userVerification: "required" },
      }),
      appSecurity(pool, secret),
    ],
    logger: { disabled: true },
  });
  return {
    ...auth,
    async handler(request: Request) {
      let invalid;
      try {
        invalid = await validateAppAuthRequest(request, origin);
      } catch {
        invalid = 400;
      }
      if (invalid)
        return Response.json(
          { code: "AUTH_REQUEST_DENIED" },
          {
            status: invalid,
            headers: { "Cache-Control": "private, no-store" },
          },
        );
      const path = new URL(request.url).pathname.replace(/^\/api\/auth/, "");
      const atomic =
        path.startsWith("/two-factor/") ||
        path.startsWith("/passkey/") ||
        path.startsWith("/security/") ||
        path === "/unlink-account" ||
        path === "/email-otp/change-email";
      const execute = async () => {
        const response = await auth.handler(request);
        if (atomic && !response.ok) throw response;
        response.headers.set("Cache-Control", "private, no-store");
        response.headers.set("Vary", "Cookie");
        if (
          response.headers.get("Content-Type")?.includes("application/json")
        ) {
          const data = await response.json();
          if (data && typeof data === "object") {
            delete data.token;
            if (data.session) delete data.session.token;
          }
          return Response.json(data, {
            status: response.status,
            headers: response.headers,
          });
        }
        return response;
      };
      try {
        return atomic
          ? await runWithTransaction((await auth.$context).adapter, execute)
          : await execute();
      } catch (error) {
        if (error instanceof Response) {
          error.headers.set("Cache-Control", "private, no-store");
          error.headers.set("Vary", "Cookie");
          return error;
        }
        return Response.json(
          { code: "AUTHENTICATION_UNAVAILABLE" },
          {
            status: 503,
            headers: { "Cache-Control": "private, no-store", Vary: "Cookie" },
          },
        );
      }
    },
  };
}
