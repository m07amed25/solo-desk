import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET!, sessionDataTtl: 1 },
});

// Fresh session authority shared by pages and the profile service; never shared-cached.
export async function currentSession() {
  const {data: session, error} = await auth.getSession({query: {disableCookieCache: "true"}});
  if (error) throw new Error("Authentication unavailable");
  const expiry = session?.session && new Date(session.session.expiresAt).getTime();
  return session?.user && expiry && expiry > Date.now() ? session : null;
}
