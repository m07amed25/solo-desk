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
  method?: string,
): { allowed: boolean; reason?: string } {
  const normMethod = method ? method.toUpperCase() : undefined;
  // Normalize path segments: strip leading/trailing slashes and optional /api/auth prefix
  let clean = pathname.trim();
  clean = clean.replace(/^\/?api\/auth\/?/i, "").replace(/^\/+|\/+$/g, "");

  const publicPaths: Record<string, Set<string>> = {
    "get-session": new Set(["GET"]),
    session: new Set(["GET"]),
    "sign-out": new Set(["POST"]),
    "sign-in/social": new Set(["POST"]),
    ok: new Set(["GET"]),
  };

  if (clean in publicPaths) {
    if (!normMethod || publicPaths[clean].has(normMethod)) {
      return { allowed: true };
    }
    return { allowed: false, reason: "METHOD_NOT_ALLOWED" };
  }

  if (clean.startsWith("callback/") || clean === "callback") {
    if (!normMethod || normMethod === "GET" || normMethod === "POST") {
      return { allowed: true };
    }
    return { allowed: false, reason: "METHOD_NOT_ALLOWED" };
  }

  // All other operations are credential-related or unknown; check server toggle
  if (!isCredentialsEnabled()) {
    return {
      allowed: false,
      reason: "CAPABILITY_DISABLED",
    };
  }

  const credentialPaths: Record<string, Set<string>> = {
    "sign-in/email": new Set(["POST"]),
    "sign-up/email": new Set(["POST"]),
    "email-otp/verify-email": new Set(["POST"]),
    "email-otp/send-verification-otp": new Set(["POST"]),
    "email-otp/reset-password": new Set(["POST"]),
    "request-password-reset": new Set(["POST"]),
    "email-otp/request-password-reset": new Set(["POST"]),
    "forget-password/email-otp": new Set(["POST"]),
  };

  if (clean in credentialPaths) {
    if (!normMethod || credentialPaths[clean].has(normMethod)) {
      return { allowed: true };
    }
    return { allowed: false, reason: "METHOD_NOT_ALLOWED" };
  }

  return { allowed: false, reason: "CAPABILITY_DISABLED" };
}
