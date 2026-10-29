import { connection } from "next/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth/server";
import { authFailure, callbackEntry } from "@/lib/site";

type Search = Promise<Record<string, string | string[] | undefined>>;
async function Complete({searchParams}: {searchParams: Search}) {
  await connection();
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) for (const part of Array.isArray(value) ? value : value === undefined ? [] : [value]) params.append(key, part);
  const entry = callbackEntry(params);
  if ([...params.keys()].some((key) => key !== "entry") || params.getAll("entry").length > 1) redirect(authFailure(entry));
  let session;
  try {
    session = await currentSession();
  } catch { /* Failed exchanges return only the generic retry marker. */ }
  if (session?.user) redirect("/app");
  return redirect(authFailure(entry));
}
export default function AuthCallback({searchParams}: {searchParams: Search}) {
  return <Suspense fallback={<p role="status">SoloDesk…</p>}><Complete searchParams={searchParams} /></Suspense>;
}
