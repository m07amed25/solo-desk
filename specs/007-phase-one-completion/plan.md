# Implementation Plan: Phase One Account and Public Entry Completion

**Branch**: `main` (actual checkout; no branch created) | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md)

**Feature directory**: `specs/007-phase-one-completion`; setup resolves feature name `007-phase-one-completion` independently of the actual Git branch. **Status**: Phase 0 research and Phase 1 design complete; full-feature implementation readiness **BLOCKED** by the named gates below. No implementation, schema application or deployment is claimed.

## Summary

Complete only root-plan Phase 01's missing account/public behavior. Extend the existing account page, authorized services, PostgreSQL pool, presentation routing, auth forms, runtime and shared components. Keep the existing managed identity system; add neither a second auth server nor a newsletter/notification platform.

The five confirmed decisions are binding: reauthenticate before revoking other sessions, exempt ordinary sign-out; proof lasts five minutes or one success; language resolves browser → account → English; shared-limit outages pause new account/public submissions while valid sessions/sign-out retain normal checks; confirmation uses an existing enabled password or fresh Google/GitHub method.

Session operations exist in the installed SDK but conflict with current documentation and upstream paths. No verified managed adapter establishes action-bound password or social freshness. Existing managed name updates lack demonstrated conditional-write support. Those are explicit technical readiness errors, not permission to substitute cached sessions, fabricate success or weaken stale-edit protection. [Research](research.md) resolves each question to a supported design or a fail-closed capability decision.

## Technical Context

**Language/Version**: TypeScript 5.9.3; Node v24.21.0 observed locally; deployed runtime remains to be inventoried.

**Primary Dependencies**: Installed and locked Next 16.4.3, React/React DOM 19.3.0, next-intl 4.14.9, `@neondatabase/auth` 0.7.0-beta with Better Auth 1.7.14, Base UI 1.9.0, shadcn 4.23.0, Tailwind 4.3.3, pg 8.23.1 and Nodemailer 10.3.1. [Source identity](artifacts/planning-source-identity.json) records hashes. No dependency addition/upgrade is selected.

**Storage**: Existing server-only pooled Neon PostgreSQL using `pg`; application data stays in `solodesk`, managed identities/challenges/sessions remain provider-owned. Reuse `rate_limit_buckets`; add only revisioned preferences, redacted account events, and gated proof/operation and hold records described in [data-model.md](data-model.md). No protected persistent browser storage. Live PostgreSQL version, restricted roles and schema are uninspected; migration compatibility must be established in the isolated target before execution.

**Testing**: Existing Node test runner, mocked email tests, production webpack build, HTTP checks, installed browser tooling and human Arabic/accessibility review. Existing live-auth harness needs repair before it is evidence. Commands and their safety limits are in [quickstart.md](quickstart.md).

**Target Platform**: Responsive browser website with server-capable Next hosting, English/Arabic RTL, Light/Dark/System. Keep Cache Components and Partial Prefetching. Account/security reads stay request-time and uncached behind Suspense; Next's browser-private session caching example does not satisfy this feature's fresh revocation contract.

**Project Type**: Existing modular Next application; no scaffolding, repository framework or microservice.

**Performance Goals**: SC-012 requires four of five reviewers to locate session controls, revoke a prepared session and save timezone within three minutes. Engineering validation budgets: account preference response p95 ≤1 second at 20 concurrent synthetic sessions; shared admission p95 ≤100 ms at 50 requests/second across two app instances, measured in a declared isolated region. These are proposed test budgets, not measured capacity or an uptime promise. Provider waits are reported separately and cannot hide slow app processing. Revisit budgets with Q-02/Q-16 owners before release.

**Constraints**: Existing pool maximum 5 per process; one checked-out client per transaction; no provider network call while holding a long DB transaction. Proposed JSON bodies ≤4 KiB and displayed session pages 20, maximum 100. Never truncate a revoke-others target set or claim completeness from a partial provider list; upstream enumeration/response bounds require G1 proof. Exact abuse caps and retention durations require owner policy, not invented defaults. All 35 FRs and 12 SCs remain intact.

**Scale/Scope**: Eleven product plus fourteen scoped supporting entries from Phase 01; two synthetic accounts, three sessions for one account, at least two instances for shared-limit tests. Broader support contracts and all later product phases remain open. No launch-user count or availability guarantee is inferred.

## Constitution Check

The pre-research review permits design work: the specification preserves the selected stack, current authority, exact effects, shared bilingual design and evidence requirements. Post-design review below confirms no proposed architectural exception. **Design compliance does not pass capability or release readiness.**

| Principle                                | Before research | After design    | Concrete design constraint                                                                                                                   |
| ---------------------------------------- | --------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| I — Selected stack and simple boundaries | PASS            | PASS            | Reuse existing Next/shadcn/Neon/Managed Better Auth and pool; small account service and adapter functions only                               |
| II — Authority and privacy               | PASS for design | PASS for design | Current session on every protected service, own-session DTOs, origin guards, no raw tokens, provider bypass checks and narrow runtime grants |
| III — Recoverable effects                | PASS for design | PASS for design | Preference CAS; proof reservation/command reconciliation; no fictional transaction spanning provider and database                            |
| IV — Bilingual accessible experience     | PASS for design | PASS for design | Existing primitives/runtime, all actual strings/emails, explicit locale precedence, measured keyboard/RTL/zoom/contrast                      |
| V — Evidence before completion           | PASS for design | PASS for design | Source identity, fresh audit findings, real provider/DB/browser proof separated from mock/source checks                                      |

### Readiness gates and error handling

| Gate                                    | Current result                         | Required resolution and owner                                                                                                                                                                    | Downstream rule                                                                                                               |
| --------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| G1 — Managed sessions and fresh proof   | **ERROR / BLOCKED**                    | Identity + security must prove actual list/revoke shapes, bounded enumeration, original-session preservation, action-bound password/Google/GitHub freshness and direct-origin policy enforcement | No real proof minting or other-session revoke activation; unavailable controls do not satisfy FR-008/011/012 or F02.06/F02.07 |
| G2 — Managed name stale-edit protection | **ERROR / BLOCKED**                    | Identity + account engineering establish provider conditional update/version semantics; if unsupported, obtain an explicit reviewed profile-authority design before changing storage             | Preserve existing separate name save; do not claim FR-018 stale-name coverage or promise atomic name+preferences save         |
| G3 — Account/abuse policy               | **BLOCKED activation**                 | Product + security approve remaining Q-08 methods, verification/reset lifetimes/invalidation, caps/windows/network normalization and recovery thresholds                                         | No production enablement using provisional test values; confirmed five-minute proof/outage rules cannot be relaxed            |
| G4 — Data lifecycle                     | **BLOCKED affected deletion/release**  | Product + operations/legal approve inventory, per-class schedules, hold authority and provider/mailbox/backup enforcement                                                                        | No arbitrary purge or retention guarantee; indefinite preservation is not approved retention                                  |
| G5 — Environment and actual authority   | **BLOCKED hosted verification**        | Operations + identity/data owners provide independently verified isolated app/auth/DB/runtime roles/synthetic mail sink and ingress configuration                                                | No default `.env.local` target, production-derived test data, live calls or migration during planning                         |
| G6 — Dependencies and release           | **OPEN findings / BLOCKED acceptance** | Engineering/security triage 27 audit entries and all relevant runtime/deployed advisories; QA/design/localization/operations provide real browser/human/restore/rotation evidence                | No security-clean or full Phase 01 completion claim                                                                           |

Known negative research outcomes resolve technical uncertainty without inventing provider APIs. They are not waived gate failures. `$speckit-tasks` may generate independent safe work and explicit gate-resolution tasks; it must mark dependent execution blocked until evidence exists. No conditional adapter contract may be presented as a supported managed implementation.

## Project Structure

### Documentation (this feature)

```text
specs/007-phase-one-completion/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── account-services.md
│   ├── presentation-and-public.md
│   └── security-and-release.md
└── artifacts/
    ├── planning-source-identity.json
    ├── npm-audit-sandbox.json
    ├── npm-audit-2026-11-03.json
    └── planning-validation.json
```

`tasks.md` belongs to `$speckit-tasks` and is not generated here.

### Source Code (repository root)

| Owner/boundary      | Existing files to extend                                                                                                                             | Minimum proposed additions, only during implementation                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account services    | `lib/profile.ts`, `app/actions.ts`, `app/api/profile/route.ts`, account page and `components/live-profile.tsx`                                       | `lib/account.ts`, `app/api/account/preferences/route.ts`, `components/account-preferences.tsx`                                                                          |
| Managed identity    | `lib/auth/server.ts`, `lib/auth/capabilities.ts`, `lib/auth/client.ts`, auth catch-all, callback and auth form/sign-in components                    | `lib/auth/account-security.ts`, account session/confirmation/operation routes and `components/account-sessions.tsx`, gated by G1                                        |
| Shared admission    | `lib/contact.ts`, contact handler, `lib/workspaces.ts` limiter callers, email webhook, existing `rate_limit_buckets`                                 | `lib/rate-limit.ts`; extract only admission/policy helpers actually shared                                                                                              |
| UI/lifetime         | `components/application-runtime.tsx`, `application-shell.tsx`, public desktop/mobile header, footer, landing composition                             | Reuse existing dirty-form/private-generation owners; no new global state manager                                                                                        |
| Presentation        | `proxy.ts`, `lib/site.ts`, `app/api/preferences/route.ts`, callback/sign-in completion, language/theme forms, `messages/en.json`, `messages/ar.json` | One server-only account-locale resolver only if needed to avoid runtime import coupling                                                                                 |
| Persistence/privacy | `lib/db.ts`, migration runner, `migrations/001` and `002` as immutable prerequisites, lifecycle/security docs                                        | New numbered `003-account-completion.sql` after checking the actual next available prefix; reviewed inventory/retention documents and restricted hold/cleanup procedure |
| Tests/evidence      | Existing profile/auth/header/site/application/migration/email tests and controlled fixtures                                                          | Focused account tests and repaired/extended isolated/browser harnesses; no new runner required                                                                          |

**Structure Decision**: Keep routes thin and derive identity in shared authorized services. New account settings do not require workspace membership. Do not import workspace authorization solely to obtain a timezone/revision helper; extract a genuinely shared pure validator if needed and update its callers/tests. Managed-owned names and app-owned preferences have separately acknowledged saves and separately proven concurrency.

## Delivery sequence and requirement traceability

These are design increments, not generated implementation task checkboxes. Each includes positive, denied, failure and applicable race evidence.

| Increment                                   | Requirements / success outcomes                                    | Work and exit evidence                                                                                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — Establish identity/policy feasibility   | FR-001–012, FR-020–022, FR-026–027, FR-030–031; SC-001–004, SC-009, SC-011 | Resolve G1–G3 and verify isolated targets before sensitive implementation; reconcile recovery allowlist/harness conflict; preserve existing flags while blocked                             |
| B — Truthful public entry and sign-out      | FR-013–015, FR-023–025, FR-028–029; SC-005, SC-007–008                 | Both header variants inspect errors, remove stale identity fallback, remove fake newsletter/unsupported claims, localize actual strings and retain finite return/dirty-navigation contracts |
| C — Personal settings and locale resolution | FR-016–019, FR-027–029; SC-006, SC-008, SC-012                             | App-owned revisioned preferences, separate name outcome under G2, explicit/default display, browser/account/English precedence without theme-only locale pollution                          |
| D — Shared admission and account controls   | FR-007–012, FR-020–022, FR-027, FR-030; SC-003–004, SC-009                 | PostgreSQL committed admission, real provider adapter only after G1, safe session list, original-target proof/command lifecycle, first-new-operation revocation denial                      |
| E — Lifecycle and full-slice acceptance     | FR-026, FR-028–035; SC-008, SC-010–012 plus all earlier outcomes       | Inventory/approved holds and cleanup, audit triage, real isolated/provider/DB/browser/ingress/recovery proof and exact scoped evidence reconciliation                                       |

All 25 feature IDs remain traceable through the [specification scope matrix](spec.md#scope-and-gap-baseline). Later uploads, invitations, financial retention, PDFs, richer public pages and business features receive no acceptance credit here. If extracting shared admission touches workspace callers, retain their policies and run their regression checks without activating workspace features.

## Complexity Tracking

No constitution exception is proposed. A distributed counter, preference revision and action-bound proof record exist because the specification requires cross-instance enforcement, stale-edit denial and concurrent single-use behavior. Redis, a second auth backend, generic policy engine, notification platform and new test framework are rejected as unnecessary. G1/G2 failures must not be worked around with unreviewed provider SQL writes or a parallel identity system.
