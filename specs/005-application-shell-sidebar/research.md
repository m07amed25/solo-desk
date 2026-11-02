# Research: Application Shell and Sidebar Navigation

Date: 2026-11-01. Design research only; decisions below resolve planning questions without enabling gated capabilities. Sources are the current checkout, installed framework guides and primary documentation. The specification and its quality checklist remain unchanged.

## Baseline and Evidence

- Starting Git branch: `main`; HEAD `c852ef5c23cd55f5d1ba04a822403986af603101`. The checkout later changed concurrently to `feat/004-workspace-platform-and-authorization` at the same HEAD. This workflow did not switch it. The setup script reports feature context `005-application-shell-sidebar`, not an actual branch switch.
- Lockfile SHA-256: `537f3f7fc1c2321a59965b8869cbe1bbdb234c68d2cac699220901c9543aa96b`. Host Node: 24.21.0. Deployed versions are unverified.
- Exact lockfile versions: Next.js 16.4.3; React/React DOM 19.3.0; TypeScript 5.9.3; next-intl 4.14.9; Tailwind 4.3.3; Base UI 1.9.0; shadcn 4.23.0; pg 8.23.1; Neon Auth SDK 0.7.0-beta; Better Auth 1.7.14; Neon Realtime 0.1.2 and Realtime React 0.1.1. Package ranges are not evidence of deployed versions.
- `next.config.ts` enables Cache Components and partial prefetching. `components.json` selects `base-nova`, Lucide and `rtl: false`. Existing UI has no Sidebar, Sheet, Tooltip or Breadcrumb; sidebar semantic roles already exist in `app/globals.css`.
- Current `/app` reads a profile envelope but does not render its editor; workspace exceptions collapse into empty state and an inaccessible selection can silently fall back to another workspace. The Feature 004 summaries do not override this source evidence.
- Research was divided into read-only routing, component and authority investigations as required by the planning skill. No agent changed application files or contacted a protected service.

## R1 — Three finite destinations, one nested application boundary

**Decision:** Keep `/app` as Overview; add `/app/workspace` and `/app/account`. Retain the existing localized/theme root and public/auth layouts. Add only the nested `app/(site)/[locale]/[theme]/app/layout.tsx` and `template.tsx` boundaries.

**Rationale:** Existing exact return-path handling rejects child destinations. Extend one finite destination contract across proxy, preferences, auth entry and callback rather than admitting arbitrary `/app/*` strings. Template remounts at this child level prevent private page state from living indefinitely in a persistent layout. Installed `layout.md` and `template.md` document these different lifetimes.

**Alternatives considered:** Another root layout would duplicate document setup; a persistent private layout DTO would require a synchronization bridge; full-page-only navigation would unnecessarily discard presentation state.

## R2 — Preserve presentation, re-establish private context

**Decision:** The persistent nested layout holds only direction, sidebar expansion/mobile presentation, and invitation capture/scrub outside the private suspense boundary. The template renders `Suspense → AuthenticatedApplication → ApplicationRuntime → shell + page`. All session/cookie/SQL reads occur beneath Suspense. Page guards and template share one render-pass-cached application loader; routes/actions retain their own service checks.

**Rationale:** A template resets nested client state between these three destinations, but neither remounting nor a cached route proves current authority. The runtime conceals private UI before navigation/restore and revalidates through one thin context endpoint. A fresh document bootstrap can serve first hydration; cached re-entry must recheck before reveal. Never use `use cache`, `use cache: private`, or a process-global cache for authority. React's memoization is per server request, suitable only for avoiding repeated render reads. [React cache](https://react.dev/reference/react/cache)

**Alternatives considered:** A global account store or page-to-layout DTO bridge adds a second authority; independent mount loaders in every widget duplicate requests. Do not add removed `dynamic`, `revalidate` or `fetchCache` segment options under Cache Components.

## R3 — One small server loader and one private client owner

**Decision:** Add server-only `lib/application.ts` for application bootstrap/context projection. It calls current identity and existing workspace services, returning separate account, workspace-collection and selection states. `/api/app/context` invokes the same uncached service for lifecycle rechecks. Reuse `/api/workspaces` for later list pages; do not create a competing workspace API.

**Rationale:** Overview and Workspace consume the runtime's current context, not independently displayed server snapshots. Personal account alone calls `loadProfile` and mounts the existing profile editor/live subscription. This avoids creating and discarding a sealed profile query on every shell read. Keep actor/session overrides strictly server-internal.

**Alternatives considered:** Calling `/api/profile` to bootstrap navigation needlessly couples the shell to Realtime; calling the shell's own HTTP endpoint from Server Components adds a transport hop.

## R4 — Safe selection needs serialized writes as well as stale-result guards

**Decision:** Retain the existing HttpOnly workspace-selection cookie and action. Serialize switches within a tab, disable additional selection while pending, conceal the old team subtree, perform the selection, then read authoritative context before reveal. Correlate responses with actor, workspace and client generation. Clear revoked selection through an expected-selector action; GET context reads never mutate cookies. Request-cookie comparison is not cross-tab compare-and-swap; concurrent cookie responses require re-reading context and safe mismatch recovery.

**Rationale:** Ignoring an old response cannot undo an out-of-order cookie write from overlapping actions. Abort/generation checks are still required for list, member, invitation and mutation completions. Capture each command's original target; key team views by account/workspace. Other tabs may change the shared preference, so foreground/history checks re-resolve it and never retarget work silently.

**Alternatives considered:** Reloading after every selection still exposes old content until unload; automatically choosing the first available team conceals access loss. No workspace subscription exists today; do not invent one.

## R5 — Existing authority requires bounded prerequisites

**Decision:** Before consuming enabled workspace behavior, correct effective grant projections and selection checks, enforce existing flags in every affected service including replay paths, and verify exact current account/session authority. Reuse one local service authorizer where repetition warrants it, without a generic repository or policy framework. Keep unsupported sensitive ownership operations fail-closed.

**Rationale:** `getWorkspaceContext` currently returns role-template grants, some list services lack global gates, invitations do not use the narrower invitation flag, and ownership transfer does not use its default-off flag. Some receipt replay paths precede current grant checks. Existing timestamp-based `verifyFreshReauth` is not evidence of a completed authentication challenge. These source gaps are prerequisites, not permission to finish Feature 004's worker or auth policy.

**Alternatives considered:** Hiding controls alone violates direct-execution requirements; accepting all of Feature 004 as verified contradicts inspected code. If a prerequisite cannot be proven, leave the affected capability disabled and retain independently testable shell/personal-account work.

## R6 — Reuse identity, preserve profile independence

**Decision:** Preserve Managed Better Auth. Strengthen the shared current-account boundary, where needed, with the existing profile SQL's exact session/user, verified, banned and expiry predicates; keep secrets/queries server-only and the profile sealed-query predicates intact. Reuse/refactor `LiveProfile` lifecycle safeguards into the shell owner while retaining its personal form, validation, own-user live-query renewal and cleanup.

**Rationale:** Shell identity must not depend on workspace availability or manufacture a Realtime envelope. Cookie-cache bypass is documented by Better Auth, but managed SDK transport/hosted behavior still needs isolated proof. Session freshness timestamps do not establish new step-up support. [Better Auth session management](https://better-auth.com/docs/concepts/session-management)

**Alternatives considered:** A second session provider/timer in every widget multiplies requests and lifecycle races; replacing managed auth or migrating its schema is outside scope.

## R7 — Use official Base UI components with small reviewed adaptations

**Decision:** Add official `@shadcn` Base UI Sidebar, Sheet, Tooltip and Breadcrumb source only as needed. Reuse existing DropdownMenu, Button, Card, Alert, Skeleton, Field, Input, Avatar and Separator. Use `collapsible="icon"`, controlled expansion, and a shared 768 CSS-pixel CSS/JS breakpoint. Keep desktop expansion in memory across internal app navigation, initially expanded; no cross-visit persistence is required.

**Rationale:** Current primary sources document this composition. Review resolved source/dependency graph before installation; no new runtime package appears necessary with installed Base UI/Lucide. Inspect and remove any provider cookie writes and unrequested Ctrl/Cmd+B shortcut rather than assuming controlled props suppress them. No preset regeneration or primitive migration. [Sidebar](https://ui.shadcn.com/docs/components/base/sidebar), [Sheet](https://ui.shadcn.com/docs/components/base/sheet), [Tooltip](https://ui.shadcn.com/docs/components/base/tooltip), [Breadcrumb](https://ui.shadcn.com/docs/components/base/breadcrumb)

**Alternatives considered:** Custom modal/focus infrastructure or a gesture drawer library adds unnecessary code/dependencies. A persistent preference service is optional work with no need in this feature.

## R8 — Direction, focus and compact visual hierarchy are explicit contracts

**Decision:** Use existing semantic sidebar/content tokens, 16px body text, Rugis/Sahabah headings and Geist navigation. Desktop sidebar width starts at the component's 16rem convention; icon rail is compact; main content uses remaining width with logical padding and stacked narrow forms. Use existing 44px Button variants for primary shell touch controls. Child pages have App home → current page breadcrumbs; Overview has no redundant breadcrumb.

**Rationale:** Follow `DESIGN.md`, not the skills' sample palettes or breakpoint tables. Use Base UI DirectionProvider, right-side Sidebar/Sheet in Arabic, logical CSS and mixed-direction isolation. Portal direction and existing menu physical spacing require review. Sheet provides modal focus/scroll behavior; installed Base UI uses `initialFocus`/`finalFocus`, not Radix autofocus callbacks. [DirectionProvider](https://base-ui.com/react/utils/direction-provider), [Dialog](https://base-ui.com/react/components/dialog), [shadcn RTL](https://ui.shadcn.com/docs/rtl)

**Alternatives considered:** A visual redesign, new fonts or marketing-scale headings conflict with the bounded shell. Tooltips supplement accessible names rather than replacing them.

## R9 — Finite authentication returns, no proof forwarding

**Decision:** Add optional single `returnTo` constrained to the three app destinations across auth normalization, sign-in/sign-up links, enabled auth methods, provider callback and already-authenticated entry. Default to `/app`. Keep the existing three-field preference request shape and extend only its finite destination values. Normalize hostile/duplicate query fields safely and use explicit empty fragments on redirects out of invitation contexts.

**Rationale:** Current auth paths hardcode `/app`; updating only callback loses child resumption elsewhere. A bounded internal destination is presentation state, not authorization. Do not accept external URLs, prefixes, query-bearing destinations, fragments or invitation proof as returns.

**Alternatives considered:** A generic redirect parameter enlarges the attack surface; a persistent invitation-return cookie violates the proof contract.

## R10 — Scrub invitations before private work, accept only explicitly

**Decision:** Capture and scrub invitation fragments in the non-private app boundary before account/workspace loading resolves. Preserve `history.state`, remove proof before bounded decoding, handle malformed encoding and initial/hash/navigation arrivals, and hold proof only in memory. The private acceptance view uses current recipient identity and effective invitation capability; disabled/failure/signed-out states scrub and offer safe recovery.

**Rationale:** The current component mounts too late and decodes before scrubbing. Proof is discarded on dismissal, identity loss and flow exit; after sign-in or reload the user reopens the original invitation. A generic reopen message avoids a new return channel. Full-document/streaming redirects can precede hydration, so explicit empty-fragment redirects and actual browser tests are mandatory; an effect alone does not prove privacy.

**Alternatives considered:** Automatically joining, moving proof into a query/cookie or retaining it through identity changes violates the existing lifecycle. Worker delivery completion remains excluded.

## R11 — Honest states and existing transaction behavior

**Decision:** Keep account authority separate from team availability; retain loading/empty/disabled/unselected/restricted/unavailable states and paginated workspace choices. Preserve in-memory form input after recoverable failures; confirm discard before in-app route/switch/preference changes. Preserve original operation IDs/digests/revisions and existing transactional effects rather than rebuilding commands in the shell.

**Rationale:** Team outages must not disable profile access, report empty memberships or imply saved work. Domain transactions, receipt reconciliation and last-owner invariants stay in existing services. No schema, indexes, jobs, protected browser drafts or financial logic are introduced.

**Alternatives considered:** One global “loading or empty” flag conflates failures; generic persistence and command frameworks expand NEXT-04 beyond this feature.

## R12 — Evidence is capability-specific and current

**Decision:** Extend existing local contracts, add focused shell state tests, and require actual authenticated browser plus isolated PostgreSQL/session evidence for affected enabled journeys. Keep human keyboard/screen-reader/contrast/zoom and fluent-Arabic review separate. Planning validation does not pass any release gate.

**Rationale:** Existing workspace tests use mocked adapters; the “browser” runner performs anonymous HTTP/source checks; PostgreSQL self-check inspects SQL text. Their results cannot accept these new journeys. The retained fresh [npm audit report](artifacts/npm-audit-2026-11-01.json) exited 1 with 27 package entries: 8 low, 19 moderate, zero high/critical reported. Three underlying advisory objects concern deepmerge, glob and minimatch; transitive propagation includes installed auth/email/tooling packages. Reachability and deployed graph remain unassessed here; prior blanket tooling-only acceptance is not inherited. No forced downgrade or dependency fix was applied.

**Alternatives considered:** Static screenshots, translation parity, source-pattern assertions or historical pass summaries alone cannot establish interaction, isolation or current advisories.

## Research Completion

All design questions above have bounded decisions. Hosted policy/version/support, isolated integration, delivery, reauthentication, human review and deployed security remain explicit activation/evidence dependencies, not unanswered design choices. The constitution's pre-research review permits this bounded design; post-design gates and owned prerequisite work are recorded in [plan.md](plan.md).

Installed version-matched references: [layout](../../node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md), [template](../../node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/template.md), [authentication with Cache Components](../../node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md), [server/client boundary](../../node_modules/next/dist/docs/01-app/02-guides/server-and-client-boundary.md), [migration restrictions](../../node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md). Consult the installed copies again if dependencies change before implementation.
