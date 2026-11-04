# US1 informational entry evidence — T015 partial

Date: 2026-11-03. Scope: static account-security section only; no factor listing/setup/mutation. Source identities: execution-source-identity.json and eventual final-verification.md.

T010 red: `node --test --test-name-pattern="account security entry" scripts/test-site.test.mjs` failed at `en:unknown: security entry remains findable` before the page edit. Sandbox child process initially hid diagnostics; direct invocation established the failure, then approved outside-sandbox runner confirmed it. Green focused rendered regression passed (1/1) after page/catalog changes across English/Arabic and five synthetic profile states. An intermediate missing-translation run failed; nesting the new copy under the existing AccountSecurity.protection namespace preserved revocation strings and corrected it.

T011 browser procedures extended. T012 uses existing Alert as a static note within a named h2 section; the same server-generated JSX appears in success and profile/Realtime failure shells. T013 English/Arabic four-message block has no account/provider facts. Unknown observation is separate from unavailable setup. No placeholder controls, status flag, API, dependency, state store, secret or migration.

T014 focused imported runtime regression passed (1/1). It mounts actual page JSX under existing runtime, verifies authority-outage/history/sign-out concealment, stale reply rejection and changed-account concealment/navigation. The test fixture needed passive remount listeners installed; corrected in the test, production runtime unchanged. This proves mocked lifecycle behavior, not live session invalidation or actual BFCache.

Profile/Realtime failure assessment: static explanation remains alongside retry; identity/app-context failure still conceals the entire app. No independent live-security-access claim. Synthetic enabled/pending/foreign profile fields are ignored, never interpreted as authoritative factor status.

T015 remains OPEN pending actual production Next-route/runtime and human bilingual/assistive evidence; component-browser observations, if available, are supplementary. No supported own-method listing, enrollment/recovery, SC-008 participant result or F02.05 acceptance.

## Component-browser observations

Chromium 155.0.8059.84: [30-case layout record](browser-observations.json), English/Arabic × Light/Dark/System × 320/390/768/1280/1440 CSS pixels. Named heading/note/three paragraphs present, no mutation controls or horizontal/section overflow. Initial visual inspection found physical left alignment in Arabic; final section sets logical text-start and all 30 cases report start alignment. Actual page JSX rendered into the existing synthetic shell/runtime fixture, not a production Next route.

Both languages: synthesized history concealment, stale foreign reply ignored, fresh restore, authority 503 concealment and keyboard Enter ordinary sign-out failure concealment observed. Final actual translated Try again/حاول مجددًا controls visible. Initial probe searched for incorrect Retry labels and counted zero; corrected-label follow-up passed. [Raw layout](browser-layout.txt), [lifetime](browser-lifetime.txt), [sign-out](browser-signout.txt). The fixture has synthetic profile/Realtime/auth boundaries; profile server-failure cases are imported rendering tests. No live invalidation, native BFCache or independent security authority accepted. Font pipeline/PNG capture limitations are in the observation record; no visual typography approval.

T015 remains unchecked: actual Next-route, actual zoom, human Arabic/assistive/usability and provider-own-method evidence absent. Local behavior is verified, not full US1/F02.05 acceptance.
