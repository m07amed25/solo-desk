# Workspace Platform Browser Journey Testing Guide

This document defines the automated and manual browser verification protocol for Feature 004: Workspace Platform and Authorization across all five user story journeys, themes, locales, viewports, and accessibility requirements.

## 1. Journey Protocol

### Journey 1: Authentication & Identity Context (US1)

- **Objective**: Verify authentication state representation, unauthenticated gating, and token scrubbing.
- **Test Steps**:
  1. Navigate to `/app` unauthenticated.
  2. Verify immediate redirection to `/sign-in#`, ensuring any URL hash/fragment is completely scrubbed from navigation history.
  3. Verify `Cache-Control: private, no-store` prevents browser back-forward cache from revealing sensitive profile or workspace markup.
  4. Sign in with a verified account; verify dynamic navbar transition showing avatar and Workspace navigation link.

### Journey 2: Workspace Creation & Initial Provisioning (US2)

- **Objective**: Create a workspace with C01/C02 validation, slug uniqueness, and atomic receipt.
- **Test Steps**:
  1. Open `/app` as an authenticated user.
  2. In `WorkspacePanel`, click "Create Workspace" / "إنشاء مساحة عمل".
  3. Enter invalid slugs (uppercase, whitespace, double hyphens) and verify client/server validation errors.
  4. Submit a valid name and slug; verify loading indicator and atomic creation.
  5. Verify initial Owner badge, settings card, and default grants.

### Journey 3: Workspace Switching & Scoped Authority (US3)

- **Objective**: Switch between multiple teams without authority leakage.
- **Test Steps**:
  1. In a multi-workspace user account, open the team selector dropdown.
  2. Select an alternative workspace; verify selection cookie `solodesk_workspace_id` is set with `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure`.
  3. Verify context updates instantly and displays new workspace name, role, and membership list.
  4. In two concurrent browser tabs for the same session, select different workspaces; verify commands submitted in Tab 1 validate against Tab 1's workspace context and do not silently retarget.

### Journey 4: Member Invitation & Proof Acceptance (US4)

- **Objective**: Issue and accept invitations with fragment token privacy and single-use lifecycle.
- **Test Steps**:
  1. As an Owner or Admin, open the "Invite Colleague" modal.
  2. Enter verified colleague email and select role (Admin or Member; verify Owner is not available).
  3. Submit invitation; verify pending invitation row appears with "Resend" and "Revoke" options.
  4. Copy generated invitation link (`/app#invitation=<base64url_token>`).
  5. Open link in an unauthenticated window; verify fragment is immediately scrubbed upon redirect to `/sign-in#`.
  6. Sign in as the designated invitee; navigate to `/app#invitation=<token>`.
  7. Verify `WorkspaceInvitation` card appears, displaying workspace name and invite role.
  8. Click "Accept Invitation" / "قبول الدعوة"; verify membership is created and user is routed to the new workspace.
  9. Reload page or attempt re-acceptance; verify invitation cannot be replayed.

### Journey 5: Membership Management & Ownership Retention (US5)

- **Objective**: Administer team roles, prevent self-orphaning, and enforce active-owner invariant.
- **Test Steps**:
  1. As an Owner, navigate to the Members tab.
  2. Change a Member's role to Admin using the role dropdown.
  3. Verify an Admin cannot promote another user to Owner or demote an Owner (role ceiling).
  4. As the sole active Owner, attempt to leave the team or demote self; verify the action is blocked with invariant error: "Every workspace must retain at least one active Owner".
  5. Click "Transfer Ownership"; verify warning modal and step-up reauthentication prompt.
  6. Transfer ownership to an Admin; verify previous Owner is safely transitioned to Admin.

---

## 2. Accessibility & Responsive Verification Matrix

| Check              | Specification                                                        | Verification Method                             | Status |
| ------------------ | -------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| **English Layout** | `lang="en"`, `dir="ltr"`, Inter font                                 | Automated script + visual inspection            | PASS   |
| **Arabic Layout**  | `lang="ar"`, `dir="rtl"`, Cairo font, mirrored margins & icons       | Automated script + native speaker inspection    | PASS   |
| **Color Schemes**  | Light, Dark, System modes                                            | CSS token verification across HTML `data-theme` | PASS   |
| **320px Reflow**   | Minimum mobile width; no horizontal scroll or text clipping          | Viewport emulation at 320x568                   | PASS   |
| **200% Zoom**      | Text zoom up to 200% without loss of content or functionality        | Browser zoom test                               | PASS   |
| **Keyboard Nav**   | Logical tab stop order, Enter/Space trigger, Escape dismisses modals | Manual Tab sequence audit                       | PASS   |
| **Focus Rings**    | Visible focus ring on interactive inputs, buttons, and links         | `focus-visible:ring-2` styles verified          | PASS   |
| **Screen Readers** | ARIA live regions, explicit labels, semantic headings (`h1`–`h3`)    | Semantic HTML and ARIA audit                    | PASS   |
| **Reduced Motion** | Animations disabled when `prefers-reduced-motion: reduce` is active  | `motion-reduce` Tailwind variants               | PASS   |

---

## 3. Execution Commands

```bash
# Automated local self-check:
npm run test:workspaces:browser -- --self-check

# Isolated synthetic target run:
SOLODESK_TEST_ENV=isolated npm run test:workspaces:browser -- --manifest /path/to/isolated-manifest.json
```
