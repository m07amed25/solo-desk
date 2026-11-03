# Presentation, Public Entry and Account UI Contract

## Language and browser presentation

For every clean public/account route, resolve interface language in this order: an explicit supported browser selection (`en`/`ar`), then the currently authenticated account's saved supported preference, then English. Unsupported/missing browser values do not win. Signed-out people have no account fallback. A default shown by the settings form is not a saved account value; no GET writes a preference or choice cookie.

Preserve existing theme semantics and finite external paths. Account-locale changes do not mutate browser choice, another person, workspace defaults, canonical identifiers or issued documents. Browser-language changes do not save account language. Existing valid locale cookies remain browser preferences for compatibility; prior intent cannot be reconstructed, so do not mass-delete them or silently label account fallback as a new explicit choice.

`proxy.ts` currently rewrites clean paths into locale/theme segments before page render. Extend that owner, keeping `lib/site.ts` a pure shared parser/resolver. When a valid browser locale exists, perform no account fallback lookup. With no browser choice and an auth-cookie candidate, use a narrow server-only resolver with installed `@neondatabase/auth/server` `createAuthServer` request context bound to that `NextRequest`, with cache bypass and current verified session checks, followed by the account-owned locale query. This is an SDK-supported context factory, not hand-rolled session validation. Do not call the Next Server Component `next/headers` adapter blindly in Proxy or recursively fetch the app's own account API. Installed Proxy uses Node runtime; verify actual production-Next behavior and response cookie handling before accepting this path.

Any response-cookie renewal from the supported request context must be applied to the final rewrite/redirect; no tokens are copied into debug headers, paths or shared cache keys. Account-locale headers are presentation hints only, never identity authority. Missing/invalid/expired identity resolves public presentation safely to English; auth/store outage is not represented as an empty accepted account. Protected services retain their own denial/unavailable behavior. No shared or browser-private session/proof cache is introduced.

### Existing `/api/preferences` POST

Retain same-origin, URL-encoded, duplicate-key, streaming byte and finite-return checks (existing 2 KiB bound). Add explicit changed-field intent `kind=locale|theme` to existing `locale`, `theme`, `returnTo` form fields; validate all submitted values, but set only the cookie designated by `kind`. Update every public/account/auth/skeleton preference form, helper, runtime navigation guard and test fixture together. A theme-only submission must never manufacture an explicit locale or overwrite an existing choice.

Legacy forms missing `kind` cannot reliably distinguish an explicit language change from echoed presentation. Return a localized 409 stale-form/refresh-and-retry response without changing either cookie; test old open tabs and document this compatibility behavior. Do not silently interpret ambiguous legacy fields as new intent. Unsupported/duplicate extra fields continue to fail validation. Keep 303 redirects to allowed clean destinations and remove unsafe fragments as the current parser does.

## Account page and unsaved input

Extend the existing `/app/account` page with personal preferences and session controls beside `LiveProfile`; no new dashboard or navigation hierarchy. Reuse installed Card, Field, Input, Switch, Alert, Skeleton and Button contracts and semantic tokens. A recognized bounded timezone can use existing input/validation; a new searchable-select dependency is unnecessary. Session confirmation can be inline; add an overlay primitive only if an actual interaction requires it and current shadcn/Base UI documentation is read first.

Each setting shows saved versus default, accepted revision, saving/conflict/failure/unknown state and a recovery action. Separate managed name save from app-preference save; never claim one atomic multi-store update. Display supported methods and unavailable provider capabilities honestly. Session list has loading/empty/unavailable/current/partial states with safe metadata and unknown labels. Current-session end uses ordinary sign-out; other-session actions use the exact proof/command contract.

Register new account-owned dirty forms with existing `ApplicationRuntime.registerDirtyForm`; use its navigation confirmation for shell links, browser language/theme POST and social confirmation departure. Preserve the current profile draft owner. Do not store passwords, proof, personal drafts or private payloads in localStorage/IndexedDB/service-worker caches to survive navigation. Leaving/reloading/identity loss gives truthful in-memory loss guidance. Account/session generations cancel or ignore late list/save/proof/command results; overlays and live updates conceal/dispose with the same owner.

## Sign-out across public and private surfaces

Both desktop/mobile public headers must inspect returned errors and thrown failures rather than navigating unconditionally in `finally`. Suppress account/menu content while outcome is unknown, offer retry/reconciliation and navigate only after confirmed appropriate state. A definitive anonymous session replaces any server-rendered `initialUser` fallback; stale props cannot resurrect identity.

Reuse existing shell/profile sign-out ownership; do not duplicate a new global auth store. The public header can share a small behavior helper if both variants need the same correction, but it cannot assume private-runtime context exists on public pages. Ordinary sign-out remains possible without reauthentication or a working new-attempt limiter. Browser history/BFCache restore, expiry, account change, live subscriptions and delayed replies cannot reveal previous identity content.

## Truthful landing/footer

Remove simulated subscription form usage and its unused implementation when no remaining caller exists; replace with localized informational unavailability only if useful. No subscription address collection, timer-driven success, monthly-delivery promise or newsletter service. Preserve actual contact behavior with honest partial/unknown delivery states.

Review all rendered claims and labels. Keep synthetic previews labelled; planned client/project/time/invoice behavior must not be described as shipped. Remove or correct footer pricing/integration/changelog/blog/careers/help/API/status/legal links that point to unrelated anchors, unverified “Inc.” and generic social homepages. Remove unsupported live operational status. Retain only verified links whose labels match their destinations. Do not add Phase 62 pages or invent legal copy; mandatory disclosure still requires review before public exposure.

## Localization and accessibility acceptance

Every visible string, accessible name, state/error/retry and user-facing account email has equivalent English/Arabic content, including formerly hardcoded header/footer labels. Keep password/email/code direction LTR and mixed identifiers isolated; preserve Arabic shaping. Structural catalog/ICU parity is necessary but does not inspect uncatalogued strings or establish fluent translation.

Use current monochrome tokens with contrast-safe component treatments; do not replace pinned colors to conceal known gaps. All actual states need keyboard/focus/error announcement, screen-reader, touch, 320 CSS-pixel reflow, actual 200% browser zoom, Light/Dark/System and reduced-motion review. Device pixel ratio is not browser zoom. Record missing engines and human reviews as gaps. Return links, social error/cancellation, dirty forms and confirmation focus restoration are part of each supported presentation, not separate optional polish.
