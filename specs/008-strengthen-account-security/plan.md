# Implementation Plan: Protect an Account with Stronger Sign-in Controls

**Branch**: `codex/fix-vercel-workspace-typecheck` (unchanged Git branch); Spec Kit feature key `008-strengthen-account-security`
**Date**: 2026-11-03 | **Spec**: [spec.md](spec.md)
**Input**: Active Feature 008; root Phase 02; delegated Q1 A / Q2 A / Q3 A choices.

**Status: CONDITIONAL DESIGN DRAFT / ERROR for protected-effect implementation readiness.** Investigation is authorized; managed support, POL-03 and applicable Phase 01 gates are not accepted. The requirements-quality checklist remains **14/16**. No task list, implementation, migration, provider setting or deployment is produced by this command.

## Summary

Preserve the existing personal account area and Neon Managed Better Auth architecture. F02.05 remains specified functionality: voluntary TOTP enrollment, confirmation, challenge, freshly authorized disablement and single-use recovery codes. Enrolled owners must satisfy protection on every enabled entry, including social and any later passwordless flow. Recovery invalidates all pre-existing sessions and requires a confirmed replacement factor and fresh compliant sign-in. If the managed provider cannot enforce this complete contract, the feature stays unavailable and unaccepted.

F02.12 verified email/social identity changes and F02.13 passkey/passwordless access remain **unselected optional expansions**, with conditional contracts preserved. An informational security entry is a possible independent local increment, not delivered MFA. No alternate auth backend, custom factor protocol, direct managed-table writes, new factor dependency or speculative application schema is selected.

The immediate sequence is capability investigation → resolved product/security action-policy matrix → inherited prerequisite acceptance → revised supported design → requirements/security checklist → bounded tasks → analyze. Only independent investigation/local work can be scheduled before its gate passes. The conditional design below defines invariants and evidence, not assumed provider routes or a ready mutation implementation.

## Technical Context

**Language/Version**: TypeScript 5.9.3; Node v24.21.0; Next.js 16.4.3; React 19.3.0. Installed manifests and lock identity are recorded in [planning-source-identity.json](artifacts/planning-source-identity.json).

**Primary Dependencies**: `@neondatabase/auth` 0.7.0-beta, resolved `better-auth` and `@better-auth/passkey` 1.7.14, next-intl 4.14.9, Base UI 1.9.0, Tailwind CSS 4.3.3, pg 8.23.1, existing shadcn/ui source/variants. An upstream dependency being installed does not expose its plugin through the managed wrapper. No package additions/upgrades are planned.

**Storage**: Existing pooled Neon PostgreSQL for application state; Neon owns managed identity, credentials, challenges and sessions. Reuse reviewed existing account event/admission/intent/operation boundaries where demonstrated. [Data model](data-model.md) is logical and conditional: no new app table/migration is justified yet, no factor secret or code mirror is permitted, and applied migrations remain immutable.

**Testing**: Existing Node imported tests/mock adapters, guard self-checks and synthetic email checks; actual isolated PostgreSQL/provider/direct-entry/browser/human acceptance are separate. See [quickstart](quickstart.md). No Phase 02 test harness exists merely because a scenario is documented.

**Target Platform / Project Type**: Existing responsive Next.js App Router website; desktop/mobile browsers, English/Arabic RTL, Light/Dark/System. Actual browser/device/assistive support matrix remains Q-11-owned release evidence; passkey device claims are conditional and not a new supported-device promise.

**Performance Goals**: Preserve SC-008: four of five reviewers finish active setup/recovery-discovery work within five minutes; external waits are excluded. SC-009 requires two-instance enforcement of every approved cap. No new throughput, p95, provider availability or user-scale guarantee is invented. Planning requires bounded input, listings, attempts, network time and reconciliation; exact provider payload/challenge/time limits await capability evidence and POL-03, not guessed defaults.

**Constraints**: Online current authority; original-account/session/action binding; no managed-table writes or browser secret persistence; exact trusted-origin/CSRF/cookie/private-cache protection; zero new effects under stale authority; uncertain provider commitment reconciled before retry. Existing 4 KiB account JSON conventions are not automatically sufficient for future authenticator payloads: select per-operation bounded schemas from verified support before enabling them.

**Scale/Scope**: One account-security feature, 5 prioritized stories, 29 scenarios, 34 FRs and 10 SCs. One specified feature and two unselected optional expansions. Acceptance fixtures use two accounts, at least three sessions each and two app instances for admission. All real targets remain unavailable in current evidence; no production user volume is assumed.

**Unknowns disposition**: [Research](research.md) converts local/public unknowns into dated findings. Missing hosted build/configuration, actual capability acceptance, exact action-policy values and human/security evidence remain named **ERROR/BLOCKED** gates below, not resolved values or authority to proceed.

## Constitution Check

Pre-research review permits the explicitly authorized read-only investigation and conditional documentation. Post-design review finds no selected stack or ownership exception, but the execution gates remain errors. A PASS for design alignment is not implementation/release acceptance.

| Principle | Pre-research | Post-design | Evidence / invariant |
| --- | --- | --- | --- |
| I — Selected stack and simple boundaries | Aligned | Aligned, conditional | Existing account shell/service/provider ownership, no alternate backend/dependency/schema, smallest incremental boundary |
| II — Server authority and privacy | Aligned intent | **ERROR for execution** | Direct managed policy, same-session proof, trusted ingress and recovery authority need G1/G3/G5/POL-03 evidence |
| III — Recoverable external effects | Aligned intent | **ERROR for execution** | No local rollback claim; provider commitment/idempotency/reconciliation must be demonstrated before mutation/retry design is finalized |
| IV — Shared bilingual accessible UI | Aligned intent | Verification pending | Existing shadcn/Base UI/tokens/runtime; [presentation contract](contracts/presentation.md) includes actual bilingual/mobile/keyboard/human review |
| V — Evidence before completion | Aligned | Aligned for documentation | Current source/public evidence separated from mocks/live/human; no gate waived or checklist marked complete |

### Readiness gates and blocking errors

| Gate | Current finding / owner | Required exit evidence and affected scope |
| --- | --- | --- |
| **P2-CAP — Managed capability** | **ERROR/BLOCKED**; identity engineering + security. Public managed contract does not currently offer MFA; wrapper lacks MFA/passkey plugins; target unknown | Individually demonstrate enrollment/confirmation/challenge/disable/recovery, preserved-session freshness, session outcomes and direct-entry enforcement. Need complete social/recovery coverage for enrolled owners. No implementation promise from upstream APIs |
| **P2-POL — POL-03** | **ERROR/BLOCKED**; product + security + identity. Exact values explicitly deferred by Q3 A | Versioned per-action confirmation methods, proof issue/expiry/consumption, challenge clock/replay/expiry/retry/admission rules and non-recovery session outcomes; support mapping and acceptance boundaries. Update spec/register and pass both open quality items before dependent protected-effect tasks |
| **P2-IDENTITY — Phase 01 G1/G3** | **ERROR/BLOCKED**; owning Feature 007 identity/account/security roles | 007 T016/T018–T020/T024 verification/protocol/admission and T027–T036 current-session fresh proof/dispatch; T037/T039–T045 session controls; T047/T049–T053 lifetime/first-request revoked denial where relied upon. See [owning ledger](../007-phase-one-completion/artifacts/readiness.md#phase-02-prerequisite-review--3-november-2026) |
| **P2-ENV — Phase 01 G5 / F38.01** | **ERROR/BLOCKED**; operations + identity/data | 007 T017/T023 independently verified isolated app/auth/database/runtime/migration roles/provider configuration/synthetic sink and explicit test scope. No live calls from default env or a manifest alone |
| **P2-DATA — Phase 01 G4** | **BLOCKED affected collection/recovery**; privacy + operations/legal | Approved inventory/access/retention/holds for any new metadata, security events, receipts or provider recovery material. No arbitrary expiry/purge or duplicate credential store |
| **P2-RELEASE — Phase 01 G6 / F38.07** | **ERROR/BLOCKED acceptance**; engineering/security/QA/operations | Repair full verification; fresh exact installed/bundled/hosted/deployed advisory review; ingress/private-cache/role/restore/rotation; actual browser, fluent Arabic and assistive evidence. ASVS 5.0.0 L2 mapping with named reviewers is still required |
| **P2-OPTIONAL — F02.12/F02.13** | **Not selected; pending**; product + security | Explicit selection plus each operation's capability/policy/acceptance contract. Do not activate with a credentials flag or count unavailable controls passed |

These are scoped errors, not a demand to rewrite all Phase 01. Name CAS/G2, unrelated preference/public work and business/workspace functionality stay in their original artifacts. Recheck only affected consumers and record broader Phase 01 acceptance honestly. No risk exception is requested or approved.

## Project Structure

### Documentation (this feature)

```text
specs/008-strengthen-account-security/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
├── contracts/
│   ├── account-security.md
│   ├── presentation.md
│   └── security-and-evidence.md
└── artifacts/
    ├── specification-context.md
    ├── planning-source-identity.json
    └── planning-validation.json
```

`tasks.md` is not created by planning. A subsequent checklist/tasks step may schedule gate-resolution and independent work only until protected-effect readiness passes.

### Source Code (repository root)

| Boundary / owner | Existing paths and affected callers | Smallest eventual change, only if its gate passes |
| --- | --- | --- |
| Trusted identity / identity engineering | `lib/auth/server.ts`, `lib/account.ts`, `lib/profile.ts`, `app/actions.ts`, profile/context APIs | Reuse current authority; preserve verified/unbanned/unexpired checks and no-membership personal settings. Fix inherited trust defects in 007 first |
| Provider and proof / identity engineering | `lib/auth/account-security.ts`, account reauthentication/revocation routes, `lib/auth/client.ts` | Extend existing boundary after real adapter support; no parallel reauth/session system. Action vocabulary/wire payloads await approved matrix and protocol |
| Capabilities / web+identity engineering | `lib/auth/capabilities.ts`, `app/api/auth/[...path]/route.ts`, auth email/social components, callback | Preserve exact method/path deny-by-default; future operation-specific capability gates plus direct-provider control. No speculative path forwarding or raw SDK payload projection |
| Account presentation / web engineering | `app/(site)/[locale]/[theme]/app/account/page.tsx`, `components/account-reauthentication.tsx`, `application-shell.tsx`, `application-runtime.tsx`, shared UI | Add a truthful security section with existing shared primitives. Actual controls only for accepted capabilities; no new dashboard/global auth state |
| Shared privacy/admission / account+data+security | `lib/rate-limit.ts`, `lib/account.ts`, existing event/admission migrations, current email webhook/delivery owners | Approve new purposes/events and inventory first; reuse shared limits and essential security messages; no duplicate limiter or speculative outbox |
| Localization/lifetime / web+QA | `messages/en.json`, `messages/ar.json`, `lib/site.ts`, `proxy.ts`, callback, private profile/live consumers | Keep finite returns, browser/account language semantics, generation/dirty-form behavior and secret-free navigation |
| Verification / QA+security | `scripts/test-account*.mjs`, `test-auth-contract.test.mjs`, `test-auth-flows.mjs`, `test-rate-limit.test.mjs`, `test-account-browser.md`, profile/application/migration/email tests | Add meaningful cases only when behavior is implemented; explicit real provider/DB/browser/human campaigns and no missing-proof PASS |

**Structure Decision**: Extend the modular monolith's current owners. New component/test files may be justified by supported interactive behavior later; no specific new endpoint, repository abstraction, production table, dependency or migration is approved now. Module exports follow actual callers only. Use installed Next guides before implementation and current shadcn/React/composition skills for component work.

## Design and validation sequence

1. Revalidate installed wrapper/protocol and public managed capabilities, inventory unknowns and stop unsupported paths. Record exact target evidence requirements without contacting an unverified environment.
2. Establish an authorized isolated target and actual identity/fresh-proof/session/direct-entry behavior; correct prerequisites under 007's owning tasks.
3. Complete POL-03 using observed support; no guessed proof lifetimes, TOTP clock windows, code counts, challenge retries, listing ceilings or session-survival rules. Update the spec and its requirements checklist.
4. Revisit [data ownership](data-model.md) and [contracts](contracts/account-security.md) after the support/policy decision. Only then finalize exact payload schemas, action bindings, transaction boundaries and any necessary additive app-state storage.
5. Run the requirements/security checklist, then create bounded tasks and analyze. No protected-effect implementation while its gates fail. A truthful unavailable entry cannot satisfy F02.05 acceptance.
6. After implementation use converge, complete unmet requirements and execute [acceptance](quickstart.md). Report exact delivered IDs, disabled/unselected subflows and full demonstration result. Update root completion marks/totals only for accepted contracts.

No constitutional complexity exception is selected. The unresolved conditions are readiness errors, not justified violations or approved workarounds.

## Local execution checkpoint — 3 November 2026

[Scoped evidence](evidence.md) records the implemented informational entry and current tests/gaps. This changes no protected-operation contract or policy value. Actual managed/human/Next-route acceptance and the full verification gate remain incomplete; F02.05/F02.12/F02.13 and delivery totals stay pending. Resolve support/policy and applicable inherited gates, then revise supported design/checklist/tasks/analyze before protected implementation; finish local acceptance before final convergence.

## Authorized completion scope — 3 November 2026

The owner explicitly authorized all necessary work and environment access after the scoped informational delivery. This supersedes the earlier managed-only execution restriction for this feature: evaluate and implement app-operated Better Auth on Neon PostgreSQL, including TOTP, recovery, verified email change, explicit social link/unlink and passkeys. Earlier unsupported managed findings remain historically true and are not claimed resolved in Neon Managed Auth. Keep current accounts/workspaces and production data intact while building/test-migrating on a new schema-only isolated branch.

Auth ownership: Better Auth 1.7.15 in application-owned solodesk_auth schema, PostgreSQL adapter with transactions, no managed-schema writes. Maintain managed compatibility until an explicit configured cutover. Session IDs/user IDs remain UUIDs. No cached session authority. Every enabled entry creates only factor-pending authority for enrolled users until verified TOTP; no trusted-device bypass. Recovery-only authority cannot read application resources and ends with all-prior-session invalidation, replacement TOTP/current acknowledged recovery material and fresh sign-in.

Policy v008.1: six TOTP digits, 30-second period with library-supported clock tolerance, reject reuse of accepted codes for 90 seconds; five-minute enrollment/sign-in/action-proof expiry; one-success action/account/original-session/target-bound confirmation. Ten provider-generated recovery codes, one confidential presentation, no read-back, atomic consumption/replacement; acknowledge current generation before enrollment/recovery completion. Shared database-backed bounded attempts and temporary cooldowns, no permanent lockout. Existing password verification is required for sensitive configuration; owners lacking a password establish one through verified email recovery before configuration. Session checks and sign-out remain outside new-attempt admission. Never log/persist browser proofs or recovery material. Final exact enforced limits and integration observations belong in the policy/evidence records.

Migration: additive new schema; preserve original user IDs and workspace/business keys; do not copy sessions or trust old cookies into app-operated auth. Review password hashing/provider-token compatibility separately, requiring fresh proof/relink where unavailable. No production cutover from a successful synthetic fixture alone. Test migration/rollback and existing-caller compatibility before switching local configuration or production.
