# Identity, Challenge, and Abuse Policy (Policy Version 1.0)

> Current revalidation, 3 November 2026: No owner approval reference was supplied. The numeric thresholds and challenge policy below are synthetic/local fixtures, not approved production activation policy. G3 remains BLOCKED and T016 is unchecked. See [implementation-resume.md](implementation-resume.md).

> Scope clarification for Phase 02: that revalidation supersedes the older approval/activation headings below. The five decisions confirmed in Feature 007's specification remain scoped requirements; no broader MFA, passkey, recovery-code, verified-email-change or linking policy is approved. Q-08's recorded Phase 01 resolutions still need the scoped activation evidence required by G3/G5. Feature 008 POL-01–POL-03 track the additional decisions; do not copy these fixture limits or the revocation-only five-minute proof into new actions by default. The current confirmation route's 5/300 cap also differs from the 3/60 fixture below and must be reconciled in its owning task before reuse.

**Feature**: Phase One Account and Public Entry Completion (`specs/007-phase-one-completion`)  
**Task**: T016 (User Story 1)  
**Date**: 2026-11-03  
**Status**: APPROVED FOR SCOPED PHASE 1 (Resolves Q-08 Scoped Slice under G3)  
**References**: [docs/planning/decisions.md](file:///home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#L61), [contracts/account-services.md](file:///home/mohamed-s/Desktop/Projects/solor-desk/specs/007-phase-one-completion/contracts/account-services.md), [data-model.md](file:///home/mohamed-s/Desktop/Projects/solor-desk/specs/007-phase-one-completion/data-model.md)

---

## 1. Five Confirmed Decisions (Binding Architectural Invariants)

These decisions were confirmed during requirements planning and are non-negotiable:

1. **Reauthenticate before revoking other sessions**: High-risk session revocations (individual or bulk "revoke all other") require explicit fresh reauthentication; ordinary current sign-out is strictly exempt.
2. **Proof lifetime**: A minted reauthentication proof is valid for exactly 5 minutes (300 seconds) or one successful revocation command execution, whichever comes first.
3. **Language resolution**: Language preference resolves through strict precedence: Browser Presentation Hint (`NEXT_LOCALE` cookie) → Verified Account Preference (`locale` column in `solodesk.account_preferences`) → English (`en`) Fallback.
4. **Shared limiter outages**: Shared admission database/limiter failure pauses new registrations, sign-ins, OTP requests, and public submissions with HTTP 503; valid existing session checks and ordinary sign-out are strictly exempt and remain functional.
5. **Reauthentication methods**: Confirmation requires an existing enabled password or fresh Google/GitHub social flow with verified same-account identity.

---

## 2. Scoped Q-08 Identity & Challenge Rules

| Category               | Policy Parameter        | Specification                            | Invariant / Enforcement                                                                                                                                |
| :--------------------- | :---------------------- | :--------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Email Verification** | OTP Format              | 6-digit numeric string (e.g. `"012345"`) | Preserves leading zeros as string; never converts to integer.                                                                                          |
| **Email Verification** | Lifetime                | 10 minutes (600 seconds)                 | Evaluated using server/database time. Expired OTP returns 400 with `CHALLENGE_EXPIRED`.                                                                |
| **Email Verification** | Single-Use              | Exactly 1 consumption                    | Replay of consumed code returns 400 with `CHALLENGE_ALREADY_CONSUMED`.                                                                                 |
| **Email Verification** | Superseded Invalidation | Immediate upon resend                    | Issuing a new verification OTP immediately invalidates all previous active OTPs for that email and purpose.                                            |
| **Password Reset**     | Lifetime                | 10 minutes (600 seconds)                 | Single-use combined OTP + new password submission.                                                                                                     |
| **Password Reset**     | Session Invalidation    | Atomic across all sessions               | Successful reset immediately revokes all prior active sessions for that account and invalidates the previous password hash. Fresh sign-in is required. |
| **Password Recovery**  | Anti-Enumeration        | Non-disclosing 200 response              | Requests for unknown emails or social-only accounts return indistinguishable success messages without leaking account existence or credential type.    |
| **Password Recovery**  | Social-Only Safety      | No unverified credential linkage         | Submitting a password reset for a social-only account without verified email proof cannot link credentials to the account.                             |

---

## 3. Shared Admission & Rate Limiting Quotas

Enforced via `lib/rate-limit.ts` against `solodesk.rate_limit_buckets` using HMAC purpose-separated keys:

| Purpose Key           | Limit | Window | Target Signals                   | Outage Behavior                      |
| :-------------------- | :---- | :----- | :------------------------------- | :----------------------------------- |
| `auth:sign_in`        | 5     | 60s    | Normalized IP + Normalized Email | 503 Fail-Closed (No memory fallback) |
| `auth:register`       | 3     | 60s    | Normalized IP                    | 503 Fail-Closed (No memory fallback) |
| `auth:verify_otp`     | 3     | 60s    | Normalized IP + Normalized Email | 503 Fail-Closed (No memory fallback) |
| `auth:resend_otp`     | 3     | 60s    | Normalized IP + Normalized Email | 503 Fail-Closed (No memory fallback) |
| `auth:reset_password` | 3     | 60s    | Normalized IP + Normalized Email | 503 Fail-Closed (No memory fallback) |
| `reauth:confirm`      | 3     | 60s    | Normalized IP + Account User ID  | 503 Fail-Closed (No memory fallback) |
| `contact:submit`      | 3     | 600s   | Normalized IP Hash               | 503 Fail-Closed (No memory fallback) |

- **Exempt Operations**: Existing session checks (`GET /api/auth/get-session`), ordinary sign-out (`POST /api/auth/sign-out`), own settings reads (`GET /api/account/preferences`).
- **Saturation**: Saturated counters clamp at `2147483647` rather than rolling over.
- **Commit Isolation**: Admission counts commit in an independent short transaction; downstream failures do not refund consumed attempts.

---

## 4. G3 Policy Activation State

- **Local & Synthetic Tests**: Active under Policy Version `1.0`.
- **Remote / Production Activation**: G3 gating requires that live environment variables (`RATE_LIMIT_SECRET`, `SOLODESK_AUTH_CREDENTIALS_ENABLED`) and remote endpoints adhere strictly to these approved thresholds without local bypasses.
