import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { ApplicationShell } from "@/components/application-shell";
import { WorkspacePanel } from "@/components/workspace-panel";

export async function generateMetadata() {
  const t = await getTranslations("Workspaces");
  return {
    title: `${t("title")} · SoloDesk`,
  };
}

export default async function WorkspacePage() {
  await connection();
  const navigation = await getTranslations("Navigation");

  return (
    <ApplicationShell>
      <div className="max-w-5xl mx-auto w-full py-2 sm:py-4">
        <h1 className="mb-6 text-2xl font-semibold">
          {navigation("workspaceAndTeam")}
        </h1>
        <WorkspacePanel />
      </div>
    </ApplicationShell>
  );
}
