# Website data lifecycle, imports, exports and recovery

Updated 29 October 2026. Proposed design for Neon-authoritative data, private files and eligible browser drafts. Better Auth identity/session data has its own protected lifecycle. No persistence or backup functionality is implemented in the starter.

## Persistence and migrations

Server domain effect, receipt, audit and outbox commit atomically in PostgreSQL. Enforce tenant relationships, revisions, financial allocation/number uniqueness and bounded exact values. Read errors never create a replacement empty workspace. For enabled offline drafts, IndexedDB commits draft plus pending operation atomically; quota denial/eviction and key loss have explicit recovery/loss limits. See [browser storage gate](sync-and-collaboration.md).

Version business/auth schemas and approved browser-draft formats. Review Better Auth/plugin-generated migrations alongside business migrations. Expand schema/read compatibility before enabling new writes, backfill in bounded batches, verify counts/invariants, then remove old formats after the published compatibility window. Keep stale open tabs safe. Use a direct Neon connection when migration/backup tooling requires persistent session behavior. Failed migration enters explicit recovery; rollback only when data compatibility is proven, otherwise forward repair.

## Backup classes

| Class | Contents | Authority |
| --- | --- | --- |
| Scoped workspace export | Permitted records, immutable documents, attachments and manifest | Authorized user; staged reviewed import, never live-tenant replacement |
| Service disaster recovery | Neon DB including protected auth records, private object bytes, required key/config references, receipts/jobs | Restricted operator procedure with encryption, isolation and consistency checks |
| Browser draft recovery | Eligible recoverable draft export after identity/key checks | Limited user recovery; no claim of full tenant backup or reliable persistence after eviction |

Portable/user exports exclude active sessions, password hashes, reset/verification material, provider credentials and signing keys. Service backups may contain auth tables and are highly sensitive; restrict/encrypt them and invalidate or rotate restored sessions/tokens before reopening service. Recover secrets only through the approved secret-management procedure, not user archives.

Every archive records format/schema/version, scope/as-of, record/file counts, checksums, policy versions and excluded data. Encrypt backups using reviewed authenticated formats. Neon backup/restore features and retention depend on the selected plan; verify at provisioning rather than promising a free tier guarantee. DB backups do not contain external object bytes. Browser drafts and current server replication are not historical backups.

## Isolated restore and reconciliation

Select → decrypt → validate manifest/checksums/bounds → stage isolated restore → verify relationships/money/files → preview differences → approved recovery/import. Reject corrupt/unsupported archives, path traversal/symlinks and executable content before touching active data. Keep the existing service intact until recovery is verified.

Old snapshots cannot authorize current writes, decrement invoice numbers, restore revoked sessions or replay old commands/jobs. Reconcile financial history, allocations, external callbacks/payments and sends after the restore point before reopening writes. Rotate/invalidate affected credentials and confirm current membership. Browser draft recovery submits reviewed eligible changes against current authority. Measure RPO/RTO with actual DB-plus-files drills under Q-16.

## Import and export

Initial portable targets: UTF-8 CSV for clients/tasks/time/expenses, documented logical JSON and manifests/files, and snapshot-based PDF. Browser file selection uploads inert staged content through bounded scoped authority. Preview encoding/delimiter/locale, units/timezone/currency, mappings, duplicates, private fields and row failures. Commit with stable batch/row/source IDs; exact reimport is idempotent, changed matches need an explicit update/skip/new choice. Parent failure cannot attach children elsewhere.

Financial imports need approved market/currency/numbering/opening-balance profiles and reconcile to source identities. They never send invoices, move money or certify legal acceptance. Sanitize spreadsheet-formula output and constrain row/column/archive/blob sizes. Preserve original source hash, exact numeric values and provenance. Arabic/mixed-locale inputs require preview rather than guessing.

Exports use a consistent permitted snapshot with IDs, references, exact amounts/currency, date basis, policy/version and file inventory. Exclude hidden costs/notes and disclose omissions. Browser download cancellation or rendering failure leaves source records unchanged. Product cancellation/closure preserves the approved read/export/retention path; exact grace/retention policies remain open.

## Retention and evidence

Archive is reversible. Tombstones prevent stale draft resurrection. Purge respects legal holds, retention, file references, auth dependencies and backup expiry; no guaranteed remote wipe of downloads/browser copies. Deletion must cover records, private blobs, indexes/projections, notifications and eventual backup expiry.

Required proof: protected draft round trip and quota/eviction denial when enabled; corrupt archive; interrupted migration/import; missing file; stale restore after new invoices; revoked identity; repeated changed import; Arabic CSV; restored auth invalidation; DB recovery with later provider payments. Evidence records exact source/build/environment, integrity and financial reconciliation, and measured recovery objectives.
