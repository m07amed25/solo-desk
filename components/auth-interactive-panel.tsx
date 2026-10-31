"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SignIn } from "@/components/sign-in";
import { AuthEmailForm } from "@/components/auth-email-form";
import type { AuthEntry } from "@/lib/site";

export function AuthInteractivePanel({
  entry,
  failed,
}: {
  entry: AuthEntry;
  failed: boolean;
}) {
  const t = useTranslations("Auth");
  const [inFlight, setInFlight] = useState(false);
  const [isInnerStep, setIsInnerStep] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* Social login buttons (only visible during top-level form step) */}
      {!isInnerStep && (
        <>
          <SignIn
            entry={entry}
            failed={failed}
            disabled={inFlight}
            onInFlightChange={setInFlight}
          />
          <div className="relative my-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <span className="relative bg-background px-3 text-xs uppercase text-muted-foreground font-medium">
              {t("orDivider")}
            </span>
          </div>
        </>
      )}

      {/* Email / password / verification / recovery form */}
      <AuthEmailForm
        entry={entry}
        disabled={inFlight}
        onInFlightChange={setInFlight}
        onStepChange={(step) => setIsInnerStep(step !== "form")}
      />
    </div>
  );
}
