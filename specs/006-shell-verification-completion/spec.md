# Feature Specification: Application Shell Completion and Verification

**Feature Branch**: No branch created; specification authored on existing `main` checkout.

**Created**: 2026-11-02

**Status**: Draft — specification validated; implementation and acceptance pending.

**Input**: User request to create a full new specification from the supplied brief: complete the remaining SoloDesk application-shell corrections, resolve unreliable local verification, verify desktop/mobile and English/Arabic journeys, preserve safe account/workspace transitions, and reconcile evidence and completion tracking before considering client management.

This is a completion increment for [Feature 005: Application Shell and Sidebar Navigation](../005-application-shell-sidebar/spec.md). Its existing requirements and contracts remain authoritative for the shell. This specification defines remaining correction and verification obligations; it does not replace the product catalogue or declare the shell accepted.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Trust Local Verification Before Continuing (Priority: P1)

As a maintainer, I need to reproduce the reported verification failure and distinguish a product defect from a test or execution restriction, so corrections are supported by reliable results and cannot endanger stored data.

**Why this priority**: An unreliable verification baseline undermines every later completion claim. Establish and investigate it first.

**Independent Test**: Run the existing required verification from the recorded source/environment, exercise maintenance help and invalid selections without database access, and retain baseline and corrected outcomes.

**Acceptance Scenarios**:

1. **Given** previous records disagree about verification, **When** the maintainer runs the complete required local checks, **Then** the actual result and first failure are recorded without inheriting a previous explanation or pass claim.
2. **Given** no database access and synthetic connection values, **When** maintenance help is requested, **Then** useful help is returned successfully, no connection or migration is attempted, and no credential value appears in output.
3. **Given** an invalid migration selection, **When** it is submitted without database access, **Then** a useful non-success result is returned before connection attempts, with no credential disclosure or database effects.
4. **Given** a reproducible failure, **When** its cause is corrected, **Then** meaningful existing assertions demonstrate the correction while ordering, altered-history detection, locking, transactions, rollback, connection cleanup and connection-security safeguards remain effective.
5. **Given** an unavailable execution prerequisite, **When** an affected check cannot finish, **Then** the exact restriction and blocked coverage remain recorded and independent corrections continue; the unavailable check is never counted as a pass.

---

### User Story 2 - Reach Working Destinations in a Distinct App (Priority: P1)

As an authenticated account holder, I need a recognizable application area with working Overview, Workspace and Personal account destinations, so I can navigate my work and personal information without entering a marketing layout.

**Why this priority**: These are the existing shell's core journeys and the basis for further work.

**Independent Test**: Visit all three app destinations and public/authentication pages; navigate the expanded sidebar and collapsed rail, including a short desktop viewport.

**Acceptance Scenarios**:

1. **Given** an authenticated account, **When** `/app`, `/app/workspace` or `/app/account` opens, **Then** it uses the application sidebar/header, with no public SiteHeader, marketing navigation, hero, newsletter or footer.
2. **Given** public home or an authentication-entry page, **When** it opens, **Then** its own layout remains intact and no application sidebar appears.
3. **Given** expanded or collapsed desktop navigation, **When** a destination or toggle is activated by keyboard or pointer, **Then** it works, its accessible name remains available, and active destination, heading and breadcrumbs agree.
4. **Given** a short desktop viewport, **When** the user reaches workspace/account and appearance controls, **Then** none is clipped or unreachable and collapsed icons retain accessible names and focus/hover tooltips.
5. **Given** Overview, **When** account/workspace context loads or fails, **Then** truthful context and useful next actions appear, with no fictional metrics, dead links or unfinished business controls.
6. **Given** workspace controls or Personal account, **When** existing permitted operations are performed, **Then** validation and outcomes are preserved; personal profile reading, updates and live behavior remain usable with no membership, disabled workspaces or a workspace-service outage.
7. **Given** a documented warm session and device/network, **When** at least 20 destination changes are timed through visible usable content or an accurate actionable unavailable state, **Then** at least 95% finish within two seconds; response-arrival timing alone does not establish this result.

---

### User Story 3 - Use Mobile Navigation Without Losing Control (Priority: P1)

As a narrow-screen or keyboard user, I need a modal drawer that opens, closes and restores focus correctly, so every destination remains reachable without interaction with obscured content.

**Why this priority**: Mobile navigation is essential and must not trap users.

**Independent Test**: Open the mounted drawer by keyboard/pointer, traverse it, dismiss it, navigate successfully, and resize between narrow and wide layouts while observing focus and background scrolling.

**Acceptance Scenarios**:

1. **Given** a narrow layout, **When** its labeled navigation control is activated, **Then** a modal drawer opens on the language-appropriate side, contains keyboard focus, and blocks background interaction and scrolling.
2. **Given** an open drawer, **When** Escape or a dismissal control is used, **Then** it closes, background interaction resumes and focus returns to its visible opener.
3. **Given** an open drawer, **When** a permitted destination change succeeds, **Then** it closes, background locks are removed and focus moves to an appropriate visible heading or main region.
4. **Given** an open drawer or collapsed rail, **When** the viewport crosses the navigation breakpoint in either direction, **Then** obsolete overlays/scroll locks disappear and focus remains on a usable visible control.
5. **Given** unsaved input and an open drawer, **When** navigation is cancelled at the discard confirmation, **Then** destination, input and usable drawer/focus state are preserved.

---

### User Story 4 - Keep Private Context Correct Across Transitions (Priority: P1)

As an account holder, I need only currently authorized account/workspace information to appear during switching, expiry and restoration, so private data and actions cannot cross authority boundaries.

**Why this priority**: A correct-looking shell is unsafe if stale views or permissions survive a transition.

**Independent Test**: Use authorized synthetic accounts in two distinguishable workspaces plus a non-member; delay responses, revoke membership/grants, switch identities, expire sessions, and restore history while checking mounted views and direct protected operations.

**Acceptance Scenarios**:

1. **Given** workspace A is visible, **When** switching to B starts, **Then** A's private content/actions are concealed during uncertainty and only newly verified B context may appear; delayed A responses cannot populate B.
2. **Given** an in-flight command for A, **When** selection changes to B, **Then** it retains its original target and cannot affect B; obsolete views, forms, menus and existing subscriptions are cleared or disposed of appropriately.
3. **Given** revoked membership, a removed grant, foreign identifier or forged selection, **When** protected reads/actions are invoked directly, **Then** current authority is enforced with no forbidden fields/effects; inaccessible selection is cleared without silently retargeting work.
4. **Given** loading, genuine empty choices, no selection, disabled workspaces, restricted selection or unavailable workspace service, **When** each occurs, **Then** it has distinct localized feedback and a permitted next action; failure is not reported as empty data or successful selection.
5. **Given** A's private views, **When** identity changes to B, authority expires or becomes uncertain, or the page leaves and later returns, **Then** private content is concealed and transient state/subscriptions are discarded as appropriate; current authority is checked before any private reveal.
6. **Given** sign-out, **When** it succeeds or fails, **Then** success prevents private history restoration without revalidation, while failure is reported truthfully with retry and no false success or unrevalidated private reveal.
7. **Given** an invitation link, **When** it arrives during ready, loading, unavailable, disabled or signed-out states, **Then** only bounded proof may remain in memory, the visible fragment is promptly scrubbed, and no team is joined without explicit authorized recipient acceptance.
8. **Given** malformed, oversized, lost, expired, consumed, revoked or wrong-recipient proof, **When** it is handled, **Then** it grants no authority, reveals no forbidden information and provides safe guidance; proof never enters persistent storage, logs, analytics or return destinations.
9. **Given** disabled credentials, invitations, ownership transfer or unsupported step-up, **When** UI or direct execution attempts them, **Then** existing restrictions remain enforced; no capability is enabled to make verification pass.

---

### User Story 5 - Preserve Destination and Unsaved Input (Priority: P1)

As a user, I need browser navigation, sign-in and presentation changes to preserve a validated destination and respect cancelled navigation, so I can continue an interrupted task safely.

**Why this priority**: Losing work or resuming at an unsafe location breaks otherwise functional destinations.

**Independent Test**: Exercise direct entry, refresh, Back/Forward, sign-in returns and language/theme changes from all three destinations, with clean/edited forms and hostile return values.

**Acceptance Scenarios**:

1. **Given** a valid app destination, **When** it is entered directly, refreshed or reached with Back/Forward, **Then** the same permitted destination becomes active after required authority checks and focus remains sensible.
2. **Given** a signed-out visit to a valid app destination, **When** supported sign-in completes, **Then** that validated destination resumes without invitation proof; unknown, external, malformed or ambiguous returns fail safely.
3. **Given** a current destination and authorized workspace, **When** language or Light/Dark/System changes, **Then** both are preserved after any required revalidation.
4. **Given** edited unsent input, **When** a link, workspace switch or presentation change would discard it, **Then** cancel/discard is offered before transition; cancellation prevents it and preserves destination, workspace, preferences and input.
5. **Given** that confirmation, **When** discard is explicitly chosen, **Then** the permitted transition completes without stale content, trapped focus or a lingering drawer.
6. **Given** a recoverable form failure, **When** the user retries, **Then** valid in-memory input remains available; reload/closure loss is disclosed without a durable-save claim.

---

### User Story 6 - Work in Either Language Across Screen and Theme Changes (Priority: P2)

As an English- or Arabic-speaking user, I need readable, accessible content and controls across appearance/viewport changes, so the same workflows remain usable in either language.

**Why this priority**: Equivalent bilingual accessibility is a release requirement, even though verification follows core navigation corrections.

**Independent Test**: Review actual interactions and shell-owned visible/accessible text in both languages across Light/Dark/System, the viewport matrix, reflow, zoom, reduced motion and live device-theme changes; retain separate human accessibility and fluent-Arabic results.

**Acceptance Scenarios**:

1. **Given** each shell-owned loading, empty, restricted, disabled, unavailable, outage/retry, role/status and unsaved-change state, **When** it appears in either language, **Then** text, confirmations and accessible names are localized with no unexplained source-language fallback.
2. **Given** Arabic, long names and mixed-direction identifiers, **When** navigation, menus and breadcrumbs are used, **Then** placement, logical spacing, alignment, appropriate directional icons, reading order and keyboard order are coherent and text remains readable.
3. **Given** Light, Dark or System, **When** device appearance changes or reduced motion is requested, **Then** System tracks the device, explicit themes remain selected, motion respects the preference and context is preserved.
4. **Given** any required viewport, 320 CSS-pixel reflow or 200% zoom, **When** primary journeys run in either language, **Then** controls remain reachable, focus is visible/unobscured, affected contrast meets the shared accessibility target and there is no page-level horizontal overflow.
5. **Given** keyboard/screen-reader and fluent-Arabic review obligations, **When** only automation or screenshots exist, **Then** human review remains open rather than approved by proxy.

---

### User Story 7 - Trust Completion Records and the Next-Work Decision (Priority: P2)

As a product owner/reviewer, I need completion claims tied to current evidence and full feature contracts, so I can tell what is ready and which prerequisites still block client management.

**Why this priority**: Accurate tracking prevents a narrow shell increment from becoming false approval of dependent features or release.

**Independent Test**: Trace claimed completion to attributable results, compare Feature 005 evidence/tasks and the root plan, and verify partial parents, totals and next-work guidance against unchanged contracts.

**Acceptance Scenarios**:

1. **Given** an automated, interaction or manual result, **When** recorded, **Then** it identifies commands/actual exits where applicable, source/build/environment, isolated fixture prerequisites, browser/version, locale/theme/viewport/interaction coverage, captures/traces and limitations without secrets.
2. **Given** source inspection, a standalone state model, anonymous responses, translation parity or historical summaries, **When** evaluated, **Then** each supports only what it checked and cannot substitute for mounted authenticated browser behavior or real authority/isolation checks.
3. **Given** unsupported marks or conflicting summaries, **When** verification is reconciled, **Then** Feature 005 plan/evidence/tasks are corrected while dated history/artifacts remain attributable; failed, skipped, stale and unavailable checks remain explicit gaps.
4. **Given** implemented and verified work, **When** the root plan is refreshed, **Then** completed subtasks may be checked, full features are checked only against entire contracts, partial parents remain open, and inventory, ledger, totals and immediate next work agree while stable IDs, dependencies and unrelated edits are preserved.
5. **Given** shell completion with unresolved upstream/broader work, **When** readiness is reported, **Then** the report states corrected behavior, actual results, exact changed completion IDs, remaining gaps and whether client-management prerequisites are satisfied; no client work, production activation, deployment or external message is performed.

### Edge Cases

- Help/invalid selection with missing, malformed or synthetic credential-bearing connection values: no database access or secret disclosure, including error output.
- A child verification process is denied or a browser/fixture is unavailable: preserve diagnostics and narrow the claim; do not relax assertions or attribute a source defect without reproduction.
- Collapsed navigation at short height, or a drawer open while resizing/navigating/losing authority: no essential control, focus target or background scroll remains blocked.
- Rapid switches, delayed reads, stale mutations, another tab changing selection or revoked grants: conceal uncertain context, retain command targets and revalidate rather than silently choose a workspace.
- Zero authorized choices differs from no selection, disabled capability, denied selection and failed list; later authorized choice pages remain reachable.
- A workspace outage during personal editing must not erase permitted personal input or block independent own-profile operations.
- Cancelled discard must stop links, workspace selection and preference submission before context changes; modified-click/new-tab navigation must not discard input in the original tab.
- History restoration, expiry, failed sign-out or identity change with an open drawer/form/subscription: no stale private reveal or orphaned overlay/subscription.
- Invitation arrival before sign-in, during context failure or through a new fragment: malformed/oversized encoding fails safely; lost proof leads to safe reopen guidance without persistence.
- A hostile/ambiguous return with an external destination, duplicate value, extra query or fragment fails safely within approved destinations without proof forwarding.
- Long Arabic/English names and mixed-direction identifiers in zoomed/narrow content must not obscure controls or change canonical identifiers.
- Old “all passed” evidence followed by a suite stopping early: later stages remain unverified; human/release approvals require separate current evidence.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The maintainer MUST establish current source, working-tree and verification baseline first, preserve unrelated edits, and treat prior marks/results as claims to reproduce.
- **FR-002**: Maintenance help MUST succeed and invalid migration selections MUST fail usefully without database access, migration effects or credential disclosure, including with synthetic credential-bearing configuration.
- **FR-003**: A verification correction MUST address the demonstrated product, harness or execution cause without weakening assertions or ordered execution, history integrity, locking, transaction/rollback, cleanup, direct-connection and certificate-verification safeguards.
- **FR-004**: Corrections MUST have meaningful focused verification, followed by full required local checks when relevant failures are resolved. Failed/blocked stages MUST retain actual results; independent work MUST continue.
- **FR-005**: `/app`, `/app/workspace` and `/app/account` MUST retain the distinct authenticated shell. Public/authentication layouts MUST retain their composition, and the app MUST exclude marketing sections/controls.
- **FR-006**: Every enabled navigation item MUST reach working content with matching active state, heading and breadcrumbs. Overview MUST show truthful context with no fictional metrics or unfinished business controls.
- **FR-007**: Expanded desktop navigation and the collapsed rail MUST support keyboard/pointer toggling, accessible icon names and focus/hover tooltips; workspace, account and presentation controls MUST remain reachable in short viewports.
- **FR-008**: Narrow navigation MUST provide a labeled modal drawer with focus containment, dismissal/Escape, blocked background interaction/scrolling and focus restoration to its opener on dismissal.
- **FR-009**: Successful navigation MUST close the drawer and place focus sensibly. Resizing/authority loss MUST release obsolete overlays/scroll locks and hidden focus traps; cancelled navigation MUST retain usable current context.
- **FR-010**: Direct entry, refresh and Back/Forward MUST preserve correct permitted destination/active state after current-authority checks, with sensible navigation focus.
- **FR-011**: Authentication, language and theme changes MUST preserve only validated supported destinations and authorized workspace context. Unknown, external, malformed or ambiguous returns MUST fail safely and never carry invitation proof.
- **FR-012**: Changes that would discard edited unsent input MUST offer cancel/discard before navigation, workspace or presentation changes. Cancellation MUST prevent transition and preserve destination, selection, preferences and input; explicit discard MUST permit the authorized transition.
- **FR-013**: Recoverable failures MUST preserve permitted in-memory input and provide a retry/recovery action. Reload/closure loss MUST be disclosed without promising persistent saving.
- **FR-014**: Workspace management MUST reuse existing authorized behavior, validation, confirmations, role ceilings and final-owner safeguards. Personal profile read/update/live behavior MUST remain independent of workspace membership, capability disablement and workspace-service failure.
- **FR-015**: Workspace context MUST distinguish loading, no selection, genuine empty authorized choices, disabled, restricted, unavailable and populated states, with localized next actions and access to later authorized choice pages.
- **FR-016**: Workspace switching MUST conceal old private data/actions while unresolved, verify current destination authority and report pending/failure truthfully. Inaccessible selections MUST be cleared without silent retargeting; returning to old context MUST require revalidation.
- **FR-017**: Delayed reads/mutation completions MUST NOT populate another workspace/account. In-flight commands MUST retain original targets; obsolete private views, menus, form state and existing subscriptions MUST be cleared or disposed of appropriately.
- **FR-018**: Every protected service entry point MUST enforce current identity and workspace/resource/action grants. UI visibility, identifiers and selection cookies MUST NOT grant authority; direct foreign, revoked or insufficient-grant attempts MUST expose no forbidden fields/effects.
- **FR-019**: Expiry, revocation, identity changes, sign-out and page/history restoration MUST conceal private content when authority is uncertain, discard inappropriate private transient state and require current validation before private reveal.
- **FR-020**: Sign-out MUST distinguish success/failure, offer truthful retry on failure and prevent private history restoration without revalidation after success.
- **FR-021**: Invitation entry MUST promptly scrub the fragment, retain only bounded necessary proof in memory and require explicit authorized recipient acceptance. Malformed, oversized, invalid or wrong-recipient proof MUST fail safely; missing proof MUST lead to safe sign-in/reopen guidance.
- **FR-022**: Invitation proof, credentials and protected records MUST NOT enter persistent browser stores, public/shared responses, ordinary navigation payloads, logs, analytics or return URLs. Presentation-only remembered state MUST confer no authority.
- **FR-023**: Existing capability gates MUST remain enforced in presentation and direct execution. Credentials, invitations, ownership transfer and unsupported step-up MUST NOT be activated to obtain a demonstration or passing result.
- **FR-024**: Every shell-owned visible/accessibility string MUST follow existing English/Arabic localization conventions, including outage/retry, unsaved-change, role/status, drawer and loading/empty/restricted/disabled/unavailable content.
- **FR-025**: Arabic MUST use correct sidebar/drawer side, logical spacing/alignment, appropriate directional icons, readable long/mixed-direction content and coherent keyboard/reading order without changing canonical identifiers.
- **FR-026**: Light, Dark and System MUST preserve context and shared design consistency; System MUST track live device appearance and motion MUST respect reduced-motion preferences.
- **FR-027**: The shell MUST meet the shared accessibility target across the phone/tablet/desktop/short-screen matrix, 320 CSS-pixel reflow and 200% zoom, with reachable controls, visible unobscured focus, accessible landmarks/names, a usable skip link, affected contrast verification and no page-level horizontal overflow.
- **FR-028**: Verification MUST include actual mounted authenticated browser interactions for navigation, drawer/focus/scroll/resize, localization and lifecycle/state transitions. Source checks, response statuses, translation parity and isolated state models MUST NOT substitute for them.
- **FR-029**: Authority/isolation verification MUST use authorized synthetic identities/workspaces and isolated database targets, with direct denial and real integration evidence appropriate to the boundary. No production access or external messages are included.
- **FR-030**: Each evidence record MUST identify method, commands/actual exits where applicable, source/build/environment, fixture prerequisites, browser/version/locale/theme/viewport/interaction coverage, sanitized captures/traces and actual outcome; failed, skipped, stale or unavailable coverage MUST name its gap.
- **FR-031**: Required human accessibility, screen-reader and fluent-Arabic review MUST remain open until actually performed; automation MUST NOT approve them. Fresh applicable advisory/security review MUST remain separately evidenced, with unavailable scans recorded as gaps.
- **FR-032**: Unsupported Feature 005 plan/task/evidence claims MUST be reconciled against current results while preserving attributable history and stable IDs. After implementation/verification, root inventory, ledger, totals and immediate next work MUST reflect the same evidence; partial parents and unmet acceptance MUST remain unchecked.
- **FR-033**: Completion MUST be assessed against each root feature's full unchanged contract/dependencies. The handoff MUST list corrections, passed/failed checks, exact completed feature/subtask IDs, pending work/reasons and an explicit client-management prerequisite decision; this increment MUST NOT begin clients, deploy or activate production capabilities.

### Key Entities _(include if feature involves data)_

No new business records are introduced; these are existing concepts and review records.

- **Account/session authority**: Current authenticated person and permitted personal operations, independent of team availability.
- **Workspace context/selection**: Requested workspace, current membership/grants, state and choices; selection is a request, not authority.
- **Navigation/presentation state**: Validated destination, active location, expanded/rail/drawer mode, language, theme and focus; distinct from private records.
- **Unsaved input**: Permitted in-memory changes and cancel/discard decision; no durable recovery implied.
- **Invitation acceptance context**: Bounded temporary proof for explicit recipient acceptance and safe invalid/lost-proof outcomes.
- **Verification record**: Attributable result/gap, tested artifact/environment, prerequisites, method, coverage and sanitized supporting evidence.
- **Completion claim**: Stable feature/subtask identifier, full contract, dependencies and evidence for completion or remaining work.

## Success Criteria _(mandatory)_

### Measurable Outcomes

These are acceptance targets, not achieved measurements. A blocked check leaves its outcome unverified.

- **SC-001**: All maintenance-help and invalid-selection cases return expected success/non-success, with zero database access or credential disclosure; preserved migration-safety checks and full required local verification pass on the recorded corrected source/environment.
- **SC-002**: All three app destinations work with matching active location/title and zero marketing composition, dead enabled destinations or fictional metrics; public/authentication layouts retain separate composition in every checked case.
- **SC-003**: Overview, Workspace and Personal account are each reachable from any app destination in at most three navigation activations, counting drawer/menu opening, by keyboard and pointer in expanded, rail and mobile modes. Workspace/account/language/theme/sign-out controls remain reachable at short height.
- **SC-004**: Every tested drawer open/dismiss/navigate/resize case preserves required focus and background blocking, with zero lingering overlays, scroll locks or hidden focus traps after closure/layout change.
- **SC-005**: Across at least 20 alternating workspace switches including rapid reversals, delayed responses, failure and revoked access, zero prior-workspace private records/actions appear in new or unresolved context and zero in-flight commands change targets.
- **SC-006**: Every direct unauthorized, foreign-workspace, revoked-membership/grant or disabled-capability case yields zero forbidden fields/effects. All personal-profile read/update/live cases remain usable when only workspace membership, capability or service availability is absent.
- **SC-007**: Every tested direct-entry, refresh, Back/Forward, sign-in-return and presentation-change case resumes the validated permitted destination with correct active state; every hostile/ambiguous return fails safely. Every cancelled discard preserves destination, workspace, preferences and input.
- **SC-008**: Every tested expiry, account switch, sign-out success/failure and page/history-restoration case conceals uncertain private content and reveals it only after current validation; zero cases report failed sign-out as success.
- **SC-009**: All invitation entry/exit, malformed/oversized proof and invalid-recipient cases produce zero implicit joins, forbidden disclosures or proofs in persistent storage, logs, analytics or return destinations; explicit valid acceptance retains existing gated authority rules.
- **SC-010**: All shell-owned visible/accessibility strings and required states have English/Arabic coverage across six language/theme combinations. At 390×844, 768×1024, 1280×800, 1440×900, short 1280×480, 320 CSS-pixel reflow and 200% zoom, both languages have reachable controls, visible focus and zero page-level horizontal overflow; human accessibility and fluent-Arabic reviews separately accept the journeys.
- **SC-011**: At least 95% of at least 20 warm-session navigations show the selected destination's usable content or accurate actionable unavailable state within two seconds on a documented device/network. Timing ends at visible usable content/state, not response arrival alone.
- **SC-012**: Every completion claim is attributable to current evidence, with zero unsupported marks or discrepancies between inventories, ledgers and totals. The final handoff names all remaining acceptance/prerequisite gaps and gives an explicit client-management readiness decision against unchanged dependencies.

## Assumptions

- The direct request for a **new** specification governs document placement. The brief's instruction to reuse Feature 005 still governs implementation: correct its existing shell without creating another shell or starting clients. Existing Feature 005 edits are preserved.
- This invocation creates only specification material and its active-feature pointer. It does not fix source, run runtime acceptance, update root completion or approve release. Future plans must reconcile this increment with Feature 005 rather than duplicate contracts or count work twice.
- Existing account holders and current Owner/Admin/Member policy are the actors. No new roles, authorization scheme, authentication method or workspace feature is introduced.
- The reported empty-help failure and previous full-suite/browser/performance claims are dated claims to reproduce, not observations made by this task. The cause remains unassigned until demonstrated.
- Reuse existing destinations, services, responsive navigation, localization, themes and shared design conventions. Correct only what existing contracts require; no redesign or new framework is justified.
- Online authority is required for protected operations. Protected persistent drafts remain disabled under existing gates; memory-only input may be lost on reload/closure.
- Browser/version/device policy remains owned by the existing decision process. Record actual coverage against the project's Chromium, Firefox and Safari/WebKit targets and name unavailable engines/devices rather than claiming universal support.

### Scope Boundaries

Included: verification-root-cause correction, desktop/mobile shell and real destinations, safe browser/presentation returns, unsaved-input cancellation, bilingual accessibility, account/workspace/invitation lifecycle integration, evidence and completion reconciliation.

Excluded: new business dashboards/analytics; clients, projects, tasks, time or finance; new search/timer/notification controls; protected browser drafts; new authentication/step-up or delivery capabilities; production access/activation, provisioning, deployment and external messages. Consumed capabilities retain their safeguards.

### Dependencies and Acceptance Boundaries

- **DEP-001 — Shell contract**: [Feature 005](../005-application-shell-sidebar/spec.md), its [navigation contract](../005-application-shell-sidebar/contracts/shell-and-navigation.md), [authority contract](../005-application-shell-sidebar/contracts/runtime-and-authority.md), plan, tasks and evidence are inputs. Preserve existing targets and reconcile completion using current evidence.
- **DEP-002 — Identity/workspace gates**: [Feature 004](../004-workspace-platform-and-authorization/spec.md) owns upstream identity/tenant behavior and G1–G6 evidence. Missing hosted compatibility, approved policy, reauthentication, delivery, real isolation and release evidence stays open; this increment neither approves nor activates it.
- **DEP-003 — Isolated verification**: Real browser/authority tests require authorized synthetic accounts, two distinguishable workspaces, a non-member, role/grant fixtures, zero/one/many choices including more than one displayed page, and an isolated target. Missing prerequisites block dependent checks; independent corrections continue with gaps visible.
- **DEP-004 — Presentation/human review**: [DESIGN.md](../../DESIGN.md), [UX/localization](../../docs/product/ux-and-localization.md) and the [test strategy](../../docs/quality/test-strategy.md) govern reuse/accessibility. Human accessibility and fluent-Arabic acceptance require actual reviewers.
- **DEP-005 — Security/release evidence**: The [security controls](../../docs/security/vulnerability-catalogue.md) and [release gate](../../docs/security/release-checklist.md) require affected negative cases, named owners and fresh exact-version advisory review during implementation/release. Historical scans and this spec pass no gate.
- **DEP-006 — Root contracts**: The [root plan](../../plan.md) owns F04.01 and NEXT-01–06 dependencies. Shell acceptance covers only part of NEXT-04; broader commands, duplicate/lost-reply/revision/recovery proof and upstream authorization remain separate. NEXT-05 depends on full NEXT-04. No broader dashboard/search/timer/notifications, delivery, recovery or release feature is completed by implication.

Source surfaces, security-control ownership and baseline references are retained in the [quality checklist's planning handoff](checklists/requirements.md#planning-handoff). They guide planning without asserting implementation results.
