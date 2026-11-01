# Research: Workspace Platform and Authorization

Date: 2026-11-01. Sources: current repository, installed packages/docs and official upstream references below. Decisions describe planned implementation, not hosted proof. Research was split into source/evidence inspection and a read-only identity/transaction research agent as directed by Speckit Plan.

## R1 — Preserve the managed identity boundary

**Decision**: Keep `@neondatabase/auth` Managed Better Auth, its existing client/server SDK and catchall. Workspace records are application-owned; do not run upstream Better Auth schema generators or install the organization plugin.
**Rationale**: The selected account architecture already exists. The local lock resolves SDK 0.7.0-beta and Better Auth 1.7.14; neither identifies the hosted service version. Inspect actual managed schema/version/permissions on an authorized isolated target before SQL application. The SDK source recognizes the string `disableCookieCache: "true"`, which existing code uses.
**Alternatives considered**: A second self-hosted auth server, copied credential tables and a managed organization-plugin assumption introduce competing authority or unsupported schema changes.
**Evidence**: `lib/auth/{client,server}.ts`, `lib/profile.ts`, installed SDK `dist/server-i57Km2d6.mjs`, lockfile. [Neon server SDK](https://neon.com/docs/auth/reference/nextjs-server), [Better Auth admin behavior](https://better-auth.com/docs/plugins/admin). Upstream descriptions do not verify this hosted branch.

## R2 — Reconcile evidence before activating credentials

**Decision**: Retain the original G1–G6 meanings from feature 003's plan and initial evidence table; use [evidence.md](evidence.md) as the current reconciliation ledger. Add a server-owned default-off capability policy before delegating SDK handlers, with explicit allowed operations rather than a stale denylist. Map all actual SDK aliases/methods and direct managed endpoints.
**Rationale**: Forms are exposed and the catchall directly exports SDK handlers; written blocked status is not runtime enforcement. The current integration runner catches assertions, runs offline checks and exits zero. Empty challenge capture and conditional checks produce false completion signals.
**Alternatives considered**: UI hiding, client cooldowns, treating a production refusal as a hosted pass, or adding only a signup-path denylist do not close direct invocation. App-proxy gating alone cannot disable a public managed endpoint; upstream configuration and actual denial tests are also activation requirements.
**Evidence**: `scripts/test-auth-flows.mjs`, `app/api/auth/[...path]/route.ts`, feature 003 evidence sections 2 and 10.3/10.6. See [identity contract](contracts/auth-and-release.md).

## R3 — Small server-only workspace module with current authority

**Decision**: Begin in `lib/workspaces.ts`, reuse `lib/db.ts`, and strengthen the shared session boundary in `lib/auth/server.ts`. Each exported workspace function derives identity from request context, validates inputs, verifies current managed user/session and current membership/grants, and returns allowlisted projections. No exported unchecked tenant-query helper is public application API.
**Rationale**: `currentSession()` checks fresh SDK verification/expiry but does not explicitly check bans; `loadProfile()` adds banned/current-session SQL checks. New callers must not accidentally inherit a weaker boundary. Private pages/API/live data stay out of shared caches; preserve Cache Components and use existing request-time boundaries.
**Alternatives considered**: Role-bearing cookies, layout-only redirects, generic repositories, tenant context globals and broad cached workspace objects add risk without value.
**Evidence**: Installed Next.js 16.4.3 guides `node_modules/next/dist/docs/01-app/02-guides/{authentication,data-security}.md` and current profile code. No application code is written during this planning run.

## R4 — One connection, one atomic command

**Decision**: Use `db.connect()` and one client for BEGIN, local timeouts, authority, locks, receipt claim/digest, effect/revision, audit/outbox and COMMIT. ROLLBACK on failure, release in finally, discard broken clients after rollback failure. Keep network calls outside transactions. Schema-qualify SQL; no session-scoped tenant state.
**Rationale**: pg transactions require the same client; Neon pooling uses transaction mode. Application runtime stays pooled; migrations use a reviewed direct connection. Lock workspace before changing any membership/grant/invitation, then receipt/target records in a consistent order. Creation uses actor+operation transaction advisory locking (not session locking) before any workspace exists.
**Alternatives considered**: `db.query()` across transaction statements, persistent SET and SMTP inside transactions break isolation, correctness or pool capacity.
**Sources**: [node-postgres transactions](https://node-postgres.com/features/transactions), [Neon pooling](https://neon.com/docs/connect/connection-pooling), [PostgreSQL row locking](https://www.postgresql.org/docs/17/explicit-locking.html). Actual hosted PostgreSQL major remains a preflight check; no major-17-specific feature is required.

## R5 — Authority linearization and owner safety

**Decision**: All membership/grant mutations and workspace commands lock the workspace row before current authority and owner-count checks. Add deferred database invariant checks and coherent `owner_id` designation. Role membership, not user login status, defines the owner-count invariant. A banned last Owner cannot act; recovery is an audited operations procedure, never a public bypass.
**Rationale**: Locking different membership rows allows two last-Owner removals. A deterministic lock and invariant checked at commit prevents orphaning. Grants revoked through this service serialize with commands. Recheck managed account/session in the final effect statement; the final successful authority observation orders in-flight work against external managed revocation. Do not promise cancellation of a command already authorized before that observation or recall of downloaded data.
**Alternatives considered**: UI-only final-owner controls, unlocked count-then-delete, or guaranteeing transactional revocation across an independent managed HTTP service are unsound.

## R6 — Explicit slice policy and minimal grants

**Decision**: User clarification confirms Owner/Admin/Member, bounded Admin powers and 72-hour invitation expiry. Only Owners promote existing members to Admin/Owner; Admin may invite/remove Members only. Owner promotion/transfer requires supported fresh reauthentication. Use materialized allowlisted workspace-action grants constrained by role ceilings, all changed atomically. Non-workspace scope and unknown future actions are rejected in this phase.
**Rationale**: Satisfies granular authorization without inventing project/finance services or a role editor. The slice does not settle broader Q-05 or Q-08; record the scoped decisions and remaining owners in the central register during implementation.
**Alternatives considered**: Six roles now, automatic future permissions and role-only client decisions exceed scope.

## R7 — Invitation proof and reliable delivery

**Decision**: Generate 32 random bytes using Node crypto, encode base64url and persist only a SHA-256 token digest on the invitation. To make committed delivery recoverable, encrypt token-bearing delivery material using AES-256-GCM with an independent server-only key and key ID; bind workspace/invitation/generation as authenticated data. Keep it only in the restricted outbox; remove ciphertext after sent/cancelled/expired. Never include tokens in receipts, audit, general event payloads or telemetry.
**Rationale**: A token digest cannot reconstruct a delivery link after commit; plaintext durable bearer tokens would expose authority. A small encrypted delivery field addresses this concrete need. Secret-key provisioning and rotation proof block live delivery until available.
**Alternatives considered**: Sending before commit, hashing then trying to reconstruct a token, storing plaintext links and deriving tokens from guessable IDs fail safety or recovery.
**Delivery policy**: At-least-once sending can yield duplicate emails; single-use acceptance remains authoritative. Reuse deterministic Message-ID for retries; ambiguous SMTP acceptance is `unknown` and requires reconciliation, not blind resend. Resend rotates generation/token and invalidates previous proof. Workers recheck inviter authority/current pending state just before sending; an already submitted email cannot be recalled.

## R8 — Browser context and invitation navigation

**Decision**: Keep canonical `/app` and existing preference return-path allowlist. Store a validated workspace UUID in a bounded HttpOnly/SameSite cookie; it is a selector only. Every command includes the explicit original workspace UUID and compares the current selector; a stale cross-tab command fails rather than retargets. No workspace private replica or localStorage is introduced.
**Invitation navigation**: Use `/app#invitation=<token>` in the email. For authenticated /app the minimal client component removes the fragment immediately and holds proof only in memory, then submits a same-origin action; no acceptance on GET. For unauthenticated /app, the existing server redirect must explicitly replace the fragment with empty `/sign-in#`; verify every preceding proxy/SDK redirect preserves this clearing behavior in actual supported browsers. A protected client component cannot clear a fragment when a server redirect prevents it mounting. If signed out or a full reload discards proof, ask the recipient to sign in and reopen the original link. Do not preserve tokens in `next`, callback parameters, preferences or browser storage. Use `Referrer-Policy: no-referrer` and exclude invitation material from analytics/error reporting.
**Alternatives considered**: Workspace URLs requiring a broad proxy/allowlist rewrite, cookies with roles, token query strings, automatic GET acceptance and persistent token drafts are unnecessary here.

## R9 — Schema, bounds and recovery

**Decision**: Add an application `solodesk` schema with workspace/membership/grant/invitation/receipt/audit/outbox and small shared rate-limit buckets. First proposed filename is `migrations/002-workspace-platform.sql`, but reserve it only after checking actual applied history and local filenames. Do not alter `neon_auth`, copy identity facts, or change migration 001. Use UUID identifiers, TIMESTAMPTZ, bounded BIGINT revisions serialized as decimal strings, and parameterized scoped SQL. Composite foreign keys prevent foreign-tenant relationships. Application authorization is primary; this slice does not claim RLS protection.
**Rationale**: Existing `pg` and plain SQL migrations are sufficient. Audit is append-only for runtime users; a restricted sender role can update only outbox delivery fields and read the explicitly listed invitation/delegated-authority projection in the data model. Runtime cannot create/alter/drop schema or query credentials. Current profile/session reads need reviewed column-level managed-table access (or a provider-supported projection); inability to grant that safely blocks activation.
**Alternatives considered**: Adding an ORM, broad public grants, runtime migration access, permissive RLS with a bypass role, or destructive down migrations are rejected.
**Recovery**: Expand before writes; keep the current profile client/action contract through this rollout and at least one subsequent release plus 7 days. Unknown pre-v1 workspace clients fail with UPGRADE_REQUIRED. Disable writers/senders before rollback, preserve accepted tables/receipts, and forward-repair after writes. Q-13 controls future retention/tombstone purge; no hard deletion or purge job now.

## R10 — Verification and current dependency signal

**Decision**: Combine local real-code unit/contract tests with guarded real PostgreSQL integration, actual SDK/inbox journeys and browser/manual bilingual review. Missing challenge/session/branch proof is a blocked integration result, never a guard-success substitute.
**Fresh local baseline**: `npm test` passed four Node test-file results and six email tests; translation checker passed 332 key/structure entries; explicit auth `--self-check` passed offline guards. No build or hosted test is inferred from these results.
**Advisory signal**: The first current `npm audit --json` completed with exit 1 and 27 affected package entries (8 low, 19 moderate, 0 high/critical). A report-capture retry hit EAI_AGAIN; the network-authorized retry completed with the same findings and its raw report is retained in the evidence ledger. Counts are package entries, not unique exploitable defects. The minimatch advisory affects `<11.0.1`; lockfile copies include 10.2.6 and 3.1.5. Assess actual `optimizationLevel >= 2` and untrusted pattern reachability in tooling before remediation; do not force npm's suggested major downgrades. No dependency is changed by this plan.
**Source**: [GHSA-g3hv-75wg-m249 / CVE-2026-118764](https://github.com/advisories/GHSA-g3hv-75wg-m249), published 2026-10-27, updated 2026-10-30, inspected 2026-11-01. Local scans do not attest hosted versions. Refresh all advisory/release evidence at implementation and deployment.
