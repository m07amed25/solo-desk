"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Mail, Check, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { acceptWorkspaceInvitationAction } from "@/app/workspace-actions";

export function WorkspaceInvitation() {
  const t = useTranslations("Workspaces");
  const [token, setToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [outcome, setOutcome] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const match = window.location.hash.match(/[#&]invitation=([^&]+)/);
      if (match && match[1]) {
        const extracted = decodeURIComponent(match[1]);
        // Immediately scrub the fragment from history and URL bar to protect the bearer token
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
        queueMicrotask(() => {
          setToken(extracted);
        });
      }
    }
  }, []);

  if (!token && !outcome) {
    return null;
  }

  const handleAccept = () => {
    if (!token) return;
    setOutcome(null);

    startTransition(async () => {
      const operationId = crypto.randomUUID();
      const res = await acceptWorkspaceInvitationAction({
        operationId,
        token,
      });

      if (!res.success) {
        setOutcome({
          type: "error",
          message: t("invitationUnavailable"),
        });
        setToken(null);
        return;
      }

      setOutcome({
        type: "success",
        message: t("invitationAccepted"),
      });
      setToken(null);

      // Brief pause then reload to populate the newly selected workspace
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  };

  return (
    <div className="mb-6">
      {outcome && (
        <Alert variant={outcome.type === "error" ? "destructive" : "default"}>
          <div className="flex items-center gap-2">
            {outcome.type === "error" ? (
              <AlertCircle className="size-4 shrink-0" />
            ) : (
              <Check className="size-4 shrink-0 text-green-500" />
            )}
            <AlertDescription>{outcome.message}</AlertDescription>
          </div>
        </Alert>
      )}

      {token && !outcome && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              <CardTitle>{t("invitationTitle")}</CardTitle>
            </div>
            <CardDescription>{t("invitationDescription")}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setToken(null)}
              disabled={isPending}
            >
              {t("dismiss")}
            </Button>
            <Button size="sm" onClick={handleAccept} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {t("acceptInvitation")}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
