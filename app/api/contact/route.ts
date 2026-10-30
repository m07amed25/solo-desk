import { connection, NextResponse } from "next/server";
import {
  hashClientIp,
  generateTimestampToken,
  validateContactSubmission,
} from "@/lib/contact";
import { sendContactEmail } from "@/lib/email";
import { readRequestBody } from "@/lib/request-body";

export async function GET() {
  await connection();
  return NextResponse.json({ token: generateTimestampToken() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  // 1. Origin / CSRF Check (SEC-027)
  const urlOrigin = new URL(request.url).origin;
  const originHeader = request.headers.get("origin");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (originHeader && originHeader !== urlOrigin) {
    return NextResponse.json(
      { ok: false, error: "crossOriginForbidden", message: "Cross-origin requests are forbidden." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    return NextResponse.json(
      { ok: false, error: "crossOriginForbidden", message: "Cross-origin requests are forbidden." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  // 2. Feature Gating Check
  const isEnabled = process.env.SOLODESK_CONTACT_ENABLED === "true";
  if (!isEnabled) {
    return NextResponse.json(
      {
        ok: false,
        error: "serviceUnavailable",
        message: "The contact service is temporarily unavailable.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  // 3. Content-Type and Body Parsing
  const contentType = request.headers.get("content-type") ?? "";
  let payload: Record<string, unknown> = {};

  try {
    const rawBody = await readRequestBody(request);
    if (contentType.includes("application/json")) {
      payload = JSON.parse(rawBody);
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = new URLSearchParams(rawBody);
      const obj: Record<string, unknown> = {};
      for (const [key, val] of formData.entries()) {
        obj[key] = val;
      }
      payload = obj;
    } else {
      return NextResponse.json(
        { ok: false, error: "unsupportedMediaType", message: "Unsupported Content-Type." },
        { status: 415, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid payload");
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "badRequest", message: "Invalid request payload." },
      { status: error instanceof RangeError ? 413 : 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // 4. Client IP resolution for rate limiting
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 5. Schema Validation & Rate Limiting (SEC-023, SEC-029, SEC-063)
  const result = validateContactSubmission(payload, clientIp);

  if (!result.ok) {
    if (result.error === "rateLimited") {
      // SEC-030: Redacted operational logging
      console.info(
        JSON.stringify({
          event: "contact_submission",
          status: "rate_limited",
          ip_hash: hashClientIp(clientIp),
        })
      );
      return NextResponse.json(
        {
          ok: false,
          error: "rateLimited",
          retryAfter: result.retryAfter ?? 600,
          message: result.message ?? "Too many requests. Please wait before submitting again.",
        },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": String(result.retryAfter ?? 600),
          },
        }
      );
    }

    console.info(
      JSON.stringify({
        event: "contact_submission",
        status: "validation_failed",
        ip_hash: hashClientIp(clientIp),
      })
    );

    return NextResponse.json(
      {
        ok: false,
        error: "validationFailed",
        fields: result.fields,
        message: result.message ?? "Validation failed.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    await sendContactEmail(result.data);
  } catch {
    console.error(JSON.stringify({ event: "contact_submission", status: "delivery_failed" }));
    return NextResponse.json(
      { ok: false, error: "serviceUnavailable", message: "Your message could not be sent. Please try again later." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  // SEC-030: Sanitized operational logging - strictly NO raw email or message body
  console.info(
    JSON.stringify({
      event: "contact_submission",
      status: "accepted",
      topic: result.data.topic,
      ip_hash: result.data.ipHash,
    })
  );

  return NextResponse.json(
    {
      ok: true,
      status: "accepted",
      message: "Your message has been received.",
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
