import { NextResponse, type NextRequest } from "next/server";
import {
  authFailure,
  callbackEntry,
  isReturnPath,
  presentation,
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
    try {
      const { auth } = await import("@/lib/auth/server");
      return privateResponse(
        await auth.middleware({
          loginUrl: authFailure(callbackEntry(request.nextUrl.searchParams)),
        })(request),
      );
    } catch {
      return privateResponse(
        NextResponse.redirect(
          new URL(
            authFailure(callbackEntry(request.nextUrl.searchParams)),
            request.url,
          ),
        ),
      );
    }
  }
  if (!isReturnPath(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/_not-found";
    url.search = "";
    return privateResponse(NextResponse.rewrite(url, { status: 404 }));
  }
  const { locale, theme } = presentation(
    request.cookies.get("solodesk-locale")?.value,
    request.cookies.get("solodesk-theme")?.value,
  );
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}/${theme}${path === "/" ? "" : path}`;
  return privateResponse(NextResponse.rewrite(url));
}

export const config = {
  matcher: [
    // Keep framework/API requests and existing public assets out of presentation routing.
    "/((?!api(?:/|$)|_next(?:/|$)|fonts/(?:rugis\\.(?:otf|ttf)|DG-Sahabah-Reg\\.ttf)$|auth/architecture\\.webp$|[^/]+\\.[^/]+$).*)",
  ],
};
