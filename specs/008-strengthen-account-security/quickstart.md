# Validation Guide: Account Protection

This is a staged run guide, not proof that MFA exists. The current plan has protected-effect readiness errors. Use [research](research.md), [operation contracts](contracts/account-security.md), [data ownership](data-model.md) and [evidence rules](contracts/security-and-evidence.md). No positive managed Phase 02 harness or endpoint is created by planning.

## 1. Readiness and local commands available now

Use the existing repository/lockfile/runtime; no installation, upgrade or migration is needed for documentation or guard validation. Preserve current dirty work. Planning inspected Node v24.21.0 and the versions recorded in [source identity](artifacts/planning-source-identity.json).

Existing no-network guard self-checks, runnable from repository root:

```bash
node scripts/test-auth-flows.mjs --self-check
node scripts/test-account-postgres.mjs --self-check
node scripts/test-account-security-postgres.mjs --self-check
```

Expected: guard/source self-checks exit 0 without contacting provider/DB, loading a real integration target or printing secrets. These prove guard behavior or SQL/source structure, not actual PostgreSQL grants, challenge support or identity acceptance. Capture actual results separately in [planning validation](artifacts/planning-validation.json); a failure is not a passing skip.

Existing imported mocked tests for subsequent changes, **not claimed executed by this plan**:

```bash
node --test scripts/test-account-security.test.mjs scripts/test-account-sessions.test.mjs scripts/test-account.test.mjs scripts/test-rate-limit.test.mjs scripts/test-auth-contract.test.mjs scripts/test-application.test.mjs scripts/test-header-auth.test.mjs
node scripts/check-translations.mjs
npm run test:email
```

Expect meaningful own/foreign/stale/proof/concurrency/admission/state assertions and existing translation/email regressions to pass. Extend tests only for actual supported new behavior; their presence/pass cannot establish Phase 02 MFA acceptance. Run profile/site/migration/workspace caller regressions if their shared boundaries change. A source-matching assertion is not a substitute for direct operation denial.

After implementation changes, run the existing complete gate once for the reviewed candidate:

```bash
npm run test:full
```

This chains lint → Next typegen → TypeScript → translations → Node/email tests → production build; failure stops later stages. Current root Phase 01 records a lint failure, not a passing full gate. Builds can consult configured targets; verify runtime isolation first. Do not rerun an unchanged full suite merely for these documentation artifacts. Public advisory sampling in research is not a fresh npm audit or exhaustive deployed review.

## 2. Resolve support and policy before positive MFA work

1. Recheck actual installed wrapper/upstream code against current managed documentation and record unsupported/unproven operations. Do not install upstream plugins or change backend ownership to make a demonstration possible.
2. Under Feature 007 G5, obtain independent authorized nonproduction app/auth/database/runtime/migration-role/provider/OAuth/synthetic-sink mapping. An existing `.env.local`, test manifest, branch name or local PostgreSQL instance does not establish isolation or authorize a live campaign. Never print secrets or test production-derived identity data.
3. Confirm managed support for every selected operation, original-session freshness and direct-origin policy, including every enabled social/reset/recovery path. If still unsupported, stop positive journeys as blocked; do not probe arbitrary hosted routes.
4. Approve the exact POL-03 action matrix, update the spec/register and pass its two open requirements-quality items. Preserve recovery's all-prior-session revocation rule; do not invent remaining proof/challenge/retry/admission values.
5. Finalize supported wire/data contracts, threat/ASVS/control review and any necessary additive app metadata. Then checklist → bounded tasks → analyze before implementation.

## 3. Existing integration tooling and its limits

`node scripts/test-account-security-postgres.mjs --local` starts disposable local PostgreSQL and tests schema/concurrency when PostgreSQL binaries/process permissions are available. It is not managed acceptance. Self-check mode does not start this server.

Existing Phase 01 identity runner, **only after independently verified G5 authorization, current harness review and explicit bounded campaign scope**:

```bash
node scripts/test-auth-flows.mjs --integration --manifest /tmp/solodesk008-isolated-target.json
```

The path is illustrative; this plan creates no manifest or target. This runner covers its implemented Phase 01 identity scenarios, not Phase 02 enrollment/recovery/passkeys. Review its current challenge capture/scenario accounting and require missing proof to remain nonpassing. The account-security PostgreSQL script's manifest validation alone is not a remote provider campaign. Do not advertise unsupported flags/commands or invent a Phase 02 runner.

No migration is selected by this plan. If supported protocol later demonstrates an app-state need, inspect applied history, create/review a new additive migration and use the existing direct-role runner only against an authorized target. Never edit an applied file or write managed auth credentials/factors with SQL.

After a supported implementation and isolated configuration exist, existing local server commands can host the reviewed candidate:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

A successful build, loopback page or mock session is not real provider proof. Do not start a process with inherited unverified production configuration.

## 4. Actual managed acceptance campaign after support exists

Use two synthetic accounts with at least three sessions each, approved policy/config versions and known expected method state. Use actual supported provider UI/exchange and explicit test steps from the finalized contracts; record commands/steps, state changes, session cookies safely, expected/observed results and no-effect assertions without capturing secrets.

| Campaign                                      | Required outcome                                                                                                                                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enrollment and subsequent sign-in             | Explicit owner confirmation, TOTP possession, one-time recovery material/custody acknowledgement and accurate provider status; subsequent sign-in requires the enrolled factor                                                        |
| Every enabled primary/reset/recovery path     | Password/social and any selected passwordless path cannot grant normal access before selected protection; repeat via managed origin, caches and restored browser state                                                                |
| Proof denial                                  | Invalid/expired/consumed/superseded/wrong-account/session/purpose/action/origin proof produces zero factor, identity or session effects; exact approved boundary times/clock rules tested                                             |
| Recovery and code races                       | One code works once under concurrent attempts; replacement invalidates old material; lost reply/last-code exhaustion reconciles without blind new use; no secret read-back                                                            |
| Post-recovery authority                       | Every pre-existing session including initiating session fails its first new protected request; supported restricted continuation restores confirmed factor/material and fresh protected sign-in, without resurrecting the old session |
| Disablement and cross-method last-route races | Fresh explicit owner proof; simultaneous removals cannot violate enrolled configuration; voluntary disablement preserves an accepted usable primary route                                                                             |
| Outage/unknown commitment                     | Accurate pending/unknown state; same original operation/target; no duplicate/contradictory effect, proof release, external rollback claim or false success                                                                            |
| Foreign/stale direct operation                | Another account or revoked/expired original session gains no status/metadata/credential change; recheck immediately before every new effect                                                                                           |
| Shared abuse and ingress                      | At least two app instances share approved caps; denied attempts have zero effects, outage fails closed for new work while normal session/sign-out authority checks remain; direct provider equivalents cannot bypass                  |
| Optional identity/passkey cases               | Currently unselected, so remain unaccepted. If later selected, add email cancellation/link collision/no implicit merge/stale proof and passkey cancellation/origin/replay/unsupported-device/loss/removal cases                       |

No current browser can make an unavailable managed factor work. If any required operation cannot be demonstrated, keep its gate open and identify its owner rather than report full PASS.

## 5. Browser, human and release acceptance

Run actual production-Next account and sign-in journeys, not only mounted mocked components. Cover English/Arabic × Light/Dark/System on phone/tablet/wide layouts, 320 CSS-pixel reflow, actual 200% zoom, reduced motion, keyboard/mobile recovery and long mixed-direction identifiers. Follow the existing account browser procedure for dirty navigation, locale/theme departure, expiry/sign-out/switch, delayed replies and BFCache.

Record screen-reader/focus/announcements/contrast and fluent-Arabic human review separately from key parity/screenshots. Include unsupported/cancelled authenticator prompts only if their method is selected. Run SC-008 with at least five people covering both languages; four complete specified active interactions in five minutes excluding external waits, and all identify protection state correctly. A scripted operator is not that result.

Before acceptance, obtain current exact lock/bundled/runtime/managed/deployed advisory applicability, actual trusted ingress/cookie/CSRF/private-cache/role isolation, permitted minimal data inventory/retention and recovery/rotation/restore evidence. Missing tools, environments, browsers or reviewers remain explicit gaps under the existing release gate.

After implementation use converge and complete resulting gaps/tasks. The final report must distinguish supported implementation, commands/observations, disabled/unselected scope and provider/environment/human limits. The full Phase 02 demonstration is enrollment → factor sign-in → approved recovery → stale identity-change proof denial. F02.12 being unselected means a smaller MFA increment cannot claim the full demonstration or entire phase complete. Update root marks/totals only for accepted contracts.

## Local execution checkpoint — 3 November 2026

[Scoped evidence](evidence.md) records the implemented informational entry and current tests/gaps. This changes no protected-operation contract or policy value. Actual managed/human/Next-route acceptance and the full verification gate remain incomplete; F02.05/F02.12/F02.13 and delivery totals stay pending. Resolve support/policy and applicable inherited gates, then revise supported design/checklist/tasks/analyze before protected implementation; finish local acceptance before final convergence.
