# Security, Readiness and Evidence Contract

No row is a passed control. Apply the [existing release gate](../../../docs/security/release-checklist.md), [catalogue](../../../docs/security/vulnerability-catalogue.md), [testing](../../../docs/security/testing.md) and [operations](../../../docs/operations/release-and-support.md). This plan neither approves a risk exception nor grants live target/provisioning/deployment authority.

## Trust boundaries and blocking threats

| Boundary / assets                                             | Principal abuse and required protection                                                                                                                                                  |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser → account services                                    | Stolen/stale session, forged actor/target/freshness and cross-origin mutation: trusted current identity, exact input/origin/CSRF, action-bound proof and side-effect rechecks            |
| Primary sign-in/recovery → protected app                      | Alternate-entry, session-cache, callback and recovery-factor bypass: no normal protected authority before selected factor/restored protection; direct provider enforcement required      |
| App → managed provider and direct provider clients            | Wrong-account linking, replay, last-route races and ambiguous commit: supported same-account transactions/concurrency/reconciliation; app locks cannot govern direct clients             |
| Confidential factor/code material → UI/logs/analytics/storage | Credential loss/read-back: dedicated transient exchange, minimal projection, redacted diagnostics, no navigation/log/persistent-store leakage                                            |
| App metadata/admission/event storage → pooled DB/restore      | Cross-account reads, duplicate dispatch, refunded retries and resurrected authority: restricted roles, atomic claims, deterministic shared admission and restore/provider reconciliation |
| Production/preview/provider configuration                     | Synthetic campaigns reaching real identity/data: independent isolated mapping, no production-derived fixtures and explicit current authorized test scope                                 |

A malicious own-account user, forged request sender or holder of a stolen/revoked session must gain zero foreign identity, protection downgrade or unauthorized session. No adversarial campaign is authorized by enumerating these cases.

## Controls, owners and concrete acceptance

Assign named people to these accountable roles before security/release acceptance. Complete applicable exact **ASVS 5.0.0 Level 2** requirement mapping in the security checklist/review; older ASVS 4 rows in Feature 007 do not satisfy that target. This missing mapping is part of P2-RELEASE, not a conformance claim.

| Controls                      | Required positive/negative evidence                                                                                                                                                                                                                  | Accountable role                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| SEC-001–008                   | Confirmed TOTP enrollment; every-entry challenge; purpose/account/session/action binding; expired/replayed/consumed proof; recovery one-use/races/all-prior-session invalidation; cache/direct-origin bypass denial and first-request revoked denial | Identity engineering + security                |
| SEC-009–012, SEC-014          | Own-only reads/actions/status, foreign IDs/field injection/count leakage, original-session loss between targets/effects and no client target snapshot authority                                                                                      | Account engineering + security                 |
| SEC-017, SEC-019, SEC-022–025 | Exact bounded schemas, unexpected/duplicate/deep/malformed fields, hostile method labels/provider errors, safe parser/time/resource failures and no secret reflection                                                                                | Web/account engineering + QA                   |
| SEC-026–032                   | Actual origin/CSRF/cookie/redirect/forwarded-header/ingress, private RSC/history/cache isolation, no sensitive browser persistence                                                                                                                   | Web engineering + operations/security          |
| SEC-041–048                   | Narrow runtime/migration roles, no credential-table write/readback, necessary metadata constraints/races/pool isolation, isolated previews, provider secret custody and restore without revived auth                                                 | Data/identity engineering + privacy/operations |
| SEC-049–056                   | Exact local/bundled/managed/deployed dependency/advisory applicability, safe generated components, supported migration/rollback/stale-client behavior and artifact provenance                                                                        | Engineering + security/operations              |
| SEC-060–064                   | Authentic provider return/callback binding, one intended effect under concurrent/lost replies, bounded reconciliation, minimal redacted events and two-instance admission/outage behavior                                                            | Identity/account engineering + QA/operations   |

No new finance, upload, portal or business integration is selected; their feature-specific controls are outside this increment. Shared protected consumers still require regressions if their boundaries change. Reassess controls whenever new supported operations/storage introduce a boundary.

## Evidence matrix and scope trace

| Requirements / outcomes        | Mandatory scenarios and evidence category                                                                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-001–002; SC-001/008/010     | US1 truthful own security entry, unavailable/unknown distinction and findability. Actual UI review; visibility alone never proves MFA                                                                           |
| FR-003–013; SC-002/004/006/009 | Direct app/provider foreign/stale/replayed authority, malformed input, exact origin/cache/secret checks, duplicate intent, uncertain effect and two-instance admission/outage                                   |
| FR-014–019; SC-001–004/006     | US2/US3 actual supported enrollment/subsequent sign-in/recovery/disablement; concurrent one-code use/replacement, exhaustion, all-prior-session invalidation and last-route safety across entry/method families |
| FR-020–024; SC-002/004–006     | Conditional US4 email cancellation/verification/collision, no implicit merge, owner-preserving link/unlink/session outcomes. Currently unselected, not a passing scenario                                       |
| FR-025–029; SC-001–004/006     | Conditional US5 registration/authentication/list/removal, cancellation/unsupported devices, origin/replay mismatch, primary-vs-second-factor distinction and lost-device recovery. Currently unselected         |
| FR-030–032; SC-007–008         | Every enabled journey in English/Arabic × three themes, keyboard/mobile/320px/actual zoom, error/unknown recovery, named fluent/assistive and five-person usability reviews                                     |
| FR-033–034; SC-010             | Exact source/build/policy/environment/version evidence, supported/disabled/unselected scope and four-step phase demonstration; missing or unavailable evidence cannot become accepted                           |

Each observation records feature/FR/SC/scenario, source/build/lock/installed/hosted configuration and policy versions, verified isolated app/auth/database/roles/provider/sink, synthetic account/method/session fixture, browser/device/locale/theme when relevant, exact command/steps/fault injection, expected vs observed, redacted artifact/hash, reviewer/date and owner/status of limitations.

Maintain separate result categories: source inspection, local imported mock/state machine, guard self-check, actual PostgreSQL, actual managed provider, actual app/browser, deployed ingress and human review. Supported/unsupported/unproven are capability assessments, not test PASS results. A manifest validation or guarded integration skip must never report a successful provider journey. Result labels are passed, failed, not run, unavailable or not applicable with rationale; no absent evidence inherits another category's PASS.

## Recovery, compatibility and release

Provider effects are not atomic with application metadata. No blind retry, duplicate dispatch, arbitrary reauthentication extension or cancellation-as-rollback. An initiating session revoked by recovery cannot read status or resume a privileged command; only demonstrated provider-bound limited continuation or fresh compliant sign-in may resume permitted work. Unknown outcome stays unknown until reconciled under valid authority.

Any demonstrated app metadata need uses additive immutable migrations after applied-history/grant review, with explicit stale-client compatibility and forward-repair/rollback limits. Keep managed authentication ownership. Restore must reconcile provider state and invalidate restored sessions/proofs/recovery effects before reopening writes; do not replay effects from backup merely because an app receipt is pending. Minimal events and optional collection follow reviewed inventory/retention/holds; no indefinite-retention or arbitrary purge default.

Release remains blocked by P2-CAP/P2-POL and applicable Feature 007 gates, failed full checks, unknown deployed/hosted advisory applicability, ingress/isolation or missing required human evidence. A supported unavailable UI is not a passing enrollment/recovery implementation. No forced dependency fix, public rollout or time-bounded exception is approved by this plan.

After implementation, converge → complete unmet requirements → acceptance. Report implemented supported IDs/subflows, commands/results, provider/environment/human limitations, disabled/unselected capability and unresolved prerequisites. Explicitly report whether **enroll supported factor → sign in with it → exercise approved recovery → reject stale identity-change proof** passed. Since F02.12 is unselected, a successful smaller MFA increment alone cannot claim the full demonstration or all Phase 02 contracts. Update root marks/status/totals only after actual acceptance, leaving pending IDs open.

## Local execution checkpoint — 3 November 2026

[Scoped evidence](../evidence.md) records the implemented informational entry and current tests/gaps. This changes no protected-operation contract or policy value. Actual managed/human/Next-route acceptance and the full verification gate remain incomplete; F02.05/F02.12/F02.13 and delivery totals stay pending. Resolve support/policy and applicable inherited gates, then revise supported design/checklist/tasks/analyze before protected implementation; finish local acceptance before final convergence.
