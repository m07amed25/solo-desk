"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  securityRequest,
  type SecurityStatus,
} from "@/lib/auth/security-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AppDestination } from "@/lib/site";

type Intent = {
  path: string;
  body: Record<string, unknown>;
  title: string;
  get?: boolean;
};
type Material = { totpURI?: string; backupCodes: string[] };

export function AccountSecurity({
  returnTo = "/app/account",
}: {
  returnTo?: AppDestination;
}) {
  const t = useTranslations("Security");
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [error, setError] = useState<"" | "failed" | "cooldown" | "usedCode">(
    "",
  );
  const [notice, setNotice] = useState<"" | "saved" | "emailSent">("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [backup, setBackup] = useState(false);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [material, setMaterial] = useState<Material | null>(null);
  const [saved, setSaved] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailStep, setEmailStep] = useState<"current" | "new">("current");
  const root = useRef<HTMLDivElement>(null);
  const generation = useRef(0);
  const inFlight = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const owner = useRef<string | undefined>(undefined);

  const clearSecrets = useCallback(() => {
    setPassword("");
    setCode("");
    setEmailCode("");
    setMaterial(null);
    setIntent(null);
    setSaved(false);
  }, []);
  const refresh = useCallback(async () => {
    const epoch = generation.current;
    const next = await securityRequest<SecurityStatus>(
      "/security/status",
      undefined,
      { signal: controller.current?.signal },
    );
    if (epoch !== generation.current) return;
    if (owner.current && next.userId !== owner.current) clearSecrets();
    owner.current = next.userId;
    setStatus(next);
    if (root.current) root.current.hidden = false;
    return next;
  }, [clearSecrets]);
  useEffect(() => {
    let mounted = true;
    const conceal = () => {
      if (root.current) root.current.hidden = true;
      generation.current++;
      controller.current?.abort();
      clearSecrets();
      setStatus(null);
    };
    const foreground = () => {
      if (document.visibilityState === "hidden") {
        conceal();
        return;
      }
      if (inFlight.current) return;
      controller.current = new AbortController();
      void refresh().catch(() => {
        if (mounted) {
          setError("failed");
          if (root.current) root.current.hidden = false;
        }
      });
    };
    foreground();
    window.addEventListener("pagehide", conceal);
    window.addEventListener("pageshow", foreground);
    document.addEventListener("visibilitychange", foreground);
    return () => {
      mounted = false;
      // Invalidate the latest request generation; this ref is a counter, not a DOM node.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
      controller.current?.abort();
      window.removeEventListener("pagehide", conceal);
      window.removeEventListener("pageshow", foreground);
      document.removeEventListener("visibilitychange", foreground);
    };
  }, [clearSecrets, refresh]);

  async function run(work: (signal: AbortSignal) => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const epoch = generation.current;
    const abort = new AbortController();
    controller.current = abort;
    try {
      await work(abort.signal);
      if (epoch === generation.current) await refresh();
    } catch (cause) {
      if (epoch === generation.current)
        setError(
          cause instanceof Error && cause.message === "cooldown"
            ? "cooldown"
            : cause instanceof Error && cause.message === "usedCode"
              ? "usedCode"
              : "failed",
        );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function confirm(signal: AbortSignal) {
    if (!intent) return;
    const selected = intent;
    const epoch = generation.current;
    const body = selected.path.startsWith("/two-factor/")
      ? { ...selected.body, password }
      : selected.body;
    const confirmation = {
      action: selected.path,
      body,
      password,
      ...(code ? { code } : {}),
    };
    setPassword("");
    setCode("");
    setIntent(null);
    const { proof } = await securityRequest<{ proof: string }>(
      "/security/confirm",
      confirmation,
      { signal },
    );
    if (signal.aborted || epoch !== generation.current) return;
    if (selected.get) {
      const { startRegistration } = await import("@simplewebauthn/browser");
      const optionsJSON = await securityRequest<
        Parameters<typeof startRegistration>[0]["optionsJSON"]
      >(selected.path, undefined, { signal, proof });
      const response = await startRegistration({ optionsJSON });
      if (signal.aborted || epoch !== generation.current) return;
      await securityRequest(
        "/passkey/verify-registration",
        { response, name: t("passkeyName") },
        { signal },
      );
    } else {
      const result = await securityRequest<Material & { url?: string }>(
        selected.path,
        body,
        { signal, proof },
      );
      if (signal.aborted || epoch !== generation.current) return;
      if (result.backupCodes) {
        setMaterial(result);
        setSaved(false);
      }
      if (selected.path === "/email-otp/request-email-change") {
        setEmailStep("new");
        setEmailCode("");
      }
      if (selected.path === "/email-otp/change-email") {
        setEmailStep("current");
        setNewEmail("");
        setEmailCode("");
      }
      if (result.url) {
        const target = new URL(result.url);
        if (target.protocol !== "https:") throw new Error("failed");
        window.location.assign(target.href);
        return;
      }
    }
    setNotice("saved");
  }

  const normal =
    status?.state === "ready" &&
    (!status.factorEnabled || status.recoveryAcknowledged);
  const pending = status?.factorEnabled && !status.recoveryAcknowledged;
  function select(
    path: string,
    body: Record<string, unknown>,
    title: string,
    get = false,
  ) {
    clearSecrets();
    setIntent({ path, body, title, get });
    setNotice("");
    setError("");
  }
  function section(
    title: string,
    description: string,
    children: React.ReactNode,
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{title}</h2>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
    );
  }

  return (
    <div ref={root} className="flex flex-col gap-6" aria-busy={busy}>
      <div aria-live="polite">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{t(error)}</AlertDescription>
          </Alert>
        )}
        {notice && (
          <p role="status" className="text-sm">
            {t(notice)}
          </p>
        )}
      </div>
      {!status && (
        <>
          <p role="status">{t("checking")}</p>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void run(async () => {})}
          >
            {t("retry")}
          </Button>
        </>
      )}
      {status?.state === "signed-out" && (
        <Alert>
          <AlertDescription>
            <a
              className="underline"
              href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}
            >
              {t("signIn")}
            </a>
          </AlertDescription>
        </Alert>
      )}
      {status?.state === "challenge" &&
        section(
          t("challengeTitle"),
          t("challengeBody"),
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const submitted = code;
              setCode("");
              void run(async (signal) => {
                await securityRequest(
                  backup
                    ? "/two-factor/verify-backup-code"
                    : "/two-factor/verify-totp",
                  { code: submitted },
                  { signal },
                );
                const next = await refresh();
                if (next?.state === "ready" && next.recoveryAcknowledged)
                  window.location.replace(`${returnTo}#`);
              });
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="factor-code">
                  {t(backup ? "recoveryCode" : "authenticatorCode")}
                </FieldLabel>
                <Input
                  id="factor-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="one-time-code"
                  inputMode={backup ? "text" : "numeric"}
                  pattern={backup ? undefined : "[0-9]{6}"}
                  maxLength={backup ? 30 : 6}
                  required
                  disabled={busy}
                  dir="ltr"
                />
              </Field>
              <Button type="submit" disabled={busy}>
                {t("verify")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setBackup(!backup);
                  setCode("");
                }}
              >
                {t(backup ? "useAuthenticator" : "useRecovery")}
              </Button>
            </FieldGroup>
          </form>,
        )}
      {status?.state === "recovery" && (
        <Alert>
          <AlertDescription>{t("recoveryRequired")}</AlertDescription>
        </Alert>
      )}
      {(normal || status?.state === "recovery" || pending) &&
        !intent &&
        section(
          t("factorTitle"),
          t(status?.factorEnabled ? "factorEnabled" : "factorDisabled"),
          <>
            {!status?.hasPassword && <p>{t("passwordRequired")}</p>}
            {!status?.factorEnabled && (
              <Button
                disabled={busy || !status?.hasPassword}
                onClick={() =>
                  select("/two-factor/enable", { method: "totp" }, t("enable"))
                }
              >
                {t("enable")}
              </Button>
            )}
            {status?.factorEnabled && (
              <p className="text-sm">
                {t("remaining", { count: status.recoveryRemaining || 0 })}
              </p>
            )}
            {normal && status?.factorEnabled && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => select("/two-factor/disable", {}, t("disable"))}
              >
                {t("disable")}
              </Button>
            )}
            {status?.factorEnabled && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() =>
                  select(
                    "/two-factor/generate-backup-codes",
                    {},
                    t("replaceCodes"),
                  )
                }
              >
                {t("replaceCodes")}
              </Button>
            )}
            {pending && !material && <p role="status">{t("lostMaterial")}</p>}
          </>,
        )}
      {intent &&
        section(
          intent.title,
          t("confirmBody"),
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void run(confirm);
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="security-password">
                  {t("password")}
                </FieldLabel>
                <Input
                  id="security-password"
                  type="password"
                  autoComplete="current-password"
                  maxLength={128}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                />
              </Field>
              {status?.factorEnabled && (
                <Field>
                  <FieldLabel htmlFor="security-fresh-code">
                    {t("freshCode")}
                  </FieldLabel>
                  <Input
                    id="security-fresh-code"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={busy}
                    dir="ltr"
                  />
                </Field>
              )}
              <Button type="submit" disabled={busy}>
                {t("confirm")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setIntent(null);
                  setPassword("");
                  setCode("");
                }}
              >
                {t("cancel")}
              </Button>
            </FieldGroup>
          </form>,
        )}
      {material &&
        section(
          t("saveMaterial"),
          t("materialWarning"),
          <>
            {material.totpURI && (
              <>
                <p>{t("manualSetup")}</p>
                <code
                  dir="ltr"
                  className="break-all rounded-md bg-muted p-3 select-all"
                >
                  {new URL(material.totpURI).searchParams.get("secret")}
                </code>
              </>
            )}
            <ul dir="ltr" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {material.backupCodes.map((item) => (
                <li key={item}>
                  <code className="select-all font-mono">{item}</code>
                </li>
              ))}
            </ul>
            {!status?.factorEnabled && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const submitted = code;
                  setCode("");
                  void run(async (signal) => {
                    await securityRequest(
                      "/two-factor/verify-totp",
                      { code: submitted },
                      { signal },
                    );
                  });
                }}
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="enrollment-code">
                      {t("authenticatorCode")}
                    </FieldLabel>
                    <Input
                      id="enrollment-code"
                      required
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={busy}
                      dir="ltr"
                    />
                  </Field>
                  <Button type="submit" disabled={busy}>
                    {t("verify")}
                  </Button>
                </FieldGroup>
              </form>
            )}
            <Field orientation="horizontal">
              <Switch
                id="codes-saved"
                checked={saved}
                onCheckedChange={setSaved}
                disabled={busy}
              />
              <FieldLabel htmlFor="codes-saved">{t("codesSaved")}</FieldLabel>
            </Field>
            <Button
              disabled={busy || !saved || !status?.factorEnabled}
              onClick={() =>
                void run(async (signal) => {
                  const result = await securityRequest<{
                    requiresSignIn: boolean;
                  }>(
                    "/security/acknowledge",
                    { generation: status?.recoveryGeneration, saved: true },
                    { signal },
                  );
                  clearSecrets();
                  window.location.replace(
                    result.requiresSignIn
                      ? `/sign-in?returnTo=${encodeURIComponent(returnTo)}#`
                      : `${returnTo}#`,
                  );
                })
              }
            >
              {t("finish")}
            </Button>
          </>,
        )}
      {normal && !intent && !material && (
        <>
          {section(
            t("emailTitle"),
            t("emailBody"),
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-email">{t("newEmail")}</FieldLabel>
                <Input
                  id="new-email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setEmailStep("current");
                    setEmailCode("");
                  }}
                  disabled={busy}
                  dir="ltr"
                />
              </Field>
              <Button
                variant="outline"
                disabled={busy || !status.hasPassword}
                onClick={() =>
                  void run(async (signal) => {
                    await securityRequest(
                      "/email-otp/send-verification-otp",
                      { email: status.email, type: "email-verification" },
                      { signal },
                    );
                    setNotice("emailSent");
                  })
                }
              >
                {t("sendCurrentCode")}
              </Button>
              <Field>
                <FieldLabel htmlFor="email-code">
                  {t(
                    emailStep === "current"
                      ? "currentEmailCode"
                      : "newEmailCode",
                  )}
                </FieldLabel>
                <Input
                  id="email-code"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  disabled={busy}
                  dir="ltr"
                />
              </Field>
              <Button
                disabled={
                  busy || !newEmail || !emailCode || !status.hasPassword
                }
                onClick={() =>
                  select(
                    emailStep === "current"
                      ? "/email-otp/request-email-change"
                      : "/email-otp/change-email",
                    { newEmail, otp: emailCode },
                    t("emailTitle"),
                  )
                }
              >
                {t(emailStep === "current" ? "verifyCurrent" : "changeEmail")}
              </Button>
            </FieldGroup>,
          )}
          {section(
            t("methodsTitle"),
            t("methodsBody"),
            <>
              {status.accounts
                ?.filter((item) => item.providerId !== "credential")
                .map((item) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3"
                    key={item.id}
                  >
                    <span>
                      <bdi>
                        {item.providerId === "google" ? "Google" : "GitHub"}
                      </bdi>
                    </span>
                    <Button
                      variant="outline"
                      disabled={busy || !status.hasPassword}
                      onClick={() =>
                        select(
                          "/unlink-account",
                          { accountId: item.id },
                          t("unlink"),
                        )
                      }
                    >
                      {t("unlink")}
                    </Button>
                  </div>
                ))}
              {status.providers
                ?.filter(
                  (provider) =>
                    !status.accounts?.some(
                      (item) => item.providerId === provider,
                    ),
                )
                .map((provider) => (
                  <Button
                    variant="outline"
                    key={provider}
                    disabled={busy || !status.hasPassword}
                    onClick={() =>
                      select(
                        "/link-social",
                        {
                          provider,
                          callbackURL: `${window.location.origin}/app/account/security`,
                          errorCallbackURL: `${window.location.origin}/app/account/security`,
                        },
                        t("link", {
                          provider: provider === "google" ? "Google" : "GitHub",
                        }),
                      )
                    }
                  >
                    {t("link", {
                      provider: provider === "google" ? "Google" : "GitHub",
                    })}
                  </Button>
                ))}
              {status.passkeys?.map((key) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3"
                  key={key.id}
                >
                  <span className="break-all">
                    <bdi>{key.name}</bdi>
                  </span>
                  <Button
                    variant="outline"
                    disabled={busy || !status.hasPassword}
                    onClick={() =>
                      select(
                        "/passkey/delete-passkey",
                        { id: key.id },
                        t("removePasskey"),
                      )
                    }
                  >
                    {t("removePasskey")}
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                disabled={busy || !status.hasPassword}
                onClick={() =>
                  select(
                    "/passkey/generate-register-options",
                    {},
                    t("addPasskey"),
                    true,
                  )
                }
              >
                {t("addPasskey")}
              </Button>
            </>,
          )}
        </>
      )}
      {normal &&
        !intent &&
        !material &&
        section(
          t("sessionsTitle"),
          t("sessionsBody"),
          <>
            {status?.sessions?.map((session) => (
              <div
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <span className="text-sm">
                  <bdi>{new Date(session.createdAt).toLocaleString()}</bdi>
                  {session.current ? ` · ${t("currentSession")}` : ""}
                </span>
                {!session.current && (
                  <Button
                    variant="outline"
                    disabled={busy || !status?.hasPassword}
                    onClick={() =>
                      select(
                        "/security/revoke-sessions",
                        { ids: [session.id] },
                        t("endSession"),
                      )
                    }
                  >
                    {t("endSession")}
                  </Button>
                )}
              </div>
            ))}
            {!!status?.sessions?.some((session) => !session.current) && (
              <Button
                variant="outline"
                disabled={busy || !status.hasPassword}
                onClick={() =>
                  select(
                    "/security/revoke-sessions",
                    {
                      ids: status
                        .sessions!.filter((session) => !session.current)
                        .map((session) => session.id),
                    },
                    t("endListed"),
                  )
                }
              >
                {t("endListed")}
              </Button>
            )}
          </>,
        )}
      {status && status.state !== "signed-out" && (
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() =>
            void run(async (signal) => {
              await securityRequest("/sign-out", {}, { signal });
              clearSecrets();
              window.location.replace("/sign-in#");
            })
          }
        >
          {t("signOut")}
        </Button>
      )}
    </div>
  );
}
