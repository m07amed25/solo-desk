# Security, Lifecycle and Acceptance Contract

This contract selects concrete evidence for the feature; no row is a passed control. [Security release gates](../../../docs/security/release-checklist.md), [catalogue](../../../docs/security/vulnerability-catalogue.md), [operations](../../../docs/operations/release-and-support.md) and [data lifecycle](../../../docs/architecture/data-lifecycle.md) remain binding. Assign named people to the role owners during implementation.

## Trust-boundary and control map

| Controls                      | Boundary / concrete required evidence                                                                                                                                                                                                                                                                                        | Accountable role                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| SEC-001–008                   | Registration/sign-in/reset/verification, original-session fresh proof, current/revoked sessions: unknown/social-only recovery, expired/reused/superseded/wrong-purpose proof, login-CSRF, state replay, first-new-request revoke denial, 299999/300000 ms proof boundary, concurrent single use and invalid original session | Identity engineering + security                  |
| SEC-009–012, SEC-014          | Direct own-session/settings reads and writes, foreign references/operation IDs, injected actor/role/name fields, stale revisions, current authority before effects; safe projections/counts and no foreign-existence disclosure                                                                                              | Account engineering + security                   |
| SEC-017, SEC-019, SEC-022–025 | Bounded malformed/duplicate/conflicting JSON and form fields, canonical revisions, hostile display names/device labels/error content, safe server parser and failed-request limits                                                                                                                                           | Web/data engineering + QA                        |
| SEC-026–032                   | Actual ingress origins/framing/cookies/redirects/headers/forwarded-header trust, cross-identity document/RSC/history/cache tests, no protected browser storage or unsafe return URLs                                                                                                                                         | Operations + web engineering + security          |
| SEC-041–048                   | Restricted runtime/migration/operator roles, one-client transactions and pool reuse, CAS/proof/counter constraints, secret redaction/rotation, isolated preview, backup restore without resurrected authority, inventory/hold/purge races                                                                                    | Data engineering + operations + privacy/security |
| SEC-049–056                   | Exact source/lock/component/Node/native/managed/deployed inventory; fresh advisories and all 27 current audit findings triaged; no tooling-only presumption, no public debug surfaces; compatible migration/stale-form/rollback proof                                                                                        | Engineering + security + operations              |
| SEC-060–064                   | Verified existing auth-email webhook authenticity/replay, stable delivery claims, SMTP partial/unknown outcomes, redacted events, independently committed shared limits, DB/lock/timeout/outage faults with no invented success                                                                                              | Identity/data engineering + operations + QA      |

Map these controls to applicable **versioned** OWASP ASVS requirements during implementation/security review; selected SEC rows alone do not establish conformance. New boundary introduction requires reassessment. New uploads/portal/finance/business-provider functions stay excluded; existing protected consumers still need regressions if shared helpers change.

## Mandatory readiness errors

- **G1**: Missing managed list/revoke routing/shape/bounds, safe secret mapping, original-session password/social freshness or direct-origin enforcement is a blocking error for that identity/security work. Do not use a compatibility `getSession` as fresh proof, return raw Session tokens or mutate provider tables. Ordinary supported account use/sign-out remains separate from unavailable other-session controls.
- **G2**: No proven provider conditional name update means stale-name acceptance is blocked; separate provider/app-store saves are mandatory, with no false aggregate success. A larger app-owned profile migration needs explicit reviewed design rather than an invisible workaround.
- **G3/G4**: Exact method/abuse/challenge/retention/hold policies require current owners; fixture values must be labelled synthetic and cannot approve activation/deletion. Protect required records and preserve provider dedupe horizons, without claiming indefinite retention is approved.
- **G5/G6**: No live campaign without independently verified separate app/auth/database/runtime-role/synthetic-sink identity. No release acceptance without actual ingress, DB/session, browser/human, restore/rotation, advisory and owned finding results.

## Lifecycle operating contract

Before collection/activation, inventory each account/session/preference/proof/command/event/admission/email/contact/log/backup class, purpose, fields, locations/providers/subprocessors, restricted access, retention trigger/rule/version, hold authority and owner. Essential redacted security telemetry is distinct from optional product analytics/crash collection; optional collection stays off until explicit consent.

Provide a restricted operator procedure for hold placement/release and bounded cleanup, not a new member console. Serialize the same class/subject lock, check policy/holds/references, update app records and append attributable events in one transaction. Exercise held/unheld cleanup and concurrent hold placement/release. Provider, SMTP mailbox, hosting and backup retention/holds require separate real enforcement/evidence; an app hold row cannot certify them.

Auth delivery claims cannot be expired before provider retry windows are settled. Contact's inbox/receipt sends must not be described as an atomic transaction or exactly-once; repair unclear partial/lost-result retry behavior before claiming accepted/sent outcomes. No newsletter or notification-delivery platform is created.

## Evidence ledger

Each claimed acceptance records scenario + FR/SC + Phase 01 feature IDs; source/build/lock/runtime/schema/provider/policy identity; environment and synthetic fixture; browser/version/device/locale/theme; exact command/steps/failure injection; expected/observed; redacted artifact/hash; reviewer/date; finding/exception/owner; scope limitations. Current planning [source identity](../artifacts/planning-source-identity.json) and [audit](../artifacts/npm-audit-2026-11-03.json) are baseline evidence only.

Classify outcomes as source-inspected, local mock/domain, real PostgreSQL/restricted role, controlled mounted component, actual production Next browser, actual isolated managed provider, deployed ingress or human review. An unavailable category cannot inherit another category's PASS. Missing captured challenge or skipped scenario is BLOCKED, never an overall passing live run.

Reconcile historical Features 001–006 and root-plan notes only with current proof. Do not check a full supporting parent from this feature's smaller scope. All 11 product and 14 supporting entries remain scoped in the spec; later features receive no completion marks. No tasks, feature parents or risk exceptions are checked merely because a planning artifact exists.

## Compatibility, recovery and release

Expand app schema before activating writes; retain default reads for missing preference rows and compatible prior account surfaces. Document the old ambiguous browser-preference form's 409 refresh behavior and verify stale tabs. Any managed API changes or SDK update need renewed exact contracts/advisories; planning selects no upgrade.

Use unchanged numbered migration files/checksums, direct migration role and separate runtime permissions. Rehearse failed migration, unknown commit and code rollback/forward repair without deleting accepted preferences, audit or holds. Preserve proof consumption/expiry and invalidate restored identity material before reopening writes; do not resume restored revocation/send commands blindly. Measure authorized DB-plus-files recovery when applicable and account for external provider effects after the restore point.

Block release for policy/evidence gaps and defects under the existing gate. A finding needs verified remediation or an explicitly authorized, time-bounded mitigation/owner/expiry/retest; this plan grants neither. No provisioning, secret rotation, external email, live penetration exercise, deployment, branch commit or rollout is executed by this contract.
