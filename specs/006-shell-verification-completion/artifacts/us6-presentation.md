# US6 presentation and copy

2026-11-02; operator Codex. Final source/build/lock/runtime and synthetic fixture hashes: [identity](final-identity.json). Baseline and earlier red logs use the recorded baseline plus stated regression-test edits; they are historical failures, not final-build failures. Local Node checks have no locale/theme/viewport. Mounted checks use Chrome 155.0.8059.84, real product components/CSS with explicitly mocked navigation/auth/actions/transport/Realtime at loopback4316; they cannot establish Next Cache Components/history or live authority. Assertion code and declared fixture inputs are retained in [controlled fixture](controlled-fixture/README.md).

PASS formatting:464matching message keys/structures plus ICU argument/tag signatures; every catalog message formats in both languages. Deliberately mismatched ICU fixture is rejected. This is formatting, not fluent wording approval.

Inventory corrected: runtime verification/outage/retry, discard/reload-loss, selection/choice statuses/errors, role labels, overview, invitation recovery/accept, Sidebar/Sheet title/description/toggle/close. Utility defaults remain compatible; server exceptions/canonical statuses are not displayed as user copy. IDs stay stable. Mixed-direction user text uses bdi, logical spacing and RTL menu/chevron/side conventions.

PASS mounted [36 case matrix](mounted-matrixAfter.log): EN/AR × Light/Dark/System ×390×844,768×1024,1280×800,1440×900,1280×480,320×568, long80-character+Arabic name, no document overflow and44pxtrigger. Before fix the overview long unbroken heading overflowed; break-words at existing owner corrected it. Matrix covers this measured state; it does not exercise every shell state/journey.

PASS [media](mounted-mediaFinal-retry.log): explicit Light/Dark unchanged by OS media, System follows light/dark, Arabic drawer opens right and reduced-motion transition0s. PASS affected sign-out label contrast measured3.755 before→20.469 after using existing default monochrome variant; [result](mounted-contrastAfter.log). Shared lg/icon-lg sizing corrected to44px. No palette/global CSS/theme-controller replacement.

BLOCKED T052/T053: actual200% browser zoom, full-state/cross-engine matrix and comprehensive contrast/focus/essential-control review. Firefox/WebKit matching engines missing. Known wider design contrast gaps remain. Human accessibility/fluent-Arabic reports are separately blocked.
