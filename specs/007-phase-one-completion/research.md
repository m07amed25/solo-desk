# Research: Phase One Account and Public Entry Completion

**Date**: 2026-11-03. **Basis**: current local source/lock/installed packages, project authorities, primary provider/security documentation and read-only dependency audit. Three read-only research agents covered identity, data and UI/validation as requested by `speckit-plan`. No live auth/DB queries, provider challenges, provisioning, migrations, product edits or browser acceptance were performed.

## R1 — Preserve the selected architecture and runtime

**Decision**: Extend the modular Next application using existing Managed Neon Better Auth, pg pool, shared components and next-intl. No new dependency or backend is required by the design.

**Rationale**: [Architecture](../../docs/architecture/overview.md), [patterns](../../docs/architecture/design-patterns.md), [DESIGN.md](../../DESIGN.md) and the constitution require current service authority and component reuse. Installed Next 16.4.3 has Cache Components/Partial Prefetching enabled; its shipped authentication/cache guides require request data behind streaming boundaries. Keep current session/proof/settings uncached and private/no-store despite optional caching examples in upstream guides.

**Alternatives considered**: Self-hosted second auth server, Supabase compatibility, Redis and broad scaffolding introduce unauthorized architecture or unnecessary operational dependencies. Installed source guides take priority over older Next conventions.

## R2 — SDK availability is not managed-provider proof

**Decision**: Session listing/revocation remain gated until isolated managed-contract proof resolves observed discrepancies. Expose only app-owned authorized DTOs, never raw provider Session objects.

**Evidence**: `node_modules/@neondatabase/auth/dist/server-i57Km2d6.mjs` maps `listSessions` to `list-sessions`, `revokeSession` to `revoke-session`, and `revokeOtherSessions` to `revoke-all-sessions`. Installed Better Auth 1.7.14's `dist/api/routes/session.mjs` implements `/revoke-other-sessions`; its single revoke body uses `token`, whereas the current [Neon server reference](https://neon.com/docs/auth/reference/nextjs-server) documents `sessionId`. That reference currently names `@neon/auth`, while this checkout installs `@neondatabase/auth`; documentation is contextual, not a pinned SDK contract. Server helper POST arguments are top-level and helpers can install response cookies.

Upstream session listing uses creation-time freshness middleware and can reject older valid sessions. Its full Session result contains bearer material. Confirm enumeration bounds, metadata, expiry, current-session identity and first-new-request denial in the actual managed target. App code must privately map a selected opaque reference to the provider's verified target format.

**Alternatives considered**: Guessing paths/body shapes, returning tokens to the browser or directly deleting provider session rows fails correctness/security. The capabilities gate can return unavailable but cannot complete the feature by remaining off.

## R3 — Password and social reauthentication need a verified adapter

**Decision**: Model the specified proof lifecycle now, but mint no real proof until an existing enabled method yields provider-verified same-account freshness while preserving the original session. Unsupported methods fail closed individually.

**Evidence**: Bundled Better Auth `dist/api/routes/password.mjs` has server-scoped `verifyPassword`; the installed managed endpoint map has no demonstrated matching API. The compatibility Supabase adapter's `reauthenticate` only reads a session and is unsuitable. Ordinary managed password sign-in may replace response cookies; using it as confirmation requires independently verified cookie/session isolation and cleanup of auxiliary sessions.

Ordinary [Neon social entry](https://neon.com/docs/auth/guides/setup-oauth) does not establish action-bound freshness. [Google's OIDC reference](https://developers.google.com/identity/openid-connect/openid-connect) describes optional authentication-time claims, but managed request/exposure/verification of those claims is unproven here. Consent/account selection, a token issuance time or a new app session is insufficient. [GitHub OAuth documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps) describes account selection; no usable fresh-authentication attestation was established by this review.

**Alternatives considered**: Email-code fallback, adding password credentials to social accounts, reading password hashes and treating a normal callback as proof contradict confirmed scope. Do not claim that Google can never support freshness; this specific managed integration has not demonstrated it.

## R4 — Provider-origin policy is a distinct trust boundary

**Decision**: Require method/path allowlisting locally plus verified managed-origin controls for disabled methods, abuse limits and proof-protected revocation. Local gating alone cannot approve activation.

**Evidence**: `lib/auth/capabilities.ts` currently ignores method, broadly allows `callback/*` and omits `email-otp/request-password-reset` even when credentials are enabled. `scripts/test-auth-flows.mjs` expects that request operation. Reconcile that source conflict using actual supported managed contracts. Server helpers call the managed base directly; browser callers may know that origin. Test only the explicitly authorized isolated origin, including direct-origin bypass attempts. This is a required exposure test, not a confirmed deployed vulnerability.

**Alternatives considered**: Hidden buttons, CORS or wrapper flags as universal provider controls fail the service-boundary requirement. If the managed service cannot enforce these rules against direct callers, G1 stays blocked rather than inventing a compliant deployment.

## R5 — Separate preferences from managed names

**Decision**: Add one app-owned revisioned row for locale/timezone/optional account email; preserve managed name editing as a separately acknowledged operation, with stale-name acceptance blocked until supported conditional writes are proven.

**Rationale**: `app/actions.ts` saves name through managed `auth.updateUser`; `lib/profile.ts` and live queries read `neon_auth."user"`. A new app preference row can use CAS without pretending to atomically update that external managed effect. Missing preferences return defaults without a read-side insert; expected revision `"0"` creates once, later writes compare/increment decimal-string revisions. No workspace membership or managed-auth FK cascade is needed.

**Alternatives considered**: One “save all” response across two stores can invent success or lose edits. Moving display-name authority into app storage would require intentional profile/live-query/header/context migration; do not silently make that larger architectural change to hide G2. Name concurrency remains an explicit feasibility blocker, not shortened acceptance.

## R6 — Reuse and harden existing PostgreSQL shared admission

**Decision**: Reuse `solodesk.rate_limit_buckets` from migration 002, extracting a small shared admission owner when needed. Commit admission independently before downstream effects, including denied counters. Use database time, deterministic multi-key locking/order, saturated counters, purpose/environment/policy-separated keyed hashes and enforced Retry-After.

**Rationale**: `lib/workspaces.ts` already has a fixed-window counter but its transaction can roll back consumption; `lib/contact.ts` still has a process Map. Neither establishes this feature's distributed admission contract. A [PostgreSQL atomic UPSERT](https://www.postgresql.org/docs/current/sql-insert.html) can enforce concurrent counts. [node-postgres transactions](https://node-postgres.com/features/transactions) require one client; [Neon transaction pooling](https://neon.com/docs/connect/connection-pooling) excludes reliance on connection-level identity state.

Use approved short/long fixed-window policies with explicit boundary tests; do not call a fixed-window budget a rolling-window guarantee. Database/lock/timeout/unknown admission means 503 and zero new downstream effect, with no process-local fallback. Known capped attempts return 429. Existing valid sessions and ordinary sign-out bypass only the admission outage gate, retaining normal identity checks. Exact caps, network/proxy normalization, key rotation and retention remain G3/G4 decisions. Preserve existing workspace policies if helper extraction touches them.

**Alternatives considered**: A new Redis service is unnecessary now; arbitrary client forwarding headers, plain hashes of predictable emails and refunded failed attempts undermine enforcement. Application admission also does not prove direct managed-origin enforcement (R4).

## R7 — Keep app lifetime and explicit presentation intent

**Decision**: New account panels participate in the existing `ApplicationRuntime` generation/concealment/dirty-form behavior. Fix both public-header sign-out handlers and their stale `initialUser` fallback. Remove the simulated newsletter rather than add delivery infrastructure.

**Evidence**: `components/site-header-auth.tsx` navigates in `finally` after sign-out and can fall back to stale initial identity. Existing runtime/profile code already handles concealment, expiry, subscriptions and late generations. `components/landing/footer-section.tsx` contains hardcoded text, unrelated labelled links, unsupported health/legal/social claims; `footer-newsletter-form.tsx` fabricates success with timers. Correct these current surfaces only.

**Locale decision**: A valid `solodesk-locale` browser choice wins; otherwise resolve current saved account locale, otherwise English. Keep account preference and browser presentation writes separate. Theme-only forms currently submit/write locale too; add explicit changed-field intent without removing existing field validation. Never create an explicit locale from a theme change or account fallback. Absent explicit browser locale requires a request-time account lookup; skip it when a valid browser choice exists and avoid middleware recursion through API fetches. Installed `@neondatabase/auth/server` exports `createAuthServer` with a request-context factory, unlike the Next adapter's `next/headers` dependency; bind it to the actual Proxy request and preserve returned cookie updates on the final rewrite. Its production-Next behavior remains to be verified, not assumed from types.

**Alternatives considered**: A derived locale cookie would become stale across accounts and defeat the stated precedence. Parallel client identity managers, a redesign and richer public pages increase scope without solving the missing behaviors.

## R8 — Durable effects, privacy and cleanup require honest boundaries

**Decision**: Add minimal account security events independent of workspace audit, plus restricted operational hold/history records for applicable app-owned classes. Use reviewed documents/config for inventory and schedules; no general policy console. Serialize hold placement and cleanup on the same class/subject lock and recheck references under that lock.

**Rationale**: Existing workspace audit requires workspace membership/receipts. Account effects need redacted actor/outcome/correlation records without arbitrary provider JSON. Provider-owned data, SMTP mailboxes, host logs and backups need external retention/hold enforcement; local records cannot guarantee their erasure or preservation. No purge is enabled without approved schedule/hold authority, and unapproved indefinite retention is not a privacy policy.

Auth email delivery already claims/deduplicates before sending (`lib/auth/email-webhook.ts`, migration 001); preserve unknown-outcome reconciliation. Contact delivery sends an inbox message and receipt separately, so the second can fail after the first succeeded. Include a truthful partial/unknown contact result and, where retries are offered, minimal durable per-send claims before promising retry safety. This does not add a newsletter or outbound notification engine.

**Alternatives considered**: Rolling back a local transaction cannot undo provider revocation/SMTP sends. Deleting dedupe claims too early permits duplicate delivery. A `NOT EXISTS` hold query without shared serialization has a placement race.

## R9 — Fresh dependency findings and advisory limits

**Decision**: Keep current dependencies during planning; record findings and require reachability/remediation review before release. Never call an unavailable scan or historical note clean.

**Observed checks**: [Source identity](artifacts/planning-source-identity.json) confirms installed/locked versions and lock SHA-256 `537f3f7fc1c2321a59965b8869cbe1bbdb234c68d2cac699220901c9543aa96b`. The first audit failed with registry `EAI_AGAIN` ([sandbox result](artifacts/npm-audit-sandbox.json)); an approved retry returned valid [audit JSON](artifacts/npm-audit-2026-11-03.json), exit 1, **27 affected entries: 8 low, 19 moderate, 0 high/critical reported**. Root advisory chains include deepmerge, glob and minimatch. Exposure is not proven tooling-only; no risk exception exists.

| Primary advisory reviewed                                                                                                 | Exact local comparison                                                 | Remaining limit                                                             |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [Next image optimization](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw)                      | Next 16.4.3 is outside published affected 16.x versions through 16.4.0 | Inspect bundled sharp/native/deployed versions separately                   |
| [Next nested cache roots](https://github.com/vercel/next.js/security/advisories/GHSA-h694-7cp9-m8p3)                      | Published affected version is 16.3.0; local 16.4.3 differs             | Verify actual cache isolation; this is not all-cache/all-advisory clearance |
| [Next typed-array cache](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr)                       | Local 16.4.3 is outside affected range through 16.4.0                  | Deployed artifact not inventoried                                           |
| [Better Auth cross-purpose state](https://github.com/better-auth/better-auth/security/advisories/GHSA-965c-763c-88jm)     | Local 1.7.14 is outside affected versions below 1.7.7                  | Managed server build, plugins and coordinated state configuration unknown   |
| [Better Auth PostgreSQL limiter race](https://github.com/better-auth/better-auth/security/advisories/GHSA-44jh-23m7-hpcf) | Local core 1.7.14 is outside its affected core range                   | Managed adapter/version and actual distributed behavior unknown             |

One additional attempted Next advisory URL (`GHSA-22fr-jjr2-ccf2`) returned a retrieval error; it supplied no usable evidence and is excluded from applicability conclusions. Review complete current Next/React/Node/Neon/pg/mail/component/build graphs and managed/deployed scope under G6, not just these five selected notices. Findings belong to Engineering/Security; this planning audit does not amend historical findings or accept risk.

## R10 — Validation must exercise actual boundaries

**Decision**: Preserve existing focused local tests; add meaningful imported service, real PostgreSQL, mounted production-Next and isolated-provider cases during implementation. No new test runner. Record browsers/fixtures/hashes and distinguish all evidence classes.

**Rationale**: The existing auth integration harness can skip absent challenge paths while printing PASS and loads local environment files; repair challenge capture and target identity checks first. Existing HTTP and `test-workspaces-browser.mjs` checks do not constitute full browser interaction. The design validator reports token metadata, not human conformance. Real 200% zoom, fluent Arabic, screen-reader/focus/contrast, current-session revocation, live delivery, shared counters, held-record races and restore/ingress proof remain required.

**Alternatives considered**: Repeating a full build for documentation-only output, pretending simulated transports verify providers, or adding a second runner does not close those gaps. [Quickstart](quickstart.md) labels existing commands, planned additions and gated live execution separately.

## Research conclusion

No unlabelled technical placeholder remains. The selected design uses existing facilities; unsupported or unverified provider behavior is a concrete negative feasibility result with G1/G2 execution errors in [plan.md](plan.md#readiness-gates-and-error-handling). Policy and live-environment approvals remain owned activation/release dependencies. Phase 1 contracts specify required behavior without asserting a working managed implementation. Full Phase 01 cannot be accepted while those gates are blocked.
