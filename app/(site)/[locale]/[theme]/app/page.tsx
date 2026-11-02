import { getTranslations } from "next-intl/server";
import { ApplicationShell } from "@/components/application-shell";
import { ApplicationOverview } from "@/components/application-overview";

export async function generateMetadata() {
  const t = await getTranslations("Overview");
  return {
    title: `${t("title")} · SoloDesk`,
  };
}

export default function OverviewPage() {
  return (
    <ApplicationShell>
      <ApplicationOverview />
    </ApplicationShell>
  );
}
