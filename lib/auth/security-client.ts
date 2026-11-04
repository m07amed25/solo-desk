"use client";

export type SecurityStatus = {
  state: "ready" | "challenge" | "recovery" | "signed-out";
  userId?: string;
  email?: string;
  factorEnabled?: boolean;
  recoveryAcknowledged?: boolean;
  recoveryGeneration?: string | null;
  recoveryRemaining?: number;
  hasPassword?: boolean;
  providers?: string[];
  accounts?: Array<{ id: string; providerId: string }>;
  passkeys?: Array<{ id: string; name: string }>;
  sessions?: Array<{
    id: string;
    createdAt: string;
    expiresAt: string;
    current: boolean;
  }>;
};

export async function securityRequest<T>(
  path: string,
  body?: Record<string, unknown>,
  options: { signal?: AbortSignal; proof?: string } = {},
): Promise<T> {
  const response = await fetch(`/api/auth${path}`, {
    method: body === undefined ? "GET" : "POST",
    cache: "no-store",
    credentials: "same-origin",
    signal: options.signal,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(options.proof ? { "x-solodesk-action-proof": options.proof } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  options.signal?.throwIfAborted();
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "cooldown"
        : data.code === "TOTP_ALREADY_USED"
          ? "usedCode"
          : "failed",
    );
  return data as T;
}

export async function signInPasskey() {
  const { startAuthentication } = await import("@simplewebauthn/browser");
  const optionsJSON = await securityRequest<
    Parameters<typeof startAuthentication>[0]["optionsJSON"]
  >("/passkey/generate-authenticate-options");
  const response = await startAuthentication({ optionsJSON });
  return securityRequest("/passkey/verify-authentication", { response });
}
