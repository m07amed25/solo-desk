"use client";

import { useState, useRef, useId, type FormEvent } from "react";
import { CheckCircle2, AlertCircle, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ContactFormMessages {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  topicLabel: string;
  topicGeneral: string;
  topicTeam: string;
  topicBilling: string;
  topicSecurity: string;
  topicFeedback: string;
  messageLabel: string;
  messagePlaceholder: string;
  consentLabel: string;
  submitButton: string;
  submitting: string;
  successTitle: string;
  successMessage: string;
  sendAnother: string;
  rateLimited: string;
  unavailable: string;
  privacyNotice: string;
  errors: {
    nameRequired: string;
    emailInvalid: string;
    topicInvalid: string;
    messageLength: string;
    consentRequired: string;
    generic: string;
  };
}

interface ContactFormProps {
  messages: ContactFormMessages;
  initialToken: string;
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function ContactForm({ messages, initialToken }: ContactFormProps) {
  const baseId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const topicSelectRef = useRef<HTMLSelectElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const consentInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("general");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [token] = useState(initialToken);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error" | "rateLimited" | "unavailable"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateClientSide = (): boolean => {
    const errors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      errors.name = messages.errors.nameRequired;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (
      !trimmedEmail ||
      !EMAIL_REGEX.test(trimmedEmail) ||
      trimmedEmail.length > 254
    ) {
      errors.email = messages.errors.emailInvalid;
    }

    const validTopics = ["general", "team", "billing", "security", "feedback"];
    if (!validTopics.includes(topic)) {
      errors.topic = messages.errors.topicInvalid;
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10 || trimmedMessage.length > 2000) {
      errors.message = messages.errors.messageLength;
    }

    if (!consent) {
      errors.consent = messages.errors.consentRequired;
    }

    setFieldErrors(errors);

    // Focus first invalid element
    if (errors.name) {
      nameInputRef.current?.focus();
    } else if (errors.email) {
      emailInputRef.current?.focus();
    } else if (errors.topic) {
      topicSelectRef.current?.focus();
    } else if (errors.message) {
      messageInputRef.current?.focus();
    } else if (errors.consent) {
      consentInputRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateClientSide()) {
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Sec-Fetch-Site": "same-origin",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          topic,
          message: message.trim(),
          consent,
          website_url: honeypot,
          _token: token,
        }),
      });

      if (res.status === 200) {
        setStatus("success");
        // Clear form
        setName("");
        setEmail("");
        setMessage("");
        setConsent(false);
        setFieldErrors({});
      } else if (res.status === 429) {
        setStatus("rateLimited");
        setErrorMessage(messages.rateLimited);
      } else if (res.status === 503) {
        setStatus("unavailable");
        setErrorMessage(messages.unavailable);
      } else {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          fields?: Record<string, string>;
          message?: string;
        };

        setStatus("error");
        if (data.fields) {
          const mappedErrors: Record<string, string> = {};
          for (const [f, errKey] of Object.entries(data.fields)) {
            if (f === "name") mappedErrors.name = messages.errors.nameRequired;
            else if (f === "email")
              mappedErrors.email = messages.errors.emailInvalid;
            else if (f === "topic")
              mappedErrors.topic = messages.errors.topicInvalid;
            else if (f === "message")
              mappedErrors.message = messages.errors.messageLength;
            else if (f === "consent")
              mappedErrors.consent = messages.errors.consentRequired;
            else mappedErrors[f] = errKey;
          }
          setFieldErrors(mappedErrors);
        }
        setErrorMessage(data.message || messages.errors.generic);
      }
    } catch {
      setStatus("error");
      setErrorMessage(messages.unavailable);
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setErrorMessage(null);
    setFieldErrors({});
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-card p-8 text-center shadow-md">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          {messages.successTitle}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
          {messages.successMessage}
        </p>
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            <span>{messages.sendAnother}</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Honeypot field (hidden from assistive tech and humans) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${baseId}-website`}>Website</label>
        <input
          id={`${baseId}-website`}
          type="text"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Render Timestamp token */}
      <input type="hidden" name="_token" value={token} />

      {/* Status Alert Banner */}
      {(status === "rateLimited" ||
        status === "unavailable" ||
        status === "error") && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="size-4" />
          <AlertTitle>
            {status === "rateLimited"
              ? "Rate Limit Notice"
              : status === "unavailable"
                ? "Service Notice"
                : "Submission Failed"}
          </AlertTitle>
          <AlertDescription>
            {errorMessage || messages.errors.generic}
          </AlertDescription>
        </Alert>
      )}

      {/* Name & Email Fields */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${baseId}-name`}
            className="text-sm font-medium text-foreground"
          >
            {messages.nameLabel} <span className="text-destructive">*</span>
          </label>
          <Input
            ref={nameInputRef}
            id={`${baseId}-name`}
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder={messages.namePlaceholder}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: "" }));
              }
            }}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={
              fieldErrors.name ? `${baseId}-name-error` : undefined
            }
            className={
              fieldErrors.name
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {fieldErrors.name && (
            <p
              id={`${baseId}-name-error`}
              className="text-xs font-medium text-destructive"
            >
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${baseId}-email`}
            className="text-sm font-medium text-foreground"
          >
            {messages.emailLabel} <span className="text-destructive">*</span>
          </label>
          <Input
            ref={emailInputRef}
            id={`${baseId}-email`}
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder={messages.emailPlaceholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }
            }}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? `${baseId}-email-error` : undefined
            }
            className={
              fieldErrors.email
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {fieldErrors.email && (
            <p
              id={`${baseId}-email-error`}
              className="text-xs font-medium text-destructive"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>
      </div>

      {/* Topic Selection */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${baseId}-topic`}
          className="text-sm font-medium text-foreground"
        >
          {messages.topicLabel} <span className="text-destructive">*</span>
        </label>
        <select
          ref={topicSelectRef}
          id={`${baseId}-topic`}
          name="topic"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            if (fieldErrors.topic) {
              setFieldErrors((prev) => ({ ...prev, topic: "" }));
            }
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="general">{messages.topicGeneral}</option>
          <option value="team">{messages.topicTeam}</option>
          <option value="billing">{messages.topicBilling}</option>
          <option value="security">{messages.topicSecurity}</option>
          <option value="feedback">{messages.topicFeedback}</option>
        </select>
        {fieldErrors.topic && (
          <p
            id={`${baseId}-topic-error`}
            className="text-xs font-medium text-destructive"
          >
            {fieldErrors.topic}
          </p>
        )}
      </div>

      {/* Message Textarea */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${baseId}-message`}
          className="text-sm font-medium text-foreground"
        >
          {messages.messageLabel} <span className="text-destructive">*</span>
        </label>
        <textarea
          ref={messageInputRef}
          id={`${baseId}-message`}
          name="message"
          required
          rows={4}
          minLength={10}
          maxLength={2000}
          placeholder={messages.messagePlaceholder}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (fieldErrors.message) {
              setFieldErrors((prev) => ({ ...prev, message: "" }));
            }
          }}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={
            fieldErrors.message ? `${baseId}-message-error` : undefined
          }
          className={`flex min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            fieldErrors.message
              ? "border-destructive focus-visible:ring-destructive"
              : "border-input"
          }`}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {fieldErrors.message ? (
            <p
              id={`${baseId}-message-error`}
              className="font-medium text-destructive"
            >
              {fieldErrors.message}
            </p>
          ) : (
            <span />
          )}
          <span className="font-mono tabular-nums ms-auto">
            <bdi>{message.length}</bdi>/2000
          </span>
        </div>
      </div>

      {/* Consent Checkbox */}
      <div className="flex flex-col gap-1.5 pt-1">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            ref={consentInputRef}
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (fieldErrors.consent) {
                setFieldErrors((prev) => ({ ...prev, consent: "" }));
              }
            }}
            aria-invalid={Boolean(fieldErrors.consent)}
            aria-describedby={
              fieldErrors.consent ? `${baseId}-consent-error` : undefined
            }
            className="mt-1 size-4 rounded border-border text-primary focus:ring-ring"
          />
          <span className="text-xs leading-relaxed text-muted-foreground">
            {messages.consentLabel}
          </span>
        </label>
        {fieldErrors.consent && (
          <p
            id={`${baseId}-consent-error`}
            className="text-xs font-medium text-destructive ms-7"
          >
            {fieldErrors.consent}
          </p>
        )}
      </div>

      {/* Privacy Notice */}
      <p className="text-xs text-muted-foreground/80 leading-relaxed border-t border-border/60 pt-3">
        {messages.privacyNotice}
      </p>

      {/* Submit Action */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={status === "submitting"}
          className="w-full sm:w-auto min-w-[160px]"
        >
          {status === "submitting" ? (
            <>
              <RefreshCw
                className="size-4 animate-spin"
                data-icon="inline-start"
                aria-hidden="true"
              />
              <span>{messages.submitting}</span>
            </>
          ) : (
            <>
              <span>{messages.submitButton}</span>
              <Send
                className="size-4"
                data-icon="inline-end"
                aria-hidden="true"
              />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
