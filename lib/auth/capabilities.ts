import "server-only";

export type AuthCapabilities = {
  credentialsEnabled: boolean;
  workspacesEnabled: boolean;
  workspaceInvitesEnabled: boolean;
  ownershipTransferEnabled: boolean;
};

export function isCredentialsEnabled(): boolean {
  return process.env.SOLODESK_AUTH_CREDENTIALS_ENABLED === "true";
}

export function isWorkspacesEnabled(): boolean {
  return process.env.SOLODESK_WORKSPACES_ENABLED === "true";
}

export function isWorkspaceInvitesEnabled(): boolean {
  return process.env.SOLODESK_WORKSPACE_INVITES_ENABLED === "true";
}

export function isOwnershipTransferEnabled(): boolean {
  return process.env.SOLODESK_OWNERSHIP_TRANSFER_ENABLED === "true";
}

export function getPublicCapabilities(): AuthCapabilities {
  return {
    credentialsEnabled: isCredentialsEnabled(),
    workspacesEnabled: isWorkspacesEnabled(),
    workspaceInvitesEnabled: isWorkspaceInvitesEnabled(),
    ownershipTransferEnabled: isOwnershipTransferEnabled(),
  };
}

/**
 * Checks whether an incoming request path to the Better Auth SDK proxy is allowed
 * under the current capability matrix.
 *
 * Social authentication, session reads, callbacks, and sign-out are always allowed.
 * All credential-based operations (registration, password login, email OTP verification,
 * password recovery/reset, credential changes, and account linking) require
 * SOLODESK_AUTH_CREDENTIALS_ENABLED="true". Unknown operations fail closed.
 */
export function isAllowedAuthPath(
  pathname: string,
  _method?: string,
): { allowed: boolean; reason?: string } {
  void _method;
  // Normalize path segments: strip leading/trailing slashes and optional /api/auth prefix
  let clean = pathname.trim();
  clean = clean.replace(/^\/?api\/auth\/?/i, "").replace(/^\/+|\/+$/g, "");

  // Always allowed independent of credentials toggle
  const isPublicAllowed =
    clean === "get-session" ||
    clean === "session" ||
    clean === "sign-out" ||
    clean === "sign-in/social" ||
    clean.startsWith("callback/") ||
    clean === "callback" ||
    clean === "ok";

  if (isPublicAllowed) {
    return { allowed: true };
  }

  // All other operations are credential-related or unknown; check server toggle
  if (!isCredentialsEnabled()) {
    return {
      allowed: false,
      reason: "CAPABILITY_DISABLED",
    };
  }

  return { allowed: true };
}
