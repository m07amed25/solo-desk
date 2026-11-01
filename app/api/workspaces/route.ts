import { NextRequest, NextResponse } from "next/server";
import {
  listWorkspaces,
  getWorkspaceContext,
  WorkspaceError,
} from "@/lib/workspaces";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");

    // Context mode vs List mode
    if (workspaceId) {
      if (limitParam !== null || cursor !== null) {
        return NextResponse.json(
          {
            error: "VALIDATION",
            message: "Mixing list and context query fields is invalid.",
          },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }
      const context = await getWorkspaceContext(workspaceId);
      return NextResponse.json(context, { headers: NO_STORE_HEADERS });
    }

    // List mode
    let limit: number | undefined;
    if (limitParam !== null) {
      const parsed = parseInt(limitParam, 10);
      if (isNaN(parsed) || parsed < 1) {
        return NextResponse.json(
          {
            error: "VALIDATION",
            message: "Limit must be a positive integer",
          },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }
      limit = Math.min(parsed, 50);
    }

    const result = await listWorkspaces(null, {
      limit,
      cursor: cursor || undefined,
    });

    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return NextResponse.json(
        {
          error: err.code,
          message: err.message,
          fields: err.fields,
        },
        { status: err.statusHttp, headers: NO_STORE_HEADERS },
      );
    }
    return NextResponse.json(
      {
        error: "SERVICE_UNAVAILABLE",
        message: "An unexpected error occurred",
      },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
