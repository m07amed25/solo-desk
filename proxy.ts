import { NextResponse, type NextRequest } from "next/server";
import {
  authFailure,
  callbackEntry,
  isReturnPath,
  presentation,
  isLocale,
} from "@/lib/site";

function privateResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  const vary = response.headers.get("Vary");
  response.headers.set("Vary", vary ? `${vary}, Cookie` : "Cookie");
  return response;
}

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/design-system") return NextResponse.next();
  if (path === "/auth/callback") {
    const entry = callbackEntry(request.nextUrl.searchParams);
    const failureUrl = `${authFailure(entry)}#`;
    try {
      const { auth } = await import("@/lib/auth/server");
      return privateResponse(
        await auth.middleware({
          loginUrl: failureUrl,
        })(request),
      );
    } catch {
      return privateResponse(
        NextResponse.redirect(new URL(failureUrl, request.url)),
      );
    }
  }
  if (!isReturnPath(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/_not-found";
    url.search = "";
    return privateResponse(NextResponse.rewrite(url, { status: 404 }));
  }

  const browserLocale = request.cookies.get("solodesk-locale")?.value;
  const browserTheme = request.cookies.get("solodesk-theme")?.value;

  const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];
  let resolvedLocale: "en" | "ar" = "en";

  // Precedence rule: Browser choice wins; if absent, resolve account preference; otherwise English
  if (isLocale(browserLocale)) {
    resolvedLocale = browserLocale;
  } else {
    try {
      const { createAuthServer } = await import("@neondatabase/auth/server");
      const authServer = createAuthServer({
        baseUrl:
          process.env.NEON_AUTH_BASE_URL || "https://auth.solodesk.invalid",
        cookieSecret: process.env.NEON_AUTH_COOKIE_SECRET || "0".repeat(32),
        sessionDataTtl: 1,
        context: async () => ({
          getCookies: async () => request.headers.get("cookie") || "",
          getHeader: (name: string) => request.headers.get(name),
          getOrigin: async () => request.nextUrl.origin,
          getFramework: () => "nextjs-proxy",
          setCookie: async (name: string, value: string, options: any) => {
            cookiesToSet.push({ name, value, options });
          },
        }),
      });

      const sessionResult = await authServer.getSession();
      const userId = sessionResult?.data?.user?.id;
      const { resolvePresentationLocale } =
        await import("@/lib/account-locale");
      resolvedLocale = await resolvePresentationLocale(null, userId);
    } catch {
      resolvedLocale = "en";
    }
  }

  const { locale, theme } = presentation(resolvedLocale, browserTheme);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}/${theme}${path === "/" ? "" : path}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);
  const response = privateResponse(
    NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    }),
  );

  // Preserve renewal/deletion cookies from request-context auth server
  for (const c of cookiesToSet) {
    response.cookies.set(c.name, c.value, c.options);
  }

  return response;
}

export const config = {
  matcher: [
    // Keep framework/API requests and existing public assets out of presentation routing.
    "/((?!api(?:/|$)|_next(?:/|$)|fonts/(?:rugis\\.(?:otf|ttf)|DG-Sahabah-Reg\\.ttf)$|auth/architecture\\.webp$|[^/]+\\.[^/]+$).*)",
  ],
};
