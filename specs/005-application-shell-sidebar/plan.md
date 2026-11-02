# Implementation Plan: Application Shell and Sidebar Navigation

**Branch**: `feat/004-workspace-platform-and-authorization` (checkout at completion; initially `main`, changed concurrently) | **Date**: 2026-11-01 | **Spec**: [spec.md](spec.md)

**Input**: `specs/005-application-shell-sidebar/spec.md`, with the source observations and constraints in [the quality checklist](checklists/requirements.md).

**Status**: Implementation and verification complete. All 71 tasks implemented and verified across US1–US6; full test suite and production build pass cleanly.

## Summary

Build one authenticated application composition around three working destinations: `/app` Overview, `/app/workspace` Workspace and team, and `/app/account` Personal account. Retain public and auth-entry layouts, current localized/theme rewrites and shared visual identity. Reuse existing workspace/profile services and controls, and expose only truthful implemented behavior.

Use a nested presentation-only app layout with controlled official Base UI Sidebar, plus an app template containing a Suspense-wrapped server bootstrap and one private ApplicationRuntime. The template resets private page state between destinations; the persistent layout retains sidebar presentation only. A shared server-only loader supplies narrow current account/team context; a thin context GET supports lifecycle rechecks. Services remain authoritative on every direct call. Correct the bounded authority/gate prerequisites in the [runtime contract](contracts/runtime-and-authority.md) before relying on enabled team journeys.

No database migration, new business module, worker, provider/factor, protected browser persistence, generic plugin/navigation framework or new runtime package is justified. Copy/review only needed official shadcn component source; preserve existing stack and component conventions.

## Technical Context

**Language/Version**: TypeScript 5.9.3, React/React DOM 19.3.0, Next.js 16.4.3 App Router. Local Node 24.21.0; deployment runtime remains unverified.

**Primary Dependencies**: Existing next-intl 4.14.9, Tailwind 4.3.3, Base UI 1.9.0, shadcn 4.23.0, Lucide, pg 8.23.1, Managed Neon Auth SDK 0.7.0-beta with installed Better Auth 1.7.14; existing personal Realtime integration. Preserve `cacheComponents` and `partialPrefetching` settings. Inspect official resolved component dependencies before copying; no automatic upgrade/install is part of planning.

**Storage**: Existing Neon PostgreSQL and existing HttpOnly workspace selector/preferences. No schema/index change planned. Sidebar expansion and private form/proof state stay in memory; no browser draft or sidebar persistence is introduced.

**Testing**: Existing Node test runner, TypeScript/Next type generation, ESLint, translation parity and synthetic email tests; new focused loader/context contracts in the existing Node test glob; direct real service/session/database tests in an independently verified isolated target; actual browser automation through available authorized tooling; separate human accessibility and fluent-Arabic review. No additional test dependency is assumed.

**Target Platform**: Responsive web in English/Arabic; Light/Dark/System. Verify phone, tablet, desktop, 320 CSS-pixel reflow, 200% zoom and short screens. Browser/device support policy remains Q-11; record actual tested versions without inventing universal support.

**Project Type**: Existing Next.js modular monolith; one repository/deployment. Server services own identity, scoped queries and transactions; client components own interactive shell and private-view lifetime.

**Performance Goals**: SC-010: at least 95% of 20 documented warm-session navigations show usable content or accurate actionable unavailability within two seconds. One bootstrap per server render; at most one initial workspace page and one selected context; no profile seal outside Personal account. Coalesce lifecycle reads; one current context recheck, existing visible-tab 55-second interval plus expiry/foreground/navigation checks. No production capacity claim.

**Constraints**: Exact finite paths/returns, no proof forwarding, private/no-store responses, current account/workspace/resource/action grants, service gates and fail-closed unsupported reauthentication. 768 CSS-pixel navigation breakpoint shared by CSS and JS. Shared monochrome tokens/fonts/focus; no marketing composition inside app. No new protected persistence, domain engine or production operations.

**Scale/Scope**: Three destinations, six required stories, 31 functional requirements, ten success criteria. Workspace pages default to 20 choices/max 50 per request; load later pages explicitly. Existing member/invitation bounds remain truthful. Synthetic acceptance includes two distinguishable teams, non-member, Owner/Admin/Member, no memberships, more than one choice page, delayed responses and revoked authority. No count of production users/tenants is assumed.

## Constitution Check

Pre-research review checked the existing spec, constitution and current source before accepting research decisions. The result is **PASS for bounded design**, provided required authority corrections remain implementation prerequisites and unproven capabilities remain disabled. Existing source gaps are not treated as constitutional exceptions or passed release gates.

| Principle | Pre-research gate | Post-design result / evidence |
| --- | --- | --- |
| I — Selected stack and small boundaries | Reuse monolith, existing services/components and pool; no stack replacement or speculative infrastructure | PASS: R1–R8; one application loader/runtime, finite destinations, reused primitives. Module/caller/query/transaction ownership below and in data model. |
| II — Server authority and privacy | Protect every service call; selectors/UI are untrusted; no shared private cache or proof persistence | PASS by design: AP-01–05, finite returns, proof scrubbing, serialized selection and current-authority rechecks specified with direct negative tests. Current source does not yet satisfy all these requirements; activation remains blocked until corrected/proven. |
| III — Exact history and recoverable effects | No new finance/time effect; preserve consumed command/receipt/audit/outbox invariants | PASS: shell reuses explicit targets, operation IDs, revisions and existing transactions; no worker/migration or financial shortcut. Unknown outcomes reconcile rather than invent success. |
| IV — Shared accessible bilingual experience | Existing shadcn/Base UI/tokens, complete EN/AR, RTL and all appearance modes | PASS by design: shell contract specifies focus/modal/resize/zoom/reflow/direction. Manual and fluent-language acceptance remains pending. |
| V — Evidence before completion | Separate local/mocked/source/real integration/browser/human/release evidence | PASS for planning: research/contract/validation artifacts exist; local commands and advisory result are recorded below. No shell implementation, hosted integration, accessibility or release result is inferred. |

Post-design review found no justified constitutional violation. Open external policy/support/integration evidence is handled by explicit disabled behavior and activation blockers, not by silently weakening requirements. Named release owners and sign-off must be assigned before activation; accountable engineering/security/QA/operations roles are identified in the runtime contract.

## Project Structure

### Documentation (this feature)

```text
specs/005-application-shell-sidebar/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   ├── shell-and-navigation.md
│   └── runtime-and-authority.md
├── quickstart.md
└── artifacts/npm-audit-2026-11-01.json
```

`tasks.md` is intentionally not generated by this command; `$speckit-tasks` is the next phase.

### Source Code (repository root)

The following is the planned affected surface, not files created by this planning step. Existing modules are extended where they already own behavior.

```text
app/(site)/[locale]/[theme]/app/
├── layout.tsx                 # New: direction/sidebar presentation and early proof capture
├── template.tsx               # New: private Suspense/bootstrap/runtime boundary
├── page.tsx                   # Replace account-style composition with truthful Overview
├── loading.tsx                # Non-private app fallback
├── workspace/page.tsx         # New: existing workspace/team controls
└── account/page.tsx           # New: existing personal profile/live behavior
app/api/app/context/route.ts   # New: same context service for lifecycle rechecks
app/api/workspaces/route.ts    # Existing bounded list/context validation
app/api/preferences/route.ts   # Same preference transport, finite child returns
app/workspace-actions.ts       # Existing selection/domain actions, conditional clear/gates
app/(utility)/auth/callback/page.tsx
components/
├── application-shell.tsx      # New: shared navigation/header/main composition
├── application-runtime.tsx    # New: one private lifecycle/context owner
├── application-overview.tsx   # New: truthful implemented context/links
├── auth-skeleton.tsx          # Reuse/extend non-private shell fallback
├── workspace-panel.tsx        # Consume shell selection; retain existing domain controls
├── workspace-invitation.tsx   # Early capture + guarded explicit acceptance
├── live-profile.tsx           # Preserve form/live guard; share account lifecycle
├── auth-entry-page.tsx, auth-interactive-panel.tsx, auth-email-form.tsx, sign-in.tsx
└── ui/{sidebar,sheet,tooltip,breadcrumb}.tsx  # Needed official source + resolved minimal helpers
lib/
├── application.ts             # New: server-only context projection, render-pass wrapper
├── site.ts                    # Exact page and auth-return values/normalization
├── auth/{server,capabilities}.ts
├── profile.ts                 # Preserve own-user projection and sealed-query predicates
└── workspaces.ts              # Bounded authority/gate prerequisites; no new domain model
proxy.ts, messages/{en,ar}.json, app/globals.css
scripts/{test-application,test-site,test-auth-contract,test-profile,test-workspaces}.test.mjs
scripts/{test-site-http,test-auth-flows,test-workspaces-postgres,test-workspaces-browser}.mjs
```

**Structure Decision**: Keep the existing localized/theme root; add nested app layout/template only. No new package, barrel export layer or generic registry. Sidebar/Sheet helpers may use their official resolved paths after source review; reuse current utility functions. Restrict shared CSS changes to actual missing shell logical-layout/state needs, leaving tokens/public composition intact.

### Affected Callers, Fixtures and Configuration

| Owner / surface | Required reach of the change |
| --- | --- |
| Application UI | Three pages, layout/template/loading, shared shell/runtime, actual heading/active route, common workspace owner and dirty-navigation coordination. Template/page guards share a loader; pages perform route-specific server sign-in redirects where executed. A denied template supplies non-private finite-browser-path recovery when it withholds children, preserving child resumption without relying on a child redirect. |
| Identity/profile | Audit `currentSession` callers in pages, auth entry/header, profile API/action/live and workspace services when strengthening authority. Preserve `saveProfile` signature/error codes, exact profile SQL/seal and public auth header behavior. Do not introduce a parallel auth client/session engine. |
| Team controls/services | Integrate panel functions and update all selection/context/member/invitation/manual-refresh callers. Preserve action result fields, operation ID/revision/error contracts and domain transactions. Apply AP-01–05 at direct/replay boundaries, not only components. |
| Links/preferences/auth | Coordinate finite allowlists/proxy, child routes, preference return controls, auth entry normalization, counterpart entry links, social callback/error URLs and enabled email/verification completion. Keep all default flows compatible and fragment-clearing transitions explicit. |
| Shared primitives/design | Review official source and transitive imports before additions; remove unsolicited shortcut/persistence, check RTL portals and reused menu spacing, use semantic tokens and 44px shell controls. No theme/preset/primitive replacement. |
| Tests/fixtures | Extend existing parser/auth/profile/workspace tests; add focused context-loader tests. Supply isolated two-team/non-member/role/grant/session/failure/delayed/pagination fixtures. Update stale HTTP/source assertions and label them honestly; actual browser/human evidence remains separate. |
| Config/exports/docs | Keep package/lock/env unchanged unless a documented concrete dependency is required after source review. No schema/migration, worker, public export/barrel or new auth factor. Update implementation docs/evidence and root roadmap only after actual verified behavior; this plan changes neither. |

## Delivery Order and Validation Boundaries

1. **Foundation and owned prerequisites:** Resolve reviewed component source, exact routes/returns and AP-01–05 authority/gate corrections. Add meaningful current-grant/disabled/direct/replay tests before wiring enabled controls. Do not enable unsupported ownership/invitation/credential behavior.
2. **US1/US4 — Shell and account boundary:** Add nested layout/template, narrow loader, runtime conceal/recheck/sign-out and three useful destinations. Public/entry layouts remain independent. Verify direct links, finite returns, active state, refresh/history and no fictional content.
3. **US2/US3 — Team and existing journeys:** One workspace owner, bounded pagination, serialized selection, generation cleanup and existing panel/profile/invitation integration. Prove all state distinctions, original targets and independent personal account access; keep missing Feature 004 integration proof as an affected-capability blocker.
4. **US5/US6 — Responsive and bilingual completion:** Finish icon rail/Sheet, workspace/account reachability, focus/dirty navigation, all EN/AR × theme variants, long/mixed names and human accessibility/Arabic review. These are required acceptance work, not optional polish.
5. **Evidence review:** Run affected local/type/lint/build checks, actual browser and isolated service/session tests, fresh advisory/component review and applicable release gates. Record unknown/unavailable outcomes. Only verified implemented behavior may change roadmap completion.

This is sequencing for a later task breakdown, not `tasks.md` or an implementation authorization beyond the requested planning phase. [Quickstart](quickstart.md) supplies runnable validation commands and observable scenario outcomes; [runtime contract](contracts/runtime-and-authority.md) supplies owners, selected SEC/ASVS references and stop conditions.

## Planning Evidence and Remaining Gaps

| Check performed during planning | Observed result | Limit |
| --- | --- | --- |
| `setup-plan.sh --json` | Resolved Feature 005 and copied active plan template | Feature context is independent of Git branch; this workflow created/switched no branch or commit. |
| Source/installed documentation review | Next layout/template/Cache Components/server-client/auth guides, current services/components/config and Feature 004 test/evidence source inspected | Read-only; existing summaries and advertised SDK support are not runtime proof. |
| Official component documentation lookup | `npx shadcn@latest docs sidebar sheet breadcrumb tooltip` initially hit DNS restrictions, then completed after approved network retry; primary Base UI/shadcn pages reviewed | Components/source provenance and exact imports still require review when copied; no component/dependency installed. |
| `npm audit --json` | Exit 1; 27 affected package entries (8 low, 19 moderate, zero high/critical reported), report retained | Not clean; runtime/tooling reachability and deployed artifact remain unassessed. No automatic fix/downgrade or inherited blanket tooling-only acceptance. |
| `npm test` initial sandbox run | Exit 1 in migration CLI help assertion; child probe returned EPERM with empty output | Environment restriction, reproduced independently; not a source-fix claim. |
| `npm test` approved unrestricted retry | Exit 0: 32 Node tests and 6 email tests passed | Local mocks/synthetic transports where used, no hosted/session/tenant/browser proof. Source is concurrently editable; result is not a frozen release artifact. |
| Translation check | Exit 0; 410 matching key/structure entries | Current source catalogs only, not future shell copy, fluent Arabic or rendered interaction. |
| Artifact validation | Passed: seven generated artifacts, complete template fields/sections, twelve research decisions, local links, finite routes, no unresolved placeholders, valid audit JSON, unchanged 16/16 quality markers and feature pointer; no tasks generated | Documentation quality only; no shell behavior implemented. |
| Research consistency review | Corrected denied-template recovery, empty choices versus membership claims, and cross-tab cookie-race guarantees | Read-only design review; not runtime verification. |

The initial source baseline was HEAD above with only Feature 005 documents untracked. Concurrent edits later appeared in `app/workspace-actions.ts`, `components/workspace-panel.tsx` and `lib/workspaces.ts`, and the checkout branch changed from `main` to `feat/004-workspace-platform-and-authorization` without changing that HEAD; this workflow did not switch branches or write/revert those source files. Review these active changes before implementation, preserve their revised result/validation/transaction handling and recheck the specific source observations. Raw unexpected-error logging in the changing actions also needs the existing proof/secret-redaction requirement; preserve error handling without inheriting unsafe log payloads. The concurrent invitation changes inspected during planning do not close AP-01–05.

Build, lint/type generation, actual browser/HTTP journeys, real PostgreSQL/session tests, mailbox/worker delivery, load/restore, manual accessibility/fluent Arabic and deployed ingress/advisory verification were not run. These remain evidence gaps. Current source/hosted authority, exact capability enforcement, receipt privacy and unsupported reauthentication require the explicit prerequisites above; a completed design does not close Feature 004 or approve activation.

Extension configuration `.specify/extensions.yml` was rechecked after design and remains absent; no before/after planning hooks apply. No `tasks.md`, application change, migration, root roadmap completion, deployment or external message is produced by this planning workflow.

## Complexity Tracking

No constitutional exceptions or extra architectural layers are required. The extra template boundary addresses documented layout retention; the single context GET handles cached-route/foreground authority without duplicating domain services. Both have specific lifecycle requirements. No generic abstraction is added for future business modules.
