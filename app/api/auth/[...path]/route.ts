import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { isAllowedAuthPath } from "@/lib/auth/capabilities";

const handlers = auth.handler();

type RouteContext = { params: Promise<{ path: string[] }> };

function wrapHandler(method: keyof typeof handlers) {
  const original = handlers[method];
  return async function (request: NextRequest, context: RouteContext) {
    const url = new URL(request.url);
    const check = isAllowedAuthPath(url.pathname, request.method);
    if (!check.allowed) {
      return NextResponse.json(
        {
          error: "CAPABILITY_DISABLED",
          message: "Authentication capability is currently disabled.",
        },
        {
          status: 403,
          headers: {
            "Cache-Control": "private, no-store",
          },
        },
      );
    }
    return original(request, context);
  };
}

export const GET = wrapHandler("GET");
export const POST = wrapHandler("POST");
export const PUT = wrapHandler("PUT");
export const DELETE = wrapHandler("DELETE");
export const PATCH = wrapHandler("PATCH");
