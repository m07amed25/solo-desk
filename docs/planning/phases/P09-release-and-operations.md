# P09 — Website deployment, support and reliable service

Status: planned, not implemented or verified. Applies before every public release, including a core pilot. No native packaging or installer work is part of this phase.

## Entry prerequisites

Every included slice has current domain, security, design-system, browser/RTL/accessibility and recovery evidence. Neon/Better Auth setup, hosting/region/cost, email/files, retention and incident ownership are reviewed.

## Delivery checklist

- [ ] Produce a reproducible Next.js build, dependency/security review and isolated preview/staging deployment.
- [ ] Verify HTTPS, production headers/CSP, trusted auth origins/cookies/redirects, secrets and rate limits across instances.
- [ ] Rehearse compatible schema/auth migrations, stale open tabs, controlled rollout, monitoring, rollback or forward repair.
- [ ] Run tenant/session/CSRF/finance/concurrency/load/browser/accessibility tests and DB-plus-files restore/provider reconciliation drills.
- [ ] Publish supported browser/device matrix, enabled features, draft limits, service/quotas, privacy/retention/export policy and bilingual guidance.
- [ ] Record performance/query/job budgets, measured RPO/RTO, incident responder and vendor-exit path.

## Acceptance and exit evidence

- [ ] Sign-in, workspace switching, revocation and direct API/action denial pass on supported browsers.
- [ ] Two-member English/Arabic end-to-end journey includes reconnect and enabled draft failure/recovery behavior.
- [ ] Rollout failure and compatible recovery preserve accepted records and uncertain-operation receipts.
- [ ] Restore reconciles DB, protected auth, private files and later provider effects without duplicate financial action.
- [ ] No unresolved release-blocking tenant/data-loss/financial/security defect; disabled capabilities and service limits are explicit.

Evidence identifies exact source/build, browser/server environment, fixtures, commands and results. Open gates: Q-02/11/12/13/16. Shared shadcn/ui design-system reuse, scalable modules and appropriate patterns remain part of readiness review.

See [release operations](../../operations/release-and-support.md), [test strategy](../../quality/test-strategy.md), [acceptance](../../quality/acceptance.md) and [architecture](../../architecture/overview.md).
