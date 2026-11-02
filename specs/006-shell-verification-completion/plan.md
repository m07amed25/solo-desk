> **Execution update — 2 November 2026:** Source corrections, local verification and record reconciliation are complete;50/65 tasks checked. Full framework/live/browser/human acceptance remains partial/BLOCKED. [Evidence](evidence.md), [final verification](artifacts/final-verification.md) and [audit](artifacts/completion-audit.md) supersede the planning-time status/baseline descriptions below.

# Implementation Plan: Application Shell Completion and Verification

**Branch**: Git checkout `main`; Spec Kit feature label `006-shell-verification-completion` | **Date**: 2026-11-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature 006 specification and [quality handoff](checklists/requirements.md), preserving [Feature 005](../005-application-shell-sidebar/spec.md) and its existing contracts.

**Status**: Phase 0 research and Phase 1 design complete. Application corrections, acceptance and roadmap reconciliation are pending. No branch, source change or `tasks.md` is produced by this planning command.

## Summary

Complete the existing shell rather than rebuild it. Preserve the three app destinations and separate public/authentication layouts. Fix the demonstrated verification-diagnostic weakness, connect dirty forms to synchronous navigation cancellation, make the runtime the sole account/workspace lifecycle owner, isolate team views from obsolete async work, and finish localized accessible navigation.

The current full suite fails inside the sandbox but passes unchanged in the approved execution environment. The bounded CLI probe reports `spawnSync.error.code=EPERM` with empty captured output inside the sandbox; outside it, the same help/invalid-selection probes behave correctly. Preserve `scripts/migrate.mjs` unless a separate product defect is reproduced. Strengthen subprocess error/signal/timeout/redaction assertions without replacing any existing safety assertion.

Several source gaps remain despite the passing local suite: no dirty-form registrations, late preference cancellation, no resumed link navigation after discard, independently seeded workspace-panel state, incomplete switch/lifecycle validation, ignored resolved sign-out errors, invitation capture below private loading, and hardcoded accessible/visible copy. Correct these at their existing owners, then obtain mounted browser and isolated authority evidence. Local mocks/builds cannot approve those journeys.

## Technical Context

**Language/Version**: Installed TypeScript 5.9.3, React/React DOM 19.3.0, Next.js 16.4.3; local Node 24.21.0 and npm 11.19.0. Production/managed-service runtime versions remain unverified execution prerequisites.

**Primary Dependencies**: Existing next-intl 4.14.9, Base UI 1.9.0, shadcn 4.23.0, Tailwind 4.3.3, pg 8.23.1, Neon Auth SDK 0.7.0-beta and installed Better Auth 1.7.14. Preserve `cacheComponents: true`, `partialPrefetching: true`, existing Realtime and service gates. No package/lockfile update or component regeneration is planned.

**Storage**: Existing Neon data and HttpOnly workspace/presentation cookies only. Private forms/proof stay in memory. No table, index, migration, protected browser draft, new persistence service or job is introduced.

**Testing**: Existing Node contract/service tests, synthetic email tests, lint/typegen/types/translations/build. Extend existing application/site/workspace tests at the affected boundary. Use the user-installed Playwright CLI wrapper for mounted interaction and assertion journals, without adding an application dependency. The wrapper and `npx` exist; CLI availability/launch and authenticated fixtures must be verified at execution. Python Playwright and project-resolvable Node Playwright packages are absent; cached browser directories alone are not usable-browser proof.

**Target Platform**: Responsive website; English/Arabic × Light/Dark/System; 390×844, 768×1024, 1280×800, 1440×900, short 1280×480, 320 CSS-pixel reflow and actual 200% browser zoom. Target Chromium, Firefox and Safari/WebKit per Q-11; record actual versions and unavailable engines/devices. Human screen-reader/keyboard/contrast and fluent-Arabic acceptance remain distinct gates.

**Project Type**: Existing modular Next.js monolith. Server services own identity/grants/transactions; one client runtime owns private-context lifetime; existing shadcn/Base UI primitives own modal behavior.

**Performance Goals**: SC-011: at least 95% of at least 20 warm navigations reach visible usable content or accurate actionable unavailability within two seconds. Retain bounded context/list work: one current recheck, 15-second context-read timeout, one initial choice page of 20/max 50 and at most one selected-context read. Keep the existing 55-second visible-tab interval plus expiry/foreground/route checks; it never permits stale server authorization.

**Constraints**: Finite internal returns, explicit fragment clearing, private/no-store responses, fresh protected-service authority, memory-only proof bounded at 4096 raw/1024 decoded characters, 768 CSS-pixel navigation breakpoint, preserved command IDs/targets/revisions and disabled unsupported capabilities. Read installed framework docs before code changes; no legacy dynamic/cache workaround or fresh authority inferred from template remount.

**Scale/Scope**: Seven stories, 33 FRs, 12 success criteria, three destinations. Fixtures: two distinguishable teams, separate synthetic identities including non-member, Owner/Admin/Member, removed grants/revoked memberships, zero/one/many choices and >20 choices. No production scale claim or broader product-feature completion.

## Constitution Check

Both reviews pass **for the proposed design**, not for the current implementation or release. Existing defects are assigned corrections and evidence gates rather than exceptions.

| Principle                                   | Pre-research gate                                                                                    | Post-design result                                                                                                                                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I — Selected stack and small boundaries     | Reuse existing modules, components, runtime and services; identify callers/queries/transactions      | PASS: R1–R10 in research; bounded files/work packages below, no schema/dependency/job or generic framework.                                                                              |
| II — Current authority and privacy          | Treat selectors, UI and cached props as untrusted; enforce service grants and private-state lifetime | PASS by design: runtime/navigation contract specifies exact reveal rules, clear-selection authorization, direct denial and proof disposal. Implementation/live evidence remains pending. |
| III — Recoverable effects/history           | Preserve migration history and existing command/receipt/audit/outbox transactions                    | PASS by design: CLI harness changes preserve runner; mutations retain captured targets/IDs/revisions and existing transaction/rollback/locking. No financial effect added.               |
| IV — Shared accessible bilingual experience | Existing shadcn/Base UI/tokens, complete text coverage and actual interaction proof                  | PASS by design: drawer/focus/RTL/zoom matrix and separate human reviews required. Supplied palette is not a contrast pass.                                                               |
| V — Evidence before completion              | Reproduce conflicting claims; distinguish local, mounted-controlled, live and human evidence         | PASS for planning: current baseline logs and provenance retained; required browser/real-service/human/advisory checks remain open. No source/roadmap completion claimed.                 |

Pre-research review found no unavoidable design violation. Post-design review found no unresolved design decision or requested constitutional exception. Named release owners and live-target authorization remain execution gates; an accountable role is not a signed approval. Missing fixtures or scans do not turn into passes.

## Project Structure

### Documentation (this feature)

```text
specs/006-shell-verification-completion/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   ├── runtime-and-navigation.md
│   └── verification-and-evidence.md
├── quickstart.md
└── artifacts/
    ├── planning-test-full-sandbox.log
    └── planning-test-full-approved.log
```

Later implementation adds attributable result/capture references, not invented pass summaries. `tasks.md` belongs to `$speckit-tasks` and is intentionally absent.

### Source Code (repository root)

Existing files potentially affected by the later corrections:

```text
scripts/test-migrations.test.mjs       # Bounded subprocess diagnostics; preserve runner
scripts/migrate.mjs                   # Conditional only: separate reproduced CLI defect
scripts/test-application.test.mjs     # Loader/action/HTTP contracts; no model-as-browser claim
scripts/test-{site,profile,workspaces,auth-contract}.test.mjs
scripts/test-{site-http,workspaces-browser,workspaces-postgres}.mjs
scripts/test-{app-shell,workspaces}-browser.md
components/application-{runtime,shell,overview}.tsx
components/{workspace-panel,workspace-switcher,workspace-invitation,nav-user,live-profile}.tsx
components/ui/{sidebar,sheet}.tsx
hooks/use-mobile.ts
app/(site)/[locale]/[theme]/app/{layout,template,page,loading}.tsx
app/(site)/[locale]/[theme]/app/{workspace,account}/page.tsx
app/api/app/context/route.ts
app/workspace-actions.ts
lib/application.ts
lib/{site,profile,workspaces}.ts        # Existing boundaries; alter only demonstrated gaps
lib/auth/{server,capabilities}.ts      # Preserve existing supported policy/gates
messages/{en,ar}.json
app/globals.css                       # Only measured layout/focus/contrast corrections
specs/005-application-shell-sidebar/{plan,tasks,evidence}.md
specs/005-application-shell-sidebar/artifacts/
plan.md                               # Root completion reconciliation after verification
```

**Structure Decision**: Keep current route/layout/template composition and existing primitives. No new application file or exported navigation wrapper is needed: add shared navigation coordination to the existing runtime and use it from existing links. Reuse `workspace-invitation.tsx` for a bounded early provider plus explicit acceptance UI; do not add a second token store. Private state remains below the authoritative boundary.

### Affected Callers, Fixtures and Configuration

| Owner                     | Required reach and interface decision                                                                                                                                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verification CLI          | `db:migrate`, imported runner helpers and three child probes; timeout/error/signal checks precede unchanged output/status assertions and redaction covers all streams. No connection for help/invalid selectors.                                                                                                                 |
| Shared runtime/navigation | Preserve existing runtime methods; add `navigate(destination: AppDestination                                                                                                                                                                                                                                                     | "/"): Promise<boolean>`for confirmed/scheduled navigation. All shell/breadcrumb/menu/overview/switcher links use it via synchronous`Link.onNavigate` cancellation; success is not a route-commit signal. Preferences retain native POST after confirmation. |
| Forms                     | Extend `DirtyFormHandler` with required `discard(): void`; register profile and create/settings/invite forms with cleanup. Confirm all dirty handlers before discarding any. Same-actor recoverable failures retain valid input; confirmed discard clears Activity-retained drafts.                                              |
| Team views/actions        | Sole `WorkspacePanel` caller is workspace page: remove independent server-prop state as authority and consume runtime. All selection/create-follow-up paths use `switchWorkspace`; action targets/IDs/revisions remain immutable. Guard initial/manual/mutation-follow-up reads by captured actor/team/lifetime.                 |
| Personal/live profile     | Sole `LiveProfile` caller is account page. Share runtime account lifecycle/sign-out; preserve exact own-profile fetch/seal/renewal predicates, draft ownership and subscription cleanup. Workspace-only failure cannot block profile.                                                                                            |
| Authority/transport       | Reuse exported `validateUUID` for actual selectors. Require an authenticated bounded expected selector for clearing, compare cookie, retain existing ActionResult envelope and re-read context. Map context failure to stable generic codes/status; never render raw server exceptions as localized copy.                        |
| Invitation/layout         | Mount bounded capture before private template loading; render acceptance only under current actor/capabilities. All auth/recovery/public/preference exits explicitly clear fragments. Preserve proof-bound command identity, replay policy and no external delivery.                                                             |
| UI/localization           | Sidebar/Sheet labels supplied from app localization while preserving utility consumers' defaults; logical alignment, visible dismissal, focus and shared size variants. Existing locale/theme endpoints/allowlists stay compatible.                                                                                              |
| Tests/evidence/config     | Extend meaningful existing runners and fix misleading HTTP/source “browser” labels; CLI-mounted replay journal and sanitized captures prove interactions. Recheck fixture safety independently of manifest strings. Package/lock/config/exports/schema remain unchanged unless a newly demonstrated need is separately reviewed. |

## Delivery Order and Validation Boundaries

These work packages define scope for the next task-generation phase, not implementation checkmarks.

| Package                                | Concrete correction and verification                                                                                                                                                                                                                                                                                               | Coverage                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| W1 — Reliable verification             | Reproduce execution metadata; bound the three subprocesses, assert no error/unexpected signal before status/output and redact all streams. Run focused migration tests in supported execution environment; preserve runner unless another defect is shown.                                                                         | US1; FR-001–004; SC-001                               |
| W2 — One private-context owner         | Correct conceal/reveal/status/retry, actor/expiry checks and serialized selection; connect team views and all async completions to runtime lifetime; secure clearing; share profile lifecycle/sign-out; early memory-only invitation capture and explicit gated acceptance. Prove direct service denials plus mounted transitions. | US2/4; FR-005–006/014–023/029; SC-002/005/006/008/009 |
| W3 — Safe navigation and input         | Register/clear dirty forms; synchronous cancellation followed by one explicit resume for links/preferences; all link callers, finite returns, cached-route/history revalidation and committed-navigation focus/drawer closure. Add cancellation/discard and modified-click cases.                                                  | US3/5; FR-009–013; SC-004/007                         |
| W4 — Responsive bilingual presentation | Localize all visible/accessibility copy and role/status values; fix drawer close/initial/final focus, resize, short height, logical layout, shared 44px shell controls, affected contrast and all locale/theme/motion/viewport cases.                                                                                              | US2/3/6; FR-007–009/024–027; SC-003/004/010           |
| W5 — Current acceptance evidence       | Record focused tests, full suite, actual mounted controlled faults and real isolated service/session integration, 20 switches, ≥20 warm navigation timings, human reviews and current advisory/release findings. Missing prerequisites remain scoped blockers.                                                                     | FR-028–031; SC-001–011                                |
| W6 — Completion reconciliation         | Correct unsupported Feature 005 records with dated provenance; update root inventory/ledger/totals/next work only against full contracts. Report exact changed IDs and NEXT-05 prerequisite decision without beginning clients.                                                                                                    | US7; FR-030–033; SC-012                               |

W1 precedes source corrections; W2 establishes shared lifecycle interfaces before W3/W4 consumers; W5 follows relevant corrections; W6 follows actual evidence. Independent corrections continue when live/human prerequisites are missing. Test each correction at its true boundary rather than adding source assertions that mirror implementation.

### Review Focus

- Two dirty forms: cancelling the second confirmation must not discard the first; confirmed discard must clear preserved route state.
- Actor/selection mismatch after cookie-writing races: a successful action alone must never reveal another context or retarget a command.
- Activity/history restoration and unchanged expiry: a reused bootstrap cannot authorize reveal, and a cleared expiry timer must be rearmed even when its timestamp is unchanged.
- Failure during ordinary recheck/sign-out: private views stay concealed with visible non-private recovery; same-actor recoverable errors retain permitted draft input.
- Invitation hash arrives during acceptance or before a streamed redirect: original proof/operation remains fixed; no proof survives exits or reaches telemetry.

Each is assigned explicit acceptance cases in the [runtime/navigation contract](contracts/runtime-and-navigation.md) and [verification contract](contracts/verification-and-evidence.md).

## Planning Evidence and Remaining Gaps

| Check                                       | Actual result                                                                                                                                                 | Limit                                                                                                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Setup script                                | Exit 0; Feature 006/template resolved                                                                                                                         | Git remained `main`; feature-derived label is not a created branch.                                                                                                                                     |
| `npm run test:full` in sandbox              | Exit 1; lint/typegen/types and 435-key parity passed, six Node test files passed and migration file failed; email/build not reached                           | [Sandbox log](artifacts/planning-test-full-sandbox.log). Failure is not a database migration attempt.                                                                                                   |
| Same full command, approved outside sandbox | Exit 0; 36 Node tests, 6 synthetic email tests, build compiled/generated 54 pages                                                                             | [Approved log](artifacts/planning-test-full-approved.log). Unchanged source; local mocks/contract/build coverage only. A module-type warning remains visible; no package-wide change is justified here. |
| Bounded synthetic CLI probes                | Sandbox parent exit 0, child EPERM/empty streams despite status 0 for help; approved parent exit 0, child help 0/invalid 1 without errors and expected output | Diagnostic parent success is not a test pass; exact probe/method in research. Historical failure lacks original metadata.                                                                               |
| Source/installed-doc review                 | Concrete defects/callers and version-specific navigation/lifecycle constraints identified                                                                     | No mounted browser, actual service isolation or human acceptance inferred.                                                                                                                              |
| Tool prerequisites                          | `npx` and user CLI wrapper present; project Node/Python Playwright imports unavailable; cached engine directories present                                     | CLI help/engine launch, independently verified live fixtures and browser interactions were not run.                                                                                                     |

Source baseline: HEAD `fbd653da3057531894b2ae92b0771eb22653bd79`, only Feature 006 directory untracked. Hashes and limits are in [research](research.md). No database operations, mail delivery, capability activation, application edits, fresh advisory scan or human review ran. The build read existing configuration; it does not prove environment isolation or deployed compatibility.

Current identity policy/hosted version, restricted database target, G1–G6/AP-01–05 integration, real browser/human reviews, current dependency/deployed advisories and root NEXT-01–04 acceptance remain open as applicable. A passing unrestricted suite does not complete F04.01 or NEXT-04, and NEXT-05 is not established ready. The [quickstart](quickstart.md) defines execution prerequisites and runnable validation.

Before/after planning hook configuration is absent. Documentation validation and preservation results are recorded after artifact review in research. No root/Feature 005 completion marks are changed at this stage.

## Complexity Tracking

No constitutional exception is required. Retain the existing modular boundaries and transaction owners. One team-lifetime counter, existing runtime coordination and an early bounded invitation provider have concrete stale-state/privacy needs; no generic state engine, navigation registry, new dependency, schema or persistence layer is justified.
