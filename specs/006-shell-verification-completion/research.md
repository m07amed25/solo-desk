# Research: Application Shell Completion and Verification

**Date**: 2026-11-02. **Scope**: read-only source/installed-documentation research and local verification baseline; no implementation changes. All decisions below are resolved for planning. Unavailable live/human/release evidence is an execution prerequisite, not an assumed pass or unspecified design choice.

## Baseline and Method

- Git checkout `main`; HEAD `fbd653da3057531894b2ae92b0771eb22653bd79`. Starting tracked tree clean; Feature 006 spec/checklist untracked. The plan setup created only the feature plan template.
- Node 24.21.0, npm 11.19.0; installed versions listed in [plan](plan.md). Package SHA-256 `e9d755ee487ec29a34bbe5e136394d85dac82d62c0152129fef4f535b8cf95a8`; lockfile SHA-256 `537f3f7fc1c2321a59965b8869cbe1bbdb234c68d2cac699220901c9543aa96b`.
- Primary skill: project `speckit-plan`; architecture/file-mapping guidance from `senior-architect` and `writing-plans`; browser prerequisite/scenario guidance from `webapp-testing` and `playwright`. The explicit Spec Kit workflow governs artifact locations and stops before tasks/implementation. Its research dispatch instruction authorized two read-only research agents; CLI research applied `systematic-debugging`, and shell research reviewed relevant component/React/security guidance. No additional delegation is implied for execution.
- Reused current documentation, constitution, design system, security catalogue/release gate, Feature 005 plan/contracts/evidence and root dependency contracts. Old pass marks, tool claims and timing tables are claims to verify, not baseline proof.

## R1 — Distinguish Execution Failure from Migration Behavior

**Decision**: Preserve `scripts/migrate.mjs` absent a separately reproduced defect. Harden the existing CLI test with 10,000 ms per-child timeout, explicit no-error/no-signal assertions before exit/output assertions, and synthetic-secret checks over every stdout/stderr stream. An EPERM, timeout or failed capture fails the check and names the execution gap; never auto-skip or manufacture success.

**Rationale**: `main` handles sole `--help` before environment loading/client construction; invalid selectors fail in `readMigrations` before database access. Current tests ignore `spawnSync.error`/signal. Same source gives empty help with EPERM inside the sandbox but correct help outside it. Full suite passes unchanged in the supported execution context. Status alone is insufficient.

**Alternatives considered**: rewriting help/runner, deleting the subprocess test, weakening the output assertion, applying migrations to test help, treating a sandbox restriction as a product defect. None is supported or necessary.

Exact bounded diagnostic, run from repository root in sandbox and approved execution contexts:

```bash
node --input-type=module - <<'JS'
import { spawnSync } from 'node:child_process';
const script = new URL('./scripts/migrate.mjs', import.meta.url).pathname;
for (const args of [['--help'], ['../unknown.sql']]) {
  const r = spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf8', timeout: 10000,
    env: { PATH: process.env.PATH,
      DATABASE_URL_UNPOOLED: 'https://user:synthetic-secret@example.invalid/db' }
  });
  console.log(JSON.stringify({ node: process.version, args, status: r.status,
    signal: r.signal, error: r.error ? { code: r.error.code, message: r.error.message } : null,
    stdout: r.stdout, stderr: r.stderr }));
}
JS
```

Both diagnostic parent commands exited 0 because they print observations. Sandbox help child: status 0, signal null, EPERM, empty streams; invalid child: status 1, EPERM, empty streams. Approved help: status 0, error absent, expected usage including “Apply all pending”, empty stderr; approved invalid: status 1, error absent, safe unknown/ambiguous message. This identifies the present execution/capture discrepancy, not conclusively the undocumented historical environment.

Current `npm run test:full`: sandbox exit 1 after six passing/one failing Node test-file reports; approved retry exit 0 with 36 Node and 6 synthetic email tests plus production build/54 generated pages. Preserve [sandbox](artifacts/planning-test-full-sandbox.log) and [approved](artifacts/planning-test-full-approved.log) logs. No source correction was needed for that approved baseline.

## R2 — Keep One Runtime Authority and One Team Lifetime

**Decision**: Fix the existing `ApplicationRuntime` rather than add a state framework. Retain request generations/aborts and add a distinct `teamEpoch` for disposal of team-private state on confirmed context changes. The workspace panel consumes runtime context; its sole page caller stops seeding an independent private selector. Context is usable only when account and selection are ready and actor/expiry/requested workspace match.

**Rationale**: Runtime switching currently retains previous context while checking, does not serialize cookie-setting actions and validates only generation after fetch. The panel copies initial props into local state and invokes selection independently. Its manual/mutation-follow-up lists lack equivalent obsolete-result guards. Overview can read retained context without ready selection. These are source facts; exact visible effects need mounted reproduction.

**Alternatives considered**: another context loader, a selection store, global event bus, generic command service or remounting every form on every 55-second check. All add duplication or destroy recoverable same-actor input. Request invalidation and private-form lifetime are separate concerns.

## R3 — Treat Cached DOM and Bootstrap as Untrusted After Restoration

**Decision**: Preserve Cache Components/Partial Prefetching. Conceal uncertain private DOM synchronously before restored-route paint, invalidate work on Activity hide/pagehide/cleanup, coalesce rechecks, rearm expiry on every successful current result, and render non-private progress/retry outside the hidden subtree. Actor changes force an actor-bound reload while concealed; grant/team changes dispose affected team state before reveal. No reveal based solely on cached template props.

**Rationale**: Installed Next 16.4.3 guides describe Activity preservation of state/DOM across up to three routes, effect cleanup while hidden, template segment/search limitations and refresh merging rather than resetting client state. Current runtime account/error states have no rendering consumer; ordinary rechecks do not conceal first, failures may leave visible content and successful rechecks can expose unchanged old children.

**Alternatives considered**: disable current caching config, use obsolete dynamic directives, trust template remount or use `bfcacheId` as authorization. None proves fresh authority or fixes direct service grants.

Installed primary references: `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`, `03-api-reference/03-file-conventions/template.md`, `03-api-reference/04-functions/use-router.md`, and `02-guides/authentication-with-cache-components.md` under the same App docs root. Follow their actual installed behavior before editing framework code.

## R4 — Cancel Navigation Synchronously, Then Resume Once

**Decision**: Add navigation coordination to the existing runtime and wire every shell-owned exit. Eligible Next links use `onNavigate`, cancel synchronously, await confirmation and explicitly resume once. Native preference POST forms cancel before awaiting and submit the captured form once after confirmation. Extend existing dirty handlers with `discard`, register all actual forms and confirm every handler before clearing any input.

**Rationale**: Registry currently has no consumers. Shell dirty links cancel but never resume; preferences call preventDefault only after an await. Menu/overview/switcher links bypass the guard. Installed `Link.onNavigate` distinguishes eligible client navigation from modified clicks. Activity can retain drafts after navigation, making explicit discard necessary.

**Alternatives considered**: per-link ad hoc prompts, unconditionally abandoning native forms, a navigation wrapper package or requestSubmit recursion. Existing runtime and installed Link API cover the actual callers. The server preference contract remains unchanged.

## R5 — Share Account Lifecycle, Preserve Own-Profile Validation

**Decision**: Runtime owns account expiry/foreground/sign-out. `LiveProfile` retains exact actor/sealed-query validation, profile-specific renewal and draft ownership, but consumes runtime account readiness rather than running a second general 55-second session loop. Sign-out checks resolved `result.error` as well as thrown failure and keeps a visible localized recovery surface; reveal requires revalidation.

**Rationale**: Existing profile code already checks sign-out's returned error and current own-row identity; runtime ignores returned errors, redirects on resolved failure and restores ready on throw without rendering the error. Account view must continue through workspace-only outage/disablement.

**Alternatives considered**: removing profile checks, duplicating session ownership or relying on shell visibility to authorize profile calls. Preserve the current profile boundary and service predicates.

## R6 — Capture Proof Before Private Loading Without Persisting It

**Decision**: Export a bounded invitation provider from the existing invitation module and mount it in app layout before private template loading. Keep acceptance UI within the authenticated shell; no details fetched speculatively. Capture scrubs history while preserving framework history state, retains at most 4096 raw/1024 decoded characters in memory, and clears proof on route/preference/identity exits, dismissal or denial. Freeze original proof/operation while accepting; do not replace pending intent on hashchange.

**Rationale**: Current capture is an effect inside the private shell, too late for a signed-out streamed redirect; malformed/oversized proof is silently dropped, UI does not handle gates/lost-proof guidance, and a delayed reload timer is not disposed. A server cannot see or scrub a URL fragment; explicit empty-fragment exits remain necessary even with earlier client capture.

**Alternatives considered**: persist proof across sign-in, place it in return/query data, auto-accept, add a new delivery flow or claim client hydration always wins a redirect race. All violate the current privacy/capability contract.

## R7 — Correct Existing Primitives and Localization in Place

**Decision**: Supply localized drawer title/description/toggle/close labels through existing primitives, expose a visible mobile close control, use Base UI focus APIs and shared size/token variants, and correct only observed logical-layout/focus/contrast issues. Reuse existing role/status translations and canonical state/error codes, never raw server messages.

**Rationale**: Source contains English runtime/template/primitive strings, canonical role values shown as copy, physical spacing and a desktop account menu that always opens right. Mobile sidebar hides the generated close button. Breakpoint cleanup/scroll containers exist but do not prove focus/scroll correctness. DESIGN.md explicitly retains known contrast gaps.

**Alternatives considered**: regenerate Sidebar/Sheet, globally replace primitives, redesign tokens or count parity as localization acceptance. Corrections belong at existing consumers and semantic variants; utility consumers must remain compatible.

## R8 — Reuse Authority Services and Tighten Consumed Interfaces

**Decision**: Keep current services/ActionResult envelopes and reuse exported `validateUUID` for actual UUID selectors. Require current account and a bounded expected stale-cookie selector for clear-selection; compare before deletion and always re-read, acknowledging cross-tab response-cookie races. Context GET remains read-only/private/no-store and uses stable generic failure codes. Keep existing capability gates and server grants before effects/replay.

**Rationale**: Current clear-selection accepts an optional argument, does not check account and reports clearing even on mismatch; runtime ignores its result. Selection/loader duplicate a loose UUID regex despite an existing validator. Raw loader/server messages are unsuitable localized user copy. Service access, not cookie/role display, is authoritative.

**Alternatives considered**: add a preference service, promise atomic cross-tab cookie comparison, reimplement domain writes in shell or enable gated ownership/invitations. Existing services and validation are sufficient; real isolation/pool tests remain required.

## R9 — Separate Evidence Classes and Use Existing Browser Tooling

**Decision**: Use the installed user Playwright CLI wrapper for actual mounted interactions/controlled fault assertions and a replayable sanitized command journal, then separately verify current authority against authorized isolated services. No new app/test dependency or generic E2E framework. Run wrapper help/engine-launch checks before relying on it; blocked tooling remains a gap. Do not require Python Playwright when it is absent.

**Rationale**: `npx` and `/home/mohamed-s/.codex/skills/playwright/scripts/playwright_cli.sh` exist; Node project imports and Python Playwright are unavailable, and browser cache directories prove no launch. `test-workspaces-browser.mjs` uses fetch/source checks despite its name; `test-application.test.mjs` has a standalone generation imitation. Neither establishes mounted behavior. Its weak manifest fields also cannot independently prove target isolation.

**Alternatives considered**: inherit a previous “browser subagent available” assertion, add Playwright to application dependencies, use HTTP/source/model checks as UI proof or trust production-looking targets because a manifest says isolated. Tool launch, independent target binding and evidence scope must be explicit. Human screen-reader/fluent-Arabic review remains separate from automation.

## R10 — Reconcile Existing Work Only After Acceptance

**Decision**: Keep Feature 005 contracts/stable IDs and root catalogue requirements. Later evidence corrects contradictory claims with dated supersession and raw references; Feature 006 records the corrective increment without double-counting implementation. Check full feature parents only when their unchanged contracts and dependencies pass. NEXT-05 readiness remains unestablished while NEXT-01–04 gaps persist.

**Rationale**: Feature 005 claims original FR/SC completion while root plan reports failure and missing authenticated/human proof. The new baseline resolves only present local-suite execution, not shell acceptance, command/recovery proof, hosted policy, delivery or release.

**Alternatives considered**: mark shell completion as all of F04.01/NEXT-04, rewrite catalogue scope to qualify the implementation, erase historical results or start clients. Each defeats trustworthy tracking.

## Design Validation and Open Execution Gates

Phase 0 resolves the technical decisions above; Phase 1 defines their [state model](data-model.md), [runtime/navigation contract](contracts/runtime-and-navigation.md), [verification contract](contracts/verification-and-evidence.md) and [validation guide](quickstart.md). Pre/post constitution reviews are in the plan. No clarification is required to produce tasks.

Still unverified: CLI engine launch; authenticated browser journeys; independently verified isolated target and restricted-role/real authority tests; hosted identity/policy/step-up/delivery G1–G6/AP-01–05; manual accessibility and fluent Arabic; current exact-version advisory and deployed ingress/recovery evidence. No credentials were inspected or printed, no database mutation or external email occurred, no capabilities were activated, and no root/Feature 005 records were changed.

## Planning Artifact Validation

- Setup command `bash .specify/scripts/bash/setup-plan.sh --json`: exit 0; copied resolved plan template into Feature 006. Feature label differs from actual Git checkout `main`; no branch was created/switched.
- Inline document assertions: exit 0; all eight generated outputs exist and are nonempty; six design documents have resolved local links/anchors, clean whitespace and no unresolved template/clarification placeholders. Plan contains required template sections, ten research decisions, six bounded work packages and nine acceptance suites. Self-review maps all 33 FRs and 12 SCs through plan/contract tables and preserves original full feature contracts.
- `bash .specify/scripts/bash/check-prerequisites.sh --json`: exit 0; resolves Feature 006 and advertises research, data model, contracts and quickstart for downstream task generation.
- `git diff --check`: exit 0. Untracked documents also received explicit whitespace checks, since default Git diff omits them.
- SHA-256 comparison against the pre-planning snapshot: existing tracked files, Feature 006 specification/checklist, Feature 005 and root plan unchanged. Active feature pointer preserved; no `tasks.md` generated.
- Mandatory post-planning hook check: `.specify/extensions.yml` absent; no before/after hooks registered or dispatched. Constitution re-evaluated after design with no exception or unresolved design clarification; implementation/release evidence remains pending.
