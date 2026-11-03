import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ApplicationShell } from "@/components/application-shell";
import { LiveProfile } from "@/components/live-profile";
import { AccountReauthentication } from "@/components/account-reauthentication";
import { loadProfile } from "@/lib/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";

export async function generateMetadata() {
  const t = await getTranslations("Navigation");
  return {
    title: `${t("personalAccount")} · SoloDesk`,
  };
}

export default async function AccountPage() {
  await connection();
  const navigation = await getTranslations("Navigation");
  let envelope;
  let realtimeUrl: string;
  try {
    const url = new URL(process.env.NEON_REALTIME_URL || "");
    if (!["ws:", "wss:"].includes(url.protocol) || url.username || url.password)
      throw new Error("Realtime unavailable");
    realtimeUrl = url.href;
    envelope = await loadProfile();
  } catch {
    const c = await getTranslations("Common");
    return (
      <ApplicationShell>
        <div className="max-w-xl mx-auto w-full py-6">
          <h1 className="mb-6 text-2xl font-semibold">
            {navigation("personalAccount")}
          </h1>
          <Alert>
            <AlertDescription>
              {c("unavailable")}{" "}
              <Link href="/app/account" className="underline font-medium">
                {c("retry")}
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </ApplicationShell>
    );
  }

  if (!envelope) {
    redirect("/sign-in?returnTo=%2Fapp%2Faccount#");
  }

  return (
    <ApplicationShell>
      <div className="max-w-3xl mx-auto w-full py-4 sm:py-6">
        <h1 className="mb-6 text-2xl font-semibold">
          {navigation("personalAccount")}
        </h1>
        <LiveProfile {...envelope} realtimeUrl={realtimeUrl} />
        <div className="mt-8 border-t pt-8">
          <AccountReauthentication action="revoke_other_sessions" />
        </div>
      </div>
    </ApplicationShell>
  );
}
