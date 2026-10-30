# Feature Specification: Detailed Public Landing Page Upgrade

**Feature Branch**: No new branch created; no `before_specify` hook is configured. Current branch is
`feat/001-landing-auth-pages`.

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "I need to upgrade the landing. Add more details. and more...."

## Clarifications

### Session 2026-10-30

- Q: Should the page include a pricing section? → A: No pricing section; the FAQ states that
  pricing has not been announced.
- Q: Should the page collect visitor information? → A: Yes, through a contact form, with consent,
  privacy notice, abuse protection and an owner responsible for replies.
- Q: Single page or separate pages? → A: All added detail lives on one long home page with section links.

**Builds on**: [001 Public Landing Page and Separate Authentication Pages](../001-landing-auth-pages/spec.md).
All 001 requirements for routes, account actions, authentication pages, bilingual/RTL, theme and
accessibility behavior remain in force unless this specification explicitly extends them.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Understand What SoloDesk Does in Depth (Priority: P1)

As a freelance engineer, independent consultant or boutique-team lead evaluating tools, I want the
landing page to explain each SoloDesk capability area in concrete detail, so I can judge whether it
fits my client, time and invoicing workflow before creating an account.

**Why this priority**: The current page states the purpose in a few short cards. Visitors need
substantially more detail to evaluate the product; this is the core of the requested upgrade.

**Independent Test**: As a signed-out visitor, open the home page, use the product tour to view
every capability area, and confirm each one presents a specific explanation, key details, an
illustrative preview and an honest availability status.

**Acceptance Scenarios**:

1. **Given** a signed-out visitor on the home page, **When** they reach the product tour, **Then**
   they can view at least five capability areas: Clients, Projects & tasks, Time tracking,
   Invoices & payments, and Insights.
2. **Given** the product tour, **When** the visitor selects a capability area, **Then** they see its
   title, a one-sentence outcome, three to five specific detail points and an illustrative preview,
   without leaving the page or losing their scroll position.
3. **Given** any capability area, **When** it is displayed, **Then** it shows an availability label
   (Available, In development or Planned) consistent with the current product status.
4. **Given** keyboard or screen-reader use, **When** the visitor moves through the product tour,
   **Then** every capability area is reachable, the selected area is announced and its content is
   read in logical order.
5. **Given** a phone viewport, **When** the visitor uses the product tour, **Then** all capability
   areas remain selectable and readable without page-level horizontal scrolling.

---

### User Story 2 - See Why SoloDesk Is Different and Trustworthy (Priority: P1)

As a privacy- and precision-minded technical professional, I want to understand SoloDesk's
principles — exact financial handling, fast keyboard-driven work, transparent save states, data
privacy and full English/Arabic support — so I can trust it with my client and billing data.

**Why this priority**: SoloDesk's positioning depends on craft, exactness and privacy. Visitors
cannot infer these from the current capability cards alone, and they strongly influence sign-up.

**Independent Test**: Read the principles and privacy sections and confirm each commitment is
specific, matches documented product principles and contains no unsupported guarantee.

**Acceptance Scenarios**:

1. **Given** the home page, **When** the visitor reaches the "Why SoloDesk" section, **Then** they
   see four principles: financial exactness, speed and low cognitive load, transparent save state,
   and data privacy and isolation, each with a short, concrete explanation.
2. **Given** the privacy and security section, **When** it is read, **Then** it explains in plain
   language how visitor and account data is treated (for example, no advertising trackers,
   opt-in product analytics, workspace isolation) and links to any existing public policy pages.
3. **Given** any principle or privacy statement, **When** it is reviewed against current product
   documentation, **Then** it makes no certification, compliance, uptime, legal or tax guarantee.
4. **Given** the bilingual commitment, **When** the visitor switches language, **Then** the page
   itself demonstrates the commitment with complete Arabic content and correct right-to-left layout.

---

### User Story 3 - Follow a Clear Path From First Visit to First Invoice (Priority: P2)

As a prospective user, I want to see the step-by-step journey — create an account, add a client and
project, track time and prepare an invoice — so I understand how quickly I could start working.

**Why this priority**: A concrete journey reduces uncertainty and connects capability detail to
the sign-up action, but the page is still useful without it.

**Independent Test**: Read the How it works section and confirm it shows ordered steps, each with
a short description and illustrative visual, ending in a Get started action that reaches sign-up.

**Acceptance Scenarios**:

1. **Given** the How it works section, **When** it is displayed, **Then** it presents four ordered,
   numbered steps from account creation to invoice preparation.
2. **Given** a step that depends on a capability not yet available, **When** it is displayed,
   **Then** it carries the same availability label used in the product tour.
3. **Given** the end of the journey, **When** the visitor selects Get started, **Then** they reach
   the Sign up page.

---

### User Story 4 - Get Answers to Common Questions (Priority: P2)

As a cautious evaluator, I want answers to common questions about availability, data ownership,
languages, devices, teams and account access, so I can resolve doubts without contacting anyone.

**Why this priority**: Answers reduce sign-up hesitation and support burden; the page remains
functional without them.

**Independent Test**: Open and close every FAQ entry with mouse, touch and keyboard, and confirm
each answer is accurate against current product status.

**Acceptance Scenarios**:

1. **Given** the FAQ section, **When** it is displayed, **Then** it lists six to ten questions with
   answers collapsed by default and each question visible.
2. **Given** a collapsed question, **When** the visitor activates it, **Then** its answer expands,
   its expanded state is announced and other content does not shift unexpectedly.
3. **Given** a direct link to the FAQ section, **When** it is opened, **Then** the page scrolls to
   the section with the section heading in view below the navigation.

---

### User Story 5 - Understand What Is Available Now and What Is Coming (Priority: P3)

As a visitor considering long-term adoption, I want to see which capabilities are available, in
development or planned, so my expectations match reality.

**Why this priority**: Roadmap visibility builds trust and prevents mistaken expectations, but it
is secondary to explaining the product itself.

**Independent Test**: Compare every roadmap entry with the current product status and confirm no
capability is shown as more advanced than it is.

**Acceptance Scenarios**:

1. **Given** the roadmap section, **When** it is displayed, **Then** capabilities are grouped as
   Available, In development and Planned, without committing to calendar dates.
2. **Given** a status change in the product, **When** the landing content is updated from its single
   owned status source, **Then** the product tour, journey and roadmap labels change consistently.

---

### User Story 6 - Navigate a Longer Page Comfortably (Priority: P3)

As a visitor reading a substantially longer page, I want navigation that remains accessible, shows
where I am and lets me jump to any section, so the added detail does not make the page tiring.

**Why this priority**: Navigation quality makes the additional content usable; it supports rather
than delivers the core value.

**Independent Test**: Scroll the full page on wide and phone viewports, use section links and the
collapsed menu, and confirm the current section is indicated and every account action remains reachable.

**Acceptance Scenarios**:

1. **Given** a scrolled page, **When** the visitor looks for navigation, **Then** the header with
   Sign in and Sign up remains reachable without scrolling back to the top.
2. **Given** wide-screen navigation, **When** the visitor scrolls through sections, **Then** the
   link for the section currently in view is visually and programmatically indicated.
3. **Given** the footer, **When** it is displayed, **Then** it groups links to every landing section,
   both account pages, and language and theme controls.
4. **Given** reduced-motion preferences, **When** the visitor scrolls or jumps to sections, **Then**
   reveal and scroll effects are removed or replaced with instant transitions.

---

### User Story 7 - Contact the SoloDesk Team (Priority: P2)

As a visitor with a question the page does not answer (for example, about team use, data handling
or timelines), I want to send a short message from the landing page, so I can get an answer
without creating an account.

**Why this priority**: The contact form captures questions that would otherwise block sign-up. It
handles personal data and abuse risk, so it must be done carefully, but the page still delivers
value without it.

**Independent Test**: Submit a valid message, an invalid message and a burst of repeated
submissions; confirm honest success, field-level errors with preserved input, and throttling, and
confirm the accepted message reaches the designated SoloDesk recipient.

**Acceptance Scenarios**:

1. **Given** the Contact section, **When** it is displayed, **Then** it shows a form with name,
   email, topic, message and a required consent statement linked to privacy information, plus a
   note that no response time is guaranteed.
2. **Given** valid input and consent, **When** the visitor submits, **Then** the form shows a
   pending state, prevents duplicate submission, and shows a confirmation only after SoloDesk has
   accepted the message.
3. **Given** missing or invalid fields, **When** the visitor submits, **Then** each problem is
   identified next to its field and announced, focus moves to the first problem, and all valid input
   is preserved.
4. **Given** a failed or unknown submission outcome, **When** the result is shown, **Then** the
   visitor sees that the message may not have been sent, keeps their input and can retry.
5. **Given** repeated or automated submissions, **When** abuse limits are exceeded, **Then** further
   submissions are refused with a calm retry-later message and no message is accepted.
6. **Given** a signed-in member, **When** they use the form, **Then** it behaves the same as for a
   visitor and does not attach or reveal any private account data.

---

### Edge Cases

- A visitor with JavaScript unavailable or delayed can still read all product tour areas, FAQ
  answers and section content, and can reach both account pages.
- Long Arabic headings, detail points and FAQ answers wrap without clipping in tabs, cards and
  accordions at 320 CSS pixels and 200% zoom.
- Mixed-direction content (amounts, currency codes, durations, product names) keeps correct
  reading order in both languages.
- If an illustrative preview fails to load, its text alternative and the surrounding explanation
  still convey the capability.
- Rapid repeated selection of product tour areas or FAQ entries leaves exactly one consistent
  visible state and does not trap keyboard focus.
- Deep links to sections (for example, from search or a shared URL) land on the correct section
  in both languages and both themes.
- A capability status that has not been confirmed defaults to Planned rather than Available.
- A signed-in member visiting the page sees the same public content with no private data, as in 001.
- Very wide displays keep line lengths readable and do not stretch previews beyond legibility.
- Contact messages containing links, markup, scripts or extremely long text are treated as plain
  text, length-limited and never rendered or executed as content anywhere.
- A double-click, refresh or network retry after submitting produces at most one accepted message.
- If the contact service is unavailable, the rest of the landing page remains fully usable and the
  form explains that sending is temporarily unavailable.
- Arabic and mixed-direction names, emails and messages are accepted and preserved exactly.
- An email address that looks valid but is unreachable does not cause the form to claim delivery
  of a reply.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The landing page MUST retain all 001 behavior: public access without a session,
  hero with Get started and Explore actions, Sign in and Sign up destinations, footer, and
  non-disclosure of private data.
- **FR-002**: The landing page MUST present, in this order: navigation, hero, highlights strip,
  product tour, detailed features grid, How it works journey, Why SoloDesk principles, privacy and
  security, audience use cases, roadmap, FAQ, contact, final call to action and expanded footer.
- **FR-003**: The hero MUST add a short supporting line of three concise highlights (for example,
  exact multi-currency invoicing, recoverable time tracking, English and Arabic) beneath the value
  statement, without numeric claims about users, customers or performance.
- **FR-004**: The product tour MUST present at least five capability areas — Clients, Projects &
  tasks, Time tracking, Invoices & payments, Insights — each with an outcome sentence, three to five
  detail points, an illustrative preview and an availability label.
- **FR-005**: The detailed features grid MUST describe at least eight specific features drawn from
  the documented product scope, such as the command palette and keyboard shortcuts, recoverable
  timers, transparent save status, multi-currency invoices with exact rounding, tax and discount
  handling, team workspaces with roles, bilingual right-to-left interface, and light/dark/system themes.
- **FR-006**: The How it works section MUST present four ordered steps from account creation to
  invoice preparation, each with a title, a one- or two-sentence description and an illustrative visual.
- **FR-007**: The Why SoloDesk section MUST explain the four product principles: financial
  exactness, speed and low cognitive load, transparent save state, and data privacy and isolation.
- **FR-008**: The privacy and security section MUST describe current data-handling commitments in
  plain language and MUST NOT claim certifications, compliance, uptime, legal or tax guarantees.
- **FR-009**: The audience section MUST describe at least three intended user profiles —
  freelance software engineers, independent technical consultants and boutique software teams —
  each with a representative use case.
- **FR-010**: The roadmap section MUST group capabilities as Available, In development or Planned
  without dates. Availability labels across the product tour, features, journey and roadmap MUST
  originate from one shared status source so they cannot contradict each other.
- **FR-011**: The FAQ MUST contain six to ten entries covering at least availability, data
  ownership and export, privacy, languages, supported devices, teams, account access methods and
  pricing. Answers MUST be collapsed by default and individually expandable.
- **FR-012**: The page MUST NOT contain a pricing section, prices, plans, tiers, trials or free-use
  promises. The pricing FAQ answer MUST state only that pricing has not yet been announced.
- **FR-013**: The page MUST provide a Contact section with a form collecting only name, email,
  topic (from a fixed list) and message, plus a required, unticked-by-default consent to process
  the submission for replying. Each field MUST have a defined maximum length; email format MUST
  be validated; all input MUST be validated again by SoloDesk on receipt and treated as plain text.
- **FR-013a**: The contact form MUST show pending, accepted, invalid, rate-limited, unavailable and
  unknown-outcome states honestly. It MUST NOT show success before SoloDesk accepts the message,
  MUST preserve valid input on any failure, and MUST accept at most one message per submission
  attempt, including retries.
- **FR-013b**: The contact form MUST be protected against automated and repeated abuse, using
  limits shared across the service, without blocking assistive-technology users or requiring a
  visible puzzle that lacks an accessible alternative.
- **FR-013c**: Accepted messages MUST be delivered only to a designated SoloDesk recipient
  configured by the owner, MUST be visible only to authorized SoloDesk staff, and MUST NOT be
  added to marketing lists, shared with third parties, or used for analytics. The section MUST
  link to privacy information explaining what is collected, why, and how to request deletion.
- **FR-013d**: Operational records of contact submissions MUST exclude message content and full
  email addresses. Retention of accepted messages MUST follow the owner's retention decision; until
  it is decided, the contact form MUST remain disabled in public releases.
- **FR-013e**: The contact form MUST NOT send automatic messages to the email address entered by
  the visitor, and MUST NOT promise a response time.
- **FR-014**: All upgraded content MUST live on the single public home page, organized as sections
  with linkable fragments. No new public content pages are introduced by this feature, apart from
  any privacy information required by FR-013c if it does not already exist.
- **FR-015**: The header MUST remain reachable while scrolling, link to the principal sections
  (at minimum Features, How it works, Security, FAQ and Contact), indicate the section in view on
  wide screens, and keep Sign in and Sign up available on all viewports.
- **FR-016**: The footer MUST group links into product sections, account actions and preferences
  (language and theme), and retain the SoloDesk brand and rights notice.
- **FR-017**: All previews MUST use synthetic, visibly labelled illustrative content. The page MUST
  NOT include invented customers, testimonials, logos, usage counts, ratings or endorsements.
- **FR-018**: All new content MUST be provided in equivalent English and Arabic, with correct
  right-to-left layout, isolated mixed-direction values and locale-appropriate number display.
- **FR-019**: All new interactive elements (product tour selection, FAQ entries, section links)
  MUST be operable by keyboard, touch and pointer, expose their state to assistive technologies,
  show visible focus and meet WCAG 2.2 AA contrast in light and dark themes.
- **FR-020**: Section reveal and decorative motion MUST be subtle, MUST never hide content
  permanently, and MUST be disabled or reduced when the visitor prefers reduced motion.
- **FR-021**: All page content, including tour areas and FAQ answers, MUST be present and readable
  even if interactive enhancements fail to load.
- **FR-022**: Each section MUST have a stable, linkable address fragment and a descriptive heading,
  maintaining a single top-level page heading and a logical heading hierarchy.
- **FR-023**: The page MUST provide a descriptive title, description and social-sharing summary in
  both languages that accurately reflect current product status.

### Key Entities _(content, not stored user data)_

- **Capability area**: A product area shown in the tour; has a name, outcome sentence, detail
  points, illustrative preview, availability status and bilingual text.
- **Feature**: A specific capability in the features grid; has a name, short description, icon,
  related capability area and availability status.
- **Availability status**: The single shared source of Available, In development or Planned for
  each capability, used by the tour, features, journey and roadmap.
- **Journey step**: An ordered step in How it works; has a number, title, description, visual and
  optional availability status.
- **Principle**: A product principle with a title and explanation.
- **FAQ entry**: A question and answer pair in both languages, with a stable ordering.
- **Contact message** _(stored personal data)_: A visitor submission with name, email, topic,
  message, consent confirmation, submission time and language; owned by SoloDesk staff, not by any
  workspace, and never linked to a member account.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: At least four of five representative first-time reviewers can correctly name at least
  three SoloDesk capabilities and identify which are not yet available after two minutes on the page.
- **SC-002**: At least four of five reviewers can state one way SoloDesk differs from generic
  time-tracking tools (exactness, privacy, bilingual support or keyboard speed) without coaching.
- **SC-003**: 100% of availability labels across the page match the shared status source, and an
  audit finds zero testimonials, customer logos, usage counts, ratings, certifications or
  unsupported guarantees.
- **SC-004**: Every product tour area, FAQ entry, section link and account action is operable by
  keyboard alone, with state announced, in English and Arabic, light and dark themes, at 390×844,
  768×1024 and 1440×900.
- **SC-005**: At 320 CSS pixels and 200% zoom, no section, tab, card or accordion clips content or
  causes page-level horizontal scrolling in either language.
- **SC-006**: With interactive enhancements disabled, 100% of section content and both account
  actions remain readable and reachable.
- **SC-007**: The main heading and hero actions remain visible within the same load time as the
  current landing page on a typical mobile connection; added sections do not delay the first view.
- **SC-008**: Every visible landing and footer link reaches a working, named destination, with zero
  broken links in direct-entry, reload and Back/Forward checks.
- **SC-009**: In contact-form testing, 100% of valid submissions reach the designated recipient
  exactly once, including after double submission and network retry; 0% of invalid, unconsented
  or over-limit submissions are accepted; no failure clears valid input.
- **SC-010**: A visitor can complete and submit the contact form by keyboard alone in under two
  minutes in either language, with every error announced and identified at its field.
- **SC-011**: A review of operational records and visitor-facing responses finds no message content,
  full email addresses or technical error details exposed.

## Assumptions

- "More details" means substantially richer, more specific content per capability plus new
  sections covering differentiation, privacy, journey, audience, roadmap and common questions.
- "And more" is interpreted as improved navigation for a longer page (persistent header, section
  indication, expanded footer) and subtle, accessible motion — not new business functionality.
- Today only account access and the personal profile exist; business capabilities are labelled In
  development or Planned according to the [roadmap](../../docs/planning/roadmap.md) until confirmed.
- Content derives from [PRODUCT.md](../../PRODUCT.md), the
  [product requirements](../../docs/product/requirements.md) and the roadmap. AI features, native
  apps, surveillance, raw-card collection and other excluded capabilities are never presented.
- The existing visual identity, palette, typography, shared components and design system from
  [DESIGN.md](../../DESIGN.md) are retained; this is an enrichment, not a rebrand.
- Authentication pages, the account area, providers and session behavior are unchanged.
- The contact form is the only new data collection. Someone named by the owner reads and answers
  messages manually from their own mailbox; there are no automatic replies, support tickets or
  response-time promises.
- Contact-message retention, the designated recipient and privacy wording are owner decisions in
  the [decision register](../../docs/planning/decisions.md). The form may be built and tested with
  synthetic data, but stays disabled in public releases until those decisions are recorded.
- Analytics collection, pricing, waitlists, testimonials, logos, deployment and external
  provisioning remain out of scope; gated decisions such as pricing, support promises and hosting
  are not resolved by this specification.
