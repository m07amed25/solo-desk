# Feature Specification: Workspace Platform and Authorization

**Feature Branch**: `main` (current checkout; feature directory is independent of branch)
**Feature**: `004-workspace-platform-and-authorization`
**Created**: 2026-11-01
**Status**: Draft for implementation; activation remains subject to named evidence/policy gates
**Input**: NEXT-01 auth evidence reconciliation, NEXT-02 persistence foundations, NEXT-03 workspaces and access control; F02.01–F02.04, F03.01–F03.03, P01.2 and P01.3.

This slice lets a verified person create a workspace, invite colleagues, and switch safely between teams. It preserves personal profile data and makes the boundary between implemented, locally tested and release-approved identity behavior explicit. The root roadmap remains the authoritative backlog; this specification covers only the minimum prerequisites needed by these features.

## Clarifications

### Session 2026-11-01

- Q: Which membership policy should this phase use? → A: Bounded Admin powers: Owner controls ownership and privileged promotions; Admin manages settings and Member invitations/removals; Member reads context and may leave.

- Q: How long should an unused workspace invitation remain valid? → A: 72 hours from server creation time; resending invalidates the old token. Broader Q-08 recovery/MFA approval remains open.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Trust account access and its evidence (Priority: P1)

As an account holder and release reviewer, I need truthful identity capability status and protected access that requires a current verified account, so visible forms or simulated results cannot imply a safe release.

**Why this priority**: Every workspace operation depends on trustworthy identity.
**Independent Test**: Exercise the existing profile journey without workspaces, with verified, unverified, expired, revoked and banned accounts; inspect one stable gate ledger and prove disabled flows cannot be invoked directly.

**Acceptance Scenarios**:

1. **Given** conflicting historical gate summaries, **When** evidence is reconciled, **Then** each original G1–G6 definition has an owner, source/environment, evidence type, observed result, gaps and activation/rollback decision; a simulated or refused test never passes a hosted gate.
2. **Given** a valid verified, unexpired, non-banned session, **When** its owner opens the account or edits their name, **Then** only their existing profile is read/updated.
3. **Given** an unverified, banned, expired, revoked or malformed session, **When** a protected page, query, action or live renewal is invoked directly, **Then** access is denied with no protected fields or effects; unavailable authority produces an unavailable state.
4. **Given** credential capability is unproven or disabled, **When** a direct registration/recovery request bypasses the UI, **Then** the server rejects it; independently approved social login and sign-out remain usable.
5. **Given** an authorized isolated identity target, **When** verification, recovery and provider-return scenarios run, **Then** consumed/wrong-purpose/expired proof fails, both pre-reset sessions lose access, social-only accounts acquire no unintended password, and hostile return destinations fail. A missing target or challenge is an explicit incomplete result.

### User Story 2 - Create a durable team space (Priority: P1)

As a verified person, I can create and list workspaces I belong to without losing my personal profile, and retry an uncertain creation without creating another team.

**Why this priority**: Supplies the smallest usable workspace and persistence foundation.
**Independent Test**: Create a workspace with one Owner, lose its response, retry the same operation, and verify one workspace, one membership and one accepted history record; another account sees none of it.

**Acceptance Scenarios**:

1. **Given** no memberships, **When** a verified person opens `/app`, **Then** they see create/join guidance and their unchanged profile, not fabricated workspace data.
2. **Given** valid name, slug, timezone, language and currency defaults, **When** creation succeeds, **Then** a stable workspace and its initial Owner exist together, with a visible active context and revision.
3. **Given** the same operation and identical intent, **When** creation is retried or submitted concurrently, **Then** the original authorized outcome is returned once; changed intent under that operation is rejected.
4. **Given** an invalid default, occupied slug, persistence failure or concurrent revision conflict, **When** creation/update fails, **Then** no partial workspace/history exists and permitted input remains available for correction.

### User Story 3 - Switch teams without carrying authority across them (Priority: P1)

As a member of several teams, I can choose the active workspace and always see which team an action affects.

**Why this priority**: Wrong-team writes and private-view leakage are core tenancy risks.
**Independent Test**: Use two workspaces, two tabs and a separate non-member; switch, revoke membership and replay stale requests while checking responses, counts, projections and subscriptions.

**Acceptance Scenarios**:

1. **Given** two authorized workspaces, **When** I switch, **Then** the new workspace is visible before actions become available and old views/subscriptions are discarded.
2. **Given** a forged workspace, resource, cursor or operation identifier, **When** any entry point is invoked, **Then** no foreign record, count, receipt, membership or event is revealed or changed.
3. **Given** membership/grant revocation or an account switch in another tab, **When** the next request, subscription renewal or command executes, **Then** current authority is checked and stale authority is denied.
4. **Given** a stale selection, **When** `/app` loads, **Then** selection is cleared and the user chooses an authorized team; a stale mutation never silently targets a different team.

### User Story 4 - Invite only the intended colleague (Priority: P2)

As an authorized team administrator, I can invite, resend and revoke access, and the named verified recipient can join once before expiry.

**Why this priority**: Makes the personal workspace usable by a small team.
**Independent Test**: Invite a synthetic recipient and test correct/wrong identity, expiry, resend, revoke and simultaneous acceptance; inspect membership and delivery history.

**Acceptance Scenarios**:

1. **Given** an authorized inviter and an approved role, **When** an invitation is accepted for delivery, **Then** it is bound to one recipient, workspace, permitted scope and expiry; pending delivery is distinguished from inbox delivery.
2. **Given** the intended verified identity and a current unused invitation, **When** acceptance commits, **Then** exactly one membership with the intended grants and one acceptance history exists.
3. **Given** an expired, revoked, superseded, consumed, tampered or wrong-recipient invitation, **When** acceptance is attempted directly or concurrently, **Then** no new authority is granted; the public response does not disclose workspace/account existence.
4. **Given** resend or revocation, **When** it commits, **Then** old proof immediately fails; delayed delivery cannot reactivate it.
5. **Given** the recipient already belongs to the team, **When** an invitation is accepted, **Then** their role is not silently elevated and no duplicate membership is created.

### User Story 5 - Control membership without orphaning a team (Priority: P2)

As an Owner, I can manage allowed roles, remove members and transfer ownership without leaving a workspace with no Owner.

**Why this priority**: Required safety prerequisite for membership authorization, not a full policy-editor feature.
**Independent Test**: Race two owner departures/demotions and ownership transfers; test lower-role attempts and removal while a tab remains open.

**Acceptance Scenarios**:

1. **Given** one Owner, **When** departure, removal or demotion would leave none, **Then** it is rejected with a recovery action to transfer first.
2. **Given** multiple Owners, **When** conflicting removals/demotions execute concurrently, **Then** at least one active Owner remains and rejected commands leave no partial history.
3. **Given** a lower role or fabricated grant, **When** ownership/role administration is invoked, **Then** privilege escalation fails even if the control is made visible.
4. **Given** an ownership transfer to a current member, **When** current reauthentication and authority are confirmed, **Then** new ownership and the departing Owner's role change commit together; failed transfer preserves the original ownership.

### Edge Cases

- Duplicate names are allowed; normalized slugs collide predictably without disclosing foreign workspace details.
- Missing selection, zero memberships, revoked selection and service outage have distinct safe states.
- Invitation URLs never accept on GET; forwarded links, crawlers, previews, wrong accounts and same-email aliases grant no access.
- Expiry uses trusted server time; an expired token is never revived by a slow sender, retry or restored backup.
- Membership creation and invitation revocation/acceptance serialize against each other; an inviter losing authority stops new delivery/acceptance.
- Cross-tab switching cannot silently redirect a pending command to the newly selected workspace.
- Lost commit replies trigger scoped reconciliation with the same operation ID; unknown delivery outcomes are never presented as delivery success.
- Concurrent session/grant revocation and commands follow one documented ordering; already accepted effects are not represented as undone.
- Profile edits remain personal; joining/leaving a workspace never copies, renames, deletes or makes personal profile data team-owned.
- Offline role/invitation/ownership changes are unavailable; permitted unsent input stays in memory with honest reload-loss messaging.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Reconcile the original six identity gates without renumbering their meanings; distinguish source inspection, mocked checks, real isolated integration, browser/human evidence and deployment evidence. Retain conflicting historical claims with a supersession note and owned gaps.
- **FR-002**: Maintain a capability and rollback ledger covering each exposed identity flow, approved policy, runtime support, default activation state, enforcement boundary and recovery action. Unsupported controls must remain unavailable.
- **FR-003**: Every protected entry point must require a fresh verified, unexpired, non-banned, non-revoked account session; identity or policy outages must fail closed without returning an empty replacement dataset.
- **FR-004**: Registration, verification, recovery and provider-return activation must satisfy approved identity policy and real isolated evidence; disabled capabilities must be denied on direct invocation as well as hidden/disabled in UI.
- **FR-005**: Create/list workspaces with immutable identity, bounded name and unique normalized slug, timezone, language, currency defaults, creation/update instants and revision. Creation must atomically establish the initial Owner; unconfigured legal settings must never imply issuance readiness.
- **FR-006**: Preserve existing personal profiles and their authorized reads/updates/live behavior. Existing users receive no automatic data migration, workspace ownership or new grants.
- **FR-007**: Offer create/join guidance with no memberships; list only current memberships with bounded pages. Workspace selection is a convenience, never permission.
- **FR-008**: Display active workspace on consequential UI; switching must revalidate membership and clear prior private views/subscriptions. Every command carries its original explicit target and must reject mismatched/stale selection rather than silently retarget.
- **FR-009**: Deny by default and recheck current workspace/resource/action grants within every service, query, action, API, subscription and background effect. All identifiers, relationships, pagination and result projections must remain tenant-scoped.
- **FR-010**: Provide Owner, Admin and Member templates: Owner controls ownership and privileged promotions; Admin manages operational settings and Member invitations/removals; Member reads context and may leave. Admin cannot remove or change another Admin/Owner. Only Owner may create/promote Admin or Owner. Maintain an explicit capability matrix. Additional domain roles and custom role editing are outside this slice; no template implicitly grants future financial/export/project permissions.
- **FR-011**: Support recipient-bound single-use invitations expiring 72 hours after trusted server creation time (expired at or after the expiry instant), authorized resend/revoke, permitted role/scope and audit metadata. Store no reusable invitation secret in logs, public metadata or ordinary history; do not infer membership from a contact or email alone.
- **FR-012**: Acceptance requires the intended currently verified recipient, active inviter authority, current workspace policy, unexpired unused proof and online access. One acceptance grants one membership; existing membership never silently escalates.
- **FR-013**: Serialize membership/ownership changes so at least one active Owner remains through all races. Ownership transfer requires a current member and fresh reauthentication; unsupported reauthentication blocks transfer activation.
- **FR-014**: Each accepted workspace command must atomically commit its effect, unique receipt and intent digest, entity revision, audit record and outbox event. Same-key/same-intent retries return one authorized result; same-key/changed-intent requests fail.
- **FR-015**: Require expected revisions for changes to existing entities; stale changes return a conflict without overwriting accepted state. Receipt reconciliation must enforce current authority, including after membership removal.
- **FR-016**: External invitation delivery must occur after commit with bounded retries, current authority and expiry checks, deduplication and explicit unknown outcomes; delivery failure must not undo an accepted workspace command.
- **FR-017**: Use authoritative UTC instants and exact bounded integer revisions/counts. No floating-point monetary amounts or invented timestamps are permitted; this phase creates no financial records or calculator.
- **FR-018**: Isolate migration and runtime privileges; preserve managed identity data/schema, protect audit/receipts against ordinary members and document compatible rollback/forward repair without deleting accepted records.
- **FR-019**: All screens, errors and invitation messages must provide equivalent English/Arabic behavior and RTL, keyboard/focus/screen-reader access, loading/empty/error/pending/conflict states, 320-pixel reflow, 200% zoom and reduced-motion support.
- **FR-020**: Bound request sizes, page sizes, query/transaction duration, invitations and delivery work; apply shared abuse limits and private-response caching/origin protections across instances, not just client cooldowns.
- **FR-021**: Automated unit/contract and real isolated persistence tests must cover cross-tenant denial, forged authority, stale sessions/grants, pool reuse, atomic rollback, lost-response replay, revision conflicts, concurrent owner changes and invitation replay/expiry. A refused or incomplete integration run must not report success.
- **FR-022**: Maintain release evidence with exact source/lock/build/environment, approved policy versions, applicable security controls/owners, actual commands and limitations. Runtime advisories, migration/recovery, delivery and bilingual accessibility checks remain release gates until proven.

### Key Entities _(include if feature involves data)_

- **Verified account session**: Managed account identity and current verified/unexpired/non-banned authority, retained under existing ownership.
- **Workspace**: Stable team identity, unique slug, name, designated Owner, presentation/legal-readiness defaults, revision and real instants.
- **Membership and grant**: Account-to-workspace association, active/revoked state, role template and explicit supported action/resource scope; current authority determines access.
- **Invitation**: Intended verified recipient, workspace, permitted role/scope, protected token proof, issuer, expiry, supersession/revocation/acceptance history and revision.
- **Command receipt**: Stable actor/target/operation identity, canonical intent digest, accepted result reference, revision and correlation; replay never creates authority.
- **Audit and outbox event**: Immutable redacted accepted-change history plus durable post-commit work with lease, retry and outcome metadata.
- **Workspace selection**: Per-browser convenience identifying a requested team; carries no role or authorization.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All six original identity gates and every exposed identity capability have an unambiguous status, owner, evidence classification and remaining action; zero mocked/refused results are counted as hosted passes.
- **SC-002**: Every negative tenant/session/grant fixture returns zero forbidden fields and causes zero forbidden effects across page, direct command, query, receipt and subscription paths.
- **SC-003**: At least 100 repeated concurrent duplicate-create and owner-change trials retain exactly one effect per operation and at least one active Owner; injected transaction failures leave zero partial effects/history.
- **SC-004**: All invitation expiry/replay/wrong-recipient/revocation/resend/race fixtures grant access at most once and disclose no foreign team data; accepted delivery and inbox observation remain distinguishable.
- **SC-005**: Existing profile regression scenarios pass without profile-data loss or new grants; new users can create a workspace and existing members can switch in both languages using keyboard alone.
- **SC-006**: On a recorded warm staging fixture of 100 workspaces and 100 members per workspace with 20 concurrent clients, 95% of create/list/switch confirmations complete within 2 seconds excluding email/provider delays; failures expose truthful retry/conflict states. This is a validation budget, not an availability promise.
- **SC-007**: English/Arabic message key and interpolation parity is 100%; every included journey is reviewed at 320 CSS pixels and 200% zoom in both directions with no inaccessible required action.
- **SC-008**: Before activation, all applicable release gates have current evidence or an explicitly disabled capability; restore/rollback exercises retain accepted workspace history and never reactivate expired invitations or revoked authority.

## Assumptions

- Planning is authorized; application implementation, hosted provisioning, migrations against remote databases, external mail and deployment are separate work.
- Existing managed identity, personal profiles, localization, shared components and connection pooling are reused; no parallel identity store is introduced.
- Confirmed slice policy (clarification 2026-11-01): Owner administers ownership/policy; Admin manages operational settings and Member invitations/removals; Member reads workspace context and may leave. Only Owner may create/promote Admin or Owner. Broader Q-05 decisions remain open.
- Confirmed invitation lifetime (clarification 2026-11-01) is 72 hours, resends rotate proof, and tokens bind the exact verified address using the managed identity provider's documented normalization. No plus/dot alias folding or domain-wide matching is allowed. This clarification resolves invitation expiry for this slice; broader Q-08 identity/recovery/MFA policy and managed support remain gated.
- Creation requires explicit workspace name/slug and confirmed timezone/language/currency defaults; no country/tax rule is inferred. No legal/financial readiness claim is made.
- Workspace URLs use stable identity and browser-scoped selection; selection invalidation must not turn authentication/network failures into empty-team states.
- Only minimal membership/transfer/grant prerequisites of F03.05–F03.07 and command foundations of F38.04/F38.06 are included. Full role editors, project/client grants, additional role templates, account closure, finance, offline storage, broad dashboard/navigation and generic job frameworks are deferred.
- Existing Q-02/Q-11/Q-13/Q-16 operational/retention/support decisions remain external gates; this specification does not settle them. No audit purge or hard workspace deletion is enabled here.
