"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApplicationRuntime } from "@/components/application-runtime";
import {
  Building2,
  ChevronsUpDown,
  Check,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";

export function WorkspaceSwitcher() {
  const t = useTranslations("Workspaces");
  const tNav = useTranslations("Navigation");
  const {
    workspaces,
    selection,
    capabilities,
    switchWorkspace,
    loadNextWorkspacePage,
  } = useApplicationRuntime();

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);

  if (!capabilities.workspacesEnabled) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
        <Building2 className="size-4 shrink-0" />
        <span className="truncate">{tNav("workspacesDisabled")}</span>
      </div>
    );
  }

  if (workspaces.state === "unavailable") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-destructive">
        <AlertCircle className="size-4 shrink-0" />
        <span className="truncate">{tNav("workspacesUnavailable")}</span>
      </div>
    );
  }

  const activeWorkspace =
    workspaces.items.find((w) => w.id === selection.selectedId) ||
    (selection.context
      ? {
          id: selection.context.workspace.id,
          name: selection.context.workspace.name,
          role: selection.context.membership.role,
          slug: selection.context.workspace.slug,
          revision: selection.context.workspace.revision,
        }
      : null);

  const displayName = activeWorkspace
    ? activeWorkspace.name
    : workspaces.items.length === 0
      ? tNav("noAvailableWorkspaces")
      : t("noWorkspace");

  const handleSelect = async (workspaceId: string) => {
    if (workspaceId === selection.selectedId) return;
    setIsSwitching(workspaceId);
    try {
      await switchWorkspace(workspaceId);
    } finally {
      setIsSwitching(null);
    }
  };

  const handleLoadMore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingMore(true);
    try {
      await loadNextWorkspacePage();
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                aria-label={tNav("workspaceSwitcher")}
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-semibold text-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{displayName}</span>
              {activeWorkspace?.role && (
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {activeWorkspace.role}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-64 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t("title")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {workspaces.items.length === 0 ? (
                <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                  {tNav("noAvailableWorkspaces")}
                </div>
              ) : (
                workspaces.items.map((workspace) => {
                  const isSelected = workspace.id === selection.selectedId;
                  const isCurrentSwitching = isSwitching === workspace.id;

                  return (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => handleSelect(workspace.id)}
                      className="flex items-center justify-between gap-2 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-medium">
                          {workspace.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate font-medium">
                          {workspace.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 capitalize"
                        >
                          {workspace.role}
                        </Badge>
                        {isCurrentSwitching ? (
                          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                        ) : isSelected ? (
                          <Check className="size-3.5 text-primary" />
                        ) : null}
                      </div>
                    </DropdownMenuItem>
                  );
                })
              )}
            </DropdownMenuGroup>

            {workspaces.nextCursor && (
              <>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs justify-center"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore && (
                      <Loader2 className="mr-1.5 size-3 animate-spin" />
                    )}
                    {isLoadingMore ? tNav("loadingMore") : tNav("loadMore")}
                  </Button>
                </div>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/app/workspace" />}>
                <Plus className="size-4" />
                <span>{t("createTitle")}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
