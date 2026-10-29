"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { authFailure, type AuthEntry } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SignIn({entry, failed}: {entry: AuthEntry; failed: boolean}) {
  const t = useTranslations("Auth");
  const inFlight = useRef(false);
  const [attempt, setAttempt] = useState<"idle" | "pending" | "failed">(failed ? "failed" : "idle");
  const [providerName, setProviderName] = useState("");

  async function signInWith(provider: "google" | "github") {
    if (inFlight.current) return;
    inFlight.current = true;
    setAttempt("pending");
    setProviderName(provider === "google" ? "Google" : "GitHub");
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/auth/callback?entry=${entry}`,
        errorCallbackURL: `${window.location.origin}${authFailure(entry)}`,
      });
      if (result.error) throw new Error("Provider unavailable");
      // Keep the guard closed until document navigation completes.
    } catch {
      inFlight.current = false;
      setAttempt("failed");
    }
  }

  return <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-3">
      <Button type="button" variant="outline" size="lg" disabled={attempt === "pending"} onClick={() => signInWith("google")}><span className="provider-icon provider-google" data-icon="inline-start" aria-hidden="true" /><bdi>{t("google")}</bdi></Button>
      <Button type="button" variant="outline" size="lg" disabled={attempt === "pending"} onClick={() => signInWith("github")}><span className="provider-icon provider-github" data-icon="inline-start" aria-hidden="true" /><bdi>{t("github")}</bdi></Button>
    </div>
    {attempt === "pending" && <p role="status" className="text-sm text-muted-foreground">{t("pending", {provider: providerName})}</p>}
    {attempt === "failed" && <Alert><AlertDescription>{providerName ? t("startFailed", {provider: providerName}) : t("failed")}</AlertDescription></Alert>}
  </div>;
}
