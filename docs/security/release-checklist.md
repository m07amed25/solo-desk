# Security release gate

Updated 29 October 2026. For every included website capability, each applicable SEC control needs current evidence and an owner. Nothing below is pre-approved. Use [testing](testing.md), [findings](findings.md) and [operations](../operations/release-and-support.md).

## Before implementation and review

- [ ] Threat model, entry points, assets and trust assumptions updated for the feature.
- [ ] Applicable SEC and versioned ASVS requirements selected with owners and concrete negative tests; exclusions justified.
- [ ] Shared service/data-access/adapter/state/transaction patterns preserve validation, permissions and error handling.
- [ ] Planned sensitive browser persistence, auth plugins, file formats and provider flows pass their explicit security gates before activation.

## Before merging a relevant change

- [ ] Exact dependency/lockfile/component changes reviewed; fresh audit/advisory check completed or blocked with an owned finding.
- [ ] Direct invocation, cross-tenant/resource/action/field and revoked-session/grant denial cases pass with no prohibited effects.
- [ ] Input/output, CSRF/origin, cookie/redirect, CSP/cache and files/secrets checks cover affected paths.
- [ ] Real database transaction/constraint/pool isolation and relevant money/concurrency/idempotency cases pass.
- [ ] Jobs/provider callbacks use verified identity, current authority and uncertain-outcome reconciliation.
- [ ] Logs, error bodies, UI props and evidence artifacts are redacted; temporary test data is isolated.
- [ ] Required build/behavior tests pass; findings, migrations, docs and recovery guidance match the reviewed artifact.

## Before deployment/public exposure

- [ ] Deployed source/build/lock/runtime identities recorded and scanned; fixes are deployed rather than only committed.
- [ ] HTTPS/headers, host/proxy/CORS/auth origins, cookies, private caching and cross-instance rate limits verified at actual ingress.
- [ ] Production and preview databases, roles, credentials, private storage and provider endpoints isolated; no public debug/dev surface.
- [ ] Restricted runtime DB roles and current resource policy verified; relied-upon row policies cannot be bypassed by the runtime role.
- [ ] DB-plus-files restore, auth/session response, numbering/source preservation and later provider-event reconciliation rehearsed.
- [ ] Stale tabs/old contracts, failed rollout and compatible rollback/forward repair tested.
- [ ] Alert delivery/ownership, advisory review cadence, key/session revocation, incident access and retention defined and tested.
- [ ] No unresolved release-blocking finding; time-limited exceptions have verified mitigation, accountable owner, expiry and retest.

Missing results, unavailable feeds/tools, unknown advisory applicability and stale evidence do not pass. A feature disabled in production can be not applicable only with proof its entry points and privileged effects are unavailable. Development/build risk still needs assessment.

## Blocking and exception rules

Stop release for exploitable auth/tenant bypass, suspected compromise, exposed secrets, critical exploitable flaws, duplicate/unauthorized financial effects, unsafe sensitive storage or irrecoverable data loss. Contain an already exposed service through [incident response](incident-response.md). Other critical/high findings follow the [CVE policy](cve-and-dependencies.md) and the existing security policy's explicit mitigation/owner-decision rules.

Record each gate: exact release/source/build, included features and applicable SEC IDs, owner/date, evidence, status, finding/exception reference and recovery. A checkbox, scanner score or absence of reports cannot approve its own risk. User approval, merge and deployment follow current authorization and [delivery governance](../development/delivery-governance.md); no new remote action or automation is enabled here.
