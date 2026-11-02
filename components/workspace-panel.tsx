"use client";

import {
  useState,
  useTransition,
  useId,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { useLocale, useTranslations } from "next-intl";
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
import type { WorkspaceRole } from "@/lib/workspaces";
import { useApplicationRuntime } from "@/components/application-runtime";

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
      return t("roleUnavailable");
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

function getErrorMessage(errorKey: string, t: WorkspacesTranslator): string {
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
      return t("errors.generic");
  }
}

export function WorkspacePanel() {
  const runtime = useApplicationRuntime();
  const t = useTranslations("Navigation");
  if (!runtime.capabilities.workspacesEnabled)
    return <p role="status">{t("workspacesDisabled")}</p>;
  return (
    <WorkspacePanelContent
      key={`${runtime.account.id}:${runtime.selection.selectedId}:${runtime.teamEpoch}`}
    />
  );
}

function WorkspacePanelContent() {
  const t = useTranslations("Workspaces");
  const locale = useLocale();
  const runtime = useApplicationRuntime();
  const { registerDirtyForm } = runtime;
  const currentWs =
    runtime.selection.state === "ready" ? runtime.selection.context : null;
  const workspaces = runtime.workspaces.items;
  const active = useRef(false);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
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

  const [transitionPending, beginTransition] = useTransition();
  const [retryCommand, setRetryCommand] = useState<
    (() => Promise<void>) | null
  >(null);
  const isPending = transitionPending || retryCommand !== null;
  const startTransition = (command: () => Promise<void>) => {
    beginTransition(async () => {
      try {
        await command();
        if (active.current) setRetryCommand(null);
      } catch {
        if (active.current) {
          setRetryCommand(() => command);
          setStatusMessage({ type: "error", text: t("operationUncertain") });
        }
      }
    });
  };

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
    runtime.capabilities.workspaceInvitesEnabled &&
    (currentWs?.capabilities.includes("workspace.invites.manage") ?? false);
  const canReadMembers =
    currentWs?.capabilities.includes("workspace.members.read") ?? false;
  const canChangeRole =
    currentWs?.capabilities.includes("workspace.members.role.change") ?? false;
  const canRemoveMember =
    currentWs?.capabilities.includes("workspace.members.remove") ?? false;
  const canTransferOwnership =
    runtime.capabilities.ownershipTransferEnabled &&
    (currentWs?.capabilities.includes("workspace.ownership.transfer") ?? false);
  const canLeave =
    currentWs?.capabilities.includes("workspace.members.leave") ?? false;

  const dirty = useRef({ create: false, settings: false, invite: false });
  const settingsBase = useRef(currentWs?.workspace);
  useLayoutEffect(() => {
    dirty.current = {
      create:
        isCreating &&
        !!(
          createName ||
          createSlug ||
          createTz !== "UTC" ||
          createLocale !== "en" ||
          createCurrency !== "USD"
        ),
      settings:
        isEditing &&
        !!settingsBase.current &&
        (settingsName !== settingsBase.current.name ||
          settingsTz !== settingsBase.current.timezone ||
          settingsLocale !== settingsBase.current.locale ||
          settingsCurrency !== settingsBase.current.currency),
      invite: !!inviteEmail || inviteRole !== "member",
    };
  });
  useEffect(() => {
    const unregister = [
      registerDirtyForm("workspace-create", {
        isDirty: () => dirty.current.create,
        discard: () => {
          dirty.current.create = false;
          setCreateName("");
          setCreateSlug("");
          setCreateTz("UTC");
          setCreateLocale("en");
          setCreateCurrency("USD");
          setIsCreating(false);
        },
      }),
      registerDirtyForm("workspace-settings", {
        isDirty: () => dirty.current.settings,
        discard: () => {
          dirty.current.settings = false;
          setIsEditing(false);
        },
      }),
      registerDirtyForm("workspace-invite", {
        isDirty: () => dirty.current.invite,
        discard: () => {
          dirty.current.invite = false;
          setInviteEmail("");
          setInviteRole("member");
        },
      }),
    ];
    return () => unregister.forEach((dispose) => dispose());
  }, [registerDirtyForm]);

  const invitationRequest = useRef(0);
  const memberRequest = useRef(0);
  const loadInvitations = useCallback(
    async (wsId: string) => {
      if (!active.current || !canInvite || wsId !== currentWs?.workspace.id)
        return;
      const request = ++invitationRequest.current;
      setLoadingInvitations(true);
      try {
        const res = await listWorkspaceInvitationsAction(wsId);
        if (!active.current || request !== invitationRequest.current) return;
        if (res.success) setInvitations(res.data);
        else setStatusMessage({ type: "error", text: t("unavailable") });
      } catch {
        if (active.current && request === invitationRequest.current)
          setStatusMessage({ type: "error", text: t("unavailable") });
      } finally {
        if (active.current && request === invitationRequest.current)
          setLoadingInvitations(false);
      }
    },
    [canInvite, currentWs?.workspace.id, t],
  );
  const loadMembers = useCallback(
    async (wsId: string) => {
      if (
        !active.current ||
        !canReadMembers ||
        wsId !== currentWs?.workspace.id
      )
        return;
      const request = ++memberRequest.current;
      setLoadingMembers(true);
      try {
        const res = await listWorkspaceMembersAction(wsId);
        if (!active.current || request !== memberRequest.current) return;
        if (res.success) setMembers(res.data);
        else setStatusMessage({ type: "error", text: t("unavailable") });
      } catch {
        if (active.current && request === memberRequest.current)
          setStatusMessage({ type: "error", text: t("unavailable") });
      } finally {
        if (active.current && request === memberRequest.current)
          setLoadingMembers(false);
      }
    },
    [canReadMembers, currentWs?.workspace.id, t],
  );
  useEffect(() => {
    const wsId = currentWs?.workspace.id;
    queueMicrotask(() => {
      if (active.current && wsId) {
        void loadInvitations(wsId);
        void loadMembers(wsId);
      }
    });
    // Team/permission changes remount this subtree; ordinary reads retain form input.
  }, [currentWs?.workspace.id, loadInvitations, loadMembers]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const operationId = crypto.randomUUID();
    startTransition(async () => {
      const res = await createWorkspaceAction({
        operationId,
        name: createName,
        slug: createSlug,
        timezone: createTz,
        locale: createLocale,
        currency: createCurrency,
      });
      if (!active.current) return;
      if (!res.success && res.statusHttp >= 500)
        throw new Error("Outcome unconfirmed");

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
          text: getErrorMessage(errorKey, t),
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("createdSuccess") });
      setIsCreating(false);
      setCreateName("");
      setCreateSlug("");

      dirty.current.create = false;
      await runtime.switchWorkspace(res.data.workspaceId);
    });
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWs) return;
    setStatusMessage(null);

    const operationId = crypto.randomUUID();
    startTransition(async () => {
      const res = await updateWorkspaceSettingsAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        expectedRevision: currentWs.workspace.revision,
        name: settingsName,
        timezone: settingsTz,
        locale: settingsLocale,
        currency: settingsCurrency,
      });
      if (!active.current) return;
      if (!res.success && res.statusHttp >= 500)
        throw new Error("Outcome unconfirmed");

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
          text: getErrorMessage(errorKey, t),
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("updatedSuccess") });
      setIsEditing(false);
      dirty.current.settings = false;
      await runtime.refreshContext();
    });
  };

  const handleSelect = (workspaceId: string) => {
    startTransition(async () => {
      await runtime.switchWorkspace(workspaceId);
    });
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWs) return;
    setStatusMessage(null);

    const operationId = crypto.randomUUID();
    startTransition(async () => {
      const res = await issueWorkspaceInvitationAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        expectedRevision: currentWs.workspace.revision,
        recipientEmail: inviteEmail,
        role: inviteRole,
      });
      if (!active.current) return;
      if (!res.success && res.statusHttp >= 500)
        throw new Error("Outcome unconfirmed");

      if (!res.success) {
        const errorKey =
          res.error === "FORBIDDEN"
            ? "forbidden"
            : res.error === "REVISION_CONFLICT"
              ? "revisionConflict"
              : "generic";
        setStatusMessage({
          type: "error",
          text: getErrorMessage(errorKey, t),
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("inviteSentSuccess") });
      setInviteEmail("");
      dirty.current.invite = false;
      await runtime.refreshContext();
      if (!active.current) return;
      loadInvitations(currentWs.workspace.id);
    });
  };

  const handleResendInvite = (invitationId: string, revision: string) => {
    if (!currentWs) return;
    setStatusMessage(null);

    const operationId = crypto.randomUUID();
    startTransition(async () => {
      const res = await resendWorkspaceInvitationAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        invitationId,
        expectedInvitationRevision: revision,
      });
      if (!active.current) return;
      if (!res.success && res.statusHttp >= 500)
        throw new Error("Outcome unconfirmed");

      if (!res.success) {
        setStatusMessage({
          type: "error",
          text: t("errors.generic"),
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

    const operationId = crypto.randomUUID();
    startTransition(async () => {
      const res = await revokeWorkspaceInvitationAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        invitationId,
        expectedInvitationRevision: revision,
      });
      if (!active.current) return;
      if (!res.success && res.statusHttp >= 500)
        throw new Error("Outcome unconfirmed");

      if (!res.success) {
        setStatusMessage({
          type: "error",
          text: t("errors.generic"),
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

    const operationId = crypto.randomUUID();
    startTransition(async () => {
      const res = await changeMemberRoleAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        membershipId,
        expectedMembershipRevision: revision,
        role: newRole,
      });
      if (!active.current) return;
      if (!res.success && res.statusHttp >= 500)
        throw new Error("Outcome unconfirmed");

      if (!res.success) {
        const errorText =
          res.error === "REAUTH_REQUIRED"
            ? t("reauthRequired")
            : res.error === "LAST_OWNER"
              ? t("lastOwnerError")
              : t("errors.generic");
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

    const operationId = crypto.randomUUID();
    startTransition(async () => {
      const res = await removeMemberAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        membershipId,
        expectedMembershipRevision: revision,
      });
      if (!active.current) return;
      if (!res.success && res.statusHttp >= 500)
        throw new Error("Outcome unconfirmed");

      if (!res.success) {
        const errorText =
          res.error === "LAST_OWNER"
            ? t("lastOwnerError")
            : t("errors.generic");
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

    const operationId = crypto.randomUUID();
    startTransition(async () => {
      const res = await leaveWorkspaceAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        expectedMembershipRevision: currentWs.membership.revision,
      });
      if (!active.current) return;
      if (!res.success && res.statusHttp >= 500)
        throw new Error("Outcome unconfirmed");

      if (!res.success) {
        const errorText =
          res.error === "LAST_OWNER"
            ? t("lastOwnerError")
            : t("errors.generic");
        setStatusMessage({
          type: "error",
          text: errorText,
        });
        return;
      }

      setStatusMessage({ type: "success", text: t("leaveSuccess") });
      await runtime.refreshContext();
    });
  };

  const handleTransferOwnership = (targetMem: {
    id: string;
    userId: string;
    revision: string;
  }) => {
    if (!currentWs) return;
    setStatusMessage(null);

    const operationId = crypto.randomUUID();
    startTransition(async () => {
      const res = await transferOwnershipAction({
        operationId,
        workspaceId: currentWs.workspace.id,
        targetMembershipId: targetMem.id,
        expectedWorkspaceRevision: currentWs.workspace.revision,
        expectedTargetRevision: targetMem.revision,
        expectedInitiatorRevision: currentWs.membership.revision,
      });
      if (!active.current) return;
      if (!res.success && res.statusHttp >= 500)
        throw new Error("Outcome unconfirmed");

      if (!res.success) {
        const errorText =
          res.error === "REAUTH_REQUIRED"
            ? t("reauthRequired")
            : t("errors.generic");
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
      await runtime.refreshContext();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {retryCommand && (
        <Button
          size="lg"
          variant="outline"
          disabled={transitionPending}
          onClick={() => startTransition(retryCommand)}
        >
          {t("retryOriginalOperation")}
        </Button>
      )}
      {statusMessage && (
        <Alert variant="default">
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

      {(runtime.selection.state === "restricted" ||
        runtime.selection.state === "unavailable") && (
        <Button
          size="lg"
          variant="outline"
          onClick={() => void runtime.clearSelection()}
        >
          {t("clearSelection")}
        </Button>
      )}
      <p className="text-sm text-muted-foreground">{t("memory")}</p>
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
              <Plus className="me-1 size-4" />
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
                        settingsBase.current = currentWs.workspace;
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
              {t(
                runtime.selection.state === "checking"
                  ? "switching"
                  : runtime.selection.state === "restricted"
                    ? "selectionRestricted"
                    : runtime.selection.state === "unavailable" ||
                        runtime.workspaces.state === "unavailable"
                      ? "unavailable"
                      : "noWorkspace",
              )}
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
            >
              <LogOut className="me-1 size-4" />
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
                onClick={() => {
                  dirty.current.create = false;
                  setIsCreating(false);
                  setCreateName("");
                  setCreateSlug("");
                  setCreateTz("UTC");
                  setCreateLocale("en");
                  setCreateCurrency("USD");
                }}
                disabled={isPending}
              >
                {t("cancelButton")}
              </Button>
              <Button type="submit" disabled={isPending || !createName.trim()}>
                {isPending && <Loader2 className="me-2 size-4 animate-spin" />}
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
                {isPending && <Loader2 className="me-2 size-4 animate-spin" />}
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
                  <Loader2 className="me-2 size-4 animate-spin" />
                ) : (
                  <UserPlus className="me-2 size-4" />
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
                  aria-label={t("refreshInvitations")}
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
                          <bdi>{inv.recipientEmail}</bdi>
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant="secondary"
                            className="capitalize text-[10px] px-1.5 py-0"
                          >
                            {getRoleLabel(inv.role, t)}
                          </Badge>
                          <span>
                            {new Date(inv.expiresAt).toLocaleDateString(locale)}
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
                            className="h-7 text-xs"
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
                aria-label={t("refreshMembers")}
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
                            <bdi>{displayName}</bdi>
                          </span>
                          {isSelf && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 font-normal shrink-0"
                            >
                              {t("you")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                          {m.name && m.email && (
                            <>
                              <span className="truncate">
                                <bdi>{m.email}</bdi>
                              </span>
                              <span>·</span>
                            </>
                          )}
                          <span className="shrink-0">
                            {t(
                              m.status === "active"
                                ? "statusActive"
                                : "statusRevoked",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Role selection for Owners */}
                      {canChangeRole &&
                      !isSelf &&
                      m.status === "active" &&
                      (m.role !== "owner" ||
                        runtime.capabilities.ownershipTransferEnabled) ? (
                        <select
                          value={m.role}
                          onChange={(e) =>
                            handleChangeMemberRole(
                              m.id,
                              m.revision,
                              e.target.value as WorkspaceRole,
                            )
                          }
                          aria-label={t("changeRoleFor", { name: displayName })}
                          disabled={isPending}
                          className="flex h-7 rounded border bg-transparent px-2 text-xs"
                        >
                          {runtime.capabilities.ownershipTransferEnabled && (
                            <option value="owner">{t("roleOwner")}</option>
                          )}
                          <option value="admin">{t("roleAdmin")}</option>
                          <option value="member">{t("roleMember")}</option>
                        </select>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="capitalize text-xs"
                        >
                          {m.role === "owner" && (
                            <Crown className="me-1 size-3 text-amber-500" />
                          )}
                          {m.role === "admin" && (
                            <Shield className="me-1 size-3 text-blue-500" />
                          )}
                          {getRoleLabel(m.role, t)}
                        </Badge>
                      )}

                      {/* Remove member button */}
                      {canRemoveMember &&
                        !isSelf &&
                        m.status === "active" &&
                        (m.role !== "owner" ||
                          runtime.capabilities.ownershipTransferEnabled) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
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
                            <ArrowRightLeft className="me-1 size-3.5" />
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
                  {t.rich("transferConfirmation", {
                    name:
                      confirmTransferTarget.name ||
                      confirmTransferTarget.email ||
                      confirmTransferTarget.userId,
                    user: (name) => <bdi>{name}</bdi>,
                  })}
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
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() =>
                      handleTransferOwnership(confirmTransferTarget)
                    }
                    disabled={isPending}
                  >
                    {isPending && (
                      <Loader2 className="me-1.5 size-3.5 animate-spin" />
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
