# Screen map and required states

Status: information architecture proposal, not implemented UI. Current implementation is a minimal Next.js starter. Shared shadcn/ui components and a scalable design system are primary; Neon/Better Auth and per-action server security are required; English/Arabic RTL applies to all future surfaces. The [UI design system](../../DESIGN.md) and [detailed screen contracts](../design/screens.md) expand this map with visual foundations, spacious geometry, paired themes and per-surface fields/actions/states.

## Navigation and screen responsibilities

| Surface | Required information/actions | Access/online rules |
| --- | --- | --- |
| Sign-in/recovery/enrollment | Better Auth website sign-in, verification, approved MFA/recovery and session status | First sign-in online; no cached tenant data exposed to other account |
| Workspace switcher/onboarding | Current tenant, invited scopes, profile/configuration readiness | Membership/workspace creation online |
| Home/command palette | Assigned work, reviews, active timer, sync/conflicts, permitted money cards | Cache/as-of labeled; no hidden finance counts |
| Clients/contact detail | Profiles/contacts, activities, pipeline, projects and permitted billing | Scoped contact/finance fields; archive/merge preview |
| CRM/estimate/proposal/agreements | Pipeline, scenarios, versions, sharing/acceptance/evidence, onboarding | Offline draft; sharing/signature/publish online |
| Projects/portfolio | Lifecycle, health, owner, client, dates, budget permission | Granted projects; archived filter |
| Project detail | Summary, scope, tasks/boards/calendar/timeline, milestones, files/comments/risks/time/finance tabs | Tabs filtered by grants; published versus internal explicit |
| Tasks/planning | Cross-project filters, hierarchy/dependencies, assignees, capacity/cycles and bulk actions | Keyboard alternatives and partial-error summary |
| Time/timesheets/recovery | Persistent timer, entries/segments, uncertainty/overlap, rates/approval/allocations | Own/team reviewer scope; protected financial source facts |
| Invoices/credits/payments | Drafts, issue preview, snapshots, due/balance/delivery/dispute, corrections | Finance scope; issuance/posting online; no false success on timeout |
| Expenses/retainers/subscriptions | Receipts, splits, approvals, allowances, periods/proration, reconciliation | Finance/member scope; eligible local drafts and authoritative online posting |
| Reports/knowledge/search | Defined formulas, as-of/currency, drill-down, notes/revisions/saved views | Current scope, cached subset warning, sensitive export preview |
| Integrations/rules/job center | Scopes/accounts, dry run, recipients, backlog/errors/quota/reconcile/stop | Authorized online controls; secrets never displayed to ordinary members |
| Sync/conflicts/devices | Last success, pending/rejected operations, version diff, session revoke | Approved browser draft expiry/retention; current-session checks and honest recovery limits |
| Settings/team/security | Personal/browser/workspace preferences, members/grants, MFA, tax/numbering/locale policies | Current capabilities; reauth for protected changes |
| Data/recovery/support | Import mapping/errors, export/backup manifest, isolated restore, redacted bundle | Scope/retention and safe rejoin; no live-cloud replacement |
| Client portal | Only published documents/deliverables, exact-version responses, balance/payment link | Separate guest scope/session, English/Arabic RTL, no internal APIs |

## Required states for every surface

Lists: loading, truly empty, no filtered matches, populated, cached/stale/incomplete, permission restricted, read failure. Editors: clean, unsaved, validating, saving locally, queued, synchronized, conflict, rejected, failure and immutable/read-only. Jobs: queued/running/progress, cancellable boundary, succeeded, retry, unknown outcome, failed/dead letter. Finance: exact preview, online required, checking receipt, committed snapshot and permitted correction actions.

The global timer/sync/workspace indicators stay discoverable. Local save is not cloud acknowledgment. Confirm dangerous effects with scope/amount/recipient/version visible; ordinary edits remain straightforward. Preserve browser chrome, standard links/history and browser-owned upload/download controls. Reflow phone/tablet/wide-screen layouts using logical RTL CSS; no fixed desktop minimum or native titlebar. Offline editor states require approved browser draft storage; private cached reports are not automatic.

[UX/localization](ux-and-localization.md) owns keyboard, screen reader, typography/bidi, Arabic numeric input, translated errors and document rendering expectations. No new UI is authorized by this documentation.
