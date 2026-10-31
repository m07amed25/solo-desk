"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { buttonVariants } from "@/components/ui/button";
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

export function HeaderDesktopAuth({
  signInLabel,
  signUpLabel,
  workspaceLabel,
  signOutLabel = "Sign out",
  initialUser = null,
}: HeaderAuthProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? initialUser;
  const isAuthenticated = Boolean(user);

  if (isPending && !user) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading authentication state"
        className="hidden items-center gap-3 lg:flex"
      >
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="size-8 rounded-full" />
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
            aria-label={user.name || "User menu"}
            className="cursor-pointer rounded-full outline-hidden ring-offset-background transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Avatar>
              {user.image && (
                <AvatarImage
                  src={user.image}
                  alt={user.name || "User avatar"}
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
                    alt={user.name || "User avatar"}
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
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
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
                onClick={async () => {
                  try {
                    await authClient.signOut();
                  } finally {
                    router.push("/");
                    router.refresh();
                  }
                }}
              >
                <LogOut data-icon="inline-start" />
                <span>{signOutLabel}</span>
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
  signOutLabel = "Sign out",
  initialUser = null,
}: HeaderAuthProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? initialUser;
  const isAuthenticated = Boolean(user);

  if (isPending && !user) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading authentication state"
        className="my-2 border-t border-border pt-2 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2.5 h-11 px-3 rounded-lg border border-border/50">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-11 w-full rounded-md" />
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
                alt={user.name || "User avatar"}
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
          onClick={async () => {
            try {
              await authClient.signOut();
            } finally {
              router.push("/");
              router.refresh();
            }
          }}
          className={buttonVariants({
            variant: "ghost",
            size: "lg",
            className: "justify-start text-destructive hover:text-destructive",
          })}
        >
          <LogOut data-icon="inline-start" />
          {signOutLabel}
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
