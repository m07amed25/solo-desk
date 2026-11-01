# Migration 002: Workspace Platform & Authorization Rollout & Role Guidance

## Database Role Architecture

This migration establishes the `solodesk` application schema. Access is segregated across three distinct database roles:

### 1. Direct Migration Role (`solodesk_migration`)

- Direct (unpooled) PostgreSQL connection used exclusively during deployment maintenance.
- Granted DDL permissions (`CREATE`, `ALTER`, `DROP`) within the `solodesk` schema.
- Does NOT possess `BYPASSRLS` or write access to `neon_auth` tables.

### 2. Runtime Application Role (`solodesk_runtime`)

- Used by the Next.js application server via the connection pool (`lib/db.ts`, max 5 clients).
- Privileges:
  - `USAGE` on schema `solodesk`.
  - `SELECT, INSERT, UPDATE` on `solodesk.workspaces`, `solodesk.workspace_memberships`, `solodesk.workspace_grants`, `solodesk.workspace_invitations`, `solodesk.command_receipts`, `solodesk.rate_limit_buckets`.
  - `SELECT, INSERT` (append-only) on `solodesk.audit_events` and `solodesk.outbox_events`.
  - Narrow column-level read access on `neon_auth.user(id, emailVerified, banned)` and `neon_auth.session(id, userId, expiresAt)`.
  - Prohibited: `DELETE` or `TRUNCATE` on any table; zero access to password hashes, credential secrets, or DDL operations.

### 3. Outbox Sender Role (`solodesk_sender`)

- Used exclusively by background invitation delivery workers (`scripts/dispatch-workspace-invitations.mjs`).
- Privileges:
  - `SELECT` on `solodesk.outbox_events` (including `encrypted_delivery`), `solodesk.workspace_invitations`, `solodesk.workspace_memberships`, and `solodesk.workspaces`.
  - `UPDATE` strictly on `solodesk.outbox_events(status, lease_token, lease_until, attempts, sent_at, last_error_code, encrypted_delivery)` to manage worker leasing and clear sensitive ciphertext upon terminal delivery.
  - Read-only column access to check active delegating authority: `neon_auth.user(id, emailVerified, banned)`.
  - Prohibited: Mutation of workspaces, memberships, grants, receipts, or user accounts.

## Rollout & Compatibility

1. **Expand-Before-Write**: Schema creation does not alter any existing table. The personal profile queries against `neon_auth` and email delivery records in `public.solodesk_email_deliveries` operate unmodified.
2. **Profile Compatibility**: Personal profile read/write contracts (`loadProfile`, `saveProfile`, `/api/profile`) are preserved and guaranteed compatible for at least one subsequent release plus 7 days.
3. **Forward Repair Only**: In the event of a failure after writes have been accepted, rollback MUST NOT drop tables or truncate accepted rows. Writers and senders must be disabled via capability flags (`SOLODESK_WORKSPACES_ENABLED=false`), and forward repair applied to rectify schema inconsistencies.

## Operational Recovery, Forward Repair & Disaster Recovery Protocol

### 1. Migration Failure Rehearsal

- All DDL statements in `migrations/002-workspace-platform.sql` are wrapped in a transaction block (`BEGIN ... COMMIT`).
- A failure during table or index creation automatically triggers `ROLLBACK`, leaving zero residual schema artifacts in the database.

### 2. Old Profile Client Compatibility

- Existing personal profile endpoints (`/api/profile`, `loadProfile`, `saveProfile`) interact exclusively with `neon_auth.user` and operate completely decoupled from `solodesk.*` workspace tables.
- In any scenario where workspace capability is toggled off (`SOLODESK_WORKSPACES_ENABLED=false`), personal profile functions and social authentication continue uninterrupted with 100% fidelity.

### 3. Incident Isolation (Writer & Sender Disablement)

- In the event of an operational anomaly, isolate writes and deliveries immediately without taking down the web server:
  - Set `SOLODESK_WORKSPACES_ENABLED=false` to reject all incoming workspace mutations with HTTP 503 (`CAPABILITY_DISABLED`).
  - Set `SOLODESK_INVITATIONS_ENABLED=false` to halt outbox polling and delivery leasing in `scripts/dispatch-workspace-invitations.mjs`.

### 4. Historical Delivery Suppression

- When recovering from an outage, restore, or clock drift:
  - Stale unleased outbox events must be cancelled before restarting workers to prevent accidental spam or out-of-order delivery:
    ```sql
    UPDATE solodesk.outbox_events
    SET status = 'cancelled', encrypted_delivery = NULL
    WHERE status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';
    ```
- All terminal events maintain cleared ciphertext (`encrypted_delivery = NULL`), ensuring secrets are permanently discarded.

### 5. Audit & Receipt Preservation

- `solodesk.command_receipts` and `solodesk.audit_events` represent an immutable timeline of accepted client operations.
- Recovery procedures MUST NEVER truncate or alter command receipts or audit records.

### 6. Isolated Point-in-Time Restore (PITR) & Invalidation

- When restoring to an isolated branch or disaster recovery target:
  - All restored active sessions in `neon_auth.session` must be invalidated to force reauthentication under fresh keys.
  - All pending workspace invitations must have their tokens invalidated by rotating `generation` or setting `status = 'revoked'` to prevent replay of captured pre-incident proof links.
  - Forward repair scripts must be applied additively as new migrations (e.g., `003-workspace-forward-repair.sql`); destructive down-migrations (`DROP TABLE`) are strictly prohibited after customer writes have occurred.
