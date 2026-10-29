import { loadProfile } from "@/lib/profile";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const ids = new URL(request.url).searchParams.getAll("userId");
    const expectedUserId = ids[0];
    if (ids.length !== 1 || !expectedUserId)
      return Response.json(
        { error: "User required" },
        { status: 400, headers },
      );
    const profile = await loadProfile(expectedUserId);
    if (!profile)
      return Response.json({ error: "Unauthorized" }, { status: 401, headers });
    return Response.json(profile, { headers });
  } catch {
    return Response.json(
      { error: "Profile unavailable. Please retry." },
      { status: 503, headers },
    );
  }
}
