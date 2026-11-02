# Data and State Model: Shell Completion

No database table, migration, index or new business record is introduced. Preserve [Feature 005's model](../005-application-shell-sidebar/data-model.md) and [Feature 004's domain records](../004-workspace-platform-and-authorization/data-model.md). This increment corrects transient ownership and acceptance records.

## Existing Projections and Validation

| Entity / existing fields                                                          | Relationship and validation                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ApplicationAccount`: `id`, `name`, optional `avatar`, `sessionExpiresAt`         | Current trusted session only; expiry finite and future. Client actor must match the current route/profile envelope before reveal. Never project tokens/secrets.                                                                                              |
| `ApplicationCapabilities`: three existing workspace/invitation/ownership booleans | Derived from current server gates/support; not permission grants supplied by browser. No credential capability activation.                                                                                                                                   |
| `ApplicationWorkspaces`: `state`, `items`, `nextCursor`, optional `error`         | One page, default 20/max 50. Choice `id/name/slug/role/revision` preserves current consumer compatibility. Error is a stable code mapped to localized copy, not exception text. Empty means successful zero authorized choices, not proven zero memberships. |
| `ApplicationSelection`: `state`, `selectedId`, `context`, optional `error`        | Context is non-null only for a verified ready selection matching account/requested UUID. Restricted may retain only a bounded requested selector for safe clearing; no forbidden workspace metadata.                                                         |
| Existing `WorkspaceContext`                                                       | Workspace fields, membership/revisions and effective supported actions from existing services. Current membership/grants intersect role ceilings and gates; display role is never authority.                                                                 |
| Existing personal `Envelope`/`Draft`                                              | `userId/sessionExpiresAt/initialData/sealedQuery`; draft `userId/name/dirty`. Exactly one own row and current actor/seal checks. Workspace state does not gate personal access.                                                                              |
| Existing command envelope                                                         | Operation ID, original workspace/resource target, expected revisions and canonical intent. Retain through retries/unknown outcomes; selection cannot retarget it.                                                                                            |

## Runtime Control State

Retain `AccountLifecycleState`, request `generation`, abort controller and existing runtime methods. Add only the concrete lifetime/navigation coordination required by current callers:

| State                    | Meaning / lifetime                                                                                                                                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Request `generation`     | Monotonic in-memory invalidation for reads/completions; grants no authority. Increment on invalidation/cleanup; abort reads, but never assume abort undoes a server mutation.                                                                                                 |
| `teamEpoch`              | In-memory counter for disposal of team-private children on confirmed workspace transition, actor/grant change or authority loss requiring disposal. Distinct from request generation: an ordinary successful same-actor/same-team recheck must not erase valid unsaved input. |
| Selection-write busy ref | Acquired before invoking the cookie-setting action, released in finally. No concurrent select/clear writes from shell/panel; additional requests while busy return false without starting another write. A later explicit user retry remains possible.                        |
| Dirty registry           | Existing ID→handler map; handler `isDirty`, optional asynchronous `confirmDiscard`, required `discard`. Register actual current forms; unregister on hide/unmount. Confirm every affected form before discarding any.                                                         |
| Visible recovery state   | Existing account state/error key rendered outside the concealed private subtree. Contains no private account/workspace records.                                                                                                                                               |

`navigate(destination: AppDestination | "/"): Promise<boolean>` returns false on cancel/rejection, true when a permitted transition is confirmed and scheduled. It does not prove route commit; pathname/commit observation closes drawer and moves focus. No generic route registry or persisted version is added.

## Account Authority Transitions

| Transition                       | Required effect                                                                                                                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First request bootstrap → ready  | Adopt only fresh server bootstrap for this document, finite future expiry and actor-matched private children. A restored template is not a new request.                                                                                    |
| Ready → checking                 | Before uncertain foreground/route/history/Activity restore: synchronously conceal/inert private content and pause subscriptions; show non-private progress. Preserve same-actor permitted in-memory drafts during recoverable uncertainty. |
| Checking → ready                 | One current response, valid actor/expiry and current team/grants; dispose changed private lifetime before revealing. Rearm expiry even when timestamp did not change. Profile revalidates its own envelope before reveal.                  |
| Checking → unavailable           | Keep private content concealed; localized retry visible. No false empty/signed-out state; retry cannot reveal cached children without validation.                                                                                          |
| Any → denied / different actor   | Conceal before paint/reload, invalidate work, clear proof/private drafts/lists/subscriptions and recover to finite sign-in/actor-bound reload with fragment clearing.                                                                      |
| Ready → signing-out              | In-flight guard, conceal/dispose private state first. Confirm supported sign-out result; returned error is failure.                                                                                                                        |
| Signing-out → denied or checking | Success exits with empty fragment. Failure shows retry outside private subtree and revalidates; it never sets ready or redirects as if successful.                                                                                         |

Activity hide, pagehide and cleanup invalidate generations and abort readers. Pageshow, focus/visibility restoration, route entry and protected interaction require current validation. Browser back/forward and cached DOM must be covered before any privacy claim.

## Workspace Transition Rules

Collection states remain `loading/ready/empty/disabled/unavailable`; selection states remain `unselected/checking/ready/restricted/unavailable/disabled`.

1. Check dirty forms before any selector/cookie/context change. Cancel leaves input, selection, URL, preferences, drawer and focus intact.
2. Acquire the single select/clear write guard. After confirmed discard, advance team lifetime, abort obsolete reads and set checking with `context: null`; no old team view/action remains available.
3. Call existing `selectWorkspaceAction` for its original UUID; service checks current identity/read/select grants and writes the existing cookie only on success.
4. Read fresh context with timeout/abort. Accept only a current mounted generation, same actor, finite future expiry and ready context whose selected/context UUID matches the requested target. A mismatch/outage stays concealed with retry or explicitly revalidated previous selection.
5. Render current team panel keyed by actor/verified workspace/teamEpoch. Initial/manual/mutation-follow-up member/invitation reads capture that lifetime and ignore obsolete results. Existing command targets/IDs/revisions remain fixed through completion/reconciliation.
6. Recheck pagination by actor/generation/cursor; deduplicate IDs, prevent overlapping page reads and expose a separate localized retry while retaining valid prior choices. No failure becomes empty.

Clearing takes a required bounded expected-cookie value, which may represent a malformed stale selector rather than an authorized UUID. Require current account, reject absent/oversized inputs, compare current request cookie, and delete only a match; no cookie is an idempotent acknowledgement. A different cookie remains untouched. Context is re-read in all cases. Response cookies across tabs are not atomic compare-and-swap; mismatches never silently retarget work.

Do not reset forms merely because settings revision changed or a routine check ran: keep valid in-memory input and let existing expected-revision conflict handling resolve changed data. Current grant loss can require immediate concealed disposal even if input was dirty; data-loss prompts cannot override revocation.

## Navigation and Drawer State

Persistent layout owns presentation-only desktop expansion and narrow drawer state. Breakpoint stays 768 CSS pixels. Expanded/collapsed state is memory-only; no authority/proof/private record is stored with it.

Eligible links synchronously cancel before asynchronous confirmation, then commit once. Modified/new-tab clicks retain native behavior and do not discard the original tab's input. Preferences submit original validated fields only after confirmation; explicit discard clears retained draft values. Browser reload/closure warning is best effort and never a durable-save guarantee.

Drawer: closed → open (focus inside/background blocked) → dismissed (opener focus) or committed navigation (new heading/main focus). Cancelled navigation retains usable drawer/focus. Breakpoint/authority transitions close obsolete modal state and transfer focus to an equivalent visible control without an invisible lock.

## Invitation Acceptance Context

Early provider in existing invitation module owns `absent/captured/malformed/awaiting-authority/actionable/disabled/unavailable/accepting/accepted/rejected` and at most one bounded proof. The shell acceptance view consumes it; no persistent store or public DTO carries proof.

- Scrub before bounded decode while preserving framework history state; reject >4096 raw or >1024 decoded characters and malformed encoding safely.
- No auto-accept or speculative private detail read. Actor/capability must be current and recipient validation remains server-side.
- Acceptance captures proof and operation ID once; new hash cannot replace an in-flight operation. Unknown result retains original intent for existing supported reconciliation, never a new-ID retry.
- Clear on dismissal, successful consumption, denial, actor change or route/preference exit; dispose timers/listeners. Lost proof gives sign-in/reopen guidance without revealing recipient/team details.
- Explicit empty-fragment redirects cover a streamed redirect winning before capture hydration. Proof is excluded from every log, analytic, saved state, return URL and evidence artifact.

## Verification and Completion Records

These are documentation records, not database entities: requirement/SC/SEC ID, owner, source/build/lock identity, environment/tool/fixture version, command/interaction, actual outcome/exit, evidence class, sanitized capture reference and precise gap. Completion claims additionally name root feature/subtask and unchanged acceptance/dependency contract.

Only current results close claims. `PASS`, `FAIL`, `BLOCKED`, `SKIPPED` and `STALE` remain distinct; controlled browser transport, real service integration and human review are separate evidence classes. Never store credential-bearing manifests, cookie jars, auth headers, invitation URLs or unsanitized traces in the repository.

## Query, Transaction and Recovery Ownership

Existing authorized services and pg pool remain transaction owners; runtime makes no direct SQL or domain write. Keep ordered/checksummed/locked migration execution, transaction rollback/cleanup, command receipts/audit/outbox and current-grant replay checks. No new query/index is justified; verify existing bounds/pool isolation under restricted runtime credentials for affected live flows.

Context reads do not select/clear/create/join. Unsupported capability remains disabled on direct execution. Failures preserve accepted data and original command intent; no reload, abort, cookie or local generation proves a command was rolled back. Rollback is compatible source rollback over unchanged schema, with affected gates disabled if needed—never deletion of accepted records or restoration of stale authority.
