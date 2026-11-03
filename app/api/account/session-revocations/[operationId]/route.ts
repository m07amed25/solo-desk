import "server-only";
import {
  requireAccountSession,
  accountResponse,
  accountErrorResponse,
} from "@/lib/account";
import { AccountSecurityError } from "@/lib/auth/account-security";
import { db } from "@/lib/db";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = {
  params: Promise<{ operationId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await requireAccountSession();
    const { operationId } = await context.params;

    if (!operationId || !UUID_REGEX.test(operationId)) {
      throw new AccountSecurityError(
        "VALIDATION",
        "Valid operationId UUID is required",
        400,
      );
    }

    const res = await db.query(
      `SELECT operation_id, state, target_results
       FROM solodesk.revocation_operations
       WHERE operation_id = $1 AND user_id = $2 AND original_session_id = $3
       LIMIT 1`,
      [operationId, session.userId, session.sessionId],
    );

    if (!res.rows || res.rows.length === 0) {
      throw new AccountSecurityError("NOT_FOUND", "Operation not found", 404);
    }

    const row = res.rows[0];
    const status =
      row.state === "accepted" ? 200 : row.state === "rejected" ? 400 : 202;

    return accountResponse(
      {
        operationId: row.operation_id,
        state: row.state,
        results: row.target_results,
      },
      { status },
    );
  } catch (err) {
    return accountErrorResponse(err);
  }
}
