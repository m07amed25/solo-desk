# US4 local lifetime checks — 3 November 2026

Status: partial local evidence; T052 and real acceptance remain unchecked.

## Implemented behavior

Both public header variants share one provider inside SiteHeader, with no private-runtime dependency or global identity store. Pending/unknown sign-out removes account/menu content from both variants, including after resizing. Returned error, throw and missing success acknowledgement retain retry/reload recovery. Confirmed SDK success alone permits navigation. Concurrent clicks dispatch once; the SDK request timeout is 15 seconds, which bounds a lost response without treating timeout as proof of sign-out. Definitive anonymous state never falls back to initialUser.

ApplicationRuntime now requires the same explicit SDK acknowledgement, applies the same bounded request, and ignores a success response after its owner unmounts. Existing synchronous concealment, private overlay hiding, generation invalidation and draft disposal remain in the runtime. Existing LiveProfile ownership/subscription logic was preserved.

## Actual checks

- Node imported component tests reproduce the original unconditional finally-navigation, stale initialUser and duplicate-dispatch bugs before correction; new timeout assertions also failed before the request bound was added.
- Imported runtime test reproduces missing-ack navigation and late navigation after unmount before correction. It verifies private root inert/display state, overlay concealment and registered draft disposal.
- Chromium 155.0.8059.84 mounted React fixture: 20 cases (en/ar × 1280/390 × returned/thrown/missing/success/delayed reply) passed, with responsive switching, safe errors and no duplicate dispatch.
- Mounted private fixture: same-account name draft survives an authority recheck; a save reply arriving after synthetic pagehide/pageshow does not restore the old success message; a late context response after failed sign-out does not restore private content.

The fixture mocks identity, router, actions and Realtime; synthesized page events do not prove actual BFCache and the Realtime mock does not prove real subscription/socket disposal. No provider tokens, cookies or live service data were used.

## Remaining checks

Actual production Next route/history/lifetime, account A→B switching, real expiry/revocation, real Realtime cleanup, cross-browser behavior, keyboard focus after recovery, human screen-reader/Arabic review and provider sign-out/old-session denial remain unverified. The diagnostic split build compiled, but generation failed renaming proxy.js and the resulting Next server returned 500/timeout. G5 remains blocked; the user supplied no isolated target/evidence.

The next-dev-loop workflow was unavailable because agent-browser is absent. Its [SKILL.md](/home/mohamed-s/.codex/skills/next-dev-loop/SKILL.md) requires agent-browser >= 0.31.1 and says “If anything is missing, tell the user how to upgrade and stop.” No successful next-dev-loop run is claimed. The separate mounted Playwright checks above follow the feature plan and do not substitute for that workflow or production Next acceptance.


The 20-case matrix and private fixture checks preceded the final SDK-timeout-only follow-up. Final imported tests cover that follow-up; the Arabic 390px recovery capture was repeated afterward with no horizontal overflow.
