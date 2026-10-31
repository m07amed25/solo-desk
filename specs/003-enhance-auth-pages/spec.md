# Feature Specification: Enhanced Sign In and Sign Up

**Feature Branch**: `codex/landing-email-full-tests` (existing branch; no branch created)

**Created**: 2026-10-30

**Status**: Draft

**Input**: Enhance the sign-in and sign-up pages using the attached split-panel account-creation reference. Allow account creation without social login, using email and password, with email verification as illustrated by the supplied authentication-settings reference.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create an account with email (Priority: P1)

A new visitor can create a SoloDesk account with their name, email and password without owning or using a Google or GitHub account. They verify ownership of their email before entering their account area.

**Why this priority**: Email registration is the explicitly requested alternative to social login.

**Independent Test**: Start signed out with a new test email address, submit registration, receive and enter a verification code, and reach the test user's own account area without visiting a social provider.

**Acceptance Scenarios**:

1. **Given** a signed-out visitor on Sign up, **When** the page loads, **Then** first name, optional last name, email, password, a password visibility control and Create account are available alongside existing social choices.
2. **Given** valid registration details, **When** the visitor submits, **Then** they reach an email-verification step identifying the destination and recovery actions; protected account content remains inaccessible.
3. **Given** an outstanding verification challenge, **When** the visitor submits the correct unexpired code, **Then** verification completes once and they reach their own account area through a valid authenticated session.
4. **Given** missing required fields, malformed email or a password outside the displayed rules, **When** the visitor submits, **Then** the affected fields receive accessible guidance, no successful registration is claimed, and valid non-secret input remains available for correction.
5. **Given** an incorrect, expired, consumed or superseded code, **When** it is submitted, **Then** verification fails without granting access and offers an appropriate retry or resend action.
6. **Given** the verification step, **When** another code is requested, **Then** resend observes the displayed cooldown, a superseded code cannot complete verification, and repeated requests cannot create additional accounts.
7. **Given** an incorrect destination email, **When** the visitor chooses to correct it, **Then** they can restart registration with the corrected address without marking the original address verified.

---

### User Story 2 - Sign in using a password or existing provider (Priority: P1)

A returning user can sign in with verified email and password or continue using Google or GitHub from a matching sign-in page.

**Why this priority**: A newly created email account needs a return journey, and existing users must retain access.

**Independent Test**: Sign in with an existing verified password account, then independently exercise each existing provider using separate test identities, including cancellation and failure.

**Acceptance Scenarios**:

1. **Given** a signed-out visitor on Sign in, **When** the page loads, **Then** email, password, a visibility control, Sign in, password-recovery access and Google/GitHub choices are available; registration-only name fields are absent.
2. **Given** correct credentials for a verified account, **When** submitted, **Then** the user reaches their own account area with no credentials or verification material in the address bar.
3. **Given** an incorrect password or unknown email, **When** submitted, **Then** the page gives the same public failure guidance and allows another attempt without disclosing whether that account exists.
4. **Given** valid credentials for an unverified account, **When** submitted, **Then** the user can resume verification without receiving protected account access first.
5. **Given** Google or GitHub is chosen from either entry page, **When** the provider succeeds, is canceled or fails, **Then** existing access succeeds for the correct identity or returns to the initiating page with safe retry guidance.
6. **Given** an already authenticated user, **When** either entry page is opened, **Then** they reach the existing account area without being asked to register or sign in again.

---

### User Story 3 - Use a consistent, accessible account layout (Priority: P2)

A visitor encounters a spacious form beside a restrained SoloDesk visual panel on desktop, with equally usable actions on small screens, in either language and theme.

**Why this priority**: The visual enhancement should improve clarity across existing supported presentations.

**Independent Test**: Review both pages in English and Arabic, Light, Dark and System, at phone, tablet and desktop sizes; navigate the forms using the keyboard and assistive technology.

**Acceptance Scenarios**:

1. **Given** an English desktop presentation at 1440×900, **When** either page opens, **Then** the form appears on the left and a separate rounded visual panel on the right, following the reference's spacious composition and restrained monochrome treatment while retaining SoloDesk typography and controls.
2. **Given** Sign up, **When** reviewed, **Then** the form order is heading/introduction, social choices, an “or” separator, name fields, email, password/guidance, Create account, and account-switch/policy information. Sign in uses the same hierarchy with its shorter field set and recovery action.
3. **Given** Arabic, **When** an entry page or verification/recovery step opens, **Then** content and layout mirror appropriately, email addresses and codes remain readable, and every label, error and user-facing email has an Arabic equivalent.
4. **Given** a viewport below 768 CSS pixels, **When** either page opens, **Then** the decorative panel is hidden and the form becomes a single column; at 320 CSS pixels or 200% zoom no account control is clipped or requires page-level horizontal scrolling.
5. **Given** keyboard or screen-reader use, **When** navigating, submitting or revealing a password, **Then** labels, focus, visibility state, pending status and errors are perceivable; revealing a password neither submits the form nor moves focus unexpectedly.
6. **Given** either entry page, **When** the alternate account action or Home is chosen, **Then** the intended page opens with language/theme preferences preserved and no secret form values carried to the destination.
7. **Given** slow loading or failed submission, **When** waiting or retrying, **Then** the page announces its state, prevents duplicate submission while pending and shows a recovery action without claiming success.

---

### User Story 4 - Recover password access (Priority: P2)

A password user who forgets their password can request email recovery and return to sign-in without bypassing email ownership or existing account protections.

**Why this priority**: Password access needs a recoverable failure path. The minimal recovery flow requires existing identity-policy approval before release.

**Independent Test**: Recover a test account by email, set a compliant password and sign in again; repeat with an unknown address and expired or reused recovery material.

**Acceptance Scenarios**:

1. **Given** Forgot password on Sign in, **When** an email is submitted, **Then** the same generic acknowledgement appears for registered and unregistered addresses, and an eligible account receives recovery instructions.
2. **Given** valid unused recovery material, **When** a compliant new password is set, **Then** the old password stops working, existing sessions are invalidated and the user returns to Sign in without automatic protected access.
3. **Given** expired, reused, altered or wrong-purpose recovery material, **When** submitted, **Then** no credentials change and the visitor can request fresh recovery instructions.

### Edge Cases

- Repeated clicks, Enter presses, concurrent tabs and retries after an uncertain response produce no duplicate accounts or repeated successful verification/reset effects.
- Delayed or unavailable email delivery shows honest next steps; registration or resend acknowledgement never proves inbox delivery or verification.
- Reloading verification permits resuming through the supported identity journey or explains how to restart; passwords and codes are never restored from persistent browser storage.
- An email already used by a password or social account receives safe public guidance. Registration never overwrites credentials, automatically links identities or exposes account existence through response wording or navigation.
- Long names, single names, Arabic text, mixed scripts, whitespace-only names, email case/spacing and pasted passwords receive consistent validation. Passwords are never silently trimmed, transformed or truncated.
- Password-manager autofill and code pasting work; codes retain leading zeros. A revealed password becomes masked again when leaving or resetting the form.
- Rate-limited users receive a retry state consistent with enforced limits; switching tabs, email presentation or entry pages cannot bypass those limits.
- Expired sessions and unavailable authentication fail closed with safe retry guidance rather than false success or an empty account view.
- Malicious return destinations, cross-site submissions, tampered challenges and injected name/error content cannot redirect to an untrusted destination, execute content or grant access.
- Existing profile names and provider-created accounts remain usable; separate name inputs do not require re-registration or alteration of existing profiles.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Separate Sign in and Sign up pages MUST provide email/password access alongside existing Google/GitHub choices. Social login MUST NOT be required to create or use a password account. Acceptance: Stories 1 and 2.
- **FR-002**: Sign up MUST collect required first name, optional last name, email and password; Sign in MUST collect email and password. Name handling MUST accept single and Arabic names and preserve existing profile compatibility. Acceptance: Story 1.1 and name/profile edge cases.
- **FR-003**: Forms MUST show visible labels, relevant autofill behavior, password visibility state and enforced password rules before submission. Invalid or excessive input MUST be rejected at the trusted boundary with actionable field guidance that does not reveal identity existence. Acceptance: Stories 1.4, 2.3 and 3.5.
- **FR-004**: Email registration MUST require proof of email ownership by verification code before protected account access. Verification MUST offer code entry, resend, destination correction and return navigation. Codes MUST expire, be purpose-bound and single-use; a new code MUST invalidate its predecessor. Acceptance: Story 1.2–1.7.
- **FR-005**: Unverified password users MUST have a path back to verification. Only successful verification plus a valid session may open the existing account area. Registration/sign-in MUST NOT grant workspace membership or additional resource privileges. Acceptance: Stories 1.3 and 2.4, plus direct protected-access denial checks.
- **FR-006**: Login, registration, verification, resend and recovery MUST enforce bounded abuse controls. Displayed cooldown/expiry guidance MUST match effective enforced policy; exhausted limits MUST offer a clear retry state without granting access. Acceptance: verification and rate-limit edge cases.
- **FR-007**: Password sign-in and recovery MUST avoid revealing account existence through public messages, navigation or observably distinct response behavior. Duplicate registration MUST preserve existing identities/credentials and never silently link accounts. Acceptance: Stories 2.3 and 4.1 and the existing-address edge case.
- **FR-008**: Minimal password recovery MUST use email ownership proof, an expiring single-use recovery challenge and the same displayed password rules. Successful reset MUST invalidate existing sessions and require fresh sign-in without bypassing existing factor requirements. Acceptance: Story 4.
- **FR-009**: Google/GitHub access MUST preserve supported account/callback behavior, with pending, canceled and failed states and retry from the initiating page. Apple and other new providers are excluded. Acceptance: Story 2.5.
- **FR-010**: Both pages MUST use the reference's two-panel desktop composition, rounded restrained surfaces, clear heading hierarchy, spacious field grouping, separated social/email choices and prominent full-width primary action within SoloDesk's existing visual language. The visual panel MUST use original SoloDesk content or clearly labelled illustrative product content. Reference testimonials, identities, avatars, brands and customer claims MUST NOT be presented as SoloDesk evidence. Acceptance: Story 3.1–3.2 and visual review.
- **FR-011**: Below 768 CSS pixels the decorative panel MUST be hidden and name fields MUST stack. At larger sizes name fields may be side by side only while labels/values remain readable. Desktop Arabic MUST mirror the English arrangement. Acceptance: Story 3.3–3.4.
- **FR-012**: All entry, verification and recovery states, errors and related emails MUST support English/Arabic and existing Light/Dark/System preferences. Passwords, email addresses and codes MUST preserve their intended values across direction changes. Acceptance: Story 3.3 and preference navigation checks.
- **FR-013**: Account journeys MUST meet the project's WCAG 2.2 AA target: keyboard access, visible focus, announced status/errors, contrast, reduced motion, at least 44px primary controls, 320 CSS-pixel reflow and 200% zoom. Decorative content MUST NOT obscure or delay required controls. Acceptance: Story 3.4–3.5 and accessibility review.
- **FR-014**: Submission MUST announce pending status, prevent duplicate in-flight actions, preserve valid non-secret input on recoverable failure and provide retry guidance. Awaiting verification, verified success and unavailable service MUST remain distinct; email dispatch or submission alone MUST NOT count as authenticated success. Acceptance: Story 3.7 and delivery/concurrency edge cases.
- **FR-015**: Already authenticated users MUST reach the existing account area from either entry page. Home/alternate entry links MUST preserve presentation preferences and exclude credentials; untrusted return destinations MUST be rejected. Acceptance: Stories 2.6 and 3.6 and redirect edge cases.
- **FR-016**: Passwords, codes, recovery material and session secrets MUST remain absent from address bars, analytics, logs, persisted form drafts and shared page content. Invalid, expired, revoked and wrong-user authority MUST fail closed even when protected actions are invoked directly. Acceptance: secret-exposure and direct-access negative checks.
- **FR-017**: Existing policy information MUST remain accurate; any policy links shown MUST lead to approved published content. This feature MUST NOT add a marketing subscription, preselected consent, mandatory marketing checkbox or invented legal acceptance requirement from the reference. Acceptance: content review of both pages.

### Key Entities _(include if feature involves data)_

- **Account**: Existing identity with display name, email-ownership status and permitted login methods. Separate name inputs contribute to the existing profile without creating a second identity.
- **Password credential**: Protected evidence used to authenticate a password account; never exposed in public content or retained as a form draft.
- **Verification challenge**: A code bound to the intended email and purpose, with expiry, attempt limits and used/superseded status. It grants no account access by itself.
- **Recovery challenge**: Time-limited single-use proof allowing only the intended password reset, distinct from verification and sign-in authority.
- **Session**: Current authenticated access, subject to expiry, revocation and independent resource permissions.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new test user can complete registration, email verification and arrival at their own account area without a social account in every supported language/theme combination.
- **SC-002**: At least four of five representative first-time reviewers identify email registration within 10 seconds and complete it without coaching within 3 minutes of receiving the verification email.
- **SC-003**: All defined positive sign-in, provider-return, verification and recovery scenarios reach the correct destination; all defined invalid, expired, reused, canceled, rate-limited and unavailable scenarios show recoverable guidance with zero unauthorized access, credential replacement or duplicate accounts.
- **SC-004**: Both pages and verification/recovery steps remain operable at 320×800, 390×844, 768×1024 and 1440×900, and at 200% zoom, in both languages and all three theme preferences, with zero clipped account controls or page-level horizontal scrolling.
- **SC-005**: All primary journeys can be completed by keyboard and pass the agreed screen-reader, focus, contrast and reduced-motion review; every field error and asynchronous state has a perceivable text equivalent.
- **SC-006**: Visual review confirms six composition traits on both desktop pages: form-first arrangement, separate rounded visual panel, spacious heading/field hierarchy, grouped social choices, an email separator and a prominent full-width primary action. Narrow screens retain every account action without the decorative panel.
- **SC-007**: Every defined recoverable error preserves valid non-secret input; repeated submission/resend checks produce one accepted effect per valid operation and no false success. No reviewed address bar, log, analytics event or persisted draft contains passwords, verification codes, recovery secrets or session secrets.

## Assumptions

- The [account-creation reference](references/account-creation.png) guides composition. Its Apple button, third-party names, testimonial, screenshot and marketing/legal checkboxes are illustrative, not requested SoloDesk features or approved content.
- The [authentication-settings reference](references/authentication-settings.png) illustrates desired email signup, verification-code and email sign-in capabilities. Its dashboard/source branding does not select a replacement authentication service or authorize configuration changes.
- This feature extends the email/password exclusion in [001-landing-auth-pages](../001-landing-auth-pages/spec.md) for account pages only. Landing-page and unrelated business requirements remain outside scope.
- The current authentication/account foundation and Google/GitHub choices are retained. This specification changes desired behavior; it does not claim email screens, delivery or recovery are already implemented or verified.
- Verification codes are proposed based on the supplied reference. Planning must confirm support in the selected service and required environment configuration; a link-based substitute requires an explicit specification update.
- First name is required and last name optional to support single-name users while retaining the reference's name grouping. No confirm-password field, username, phone number or workspace setup is added.
- Minimal email recovery and reset session invalidation are proposed defaults. The existing Q-08 identity-policy owner must approve recovery and effective password/challenge/abuse limits before credential flows are enabled for release; broader MFA/SSO policy is not decided here. Planning must record exact supported values and corresponding boundary fixtures rather than silently inventing policy.
- Registration/verification depend on the selected identity service and a working localized email-delivery path. Production delivery, provider readiness, legal content and open identity decisions remain owned release dependencies, not successful results of this specification.
- Dependencies are the [constitution](../../.specify/memory/constitution.md), [design system](../../DESIGN.md), [account foundation](../../docs/development/neon-setup.md), [email delivery guidance](../../docs/development/email.md), [identity decisions](../../docs/planning/decisions.md) and [security release gate](../../docs/security/release-checklist.md).
- Scope includes both entry pages, necessary verification and minimal password-recovery states, localized related emails and preservation of account/profile access. New social providers, identity linking/merging, MFA enrollment, workspace onboarding, marketing subscriptions, new legal policies, persistent private drafts, deployments and production provisioning are excluded.
