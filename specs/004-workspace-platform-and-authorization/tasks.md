# Tasks: Workspace Platform and Authorization

**Input**: Design documents in `specs/004-workspace-platform-and-authorization/`.
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts](contracts/workspaces.md), [quickstart.md](quickstart.md), [evidence.md](evidence.md).
**Tests**: Explicitly requested. Include real PostgreSQL, direct action/API, race/replay and browser evidence; mock/local successes never satisfy hosted gates.
**Organization**: Setup → common identity/test foundations → US1 NEXT-01 → US2 NEXT-02/create → US3 switch/isolation → US4 invitations → US5 ownership → cross-cutting verification.
**Format**: `- [ ] Tnnn [P?] [USn?] Description with exact paths`. All unchecked: this file is an implementation plan, not a completed work record. `[P]` means independent files/work after stated prerequisites, not permission for agent delegation.

**Migration rule**: `002-workspace-platform.sql` is proposed; first inspect actual applied history. Complete/review all schema portions before applying once. If 002 was already applied, put later schema in the next unused additive migration instead of rewriting applied history. Every schema task must implement every field/default/nullability/CHECK/FK/index in data-model.md, including verbatim constraint groups quoted below; do not silently choose new limits.

## Phase 1: Setup (Shared Infrastructure)

Establish scope, owners and safe execution without enabling a hosted capability.

- [X] T001 Record source/lock/diff identity, current callers, applied-versus-local migration uncertainty and canonical G1–G6 in specs/004-workspace-platform-and-authorization/evidence.md; retain historical 003 claims with an explicit supersession pointer in specs/003-enhance-auth-pages/evidence.md.

- [X] T002 [P] Map the plan security-control matrix to named owners and exact verified OWASP ASVS 5.0.0 L2 requirement IDs in specs/004-workspace-platform-and-authorization/evidence.md; cover browser→action→service→DB/sender boundaries and release-checklist exclusions.

- [X] T003 [P] Record the user-confirmed bounded Owner/Admin/Member policy and 72-hour invitation lifetime as scoped Q-05/Q-08 decisions in docs/planning/decisions.md; keep broader recovery/MFA/operational decisions open and version the capability policy in specs/004-workspace-platform-and-authorization/contracts/auth-and-release.md.

**Checkpoint**: Complete these prerequisites before dependent work; live authorization remains separately gated.

## Phase 2: Foundational (Blocking Prerequisites)

Establish trustworthy test/identity boundaries before any workspace story; database foundations start with US2 after NEXT-01.

- [X] T004 Add negative target-manifest tests in scripts/test-auth-contract.test.mjs for mismatched app/Auth/database/branch/sink, production-labelled targets and copied real-data fixtures; extend scripts/test-auth-flows.mjs target validation to require independently verified synthetic fixture ownership without printing secrets.

- [X] T005 Add real-code mocked boundary cases in scripts/test-profile.test.mjs for banned/current DB-session identity, unavailable provider/database and unchanged personal profile action/projection; include verified same-user positive controls before changing shared authority.

- [X] T006 Strengthen currentSession in lib/auth/server.ts using fresh SDK plus reviewed current-session/user predicates; update lib/profile.ts to reuse it while retaining all direct and sealed-query session/verification/ban/expiry predicates; preserve app/actions.ts saveProfile signature and errors. Trace every currentSession/loadProfile caller.

- [X] T007 Add capability/direct-method/alias denial tests in scripts/test-auth-contract.test.mjs, then implement default-off server policy in lib/auth/capabilities.ts and app/api/auth/[...path]/route.ts; allow only reviewed social/session/sign-out independently, cover password creation/change/linking and unknown credential paths, and gate any direct server SDK bypass.

- [X] T008 Wire safe flow-availability booleans through components/auth-entry-page.tsx, components/auth-interactive-panel.tsx and components/auth-email-form.tsx; add unavailable copy with identical keys/interpolation in messages/en.json and messages/ar.json; document default-off flags in .env.example without secrets.

**Checkpoint**: Complete these prerequisites before dependent work; live authorization remains separately gated.

## Phase 3: User Story 1 — Trust account access and its evidence (Priority: P1)

NEXT-01. Independent test: existing profile works only for current verified/non-banned authority, disabled direct credential calls fail, and real/blocked/mock evidence stays distinct.

- [X] T009 [US1] Fix scripts/test-auth-flows.mjs runner modes: only explicit --self-check may report offline success; --integration --manifest requires the verified target; assertion/setup/cleanup failures exit nonzero and BLOCKED prerequisites remain distinct from FAIL. Remove catch-all fallback-to-success and automatic skipped-proof PASS lines.

- [X] T010 [US1] Complete actual signup/verify/resend/recovery scenarios in scripts/test-auth-flows.mjs with mandatory signed in-memory challenge capture, correct /api/profile?userId contract and safe projections, manual redirect assertions, known/unknown anti-enumeration controls and a true social-only synthetic fixture; execute reset then assert both old sessions, old password and consumed/wrong-purpose/expired proof fail.

- [X] T011 [US1] Extend scripts/test-auth-flows.mjs and scripts/test-profile.test.mjs with direct page/action/API/live denial and ban/expiry/revocation controls; prove actual post-reset renewal loss and record capability-expiry bounds without claiming recall of downloaded data.

- [X] T012 [US1] Prepare authorized isolated delivery proof in scripts/test-email.mjs and specs/004-workspace-platform-and-authorization/evidence.md: verify actual migration 001 state, signed webhook/receipt uniqueness, managed endpoint policy/aliases, both-language inbox output and SMTP uncertainty. If no authorized target exists, record BLOCKED and leave activation off.

- [X] T013 [US1] Run the isolated real credential/provider suite only after target authorization and Q-08 effective-policy review; store raw redacted results and approved values in specs/004-workspace-platform-and-authorization/evidence.md, including upstream managed disablement/direct-request proof and Google/GitHub cancellation/return; do not infer hosted version from local overrides.

- [X] T014 [US1] Rehearse disabled-capability rollback while preserving approved social/session/sign-out and personal profile, and reconcile every G1–G6/capability row in specs/004-workspace-platform-and-authorization/evidence.md; retain unavailable gates and assign findings AE-01–AE-07. NEXT-01 inventory may complete with honest live gaps; activation cannot.

**Checkpoint**: Story acceptance is independently demonstrable with the fixture described above; record denied/failure/live gaps before advancing activation.

## Phase 4: User Story 2 — Create a durable team space (Priority: P1)

NEXT-02 plus F03.01. Independent test: create/list one workspace, retry lost response/concurrent intent, observe one atomic outcome, unchanged personal profile and no foreign-tenant visibility.

- [X] T015 [US2] Add focused service/digest/validation tests in scripts/test-workspaces.test.mjs against actual workspace source with synthetic adapters; cover canonical v1 digest, same/different intent, bounded input, settings role/revision/unknown-field denials, own-session checks, no partial acceptance and positive profile compatibility.

- [X] T016 [US2] Add guarded isolated setup/constraint/role/pool tests in scripts/test-workspaces-postgres.mjs with separate clients and run-owned fixtures; verify actual migration history, managed identifier types and PostgreSQL version before choosing the next unused migrations/002-workspace-platform.sql filename; reject unsafe manifests and retain BLOCKED results.

- [X] T017 [US2] Write reviewed application-only workspace/membership/grant SQL in migrations/002-workspace-platform.sql per data-model.md: "Identifiers are UUID; authoritative instants are TIMESTAMPTZ serialized as ISO-8601 UTC; revisions are BIGINT >= 1 serialized as decimal strings." Enforce NOT NULL/defaults, tenant composite FKs, UNIQUE(workspace_id,user_id), active/revoked timestamp coherence, owner_id active-Owner deferred checks and lock ordering; leave neon_auth and migration 001 unchanged.

- [X] T018 [US2] Apply C02 validation and persistence checks in migrations/002-workspace-platform.sql and lib/workspaces.ts: "Name is trimmed 1–100 Unicode code points; slug is lowercase ASCII [a-z0-9]+(?:-[a-z0-9]+)* of length 3–63 and globally unique; timezone is a supported IANA identifier; locale is en or ar; currency is an approved ISO-4217 code." Reject the documented reserved slugs, preserve unconfigured legal status and return generic slug conflicts.

- [X] T019 [US2] Add command_receipts/audit_events/outbox_events SQL in migrations/002-workspace-platform.sql using C01/C05 and data-model.md field constraints: "operation_id is UUID; command_version is 1; intent_digest is 64 lowercase hex SHA-256 characters; UNIQUE(actor_id,operation_id); expected revisions use decimal strings; input is at most 16 KiB." Include composite receipt FKs, bounded allowlisted results/4 KiB redacted summaries, append-only audit privileges, outbox status/attempt/lease constraints and non-null generation=0 uniqueness for non-invitation events.

- [X] T020 [US2] Write restricted runtime/sender/direct-migration role grants and recovery guidance in migrations/002-workspace-platform.md; preserve pool policy in lib/db.ts, specify reviewed column-level managed reads with no credentials/DDL/BYPASSRLS, expand-before-write, current profile compatibility for at least one subsequent release plus 7 days, and forward repair after accepted writes. Apply only on separately authorized synthetic isolation; record actual diff/role denials in specs/004-workspace-platform-and-authorization/evidence.md.

- [X] T021 [US2] Implement private single-client transaction/receipt/digest/audit/outbox primitives in lib/workspaces.ts; use db.connect, transaction-local timeouts, workspace locks or pre-create actor+operation transaction advisory lock, ROLLBACK/finally release and broken-client discard; preserve errors and prohibit network work inside transactions.

- [X] T022 [US2] Implement authorized createWorkspace/updateWorkspaceSettings/listWorkspaces/context projections in lib/workspaces.ts with atomic initial Owner/grants, current trusted session, C02/C03 validation, stable UUID pagination and C06 budgets: "Page size defaults to 20 and is at most 50; cursor input is at most 512 bytes; each transaction is at most 5 seconds with lock_timeout 1 second; worker batch is at most 20 and retry attempts at most 5." Maintain lib/db.ts max-5 pooling and reject foreign/malformed cursors.

- [X] T023 [US2] Implement thin create/settings actions in app/workspace-actions.ts and list/context GET modes in app/api/workspaces/route.ts per contracts/workspaces.md; validate unknown/duplicate fields and input budgets, preserve origin/CSRF and private,no-store on success/errors, and do not expose unchecked helpers or raw SQL errors.

- [X] T024 [US2] Add creation, authorized settings controls, no-membership guidance and unchanged personal profile to app/(site)/[locale]/[theme]/app/page.tsx and components/workspace-panel.tsx using existing shadcn/Base UI; add complete EN/AR create/loading/empty/error/conflict/unknown copy in messages/en.json and messages/ar.json; require explicit defaults and do not auto-create/migrate teams.

- [X] T025 [US2] Run real atomicity/digest/constraint/privilege tests in scripts/test-workspaces-postgres.mjs: inject failure after each write, reuse pooled clients across errors/tenants and perform at least 100 concurrent same-operation create trials; verify final workspace/membership/receipt/audit/outbox counts and unchanged profile. Record actual results in specs/004-workspace-platform-and-authorization/evidence.md.

**Checkpoint**: Story acceptance is independently demonstrable with the fixture described above; record denied/failure/live gaps before advancing activation.

## Phase 5: User Story 3 — Switch teams without carrying authority (Priority: P1)

F03.02 and scoped access prerequisites. Independent test: two authorized workspaces plus separate tenant, stale cross-tab selection/revocation, zero prohibited responses/effects and no old subscriptions.

- [X] T026 [US3] Add list/context/select/receipt contracts and foreign actor/workspace/member/cursor/operation denial tests in scripts/test-workspaces.test.mjs; include positive controls, current-grant revocation, unavailable-versus-empty distinction and stable original workspace on retries.

- [X] T027 [US3] Implement authorized selectWorkspace, bounded member/invitation/audit projections and current grant ceilings in lib/workspaces.ts: "Role is owner, admin or member; status is active or revoked; UNIQUE(workspace_id,user_id); grants use only the supported action allowlist and scope_type=workspace with scope_id=workspace_id." Materialize/validate only contracts/workspaces.md actions; reject unknown future scopes/actions and omit foreign/member-sensitive fields.

- [X] T028 [US3] Implement selection action/cookie and context mismatch behavior in app/workspace-actions.ts with HttpOnly/Secure-on-HTTPS/SameSite=Lax/path=/ UUID-only cookie; validate membership at selection and inside every command, allow create/accept bootstrap, clear invalid selection and never silently retarget stale commands.

- [X] T029 [US3] Implement actor-scoped command reconciliation in lib/workspaces.ts and app/api/workspaces/receipts/route.ts; authorize current target before any receipt fields, include minimal actor-only acknowledgement after own leave/removal, reject actor/operation mismatches and never reveal intent digests or payloads.

- [X] T030 [US3] Add selector/current-team display, switch loading/error states and generation-based stale-response disposal in components/workspace-panel.tsx; preserve components/live-profile.tsx own-account cleanup; update messages/en.json and messages/ar.json for all context errors. Reuse existing canonical /app and preference allowlists without token query parameters.

- [X] T031 [US3] Exercise two tenants/two tabs/direct actions/GETs/current-grant revoke/account switch in scripts/test-workspaces-postgres.mjs and scripts/test-workspaces-browser.mjs; inspect JSON/HTML/RSC/count/receipt outputs, no-store errors and pooled reuse; record zero prohibited fields/effects plus subscription disposal in specs/004-workspace-platform-and-authorization/evidence.md.

**Checkpoint**: Story acceptance is independently demonstrable with the fixture described above; record denied/failure/live gaps before advancing activation.

## Phase 6: User Story 4 — Invite only the intended colleague (Priority: P2)

F03.03 and minimal resend/revoke prerequisites. Independent test: named verified recipient accepts once, all replay/expiry/foreign-recipient races deny, and delivery outcomes are truthful.

- [X] T032 [US4] Add recipient/token/role/delivery/intent tests to scripts/test-workspaces.test.mjs and escaping/bilingual invitation expectations to scripts/test-email.mjs; cover wrong recipient, replay, exact expiry, Owner invitation rejection, existing-member no-promotion and ciphertext secrecy before implementation.

- [X] T033 [US4] Add invitation/rate-bucket SQL to migrations/002-workspace-platform.sql before application on a fresh isolated target (use a new next-unused additive migration if 002 has already been applied). Enforce C04: "Recipient is one validated address of at most 254 bytes under the managed provider's verified-email normalization; invite role is admin or member; generation and revision are BIGINT >= 1; expiry is token_created_at + 72 hours; token is 32 CSPRNG bytes encoded base64url and only its SHA-256 digest is stored on the invitation." Preserve original created_at, exact 72h CHECK, terminal metadata, digest hex uniqueness, tenant composite FKs and one status=pending row per workspace/recipient; no volatile expiry index.

- [X] T034 [US4] Implement database-shared atomic rate guards in lib/workspaces.ts and SQL constraints in migrations/002-workspace-platform.sql: "Invite issue/resend is at most 20 per workspace per hour, 5 per recipient per workspace per hour and 100 per actor per day; acceptance is at most 10 attempts per session per 15 minutes." Enforce nonnegative counts/expiry, separate rejected-attempt guard transaction and HMAC bucket identifiers; approved managed auth limits remain G2.

- [X] T035 [US4] Implement issue/resend/revoke/accept services in lib/workspaces.ts per contracts/workspaces.md; lock workspace before invitation, recheck current verified recipient/inviter/grant ceiling and clock_timestamp expiry, require expected revisions, rotate generation/token, cancel superseded delivery and atomically consume/reactivate/create membership plus receipt/audit/outbox. Current active membership never escalates; same-operation authorized replay differs from new-operation proof replay.

- [X] T036 [US4] Implement restricted AES-256-GCM delivery envelope and bounded leasing sender in lib/workspace-invitations.ts with independent key ID/custody and authenticated workspace/invitation/generation; apply data-model C06 outbox status/attempt/lease/nonce/tag/4 KiB constraints. Recheck current inviter account/membership/grants and pending generation/expiry just before send, clear terminal ciphertext, use matching lease tokens/deterministic Message-ID, and reconcile ambiguous SMTP or expired send leases without blind retries.

- [X] T037 [P] [US4] Create escaped bilingual emails/workspace-invitation.tsx using existing EmailLayout/sendEmail conventions, explicit lang/dir and UTC-derived expiry display; include only /app#invitation proof link, no tracking/remote asset and no false delivery-success copy; validate with scripts/test-email.mjs.

- [X] T038 [US4] Add guarded operational dispatch script scripts/dispatch-workspace-invitations.mjs for committed events only; use restricted sender credentials plus the data-model sender SELECT projection and bounded batches; test allowed reads and denied membership/auth writes, no public unauthenticated worker endpoint; document invitation encryption/HMAC key names, rotation and default-off invitation switch in .env.example and migrations/002-workspace-platform.md.

- [X] T039 [US4] Expose thin issue/resend/revoke/accept actions in app/workspace-actions.ts; enforce origin, size/unknown fields and safe generic invitation errors; map results to accepted/pending/unknown without returning plaintext token, full recipients or upstream diagnostics.

- [X] T040 [US4] Add components/workspace-invitation.tsx fragment-to-memory/replaceState handling and explicit online acceptance; make unauthenticated /app redirects in app/(site)/[locale]/[theme]/app/page.tsx explicitly replace the fragment with empty `/sign-in#`, audit any proxy/SDK redirect before that page, and browser-test proof absence after signed-out navigation; add invite/resend/revoke administrator controls in components/workspace-panel.tsx with role-bounded options; localize emails and every state in messages/en.json and messages/ar.json. Signed-out/reload proof loss directs users to sign in and reopen email; no GET acceptance or browser persistence.

- [X] T041 [US4] Add real PostgreSQL/API race cases in scripts/test-workspaces-postgres.mjs for wrong recipient/account/tenant, expiry boundary, replay, revoked inviter, accept-versus-revoke/resend, already-member acceptance, role ceiling and shared-limit concurrency; assert final committed memberships/receipt/audit/outbox and no foreign metadata.

- [X] T042 [US4] Add isolated sender fault cases in scripts/test-workspaces-postgres.mjs for two workers, wrong key/tag, missing key, expired generation, revoked inviter, SMTP timeout-after-accept and crash/lease recovery; verify encryption/token absence in receipts/audit/logs and explicit unknown outcomes, then record actual inbox observation separately in specs/004-workspace-platform-and-authorization/evidence.md.

**Checkpoint**: Story acceptance is independently demonstrable with the fixture described above; record denied/failure/live gaps before advancing activation.

## Phase 7: User Story 5 — Control membership without orphaning a team (Priority: P2)

Minimum P01.2 ownership/access-control prerequisite. Independent test: concurrent membership/owner changes retain one active Owner and prevent lower-role escalation.

- [X] T043 [US5] Add role/remove/leave/transfer/last-owner/reauth contract tests in scripts/test-workspaces.test.mjs including direct Admin/Member invocations, changed protected fields, stale membership revisions and designated-owner removal; preserve positive permitted controls.

- [X] T044 [US5] Implement role changes, revoke/leave and transfer in lib/workspaces.ts using the workspace lock/current role ceilings/expected revisions and atomic grants+receipt+audit+outbox; enforce coherent owner_id and deferred active-Owner checks. Transfer promotes a current target, demotes initiating designated Owner to Admin and preserves other Owners; no hard delete.

- [X] T045 [US5] Integrate provider-supported fresh reauthentication for Owner transitions in lib/auth/server.ts and lib/workspaces.ts: proof bound to current account/session/action and at most 5 minutes old, never client timestamps/booleans. Record actual managed support in specs/004-workspace-platform-and-authorization/evidence.md; unsupported step-up returns CAPABILITY_DISABLED and keeps transitions unavailable.

- [X] T046 [US5] Wire role/remove/leave/transfer actions in app/workspace-actions.ts and accessible confirmation/recovery controls in components/workspace-panel.tsx; add current-workspace/final-owner/reauth/denial states with EN/AR parity in messages/en.json and messages/ar.json, avoiding a generic role editor.

- [X] T047 [US5] Run barrier-synchronized separate-client owner demotion/removal/leave/transfer races at least 100 times in scripts/test-workspaces-postgres.mjs; assert at least one final active Owner, valid owner_id, no forbidden role/grant effect, one receipt per accepted operation, stale-session denial and subsequent revoked-member rejection; record results in specs/004-workspace-platform-and-authorization/evidence.md.

**Checkpoint**: Story acceptance is independently demonstrable with the fixture described above; record denied/failure/live gaps before advancing activation.

## Phase 8: Polish & Cross-Cutting Concerns

Finish evidence/release readiness without implying merge, public activation or deployment.

- [X] T048 Add guarded named workspace integration/browser/dispatch commands to package.json and document exact manifest/build/role/key prerequisites in specs/004-workspace-platform-and-authorization/quickstart.md; retain existing npm test glob behavior and prohibit production-target convenience commands.

- [X] T049 [P] Complete scripts/test-workspaces-browser.mjs and scripts/test-workspaces-browser.md for all five story journeys in EN/AR, Light/Dark/System, Chromium/Firefox/WebKit as approved, keyboard/focus/screen reader, 320px/200%/reduced-motion and fluent Arabic review; store actual captures/reviewer results in specs/004-workspace-platform-and-authorization/browser-results.md and keep unavailable human checks open.

- [X] T050 Run 100-workspace/100-member warm fixture with 20 concurrent clients via scripts/test-workspaces-postgres.mjs, measure SC-006 p95≤2s and EXPLAIN/index/pool/queue limits; fault auth/DB/mail outages and context races, record budgets/results in specs/004-workspace-platform-and-authorization/evidence.md without inventing capacity guarantees.

- [X] T051 Rehearse migration failure, old profile-client compatibility, writer/sender disablement, forward repair and isolated restore in migrations/002-workspace-platform.md and specs/004-workspace-platform-and-authorization/evidence.md; suppress historical deliveries, preserve receipts/audit and invalidate restored managed sessions/invitation authority before reopening; no destructive rollback after writes.

- [X] T052 [P] Triage fresh exact-lock/runtime/component/tooling advisories including GHSA-g3hv-75wg-m249 in docs/security/findings.md; assess reachable minimatch optimization/pattern inputs, choose supported fixes separately if needed and refresh scans at release; keep hosted version and unavailable scans as gaps.

- [X] T053 Run npm run test:full, focused workspace tests, guarded real integration, auth/email/HTTP regressions and translation parity per specs/004-workspace-platform-and-authorization/quickstart.md; record redacted commands/artifact hashes and actual outcomes, perform affected headers/origin/cookie/cache/secrets review and verify docs/security/release-checklist.md with named owners.

- [X] T054 Update docs/development/neon-setup.md, docs/architecture/data-model.md, docs/architecture/api-contracts.md, docs/specs/platform-and-workspaces.md and root plan.md only to reflect implemented/proven behavior; preserve stable feature IDs and keep NEXT/F02/F03 parents open for remaining gates. Finalize specs/004-workspace-platform-and-authorization/evidence.md with disabled capabilities, approved policy scope, residual risks and next actions.

**Checkpoint**: Complete these prerequisites before dependent work; live authorization remains separately gated.

## Dependencies & Execution Order

```text
Setup T001–T003
  → shared identity/target/capability foundation T004–T008
  → US1: NEXT-01 reconciliation and identity proof T009–T014
  → US2: NEXT-02 persistence + create T015–T025
  → US3: switch/current-scope access T026–T031
  → US4: recipient-bound invitations T032–T042
  → US5: membership/ownership safety T043–T047
  → final verification/recovery/docs T048–T054
```

US1 runs without a workspace database. US2 uses trusted identity and can be tested as a create/list vertical slice. US3 uses seeded memberships and needs no invitation delivery. US4 uses the shared scope foundation and can test intended-recipient acceptance without ownership transfer. US5 uses seeded members/owners and does not require sending invitations. Story dependencies are implementation prerequisites; each has a separate acceptance fixture and usable increment. UI cannot activate a capability whose real provider/policy gate is still open. Source inventory/migration design may advance with recorded live-environment gaps, but blocked prerequisites never count as successful release tests.

Within each story, add meaningful assertions first, then schema/policy, service, transport/UI and real integration. Reuse current modules; service/input authorization is mandatory for every exported entry. T017–T019 and T033 must be assembled/reviewed together before a fresh migration application. If delivering US2 before invitations, omit later invitation schema until its own next additive migration rather than mutating already-applied SQL.

## Parallel Opportunities and Examples

- Setup: T002 security mapping and T003 scoped decision record use separate files after T001 inventory; consolidate their shared evidence update sequentially.
- US1: transport fixture work T010 and protected-profile unit work in T005 both touch existing harnesses; serialize edits. Raw read-only provider-policy research and mailbox review may run independently, but shared evidence edits stay sequential.
- US2: SQL review and UI design review can proceed independently after contracts; T017–T019/T033 all edit migration SQL and must be serialized. Transaction implementation precedes all service consumers; do not run them in parallel.
- US3: test fixture design T026 can be reviewed alongside read-only browser-state design, but T027/T029 both edit lib/workspaces.ts and T028 edits shared actions; serialize implementation.
- US4: T037 email component may run independently once the delivery/link contract is fixed; T036 sender and email tests in T032 must land before actual delivery checks. T033 migration and T034 rate schema changes share SQL and are sequential.
- US5: reauthentication capability research can run alongside read-only race-fixture review; T044/T045 share protected services and must be serialized.
- Final: T049 manual/browser checks and T052 advisory triage use separate artifacts after implementation; T054 consolidates their results into the shared evidence ledger sequentially. Production operations/delegation require their own authorization.

`[P]` is deliberately conservative. No parallel task may rely on an unfinished earlier task or concurrently edit shared files; use collected results to update evidence once.

## Implementation Strategy

1. MVP is US1: truthful identity gates, fixed test semantics, server-enforced capability policy and preserved profile access. Validate it without new tenant tables. A blocked hosted result keeps that capability off while local source work remains reviewable.
2. First workspace MVP is US2 + US3: real restricted-role schema/transactions, create/list/switch with synthetic two-tenant isolation and profile compatibility. No invitations or owner-management UI is needed to prove this vertical slice.
3. Add US4 only with recipient/expiry policy, isolated delivery/key custody and live safety proof. Add US5 only with actual managed step-up support; preserve final-Owner invariants from the earliest schema even while transfer UI stays off.
4. Run cross-cutting release checks and compatible recovery against the matching built artifact. Accept only actual current evidence, then hand off the concrete result for any separately authorized merge/activation/deployment.

## Requirement and Outcome Traceability

| Requirement group                           | Story / tasks                       | Outcome                                        |
| ------------------------------------------- | ----------------------------------- | ---------------------------------------------- |
| FR-001–FR-004                               | Shared foundation + US1 T001–T014   | SC-001, SC-002                                 |
| FR-005–FR-007, FR-014–FR-015, FR-017–FR-018 | US2 T015–T025; US3 receipt T029     | SC-002, SC-003, SC-005, SC-008                 |
| FR-008–FR-010                               | US3 T026–T031; US5 role transitions | SC-002, SC-005                                 |
| FR-011–FR-012, FR-016                       | US4 T032–T042                       | SC-004                                         |
| FR-013                                      | Schema T017 + US5 T043–T047         | SC-003                                         |
| FR-019–FR-022                               | All story tests/UI + T048–T054      | SC-001–SC-008, especially SC-006/SC-007/SC-008 |

## Completion Report

- Total: 54 tasks; shared setup/foundation/polish: 15; US1: 6, US2: 11, US3: 6, US4: 11, US5: 5.
- Parallel-marked tasks: T002, T003, T037, T049, T052. Other opportunities above are reviews/research, not simultaneous shared-file edits.
- MVP: US1; first workspace increment: US2 + US3. Independent story tests are stated at each phase.
- Format validation must confirm every task has a checkbox, sequential ID, story label only in story phases and exact file paths. No task is completed by this planning run.
