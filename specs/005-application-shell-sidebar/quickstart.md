# Validation Guide

This guide is for the implemented Feature 005 artifact. Planning does not implement the routes, add components, provision services or pass these scenarios. Contract details live in [shell/navigation](contracts/shell-and-navigation.md), [runtime/authority](contracts/runtime-and-authority.md) and [data/state](data-model.md).

## Prerequisites

- Match the reviewed source/build and lockfile. Use the repository's supported Node/npm installation and existing dependencies. Read installed Next.js guides and inspect official Base UI component source before implementation; do not run a preset migration or a forced audit fix.
- Use an independently verified synthetic isolated database/auth/app target with restricted runtime access. A label containing “isolated,” a non-production-looking hostname or a manifest alone does not establish isolation. No production-derived identities or real invitation recipients.
- Required existing configuration follows [setup](../../docs/development/setup.md) and [Neon setup](../../docs/development/neon-setup.md). Keep database/auth keys server-only and never print env files, tokens, cookies or invitation fragments into evidence. Personal account's live capability uses the existing Realtime setup, not new infrastructure.
- Begin with workspaces, invitations, sensitive ownership and credentials disabled. Test explicit disabled responses first. Enable only separately reviewed capabilities in the isolated test process after AP-01–05 prerequisites pass. This guide does not authorize enabling any production capability, provisioning or email delivery.
- Fixtures:
  - Account A: Single personal user, zero team memberships (tests empty state).
  - Account B: Multi-tenant member with two distinguishable teams (Team Alpha, Team Beta) for switching tests.
  - Role Fixtures: Distinct identities mapped to Owner, Admin, Member, and Non-Member roles.
  - Choice Scale: Seed with >20 workspace choices to trigger and test pagination cursor mechanics (`limit=20`, `max=50`).
  - Network/Service Latency: Delayed context and list endpoints simulating high latency and out-of-order responses.
  - Adversarial/Error: Revoked session tokens, expired invitation codes, oversized/malformed fragments, and unavailable DB service.
  - Teardown & Cleanup: Automatic post-test deletion of synthetic records bounded strictly by the test runner namespace without touching non-test rows. Never paste raw session tokens or credentials in documentation or logs.

## Local Commands

From the repository root:

```bash
cd /home/mohamed-s/Desktop/Projects/solor-desk
npm run lint
node node_modules/next/dist/bin/next typegen
node node_modules/typescript/bin/tsc --noEmit
node scripts/check-translations.mjs
npm test
npm run build
```

Expected: all applicable commands exit zero; failures stay documented. `npm test` includes mocked SDK/database/transport cases and synthetic email rendering; it is not hosted integration. Future implementation should add focused `scripts/test-application.test.mjs` coverage to the existing test glob and extend site/auth/workspace/profile tests. Do not claim that new file exists or passes in this planning step.

`npm test` can require permission to spawn local Node subprocesses in a restricted agent sandbox. In this planning session its initial migration-test failure was reproduced as `spawnSync` EPERM; an approved unrestricted rerun passed. Classify environmental refusal separately from a source assertion failure; never suppress either as a pass.

Run a fresh advisory assessment and inspect the actual findings; a nonzero vulnerability result is not a successful security gate:

```bash
npm audit --json
```

Do not run `npm audit fix --force` or downgrade components to satisfy an automated suggestion. Check runtime/transitive/tooling reachability, copied-component provenance and actual deployed versions before release. The planning report retained under `artifacts/` is a dated signal, not future release acceptance.

For a locally configured isolated app, run one of these modes, not both on the same port:

```bash
npm run dev
```

Or, after the matching build:

```bash
npm run start -- --hostname 127.0.0.1
```

Keep dev/test surfaces private. Use a separate terminal/tool session for checks. Existing anonymous HTTP checks are runnable against loopback:

```bash
node scripts/test-site-http.mjs
```

Update that runner's finite child-path/auth-query assertions during implementation. Its anonymous responses do not prove authenticated browser interaction. Do not use a source-regex result as drawer/focus/fragment acceptance.

## Isolated Integration Commands

Only after an independently verified target and fixture manifest are available, existing runners can be invoked with a local restricted manifest path:

```bash
node scripts/test-auth-flows.mjs --integration --manifest /tmp/solodesk-005-auth-target.json
node scripts/test-workspaces-postgres.mjs --manifest /tmp/solodesk-005-workspace-target.json
```

The paths above are examples to be created securely outside version control, not supplied targets. The auth runner expects `environment`, app/database/auth identities, branch, delivery sink and fixture namespace; the workspace runner has its own smaller schema. Read each current parser, do not fabricate a shared manifest or print its credentials. Validate actual target identities independently. No migration command is part of Feature 005; any missing Feature 004 schema/setup remains a separate authorized prerequisite.

Extend the real service/session assertions needed by AP-01–05 before counting these runners as Feature 005 evidence. Current workspace integration/self-check coverage is insufficient for all tenant/grant/replay/concurrency claims. Missing targets, fixture challenges, unsupported capabilities and skipped assertions are gaps, not successful runs.

## Authenticated Browser Protocol

Use an available authorized browser automation tool against the matching isolated app. No browser-test dependency is added by this plan. If that tooling or fixture is unavailable, mark automated-browser coverage as unavailable and keep manual results separate. Record source/build, browser/version/device, viewport, capability matrix, fixture labels and sanitized results.

| Scenario                      | Steps and required outcome                                                                                                                                                                                                                                                                                                                                                        | Trace                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Working routes and separation | Enter `/app`, follow all three destinations, reload, use direct child links and back/forward. Brand reaches Overview; public-site link reaches the existing public page. Public and sign-in/sign-up retain their own composition. No dead modules, marketing content or fictional metrics in app.                                                                                 | US1; FR-001–007; SC-001/002     |
| Finite returns                | Open `/app/account` signed out, authenticate using a supported enabled method, and return to Personal account. Repeat `/app/workspace`; change appearance at both children. Duplicate/hostile/external/fragment returns fail safely; default entry still reaches `/app`.                                                                                                          | US4.1/US6.1; SC-007/009         |
| Team state matrix             | Exercise loading, no selection, true zero memberships, disabled workspace capability, denied selection and list/context failure. Personal profile remains usable when only teams fail. Retry never changes error into empty/success.                                                                                                                                              | US2/US3; SC-004                 |
| Current grants and gates      | Remove a read/select/action grant without changing role; request underlying page/read/action directly as lower-role and foreign member. Toggle each existing capability off. Assert no forbidden fields/effects; ownership remains disabled without approved proof.                                                                                                               | AP-01–05; SC-005                |
| Safe switching                | Alternate teams at least 20 times, including A→B→A, slow/out-of-order reads, failed selection and revocation. Verify serialized selection writes, cleared old lists/actions/forms, ignored old responses, original command targets and explicit revalidated recovery. Load choices past first page.                                                                               | US2; SC-003                     |
| Preserved journeys            | Create/select/update an allowed team, exercise permitted invitations/members/leave and personal name save/live update. Cancel/discard dirty navigation and preference changes. Keep excluded/disabled operations unavailable.                                                                                                                                                     | US3; FR-020/021/029; SC-004/005 |
| Invitation privacy            | Use a synthetic fragment link with authenticated, signed-out, checking, disabled and failing states. Verify scrub-before-decode, malformed/oversized handling and no fragment inheritance through full/streaming redirects. Accept/dismiss explicitly, arrive by new hash/navigation, reload/reopen. Inspect sanitized logs/storage/return destinations; no proof retained there. | US3.5–7; FR-022/023; SC-009     |
| Session and history           | Expire/revoke/ban or switch identity in another tab; focus/restore the original tab, request a direct operation and restore browser history/BFCache. Old private content stays concealed. Simulate sign-out success and failure; failed sign-out offers retry without claiming success.                                                                                           | US4; FR-024–028; SC-009         |
| Wide/short navigation         | Expand/collapse, focus/hover rail labels, scroll a short sidebar and use every account/workspace control. Expansion remains across internal routes, resets on a new document and writes no persistence.                                                                                                                                                                           | US5.1/2/6; SC-002/006           |
| Modal drawer                  | Open with pointer/keyboard, traverse focus, attempt background interaction, press Escape, navigate and cross the breakpoint while open. Check restoration/destination focus and no invisible overlay or focus trap after resize.                                                                                                                                                  | US5.3–5; SC-006                 |

Run the primary journeys in English/Arabic × Light/Dark/System. Viewports: 390×844, 768×1024, 1280×800, 1440×900, short 1280×480, 320 CSS-pixel reflow and 200% zoom. Include long names/labels and mixed-direction emails/identifiers; test OS appearance change while System is selected. Verify reduced motion and no page-level horizontal overflow. Measure at least 20 warm-session destination changes on a documented device/network for SC-010; distinguish usable content from accurately announced failure.

## Human and Release Review

Record manual keyboard-only, screen-reader, focus, contrast, touch-target, zoom/reflow and reduced-motion results separately from automation. Fluent-Arabic review must cover wording, shaping, mixed-direction content, right-side navigation and coherent reading order. Translation-key parity alone passes none of these checks.

Before merging/activation, attach actual direct-denial and isolated database/session results, fresh advisory/component review, required build checks and each applicable [security release item](../../docs/security/release-checklist.md). Hosted G1–G6, delivery/reauthentication, migration/restore and deployed ingress evidence remain open unless independently proven. Update root `plan.md` only for implemented and verified scope; do not mark the full dashboard or remainder of NEXT-04 complete.
