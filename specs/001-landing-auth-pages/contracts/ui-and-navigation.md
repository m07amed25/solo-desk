# Page, Navigation and Presentation Contracts

**Date**: 2026-10-29 | **Spec**: [spec.md](../spec.md) |
**Model**: [data-model.md](../data-model.md)

## Canonical pages

| Address                     | Visitor/session result               | Required behavior                                                    |
| --------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `/`                         | Public, including signed-in visitors | Landing content; no auth/DB/profile lookup                           |
| `/sign-in`                  | Signed out                           | Sign in heading, provider actions, Sign up and home links            |
| `/sign-up`                  | Signed out                           | Create account heading, provider actions, Sign in and home links     |
| Either account entry        | Fresh valid session                  | Redirect to `/app`; no redundant provider prompt                     |
| `/app`                      | Fresh valid identity/profile         | Existing own-profile view, edit/live updates and sign-out            |
| `/app`                      | No/expired/invalid session           | Redirect to `/sign-in`, no protected fields                          |
| Account service unavailable | Entry or protected page              | Generic retry view; never pretend successful access or empty account |

All public path links use canonical addresses. Use ordinary document navigation across account
boundaries to avoid prefetched private or obsolete presentation payloads. Native links retain
open-in-new-tab and Back/Forward semantics. Already signed-in account entry redirects happen
server-side behind a neutral Suspense fallback, not after displaying a redundant form.

## Internal presentation routing

Canonical pages rewrite to `/{locale}/{theme}` plus their path; `/` maps to the presentation
root. Locale/theme are finite validated root params; every pair is generated at build time.
They are presentation, never authority. Direct internal aliases are unsupported and return 404;
invalid parameters return 404 as well. Proxy must distinguish an external direct alias request
from its own rewrite without trusting a user-supplied bypass header.

Proxy matches only the canonical four, the callback and internal alias prefixes needed to deny
direct access. It invokes Neon middleware only for `/auth/callback`, before any presentation
logic. The callback-specific auth import must not initialize on public requests.
APIs, static assets, icon and `/design-system` keep their external addresses.
The utility route group has a static English/dark root layout; moving its files is a URL-preserving
layout change, not a redesign of the showcase.

Canonical HTML and account-related redirects must be `Cache-Control: private, no-store`;
preserve Next's existing Vary/RSC headers and merge Cookie variation where needed.
Verify the final response rather than assuming a Proxy header survives framework rendering.
No protected value enters a shared cache or the public prerendered shell. Keep current
Cache Components/partial prefetch settings; runtime session/search-param work uses Suspense.

## Translation boundary

Use next-intl with messages/en.json and messages/ar.json, getRequestConfig in i18n/request.ts
and createNextIntlPlugin in next.config.ts. Resolve a supported explicit locale or the validated
site root locale; do not read auth, headers or cookies to select root messages. Keep the existing
canonical rewrite/preference contract, without adding next-intl middleware or another locale cookie.

Server-rendered copy uses next-intl's server APIs. Client provider controls/profile/status receive
only required namespaces via scoped NextIntlClientProvider; the landing catalog stays server-side.
Utility roots use an explicit locale when translation is required; actions return stable codes
for client translation, and Route Handlers use explicit locale/messages instead of root getters.
English/Arabic catalogs must match keys and ICU parameter signatures; missing keys are validation
failures, not accepted visible key names. Canonical identifiers and issued data never change locale.

## Preference submission

**POST `/api/preferences`**, native URL-encoded form.

| Field      | Rule                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| `locale`   | Exactly one `en` or `ar`                                                   |
| `theme`    | Exactly one `dark`, `light` or `system`                                    |
| `returnTo` | Exactly one of the four canonical paths, without query, fragment or origin |

Require an exact same-origin Origin matched against the trusted application ingress;
missing/untrusted Origin is rejected. Accept at most 2 KiB of URL-encoded input; reject extra
or duplicate fields. No session is needed because this changes only non-sensitive presentation.

| Result                   | Status | Effect                                                                     |
| ------------------------ | ------ | -------------------------------------------------------------------------- |
| Valid                    | 303    | Set both validated preference cookies and Location to fixed canonical path |
| Invalid form/value       | 400    | Generic safe error; no cookie changes                                      |
| Missing/untrusted Origin | 403    | No changes                                                                 |
| Unsupported content type | 415    | No changes                                                                 |
| Oversized request        | 413    | No changes                                                                 |

All results are private/no-store. A native POST/303 document load updates initial html lang/dir
and theme, including when JavaScript is unavailable. System responds to browser theme changes
through CSS; no auth/provider token is ever stored as a preference.

## Provider start and return

Both pages use the existing same-origin Auth SDK and providers. Callback destination is the
current trusted origin plus `/auth/callback?entry=sign-in` or `entry=sign-up`.
Error destination is the corresponding canonical account entry with `authError=1`.
Only these two entry identifiers are recognized; missing/invalid entry falls back to Sign in.
Do not accept `next`, `redirect`, external returnTo or forwarded identity as authority.

1. An immediate in-flight guard permits one provider start; both buttons become disabled with
   a localized pending announcement. SDK state/challenge checks remain enabled.
2. On successful verifier exchange, Neon applies cookies and removes the verifier query value.
   The callback page checks a fresh server session; success navigates to `/app`.
3. A missing/failed exchange or session returns to the allowed originating entry with the generic
   marker. Normalize technical `error`/`error_description` and any unknown callback fields
   out of the final address; never render/log them. Do not strip the verifier before SDK handling.
4. Entry-page normalization and session checks occur behind Suspense and outside any shared cache.
   Redirect exceptions must not be swallowed by broad auth-error catches.
5. First-time and existing provider identities keep the existing managed policy; cross-provider
   linking is neither enabled nor promised by these pages.

Provider error behavior on the managed service must be exercised in staging. Local library
inspection is not proof of the remotely managed version or every provider cancellation case.

## Surface brief and shared UI

**Landing mode: Persuade. Account mode: Operate.** Preserve current brand rather than copying
reference text/identity. The [attached reference](../assets/landing-reference.png) is visual input.

- Compact header: SoloDesk home, Features → `/#features`, How it works → `/#how-it-works`,
  Sign in and Sign up; separate English/Arabic and cycling Dark/Light/System native POST controls, as requested during implementation. Each carries the other current preference unchanged. Use the supplied public SoloDesk wordmark and a skip-to-content link.
- Hero: short freelance work/time/invoice value statement, oversized centered heading,
  Get started → `/sign-up`, Explore features → `/#features`; subtle neutral depth.
- Large layered illustrative preview, then three capability cards (projects/tasks, time,
  invoices), followed by two alternating workflow/preview rows, final sign-up action and footer.
  Put the two workflow rows in `#how-it-works` and capability cards in `#features`.
- Previews use deterministic synthetic HTML/CSS and explicit illustrative/planned labels.
  They contain no clickable-looking financial actions, private queries or unsupported claims.
- Account pages have one purpose heading, provider buttons, pending/error region and cross/home
  links. Do not introduce passwords, billing or onboarding fields.
- Use shared semantic tokens and existing Button/Alert/Separator primitives. Links may use
  buttonVariants directly; Base UI render composition requires nativeButton=false, not asChild.
  Keep panel/input radii finite and action corners at the supplied 8px base; shared large actions are at least 44px.
- Mobile navigation uses native details/summary disclosure, expanded semantics and an identified
  navigation region, with Escape closure/focus return and closure on destination selection.
  Style summary with shared button variants without nesting a button. Native disclosure keeps
  essential links reachable if JavaScript fails; do not add menu roles or a focus trap.
- Arabic provides equivalent copy and RTL, meaningful root lang/dir and isolated mixed text.
  Theme/locale controls and labels are localized, including profile status messages in this journey.
  Shared font fallbacks keep text readable if the current external font host fails.
- Review contrast in every rendered state, including hover/focus; the monochrome palette and spacious
  hierarchy follow DESIGN.md. Do not copy the reference's pricing, logo strip or testimonials.
- Test 390×844, 768×1024, 1440×900, 320 CSS-pixel reflow and 200% zoom; keyboard, screen readers,
  reduced motion, English/Arabic and Light/Dark/System. Changes to shared tokens/large Button
  sizing also require a design-system showcase regression check.

## Private profile contract retained

`GET /api/profile?userId=...` remains current-identity-scoped and private/no-store:
400 missing input, 401 unauthorized/mismatch, 503 unavailable; success returns the narrow
[profile envelope](../data-model.md). Existing profile Server Actions continue validating origin,
identity and name (1–100 characters) at the service boundary, including direct invocation.
Routing through an internal presentation URL does not grant access.

LiveProfile must implement the model's checking/authorized/unavailable/denied lifecycle.
Invalidation clears the old name field, not only its heading. Sign-out conceals first; a failed
sign-out revalidates before restoring the same account. Known expiry conceals immediately;
remote revocation is detected by live invalidation or an active no-store check within 60 seconds.
History restoration starts concealed. Background suspension does not authorize stale content.

## Traceability

| Spec requirements      | Design location                                | Required proof                                                              |
| ---------------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| FR-001–002, FR-011–013 | Canonical routing, callback, private lifecycle | Direct entry/history, callback, no-store and denied-service checks          |
| FR-003–007             | Landing surface brief                          | All links, section order, six reference traits, honest copy                 |
| FR-008–010             | Account entry/provider return                  | Both entry modes, both providers, pending/cancel/error/existing account     |
| FR-014–015             | Preferences and shared UI                      | Initial document locale/theme, dictionary parity, full accessibility matrix |
| FR-016                 | Semantic previews/font fallbacks               | Failed images/fonts leave readable copy and working actions                 |

SC-001–007 remain the acceptance outcomes in the feature spec, including five-person comprehension
review. These contracts describe planned behavior; no implementation result is claimed.
