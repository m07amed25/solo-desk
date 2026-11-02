import { NextRequest, NextResponse } from "next/server";
import { getApplicationContext, ApplicationError } from "@/lib/application";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.size > 0) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "Unexpected query parameters in context request",
        },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const context = await getApplicationContext();
    return NextResponse.json(context, { headers: NO_STORE_HEADERS });
  } catch (err) {
    if (err instanceof ApplicationError) {
      return NextResponse.json(
        {
          error: err.code,
          message: err.message,
        },
        { status: err.statusHttp, headers: NO_STORE_HEADERS },
      );
    }
    const message =
      err instanceof Error && err.message.includes("unavailable")
        ? "Service unavailable"
        : "An unexpected error occurred";
    const status =
      err instanceof Error && err.message.includes("unavailable") ? 503 : 500;
    return NextResponse.json(
      {
        error: "SERVICE_UNAVAILABLE",
        message,
      },
      { status, headers: NO_STORE_HEADERS },
    );
  }
}
