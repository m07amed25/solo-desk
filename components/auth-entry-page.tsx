import { connection } from "next/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { SignIn } from "@/components/sign-in";
import { SiteHeader } from "@/components/site-header";
import { normalizedAuthPath, type AuthEntry } from "@/lib/site";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { currentSession } from "@/lib/auth/server";

type Search = Promise<Record<string, string | string[] | undefined>>;

async function Entry({
  entry,
  searchParams,
}: {
  entry: AuthEntry;
  searchParams: Search;
}) {
  await connection();
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    for (const part of Array.isArray(value)
      ? value
      : value === undefined
        ? []
        : [value])
      params.append(key, part);
  }
  const normalized = normalizedAuthPath(entry, params);
  if (normalized) redirect(normalized);
  const t = await getTranslations("Auth");
  const c = await getTranslations("Common");
  let session;
  try {
    session = await currentSession();
  } catch {
    return (
      <Alert>
        <AlertDescription>
          {c("unavailable")}{" "}
          <a href={`/${entry}`} className="underline">
            {c("retry")}
          </a>
        </AlertDescription>
      </Alert>
    );
  }
  if (session?.user) redirect("/app");
  const messages = await getMessages();
  const signingUp = entry === "sign-up";
  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t(signingUp ? "signUpHeading" : "signInHeading")}
        </h1>
        <p className="text-muted-foreground">
          {t(signingUp ? "signUpBody" : "signInBody")}
        </p>
      </div>
      <NextIntlClientProvider messages={{ Auth: messages.Auth }}>
        <SignIn entry={entry} failed={params.get("authError") === "1"} />
      </NextIntlClientProvider>
      <p className="text-sm text-muted-foreground">
        {t(signingUp ? "haveAccount" : "needAccount")}{" "}
        <a
          href={signingUp ? "/sign-in" : "/sign-up"}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {signingUp
            ? (await getTranslations("Navigation"))("signIn")
            : (await getTranslations("Navigation"))("signUp")}
        </a>
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t("policy")}
      </p>
    </>
  );
}

export async function AuthEntryPage({
  entry,
  searchParams,
}: {
  entry: AuthEntry;
  searchParams: Search;
}) {
  const t = await getTranslations("Auth");
  const c = await getTranslations("Common");
  return (
    <>
      <SiteHeader returnTo={`/${entry}`} />
      <main id="main-content" className="account-layout site-container">
        <aside className="account-intro">
          <h2 className="whitespace-pre-line text-4xl leading-tight font-medium tracking-tight sm:text-6xl">
            {t(entry === "sign-up" ? "signUpTitle" : "signInTitle")}
          </h2>
          <p className="max-w-sm text-lg text-muted-foreground">
            {t("sideNote")}
          </p>
          <div className="account-art" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </aside>
        <section className="flex min-w-0 flex-col gap-7 py-10 lg:py-20">
          <Suspense fallback={<p role="status">{c("loading")}</p>}>
            <Entry entry={entry} searchParams={searchParams} />
          </Suspense>
          <a
            href="/"
            className="w-fit text-sm text-muted-foreground underline underline-offset-4"
          >
            {c("home")}
          </a>
        </section>
      </main>
    </>
  );
}
