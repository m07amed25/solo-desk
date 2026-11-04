# Feature Specification: Protect an Account with Stronger Sign-in Controls

**Feature Branch**: Existing `codex/fix-vercel-workspace-typecheck`; no branch was changed and no specification hooks are configured.

**Created**: 2026-11-03

**Status**: Draft — delegated policy choices recorded; capability investigation may proceed. Exact action-policy matrix, activation and acceptance remain gated.

**Input**: Specify current root-plan Phase 02 as one bounded feature: allow an authenticated account owner to configure supported stronger sign-in methods and perform verified identity changes without account takeover, session-policy bypass or accidental lockout. Do not implement during specification.

## Clarifications

### Session 2026-11-03

The user answered each of the three policy questions with “choose the best”, delegating the choice. These selections are product direction subject to managed capability evidence and required security review, not claims of provider support or production approval.

- Q: Which factors and mandatory coverage should this increment select? → A: Q1 option A: voluntary authenticator-app TOTP (time-based one-time codes), conditional on managed support. Once enrolled, every enabled password/social/passwordless entry must enforce the factor; recovery must restore compliant protection. No organization/all-account mandate or passkey second-factor role is selected.
- Q: Which recovery and last-route policy should be selected? → A: Q2 option A: provider-supported single-use recovery codes, shown once with secure-custody guidance, no read-back and replacement invalidating the previous set. Recovery revokes all pre-existing sessions, including an initiating authenticated session, and requires fresh policy-compliant sign-in. Losing all usable methods/codes has no automatic or support-assisted bypass and no guaranteed recovery.
- Q: How should remaining confirmation/challenge/session rules and optional expansion be handled? → A: Q3 option A: defer exact action-policy values to capability investigation and product/security review; F02.12/F02.13 remain unselected conditional expansions. No new action inherits revocation's five-minute proof or arbitrary expiry/retry/admission/session defaults.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Understand account protection (Priority: P1)

An owner finds security settings inside their existing personal account area and understands what is active, pending, supported or unavailable before changing access.

**Why this priority**: Truthful status prevents false protection claims and unsafe setup attempts.

**Independent Test**: Use supported/unavailable capability fixtures and two accounts to inspect the entry and invoke operations directly. This visibility slice is useful independently but cannot deliver MFA or close F02.05.

**Acceptance Scenarios**:

1. **Given** a current verified authenticated owner, **When** personal account settings open, **Then** a clearly named security entry shows only their accepted methods and accurate setup, enabled, pending, unavailable and failure states, without requiring workspace ownership.
2. **Given** absent policy approval or demonstrated managed support, **When** settings or direct operations are used, **Then** no protected change occurs and an understandable explanation and currently usable access route remain; hidden controls do not establish completion.
3. **Given** account A starts a change, **When** its session expires/is revoked or the browser switches to B before a delayed response/history restoration, **Then** A's secrets, methods, pending results and authority never appear for B or authorize a new effect.
4. **Given** recoverable failure, **When** recovery guidance appears, **Then** valid non-secret input remains under its original owner, secrets are not persisted, relevant errors/status are accessible and no success is invented.

### User Story 2 - Enroll and sign in with an approved factor (Priority: P1)

An owner voluntarily enrolls supported authenticator-app TOTP, confirms it works and encounters its challenge on every enabled entry path while enrolled. Activation remains conditional on managed support and the deferred action-policy review.

**Why this priority**: This is the mandatory F02.05 outcome. An email-verification code component alone provides no second-factor assurance.

**Independent Test**: On an authorized isolated managed target, enroll and confirm one approved supported factor, then sign in again through each covered entry method. An unavailable factor leaves this story blocked.

**Acceptance Scenarios**:

1. **Given** current authority, approved enrollment confirmation and demonstrated support, **When** setup begins, **Then** confidential setup material reaches only its owner and enrollment remains pending until required possession confirmation succeeds.
2. **Given** valid confirmation, **When** authoritative enrollment completes, **Then** the enabled state matches the provider and a subsequent sign-in succeeds using that factor.
3. **Given** enrollment/sign-in proof, **When** invalid, expired, consumed, superseded, wrong-account/session/purpose proof is submitted, **Then** no factor is activated and no protected session/access is granted; retry/restart follows approved limits.
4. **Given** cancellation or setup expiry, **When** the owner leaves or restarts, **Then** no unconfirmed factor activates, old setup cannot complete a new attempt and existing accepted access is preserved.
5. **Given** an owner has enrolled in TOTP, **When** password, approved social, optional passwordless, reset/recovery or direct managed entry is attempted, **Then** every enabled path requires the factor or approved recovery restoring protection before normal access. A primary credential/callback/password reset alone cannot bypass enrollment; unenrolled owners are not forced into MFA by this increment.
6. **Given** concurrent enrollment/confirmation or repeated submission, **When** requests compete, **Then** at most one matching transition is accepted, another intent cannot reuse proof and displayed state reconciles with the provider.

### User Story 3 - Recover or change protection without lockout (Priority: P1)

An owner who loses a factor follows approved recovery; an owner disabling or replacing protection confirms the consequences without losing the final usable route.

**Why this priority**: Recovery/removal can defeat protection or strand its owner unless governed by the same policy.

**Independent Test**: Exercise approved recovery and freshly authorized disablement on isolated accounts with multiple sessions/method combinations, including competing last-route removals.

**Acceptance Scenarios**:

1. **Given** supported recovery-code recovery, **When** recovery succeeds, **Then** all pre-existing sessions, including an initiating authenticated session, are revoked and the owner must freshly sign in with restored protection; revoked sessions remain revoked. A confirmed replacement factor is required before normal protected access resumes.
2. **Given** the selected recovery-code strategy is supported, **When** issued, used or replaced, **Then** secrets are presented once with secure-custody guidance, each code works at most once including races, replacement invalidates prior codes and secrets cannot be read back. Confirmed TOTP setup and one-time code presentation with explicit custody acknowledgement are required before enrollment is complete; acknowledgement does not claim the application saved a copy. Unsupported recovery leaves enrollment unavailable rather than substituting another strategy.
3. **Given** an enabled factor, **When** disablement/replacement is requested, **Then** current authority, explicit consequence confirmation and approved fresh proof are required; stale session presence cannot downgrade mandatory protection.
4. **Given** removal would eliminate the last valid access or required recovery route, **When** removal or competing removals occur, **Then** the unsafe effect is rejected, an approved replacement is explained and at least one policy-compliant usable route remains.
5. **Given** invalid, exhausted, replayed or another account's recovery proof, **When** submitted through any applicable entry, **Then** zero recovery/downgrade occurs and bounded non-disclosing guidance avoids an attacker-induced permanent lockout.
6. **Given** timeout/lost reply during recovery/removal, **When** status or retry is requested, **Then** it stays pending/unknown until reconciled and no duplicate or contradictory change is blindly dispatched.
7. **Given** all usable access methods and unused recovery codes are lost or unavailable, **When** help is requested, **Then** explain that this increment provides no guaranteed recovery or automatic/support-assisted bypass; no unverified credential enrollment, account merge or ownership transfer is offered.

### User Story 4 - Change a verified identity safely (Priority: P2; conditional F02.12)

If selected and supported, an owner changes their email or explicitly links/unlinks an approved social identity while retaining the same account, workspace relationships and business history.

**Why this priority**: Optional identity maintenance must not transfer authority merely by matching an address.

**Independent Test**: For each selected supported subflow, use accounts A/B and multiple sessions to complete and deny email/link/unlink changes. Unsupported subflows remain pending, not passed.

**Acceptance Scenarios**:

1. **Given** selected supported email change, **When** the current owner freshly authorizes a new address and completes required verification, **Then** accepted email changes only after the provider transaction and verification succeed, stable account/business/workspace ownership remains unchanged and the approved session outcome occurs.
2. **Given** pending email change, **When** cancelled, expired, rejected, partially failed or its reply is lost, **Then** no premature success appears; accepted identity stays unchanged before verified commitment, uncertain commitment reconciles before retry and old/new access recovery guidance matches actual state.
3. **Given** selected supported explicit linking, **When** A freshly authorizes an approved social identity, **Then** verified provider control links only to A; identity already owned by B is rejected without merging, disclosing B or transferring sessions/membership/business records.
4. **Given** matching email strings without an explicit verified linking transaction, **When** social sign-in or linking occurs, **Then** matching email alone never merges/links accounts or grants the other account's authority, including at managed entry.
5. **Given** selected supported unlinking, **When** the freshly authorized owner removes a link, **Then** only the selected link is removed after last-route checks and approved session handling; racing unlink/factor/passkey removals cannot jointly remove every usable route.
6. **Given** stale, consumed, wrong-account/session/purpose/action proof or authority revoked during a pending change, **When** completion is attempted, **Then** no new identity effect occurs, accepted state is preserved and the correct owner can restart safely.

### User Story 5 - Use and manage passwordless access (Priority: P3; conditional F02.13)

If selected and supported, an owner registers and labels passkeys, signs in without a password, recognizes own credentials and safely removes a credential or recovers from device loss.

**Why this priority**: Convenience is useful only with supported recovery, last-route safety and required-factor enforcement.

**Independent Test**: On a supported isolated device/provider target, explicitly register/list a passkey, sign in, remove it while another valid route exists and exercise device loss; test each separately selected passwordless method independently.

**Acceptance Scenarios**:

1. **Given** current owner authority and approved confirmation, **When** passkey registration is explicitly initiated and verified, **Then** the credential belongs only to that account, displays a safe readable label and is accepted only after authoritative success; listings expose no secrets.
2. **Given** a registered passkey and supported device, **When** authentication completes, **Then** only the intended account opens after all selected sign-in requirements; primary passwordless authentication does not automatically count as a second factor.
3. **Given** cancelled authenticator prompts or unsupported browsers/devices, **When** registration/sign-in stops, **Then** no false success, incomplete active credential or account switch occurs and an approved existing alternative/recovery route remains understandable.
4. **Given** expired/replayed challenges or origin/account mismatch, **When** registration/authentication is attempted, **Then** zero credential/unauthorized session is accepted and safe retry guidance appears.
5. **Given** supported own listing/removal, **When** credentials are listed or removal freshly authorized, **Then** only safe own labels/status appear and only the selected credential is removed; foreign IDs and last-route removal fail, including cross-method races.
6. **Given** device loss or another separately approved passwordless method, **When** recovery/sign-in occurs, **Then** its approved expiry/single-use/abuse/recovery/session rules apply without required-factor bypass; unsupported variants remain unavailable.

### Edge Cases

- Provider state changes after settings open: reconcile before claiming accepted state or removing routes (US1.1, US2.6, US3.4–6).
- Browser closes after one-time secret presentation: do not redisplay/persist it; use only approved replacement/recovery (US3.2/7).
- Proof expires or the original session is revoked before external dispatch: stop new effects; reconcile already dispatched uncertainty without authorizing another change (US1.3, US3.6, US4.6).
- Two tabs remove different kinds of methods, link during email change or replace recovery material: maintain last-route and same-account invariants across families (US3.4, US4.5, US5.5).
- Provider commits but local status/event persistence fails: local rollback cannot undo external commitment (US3.6, US4.2).
- Identity/admission outage: unavailable is not an empty accepted list; new effects pause while ordinary session/sign-out authority checks remain (US1.2–4).
- Mixed-direction addresses/labels, long identifiers, leading-zero proof, mobile keyboards and assistive recovery messages remain readable and unaltered (US1.4 and presentation matrix).

## Requirements _(mandatory)_

### Scope and prerequisite boundaries

This feature covers exactly [current root Phase 02](../../plan.md#phase-02), after Phase 01, within the existing personal account shell.

| Feature                                       | Retained scope label                        | Obligation                                                                                                                                                                                                                                |
| --------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F02.05 — Multi-factor authentication**      | **S · specified** — specified functionality | Mandatory contract: approved supported enrollment/challenge/disablement/recovery. Unsupported capability blocks completion; explanations alone do not deliver MFA.                                                                        |
| **F02.12 — Verified identity changes**        | **E · optional expansion**                  | Currently unselected. Email change and approved social linking/unlinking are explicit conditional requirements. Each subflow requires inclusion approval, support, policy and acceptance; unselected/unsupported subflows remain pending. |
| **F02.13 — Passkey and passwordless sign-in** | **E · optional expansion**                  | Currently unselected. Passkey registration/authentication/list/removal and separately selected passwordless/hardware-backed variants require approval, support and recovery acceptance. No blanket plugin/factor guarantee.               |

F02.05 requires F38.01 (environment isolation), F38.07 (security headers/private caching) and F02.02 (identity verification). F02.12/F02.13 additionally require F02.07 (sensitive-action reauthentication). F02.06 session management, F02.08 sign-out/account switching and F02.10/F38.06 abuse controls are inherited dependencies where relied upon. Checked source tasks or root feature marks cannot establish accepted contracts.

Phase 01 remains partial with recorded failed full verification and blocked Feature 007 G1/G3/G5/G6. G4 applies before new personal/security data collection or retention guarantees. G2 managed-name concurrency and unfinished preference/public work remain Phase 01-owned, not blanket blockers to independent specification/investigation; affected shared-shell behavior still needs regression acceptance. Exact tasks, source gaps and evidence categories are in the [context](artifacts/specification-context.md); corrections remain in [007's owning readiness ledger](../007-phase-one-completion/artifacts/readiness.md).

Excluded: general Phase 01 rewrite, another authentication backend, homemade protocols, managed-auth table writes, enterprise SSO/new social providers, workspace/organization factor-policy administration, business ownership transfer, general session/preferences redesign, support impersonation, protected browser drafts, notification products and closure. Mandatory cohorts selected here must be explicit; organization policy management needs separate approved scope.

### Functional Requirements

Common requirements govern mandatory MFA and each enabled optional subflow. Conditional requirements become acceptance obligations only for explicitly selected supported subflows; nonselection does not mark a feature delivered.

- **FR-001**: Owners MUST find security settings within the existing personal account area and see accurate own-method setup/enabled/pending/unavailable/failure states without workspace-role dependency. Acceptance: US1.1–2.
- **FR-002**: Every capability MUST remain unavailable until its managed operations, policy and applicable prerequisites are demonstrated; understandable explanations MUST replace placeholder actions/false completion. Acceptance: US1.2 and evidence gate.
- **FR-003**: Every protected read/change MUST derive identity/current authority from trusted server state, reject revoked/expired/unverified/banned/foreign authority and recheck before effects. Submitted actor/session/role claims cannot grant access. Acceptance: US1.3, US4.6 and direct-boundary matrix.
- **FR-004**: Enrollment and sensitive changes MUST require explicit owner intent and approved confirmation/fresh reauthentication bound to original account/session, purpose, action and target. Session presence, callback arrival or email code alone MUST NOT establish fresh proof. Acceptance: US2.1, US3.3, US4.6, US5.1/5.
- **FR-005**: Proof MUST enforce approved supported expiry, supersession, replay/single-use and account/session/action/purpose/origin binding. Cancellation invalidates pending intent without claiming to undo dispatched effects. Acceptance: US2.3–4, US4.6, US5.4.
- **FR-006**: Protected inputs MUST accept exact bounded fields/types, reject unexpected/duplicate/conflicting fields and preserve canonical identifiers/proof strings including leading zeros. Displayed user/provider content MUST be safe and bounded. Acceptance: malformed-input matrix, US1.4.
- **FR-007**: All affected paths MUST retain trusted-origin, safe-return, secure-cookie, CSRF and private-cache isolation, including managed entry and protocol returns. Proxy denial alone is insufficient. Acceptance: US2.5, US4.4 and ingress/direct-entry matrix.
- **FR-008**: Passwords, provider tokens, challenges, seeds/private keys and recovery secrets MUST stay out of logs, URLs, analytics, persistent browser stores and unrelated UI. Necessary confidential protocol exchange MUST use supported handling without application reflection into navigation/telemetry. Acceptance: secret inspection of US2–5.
- **FR-009**: Approved shared admission MUST bound enrollment/challenge/recovery/confirmation/identity/passwordless attempts across instances with truthful cooldowns and no easy permanent lockout. Outage MUST pause new effects; normal current-session checks and ordinary sign-out retain existing exemptions/authority checks. Acceptance: abuse/outage matrix, US3.5.
- **FR-010**: Minimal redacted attributable security events MUST distinguish attempt/denial/pending/unknown/confirmed outcomes with approved purpose/access/retention before collection and no arbitrary provider payload. Acceptance: event and outage/unknown inspection.
- **FR-011**: Pending/unknown provider changes MUST remain distinct from accepted/rejected; reconcile authoritative state before retry, prevent duplicate/contradictory effects and never claim external rollback from local failure. Acceptance: US3.6, US4.2.
- **FR-012**: Repeated/concurrent commands MUST preserve one intended effect and last-route checks across method families. Different intent cannot reuse proof; uncertain effects cannot release proof for another operation. Acceptance: US2.6, US3.4/6, US4.5, US5.5.
- **FR-013**: Expiry/revocation/sign-out/account switching, delayed results and restored history MUST conceal/clear original-owner secrets/private pending state without resurrecting revoked authority. Acceptance: US1.3, US3.1, cross-tab matrix.
- **FR-014**: MFA enrollment MUST be voluntary and use managed-supported authenticator-app TOTP; it stays pending until possession and required owner confirmation succeed. Enrollment is complete only with supported one-time recovery-code presentation/custody acknowledgement; active status MUST match authoritative state. If this combined supported contract cannot be met, enrollment remains unavailable. Acceptance: US2.1–2/4, US3.2.
- **FR-015**: For enrolled accounts, every enabled password/social/passwordless entry MUST require TOTP or approved recovery restoring protection before normal access. Reset/recovery MUST NOT silently remove the factor requirement. Unenrolled owners are not subject to a new all-account mandate. Email ownership verification MUST NOT be labelled MFA; no passkey second-factor role is selected. Acceptance: US2.3/5, US3.1.
- **FR-016**: Cancellation, invalid/expired/consumed/superseded proof and exhaustion MUST preserve accepted access without activating incomplete enrollment or bypassing required factors; retry/recovery follows approved policy. Acceptance: US2.3–4, US3.5.
- **FR-017**: Factor disablement/replacement MUST require explicit fresh authorization, disclose consequences, respect mandatory policy and prevent last-usable-route loss. Acceptance: US3.3–4.
- **FR-018**: Supported recovery-code recovery MUST restore only intended-owner compliant access, revoke all pre-existing sessions including an initiating authenticated session and require fresh sign-in with a confirmed replacement factor before normal access resumes. Revoked sessions MUST NOT return. Losing all usable methods/codes has no automatic/support-assisted bypass or guaranteed recovery. Exact recovery authority/challenge limits remain POL-03 gates; unsupported provider recovery cannot be replaced by a homemade flow. Acceptance: US3.1/5/7.
- **FR-019**: The selected recovery-code strategy MUST, when supported, present a new set once with secure-custody guidance/acknowledgement, consume each code at most once including races, invalidate replaced sets and prevent secret read-back. A usable enrolled configuration requires at least one accepted supported primary sign-in method, confirmed TOTP and at least one unused code from the current acknowledged set; pending/removed/unsupported methods or a session alone do not count. Reject removals leaving that configuration unusable while MFA remains enabled. After last-code recovery, replace recovery material before recovery completes; supported limited recovery may repair the configuration without opening normal access. Explicit freshly authorized voluntary MFA disablement is separate and must preserve at least one accepted usable primary route. Acceptance: US3.2/4, one-code races and cross-method last-route scenarios.
- **FR-020**: **If email change is selected and supported**, keep accepted identity until required owner/new-address verification and provider transaction succeed; distinguish pending destination and preserve stable account/business ownership. Acceptance: US4.1–2.
- **FR-021**: **For enabled email changes**, cancellation/expiry/rejection/partial failure/unknown outcome MUST provide honest recovery and reconcile actual email/session state; new work after cancellation/expiry needs valid proof. Acceptance: US4.2/6.
- **FR-022**: **If social linking is selected and supported**, allow only explicit freshly authorized approved-provider linking with demonstrated identity control/collision denial. Matching email alone MUST NOT merge/link accounts, even during ordinary provider sign-in. Acceptance: US4.3–4.
- **FR-023**: **If social unlinking is selected and supported**, remove only the owned selected link after fresh authorization while preserving approved usable access/recovery routes under races. Acceptance: US4.5–6.
- **FR-024**: Enabled identity changes MUST preserve stable account, workspace ownership/membership and business relationships and apply approved current/other-session outcomes before security acceptance. No bearer/session transfer to foreign accounts. Acceptance: US4.1/3/5–6.
- **FR-025**: **If passkeys are selected and supported**, registration MUST be explicit, current-owner and verified for intended account/origin before acceptance, with safe labels and own-only secret-free listings. Acceptance: US5.1/4–5.
- **FR-026**: **For enabled passkeys**, authentication MUST validate challenge/origin/account and selected policy before protected access. Expired/replayed/mismatched responses MUST fail; passwordless credentials MUST NOT satisfy mandatory MFA without explicit provider/policy acceptance. Acceptance: US5.2/4.
- **FR-027**: **For enabled passkeys**, cancelled prompts/unsupported devices MUST show truthful safe states and approved alternatives; failure MUST NOT create apparently active credentials. Acceptance: US5.3.
- **FR-028**: **For enabled passkeys**, listing/removal/device-loss recovery MUST preserve ownership, approved fresh authorization, last-route safety and required session outcomes. Acceptance: US5.5–6.
- **FR-029**: **If another passwordless/hardware-backed variant is selected and supported**, approve/test its exact registration or issuance, sign-in, listing/removal where applicable, challenge/recovery/session contract individually; one method MUST NOT activate another. Acceptance: US5.6 and method-specific US2.5/US3.4–7 repetitions.
- **FR-030**: Every enabled journey, explanation, consequence, error, status and user-facing security message MUST be equivalent in English/Arabic with RTL placement/readable mixed-direction identifiers. Acceptance: bilingual matrix.
- **FR-031**: Flows MUST preserve shared design and Light/Dark/System, keyboard/visible focus, accessible names/errors/status, screen-reader recovery, responsive 320 CSS-pixel reflow, actual 200% zoom and reduced motion. Acceptance: presentation matrix.
- **FR-032**: Recoverable failures MUST retain valid non-secret in-memory input/accepted identity, explain next actions and consequential recovery limits; no secret/proof persistence to preserve form state. Acceptance: US1.4, US3.2/7, US4.2, US5.3.
- **FR-033**: Acceptance MUST include actual managed behavior on an independently verified authorized isolated target, including direct-provider enforcement, alongside separately classified local tests. Unsupported/unavailable/skipped/human-review gaps MUST stay explicit/unaccepted. Acceptance: evidence gate.
- **FR-034**: Full completion MUST require accepted included contracts and the closing demonstration; smaller approved increments MUST name accepted/pending feature IDs and subflows without making optional expansion mandatory for launch. Acceptance: reporting gate.

### Selected policy and deferred activation decisions

The delegated selections resolve factor direction, recovery strategy and current optional scope. Product/security still own the exact action-policy matrix; demonstrated provider constraints may require revisiting a selection rather than weakening it silently.

- **POL-01 — Factors and coverage, selected**: Voluntary authenticator-app TOTP, enforced for enrolled owners across every enabled entry path. No all-account/workspace mandate and no passkey second-factor role. Unsupported covered entry paths cannot remain as a bypass; activation waits for equivalent managed enforcement. TOTP does not provide phishing resistance; this choice grants no assurance-level/compliance claim.
- **POL-02 — Recovery and last routes, selected**: Supported single-use recovery codes with one-time presentation, secure user custody, no read-back and replacement invalidating older sets. Recovery revokes all pre-existing sessions, including an initiating session, and requires fresh sign-in with restored protection. FR-019 defines usable enrolled/disabled configurations and exhaustion behavior; no automatic/support-assisted lost-all-methods bypass is selected. Provider support for limited recovery without ordinary factor-free access is required before activation.
- **POL-03 — Confirmation, challenges and sessions, explicitly deferred**: Before implementation of affected protected effects, identity engineering must establish supported behavior, then product/security must approve a versioned per-action matrix: existing confirmation methods; proof lifetime/consumption; enrollment/recovery/TOTP challenge expiry and clock/replay rules; retry/admission caps/windows/signals; current/other-session refresh/revocation for enrollment, disablement/replacement and code regeneration, plus future selected identity/passkey actions. POL-02's recovery revoke-all-prior-session rule is fixed and cannot be weakened by this deferral. F02.12/F02.13 remain unselected conditional expansions and pending.

Capability-investigation planning and independent synthetic local work may proceed under this explicit deferral. No protected effect implementation/activation or full acceptance is authorized before its matrix and prerequisite evidence pass. Preserve Q-08's existing five-minute single-success revocation proof without extending it to new actions. Email-verification/reset lifetimes, fixtures and upstream defaults cannot supply missing values. Record POL-03 decisions in the existing register and update this spec/checklist before generating dependent implementation tasks.

### Key Entities

- **Account authority**: Stable identity, verification/ban state and current session; identity editing transfers no workspace/business ownership.
- **Access method**: Owned factor/passkey/passwordless/social credential, safe label/role and support/pending/active/removed state; confidential material is not display metadata.
- **Security policy**: Versioned approved factor/cohort/path coverage, confirmation/challenge limits, recovery, session outcomes and last-route eligibility, with accountable owner.
- **Bound intent/proof**: Original account/session, purpose/action/target, trusted issue/verification/expiry and cancellation/supersession/single-use state; an identifier alone grants no authority.
- **Recovery material**: Only the selected strategy's issuance/consumption/replacement and safe remaining-status information, never a secret read-back catalogue.
- **Identity change**: Accepted identity, separate pending destination/link, verified outcome and session resolution; ambiguous effects stay unresolved.
- **Security outcome record**: Own intended change, accepted/rejected/pending/unknown state and minimal redacted events/evidence, excluding provider secrets.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Every approved supported factor passes 100% of isolated enrollment-confirmation-subsequent-sign-in cases for its owner; all required paths deny protected access until factor/recovery policy is satisfied. Disabled methods count as zero completed journeys.
- **SC-002**: All invalid/expired/consumed/superseded/wrong-account/session/purpose/action/origin and revoked-session cases produce zero unauthorized activations/identity changes/protected sessions; each single-use proof/code yields at most one successful effect under races.
- **SC-003**: All selected recovery/removal cases, including competing removals across method families, produce zero accepted changes without required usable routes; no recovery resurrects a revoked session or bypasses protection.
- **SC-004**: With two isolated accounts and at least three sessions each, 100% of enabled sensitive-change outcomes match approved current/other-session rules. Designated revoked sessions fail their first subsequent protected operation; unchanged-account access/ownership is unaffected.
- **SC-005**: Every enabled identity subflow passes valid/collision/cancel/partial-failure/stale-proof cases with zero matching-email-only merges, ownership transfers or falsely accepted changes.
- **SC-006**: All outage/lost-reply/repeated-submission cases show accurate accepted/rejected/pending/unknown status and reconcile before another effect; zero blind duplicate/contradictory changes or false rollback/success claims.
- **SC-007**: Every enabled journey passes English/Arabic × Light/Dark/System with keyboard and mobile recovery at 320 CSS pixels and actual 200% zoom, with zero unresolved blocking focus/status/identifier/assistive defects; fluent-Arabic and assistive human reviews are separate evidence.
- **SC-008**: In a recorded review with at least five people covering both languages, at least four locate settings, complete supported confirmed enrollment and find approved lost-device recovery without assistance within five minutes of active interaction, excluding external delivery/authenticator wait; every participant correctly identifies enabled/pending/unavailable protection.
- **SC-009**: Across at least two application instances, every approved abuse cap holds with zero excess protected effects. Admission outage pauses new affected attempts while valid session checks/sign-out remain usable; inspected navigation/telemetry/logs/persistent browser stores contain zero secrets.
- **SC-010**: Final evidence accounts for every FR, selected optional subflow and demonstration step; zero unsupported/missing/mock-only/historical-only results are counted as managed acceptance/full completion.

## Assumptions

- The actor is the current account owner. Public sign-in/challenge/recovery continues the intended account's supported flow without treating a submitted account identity as authority.
- Security changes require online trusted authority. Preserve accepted identity, access and business relationships; no account reset/migration is implicitly authorized.
- Existing architecture, shell, design/localization and security contracts remain binding. Technical constraints/inspected paths are in the separate [planning handoff](artifacts/specification-context.md#planning-handoff), not an implementation design here.
- This specification activates no method/flag, dependency, migration, live target, provider setting, deployment or external message. Local mocks supplement actual managed evidence.

### Provider capability and evidence gate

The dated [capability review](artifacts/specification-context.md#capability-review) separates upstream installed code, installed managed wrapper, current vendor statements and actual target acceptance. Current managed documentation lists MFA as coming soon and email change as unsupported; passkeys are absent from the inspected wrapper/supported-plugin list. Social linking, preserved-session fresh reauthentication, sensitive-change invalidation and direct-provider policy enforcement remain unproven on SoloDesk's target. This is no implementation promise.

Before activation, identity/security owners MUST establish separately: supported MFA enrollment/challenge/disablement/recovery; passkey registration/authentication/list/removal; verified email change; social link/unlink/collision behavior; same-account fresh proof preserving intended session; refresh/revocation after changes; and equivalent direct-provider enforcement. Record each as supported/unsupported/unproven with evidence. No alternate backend, managed-table write, fake proof or homemade protocol fills a gap.

Evidence MUST identify feature/FR/SC/scenario; source/build/dependency/managed configuration and policy versions; verified isolated app/auth/database/sink/roles; synthetic accounts/methods/sessions; exact steps/commands with expected/observed results; redacted artifacts; reviewer/date and limitations. Unknown hosted build identity remains a gap, not the local package version.

Run applicable story cases through application and managed entry points plus foreign-account/direct calls, malformed/extra-field inputs, authority loss before effects, distributed abuse/outage, races and secret/private-cache checks. Repeat enabled flows in both languages, all themes, supported browsers/devices, keyboard/mobile and assistive recovery. Local mocks/state machines, actual database transactions, managed acceptance, deployed ingress, browser automation and human reviews are distinct categories; one cannot pass another.

### Reporting and lifecycle gate

Proceed **clarify → plan → checklist → tasks → analyze** before implementation. This invocation creates the spec, requirements-quality checklist/context and narrow owning-document annotations; no implementation plan/tasks or accepted capability.

After implementation, use **converge**, complete its resulting unmet-requirement tasks and run acceptance. The final report MUST list implemented supported capabilities, verification commands/results, disabled/pending scope, unresolved Phase 01 prerequisites, provider/environment/human limits and whether the full demonstration passed: **enroll a supported factor → sign in with it → exercise approved recovery → reject stale identity-change proof**. Unsupported/unapproved identity change means the full demonstration has not passed.

Only after implementation/verification, update root `plan.md` feature/subtask marks, status, totals and remaining notes to accepted scope. Whole Phase 02 closes only when all included contracts are accepted; a smaller approved release names exactly which feature IDs/subflows remain pending. Specification/checklist work changes no delivery totals.

## Subsequent owner authorization — 3 November 2026

After reviewing the incomplete informational delivery and the proposed authentication ownership change, the owner said “U are allowed to do anything” and explicitly authorized reading environment files. For completion work this selects the previously conditional F02.12 email/social identity and F02.13 passkey scope, authorizes designing app-operated Better Auth backed by Neon PostgreSQL, and delegates concrete policy/implementation choices. The original protection, ownership, recovery, bilingual and evidence outcomes remain binding. This authorization supplies no fabricated managed-provider support or completed external/human acceptance. The later authorized plan section and Phase 9 tasks govern the new execution scope.
