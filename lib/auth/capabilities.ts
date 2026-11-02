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
  // Acceptance, abuse accounting and operational delivery still require T061 proof.
  return false;
}

export function isOwnershipTransferEnabled(): boolean {
  // The managed provider has no verified account/session/action-bound step-up adapter.
  return false;
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

  const credentialPaths = new Set([
    "sign-in/email",
    "sign-up/email",
    "email-otp/verify-email",
    "email-otp/send-verification-otp",
    "email-otp/reset-password",
  ]);
  return credentialPaths.has(clean)
    ? { allowed: true }
    : { allowed: false, reason: "CAPABILITY_DISABLED" };
}
