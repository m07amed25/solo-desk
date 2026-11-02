# Application Shell & Sidebar Navigation Browser Testing Guide

This document defines the automated and manual browser verification protocol for Feature 005: Application Shell and Sidebar Navigation across User Stories US1–US6, locales (en, ar), themes (light, dark, system), viewports, and accessibility criteria.

---

## 1. User Story Journeys

### Journey 1: Destination Navigation & Route Preservation (US1)

- **Objective**: Verify standard browser navigation among Overview (`/app`), Workspace (`/app/workspace`), and Personal Account (`/app/account`) with real links, breadcrumbs, and active state indicators.
- **Test Steps**:
  1. Authenticate with a valid session and navigate to `/app`.
  2. Verify shell layout renders: sidebar with brand link, navigation items (Overview, Workspace, Personal Account), workspace switcher, and user menu.
  3. Click "Workspace" (`/app/workspace`); verify URL updates via client navigation, breadcrumb reads `Overview / Workspace`, and active sidebar item updates.
  4. Click "Personal Account" (`/app/account`); verify profile form renders, breadcrumb reads `Overview / Personal Account`, and workspace-independent state.
  5. Test browser Back and Forward buttons; verify route history works cleanly without stale component states or layout re-mounts.
  6. Reload page on `/app/workspace`; verify state hydrates truthfully with current workspace selection.
  7. Compare against public `/` and auth pages (`/sign-in`, `/sign-up`); verify application shell layout is strictly separated from public/auth layouts.

---

### Journey 2: Workspace Switching & Race Condition Prevention (US2)

- **Objective**: Verify atomic workspace selection, pagination (>20 choices), delayed responses, and zero cross-team data leakage.
- **Test Steps**:
  1. Open workspace switcher in sidebar.
  2. For users with >20 workspaces, verify initial 20 choices render with a "Load more" / next-page affordance using cursor pagination.
  3. Select Workspace B while currently viewing Workspace A on `/app/workspace`.
  4. Verify immediate visual feedback: context is marked checking/transitioning, previous workspace data (members, settings, invitations) is cleared immediately before new context resolves.
  5. Rapidly alternate between Workspace A and Workspace B (20 switches); verify no race condition causes Workspace A records to appear under Workspace B selection.
  6. Simulate delayed server response (network throttling): verify loading indicator displays and UI does not allow conflicting actions until context resolves.
  7. Simulate revoked workspace access: switch to a workspace where user membership has been removed; verify clear error state and graceful fallback to unselected state without breaking the shell.

---

### Journey 3: Personal Account, Team Actions & Invitation Acceptance (US3)

- **Objective**: Validate independent personal profile operations, team actions, and explicit invitation flow with URL fragment scrubbing.
- **Test Steps**:
  1. Navigate to `/app/account`; update profile name and save. Verify changes persist without requiring any workspace membership.
  2. Simulate workspace service outage (e.g., 503 on team context); verify `/app/account` remains fully operable and independent.
  3. Enter dirty input in personal profile or workspace settings form; click an external or sidebar navigation link. Verify dirty-input confirmation dialog ("Discard unsaved changes?") prevents accidental data loss.
  4. Open invitation URL containing fragment proof (`/app#invitation=<token>`).
  5. Verify fragment is captured into memory and scrubbed from browser address bar immediately before rendering.
  6. Verify invitation card displays workspace name and role with explicit "Accept" and "Dismiss" buttons (no auto-acceptance).
  7. Click "Accept"; verify membership creation and automatic transition to the newly accepted workspace.
  8. Test malformed or oversized (>4096 chars) fragments; verify safe rejection and error toast without crashing the runtime.

---

### Journey 4: Access Denial, Lifecycle & Sign-Out Privacy (US4)

- **Objective**: Verify fail-closed redirection for unauthorized routes, session expiration handling, pagehide concealment, and safe sign-out.
- **Test Steps**:
  1. Attempt to access `/app`, `/app/workspace`, or `/app/account` with an expired or missing session.
  2. Verify immediate redirection to `/sign-in?returnTo=%2Fapp...#` with scrubbed fragment.
  3. Sign in; verify user is returned directly to the requested destination (`returnTo`) and fragment is cleared.
  4. Test tampered `returnTo` parameters (e.g., `returnTo=https://evil.example` or `returnTo=/app/unsupported`); verify fallback to `/app`.
  5. With an authenticated session open, trigger session expiry or revocation in another tab.
  6. Refocus the application tab; verify runtime recheck detects invalid session within 55s or on window focus, conceals private data, and transitions to signed-out state.
  7. Click "Sign out" from user menu; verify sign-out request completes, local runtime state is cleared, and user is redirected to `/sign-in#` without leaving cached profile data in BFCache.

---

### Journey 5: Responsive Layout, Drawer & Touch Interactions (US5)

- **Objective**: Verify responsive behavior across desktop (expanded & icon rail), tablet, and mobile (modal drawer) at 768px breakpoint.
- **Test Steps**:
  1. On desktop (>768px), verify sidebar renders in expanded state (`expanded=true`) by default with text labels and icons.
  2. Click collapse toggle; verify sidebar collapses to icon-rail mode (`expanded=false`) and tooltips appear on hover/focus over icons.
  3. Verify expansion state is stored in memory only (no cookie writes, no localStorage persistence, resets on full document reload).
  4. Resize viewport below 768px; verify desktop sidebar hides and mobile menu trigger appears in header.
  5. Click mobile menu trigger; verify Base UI Sheet opens as modal drawer, focus is trapped inside drawer, and background scrolling is blocked.
  6. Press Escape or click outside; verify drawer dismisses and focus returns to opener trigger.
  7. In mobile drawer, click a navigation link; verify navigation completes, drawer automatically closes, and focus moves to main content.
  8. Test at 320 CSS pixels reflow and 200% zoom; verify no horizontal layout overflow or clipped touch targets.

---

### Journey 6: Bilingual Matrix, Themes & Direction (US6)

- **Objective**: Verify full visual and semantic parity across English (LTR) and Arabic (RTL) in Light, Dark, and System themes.
- **Test Steps**:
  1. Switch language to Arabic (`ar`); verify `html[dir="rtl"]`, sidebar positions on right side, chevron icons flip appropriately, and font switches to Sahabah/Cairo typography.
  2. Verify mixed-direction strings (e.g., email addresses, English workspace slugs, timestamps) render correctly without text mangling.
  3. Switch themes: Light, Dark, and System. Verify semantic color tokens adapt cleanly:
     - Monochrome tokens maintain WCAG AA contrast (≥4.5:1 for text, ≥3:1 for UI boundaries).
     - Borders, cards, and backgrounds use correct token values (`bg-background`, `text-foreground`, `border-border`).
  4. Test OS theme changes: when System theme is active, toggling OS dark mode immediately updates application appearance.
  5. Test with `prefers-reduced-motion: reduce`; verify CSS transitions and drawer animations are disabled or reduced to instant swaps.

---

## 2. Viewport & Device Testing Matrix

| Device / Viewport   | Dimensions (CSS px) | Target Mode      | Key Criteria                                            |
| :------------------ | :------------------ | :--------------- | :------------------------------------------------------ |
| **Mobile Small**    | 320 × 568           | Mobile Drawer    | No horizontal overflow; touch targets ≥ 44×44px         |
| **Mobile Standard** | 390 × 844           | Mobile Drawer    | Safe area insets; drawer sheet height & gesture dismiss |
| **Tablet Portrait** | 768 × 1024          | Breakpoint Edge  | Clean transition at 768px; no layout flicker            |
| **Desktop Laptop**  | 1280 × 800          | Expanded Sidebar | Breadcrumbs, workspace switcher, and header alignment   |
| **Desktop Wide**    | 1440 × 900          | Expanded Sidebar | Max content bounds; sidebar toggle responsiveness       |
| **Short Viewport**  | 1280 × 480          | Scrollable Nav   | Sidebar nav items scrollable when height is constrained |

---

## 3. Execution Commands

```bash
# Automated HTTP & SSR contract suite:
node scripts/test-site-http.mjs

# Unit contract & component tests:
npm test

# Full validation gate:
npm run test:full
```
