# Data and State Model

No new database entity, table, migration or index is proposed. This feature composes existing account/workspace records and transient presentation state. Existing models remain defined by [Feature 004](../004-workspace-platform-and-authorization/data-model.md); authority/transport rules are in [the runtime contract](contracts/runtime-and-authority.md).

## Existing Entities and Projections

| Entity | Fields consumed | Relationships and validation |
| --- | --- | --- |
| Current account | `id`, display `name`, optional existing avatar reference, `sessionExpiresAt` | Derived from trusted managed session plus exact current user/session validation. Never return session token, provider tokens, cookie secret or database credentials. An account does not require workspace membership. |
| Workspace list choice | `id`, `name`; `nextCursor` belongs to the list envelope | Project existing `WorkspaceListItem` down to shell needs. UUID is a selector; list only active memberships with current `workspace.read` and `workspace.select` grants. Names remain user text, bounded by existing validation. |
| Selected workspace context | Workspace `id/name/slug/timezone/locale/currency/revision`; membership `id/role/revision`; effective supported `capabilities` | Existing panel needs these fields for allowed settings/member operations. Resolve current active membership and persisted workspace-scoped grants; intersect with role ceilings and effective global gates. Do not return role-template actions as current grants. Revisions retain existing decimal-string representation. |
| Personal profile envelope | Existing `userId`, `sessionExpiresAt`, `initialData`, `sealedQuery`; configured public Realtime service URL only where required | Loaded only for Personal account, checked against the runtime actor before mounting. Keep current own-user query, seal/renewal predicates and cleanup. No workspace membership dependency. |
| Invitation acceptance context | In-memory proof, parse/acceptance state and safe result | Existing recipient/workspace/expiry/replay rules remain authoritative. Proof is not a navigation, cookie or stored-preference field. |
| Workspace command | Existing operation ID, explicit workspace/resource target, expected revisions and canonical intent | Shell never changes the target or generates replacement intent while replaying an uncertain command. Transactions and receipts remain owned by existing services. |

## Application Context Envelope

The shared server loader returns a narrow ready-account envelope. `GET /api/app/context` exposes the same projection; invalid authority is a 401 and an account-service outage is a 503, both without protected fields.

| Field | Contract |
| --- | --- |
| `account` | Current-account projection above, with authoritative expiry. |
| `capabilities` | Only effective workspace, invitation and sensitive ownership availability needed by this app; false until the existing flag and required activation support permit the behavior. No credential workflow activation is introduced. |
| `workspaces` | Collection state, first bounded page of choices and `nextCursor` on successful list results. Disabled/unavailable results contain no replacement list pretending to be empty. |
| `selection` | Unselected, ready, restricted, unavailable or disabled; ready includes only the authorized selected context. A restricted result may echo the user's requested selector for conditional clearing, but no denied workspace metadata. |

Runtime/loading variants are local UI state, not persisted records. Do not add a server-issued generation/version table. The client generation counter only rejects old results; it grants no access.

## Independent State Machines

### Account Authority

| State | Entry / next transition | Display rules |
| --- | --- | --- |
| `checking` | Initial unresolved read, navigation, foreground/history recheck → ready/denied/unavailable | Hide all private content/actions; localized non-private progress. |
| `ready` | Verified current account; expiry timer and lifecycle checks remain active | Allow only actor-matched current content. Team state can independently be disabled/unavailable. |
| `signing-out` | Explicit sign-out → denied on confirmed success, or checking/retry on failure | Conceal private UI and stop private subscriptions immediately; no false success. |
| `denied` | Missing/expired/revoked/banned authority | Discard private state/proof; safe sign-in transition with finite destination and empty fragment. |
| `unavailable` | Identity/store error | No protected projection; retry. Do not infer signed-out status or empty memberships. |

### Workspace Collection and Selection

Collection: `loading → ready | empty | disabled | unavailable`. `empty` means a successful first-page query returned no authorized choices. Say “no available workspaces”: removed read/select grants can produce this result despite retained memberships. Claim zero memberships only if separately established by authorized data; do not add a broad count query just for wording. Later-page failure retains already validated choices with a separate retry message; it never changes the collection to empty. Subsequent pages append by stable ID/cursor only for the same actor/generation.

Selection: `unselected | checking | ready | restricted | unavailable | disabled`. Missing cookie yields unselected, never automatic first-team selection. Revoked/forged context yields restricted and a conditional clear; store failure yields unavailable without erasing the preference as though access had been revoked. Disabled global workspace functionality performs no workspace SQL.

A stale-selection clear requires the expected selector and compares against the request's cookie. This is not atomic cross-tab compare-and-swap: concurrent response cookies may still race. Re-read context after completion/races, stay concealed or unselected on mismatch and require explicit selection; commands retain their original targets.

Switch sequence:

1. Check dirty input; cancel retains input/context. Discard clears only after explicit confirmation.
2. Capture requested team, increment generation, conceal old team subtree, stop its reads/subscriptions and close transient team menus.
3. Serialize selection writes; do not start another while the cookie-setting action is pending.
4. Invoke existing selection action, which rechecks current identity, membership and `workspace.select` authority.
5. Fetch current context; reveal only if actor, requested workspace and active generation match. A different tab's preference update is not permission to retarget a command.
6. On error remain concealed with retry or an explicit revalidated return to the old team. Never announce selection merely because a cookie-setting call returned.

Team member/invitation lists each retain `idle/loading/ready/empty/unavailable/restricted` states. Every initial load, manual refresh and mutation-follow-up observes the same generation. Key team forms/views by actor plus workspace; dispose stale arrays, dialogs, target revisions and messages. No existing workspace subscription is assumed; the personal profile subscription is independent.

### Navigation Presentation

Persistent layout state: desktop `expanded=true` initially; mobile `open=false`; direction from current locale; dirty-navigation coordination and a non-private document-bootstrap marker where needed. Expansion survives internal app routes in memory, resets on a new document, and writes no cookie, localStorage or database row. Mobile state closes on committed navigation, dismissal, authority loss and breakpoint changes.

The template owns private runtime state and resets it between the three destinations. Search-only/deeper future navigation must explicitly participate in lifecycle checks rather than assuming a template remount.

### Invitation Proof

`absent → captured | malformed → awaiting-authority → actionable | disabled | unavailable → accepting → accepted | rejected`.

- Capture scrubs before parsing, preserves framework history state and applies a 4096-character fragment bound plus a 1024-character decoded-proof bound. These are transport ceilings, not a new token format; reject oversized/malformed input safely and never log it.
- New proof replaces a prior pending proof only after the previous acceptance operation is no longer active; never retarget an in-flight accept. Dismissal/flow exit/identity loss clears proof. Disable other invitation acceptance while one is pending.
- Entering another app destination without consuming a proof clears it and offers generic reopen guidance if needed. No proof survives sign-in, preference full navigation, reload or account change.
- Acceptance retains the same operation ID while its outcome is uncertain; use existing receipt reconciliation where supported. Do not turn failed delivery/acceptance into a success message.

## Query, Transaction and Recovery Boundaries

- Workspace choices use current service defaults: 20 per page, maximum 50, one page per request; do not fetch all memberships into the shell. Context is one selected workspace and a bounded supported-action set. Existing member/invitation services cap results at 50; preserve truthful bounded-list messaging rather than inventing an “all records” claim.
- Bootstrap makes one fresh identity read and at most one initial list plus one selected-context read. No selected cookie means no selected-context query; disabled workspaces means zero workspace queries. Guarded later reads and profile queries occur only when needed. Parallelize independent list/context reads after identity, within the existing pool bound.
- Reuse `pg` runtime pool (`max: 5`) and existing transaction-local timeouts/cleanup. Current membership/grant indexes and grant composite key are candidate support; confirm actual restricted-role query plans in isolation before adding indexes. No migration is justified by this design.
- Render-pass memoization deduplicates bootstrap, not mutation authority. Recheck grants/revisions within existing side-effect transactions; reauthorize private receipt projections before replay. Do not move domain writes, audit or outbox effects into the UI/context loader.
- Context GETs do not create/join/select or clear cookies. Only explicit existing actions mutate selection/domain records. No new worker/job, timer, protected cache or offline queue exists.
- Rollback keeps compatible existing profile/workspace contracts and unchanged schema. Disable affected capabilities if verification fails; never delete accepted team records or restore stale authority to demonstrate recovery.
