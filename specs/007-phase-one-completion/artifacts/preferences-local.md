# Local preference service continuation — 3 November 2026

Scope: T068 local tests completed; T070 service draft corrected, with persistence/acceptance still gated by G4/G5. No preference route/UI, migration application, managed-name change or new collection was enabled. Existing dirty work and the quiet-loading correction were preserved.

The affected calls are `getAccountPreferences`, `saveAccountPreferences`, their original-session guard and shared transaction helper. Callers are the account unit tests and the guarded PostgreSQL harness; no product caller currently saves preferences. Applicable controls are SEC-001–008 (current session), SEC-009–012/014 (own account), SEC-017/019/024 (exact bounded revision input), SEC-041–043 (transaction/session checks), SEC-048 (gated collection) and SEC-064 (unknown outcome). This is local evidence, not ASVS or live-service acceptance.

## Corrections

- Both read/save entries recheck fresh verified, unbanned, unexpired managed identity and match the original account/session. They also check the matching current database user/session before preference access, without workspace coupling. Provider lookup happens before opening the write transaction.
- Canonical revision strings are bounded to PostgreSQL's positive bigint range plus the initial `"0"`. Leading zeros, extra fields, malformed values and overflows are rejected; revision exhaustion returns a conflict without writing.
- Competing first saves use `ON CONFLICT (user_id) DO NOTHING`; the losing request receives a 409 and only its own accepted preferences. Only the winning save records its preference event. The SQL design follows [PostgreSQL INSERT documentation](https://www.postgresql.org/docs/current/sql-insert.html); actual target-version behavior still needs G5 evidence.
- A failed COMMIT is reported conservatively as `OUTCOME_UNKNOWN`, including server-shutdown SQLSTATE `57P01`, and its connection is discarded. An own read reconciles accepted values/revision; retrying the old revision cannot repeat a committed write. Event failure rolls the preference write back.
- Removed the account module's permissive pool-shape fallback in favor of the existing typed pool. The PostgreSQL harness now supplies synthetic original identity and matching session records for the new boundary. Its live mode was not executed.

## Observed verification

| Check | Result | Limit |
|---|---|---|
| New tests before fixes | Three expected failures: revision validation, missing original-session recheck, first-save conflict; later a separate expected failure for `57P01` after COMMIT | Imported module with synthetic adapters |
| `node --test --test-isolation=none scripts/test-account.test.mjs` | 12 passed, zero skipped/failed | Includes a controlled competing-create response schedule; does not prove PostgreSQL locking |
| ESLint on the three changed source/test files | PASS, zero diagnostics | Not repository-wide lint |
| `node --check scripts/test-account-postgres.mjs` | PASS | Syntax only |
| `node scripts/test-account-postgres.mjs --self-check` | PASS | SQL source check; no database execution |
| `npm test` (approved local execution) | 104 Node + six email tests passed | Synthetic services/email; raw `preferences-tests.txt` |
| `npm run test:full` | FAIL at lint: 49 errors, 14 warnings in other earlier account/auth modules/tests | Later chained stages did not run; `preferences-full-gate.txt` |
| `tsc --noEmit` | FAIL in unchanged `lib/workspaces.ts`; no changed-file diagnostics | Existing BigInt target and unreachable/narrowed ownership errors; `preferences-typecheck.txt` |

Hashes of the reviewed three code/test files, lockfile and Git HEAD are in `preferences-source-identity.json`. No dependency version changed. The same-day audit/advisory gaps in `dependency-review.md` remain open; this continuation does not claim a clean release scan.

G1–G6 remain blocked for their previously recorded scopes. In particular, actual two-account PostgreSQL races/roles/pool behavior, live provider authority and current production-Next/browser acceptance remain unverified. T070–T081 and final acceptance tasks stay open. The requested implementation skill's non-parallel failure rule stops this continuation at the failed full gate; no risk waiver is inferred.
