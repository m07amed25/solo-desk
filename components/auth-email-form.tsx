"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/client";
import type { AppDestination, AuthEntry } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Eye, EyeOff } from "lucide-react";

export type AuthEmailFormProps = {
  entry: AuthEntry;
  returnTo?: AppDestination;
  onInFlightChange?: (inFlight: boolean) => void;
  onStepChange?: (step: Step) => void;
  disabled?: boolean;
  credentialsEnabled?: boolean;
};

export type Step = "form" | "verify" | "forgot" | "reset";

export function AuthEmailForm({
  entry,
  returnTo = "/app",
  onInFlightChange,
  onStepChange,
  disabled = false,
  credentialsEnabled = false,
}: AuthEmailFormProps) {
  const t = useTranslations("Auth");
  const router = useRouter();

  // Step and operation state
  const [step, setStepState] = useState<Step>("form");

  function setStep(next: Step) {
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowNewPassword(false);
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
    setCode("");
    setFieldErrors({});
    setStepState(next);
    onStepChange?.(next);
  }

  const [status, setStatus] = useState<
    "idle" | "pending" | "failed" | "success"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Form input states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Validation error states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const inFlightRef = useRef(false);

  // Synchronous guard helper
  function setInFlight(busy: boolean) {
    inFlightRef.current = busy;
    onInFlightChange?.(busy);
  }

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Clean secrets on unmount or step change
  useEffect(() => {
    return () => {
      setPassword("");
      setConfirmPassword("");
      setNewPassword("");
      setCode("");
    };
  }, [step]);

  if (!credentialsEnabled) {
    return (
      <Alert className="border-muted bg-muted/40 text-muted-foreground">
        <AlertDescription className="text-xs leading-relaxed">
          {t("credentialsUnavailable")}
        </AlertDescription>
      </Alert>
    );
  }

  // Email format validation
  function isValidEmail(val: string): boolean {
    const trimmed = val.trim();
    if (trimmed.length === 0 || trimmed.length > 254) return false;
    return /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(trimmed);
  }

  // Name combination rule: trim parts, join with single space, 1-100 UTF-16 code units
  function formatCombinedName(first: string, last: string): string | null {
    const trimmedFirst = first.trim();
    const trimmedLast = last.trim();
    if (!trimmedFirst) return null;
    const combined = trimmedLast
      ? `${trimmedFirst} ${trimmedLast}`
      : trimmedFirst;
    if (combined.length < 1 || combined.length > 100) return null;
    return combined;
  }

  // Password complexity validation
  function validatePassword(val: string) {
    const hasMinLength = val.length >= 8 && val.length <= 128;
    const hasMixedCase = /[a-z]/.test(val) && /[A-Z]/.test(val);
    const hasNumberOrSymbol = /[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val);
    return {
      isValid: hasMinLength && hasMixedCase && hasNumberOrSymbol,
      hasMinLength,
      hasMixedCase,
      hasNumberOrSymbol,
    };
  }

  // Handle registration submission
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (inFlightRef.current || disabled) return;

    setFieldErrors({});
    setErrorMessage(null);

    const errors: Record<string, string> = {};
    const combinedName = formatCombinedName(firstName, lastName);
    if (!combinedName) {
      errors.name = t("invalidName");
    }

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      errors.email = t("invalidEmail");
    }

    // Password validation: at least 8 chars, mixed case, number or symbol
    const pwdValidation = validatePassword(password);
    if (!pwdValidation.isValid) {
      errors.password = t("passwordRequirementsNotMet");
    }

    // Repeat password validation
    if (!confirmPassword) {
      errors.confirmPassword = t("repeatPasswordRequired");
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t("passwordsDoNotMatch");
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setInFlight(true);
    setStatus("pending");

    try {
      const result = await authClient.signUp.email({
        email: trimmedEmail,
        password,
        name: combinedName!,
      });

      if (result.error) {
        setStatus("failed");
        setErrorMessage(getErrorMessage(result.error, "failed"));
        const errObj = result.error as any;
        if (errObj?.retryAfter) setResendCooldown(errObj.retryAfter);
        setInFlight(false);
        return;
      }

      // Successful registration proceeds to verification step
      setPassword("");
      setConfirmPassword("");
      setInFlight(false);
      setStatus("idle");
      setStep("verify");
      setResendCooldown(30);
    } catch (err) {
      setStatus("failed");
      setErrorMessage(getErrorMessage(err, "failed"));
      const errObj = err as any;
      if (errObj?.retryAfter) setResendCooldown(errObj.retryAfter);
      setInFlight(false);
    }
  }

  function getErrorMessage(
    err: unknown,
    fallbackKey:
      | "failed"
      | "verificationFailed"
      | "invalidCredentials"
      | "genericError" = "failed",
  ): string {
    const errorObj = err as {
      code?: string;
      message?: string;
      status?: number;
      retryAfter?: number;
    };
    if (errorObj?.status === 429 || errorObj?.code === "RATE_LIMITED") {
      return errorObj?.retryAfter
        ? t("rateLimited", { seconds: errorObj.retryAfter })
        : t("rateLimitedGeneric");
    }
    if (errorObj?.status === 503 || errorObj?.code === "UNAVAILABLE") {
      return t("serviceUnavailable");
    }
    if (
      errorObj?.code === "CHALLENGE_EXPIRED" ||
      errorObj?.code === "CHALLENGE_ALREADY_CONSUMED"
    ) {
      return t("verificationFailed");
    }
    return t(fallbackKey);
  }

  // Handle sign-in submission
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (inFlightRef.current || disabled) return;

    setFieldErrors({});
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    const errors: Record<string, string> = {};
    if (!isValidEmail(trimmedEmail)) {
      errors.email = t("invalidEmail");
    }
    if (!password) {
      errors.password = t("invalidPassword");
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    async function processSignInError(err: unknown) {
      const authErr = err as {
        code?: string;
        message?: string;
        status?: number;
        retryAfter?: number;
      };

      if (authErr?.status === 429 || authErr?.code === "RATE_LIMITED") {
        setPassword("");
        setStatus("failed");
        setErrorMessage(
          authErr?.retryAfter
            ? t("rateLimited", { seconds: authErr.retryAfter })
            : t("rateLimitedGeneric"),
        );
        if (authErr?.retryAfter) setResendCooldown(authErr.retryAfter);
        setInFlight(false);
        return;
      }

      if (authErr?.status === 503 || authErr?.code === "UNAVAILABLE") {
        setPassword("");
        setStatus("failed");
        setErrorMessage(t("serviceUnavailable"));
        setInFlight(false);
        return;
      }

      const isUnverified =
        authErr?.code === "EMAIL_NOT_VERIFIED" ||
        authErr?.code === "email_not_confirmed" ||
        authErr?.status === 403 ||
        authErr?.status === 422 ||
        authErr?.message?.toLowerCase().includes("not verified") ||
        authErr?.message?.toLowerCase().includes("confirm") ||
        authErr?.message?.toLowerCase().includes("verify");

      if (isUnverified) {
        try {
          await authClient.emailOtp.sendVerificationOtp({
            email: trimmedEmail,
            type: "email-verification",
          });
        } catch {
          // Best-effort resend
        }
        setPassword("");
        setInFlight(false);
        setStatus("idle");
        setStep("verify");
        setNoticeMessage(t("unverifiedContinue"));
        return;
      }

      setPassword("");
      setStatus("failed");
      setErrorMessage(t("invalidCredentials"));
      setInFlight(false);
    }

    setInFlight(true);
    setStatus("pending");

    try {
      const result = await authClient.signIn.email({
        email: trimmedEmail,
        password,
      });

      if (result.error) {
        await processSignInError(result.error);
        return;
      }

      // Successful sign in: navigate to destination to pick up fresh server authority
      setPassword("");
      router.push(`${returnTo || "/app"}#`);
    } catch (err: unknown) {
      await processSignInError(err);
    }
  }

  // Handle verification submission (US1 & US2)
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (inFlightRef.current || disabled) return;

    setFieldErrors({});
    setErrorMessage(null);

    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setFieldErrors({ code: t("invalidCode") });
      return;
    }

    setInFlight(true);
    setStatus("pending");

    try {
      const result = await authClient.emailOtp.verifyEmail({
        email: email.trim(),
        otp: cleanCode,
      });

      if (result.error) {
        setStatus("failed");
        setErrorMessage(getErrorMessage(result.error, "verificationFailed"));
        const errObj = result.error as any;
        if (errObj?.retryAfter) setResendCooldown(errObj.retryAfter);
        setInFlight(false);
        return;
      }

      // Fresh verified session confirmed: navigate to protected app
      setCode("");
      router.push(`${returnTo || "/app"}#`);
    } catch (err) {
      setStatus("failed");
      setErrorMessage(getErrorMessage(err, "verificationFailed"));
      const errObj = err as any;
      if (errObj?.retryAfter) setResendCooldown(errObj.retryAfter);
      setInFlight(false);
    }
  }

  // Handle resending verification code
  async function handleResendCode() {
    if (resendCooldown > 0 || inFlightRef.current || disabled) return;

    setInFlight(true);
    setStatus("pending");
    setErrorMessage(null);

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "email-verification",
      });

      if (result.error) {
        setErrorMessage(getErrorMessage(result.error, "failed"));
        const errObj = result.error as any;
        if (errObj?.retryAfter) setResendCooldown(errObj.retryAfter);
      } else {
        setNoticeMessage(t("codeSent"));
        setResendCooldown(30);
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err, "failed"));
      const errObj = err as any;
      if (errObj?.retryAfter) setResendCooldown(errObj.retryAfter);
    } finally {
      setStatus("idle");
      setInFlight(false);
    }
  }

  // Handle forgot password request (US4)
  async function handleForgotRequest(e: React.FormEvent) {
    e.preventDefault();
    if (inFlightRef.current || disabled) return;

    setFieldErrors({});
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setFieldErrors({ email: t("invalidEmail") });
      return;
    }

    setInFlight(true);
    setStatus("pending");

    try {
      let result: any;
      if (
        typeof (authClient.emailOtp as any)?.requestPasswordReset === "function"
      ) {
        result = await (authClient.emailOtp as any).requestPasswordReset({
          email: trimmedEmail,
        });
      } else {
        result = await authClient.emailOtp.sendVerificationOtp({
          email: trimmedEmail,
          type: "forget-password",
        });
      }

      if (result?.error) {
        const errObj = result.error as any;
        if (errObj?.status === 429 || errObj?.code === "RATE_LIMITED") {
          setErrorMessage(getErrorMessage(errObj));
          if (errObj?.retryAfter) setResendCooldown(errObj.retryAfter);
          setInFlight(false);
          setStatus("failed");
          return;
        }
        if (errObj?.status === 503 || errObj?.code === "UNAVAILABLE") {
          setErrorMessage(t("serviceUnavailable"));
          setInFlight(false);
          setStatus("failed");
          return;
        }
      }

      // Generic response for both existing and unknown emails (anti-enumeration)
      setInFlight(false);
      setStatus("idle");
      setStep("reset");
      setNoticeMessage(t("resetCodeSent"));
      setResendCooldown(30);
    } catch (err: any) {
      if (err?.status === 429 || err?.code === "RATE_LIMITED") {
        setErrorMessage(getErrorMessage(err));
        if (err?.retryAfter) setResendCooldown(err.retryAfter);
        setInFlight(false);
        setStatus("failed");
        return;
      }
      if (err?.status === 503 || err?.code === "UNAVAILABLE") {
        setErrorMessage(t("serviceUnavailable"));
        setInFlight(false);
        setStatus("failed");
        return;
      }
      // Even on unexpected error, show generic acknowledgement to protect against enumeration
      setInFlight(false);
      setStatus("idle");
      setStep("reset");
      setNoticeMessage(t("resetCodeSent"));
      setResendCooldown(30);
    }
  }

  // Handle resending password reset code (US4)
  async function handleResendResetCode() {
    if (resendCooldown > 0 || inFlightRef.current || disabled) return;

    setInFlight(true);
    setStatus("pending");
    setErrorMessage(null);

    try {
      let result: any;
      if (
        typeof (authClient.emailOtp as any)?.requestPasswordReset === "function"
      ) {
        result = await (authClient.emailOtp as any).requestPasswordReset({
          email: email.trim(),
        });
      } else {
        result = await authClient.emailOtp.sendVerificationOtp({
          email: email.trim(),
          type: "forget-password",
        });
      }

      if (result?.error) {
        const errObj = result.error as any;
        if (errObj?.status === 429 || errObj?.code === "RATE_LIMITED") {
          setErrorMessage(getErrorMessage(errObj));
          if (errObj?.retryAfter) setResendCooldown(errObj.retryAfter);
          return;
        }
        if (errObj?.status === 503 || errObj?.code === "UNAVAILABLE") {
          setErrorMessage(t("serviceUnavailable"));
          return;
        }
      }
      setNoticeMessage(t("resetCodeSent"));
      setResendCooldown(30);
    } catch (err: any) {
      if (err?.status === 429 || err?.code === "RATE_LIMITED") {
        setErrorMessage(getErrorMessage(err));
        if (err?.retryAfter) setResendCooldown(err.retryAfter);
        return;
      }
      if (err?.status === 503 || err?.code === "UNAVAILABLE") {
        setErrorMessage(t("serviceUnavailable"));
        return;
      }
      // Even on error, show generic acknowledgement to protect against enumeration
      setNoticeMessage(t("resetCodeSent"));
      setResendCooldown(30);
    } finally {
      setStatus("idle");
      setInFlight(false);
    }
  }

  // Handle reset submission with code and new password (US4)
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (inFlightRef.current || disabled) return;

    setFieldErrors({});
    setErrorMessage(null);

    const cleanCode = code.trim();
    const errors: Record<string, string> = {};
    if (!/^\d{6}$/.test(cleanCode)) {
      errors.code = t("invalidCode");
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
      errors.newPassword = t("invalidPassword");
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setInFlight(true);
    setStatus("pending");

    try {
      const result = await authClient.emailOtp.resetPassword({
        email: email.trim(),
        otp: cleanCode,
        password: newPassword,
      });

      if (result.error) {
        setStatus("failed");
        setErrorMessage(getErrorMessage(result.error, "verificationFailed"));
        const errObj = result.error as any;
        if (errObj?.retryAfter) setResendCooldown(errObj.retryAfter);
        setInFlight(false);
        return;
      }

      // Successful reset: clear secrets and return to sign in view
      setCode("");
      setNewPassword("");
      setInFlight(false);
      setStatus("idle");
      setStep("form");
      setNoticeMessage(t("resetSuccess"));
    } catch (err) {
      setStatus("failed");
      setErrorMessage(getErrorMessage(err, "genericError"));
      const errObj = err as any;
      if (errObj?.retryAfter) setResendCooldown(errObj.retryAfter);
      setInFlight(false);
    }
  }

  const isPending = status === "pending" || disabled;

  if (step === "verify") {
    return (
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        {noticeMessage && (
          <Alert>
            <AlertDescription>{noticeMessage}</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Field>
          <FieldLabel htmlFor="auth-code">{t("code")}</FieldLabel>
          <FieldDescription id="auth-code-desc">
            {t("codeDescription", { email: email.trim() })}
          </FieldDescription>
          <Input
            id="auth-code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder={t("codePlaceholder")}
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(val);
              if (fieldErrors.code)
                setFieldErrors((prev) => ({ ...prev, code: "" }));
            }}
            disabled={isPending}
            className="text-center font-mono tracking-widest text-lg sm:text-xl"
            aria-describedby="auth-code-desc"
            dir="ltr"
            required
            autoFocus
          />
          {fieldErrors.code && <FieldError>{fieldErrors.code}</FieldError>}
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={isPending || code.length !== 6}
        >
          {isPending ? t("verifyingCode") : t("verifyCode")}
        </Button>

        <div className="flex items-center justify-between text-sm pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending || resendCooldown > 0}
            aria-label={
              resendCooldown > 0
                ? t("cooldownNotice", { seconds: resendCooldown })
                : undefined
            }
            onClick={handleResendCode}
          >
            {isPending && status === "pending" ? (
              t("resendingCode")
            ) : resendCooldown > 0 ? (
              <span>
                {t("resendCode")}
                <span aria-hidden="true"> ({resendCooldown}s)</span>
              </span>
            ) : (
              t("resendCode")
            )}
          </Button>

          <Button
            type="button"
            variant="link"
            size="sm"
            disabled={isPending}
            onClick={() => {
              setCode("");
              setStep("form");
              setErrorMessage(null);
            }}
          >
            {t("changeEmail")}
          </Button>
        </div>
      </form>
    );
  }

  if (step === "forgot") {
    return (
      <form onSubmit={handleForgotRequest} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 mb-1">
          <h2 className="text-xl font-medium tracking-tight">
            {t("forgotTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("forgotDescription")}
          </p>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Field>
          <FieldLabel htmlFor="auth-forgot-email">{t("email")}</FieldLabel>
          <Input
            id="auth-forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email)
                setFieldErrors((prev) => ({ ...prev, email: "" }));
            }}
            disabled={isPending}
            dir="ltr"
            required
            autoFocus
          />
          {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
        </Field>

        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? t("sendingResetCode") : t("sendResetCode")}
        </Button>

        <Button
          type="button"
          variant="link"
          size="sm"
          disabled={isPending}
          onClick={() => {
            setStep("form");
            setErrorMessage(null);
          }}
          className="self-center"
        >
          {t("backToSignIn")}
        </Button>
      </form>
    );
  }

  if (step === "reset") {
    return (
      <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
        {noticeMessage && (
          <Alert>
            <AlertDescription>{noticeMessage}</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Field>
          <FieldLabel htmlFor="auth-reset-code">{t("code")}</FieldLabel>
          <FieldDescription id="auth-reset-code-desc">
            {t("codeDescription", { email: email.trim() })}
          </FieldDescription>
          <Input
            id="auth-reset-code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder={t("codePlaceholder")}
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(val);
              if (fieldErrors.code)
                setFieldErrors((prev) => ({ ...prev, code: "" }));
            }}
            disabled={isPending}
            className="text-center font-mono tracking-widest text-lg sm:text-xl"
            aria-describedby="auth-reset-code-desc"
            dir="ltr"
            required
            autoFocus
          />
          {fieldErrors.code && <FieldError>{fieldErrors.code}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="auth-new-password">
            {t("newPassword")}
          </FieldLabel>
          <FieldDescription id="auth-new-password-desc">
            {t("passwordRequirements")}
          </FieldDescription>
          <div className="relative">
            <Input
              id="auth-new-password"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("passwordPlaceholder")}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (fieldErrors.newPassword)
                  setFieldErrors((prev) => ({ ...prev, newPassword: "" }));
              }}
              disabled={isPending}
              aria-describedby="auth-new-password-desc"
              className="pe-10"
              dir="ltr"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setShowNewPassword((prev) => !prev)}
              aria-label={
                showNewPassword ? t("hidePassword") : t("showPassword")
              }
              title={showNewPassword ? t("hidePassword") : t("showPassword")}
              aria-pressed={showNewPassword}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          {fieldErrors.newPassword && (
            <FieldError>{fieldErrors.newPassword}</FieldError>
          )}
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={isPending || code.length !== 6}
        >
          {isPending ? t("resettingPassword") : t("resetPassword")}
        </Button>

        <div className="flex items-center justify-between text-sm pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending || resendCooldown > 0}
            aria-label={
              resendCooldown > 0
                ? t("cooldownNotice", { seconds: resendCooldown })
                : undefined
            }
            onClick={handleResendResetCode}
          >
            {isPending && status === "pending" ? (
              t("resendingCode")
            ) : resendCooldown > 0 ? (
              <span>
                {t("resendCode")}
                <span aria-hidden="true"> ({resendCooldown}s)</span>
              </span>
            ) : (
              t("resendCode")
            )}
          </Button>

          <Button
            type="button"
            variant="link"
            size="sm"
            disabled={isPending}
            onClick={() => {
              setCode("");
              setNewPassword("");
              setStep("form");
              setErrorMessage(null);
            }}
          >
            {t("backToSignIn")}
          </Button>
        </div>
      </form>
    );
  }

  const isSignUp = entry === "sign-up";

  return (
    <form
      onSubmit={isSignUp ? handleSignUp : handleSignIn}
      className="flex flex-col gap-4"
    >
      {noticeMessage && (
        <Alert>
          <AlertDescription>{noticeMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Registration Name Fields */}
      {isSignUp && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="auth-first-name">{t("firstName")}</FieldLabel>
            <Input
              id="auth-first-name"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder={t("firstNamePlaceholder")}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (fieldErrors.name)
                  setFieldErrors((prev) => ({ ...prev, name: "" }));
              }}
              disabled={isPending}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="auth-last-name">{t("lastName")}</FieldLabel>
            <Input
              id="auth-last-name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder={t("lastNamePlaceholder")}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (fieldErrors.name)
                  setFieldErrors((prev) => ({ ...prev, name: "" }));
              }}
              disabled={isPending}
            />
          </Field>
          {fieldErrors.name && (
            <div className="sm:col-span-2">
              <FieldError>{fieldErrors.name}</FieldError>
            </div>
          )}
        </div>
      )}

      {/* Email Field */}
      <Field>
        <FieldLabel htmlFor="auth-email">{t("email")}</FieldLabel>
        <Input
          id="auth-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email)
              setFieldErrors((prev) => ({ ...prev, email: "" }));
          }}
          disabled={isPending}
          dir="ltr"
          required
        />
        {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
      </Field>

      {/* Password Field */}
      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="auth-password">
            {t(isSignUp ? "password" : "currentPassword")}
          </FieldLabel>
          {!isSignUp && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              disabled={isPending}
              onClick={() => {
                setErrorMessage(null);
                setStep("forgot");
              }}
            >
              {t("forgotPassword")}
            </Button>
          )}
        </div>
        {isSignUp && (
          <FieldDescription id="auth-password-desc">
            {t("passwordRequirements")}
          </FieldDescription>
        )}
        <div className="relative">
          <Input
            id="auth-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => {
              const val = e.target.value;
              setPassword(val);
              if (fieldErrors.password)
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              if (
                fieldErrors.confirmPassword &&
                confirmPassword &&
                val === confirmPassword
              )
                setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            disabled={isPending}
            aria-describedby={isSignUp ? "auth-password-desc" : undefined}
            className="pe-10"
            dir="ltr"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            title={showPassword ? t("hidePassword") : t("showPassword")}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
        {fieldErrors.password && (
          <FieldError>{fieldErrors.password}</FieldError>
        )}
        {isSignUp && (
          <div className="mt-2 space-y-1.5 text-xs" aria-live="polite">
            {(() => {
              const val = validatePassword(password);
              return (
                <>
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      val.hasMinLength
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Check
                      className={`h-3.5 w-3.5 transition-opacity ${
                        val.hasMinLength ? "opacity-100" : "opacity-40"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{t("passwordRuleLength")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      val.hasMixedCase
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Check
                      className={`h-3.5 w-3.5 transition-opacity ${
                        val.hasMixedCase ? "opacity-100" : "opacity-40"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{t("passwordRuleMixed")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      val.hasNumberOrSymbol
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Check
                      className={`h-3.5 w-3.5 transition-opacity ${
                        val.hasNumberOrSymbol ? "opacity-100" : "opacity-40"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{t("passwordRuleNumberOrSymbol")}</span>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Field>

      {/* Repeat Password Field for Sign Up */}
      {isSignUp && (
        <Field>
          <FieldLabel htmlFor="auth-confirm-password">
            {t("confirmPassword")}
          </FieldLabel>
          <div className="relative">
            <Input
              id="auth-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("passwordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => {
                const val = e.target.value;
                setConfirmPassword(val);
                if (fieldErrors.confirmPassword)
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              disabled={isPending}
              className="pe-10"
              dir="ltr"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword ? t("hidePassword") : t("showPassword")
              }
              title={
                showConfirmPassword ? t("hidePassword") : t("showPassword")
              }
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          {fieldErrors.confirmPassword && (
            <FieldError>{fieldErrors.confirmPassword}</FieldError>
          )}
        </Field>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="mt-2">
        {isPending
          ? t(isSignUp ? "creatingAccount" : "signingIn")
          : t(isSignUp ? "createAccount" : "signIn")}
      </Button>
    </form>
  );
}
