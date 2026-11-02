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
        { error: "VALIDATION" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const context = await getApplicationContext();
    return NextResponse.json(context, { headers: NO_STORE_HEADERS });
  } catch (err) {
    if (err instanceof ApplicationError && err.statusHttp === 401) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401, headers: NO_STORE_HEADERS },
      );
    }
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE" },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }
}
