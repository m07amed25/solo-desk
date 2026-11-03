import "server-only";
import {
  requireAccountSession,
  parseAccountJsonRequest,
  validateAccountOrigin,
  accountResponse,
  accountErrorResponse,
} from "@/lib/account";
import { consumeAdmission } from "@/lib/rate-limit";
import {
  createReauthIntent,
  insertReauthIntent,
  getReauthIntent,
  verifyExistingMethodFreshness,
  AccountSecurityError,
  type ReauthAction,
  type ReauthMethod,
} from "@/lib/auth/account-security";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  try {
    const session = await requireAccountSession();
    const url = new URL(request.url);
    const confirmationId = url.searchParams.get("confirmationId");

    if (!confirmationId || !UUID_REGEX.test(confirmationId)) {
      throw new AccountSecurityError(
        "VALIDATION",
        "Valid confirmationId query parameter is required",
        400,
      );
    }

    const intent = await getReauthIntent(confirmationId, session);
    const isExpired =
      intent.expiresAt && new Date(intent.expiresAt).getTime() <= Date.now();
    const state =
      isExpired && (intent.state === "verified" || intent.state === "pending")
        ? "expired"
        : intent.state;

    return accountResponse({
      confirmationId: intent.id,
      state,
      action: intent.action,
      method: intent.method,
      expiresAt: intent.expiresAt,
      verifiedAt: intent.verifiedAt,
    });
  } catch (err) {
    return accountErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    validateAccountOrigin(request);
    const session = await requireAccountSession();

    // Admission rate limit on new confirmation attempts (5 attempts per 300s window)
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    await consumeAdmission(
      { clientIp, identifier: session.userId },
      { purpose: "reauth:confirm", limit: 5, windowSeconds: 300 },
    );

    const body = await parseAccountJsonRequest<Record<string, unknown>>(
      request,
      4096,
    );

    // Case 1: Verifying existing intent with password
    if ("confirmationId" in body && "password" in body) {
      const allowedKeys = new Set(["confirmationId", "password"]);
      for (const k of Object.keys(body)) {
        if (!allowedKeys.has(k)) {
          throw new AccountSecurityError(
            "VALIDATION",
            `Unexpected property: ${k}`,
            400,
          );
        }
      }

      const confirmationId = body.confirmationId;
      if (
        typeof confirmationId !== "string" ||
        !UUID_REGEX.test(confirmationId)
      ) {
        throw new AccountSecurityError(
          "VALIDATION",
          "Invalid confirmationId format",
          400,
        );
      }

      const password = body.password;
      if (typeof password !== "string" || password.trim().length === 0) {
        throw new AccountSecurityError(
          "VALIDATION",
          "Password must be a non-empty string",
          400,
        );
      }

      const verified = await verifyExistingMethodFreshness(
        confirmationId,
        { password },
        session,
      );

      return accountResponse({
        confirmationId: verified.id,
        state: verified.state,
        action: verified.action,
        method: verified.method,
        verifiedAt: verified.verifiedAt,
        expiresAt: verified.expiresAt,
      });
    }

    // Case 2: Creating new confirmation intent
    const allowedNewKeys = new Set([
      "action",
      "method",
      "targetReference",
      "targetReferences",
    ]);
    for (const k of Object.keys(body)) {
      if (!allowedNewKeys.has(k)) {
        throw new AccountSecurityError(
          "VALIDATION",
          `Unexpected property: ${k}`,
          400,
        );
      }
    }

    const action = body.action as ReauthAction;
    if (action !== "revoke_session" && action !== "revoke_other_sessions") {
      throw new AccountSecurityError(
        "VALIDATION",
        "Action must be 'revoke_session' or 'revoke_other_sessions'",
        400,
      );
    }

    const method = body.method as ReauthMethod;
    if (method !== "password" && method !== "google" && method !== "github") {
      throw new AccountSecurityError(
        "VALIDATION",
        "Method must be 'password', 'google', or 'github'",
        400,
      );
    }

    let targetReference: string | null = null;
    let existingSessions: string[] | undefined = undefined;

    if (action === "revoke_session") {
      const targetRef = body.targetReference;
      if (typeof targetRef !== "string" || targetRef.trim().length === 0) {
        throw new AccountSecurityError(
          "VALIDATION",
          "targetReference is required for revoke_session",
          400,
        );
      }
      targetReference = targetRef;
    } else {
      if (Array.isArray(body.targetReferences)) {
        existingSessions = (body.targetReferences as unknown[]).filter(
          (t): t is string => typeof t === "string" && t.trim().length > 0,
        );
      }
    }

    const intent = createReauthIntent({
      userId: session.userId,
      originalSessionId: session.sessionId,
      action,
      method,
      targetReference,
      existingSessions,
    });

    await insertReauthIntent(intent);

    return accountResponse(
      {
        confirmationId: intent.id,
        state: intent.state,
        action: intent.action,
        method: intent.method,
        expiresAt: intent.expiresAt,
      },
      { status: 201 },
    );
  } catch (err) {
    return accountErrorResponse(err);
  }
}
