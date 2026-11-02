"use client";

import Link from "next/link";
import { useApplicationRuntime } from "@/components/application-runtime";
import { useLocale, useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChevronsUpDownIcon,
  UserIcon,
  GlobeIcon,
  LogOutIcon,
} from "lucide-react";

export function NavUser({
  user,
  onSignOut,
}: {
  user: {
    name: string;
    email?: string | null;
    avatar?: string | null;
  };
  onSignOut?: () => Promise<void> | void;
}) {
  const { isMobile } = useSidebar();
  const locale = useLocale();
  const { navigate, accountState, teamEpoch } = useApplicationRuntime();
  const t = useTranslations("Navigation");
  const initials = (user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu key={`${accountState}:${teamEpoch}`}>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                tooltip={user.name}
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                aria-label={user.name}
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate font-medium">
                <bdi>{user.name}</bdi>
              </span>
              {user.email ? (
                <span className="truncate text-xs text-muted-foreground">
                  <bdi>{user.email}</bdi>
                </span>
              ) : null}
            </div>
            <ChevronsUpDownIcon className="ms-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-app-private-overlay=""
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : locale === "ar" ? "left" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                  <Avatar className="size-8 rounded-lg">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-medium">
                      <bdi>{user.name}</bdi>
                    </span>
                    {user.email ? (
                      <span className="truncate text-xs text-muted-foreground">
                        <bdi>{user.email}</bdi>
                      </span>
                    ) : null}
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link
                    href="/app/account"
                    prefetch={false}
                    onNavigate={(event) => {
                      event.preventDefault();
                      void navigate("/app/account");
                    }}
                  />
                }
              >
                <UserIcon className="size-4" />
                <span>{t("personalAccount")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={
                  <Link
                    href="/"
                    prefetch={false}
                    onNavigate={(event) => {
                      event.preventDefault();
                      void navigate("/");
                    }}
                  />
                }
              >
                <GlobeIcon className="size-4" />
                <span>{t("publicSite")}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  if (onSignOut) {
                    onSignOut();
                  }
                }}
              >
                <LogOutIcon className="size-4" />
                <span>{t("signOut")}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
