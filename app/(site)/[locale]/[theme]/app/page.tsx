import { connection } from "next/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { LiveProfile } from "@/components/live-profile";
import { ProfileSkeleton } from "@/components/auth-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loadProfile } from "@/lib/profile";

async function Account() {
  await connection();
  const t = await getTranslations("Profile");
  const c = await getTranslations("Common");
  let profile;
  try {
    profile = await loadProfile();
  } catch {
    return (
      <Alert>
        <AlertDescription>
          {t("unavailable")}{" "}
          <a href="/app" className="underline">
            {c("retry")}
          </a>
        </AlertDescription>
      </Alert>
    );
  }
  if (!profile) redirect("/sign-in");
  const messages = await getMessages();
  return (
    <NextIntlClientProvider
      messages={{ Profile: messages.Profile, Common: messages.Common }}
    >
      <LiveProfile {...profile} realtimeUrl={process.env.NEON_REALTIME_URL!} />
    </NextIntlClientProvider>
  );
}
export async function generateMetadata() {
  return { title: `${(await getTranslations("Profile"))("title")} · SoloDesk` };
}
export default async function AccountPage() {
  const t = await getTranslations("Profile");
  return (
    <>
      <SiteHeader returnTo="/app" />
      <main
        id="main-content"
        className="mx-auto flex min-h-[70svh] w-full max-w-lg flex-col justify-center gap-8 px-6 py-12"
      >
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <Suspense fallback={<ProfileSkeleton statusText={t("checking")} />}>
          <Account />
        </Suspense>
      </main>
    </>
  );
}
