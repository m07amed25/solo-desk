# Foundation Reconciliation

**Feature**: Phase One Account and Public Entry Completion (`specs/007-phase-one-completion`)  
**Phase**: Phase 2 Foundational — Shared Local Contracts and Persistence Design  
**Date**: 2026-11-03  
**Status**: COMPLETE (Phase 2 Checkpoint Reached)

---

## 1. Executive Summary

Phase 2 establishes the shared local contracts, boundary tests, database schema definitions, request validation, and admission rate limiting required across Phase 1 user stories without creating workspace coupling, introducing new frameworks, or modifying applied migrations `001` or `002`.

All contracts have been verified locally via unit test suites using synthetic adapters without live network or database access. Remote migration application and live credential usage remain strictly gated under readiness gates G3 and G5.

---

## 2. Implemented Components & Artifacts

| Component                | File Path                                                                                                                         | Scope & Invariants Enforced                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Account Boundary**     | [lib/account.ts](file:///home/mohamed-s/Desktop/Projects/solor-desk/lib/account.ts)                                               | Fresh verified, unbanned, unexpired account authority (`requireAccountSession`); missing-row default projection without insert; CAS revision updates with 409 conflict detection; allowlisted inputs with IANA timezone validation; allowlisted/redacted security events (`recordAccountSecurityEvent`); 4 KiB request body bounding via [lib/request-body.ts](file:///home/mohamed-s/Desktop/Projects/solor-desk/lib/request-body.ts); cross-origin checking; standardized `Cache-Control: private, no-store` response helpers. |
| **Database Migration**   | [migrations/003-account-completion.sql](file:///home/mohamed-s/Desktop/Projects/solor-desk/migrations/003-account-completion.sql) | Declares `solodesk.account_preferences`, `solodesk.account_security_events`, and cleanup index `idx_rate_limit_buckets_expires`. Transaction-safe (no `BEGIN`/`COMMIT`, no `CONCURRENTLY`). Enforces least-privilege with `REVOKE ALL FROM PUBLIC`.                                                                                                                                                                                                                                                                              |
| **Shared Admission**     | [lib/rate-limit.ts](file:///home/mohamed-s/Desktop/Projects/solor-desk/lib/rate-limit.ts)                                         | Reuses `solodesk.rate_limit_buckets`. Implements purpose/environment/policy-separated HMAC key derivation (`deriveKeyHash`); deterministic multi-key sorting to eliminate deadlocks; fixed windows aligned to database `clock_timestamp()`; counter saturation at `2147483647` (no overflow); independent transaction commit (downstream rollback does not refund attempts); fail-closed 503 on database outage with NO in-memory fallback.                                                                                      |
| **Account Test Suite**   | [scripts/test-account.test.mjs](file:///home/mohamed-s/Desktop/Projects/solor-desk/scripts/test-account.test.mjs)                 | 6 synthetic tests verifying session requirements, missing-row reads, input bounds, CAS concurrency, redacted events, origin checking, 4 KiB body limits, and private/no-store caching.                                                                                                                                                                                                                                                                                                                                           |
| **Admission Test Suite** | [scripts/test-rate-limit.test.mjs](file:///home/mohamed-s/Desktop/Projects/solor-desk/scripts/test-rate-limit.test.mjs)           | 6 synthetic tests verifying DB time windows, Retry-After calculations, multi-key race prevention, counter saturation, rollback isolation, and outage fail-closed semantics.                                                                                                                                                                                                                                                                                                                                                      |
| **Migration Test Suite** | [scripts/test-migrations.test.mjs](file:///home/mohamed-s/Desktop/Projects/solor-desk/scripts/test-migrations.test.mjs)           | 7 synthetic tests verifying ordered discovery, direct unpooled connection verification, transaction lock handling, checksum immutability, CLI safety, and `003` rule compliance.                                                                                                                                                                                                                                                                                                                                                 |
| **Migration Docs**       | [migrations/README.md](file:///home/mohamed-s/Desktop/Projects/solor-desk/migrations/README.md)                                   | Documented `003-account-completion.sql` schema, prerequisites, runtime role requirements, and least-privilege security model.                                                                                                                                                                                                                                                                                                                                                                                                    |

---

## 3. Verification Evidence

### Combined Foundation Test Run

Command:

```bash
node --test scripts/test-account.test.mjs scripts/test-rate-limit.test.mjs scripts/test-migrations.test.mjs
```

Output:

```
✔ account authority guard requires fresh, verified, unbanned, unexpired identity (90.7ms)
✔ account preferences require no workspace membership and return explicit defaults on missing row without insert (21.5ms)
✔ input validation enforces strict allowlisting, recognized IANA zones, and bounds (22.8ms)
✔ compare-and-set prevents stale updates and isolates foreign targets (15.2ms)
✔ security events enforce redaction, closed types, and omit sensitive fields (11.5ms)
✔ request body parsing enforces origin, 4 KiB limits, Content-Type, and Cache-Control: private, no-store (14.9ms)
✔ selection is ordered, deduplicated and limited to existing migration files (8.8ms)
✔ migration connections require a direct URL and retain certificate verification (0.3ms)
✔ migration SQL and checksum commit together after acquiring the runner lock (0.4ms)
✔ applied files are skipped and changed or missing history stops before new effects (0.3ms)
✔ SQL, receipt and deferred-commit failures roll back without reporting acceptance (0.3ms)
✔ CLI help and invalid selections need no database and expose no credentials (159.6ms)
✔ 003-account-completion migration satisfies immutability, least privilege, and transaction rules (0.9ms)
✔ fixed-window boundaries derive from database time and calculate exact Retry-After (78.5ms)
✔ ordered multi-key updates prevent deadlock races (18.0ms)
✔ denied counters saturate at bounded max and do not roll over (10.3ms)
✔ downstream rollback does not refund admission attempts (9.6ms)
✔ database outage or missing configuration fails closed with 503 and no memory fallback (10.9ms)
✔ signal normalization redacts raw IP and email, enforces bounded policy inputs (7.8ms)
ℹ tests 19
ℹ suites 0
ℹ pass 19
ℹ fail 0
```

### Baseline & Contract Regression Check

Command:

```bash
node --test scripts/test-auth-contract.test.mjs scripts/test-application.test.mjs && node scripts/test-auth-flows.mjs --self-check
```

Output:

```
✔ application loader projects narrow account and truthful workspace states (51.8ms)
✔ client generation counter only rejects old results and grants no access (0.1ms)
✔ current trusted session, bounded choices and safe failures at the imported loader (11.9ms)
✔ actual context GET uses private stable-code 200/400/401/503 responses (7.8ms)
✔ actual selection actions require current authority, canonical selectors and bounded compare-before-clear (19.1ms)
✔ actual preference redirects explicitly clear fragments and retain origin/body bounds (13.6ms)
✔ actual callback render clears fragments on success, denial and bounded-query rejection (11.3ms)
✔ SDK client transport adheres to strict contract for signup, verify, and resend (21.8ms)
✔ SDK client transport adheres to strict contract for password sign-in and unverified continuation (2.3ms)
✔ Social provider initiation and callback contracts preserve initiating entry and generic failure markers (1.4ms)
✔ SDK client transport adheres to strict contract for password recovery and combined reset submission (1.3ms)
✔ target manifest validation enforces synthetic boundaries and rejects production and mismatched targets (3.6ms)
✔ server capability policy enforces default-off credential gating and allows social/session paths (200.9ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
PASS Guard self-checks: target isolation, synthetic identity bounds, redaction, in-memory store, US4 recovery rules, manifest authorization
PASS [LOCAL] Offline guard self-checks completed successfully.
```

---

## 4. Gate Status & Blockers (G1–G6)

In compliance with the project constitution and `readiness.md`:

1. **G1 (Provider Contract & Freshness Proof)**: Gated. Upstream session listing and reauthentication verification capabilities remain subject to verified provider evidence.
2. **G2 (Atomic Operations & Concurrent Name Updates)**: Gated. Name updates continue through existing profile owner and are not advertised stale-safe atomically with preferences.
3. **G3 (Policy Approval & Cardinality)**: Gated. Exact production rate limit quotas, retention intervals, and inventory schedules require owner sign-off. Default admission configurations operate fail-closed.
4. **G4 (Accessibility & Dual-Locale Verification)**: Open. To be executed during UI story phases (US1, US2, US3, US5, US6).
5. **G5 (Isolated Target Verification)**: **BLOCKED**. No live SQL migrations have been executed against remote databases. Remote execution of `migrations/003-account-completion.sql` and live auth flow execution remain blocked until owner supplies a validated synthetic target manifest (`specs/007-phase-one-completion/artifacts/isolated-target.md`).
6. **G6 (Security Release Gate)**: Open. Final release sign-off checklist pending feature completion.
