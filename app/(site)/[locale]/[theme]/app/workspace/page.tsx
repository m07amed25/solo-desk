import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { ApplicationShell } from "@/components/application-shell";
import { WorkspacePanel } from "@/components/workspace-panel";
import { getCachedApplicationContext } from "@/lib/application";
import type { WorkspaceRole } from "@/lib/workspaces";

export async function generateMetadata() {
  const t = await getTranslations("Workspaces");
  return {
    title: `${t("title")} · SoloDesk`,
  };
}

export default async function WorkspacePage() {
  await connection();
  const context = await getCachedApplicationContext();

  return (
    <ApplicationShell>
      <div className="max-w-5xl mx-auto w-full py-2 sm:py-4">
        <WorkspacePanel
          initialContext={context.selection.context}
          initialWorkspaces={context.workspaces.items.map((w) => ({
            id: w.id,
            name: w.name,
            slug: w.slug,
            role: w.role as WorkspaceRole,
            revision: w.revision,
          }))}
          workspacesEnabled={context.capabilities.workspacesEnabled}
        />
      </div>
    </ApplicationShell>
  );
}
