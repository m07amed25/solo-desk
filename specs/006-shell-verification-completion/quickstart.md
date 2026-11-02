# Validation Guide: Shell Completion

This guide is for later implementation/acceptance. Expected outcomes are targets, not recorded passes. Current planning baseline is in [research](research.md); scope/status rules are in the [verification contract](contracts/verification-and-evidence.md).

## 1. Prerequisites and Target Safety

Use the existing checkout/lockfile and installed supported Node/npm. Confirm active feature points to Feature 006 and preserve unrelated edits. Read constitution/security/design and installed Next guides named in research before code changes. No package installation, schema change, migration execution, provider activation or external send is part of this guide's default path.

For authenticated/live testing, obtain an independently verified isolated app/auth/database target with restricted runtime role and authorized synthetic fixtures. Verify identities against the environment owner, not only manifest flags/hostname labels. Do not assume existing `.env.local` is isolated. Keep credential-bearing manifests outside the repo, for example `/tmp/solodesk-006-isolated-target.json`, and never print them.

Fixtures: accounts/teams A/B with distinct synthetic data; non-member; current Owner/Admin/Member and removed-grant/revoked-session cases; zero/one/many choices including >20; long Arabic/English/mixed identifiers; delayed/failing reads and sign-out. Required disabled credentials/invitations/ownership/step-up remain disabled. Acceptance/delivery requiring an unapproved capability stays blocked; do not enable it for a demo.

Run commands below from repository root. Stop on mismatched target/production identity, secret exposure or unauthorized effects. Continue independent local corrections when live prerequisites are unavailable and record the exact gap.

## 2. Establish and Diagnose the Local Baseline

```bash
git status --short
git rev-parse HEAD
node --version
npm --version
bash .specify/scripts/bash/check-prerequisites.sh --paths-only --json
npm run test:full
```

Record commands, source/dirty fingerprint, execution context and actual exits. Current planning result: sandbox exit 1 in migration test-file; approved same-source retry exit 0, 36 Node/6 email tests and build passed. That distinction is not proof of browser or live authority behavior.

If empty help recurs, run the bounded synthetic diagnostic in research and inspect subprocess error/signal/timeout before status/output. Request approved execution when process restrictions prevent a necessary check; never bypass the restriction, delete assertions or manufacture stdout. Do not change migration code until a product defect is independently reproduced.

After W1's harness correction, run:

```bash
node --test scripts/test-migrations.test.mjs
node --test scripts/test-application.test.mjs scripts/test-profile.test.mjs scripts/test-workspaces.test.mjs
node --test scripts/test-site.test.mjs scripts/test-auth-contract.test.mjs
node scripts/check-translations.mjs
```

Expected: all applicable tests pass in a supported execution context. Help/invalid probes need no database and print no synthetic secret; subprocess errors fail explicitly; ordering/checksum/locking/transaction/rollback/TLS tests remain. Keep meaningful before/after failing cases for actual corrections, without claiming an execution restriction was fixed in application source.

## 3. Browser Tool and Server Preconditions

The repository does not resolve Node Playwright and Python Playwright is unavailable in the inspected environment. Use the existing user-installed CLI wrapper, keeping it out of application dependencies:

```bash
command -v npx
SOLODESK_PWCLI="$HOME/.codex/skills/playwright/scripts/playwright_cli.sh"
test -f "$SOLODESK_PWCLI"
bash "$SOLODESK_PWCLI" --help
```

Help/engine launch were not run during planning. If the wrapper needs an unavailable download or cannot launch an installed engine, record the prerequisite failure and use the normal approval/tool workflow; do not equate cache directories with support. Keep browser outputs under `output/playwright/006/`; only sanitize/copy approved evidence into feature artifacts. No committed cookie jar, auth state export, proof URL or sensitive raw trace.

Only after independently verifying the isolated target configuration, build and start that target in a persistent terminal:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3000
```

For focused development, `npm run dev -- --hostname 127.0.0.1 --port 3000` is available instead. Final cached-route/prefetch/history acceptance must use the production build. Do not interrupt another owned server; record a deliberately chosen alternate port if needed. Build success or a 200 response does not establish isolation/authentication.

Open the verified loopback target from a second terminal:

```bash
SOLODESK_PWCLI="$HOME/.codex/skills/playwright/scripts/playwright_cli.sh"
bash "$SOLODESK_PWCLI" open http://127.0.0.1:3000/app --headed
bash "$SOLODESK_PWCLI" snapshot
```

Use only the authorized synthetic sign-in/session path. Do not enable credentials or use real personal accounts to overcome missing fixtures. Snapshot before every element reference and re-snapshot after navigation/state changes; choose refs from the actual rendered DOM. CLI clicks/fills/keypresses and explicit browser assertions form the replay journal. Controlled fault injection may use the CLI's browser-code facility where ordinary commands cannot delay responses; record it as controlled-transport evidence and keep real-service checks separate.

## 4. Mounted Interaction Runs

Use the [runtime/navigation contract](contracts/runtime-and-navigation.md) and [state model](data-model.md) for exact outcomes. For every row retain executed actions/assertions, browser/version/source/build, fixture aliases and sanitized captures/traces. A screenshot alone is not an interaction assertion.

| Run                | Actions                                                                                                                                                                               | Required result                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout/desktop     | Visit public home/sign-in/sign-up and all app paths; activate every destination/toggle/breadcrumb/account/workspace control; collapse rail; use keyboard at short height              | Correct separate layouts, active location/content and accessible labels; no dead/marketing/fictional app content; destinations ≤3 activations.                                                             |
| Drawer             | Resize 390×844; open by keyboard; Tab/Shift+Tab; attempt background interaction/scroll; Escape/visible close; navigate; cross 767/768/769 while open                                  | Modal focus/background block, restored opener on dismiss vs heading/main after commit, no invisible lock/trap or clipped controls.                                                                         |
| Dirty forms        | Edit personal/team forms, including two dirty fields/forms; activate links, workspace selection and language/theme; dismiss confirmation, then repeat and accept                      | Cancel leaves URL/selection/preferences/input/drawer/focus unchanged and sends zero preference POST; discard resumes once and clears retained drafts. Modified/new-tab click leaves original draft intact. |
| Workspace races    | ≥20 A/B switches including reversals and delays; delay initial/manual/page/member/invitation/mutation completions; change cookie in another tab                                       | No concurrent shell selection writes, stale team/private content or retargeted command. Only actor/requested-team/current-generation context appears. Mismatch/failure stays truthful and recoverable.     |
| State/profile      | Zero authorized choices, no selection, revoked selection, disabled/unavailable workspace; page beyond first choice group; read/update/live personal profile                           | Distinct localized states and retry; later choices reachable; personal account works independently. Recoverable same-actor failure retains allowed input.                                                  |
| Lifecycle/sign-out | Expire/revoke/replace actor; foreground, pagehide/pageshow, Back/Forward and Activity restoration; inject returned and thrown sign-out error                                          | Conceal before uncertain reveal, validate current authority and own profile seal, dispose old subscriptions/state; retry visible on failure, no false success.                                             |
| Proof              | Enter signed out/loading/unavailable with bounded/malformed/oversized fragments; exercise redirect race, explicit valid/invalid recipient acceptance and hashchange during acceptance | Prompt scrub/empty-fragment exits, no autojoin or retargeted proof, safe reopen guidance and zero proof leakage/persistence. Keep unsupported capability cases disabled.                                   |
| Returns/timing     | Direct/refresh/Back/Forward/sign-in/presentation returns; external/duplicate/query/fragment returns; ≥20 warm transitions timed to visible usable state                               | Finite permitted return only, correct focus/active destination, ≥95% usable/accurate unavailable states within two seconds. No TTFB-only timing claim.                                                     |

Useful CLI commands after fresh snapshots include `click`, `fill`, `press Tab`, `press Shift+Tab`, `press Escape`, `dialog-dismiss`, `dialog-accept`, `resize`, `go-back`, `go-forward`, `reload`, `screenshot`, `tracing-start` and `tracing-stop`. Do not hardcode stale element refs into a purported universal pass script. Assert network/DOM/focus results rather than trusting absence of exceptions. Redact synthetic identifiers where needed and inspect traces for auth headers/proof before retention.

Repeat required runs in both languages × Light/Dark/System, long/mixed names, live device theme changes and reduced motion. Cover 390×844, 768×1024, 1280×800, 1440×900, 1280×480, 320 CSS-pixel reflow and actual 200% browser zoom. Run core journeys in Chromium/Firefox/WebKit where usable; record engine/device gaps. `deviceScaleFactor` is not browser zoom. Human keyboard/screen-reader/contrast and fluent-Arabic review require separate named results and cannot be auto-checked complete.

## 5. Real Authority and Data Evidence

Current source/HTTP/mocked tests are insufficient. Against the independently verified target, call actual authorized services/actions for current identity/grants, foreign-ID/lower-role/removed-grant denial, revoked selection and replay, retained command targets, transaction/pool/role isolation and enabled recipient acceptance. Preserve current gates. Do not infer live success from a manifest validator or schema-source self-check.

Existing bounded entry points:

```bash
node scripts/test-workspaces-postgres.mjs --self-check
node scripts/test-workspaces-postgres.mjs --manifest /tmp/solodesk-006-isolated-target.json
```

The first is SQL-source self-check only. Run the second **only** after actual target verification and review/extension of its covered cases; existing direct SQL/benchmark probes do not establish all authorized service/session journeys. No migrations are run by this guide. Missing/rejected manifest is BLOCKED, not pass. Credential recovery/delivery/step-up owned by earlier features stays outside this shell and gated.

`scripts/test-workspaces-browser.mjs` currently performs anonymous fetch/source assertions, not mounted interaction. Its corrected label/procedure must say so. `node scripts/test-site-http.mjs` may supplement running-target public/header validation, but cannot replace sections 4–5. Use only its reviewed loopback target setting and record actual output.

## 6. Final Verification and Completion Review

After relevant corrections and focused checks pass:

```bash
npm run test:full
git diff --check
```

Review exact dependency/lock/runtime/build-tool and applicable deployed/managed versions against fresh advisories under the security gate. Do not force dependency changes for a clean score; keep failures/unavailable feeds/unknown applicability as owned gaps. No current advisory scan was performed by the planning step.

Record every attempted suite V1–V9 with actual status, source/environment and limitations; do not claim later full-suite stages after an early failure. Reconcile Feature 005 plan/tasks/evidence and root `plan.md` only from attributable current results, preserving historical provenance and unchanged stable IDs/contracts. Refresh inventory, ledger, totals and immediate next work together; partial parents remain open.

Final handoff names corrections, passes/failures, exact completed feature/subtask IDs, all pending acceptance gaps/reasons and NEXT-05 readiness against full NEXT-04/upstream prerequisites. Shell work alone does not finish dashboard/search/timer/notices, commands/recovery, authorization/delivery or release. Do not start clients, deploy, activate production capabilities or send messages.
