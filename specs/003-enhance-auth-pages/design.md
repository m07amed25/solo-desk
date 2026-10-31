# Design and Asset Direction: Account Pages

This document translates the [supplied reference](references/account-creation.png) into SoloDesk's current [design system](../../DESIGN.md). The reference is visual input, not an instruction to copy a customer endorsement, third-party product screen, Apple login, marketing choice or legal policy.

## Composition

Use one form-first server-rendered shell for Sign in and Sign up. The first DOM region is the account form, followed by the illustrative visual region. Keep existing SiteHeader/Home/alternate-entry links and language/theme controls. Avoid a new footer/navigation redesign.

At a 1440×900 English viewport, place the form on the left and a roughly equal rounded visual on the right within the current 1120px container. Use an approximately 420–480px readable form column, responsive 24–48px gap and 12px panel corners. These widths are design targets, not fixed minimums: keep `min-width:0`, allow page scrolling for the taller signup form and do not vertically clip it to one viewport. Arabic inherits RTL so its form appears at inline start on the right; no CSS-only visual reordering that breaks focus order.

The form hierarchy is heading/introduction → Google/GitHub choices → “or” divider → relevant fields → primary action → alternate-entry/policy information. Sign-in adds recovery near the password block. Verification/recovery steps reuse the same form space and heading hierarchy rather than opening a modal. Keep the form's controls reachable before decorative content.

| Width                      | Layout behavior                                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Below 768px                | Hide visual and its photo request. One form column, name fields stacked, social actions stacked, current mobile container padding.                                                             |
| 768–1023px                 | Two panels only while controls/labels remain readable; allow compact visual and stack social/name rows. Favor form width over decoration; hide/collapse the visual if required by zoom/reflow. |
| 1024px and wider           | Balanced two-panel composition; names and social choices can share rows if their localized text fits.                                                                                          |
| 320 CSS pixels / 200% zoom | No page-level horizontal scrolling, clipped input or fixed-height form. Natural reading/focus order remains intact.                                                                            |

## Typography, controls and states

- Use Rugis English/Sahabah Arabic headings, Geist form/body text, existing mixed-script fallback and semantic foreground/background/card/border/input/ring tokens. No alternate palette or global token changes.
- Keep 8px controls, 12px panels and existing restrained shadows. Use Button `lg`/`icon-lg` explicitly for 44px primary interactions; default Button is only 32px.
- Reuse Field/FieldLabel/FieldDescription/FieldError, Input and FieldSeparator. Do not add an OTP library, input-group dependency or form-state framework.
- Use a labelled Show/Hide password button beside the password label (or existing composition that fits) with `type=button`, pressed/state semantics and stable focus. Visibility resets to masked on form/step reset.
- Use one code input with numeric input mode, one-time-code autofill and LTR string content; support complete-code paste and leading zeros.
- Email and codes remain LTR with appropriate isolation; names and explanatory text follow locale direction. Do not letter-space Arabic headings.
- Pending/status/error text is localized and announced; errors link to fields and use contrast-safe text plus non-color indicators. The supplied destructive/input palette has known contrast gaps, so verify actual states instead of changing tokens or asserting conformance.
- No entrance, parallax, carousel or auth-specific animation is required. Existing landing motion is separate. Reduced-motion users see the same complete static form/visual.

## Visual panel content

Replace the reference's testimonial block with short original SoloDesk brand copy; use existing approved positioning, not invented customer praise, security guarantees or business availability claims. Position the existing server-rendered `components/landing/work-preview.tsx` near the lower part of the panel with its synthetic data and explicit localized illustrative-preview caption. Reuse its public component/data contract without copying its implementation into the account page.

Crop decoration inside the panel; do not put the whole page under an overflow clip. The preview and photo remain static, carry no private content and cannot be mistaken for the user's current workspace. Mark only purely decorative imagery `aria-hidden`; keep meaningful brand/caption text readable and accessible. A subtle local logo mark may reuse `/solodesk_no_bg_no_text.png`; header wordmark/provider masks stay unchanged.

## Researched photograph and provenance

**Selected desktop backing**: [Modern building facade with vertical ribbed pattern](https://unsplash.com/photos/modern-building-facade-with-vertical-ribbed-pattern-vSb4JqEIarE), by [Jens Riesenberg](https://unsplash.com/@infernisvox), published 3 October 2025, London. The source page was checked on 30 October 2026 and explicitly marks it as a free image under the Unsplash License. The abstract black/white ribbing matches the reference's vertical texture without adding a person or endorsement.

**Source image locator**: `https://images.unsplash.com/photo-1759493831158-a6f1234bf095`. Acquire from the verified source page during implementation; do not use search-engine thumbnails, watermarked Open Graph variants or the unrelated iStock advertisement. Planning searched and recorded the source but did not download, modify or bundle the image.

**License evidence**: [Unsplash License](https://unsplash.com/license), reviewed 30 October 2026, permits free commercial/noncommercial image use under its stated restrictions; the page identifies this photo as covered. This is source provenance, not a guarantee about all depicted third-party rights. Avoid visible brands/people in the selected crop. Keep author/source/license/date in the eventual asset receipt; voluntary attribution can appear in an existing asset credits document without interrupting account access.

**Implementation asset**: `public/auth/architecture.webp`, one optimized local derivative. Target portrait panel crop around the repetitive ribs, centered with adjustable focal position, grayscale retained. Export roughly 900–1200px on the long edge, ≤200 KiB. Confirm actual crop/dimensions/bytes/hash when acquired; do not fabricate those values in this planning record.

**Verified Asset Receipt**:
- **Local Path**: `public/auth/architecture.webp`
- **Author**: Jens Riesenberg ([@infernisvox](https://unsplash.com/@infernisvox))
- **Source**: [Modern building facade with vertical ribbed pattern](https://unsplash.com/photos/modern-building-facade-with-vertical-ribbed-pattern-vSb4JqEIarE)
- **License**: Unsplash License (verified free commercial/noncommercial use)
- **Publication Date**: 3 October 2025
- **Acquired Date**: 30 October 2026
- **Dimensions**: 1000 × 1499 px
- **File Size**: 81,540 bytes (~79.6 KiB, compliant with ≤200 KiB budget)
- **SHA-256 Hash**: `7ba00ed2c4b0ccbb0ca2f226044f608c8c050e07ec96c0944b2640c6638f8998`

**Rendering**: Desktop-only CSS background inside the panel's at-least-768px media rule, local path only, `cover` crop and a restrained semantic-token overlay. Text must sit on an opaque/contrast-proven region rather than depend on the photo's brightness. A hidden `<img>` may still download on mobile and does not meet the zero-mobile-request budget. No `remotePatterns` or new image-CDN permission is required for the chosen local delivery.

**Fallback**: An original static neutral gradient with subtle vertical lines using existing tokens, plus the same SoloDesk copy and synthetic preview. Use it immediately before photo load and on acquisition/loading failure. It must look intentional and keep every account interaction available. Do not add a second stock photo or image-generation step to recover from this optional decoration.

## Visual acceptance and handoff

Capture both entry pages and inline verification/recovery states at 320×800, 390×844, 768×1024 and 1440×900, both locales and three theme preferences. Check 200% zoom, keyboard/focus, screen reader, reduced motion, password manager, paste and mixed-direction values. System must be observed under both light and dark OS settings, not counted as a single fixed color scheme.

Review the six spec traits: form-first composition, separate rounded visual, spacious hierarchy, social grouping, email separator and full-width primary action. Validate mobile makes no image request, fallback is complete, decorative content does not determine LCP or delay form interactions, and all illustrative content is labelled. Fluent Arabic/copy and actual contrast review remain human acceptance requirements.

After implementation, update current design evidence and the affected auth surface brief. Do not repair the known stale `.impeccable/design.json`, restyle the landing page, or treat a detector/screenshot as complete accessibility proof.
