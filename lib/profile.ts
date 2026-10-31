import "server-only";
import { createRealtime, rawSql } from "@neon/realtime/server";
import { currentSession } from "@/lib/auth/server";
import { db } from "@/lib/db";

export type Profile = { id: string; name: string };

const profileSql = `SELECT u.id, u.name FROM neon_auth."user" u
  JOIN neon_auth.session s ON s."userId" = u.id
  WHERE u.id = $1::uuid AND s.id = $2::uuid AND u.banned IS NOT TRUE
  AND u."emailVerified" IS TRUE
  AND s."expiresAt" > CURRENT_TIMESTAMP LIMIT 1`;

export async function loadProfile(expectedUserId?: string) {
  if (
    expectedUserId !== undefined &&
    (typeof expectedUserId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        expectedUserId,
      ))
  )
    return null;
  const session = await currentSession();
  if (!session?.user || session.user.emailVerified !== true || (expectedUserId && expectedUserId !== session.user.id))
    return null;

  const expiresAt = new Date(session.session.expiresAt);
  if (
    !Number.isFinite(expiresAt.getTime()) ||
    expiresAt.getTime() <= Date.now()
  )
    return null;
  const params = [session.user.id, session.session.id];
  const { rows } = await db.query<Profile>(profileSql, params);
  if (!rows.length) return null;

  const realtime = createRealtime({
    secret: process.env.NEON_REALTIME_SECRET!,
    db: new URL(process.env.DATABASE_URL!).pathname.slice(1),
  });

  return {
    userId: session.user.id,
    sessionExpiresAt: expiresAt.toISOString(),
    initialData: rows,
    sealedQuery: await realtime.seal({
      query: rawSql<Profile>(profileSql, params),
    }),
  };
}
