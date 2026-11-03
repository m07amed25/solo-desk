# Data Model: Phase One Completion

**Status**: Proposed application schema and invariants, not applied SQL. Retain managed identity ownership. The next numbered migration must be reviewed against the real isolated schema/roles before use. [Gates](plan.md#readiness-gates-and-error-handling) remain blocking where indicated.

## Ownership and relationships

Managed account/session/challenge records remain authoritative in the selected identity service. Application rows use server-derived account IDs and original session IDs; no client actor/role/workspace field grants authority. Avoid new destructive foreign keys into provider-owned tables. Every application service checks `currentSession()` plus current matching database session where applicable, preserving the own-profile/session join behavior. Protected account reads require no workspace membership.

Application tables are private in `solodesk`, default PUBLIC access is removed, and runtime/migration/operator privileges are separately reviewed. No managed password/hash/token-table access or direct auth-table mutation is added. Any adopted tenant/session context is transaction-local on the same checked-out client; current explicit account/session predicates remain mandatory. No RLS claim without actual restricted-role tests.

## 1. Account preferences — new `solodesk.account_preferences`

| Field                      | Constraint / meaning                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `user_id`                  | UUID primary key, current verified account only                                                               |
| `locale`                   | `en` or `ar`; saved account preference, not an implicit browser choice                                        |
| `timezone`                 | Recognized IANA zone, nonempty bounded text, proposed maximum 100 characters; validate server runtime support |
| `optional_account_email`   | Required boolean, default false; excludes required security/verification/recovery mail                        |
| `revision`                 | Positive bigint, returned as canonical decimal string                                                         |
| `created_at`, `updated_at` | Server/database instants                                                                                      |

Missing row returns an explicit-default projection with revision `"0"`, timezone UTC and optional email false. Account-locale absence is represented as absence to the presentation resolver; a displayed default must not masquerade as a saved choice. GET performs no insertion. Initial create compares expected revision `"0"`; concurrent creates allow one winner. Updates compare current owner/revision and increment once. The transaction also records the minimal required settings event. Missing, extra, duplicate or protected fields fail validation. Invalid/foreign/stale writes have no effect; conflict returns only the current account's accepted projection.

Primary-key lookup is sufficient for these reads/writes; no workspace or global user-list index is introduced. Unknown commit is reconciled by own GET and accepted revision/values before reporting success; retry of a committed expected revision produces conflict, not another accepted update. Preserve valid in-memory edits for explicit review.

**Managed name boundary (G2)**: Existing name lives in managed `neon_auth."user"` and is updated by `auth.updateUser`. Do not place an undocumented name mirror in this table. Keep name and app preferences separate saves. Provider CAS/version support is required to finish stale-name acceptance; a provider read-then-write alone is not conditional update. An unsupported result requires reviewed authority redesign, not a claim that FR-018 passed.

## 2. Account security intent/proof — gated `solodesk.account_security_intents`

Create this only for the verified G1 adapter; mock/domain tests can exercise its contract before real activation.

| Field                                            | Constraint / meaning                                                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `id`                                             | Random opaque UUID/reference; no bearer authority by itself                                                               |
| `user_id`, `original_session_id`                 | Bound current account/session; never inferred from submitted actor IDs                                                    |
| `action`                                         | Closed enum `revoke_session` or `revoke_other_sessions`                                                                   |
| `target_snapshot` and `target_digest`            | Canonical server-owned session IDs/set, excluding current session for other-session actions; immutable after confirmation |
| `method`                                         | Existing enabled `password`, `google` or `github`, verified for this account                                              |
| `challenge_state_digest`, `challenge_expires_at` | Purpose-bound pending challenge correlation; actual lifetime follows approved provider/Q-08 policy, not a made-up default |
| `verified_at`, `expires_at`                      | Trusted fresh authentication time and exactly `verified_at + 5 minutes`; nullable before verification                     |
| `state`                                          | `pending`, `verified`, `reserved`, `consumed`, `cancelled`, `expired`, `unavailable`                                      |
| `reserved_operation_id`                          | At most one claiming revocation command                                                                                   |
| `created_at`, `updated_at`                       | Database instants                                                                                                         |

No password, code, raw provider token, provider redirect carrying proof or serialized session is stored. A challenge response must prove the same original identity/session and supported freshness tied to this confirmation intent; the authenticated event cannot predate intent issuance under the reviewed provider clock policy. Callback arrival, new cookie, token issuance time, consent/account picker and a normal session read cannot set `verified_at`. Confirmation cannot replace current identity or enroll/link methods.

Pending → verified only after adapter proof; verified → reserved only through an atomic current-authority/target/expiry check; reserved → consumed after the first successful effect. Concurrent claims bind to one operation. A definitive no-effect failure can release reservation only while original proof is valid and current authority is rechecked. Unknown effects keep the reservation locked for reconciliation. Cancellation, mismatch, unsupported method or expiry denies new effects. At `now >= expires_at`, no new dispatch is allowed; already-dispatched effects may be reconciled without extending validity.

Indexes: primary key; `(user_id, original_session_id, id)` for scoped lookup; expiration index only with reviewed bounded cleanup policy. Raw provider session tokens are resolved transiently by the verified server adapter, not persisted in targets or sent to the browser.

## 3. Revocation command/receipt — gated `solodesk.account_security_operations`

| Field                                         | Constraint / meaning                                                                          |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `operation_id`                                | Random stable command ID reused for the same intent/retry                                     |
| `user_id`, `original_session_id`, `intent_id` | Original account/session and owning proof                                                     |
| `payload_digest`                              | Digest of canonical action and immutable target snapshot                                      |
| `state`                                       | `prepared`, `executing`, `accepted`, `rejected`, `partial`, `unknown`                         |
| `target_results`                              | Bounded closed-shape per-target status; no provider bearer material or arbitrary payload JSON |
| `created_at`, `updated_at`, `completed_at`    | Database instants; completion only when known                                                 |

Unique `(user_id, original_session_id, operation_id)` and proof reservation prevent competing execution. Same ID/digest returns the same scoped status; changed payload is conflict. The local transaction reserves proof, records command and required event, then commits before provider I/O. Provider success and local acknowledgement are separate transitions; no cross-service atomicity claim.

For revoke-others, acquire a complete bounded-enumeration snapshot before confirmation, display its scope/as-of, and exclude the original current session. Do not use a dynamic bulk retry that could revoke sessions created later. If the provider cannot enumerate safely or resolve a selected ID with verified ownership, G1 fails. Any partial result is visible, never “all revoked.” After expiry, resolve only already dispatched outcomes; remaining targets need a new explicit proof/action. Ambiguous provider replies/crashes require verified status or idempotent same-target reconciliation; never release proof merely because a timeout elapsed or one later list still shows a target.

Use short row/advisory locks on proof/operation; never hold a DB transaction around provider calls. Immediately before every newly dispatched target, including resumed bulk work, recheck the original session's current authority and the original proof's expiry; reservation is not a lease to bypass revocation or time limits. Already dispatched uncertain effects may be reconciled without issuing new effects. Records are account-scoped for current-authority reads. Invalidated original sessions cannot authorize a different account's operation lookup; revocation success does not override that boundary.

## 4. Shared attempt buckets — reuse `solodesk.rate_limit_buckets`

Existing fields: `(key_hash, window_start)` primary key, integer `count`, `expires_at`. New work hardens admission and adds a reviewed expiration index; it does not introduce a second counter store.

- `key_hash`: purpose-separated HMAC over environment, policy version and normalized approved account/network signals; never raw email/IP, never caller-selected identity authority. Key custody/rotation is server-only and reviewed so rotation cannot reset protections unnoticed.
- Database time determines explicit fixed windows and Retry-After. Ordered multi-key updates prevent avoidable deadlocks. Counts saturate at a bounded denied value rather than overflow.
- Admission and denied counts commit in a short independent transaction before auth/contact effects; downstream failure cannot roll them back. Unknown commit means unavailable and zero downstream effect.
- 429 means enforced exhausted quota; 503 means enforcement unavailable. No local fallback. Ordinary current-session checks/sign-out do not call the admission gate.
- Exact caps/windows/key classes/cardinality/retention are G3/G4 policy inputs. No `N per rolling interval` claim for fixed windows. Bounded ingress, request/body limits and cleanup protect key cardinality as well as per-key counts.

Do not modify workspace/invitation policies during extraction. Test existing callers if module ownership changes.

## 5. Account security events — new `solodesk.account_security_events`

Fields: random `id`, `occurred_at`, closed `event_type`/`outcome`, nullable known `actor_id`, `correlation_id`, optional safe action/opaque target reference, and `policy_version`; optional pseudonymous signals only when approved. Do not accept arbitrary request/provider JSON or raw untrusted log fields. Failed public entry uses no asserted authenticated actor.

Record started/confirmed/denied/unknown distinctly. App preference/proof transitions and required event commit together. Managed events record observed facts and reconciliation; an audit insert cannot undo an external effect. Suggested indexes `(occurred_at,id)` and only the demonstrated `(actor_id,occurred_at,id)` investigation path. Ordinary accounts cannot edit/delete events; no workspace membership is required to generate one. This is essential redacted operational processing, not opt-in product analytics or an independently tamper-evident storage claim.

## 6. Inventory, schedules and scoped operational holds

Inventory/schedules use reviewed versioned documents/config, not a general policy database. For each class record fields/purpose/provider/location/subprocessor/access/owner, retention trigger/rule/version, backup expiry and deletion/hold authority. Include managed accounts/provider grants/sessions/challenges, app preferences/proofs/operations/events/buckets, auth delivery claims, contact inbox/receipts, host logs and service backups. Credentials are never copied into the inventory.

Where needed, `solodesk.account_data_holds` stores random hold ID, exact class/subject/provider scope, restricted reason reference, placing authority/time and current status; append-only hold events record placement and release authority/time/reason. No public member endpoints or unrestricted hold editor. Operator and cleanup roles are explicit least-privilege roles; generic app members cannot authorize holds/releases.

Placement/release and cleanup lock the same stable class/subject identity, even when the record/hold is absent, then recheck current schedule, holds and references in one transaction. A hold that wins the lock protects existing records; later placement cannot pretend a prior deletion was prevented. Batches are bounded (proposed 100 records); external provider/mailbox/backup holds need separately proven enforcement. Unknown schedule or hold authority disables the affected deletion job and blocks lifecycle acceptance; it does not approve indefinite retention.

## 7. Existing email/contact records

Preserve existing `public.solodesk_email_deliveries` digest/unique delivery claims and unknown-send reconciliation; no schema move or rename is planned. Do not purge claims while provider retries can arrive. Required auth mail ignores optional account-email preference but retains all delivery/abuse controls.

Contact inbox delivery and user receipt are separate effects. If retry-safe delivery is exposed, add only minimal per-send claim/status/digest records needed to distinguish accepted, failed-before-send and unknown outcomes, reusing the existing email boundary. Do not resend an inbox message merely because receipt delivery failed; no exactly-once SMTP promise. Contact payload retention belongs to the approved inventory/mailbox policy, not arbitrary application logs.

## Migration, recovery and query invariants

Add compatible application objects in a new immutable numbered migration; do not edit applied 001/002 or run provider migrations from general application SQL. Preserve missing-row/default reads for stale clients, declare action envelope compatibility and deploy new columns/read paths before writes. Existing runtime credentials cannot create schema or mutate auth ownership. Test rollback of each local transaction and unknown commit reconciliation with real PostgreSQL.

Provider proof/operation/hold records and auth-bearing backups are sensitive. Restoring a DB must invalidate/reconcile restored sessions, challenges/proofs and pending provider commands before reopening writes; restored `verified` rows cannot revive expired/consumed authority. Reconcile already executed external effects instead of replaying commands. Actual backup expiry, RPO/RTO and provider/name schema semantics remain gated; none is certified by this model.
