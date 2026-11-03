"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/client";
import {
  selectWorkspaceAction,
  clearWorkspaceSelectionAction,
} from "@/app/workspace-actions";
import { isAppDestination, type AppDestination } from "@/lib/site";
import type { ApplicationContext, WorkspaceChoice } from "@/lib/application";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useInvitationEntry } from "@/components/workspace-invitation";

export type AccountLifecycleState =
  "checking" | "ready" | "signing-out" | "denied" | "unavailable";
export type DirtyFormHandler = {
  isDirty: () => boolean;
  confirmDiscard?: () => Promise<boolean>;
  discard: () => void;
};
export type ApplicationRuntimeContextValue = ApplicationContext & {
  accountState: AccountLifecycleState;
  generation: number;
  teamEpoch: number;
  switchWorkspace: (workspaceId: string) => Promise<boolean>;
  clearSelection: () => Promise<void>;
  loadNextWorkspacePage: () => Promise<void>;
  refreshContext: () => Promise<void>;
  signOut: () => Promise<void>;
  navigate: (destination: AppDestination | "/") => Promise<boolean>;
  registerDirtyForm: (id: string, handler: DirtyFormHandler) => () => void;
  isAnyFormDirty: () => boolean;
  confirmNavigationDiscard: () => Promise<boolean>;
  errorMessage: string | null;
};
const ApplicationRuntimeContext =
  createContext<ApplicationRuntimeContextValue | null>(null);

export function useApplicationRuntime(): ApplicationRuntimeContextValue {
  const ctx = useContext(ApplicationRuntimeContext);
  if (!ctx)
    throw new Error(
      "useApplicationRuntime must be used within an ApplicationRuntime",
    );
  return ctx;
}

export function ApplicationRuntime({
  initialContext,
  children,
}: {
  initialContext: ApplicationContext;
  children: React.ReactNode;
}) {
  const t = useTranslations("Navigation");
  const { clear: clearInvitation } = useInvitationEntry();
  const c = useTranslations("Common");
  const pathname = usePathname();
  const router = useRouter();
  const [context, setContext] = useState(initialContext);
  const [accountState, setAccountState] =
    useState<AccountLifecycleState>("ready");
  const [errorMessage, setErrorMessage] = useState<
    "contextUnavailable" | "signOutFailed" | null
  >(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [teamEpoch, setTeamEpoch] = useState(0);
  const currentContext = useRef(initialContext);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const pageController = useRef<AbortController | null>(null);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(false);
  const initialMount = useRef(true);
  const isSigningOut = useRef(false);
  const writeBusy = useRef(false);
  const navigationBusy = useRef(false);
  const confirmationBusy = useRef(false);
  const pageBusy = useRef(false);
  const recheck = useRef<Promise<boolean> | null>(null);
  const protectedContainer = useRef<HTMLDivElement>(null);
  const dirtyForms = useRef(new Map<string, DirtyFormHandler>());

  const invalidate = useCallback(() => {
    generation.current++;
    setGenerationCount(generation.current);
    controller.current?.abort();
    pageController.current?.abort();
    recheck.current = null;
  }, []);
  const conceal = useCallback(() => {
    if (protectedContainer.current) {
      protectedContainer.current.style.display = "none";
      protectedContainer.current.inert = true;
      for (const overlay of document.querySelectorAll<HTMLElement>(
        "[data-app-private-overlay]",
      ))
        overlay.style.display = "none";
    }
    invalidate();
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    setAccountState("checking");
  }, [invalidate]);
  const discardPrivate = useCallback(() => {
    for (const handler of dirtyForms.current.values()) handler.discard();
    setTeamEpoch((epoch) => epoch + 1);
    clearInvitation();
  }, [clearInvitation]);
  const deny = useCallback(() => {
    conceal();
    discardPrivate();
    setAccountState("denied");
    const path = window.location.pathname;
    window.location.replace(
      `/sign-in${isAppDestination(path) ? `?returnTo=${encodeURIComponent(path)}` : ""}#`,
    );
  }, [conceal, discardPrivate]);
  const armExpiry = useCallback(
    (expiresAt: string) => {
      if (expiryTimer.current) clearTimeout(expiryTimer.current);
      const remaining = Date.parse(expiresAt) - Date.now();
      if (!Number.isFinite(remaining) || remaining <= 0) {
        deny();
        return;
      }
      expiryTimer.current = setTimeout(deny, Math.min(remaining, 0x7fffffff));
    },
    [deny],
  );

  const recheckContext = useCallback(
    (expected?: string | null, background = false): Promise<boolean> => {
      if (
        !isMounted.current ||
        isSigningOut.current ||
        document.visibilityState === "hidden"
      )
        return Promise.resolve(false);
      if (recheck.current) return recheck.current;
      if (!background) conceal();
      const currentGen = generation.current;
      const abort = new AbortController();
      controller.current = abort;
      const task: Promise<boolean> = (async () => {
        try {
          const res = await fetch("/api/app/context", {
            cache: "no-store",
            signal: AbortSignal.any([abort.signal, AbortSignal.timeout(15000)]),
          });
          if (!isMounted.current || currentGen !== generation.current)
            return false;
          if (res.status === 401) {
            deny();
            return false;
          }
          if (!res.ok) throw new Error("Unavailable");
          const next: ApplicationContext = await res.json();
          if (!isMounted.current || currentGen !== generation.current)
            return false;
          const previous = currentContext.current;
          if (next.account.id !== previous.account.id) {
            conceal();
            discardPrivate();
            window.location.replace(`${window.location.pathname}#`);
            return false;
          }
          const remaining =
            Date.parse(next.account.sessionExpiresAt) - Date.now();
          if (!Number.isFinite(remaining) || remaining <= 0) {
            deny();
            return false;
          }
          const selection = next.selection;
          const matches =
            expected === undefined ||
            (expected === null
              ? selection.state === "unselected" ||
                selection.state === "disabled"
              : selection.state === "ready" &&
                selection.selectedId === expected &&
                selection.context?.workspace.id === expected);
          if (
            selection.state === "ready" &&
            selection.context?.workspace.id !== selection.selectedId
          )
            throw new Error("Invalid selection");
          if (!matches)
            next.selection = {
              state: "unavailable",
              selectedId: expected ?? null,
              context: null,
              error: "SERVICE_UNAVAILABLE",
            };
          if (next.selection.state !== "ready") next.selection.context = null;
          const before = previous.selection;
          if (
            before.selectedId !== next.selection.selectedId ||
            before.state !== next.selection.state ||
            before.context?.membership.id !==
              next.selection.context?.membership.id ||
            before.context?.membership.role !==
              next.selection.context?.membership.role ||
            JSON.stringify(before.context?.capabilities) !==
              JSON.stringify(next.selection.context?.capabilities)
          ) {
            setTeamEpoch((epoch) => epoch + 1);
          }
          currentContext.current = next;
          setContext(next);
          setAccountState("ready");
          setErrorMessage(null);
          armExpiry(next.account.sessionExpiresAt);
          return matches;
        } catch {
          if (isMounted.current && currentGen === generation.current) {
            conceal();
            setAccountState("unavailable");
            setErrorMessage("contextUnavailable");
          }
          return false;
        }
      })().finally(() => {
        if (recheck.current === task) recheck.current = null;
      });
      recheck.current = task;
      return task;
    },
    [armExpiry, conceal, deny, discardPrivate],
  );

  useLayoutEffect(() => {
    isMounted.current = true;
    navigationBusy.current = false;
    if (!initialMount.current) {
      if (protectedContainer.current) {
        protectedContainer.current.style.display = "none";
        protectedContainer.current.inert = true;
      }
      queueMicrotask(() => {
        if (isMounted.current) void recheckContext();
      });
    } else {
      queueMicrotask(() => {
        if (isMounted.current)
          armExpiry(initialContext.account.sessionExpiresAt);
      });
    }
    return () => {
      isMounted.current = false;
      // Initial effect replay reuses the server-validated context before any browser departure.
      if (initialMount.current) {
        invalidate();
        if (expiryTimer.current) clearTimeout(expiryTimer.current);
      } else conceal();
    };
  }, [
    pathname,
    armExpiry,
    conceal,
    recheckContext,
    invalidate,
    initialContext.account.sessionExpiresAt,
  ]);

  useLayoutEffect(() => {
    if (
      accountState === "ready" &&
      !recheck.current &&
      !isSigningOut.current &&
      protectedContainer.current
    ) {
      protectedContainer.current.style.display = "flex";
      protectedContainer.current.inert = false;
    }
  }, [accountState, context]);

  useEffect(() => {
    queueMicrotask(() => {
      initialMount.current = false;
    });
    const restore = () => {
      if (document.visibilityState === "visible" && !writeBusy.current)
        void recheckContext();
    };
    const refresh = () => {
      if (document.visibilityState === "visible" && !writeBusy.current)
        void recheckContext(undefined, true);
    };
    const foreground = () => {
      if (document.visibilityState === "hidden") conceal();
      else restore();
    };
    const restoreHistory = (event: PageTransitionEvent) => {
      if (event.persisted) restore();
    };
    window.addEventListener("pagehide", conceal);
    window.addEventListener("pageshow", restoreHistory);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", foreground);
    const interval = setInterval(refresh, 55000);
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if ([...dirtyForms.current.values()].some((form) => form.isDirty())) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("pagehide", conceal);
      window.removeEventListener("pageshow", restoreHistory);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", foreground);
      window.removeEventListener("beforeunload", beforeUnload);
      clearInterval(interval);
    };
  }, [conceal, recheckContext]);

  const registerDirtyForm = useCallback(
    (id: string, handler: DirtyFormHandler) => {
      dirtyForms.current.set(id, handler);
      return () => {
        if (dirtyForms.current.get(id) === handler)
          dirtyForms.current.delete(id);
      };
    },
    [],
  );
  const isAnyFormDirty = useCallback(
    () => [...dirtyForms.current.values()].some((form) => form.isDirty()),
    [],
  );
  const confirmNavigationDiscard = useCallback(async () => {
    if (confirmationBusy.current) return false;
    confirmationBusy.current = true;
    try {
      const affected = [...dirtyForms.current.values()].filter((form) =>
        form.isDirty(),
      );
      for (const form of affected) {
        if (
          !(form.confirmDiscard
            ? await form.confirmDiscard()
            : window.confirm(t("discardChanges")))
        )
          return false;
      }
      if (
        [...dirtyForms.current.values()].some(
          (form) => form.isDirty() && !affected.includes(form),
        )
      )
        return false;
      for (const form of affected) form.discard();
      return true;
    } finally {
      confirmationBusy.current = false;
    }
  }, [t]);

  const switchWorkspace = useCallback(
    async (workspaceId: string) => {
      if (writeBusy.current || navigationBusy.current || isSigningOut.current)
        return false;
      const previous = currentContext.current.selection;
      if (previous.state === "ready" && previous.selectedId === workspaceId)
        return true;
      writeBusy.current = true;
      try {
        if (!(await confirmNavigationDiscard())) return false;
        invalidate();
        setTeamEpoch((epoch) => epoch + 1);
        const currentGen = generation.current;
        const checking = {
          ...currentContext.current,
          selection: {
            state: "checking" as const,
            selectedId: workspaceId,
            context: null,
          },
        };
        currentContext.current = checking;
        setContext(checking);
        try {
          await selectWorkspaceAction(workspaceId);
        } catch {
          /* Re-read authority even after a lost action response. */
        }
        if (!isMounted.current || currentGen !== generation.current)
          return false;
        return await recheckContext(workspaceId);
      } finally {
        writeBusy.current = false;
      }
    },
    [confirmNavigationDiscard, invalidate, recheckContext],
  );

  const clearSelection = useCallback(async () => {
    const selectedId = currentContext.current.selection.selectedId;
    if (
      !selectedId ||
      writeBusy.current ||
      navigationBusy.current ||
      isSigningOut.current
    )
      return;
    writeBusy.current = true;
    try {
      if (!(await confirmNavigationDiscard())) return;
      invalidate();
      setTeamEpoch((epoch) => epoch + 1);
      const currentGen = generation.current;
      const checking = {
        ...currentContext.current,
        selection: { state: "checking" as const, selectedId, context: null },
      };
      currentContext.current = checking;
      setContext(checking);
      try {
        await clearWorkspaceSelectionAction(selectedId);
      } catch {
        /* A response cannot establish the current cookie. */
      }
      if (isMounted.current && currentGen === generation.current)
        await recheckContext(null);
    } finally {
      writeBusy.current = false;
    }
  }, [confirmNavigationDiscard, invalidate, recheckContext]);

  const loadNextWorkspacePage = useCallback(async () => {
    const cursor = currentContext.current.workspaces.nextCursor;
    if (
      !cursor ||
      pageBusy.current ||
      writeBusy.current ||
      isSigningOut.current
    )
      return;
    pageBusy.current = true;
    const currentGen = generation.current;
    const actor = currentContext.current.account.id;
    const abort = new AbortController();
    pageController.current = abort;
    try {
      const res = await fetch(
        `/api/workspaces?limit=20&cursor=${encodeURIComponent(cursor)}`,
        {
          cache: "no-store",
          signal: AbortSignal.any([abort.signal, AbortSignal.timeout(15000)]),
        },
      );
      if (!res.ok) throw new Error("Unavailable");
      const data: { items: WorkspaceChoice[]; nextCursor: string | null } =
        await res.json();
      if (
        !isMounted.current ||
        currentGen !== generation.current ||
        actor !== currentContext.current.account.id ||
        cursor !== currentContext.current.workspaces.nextCursor
      )
        return;
      const previous = currentContext.current;
      const ids = new Set(previous.workspaces.items.map((item) => item.id));
      const items = data.items.filter((item) => {
        if (ids.has(item.id)) return false;
        ids.add(item.id);
        return true;
      });
      const next = {
        ...previous,
        workspaces: {
          ...previous.workspaces,
          items: [...previous.workspaces.items, ...items],
          nextCursor: data.nextCursor,
          error: undefined,
        },
      };
      currentContext.current = next;
      setContext(next);
    } catch {
      if (isMounted.current && currentGen === generation.current) {
        const next = {
          ...currentContext.current,
          workspaces: {
            ...currentContext.current.workspaces,
            error: "SERVICE_UNAVAILABLE",
          },
        };
        currentContext.current = next;
        setContext(next);
      }
    } finally {
      pageBusy.current = false;
    }
  }, []);

  const navigate = useCallback(
    async (destination: AppDestination | "/") => {
      if (
        (!isAppDestination(destination) && destination !== "/") ||
        navigationBusy.current ||
        writeBusy.current ||
        isSigningOut.current
      )
        return false;
      if (destination === window.location.pathname) return true;
      navigationBusy.current = true;
      try {
        if (!(await confirmNavigationDiscard())) return false;
        clearInvitation();
        conceal();
        if (destination === "/")
          window.location.assign(new URL("/#", window.location.origin).href);
        else router.push(destination);
        return true;
      } finally {
        navigationBusy.current = false;
      }
    },
    [clearInvitation, conceal, confirmNavigationDiscard, router],
  );

  const signOut = useCallback(async () => {
    if (isSigningOut.current) return;
    isSigningOut.current = true;
    conceal();
    discardPrivate();
    setAccountState("signing-out");
    try {
      const result = await authClient.signOut({
        fetchOptions: { timeout: 15000 },
      });
      if (result?.error || result?.data?.success !== true)
        throw new Error("Unconfirmed sign-out");
      if (!isMounted.current) return;
      window.location.replace("/sign-in#");
    } catch {
      isSigningOut.current = false;
      if (isMounted.current) {
        setAccountState("unavailable");
        setErrorMessage("signOutFailed");
      }
    }
  }, [conceal, discardPrivate]);

  const value: ApplicationRuntimeContextValue = {
    ...context,
    accountState,
    generation: generationCount,
    teamEpoch,
    switchWorkspace,
    clearSelection,
    loadNextWorkspacePage,
    refreshContext: async () => {
      if (!writeBusy.current) await recheckContext();
    },
    signOut,
    navigate,
    registerDirtyForm,
    isAnyFormDirty,
    confirmNavigationDiscard,
    errorMessage,
  };
  return (
    <ApplicationRuntimeContext.Provider value={value}>
      {accountState === "checking" ? (
        <span className="sr-only" role="status">
          {t("checkingAccount")}
        </span>
      ) : (
        (accountState === "signing-out" || accountState === "unavailable") && (
          <div
            className="flex min-h-svh w-full items-center justify-center p-6"
            role="status"
          >
            <Alert className="max-w-md">
              <AlertDescription>
                {t(
                  errorMessage ||
                    (accountState === "signing-out"
                      ? "signingOut"
                      : "checkingAccount"),
                )}
              </AlertDescription>
              {accountState === "unavailable" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="lg" onClick={() => void recheckContext()}>
                    {c("retry")}
                  </Button>
                  {errorMessage === "signOutFailed" && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => void signOut()}
                    >
                      {t("signOut")}
                    </Button>
                  )}
                </div>
              )}
            </Alert>
          </div>
        )
      )}
      <div
        ref={protectedContainer}
        data-testid="application-runtime-root"
        inert={accountState !== "ready"}
        style={{ display: accountState === "ready" ? "flex" : "none" }}
        className="min-h-svh w-full flex-1"
      >
        {children}
      </div>
    </ApplicationRuntimeContext.Provider>
  );
}
