# Browser drafts, collaboration and client portal

Updated 29 October 2026. Proposed website contract. Required accounts/teams remain P01. Neon holds authoritative accepted data; Better Auth identifies server sessions. Offline drafting remains a product goal with browser-specific security/durability gates, not a claim of current functionality.

## Online authority and browser limits

Normal requests use HTTPS through Next.js services. Every request rechecks current identity/workspace/resource/action scope. Browser state explains pending edits but never grants service access. Switching workspace/account disposes subscriptions and protected view state and isolates any approved draft storage.

Browsers can suspend background tabs, terminate pages, evict storage or deny persistence. A tab is not a native profile owner or always-running process. Never depend on unload handlers, background sync, localStorage or a browser timer for an authoritative financial commit or durable server job. On returning to a tab, refresh current permissions, revisions and operation receipts before continuing.

## Offline-draft security and persistence gate

Keep only eligible, minimal draft data. Broad offline tenant replication, OS key-store wrapping and local SQLite are outside this website design. Protected draft persistence requires an approved IndexedDB/encryption/key-custody design, explicit supported data classes and quotas, eviction/recovery tests and user-visible limits. Use a reviewed platform/library format, not custom cryptography; keys stored with ciphertext do not provide the promised protection. Same-origin XSS remains a threat even to encrypted storage while unlocked.

Authentication and provider secrets never enter draft storage. Account switching and sign-out must follow explicit draft retention/export/key destruction policy. Offline access expiry is a UX/data policy with stated limits, not proof that a revoked user loses a downloaded copy. Q-06/Q-07 govern duration and key/recovery choices. Until proof passes, keep protected persistent drafts disabled; preserve current in-memory input and disclose that closing/reloading may lose it. A release advertised as supporting durable offline drafts is blocked until the gate passes.

For enabled draft storage, commit the draft and stable pending operation record atomically in IndexedDB. Track unsaved → saved in this browser → submitting → server accepted, or conflict/rejected/unknown. Handle quota/permission/eviction failure without false success. Browser persistence permission reduces some eviction risks; it never becomes a backup guarantee.

## Submission, refresh and conflicts

A submitted operation includes ID, payload digest, protocol version, workspace, expected revision and bounded payload. Server derives actor from Better Auth. Deduplicate in PostgreSQL; changed payload under the same key is rejected. A lost response resolves through a scoped operation receipt. Retries use bounded backoff and current authorization. Permission failures are actionable, not retried forever.

Use explicit reload/invalidation initially; add polling or a selected realtime transport only when needed. Notifications are refresh hints, not durable commit evidence. Any incremental cursor/event stream applies accepted data and cursor consistently and handles unknown versions. No Supabase Realtime or LISTEN/NOTIFY-on-pooled-connections assumption is part of the design.

| Concurrent data | Resolution |
| --- | --- |
| Independent creates | Stable IDs and deduplication preserve both accepted records |
| Non-overlapping field edits | Merge only if base revision proves independence |
| Same-field or rich-text edits | Preserve permitted base/local/server candidates and require review |
| Status/dependency edits | Revalidate current workflow and graph; reject cycles |
| Delete versus stale edit | Tombstone/current server state prevents silent resurrection |
| Files | Immutable versions and verified upload; no incomplete committed reference |
| Financial postings/documents | Immutable commands/corrections; no field-level merge |

Resolution is a new authorized, revision-checked operation. Restricted fields/candidates stay redacted after permission loss. Stale drafts outside supported schema/retention windows require a reviewed refresh/import, never blind replay.

## Time and financial operations

Persist online timer starts/pauses/stops on the server before acknowledgment. An open tab may display elapsed time using monotonic measurement, but sleep/suspension/clock gaps require review. Multiple tabs coordinate through server revision/uniqueness rules; optional browser signals are advisory. Offline timer evidence, if enabled under the draft gate, is provisional and reconciles overlaps before billing.

Offline invoice drafts never reserve a final number or global source allocation. Online finalization atomically validates exact draft/source/policy revisions, assigns one number, freezes snapshots, allocates sources and records receipt/audit/outbox. A timeout shows checking status and uses the original operation ID. Credits, payments/refunds, grants, publishing and provider actions also require current online authority.

## Files, deletion and recovery

Upload through bounded scoped authority to selected private storage. Verify bytes/hash before a committed reference. Resume is supported only when implemented/proven; an unuploaded local file is not a recoverable server attachment. Retention and reference checks govern garbage collection.

Server tombstones and revisions prevent stale draft resurrection. Browser drafts are not a historical backup. Restore cloud data in isolation, validate records plus files and reconcile jobs/provider events before reopening writes. Never restore revoked sessions or replay old money commands. [Data lifecycle](data-lifecycle.md) owns this policy.

## Client portal

Deliver the portal as scoped routes within the same website initially, using the shared shadcn/ui design system and authorized server services. Separate deployment is optional only when a justified boundary requires it. Publishing selects exact document/deliverable versions and recipients; default sharing is off. Internal costs, notes, draft invoices, sibling files and member lists stay excluded.

Guests can view permitted publications and submit exact-version comments/approvals/change requests. Identity may be Better Auth login or an approved expiring recipient-verified link policy (Q-10). Link expiry/revocation and short-lived file access are enforced server-side. Two clicks have one effect; stale/withdrawn content cannot accept a different version. Hosted checkout needs verified provider settlement; no raw cards or universal legal-signature claims.

## Release evidence

Prove two-account/two-workspace isolation, revoked sessions/grants, multi-tab conflicts, interrupted uploads, duplicate/lost replies, stale open tabs, supported browser storage failures and offline-draft gates if enabled. Scope English/Arabic RTL, keyboard/accessibility and narrow layouts to real browser results. Region/budget, retention, auth recovery and measured RPO/RTO remain deployment gates.
