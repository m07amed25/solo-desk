import "server-only";
import {
  requireAccountSession,
  parseAccountJsonRequest,
  validateAccountOrigin,
  accountResponse,
  accountErrorResponse,
} from "@/lib/account";
import {
  dispatchExactTargetRevocation,
  AccountSecurityError,
} from "@/lib/auth/account-security";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    validateAccountOrigin(request);
    const session = await requireAccountSession();

    const body = await parseAccountJsonRequest<Record<string, unknown>>(
      request,
      4096,
    );

    const allowedKeys = new Set(["operationId", "confirmationId"]);
    for (const k of Object.keys(body)) {
      if (!allowedKeys.has(k)) {
        throw new AccountSecurityError(
          "VALIDATION",
          `Unexpected property: ${k}`,
          400,
        );
      }
    }

    const { operationId, confirmationId } = body;

    if (typeof operationId !== "string" || !UUID_REGEX.test(operationId)) {
      throw new AccountSecurityError(
        "VALIDATION",
        "Valid operationId UUID is required",
        400,
      );
    }

    if (
      typeof confirmationId !== "string" ||
      !UUID_REGEX.test(confirmationId)
    ) {
      throw new AccountSecurityError(
        "VALIDATION",
        "Valid confirmationId UUID is required",
        400,
      );
    }

    const receipt = await dispatchExactTargetRevocation(
      operationId,
      confirmationId,
      session,
    );

    const status =
      receipt.state === "accepted"
        ? 200
        : receipt.state === "rejected"
          ? 400
          : 202;

    return accountResponse(
      {
        operationId: receipt.operationId,
        state: receipt.state,
        results: receipt.results,
      },
      { status },
    );
  } catch (err) {
    return accountErrorResponse(err);
  }
}
