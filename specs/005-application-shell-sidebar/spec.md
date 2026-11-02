# Feature Specification: Application Shell and Sidebar Navigation

**Feature Branch**: `main` (current checkout; no branch hook configured)
**Feature**: `005-application-shell-sidebar`
**Created**: 2026-11-01
**Status**: Draft — ready for planning; implementation and release acceptance pending
**Input**: User brief: “Application Shell and Sidebar Navigation.” Cover F04.01 and only the application-shell portion of NEXT-04 in [the root roadmap](../../plan.md).

Give authenticated people a focused daily workspace with a sidebar, compact application header and useful content area. Retain SoloDesk's visual identity while clearly separating work from the public website. This feature supplies navigation and truthful starting screens; it does not complete the business dashboard or the remainder of NEXT-04.

## User Scenarios & Testing _(mandatory)_

All stories are required. Priority orders delivery, not permission to omit accessibility, localization or security. Each independent test exercises that story's behavior without requiring unfinished business modules.

### User Story 1 - Find a working destination in the application (Priority: P1)

As an authenticated person, I can enter SoloDesk's application, identify my current page and workspace, and reach the existing functions without marketing content interrupting my work.

**Why this priority**: Establishes the smallest useful daily application experience.
**Independent Test**: Open the app entry point, visit Overview, Workspace and team, and Personal account, then refresh and use browser back/forward. Compare public and sign-in/sign-up pages separately.

**Acceptance Scenarios**:

1. **Given** a valid account session, **When** I open `/app`, **Then** I see Overview inside the application shell, with a sidebar on wide screens, compact header and main content area; public landing navigation, promotional calls to action, newsletter and marketing footer are absent.
2. **Given** any supported authenticated app destination, **When** I navigate, follow a direct link, refresh or use browser back/forward, **Then** its content, current-page title and active navigation agree and the shell remains consistent.
3. **Given** the application navigation, **When** I activate the brand, an enabled destination or the public-website account-menu link, **Then** I reach app home, that working destination or the public website respectively; no enabled item leads to a placeholder.
4. **Given** Overview, **When** I inspect its content, **Then** I see account/current-workspace context and useful links to implemented functions, with genuine empty/unavailable states and no invented business records or statistics.
5. **Given** the public website or an authentication-entry page, **When** I open it directly or from the app, **Then** it retains its existing page composition outside the sidebar shell.

### User Story 2 - Change workspace without mixing team data (Priority: P1)

As a member of several teams, I can select the workspace I intend to use and trust that all displayed team information and actions belong to that workspace.

**Why this priority**: A shell that carries old team data into a new context risks privacy and wrong-team actions.
**Independent Test**: Use two synthetic workspaces with visibly distinct names, members and invitations. Delay one response, switch repeatedly, revoke access and force a selection failure; inspect displayed information and attempted actions.

**Acceptance Scenarios**:

1. **Given** several authorized workspaces, **When** I open the switcher in expanded, collapsed or narrow navigation, **Then** I can identify the current selection and reach every available workspace, including those beyond the initially shown choices.
2. **Given** workspace A is selected, **When** I request B, **Then** pending feedback appears, A's content and actions are concealed, and B appears only after current access to B is confirmed.
3. **Given** a delayed A response or an existing team subscription, **When** B becomes current, **Then** A's late result cannot appear in B, its subscription is stopped, and old members, invitations, privileged actions, open menus and team form state are cleared.
4. **Given** selecting B fails, **When** the failure is shown, **Then** no success is announced and no B actions become usable; I can retry or explicitly return to A after its access is revalidated.
5. **Given** the selected workspace becomes inaccessible, **When** context is checked on entry, return to the app or a protected interaction, **Then** its data/actions are withheld, the stale selection is cleared, and I am offered authorized workspace choices and personal-account access without silently targeting another team.
6. **Given** changed, unsent team form input, **When** I request a switch, **Then** I can cancel and retain the input or explicitly discard it before switching; an in-flight action keeps its original team target and cannot be retargeted to the new selection.

### User Story 3 - Continue account, team and invitation journeys (Priority: P1)

As an account holder, I can manage my personal profile separately from team administration and continue the workspace functions already available to my account.

**Why this priority**: Navigation is only useful when it preserves existing journeys and works without a team.
**Independent Test**: Exercise personal name editing, team creation/selection/settings, permitted membership and invitation operations, and explicit invitation acceptance. Repeat personal-account access with no memberships and with workspace service failure or capability disablement.

**Acceptance Scenarios**:

1. **Given** an authorized account, **When** I open Personal account, **Then** I can read and update my own profile using the existing validation, feedback and live-update behavior; workspace membership is not required.
2. **Given** workspace functions are enabled and available, **When** I use Workspace and team, **Then** creation, selection, settings, invitations, member management and leaving remain available only as allowed by current permissions and capability gates, with their existing confirmations and safeguards.
3. **Given** a successful workspace-list response with zero memberships, **When** I enter the app, **Then** I see explicit no-workspace guidance, a working create action where permitted, instructions to use a received invitation to join, and access to personal settings.
4. **Given** workspace functionality is disabled or its service fails, **When** I open Overview or Personal account, **Then** personal functions remain usable while workspace areas explain disabled/unavailable status; a failed list is never described as no memberships.
5. **Given** the intended authenticated recipient opens a current invitation, **When** its acceptance prompt appears, **Then** joining occurs only after explicit acceptance; dismissing, navigation or shell initialization grants no membership.
6. **Given** a wrong-recipient, expired, revoked, superseded, malformed or unusable invitation, **When** I attempt acceptance, **Then** I receive safe localized recovery guidance without new access or disclosure of another team's records.
7. **Given** I open an invitation while signed out, **When** sign-in is required, **Then** invitation proof is excluded from the sign-in destination and return information; after signing in I am guided to reopen the original invitation rather than being promised automatic acceptance or retained proof.

### User Story 4 - Retain privacy through denied access and session changes (Priority: P1)

As an account holder, I can trust the app to withhold protected content when authority is missing and to tell me whether sign-out actually succeeded.

**Why this priority**: Navigation must not become an alternative authorization mechanism or retain another identity's private information.
**Independent Test**: Attempt restricted direct destinations and underlying operations with non-member, lower-role, expired, revoked and banned identities. Test successful and failed sign-out and restore an older page from browser history.

**Acceptance Scenarios**:

1. **Given** no valid session, **When** I open any protected app destination, **Then** protected content is withheld and I am directed to sign in; a supported non-sensitive internal destination can be resumed safely after authentication.
2. **Given** a forged selection, foreign workspace identifier or insufficient role, **When** I bypass the sidebar and open a restricted destination or invoke its underlying read/action directly, **Then** no forbidden fields or effects are returned; the page gives safe restricted/unavailable guidance and permitted navigation.
3. **Given** session expiry, revocation or account change while the app is open, **When** the next protected interaction or context recheck occurs, **Then** stale content is concealed, old subscriptions/transient private state are discarded, and further protected actions require current authority.
4. **Given** a valid session, **When** sign-out succeeds, **Then** I leave the protected application and browser back/forward or an old tab cannot restore protected content without a fresh check.
5. **Given** sign-out fails, **When** the result is shown, **Then** the app reports failure with retry guidance, does not claim I am signed out, and rechecks authority before revealing protected content again.
6. **Given** an account-authority outage, **When** the application attempts to establish access, **Then** it shows an unavailable/retry state without private data, an invented signed-out success or an empty-workspace claim.

### User Story 5 - Navigate comfortably on desktop, tablet and phone (Priority: P2)

As a keyboard or pointer user, I can navigate at my current screen size without losing essential controls or the current workspace.

**Why this priority**: Daily application navigation must remain usable beyond one desktop size.
**Independent Test**: Exercise expanded/collapsed navigation and the modal drawer with pointer and keyboard at phone, tablet and desktop sizes, a short desktop viewport, 320 CSS pixels and 200% zoom.

**Acceptance Scenarios**:

1. **Given** a wide layout on first use, **When** I enter the app, **Then** the sidebar is expanded by default; a discoverable labeled toggle collapses it to an icon rail and expands it again without losing the active destination.
2. **Given** the icon rail or a short viewport, **When** I navigate by keyboard or pointer, **Then** destinations have accessible names, icon labels are available on focus and hover, and scrolling keeps all navigation and account controls reachable.
3. **Given** a narrow layout, **When** I activate the labeled header menu button, **Then** a modal drawer opens, contains focus, blocks background interaction and keeps workspace/account controls reachable.
4. **Given** an open drawer, **When** I press Escape or dismiss it, **Then** it closes and focus returns to the opener; when I select a destination it closes and focus moves sensibly to that destination's content.
5. **Given** an open drawer or collapsed sidebar, **When** I resize or zoom across layouts, **Then** no hidden navigation retains focus or blocks the page, controls remain operable and the current workspace stays discoverable.
6. **Given** expansion state is remembered, **When** that preference is missing, invalid, unavailable or tampered with, **Then** navigation remains usable, only presentation can change and no stored value grants team access or reveals protected records.

### User Story 6 - Work in either language and every supported theme (Priority: P2)

As an English- or Arabic-speaking person, I can use the same app journeys with readable content, predictable focus and my chosen appearance.

**Why this priority**: Bilingual access and shared appearance are required parts of the SoloDesk experience.
**Independent Test**: Repeat the navigation and state journeys in English and Arabic across Light, Dark and System, with long mixed-direction names, reduced motion, keyboard-only use and screen-reader review.

**Acceptance Scenarios**:

1. **Given** any supported app destination, **When** I change language or theme from inside the app, **Then** I remain at the equivalent destination with the same authorized workspace, and all labels, headings, accessible names and state messages match the selected language.
2. **Given** Arabic, **When** I open expanded or narrow navigation, **Then** the sidebar/drawer is on the right, directional navigation is appropriately mirrored, and mixed-script names, emails and identifiers remain readable with coherent reading and keyboard order.
3. **Given** keyboard or screen-reader navigation, **When** I use the skip link, landmarks and destination links, **Then** I can reach main content, hear the active page and understand menus without relying on icons, color or hover alone; focus remains visible and unobscured.
4. **Given** long labels, a 320 CSS-pixel viewport or 200% zoom, **When** I navigate or open menus, **Then** essential controls and labels remain reachable without page-level horizontal scrolling or clipped actions.
5. **Given** Light, Dark or System and reduced-motion preferences, **When** I use the app, **Then** it retains the shared monochrome identity, readable hierarchy and focus treatments; System follows the device appearance and reduced motion avoids unnecessary movement.

### Edge Cases

- Missing, stale or tampered workspace selection never authorizes access. Missing selection offers choices; a revoked selection does not silently choose a different team for a pending action.
- A successful empty workspace list, loading, disabled capability, unavailable service and restricted workspace are separate states. Partial member/invitation failures must not become “no members” or “no invitations.”
- A large workspace list remains navigable beyond its first page; an empty later page does not imply the account has no workspaces.
- A capability or grant changes while a menu or form is open: affected controls become unavailable on the next current-authority check, and direct execution remains denied.
- Rapid A → B → A selection, out-of-order reads, delayed mutations and browser history restoration cannot mix workspace context or resurrect stale private views.
- Session expiry while a drawer is open closes private menus and withdraws protected content; no stale overlay traps the sign-in/retry flow.
- Invitation arrival at initial entry or during app navigation still requires explicit acceptance. Invalid fragment encoding yields safe guidance; proof is never copied into navigation or preference return information.
- Dismissing/reloading a scrubbed invitation loses its in-memory proof; explain how to reopen the original link without persisting it.
- Changed form input remains in memory on recoverable validation/request failure. In-app navigation offers cancel/discard before losing changes; reload/closure loss is disclosed, with no claim of saved browser drafts.
- Long Arabic/English team names, combining marks, emails and identifiers must not conceal the menu, workspace selector, sign-out or page heading.
- A missing or unsupported destination offers safe recovery to Overview or Personal account, without a fabricated module or disclosure of restricted record existence.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Every authenticated app destination MUST share a dedicated sidebar/header/main composition, visibly distinct from the public website and using available content width with consistent page headings, descriptions, actions and spacing.
- **FR-002**: The shell MUST exclude public landing navigation, marketing hero/promotional content, newsletter and marketing footer. Public and authentication-entry pages MUST retain their existing layouts outside the shell.
- **FR-003**: Navigation MUST provide an accessible SoloDesk app-home link, current workspace/switcher, Overview, Workspace and team, Personal account, and an account menu containing sign-out and a public-website link. Personal settings MUST be separate from workspace administration.
- **FR-004**: Every enabled destination or control MUST perform working behavior. Unfinished business modules, search, notifications, timer and synchronization MUST have no dead or misleading controls. Later working modules must be addable without replacing the shared shell.
- **FR-005**: Overview MUST show truthful account/workspace context, links to implemented functions, and genuine empty/unavailable states; fictional metrics, records, charts and counts MUST NOT appear as real data or as a completed business dashboard.
- **FR-006**: The header MUST identify the current page, use breadcrumbs where a real hierarchy benefits orientation, and keep the current workspace discoverable on mobile and with collapsed navigation. The active destination MUST be visually and programmatically identified.
- **FR-007**: The existing `/app` entry point, presentation conventions, valid links, authentication transitions and invitation entry behavior MUST remain compatible. Supported app destinations MUST survive direct entry, refresh and browser back/forward; sign-in resumption MUST accept only supported non-sensitive internal destinations.
- **FR-008**: Wide layouts MUST initially show an expanded persistent sidebar with a discoverable keyboard-accessible collapse/expand toggle. Icon-only controls MUST have accessible names and destination labels available on focus and hover; short screens MUST permit access to the full navigation.
- **FR-009**: Narrow layouts MUST use a modal navigation drawer opened by a labeled header menu button, with focus containment, blocked background interaction, Escape/dismissal, restoration of focus on dismissal and closure after navigation. Resizing MUST remove obsolete overlays and preserve usable focus.
- **FR-010**: All shell functions MUST remain usable on phone, tablet and desktop, at 320 CSS-pixel reflow and 200% zoom, including long names and labels, without page-level horizontal scrolling or inaccessible essential controls.
- **FR-011**: Language and Light/Dark/System controls MUST be reachable within the app and preserve the current destination and authorized workspace. System appearance MUST follow device preference without changing app context.
- **FR-012**: Navigation, headings, menus, loading/error/empty states and accessible labels MUST have complete English and Arabic coverage. Arabic navigation MUST start on the right, mirror appropriate directional indicators and preserve readable mixed-direction content and coherent keyboard/reading order.
- **FR-013**: The app MUST retain the shared monochrome appearance, existing heading/body font behavior, component variants, borders, corner shapes and visible focus treatments. It MUST use compact readable hierarchy without oversized marketing headings or distracting effects.
- **FR-014**: The shell MUST provide navigation/header/main landmarks, a working skip link, active-page announcements, accessible menu names, sensible focus after navigation and reduced-motion behavior, with visible unobscured focus and keyboard alternatives to pointer-only interaction.
- **FR-015**: Current workspace identity and the switcher MUST remain reachable in expanded, collapsed and drawer layouts. Workspace choices MUST include only currently permitted workspaces and allow access beyond the first displayed group.
- **FR-016**: Switching MUST verify current access to the requested workspace, show pending/failure feedback and withhold old team content/actions while the new context is unresolved. Failure MUST offer retry or an explicitly revalidated return to the prior workspace without a false success.
- **FR-017**: On a switch or loss of authority, prior team views, members, invitations, privileged actions, open menus, transient form state and any team subscriptions MUST be cleared or disposed of. Late responses MUST NOT populate a different workspace; in-flight commands MUST retain their original target.
- **FR-018**: The app MUST distinguish account/context loading, no workspace selection, a successful empty membership list, disabled workspace capability, inaccessible selection, workspace service failure and populated context, with localized next actions and no private data before authority is established.
- **FR-019**: Inaccessible selections MUST be cleared and the user offered currently authorized choices without silently retargeting work. When no memberships exist, the app MUST offer permitted creation, received-invitation guidance and personal settings.
- **FR-020**: Existing workspace creation/selection/settings, invitation lifecycle, member management/leave and gated ownership behavior MUST remain usable through suitable destinations, retaining validation, confirmations, role ceilings and last-owner safeguards. This feature MUST NOT introduce parallel business behavior or activate unsupported functions.
- **FR-021**: Personal profile read/update/live behavior MUST remain available to its authorized account independently of workspace membership, workspace capability disablement or workspace service failure. Team operations MUST NOT change ownership of personal data.
- **FR-022**: Invitations MUST retain explicit recipient acceptance. Shell startup, opening a link and ordinary navigation MUST NOT join a team. Invalid, expired, consumed, revoked, superseded and wrong-recipient proofs MUST grant no authority and expose no forbidden team/account details.
- **FR-023**: Invitation proof MUST be removed from the visible address/history upon handling, retained only as needed for the in-memory acceptance flow and excluded from logs, analytics, persistent browser storage and redirect/return information. Signed-out or lost-proof journeys MUST explain signing in and reopening the original invitation; malformed proof MUST fail safely.
- **FR-024**: All protected pages, reads and actions MUST require current account and workspace/resource/action authority at execution. Sidebar visibility, requested workspace identifiers and remembered selection MUST NOT grant access; unauthorized direct access MUST return no forbidden fields or effects.
- **FR-025**: Account/workspace information MUST remain isolated from shared public responses and from another account's or workspace's views. Only information needed for the current shell/destination may be disclosed; secrets and invitation proofs MUST NOT appear in ordinary navigation data.
- **FR-026**: Session expiry/revocation, sign-out and identity changes MUST conceal protected views and discard private transient state/subscriptions; protected interaction and returning/restoring the app MUST recheck current authority. Successful sign-out MUST prevent history restoration of private content without revalidation; failed sign-out MUST offer retry without claiming success.
- **FR-027**: Existing capability restrictions MUST remain effective on direct execution as well as in navigation. This feature MUST NOT enable credentials, invitations, ownership transfer or other gated functionality to demonstrate the shell; a narrower disabled capability MUST NOT unnecessarily block permitted personal functions.
- **FR-028**: Loading and failures MUST have localized feedback and a usable next action. Permission/service errors MUST NOT masquerade as an empty list, completed save, selected workspace, invitation delivery or successful sign-out.
- **FR-029**: Changed, unsent form input MUST survive recoverable errors in memory. In-app navigation or switching that would discard it MUST offer cancel/discard first, disclose reload/closure loss, and never claim persistent browser saving.
- **FR-030**: Sidebar expansion state, if remembered, MUST be presentation-only and contain no protected team records, invitation proofs, roles or authorization claims; inability to remember it MUST NOT prevent navigation.
- **FR-031**: Acceptance evidence MUST distinguish automated checks, actual authenticated browser journeys, manual keyboard/screen-reader/zoom/contrast review, fluent-Arabic review and release verification. Missing, failed, unavailable, simulated or stale checks MUST remain explicit gaps; no roadmap completion may be claimed for unimplemented or unverified behavior.

### Key Entities _(include if feature involves data)_

These describe existing information and presentation context, not new business records.

- **Account/session**: The person using the app and their current authority; personal profile and presentation preferences remain independent of team membership.
- **Workspace context**: Current authorized workspace identity, membership and allowed actions; displayed consistently wherever team work is performed.
- **Workspace selection**: A requested team convenience, revalidated before use; contains no independent authority.
- **Navigation destination**: Working app location, localized name, active state and any current access restriction; personal and team destinations have distinct responsibilities.
- **Navigation presentation**: Expanded/collapsed wide navigation or open/closed narrow drawer, separate from protected records.
- **Invitation acceptance context**: Temporary proof and acceptance outcome for the intended recipient, following the existing invitation lifecycle and privacy rules.

## Success Criteria _(mandatory)_

### Measurable Outcomes

These are acceptance targets, not measurements already achieved. Use synthetic accounts in two distinct teams plus a non-member, existing Owner/Admin/Member permissions, zero/one/many memberships and lists exceeding one displayed group.

- **SC-001**: In all navigation acceptance cases, 100% of enabled app destinations open working content with matching active navigation/title; public and authentication-entry pages retain their separate layouts, and the app contains zero marketing sections, dead controls or fictional business metrics.
- **SC-002**: From any app destination, Overview, Workspace and team, and Personal account are each reachable in at most three navigation activations, including opening a drawer or menu, using either keyboard or pointer. Workspace selection, language, theme, public website and sign-out remain reachable in every navigation mode.
- **SC-003**: Across at least 20 alternating workspace switches including rapid reversals, delayed responses, failed selection and revoked access, zero prior-team member/invitation records or privileged actions appear in the new or unresolved context, and zero commands change their original target.
- **SC-004**: All tested empty, loading, disabled, restricted, unavailable and expired-session cases show their correct state and a working next action; 100% of personal-profile read/update cases remain usable when only workspace functionality is disabled or fails.
- **SC-005**: All permitted existing account/team/invitation journeys pass with applicable capabilities enabled in an isolated environment; every tested disabled, wrong-recipient, foreign-team or insufficient-role attempt yields zero unauthorized information or effects. Unproven capability activation remains blocked rather than counted as a pass.
- **SC-006**: In every drawer/collapse case, keyboard and pointer reach the same destinations; Escape/dismissal restores focus, navigation closes the drawer, background interaction is blocked while modal, and resizing leaves zero trapped-focus or invisible-overlay cases.
- **SC-007**: Every shipped shell label/state is reviewed in English and Arabic across Light, Dark and System; all six language/theme combinations preserve destination and authorized workspace, with no untranslated shell text or unreadable mixed-direction fixture.
- **SC-008**: At 390×844, 768×1024, 1280×800, 1440×900, a short 1280×480 viewport, 320 CSS-pixel reflow and 200% zoom, both languages retain reachable essential controls, visible focus and zero page-level horizontal overflow. Manual screen-reader and fluent-Arabic review must separately accept the primary journeys.
- **SC-009**: In all invitation entry/navigation, sign-out success/failure, expiry and history-restoration cases, zero invitation proofs appear in persistent storage, logging/analytics or return information, and zero protected views are restored without current authority.
- **SC-010**: In a recorded warm-session trial of at least 20 navigation attempts on a documented test device/network, at least 95% show the selected destination's usable heading/content or an accurate actionable unavailable state within two seconds. This does not permit masking service failure as successful navigation.

## Assumptions

- This is a specification-only change. No application behavior, capability, release approval or root-roadmap completion is produced here.
- The audience is authenticated SoloDesk account holders using the current Owner/Admin/Member slice. This feature does not introduce new roles or change approved membership policy.
- The smallest useful information structure is Overview, Workspace and team, and Personal account. Exact child addresses, any useful breadcrumbs and the responsive breakpoint are planning decisions; `/app` remains the entry to Overview.
- Retain a previously selected workspace only after revalidation. With no valid selection, offer current choices; do not silently switch a revoked selection to another team. Personal-account access does not depend on choosing a workspace.
- Desktop navigation starts expanded when no presentation preference exists. Cross-visit persistence is optional; there is no requirement to create a new preference service.
- Online access is required for trusted account/team reads and changes. This feature adds no protected offline storage or background-execution promise. Existing unsent input may remain only in memory with explicit loss limits.
- Invitation proofs are not carried through sign-in or preference changes. Reopening the original link after sign-in or proof loss is the safe existing recovery model; it does not require a new invitation-delivery capability.
- Accessibility, bilingual coverage and all appearance modes are required even where their stories follow the initial navigation work. Automated translation parity or markup checks alone cannot approve them.

### Scope Boundaries

Included: the application shell, working navigation, minimal Overview, integration of existing account/workspace journeys, safe context/session states, responsive navigation and bilingual accessible appearance.

Excluded: business dashboards/analytics; Clients, Projects, Tasks, Time, billing or reporting modules; global search/command palette; notification delivery; timer/synchronization features; protected browser drafts; new authentication capabilities; invitation-worker completion; production provisioning or deployment. Only the shell portion of F04.01/NEXT-04 is addressed; command/recovery/draft work in NEXT-04 and the full personal dashboard remain separate.

### Dependencies and Evidence Boundaries

- **DEP-001 — Existing identity and account authority**: Reuse current account/profile behavior and capability policy. Feature 004's G1–G6 hosted identity, approved recovery/reauthentication, delivery and release evidence remain open where not freshly demonstrated. Shell requirements cannot approve those capabilities.
- **DEP-002 — Current team authority**: Existing workspace creation, settings, memberships, invitations and selection are integration dependencies, not completed release proof. Affected direct-access denial, revocation and team-isolation checks require real isolated evidence before acceptance of enabled team journeys.
- **DEP-003 — Honest state and profile integration**: Source inspection on 2026-11-01 found workspace controls on `/app`, no rendered personal-profile editor there, and swallowed workspace-loading errors. The existing profile capability must become reachable and failures must remain distinct from empty membership lists under FR-018/021/028.
- **DEP-004 — Capability enforcement and delivery**: Feature 004's capability definitions, service enforcement and written gate summaries require reconciliation before relying on enabled invitation/ownership journeys. Existing delivery, reauthentication and invitation-worker gaps remain owned by that feature; this shell must preserve restrictions and expose truthful unavailable states.
- **DEP-005 — Links and presentation**: Current supported destinations and preference returns are limited. Planning must extend compatible app destinations without widening unsafe redirects or carrying invitation proof; new child destinations must preserve ordinary navigation and appearance changes.
- **DEP-006 — Shared design and human review**: The [design system](../../DESIGN.md) and [UX/localization contract](../../docs/product/ux-and-localization.md) govern shared appearance and accessibility. Existing contrast gaps, fluent-Arabic review and actual keyboard/screen-reader/device checks are not closed by this specification.
- **DEP-007 — Reliable evidence and release review**: [Feature 004 evidence](../004-workspace-platform-and-authorization/evidence.md) and its browser summaries contain conflicting claims. Mocked service checks, source assertions, anonymous page requests and schema self-checks do not prove authenticated journeys, concurrency, delivery or real isolation. Require attributable current evidence under the [security release gate](../../docs/security/release-checklist.md), including fresh dependency/deployed-version advisory review for the implementation/release. No scans or runtime acceptance were performed in this specification step.

Independently testable shell work may proceed while affected team capabilities remain gated. These dependencies do not declare Feature 004 complete or require this feature to finish its excluded operations. The [quality checklist's planning handoff](checklists/requirements.md#planning-handoff) preserves source observations and technical constraints for the next phase without prescribing implementation here.
