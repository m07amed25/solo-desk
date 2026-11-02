"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { NavUser } from "@/components/nav-user";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { WorkspaceInvitation } from "@/components/workspace-invitation";
import { useApplicationRuntime } from "@/components/application-runtime";
import {
  LayoutDashboard,
  Building2,
  User,
  Languages,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";

export function ApplicationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const { isMobile, setOpenMobile } = useSidebar();

  const { account, signOut, isAnyFormDirty, confirmNavigationDiscard } =
    useApplicationRuntime();

  // Determine current active destination
  const activePath = pathname.endsWith("/workspace")
    ? "/app/workspace"
    : pathname.endsWith("/account")
      ? "/app/account"
      : "/app";

  const navItems = [
    {
      title: t("overview"),
      href: "/app",
      icon: LayoutDashboard,
      isActive: activePath === "/app",
    },
    {
      title: t("workspaceAndTeam"),
      href: "/app/workspace",
      icon: Building2,
      isActive: activePath === "/app/workspace",
    },
    {
      title: t("personalAccount"),
      href: "/app/account",
      icon: User,
      isActive: activePath === "/app/account",
    },
  ];

  // Intercept in-app navigation if forms are dirty
  const handleNavClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    // Let browser handle new tab / modified click
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (href === activePath) {
      e.preventDefault();
      return;
    }

    if (isAnyFormDirty()) {
      e.preventDefault();
      const confirmed = await confirmNavigationDiscard();
      if (!confirmed) return;
    }

    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const currentItem = navItems.find((item) => item.isActive) || navItems[0];

  // Preference switches
  const nextLocale = locale === "ar" ? "en" : "ar";
  const [theme, setTheme] = React.useState<"dark" | "light" | "system">("dark");

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const currentTheme = document.documentElement.getAttribute(
        "data-theme",
      ) as "dark" | "light" | "system" | null;
      if (currentTheme) {
        queueMicrotask(() => setTheme(currentTheme));
      }
    }
  }, []);

  const nextTheme =
    theme === "dark" ? "light" : theme === "light" ? "system" : "dark";

  const handlePreferenceSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    if (isAnyFormDirty()) {
      const confirmed = await confirmNavigationDiscard();
      if (!confirmed) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="flex min-h-svh w-full flex-1">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring"
      >
        {t("skip")}
      </a>

      {/* Application Sidebar: Starts from top of screen */}
      <Sidebar collapsible="icon" side={locale === "ar" ? "right" : "left"}>
        <SidebarHeader className="p-2 border-b border-sidebar-border">
          <WorkspaceSwitcher />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="px-2 py-3">
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-2 group-data-[collapsible=icon]:hidden">
              {t("overview")}
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-1">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      render={
                        <Link
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          aria-current={item.isActive ? "page" : undefined}
                        />
                      }
                      isActive={item.isActive}
                      className="gap-3 px-3 py-2 text-sm font-medium"
                      aria-label={item.title}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-2 border-t border-sidebar-border">
          <NavUser
            user={{
              name: account.name,
              avatar: account.avatar,
            }}
            onSignOut={signOut}
          />
        </SidebarFooter>
      </Sidebar>

      {/* Main Content Inset (Shell starts from end of sidebar) */}
      <SidebarInset id="main-content">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur-sm px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink
                    render={
                      <Link
                        href="/app"
                        onClick={(e) => handleNavClick(e, "/app")}
                      />
                    }
                  >
                    {t("breadcrumbsApp")}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentItem.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Preferences: Language & Theme controls */}
          <div className="flex items-center gap-1.5">
            <form
              action="/api/preferences"
              method="post"
              onSubmit={handlePreferenceSubmit}
            >
              <input type="hidden" name="returnTo" value={activePath} />
              <input type="hidden" name="locale" value={nextLocale} />
              <input type="hidden" name="theme" value={theme} />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={t("switchLanguage", {
                  language: nextLocale === "ar" ? "العربية" : "English",
                })}
                title={t("switchLanguage", {
                  language: nextLocale === "ar" ? "العربية" : "English",
                })}
              >
                <Languages className="size-4" aria-hidden="true" />
              </Button>
            </form>

            <form
              action="/api/preferences"
              method="post"
              onSubmit={handlePreferenceSubmit}
            >
              <input type="hidden" name="returnTo" value={activePath} />
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="theme" value={nextTheme} />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={t("switchTheme", {
                  current: t(theme),
                  next: t(nextTheme),
                })}
                title={t("switchTheme", {
                  current: t(theme),
                  next: t(nextTheme),
                })}
              >
                {theme === "dark" ? (
                  <Moon className="size-4" aria-hidden="true" />
                ) : theme === "light" ? (
                  <Sun className="size-4" aria-hidden="true" />
                ) : (
                  <Laptop className="size-4" aria-hidden="true" />
                )}
              </Button>
            </form>
          </div>
        </header>

        <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 min-w-0">
          <WorkspaceInvitation />
          {children}
        </div>
      </SidebarInset>
    </div>
  );
}
