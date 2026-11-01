"use server";

import { cookies } from "next/headers";
import {
  createWorkspace,
  updateWorkspaceSettings,
  getWorkspaceContext,
  issueWorkspaceInvitation,
  acceptWorkspaceInvitation,
  resendWorkspaceInvitation,
  revokeWorkspaceInvitation,
  changeWorkspaceMemberRole,
  removeWorkspaceMember,
  leaveWorkspace,
  transferWorkspaceOwnership,
  listWorkspaceInvitations,
  listWorkspaceMembers,
  WorkspaceError,
  CreateWorkspaceInput,
  UpdateWorkspaceSettingsInput,
  IssueInvitationInput,
  AcceptInvitationInput,
  ResendInvitationInput,
  RevokeInvitationInput,
  ChangeMemberRoleInput,
  RemoveMemberInput,
  LeaveWorkspaceInput,
  TransferOwnershipInput,
} from "@/lib/workspaces";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      message: string;
      statusHttp: number;
      fields?: Record<string, string>;
    };

export async function createWorkspaceAction(
  rawInput: CreateWorkspaceInput,
): Promise<
  ActionResult<{
    status: "accepted";
    replayed?: boolean;
    workspaceId: string;
    operationId: string;
    revision: string;
    code: string;
  }>
> {
  try {
    const res = await createWorkspace(rawInput);
    return {
      success: true,
      data: {
        status: "accepted",
        replayed: res.replayed,
        workspaceId: res.workspaceId,
        operationId: res.operationId,
        revision: res.revision,
        code: res.code,
      },
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: "An unexpected error occurred while creating the workspace",
      statusHttp: 500,
    };
  }
}

export async function updateWorkspaceSettingsAction(
  rawInput: UpdateWorkspaceSettingsInput,
): Promise<
  ActionResult<{
    status: "accepted";
    replayed?: boolean;
    workspaceId: string;
    operationId: string;
    revision: string;
    code: string;
  }>
> {
  try {
    const res = await updateWorkspaceSettings(rawInput);
    return {
      success: true,
      data: {
        status: "accepted",
        replayed: res.replayed,
        workspaceId: res.workspaceId,
        operationId: res.operationId,
        revision: res.revision,
        code: res.code,
      },
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: "An unexpected error occurred while updating settings",
      statusHttp: 500,
    };
  }
}

export async function selectWorkspaceAction(
  workspaceId: string,
): Promise<ActionResult<{ selected: string }>> {
  try {
    // Validate that the user is an active member with access
    await getWorkspaceContext(workspaceId);

    const cookieStore = await cookies();
    cookieStore.set("solodesk_workspace_id", workspaceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return {
      success: true,
      data: { selected: workspaceId },
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "RESOURCE_UNAVAILABLE",
      message: "Unable to select workspace",
      statusHttp: 404,
    };
  }
}

export async function clearWorkspaceSelectionAction(): Promise<
  ActionResult<{ cleared: true }>
> {
  const cookieStore = await cookies();
  cookieStore.delete("solodesk_workspace_id");
  return {
    success: true,
    data: { cleared: true },
  };
}

export async function issueWorkspaceInvitationAction(
  rawInput: IssueInvitationInput,
): Promise<
  ActionResult<{
    status: "accepted";
    replayed?: boolean;
    workspaceId: string;
    operationId: string;
    targetId: string;
    code: string;
  }>
> {
  try {
    const res = await issueWorkspaceInvitation(rawInput);
    return {
      success: true,
      data: {
        status: "accepted",
        replayed: res.replayed,
        workspaceId: res.workspaceId,
        operationId: res.operationId,
        targetId: res.targetId,
        code: res.code,
      },
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: "An unexpected error occurred while issuing invitation",
      statusHttp: 500,
    };
  }
}

export async function acceptWorkspaceInvitationAction(
  rawInput: AcceptInvitationInput,
): Promise<
  ActionResult<{
    status: "accepted";
    replayed?: boolean;
    workspaceId: string;
    role: string;
  }>
> {
  try {
    const res = await acceptWorkspaceInvitation(rawInput);

    // Automatically select the accepted workspace
    const cookieStore = await cookies();
    cookieStore.set("solodesk_workspace_id", res.workspaceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return {
      success: true,
      data: {
        status: "accepted",
        replayed: res.replayed,
        workspaceId: res.workspaceId,
        role: res.role,
      },
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "INVITATION_UNAVAILABLE",
      message: "Unable to accept invitation",
      statusHttp: 400,
    };
  }
}

export async function resendWorkspaceInvitationAction(
  rawInput: ResendInvitationInput,
): Promise<
  ActionResult<{
    status: "accepted";
    replayed?: boolean;
    workspaceId: string;
    operationId: string;
    targetId: string;
    code: string;
  }>
> {
  try {
    const res = await resendWorkspaceInvitation(rawInput);
    return {
      success: true,
      data: {
        status: "accepted",
        replayed: res.replayed,
        workspaceId: res.workspaceId,
        operationId: res.operationId,
        targetId: res.targetId,
        code: res.code,
      },
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: "An unexpected error occurred while resending invitation",
      statusHttp: 500,
    };
  }
}

export async function revokeWorkspaceInvitationAction(
  rawInput: RevokeInvitationInput,
): Promise<
  ActionResult<{
    status: "accepted";
    replayed?: boolean;
    workspaceId: string;
    operationId: string;
    targetId: string;
    code: string;
  }>
> {
  try {
    const res = await revokeWorkspaceInvitation(rawInput);
    return {
      success: true,
      data: {
        status: "accepted",
        replayed: res.replayed,
        workspaceId: res.workspaceId,
        operationId: res.operationId,
        targetId: res.targetId,
        code: res.code,
      },
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: "An unexpected error occurred while revoking invitation",
      statusHttp: 500,
    };
  }
}

export async function changeMemberRoleAction(
  rawInput: ChangeMemberRoleInput,
): Promise<
  ActionResult<{
    status: "accepted";
    replayed?: boolean;
    workspaceId: string;
    operationId: string;
    targetId: string;
    code: string;
  }>
> {
  try {
    const res = await changeWorkspaceMemberRole(rawInput);
    return {
      success: true,
      data: {
        status: "accepted",
        replayed: res.replayed,
        workspaceId: res.workspaceId,
        operationId: res.operationId,
        targetId: res.targetId,
        code: res.code,
      },
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: "An unexpected error occurred while changing member role",
      statusHttp: 500,
    };
  }
}

export async function removeMemberAction(rawInput: RemoveMemberInput): Promise<
  ActionResult<{
    status: "accepted";
    replayed?: boolean;
    workspaceId: string;
    operationId: string;
    targetId: string;
    code: string;
  }>
> {
  try {
    const res = await removeWorkspaceMember(rawInput);
    return {
      success: true,
      data: {
        status: "accepted",
        replayed: res.replayed,
        workspaceId: res.workspaceId,
        operationId: res.operationId,
        targetId: res.targetId,
        code: res.code,
      },
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: "An unexpected error occurred while removing member",
      statusHttp: 500,
    };
  }
}

export async function leaveWorkspaceAction(
  rawInput: LeaveWorkspaceInput,
): Promise<
  ActionResult<{
    status: "accepted";
    replayed?: boolean;
    operationId: string;
    code: string;
  }>
> {
  try {
    const res = await leaveWorkspace(rawInput);
    const cookieStore = await cookies();
    cookieStore.delete("solodesk_workspace_id");
    return {
      success: true,
      data: {
        status: "accepted",
        replayed: res.replayed,
        operationId: res.operationId,
        code: res.code,
      },
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: "An unexpected error occurred while leaving workspace",
      statusHttp: 500,
    };
  }
}

export async function transferOwnershipAction(
  rawInput: TransferOwnershipInput,
): Promise<
  ActionResult<{
    status: "accepted";
    replayed?: boolean;
    workspaceId: string;
    operationId: string;
    targetId: string;
    code: string;
  }>
> {
  try {
    const res = await transferWorkspaceOwnership(rawInput);
    return {
      success: true,
      data: {
        status: "accepted",
        replayed: res.replayed,
        workspaceId: res.workspaceId,
        operationId: res.operationId,
        targetId: res.targetId,
        code: res.code,
      },
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: "An unexpected error occurred while transferring ownership",
      statusHttp: 500,
    };
  }
}

export async function listWorkspaceInvitationsAction(
  workspaceId: string,
): Promise<
  ActionResult<
    Array<{
      id: string;
      recipientEmail: string;
      role: string;
      status: string;
      generation: number;
      expiresAt: string;
      createdAt: string;
      revision: string;
    }>
  >
> {
  try {
    const res = await listWorkspaceInvitations(workspaceId);
    return {
      success: true,
      data: res,
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: "Unable to list invitations",
      statusHttp: 500,
    };
  }
}

export async function listWorkspaceMembersAction(workspaceId: string): Promise<
  ActionResult<
    Array<{
      id: string;
      userId: string;
      name?: string | null;
      email?: string | null;
      role: string;
      status: string;
      revision: string;
      createdAt: string;
    }>
  >
> {
  try {
    const res = await listWorkspaceMembers(workspaceId);
    return {
      success: true,
      data: res,
    };
  } catch (err) {
    if (err instanceof WorkspaceError) {
      return {
        success: false,
        error: err.code,
        message: err.message,
        statusHttp: err.statusHttp,
        fields: err.fields,
      };
    }
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
      message: "Unable to list members",
      statusHttp: 500,
    };
  }
}
