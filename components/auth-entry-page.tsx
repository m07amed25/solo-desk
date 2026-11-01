import { connection } from "next/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ArrowLeft, Languages, Moon, Sun, Monitor } from "lucide-react";
import { locale as rootLocale, theme as rootTheme } from "next/root-params";
import { AuthInteractivePanel } from "@/components/auth-interactive-panel";
import { AuthFormSkeleton } from "@/components/auth-skeleton";
import { WorkPreview } from "@/components/landing/work-preview";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { currentSession } from "@/lib/auth/server";
import { isCredentialsEnabled } from "@/lib/auth/capabilities";
import {
  normalizedAuthPath,
  presentation,
  themes,
  type AuthEntry,
} from "@/lib/site";

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
        <AuthInteractivePanel
          entry={entry}
          failed={params.get("authError") === "1"}
          credentialsEnabled={isCredentialsEnabled()}
        />
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
  const nav = await getTranslations("Navigation");
  const { locale, theme } = presentation(await rootLocale(), await rootTheme());
  const nextLocale = locale === "en" ? "ar" : "en";
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <>
      <a href="#main-content" className="skip-link">
        {nav("skip")}
      </a>
      <main id="main-content" className="account-layout">
        {/* Form region is FIRST in DOM for keyboard and accessibility order */}
        <section className="account-form-pane">
          {/* Top navigation row with Back to home button & preferences */}
          <div className="flex items-center justify-between w-full">
            <a
              href="/"
              className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md py-1.5 px-2 -mx-2"
              aria-label={c("home")}
            >
              <ArrowLeft
                className="h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1"
                aria-hidden="true"
              />
              <span>{c("home")}</span>
            </a>

            <div className="flex items-center gap-1">
              <form action="/api/preferences" method="post">
                <input type="hidden" name="returnTo" value={`/${entry}`} />
                <input type="hidden" name="locale" value={nextLocale} />
                <input type="hidden" name="theme" value={theme} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-lg"
                  aria-label={nav("switchLanguage", {
                    language: nextLocale === "ar" ? "العربية" : "English",
                  })}
                  title={nav("switchLanguage", {
                    language: nextLocale === "ar" ? "العربية" : "English",
                  })}
                >
                  <Languages aria-hidden="true" />
                </Button>
              </form>
              <form action="/api/preferences" method="post">
                <input type="hidden" name="returnTo" value={`/${entry}`} />
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="theme" value={nextTheme} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-lg"
                  aria-label={nav("switchTheme", {
                    current: nav(theme),
                    next: nav(nextTheme),
                  })}
                  title={nav("switchTheme", {
                    current: nav(theme),
                    next: nav(nextTheme),
                  })}
                >
                  <ThemeIcon aria-hidden="true" />
                </Button>
              </form>
            </div>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-md mx-auto my-auto py-8 flex flex-col gap-7">
            <Suspense
              fallback={
                <AuthFormSkeleton entry={entry} statusText={c("loading")} />
              }
            >
              <Entry entry={entry} searchParams={searchParams} />
            </Suspense>
          </div>

          <div className="w-full max-w-md mx-auto" />
        </section>

        {/* Illustrative visual region is SECOND in DOM */}
        <aside
          className="account-visual-pane hidden md:flex"
          aria-label={t("illustrativeCaption")}
        >
          <div className="account-visual-card">
            <div className="account-visual-content">
              <h2 className="whitespace-pre-line text-3xl font-medium tracking-tight sm:text-4xl text-foreground">
                {t(entry === "sign-up" ? "signUpTitle" : "signInTitle")}
              </h2>
              <p className="max-w-sm text-base text-muted-foreground leading-relaxed">
                {t("sideNote")}
              </p>
            </div>
            <div className="account-visual-preview">
              <WorkPreview />
              <p className="account-visual-caption text-xs text-muted-foreground text-center mt-3">
                {t("illustrativeCaption")}
              </p>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}
