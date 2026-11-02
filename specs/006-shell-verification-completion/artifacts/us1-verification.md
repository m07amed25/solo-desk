# T007–T009 focused verification

2026-11-02, Codex. Source: baseline HEAD plus only scripts/test-migrations.test.mjs harness diff. Package/lock/runtime identities unchanged from initial-identity.json. Browser/locale/theme/viewport/motion N/A; no DB fixture or credential needed.

Command: `node --test scripts/test-migrations.test.mjs`.

- Sandbox: exit 1, child process/capture boundary remains unavailable. [Raw log](us1-migrations-sandbox.log).
- Approved outside sandbox: exit 0, all 6 tests pass. [Raw log](us1-migrations-approved.log).
- Retained ordering/deduplication/selector/checksum, direct URL/certificate, lock-before-effects, atomic receipt/commit, changed/missing history, skip and SQL/receipt/deferred-commit rollback assertions. All three subprocesses now have 10,000ms timeouts, absent-error/signal checks before status/output, and all stdout/stderr streams checked for synthetic secret.
- Runner/package callers unchanged: no supported-context runner defect reproduced. No migrations, database calls, package install or capability change.

Scope is local imported adapters/process execution; no real PostgreSQL isolation or shell acceptance claim. Final suite belongs to T056 after remaining source corrections.
