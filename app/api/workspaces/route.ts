import { NextRequest, NextResponse } from "next/server";
import {
  listWorkspaces,
  getWorkspaceContext,
  WorkspaceError,
} from "@/lib/workspaces";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check for duplicate keys
    const seenKeys = new Set<string>();
    for (const key of searchParams.keys()) {
      if (seenKeys.has(key)) {
        return NextResponse.json(
          {
            error: "VALIDATION",
            message: `Duplicate query parameter: ${key}`,
          },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }
      seenKeys.add(key);
    }

    // Check for unknown query parameters
    const allowedKeys = new Set(["workspaceId", "limit", "cursor"]);
    for (const key of seenKeys) {
      if (!allowedKeys.has(key)) {
        return NextResponse.json(
          {
            error: "VALIDATION",
            message: `Unknown query parameter: ${key}`,
          },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }
    }

    const workspaceId = searchParams.get("workspaceId");
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor");

    // Context mode vs List mode
    if (workspaceId !== null) {
      if (limitParam !== null || cursor !== null) {
        return NextResponse.json(
          {
            error: "VALIDATION",
            message: "Mixing list and context query fields is invalid.",
          },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }
      if (!UUID_REGEX.test(workspaceId)) {
        return NextResponse.json(
          {
            error: "VALIDATION",
            message: "Malformed workspaceId selector",
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
      if (!/^\d+$/.test(limitParam)) {
        return NextResponse.json(
          {
            error: "VALIDATION",
            message: "Limit must be a positive integer",
          },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }
      const parsed = parseInt(limitParam, 10);
      if (parsed < 1) {
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

    if (cursor !== null && !UUID_REGEX.test(cursor)) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "Malformed cursor pagination selector",
        },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const result = await listWorkspaces(null, {
      limit: limit || 20,
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
