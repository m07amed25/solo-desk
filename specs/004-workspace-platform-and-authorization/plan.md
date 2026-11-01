# Implementation Plan: Workspace Platform and Authorization

**Branch**: `main` (actual Git checkout; no branch created) | **Date**: 2026-11-01 | **Spec**: [spec.md](spec.md)
**Feature directory**: `specs/004-workspace-platform-and-authorization`
**Input**: NEXT-01 → NEXT-02 → NEXT-03 from root `plan.md`; F02.01–F02.04, F03.01–F03.03, bounded P01.2/P01.3 foundations.

Speckit scripts report `BRANCH=004-workspace-platform-and-authorization` as their feature-derived identifier; it is not the checked-out Git branch. Future isolated coding branches should use `codex/` per repository convention. No deployment, hosted provisioning, runtime SQL migration or application implementation is authorized by this planning package alone.

## Summary

Reconcile identity evidence, close the false-pass/activation/session gaps, then add the smallest Neon-backed workspace service and UI. Keep managed Better Auth and personal profile behavior intact. Add reviewed application-only SQL, current per-entry authorization, role-bounded grants, recipient-bound 72-hour invitations, atomic command receipts/revisions/audit/outbox and real PostgreSQL safety tests. Extend `/app` with active-workspace context using existing shadcn/Base UI components and English/Arabic catalogs.

Research and design are complete for this scoped plan. The two product clarifications are recorded in the spec. Runtime/provider/policy prerequisites remain named activation gates with explicit failure behavior; they are not unresolved architecture choices and are not marked passed. All implementation tasks remain unchecked. Broad business modules, offline persistence, six-role/custom-policy editors and a generic job framework are excluded.

## Technical Context

**Language/Version**: Existing TypeScript/React project; lockfile React 19.3.0, TypeScript 5.9.3. Record deployment Node/PostgreSQL runtime separately; no hosted major version was queried.
**Primary Dependencies**: Next.js 16.4.3, `@neondatabase/auth` 0.7.0-beta, local Better Auth 1.7.14, pg 8.23.1, next-intl 4.14.9, Base UI 1.9.0, existing shadcn, Tailwind, React Email and Nodemailer. Use Node crypto and existing pg; no new runtime dependency or ORM.
**Storage**: Existing managed `neon_auth`; retain `public.solodesk_email_deliveries`. Planned `solodesk` application schema. Pool max 5 stays in `lib/db.ts`; one client per transaction; direct migration role separate. Protected browser persistence remains off.
**Testing**: Node real-code unit/contract tests, guarded actual PostgreSQL integration with two tenants and separate runtime/sender roles, build-specific direct Server Action/API calls, authorized managed-auth/mail journeys, browser/manual accessibility/RTL and recovery tests. Mock tests cannot satisfy DB/hosted gates.
**Target Platform**: Existing App Router website, request-time private state with Cache Components preserved, English/Arabic, Light/Dark/System, phone/tablet/wide desktop. Chromium/Firefox/WebKit coverage subject to Q-11 supported-version sign-off.
**Project Type**: Existing modular monolith; small server service and thin transports, no microservices/generic repository/CQRS.
**Performance Goals**: SC-006 warm 100-workspace/100-members-per-workspace, 20-client fixture; p95 user confirmations ≤2s excluding external delivery/provider delay. Keep pool bounds, page 20/max50, transaction≤5s/lock≤1s, worker batch≤20. Measure p95 and resource use; no capacity/SLA promise from schema design.
**Constraints**: Zero forbidden data/effects, current identity/member/action grants, atomic effect+receipt+audit+outbox, cryptographic invitation proof, exact UTC/integer representations, no managed schema changes, no profile migration or data purge.
**Scale/Scope**: Five user stories, one existing app surface, two small read APIs, workspace Server Actions, minimal invitation sender with explicitly granted delegated-authority SELECT projections and migrations. All input/query/job limits are fixed in data-model C01–C07; Q-02/Q-16 own actual operating budget/availability.

## Constitution Check

Pre-research and post-design reviews find no proposed constitution violation. The following are design passes, not executed release passes. Provider/env gates remain BLOCKED until tasks supply evidence.

| Principle                            | Pre-research decision                                                     | Post-design check                                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| I — selected stack/simple boundaries | Reuse SDK, pg, shared components and modular monolith                     | Pass as design: one workspace module, plain SQL, no competing auth, dependency or generic platform                                              |
| II — server authority/privacy        | Every entry validates current identity/tenant/action; minimal projections | Pass as design: per-service checks, locked grants, composite FKs, restricted roles, no-store and default-off ingress; runtime negatives pending |
| III — exact/recoverable effects      | Workspace commands use same receipt/audit/outbox principle; no finance    | Pass as design: canonical digest, revisions, single-client commit, encrypted delivery, unknown-outcome recovery; PostgreSQL proof pending       |
| IV — shared bilingual accessibility  | Reuse semantic shadcn/Base UI and next-intl                               | Pass as design: complete state/RTL/email/keyboard contract; rendered and human evidence pending                                                 |
| V — evidence before completion       | Reconcile historical assertions without importing passes                  | Pass as design: current local observations, honest advisory findings, owned gaps and executable real-test tasks                                 |

No constitution exception is requested. Broad Q-05 and Q-08 remain open; user answers resolve only the three-role slice and 72h invitation lifetime. Q-08 recovery/MFA/abuse approval, actual managed capability, Q-02 environment, Q-11 support and Q-13/Q-16 recovery/retention approvals remain production prerequisites.

## Project Structure

### Documentation (this feature)

```text
specs/004-workspace-platform-and-authorization/
  spec.md
  checklists/requirements.md
  plan.md
  research.md
  evidence.md
  data-model.md
  contracts/auth-and-release.md
  contracts/workspaces.md
  contracts/ui.md
  quickstart.md
  tasks.md
```

### Source Code (repository root; planned changes)

```text
migrations/002-workspace-platform.sql      # proposed, verify unused/applied history first
migrations/002-workspace-platform.md       # role, rollout, forward-repair/restore notes
lib/auth/server.ts                        # shared verified/current/non-banned identity
lib/auth/capabilities.ts                  # small server-owned capability policy
lib/workspaces.ts                         # authorization, queries, commands, tx helper
lib/workspace-invitations.ts              # bounded sender/encrypted delivery only
lib/db.ts                                 # preserve pooled driver/lifecycle
app/workspace-actions.ts                  # thin validated service calls
app/api/auth/[...path]/route.ts            # server policy before SDK delegation
app/api/workspaces/route.ts                # authorized list/context GET
app/api/workspaces/receipts/route.ts       # actor/current-scope receipt GET
app/(site)/[locale]/[theme]/app/page.tsx    # context + signed-out empty-fragment redirect
components/auth-entry-page.tsx            # safe capability presentation
components/auth-interactive-panel.tsx     # server-provided flow availability
components/auth-email-form.tsx            # retain approved credential contracts
components/workspace-panel.tsx
components/workspace-invitation.tsx
components/live-profile.tsx               # preserve profile behavior; verify cleanup
emails/workspace-invitation.tsx
messages/en.json
messages/ar.json
scripts/test-auth-flows.mjs                # fix false-pass/fixtures, no production runs
scripts/test-workspaces.test.mjs           # focused real-code local tests
scripts/test-workspaces-postgres.mjs       # guarded real DB/HTTP/race assertions
scripts/dispatch-workspace-invitations.mjs # authenticated operations invocation, no public cron API
scripts/test-workspaces-browser.mjs        # bilingual journey verification
scripts/test-workspaces-browser.md         # manual keyboard/screen-reader/fluent Arabic matrix
scripts/test-profile.test.mjs              # shared authority/profile regression
scripts/test-auth-contract.test.mjs        # capability/direct invocation contract
scripts/test-site-http.mjs                 # existing anonymous/preference/profile contracts
scripts/test-email.mjs                     # invitation output/escaping regression
package.json                              # named guarded integration commands only
.env.example                              # names/default-off flags, never secret values
```

**Structure Decision**: Keep transaction code private in `lib/workspaces.ts` until actual reuse merits extraction; add a narrow sender module because token decryption/external delivery is a separate boundary. Domain predicates may be pure local functions; no framework/DB imports in pure policy checks. Existing profile exports and return paths remain compatible. Any new UI primitive uses installed Base UI patterns and approved provenance.

## Scope and affected callers

| Boundary            | Reach and compatibility                                                                             | Proof required                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Shared identity     | currentSession callers: auth-entry, sign-in/up pages, callback, profile and new workspace functions | Verified/unverified/expired/revoked/banned/unavailable fixtures; no redirect loop or provider regression |
| Credential exposure | SDK catchall all methods/aliases, form/social composition, server SDK bypass, upstream config       | Default-off direct rejection, approved social/session/sign-out positive controls and upstream denial     |
| Profile             | loadProfile/saveProfile/API/LiveProfile and sealed SQL                                              | Keep personal signature/error/projection; no workspace membership needed; no cross-account or live leak  |
| Data                | Migration 001/applied history, new schema/roles, existing pool                                      | No managed DDL; real constraints/races/pool reuse; explicit runtime access denied to credentials/DDL     |
| Workspace           | App page, new actions/list/context/receipt reads and selection cookie                               | Each service current grants/explicit workspace; direct action/API/query/history negatives                |
| Delivery            | Existing EmailLayout/sendEmail plus new restricted sender                                           | Atomic encrypted queue, lease/expiry/revoke checks, bilingual output, unknown-SMTP reconciliation        |
| UX/config           | Existing locale/theme/proxy/return allowlists; new panel/catalog strings                            | Keep `/app` canonical and preference semantics; fragment handling avoids new token/query allowlists      |
| Tests/ops/docs      | Unit/email/HTTP/harness fixtures, package scripts, env example, security/decision/roadmap evidence  | Isolated manifests/cleanup ownership, no false passes, scoped approvals and current release evidence     |

No published package exports exist. Keep internal helpers unexported where possible; every public server export is an authorized boundary. Existing `lib/db.ts` pool export is reused; no caller may carry raw user-selected tenant state between requests.

## Phase 0 — Research and evidence reconciliation (NEXT-01)

1. Use [research](research.md) and [evidence ledger](evidence.md) to reconcile canonical G1–G6 and findings AE-01–AE-07; preserve historical 003 artifacts with a supersession pointer rather than rewriting raw results.
2. Fix the harness before accepting hosted results: distinct modes/nonzero failures, independently bound target manifest, mandatory real challenge capture, actual social-only fixture, correct profile contracts and two-session reset assertions.
3. Strengthen shared identity and implement concrete default-off capability enforcement. Inventory installed SDK method/path aliases and upstream managed settings. Unsupported capabilities remain unavailable; a local flag does not disable a public upstream.
4. Obtain actual provider/runtime/policy proof only on separately authorized isolated synthetic targets. Existing production-labelled setup is not a reason to mutate production, disable email verification, or mark real customers verified.

Output: truthful evidence/capability/rollback ledger and trusted identity boundary before workspace activation. Missing environment or approval does not block writing reviewable design/migrations, but blocks dependent live tests/activation.

## Phase 1 — Persistence and authorized workspace design (NEXT-02 / NEXT-03)

### Database and roles

Inspect applied migrations and target metadata before reserving `002`. Apply reviewed application schema with migration role/direct URL only on authorized isolation. No auth schema changes or competing identity tables. Provision restricted runtime and sender roles independently of code review; least-privilege managed read feasibility is a gate. Account ID schema compatibility is verified, not guessed from a client type.

Use composite tenant foreign keys, bounded text/enums, UUIDs, TIMESTAMPTZ, BIGINT revisions and unique actor+operation IDs. Workspace row locking plus deferred invariant triggers protect last Owner and designated owner_id across every mutation path. Current role ceilings intersect stored supported grants. RLS is not required by this design; do not claim it exists. Explicit application scopes, constraints and privileges are the protection being tested.

### Commands, context and recovery

One checked-out pg client owns authority, locks, digest replay, effect/revision, receipt, audit and outbox transaction. External operations follow commit. No session SET, global tenant, client identity authority or network request inside transaction. Use transaction-local timeouts; rollback/release or discard broken clients. Canonical v1 intent makes equivalent valid input replay stable; changed payload rejects.

The browser selection cookie contains only UUID with HttpOnly/Secure in HTTPS/SameSite=Lax/path=/ and bounded length. It is a preference, not authority. Commands retain explicit original target and compare selector after current membership; context mismatch rejects. Create/accept bootstrap without a selector then set it after successful commit. Current member reads return bounded private context. Receipt reconciliation checks current actor/grants and returns only the explicitly allowed minimal self-leave acknowledgement after removal.

### Invitations and ownership

Invitations target one verified address and one permitted role/workspace scope; lifetime is 72h from the current token's server creation. Resend rotates generation/token, revoke invalidates it, acceptance consumes once atomically. Only Owner invites Admin; Admin invites/removes Member. Owner promotions/transfers use current provider-supported ≤5-minute reauthentication; unproven step-up keeps these transitions disabled. Baseline create/switch/invite-Member flow can be implemented/tested independently.

Store digest on invitation; keep token-bearing delivery material AES-GCM encrypted only in the restricted outbox, using separate key custody. Bounded worker leases, checks current inviter/grants/pending generation/expiry and sends only after commit; unknown SMTP outcomes reconcile. The authenticated `/app#invitation` fragment is removed immediately into transient memory, with explicit acceptance. Signed-out server redirects explicitly clear the fragment using `/sign-in#`; audit proxy/SDK redirect behavior and verify real browser URLs before activation. Sign-in/reload loss requires reopening email; no token persistence or auth callback expansion.

### UI and query boundaries

Reuse account/profile section and existing shared primitives. Server page loads allowed workspace context; minimal client panels handle mutation/selection with server errors. Abort/ignore stale responses and dispose prior private subscriptions on selection/identity change. No workspace live feed is added until its predicates are proven; profile feed remains own-account. Full state/localization/accessibility contract is [contracts/ui.md](contracts/ui.md).

## Security control and test ownership

| SEC controls    | Accountable role                 | Concrete verification                                                                                                                                                                     |
| --------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 001–008         | Identity + Security              | Real purpose/replay/reset/2-session/social-only/step-up, trusted origins/cookies/CSRF, anti-enumeration and bounded attempts; G1–G4                                                       |
| 009–015         | Core application + QA            | Two tenants and three roles; direct service/action/API, scoped counts/members/cursors/receipts, grant revocation, wrong recipient, concurrent last-Owner                                  |
| 017,023–025     | Core application                 | Parameterized SQL, unknown-field/Unicode/size/duplicate inputs, escaping stored name/email and bounded parsing                                                                            |
| 026–028,032     | Web + Operations                 | Affected framing/CORS/cache/CSP/TLS controls at ingress; private error/HTML/RSC/API responses; verify catalogue mapping in implementation                                                 |
| 041–045,047–048 | Database + Security + Operations | Restricted role cannot DDL/read credential tables; alternating pooled tenants/errors; tenant FK/atomic fault injection; encrypted token secrecy and isolated fixture classification       |
| 046,055–056     | Operations                       | Artifact identity, compatible old profile clients, expand-before-write, forward repair and isolated restore without restored authority/delivery replay                                    |
| 049–052         | Security + Engineering           | Exact lock/runtime/advisory triage including tooling/components; no new dependency or blind major downgrade                                                                               |
| 057,059,061–064 | Core application + Operations    | Lost response/concurrent duplicate/digest conflicts, valid transitions, revoked inviter/double worker/unknown-send/expired lease, redacted audit, rate budgets and outage failure closure |
| 060             | Identity + Email                 | Existing signed auth-webhook integrity/receipt tests and real isolated delivery; invitation sender adds no public webhook                                                                 |

Numeric values are SEC suffixes, not ASVS identifiers. Select exact versioned ASVS 5.0.0 L2 IDs in T002 from the official standard; no conformance claim follows from this matrix. Financial-specific 058 and file-specific 033–040 are outside this no-money/no-files slice; future consumers must add their own gates. Existing full repository release checklist still governs exposure.

## Validation, rollout and recovery

Follow [quickstart.md](quickstart.md). Local unit tests are useful but never substitutes for real PostgreSQL constraints/concurrency/role/pool tests, actual managed identity/mail semantics or browser/manual review. Release evidence records actual result categories and refused/unavailable checks explicitly. Fresh audit has open moderate/low findings; see research/evidence, not historical counts.

Rollout: reconcile/gate identity → expand isolated schema → runtime role + real safety tests → profile-compatible workspace create/list/switch → invitation delivery and member safety → staged manual/restore/advisory review → separately authorized activation. Preserve current profile client/action/API contract for this rollout and at least one subsequent release plus seven days. No new workspace v0 clients exist; unsupported command versions return UPGRADE_REQUIRED.

Rollback before new writes may undo only unused application objects after proof. After accepted writes, disable affected writers/senders and retain schema/data/receipts/history; use compatible readers and forward repair. Never drop auth tables, erase accepted workspace rows or resurrect invitations/sessions through restore. Q-13 governs future purge/tombstones; none is enabled here. Read-only availability during containment requires current authority and compatible schema, otherwise show unavailable.

## Execution artifacts and decisions

- [Research](research.md) resolves technology/method choices and alternatives.
- [Data model](data-model.md) fixes constraints, indexes, transaction ordering and lifecycle.
- [Contracts](contracts/workspaces.md) define v1 service/action/read/error behavior; [auth/release](contracts/auth-and-release.md) fixes gating; [UI](contracts/ui.md) fixes state and localization.
- [Tasks](tasks.md) orders actual implementation and evidence per user story.
- [Evidence](evidence.md) records what this planning run actually inspected/ran and what remains open.

`.specify/extensions.yml` is absent: no before/after specify/clarify/plan/tasks hooks apply. Spec Kit persisted feature 004 in `.specify/feature.json`; no branch hook ran. Recheck hooks when running future lifecycle commands if extension configuration changes.
