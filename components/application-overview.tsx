"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useApplicationRuntime } from "@/components/application-runtime";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  User,
  ArrowRight,
  Plus,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Users,
  ShieldCheck,
  Globe,
} from "lucide-react";

export function ApplicationOverview() {
  const t = useTranslations("Overview");
  const tWorkspaces = useTranslations("Workspaces");
  const tNav = useTranslations("Navigation");
  const { account, workspaces, selection, capabilities, navigate } =
    useApplicationRuntime();

  const selectedWorkspace =
    selection.state === "ready" ? selection.context?.workspace : null;
  const userRole =
    selection.state === "ready" ? selection.context?.membership?.role : null;
  const initials = (account.name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full py-2 sm:py-4">
      {/* Welcome Hero Header */}
      <div className="flex flex-col gap-2 pb-6 border-b border-border/60">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Sparkles className="size-3.5 text-primary" />
          <span>{tNav("overview")}</span>
        </div>
        <h1 className="break-words text-3xl sm:text-4xl font-semibold tracking-normal text-foreground">
          {t("welcome", { name: account.name || "there" })}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed mt-1">
          {t("description")}
        </p>
      </div>

      {/* Primary Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workspace & Team Card */}
        <Card className="flex flex-col justify-between border-border/80 shadow-xs hover:border-border transition-colors">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold tracking-normal">
                    {t("workspaceCardTitle")}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {t("workspaceCardDesc")}
                  </CardDescription>
                </div>
              </div>
              {userRole && (
                <Badge
                  variant="outline"
                  className="capitalize text-xs font-medium shrink-0 px-2.5 py-0.5"
                >
                  {tWorkspaces(
                    userRole === "owner"
                      ? "roleOwner"
                      : userRole === "admin"
                        ? "roleAdmin"
                        : "roleMember",
                  )}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-6 py-3 flex-1 flex flex-col justify-center">
            {!capabilities.workspacesEnabled ? (
              <Alert className="py-3">
                <ShieldAlert className="size-4 shrink-0" />
                <AlertDescription className="text-xs">
                  {tNav("workspacesDisabled")}
                </AlertDescription>
              </Alert>
            ) : workspaces.state === "unavailable" ? (
              <Alert className="py-3">
                <AlertCircle className="size-4 shrink-0" />
                <AlertDescription className="text-xs">
                  {tWorkspaces("unavailable")}
                </AlertDescription>
              </Alert>
            ) : selectedWorkspace ? (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-semibold text-xs">
                    {selectedWorkspace.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {tWorkspaces("currentWorkspace")}
                    </span>
                    <span className="font-semibold text-sm truncate text-foreground">
                      <bdi>{selectedWorkspace.name}</bdi>
                    </span>
                    <span className="text-xs text-muted-foreground font-mono truncate">
                      /{selectedWorkspace.slug}
                    </span>
                  </div>
                </div>
                {userRole && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 capitalize text-xs"
                  >
                    {tWorkspaces(
                      userRole === "owner"
                        ? "roleOwner"
                        : userRole === "admin"
                          ? "roleAdmin"
                          : "roleMember",
                    )}
                  </Badge>
                )}
              </div>
            ) : workspaces.items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 p-6 text-center flex flex-col items-center justify-center gap-1.5 bg-muted/10">
                <Building2 className="size-8 text-muted-foreground/50 mb-1" />
                <p className="text-xs font-medium text-foreground">
                  {tNav("noAvailableWorkspaces")}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  {t("noWorkspacesDesc")}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    {tWorkspaces("currentWorkspace")}
                  </span>
                  <span className="text-sm font-medium">
                    {tWorkspaces("noWorkspace")}
                  </span>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-6 pt-3">
            {workspaces.items.length === 0 ? (
              <Button
                size="default"
                className="w-full h-10 font-medium"
                render={
                  <Link
                    href="/app/workspace"
                    prefetch={false}
                    onNavigate={(event) => {
                      event.preventDefault();
                      void navigate("/app/workspace");
                    }}
                  />
                }
                nativeButton={false}
                role="link"
              >
                <Plus className="me-2 size-4" />
                {t("createWorkspace")}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="default"
                className="w-full h-10 font-medium justify-between group"
                render={
                  <Link
                    href="/app/workspace"
                    prefetch={false}
                    onNavigate={(event) => {
                      event.preventDefault();
                      void navigate("/app/workspace");
                    }}
                  />
                }
                nativeButton={false}
                role="link"
              >
                <span>{t("goToWorkspace")}</span>
                <ArrowRight className="size-4 transition-transform ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Personal Account Card */}
        <Card className="flex flex-col justify-between border-border/80 shadow-xs hover:border-border transition-colors">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <User className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold tracking-normal">
                  {t("accountCardTitle")}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t("accountCardDesc")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 py-3 flex-1 flex flex-col justify-center">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="size-10 rounded-lg shrink-0">
                  {account.avatar ? (
                    <AvatarImage src={account.avatar} alt={account.name} />
                  ) : null}
                  <AvatarFallback className="rounded-lg text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {t("accountCardTitle")}
                  </span>
                  <span className="font-semibold text-sm truncate text-foreground">
                    {account.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono truncate">
                    {t("accountId")}:{" "}
                    {account.id
                      ? `${account.id.slice(0, 8)}...${account.id.slice(-6)}`
                      : "—"}
                  </span>
                </div>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 text-xs font-medium px-2.5 py-0.5"
              >
                {t("accountActive")}
              </Badge>
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-3">
            <Button
              variant="outline"
              size="default"
              className="w-full h-10 font-medium justify-between group"
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
              nativeButton={false}
              role="link"
            >
              <span>{t("goToAccount")}</span>
              <ArrowRight className="size-4 transition-transform ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link
          href="/app/workspace"
          prefetch={false}
          onNavigate={(event) => {
            event.preventDefault();
            void navigate("/app/workspace");
          }}
          className="rounded-xl border border-border/60 bg-card/40 p-4 hover:bg-card hover:border-border transition-all flex flex-col gap-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tNav("workspaceAndTeam")}
            </span>
            <Users className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {t("workspaceCardTitle")}
          </span>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {t("workspaceCardDesc")}
          </p>
        </Link>

        <Link
          href="/app/account"
          prefetch={false}
          onNavigate={(event) => {
            event.preventDefault();
            void navigate("/app/account");
          }}
          className="rounded-xl border border-border/60 bg-card/40 p-4 hover:bg-card hover:border-border transition-all flex flex-col gap-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tNav("personalAccount")}
            </span>
            <ShieldCheck className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {t("accountCardTitle")}
          </span>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {t("accountCardDesc")}
          </p>
        </Link>

        <Link
          href="/"
          prefetch={false}
          onNavigate={(event) => {
            event.preventDefault();
            void navigate("/");
          }}
          className="rounded-xl border border-border/60 bg-card/40 p-4 hover:bg-card hover:border-border transition-all flex flex-col gap-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tNav("publicSite")}
            </span>
            <Globe className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {tNav("breadcrumbsApp")}
          </span>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {tNav("publicSite")}
          </p>
        </Link>
      </div>
    </div>
  );
}
