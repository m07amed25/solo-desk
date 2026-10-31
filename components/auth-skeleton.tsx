import { Skeleton } from "@/components/ui/skeleton";
import type { AuthEntry } from "@/lib/site";
import { cn } from "@/lib/utils";

export interface AuthSkeletonProps {
  entry?: AuthEntry;
  statusText?: string;
  className?: string;
}

/**
 * Skeleton for the inner interactive auth form.
 * Used as a Suspense fallback inside AuthEntryPage, ensuring seamless
 * zero-layout-shift transitions when dynamic auth state resolves.
 */
export function AuthFormSkeleton({
  entry = "sign-in",
  statusText = "Checking your account…",
  className,
}: AuthSkeletonProps) {
  const isSignUp = entry === "sign-up";

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn("flex flex-col gap-7 w-full", className)}
    >
      <span className="sr-only">{statusText}</span>

      <div aria-hidden="true" className="flex flex-col gap-7">
        {/* Heading & description skeleton */}
        <div className="flex flex-col gap-3">
          <Skeleton
            className={cn(
              "h-9 rounded-md",
              isSignUp ? "w-3/4 max-w-[280px]" : "w-2/3 max-w-[240px]",
            )}
          />
          <Skeleton className="h-4 w-5/6 max-w-[340px] rounded" />
        </div>

        {/* Interactive panel skeleton */}
        <div className="flex flex-col gap-5">
          {/* Social login buttons */}
          <div className="flex flex-col gap-3">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>

          {/* "Or continue with email" divider */}
          <div className="relative my-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative bg-background px-3">
              <Skeleton className="h-3.5 w-28 rounded" />
            </div>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-4">
            {isSignUp && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                {!isSignUp && <Skeleton className="h-4 w-24 rounded" />}
              </div>
              <Skeleton className="h-11 w-full rounded-lg" />
              {isSignUp && <Skeleton className="h-3 w-56 rounded mt-1" />}
            </div>

            {/* Submit button */}
            <Skeleton className="h-11 w-full rounded-lg mt-2" />
          </div>
        </div>

        {/* Switch account prompt */}
        <Skeleton className={cn("h-4 rounded", isSignUp ? "w-52" : "w-48")} />

        {/* Policy disclaimer */}
        <div className="flex flex-col gap-1.5 pt-1">
          <Skeleton className="h-3 w-4/5 rounded" />
          <Skeleton className="h-3 w-2/3 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full page skeleton representing the split account layout (form pane + visual preview pane).
 * Suitable for route-level loading.tsx or initial page loads.
 */
export function AuthPageSkeleton({
  entry = "sign-in",
  statusText = "Checking your account…",
}: AuthSkeletonProps) {
  const isSignUp = entry === "sign-up";

  return (
    <main className="account-layout">
      {/* Form region is FIRST in DOM for keyboard and accessibility order */}
      <section className="account-form-pane">
        {/* Top navigation row with Back to home & preferences */}
        <div
          className="flex items-center justify-between w-full"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2 py-1.5 px-2 -mx-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="size-10 rounded-md" />
            <Skeleton className="size-10 rounded-md" />
          </div>
        </div>

        {/* Form Content */}
        <div className="w-full max-w-md mx-auto my-auto py-8 flex flex-col gap-7">
          <AuthFormSkeleton entry={entry} statusText={statusText} />
        </div>

        <div className="w-full max-w-md mx-auto" />
      </section>

      {/* Illustrative visual region is SECOND in DOM */}
      <aside className="account-visual-pane hidden md:flex" aria-hidden="true">
        <div className="account-visual-card">
          <div className="account-visual-content">
            <Skeleton
              className={cn(
                "h-9 rounded-md",
                isSignUp ? "w-3/4 max-w-[280px]" : "w-2/3 max-w-[240px]",
              )}
            />
            <Skeleton className="h-5 w-4/5 max-w-[320px] rounded-md" />
          </div>

          <div className="account-visual-preview">
            <div className="work-preview">
              <div className="preview-topbar">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-5 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <Skeleton className="h-4 w-16 rounded" />
              </div>

              <div className="preview-body">
                <aside className="preview-sidebar" aria-hidden="true">
                  <Skeleton className="size-5 rounded" />
                  <Skeleton className="size-5 rounded" />
                  <Skeleton className="size-5 rounded" />
                </aside>

                <div className="min-w-0 flex-1 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3 pb-4">
                    <Skeleton className="h-6 w-32 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-full rounded" />
                    <Skeleton className="h-8 w-full rounded" />
                    <Skeleton className="h-8 w-full rounded" />
                  </div>

                  <Skeleton className="h-10 w-full rounded-md mt-2" />
                </div>
              </div>
            </div>

            <Skeleton className="h-3 w-56 mx-auto mt-3 rounded" />
          </div>
        </div>
      </aside>
    </main>
  );
}

export interface ProfileSkeletonProps {
  statusText?: string;
  className?: string;
}

/**
 * Skeleton for the account / profile page.
 * Used as a Suspense fallback and during revalidation / checking state,
 * preventing layout shift and empty-screen flashing after sign in.
 */
export function ProfileSkeleton({
  statusText = "Checking your account…",
  className,
}: ProfileSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn("flex flex-col gap-6 w-full", className)}
    >
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary/80" />
        </span>
        <span className="font-medium text-foreground/80">{statusText}</span>
      </div>

      <div aria-hidden="true" className="flex flex-col gap-6">
        {/* Welcome title & live status indicator skeleton */}
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-7 w-48 max-w-[280px] rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-4 w-60 rounded" />
          </div>
        </div>

        {/* Form fields skeleton */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <Skeleton className="h-11 w-32 rounded-lg" />
        </div>

        {/* Memory disclaimer footnote skeleton */}
        <Skeleton className="h-3 w-4/5 max-w-[360px] rounded mt-1" />

        {/* Sign out button skeleton */}
        <Skeleton className="h-11 w-28 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Full page skeleton representing the account page layout.
 * Used for route-level loading.tsx on /app.
 */
export function AccountPageSkeleton({
  statusText = "Checking your account…",
  className,
}: ProfileSkeletonProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {/* Top site header skeleton bar */}
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Skeleton className="h-8 w-32 rounded-md" />
          <div className="hidden lg:flex items-center gap-6">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main
        className="mx-auto flex min-h-[70svh] w-full max-w-lg flex-col justify-center gap-8 px-6 py-12"
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">{statusText}</span>
        <div aria-hidden="true" className="flex flex-col gap-8">
          <Skeleton className="h-9 w-44 rounded-md" />
          <ProfileSkeleton statusText={statusText} />
        </div>
      </main>
    </div>
  );
}
