# Acceptance matrix and release journeys

Status: planned acceptance, not executed product tests. Current website starter commands live in [setup](../development/setup.md); historical shell results are not website evidence. Each scenario expands into positive, negative, concurrency and recovery cases using its domain spec. The [coverage register](../planning/coverage.md) links all requirements to their acceptance family and primary phase.

| Scenario ID | Required result | Requirement family / phase |
| --- | --- | --- |
| A-PLT-01 Better Auth/account isolation | Website sign-in verifies identity; expired/revoked sessions fail; account switching cannot expose prior private views/drafts | PLT-001–003,006–007,010; P01 |
| A-PLT-02 Team permissions | Invite/accept/revoke once; last-owner safeguard; scopes apply to pages, lists/counts, search, exports, files and subscriptions | PLT-004–006,014,018; P01 |
| A-PLT-03 Browser drafts/reconnect | When enabled, IndexedDB draft+pending operation is atomic; quota/eviction never falsely succeeds; current grants/revisions and receipts govern replay/conflicts | PLT-008–010; P01 |
| A-PLT-04 Navigation/settings | HTTPS routes/Back/Forward/multi-tab behavior safe; personal/browser/workspace defaults scoped; browser notification denial/quiet hours work | PLT-011–013,015,017; P01 |
| A-PLT-05 Protection/recovery | Browser persistence stays gated by key/recovery proof; server DB-plus-files restore cannot revive sessions, numbers or stale financial commands | PLT-007,016; P01 |
| A-CRM-01 Relationship integrity | Client/contact merge/archive previews preserve references/snapshots; duplicates never merge implicitly | CRM-001; P02 |
| A-CRM-02 Pipeline/follow-up | Probability forecast separate from cash; lost/reopened history retained; reminders deduped and permission scoped | CRM-002–003,010; P02/P06 |
| A-CRM-03 Estimates/proposals | Alternative options total correctly; share freezes version; stale/expired acceptance cannot approve new terms | CRM-004–006; P02 |
| A-CRM-04 Contracts/onboarding/handoff | Amendment preserves executed original; blockers/waivers explicit; retry creates one mapped project | CRM-007–009; P02 |
| A-WRK-01 Task integrity/views | Hierarchy/dependencies reject cycles; statuses/filters/bulk failures consistent across views; keyboard drag alternative | WRK-001–004; P03 |
| A-WRK-02 Planning/templates | Capacity includes leave/missing estimates; recurrence/month-end deduped; template ID remapping and field migration preserve history | WRK-005–007; P03 |
| A-WRK-03 Controlled delivery | Change applies approved baseline revision only; published deliverable acceptance binds exact version; private thread/files stay private | WRK-008–011; P03/P08 |
| A-WRK-04 Portfolio/handover | Budget sources/health assumptions visible; member removal/task move/archive preserves time/finance and ownership repair | WRK-012–014; P03/P06 |
| A-TIM-01 Capture/recovery | Pause/resume/switch/stop conserves seconds; double stop/crash/sleep/clock jump retains confirmed evidence and reviews uncertain gaps | TIM-001–005,015–016,024; P04 |
| A-TIM-02 Rates/source edits | Split/merge/date/overlap/rounding preserve canonical seconds; effective rate policy explicit; allocated corrections retain history | TIM-006–013,023; P04/P05 |
| A-TIM-03 Review/import/reports | Submitted revision approvals, private cost visibility, multi-device overlap, raw imports/dedup and defined utilization reports | TIM-014,017–022; P04/P06 |
| A-FIN-01 Draft/issue/snapshot | Online issue transaction returns one number/snapshot/allocation set after lost response; draft/profile refresh explicit | FIN-001–007,029–030,034; P05 |
| A-FIN-02 Calculation policies | Exact currency precision, tax/discount order, credits/component remainder and report FX match approved independent fixtures | FIN-016–018; P05 |
| A-FIN-03 Settlement/correction | Partial/multiple/overpayment/credit/refund/reversal chains conserve obligation/cash; no duplicate available credit/source rebilling | FIN-010–015,028; P05 |
| A-FIN-04 Documents/delivery/privacy | Bilingual multipage PDF matches saved snapshot; private fields absent; failure does not unissue; delivery unknown reconciles | FIN-008–009,027,031,033; P05/P07 |
| A-FIN-05 Recurrence/agreements | Period/retainer allowance/deposit/subscription/proration/rollover/cancel/retry fixtures produce correct distinct obligations | FIN-019–020,032,035; P05 |
| A-FIN-06 Expenses/provider reconciliation | Splits/markup/reimbursement cannot double bill; provider fees/FX/out-of-order callbacks and bank import reconcile | FIN-021–026; P05/P07 |
| A-INS-01 Explainable reports | Each dashboard/formula/aging/forecast/margin result reconciles and drills down; no unlike-currency sum or missing-cost-as-zero | INS-001–006,010; P06 |
| A-INS-02 Search/knowledge/export | Notes conflicts preserve revisions; Arabic search/bidi handles identifiers; current grants filter snippets/counts/scheduled exports | INS-007–009; P06/P07 |
| A-INT-01 Provider authorization | Scope/account validation, secret isolation, token expiry/disconnect and wrong-repository/calendar mappings fail safely | INT-001–004; P07 |
| A-INT-02 Money/messages/webhooks | Verified callbacks, unknown replies, deduplication, bank/accounting mapping and private URL validation prevent unsafe effects | INT-005–008; P07 |
| A-INT-03 Rules/jobs | Dry-run inert; leases/retry/cancel/role change/month-end/DST/pause/quota/loop limits retain one effect and audit | INT-009–012; P07 |
| A-PORT-01 Guest/publication | Client A cannot read B; exact snapshots published; two/stale responses and revoked/expired links handled without privilege leak | CRM-011 + sync/portal spec; P08 |
| A-NFR-01 Bilingual/accessibility | Complete English/Arabic RTL, mixed bidi numeric/date/PDF fixtures, keyboard/screen-reader/focus/zoom checks | NFR-006–007; every phase |
| A-NFR-02 Integrity/recovery | Kill/space/key/backup/blob/migration/old-client/provider-restore cases conserve data and financial authority | NFR-001–005,010,013; every phase |
| A-NFR-03 Performance/cost | Agreed dataset/hardware benchmarks, bounded queries/jobs, quota/degraded behavior and no unlimited-free claim | NFR-008–009; P01/P09 |
| A-NFR-04 Supported release/privacy | Website deployment/migration/recovery, dependency/security review, redacted support and traceable evidence/runbooks | NFR-011–012,014–015; P09 |

## End-to-end release proof

Execute the cross-domain journeys in [test strategy](test-strategy.md) on supported browsers with two+ members/tabs/devices, connectivity loss, distinct role scopes and both languages. Include empty/missing/long/non-Latin data, wrong grants, data corruption, concurrent writes and retry. Compare PDFs/CSV/logical exports to authoritative source values, not screenshots alone.

Acceptance record template: scenario/requirement IDs; build/app/API/schema/policy versions; browser/version/device/locale; synthetic fixture; exact steps/failure injection; expected versus observed; screenshots/log hashes/artifacts with secrets removed; pass/fail; defect ID; reviewer/date. Do not record “pass” from code inspection alone. Requirements omitted from a release are explicitly disabled, not silently treated as accepted.

## Primary engineering acceptance

Shared shadcn/ui components and semantic tokens are reused across responsive English/Arabic screens (NFR-015/016). Module/pattern review and measured bounded queries/jobs/pooling prove the scalability design (NFR-017/019). Neon transactions and Better Auth sessions have real integration and negative authorization evidence (NFR-018). Security gates include session/tenant isolation, CSRF/origin, XSS/injection, files/secrets and recovery; static screenshots cannot prove them.
