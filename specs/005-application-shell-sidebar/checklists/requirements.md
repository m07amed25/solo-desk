# Specification Quality Checklist: Application Shell and Sidebar Navigation

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-11-01
**Feature**: [spec.md](../spec.md)
**Review Ownership**: Requirements-quality review maintained by `$speckit-specify` and `$speckit-clarify`.
**Marker Semantics**: `[x]` means the requirement-quality criterion was reviewed and satisfied; it does not mean implementation or release acceptance passed.

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Items marked incomplete require spec updates before `$speckit-clarify` or `$speckit-plan`.
- Validation completed on 2026-11-01: 16/16 requirements-quality items satisfied; no clarification markers. Coverage review added an explicit conditional presentation-preference scenario (US5.6). Runtime behavior and Feature 004 release gates have not been tested in this specification step.
- The “meets measurable outcomes” item evaluates whether the requirements define a verifiable path to those outcomes; no outcome is asserted as achieved.
- `/app`, language/theme choices, privacy rules and capability restrictions in the spec are user-facing compatibility/behavior constraints. Technical constraints and source observations are kept below for planning.
- A preservation fingerprint check detected a concurrent change to the pre-existing untracked `components/workspace-panel.tsx`; this workflow did not write that file. Its refreshed source still supports the state-cleanup observations below. Other pre-existing changed files matched the captured baseline at that check; no unrelated edits were reverted.

### Requirement Coverage Review

| Requirements | Acceptance coverage | Outcomes |
| --- | --- | --- |
| FR-001–007 | US1.1–5; US4.1; US6.1 | SC-001/002/007/010 |
| FR-008–010 | US5.1–5; US6.4 | SC-002/006/008 |
| FR-011–014 | US6.1–5 | SC-007/008 |
| FR-015–019 | US2.1–6; US3.3–4; state edge cases | SC-002/003/004 |
| FR-020–023 | US3.1–7; invitation/lost-proof edge cases | SC-004/005/009 |
| FR-024–028 | US2.5; US3.2/4/6; US4.1–6 | SC-003/004/005/009 |
| FR-029–030 | US2.6; US5.1/6; unsent-input edge case; presentation-only preference constraint | SC-003/006/009 |
| FR-031 | Story independent tests; DEP-001–007; evidence requirements below | SC-001–010; missing checks remain gaps |

### Planning Handoff

This is input to `$speckit-plan`, not an implementation plan or additional feature specification. Keep technical choices out of the stakeholder requirements. No application code, test fixtures, migrations, dependencies, exports or root `plan.md` were changed by specification work. The intended changes are `spec.md`, this checklist and the active feature pointer at `.specify/feature.json`.

**Preserved constraints from the supplied brief**:

- Preserve Next.js/React, shadcn/ui with Base UI, semantic Tailwind, next-intl, Neon PostgreSQL and Better Auth; follow [architecture](../../../docs/architecture/overview.md), [patterns](../../../docs/architecture/design-patterns.md), [privacy](../../../docs/architecture/security-and-privacy.md), [constitution](../../../.specify/memory/constitution.md) and [DESIGN.md](../../../DESIGN.md).
- Inspect installed/version-compatible docs and existing components before choosing official `@shadcn` Sidebar and compatible Sheet, Breadcrumb, DropdownMenu, Tooltip and Skeleton as needed. The inspected UI directory already has DropdownMenu/Skeleton; Sidebar/Sheet/Breadcrumb/Tooltip were not present. Existing `components.json` selects Base UI's `base-nova` style and has `rtl: false`; generated component behavior needs deliberate RTL review, not a global primitive replacement.
- Read relevant installed `node_modules/next/dist/docs/` guides before writing Next.js code. Choose the smallest reusable authenticated-route boundary; public/auth pages must remain outside it. Settle compatible child routes during planning rather than treating this specification's destination names as exact addresses.
- Keep trusted session/workspace reads and authorization server-side; client state is for interactive shell behavior. Reuse authorized services and existing controls. Avoid duplicate context/session loaders, unnecessary requests, broad private caching and new generic navigation/plugin frameworks.
- Do not add tables, dependencies or preference/browser-draft infrastructure without a concrete unmet requirement. Presentation-only expansion state can use existing conventions. Protected browser persistence remains disabled; this feature does not complete Q-06/Q-07 or the command/recovery portions of NEXT-04.
- Reuse existing capability gates without treating their names or written summaries as proof of effective enforcement. Do not enable credentials, invitations or ownership changes to demonstrate navigation. Invitation-worker completion, provider-policy approval and production operations remain outside this feature.

**Inspected source and affected surfaces for planning**:

| Surface | Observation on 2026-11-01 / required planning follow-through |
| --- | --- |
| `app/(site)/[locale]/[theme]/app/page.tsx` and `loading.tsx` | `/app` renders public `SiteHeader`, a narrow account-style main, and workspace/invitation controls. `loadProfile` gates access but `LiveProfile` is not rendered. Workspace exceptions are swallowed; an inaccessible selection may fall back to the first listed workspace. Integrate shell/loading states, expose profile, and replace misleading empty/fallback behavior rather than carrying it forward. |
| `components/site-header.tsx`, `site-header-auth.tsx` | Public navigation and preference forms exist. Header sign-out redirects in `finally`; it does not establish failure handling equivalent to `LiveProfile`. Keep public composition intact while app sign-out satisfies FR-026. |
| `components/workspace-panel.tsx`, `app/workspace-actions.ts`, `lib/workspaces.ts`, `app/api/workspaces/` | Existing create/select/settings/invite/member/leave/transfer services and controls are reuse targets. Selection revalidates context then sets `solodesk_workspace_id`; the panel reloads after selection. Initial member/invitation effects have cleanup flags, while manual refresh paths lack equivalent current-context protection and do not clear old lists first. Validate all old-response/state boundaries when integrating; no additional workspace subscription is assumed. |
| `components/workspace-invitation.tsx` | Reads `#invitation=...`, scrubs it with history replacement and requires an accept action. Decoding has no malformed-input recovery. Current mounting is inside the workspace-enabled account branch; planning must consider fragment privacy while account/workspace context is pending, unavailable, disabled or signed out, as well as arrival during navigation. |
| `lib/auth/capabilities.ts`, workspace services and invitation dispatcher | Public capability definitions use `SOLODESK_AUTH_CREDENTIALS_ENABLED`, `SOLODESK_WORKSPACES_ENABLED`, `SOLODESK_WORKSPACE_INVITES_ENABLED`, `SOLODESK_OWNERSHIP_TRANSFER_ENABLED`. Inspected invitation services primarily check the workspace gate; `verifyFreshReauth` uses `SOLODESK_REAUTH_DISABLED` plus session timestamps. Some Feature 004 prose names a different invitation flag and claims stronger default-off behavior. Reconcile effective gates before relying on them; declaring the shell ready must not close this dependency. |
| `lib/auth/server.ts`, `lib/profile.ts`, `app/actions.ts`, `app/api/profile/route.ts`, `components/live-profile.tsx` | Current identity and personal-profile service/live behavior exist independently of workspace membership. Preserve their validation, scoped projection, private state, error handling and subscription cleanup; moving the entry UI must not duplicate authority. |
| `lib/site.ts`, `proxy.ts`, `app/api/preferences/route.ts`, auth entry/callback | Supported return paths are currently only `/`, `/sign-in`, `/sign-up`, `/app`; proxy rejects other page paths, preferences validate that same set, and successful callback returns to `/app`. Child destinations require coordinated route/allowlist/return handling and denial tests, not arbitrary return URLs. Preserve empty-fragment signed-out invitation redirects. |
| Locale/theme root layout, `i18n/request.ts`, `messages/en.json`, `messages/ar.json`, fonts/CSS and `components/ui/` | Reuse current localized presentation rewrites, font roles, Light/Dark/System behavior and semantic sidebar tokens. Some reused workspace content is hardcoded English and some design contrast pairs remain open; translation-key parity alone does not accept the integrated shell. |
| Root `plan.md`, F04.01 and NEXT-04 | Source inventory is useful but its claim that `/app` contains a profile editor differs from inspected rendering. The roadmap explicitly calls Feature 004 evidence conflicting. Leave completion unchanged until implementation and applicable verification establish the actual behavior. |

**Feature 004 evidence limitations**:

- Its [specification](../../004-workspace-platform-and-authorization/spec.md), [evidence ledger](../../004-workspace-platform-and-authorization/evidence.md) and [browser summary](../../004-workspace-platform-and-authorization/browser-results.md) mix planning history, implementation claims and open gates. Preserve canonical G1–G6 definitions; do not inherit broader pass claims without artifacts.
- `scripts/test-workspaces.test.mjs` loads services with mocked session/database adapters. `scripts/test-workspaces-browser.mjs` performs anonymous HTTP/markup and source-pattern assertions; it does not drive an authenticated browser through team interactions, focus or zoom. `scripts/test-workspaces-postgres.mjs --self-check` checks migration source text; its integration path does not establish the full tenant/revocation/concurrency journeys required here. Reading these runners is not executing them.
- No tests, security scans, hosted authentication, real database, mailbox, load, restore or browser interaction were run for this specification. Historical audit counts and advisory triage are not refreshed or accepted as clean. Real isolated environment proof, current dependency/deployed-version review and required human review remain gaps.

**Security controls to assign and verify during planning/implementation** (accountable roles below are proposed ownership, not a signed approval):

| Applicable controls | Accountable role | Concrete required evidence |
| --- | --- | --- |
| SEC-002/005/006/008 | Identity engineering + Security | Current/expired/revoked/banned sessions, cross-origin selection/profile/sign-out attempts, failed sign-out, history/stale-tab checks, and disabled step-up denial. |
| SEC-009–015 | Workspace engineering + QA | Direct lower-role/non-member and foreign-ID reads/actions, revoked selection, denied invitation/ownership operations, no forbidden fields or effects; preserve role ceilings and last-owner invariants. |
| SEC-023/025/027–029 | Web engineering + Security | Malformed invitation fragments, long/mixed-direction hostile names rendered inert, exact-origin preference handling, bounded internal returns, safe sign-in resumption and identity/team cache isolation. |
| SEC-031/044/048/062 | Web engineering + Security | Only presentation state persisted; no proof/secrets/private records in stores, logs, analytics, navigation payloads or redirect information; sign-out/private-state disposal. |
| SEC-041/042 | Workspace engineering + Operations | Existing restricted-role, current-authority and alternating-tenant pool-isolation evidence for services the shell consumes; mocks are insufficient. |
| SEC-049–052/055 | Engineering + Security | Fresh exact lockfile/runtime/tooling advisory review at implementation/release, component provenance and copied-code/dependency review if primitives are added, matching source/build identity. |
| SEC-063/064 | Engineering + QA | Bounded workspace list access and context reads; rapid switch/delayed-response faults; account/workspace outages cannot invent empty data, successful selection or restored authority. |

Use the [security catalogue](../../../docs/security/vulnerability-catalogue.md) and [release checklist](../../../docs/security/release-checklist.md) to finalize affected controls, named owners, versioned verification references and exclusions. No release gate is passed by this table.

**Evidence separation for the next phase**:

- Automated: route/presentation compatibility; working destinations and active state; controlled loading/error/empty/gate cases; direct service/action/read denials; delayed-response/context cleanup; invitation redaction; translation coverage. Real database/session evidence is required where the behavior relies on it.
- Actual authenticated browser: isolated multi-team account/profile/invitation/sign-out journeys, direct links/refresh/history, desktop collapse, modal behavior, permission loss and all six locale/theme combinations. A source assertion or anonymous HTTP request is not this evidence.
- Manual accessibility: keyboard, focus containment/restoration and navigation focus, screen readers, zoom/reflow, contrast, target sizes and reduced motion, with named browser/device/build and observed results.
- Fluent-Arabic review: wording, shaping, mixed-direction fixtures, right-side navigation and coherent reading/keyboard order. Record reviewer and unresolved findings separately from automated key parity.
- Release: identity/workspace gate reconciliation, actual ingress/cookies/cache behavior, current advisories, isolated integration and applicable migration/recovery evidence remain separate from requirements quality. Unavailable checks must be marked as gaps; update `plan.md` only for implemented and verified behavior.
