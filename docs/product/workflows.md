# End-to-end workflows and state ownership

Proposed behavior; no business workflows implemented. Detailed state machines belong to domain specs; this document joins them across modules. All flows use the shared shadcn/ui design system, current Better Auth session/resource grants, scalable application services, Neon transactions, audit and explicit browser/server state. [Architecture/patterns](../architecture/design-patterns.md) defines shared implementation boundaries.

## 1. Account → team → browser workspace

Website Better Auth sign-in → verification/recovery settings → create/join workspace → invite scoped members → obtain current grants → load permitted views. Missing network/session/permission shows recovery, never an empty replacement business database. Enable eligible protected offline drafts only after browser key/eviction/expiry proof; otherwise disclose that in-memory input can be lost on reload/close. Switching accounts/workspaces clears prior private views and isolates any approved draft state.

## 2. Lead → agreed work

Create client/contact → qualify opportunity → record discovery/follow-up → compare estimate scenarios → prepare proposal v1 → share exact version → record manual or authenticated acceptance evidence → agreement/SOW/onboarding → preview project handoff → create once. Changing shared terms creates a revision; stale acceptance is a conflict. No proposal acceptance fabricates payment, issued invoice or legal-signature verification.

## 3. Project → controlled delivery

Create planned project/template → assign scoped members/tasks → add estimates/dependencies/milestones → activate → work/review → publish selected deliverable version → accept/request changes → complete with unresolved-work/billing preview. Change requests create a new baseline only after exact-version approval. Archive is reversible and never erases time/finance/audit. Client publication is explicit and cannot include internal notes/costs accidentally.

## 4. Work → reviewed time

Select active project/task → durable start → pause/resume/switch → stop/save once → review idle/sleep/anomalies → submit/approve if enabled → eligible billable source. Server revisions coordinate online tabs/devices; eligible offline candidates and suspension gaps require reconciliation before billing. Completing a task, importing a commit, attending a meeting or starting a focus session does not itself create billable time. Billed source edits follow adjustment/credit flows.

## 5. Draft → online issue → collection

Create a server draft, or an eligible offline draft after browser-storage proof, from manual lines and provisional eligible source candidates → reconnect/sync → authoritative reservation/revision check → preview exact tax/discount/rounding/parties → online issue transaction → obtain committed identity/number → export saved snapshot → explicit share/provider delivery → record partial/multiple payments → reconcile remaining balance. A lost finalization response means check operation receipt, never create a replacement number. Overdue is derived from due date and outstanding balance; issued/delivery/settlement/dispute are distinct states.

## 6. Correction, credit, refund and dispute

Identify issued source/document → preview affected entitlement/debt/cash → require finance authority/reason/approval where configured → issue linked credit or post compensating event → allocate/refund explicitly → recalculate projections. A refund can reopen debt unless linked adjustment removes it. Credit/refund never silently releases time for rebilling. Voiding is policy/market constrained; historical numbers/snapshots remain. Unsupported jurisdiction behavior stays disabled.

## 7. Expenses, retainers and subscriptions

Record expense/receipt → approve/split → select reimbursable amount/markup/currency → reserve source → issue once → reconcile payment. Retainers distinguish prepaid money versus included service units; consumption links actual eligible work. Subscription/recurring schedule stores accepted plan/period/revision/timezone, generates one draft per occurrence, and applies explicit proration/rollover/end policies. Missed scheduled work is visible and idempotent; no automatic debit without enabled provider authority.

## 8. Offline conflict → accepted sync

Approved IndexedDB draft+pending operation → show pending → push authenticated dependency-ordered commands → server checks current membership/revision → accept/merge or retain conflict/rejection → apply pull+cursor atomically → synchronized. Same-field edits preserve local/base/remote candidates; financial facts do not merge. Removed member cannot replay old privileges. Unsupported protocol asks upgrade while preserving capture. A stale browser draft refreshes against current server state before submission when outside retention/compatibility.

## 9. Automation / portal

Authorized owner configures typed rule/provider scope → dry-run → enable → event/schedule creates durable job → lease/recheck → domain command/provider call → reconcile receipt → audit/notification. Guest sees only published exact versions; approvals bind identity/version and are idempotent. Disconnect/revocation stops future actions, not already received downloads/messages. No AI is included.

## 10. Recovery, closure and export

Choose archive/export/backup → validate scope/encryption/manifest → stage isolated recovery → compare current authority → reviewed rejoin/import eligible changes. Never overwrite Neon authority with a browser snapshot or replay old finance commands or restored sessions. Account closure checks ownership transfer, outstanding obligations, export and retention; cancellation of SoloDesk's product plan is separate from cancelling client contracts/invoices.

## Universal failure behavior

Retain unsaved input/local capture; show whether operation committed, rejected or unknown; reuse operation IDs; provide bounded retry/reconcile rather than silent duplication. Read failure is not an empty workspace. PDF/upload failure retains source records. External delivery failure does not unissue or renumber. Permission errors avoid leaking hidden targets. Each recovery action has keyboard and Arabic equivalents. [Acceptance](../quality/acceptance.md) specifies required evidence.

All offline flows inherit [browser storage/security gates](../architecture/sync-and-collaboration.md); documentation does not claim browser persistence or closed-tab execution is guaranteed.
