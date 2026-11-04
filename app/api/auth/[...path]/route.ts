import { NextRequest, NextResponse } from "next/server";
import {
  auth,
  getAuthAdmissionPolicy,
  consumeAuthAdmission,
} from "@/lib/auth/server";
import { isAllowedAuthPath } from "@/lib/auth/capabilities";

const handlers = auth.handler();

type RouteContext = { params: Promise<{ path: string[] }> };

function wrapHandler(method: keyof typeof handlers) {
  const original = handlers[method];
  return async function (request: NextRequest, context: RouteContext) {
    if (process.env.SOLODESK_AUTH_MODE === "app") return original(request, context);
    const url = new URL(request.url);
    const check = isAllowedAuthPath(url.pathname, request.method);
    if (!check.allowed) {
      const status = check.reason === "METHOD_NOT_ALLOWED" ? 405 : 403;
      return NextResponse.json(
        {
          error: check.reason || "CAPABILITY_DISABLED",
          message:
            check.reason === "METHOD_NOT_ALLOWED"
              ? `Method ${request.method} is not allowed for this auth path.`
              : "Authentication capability is currently disabled.",
        },
        {
          status,
          headers: {
            "Cache-Control": "private, no-store",
          },
        },
      );
    }

    let clean = url.pathname
      .trim()
      .replace(/^\/?api\/auth\/?/i, "")
      .replace(/^\/+|\/+$/g, "");

    // Safe body inspection for POST requests
    let body: any = undefined;
    if (request.method === "POST") {
      try {
        body = await request
          .clone()
          .json()
          .catch(() => ({}));
      } catch {
        body = undefined;
      }
    }

    // Apply shared admission before new registration/sign-in/verification/resend/recovery/reset
    const policy = getAuthAdmissionPolicy(clean, body);
    if (policy) {
      const clientIp =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip")?.trim() ||
        null;
      const identifier =
        typeof body?.email === "string" && body.email.trim()
          ? body.email.trim()
          : null;

      try {
        const admission = await consumeAuthAdmission(
          { clientIp, identifier },
          policy.purpose,
        );
        if (!admission.allowed) {
          return NextResponse.json(
            {
              error: "RATE_LIMITED",
              message: "Too many attempts. Please try again later.",
              retryAfter: admission.retryAfter,
            },
            {
              status: 429,
              headers: {
                "Retry-After": String(admission.retryAfter || 60),
                "Cache-Control": "private, no-store",
              },
            },
          );
        }
      } catch {
        // Shared limiter outage fails closed for new registration/sign-in/verification/reset
        return NextResponse.json(
          {
            error: "UNAVAILABLE",
            message:
              "Admission service is currently unavailable. Please try again later.",
          },
          {
            status: 503,
            headers: {
              "Cache-Control": "private, no-store",
            },
          },
        );
      }
    }

    // Reconcile request-password-reset alias paths to send-verification-otp with type: "forget-password"
    if (
      request.method === "POST" &&
      (clean === "request-password-reset" ||
        clean === "email-otp/request-password-reset")
    ) {
      try {
        const email = body?.email;
        if (!email || typeof email !== "string") {
          return NextResponse.json(
            { error: "VALIDATION", message: "Email is required" },
            { status: 400, headers: { "Cache-Control": "private, no-store" } },
          );
        }
        const targetUrl = new URL(request.url);
        targetUrl.pathname = "/api/auth/email-otp/send-verification-otp";
        const forwardedReq = new NextRequest(targetUrl.toString(), {
          method: "POST",
          headers: request.headers,
          body: JSON.stringify({ email, type: "forget-password" }),
        });
        const forwardContext: RouteContext = {
          params: Promise.resolve({
            path: ["email-otp", "send-verification-otp"],
          }),
        };
        return handlers.POST(forwardedReq, forwardContext);
      } catch {
        return NextResponse.json(
          { error: "UNAVAILABLE", message: "Password reset request failed" },
          { status: 503, headers: { "Cache-Control": "private, no-store" } },
        );
      }
    }

    return original(request, context);
  };
}

function methodNotAllowedHandler(method: string) {
  return async function () {
    return NextResponse.json(
      {
        error: "METHOD_NOT_ALLOWED",
        message: `Method ${method} is not allowed for auth endpoints.`,
      },
      {
        status: 405,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  };
}

export const GET = wrapHandler("GET");
export const POST = wrapHandler("POST");
export const PUT = methodNotAllowedHandler("PUT");
export const DELETE = methodNotAllowedHandler("DELETE");
export const PATCH = methodNotAllowedHandler("PATCH");
