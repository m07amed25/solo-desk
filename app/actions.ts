"use server";

import { auth } from "@/lib/auth/server";
import { loadProfile } from "@/lib/profile";

export async function saveProfile(userId: string, name: string): Promise<{error: "invalidName" | "unauthorized" | "saveFailed" | null}> {
  if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
    return { error: "invalidName" };
  }
  try {
    if (!(await loadProfile(userId)))
      return { error: "unauthorized" };
    const result = await auth.updateUser({ name: name.trim() });
    if (result.error)
      return { error: "saveFailed" };
    return { error: null };
  } catch {
    return { error: "saveFailed" };
  }
}
