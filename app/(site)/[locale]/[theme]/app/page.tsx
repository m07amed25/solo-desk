import { connection } from "next/server";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { WorkspacePanel } from "@/components/workspace-panel";
import { WorkspaceInvitation } from "@/components/workspace-invitation";
import { ProfileSkeleton } from "@/components/auth-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loadProfile } from "@/lib/profile";
import { isWorkspacesEnabled } from "@/lib/auth/capabilities";
import {
  listWorkspaces,
  getWorkspaceContext,
  WorkspaceContext,
  WorkspaceListItem,
} from "@/lib/workspaces";

async function Account() {
  await connection();
  const c = await getTranslations("Common");
  const w = await getTranslations("Workspaces");
  let profile;
  try {
    profile = await loadProfile();
  } catch {
    return (
      <Alert>
        <AlertDescription>
          {w("unavailable")}{" "}
          <a href="/app" className="underline">
            {c("retry")}
          </a>
        </AlertDescription>
      </Alert>
    );
  }
  if (!profile) redirect("/sign-in#");

  const workspacesEnabled = isWorkspacesEnabled();
  let initialContext: WorkspaceContext | null = null;
  let initialWorkspaces: WorkspaceListItem[] = [];

  if (workspacesEnabled) {
    try {
      const cookieStore = await cookies();
      const selectedId = cookieStore.get("solodesk_workspace_id")?.value;
      if (selectedId) {
        try {
          initialContext = await getWorkspaceContext(selectedId);
        } catch {
          // If selected workspace is inaccessible or revoked, fall back gracefully
          initialContext = null;
        }
      }

      const listRes = await listWorkspaces();
      initialWorkspaces = listRes.items;

      // If no workspace was selected in cookie, but user has at least one workspace, auto-context first one
      if (!initialContext && initialWorkspaces.length > 0) {
        try {
          initialContext = await getWorkspaceContext(initialWorkspaces[0].id);
        } catch {
          initialContext = null;
        }
      }
    } catch {
      // Gracefully handle database or workspaces service errors without breaking
    }
  }

  const messages = await getMessages();
  return (
    <NextIntlClientProvider
      messages={{
        Profile: messages.Profile,
        Common: messages.Common,
        Workspaces: messages.Workspaces,
      }}
    >
      <div className="flex flex-col gap-8">
        {workspacesEnabled ? (
          <>
            <WorkspaceInvitation />
            <WorkspacePanel
              initialContext={initialContext}
              initialWorkspaces={initialWorkspaces}
              workspacesEnabled={workspacesEnabled}
            />
          </>
        ) : (
          <Alert>
            <AlertDescription>{w("unavailable")}</AlertDescription>
          </Alert>
        )}
      </div>
    </NextIntlClientProvider>
  );
}

export async function generateMetadata() {
  return {
    title: `${(await getTranslations("Workspaces"))("title")} · SoloDesk`,
  };
}

export default async function AccountPage() {
  return (
    <>
      <SiteHeader returnTo="/app" />
      <main
        id="main-content"
        className="mx-auto flex min-h-[70svh] w-full max-w-4xl flex-col gap-8 px-6 py-12"
      >
        <Suspense fallback={<ProfileSkeleton statusText="" />}>
          <Account />
        </Suspense>
      </main>
    </>
  );
}
