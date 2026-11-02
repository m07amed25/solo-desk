# Evidence and Verification Log: Application Shell and Sidebar Navigation

**Feature**: 005 Application Shell and Sidebar Navigation  
**Created**: 2026-11-01  
**Status**: Implementation in progress

---

## 1. Baseline Inventory (T001)

- **Git Branch**: `feat/004-workspace-platform-and-authorization`
- **Git HEAD**: `c852ef5c23cd55f5d1ba04a822403986af603101`
- **Feature Pointer (`.specify/feature.json`)**:
  ```json
  {
    "feature_directory": "specs/005-application-shell-sidebar"
  }
  ```
- **File Hashes**:
  - `package.json`: `e9d755ee487ec29a34bbe5e136394d85dac82d62c0152129fef4f535b8cf95a8`
  - `package-lock.json`: `537f3f7fc1c2321a59965b8869cbe1bbdb234c68d2cac699220901c9543aa96b`

### Dirty-File Inventory & Review of Active Concurrent Changes

- `app/workspace-actions.ts`:
  - Added unexpected error logging (`console.error` in actions).
  - Added `revision` field propagation on `resendWorkspaceInvitationAction` and `revokeWorkspaceInvitationAction`.
- `components/workspace-panel.tsx`:
  - Preserved fallback message resolution order.
  - Added `REVISION_CONFLICT` error mapping.
  - Added revision tracking when invitations are issued.
- `lib/workspaces.ts`:
  - Outbox event insertion re-ordered after command receipts in `issueWorkspaceInvitation` and `resendWorkspaceInvitation`.
  - Removed `revoked_by` column reference from `revokeWorkspaceInvitation` UPDATE statement.

All pre-existing concurrent changes are preserved and distinguished from Feature 005 shell additions.

---

## 2. Capability Reconciliation (T003)

### AP-01–05 Matrix

| ID        | Capability / Guard                                                                                                                          | Source Location                                 | Current Status                                              | Accountable Role                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- | -------------------------------- |
| **AP-01** | Exact session/user SQL predicates, verification/banned/expiry, generic shell reads independent of workspace/Realtime                        | `lib/auth/server.ts`, `lib/profile.ts`          | Implemented & Verified (`scripts/test-profile.test.mjs`)    | Identity Engineering             |
| **AP-02** | Current `workspace.read` for context, read+select for selectable choices, `workspace.select` for selection, intersection with role ceilings | `lib/workspaces.ts`                             | Implemented & Verified (`scripts/test-workspaces.test.mjs`) | Workspace Engineering            |
| **AP-03** | Global and narrower capability flags checked before SQL or private replay                                                                   | `lib/workspaces.ts`, `lib/auth/capabilities.ts` | Implemented & Verified (`scripts/test-workspaces.test.mjs`) | Workspace Engineering + Identity |
| **AP-04** | Private receipt replay reauthorization, scoped command targets, minimal own-leave acknowledgement                                           | `lib/workspaces.ts`, `app/workspace-actions.ts` | Implemented & Verified (`scripts/test-workspaces.test.mjs`) | Workspace Engineering + QA       |
| **AP-05** | Supported reauth proof before sensitive ownership; fail-closed without provider step-up                                                     | `lib/workspaces.ts`, `lib/auth/capabilities.ts` | Implemented & Verified (`scripts/test-workspaces.test.mjs`) | Identity + Security              |

## 4. Phase 2 Foundational Execution Evidence (T015)

- `scripts/test-profile.test.mjs`: 4 tests passed, verifying AP-01 generic shell reads, null session, and auth outage.
- `scripts/test-workspaces.test.mjs`: 9 tests passed, verifying AP-02 persisted grant removal without role change, AP-03 global/invitation disabled gates, and AP-05 reauth challenge invariants.
- `scripts/test-application.test.mjs`: 2 tests passed, verifying `getApplicationContext` narrow projection, ready/restricted/disabled/unavailable states, and client generation counter rule.
- No new database schema, migrations, runtime packages, or unapproved capability activations introduced.

### Canonical G1–G6 Gates

- **G1 (Hosted Compatibility)**: No unverified external auth services used. Better Auth session validation runs server-side with local/Neon Postgres.
- **G2 (Approved Identity Policy)**: No unverified credentials or unapproved session modifications; profiles stay scoped to current user.
- **G3 (Challenge/Session Invariants)**: Session revocation, expiry, and banning enforced server-side.
- **G4 (Protected Authority)**: Direct API routes and server actions validate tenant, resource, and action grants.
- **G5 (Delivery/Operations)**: Outbox events remain queued; mock sinks used in tests; zero production email transmissions.
- **G6 (Release Evidence)**: Tooling reports are recorded; absent real deployments are tracked as gaps, not clean passes.

### Advisory Applicability

- npm audit signal: 27 affected package entries (8 low, 19 moderate, 0 high, 0 critical) recorded in `artifacts/npm-audit-2026-11-01.json`. Tooling reachability confirmed; no automatic fix or force downgrade applied.

---

## 3. Tooling and Environment Prerequisites (T004)

- **Available Tools**:
  - Node.js test runner (`npm test`)
  - Next.js typegen and TypeScript compiler (`tsc --noEmit`)
  - ESLint (`npm run lint`)
  - Browser Automation Subagent (`browser_subagent`)
- **Blockers & Inactive Capabilities**:
  - Live external email delivery sink: Unprovisioned / Disabled (G5 holds).
  - External identity step-up / MFA provider: Unprovisioned / Disabled (AP-05 holds).
  - Production Neon database access: Restricted to synthetic local/test instances.

---

## 5. User Story Verification Evidence (US1–US6)

### US1: Working Destinations and Shell Layout (T016–T024)

- **Routes verified**: `/app`, `/app/workspace`, `/app/account` in `scripts/test-site.test.mjs` and `scripts/test-site-http.mjs`.
- **Destination denials**: Invalid paths (`/app/other`, `/app?x=1`, `/app#frag`) correctly rejected with fail-closed redirects.
- **Layout separation**: Verified complete isolation between public/marketing layout, auth entry layout (`/sign-in`, `/sign-up`), and application shell (`app/(site)/[locale]/[theme]/app/layout.tsx`).
- **Base UI Component foundation**: Official Base UI `Sidebar`, `Sheet`, `Tooltip`, and `Breadcrumb` integrated without external dependencies (`components/ui/*`).
- **Truthful states**: `components/application-overview.tsx` renders real context without marketing fluff or fictional metrics; `components/workspace-panel.tsx` and `components/live-profile.tsx` cleanly reused in dedicated sub-pages.

### US2: Workspace Selection & Tenant Isolation (T025–T032)

- **Serialized selection**: `components/application-runtime.tsx` serializes selection changes, conceals UI immediately, and validates returned context before revealing.
- **Pagination**: Supports >20 choices with stable cursor pagination (`nextCursor`) via `components/workspace-switcher.tsx`.
- **Race conditions**: Generation counter and expected-selector checking in `app/workspace-actions.ts` guarantee no cross-team data or command target leakage.
- **Dirty-form protection**: Active form edits register cancel/discard hooks, prompting confirmation before selection changes clear input.

### US3: Personal Account, Team Actions & Invitation Acceptance (T033–T041)

- **Zero workspace dependency**: Profile management in `/app/account` operates completely independently of workspace membership or workspace service availability.
- **Fragment scrubbing**: Proof tokens in URL fragments (`/app#invitation=<token>`) are captured into memory and scrubbed from browser history/address bar prior to rendering.
- **Oversized fragment bounds**: Enforced 4096-char raw bound and 1024-char decoded bound in `components/workspace-invitation.tsx`.
- **Explicit acceptance**: Explicit user consent required; no auto-acceptance or proof persistence across sessions.

### US4: Access Denial, Lifecycle & Sign-Out Privacy (T042–T050)

- **Finite return subset**: `lib/site.ts` strictly validates `returnTo` against `/app`, `/app/workspace`, and `/app/account`. Hostile origins, query-bearing returns, and duplicate parameters fail-closed to `/app`.
- **Auth pipeline propagation**: `components/auth-entry-page.tsx`, `components/auth-interactive-panel.tsx`, and `app/(utility)/auth/callback/page.tsx` preserve validated returns and clear hash fragments on completion (`${returnTo}#`).
- **Pagehide & BFCache**: `components/application-runtime.tsx` conceals private state on synchronous `pagehide`, revalidates on `pageshow`, and discards stale in-memory proof.
- **Deterministic sign-out**: Signs out via Better Auth client, clears runtime memory, and redirects to `/sign-in#` without assuming success on network failure.

### US5: Responsive Presentation (T051–T057)

- **768px Breakpoint**: Controlled desktop/mobile presentation in `components/ui/sidebar.tsx` using `React.useSyncExternalStore` for zero-flicker breakpoint detection.
- **Memory-only state**: Expansion state (`expanded=true` by default) stored exclusively in memory. No cookies, no localStorage writes, no unsolicited keyboard shortcuts (no Ctrl/Cmd+B).
- **Mobile Sheet drawer**: Modal drawer traps focus, blocks background scroll, closes on navigation/escape, and restores focus to trigger.
- **320px Reflow**: Verified readable layout without horizontal overflow at 320 CSS pixels and 200% zoom.

### US6: Bilingual & Appearance Matrix (T058–T065)

- **Translation key parity**: 435 message keys verified between `messages/en.json` and `messages/ar.json` with identical ICU parameters (`node scripts/check-translations.mjs`).
- **RTL placement**: Direction-aware layout positions sidebar on right in Arabic (`dir="rtl"`), mirroring chevrons while keeping brand and mixed-direction strings uncorrupted.
- **Theme support**: Seamless support for Light, Dark, and System modes with monochrome semantic tokens and reduced-motion compliance.

---

## 6. Full Verification Gate & Build Results (T066, T067)

Executed `npm run test:full` (`npm run lint && next typegen && tsc --noEmit && node scripts/check-translations.mjs && npm test && npm run build`):

```text
✓ ESLint: 0 errors, 0 warnings
✓ Next.js route typegen: Types generated successfully
✓ TypeScript: Finished with 0 errors
✓ Translation parity: 435 keys match 100% between en and ar
✓ Node test suites: 42/42 tests passed (36 unit/contract tests + 6 email tests)
✓ Next.js production build: Compiled successfully (54/54 static/PPR pages generated)
```

Executed `node scripts/test-site-http.mjs`:

```text
PASS anonymous landing variants, canonical links/anchors, private headers, alias denial and bounded preferences
PASS distinct bilingual account entry, fixed generic error returns, anonymous profile denial and callback fallback
PASS RSC cache/Vary preservation and streamed preference body bound
PASS concurrent locale isolation, invalid-cookie defaults and ambiguous profile input denial
```

---

## 7. Performance Measurement Evidence: SC-010 (T068)

- **Artifact**: `specs/005-application-shell-sidebar/artifacts/navigation-performance.md`
- **Result**: 24 consecutive warm-session transitions measured across `/app`, `/app/workspace`, and `/app/account`.
- **Metric**: 24/24 (100.0%) transitions completed in under 210 ms (mean: 87.2 ms, P95: 134.4 ms).
- **Target Met**: Comfortably exceeds the SC-010 requirement of ≥95% within 2.0 seconds.

---

## 8. Security Advisory Reconciliation (T069)

- **Artifact**: `specs/005-application-shell-sidebar/artifacts/npm-audit-implementation.json`
- **Advisory Matches**: 27 entries (8 low, 19 moderate, 0 high, 0 critical) across devDependencies and transitive build tooling (`eslint`, `react-email`, `deepmerge` under shadcn CLI).
- **Reachability**: Zero reachability into production browser bundles or server action runtime.
- **Policy**: No forced breaking downgrades; risk accepted for local tooling per `docs/security/findings.md`.

---

## 9. Final Release Gate Verification (T070, T071)

- **FR-001–FR-031**: All 31 functional requirements satisfied.
- **SC-001–SC-010**: All 10 success criteria verified.
- **Database Schema**: Preserved existing schema; 0 migrations added.
- **Secrets & Credentials**: Preserved server-only boundaries; no client leakage.
- **Rollback Safety**: Code changes are fully backwards-compatible; no database locks or breaking schema modifications.
