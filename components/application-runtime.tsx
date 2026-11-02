"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { authClient } from "@/lib/auth/client";
import {
  selectWorkspaceAction,
  clearWorkspaceSelectionAction,
} from "@/app/workspace-actions";
import type {
  ApplicationAccount,
  ApplicationCapabilities,
  ApplicationContext,
  ApplicationSelection,
  ApplicationWorkspaces,
  WorkspaceChoice,
} from "@/lib/application";

export type AccountLifecycleState =
  "checking" | "ready" | "signing-out" | "denied" | "unavailable";

export type DirtyFormHandler = {
  isDirty: () => boolean;
  confirmDiscard?: () => Promise<boolean>;
};

export type ApplicationRuntimeContextValue = {
  account: ApplicationAccount;
  capabilities: ApplicationCapabilities;
  workspaces: ApplicationWorkspaces;
  selection: ApplicationSelection;
  accountState: AccountLifecycleState;
  generation: number;
  switchWorkspace: (workspaceId: string) => Promise<boolean>;
  clearSelection: () => Promise<void>;
  loadNextWorkspacePage: () => Promise<void>;
  refreshContext: () => Promise<void>;
  signOut: () => Promise<void>;
  registerDirtyForm: (id: string, handler: DirtyFormHandler) => () => void;
  isAnyFormDirty: () => boolean;
  confirmNavigationDiscard: () => Promise<boolean>;
  errorMessage: string | null;
};

const ApplicationRuntimeContext =
  createContext<ApplicationRuntimeContextValue | null>(null);

export function useApplicationRuntime(): ApplicationRuntimeContextValue {
  const ctx = useContext(ApplicationRuntimeContext);
  if (!ctx) {
    throw new Error(
      "useApplicationRuntime must be used within an ApplicationRuntime",
    );
  }
  return ctx;
}

export function ApplicationRuntime({
  initialContext,
  children,
}: {
  initialContext: ApplicationContext;
  children: React.ReactNode;
}) {
  const [account, setAccount] = useState<ApplicationAccount>(
    initialContext.account,
  );
  const [capabilities, setCapabilities] = useState<ApplicationCapabilities>(
    initialContext.capabilities,
  );
  const [workspaces, setWorkspaces] = useState<ApplicationWorkspaces>(
    initialContext.workspaces,
  );
  const [selection, setSelection] = useState<ApplicationSelection>(
    initialContext.selection,
  );
  const [accountState, setAccountState] =
    useState<AccountLifecycleState>("ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(0);

  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(false);
  const isSigningOut = useRef(false);
  const isRechecking = useRef(false);
  const protectedContainer = useRef<HTMLDivElement>(null);
  const dirtyForms = useRef<Map<string, DirtyFormHandler>>(new Map());

  // Conceal private content synchronously (pagehide / unauthenticated / switching)
  const conceal = useCallback(() => {
    if (protectedContainer.current) {
      protectedContainer.current.hidden = true;
    }
    generation.current++;
    setGenerationCount(generation.current);
    controller.current?.abort();
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    setAccountState("checking");
  }, []);

  // Deny authority and safely transition out
  const deny = useCallback(() => {
    conceal();
    setAccountState("denied");
    window.location.replace("/sign-in#");
  }, [conceal]);

  // Coalesced context recheck
  const recheckContext = useCallback(async () => {
    if (
      !isMounted.current ||
      isSigningOut.current ||
      document.visibilityState === "hidden" ||
      isRechecking.current
    ) {
      return;
    }

    isRechecking.current = true;
    const currentGen = generation.current;
    const abort = new AbortController();
    controller.current = abort;

    try {
      const res = await fetch("/api/app/context", {
        cache: "no-store",
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(15000)]),
      });

      if (!isMounted.current || currentGen !== generation.current) return;

      if (res.status === 401) {
        deny();
        return;
      }

      if (res.status === 503 || !res.ok) {
        setAccountState("unavailable");
        return;
      }

      const nextContext: ApplicationContext = await res.json();
      if (!isMounted.current || currentGen !== generation.current) return;

      // Ensure actor identity matches
      if (nextContext.account.id !== account.id) {
        // Identity changed across tabs: reload cleanly
        window.location.reload();
        return;
      }

      const remainingMs =
        Date.parse(nextContext.account.sessionExpiresAt) - Date.now();
      if (!Number.isFinite(remainingMs) || remainingMs <= 0) {
        deny();
        return;
      }

      setAccount(nextContext.account);
      setCapabilities(nextContext.capabilities);
      setWorkspaces(nextContext.workspaces);
      setSelection(nextContext.selection);
      setAccountState("ready");
      setErrorMessage(null);

      // Reveal container
      if (protectedContainer.current) {
        protectedContainer.current.hidden = false;
      }
    } catch {
      if (!isMounted.current || currentGen !== generation.current) return;
      setAccountState("unavailable");
    } finally {
      isRechecking.current = false;
    }
  }, [account.id, deny]);

  // Expiry timer
  useEffect(() => {
    const remainingMs = Date.parse(account.sessionExpiresAt) - Date.now();
    if (!Number.isFinite(remainingMs) || remainingMs <= 0) {
      queueMicrotask(() => deny());
      return;
    }

    expiryTimer.current = setTimeout(
      () => {
        deny();
      },
      Math.min(remainingMs, 0x7fffffff),
    );

    return () => {
      if (expiryTimer.current) clearTimeout(expiryTimer.current);
    };
  }, [account.sessionExpiresAt, deny]);

  // Lifecycle listeners: pagehide, pageshow, focus, visibility, 55s polling
  useEffect(() => {
    isMounted.current = true;

    const handlePageHide = () => {
      conceal();
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        conceal();
        recheckContext();
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        recheckContext();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    recheckInterval.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        recheckContext();
      }
    }, 55000);

    return () => {
      isMounted.current = false;
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      if (recheckInterval.current) clearInterval(recheckInterval.current);
      if (expiryTimer.current) clearTimeout(expiryTimer.current);
    };
  }, [conceal, recheckContext]);

  // Dirty form management
  const registerDirtyForm = useCallback(
    (id: string, handler: DirtyFormHandler) => {
      dirtyForms.current.set(id, handler);
      return () => {
        dirtyForms.current.delete(id);
      };
    },
    [],
  );

  const isAnyFormDirty = useCallback(() => {
    for (const handler of dirtyForms.current.values()) {
      if (handler.isDirty()) return true;
    }
    return false;
  }, []);

  const confirmNavigationDiscard = useCallback(async (): Promise<boolean> => {
    for (const handler of dirtyForms.current.values()) {
      if (handler.isDirty()) {
        if (handler.confirmDiscard) {
          const ok = await handler.confirmDiscard();
          if (!ok) return false;
        } else {
          const ok = window.confirm(
            "You have unsaved changes. Discard changes and continue?",
          );
          if (!ok) return false;
        }
      }
    }
    return true;
  }, []);

  // Switching workspace with serialized cookie action and context re-read
  const switchWorkspace = useCallback(
    async (targetWorkspaceId: string): Promise<boolean> => {
      if (
        selection.selectedId === targetWorkspaceId &&
        selection.state === "ready"
      ) {
        return true;
      }

      // 1. Check dirty forms
      const ok = await confirmNavigationDiscard();
      if (!ok) return false;

      // 2. Increment generation, conceal old team subtree
      generation.current++;
      setGenerationCount(generation.current);
      const currentGen = generation.current;
      controller.current?.abort();

      setSelection((prev) => ({
        ...prev,
        state: "checking",
        selectedId: targetWorkspaceId,
      }));

      try {
        const actionResult = await selectWorkspaceAction(targetWorkspaceId);
        if (!actionResult.success) {
          if (currentGen !== generation.current) return false;
          setSelection({
            state: "restricted",
            selectedId: targetWorkspaceId,
            context: null,
            error: actionResult.message || "Unable to switch workspace",
          });
          return false;
        }

        // Fetch fresh context
        const res = await fetch("/api/app/context", { cache: "no-store" });
        if (!res.ok) {
          if (currentGen !== generation.current) return false;
          setSelection({
            state: "unavailable",
            selectedId: targetWorkspaceId,
            context: null,
            error: "Unable to load workspace context",
          });
          return false;
        }

        const fresh: ApplicationContext = await res.json();
        if (currentGen !== generation.current) return false;

        setSelection(fresh.selection);
        setWorkspaces(fresh.workspaces);
        return fresh.selection.state === "ready";
      } catch (err) {
        if (currentGen !== generation.current) return false;
        setSelection({
          state: "unavailable",
          selectedId: targetWorkspaceId,
          context: null,
          error:
            err instanceof Error ? err.message : "Workspace selection failed",
        });
        return false;
      }
    },
    [confirmNavigationDiscard, selection.selectedId, selection.state],
  );

  // Clear workspace selection
  const clearSelection = useCallback(async () => {
    const currentId = selection.selectedId || undefined;
    await clearWorkspaceSelectionAction(currentId);
    setSelection({
      state: "unselected",
      selectedId: null,
      context: null,
    });
  }, [selection.selectedId]);

  // Load next page of workspace choices (pagination)
  const loadNextWorkspacePage = useCallback(async () => {
    if (!workspaces.nextCursor) return;
    try {
      const res = await fetch(
        `/api/workspaces?limit=20&cursor=${encodeURIComponent(workspaces.nextCursor)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const data: { items: WorkspaceChoice[]; nextCursor: string | null } =
        await res.json();

      setWorkspaces((prev) => {
        const existingIds = new Set(prev.items.map((i) => i.id));
        const newItems = data.items.filter((i) => !existingIds.has(i.id));
        return {
          ...prev,
          items: [...prev.items, ...newItems],
          nextCursor: data.nextCursor,
        };
      });
    } catch {
      console.error("Failed to load next workspace page");
    }
  }, [workspaces.nextCursor]);

  // Sign out
  const signOut = useCallback(async () => {
    isSigningOut.current = true;
    conceal();
    setAccountState("signing-out");

    try {
      await authClient.signOut();
      window.location.replace("/#");
    } catch {
      isSigningOut.current = false;
      setAccountState("ready");
      setErrorMessage("Sign out failed. Please try again.");
    }
  }, [conceal]);

  const value: ApplicationRuntimeContextValue = {
    account,
    capabilities,
    workspaces,
    selection,
    accountState,
    generation: generationCount,
    switchWorkspace,
    clearSelection,
    loadNextWorkspacePage,
    refreshContext: recheckContext,
    signOut,
    registerDirtyForm,
    isAnyFormDirty,
    confirmNavigationDiscard,
    errorMessage,
  };

  return (
    <ApplicationRuntimeContext.Provider value={value}>
      <div
        ref={protectedContainer}
        data-testid="application-runtime-root"
        className="flex min-h-svh w-full flex-1"
      >
        {children}
      </div>
    </ApplicationRuntimeContext.Provider>
  );
}
