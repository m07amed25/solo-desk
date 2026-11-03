# Quiet account refresh — 2026-11-03

User follow-up: remove the full-screen “Checking your account…” panel on `/app`.

Routine focus and 55-second refreshes now leave the active app visible while fetching current context. The checking announcement is screen-reader-only. Private content remains concealed during history/visibility restoration, window blur, expiry, sign-out, changed account identity and failed context checks. Focus cannot reveal concealed content before a successful response. Server authorization and the expiry timer remain in force during background refreshes.

Verification:

- Regression observed before the fix: the focused test failed because routine refresh set the protected root display to `none` instead of `flex`.
- `node --test --test-isolation=none scripts/test-application.test.mjs`: 8 passed. Covers pending routine focus/interval checks, failed refresh concealment, blur/focus, history concealment, nonvisual checking state and the existing sign-out cases.
- Changed-file ESLint: zero diagnostics for `components/application-runtime.tsx` and `scripts/test-application.test.mjs`.
- `npm test`, approved execution: 99 Node tests and 6 email tests passed. Raw output: `loading-tests.txt`. The initial sandbox run failed child-process suites and is not counted as acceptance.
- Mounted Chromium fixture, English and Arabic dark mode: delayed focus refresh retained visible main content with no visible status panel; blur/focus kept main content hidden with a nonvisual announcement until a successful fresh response; fresh success restored main content; HTTP 503 hid main content and displayed recovery. Real source components were bundled with synthetic auth/context/router/Realtime adapters.

This is local component evidence, not real provider, actual BFCache or full Next.js acceptance. The prior lint/type/build/design/dependency gaps in `implementation-resume.md` remain open; those campaigns were not repeated for this scoped follow-up. No feature task or release gate is newly marked complete.

## Blank-screen follow-up — 3 November 2026

The user reported that removing the message still left a long black screen. A mounted React Strict Mode fixture with a deliberately held context response reproduced `state=checking`, main width `0`, and one redundant context request on initial mount. The prior window-blur concealment also hid the entire app despite no document departure.

The runtime now keeps first-mount readiness per instance, allowing the initial Strict Mode effect replay to use the request-validated server context until the initial passive effects settle. It no longer carries another runtime's bootstrap state. Ordinary initial `pageshow` does not repeat validation; persisted history restores still do. Window blur no longer conceals content. Document visibility departures, pagehide, cached Activity restores, expiry, failures, changed identity and sign-out retain their checks. This supersedes the blur behavior described above.

The regression test failed before correction (`1 !== 0` context requests during first-mount replay), then all eight focused application tests passed. Changed-file ESLint and `git diff --check` passed. `npm test` passed 104 Node tests plus six email tests on the final runtime source (`blank-screen-tests.txt`).

Mounted Chromium, English and Arabic dark mode, using real source components and React Strict Mode/Activity with synthetic adapters: initial render, window blur and a new runtime instance each remained ready, with main width 1024px and zero context requests. Activity restoration concealed private content pending fresh context (Strict Mode issued two requests, invalidating the earlier generation); a synthetic persisted pageshow also concealed until fresh success. Both restored visible main content after the latest valid reply. Screenshot inspected at `output/playwright/007/blank-screen-fixed.png` (local ignored synthetic capture).

An intermediate unit-only timing model missed the placement of Strict Mode's effect replay; the mounted browser caught it, and the final unit fixture models layout microtasks before passive replay. A browser assertion assuming only one Activity-restore request was also corrected to account for Strict Mode replay; both pending generations remained concealed. No production-Next/live-provider latency, actual BFCache or user session was measured. This removes the reproduced client-side wait, without claiming a provider performance result.
