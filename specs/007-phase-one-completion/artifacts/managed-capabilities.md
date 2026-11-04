# Managed Capabilities and Provider Evidence Ledger (Gate G1)

> Phase 02 prerequisite review, 3 November 2026: the installed checkout has `@neondatabase/auth` 0.7.0-beta and `better-auth` 1.7.14. The 1.7.6 audit and “SUPPORTED”/privilege-verification claims below are historical upstream/local observations, not actual hosted acceptance. No independently verified target exists in current evidence; G1/G5 stay blocked. Current production routes supply no real password/list/revoke adapter; social freshness is unavailable. Reconcile installed revoke routing and token/ID shapes before use. See [owning corrections](readiness.md#phase-02-prerequisite-review--3-november-2026) and [dated capability distinctions](../../008-strengthen-account-security/artifacts/specification-context.md#capability-review).

**Feature**: Phase One Account and Public Entry Completion (`specs/007-phase-one-completion`)  
**Task**: T027 (User Story 3)  
**Date**: 2026-11-03  
**Status**: CAPABILITIES AUDITED / GATE G1 TRUTHFULLY BLOCKED (Awaiting Identity Engineering & Security Demonstrations)  
**References**: [readiness.md](file:///home/mohamed-s/Desktop/Projects/solor-desk/specs/007-phase-one-completion/artifacts/readiness.md#L14), [account-services.md](file:///home/mohamed-s/Desktop/Projects/solor-desk/specs/007-phase-one-completion/contracts/account-services.md#L32-L56), [lib/auth/account-security.ts](file:///home/mohamed-s/Desktop/Projects/solor-desk/lib/auth/account-security.ts)

---

## 1. Executive Summary & G1 Status

Per project constitution and Gate G1 rules:

> "Managed list/revoke routing/bounds, original-session preservation, password/Google/GitHub fresh proof and direct-origin enforcement require isolated evidence. If unsupported, record owners and leave dependent real implementation blocked without substituting getSession/email codes/auth-table SQL."

Following a comprehensive audit of `@neondatabase/auth` (v0.7.0-beta) and upstream `better-auth` (v1.7.6), Gate G1 is **BLOCKED**.

Several required reauthentication and session-control capabilities are either unproven in the managed provider or unsupported without destructive side effects (such as session overwrites). Under no circumstances will SoloDesk circumvent these limitations by reading `password_hash` from PostgreSQL, accepting unverified cached sessions, or fabricating social freshness proofs.

---

## 2. Capability Audit and Evidence Analysis

### 2.1 Managed List & Revoke Routing (`revoke_session` vs `revoke_other_sessions`)

| Capability                | Upstream Endpoint / Mechanism          | Observed Shape / Behavior                                                               | G1 Assessment                                                                                                                                                                                  |
| :------------------------ | :------------------------------------- | :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **List Sessions**         | `GET /api/auth/list-sessions`          | Returns JSON array of sessions belonging to user. Unpaginated.                          | **PARTIALLY SUPPORTED**: Needs server-side slicing and opaque cursor projection.                                                                                                               |
| **Revoke Exact Session**  | `POST /api/auth/revoke-session`        | Accepts `{ token?: string, id?: string }`.                                              | **DISCREPANCY DETECTED**: Database stores `id` (UUID) and `token` (bearer secret). Upstream routing must be verified on whether `id` is accepted without requiring client exposure of `token`. |
| **Revoke Other Sessions** | `POST /api/auth/revoke-other-sessions` | Revokes all sessions belonging to user _except_ calling session based on active cookie. | **REQUIRES VERIFICATION**: Must prove caller session cookie is not invalidated or rotated during bulk revocation.                                                                              |
| **Revoke All Sessions**   | `POST /api/auth/revoke-sessions`       | Revokes _all_ user sessions, including caller.                                          | **SUPPORTED**: Reserved for full sign-out or password reset invalidation.                                                                                                                      |

#### Invariant Enforcement

- SoloDesk client APIs (`/api/account/sessions`) will expose only opaque session `reference` UUIDs, never raw session tokens.
- Bulk revocation (`revoke_other_sessions`) requires frozen target snapshots. If upstream list is unbounded (> 100 sessions) or returns inconsistent sets, bulk revocation must abort with an error rather than risking an unbounded blast radius.

---

### 2.2 Session ID vs Token Shape Discrepancy (SEC-004 / SEC-048)

In the underlying PostgreSQL schema (`neon_auth.session`):

- `id`: `uuid PRIMARY KEY` — Unique, safe internal identifier.
- `token`: `text NOT NULL` — Raw bearer secret sent in session cookies.

**Security Mandate**:

- The runtime database role `solodesk_test_runtime` has `GRANT SELECT (id, "userId", "expiresAt") ON neon_auth.session`.
- `token` is strictly inaccessible (`42501 Insufficient Privilege`, verified in T023).
- Managed provider adapters must resolve sessions by `id` or server-side cookie context. The app layer will **NEVER** query or forward `token` to the browser or store it in app tables.

---

### 2.3 Listing Age, Bounds, and Pagination (SEC-009 / SEC-017)

- **Finding**: Upstream Better Auth does not provide cursor-based pagination for `listSessions`.
- **Enforced App Boundary**:
  - Max page size: 20 items per page; maximum bounded ceiling: 100 sessions.
  - Opaque cursor format: Encodes timestamp and session UUID, bound to current `user_id`.
  - If upstream provider returns > 100 sessions, the response is flagged with `complete: false` and bulk `revoke_other_sessions` is **disabled** until the active session footprint is pruned below the safety threshold.

---

### 2.4 Cookie-Preserving Password Reauthentication (SEC-003 / SEC-010)

- **Problem**: In standard Better Auth, calling `/api/auth/sign-in/email` with valid credentials generates a **new** session and sets `Set-Cookie` headers, destroying the original session state.
- **Requirement**: Sensitive action confirmation (US3) must verify credentials for the _existing_ account without replacing the active session cookie or altering `original_session_id`.
- **Status**: **BLOCKED (G1)**.
- **Evaluation**: Managed Neon Auth currently lacks a verified native `/api/auth/verify-password` endpoint in the 0.7.0 beta build that validates password proof while preserving existing cookies.
- **Action**: Identity Engineering must demonstrate or configure a non-destructive verification handler before live password reauthentication can be enabled. Direct database verification (`SELECT password_hash`) is strictly prohibited by SEC-041.

---

### 2.5 Social Same-Account Freshness (Google & GitHub) (SEC-008 / SEC-010)

- **Problem**: Standard OAuth 2.0 authorization redirects return to the callback route and issue new sessions.
- **Requirement**: Proving recent control via Google/GitHub for an already signed-in user must:
  1. Confirm the social identity matches the currently authenticated account.
  2. Prove authentication occurred _recently_ (within 5 minutes of intent creation).
  3. Avoid replacing the current session cookie.
- **Status**: **UNSUPPORTED / BLOCKED (G1)**.
- **Evaluation**: Managed Neon Auth has no mechanism to perform an in-flight OAuth "re-auth prompt" that returns an ephemeral verification token to an existing session without full session renewal.
- **Decision**: Social reauthentication methods (`google`, `github`) remain flagged as **UNAVAILABLE** in `lib/auth/account-security.ts`. The UI will clearly state that social reauthentication is unavailable and will not fake proof by checking `currentSession()`.

---

### 2.6 Direct-Origin Bypass Denial (SEC-026 / SEC-027)

- **Problem**: If clients or malicious scripts call `NEON_AUTH_BASE_URL` directly, they could bypass SoloDesk's application-level admission control (rate limiting) and origin checks.
- **Requirement**: Provider must enforce `trustedOrigins: [process.env.APP_URL]` and reject direct cross-origin requests.
- **Status**: **BLOCKED (G1)** until independently verified against the remote managed instance under G5.

---

## 3. Gate G1 Ownership and Release Criteria

| Gate G1 Requirement                       | Named Owner Role                | Target Resolution                                                                        | Blocking Impact                                          |
| :---------------------------------------- | :------------------------------ | :--------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| **Non-Destructive Password Verification** | Identity Engineering            | Provide or configure isolated verify-password handler preserving caller session cookies. | Blocks live password confirmation in US3 (T030, T036).   |
| **Social Reauthentication Freshness**     | Identity Engineering + Security | Formalize same-account reauth protocol or confirm permanent exclusion.                   | Blocks live social reauthentication in US3 (T030, T036). |
| **Exact Session Revocation by UUID**      | Data Platform + Identity        | Verify whether `revoke-session` endpoint accepts UUID without bearer token.              | Blocks live individual session revocation in US2 (T044). |
| **Direct-Origin Bypass Enforcement**      | Security + Operations           | Audit and verify provider CORS and origin allowlisting in Neon console.                  | Blocks remote production sign-off.                       |

> [!WARNING]
> In compliance with project guidelines, dependent tasks (T030, T036) will implement defensive handlers that report `unavailable` for unsupported managed capabilities. No fake approvals or custom SQL backdoors will be created.
