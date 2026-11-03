"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useApplicationRuntime } from "@/components/application-runtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export type ReauthActionType = "revoke_session" | "revoke_other_sessions";

export interface AccountReauthenticationProps {
  action?: ReauthActionType;
  targetReference?: string;
  onSuccess?: (receipt: {
    operationId: string;
    state: string;
    results: any[];
  }) => void;
  onCancel?: () => void;
  className?: string;
}

type ReauthState =
  | "idle"
  | "creating_intent"
  | "awaiting_password"
  | "confirming"
  | "revoking"
  | "accepted"
  | "partial"
  | "unknown"
  | "error";

export function AccountReauthentication({
  action = "revoke_other_sessions",
  targetReference,
  onSuccess,
  onCancel,
  className = "",
}: AccountReauthenticationProps) {
  const t = useTranslations("AccountSecurity");
  const c = useTranslations("Common");
  const runtime = useApplicationRuntime();

  const [state, setState] = useState<ReauthState>("idle");
  const [confirmationId, setConfirmationId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [methodUnavailable, setMethodUnavailable] = useState(false);

  // Track initial generation to suppress late responses if session changes
  const startGeneration = useRef(runtime.generation);

  // Register dirty form while password input has content or confirmation is pending
  useEffect(() => {
    if (state === "awaiting_password" && password.length > 0) {
      const unregister = runtime.registerDirtyForm("reauth-confirmation", {
        isDirty: () => password.length > 0,
        discard: () => {
          setPassword("");
          setState("idle");
          setConfirmationId(null);
        },
      });
      return unregister;
    }
  }, [state, password, runtime]);

  // Reset state if account generation or session changes
  useEffect(() => {
    if (runtime.generation !== startGeneration.current) {
      setState("idle");
      setConfirmationId(null);
      setPassword("");
      setErrorMessage(null);
      startGeneration.current = runtime.generation;
    }
  }, [runtime.generation]);

  const handleStartIntent = async () => {
    setErrorMessage(null);
    setMethodUnavailable(false);
    setState("creating_intent");

    try {
      const payload: Record<string, string> = {
        action,
        method: "password",
      };
      if (action === "revoke_session" && targetReference) {
        payload.targetReference = targetReference;
      }

      const res = await fetch("/api/account/reauthentication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (runtime.generation !== startGeneration.current) return;

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 503 || data.error?.code === "METHOD_UNAVAILABLE") {
          setMethodUnavailable(true);
        }
        throw new Error(data.error?.message || c("unavailable"));
      }

      setConfirmationId(data.confirmationId);
      setState("awaiting_password");
    } catch (err: any) {
      if (runtime.generation !== startGeneration.current) return;
      setErrorMessage(err.message || c("unavailable"));
      setState("error");
    }
  };

  const handleConfirmAndRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationId || !password.trim()) return;

    setErrorMessage(null);
    setState("confirming");

    try {
      // Step 1: Verify freshness via password confirmation
      const verifyRes = await fetch("/api/account/reauthentication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmationId,
          password,
        }),
      });

      if (runtime.generation !== startGeneration.current) return;

      const verifyData = await verifyRes.json().catch(() => ({}));

      if (!verifyRes.ok) {
        if (
          verifyRes.status === 503 ||
          verifyData.error?.code === "METHOD_UNAVAILABLE"
        ) {
          setMethodUnavailable(true);
        }
        throw new Error(verifyData.error?.message || c("unavailable"));
      }

      // Step 2: Dispatch exact target revocation
      setState("revoking");
      const operationId = crypto.randomUUID();

      const revokeRes = await fetch("/api/account/session-revocations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operationId,
          confirmationId,
        }),
      });

      if (runtime.generation !== startGeneration.current) return;

      const revokeData = await revokeRes.json().catch(() => ({}));

      if (!revokeRes.ok && revokeRes.status !== 202) {
        throw new Error(revokeData.error?.message || c("unavailable"));
      }

      const receipt = {
        operationId: revokeData.operationId || operationId,
        state: revokeData.state || "unknown",
        results: revokeData.results || [],
      };

      if (receipt.state === "accepted") {
        setState("accepted");
      } else if (receipt.state === "partial") {
        setState("partial");
      } else {
        setState("unknown");
      }

      setPassword("");
      onSuccess?.(receipt);
    } catch (err: any) {
      if (runtime.generation !== startGeneration.current) return;
      setErrorMessage(err.message || c("unavailable"));
      setState("error");
    }
  };

  const handleCancel = () => {
    setState("idle");
    setConfirmationId(null);
    setPassword("");
    setErrorMessage(null);
    setMethodUnavailable(false);
    onCancel?.();
  };

  return (
    <Card className={`border shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">
          {action === "revoke_other_sessions"
            ? t("revokeOthersTitle")
            : t("title")}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {action === "revoke_other_sessions"
            ? t("revokeOthersDesc")
            : t("description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {state === "idle" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {t("ordinarySignOutNote")}
            </p>
          </div>
        )}

        {state === "creating_intent" && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>{c("loading")}</span>
          </div>
        )}

        {state === "awaiting_password" && (
          <form onSubmit={handleConfirmAndRevoke} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reauth-password" className="text-sm font-medium">
                {t("passwordLabel")}
              </Label>
              <Input
                id="reauth-password"
                name="current-password"
                type="password"
                autoComplete="current-password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="max-w-md"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {t("proofExpiryNotice")}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={!password.trim()}
                className="font-medium"
              >
                {t("confirmButton")}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t("cancel")}
              </Button>
            </div>
          </form>
        )}

        {(state === "confirming" || state === "revoking") && (
          <div className="flex items-center space-x-3 py-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>
              {state === "confirming" ? t("confirming") : t("revoking")}
            </span>
          </div>
        )}

        {state === "accepted" && (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            <AlertDescription className="text-sm font-medium">
              {t("revocationSuccess")}
            </AlertDescription>
          </Alert>
        )}

        {state === "partial" && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertDescription className="text-sm font-medium">
              {t("revocationPartial")}
            </AlertDescription>
          </Alert>
        )}

        {state === "unknown" && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertDescription className="text-sm font-medium">
              {t("revocationUnknown")}
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription className="text-sm">
              {methodUnavailable ? t("socialUnavailable") : errorMessage}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      {state === "idle" && (
        <CardFooter className="pt-0">
          <Button
            onClick={handleStartIntent}
            variant="destructive"
            className="font-medium"
          >
            {action === "revoke_other_sessions"
              ? t("revokeOthersButton")
              : t("confirmButton")}
          </Button>
        </CardFooter>
      )}

      {(state === "accepted" ||
        state === "partial" ||
        state === "unknown" ||
        state === "error") && (
        <CardFooter className="pt-0">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            {c("retry")}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
