import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { currentSession } from "@/lib/auth/server";
import {
  isWorkspacesEnabled,
  isWorkspaceInvitesEnabled,
  isOwnershipTransferEnabled,
} from "@/lib/auth/capabilities";
import {
  listWorkspaces,
  getWorkspaceContext,
  WorkspaceContext,
  WorkspaceError,
  validateUUID,
} from "@/lib/workspaces";

export class ApplicationError extends Error {
  code: string;
  statusHttp: number;

  constructor(code: string, message: string, statusHttp: number = 400) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.statusHttp = statusHttp;
  }
}

export type ApplicationAccount = {
  id: string;
  name: string;
  avatar?: string | null;
  sessionExpiresAt: string;
};

export type ApplicationCapabilities = {
  workspacesEnabled: boolean;
  workspaceInvitesEnabled: boolean;
  ownershipTransferEnabled: boolean;
};

export type WorkspaceChoice = {
  id: string;
  name: string;
  slug: string;
  role: string;
  revision: string;
};

export type WorkspaceCollectionState =
  "loading" | "ready" | "empty" | "disabled" | "unavailable";

export type ApplicationWorkspaces = {
  state: WorkspaceCollectionState;
  items: WorkspaceChoice[];
  nextCursor: string | null;
  error?: string;
};

export type WorkspaceSelectionState =
  | "unselected"
  | "checking"
  | "ready"
  | "restricted"
  | "unavailable"
  | "disabled";

export type ApplicationSelection = {
  state: WorkspaceSelectionState;
  selectedId: string | null;
  context: WorkspaceContext | null;
  error?: string;
};

export type ApplicationContext = {
  account: ApplicationAccount;
  capabilities: ApplicationCapabilities;
  workspaces: ApplicationWorkspaces;
  selection: ApplicationSelection;
};

export async function getApplicationContext(): Promise<ApplicationContext> {
  const session = await currentSession().catch(() => {
    throw new ApplicationError(
      "SERVICE_UNAVAILABLE",
      "Authentication unavailable",
      503,
    );
  });
  const expiry =
    session?.session && new Date(session.session.expiresAt).getTime();
  if (
    !session?.user?.id ||
    !expiry ||
    !Number.isFinite(expiry) ||
    expiry <= Date.now()
  ) {
    throw new ApplicationError("UNAUTHORIZED", "Authentication required", 401);
  }

  const account: ApplicationAccount = {
    id: session.user.id,
    name: session.user.name || "User",
    avatar: (session.user as { image?: string | null }).image || null,
    sessionExpiresAt: new Date(expiry).toISOString(),
  };

  const capabilities: ApplicationCapabilities = {
    workspacesEnabled: isWorkspacesEnabled(),
    workspaceInvitesEnabled: isWorkspaceInvitesEnabled(),
    ownershipTransferEnabled: isOwnershipTransferEnabled(),
  };

  if (!capabilities.workspacesEnabled) {
    return {
      account,
      capabilities,
      workspaces: {
        state: "disabled",
        items: [],
        nextCursor: null,
      },
      selection: {
        state: "disabled",
        selectedId: null,
        context: null,
      },
    };
  }

  const cookieStore = await cookies();
  const selectedWorkspaceId =
    cookieStore.get("solodesk_workspace_id")?.value || null;

  // Read initial page of choices
  let workspaces: ApplicationWorkspaces;
  try {
    const listRes = await listWorkspaces({ limit: 20 });
    const items: WorkspaceChoice[] = listRes.items.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      role: w.role,
      revision: w.revision,
    }));
    workspaces = {
      state: items.length === 0 ? "empty" : "ready",
      items,
      nextCursor: listRes.nextCursor,
    };
  } catch {
    workspaces = {
      state: "unavailable",
      items: [],
      nextCursor: null,
      error: "SERVICE_UNAVAILABLE",
    };
  }

  let selection: ApplicationSelection;
  if (!selectedWorkspaceId) {
    selection = {
      state: "unselected",
      selectedId: null,
      context: null,
    };
  } else {
    try {
      const workspaceId = validateUUID(selectedWorkspaceId, "workspaceId");
      const ctx = await getWorkspaceContext(workspaceId);
      if (
        ctx.workspace.id !== workspaceId ||
        !ctx.capabilities.includes("workspace.select")
      ) {
        selection = {
          state: "restricted",
          selectedId:
            Buffer.byteLength(selectedWorkspaceId, "utf8") <= 4096
              ? selectedWorkspaceId
              : null,
          context: null,
          error: "RESOURCE_UNAVAILABLE",
        };
      } else {
        selection = {
          state: "ready",
          selectedId: workspaceId,
          context: ctx,
        };
      }
    } catch (err) {
      const isRestricted =
        (err instanceof WorkspaceError &&
          (err.statusHttp === 400 ||
            err.statusHttp === 404 ||
            err.code === "RESOURCE_UNAVAILABLE")) ||
        (err &&
          typeof err === "object" &&
          ((err as { statusHttp?: number }).statusHttp === 400 ||
            (err as { statusHttp?: number }).statusHttp === 404 ||
            (err as { code?: string }).code === "RESOURCE_UNAVAILABLE"));
      if (isRestricted) {
        selection = {
          state: "restricted",
          selectedId:
            Buffer.byteLength(selectedWorkspaceId, "utf8") <= 4096
              ? selectedWorkspaceId
              : null,
          context: null,
          error: "RESOURCE_UNAVAILABLE",
        };
      } else {
        selection = {
          state: "unavailable",
          selectedId:
            Buffer.byteLength(selectedWorkspaceId, "utf8") <= 4096
              ? selectedWorkspaceId
              : null,
          context: null,
          error: "SERVICE_UNAVAILABLE",
        };
      }
    }
  }

  return {
    account,
    capabilities,
    workspaces,
    selection,
  };
}

export const getCachedApplicationContext = cache(getApplicationContext);
