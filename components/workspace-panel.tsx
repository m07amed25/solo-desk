"use client";

import { useState, useTransition, useId, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Building2,
  Plus,
  Settings,
  Loader2,
  Check,
  AlertCircle,
  UserPlus,
  Users,
  LogOut,
  RotateCw,
  Trash2,
  ArrowRightLeft,
  Shield,
  Crown,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  createWorkspaceAction,
  updateWorkspaceSettingsAction,
  selectWorkspaceAction,
  issueWorkspaceInvitationAction,
  resendWorkspaceInvitationAction,
  revokeWorkspaceInvitationAction,
  changeMemberRoleAction,
  removeMemberAction,
  leaveWorkspaceAction,
  transferOwnershipAction,
  listWorkspaceInvitationsAction,
  listWorkspaceMembersAction,
} from "@/app/workspace-actions";
import type {
  WorkspaceContext,
  WorkspaceListItem,
  WorkspaceRole,
} from "@/lib/workspaces";

type WorkspacesTranslator = ReturnType<typeof useTranslations<"Workspaces">>;

function getRoleLabel(role: string, t: WorkspacesTranslator): string {
  switch (role) {
    case "owner":
      return t("roleOwner");
    case "admin":
      return t("roleAdmin");
    case "member":
      return t("roleMember");
    default:
      return role;
  }
}

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

function getErrorMessage(
  errorKey: string,
  t: WorkspacesTranslator,
  fallback: string,
): string {
  switch (errorKey) {
    case "invalidName":
      return t("errors.invalidName");
    case "invalidSlug":
      return t("errors.invalidSlug");
    case "slugUnavailable":
      return t("errors.slugUnavailable");
    case "revisionConflict":
      return t("errors.revisionConflict");
    case "forbidden":
      return t("errors.forbidden");
    default:
      return t("errors.generic") || fallback;
  }
}

interface WorkspacePanelProps {
  initialContext: WorkspaceContext | null;
  initialWorkspaces: WorkspaceListItem[];
  workspacesEnabled: boolean;
}

export function WorkspacePanel({
  initialContext,
  initialWorkspaces,
  workspacesEnabled,
}: WorkspacePanelProps) {
  const t = useTranslations("Workspaces");

  const [currentWs, setCurrentWs] = useState<WorkspaceContext | null>(
    initialContext,
  );
  const [workspaces, setWorkspaces] =
    useState<WorkspaceListItem[]>(initialWorkspaces);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Creation form state
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createTz, setCreateTz] = useState("UTC");
  const [createLocale, setCreateLocale] = useState<"en" | "ar">("en");
  const [createCurrency, setCreateCurrency] = useState("USD");

  // Settings form state
  const [settingsName, setSettingsName] = useState(
    currentWs?.workspace.name || "",
  );
  const [settingsTz, setSettingsTz] = useState(
    currentWs?.workspace.timezone || "UTC",
  );
  const [settingsLocale, setSettingsLocale] = useState<"en" | "ar">(
    currentWs?.workspace.locale || "en",
  );
  const [settingsCurrency, setSettingsCurrency] = useState(
    currentWs?.workspace.currency || "USD",
  );

  // Invitation form & list state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [invitations, setInvitations] = useState<
    Array<{
      id: string;
      recipientEmail: string;
      role: string;
      status: string;
      generation: number;
      expiresAt: string;
      createdAt: string;
      revision: string;
    }>
  >([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  // Members list state
  const [members, setMembers] = useState<
    Array<{
      id: string;
      userId: string;
      name?: string | null;
      email?: string | null;
      role: string;
      status: string;
      revision: string;
      createdAt: string;
    }>
  >([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [confirmTransferTarget, setConfirmTransferTarget] = useState<{
    id: string;
    userId: string;
    name?: string | null;
    email?: string | null;
    revision: string;
  } | null>(null);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const createNameId = useId();
  const createSlugId = useId();
  const createTzId = useId();
  const createLocaleId = useId();
  const createCurrencyId = useId();

  const settingsNameId = useId();
  const settingsTzId = useId();
  const settingsLocaleId = useId();
  const settingsCurrencyId = useId();

  const inviteEmailId = useId();
  const inviteRoleId = useId();

  const canEditSettings =
    currentWs?.capabilities.includes("workspace.settings.update") ?? false;
  const canInvite =
    currentWs?.capabilities.includes("workspace.invites.manage") ?? false;
  const canReadMembers =
    currentWs?.capabilities.includes("workspace.members.read") ?? false;
  const canChangeRole =
    currentWs?.capabilities.includes("workspace.members.role.change") ?? false;
  const canRemoveMember =
    currentWs?.capabilities.includes("workspace.members.remove") ?? false;
  const canTransferOwnership =
    currentWs?.capabilities.includes("workspace.ownership.transfer") ?? false;
  const canLeave =
    currentWs?.capabilities.includes("workspace.members.leave") ?? false;

  useEffect(() => {
    let active = true;
    const wsId = currentWs?.workspace.id;
    if (workspacesEnabled && wsId) {
      if (canInvite) {
        listWorkspaceInvitationsAction(wsId).then((res) => {
          if (active && res.success) {
            setInvitations(res.data);
          }
        });
      }
      if (canReadMembers) {
        listWorkspaceMembersAction(wsId).then((res) => {
          if (active && res.success) {
            setMembers(res.data);
          }
        });
      }
    }
    return () => {
      active = false;
    };
  }, [workspacesEnabled, currentWs?.workspace.id, canInvite, canReadMembers]);

  if (!workspacesEnabled) {
    return null;
  }

  const loadInvitations = async (wsId: string) => {
    setLoadingInvitations(true);
    const res = await listWorkspaceInvitationsAction(wsId);
    if (res.success) {
      setInvitations(res.data);
    }
    setLoadingInvitations(false);
  };

  const loadMembers = async (wsId: string) => {
    setLoadingMembers(true);
    const res = await listWorkspaceMembersAction(wsId);
    if (res.success) {
      setMembers(res.data);
    }
    setLoadingMembers(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const operationId = crypto.randomUUID();
      const res = await createWorkspaceAction({
        operationId,
        name: createName,
        slug: createSlug,
        timezone: createTz,
        locale: createLocale,
        currency: createCurrency,
      });

      if (!res.success) {
        const errorKey = res.fields?.name
          ? "invalidName"
          : res.fields?.slug
            ? "invalidSlug"
            : res.error === "SLUG_UNAVAILABLE"
              ? "slugUnavailable"
              : "generic";
        setStatusMessage({
          type: "error",
          text: getErrorMessage(errorKey, t, res.message),
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("createdSuccess") });
      setIsCreating(false);
      setCreateName("");
      setCreateSlug("");

      const newWsItem: WorkspaceListItem = {
        id: res.data.workspaceId,
        name: createName.trim(),
        slug: createSlug.trim(),
        role: "owner",
        revision: res.data.revision,
      };
      setWorkspaces((prev) => [newWsItem, ...prev]);

      await selectWorkspaceAction(res.data.workspaceId);
      window.location.reload();
    });
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWs) return;
    setStatusMessage(null);

    startTransition(async () => {
      const operationId = crypto.randomUUID();
      const res = await updateWorkspaceSettingsAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        expectedRevision: currentWs.workspace.revision,
        name: settingsName,
        timezone: settingsTz,
        locale: settingsLocale,
        currency: settingsCurrency,
      });

      if (!res.success) {
        const errorKey =
          res.error === "REVISION_CONFLICT"
            ? "revisionConflict"
            : res.error === "FORBIDDEN"
              ? "forbidden"
              : res.fields?.name
                ? "invalidName"
                : "generic";
        setStatusMessage({
          type: "error",
          text: getErrorMessage(errorKey, t, res.message),
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("updatedSuccess") });
      setIsEditing(false);
      setCurrentWs((prev) =>
        prev
          ? {
              ...prev,
              workspace: {
                ...prev.workspace,
                name: settingsName.trim(),
                timezone: settingsTz,
                locale: settingsLocale,
                currency: settingsCurrency,
                revision: res.data.revision,
              },
            }
          : null,
      );
    });
  };

  const handleSelect = (workspaceId: string) => {
    setStatusMessage(null);
    startTransition(async () => {
      const res = await selectWorkspaceAction(workspaceId);
      if (!res.success) {
        setStatusMessage({
          type: "error",
          text: t("errors.generic"),
        });
        return;
      }
      setStatusMessage({ type: "success", text: t("switchedSuccess") });
      window.location.reload();
    });
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWs) return;
    setStatusMessage(null);

    startTransition(async () => {
      const operationId = crypto.randomUUID();
      const res = await issueWorkspaceInvitationAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        expectedRevision: currentWs.workspace.revision,
        recipientEmail: inviteEmail,
        role: inviteRole,
      });

      if (!res.success) {
        const errorKey =
          res.error === "FORBIDDEN"
            ? "forbidden"
            : res.error === "RATE_LIMITED"
              ? "generic"
              : "generic";
        setStatusMessage({
          type: "error",
          text: getErrorMessage(errorKey, t, res.message),
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("inviteSentSuccess") });
      setInviteEmail("");
      loadInvitations(currentWs.workspace.id);
    });
  };

  const handleResendInvite = (invitationId: string, revision: string) => {
    if (!currentWs) return;
    setStatusMessage(null);

    startTransition(async () => {
      const operationId = crypto.randomUUID();
      const res = await resendWorkspaceInvitationAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        invitationId,
        expectedInvitationRevision: revision,
      });

      if (!res.success) {
        setStatusMessage({
          type: "error",
          text: res.message || t("errors.generic"),
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("resentSuccess") });
      loadInvitations(currentWs.workspace.id);
    });
  };

  const handleRevokeInvite = (invitationId: string, revision: string) => {
    if (!currentWs) return;
    setStatusMessage(null);

    startTransition(async () => {
      const operationId = crypto.randomUUID();
      const res = await revokeWorkspaceInvitationAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        invitationId,
        expectedInvitationRevision: revision,
      });

      if (!res.success) {
        setStatusMessage({
          type: "error",
          text: res.message || t("errors.generic"),
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("revokedSuccess") });
      loadInvitations(currentWs.workspace.id);
    });
  };

  const handleChangeMemberRole = (
    membershipId: string,
    revision: string,
    newRole: WorkspaceRole,
  ) => {
    if (!currentWs) return;
    setStatusMessage(null);

    startTransition(async () => {
      const operationId = crypto.randomUUID();
      const res = await changeMemberRoleAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        membershipId,
        expectedMembershipRevision: revision,
        role: newRole,
      });

      if (!res.success) {
        const errorText =
          res.error === "REAUTH_REQUIRED"
            ? t("reauthRequired")
            : res.error === "LAST_OWNER"
              ? t("lastOwnerError")
              : res.message || t("errors.generic");
        setStatusMessage({
          type: "error",
          text: errorText,
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("roleChangedSuccess") });
      loadMembers(currentWs.workspace.id);
    });
  };

  const handleRemoveMember = (membershipId: string, revision: string) => {
    if (!currentWs) return;
    setStatusMessage(null);

    startTransition(async () => {
      const operationId = crypto.randomUUID();
      const res = await removeMemberAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        membershipId,
        expectedMembershipRevision: revision,
      });

      if (!res.success) {
        const errorText =
          res.error === "LAST_OWNER"
            ? t("lastOwnerError")
            : res.message || t("errors.generic");
        setStatusMessage({
          type: "error",
          text: errorText,
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("memberRemovedSuccess") });
      loadMembers(currentWs.workspace.id);
    });
  };

  const handleLeave = () => {
    if (!currentWs) return;
    setStatusMessage(null);

    startTransition(async () => {
      const operationId = crypto.randomUUID();
      const res = await leaveWorkspaceAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        expectedMembershipRevision: currentWs.membership.revision,
      });

      if (!res.success) {
        const errorText =
          res.error === "LAST_OWNER"
            ? t("lastOwnerError")
            : res.message || t("errors.generic");
        setStatusMessage({
          type: "error",
          text: errorText,
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("leaveSuccess") });
      window.location.reload();
    });
  };

  const handleTransferOwnership = (targetMem: {
    id: string;
    userId: string;
    revision: string;
  }) => {
    if (!currentWs) return;
    setStatusMessage(null);

    startTransition(async () => {
      const operationId = crypto.randomUUID();
      const res = await transferOwnershipAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        targetMembershipId: targetMem.id,
        expectedWorkspaceRevision: currentWs.workspace.revision,
        expectedTargetRevision: targetMem.revision,
        expectedInitiatorRevision: currentWs.membership.revision,
      });

      if (!res.success) {
        const errorText =
          res.error === "REAUTH_REQUIRED"
            ? t("reauthRequired")
            : res.message || t("errors.generic");
        setStatusMessage({
          type: "error",
          text: errorText,
        });
        return;
      }

      setConfirmTransferTarget(null);
      setStatusMessage({
        type: "success",
        text: t("ownershipTransferredSuccess"),
      });
      window.location.reload();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {statusMessage && (
        <Alert
          variant={statusMessage.type === "error" ? "destructive" : "default"}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "error" ? (
              <AlertCircle className="size-4 shrink-0" />
            ) : (
              <Check className="size-4 shrink-0 text-green-500" />
            )}
            <AlertDescription>{statusMessage.text}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* Workspace Context / Selection Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Building2 className="size-5 text-muted-foreground" />
              {t("title")}
            </CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </div>
          {!isCreating && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreating(true);
                setIsEditing(false);
              }}
              disabled={isPending}
            >
              <Plus className="mr-1 size-4" />
              {t("createButton")}
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {currentWs ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("currentWorkspace")}
                  </div>
                  <div className="text-lg font-semibold">
                    {currentWs.workspace.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    /{currentWs.workspace.slug} · {currentWs.workspace.currency}{" "}
                    · {currentWs.workspace.timezone}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {getRoleLabel(currentWs.membership.role, t)}
                  </Badge>
                  {canEditSettings && !isEditing && !isCreating && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSettingsName(currentWs.workspace.name);
                        setSettingsTz(currentWs.workspace.timezone);
                        setSettingsLocale(currentWs.workspace.locale);
                        setSettingsCurrency(currentWs.workspace.currency);
                        setIsEditing(true);
                      }}
                      disabled={isPending}
                      aria-label={t("settingsTitle")}
                    >
                      <Settings className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {workspaces.length === 0 ? t("emptyState") : t("noWorkspace")}
            </div>
          )}

          {/* List of available workspaces */}
          {workspaces.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-sm font-medium text-muted-foreground">
                {t("switchWorkspace")}
              </div>
              <div className="flex flex-col gap-2">
                {workspaces.map((ws) => {
                  const isCurrent = currentWs?.workspace.id === ws.id;
                  return (
                    <div
                      key={ws.id}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                        isCurrent
                          ? "bg-accent/40 border-primary/30"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{ws.name}</span>
                        <span className="text-xs text-muted-foreground">
                          /{ws.slug}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="capitalize text-xs"
                        >
                          {getRoleLabel(ws.role, t)}
                        </Badge>
                        {!isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelect(ws.id)}
                            disabled={isPending}
                          >
                            {t("selectButton")}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>

        {currentWs && canLeave && currentWs.membership.role !== "owner" && (
          <CardFooter className="border-t pt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLeave}
              disabled={isPending}
              className="text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-1 size-4" />
              {t("leaveWorkspaceButton")}
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Create Workspace Modal / Card */}
      {isCreating && (
        <Card className="border-primary/40 shadow-sm">
          <form onSubmit={handleCreate}>
            <CardHeader>
              <CardTitle className="text-lg">{t("createTitle")}</CardTitle>
              <CardDescription>{t("createDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={createNameId}>{t("nameLabel")}</Label>
                <Input
                  id={createNameId}
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={createSlugId}>{t("slugLabel")}</Label>
                <Input
                  id={createSlugId}
                  value={createSlug}
                  onChange={(e) => setCreateSlug(e.target.value)}
                  placeholder={t("slugPlaceholder")}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={createTzId}>{t("timezoneLabel")}</Label>
                  <Input
                    id={createTzId}
                    value={createTz}
                    onChange={(e) => setCreateTz(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={createLocaleId}>{t("localeLabel")}</Label>
                  <select
                    id={createLocaleId}
                    value={createLocale}
                    onChange={(e) =>
                      setCreateLocale(e.target.value as "en" | "ar")
                    }
                    className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                    disabled={isPending}
                  >
                    <option value="en">English (en)</option>
                    <option value="ar">العربية (ar)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={createCurrencyId}>{t("currencyLabel")}</Label>
                  <select
                    id={createCurrencyId}
                    value={createCurrency}
                    onChange={(e) => setCreateCurrency(e.target.value)}
                    className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                    disabled={isPending}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                    <option value="EGP">EGP</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
                disabled={isPending}
              >
                {t("cancelButton")}
              </Button>
              <Button type="submit" disabled={isPending || !createName.trim()}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("createButton")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Edit Workspace Settings Modal / Card */}
      {isEditing && currentWs && (
        <Card className="border-primary/40 shadow-sm">
          <form onSubmit={handleUpdateSettings}>
            <CardHeader>
              <CardTitle className="text-lg">{t("settingsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={settingsNameId}>{t("nameLabel")}</Label>
                <Input
                  id={settingsNameId}
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={settingsTzId}>{t("timezoneLabel")}</Label>
                  <Input
                    id={settingsTzId}
                    value={settingsTz}
                    onChange={(e) => setSettingsTz(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={settingsLocaleId}>{t("localeLabel")}</Label>
                  <select
                    id={settingsLocaleId}
                    value={settingsLocale}
                    onChange={(e) =>
                      setSettingsLocale(e.target.value as "en" | "ar")
                    }
                    className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                    disabled={isPending}
                  >
                    <option value="en">English (en)</option>
                    <option value="ar">العربية (ar)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={settingsCurrencyId}>
                    {t("currencyLabel")}
                  </Label>
                  <select
                    id={settingsCurrencyId}
                    value={settingsCurrency}
                    onChange={(e) => setSettingsCurrency(e.target.value)}
                    className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                    disabled={isPending}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                    <option value="EGP">EGP</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
              >
                {t("cancelButton")}
              </Button>
              <Button
                type="submit"
                disabled={isPending || !settingsName.trim()}
              >
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("updateButton")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Invitations Management (US4) */}
      {currentWs && canInvite && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="size-5 text-muted-foreground" />
              {t("inviteMemberTitle")}
            </CardTitle>
            <CardDescription>{t("inviteMemberDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invite Form */}
            <form
              onSubmit={handleSendInvite}
              className="flex flex-col sm:flex-row gap-3 items-end"
            >
              <div className="space-y-2 flex-1 w-full">
                <Label htmlFor={inviteEmailId}>
                  {t("recipientEmailLabel")}
                </Label>
                <Input
                  id={inviteEmailId}
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t("recipientEmailPlaceholder")}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2 w-full sm:w-36">
                <Label htmlFor={inviteRoleId}>{t("roleLabel")}</Label>
                <select
                  id={inviteRoleId}
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "member" | "admin")
                  }
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                  disabled={isPending}
                >
                  <option value="member">{t("roleMember")}</option>
                  {/* Admin role option is only available if current actor is Owner */}
                  {currentWs.membership.role === "owner" && (
                    <option value="admin">{t("roleAdmin")}</option>
                  )}
                </select>
              </div>
              <Button
                type="submit"
                disabled={isPending || !inviteEmail.trim()}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 size-4" />
                )}
                {t("sendInviteButton")}
              </Button>
            </form>

            {/* Pending Invitations List */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t("pendingInvitationsTitle")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadInvitations(currentWs.workspace.id)}
                  disabled={loadingInvitations || isPending}
                  className="h-8 px-2"
                >
                  <RotateCw
                    className={`size-3.5 ${loadingInvitations ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>

              {invitations.length === 0 ? (
                <div className="text-xs text-muted-foreground italic py-2">
                  {t("noPendingInvitations")}
                </div>
              ) : (
                <div className="divide-y rounded-md border">
                  {invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {inv.recipientEmail}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant="secondary"
                            className="capitalize text-[10px] px-1.5 py-0"
                          >
                            {inv.role}
                          </Badge>
                          <span>gen {inv.generation}</span>
                          <span>·</span>
                          <span>
                            {new Date(inv.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {inv.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() =>
                              handleResendInvite(inv.id, inv.revision)
                            }
                            disabled={isPending}
                          >
                            {t("resendButton")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              handleRevokeInvite(inv.id, inv.revision)
                            }
                            disabled={isPending}
                          >
                            {t("revokeButton")}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members & Ownership Controls (US5) */}
      {currentWs && canReadMembers && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="size-5 text-muted-foreground" />
                  {t("membersTitle")}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadMembers(currentWs.workspace.id)}
                disabled={loadingMembers || isPending}
                className="h-8 px-2"
              >
                <RotateCw
                  className={`size-3.5 ${loadingMembers ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="divide-y rounded-md border">
              {members.map((m) => {
                const isSelf = m.id === currentWs.membership.id;
                const displayName =
                  m.name?.trim() ||
                  m.email?.trim() ||
                  `${m.userId.slice(0, 12)}…`;
                const initials = getInitials(m.name, m.email);

                return (
                  <div
                    key={m.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar size="default" className="shrink-0">
                        <AvatarFallback className="text-xs font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {displayName}
                          </span>
                          {isSelf && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 font-normal shrink-0"
                            >
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                          {m.name && m.email && (
                            <>
                              <span className="truncate">{m.email}</span>
                              <span>·</span>
                            </>
                          )}
                          <span className="shrink-0">
                            rev {m.revision} · {m.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Role selection for Owners */}
                      {canChangeRole && !isSelf && m.status === "active" ? (
                        <select
                          value={m.role}
                          onChange={(e) =>
                            handleChangeMemberRole(
                              m.id,
                              m.revision,
                              e.target.value as WorkspaceRole,
                            )
                          }
                          disabled={isPending}
                          className="flex h-7 rounded border bg-transparent px-2 text-xs"
                        >
                          <option value="owner">{t("roleOwner")}</option>
                          <option value="admin">{t("roleAdmin")}</option>
                          <option value="member">{t("roleMember")}</option>
                        </select>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="capitalize text-xs"
                        >
                          {m.role === "owner" && (
                            <Crown className="mr-1 size-3 text-amber-500" />
                          )}
                          {m.role === "admin" && (
                            <Shield className="mr-1 size-3 text-blue-500" />
                          )}
                          {getRoleLabel(m.role, t)}
                        </Badge>
                      )}

                      {/* Remove member button */}
                      {canRemoveMember && !isSelf && m.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveMember(m.id, m.revision)}
                          disabled={isPending}
                          title={t("removeMemberButton")}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}

                      {/* Transfer Ownership button */}
                      {canTransferOwnership &&
                        !isSelf &&
                        m.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setConfirmTransferTarget(m)}
                            disabled={isPending}
                            title={t("transferOwnershipTitle")}
                          >
                            <ArrowRightLeft className="mr-1 size-3.5" />
                            {t("transferOwnershipButton")}
                          </Button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ownership Transfer Confirmation Modal / Box */}
            {confirmTransferTarget && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 space-y-3">
                <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {t("transferOwnershipTitle")}
                </div>
                <div className="text-xs text-muted-foreground">
                  Are you sure you want to transfer workspace ownership to user{" "}
                  <code className="font-mono text-foreground font-semibold">
                    {confirmTransferTarget.name ||
                      confirmTransferTarget.email ||
                      `${confirmTransferTarget.userId.slice(0, 8)}…`}
                  </code>
                  ? You will be demoted to an Admin.
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setConfirmTransferTarget(null)}
                    disabled={isPending}
                  >
                    {t("cancelButton")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() =>
                      handleTransferOwnership(confirmTransferTarget)
                    }
                    disabled={isPending}
                  >
                    {isPending && (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    )}
                    {t("transferOwnershipButton")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
