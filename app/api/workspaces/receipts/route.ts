import { NextRequest, NextResponse } from "next/server";
import { getReceiptStatus, WorkspaceError } from "@/lib/workspaces";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operationId = searchParams.get("operationId");

    if (!operationId) {
      return NextResponse.json(
        {
          error: "VALIDATION",
          message: "operationId parameter is required",
        },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const receipt = await getReceiptStatus(operationId);
    return NextResponse.json(receipt, { headers: NO_STORE_HEADERS });
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
        message: "An unexpected error occurred while fetching receipt",
      },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
