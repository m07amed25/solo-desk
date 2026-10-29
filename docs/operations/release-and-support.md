# Website deployment, service operations and support

Updated 29 October 2026. Target policy for the Next.js website, Neon PostgreSQL and Better Auth. No hosted environment or deployment pipeline has been provisioned by this documentation update. Hosting, region/cost, email/private files and recovery objectives remain open.

## Environments and delivery

Separate local, preview/staging and production databases, secrets, auth origins, file storage and provider sandboxes. Use synthetic preview data. Production-derived Neon branches retain production sensitivity; branch creation does not anonymize data. Repository holds reviewed source, dependency locks, migration history and configuration names, never secret values.

Pipeline: docs/type/lint/build checks → domain tests → real PostgreSQL/auth/tenant/concurrency tests → browser/design-system/RTL/accessibility journeys → dependency/security review → isolated preview → compatible migration/restore rehearsal → authorized staged production rollout. Shared shadcn/ui reuse, module/pattern boundaries, query/job bounds and measured performance are part of review. Native installers, OS signing/notarization and desktop updaters have no release role.

Deploy server-capable Next.js hosting compatible with Better Auth, the selected Neon driver and required transactions/jobs; a static export cannot supply these services. Verify HTTPS, production cookie/origin/redirect settings, CSP/security headers, secret handling, private-cache behavior and cross-instance rate limits. Restrict preview authentication origins explicitly.

Rollout records source/build, migration/auth schema versions, enabled features and compatibility window. Expand schema before enabling new writes; handle stale open tabs safely. Monitor canary health and pause/roll back code only when data compatibility is proven; use forward repair otherwise. Unknown financial/provider outcomes are resolved through receipts before retry. No rollout clears accepted data, browser drafts or immutable history silently.

## Quotas and observability

Monitor Neon connections/compute/storage/latency, auth failures/revocation, denied scopes, query cost, file/egress usage, email/provider limits, draft conflicts, job backlog/dead letters and backup/restore health. Verify current provider limits/pricing at provisioning and release; no free-tier backup or availability guarantee is inferred. Bound jobs, pages and batches before raising capacity.

Essential metrics/logs use redacted correlation IDs and minimal metadata; never include tokens, passwords, URLs carrying credentials, raw environment dumps or customer documents. Product analytics/crash uploads are opt-in. Define access and retention before external monitoring. Proposed usage alerts at 70/85/95% need owner-approved caps. Degrade nonessential work first, preserve accepted financial history and show truthful pending/offline states.

## Incidents and recovery

Detect/triage → assign responder → contain unsafe actions/revoke credentials → preserve restricted evidence/audit → communicate through approved channels → repair/reconcile → validate → record prevention. This runbook does not itself authorize sending messages. Scope support hours and incident ownership under Q-16.

Back up Neon data and private object bytes with manifests; protect auth-bearing service backups. Restore into isolation, validate constraints/balances/numbers/receipts/files, invalidate restored sessions/tokens as needed and reconcile later payments/provider callbacks/jobs before reopening writes. Never blindly replay sends or money effects. Measure RPO/RTO through actual drills and verify selected Neon plan recovery/retention capabilities. Browser draft storage is not a service backup.

No destructive database-reset command exists in the current manifest. Do not execute historical hosted-reset procedures against this website. Future maintenance requires a named isolated environment, verified backup/restore, exact scope and current authorization before destructive changes.

## User support, retention and portability

Ship English/Arabic guidance for Better Auth/MFA recovery, invitations/grants, sessions, approved browser drafts/storage limits, timer suspension/recovery, issuing/corrections, exports/imports, provider revocation and closure. Distinguish unsaved, saved in this browser, server accepted and unknown outcomes. No guaranteed background execution, storage persistence or remote wipe is promised.

Support bundles preview redacted version/error/health fields and exclude databases, secrets, private content and raw dumps by default. Temporary support access requires tenant authorization, purpose, expiry, minimum scope and audit. Staff cannot silently become workspace Owner.

Publish retention/legal holds, draft expiry, account/workspace deletion, private-file/audit/backup expiry and export grace. Portable exports preserve exact financial snapshots, allocations/corrections, attachments and provenance while excluding auth secrets. Practice vendor exit without renumbering invoices or replaying side effects; rotate active credentials rather than distributing them in ordinary archives.

If sold, keep SoloDesk plan/seat billing separate from client business invoices/subscriptions. Prices, trials, grace, seat counts and cancellation terms remain Q-12. Downgrade preserves read/export rights under approved policy, accepted financial history and recovery.

## Release gate

- [ ] Enabled requirements/profiles and supported browser/device versions declared; legal finance profiles reviewed.
- [ ] Better Auth/session/tenant/CSRF/input/file/secrets controls pass; no unresolved blocking security defect.
- [ ] Shared shadcn/ui/design-system, responsive English/Arabic and accessibility journeys pass.
- [ ] Neon transactions/concurrency, bounded workload budgets, compatible migration/rollout and recovery pass.
- [ ] DB-plus-files restore, auth invalidation, provider reconciliation and measured recovery objectives evidenced.
- [ ] Draft limits, quotas, privacy/retention, support ownership and disabled capabilities published.

Every item requires current build-specific evidence. None is marked implemented by this documentation.

The [security release checklist](../security/release-checklist.md) expands these gates. Follow [CVE/advisory management](../security/cve-and-dependencies.md) for inventory and remediation, and [security incident response](../security/incident-response.md) for containment/recovery. No monitor or recurring scan is activated by this documentation.
