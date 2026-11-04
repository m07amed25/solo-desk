"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { SignIn } from "@/components/sign-in";
import { AuthEmailForm } from "@/components/auth-email-form";
import type { AppDestination, AuthEntry } from "@/lib/site";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { signInPasskey } from "@/lib/auth/security-client";

export function AuthInteractivePanel({
  entry,
  returnTo = "/app",
  failed,
  credentialsEnabled = false,
  appMode = false,
  providers,
}: {
  entry: AuthEntry;
  returnTo?: AppDestination;
  failed: boolean;
  credentialsEnabled?: boolean;
  appMode?: boolean;
  providers?: string[];
}) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const security = useTranslations("Security");
  const [inFlight, setInFlight] = useState(false);
  const [isInnerStep, setIsInnerStep] = useState(false);
  const [authError, setAuthError] = useState<string | null>(
    failed ? t("failed") : null,
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Top-level failure banner if URL contained authError=1 */}
      {authError && !isInnerStep && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between gap-2">
            <span>{authError}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 underline text-xs font-normal hover:bg-transparent"
              onClick={() => setAuthError(null)}
            >
              {t("dismiss")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Social login buttons (only visible during top-level form step) */}
      {!isInnerStep && (
        <>
          <SignIn
            entry={entry}
            returnTo={returnTo}
            failed={false}
            providers={providers}
            disabled={inFlight}
            onInFlightChange={(busy) => {
              if (busy) setAuthError(null);
              setInFlight(busy);
            }}
          />
          {appMode && entry === "sign-in" && (
            <Button
              variant="outline"
              disabled={inFlight}
              onClick={async () => {
                setInFlight(true);
                setAuthError(null);
                try {
                  await signInPasskey();
                  router.push(
                    `/app/account/security?returnTo=${encodeURIComponent(returnTo)}#`,
                  );
                } catch {
                  setAuthError(security("failed"));
                  setInFlight(false);
                }
              }}
            >
              {security("signInPasskey")}
            </Button>
          )}
          {credentialsEnabled && (
            <div className="relative my-1 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <span className="relative bg-background px-3 text-xs uppercase text-muted-foreground font-medium">
                {t("orDivider")}
              </span>
            </div>
          )}
        </>
      )}

      {/* Email / password / verification / recovery form */}
      <AuthEmailForm
        entry={entry}
        returnTo={returnTo}
        disabled={inFlight}
        credentialsEnabled={credentialsEnabled}
        onInFlightChange={(busy) => {
          if (busy) setAuthError(null);
          setInFlight(busy);
        }}
        onStepChange={(step) => {
          setAuthError(null);
          setIsInnerStep(step !== "form");
        }}
      />
    </div>
  );
}
