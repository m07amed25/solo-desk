# Website verification strategy and release gates

Updated 29 October 2026. Future verification specification for the Next.js website. Current available commands are in [setup](../development/setup.md). No auth, Neon, business, accessibility or recovery gate passes merely by being documented.

| Layer | Target and required proof |
| --- | --- |
| Pure domain/property | Exact money/seconds, allocation conservation, rounding/credit policies, dates and rejected state transitions |
| Real PostgreSQL integration | Neon-compatible schema/constraints, transaction rollback/concurrency, receipt uniqueness, auth migrations, pool-reuse tenant isolation and least-privilege roles; an in-memory emulator is insufficient |
| Auth/API/actions | Better Auth session expiry/revocation/recovery, current grants on direct requests, CSRF/origin/redirect rejection, bounded payloads and minimum projections |
| Browser drafts/collaboration | Eligible IndexedDB atomicity, key/expiry/account isolation, quota/eviction/denial, reload, duplicate/lost replies, conflicts, stale tabs and schema compatibility when enabled |
| Website end-to-end | Actual browser sign-in/workspace navigation/forms/uploads/downloads, Back/Forward/deep links, multi-tab conflicts and online-required finance |
| Jobs/providers | Leases, bounded retries, expired/revoked grants, signed duplicate/out-of-order callbacks, unknown outcome reconciliation, provider quota and dead letters |
| Design system/UI | Shared shadcn/ui reuse and semantic tokens; variants/states, light/dark/System, phone/tablet/wide-screen, English/Arabic RTL, keyboard/focus/touch, screen readers, reduced motion and zoom |
| Documents | Frozen invoice/proposal/report snapshots, exact values, Arabic shaping/embedded fonts, multipage layout, CSV formula safety and private-field exclusion |
| Release/operations | Reproducible build, HTTPS/headers/secrets, compatible migrations/rollout, auth invalidation and DB-plus-files restore with measured RPO/RTO |

## Required journeys and failure cases

Owner signs in and invites Contributor/Finance; grants restrict pages, list counts, search, files, exports and notification content. Two members edit work, including a supported disconnected draft; conflicts retain permitted candidates. Revoke a role/session while a tab is open and verify next requests cannot use old authority. Switch accounts without exposing prior views/drafts.

Finance issues one invoice after a lost response; source seconds/expense amounts, number, snapshot, audit and receipt stay atomic. Partial payments/credits/refunds conserve balances and never release work implicitly. Approved fixtures cover 0/2/3-decimal currencies, rational rates, tax/discount order, tiny lines, partial credits, FX/fees, deposits, retainers and recurrence.

Portal guests see only exact publications, cannot enumerate sibling content and cannot accept a superseded version. Restore old DB/files after later provider activity and invalidate restored auth material; reconcile without replaying money or sends. Test wrong/corrupt/missing archives/files and interrupted migrations/imports.

## Browser, device and data matrix

Proposed initial matrix: current supported Chromium, Firefox and Safari/WebKit engines; phone 390×844, tablet 768×1024 and wide 1280×800/1440×900. Q-11 owns final browser/version/device support. Verify 320 CSS-pixel reflow, 200% zoom, touch, forced colors and reduced motion. Include NVDA/VoiceOver and a supported Linux browser/screen-reader combination where claimed; engine automation alone does not establish real-device/assistive support.

Test light/English, dark/English, light/Arabic RTL and dark/Arabic RTL, long/mixed-direction names and IDs, Arabic digits, missing values, zero data, large amounts, DST/clock jumps, browser storage denial/eviction, malicious markup/URLs/files/CSV, revoked permissions and quota exhaustion. Use isolated synthetic databases/provider sandboxes; previews never silently inherit production data/secrets.

## Scalability budgets and evidence

Reference dataset proposal: 50 members, 500 clients/projects, 10,000 tasks, 100,000 time entries and 10,000 issued documents. This is a benchmark fixture, not a service/seat guarantee. Record device/network/region, warm/cold DB state, connection concurrency, query plans, data volume, client bundle size and job backlog.

Proposed targets to validate: p75 LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 on declared devices/networks; p95 ordinary accepted command ≤1 s at a declared 50-ms RTT baseline, excluding provider jobs. Bound pagination, search, import/export and job batches; set concrete resource budgets from measurements before release. Do not weaken authorization/finance or claim a free plan meets targets without evidence.

## Definition of done

A feature needs reviewed rules, component reuse, module/pattern rationale, current permissions, bounded queries/jobs, migration/recovery, meaningful positive/negative/concurrency cases and bilingual responsive accessibility evidence. Record exact source/build/environment/browser, fixture/policy versions, commands/results/artifacts and unresolved limitations. Native historical evidence cannot establish website readiness.

Block tenant leakage, stolen/revived sessions, exploitable CSRF/XSS/injection, duplicate financial effects, unrecoverable data loss, unprotected persistent drafts, critical Arabic/keyboard failure and destructive incompatible migration. [Acceptance](acceptance.md) and [release operations](../operations/release-and-support.md) define user-visible and operational outcomes.

Security-specific negative cases, SEC control IDs, scanner limits and evidence requirements live in the [security testing guide](../security/testing.md). Apply the [security release gate](../security/release-checklist.md); record unavailable scans and unresolved applicability in the [findings register](../security/findings.md).
