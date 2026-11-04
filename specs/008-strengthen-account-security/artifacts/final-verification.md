# Current verification results — T034 partial / incomplete

Date: 2026-11-03. [Pre-execution identity](execution-source-identity.json), [candidate hashes](execution-candidate.json). No package/lock/runtime/API/schema/managed configuration change. Source generation and environment are distinct from a production build/target.

| Command/check | Observed result | Category |
| --- | --- | --- |
| `node --test scripts/test-site.test.mjs scripts/test-application.test.mjs scripts/test-auth-contract.test.mjs scripts/test-account-security.test.mjs scripts/test-account-sessions.test.mjs scripts/test-profile.test.mjs scripts/test-header-auth.test.mjs` | 65 tests passed, zero failed/skipped, final source after RTL correction; [log](local-tests.txt) | Imported/mocked/rendered local only |
| `node scripts/check-translations.mjs` | 524 keys/structures match English/Arabic | Catalog parity, not fluent review |
| `node node_modules/eslint/bin/eslint.js 'app/(site)/[locale]/[theme]/app/account/page.tsx' scripts/test-site.test.mjs scripts/test-application.test.mjs scripts/test-auth-contract.test.mjs` | 0 errors, 5 existing unused-variable warnings in existing auth tests | Touched-file lint; whole repo differs |
| `impeccable detect --json` on changed account page | Empty findings array | Mechanical check, not design/accessibility acceptance |
| `npm audit --json` | Initial sandbox EAI_AGAIN; approved retry exit 1, 27 entries: 8 low/19 moderate; [report](execution-audit.json) | Fresh advisory scan, NOT clean |
| `npm run test:full` with synthetic auth/DB/Realtime URLs/secrets and credential/workspace flags false | Failed first stage lint, 49 errors/14 warnings; [log](full-verification.txt). Later Next typegen/typecheck/translation/Node/email/build chain NOT RUN | Complete gate failed; existing 007 baseline |
| Local Playwright CLI component fixture | 30 layout cases, both-language history/outage and keyboard sign-out concealment; final correct-label retry checks pass | [Observations](browser-observations.json); actual production Next-route/human gates absent |
| Guard self-checks | Reused unchanged dated planning results, not rerun for paperwork | Historical guard/source-only, no real database/provider |
| `git diff --check` | Passed at execution close | Whitespace only |

The full-gate invocation supplied synthetic unavailable auth/database/Realtime settings and disabled credentials/workspaces. Lint halted before any Next runtime/build could consult environment files; no real target was contacted. Component fixture uses direct source/bundling and current CSS, no environment-secret load/provider/database calls. Browser wrapper initially failed npx DNS inside sandbox; approved retry succeeded. Fixture PNG/text/font rendering was inconsistent, so screenshots are excluded from visual/typography approval.

NOT RUN/UNACCEPTED: actual production Next build/routes, PostgreSQL grants/concurrency, managed factors/recovery/sessions/direct-origin, two-instance admission, deployed ingress/bundled/deployed exhaustive advisories, actual browser 200% zoom/BFCache/other engines, fluent Arabic/assistive/security/five-person enrollment review. No release exception or gate approval.

T034 remains unchecked: T033 prerequisite incomplete and full gate failed. No unrelated Feature 007 lint repair or unchanged full-suite rerun undertaken.
