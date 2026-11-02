"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { acceptWorkspaceInvitationAction } from "@/app/workspace-actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type EntryState =
  | "absent"
  | "captured"
  | "malformed"
  | "accepting"
  | "accepted"
  | "rejected"
  | "unavailable";
type InvitationCommand = { token: string; operationId: string };
type Entry = {
  state: EntryState;
  clear: () => void;
  begin: () => InvitationCommand | null;
  finish: (
    command: InvitationCommand,
    result: "accepted" | "rejected" | "unavailable",
  ) => void;
};
const InvitationEntry = createContext<Entry | null>(null);
export function useInvitationEntry() {
  const entry = useContext(InvitationEntry);
  if (!entry) throw new Error("InvitationEntryProvider is required");
  return entry;
}

export function InvitationEntryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [state, setState] = useState<EntryState>("absent");
  const proof = useRef<string | null>(null);
  const pending = useRef<InvitationCommand | null>(null);
  const clear = useCallback(() => {
    if (window.location.hash)
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
      );
    proof.current = null;
    pending.current = null;
    setState("absent");
  }, []);
  useLayoutEffect(() => {
    const capture = () => {
      const hash = window.location.hash;
      if (!hash) return;
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
      );
      if (pending.current) return;
      proof.current = null;
      try {
        if (hash.length > 4096) throw new Error("Invalid fragment");
        const fields = new URLSearchParams(hash.slice(1));
        const encoded = hash.slice(1).match(/^invitation=([^&]+)$/)?.[1];
        if (!encoded || fields.size !== 1) throw new Error("Invalid fragment");
        const token = decodeURIComponent(encoded);
        if (!token || token.length > 1024) throw new Error("Invalid proof");
        proof.current = token;
        setState("captured");
      } catch {
        setState("malformed");
      }
    };
    capture();
    window.addEventListener("hashchange", capture);
    window.addEventListener("pagehide", clear);
    return () => {
      clear();
      window.removeEventListener("hashchange", capture);
      window.removeEventListener("pagehide", clear);
    };
  }, [pathname, clear]);
  const begin = useCallback(() => {
    if (!proof.current) return null;
    pending.current ??= {
      token: proof.current,
      operationId: crypto.randomUUID(),
    };
    setState("accepting");
    return pending.current;
  }, []);
  const finish = useCallback(
    (
      command: InvitationCommand,
      result: "accepted" | "rejected" | "unavailable",
    ) => {
      if (pending.current !== command) return;
      if (result !== "unavailable") {
        proof.current = null;
        pending.current = null;
      }
      setState(result);
    },
    [],
  );
  return (
    <InvitationEntry.Provider value={{ state, clear, begin, finish }}>
      {children}
    </InvitationEntry.Provider>
  );
}

export function WorkspaceInvitation({
  enabled,
  accountReady,
  onAccepted,
}: {
  enabled: boolean;
  accountReady: boolean;
  onAccepted: () => Promise<void>;
}) {
  const t = useTranslations("Workspaces");
  const entry = useInvitationEntry();
  const inFlight = useRef(false);
  if (entry.state === "absent") return null;
  const actionable =
    accountReady &&
    enabled &&
    (entry.state === "captured" || entry.state === "unavailable");
  const label =
    entry.state === "malformed"
      ? "invitationReopen"
      : !accountReady
        ? "invitationAwaitingAccount"
        : !enabled
          ? "invitationDisabled"
          : entry.state === "captured"
            ? "invitationDescription"
            : entry.state === "accepted"
              ? "invitationAccepted"
              : entry.state === "accepting"
                ? "accepting"
                : entry.state === "unavailable"
                  ? "invitationUncertain"
                  : "invitationUnavailable";
  const accept = async () => {
    if (!actionable || inFlight.current) return;
    const command = entry.begin();
    if (!command) return;
    inFlight.current = true;
    try {
      const result = await acceptWorkspaceInvitationAction(command);
      entry.finish(command, result.success ? "accepted" : "rejected");
      if (result.success) await onAccepted();
    } catch {
      entry.finish(command, "unavailable");
    } finally {
      inFlight.current = false;
    }
  };
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t("invitationTitle")}</CardTitle>
        <CardDescription role="status">{t(label)}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-wrap justify-end gap-2">
        <Button
          size="lg"
          variant="outline"
          onClick={entry.clear}
          disabled={entry.state === "accepting"}
        >
          {t("dismiss")}
        </Button>
        {actionable && (
          <Button size="lg" onClick={() => void accept()}>
            {t("acceptInvitation")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
