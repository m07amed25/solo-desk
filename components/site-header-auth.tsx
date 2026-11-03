"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, LogOut } from "lucide-react";

export type AuthUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type HeaderAuthProps = {
  signInLabel: string;
  signUpLabel: string;
  workspaceLabel: string;
  signOutLabel?: string;
  initialUser?: AuthUser | null;
};

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return "U";
}

type HeaderAuthState = {
  user: AuthUser | null;
  pending: boolean;
  unavailable: boolean;
  signOut: () => Promise<void>;
};
const HeaderAuthContext = createContext<HeaderAuthState | null>(null);

export function HeaderAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending, error } = authClient.useSession();
  const [state, setState] = useState<"idle" | "pending" | "unknown">("idle");
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function signOut() {
    if (busy.current) return;
    busy.current = true;
    setState("pending");
    try {
      const result = await authClient.signOut({
        fetchOptions: { timeout: 15000 },
      });
      if (result?.error || result?.data?.success !== true)
        throw new Error("Unconfirmed");
      if (!mounted.current) return;
      router.push("/");
      router.refresh();
    } catch {
      if (mounted.current) setState("unknown");
    } finally {
      busy.current = false;
    }
  }
  return (
    <HeaderAuthContext.Provider
      value={{
        user:
          !isPending && !error && state === "idle"
            ? (session?.user ?? null)
            : null,
        pending: Boolean(isPending) || state === "pending",
        unavailable: Boolean(error) || state === "unknown",
        signOut,
      }}
    >
      {children}
    </HeaderAuthContext.Provider>
  );
}

function HeaderAuthStatus() {
  const t = useTranslations("Navigation");
  const auth = useContext(HeaderAuthContext)!;
  if (auth.unavailable)
    return (
      <Alert className="max-w-sm text-start">
        <AlertDescription>{t("signOutUncertain")}</AlertDescription>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="lg" onClick={() => void auth.signOut()}>
            {t("retrySignOut")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            {t("checkAccount")}
          </Button>
        </div>
      </Alert>
    );
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("loadingAuth")}
      className="flex items-center gap-3"
    >
      <Skeleton className="h-9 w-28 rounded-md" />
      <Skeleton className="size-8 rounded-full" />
    </div>
  );
}

export function HeaderDesktopAuth({
  signInLabel,
  signUpLabel,
  workspaceLabel,
  signOutLabel,
}: HeaderAuthProps) {
  const t = useTranslations("Navigation");
  const { user, pending, unavailable, signOut } =
    useContext(HeaderAuthContext)!;
  const isAuthenticated = Boolean(user);

  if (pending || unavailable) {
    return (
      <div className="hidden lg:flex">
        <HeaderAuthStatus />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="hidden items-center gap-3 lg:flex">
        <a href="/app" className={buttonVariants({ variant: "outline" })}>
          {workspaceLabel}
        </a>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={t("userMenu")}
            className="cursor-pointer rounded-full outline-hidden ring-offset-background transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Avatar>
              {user.image && (
                <AvatarImage
                  src={user.image}
                  alt={t("userAvatar")}
                  referrerPolicy="no-referrer"
                />
              )}
              <AvatarFallback>
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-56">
            <div className="flex items-center gap-2.5 p-2">
              <Avatar size="sm">
                {user.image && (
                  <AvatarImage
                    src={user.image}
                    alt={t("userAvatar")}
                    referrerPolicy="no-referrer"
                  />
                )}
                <AvatarFallback>
                  {getInitials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                {user.name && (
                  <span className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                )}
                {user.email && (
                  <bdi className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </bdi>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<a href="/app" className="cursor-pointer" />}
              >
                <LayoutDashboard data-icon="inline-start" />
                <span>{workspaceLabel}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={signOut}
              >
                <LogOut data-icon="inline-start" />
                <span>{signOutLabel ?? t("signOut")}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <a
        href="/sign-in"
        className={buttonVariants({ variant: "ghost", size: "lg" })}
      >
        {signInLabel}
      </a>
      <a href="/sign-up" className={buttonVariants({ size: "lg" })}>
        {signUpLabel}
      </a>
    </div>
  );
}

export function HeaderMobileAuth({
  signInLabel,
  signUpLabel,
  workspaceLabel,
  signOutLabel,
}: HeaderAuthProps) {
  const t = useTranslations("Navigation");
  const { user, pending, unavailable, signOut } =
    useContext(HeaderAuthContext)!;
  const isAuthenticated = Boolean(user);

  if (pending || unavailable) {
    return (
      <div className="my-2 flex flex-col gap-2">
        <HeaderAuthStatus />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="my-2 border-t border-border pt-2 flex flex-col gap-2">
        <a
          href="/app"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          <Avatar size="sm">
            {user.image && (
              <AvatarImage
                src={user.image}
                alt={t("userAvatar")}
                referrerPolicy="no-referrer"
              />
            )}
            <AvatarFallback>
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          {workspaceLabel}
        </a>
        <button
          type="button"
          onClick={signOut}
          className={buttonVariants({
            variant: "ghost",
            size: "lg",
            className: "justify-start text-destructive hover:text-destructive",
          })}
        >
          <LogOut data-icon="inline-start" />
          {signOutLabel ?? t("signOut")}
        </button>
      </div>
    );
  }

  return (
    <div className="my-2 border-t border-border pt-2 flex flex-col gap-2">
      <a
        href="/sign-in"
        className={buttonVariants({ variant: "outline", size: "lg" })}
      >
        {signInLabel}
      </a>
      <a href="/sign-up" className={buttonVariants({ size: "lg" })}>
        {signUpLabel}
      </a>
    </div>
  );
}
