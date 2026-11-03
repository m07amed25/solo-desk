# US1 Database Authority and Isolation Verification (Gate G5)

**Feature**: Phase One Account and Public Entry Completion (`specs/007-phase-one-completion`)  
**Task**: T023 (User Story 1)  
**Date**: 2026-11-03  
**Status**: LOCAL EVIDENCE VERIFIED / REMOTE G5 BLOCKED (Truthfully recorded pending owner target)  
**References**: [scripts/test-account-postgres.mjs](file:///home/mohamed-s/Desktop/Projects/solor-desk/scripts/test-account-postgres.mjs), [migrations/003-account-completion.sql](file:///home/mohamed-s/Desktop/Projects/solor-desk/migrations/003-account-completion.sql), [lib/account.ts](file:///home/mohamed-s/Desktop/Projects/solor-desk/lib/account.ts), [lib/account-locale.ts](file:///home/mohamed-s/Desktop/Projects/solor-desk/lib/account-locale.ts)

---

## 1. Gate G5 Status and Truthful Reporting

Per the project constitution and SEC-041/043/044, remote integration against hosted Neon databases requires a verified non-production target manifest with synthetic credentials.
Because remote credentials are not provisioned in this environment, Gate G5 for remote authority remains **BLOCKED**.

Local disposable PostgreSQL verification was executed in full using an independently initialized empty Unix-socket cluster (`PostgreSQL 18.6`) without TCP listeners.

```bash
# 1. Source self-check (no database connection required):
node scripts/test-account-postgres.mjs --self-check
# Output: PASS: SQL source self-check only; no database or authorization acceptance.

# 2. Gate G5 enforcement without verified target:
node scripts/test-account-postgres.mjs
# Output: BLOCKED: Remote target isolation is not independently verified (Gate G5); use --local for disposable PostgreSQL evidence only. (exit code 2)

# 3. Disposable local PostgreSQL verification:
node scripts/test-account-postgres.mjs --local
# Output:
# LOCAL: PostgreSQL 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1) on x86_64-pc-linux-gnu, compiled by gcc 15.2.0, 64-bit; independently initialized empty Unix-socket cluster, no TCP listener.
# Applying 001-email-deliveries.sql -> Applied
# Applying 002-workspace-platform.sql -> Applied
# Applying 003-account-completion.sql -> Applied
# PASS: SEC-041/043/044/048 direct protected identity, session, and DDL denial verified.
# PASS: Default and account-locale reads and cookie precedence verified against live PostgreSQL.
# PASS: Transaction rollback, revision CAS (HTTP 409), and connection pool reuse verified.
# LIMIT: local PostgreSQL evidence only; remote Neon hosted G5 gate remains BLOCKED pending owner target provisioning.
```

---

## 2. Least-Privilege Role Grants

Migration `003-account-completion.sql` and previous migrations were applied using administrative role `solodesk_test_migration`.
The runtime application pool connects as restricted role `solodesk_test_runtime`.

### Applied Grants

```sql
GRANT USAGE ON SCHEMA solodesk, neon_auth TO solodesk_test_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON solodesk.account_preferences, solodesk.rate_limit_buckets TO solodesk_test_runtime;
GRANT SELECT, INSERT ON solodesk.account_security_events, solodesk.audit_events TO solodesk_test_runtime;
GRANT SELECT (id, name, email, "emailVerified", banned) ON neon_auth."user" TO solodesk_test_runtime;
GRANT SELECT (id, "userId", "expiresAt") ON neon_auth.session TO solodesk_test_runtime;
```

### Role Invariants Verified

```json
{
  "rolname": "solodesk_test_runtime",
  "rolsuper": false,
  "rolbypassrls": false
}
```

---

## 3. Direct Protected Identity, Session, and DDL Denial (SEC-041 / SEC-044 / SEC-048)

The restricted runtime role was tested with unauthorized queries. Each query was confirmed to fail with PostgreSQL error `42501` (`insufficient_privilege`):

| Forbidden Operation                               | Target / Schema                    | Observed Result    | Rule Enforced                              |
| :------------------------------------------------ | :--------------------------------- | :----------------- | :----------------------------------------- |
| `SELECT password_hash`                            | `neon_auth."user"`                 | **42501 (denied)** | Zero credential exposure to app runtime    |
| `SELECT token`                                    | `neon_auth.session`                | **42501 (denied)** | Zero session token exposure to app runtime |
| `CREATE TABLE solodesk.forbidden`                 | `solodesk`                         | **42501 (denied)** | No DDL grants for app runtime              |
| `DROP TABLE solodesk.account_preferences`         | `solodesk.account_preferences`     | **42501 (denied)** | No DROP grants for app runtime             |
| `DROP TABLE solodesk.account_security_events`     | `solodesk.account_security_events` | **42501 (denied)** | No DROP grants for app runtime             |
| `TRUNCATE TABLE solodesk.account_security_events` | `solodesk.account_security_events` | **42501 (denied)** | Append-only security audit log             |
| `DELETE FROM solodesk.account_security_events`    | `solodesk.account_security_events` | **42501 (denied)** | Immutable security audit log               |
| `UPDATE solodesk.account_security_events`         | `solodesk.account_security_events` | **42501 (denied)** | Immutable security audit log               |
| `TRUNCATE TABLE solodesk.audit_events`            | `solodesk.audit_events`            | **42501 (denied)** | Immutable platform audit log               |
| `DELETE FROM solodesk.audit_events`               | `solodesk.audit_events`            | **42501 (denied)** | Immutable platform audit log               |
| `UPDATE solodesk.audit_events`                    | `solodesk.audit_events`            | **42501 (denied)** | Immutable platform audit log               |

---

## 4. Default Preferences and Account-Locale Reads

Verified against live PostgreSQL tables populated with synthetic identities:

1. **Missing Row / Unset Preferences**:
   - `getAccountPreferences(session1)` returned:
     - `isDefault`: `true`
     - `preferences.locale`: `null`
     - `preferences.timezone`: `"UTC"`
     - `preferences.optionalAccountEmail`: `false`
     - `preferences.revision`: `"0"`
   - `getAccountLocaleByUserId(user1)` returned: `null`
   - `resolvePresentationLocale(null, user1)` returned: `"en"` (fallback)

2. **Saved Preferences (Arabic locale)**:
   - Created row: `{ locale: 'ar', timezone: 'Asia/Riyadh', optional_account_email: true, revision: 1 }`
   - `getAccountLocaleByUserId(user2)` returned: `"ar"`
   - `resolvePresentationLocale(null, user2)` returned: `"ar"`

3. **Presentation Precedence (Q-08 Decision 3)**:
   - When presentation cookie `"en"` is supplied: `resolvePresentationLocale("en", user2)` returned `"en"`.
   - Verified that browser presentation preference strictly overrides saved account preference without mutating account database state.

---

## 5. Transaction Rollback and Revision CAS (SEC-011 / SEC-012)

1. **Transaction Rollback**:
   - Executed `withAccountTransaction` with an intentional exception triggering `ROLLBACK`.
   - Confirmed that temporary updates to `locale` and `revision` were completely rolled back, leaving initial state (`locale: 'ar'`, `revision: '1'`) intact.
2. **Optimistic Concurrency / Revision Conflict**:
   - Attempted `saveAccountPreferences` with stale revision (`expectedRevision: "0"` when current is `"1"`).
   - Rejection confirmed: `AccountError` with `code: "CONFLICT"` and HTTP status `409`.
3. **Valid Revision CAS Progression**:
   - Update with `expectedRevision: "1"` succeeded, returning `revision: "2"`, `locale: "en"`, and emitting an append-only security event to `solodesk.account_security_events`.
4. **Pool Reuse**:
   - Executed sequential queries across the connection pool to ensure no residual transactional locks, session variable leakage, or timeout overrides.
