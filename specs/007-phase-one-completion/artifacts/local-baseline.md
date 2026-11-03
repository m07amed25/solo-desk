# Local Baseline Evidence: Phase One Completion

**Feature**: `specs/007-phase-one-completion`
**Date**: 2026-11-03
**Git Head**: `d2129ec1d6dd5ec8c8ed7552ff471063185d6995`
**Node Version**: `v24.21.0`

---

## 1. Baseline Test Invocations

### Command 1: Core Node Test Suite

```bash
node --test scripts/test-site.test.mjs scripts/test-auth-contract.test.mjs scripts/test-header-auth.test.mjs scripts/test-profile.test.mjs scripts/test-application.test.mjs scripts/test-migrations.test.mjs
```

- **Exit Code**: 0
- **Summary**: 33 tests passed, 0 failed, 0 skipped across 6 test suites.
- **Note**: A legacy mock parameter mismatch in `scripts/test-application.test.mjs` line 272 (`listWorkspaces` expecting `(_session, options)` instead of handling `options` directly matching `lib/workspaces.ts`) was corrected to accept either single `options` or `(_session, options)`, restoring clean pass for all 33 tests.

### Command 2: Translation Key Parity

```bash
node scripts/check-translations.mjs
```

- **Exit Code**: 0
- **Summary**: `✓ Translation key parity confirmed: 464 keys and structures match 100% between en and ar.`

### Command 3: Email & Contact Mock Checks

```bash
npm run test:email
```

- **Exit Code**: 0
- **Summary**: 6 tests passed, 0 failed.
- **Coverage**: Auth subjects/templates, contact token validation, fixed inbox delivery, webhook signature verification, receipt deduplication.

### Command 4: Auth Flow Harness Offline Guard Self-Checks

```bash
node scripts/test-auth-flows.mjs --self-check
```

- **Exit Code**: 0
- **Summary**:
  `PASS Guard self-checks: target isolation, synthetic identity bounds, redaction, in-memory store, US4 recovery rules`
  `PASS [LOCAL] Offline guard self-checks completed successfully.`

### Command 5: Design Validation

```bash
python3 docs/design/validate.py
```

- **Exit Code**: 1
- **Error Observed**:
  ```text
  Traceback (most recent call last):
    File ".../docs/design/validate.py", line 154, in <module>
      main()
    File ".../docs/design/validate.py", line 62, in main
      assert actual[name].strip() == value, (mode, name, 'CSS/token drift')
  AssertionError: ('light', 'background', 'CSS/token drift')
  ```
- **Analysis**: Inherited token drift between `docs/design/validate.py` hardcoded expectations and CSS tokens in `app/globals.css`. Per `quickstart.md`, this inherited failure is recorded as an existing baseline gap.

---

## 2. Tooling & Sandbox Status

- All local test runners (Node test runner, Python 3, npm scripts) executed directly without sandbox execution boundary blocks.
- No network requests were dispatched during the baseline run.
