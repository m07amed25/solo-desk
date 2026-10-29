# Website platform, identity, teams and browser drafts

Website baseline: [architecture](../architecture/overview.md) and [design patterns](../architecture/design-patterns.md) govern this module: shared shadcn/ui design-system components, scalable server services, Neon PostgreSQL, Better Auth and security-first authorization. Offline behavior below applies only to eligible drafts after the [browser-storage gate](../architecture/sync-and-collaboration.md); protected persistence stays disabled until proven.

Status: proposed functional specification under confirmed cloud/team/offline/encryption choices. P01 is mandatory for the first usable release. The current Next.js starter implements none of these domain capabilities. Related authority: [security](../architecture/security-and-privacy.md), [sync](../architecture/sync-and-collaboration.md), [API contracts](../architecture/api-contracts.md).

## Capability requirements

| ID | Behavior and acceptance boundary |
| --- | --- |
| PLT-001 | First use requires connectivity and Better Auth registration/sign-in with verified identity under the approved policy. Auth/network failure never appears as an empty workspace. |
| PLT-002 | Use Better Auth website sign-in/recovery and explicitly trusted origins/redirects. Support chosen MFA/recovery/session controls; require reauthentication for protected identity changes. No native callback scheme or embedded client secret. |
| PLT-003 | Create a workspace with legal/profile defaults, timezone, currencies and language preferences; invite members and switch between authorized workspaces. Workspace ID is immutable; the active workspace is visible in consequential actions. |
| PLT-004 | Invite a specific recipient with role/scope/expiry; accept once while online with the intended identity. Pending invitations may be resent with old-token invalidation or revoked. Never let a client contact email grant workspace membership automatically. |
| PLT-005 | Authorize every service command/read/download/search by current membership plus resource/action grants. Role templates are editable only through authorized policy; record an audit diff. Final owner cannot leave/be removed without transfer. |
| PLT-006 | List/revoke Better Auth sessions with safe browser/device labels and last activity where supported. Revoked sessions cannot submit drafts. Previously downloaded content cannot be guaranteed remotely erased. |
| PLT-007 | Persist only eligible minimal browser drafts after reviewed encryption/key custody, quota, eviction and recovery proof. No native secret store or broad tenant cache is assumed; fail closed for protected persistence before Q-07 passes. |
| PLT-008 | For enabled offline drafting, commit draft and pending operation atomically in IndexedDB; distinguish browser save from server acceptance. Handle quota/eviction failure and replay under current authorization/revision checks. |
| PLT-009 | Conflict inbox shows authorized local/base/remote values, consequences, and resolution history. Same-field conflicts preserve both candidates; independent field merges require evidence. Financial facts never use last-write-wins. |
| PLT-010 | Apply approved browser offline-access duration and lock/retention rules. Explain revocation and key-loss limits. Expiry never silently deletes recoverable drafts; server submissions always require a current Better Auth session. |
| PLT-011 | Preferences distinguish browser presentation, personal language/notifications and workspace currency/tax/roles. No native window placement/launch preference. Defaults never rewrite issued snapshots. |
| PLT-012 | Coordinate multiple tabs through server revisions, transactions and idempotency; browser channel signals are advisory. HTTPS deep links validate allowed routes and require current account/workspace/resource grants. |
| PLT-013 | Notification center supports read/snooze/source links/quiet hours. Optional browser notifications require consent and capability detection; denial leaves in-site notices. Recheck scope before content delivery. |
| PLT-014 | Central audit records actor, workspace, operation, target, revision, occurred/received instants, reason, correlation ID and redacted change summary. Ordinary members cannot alter audit history; audit reads/exports are separately scoped. |
| PLT-015 | Accessible shared shadcn/ui navigation/search, keyboard controls, light/dark/System themes, responsive layouts and English/Arabic RTL are foundation requirements. Preserve browser-reserved shortcuts. |
| PLT-016 | Import/export and server recovery follow data lifecycle. Browser drafts never replace a live Neon tenant or replay stale finance commands. Exports include a readable manifest and permission scope. |
| PLT-017 | Feature configuration declares dependencies, role requirements and online needs. Disabling taxes/recurrence/connectors prevents new actions but preserves historical records, pending obligations and exports. |
| PLT-018 | Account/workspace closure is an online, reauthenticated workflow with owner transfer, outstanding obligations, retention/export preview and a grace policy. Product-plan cancellation is distinct from deleting data or cancelling client invoices. |

## Access templates

Roles are proposed templates, not the sole security model. A capability plus project/client scope governs access. Personal workspaces use the same rules with one Owner.

| Capability | Owner | Admin | Manager | Contributor | Finance | Viewer |
| --- | --- | --- | --- | --- | --- | --- |
| Membership/settings | All | Operational; no ownership transfer | No | No | No | No |
| Client relationship management | All | Granted scope | Granted clients | Minimal assigned-project contact | Billing profile only | Explicit scope |
| Project/task management | All | Granted scope | Assigned projects | Assigned tasks; own permitted edits | Financial references | Read granted projects |
| Own time | All | Own | Own + review when assigned | Own | Read financially relevant approved time | Read only if granted |
| Others' time approval | All | Explicit reviewer grant | Assigned reviewer | No | Explicit reviewer grant | No |
| Issue invoice/credit, post payment/refund | All | No by default | No by default | No | Explicit finance actions | No |
| Cost rates/profitability | All | No by default | Explicit grant | Own rate only if policy permits | Granted scope | No by default |
| Data export/integrations | All with reauth where needed | Separately granted | Scoped export only | Own export if granted | Finance export if granted | Explicit export only |

Bulk actions do not expand scope. An owner may add a second approver requirement for high-value credits/refunds, but that policy must be explicitly configured and tested. Platform support is not a workspace Owner and must use audited, temporary support grants.

## Browser connectivity and state contract

| Operation | Disconnected behavior | Reconnection behavior |
| --- | --- | --- |
| Read work | Already displayed data may remain with stale/as-of label; no broad offline tenant replica | Refresh current grants and data |
| Eligible task/time/document drafts | Approved protected browser storage only; otherwise keep in-memory input with explicit reload-loss limit | Authenticate; validate scope/revision; submit stable operation or review conflict |
| Roles/invites/ownership/credential changes | Online required; never queued as privilege authority | Recheck current session and policy |
| Invoice/credit/payment/refund/number/allocation | Prepare eligible draft only; no authoritative effect | Online atomic command and scoped receipt lookup |
| Files/publication/provider effects | No final upload/reference or publication acknowledgment | Verify upload/current grants; reconcile uncertain external outcomes |
| Reports/search | Approved limited projection only, with coverage warning; otherwise online required | Re-query authorized server data |

States include signed out, signing in, loading, online, disconnected, draft pending, submitting, accepted, conflict, rejected, session expired and recovery required. Session expiry and draft state can coexist. Failed sign-in never changes a draft's account ownership. See [browser collaboration](../architecture/sync-and-collaboration.md) for key/eviction/expiry limits.

## Acceptance examples

A Finance user can issue an invoice but cannot promote themselves to Owner. A Contributor cannot obtain cost rates through a CSV, search count, PDF, notification, component prop or attachment URL. Revoking membership while another tab edits causes the next submission to reject without silently erasing the permitted recoverable draft. Switching accounts clears private views and cannot unlock another identity's drafts. Storage denial/eviction never produces a false durable-save claim. English/Arabic changes never alter money, IDs, numbers or issued snapshots.
