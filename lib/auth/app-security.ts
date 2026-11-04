import { createHmac, randomBytes, randomUUID } from "node:crypto";
import {
  APIError,
  addOAuthServerContext,
  createAuthEndpoint,
  createAuthMiddleware,
  getAuthoritativeSessionFromCtx,
  isAPIError,
} from "better-auth/api";
import { symmetricDecrypt } from "better-auth/crypto";
import { createOTP } from "@better-auth/utils/otp";
import { deleteSessionCookie, setSessionCookie } from "better-auth/cookies";
import { getCurrentAdapter } from "@better-auth/core/context";
import type { Pool } from "pg";
import { z } from "zod";

export const securityActions = [
  "/security/revoke-sessions",
  "/two-factor/enable",
  "/two-factor/disable",
  "/two-factor/generate-backup-codes",
  "/passkey/generate-register-options",
  "/passkey/delete-passkey",
  "/passkey/update-passkey",
  "/email-otp/request-email-change",
  "/email-otp/change-email",
  "/link-social",
  "/unlink-account",
] as const;

export function securityDigest(value: unknown): string {
  return JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );
}

export function appSecurity(pool: Pool, secret: string) {
  const digest = (value: string) =>
    createHmac("sha256", secret).update(value).digest("hex");
  const before = createAuthMiddleware(async (ctx) => {
    if (ctx.body?.trustDevice || ctx.body?.method === "otp")
      throw new APIError("BAD_REQUEST", { code: "UNSUPPORTED_FACTOR_POLICY" });
    if (
      ctx.path === "/two-factor/get-totp-uri" ||
      ctx.path === "/two-factor/send-otp" ||
      ctx.path === "/two-factor/verify-otp"
    )
      throw new APIError("FORBIDDEN", { code: "UNSUPPORTED_FACTOR_POLICY" });
    const session = await getAuthoritativeSessionFromCtx(ctx);
    const adapter = await getCurrentAdapter(ctx.context.adapter);
    const user = session
      ? await adapter.findOne<Record<string, unknown>>({
          model: "user",
          where: [{ field: "id", value: session.user.id }],
        })
      : null;
    if (user?.banned || (session && !user?.emailVerified))
      throw new APIError("UNAUTHORIZED", { code: "VERIFIED_ACCOUNT_REQUIRED" });
    if (
      ctx.path === "/get-session" &&
      session &&
      (user?.recoveryRequired ||
        session.session.recoveryOnly ||
        (user?.twoFactorEnabled &&
          (!session.session.mfaVerified || !user.recoveryAcknowledged)))
    )
      throw new APIError("FORBIDDEN", { code: "TWO_FACTOR_REQUIRED" });
    const restricted =
      session &&
      user &&
      (user.recoveryRequired ||
        session.session.recoveryOnly ||
        (user.twoFactorEnabled &&
          (!session.session.mfaVerified || !user.recoveryAcknowledged)));
    const recoverySetup =
      (session?.session.recoveryOnly &&
        user?.recoveryRequired &&
        ctx.path === "/two-factor/enable") ||
      (session?.session.mfaVerified &&
        !user?.recoveryAcknowledged &&
        ctx.path === "/two-factor/generate-backup-codes");
    if (
      restricted &&
      !recoverySetup &&
      ![
        "/security/status",
        "/security/confirm",
        "/security/acknowledge",
        "/security/cancel",
        "/two-factor/verify-totp",
        "/two-factor/verify-backup-code",
        "/sign-out",
      ].includes(ctx.path)
    )
      throw new APIError("FORBIDDEN", { code: "TWO_FACTOR_REQUIRED" });

    if (
      ctx.path.startsWith("/two-factor/") ||
      ctx.path === "/security/confirm"
    ) {
      let owner = user?.id;
      if (!owner) {
        const cookie = ctx.context.createAuthCookie("two_factor");
        const challenge = await ctx.getSignedCookie(
          cookie.name,
          ctx.context.secret,
        );
        if (challenge)
          owner = (
            await ctx.context.internalAdapter.findVerificationValue(challenge)
          )?.value;
      }
      const key = `security:${digest(String(owner || "unidentified"))}`;
      const { rows } = await pool.query<{ count: number }>(
        `INSERT INTO solodesk_auth."rateLimit" (id, key, count, "lastRequest")
         VALUES ($1, $2, 1, $3) ON CONFLICT (key) DO UPDATE SET
         count = CASE WHEN solodesk_auth."rateLimit"."lastRequest" < $3 - 300000 THEN 1 ELSE solodesk_auth."rateLimit".count + 1 END,
         "lastRequest" = CASE WHEN solodesk_auth."rateLimit"."lastRequest" < $3 - 300000 THEN $3 ELSE solodesk_auth."rateLimit"."lastRequest" END
         RETURNING count`,
        [randomUUID(), key, Date.now()],
      );
      if (rows[0].count > 10)
        throw new APIError("TOO_MANY_REQUESTS", { code: "SECURITY_COOLDOWN" });
    }

    if (
      ctx.path === "/two-factor/verify-totp" &&
      user &&
      !user.twoFactorEnabled
    ) {
      if (
        user.setupSessionId !== session?.session.id ||
        !user.setupExpiresAt ||
        new Date(String(user.setupExpiresAt)).getTime() <= Date.now()
      )
        throw new APIError("FORBIDDEN", { code: "SETUP_EXPIRED" });
    }
    if (ctx.path === "/passkey/verify-registration") {
      if (!session) throw new APIError("UNAUTHORIZED");
      const intent = await ctx.context.internalAdapter.consumeVerificationValue(
        `passkey-setup:${session.session.id}`,
      );
      if (
        !intent ||
        intent.value !== session.user.id ||
        intent.expiresAt.getTime() <= Date.now()
      )
        throw new APIError("FORBIDDEN", {
          code: "REGISTRATION_CONFIRMATION_EXPIRED",
        });
    }
    if (
      securityActions.includes(ctx.path as (typeof securityActions)[number])
    ) {
      if (!session || !user) throw new APIError("UNAUTHORIZED");
      const recoverySetup =
        (session.session.recoveryOnly &&
          user.recoveryRequired &&
          ctx.path === "/two-factor/enable") ||
        (session.session.mfaVerified &&
          !user.recoveryAcknowledged &&
          ctx.path === "/two-factor/generate-backup-codes");
      if (
        !recoverySetup &&
        (user.recoveryRequired ||
          session.session.recoveryOnly ||
          (user.twoFactorEnabled &&
            (!session.session.mfaVerified || !user.recoveryAcknowledged)))
      )
        throw new APIError("FORBIDDEN", { code: "TWO_FACTOR_REQUIRED" });
      const proof = ctx.headers?.get("x-solodesk-action-proof");
      if (!proof || !/^[a-f0-9]{64}$/.test(proof))
        throw new APIError("FORBIDDEN", {
          code: "FRESH_CONFIRMATION_REQUIRED",
        });
      const record = await ctx.context.internalAdapter.consumeVerificationValue(
        `action:${digest(proof)}`,
      );
      const body =
        ctx.method === "GET"
          ? Object.fromEntries(new URL(ctx.request!.url).searchParams)
          : ctx.body;
      const expected = securityDigest({
        userId: user.id,
        sessionId: session.session.id,
        action: ctx.path,
        bodyDigest: digest(securityDigest(body)),
      });
      if (
        !record ||
        record.expiresAt.getTime() <= Date.now() ||
        record.value !== expected
      )
        throw new APIError("FORBIDDEN", { code: "INVALID_ACTION_PROOF" });
      if (ctx.path === "/link-social")
        await addOAuthServerContext({
          solodeskLink: {
            userId: user.id,
            sessionId: session.session.id,
            provider: ctx.body.provider,
            expiresAt: Date.now() + 300_000,
          },
        });
      if (ctx.path === "/passkey/generate-register-options") {
        await adapter.deleteMany({
          model: "verification",
          where: [
            {
              field: "identifier",
              value: `passkey-setup:${session.session.id}`,
            },
          ],
        });
        await ctx.context.internalAdapter.createVerificationValue({
          identifier: `passkey-setup:${session.session.id}`,
          value: session.user.id,
          expiresAt: new Date(Date.now() + 300_000),
        });
      }
    }
  });

  const after = createAuthMiddleware(async (ctx) => {
    if (isAPIError(ctx.context.returned)) return;
    if (
      (ctx.path.startsWith("/callback/") ||
        ctx.path === "/passkey/verify-authentication") &&
      ctx.context.newSession?.user.twoFactorEnabled
    ) {
      const adapter = await getCurrentAdapter(ctx.context.adapter);
      await adapter.update({
        model: "session",
        where: [{ field: "id", value: ctx.context.newSession.session.id }],
        update: { expiresAt: new Date(Date.now() + 300_000) },
      });
    }
    if (
      !ctx.path.startsWith("/two-factor/") &&
      !securityActions.includes(ctx.path as (typeof securityActions)[number])
    )
      return;
    const adapter = await getCurrentAdapter(ctx.context.adapter);
    const session =
      ctx.context.newSession ||
      ctx.context.session ||
      (await getAuthoritativeSessionFromCtx(ctx));
    if (!session) return;
    const userId = session.user.id;
    const user = await adapter.findOne<Record<string, unknown>>({
      model: "user",
      where: [{ field: "id", value: userId }],
    });
    if (!user) throw new APIError("UNAUTHORIZED");
    if (ctx.path === "/two-factor/verify-totp") {
      const identifier = `totp-used:${digest(`${userId}:${ctx.body.code}`)}`;
      await adapter.deleteMany({
        model: "verification",
        where: [
          { field: "identifier", value: identifier },
          { field: "expiresAt", operator: "lt", value: new Date() },
        ],
      });
      if (
        await adapter.findOne({
          model: "verification",
          where: [{ field: "identifier", value: identifier }],
        })
      )
        throw new APIError("CONFLICT", { code: "TOTP_ALREADY_USED" });
      await ctx.context.internalAdapter.createVerificationValue({
        identifier,
        value: "used",
        expiresAt: new Date(Date.now() + 90_000),
      });
      await adapter.update({
        model: "session",
        where: [{ field: "id", value: session.session.id }],
        update: {
          mfaVerified: true,
          expiresAt: new Date(Date.now() + 604_800_000),
        },
      });
      if (!user.recoveryAcknowledged)
        await adapter.update({
          model: "user",
          where: [{ field: "id", value: userId }],
          update: { setupSessionId: session.session.id },
        });
    }
    if (
      ctx.path === "/two-factor/enable" ||
      ctx.path === "/two-factor/generate-backup-codes"
    ) {
      await adapter.update({
        model: "user",
        where: [{ field: "id", value: userId }],
        update: {
          recoveryAcknowledged: false,
          recoveryRemaining: 10,
          recoveryGeneration: randomUUID(),
          setupSessionId: session.session.id,
          setupExpiresAt: new Date(Date.now() + 300_000),
        },
      });
    }
    if (ctx.path === "/two-factor/verify-backup-code") {
      await adapter.update({
        model: "user",
        where: [{ field: "id", value: userId }],
        update: {
          recoveryRequired: true,
          recoveryAcknowledged: false,
          twoFactorEnabled: false,
          recoveryRemaining: 0,
        },
      });
      await adapter.deleteMany({
        model: "twoFactor",
        where: [{ field: "userId", value: userId }],
      });
      const limited = await ctx.context.internalAdapter.createSession(
        userId,
        false,
        {
          mfaVerified: false,
          recoveryOnly: true,
          expiresAt: new Date(Date.now() + 300_000),
        },
        true,
      );
      if (!limited) throw new APIError("INTERNAL_SERVER_ERROR");
      await adapter.deleteMany({
        model: "session",
        where: [
          { field: "userId", value: userId },
          { field: "id", operator: "ne", value: limited.id },
        ],
      });
      await setSessionCookie(ctx, { session: limited, user: session.user });
      return ctx.json({ recoveryRequired: true });
    }
    if (ctx.path === "/two-factor/disable") {
      await adapter.update({
        model: "user",
        where: [{ field: "id", value: userId }],
        update: {
          recoveryAcknowledged: false,
          recoveryRemaining: 0,
          recoveryGeneration: null,
          setupSessionId: null,
          setupExpiresAt: null,
        },
      });
    }
    if (
      [
        "/two-factor/disable",
        "/unlink-account",
        "/passkey/delete-passkey",
        "/email-otp/change-email",
      ].includes(ctx.path)
    ) {
      await adapter.deleteMany({
        model: "session",
        where: [
          { field: "userId", value: userId },
          { field: "id", operator: "ne", value: session.session.id },
        ],
      });
    }
  });

  return {
    id: "solodesk-account-security",
    hooks: {
      before: [{ matcher: () => true, handler: before }],
      after: [{ matcher: () => true, handler: after }],
    },
    endpoints: {
      accountSecurityStatus: createAuthEndpoint(
        "/security/status",
        { method: "GET" },
        async (ctx) => {
          const session = await getAuthoritativeSessionFromCtx(ctx);
          if (!session) {
            const cookie = ctx.context.createAuthCookie("two_factor");
            const challenge = await ctx.getSignedCookie(
              cookie.name,
              ctx.context.secret,
            );
            const record = challenge
              ? await ctx.context.internalAdapter.findVerificationValue(
                  challenge,
                )
              : null;
            const owner =
              record && record.expiresAt.getTime() > Date.now()
                ? await ctx.context.internalAdapter.findUserById(record.value)
                : null;
            return ctx.json({
              state:
                owner?.emailVerified && !("banned" in owner && owner.banned)
                  ? "challenge"
                  : "signed-out",
            });
          }
          const adapter = await getCurrentAdapter(ctx.context.adapter);
          const user = await adapter.findOne<Record<string, unknown>>({
            model: "user",
            where: [{ field: "id", value: session.user.id }],
          });
          if (!user?.emailVerified || user.banned)
            throw new APIError("UNAUTHORIZED");
          if (user.twoFactorEnabled && !session.session.mfaVerified)
            return ctx.json({ state: "challenge" });
          const recovery = Boolean(
            user.recoveryRequired || session.session.recoveryOnly,
          );
          const accounts = await adapter.findMany<{
            id: string;
            providerId: string;
          }>({
            model: "account",
            where: [{ field: "userId", value: session.user.id }],
            limit: 20,
          });
          const keys = await adapter.findMany<{ id: string; name?: string }>({
            model: "passkey",
            where: [{ field: "userId", value: session.user.id }],
            limit: 20,
          });
          const sessions = recovery
            ? []
            : await adapter.findMany<{
                id: string;
                createdAt: Date;
                expiresAt: Date;
              }>({
                model: "session",
                where: [
                  { field: "userId", value: session.user.id },
                  { field: "expiresAt", operator: "gt", value: new Date() },
                ],
                limit: 20,
                sortBy: { field: "createdAt", direction: "desc" },
              });
          return ctx.json({
            state: recovery ? "recovery" : "ready",
            sessions: sessions.map(({ id, createdAt, expiresAt }) => ({
              id,
              createdAt,
              expiresAt,
              current: id === session.session.id,
            })),
            userId: user.id,
            email: session.user.email,
            factorEnabled: Boolean(user.twoFactorEnabled),
            recoveryAcknowledged: Boolean(user.recoveryAcknowledged),
            recoveryGeneration:
              user.setupSessionId === session.session.id
                ? user.recoveryGeneration
                : null,
            recoveryRemaining: user.recoveryRemaining,
            hasPassword: accounts.some((a) => a.providerId === "credential"),
            providers: ctx.context.socialProviders.map((p) => p.id),
            accounts: recovery
              ? []
              : accounts.map(({ id, providerId }) => ({ id, providerId })),
            passkeys: recovery
              ? []
              : keys.map(({ id, name }) => ({
                  id,
                  name: name?.slice(0, 100) || "Passkey",
                })),
          });
        },
      ),
      revokeSecuritySessions: createAuthEndpoint(
        "/security/revoke-sessions",
        {
          method: "POST",
          body: z
            .object({
              ids: z
                .array(z.uuid())
                .min(1)
                .max(20)
                .refine((ids) => new Set(ids).size === ids.length),
            })
            .strict(),
        },
        async (ctx) => {
          const session = await getAuthoritativeSessionFromCtx(ctx);
          if (!session || ctx.body.ids.includes(session.session.id))
            throw new APIError("FORBIDDEN");
          const adapter = await getCurrentAdapter(ctx.context.adapter);
          const targets = await adapter.findMany<{ id: string }>({
            model: "session",
            where: [
              { field: "userId", value: session.user.id },
              { field: "id", operator: "in", value: ctx.body.ids },
            ],
            limit: 20,
          });
          if (targets.length !== ctx.body.ids.length)
            throw new APIError("CONFLICT", { code: "SESSION_TARGETS_CHANGED" });
          await adapter.deleteMany({
            model: "session",
            where: [
              { field: "userId", value: session.user.id },
              { field: "id", operator: "in", value: ctx.body.ids },
            ],
          });
          return ctx.json({ revoked: targets.length });
        },
      ),
      confirmSecurityAction: createAuthEndpoint(
        "/security/confirm",
        {
          method: "POST",
          body: z
            .object({
              action: z.enum(securityActions),
              body: z.record(z.string(), z.unknown()),
              password: z.string().min(1).max(128),
              code: z
                .string()
                .regex(/^\d{6}$/)
                .optional(),
            })
            .strict(),
        },
        async (ctx) => {
          const session = await getAuthoritativeSessionFromCtx(ctx);
          if (!session) throw new APIError("UNAUTHORIZED");
          await ctx.context.password.checkPassword(session.user.id, ctx);
          const adapter = await getCurrentAdapter(ctx.context.adapter);
          const user = await adapter.findOne<Record<string, unknown>>({
            model: "user",
            where: [{ field: "id", value: session.user.id }],
          });
          if (user?.twoFactorEnabled) {
            const factor = await adapter.findOne<{ secret: string }>({
              model: "twoFactor",
              where: [
                { field: "userId", value: session.user.id },
                { field: "verified", value: true },
              ],
            });
            const raw =
              factor &&
              (await symmetricDecrypt({
                key: ctx.context.secretConfig,
                data: factor.secret,
              }));
            if (
              !raw ||
              !ctx.body.code ||
              !(await createOTP(raw, { period: 30, digits: 6 }).verify(
                ctx.body.code,
              ))
            )
              throw new APIError("FORBIDDEN", {
                code: "FRESH_AUTHENTICATOR_REQUIRED",
              });
            const identifier = `totp-used:${digest(`${session.user.id}:${ctx.body.code}`)}`;
            await adapter.deleteMany({
              model: "verification",
              where: [
                { field: "identifier", value: identifier },
                { field: "expiresAt", operator: "lt", value: new Date() },
              ],
            });
            if (
              await adapter.findOne({
                model: "verification",
                where: [{ field: "identifier", value: identifier }],
              })
            )
              throw new APIError("CONFLICT", { code: "TOTP_ALREADY_USED" });
            await ctx.context.internalAdapter.createVerificationValue({
              identifier,
              value: "used",
              expiresAt: new Date(Date.now() + 90_000),
            });
          }
          const proof = randomBytes(32).toString("hex");
          await ctx.context.internalAdapter.createVerificationValue({
            identifier: `action:${digest(proof)}`,
            value: securityDigest({
              userId: session.user.id,
              sessionId: session.session.id,
              action: ctx.body.action,
              bodyDigest: digest(securityDigest(ctx.body.body)),
            }),
            expiresAt: new Date(Date.now() + 300_000),
          });
          return ctx.json({ proof });
        },
      ),
      acknowledgeRecoveryCodes: createAuthEndpoint(
        "/security/acknowledge",
        {
          method: "POST",
          body: z
            .object({ generation: z.uuid(), saved: z.literal(true) })
            .strict(),
        },
        async (ctx) => {
          const session = await getAuthoritativeSessionFromCtx(ctx);
          if (!session?.session.mfaVerified) throw new APIError("FORBIDDEN");
          const adapter = await getCurrentAdapter(ctx.context.adapter);
          const user = await adapter.findOne<Record<string, unknown>>({
            model: "user",
            where: [{ field: "id", value: session.user.id }],
          });
          if (
            !user?.twoFactorEnabled ||
            user.recoveryGeneration !== ctx.body.generation ||
            user.setupSessionId !== session.session.id ||
            !user.setupExpiresAt ||
            new Date(String(user.setupExpiresAt)).getTime() <= Date.now()
          )
            throw new APIError("CONFLICT", {
              code: "RECOVERY_GENERATION_CHANGED",
            });
          await adapter.update({
            model: "user",
            where: [{ field: "id", value: session.user.id }],
            update: {
              recoveryAcknowledged: true,
              recoveryRequired: false,
              setupSessionId: null,
              setupExpiresAt: null,
            },
          });
          const mustSignIn = Boolean(
            user.recoveryRequired || session.session.recoveryOnly,
          );
          await adapter.deleteMany({
            model: "session",
            where: [
              { field: "userId", value: session.user.id },
              ...(mustSignIn
                ? []
                : [
                    {
                      field: "id",
                      operator: "ne" as const,
                      value: session.session.id,
                    },
                  ]),
            ],
          });
          if (mustSignIn) await deleteSessionCookie(ctx);
          return ctx.json({ requiresSignIn: mustSignIn });
        },
      ),
      cancelSecuritySetup: createAuthEndpoint(
        "/security/cancel",
        { method: "POST", body: z.object({}).strict() },
        async (ctx) => {
          const session = await getAuthoritativeSessionFromCtx(ctx);
          if (!session) throw new APIError("UNAUTHORIZED");
          const adapter = await getCurrentAdapter(ctx.context.adapter);
          const user = await adapter.findOne<Record<string, unknown>>({
            model: "user",
            where: [{ field: "id", value: session.user.id }],
          });
          if (
            user?.twoFactorEnabled ||
            user?.setupSessionId !== session.session.id
          )
            throw new APIError("CONFLICT", {
              code: "SETUP_CANNOT_BE_ROLLED_BACK",
            });
          await adapter.deleteMany({
            model: "twoFactor",
            where: [
              { field: "userId", value: session.user.id },
              { field: "verified", value: false },
            ],
          });
          await adapter.update({
            model: "user",
            where: [{ field: "id", value: session.user.id }],
            update: {
              setupSessionId: null,
              setupExpiresAt: null,
              recoveryGeneration: null,
              recoveryRemaining: 0,
            },
          });
          return ctx.json({ cancelled: true });
        },
      ),
    },
  };
}
