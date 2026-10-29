---
name: SoloDesk
description: Monochrome Light/Dark design system with Rugis/Sahabah headings and Geist body text
colors:
  primary: "oklch(0 0 0)"
  primary-dark: "oklch(1 0 0)"
  background: "oklch(0.9900 0 0)"
  background-dark: "oklch(0 0 0)"
typography:
  display:
    fontFamily: "Rugis, Sahabah, sans-serif"
  body:
    fontFamily: "Geist, sans-serif"
  mono:
    fontFamily: "Geist Mono, monospace"
rounded:
  base: "8px"
  small: "4px"
  medium: "6px"
  large: "8px"
  extra-large: "12px"
---

# SoloDesk design system

## Overview

Updated 30 October 2026. The user's supplied monochrome Light/Dark CSS replaces the earlier
obsidian/mint/emerald and General Sans direction. This is a token and shared-component change;
product behavior, security, English/Arabic RTL and shadcn/ui requirements continue to apply.

[app/globals.css](app/globals.css) owns exact OKLCH colors, shadows, spacing and radius variables.
[Token metadata](docs/design/tokens.json) retains the supplied CSS values and normalized sRGB
mirrors for existing documentation checks. CSS OKLCH values take precedence over rounded hex
representations. The `/design-system` showcase renders shared components in both themes.

The older [HTML reference](docs/design/reference.html), captures and visual recipes retain prior
visual values. They are historical visual inputs; their colors, fonts and pill rules do not
override this document or the runtime CSS. Their behavior/permission/accessibility contracts
remain useful where applicable.

The existing `.impeccable/design.json` also predates the current implementation and remains
stale; this focused documentation merge preserves it rather than rewriting unrelated world metadata.

## Colors

`:root`/`.light` carry Light roles; `.dark` carries Dark roles. The site defaults to Dark.
System follows `prefers-color-scheme` in CSS, including matching Tailwind dark variants.
Separate native language and theme toggle forms POST to `/api/preferences` and set the bounded
HttpOnly preferences; theme cycles Dark → Light → System. English is LTR and Arabic is RTL.
The showcase has its own explicit light/dark scope and changes no preferences. A nested Light
scope excludes inherited Dark utility variants, including when the page uses System on a dark OS.

| Role | Light OKLCH | Dark OKLCH |
| --- | --- | --- |
| Background | 0.99 0 0 | 0 0 0 |
| Foreground | 0 0 0 | 1 0 0 |
| Card | 1 0 0 | 0.14 0 0 |
| Primary / on primary | black / white | white / black |
| Secondary | 0.94 0 0 | 0.25 0 0 |
| Muted | 0.97 0 0 | 0.23 0 0 |
| Muted foreground | 0.44 0 0 | 0.72 0 0 |
| Accent | 0.94 0 0 | 0.32 0 0 |
| Border | 0.92 0 0 | 0.26 0 0 |
| Ring | 0 0 0 | 0.72 0 0 |

Use semantic Tailwind roles: background, foreground, card, primary, secondary, muted,
accent, destructive, border, input, ring and sidebar. Do not hardcode a separate screen palette.
Amber/blue are supplied chart roles, not replacements for monochrome actions. Text, icons and
labels must also identify status; no state may rely only on hue.

## Typography

Use Rugis for English headings/titles and Sahabah for Arabic headings/titles only.
Both regular faces are loaded from `public/fonts` through shared `next/font/local` definitions;
`lang` selects the heading face with the other as a mixed-script fallback. Semantic headings
and shared CardTitle components use this role. Browsers synthesize heavier heading weights
from the supplied regular files. Keep Geist for body text, navigation, buttons and forms, with
the existing Arabic sans fallback. Keep Geist Mono for code, exact numeric samples and identifiers.
Georgia remains the optional serif token. Verify Arabic shaping with fluent review.

Retain readable 16px body text, clear medium-weight headings, logical spacing and a restrained
type scale. Preserve localized content, mixed-direction isolation, keyboard and screen-reader semantics.
The public hero scales from 2.7rem to 5.75rem with a 1.07 line height; section headings scale
from 2rem to 3.5rem. Arabic headings remove negative tracking and use a 1.35–1.4 line height.

## Layout

The base spacing unit is 0.25rem (4px). Preserve responsive, spacious composition and logical
spacing for English and Arabic. No desktop minimum or fixed-width layout is introduced.
The public container caps at 1120px with 24px side clearance, reduced to 16px below 768px.
Three capability columns and alternating two-column workflow rows stack on small screens;
the account introduction hides below 768px so account actions remain the primary content.

## Elevation & Depth

Use the supplied compact 1px-offset shadow scale, from 9% subtle shadows to the 45% 2xl shadow.
Do not restore green glows, luminous mesh, glass pills or the former no-shadow rule.
Keep shared large actions and form inputs at least 44px high; compact variants remain available
for contexts that meet the applicable target-size/accessibility requirements.

## Shapes

The base radius is 0.5rem (8px): small 4px, medium 6px, large 8px, extra-large 12px.
Controls use shared variants rather than a universal pill override. Reserve full rounding for
circles, switches or explicitly shaped components.
Public controls use finite 8px corners and large panels use 12px corners.

## Components

Reuse shadcn/Base UI Button, Input, Field, Alert and Separator and their semantic variants.
Navigation is an actual link; selection, caret, focus and disabled states follow the theme.
Keep focus visible and provide readable labels, recoverable errors and reduced-motion behavior.
Use logical CSS for RTL and verify narrow layouts at 320 CSS pixels and 200% zoom.

Public account actions use the existing Button `lg` size (44px high); language/theme and
mobile-menu controls use `icon-lg` (44px square). The shared default Button remains 32px high,
so use the large variants explicitly for these targets rather than assuming every Button is 44px.
The shared Input is 44px high with an 8px corner, a 1px muted-foreground boundary and a ring
focus treatment. Its Dark fill uses input at 30% opacity. The supplied input token remains
unchanged; the stronger boundary does not resolve the legacy input-border palette gaps.

The public header uses the supplied transparent SoloDesk wordmark unchanged, displayed at
150px wide on desktop and 112px on mobile; a theme filter provides its Dark rendering.
Google and GitHub entry actions use the supplied public SVGs as currentColor masks.
Language and theme controls stay visible outside the mobile navigation disclosure, with
localized accessible labels; the disclosure contains navigation only. The project, task and
invoice previews are labelled synthetic HTML examples. Their short arrival motion is disabled
by reduced-motion preferences; no new sourced or generated imagery is part of this surface.

## Do's and Don'ts

Use the supplied semantic roles and existing components. Do not restore the superseded green
palette, General Sans, universal pills or decorative glow. Verify contrast in actual context.

### Validation and known gaps

Run `python3 docs/design/validate.py` for metadata/coverage/link checks and declared contrast pairs.
The validator must fail for unaccepted contrast gaps and record them in
[current validation](docs/design/current-validation.md); a supplied palette is not an AA claim.

The supplied light destructive foreground, some chart fills and input borders do not satisfy all declared
contrast pairs. Preserve the user's tokens, use contrast-safe foregrounds/outlines and text labels
for those contexts, and verify actual states before release. The showcase presents these colors
as labelled swatches and avoids using the failing solid destructive/text combination.
Neither this theme nor a screenshot establishes full WCAG conformance, Arabic support or security.
The dated runtime evidence and remaining human/integration checks are recorded in
[current validation](docs/design/current-validation.md); the UI review is not release acceptance.
