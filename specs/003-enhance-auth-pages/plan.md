# Implementation Plan: Enhanced Sign In and Sign Up

**Branch**: `codex/landing-email-full-tests` | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: `specs/003-enhance-auth-pages/spec.md`.

Setup resolved feature identifier `003-enhance-auth-pages` through `.specify/feature.json`; its `BRANCH` output is a feature-derived identifier, not the actual Git branch above. No branch switch, deployment, provider configuration change or application implementation is part of this planning run.

## Summary

Enhance the two existing account pages with the reference's form-first split layout, email/password registration and sign-in, signup verification codes and minimal code-based password recovery. Preserve Google/GitHub access, the profile destination, localization and theme preferences. Use existing shadcn/Base UI primitives and managed Neon Better Auth through the current same-origin catchall. No new authentication server, challenge database, form library or runtime dependency is required.

Keep the server-rendered page shell and static visual separate from client form interactions. Verification and recovery are transient form steps within `/sign-up` and `/sign-in`, so no new public routes, secret query parameters or preference allowlist changes are needed. Use the existing signed email webhook and delivery receipts with bilingual English/Arabic auth content. The visual combines a researched monochrome architectural backdrop with the existing labelled synthetic product preview; its acquisition/fallback contract is in [design.md](design.md).

**Design status**: Phase 0 research and Phase 1 design are complete. Implementation may begin with the isolated capability proof below. Credential rollout remains blocked until managed-service semantics and Q-08 policy approval pass. Documentation is not evidence that these controls are implemented.

## Technical Context

**Language/Version**: TypeScript 5.9.3, React/React DOM 19.3.0; planning host Node 24.21.0. Deployment runtime must be recorded independently.

**Primary Dependencies**: Lockfile: Next.js 16.4.3, `@neondatabase/auth` 0.7.0-beta, local `better-auth`/`@better-auth/core` 1.7.14, `next-intl` 4.14.9, Base UI 1.9.0, shadcn 4.23.0, Nodemailer 10.3.1, React Email 6.11.6, pg 8.23.1. Use installed Tailwind semantic tokens and existing Lucide icons. Local Better Auth overrides do not patch the hosted service.

**Storage**: Managed `neon_auth` account/credential/verification/session records; existing `public.solodesk_email_deliveries` receipts. No new tables, columns, credential copies or stored form drafts. The receipt migration may still need applying to an authorized isolated environment before webhook activation.

**Testing**: Existing Node assertion suites, email renderer tests, HTTP assertions, translation parity, TypeScript, ESLint and Webpack production build. Add a dedicated real-code auth journey harness rather than treating the existing fixture's manual verification update as end-to-end proof. Browser visual/accessibility checks use the available project-approved tooling with synthetic identities.

**Target Platform**: Responsive browser website, English/LTR and Arabic/RTL, Light/Dark/System; Chromium, Firefox and WebKit for account interactions.

**Project Type**: Existing Next.js App Router modular monolith; Cache Components and partial prefetching are already enabled.

**Performance Goals**: Proposed implementation budgets: visible pending feedback within 100ms; no auth-specific animation bundle; non-image client JavaScript increase at most 20 KiB gzip over the measured account-route baseline; decorative desktop image at most 200 KiB optimized, zero image request below 768px; no new page-level horizontal overflow or layout shift from unreserved media. Existing web targets remain p75 LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 under a recorded mobile test profile. Delivery and hosted-auth latency are measured separately, never promised from local render timing.

**Constraints**: No secrets in URLs, browser draft stores, telemetry or public artifacts; no client-only authorization; no social identity linking, new provider, passwordless sign-in, persistent registration state or automatic production changes. Hosted password/OTP/rate/revocation policy must be evidenced and approved before credential activation. Preserve existing protected profile behavior and user data.

**Scale/Scope**: Two canonical entry pages and their inline verification/recovery states; existing account/profile/API/Realtime authorization boundaries; two locales and three presentation preferences. No workload/user-count or availability promise is introduced.

## Constitution Check

The pre-research review found no proposed architecture violation. Post-design review retains the same result; activation gates below remain open and are not constitutional exceptions.

| Principle                                  | Pre-research decision                                                                                             | Post-design assessment                                                                                                                                  |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Selected stack and simple boundaries    | Extend the current application; preserve managed Better Auth, Neon and shared UI.                                 | Pass as design: existing catchall forwards OTP paths; no new service, plugin installation or schema.                                                    |
| II. Server authority and privacy           | Treat signup/verification/reset responses as untrusted observations until fresh session authority is established. | Pass as design: shared session/profile checks, secret-free inline states, managed challenge ownership and direct negative tests. Runtime proof pending. |
| III. Recoverable effects                   | Do not add financial operations. Preserve durable email receipts and uncertain-send reconciliation.               | Pass as design: reuse event ID/body hash, one claim and no blind SMTP retry. Real database concurrency proof pending.                                   |
| IV. Shared bilingual accessible experience | Use semantic tokens and form primitives; preserve RTL, themes, 320px and zoom.                                    | Pass as design: explicit state, responsive, email-direction and visual contracts. Manual review pending.                                                |
| V. Evidence before completion              | Separate local inspection, current advisory results and future integration proof.                                 | Pass as design: [research](research.md) records versions/findings; [quickstart](quickstart.md) defines build-specific evidence and stop conditions.     |

### Activation gates and policy record

| Gate                                     | Responsible role                 | Evidence/decision needed                                                                                                                                                                                                                                                                                                                                                              | Failure behavior                                                                                                                              |
| ---------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| G1: managed compatibility                | Identity engineering             | Real signup/sign-in/verify/resend/reset through this SDK/catchall on an isolated authorized branch; record supported reset-request path and hosted version/assurance.                                                                                                                                                                                                                 | Keep credential rollout blocked; do not patch SDK internals or substitute passwordless login.                                                 |
| G2: effective policy/Q-08                | Product + security               | Approve and record password min/max, OTP length/lifetime/attempt ceiling, resend interval/rotation, shared account/network limits, recovery/session revocation and factor compatibility. Boundary fixtures must match actual enforcement.                                                                                                                                             | No activation with guessed defaults or client-only limits.                                                                                    |
| G3: reset and verification invariants    | Identity + QA/security           | Old code fails after resend including races; consumed/wrong-purpose codes fail; resetting revokes two existing sessions; unknown/wrong-password and duplicate/social identities do not enumerate. Recovery must not add a password credential to a social-only identity under this spec's no-linking scope. Test raw responses and stored credential relationships, not only UI copy. | Unsupported mandatory semantics block rollout and require provider remediation or an explicitly revised spec.                                 |
| G4: protected services and compatibility | Application + QA                 | Unverified/revoked/foreign identity denial on account page, profile API, action and live subscription; Google/GitHub and legacy verified profiles continue to work.                                                                                                                                                                                                                   | No weaker special case for a client-supplied provider or user ID.                                                                             |
| G5: delivery/operations                  | Operations + identity            | Isolated receipt migration/privileges; signed webhook tests; actual EN/AR inbox delivery and timeout/reconciliation; approved production provider/domain and ingress controls.                                                                                                                                                                                                        | Keep custom auth email subscription inactive until handler is reachable and proven; never disable current delivery before replacement passes. |
| G6: release evidence                     | Engineering + security + product | Fresh deployed-version advisories, test/visual/accessibility evidence, source/build/environment identities and [release gate](../../docs/security/release-checklist.md).                                                                                                                                                                                                              | Missing or failed checks remain gaps; no release claim from this plan.                                                                        |

No mandatory requirement is silently dropped to clear these gates. G1–G3 are implementation prerequisites for credential activation, not unknown architecture choices to paper over.

## Project Structure

### Documentation (this feature)

```text
specs/003-enhance-auth-pages/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── design.md
├── quickstart.md
├── contracts/
│   └── auth-flows.md
├── checklists/requirements.md
└── references/
    ├── account-creation.png
    └── authentication-settings.png
```

`tasks.md` belongs to the subsequent `$speckit-tasks` phase and is deliberately not created here.

### Source Code (repository root)

```text
app/(site)/[locale]/[theme]/sign-in/page.tsx
app/(site)/[locale]/[theme]/sign-up/page.tsx
app/(site)/[locale]/[theme]/app/page.tsx
app/(utility)/auth/callback/page.tsx
app/api/auth/[...path]/route.ts
app/api/profile/route.ts
app/api/webhooks/neon-auth/route.tsx
app/actions.ts
app/globals.css
components/auth-entry-page.tsx
components/sign-in.tsx
components/auth-email-form.tsx                 # new: focused email/verification/recovery interaction
components/landing/work-preview.tsx           # reuse existing server-rendered illustrative preview
components/ui/{button,input,field,alert,separator}.tsx
lib/auth/{client,server,email-webhook}.ts
lib/{profile,site,site-content}.ts
messages/{en,ar}.json
emails/auth-message.tsx
emails/components/email-layout.tsx
migrations/001-email-deliveries.sql            # existing, apply only if not already applied
scripts/{test-site.test,test-profile.test}.mjs
scripts/{test-site-http,test-neon,check-translations,test-email}.mjs
tests/email.test.mjs
scripts/test-auth-flows.mjs                   # planned real-code isolated integration harness
scripts/test-auth-contract.test.mjs           # planned transport/state tests
public/auth/architecture.webp                # acquired/optimized during implementation, not in this plan
```

**Structure Decision**: Extend the existing shell plus one focused client form module; keep `SignIn` responsible for Google/GitHub. The static visual stays server-rendered. Do not build a generic auth framework, install a form/OTP package, duplicate an account database or modify unrelated landing work. The current landing component directory is already uncommitted work; reuse its reviewed public export without overwriting its changes.

## Phase 0 — Research decisions

[research.md](research.md) resolves the technical choices:

1. Managed email OTP supports the desired verification and recovery model. Reuse browser SDK calls through the existing catchall; avoid the installed server-side reset mapping inconsistency.
2. Use a single six-character code input for both purposes and separate operation states. Do not use passwordless sign-in or an optional preliminary OTP-check endpoint.
3. Keep all form steps on the two existing entry routes. Reload explains/restarts the supported journey; it does not restore secrets from storage.
4. Join bounded name parts into the existing display-name field. No user-schema migration.
5. Deliver bilingual auth emails because the documented signed email payload does not carry a trustworthy recipient locale. Do not create an email-address locale store just for this feature.
6. Reuse current shadcn primitives and a static original SoloDesk preview. Source one decorative architecture image with provenance and a CSS-only fallback.
7. Treat exact managed policy as an operational capability proof. Current SDK defaults and local dependency overrides are not evidence about the hosted version/configuration.

## Phase 1 — Design and contracts

[Data model](data-model.md) defines ownership, validation and transitions. [Auth contracts](contracts/auth-flows.md) define form steps, SDK paths, responses, authorization and email behavior. [Design](design.md) defines composition, assets, typography, responsive rules and accessibility. [Quickstart](quickstart.md) defines executable validation and evidence requirements.

### Trust boundaries and authorization

The browser submits only identity inputs to managed Auth through the current SDK handler. Managed Auth owns passwords/challenges, uniqueness, race handling and credential transactions. Client success changes presentation only; protected access always derives from a fresh server session.

Extend `currentSession()` to reject unverified email authority, in addition to its existing freshness/expiry checks. This closes the same boundary for account page, callback, profile API and `saveProfile` through their existing callers. Add the verification predicate to `profileSql` as well, so an open sealed live query loses access when the user becomes unverified; preserve current session-row/banned/expiry predicates. Provider sessions must expose verified email ownership or complete verification before profile access. Prove current Google/GitHub compatibility with actual synthetic identities; do not infer provider authority from client state or create a bypass for legacy unverified records.

The public auth handler retains the SDK's cookies/origin/callback protocol. Test directly callable endpoints, including the hosted service if accessible, for enumeration and abuse semantics. Generic UI copy cannot hide raw upstream status/timing leaks. Do not introduce a custom proxy or revoke sessions from an anonymous resetting browser as an attempted substitute for managed enforcement.

### Validation and resource bounds

Join first/last name after trimming only the name parts, preserving internal characters; the resulting display name must contain 1–100 UTF-16 code units, matching `saveProfile`. Accept a single first name; last name is optional. Email is bounded to 254 characters and surrounding whitespace removed; use provider canonical identity handling without rewriting local parts. Passwords are opaque, unchanged strings; client guidance must match the approved managed min/max. Code is an ASCII six-digit string, never a number.

These checks are repeated at the identity trust boundary, not left as browser-only rules. If managed name/email bounds are weaker than required, add narrowly scoped prevalidation to the existing handler for the affected paths with bounded JSON handling and contract tests; preserve all other SDK methods/cookie handling. This does not replace provider abuse/identity enforcement or make direct hosted endpoints private. Do not build this wrapper without a demonstrated mismatch.

No new application database queries for registration, rate limits or challenge lookups. Session/profile reads remain bounded; the existing profile query retains `LIMIT 1` and its indexed identity/session keys. No new indexes are planned. Email delivery reuses one receipt claim plus bounded lookup/update; no job system or blind retry loop is added.

### Ordered implementation slices

| Slice                                     | Work and completion boundary                                                                                                                                                                      | Dependencies                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| A. Prove managed contracts                | Create isolated synthetic fixtures, confirm current SDK paths and signed real codes, effective policy, resend rotation, raw anti-enumeration and reset revocation. Record Q-08 and G1–G3 results. | Authorized isolated environment; no production mutations.                                       |
| B. Strengthen shared access               | Update session/Realtime verified predicates and affected unit/real-DB tests; preserve provider and self-profile behavior.                                                                         | Capability results and compatibility fixtures from A.                                           |
| C. Ship account layout locally            | Form-first shell, static visual, provider grouping, shared fields and explicit form states; EN/AR strings, themes, keyboard and responsive review.                                                | [design](design.md); can develop UI with synthetic response fixtures while activation is gated. |
| D. Complete registration and verification | Wire signup, pending verification, resend/correction/resume and fresh-session navigation; keep codes/passwords transient and mask generic errors.                                                 | A–C.                                                                                            |
| E. Complete sign-in and recovery          | Password login, unverified continuation, inline forgot/reset steps, reset clears secrets and returns to Sign in.                                                                                  | A–D; mandatory hosted revocation proof.                                                         |
| F. Localize delivery                      | Bilingual subject/body/footer, proper direction, signed expiry; preserve webhook verification, ledger and uncertainty handling; render/unit/real delivery checks.                                 | Existing delivery infrastructure; G5 before activation.                                         |
| G. Validate and prepare release           | Update auth-only copy, changed docs and account-page HTTP expectations; run full checks and browser matrix; record findings and rollback/readiness.                                               | All affected slices; G1–G6 before public rollout.                                               |

Each slice carries meaningful happy/denied/failure checks. A partial visual enhancement may be reviewed locally, but it does not complete the email-access feature or justify enabled credential promises.

### Requirement and verification mapping

| Requirements | Primary implementation owners                            | Proof                                                                                                                                                   |
| ------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-001–003   | Entry shell/email form/messages; identity engineering    | Signup/sign-in field variants, name/identity/password boundaries, autofill/paste, server rejections.                                                    |
| FR-004–008   | Identity/QA/security; SDK transport and session boundary | Real-code verify/resend/replay, unverified denial, generic errors, approved rate/expiry boundaries, two-session reset rejection.                        |
| FR-009       | Existing social component/callback; identity engineering | Google and GitHub initiation/consent/return plus cancel/failure and existing-account collision handling.                                                |
| FR-010–013   | UI/localization/QA                                       | Visual six-trait review, local assets, 24 presentation/viewport combinations per page, browser/keyboard/assistive technology and EN/AR email rendering. |
| FR-014–016   | Forms/session/profile/webhook; application/security      | Double submission, pending/error state, secret/persistence scan, fresh/expired/revoked/direct foreign-ID and private-cache tests.                       |
| FR-017       | Product/content                                          | Actual approved policy destinations; no marketing or invented testimonial/legal content.                                                                |

All SC-001–SC-007 map to the executable and manual scenarios in quickstart. No outcome is marked achieved by planning.

### Selected security controls

| Controls                        | Owner role             | Concrete verification                                                                                                                               |
| ------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-001/003/007/063             | Identity/security      | Hosted and proxy raw-response enumeration; wrong-purpose/replayed/superseded codes; multi-instance attempt and resend limits.                       |
| SEC-002/005/006/008             | Identity/security      | Cookie/CSRF/origin behavior, trusted reset proof, two-session revoke and stale tab/profile/action/live-query denial.                                |
| SEC-004/009/010/011/014         | Application/security   | Provider identity collision; no signup-supplied grants; direct foreign-ID/action/field denial; no stale/unchecked authority.                        |
| SEC-017/023/024/025/027/029     | Application/security   | Parameterized current profile queries; bounded and inert names/errors/body; exact origins and safe callback links.                                  |
| SEC-028/031/032/044/047/048/062 | Operations/security    | No shared private cache or stored secret draft; actual transport/cookie/header checks; synthetic-only staging; redacted source/build/log artifacts. |
| SEC-043/060/061/064             | Application/operations | Real receipt uniqueness/concurrency, signature/replay/altered payload denial, sender crash/timeout reconciliation and fail-closed outages.          |
| SEC-049/050/052/055/056         | Engineering/security   | Fresh exact dependency/deployed-version review, reused UI provenance, build identity and compatible receipt rollout/rollback.                       |

Named individuals, versioned ASVS L2 requirement mappings and actual results must be recorded in implementation evidence before release; role allocation here is not operational sign-off. Controls outside this account/email scope retain their existing release obligations.

## Rollout and recovery

Develop locally and validate only against an authorized isolated branch/test inbox. Record original managed settings before any later authorized change. Required settings are email signup/sign-in enabled, OTP verification required, signup/sign-in verification dispatch enabled, signup permitted and supported auto-sign-in after verification. Select the supported reset-request path once from the capability result; do not automatically retry another endpoint after an uncertain submission.

Before switching email subscriptions, apply the existing receipt migration only if absent, validate restricted grants and handler readiness, then prove actual receipt/send/duplicate behavior. Enabling managed custom email delivery replaces default delivery and therefore requires a staged verified cutover. No account deletion, credential migration or managed-schema edit is planned.

If rollout fails, restore the previous reviewed UI/artifact and delivery configuration only when its compatibility is verified. Keep accepted password accounts and a functioning verified sign-in/recovery path: a social-only UI rollback after accepting password-only accounts would lock users out and is not a safe rollback. Stop new registration with an approved provider setting if necessary while repairing access. Never disable verification, erase receipt claims or automatically resend uncertain emails. Do not revoke valid accounts or rewrite managed auth tables to clear a UI failure.

## Complexity Tracking

No constitutional violation or extra architectural layer is proposed. The only additional application module is the focused email-form interaction; an image provenance record and real-challenge verification harness are required by the requested design and authentication behavior. Provider shortcomings are blocking gates, not justification for a second identity system.
