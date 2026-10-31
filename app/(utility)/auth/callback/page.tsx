import { connection } from "next/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentSession } from "@/lib/auth/server";
import { authFailure, callbackEntry } from "@/lib/site";

import { Skeleton } from "@/components/ui/skeleton";

type Search = Promise<Record<string, string | string[] | undefined>>;

function AuthCallbackSkeleton() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-screen w-full flex-col items-center justify-center p-6 bg-background text-foreground"
    >
      <div className="flex flex-col items-center gap-5 max-w-sm text-center">
        <div className="relative flex items-center justify-center size-14 rounded-2xl bg-muted/60 border border-border/50 shadow-sm animate-pulse">
          <span className="font-rugis text-2xl font-bold tracking-tight text-foreground">
            S
          </span>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-3.5 w-44 rounded" />
        </div>
        <span className="sr-only">SoloDesk…</span>
      </div>
    </main>
  );
}

async function Complete({ searchParams }: { searchParams: Search }) {
  await connection();
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw))
    for (const part of Array.isArray(value)
      ? value
      : value === undefined
        ? []
        : [value])
      params.append(key, part);
  const entry = callbackEntry(params);
  if (
    [...params.keys()].some((key) => key !== "entry") ||
    params.getAll("entry").length > 1
  )
    redirect(authFailure(entry));
  let session;
  try {
    session = await currentSession();
  } catch {
    /* Failed exchanges return only the generic retry marker. */
  }
  if (session?.user) redirect("/app");
  return redirect(authFailure(entry));
}
export default function AuthCallback({
  searchParams,
}: {
  searchParams: Search;
}) {
  return (
    <Suspense fallback={<AuthCallbackSkeleton />}>
      <Complete searchParams={searchParams} />
    </Suspense>
  );
}
