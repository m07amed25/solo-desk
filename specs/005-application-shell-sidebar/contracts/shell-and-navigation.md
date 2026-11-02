# Shell, Routes and Navigation Contract

Covers FR-001–014/022–023/029–030 and US1/US3/US5/US6. These are implementation design contracts, not claims about current behavior.

## Routes and Layout Ownership

| Browser path | Internal page beneath `(site)/[locale]/[theme]` | Composition / access |
| --- | --- | --- |
| `/` | `page.tsx` | Existing public composition; no app sidebar. |
| `/sign-in`, `/sign-up` | Existing entry routes | Existing entry composition; no app sidebar. |
| `/app` | `app/page.tsx` | Overview: truthful welcome/context, useful implemented links, honest states; authenticated shell. |
| `/app/workspace` | `app/workspace/page.tsx` | Existing create/select/settings/invitation/member/leave controls under current gates; authenticated shell. |
| `/app/account` | `app/account/page.tsx` | Existing personal profile and live behavior; no workspace prerequisite. |

Existing locale/theme cookies continue selecting the internal presentation rewrite. Public aliases such as `/en/dark/app/account` remain unsupported browser paths unless a separate explicit compatibility decision is made; do not broaden the proxy matcher. Unknown children get safe 404/recovery, never placeholder business modules.

Nested `app/layout.tsx` owns direction and controlled SidebarProvider presentation plus non-private invitation capture. It wraps only app routes. Nested `app/template.tsx` owns a Suspense boundary with non-private skeleton/error fallback, current server bootstrap and the private runtime. Pages invoke the same request-render loader for their guards. No protected data goes into the persistent presentation provider. Overview and Workspace consume the one runtime context; Personal account's server envelope must match its actor before mounting.

If a denied template withholds its children, its own non-private recovery validates the browser's finite app pathname and performs the sign-in transition with that return and an empty fragment. Page-level server redirects remain useful where executed, but are not the only recovery path. Keep early proof scrubbing outside both paths.

## Finite Paths and Returns

- Extend `lib/site.ts`'s exact page/return set to `/`, `/sign-in`, `/sign-up`, `/app`, `/app/workspace`, `/app/account`. Define the three app paths as the exact subset allowed for auth resumption. No prefix acceptance.
- Keep `POST /api/preferences`' existing `application/x-www-form-urlencoded` body: exactly one `locale`, `theme`, `returnTo`, bounded by 2048 bytes; retain exact-origin validation, existing cookies and 303 behavior. New child values are permitted; arbitrary URLs, queries, fragments, duplicate/unknown fields and invalid encodings fail without cookies. App controls submit the current finite destination. Dirty-input confirmation precedes the full-document preference submission.
- Auth entry accepts optional single `returnTo` from the app subset and optional single `authError=1`. Callback accepts optional single valid `entry` and optional single app `returnTo`. Defaults remain sign-in and `/app`. Unknown, duplicate, malformed or overlong query data (2048-byte query ceiling) normalizes to the existing generic failure destination with an empty fragment, discarding the hostile query. Only a unique valid return may be retained; invalid return falls back to `/app`.
- Revalidate this return at every reader, including already-signed-in entry, enabled email sign-in/verification completion and social callback. Pass only the validated value through `AuthEntryPage → AuthInteractivePanel → SignIn/AuthEmailForm`, counterpart entry links and supported recovery-to-sign-in transitions. Password reset alone does not establish a session.
- Example signed-out child transition: `/app/account` → `/sign-in?returnTo=%2Fapp%2Faccount#` → supported authentication → `/app/account#`. Normal `/sign-in` without a return still ends at `/app`. URLs ending in `#` intentionally clear browser-inherited invitation fragments.
- Callback/origin middleware, failure helper and streaming redirect cases must preserve these restrictions. No invitation proof, OTP, provider token or arbitrary source query enters `returnTo`, preference fields or auth callback/error URLs. Shell links to public home use `/` with explicit fragment clearing when leaving an unhandled invitation context.

Affected tests: finite path/query parsers; public/entry HTTP contracts; SDK callback/credential completion contracts; direct child requests in all six presentation combinations; malformed/hostile returns; actual streaming/browser fragment inheritance and history.

## Shared Shell Composition

- One skip link to `main-content`, one application header, labeled primary navigation and one main landmark. The header identifies page and current workspace/unselected/unavailable state, with theme/language controls accessible in all modes.
- Sidebar header: accessible SoloDesk app-home link and current workspace/switcher. Content: Overview, Workspace and team, Personal account. Footer: account menu with Personal account, public website and sign-out. No search, timer, notification, synchronization or unfinished module controls.
- Enabled page links lead to working routes. Workspace and team remains a useful state page when globally disabled/unavailable; controls that cannot execute show the appropriate reason. Personal account stays separate and reachable.
- Current destination uses visual selection and `aria-current="page"`; client title/breadcrumb lookup uses only the same finite route set. Child breadcrumb is App home → current page; current crumb is not an unnecessary link.
- Shared page header slots are title, optional concise description and real page actions. No generic navigation registry/plugin system or per-screen design system. Main uses remaining width and logical responsive spacing; content-specific forms may retain readable line-length limits.

## Responsive Components and Interaction

Use official Base UI shadcn Sidebar/Sheet/Tooltip/Breadcrumb and existing primitives. Inspect CLI-resolved source with its actual imports/peer requirements before adding; record provenance. Prefer Base `render` composition with proper non-button semantics for links, not Radix `asChild`. No runtime dependency is pre-authorized merely because a generated snippet imports it.

- At widths ≥768 CSS pixels, persistent Sidebar starts expanded and can collapse to an icon rail. Use a labeled 44px toggle; labels remain available on focus and hover, with accessible names independent of Tooltip. Sidebar content scrolls on short screens; header/footer controls remain reachable.
- Below 768 CSS pixels, use the Sidebar's Sheet-based modal navigation. Keep CSS media query and mobile-state hook on the same breakpoint. A labeled top-bar Menu button opens it. Include localized SheetTitle and accessible close control; retain modal focus containment, inert/background blocking, Escape and scroll locking.
- Dismissal returns focus to the opener. Successful navigation closes the drawer and focuses the new visible heading/main region after commit. Cancelled dirty-input discard keeps the current form/drawer. A breakpoint change closes obsolete mobile state and transfers focus to an equivalent visible control when needed.
- Desktop expansion is controlled in the persistent layout and kept only in memory. Review/remove generated provider cookie writes and Ctrl/Cmd+B binding. No localStorage, sessionStorage, IndexedDB, presentation cookie or new preference endpoint is needed.
- Reuse shared semantic `sidebar`, `background`, `foreground`, `muted`, `border`, `ring` roles; existing fonts, 8px/12px shapes, 4px spacing base and reduced-motion treatments. No global palette/font/preset rewrite.
- Arabic uses document `dir`, Base UI DirectionProvider, Sidebar/Sheet on the right and portal direction. Use logical spacing and appropriately mirrored navigation arrows, never mirrored wordmarks. Inspect reused menu physical spacing/submenu defaults. Isolate names/emails/identifiers; truncate long navigation visually while leaving the full name readable in the selector/accessible label.
- Validate phone/tablet/desktop, 1280×480 short viewport, 320 CSS-pixel reflow and 200% zoom. Essential menu, switcher, account and appearance controls must stay reachable. Do not infer contrast or Arabic shaping acceptance from tokens/screenshots.

## Dirty Input and Route Changes

Profile/team forms register only a dirty boolean and discard/cancel behavior with the current runtime; unsent values stay in their existing in-memory forms. Do not lift private drafts into the persistent sidebar provider or a browser store. Use a shared existing confirmation primitive/accessible explicit confirmation for in-app changes; a browser-native confirmation is acceptable if no installed house confirmation can meet the need without new dependencies.

Intercept eligible in-app links, workspace switches and preference submissions before losing changed input. On cancel keep form and focus; on discard conceal old private content, invalidate in-flight UI generations and commit navigation. Modified-click/open-in-new-tab retains normal browser behavior and does not discard the current tab. Warn honestly about refresh/closure loss; `beforeunload` may supplement dirty forms but is not guaranteed recovery.

## Invitation Arrival and Focus

Capture on document entry and new hash/navigation arrivals outside private loading. Scrub proof before bounded parsing; preserve `history.state`. Never auto-accept or fetch private invitation detail before current recipient authority/capability is established. Acceptance UI remains explicit and localized, with focus/status handling after accept/dismiss/error. Proof is not carried through a route/identity/preference exit. Signed-out/disabled/unavailable/malformed/lost-proof states give safe reopen guidance, without logging the fragment or persisting it.

Actual browser checks must cover a redirect winning the hydration race: non-private capture alone cannot scrub a fragment before an earlier full/streaming redirect. Every exit from such a context must explicitly clear the fragment, and any early telemetry must exclude URL fragments.
