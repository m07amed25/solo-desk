# Execution baseline — T002

Date: 2026-11-03. Evidence: current local source/public documentation; no live target or approval.

Source identity: [capture](execution-source-identity.json). Existing [planning validation](planning-validation.json) records three passing offline self-checks: `node scripts/test-auth-flows.mjs --self-check`, `node scripts/test-account-postgres.mjs --self-check`, `node scripts/test-account-security-postgres.mjs --self-check`. Reused, not freshly executed: no product/guard changes since that inspection, same HEAD and lock/package hashes. Checklist markers changed; their policy prose did not. None of these results proves PostgreSQL/provider authority.

Runnable imported regressions: `scripts/test-site.test.mjs`, `test-application.test.mjs`, `test-auth-contract.test.mjs`, `test-account-security.test.mjs`, `test-account-sessions.test.mjs`, `test-account.test.mjs`, `test-profile.test.mjs`, `test-rate-limit.test.mjs`, `test-header-auth.test.mjs`; translation check and mock email tests. Run only affected tests after a code change. Current full-gate baseline in Feature 007 is failed lint (49 errors/14 warnings), 105 Node and six mock-email passes; historical, not rerun here.

Setup verified: existing .gitignore covers Node outputs/logs/env/editors, flat ESLint ignores generated code; private npm package needs no publish ignore. No Docker/Helm/Terraform selected. No installation, secret read, migration or target call performed.
