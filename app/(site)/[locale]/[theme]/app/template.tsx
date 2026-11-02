import React, { Suspense } from "react";
import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getCachedApplicationContext,
  ApplicationError,
} from "@/lib/application";
import { isAppDestination } from "@/lib/site";
import { ApplicationRuntime } from "@/components/application-runtime";
import { AppShellSkeleton } from "@/components/auth-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

async function AuthenticatedAppRuntime({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const headerStore = await headers();
  const currentPath = headerStore.get("x-pathname") || "/app";

  let context;
  try {
    context = await getCachedApplicationContext();
  } catch (err) {
    if (
      (err instanceof ApplicationError && err.statusHttp === 401) ||
      (err &&
        typeof err === "object" &&
        (err as { statusHttp?: number }).statusHttp === 401)
    ) {
      const returnParam =
        isAppDestination(currentPath) && currentPath !== "/app"
          ? `?returnTo=${encodeURIComponent(currentPath)}#`
          : "#";
      redirect(`/sign-in${returnParam}`);
    }

    return (
      <div className="flex min-h-[50svh] items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertDescription>
            SoloDesk is temporarily unavailable.{" "}
            <a href={currentPath} className="underline font-medium">
              Retry
            </a>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!context) {
    redirect("/sign-in#");
  }

  return (
    <ApplicationRuntime initialContext={context}>{children}</ApplicationRuntime>
  );
}

export default function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <AuthenticatedAppRuntime>{children}</AuthenticatedAppRuntime>
    </Suspense>
  );
}
