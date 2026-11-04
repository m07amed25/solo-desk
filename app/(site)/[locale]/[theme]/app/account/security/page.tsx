import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AccountSecurity } from "@/components/account-security";
import { authReturnPath } from "@/lib/site";

export async function generateMetadata() {
  const t = await getTranslations("Security");
  return {
    title: `${t("title")} · SoloDesk`,
    robots: { index: false, follow: false },
  };
}

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  if (process.env.SOLODESK_AUTH_MODE !== "app") notFound();
  const t = await getTranslations("Security");
  const query = await searchParams;
  const returnTo = authReturnPath(query.returnTo ?? "/app/account");
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12"
    >
      <Link
        href="/app/account"
        className="w-fit text-sm underline underline-offset-4"
      >
        {t("back")}
      </Link>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("intro")}</p>
      <AccountSecurity returnTo={returnTo} />
    </main>
  );
}
