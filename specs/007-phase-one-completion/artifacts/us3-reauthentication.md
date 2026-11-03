# User Story 3 Evidence: Reauthentication and Session Revocation Authorization

> Current revalidation, 3 November 2026: G1/G3/G5 remain BLOCKED. Local state-machine/PostgreSQL/transport checks do not demonstrate supported fresh proof or real revocation; T035/T036 are unchecked. See [implementation-resume.md](implementation-resume.md).

**Date**: 2026-11-03  
**Status**: LOCAL EVIDENCE COMPLETE; REMOTE HOSTED G1/G5 GATES BLOCKED PENDING OWNER PROVISIONING  
**Governing Policy**: [decisions.md](../../../docs/planning/decisions.md) (Q-08), [identity-policy.md](identity-policy.md), [managed-capabilities.md](managed-capabilities.md)  
**Applicable SEC Controls**: SEC-003, SEC-010, SEC-020, SEC-030, SEC-041, SEC-044, SEC-048

---

## 1. Executive Summary

User Story 3 establishes the action-bound confirmation and command foundation required before session management:

1. **Fresh Proof Window**: Exactly five minutes (300,000 ms) from verification timestamp (`verified_at`), verified to millisecond accuracy (valid at 299,999 ms; rejected at 300,000 ms).
2. **Immutable Target Snapshot**: Frozen server-side at confirmation creation time; targets cannot be dynamically enlarged or mutated.
3. **Single-Use Consumption**: Exactly one successful revocation consumes the proof. Replay or subsequent actions are strictly denied.
4. **Atomic Reservation**: Concurrent claims under PostgreSQL resolve with exactly one winning operation; losing operations receive `409 INTENT_LOCKED`. Identical operations retry safely.
5. **Fail-Closed on Ambiguity**: Timeouts, crashes, or ambiguous provider replies lock the intent reservation as `unavailable` to prevent token release or double execution.
6. **No Destructive Side Effects**: Ordinary sign-out remains available without reauthentication. Unsupported social methods are rejected honestly (503 `METHOD_UNAVAILABLE`) rather than fabricating proof.

---

## 2. Gate Verification & Provider Capabilities

| Gate   | Requirement                      | Observed Status                                   | Evidence / Notes                                                                                                                                                                                                                                                                      |
| :----- | :------------------------------- | :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **G1** | Managed Reauth & Session Control | **BLOCKED (Truthful)**                            | As audited in [managed-capabilities.md](managed-capabilities.md), Better Auth 1.7.6 / `@neondatabase/auth` does not support non-destructive social reauth (`google`, `github`) or cookie-preserving password reauth without custom adapters. Methods return 503 `METHOD_UNAVAILABLE`. |
| **G3** | Admission & Rate Limiting        | **VERIFIED (Local)**                              | Admission limiter enforced for `"reauth:confirm"` (5 attempts / 300s) on `/api/account/reauthentication`. Outages fail closed with 503.                                                                                                                                               |
| **G5** | Isolated Environment             | **BLOCKED (Hosted)** / **VERIFIED (Local PG 18)** | Local PostgreSQL 18 cluster verified with full schema migration and runtime grants. Remote Neon hosted target remains BLOCKED pending owner provisioning.                                                                                                                             |

---

## 3. Local PostgreSQL Verification (`test-account-security-postgres.mjs`)

Evidence captured from `node scripts/test-account-security-postgres.mjs --local`:

```text
Applying 001-email-deliveries.sql
Applied 001-email-deliveries.sql
Applying 002-workspace-platform.sql
Applied 002-workspace-platform.sql
Applying 003-account-completion.sql
Applied 003-account-completion.sql
Applying 004-account-security.sql
Applied 004-account-security.sql
PASS: SEC-041/044 DDL and TRUNCATE denial on security tables verified.
PASS: Original-session and user-identity binding verified in PostgreSQL.
PASS: Concurrent claim race resolves with exactly one winner under PostgreSQL.
PASS: Ambiguous/timeout outcome locks reservation and prevents token release.
PASS: Provider dispatch boundary detects original session revocation.
LIMIT: local PostgreSQL evidence only; remote Neon hosted G5 gate remains BLOCKED pending owner target provisioning.
```

### PostgreSQL Invariants Verified:

1. **SEC-041 / SEC-044**: App role `solodesk_app` cannot `TRUNCATE`, `DROP`, or `ALTER` `solodesk.reauth_intents` or `solodesk.revocation_operations`.
2. **Composite Identity Binding**: Queries enforce `(id, user_id, original_session_id)` match; mismatched sessions or accounts receive 0 rows without disclosing record existence.
3. **Atomic Reservation**: Two concurrent transactions attempting `UPDATE solodesk.reauth_intents SET state = 'reserved' ... WHERE state = 'verified'` result in exactly one winner. The second returns 0 rows and is rejected.
4. **Timeout / Ambiguity Locks**: An operation ending in `unknown` state transitions the reservation to `unavailable`, ensuring that an ambiguous external call cannot result in proof reuse or token release.
5. **Caller Authority Re-Check**: Before dispatching each target in a bulk revocation, the caller's session active status and proof expiry are re-verified.

---

## 4. Unit & Contract Verification (`test-account-security.test.mjs`)

Evidence captured from `node --test scripts/test-account-security.test.mjs`:

```text
✔ reauth intent: validates input and creates pending intent with frozen targets (2.129441ms)
✔ reauth verification: exactly 5-minute proof window (299,999 ms vs 300,000 ms) (0.244162ms)
✔ stale original session: foreign or expired session cannot verify or reserve proof (0.220788ms)
✔ atomic reservation: concurrent operations conflict, identical operation retries safely (0.164685ms)
✔ expiry rejection: expired proof cannot be reserved (0.13829ms)
✔ consumption: one-success consumes proof, preventing replay or second action (0.136708ms)
✔ definitive no-effect release vs unknown outcome locks (0.206424ms)
✔ operation creation & payload digest: immutable target snapshot without credentials (0.364322ms)
✔ server adapters: social reauth is unavailable (G1), password verifies freshness (0.827439ms)
✔ revocation dispatch: commits reservation before provider I/O, consumes on success (1.111016ms)
✔ reauth route handlers: enforces admission, origin, and safe response projection (23.088629ms)
✔ session revocation route handlers: enforces origin, validates UUIDs, and returns receipts (9.877803ms)
ℹ tests 12, pass 12, fail 0
```

---

## 5. Route & Component Architecture

### Endpoints Implemented:

1. **`POST /api/account/reauthentication`**:
   - Creates new intent with `{ action, method, targetReference? }`.
   - Verifies intent with `{ confirmationId, password }`.
   - Enforces origin checking (`validateAccountOrigin`), 4 KiB limits, and `"reauth:confirm"` admission.
   - Sets `Cache-Control: private, no-store`.
2. **`GET /api/account/reauthentication?confirmationId=...`**:
   - Returns safe confirmation state projection (`confirmationId`, `state`, `action`, `method`, `expiresAt`, `verifiedAt`).
   - Disallows foreign access (404 without disclosure).
3. **`POST /api/account/session-revocations`**:
   - Accepts `{ operationId, confirmationId }`.
   - Claims reservation atomically, dispatches targets with authority and expiry pre-checks, returns safe receipt.
4. **`GET /api/account/session-revocations/[operationId]`**:
   - Returns status receipt for owned operations.

### Frontend Components:

- **`components/account-reauthentication.tsx`**:
  - Inline confirmation component composed onto `app/(site)/[locale]/[theme]/app/account/page.tsx`.
  - Integrates with `useApplicationRuntime().registerDirtyForm` to warn on navigation while input is dirty.
  - Automatically suppresses late completions if account generation increments.
  - Accurately conveys `accepted`, `partial`, and `unknown` outcomes.
  - Fully localized in English (`messages/en.json`) and Arabic (`messages/ar.json`) under `AccountSecurity`.
