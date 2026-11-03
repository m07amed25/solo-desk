# Feature Specification: Phase One Account and Public Entry Completion

**Feature Branch**: Existing `main` checkout; no branch created and no specification hooks configured.

**Created**: 2026-11-03

**Status**: Draft — ready for planning; implementation, policy approvals and release acceptance remain open.

**Input**: User description: "Create a spec for missed feature in phase one at plan.md only phase one missed".

## Scope and gap baseline

Complete only the missing behavior and acceptance evidence in [Phase 01 of the root delivery plan](../../plan.md#phase-01). This is one completion increment for account entry, recovery, session control, reauthentication, safe sign-out, personal preferences and truthful public entry.

Phase 01 has **11 product entries and 14 supporting entries**. Unchecked parents do not mean every underlying component needs rebuilding. Preserve existing account forms, social initiation, callback handling, name editing, account shell, language/theme controls and their valid tests. The applicable contracts from [001](../001-landing-auth-pages/spec.md), [002](../002-landing-page-upgrade/spec.md), [003](../003-enhance-auth-pages/spec.md), [004](../004-workspace-platform-and-authorization/spec.md), [005](../005-application-shell-sidebar/spec.md) and [006](../006-shell-verification-completion/spec.md) continue to govern their existing functionality.

This inventory is not runtime acceptance. Root-plan implementation notes are historical. Local source inspection on 3 November confirmed simulated newsletter success, misleading footer destinations/status, public-header sign-out that navigates even on failure, missing personal timezone/notification controls and explicitly disabled reauthentication. Existing server session checks do not provide a member-facing session list or revoke controls.

| Phase 01 entry                                    | Missing behavior or evidence covered here                                                             | Requirements           |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------- |
| F02.01 — Email and social sign-in                 | Approved policy and real registration/sign-in/provider-return acceptance                              | FR-001–003, FR-030     |
| F02.02 — Identity verification                    | Real delivery, resend, expiry, reuse and wrong-account denial                                         | FR-004–005, FR-030     |
| F02.03 — Password recovery                        | Real single-use reset, social-only protection, session invalidation and non-disclosing responses      | FR-005–006, FR-030     |
| F02.04 — OAuth callbacks and failure recovery     | Real success/cancellation/failure and trusted-destination acceptance                                  | FR-003, FR-030         |
| F02.06 — Session management                       | Own session list, current-session identification, individual/other-session revoke and open-tab denial | FR-007–010             |
| F02.07 — Sensitive-action reauthentication        | Fresh account/session/action-bound proof and fail-closed sensitive actions                            | FR-011–012             |
| F02.08 — Sign-out and account switching           | Public-header failure correction and real cross-account/expiry/history acceptance                     | FR-013–015             |
| F02.09 — Personal profile and preferences         | Personal timezone and notification storage/controls; retained name/language behavior                  | FR-016–019             |
| F02.10 — Authentication abuse controls            | Enforced shared limits, redacted events and actionable recovery                                       | FR-020–022             |
| F01.01 — Public landing page                      | Truthful claims, accurate links, localization and removal of simulated subscription success           | FR-023–025, FR-028–029 |
| F01.02 — Account entry pages                      | Real failure/return, bilingual and accessibility acceptance                                           | FR-001–006, FR-028–030 |
| F38.01 — Environment isolation                    | Separate account-flow environments and synthetic test identities                                      | FR-026, FR-030         |
| F38.06 — Distributed rate limits                  | Shared limits for enabled account flows and existing public submissions                               | FR-020–021             |
| F38.07 — Security headers and private caching     | Actual ingress/session/private-response isolation evidence                                            | FR-027, FR-030–031     |
| F38.08 — Dependency advisory review               | Fresh review of delivered versions with owned findings                                                | FR-031                 |
| F38.09 — Secret lifecycle                         | Server-only secrets and verified rotation/revocation                                                  | FR-026–027, FR-031     |
| F37.01 — Data inventory                           | Collected account/session/preference/security-event/contact/email data                                | FR-032                 |
| F37.03 — Retention schedules                      | Approved class-specific rules for data actually collected                                             | FR-033                 |
| F37.04 — Legal holds                              | Scoped hold/release history and deletion protection                                                   | FR-034                 |
| F39.01 — Design system contracts                  | Missing states of existing shared public/account controls                                             | FR-028–029             |
| F39.02 — English and Arabic message parity        | All rendered copy, errors and user-facing emails, including hardcoded footer/header text              | FR-028                 |
| F39.03 — RTL layout verification                  | Complete journeys, mixed scripts, narrow layouts and zoom                                             | FR-028–029             |
| F39.06 — Contrast and reduced-motion verification | Actual control states and resolution of applicable known gaps                                         | FR-029                 |
| F39.11 — Release evidence ledger                  | Source-specific results and reconciliation of conflicting historical claims                           | FR-030–031, FR-035     |
| F39.14 — Security review and penetration exercise | Scoped authorized negative tests and owned release findings                                           | FR-031, FR-035         |

Supporting requirements cover enabled Phase 01 surfaces and collected data. Future upload/export/job limits, business composites, financial retention and PDF translations remain with their owning phases. Scoped acceptance here cannot mark a broader supporting parent fully accepted before its entire contract passes.

**Excluded:** Phase 02 MFA, passkeys, passwordless access, account linking and identity changes; workspace/invitation/ownership-transfer product flows; shell/dashboard expansion; clients, projects, time and money; notification delivery/center/quiet hours; protected persistent browser drafts; self-service export/closure; newsletter infrastructure; Phase 62 pricing/help/blog/status pages. Existing protected consumers receive regression checks; reauthentication does not activate later product flows.

## Clarifications

### Session 2026-11-03

- Q: Which Phase One actions should require the user to sign in again before proceeding? → A: Revoking one or all other sessions requires reauthentication; ordinary sign-out does not.
- Q: After confirming their identity again, how long should users have to complete the selected session revocation? → A: Five minutes after successful reauthentication or one successful use, whichever comes first.
- Q: When the browser’s chosen language differs from the user’s saved account language, which should SoloDesk display? → A: The explicit browser choice takes priority, followed by saved account language, then English.
- Q: If the service that limits repeated attempts becomes unavailable, how should new sign-in, recovery and public-form submissions behave? → A: Pause new account-access attempts and public-form submissions until shared limits recover; existing valid sessions and ordinary sign-out remain available under normal identity checks.
- Q: How should users confirm their identity before revoking other sessions? → A: Use an existing enabled account sign-in method: re-enter the account password or complete a fresh Google/GitHub identity check; an existing session alone is insufficient.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Enter and recover the correct account (Priority: P1)

A visitor can use an approved method, prove email ownership, recover password access and return safely after a provider failure.

**Why this priority**: Account forms need verified identity and recoverable failures to provide usable access.

**Independent Test**: Complete real isolated registration, verification, sign-in, recovery and provider-return journeys using synthetic identities, without creating workspaces.

**Acceptance Scenarios**:

1. **Given** an approved enabled method, **When** registration/sign-in completes, **Then** only the intended verified account opens at the allowed destination, using an explicit supported browser language choice first, otherwise the saved account language, otherwise English; browser theme is preserved and missing membership never fabricates a workspace.
2. **Given** an unverified identity, **When** protected access is attempted directly or through navigation, **Then** access is denied and the permitted verification path remains available.
3. **Given** a verification challenge, **When** proof is used or resent, **Then** verification succeeds once, resend obeys enforced limits and superseded, expired, consumed, wrong-purpose and wrong-account proof cannot change identity.
4. **Given** a password account, **When** valid recovery sets a new password, **Then** the old password and existing sessions stop authorizing access, proof cannot be reused and fresh sign-in is required.
5. **Given** an unknown address or social-only account, **When** recovery is requested, **Then** public acknowledgement does not reveal existence/membership and does not silently add credentials or link identities.
6. **Given** either approved social provider, **When** entry succeeds, is cancelled, fails or returns with altered/replayed proof or a hostile destination, **Then** the correct account opens only after valid success; otherwise safe localized retry guidance appears without an untrusted redirect.
7. **Given** delivery/provider failure or a disabled method, **When** entry is attempted, **Then** no success or delivery is invented, safe non-secret input is retained where possible and an available recovery action is shown.

### User Story 2 - Inspect and revoke sessions (Priority: P1)

A signed-in person can recognize their current session and remove access they no longer trust.

**Why this priority**: Member-facing session controls are missing and are necessary to recover from unwanted access.

**Independent Test**: Open three sessions for one synthetic account and a second account's session; exercise revocation while submitting protected operations from the affected open tabs.

**Acceptance Scenarios**:

1. **Given** multiple own sessions, **When** session management opens, **Then** safe available device/browser/activity information identifies the current session; foreign sessions and session secrets are absent.
2. **Given** a selected non-current session and valid action-bound reauthentication, **When** revocation completes, **Then** only that session loses access and its next protected operation is denied, including from an open tab.
3. **Given** several sessions and valid action-bound reauthentication, **When** revoke-other-sessions completes, **Then** the current session remains valid and every other session's next protected operation fails; revoking the current session instead enters signed-out recovery without requiring reauthentication.
4. **Given** a foreign session reference, repeated revoke, service failure or lost reply, **When** revocation is attempted/retried, **Then** no foreign access changes, no uncertain success is claimed and refresh/retry resolves actual own-session state.

### User Story 3 - Prove current control before sensitive actions (Priority: P1)

A person must reauthenticate before revoking one or all other sessions. Ordinary sign-out, including ending the current session, does not require reauthentication.

**Why this priority**: A stolen or stale session alone must not authorize consequential changes.

**Independent Test**: Reauthenticate using an existing enabled password or Google/GitHub method to revoke one other session and then all other sessions; repeat with missing, stale, replayed, wrong-account, wrong-session and different-action proof. Verify that cached sessions alone are insufficient and ordinary sign-out remains available without fresh proof. Test-only actions cannot substitute for these real revocation journeys.

**Acceptance Scenarios**:

1. **Given** a request to revoke one or all other sessions, **When** fresh valid proof is absent, **Then** no session is revoked and the supported reauthentication path is offered.
2. **Given** successful reauthentication, **When** the confirmed revocation proceeds under current authority before five minutes have elapsed, **Then** proof applies only to that account, current session, action and confirmed revocation target and is consumed by one successful use.
3. **Given** cancelled, expired, consumed or mismatched proof, **When** used, **Then** no sensitive effect occurs; unsupported provider proof keeps the capability explicitly unavailable.
4. **Given** unused proof immediately before five minutes have elapsed, **When** the confirmed action is authorized, **Then** it may complete once; at or after the five-minute boundary, the proof cannot authorize a new revocation and fresh reauthentication is required.
5. **Given** an existing enabled account sign-in method, **When** confirmation is requested, **Then** a password account can re-enter its password and a Google/GitHub account can complete a provider-confirmed fresh authentication for the same account; a cached session or callback arrival alone is insufficient. A different account, disabled method or unverifiable freshness produces no revocation or identity change, and no password access, account linking or email-code reauthentication fallback is introduced.

### User Story 4 - Leave or switch accounts safely (Priority: P1)

A person can sign out from public or account pages and change identity without seeing the previous person's private content.

**Why this priority**: The public header navigates away even on sign-out failure, and complete cross-account acceptance remains open.

**Independent Test**: Exercise public desktop/mobile and account sign-out with success, returned error, thrown failure and lost response; switch identities and use history, refresh and multiple tabs.

**Acceptance Scenarios**:

1. **Given** any sign-out entry point, **When** sign-out succeeds, **Then** authenticated controls, private views and live subscriptions clear and the old session cannot perform another protected operation.
2. **Given** sign-out failure/uncertainty, **When** the response fails or is lost, **Then** sensitive content stays concealed, completion is not claimed and retry or current-session reconciliation is available.
3. **Given** expiry/account change while a request is pending, **When** old results arrive or history restores a page, **Then** no previous identity's content, pending result or subscription becomes visible to the new identity.
4. **Given** unsaved in-memory input, **When** expiry or departure/account change occurs, **Then** honest recovery/loss guidance appears without transferring input ownership or enabling protected persistent storage.

### User Story 5 - Save personal preferences (Priority: P2)

A person can edit their name and personal language, timezone and optional email-notification preference independently of team settings.

**Why this priority**: Name editing and browser presentation exist; persisted personal timezone and notification settings are missing.

**Independent Test**: Save settings for two people, reopen another session and check ownership, persistence, invalid input and failures without a notification-delivery service.

**Acceptance Scenarios**:

1. **Given** a valid own account, **When** a personal setting is saved, **Then** reopening another session reflects accepted values and leaves another person's preferences and workspace defaults unchanged.
2. **Given** no saved settings, **When** settings opens, **Then** supported defaults are identified as defaults, optional email remains off and timezone can be chosen before saving.
3. **Given** invalid/unsupported input, a stale edit, denied session or failed save, **When** submitted, **Then** accepted values are preserved and safe editable input receives corrective/retry guidance without false success.
4. **Given** optional account email is disabled, **When** optional-email eligibility is evaluated, **Then** the saved choice is respected; required verification/recovery/security messages are distinguished and cannot be disabled by this preference.
5. **Given** different browser and saved account languages, **When** the person signs in or reopens their account, **Then** the explicit supported browser choice determines the interface language and the saved account preference remains unchanged; without a browser choice the saved account language applies, and without either English applies. Signed-out visitors without a browser choice also receive English.

### User Story 6 - Read a truthful localized public website (Priority: P2)

A visitor can understand current capabilities and follow accurately named public links in either language.

**Why this priority**: Footer copy, destinations and simulated subscription acknowledgements undermine trustworthy account entry.

**Independent Test**: Review every rendered public/header/footer/account string and link in both languages; verify that no subscription or live service-health claim is fabricated.

**Acceptance Scenarios**:

1. **Given** either language, **When** the website opens, **Then** available capabilities and planned/synthetic examples are distinguishable and no private records appear.
2. **Given** each public/footer link, **When** followed, **Then** the destination matches its label and preserves language/theme; unavailable destinations are removed or clearly unavailable rather than disguised by unrelated anchors.
3. **Given** no newsletter service, **When** the footer opens, **Then** no active subscription form, simulated acknowledgement or delivery-frequency promise is presented; a localized informational unavailability message may replace it.
4. **Given** unverified legal-entity, social-account or service-status claims, **When** reviewed, **Then** they are removed or replaced with verified content; a decorative indicator never establishes live health.
5. **Given** keyboard/assistive use, reduced motion, narrow width, zoom or mixed-script Arabic, **When** any included journey runs, **Then** information, controls, errors and focus remain usable in each theme.

### User Story 7 - Assess and operate the account slice honestly (Priority: P1)

A release reviewer can identify accepted behavior, protect collected data and stop release when required proof is absent.

**Why this priority**: Phase 01 includes operational/privacy controls and cannot close on simulated or unchecked results.

**Independent Test**: Review a candidate release using synthetic identities, cross-environment denial, shared abuse attempts, a shared-limiter outage, a held record and failed/unavailable checks. During the limiter outage, test new submissions separately from existing valid sessions and ordinary sign-out.

**Acceptance Scenarios**:

1. **Given** separate test and production environments, **When** test credentials/callbacks target production, **Then** access is denied and account evidence remains in the authorized isolated environment.
2. **Given** attempts across multiple running instances, **When** approved limits are reached, **Then** total allowed work remains within the shared cap and users receive safe non-disclosing retry guidance.
3. **Given** inventoried data and approved retention, **When** cleanup runs, **Then** only eligible records expire; held/referenced evidence survives and hold placement/release remains attributable.
4. **Given** missing provider proof, unavailable scans, unresolved policy or a release-blocking finding, **When** acceptance is reviewed, **Then** the gap and owner remain explicit and the affected feature/full phase cannot be reported accepted.
5. **Given** unavailable shared attempt limits, **When** new account-access or public-form submissions are attempted, **Then** no new submission is accepted or effect initiated and localized temporary-unavailability/retry guidance appears; existing valid sessions and ordinary sign-out continue under normal identity checks. When limits recover, new attempts resume under the enforced shared policy.

### Edge Cases

- Concurrent verification/reset submissions yield at most one successful use; leading-zero codes retain their value.
- Duplicate registration, delayed mail, superseded proof and unknown results never create duplicate accounts or claim delivery.
- Sessions disappear between listing and revocation; partial revoke-other-session failure remains visible. Unknown device metadata is labelled unknown and never establishes identity.
- Social-only recovery cannot create password access; disabled methods remain unavailable on direct invocation.
- Session-list or action-bound proof support may be missing from the managed service. A disabled control does not complete its feature contract.
- A social-provider return for a different account or without verified fresh authentication cannot authorize revocation or replace the original current identity; absent supported proof keeps other-session revocation unavailable rather than adding a weaker confirmation fallback.
- Stale public-header identity, delayed results, history restoration and multiple tabs cannot resurrect a previous account view.
- Competing personal-settings edits receive conflict/reload guidance rather than silently overwriting accepted values.
- An unsupported browser language is not a valid override; language resolution falls back to a supported saved account language, then English. Explicit browser presentation never silently rewrites the personal account-language preference.
- Long Arabic names, mixed-direction email, invalid timezones and daylight-saving boundaries do not change canonical identities or stored instants.
- Network/storage/identity/limiter failures never grant access or create a durable-save claim; uncertain effects require reconciliation.
- A shared-limiter outage never falls back to unenforced or independent per-instance limits for new account-access/public submissions. Existing valid sessions and ordinary sign-out remain subject to normal identity checks; the outage cannot extend expired or revoked authority.
- A lost revocation reply permits reconciliation under current authority without extending the five-minute proof lifetime or authorizing a second effect; concurrent uses of the same proof allow at most one successful revocation action.
- Cleanup racing a hold preserves held evidence; releasing a hold does not bypass other retention/reference rules.
- Removing misleading legal links does not waive reviewed disclosures required before public release.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Account entry MUST reuse existing separate pages and supported methods, preserve valid accounts and distinguish disabled methods from working journeys. Acceptance: US1.1–2, US1.7.
- **FR-002**: Protected access MUST require a current permitted verified identity under approved policy; sign-in MUST NOT create workspace grants. Acceptance: US1.1–2 and direct-access denial.
- **FR-003**: Each approved social method MUST complete real success/cancellation/failure with validated destinations and identity continuity; altered/replayed proof MUST fail safely. Acceptance: US1.6.
- **FR-004**: Verification MUST support resend and correction/restart, enforce expiry/single use, invalidate superseded proof and reject wrong-account/purpose proof without changing identity. Acceptance: US1.3.
- **FR-005**: Public registration, sign-in, resend and recovery MUST avoid account/membership disclosure through wording, navigation, response shape or observably distinct behavior beyond approved policy. A request acknowledgement MUST NOT claim delivery. Acceptance: US1.3, US1.5, US1.7 and abuse tests.
- **FR-006**: Approved password recovery MUST change credentials once with valid proof, invalidate existing sessions, reject the old password and require fresh sign-in; social-only identities MUST NOT gain credentials implicitly. Acceptance: US1.4–5.
- **FR-007**: People MUST list only their own sessions, identify the current session and see safe available device/activity metadata with explicit unknowns; session credentials MUST never be exposed. Acceptance: US2.1.
- **FR-008**: Session management MUST provide individual revoke and revoke-other-sessions where verified provider support exists, distinguish the current session and report partial/failed results accurately. Unsupported controls remain unaccepted. Acceptance: US2.2–4.
- **FR-009**: After confirmed revocation, the revoked session's next new protected read/mutation MUST fail, including from an open tab; cached identity MUST NOT preserve authority. Acceptance: US2.2–3, US4.1–3.
- **FR-010**: Foreign-session actions MUST fail without revealing/changing the session; duplicate requests and uncertain replies MUST reconcile to actual own-session state. Acceptance: US2.4.
- **FR-011**: Revoking one or all other sessions MUST require fresh proof bound to account, current session, action and confirmed revocation target, with current permission at effect time. Proof MUST expire five minutes after successful reauthentication or after one successful use, whichever comes first; a new action at or after five minutes MUST require fresh reauthentication. Ordinary sign-out and ending the current session MUST NOT require reauthentication. Acceptance: US2.2–3, US3.1–4, concurrent-proof-use and ordinary sign-out without fresh proof.
- **FR-012**: Reauthentication MUST use an existing enabled method belonging to the same account: password re-entry or provider-confirmed fresh Google/GitHub authentication. Cached sessions and callback arrival alone MUST NOT establish freshness. Cancelled, invalid, wrong-account, disabled-method or unsupported proof MUST cause no revocation or identity change and remain an explicit blocker; no password enrollment, account linking or email-code reauthentication fallback may be introduced. Proof tests MUST NOT activate later ownership-transfer, closure, export or linking features. Acceptance: US3.3, US3.5 and direct-action denial.
- **FR-013**: Every public/account sign-out control MUST inspect outcome, conceal private content and dispose live subscriptions; failed/uncertain sign-out MUST offer retry/reconciliation without claiming completion. Acceptance: US4.1–2.
- **FR-014**: Account change, expiry, history restoration and delayed responses MUST NOT expose a previous identity's records, controls, pending results or live updates. Acceptance: US4.3.
- **FR-015**: Unsaved input MUST retain its original account ownership with honest recovery/loss guidance; protected persistent browser drafts MUST remain disabled under existing gates. Acceptance: US4.4.
- **FR-016**: People MUST save their own name, supported personal language and recognized timezone separately from browser presentation/workspace defaults; accepted values MUST persist across own sessions. Interface language MUST use the explicit supported browser choice first, otherwise the supported saved account language, otherwise English. Browser choice MUST NOT silently rewrite saved account language. Acceptance: US5.1, US5.5 and unsupported-language fallback tests.
- **FR-017**: Personal settings MUST include an explicit optional account-email-notification choice, initially off, distinct from mandatory security/verification/recovery mail. Saving it MUST NOT claim delivery or newsletter subscription. Acceptance: US5.2, US5.4.
- **FR-018**: Settings MUST validate allowed values, reject foreign targets/protected fields and handle competing edits without silent overwrite. Acceptance: US5.3 and foreign-account/competing-edit tests.
- **FR-019**: Failed saves MUST preserve accepted settings and safe editable input, announce recovery guidance and claim success only after acceptance. Changes MUST NOT alter another person, workspace policy or historical document values. Acceptance: US5.1, US5.3.
- **FR-020**: Enabled registration, sign-in, verification, resend, recovery, reauthentication and existing public submissions MUST enforce approved bounded attempts across instances using account/network signals without trivial bypass or easy attacker-induced permanent lockout. Acceptance: US7.2 and abuse edge cases.
- **FR-021**: Displayed cooldowns MUST match enforced limits. When shared limits are unavailable, new registration, sign-in, verification/resend, recovery/reset, reauthentication and public-form submissions MUST pause without accepting a new submission or initiating its effect, and show localized temporary-unavailability/retry guidance. No unenforced or independent per-instance fallback is allowed. Existing valid sessions and ordinary sign-out MUST remain available under normal identity checks, without extending revoked/expired authority. New attempts may resume only once shared enforcement recovers. Acceptance: US1.3, US7.2, US7.5 and outage/recovery tests.
- **FR-022**: Security-relevant entry/reset/revoke/reauthentication/abuse outcomes MUST produce minimal attributable redacted events. Events/artifacts MUST exclude passwords, challenges, active session credentials and unnecessary personal content. Acceptance: event inspection for US1–4 and US7 review.
- **FR-023**: Public capability, legal-entity, social and health claims MUST be verified or removed; planned capabilities and synthetic previews MUST be distinguished from available behavior. Acceptance: US6.1, US6.4.
- **FR-024**: Public/account link labels MUST match reachable intended destinations and preserve presentation preferences. Unavailable destinations MUST be removed or visibly unavailable; unrelated anchors MUST NOT impersonate pricing/legal/help/status pages. Acceptance: US6.2 and disclosure edge case.
- **FR-025**: Simulated newsletter subscription MUST be removed or replaced by localized informational unavailability; this increment MUST NOT collect subscription addresses, fabricate success or add a newsletter service. Acceptance: US6.3.
- **FR-026**: Account test/release environments MUST isolate identity origins, data and secrets; test records MUST be synthetic and credentials/callbacks MUST NOT cross into production. Acceptance: US7.1.
- **FR-027**: Private responses MUST remain isolated across identities; protected mutations MUST reject untrusted origins and deployed cookies/transport/headers/redirects MUST enforce project policy. Secrets MUST remain inaccessible to public pages, browser stores and artifacts. Acceptance: US2 foreign access, US4 history and US7 ingress/security checks.
- **FR-028**: Every included visible string, accessible label, state/error and user-facing email MUST provide equivalent English/Arabic content, including footer/header copy. Mixed-direction identifiers and Arabic shaping MUST remain readable without changing canonical values. Acceptance: US6.5 and bilingual US1–5 repetitions.
- **FR-029**: Included controls MUST reuse current shared design contracts and support keyboard/focus, screen readers, 320 CSS-pixel reflow, actual 200% zoom, Light/Dark/System and reduced motion. Actual control states MUST meet applicable accessibility criteria; known gaps require resolution or explicit release findings. Acceptance: US6.5 and accessibility review of US1–5.
- **FR-030**: Acceptance MUST include real isolated approved-provider journeys and current protected-operation denial, recorded separately from simulated local checks. Disabled methods and unavailable scenarios MUST remain unaccepted. Acceptance: US1–4, US7.4.
- **FR-031**: Release review MUST record delivered versions against fresh advisories, actual ingress/isolation evidence, secret rotation/revocation and recovery procedures, scoped negative-test results, owners and limits under the existing release gate. Unavailable scans and unknown applicability MUST remain gaps. Acceptance: US7.1, US7.4 and security handoff below.
- **FR-032**: Every collected Phase 01 data class MUST have purpose, location, provider/subprocessor, access, accountable owner and retention basis inventoried before activation; optional analytics/crash collection MUST remain opt-in. Acceptance: US7.3 inventory review.
- **FR-033**: Retention MUST follow approved class-specific rules for collected live records, email/contact data, security events and backups. Unknown policy MUST block affected deletion/guarantees with an owner; no universal purge period may be invented. Acceptance: US7.3–4.
- **FR-034**: Applicable holds MUST record scope, placement/release authority, reason/history and prevent cleanup of held/referenced evidence, including races. No self-service closure or general hold-management console is added. Acceptance: US7.3 and hold-race tests.
- **FR-035**: Acceptance records MUST identify included IDs, source/build/environment/policy, fixtures, expected/observed results, redacted artifacts, reviewer/date and findings. Phase 01 MUST stay open until complete contracts pass; partial supporting scope and conflicting historical claims MUST be explicit without checking later work. Acceptance: US7.4 and Phase 01's closing demonstration.

### Key Entities _(include if feature involves data)_

- **Account identity**: Existing person, approved methods and verification state; identity does not imply membership.
- **Account session**: Own access instance, current indicator, safe optional device/activity metadata and revocation state; confidential credentials are excluded from user-facing records.
- **Verification/recovery challenge**: Purpose/account binding, expiry, supersession and consumed state; proof remains confidential.
- **Reauthentication proof**: Account/session/action/target binding, verified existing enabled method, successful reauthentication time, five-minute expiry and single-success consumption state; unsupported proof cannot authorize effects.
- **Personal preferences**: Account-owned name/language/timezone/optional email choice and accepted revision, separate from browser presentation/team defaults.
- **Security event**: Minimal actor/outcome/time/correlation record with restricted access and retention.
- **Lifecycle record**: Collected class, purpose, owner/provider/location, retention rule, references and hold/release history.
- **Acceptance record**: Included scope, reviewed artifact identity, policy, observations, reviewer, findings and dependencies.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: For every approved enabled method, 100% of isolated success/failure/cancellation/return cases reach the correct account or actionable safe recovery; disabled methods contribute zero passing journeys.
- **SC-002**: All expired/reused/superseded/wrong-account/purpose challenge cases cause zero unauthorized changes; concurrent proof use produces at most one successful effect.
- **SC-003**: In the three-session test, individual revoke removes exactly selected access, revoke-others preserves exactly the current session, and every revoked session fails its first subsequent protected operation.
- **SC-004**: All attempts to revoke one or all other sessions with missing/stale/replayed/mismatched proof produce zero revocations; unused matching proof permits one confirmed action before five minutes and zero new actions at or after five minutes. Concurrent proof use allows at most one successful action. Every configured approved reauthentication method demonstrates same-account freshness; cached-session-only, wrong-account and disabled-method cases produce zero revocations or identity changes. Unsupported proof leaves those controls unaccepted. Ordinary sign-out and ending the current session succeed with a valid current session without fresh reauthentication.
- **SC-005**: Both public sign-out variants and account sign-out pass success, returned-error, thrown-failure and lost-reply scenarios with zero false completion or previous-account disclosure, including history and account changes.
- **SC-006**: For two people with at least two sessions each, 100% of accepted setting changes persist for their owner; foreign/stale updates never silently change accepted values, team defaults or another person. All combinations of supported browser/account language choices, absent choices and an unsupported browser choice follow browser-first, account-second, English-last resolution without rewriting the saved account preference.
- **SC-007**: All included public/footer links match their labels, planned/synthetic examples are disclosed and there are zero simulated subscription, unsupported live-health or unverified legal-entity claims.
- **SC-008**: Every included journey is reviewed in both languages and all three themes; at 320 CSS pixels and actual 200% zoom required controls remain reachable with zero unresolved blocking keyboard/focus/screen-reader/contrast defects. Fluent Arabic review is recorded separately from automated parity.
- **SC-009**: Across at least two running instances, total allowed attempts remain within every approved shared cap and all blocked attempts receive non-disclosing recovery guidance without protected effects. During shared-limiter outage tests, zero new account-access/public submissions are accepted, while existing valid sessions and ordinary sign-out continue to pass normal identity checks; after recovery, all new attempts again follow shared limits.
- **SC-010**: Every collected class has reviewed owner/purpose/retention entries; all hold/cleanup-race cases preserve required evidence and eligible unheld records follow the approved schedule.
- **SC-011**: All 25 Phase 01 entries have current scoped evidence status and owners; zero failed/missing/disabled/historical-only results are counted accepted and zero later-phase features are checked by this increment.
- **SC-012**: In a recorded review with at least five participants, at least four find session controls, revoke a prepared other session and save a personal timezone without assistance within three minutes, excluding external-provider wait time.

## Assumptions

- "Phase one" means current root-plan **Phase 01**, not historical P01. Existing edits/open work are preserved. This invocation creates only the spec, its quality checklist and active-feature pointer.
- Existing product, architecture, security and design authorities remain binding; source references identify the baseline rather than prescribe implementation. No dependency, stack change, provisioning, deployment, external message or capability activation is authorized here.
- A saved personal timezone is retained; otherwise UTC is an explicit editable default. Interface language follows an explicit supported browser choice, then supported saved account language, then English; signed-out visitors have no account-language fallback. Personal language remains a separately saved account preference. Optional account email defaults off, excludes essential security mail and adds no delivery product.
- Account/security/settings effects require online identity authority. Provider support for listing/revoking sessions, direct disabled-method enforcement and action-bound proof must be established during planning.
- Existing profiles/sessions are not destroyed to add controls. Unknown device metadata is labelled honestly. Already downloaded content cannot be guaranteed remotely erased.

### Dependencies and policy gates

| Gate                            | Decision or evidence needed                                                                                                                                        | Owner                                     | Effect while unresolved                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Q-08                            | Approved methods, verification/recovery/reauthentication rules, proof lifetimes, invalidation and abuse thresholds; invitation-only approval does not settle these | Product + security + identity engineering | Plan integration/tests; keep unapproved effects gated and dependent entries unaccepted                |
| Managed identity support        | Actual session enumeration/revocation, action-bound proof and enforcement of disabled methods at provider entry                                                    | Identity engineering + security           | Record unsupported features as blockers; unavailable controls do not complete F02.06/F02.07           |
| Q-13 and applicable Q-01 review | Class-specific retention, hold authority/release, backup expiry and mandatory public disclosures                                                                   | Product + operations/legal                | Block unapproved deletion/guarantees and missing mandatory disclosure; invent no durations/legal text |
| Q-02, Q-11 and Q-16             | Approved isolated environment, browser/assistive matrix and applicable ingress/recovery ownership                                                                  | Engineering + operations + product        | Missing hosted/browser/recovery evidence remains a release gap; no availability promise               |
| Q-06/Q-07                       | Existing browser draft storage/key/recovery approvals                                                                                                              | Product + security + engineering          | Protected persistent drafts stay off; disclose in-memory loss limits                                  |

The clarified Phase 01 reauthentication trigger is revocation of one or all other sessions; ordinary sign-out is exempt. Confirmation uses an existing enabled password or Google/GitHub method with verified same-account freshness; its proof expires after five minutes or one successful use, whichever comes first. Limiter-outage behavior is fixed by FR-021. Remaining Q-08 account-activation, verification/recovery lifetime, invalidation and abuse-threshold decisions, plus managed-provider proof support, stay open for product/security review during planning. Retention/hold and operational readiness decisions also remain owned gates; this five-question session does not resolve them. Specification quality may pass while these dependencies remain open. Record later policy approvals in the existing decision register before activation.

### Security control and evidence handoff

Planning MUST map selected [SEC controls](../../docs/security/vulnerability-catalogue.md) to versioned applicable assurance requirements, actual entry points and named reviewers. This is future required evidence, not a passed scan or certification.

| Controls                      | Required account-slice negative evidence                                                                                              | Responsible role                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| SEC-001–008                   | Brute force, challenge reuse, identity confusion, origin forgery, enumeration, revoked-session denial and action-bound proof          | Identity engineering + security                  |
| SEC-009–012, SEC-014          | Foreign session/settings access, injected fields, stale authority and safe session-list projection                                    | Account engineering + security                   |
| SEC-017, SEC-019, SEC-022–025 | Bounded malformed/conflicting input, unsafe fields, hostile displayed content and safe errors                                         | Account engineering + QA                         |
| SEC-026–032                   | Framing/origin/cookie/ingress/redirect tests, private-cache isolation and forbidden sensitive browser persistence                     | Web engineering + operations + security          |
| SEC-041–048                   | Restricted access, pooled isolation where touched, preference integrity, secrets, recovery, minimization and retention/holds          | Data engineering + operations + privacy reviewer |
| SEC-049–056                   | Delivered dependency/component/configuration inventory, fresh advisories and owned unavailable/applicability findings                 | Engineering + security                           |
| SEC-060–064                   | Existing identity-email callback authenticity/replay, bounded delivery retry, redacted events, shared quotas and fail-closed recovery | Identity engineering + operations + security     |

New uploads, financial posting, portal publication and business providers are excluded. Reassess controls if planning introduces a new boundary. Apply the complete [security release gate](../../docs/security/release-checklist.md) to enabled surfaces, including required restore/rollout evidence; this scope does not postpone its obligations.
