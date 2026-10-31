"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  createRealtimeClient,
  type SealedLiveQuery,
} from "@neon/realtime/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import { authClient } from "@/lib/auth/client";
import { saveProfile } from "@/app/actions";
import type { Profile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileSkeleton } from "@/components/auth-skeleton";
import { Loader2 } from "lucide-react";

type Envelope = {
  userId: string;
  sessionExpiresAt: string;
  initialData: Profile[];
  sealedQuery: SealedLiveQuery<Profile>;
};
type Draft = { userId: string; name: string; dirty: boolean };

export function LiveProfile({
  userId,
  realtimeUrl,
}: Envelope & { realtimeUrl: string }) {
  const t = useTranslations("Profile");
  const c = useTranslations("Common");
  const [view, setView] = useState<
    "checking" | "authorized" | "unavailable" | "denied"
  >("checking");
  const [profile, setProfile] = useState<
    (Envelope & { draftName: string }) | null
  >(null);
  const [message, setMessage] = useState<"signOutFailed" | null>(null);
  const draft = useRef<Draft | null>(null);
  const protectedRoot = useRef<HTMLDivElement>(null);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const expiry = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  const signingOut = useRef(false);

  const conceal = useCallback(() => {
    // pagehide must conceal the existing DOM before a history snapshot can be restored.
    if (protectedRoot.current) protectedRoot.current.hidden = true;
    generation.current++;
    controller.current?.abort();
    if (expiry.current) clearTimeout(expiry.current);
    setView("checking");
  }, []);
  const deny = useCallback(() => {
    conceal();
    draft.current = null;
    setProfile(null);
    setView("denied");
    window.location.replace("/sign-in");
  }, [conceal]);
  const revalidate = useCallback(async () => {
    if (
      !mounted.current ||
      signingOut.current ||
      document.visibilityState === "hidden"
    )
      return;
    conceal();
    const current = generation.current;
    const abort = new AbortController();
    controller.current = abort;
    try {
      const response = await fetch(
        `/api/profile?userId=${encodeURIComponent(userId)}`,
        {
          cache: "no-store",
          signal: AbortSignal.any([abort.signal, AbortSignal.timeout(15000)]),
        },
      );
      if (!mounted.current || current !== generation.current) return;
      if (response.status === 401) {
        deny();
        return;
      }
      if (!response.ok) throw new Error("Unavailable");
      const next: Envelope = await response.json();
      if (!mounted.current || current !== generation.current) return;
      const remaining = Date.parse(next.sessionExpiresAt) - Date.now();
      if (
        next.userId !== userId ||
        next.initialData?.length !== 1 ||
        next.initialData[0].id !== userId ||
        !Number.isFinite(remaining) ||
        remaining <= 0
      ) {
        deny();
        return;
      }
      if (draft.current?.userId !== userId)
        draft.current = {
          userId,
          name: next.initialData[0].name,
          dirty: false,
        };
      else if (!draft.current.dirty)
        draft.current.name = next.initialData[0].name;
      setProfile({ ...next, draftName: draft.current.name });
      setView("authorized");
      expiry.current = setTimeout(deny, Math.min(remaining, 2147483647));
      return next;
    } catch {
      if (mounted.current && current === generation.current) {
        setProfile(null);
        setView("unavailable");
      }
    }
  }, [conceal, deny, userId]);
  useEffect(() => {
    mounted.current = true;
    const firstCheck = setTimeout(() => void revalidate(), 0);
    const foreground = () => {
      if (document.visibilityState === "hidden") conceal();
      else void revalidate();
    };
    const restore = () => {
      void revalidate();
    };
    window.addEventListener("pagehide", conceal);
    window.addEventListener("pageshow", restore);
    window.addEventListener("focus", restore);
    document.addEventListener("visibilitychange", foreground);
    const timer = setInterval(restore, 55000);
    return () => {
      mounted.current = false;
      controller.current?.abort();
      clearTimeout(firstCheck);
      if (expiry.current) clearTimeout(expiry.current);
      clearInterval(timer);
      window.removeEventListener("pagehide", conceal);
      window.removeEventListener("pageshow", restore);
      window.removeEventListener("focus", restore);
      document.removeEventListener("visibilitychange", foreground);
      draft.current = null;
    };
  }, [conceal, revalidate]);
  async function signOut() {
    if (signingOut.current) return;
    signingOut.current = true;
    conceal();
    draft.current = null;
    setProfile(null);
    setMessage(null);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Unavailable");
      deny();
    } catch {
      signingOut.current = false;
      if (mounted.current) {
        setMessage("signOutFailed");
        await revalidate();
      }
    }
  }
  const updateDraft = useCallback(
    (name: string, dirty: boolean) => {
      draft.current = { userId, name, dirty };
    },
    [userId],
  );
  return (
    <>
      {message && (
        <Alert>
          <AlertDescription>{t(message)}</AlertDescription>
        </Alert>
      )}
      {view === "authorized" && profile ? (
        <div ref={protectedRoot} key={profile.sealedQuery.expiresAt}>
          <AuthorizedProfile
            profile={profile}
            realtimeUrl={realtimeUrl}
            initialName={profile.draftName}
            updateDraft={updateDraft}
            deny={deny}
            revalidate={revalidate}
            signOut={signOut}
          />
        </div>
      ) : view === "checking" ? (
        <ProfileSkeleton statusText={t("checking")} />
      ) : (
        <div className="flex flex-col gap-4">
          <p role="status">
            {t(view === "unavailable" ? "unavailable" : "denied")}
          </p>
          {view === "unavailable" && (
            <Button size="lg" onClick={() => void revalidate()}>
              {c("retry")}
            </Button>
          )}
        </div>
      )}
    </>
  );
}

function AuthorizedProfile({
  profile,
  realtimeUrl,
  initialName,
  updateDraft,
  deny,
  revalidate,
  signOut,
}: {
  profile: Envelope;
  realtimeUrl: string;
  initialName: string;
  updateDraft: (name: string, dirty: boolean) => void;
  deny: () => void;
  revalidate: () => Promise<Envelope | undefined>;
  signOut: () => Promise<void>;
}) {
  const [client] = useState(() => createRealtimeClient({ url: realtimeUrl }));
  // useLiveQuery owns cleanup; its last unsubscribe closes the socket and heartbeat.
  return (
    <RealtimeProvider client={client}>
      <ProfileForm
        profile={profile}
        initialName={initialName}
        updateDraft={updateDraft}
        deny={deny}
        revalidate={revalidate}
        signOut={signOut}
      />
    </RealtimeProvider>
  );
}

function ProfileForm({
  profile,
  initialName,
  updateDraft,
  deny,
  revalidate,
  signOut,
}: {
  profile: Envelope;
  initialName: string;
  updateDraft: (name: string, dirty: boolean) => void;
  deny: () => void;
  revalidate: () => Promise<Envelope | undefined>;
  signOut: () => Promise<void>;
}) {
  const t = useTranslations("Profile");
  const [name, setName] = useState(initialName);
  const [pending, setPending] = useState(false);
  const [signingOutState, setSigningOutState] = useState(false);
  const [message, setMessage] = useState<
    "invalidName" | "unauthorized" | "saveFailed" | "saved" | null
  >(null);
  const inFlight = useRef(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const refreshQuery = useCallback(async () => {
    const next = await revalidate();
    if (!next) throw new Error("Profile unavailable");
    return next.sealedQuery;
  }, [revalidate]);
  const { data, status } = useLiveQuery(profile.sealedQuery, {
    initialData: profile.initialData,
    refreshQuery,
  });
  const authorizedRows =
    !!data?.length && data.length === 1 && data[0].id === profile.userId;
  useEffect(() => {
    if (data && !authorizedRows) deny();
  }, [data, authorizedRows, deny]);
  async function save(form: FormData) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setMessage(null);
    try {
      const result = await saveProfile(
        profile.userId,
        String(form.get("name") ?? ""),
      );
      if (!active.current) return;
      if (result.error === "unauthorized") {
        deny();
        return;
      }
      if (result.error) setMessage(result.error);
      else {
        updateDraft(name, false);
        setMessage("saved");
      }
    } catch {
      if (active.current) setMessage("saveFailed");
    } finally {
      inFlight.current = false;
      if (active.current) setPending(false);
    }
  }
  if (!authorizedRows) return null;
  return (
    <section className="flex flex-col gap-6">
      <h2 className="break-words text-xl font-medium">
        {t("welcome", { name: data[0].name })}
      </h2>
      <p role="status" className="text-sm text-muted-foreground">
        {t(
          status === "error"
            ? "liveError"
            : status === "stale"
              ? "stale"
              : "live",
        )}
      </p>
      <form action={save}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="profile-name">{t("displayName")}</FieldLabel>
            <Input
              id="profile-name"
              name="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                updateDraft(event.target.value, true);
              }}
              autoComplete="name"
              required
              maxLength={100}
              disabled={pending}
            />
          </Field>
          <Button type="submit" size="lg" disabled={pending || signingOutState}>
            {pending && (
              <Loader2
                className="animate-spin"
                data-icon="inline-start"
                aria-hidden="true"
              />
            )}
            {t(pending ? "saving" : "save")}
          </Button>
        </FieldGroup>
      </form>
      {message && (
        <Alert>
          <AlertDescription>{t(message)}</AlertDescription>
        </Alert>
      )}
      <p className="text-xs text-muted-foreground">{t("memory")}</p>
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={pending || signingOutState}
        onClick={async () => {
          setSigningOutState(true);
          try {
            await signOut();
          } finally {
            if (active.current) setSigningOutState(false);
          }
        }}
      >
        {signingOutState && (
          <Loader2
            className="animate-spin"
            data-icon="inline-start"
            aria-hidden="true"
          />
        )}
        {t(signingOutState ? "signingOut" : "signOut")}
      </Button>
    </section>
  );
}
