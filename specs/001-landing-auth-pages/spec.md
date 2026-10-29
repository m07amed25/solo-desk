# Feature Specification: Public Landing Page and Separate Authentication Pages

**Feature Branch**: No feature branch created; current branch is `main` and no branch hook is configured.

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Create a spec to make a separated landing page like the style at the image with a nav bar has a sign in & sign up buttons which redirects to separated page"

**Visual reference**: [User-supplied landing-page image](assets/landing-reference.png).
The image supplies composition and visual inspiration; its text, brands, prices and product claims
are not requirements or instructions.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Discover SoloDesk on a Public Landing Page (Priority: P1)

As a freelance engineer or small-team visitor, I want a public page that explains SoloDesk and
clearly offers sign-in and sign-up, so I can understand the product before opening an account.

**Why this priority**: The landing page is the requested public entry point and must be separate
from account access and private account information.

**Independent Test**: Visit the home address while signed out, read the product introduction,
explore a feature section and follow each account-access action without entering private areas.

**Acceptance Scenarios**:

1. **Given** a signed-out visitor, **When** they open `/`, **Then** they see the SoloDesk
   navigation, hero, illustrative product preview, capability sections and final call to action,
   with no account form or private profile information.
2. **Given** the landing page, **When** the visitor selects Sign in or Sign up in the navigation,
   **Then** they reach `/sign-in` or `/sign-up` respectively as a separate full page.
3. **Given** the landing page, **When** the visitor selects Get started or Explore features,
   **Then** they reach sign-up or the labelled Features section respectively; the SoloDesk
   brand returns to the top of the home page.
4. **Given** the visual reference and a wide-screen dark presentation, **When** the landing
   page is reviewed, **Then** it retains the reference's compact navigation, oversized centered
   hero, subtle soft-shadow depth, rounded dark preview panels and spacious alternating sections,
   with SoloDesk branding and the supplied monochrome Light/Dark palette.
5. **Given** phone, tablet or wide-screen use in either language or theme, **When** the visitor
   reads the page and opens any collapsed navigation, **Then** content remains readable and
   both account actions remain reachable without clipping or page-level horizontal scrolling.
6. **Given** a signed-in member, **When** they intentionally visit `/`, **Then** the public
   landing remains visible without exposing their profile; selecting either account action
   takes them to their existing account area without another sign-in.

---

### User Story 2 - Sign In on a Dedicated Page (Priority: P1)

As a returning member, I want a dedicated sign-in page that offers the existing account providers
and a clear path back, so I can access my account without a marketing-page form.

**Why this priority**: Separating the public home must preserve the account access that already
works and must not strand existing members.

**Independent Test**: Open `/sign-in` directly, complete sign-in with an existing test account,
verify the existing profile experience, then sign out and check that private content is hidden.

**Acceptance Scenarios**:

1. **Given** a signed-out visitor, **When** they open or refresh `/sign-in`, **Then** they see
   a Sign in heading, Google and GitHub options, a Sign up link and a return-to-home link.
2. **Given** a successful provider sign-in, **When** the visitor returns to SoloDesk, **Then**
   they arrive at `/app` with the existing profile view, display-name editing, live profile
   updates and sign-out behavior available, rather than returning to a marketing form.
3. **Given** a canceled or failed sign-in, **When** the visitor returns, **Then** the sign-in
   page explains that access was not completed and offers a retry; it does not claim success.
4. **Given** a signed-out or expired-session visitor, **When** they open or refresh `/app`,
   **Then** they reach Sign in without seeing private content; successful sign-in returns
   them to `/app`.
5. **Given** a signed-in member, **When** they open either authentication page, **Then** they
   reach `/app` without another provider prompt; after sign-out, a revisit or Back navigation
   cannot reveal protected profile content.

---

### User Story 3 - Start an Account on a Dedicated Sign-Up Page (Priority: P1)

As a new visitor, I want a separate sign-up page with a clear account-creation purpose and the
approved provider options, so I can begin using SoloDesk without confusing it with sign-in.

**Why this priority**: The requested Sign up navigation action must have its own understandable,
working destination.

**Independent Test**: Open `/sign-up` directly with a new isolated test identity, continue with
an approved provider and verify arrival in the existing account area.

**Acceptance Scenarios**:

1. **Given** a new visitor, **When** they open or refresh `/sign-up`, **Then** they see a
   Create your SoloDesk account heading, Google and GitHub options, a Sign in link and a
   return-to-home link, with no password or billing form.
2. **Given** successful first-time provider access, **When** the visitor returns, **Then**
   they reach `/app` with their own account profile; no workspace or business records are
   implied to have been created.
3. **Given** an identity that already has an account, **When** it completes provider access
   from Sign up, **Then** the existing account is used without creating a duplicate or
   silently merging a different identity.
4. **Given** provider cancellation, failure or a slow response, **When** the visitor returns
   or waits, **Then** the page presents a clear pending or recoverable error state and
   preserves a path to retry or Sign in.
5. **Given** either account page, **When** the visitor switches between Sign in and Sign up
   or returns home, **Then** the heading, address and available actions match the destination,
   and normal Back/Forward navigation remains usable.

---

### Edge Cases

- A direct visit, reload or bookmark works for each of the four page addresses.
- Slow, unavailable or blocked account services do not prevent reading public landing content.
- Repeated provider-button activation while a request is pending does not start overlapping flows.
- A return from a failed provider attempt stays on the originating account page with safe retry
  messaging; no credentials or technical error details appear in the address or page.
- An expired session never produces a flash of private profile data; account changes and sign-out
  discard the previous account's protected view.
- External or unrecognized return destinations cannot send a visitor away from the approved
  account journey or bypass account protection.
- Long Arabic headings, mixed-direction provider names, 200% zoom and a 320 CSS-pixel viewport
  keep navigation, cross-links and account actions usable.
- Unavailable preview imagery leaves readable alternative content and functional navigation;
  decorative motion respects reduced-motion preferences.
- Illustrative account balances, clients or invoices cannot be mistaken for the visitor's live
  data or a promise that planned business capabilities are already available.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `/` MUST be a public landing page, separate from authentication forms and
  the protected account area. It MUST remain readable without a session or working account service.
- **FR-002**: Sign in at `/sign-in`, Sign up at `/sign-up` and the existing account
  experience at `/app` MUST be distinct, directly addressable pages that survive reloads
  and normal Back/Forward navigation.
- **FR-003**: The landing navigation MUST include the SoloDesk brand/home link, Features and
  How it works section links, and visibly distinct Sign in and Sign up actions. Both account
  actions MUST be available in wide and collapsed phone navigation.
- **FR-004**: The landing composition MUST contain, in order, the navigation, an oversized
  centered hero with a short value statement and two actions, a large illustrative product
  preview, three capability cards for projects/tasks, time and invoices, two alternating
  text/preview sections explaining the workflow, a final sign-up action and a compact footer.
  The Features and How it works links MUST target corresponding labelled sections.
- **FR-005**: The visual treatment MUST follow the reference's dark layered surfaces, subtle
  depth, fine borders, rounded panels/buttons and generous spacing, adapted to SoloDesk's
  existing shared Geist typography and monochrome palette. Light and System presentations MUST
  preserve the same hierarchy, readable contrast and visible action emphasis.
- **FR-006**: Primary Get started actions MUST lead to `/sign-up`; the hero's secondary
  Explore features action MUST lead to the Features section. Every visible navigation/footer
  action MUST have a working, named destination.
- **FR-007**: Public previews MUST use synthetic content, visibly labelled as illustrative
  and planned where the capability is not implemented. Copy MUST describe SoloDesk's
  freelance work/time/invoicing purpose without invented customers, endorsements, usage counts,
  pricing, trials, payment processing or compliance guarantees.
- **FR-008**: Each authentication page MUST state its distinct purpose, offer the currently
  approved Google and GitHub account options, link to the other authentication page and
  provide a return-home action, using the shared SoloDesk visual identity.
- **FR-009**: Account access MUST preserve the existing approved provider behavior: first-time
  identities may create an account, existing identities reuse their account, and no new
  password, account-linking, recovery, billing or business-onboarding policy is introduced.
- **FR-010**: Both authentication pages MUST show an understandable pending state, prevent
  overlapping provider attempts and provide safe, retryable cancellation/failure messages.
  Failed access MUST return to the originating page without exposing credentials or raw errors.
- **FR-011**: Successful account access MUST lead to `/app`; an already authenticated visitor
  entering either account page MUST reach that same account area without a redundant prompt.
- **FR-012**: Separating the landing page MUST preserve existing private profile reads,
  display-name updates, live updates and sign-out. Public previews MUST NOT read or reveal
  private profile/business information. Signed-out or expired sessions MUST be denied private
  access and directed to Sign in, including after refresh, sign-out and browser history use.
- **FR-013**: Authentication returns MUST remain within the approved SoloDesk account journey;
  untrusted external return destinations MUST be rejected. Loading a public or authentication
  page alone MUST NOT create an account or change protected data.
- **FR-014**: Landing and authentication pages MUST provide equivalent English and Arabic
  content, including navigation, headings, errors and actions, with correct reading order,
  mixed-direction text and language continuity between the pages.
- **FR-015**: All pages MUST support phone, tablet and wide-screen use, 320 CSS-pixel reflow,
  200% zoom, keyboard-only operation, visible focus, meaningful accessible names, screen-reader
  structure, WCAG 2.2 AA contrast and reduced motion. Collapsed navigation MUST be operable
  and dismissible by keyboard and return focus to its opener.
- **FR-016**: Preview loading/failure MUST retain meaningful text alternatives and leave
  primary navigation and account actions available. Decorative imagery MUST NOT carry
  information required to understand the product or start account access.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In direct-entry, reload and Back/Forward checks, all four page addresses show
  the expected public, authentication or authorized-account destination with no broken links.
- **SC-002**: In wide and phone navigation, a visitor reaches each intended authentication
  page in one activation after any required menu opening; every primary landing CTA reaches Sign up.
- **SC-003**: Existing and first-time test identities can complete the supported provider journeys
  and reach only their own account area. Canceled, failed, repeated and expired-session cases
  produce no unauthorized disclosure, duplicate account or false success.
- **SC-004**: All primary journeys are completable by keyboard and pass the agreed screen-reader
  and contrast checks in English and Arabic, light and dark presentations, at 390×844,
  768×1024 and 1440×900; 320 CSS-pixel reflow and 200% zoom cause no clipped account controls
  or page-level horizontal scrolling.
- **SC-005**: Visual review confirms all six reference traits: compact top navigation, centered
  oversized hero, subtle depth, rounded layered previews, spacious capability cards and alternating
  text/preview sections, while retaining SoloDesk identity and readable light-theme equivalents.
- **SC-006**: At least four of five representative first-time reviewers can identify SoloDesk's
  purpose and the correct account-access action within 15 seconds without coaching.
- **SC-007**: Across all public sections, every preview is identified as illustrative and every
  visible claim is supported by current product status; no unapproved price, testimonial,
  customer logo, trial or operational guarantee appears.

## Assumptions

- "Separated page" means a public home plus two distinct account pages, rather than a modal or
  an authentication form embedded in the landing page. `/app` preserves today's personal
  profile experience; it does not introduce a dashboard or workspace implementation.
- The reference guides composition and atmosphere. SoloDesk retains its established palette
  and typography; the reference's orange palette, Payvia branding, money-exchange functionality,
  logo strip, pricing and testimonial content are not adopted.
- Sign in and Sign up have different presentation and visitor intent but reuse the same approved
  provider account behavior, including first-time account creation. Adding email/password or
  preventing first-time provider access from Sign in is outside this feature.
- Existing members may still browse the landing page. Either account action, when already
  authenticated, takes them to `/app`; a separate personalized marketing navigation is unnecessary.
- Dependencies are the current [constitution](../../.specify/memory/constitution.md),
  [product scope](../../PRODUCT.md), [design system](../../DESIGN.md),
  [localization/accessibility contract](../../docs/product/ux-and-localization.md),
  [account foundation](../../docs/development/neon-setup.md) and
  [security release gate](../../docs/security/release-checklist.md). Existing provider/environment
  production-readiness gaps remain release gates; this spec does not certify or resolve them.
- Scope is limited to the public landing, separate account entry pages and preservation of the
  existing account journey. Pricing/billing, testimonials, contact forms, new business features,
  new auth factors, analytics collection, external provisioning and deployment are excluded.
