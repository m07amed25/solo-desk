# SoloDesk — Feature Delivery Plan

**Rewritten:** 3 November 2026. **Purpose:** build a responsive website that helps freelancers and small teams manage clients, deliver work, track time, invoice and collect payment.

Every phase below delivers a usable feature. Database work, security, testing, translations, documentation and deployment checks are included in the feature that needs them. They are not separate product phases.

This rewrite retains **all 550 existing feature IDs, names, scope labels, feature prerequisites and behavioral contracts**, reorganized into **62 practical phases**. Existing implementation notes stay attached to their features; this document does not mark new work complete. The previous plan mixed a feature catalogue, broad P00–P09 packages and historical audit narration. This version makes the feature delivery sequence the main structure.

## How to use this plan

- Read the phase overview, then open the phase you will build. Each phase states the user outcome, required earlier features, included features and a concrete demonstration.
- `S` preserves the old **specified/supporting** scope; `E` preserves an **optional expansion**. All entries are retained. Optional means proposed, not promised, implemented or silently required for launch. If an S feature depends on an E feature, decide that exact dependency before activation; do not silently change either scope label.
- A feature checkbox covers its entire contract. Existing checked subtasks show previously recorded partial progress only. A phase is fully complete only when all its included feature contracts are accepted; an intentionally smaller release records exactly which IDs it includes and which stay pending.
- Phase order is a recommended sequence, not a calendar or a requirement to finish every earlier independent phase. Explicit prerequisites govern readiness. Within a phase, the feature prerequisite links govern implementation order, including prerequisites located in the same phase.
- A phase can be large when it delivers one substantial capability, such as recoverable time tracking or an invoice engine. Split its implementation into smaller tasks without inventing a separate “testing phase” or counting a screen mockup as delivered functionality.

## Starting point

The supplied project records existing public/account pages, Google/GitHub sign-in initiation, email account forms, personal profile updates, a sidebar shell, early workspace controls, English/Arabic catalogs and Light/Dark/System preferences. Reuse these foundations instead of rebuilding them.

The previous 2 November source audit recorded **0 fully verified feature parents**, **550 open parents** and **60 completed implementation subtasks across 38 partial parents**. These are inherited audit results, not a fresh runtime assessment. Clients, projects, tasks, time, billing and the portal remain planned according to that baseline.

Important recorded gaps include real identity/provider journeys, workspace isolation, restricted database access, public footer translations/link accuracy and simulated newsletter success. Phase 01 completes the existing truthful account-entry/public landing slice; later public feature/pricing/help pages are an expansion, not permission to leave misleading current claims in place. This rewrite inspected the supplied plan and relevant local product/project documentation. The live website could not be retrieved with the available browsing/network tools, and no production behavior was verified.

## Product and engineering rules shared by every phase

Use the existing **Next.js App Router, React, TypeScript, shadcn/ui with Base UI, semantic Tailwind tokens, next-intl, Neon PostgreSQL and Neon Managed Better Auth**. Extend the existing modular application. Preserve the current monochrome design system and supported account routes. Realtime may refresh permitted views but cannot replace authoritative save receipts or permission checks.

Each delivered feature includes its complete UI → authorized service → persistence → recovery flow, not just a page or a database table. Reuse existing components/services and cover affected callers, locale catalogs, migrations, fixtures, exports, jobs and configuration. Add only the facilities the feature needs.

- **Access:** check current identity, workspace, resource and action permission on protected reads, counts, search, writes, downloads, exports and queued effects. Private client views expose only deliberately published fields. Restrict server database credentials and keep secrets out of the browser.
- **Trustworthy saves:** validate input, preserve valid user input after failure, distinguish unsaved/browser-saved/pending/server-accepted/failed states, and make consequential retries safe. Check revisions rather than silently overwriting conflicting work. Never claim a saved, sent, paid, signed or subscribed result from a timer or browser redirect alone.
- **Work and money:** retain integer source seconds and approved exact money/currency rules. Keep private cost rates separate from selling rates. Issued documents retain their party, price, policy and version snapshots; corrections append traceable evidence. Reserve/consume work once, even under parallel requests or lost responses.
- **Experience:** English and Arabic/RTL, Light/Dark/System, responsive layouts, keyboard/focus/assistive support and usable empty/error/permission states belong to each feature. Test actual rendered copy and PDFs; matching translation keys alone does not establish the experience.
- **Recovery:** start environment isolation, redacted monitoring, backups, safe schema changes and operational ownership with the first relevant feature. Verify private files and restore both data and file versions before relying on them. Browser drafts require the approved storage/key/eviction contract; uncertainty is shown honestly.
- **Verification:** include at least the meaningful successful path, wrong actor/record, invalid input and a relevant retry/conflict/failure case. Apply [security controls](/home/mohamed-s/Desktop/Projects/solor-desk/docs/security/vulnerability-catalogue.md) and the [release checklist](/home/mohamed-s/Desktop/Projects/solor-desk/docs/security/release-checklist.md) to every included release. Repeat shared checks as features expand; the placement of their tracked entry is not a reason to postpone them or claim later scenarios already passed.

The functional authorities remain [product scope](/home/mohamed-s/Desktop/Projects/solor-desk/PRODUCT.md), [143 baseline requirements](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/requirements.md), [coverage register](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/coverage.md), [domain specifications](/home/mohamed-s/Desktop/Projects/solor-desk/docs/README.md), [architecture](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/overview.md), [design patterns](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/design-patterns.md), [design system](/home/mohamed-s/Desktop/Projects/solor-desk/DESIGN.md) and [security/privacy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md). Historical evidence and this plan do not override those contracts or user decisions.

## Phase overview

The table is the roadmap. Every row produces a usable capability; the full feature contracts follow it.

| Phase                 | What it delivers                                               | Product entries | Supporting entries |
| --------------------- | -------------------------------------------------------------- | --------------: | -----------------: |
| [Phase 01](#phase-01) | Create an account, sign in and recover access                  |              11 |                 14 |
| [Phase 02](#phase-02) | Protect an account with stronger sign-in controls              |               3 |                  0 |
| [Phase 03](#phase-03) | Create and manage a private workspace                          |               6 |                  4 |
| [Phase 04](#phase-04) | Invite teammates and control their access                      |               7 |                  1 |
| [Phase 05](#phase-05) | Navigate the workspace and organize a personal home            |               7 |                  1 |
| [Phase 06](#phase-06) | Manage clients and their contacts                              |               9 |                  7 |
| [Phase 07](#phase-07) | Create client projects and track their lifecycle               |               7 |                  0 |
| [Phase 08](#phase-08) | Plan and complete project tasks                                |              13 |                  0 |
| [Phase 09](#phase-09) | Track project time with a recoverable timer                    |              16 |                  1 |
| [Phase 10](#phase-10) | Build an invoice with exact prices and fixed-fee lines         |              11 |                  3 |
| [Phase 11](#phase-11) | Turn tracked work into billable invoice lines                  |               9 |                  0 |
| [Phase 12](#phase-12) | Issue, download and share a permanent invoice                  |              14 |                  8 |
| [Phase 13](#phase-13) | Record payments and see what clients still owe                 |              14 |                  0 |
| [Phase 14](#phase-14) | See income, unpaid invoices and cash expectations              |              14 |                  5 |
| [Phase 15](#phase-15) | Receive reminders and verified work notifications              |              12 |                  5 |
| [Phase 16](#phase-16) | Discuss work and share private project files                   |               9 |                  2 |
| [Phase 17](#phase-17) | Submit deliverables and preserve versioned approvals           |               4 |                  0 |
| [Phase 18](#phase-18) | Save eligible work drafts and recover after disconnection      |              10 |                  0 |
| [Phase 19](#phase-19) | Import business records and export workspace data              |               9 |                  0 |
| [Phase 20](#phase-20) | Keep a client relationship history and follow-ups              |               5 |                  2 |
| [Phase 21](#phase-21) | Track leads, opportunities and sales forecasts                 |              10 |                  0 |
| [Phase 22](#phase-22) | Keep agreements, amendments and obligations                    |               4 |                  0 |
| [Phase 23](#phase-23) | Plan deadlines, milestones and team capacity                   |              14 |                  0 |
| [Phase 24](#phase-24) | Price services and send a reviewed estimate                    |              11 |                  0 |
| [Phase 25](#phase-25) | Write proposals and record commercial decisions                |               9 |                  0 |
| [Phase 26](#phase-26) | Onboard a client and turn accepted work into a project         |               9 |                  0 |
| [Phase 27](#phase-27) | Review timesheets and safely correct billed work               |               5 |                  0 |
| [Phase 28](#phase-28) | Invoice milestones and apply advanced pricing rules            |               6 |                  0 |
| [Phase 29](#phase-29) | Bill recurring services on a schedule                          |               6 |                  0 |
| [Phase 30](#phase-30) | Manage prepaid retainers and service allowances                |               6 |                  0 |
| [Phase 31](#phase-31) | Track project expenses and recover approved costs              |              10 |                  0 |
| [Phase 32](#phase-32) | Manage suppliers and subcontractor commitments                 |               3 |                  0 |
| [Phase 33](#phase-33) | Match bank transactions and prepare accounting exports         |              10 |                  0 |
| [Phase 34](#phase-34) | Understand project margins, costs and utilization              |               9 |                  0 |
| [Phase 35](#phase-35) | Save reusable knowledge and search across work                 |              15 |                  0 |
| [Phase 36](#phase-36) | Plan focus sessions and review personal work habits            |               8 |                  0 |
| [Phase 37](#phase-37) | Give clients a private view of published project work          |              13 |                  0 |
| [Phase 38](#phase-38) | Collect authenticated client approvals                         |               4 |                  0 |
| [Phase 39](#phase-39) | Let clients pay invoices through hosted checkout               |               6 |                  1 |
| [Phase 40](#phase-40) | Sign agreements through an approved signature provider         |               3 |                  0 |
| [Phase 41](#phase-41) | Follow up on unpaid invoices with controlled reminders         |               3 |                  0 |
| [Phase 42](#phase-42) | Sync accounting records and optionally read bank feeds         |               3 |                  0 |
| [Phase 43](#phase-43) | Connect messaging channels and import client conversations     |               3 |                  0 |
| [Phase 44](#phase-44) | Connect issue trackers to project delivery                     |               9 |                  0 |
| [Phase 45](#phase-45) | Connect calendars and reconcile availability                   |               5 |                  0 |
| [Phase 46](#phase-46) | Build deterministic work automations                           |               9 |                  0 |
| [Phase 47](#phase-47) | Connect external tools through a scoped API and webhooks       |               6 |                  0 |
| [Phase 48](#phase-48) | Publish reusable client intake forms                           |               9 |                  0 |
| [Phase 49](#phase-49) | Let clients book, reschedule and cancel meetings               |               9 |                  0 |
| [Phase 50](#phase-50) | Offer group, team-routed and paid bookings                     |               4 |                  0 |
| [Phase 51](#phase-51) | Turn client requests and feedback into reviewed work           |               7 |                  0 |
| [Phase 52](#phase-52) | Manage software releases, handovers and maintenance agreements |              10 |                  0 |
| [Phase 53](#phase-53) | Customize reports and deliver scheduled summaries              |               4 |                  0 |
| [Phase 54](#phase-54) | Get help, track support requests and see service status        |              12 |                  0 |
| [Phase 55](#phase-55) | Export personal data and close an account safely               |               5 |                  1 |
| [Phase 56](#phase-56) | Brand client documents and the portal                          |               4 |                  0 |
| [Phase 57](#phase-57) | Subscribe to SoloDesk and manage the product plan              |              12 |                  0 |
| [Phase 58](#phase-58) | Manage organizational sign-in and access policies              |               9 |                  0 |
| [Phase 59](#phase-59) | Keep multiple legal sellers and business brands separate       |               2 |                  0 |
| [Phase 60](#phase-60) | Export and submit an approved electronic invoice format        |               2 |                  0 |
| [Phase 61](#phase-61) | Move existing business history into SoloDesk                   |               6 |                  0 |
| [Phase 62](#phase-62) | Publish feature, pricing and help pages for SoloDesk           |              11 |                  0 |

## Useful release checkpoints

**Working freelancer journey — Phases 01–14:** create an account and workspace, manage clients/projects/tasks, track work, prepare and issue a real invoice, record payment and inspect the resulting financial view. This is the first end-to-end product target. It is not a claim that all optional entries in these phases are necessary for the smallest pilot or that the current site already implements them.

**Core pilot additions — Phases 15–19 and Phase 55:** notifications, private collaboration/deliverables, approved recoverable drafts, import/export and safe account/workspace closure. Phase 55 can be pulled forward after its stated prerequisites. Apply the shared release rules to the selected feature IDs and resolve relevant policy gates. If protected drafts remain blocked, an explicitly online-only internal test can proceed with honest limits; do not advertise offline durability.

**Broader business product — Phases 20–36:** relationships, sales, contracts, planning, estimates/proposals, onboarding, reviewed time, advanced billing, recurring services, retainers, expenses, reconciliation, profitability, knowledge and focus.

**Client and connected workflows — Phases 37–53:** client portal and decisions, verified payments/signatures, collections, provider connections, deterministic automation/API, forms, booking, requests and software maintenance. A missing optional provider does not block an already safe manual workflow; its connected feature stays pending.

**Service expansion — Phases 54–62:** support, privacy/closure, branding, SoloDesk subscriptions, organization policies, multiple sellers, jurisdiction-specific e-invoices, migration and richer public pages. These can move earlier when their prerequisites and business need justify them. Required privacy, support and operational controls already apply to earlier releases; their richer self-service interfaces do not postpone those obligations.

No dates or estimates are invented. Prioritize the first complete client-to-payment journey, then choose the next usable capability based on actual demand. Provider selection, paid provisioning, sending external messages and deployments require their own authorized implementation work.

## Detailed feature phases

Each phase has a product demonstration. “Supporting work” retains the original technical/quality entries under the feature that needs them. Their full contracts and IDs remain available for implementation and coverage tracking. An empty supporting list means the work follows the shared rules and included feature contracts; it does not exempt that phase from verification.

<a id="phase-01"></a>

## Phase 01 — Create an account, sign in and recover access

**User outcome:** A freelancer can create or access an account, recover a failed sign-in, manage sessions and edit personal preferences.

**Build after:** No earlier feature phase; use the existing project and resolve the relevant policy choices below.

### Features delivered

- [ ] <a id="f02-01"></a>**F02.01 — Email and social sign-in** · `S · specified` — Email registration/sign-in under the approved verification policy, plus approved Google/GitHub social sign-in.

  **Workflow:** Use the selected managed Better Auth identity flow; email/password availability and required verification follow Q-08 rather than assuming another auth system. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** A successful approved sign-in yields the intended account; an unverified disallowed identity cannot enter protected services.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07) **Specification:** Documented parent requirement/contract: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

  **Previously reported source status (2 November 2026; not reverified here):** CODE/GATED: Google/GitHub and email SDK paths exist; isolated hosted acceptance and approved policy remain open.

  **Implementation progress — 1 November 2026:**

  - [x] Email registration/password sign-in UI and Managed Better Auth SDK calls are implemented in `components/auth-email-form.tsx`; mocked transport contract tests passed.
  - [x] Google/GitHub initiation and shared in-flight controls are implemented in `components/sign-in.tsx` and `components/auth-interactive-panel.tsx`; mocked initiation contracts passed.
  - [x] Default-off credential capability checks and public UI capability projection are implemented in `lib/auth/capabilities.ts` and the auth catchall; direct managed-provider enforcement still needs hosted proof.
  - [ ] Q-08 policy approval and isolated hosted registration/sign-in/provider-return acceptance remain open; client calls alone do not complete that gate.

- [ ] <a id="f02-02"></a>**F02.02 — Identity verification** · `S · specified` — Verification resend, expiration, already-used challenge and wrong-account recovery states.

  **Workflow:** Show resend, expiry and consumed-proof outcomes without turning a public verification response into an account-existence disclosure. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** Wrong-account, expired and reused verification proof all fail without changing the active identity.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.01](#f02-01) **Specification:** Documented parent requirement/contract: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

  **Previously reported source status (2 November 2026; not reverified here):** CODE/GATED: email challenge UI and verified-session checks exist; real managed verification/recovery evidence is incomplete.

  **Implementation progress — 1 November 2026:**

  - [x] Six-digit verification entry, resend/cooldown/error handling and SDK requests are implemented in `components/auth-email-form.tsx`; leading-zero transport checks passed.
  - [x] Verified, fresh, unexpired own-session checks are implemented in `lib/auth/server.ts` and `lib/profile.ts`; mocked denied-session/profile tests passed.
  - [ ] Real hosted expiry, consumed-code, wrong-account and delivery invariants remain unverified.

- [ ] <a id="f02-03"></a>**F02.03 — Password recovery** · `S · specified` — Password reset/recovery with expiring single-use proof and anti-enumeration responses where password sign-in is enabled.

  **Workflow:** Recovery uses purpose-bound expiring proof only where password access is enabled; retain an understandable route back to normal account entry. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** A consumed reset cannot be reused and reset responses disclose no account membership.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.01](#f02-01) **Specification:** Documented parent requirement/contract: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

  **Previously reported source status (2 November 2026; not reverified here):** CODE/GATED: request/reset forms exist; real reset, social-only account invariants and session revocation remain gated.

  **Implementation progress — 1 November 2026:**

  - [x] Forgot-password request, resend and code-plus-new-password submission are implemented in `components/auth-email-form.tsx`; mocked SDK transport tests passed.
  - [ ] Real single-use reset, anti-enumeration, social-only identity behavior, all-session revocation and Q-08 policy approval remain open.

- [ ] <a id="f02-04"></a>**F02.04 — OAuth callbacks and failure recovery** · `S · specified` — Complete OAuth cancellation, provider failure, callback, trusted-origin and safe-redirect behavior.

  **Workflow:** Handle provider cancellation, error and callback return using validated origins/destinations; no business integration is enabled by social login. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** A hostile return URL is rejected and provider cancellation does not strand the user.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.01](#f02-01) **Specification:** Documented parent requirement/contract: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

  **Previously reported source status (2 November 2026; not reverified here):** CODE/GATED: callback/return handling exists; revalidate provider returns and hostile destinations.

  **Implementation progress — 1 November 2026:**

  - [x] Fixed same-origin callback/error destinations, query normalization, callback-session checks and generic retry markers are implemented in `components/sign-in.tsx`, `lib/site.ts` and `app/(utility)/auth/callback/page.tsx`; local destination/transport tests passed.
  - [ ] Live Google/GitHub cancellation/return and actual managed trusted-origin configuration still need isolated/deployed acceptance.

  **Shell implementation progress — 2 November 2026:**

  - [x] Finite return destinations `/app`, `/app/workspace` and `/app/account` are propagated through auth entry, social initiation and callback code in `lib/site.ts`, auth components and the callback page; local destination/transport tests passed.

- [ ] <a id="f02-06"></a>**F02.06 — Session management** · `S · specified` — Session/device list, current-session identification, individual revoke and revoke-other-sessions controls where supported.

  **Workflow:** Display the current session distinctly and expose supported per-session/other-session revocation with safe device labels. **Rules:** PLT-001–018 require current online identity/authority; contacts and presentation settings cannot grant workspace membership.

  **Done when:** A revoked session cannot perform a new protected mutation from an already-open tab.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.01](#f02-01) **Specification:** Documented parent requirement/contract: [Capability requirements](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#capability-requirements).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: server session checks exist; complete member-facing session list/revoke management is pending.

  **Implementation progress — 1 November 2026:**

  - [x] Fresh server session validation, expiry denial and own-profile session-bound query sealing are implemented in `lib/auth/server.ts` and `lib/profile.ts`; mocked authority tests passed.
  - [ ] A session/device list and individual/other-session revocation controls are not implemented.

- [ ] <a id="f02-07"></a>**F02.07 — Sensitive-action reauthentication** · `S · specified` — Reauthentication for protected credential/ownership/export/closure actions.

  **Workflow:** Before protected credential, transfer, closure or sensitive-export actions, request the reauthentication required by the approved policy. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** A stale proof cannot authorize a different sensitive action or account.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.06](#f02-06) **Specification:** Documented parent requirement/contract: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

- [ ] <a id="f02-08"></a>**F02.08 — Sign-out and account switching** · `S · specified` — Safe sign-out, expired-session recovery and account switching that clear protected views/subscriptions.

  **Workflow:** Sign-out/account switching disposes private subscriptions/views and follows the explicit draft-key retention policy without changing draft ownership. **Rules:** Session expiry and pending draft state can coexist; protected actions require current server authority and honest recovery states.

  **Done when:** Switching identities never unlocks the previous identity's protected draft or cached record.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.06](#f02-06) **Specification:** Documented parent requirement/contract: [Browser connectivity and state contract](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#browser-connectivity-and-state-contract).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: sign-out exists; full account/workspace switching and future draft isolation remain pending.

  **Implementation progress — 1 November 2026:**

  - [x] Account/profile sign-out now delegates to the runtime; own-profile concealment/Realtime disposal remains in `components/live-profile.tsx`. Public-header controls exist separately in `components/site-header-auth.tsx`; their failure path remains a recorded blocker.
  - [ ] Cross-account browser acceptance and the future protected-draft key/retention/account-switch contract remain pending; a gated workspace switcher now exists under F03.02, with cross-account/browser proof pending.

  **Shell implementation progress — 2 November 2026:**

  - [x] Shared shell/profile sign-out inspects returned errors and thrown failures, conceals before request and offers retry; current-source controlled failure/expiry/restore assertions are recorded. Real session revocation, successful sign-out/history and cross-account acceptance remain open.

- [ ] <a id="f02-09"></a>**F02.09 — Personal profile and preferences** · `S · specified` — Profile/name and personal language/timezone/notification preferences with validated updates.

  **Workflow:** Keep personal name, locale, timezone and notice preferences separate from workspace defaults and issued-document language. **Rules:** PLT-001–018 require current online identity/authority; contacts and presentation settings cannot grant workspace membership.

  **Done when:** Changing a personal language cannot reprice an invoice or alter a teammate's preferences.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.01](#f02-01) **Specification:** Documented parent requirement/contract: [Capability requirements](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#capability-requirements).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: own live name/profile and presentation preferences exist; wider personal settings remain pending.

  **Implementation progress — 1 November 2026:**

  - [x] Own name read/update and live profile projection are implemented in `lib/profile.ts`, `app/actions.ts`, `app/api/profile/route.ts` and `components/live-profile.tsx`.
  - [x] Browser preference infrastructure is implemented under partial F04.05; full bilingual/native-journey acceptance remains open.
  - [ ] Personal timezone and notification preference settings/storage remain unbuilt.

  **Shell implementation progress — 2 November 2026:**

  - [x] Dedicated `/app/account` reuses `loadProfile`/`LiveProfile` independently of workspace membership; the shared shell loader projects a narrow account identity in `lib/application.ts`, with mocked loader/profile tests passing.

- [ ] <a id="f02-10"></a>**F02.10 — Authentication abuse controls** · `S · specified` — Bounded login/reset/invite attempts, security-event audit and actionable account-lock/recovery states.

  **Workflow:** Bound public auth/invite/recovery attempts and record redacted security events; thresholds and recovery policy need explicit selection. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** Repeated attempts are bounded without exposing whether a target belongs to a workspace.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F38.06](#f38-06) **Specification:** Documented parent requirement/contract: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL/GATED: local in-flight/cooldown handling exists; actual hosted limits and cross-instance abuse resistance need evidence.

  **Implementation progress — 1 November 2026:**

  - [x] Client-side duplicate-submit locks, pending states and resend cooldowns are implemented in the auth form/panel/social controls.
  - [ ] Hosted challenge/attempt limits, enumeration resistance and shared cross-instance abuse controls still need implementation or verified managed support.

- [ ] <a id="f01-01"></a>**F01.01 — Public landing page** · `S · specified` — Public product landing page with accurate capability descriptions, language/theme controls and account entry points.

  **Workflow:** Visitors read truthful capability descriptions and reach localized account entry; synthetic previews are labeled separately from real workspace content. **Rules:** Distinguish unsaved/local/queued/accepted/conflict/failure, preserve valid input and use real empty/no-match/error states rather than fictional data.

  **Done when:** A visitor can navigate both languages without seeing private records or claims that planned billing already exists.

  **Feature prerequisites:** Existing repository and the common planning/release gates; no feature prerequisite. **Specification:** Documented parent requirement/contract: [Editor and status rules](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#editor-and-status-rules).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: composed landing sections, localized capability/status catalogs, synthetic preview disclosure and public account links exist. Rendered footer/newsletter copy and behavior violate the complete bilingual/truthful-content/link requirements; catalog parity does not test those strings. See the source blockers above.

  **Completion audit — 2 November 2026:**

  - [x] Public landing composition, synthetic preview definitions and account-entry links exist in `components/landing-page.tsx`, `components/landing/` and `lib/site-content.ts`; fresh production build and local catalog contracts pass. This checks the foundation only.
  - [ ] Reconcile public claims/footer destinations and English-only copy; replace or honestly label simulated subscription behavior through authorized implementation work. Complete original 001/002 bilingual/browser/accessibility/content acceptance before checking the parent.

- [ ] <a id="f01-02"></a>**F01.02 — Account entry pages** · `S · specified` — Responsive sign-in/sign-up entry pages, authentication-error states and clear return navigation.

  **Workflow:** Account entry preserves the allowed destination and displays provider/callback failures with an actionable recovery path. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** A failed login leaves the user at a usable entry screen without a false empty account.

  **Feature prerequisites:** [F02.01](#f02-01) **Specification:** Documented parent requirement/contract: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: separate routes, loading/error/retry and finite-return implementation pass scoped local contracts. F02.01 is an unresolved explicit prerequisite; actual provider success/failure returns and complete keyboard/zoom/human acceptance remain unverified.

  **Completion audit — 2 November 2026:**

  - [x] Separate account entry routes, shared loading/retry UI and finite error/return transport contracts are implemented and pass fresh site/auth/header/application tests.
  - [ ] Satisfy F02.01 and real provider/error/return acceptance, complete bilingual state/keyboard/200% zoom and human review; disabled credentials are not a passing credential journey.

<details>
<summary>Supporting work included in this feature phase — 14 tracked entries</summary>

- [ ] <a id="f38-01"></a>**F38.01 — Environment isolation** · `S · specified` — Separate development, preview and production identities, databases, secrets and files.

  **Workflow:** Separate local/preview/production data, auth origins, credentials, storage and provider sandboxes; use synthetic preview records and treat production-derived branches as sensitive. **Rules:** Separate environments/credentials and synthetic preview data; deploy reviewed server-capable builds with compatible migrations and current ingress/auth/cache verification.

  **Done when:** Preview credentials cannot read production or run its callbacks.

  **Feature prerequisites:** Existing repository and the common planning/release gates; no feature prerequisite. **Specification:** Documented parent requirement/contract: [Environments and delivery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#environments-and-delivery).

- [ ] <a id="f38-06"></a>**F38.06 — Distributed rate limits** · `S · specified` — Bound authentication, uploads, exports and jobs across instances.

  **Workflow:** Bound expensive auth/query/file/export/job work across instances and tenants; selected caps/degradation need measured workloads and accountable ownership. **Rules:** Monitor bounded workloads and minimal redacted diagnostics; product analytics/crash uploads are opt-in and provider limits are verified rather than assumed.

  **Done when:** Multiple application instances cannot multiply one tenant's allowed burst unboundedly.

  **Feature prerequisites:** [F38.01](#f38-01) **Specification:** Documented parent requirement/contract: [Quotas and observability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#quotas-and-observability).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: contact limiting is process-local; a shared cross-instance limiter remains pending.

  **Implementation progress — 1 November 2026:**

  - [x] Bounded process-local contact rate limiting is implemented in `lib/contact.ts`.
  - [ ] A shared cross-instance limiter and distributed quota/ingress tests are not implemented.

- [ ] <a id="f38-07"></a>**F38.07 — Security headers and private caching** · `S · specified` — Verify actual HTTPS ingress, CSP, cookies, origins and private response cache policy.

  **Workflow:** Verify deployed HTTPS, cookies/origins, CSP/embedding and private cache behavior at the real ingress, rather than assuming local config proves production protection. **Rules:** Verify deployed identity, ingress, environment isolation, runtime DB policy, recovery and findings; unavailable or stale evidence does not pass.

  **Done when:** A cached authenticated response cannot be served to another identity.

  **Feature prerequisites:** [F38.01](#f38-01) **Specification:** Documented parent requirement/contract: [Before deployment/public exposure](/home/mohamed-s/Desktop/Projects/solor-desk/docs/security/release-checklist.md#before-deploymentpublic-exposure).

- [ ] <a id="f38-08"></a>**F38.08 — Dependency advisory review** · `S · specified` — Match exact lockfile and deployed versions to fresh upstream advisories with findings ownership.

  **Workflow:** Inventory exact source/lockfile/component/runtime versions against fresh advisories at relevant change/release time and keep unavailable checks as owned gaps. **Rules:** Verify deployed identity, ingress, environment isolation, runtime DB policy, recovery and findings; unavailable or stale evidence does not pass.

  **Done when:** An unavailable scanner is recorded as a gap, never a clean result.

  **Feature prerequisites:** Existing repository and the common planning/release gates; no feature prerequisite. **Specification:** Documented parent requirement/contract: [Before deployment/public exposure](/home/mohamed-s/Desktop/Projects/solor-desk/docs/security/release-checklist.md#before-deploymentpublic-exposure); [Complex decisions still open](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#complex-decisions-still-open).

- [ ] <a id="f38-09"></a>**F38.09 — Secret lifecycle** · `S · specified` — Keep server-only secrets with environment separation, rotation and incident revocation.

  **Workflow:** Keep auth/DB/provider secrets server-only with environment separation and reviewed rotation/revocation; restored auth-bearing secrets need special recovery handling. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** Rotated credentials stop working without exposing values in logs or bundles.

  **Feature prerequisites:** [F38.01](#f38-01) **Specification:** Documented parent requirement/contract: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

- [ ] <a id="f37-01"></a>**F37.01 — Data inventory** · `S · specified` — Record collected classes, purpose, storage locations, subprocessors and owners.

  **Workflow:** Maintain reviewed purpose/data-class/provider/location/access/retention inventory as dependencies evolve; new external data sharing needs an updated boundary review. **Rules:** Minimize/redact diagnostics and keep analytics opt-in; support is temporary/scoped and retention/recovery follow reviewed lifecycle decisions.

  **Done when:** A new connector cannot release without its data-sharing inventory entry.

  **Feature prerequisites:** Existing repository and the common planning/release gates; no feature prerequisite. **Specification:** Documented parent requirement/contract: [Privacy, recovery and operations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#privacy-recovery-and-operations).

- [ ] <a id="f37-03"></a>**F37.03 — Retention schedules** · `S · specified` — Apply approved class-specific retention to live data, exports, backups and drafts.

  **Workflow:** Select retention by record/draft/file/index/export/audit/backup class under Q-13 and applicable financial obligations; no universal purge duration is implied. **Rules:** Purge respects legal holds, references, auth dependencies and backup expiry; tombstones prevent resurrection and downloaded copies have no remote-wipe guarantee.

  **Done when:** Retention never silently deletes referenced financial evidence before its allowed date.

  **Feature prerequisites:** [F37.01](#f37-01) **Specification:** Documented parent requirement/contract: [Retention and evidence](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#retention-and-evidence).

- [ ] <a id="f37-04"></a>**F37.04 — Legal holds** · `S · specified` — Restrict deletion for explicitly reviewed records with scope and release history.

  **Workflow:** Record explicit hold scope and release authority before purge; held records and referenced file versions remain protected from ordinary cleanup/closure. **Rules:** Purge respects legal holds, references, auth dependencies and backup expiry; tombstones prevent resurrection and downloaded copies have no remote-wipe guarantee.

  **Done when:** A generic account-close job cannot erase held evidence.

  **Feature prerequisites:** [F37.03](#f37-03) **Specification:** Documented parent requirement/contract: [Retention and evidence](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#retention-and-evidence).

- [ ] <a id="f39-01"></a>**F39.01 — Design system contracts** · `S · specified` — Maintain shadcn components, semantic tokens and documented states in the existing showcase.

  **Workflow:** Maintain shared component/token/variant contracts and current showcase states using DESIGN.md authority; earlier visual recipe colors cannot override the monochrome system. **Rules:** Reuse shared shadcn/Base UI components and semantic tokens with keyboard/focus/RTL; the current monochrome design overrides older visual recipes.

  **Done when:** Shared components work in both themes without bypassing semantics or contrast decisions.

  **Feature prerequisites:** Existing repository and the common planning/release gates; no feature prerequisite. **Specification:** Documented parent requirement/contract: [Components](/home/mohamed-s/Desktop/Projects/solor-desk/DESIGN.md#components).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: tokens, shared primitives and showcase exist; business composite contracts and current behavior evidence remain pending.

  **Implementation progress — 1 November 2026:**

  - [x] Shared shadcn/Base UI primitives, semantic theme tokens and component guidance are implemented in `components/ui/`, `app/globals.css` and `DESIGN.md`.
  - [x] The design-system showcase is implemented in `components/design-system-showcase.tsx` and `app/(utility)/design-system/page.tsx`.
  - [ ] Current documented contrast gaps, full component-state/keyboard/RTL acceptance and future business composites remain open; this is not a completed accessibility release gate.

- [ ] <a id="f39-02"></a>**F39.02 — English and Arabic message parity** · `S · specified` — Localize content, validation, dates, numbers and server errors from stable keys.

  **Workflow:** Translate all shipped UI/server validation/notice/error/onboarding/email/PDF content with stable parameterized keys and unchanged enum/ID/money semantics. **Rules:** Personal UI locale and frozen document locale differ; preserve exact IDs/dates/amounts and preview ambiguous Arabic/Latin numeric input.

  **Done when:** Missing keys and mixed-direction IDs are caught on representative complete journeys.

  **Feature prerequisites:** [F39.01](#f39-01) **Specification:** Documented parent requirement/contract: [Locale and direction contract](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#locale-and-direction-contract).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: two message catalogs and a parity script exist; all future screens/artifacts still need coverage.

  **Implementation progress — 1 November 2026:**

  - [x] English/Arabic message catalogs and the structural parity checker are implemented in `messages/en.json`, `messages/ar.json` and `scripts/check-translations.mjs`; 464 matching key/structure entries plus ICU signatures passed locally in Feature 006 on 2 November 2026.
  - [ ] Complete translation of hardcoded current footer/newsletter/public-header labels and future business errors/notifications/PDFs, plus fluent review and complete-journey RTL acceptance, remain pending; 464-key parity does not check strings outside the catalogs.

- [ ] <a id="f39-03"></a>**F39.03 — RTL layout verification** · `S · specified` — Use logical geometry and reviewed Arabic typography for application and artifacts.

  **Workflow:** Verify root/logical direction, Arabic shaping and mixed-direction names/URLs/IDs in screens and artifacts, using fluent review rather than machine-only signoff. **Rules:** Personal UI locale and frozen document locale differ; preserve exact IDs/dates/amounts and preview ambiguous Arabic/Latin numeric input.

  **Done when:** Long Arabic strings remain usable at narrow width and zoom.

  **Feature prerequisites:** [F39.02](#f39-02) **Specification:** Documented parent requirement/contract: [Locale and direction contract](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#locale-and-direction-contract).

- [ ] <a id="f39-06"></a>**F39.06 — Contrast and reduced-motion verification** · `S · specified` — Verify actual component states, zoom and motion preferences against the design contract.

  **Workflow:** Check actual normal/focus/disabled/error/interactive contrast, reflow/zoom/high-contrast/motion states and retain known palette or human-review gaps as open evidence. **Rules:** Known contrast and fluent-Arabic/human verification gaps remain explicit; token validation or screenshots do not establish full accessibility or release acceptance.

  **Done when:** A supplied token with failed contrast remains a tracked gap until its usage is resolved.

  **Feature prerequisites:** [F39.01](#f39-01) **Specification:** Documented parent requirement/contract: [Validation and known gaps](/home/mohamed-s/Desktop/Projects/solor-desk/DESIGN.md#validation-and-known-gaps).

- [ ] <a id="f39-11"></a>**F39.11 — Release evidence ledger** · `S · specified` — Record build, environment, included phases, exact checks, findings and owners.

  **Workflow:** Record source/build/schema/policy/browser/device/locale, fixture/steps, expected/observed, redacted artifacts, defects and reviewer/date for every claimed accepted phase. **Rules:** Record exact build/schema/policy/browser/locale fixtures and expected versus observed evidence; disabled or unchecked requirements cannot be reported as accepted.

  **Done when:** Unchecked or disabled capabilities cannot be reported as implemented or released.

  **Feature prerequisites:** Existing repository and the common planning/release gates; no feature prerequisite. **Specification:** Documented parent requirement/contract: [End-to-end release proof](/home/mohamed-s/Desktop/Projects/solor-desk/docs/quality/acceptance.md#end-to-end-release-proof).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: dated evidence documents exist; contradictory claims and missing raw/live proof require reconciliation.

- [ ] <a id="f39-14"></a>**F39.14 — Security review and penetration exercise** · `S · specified` — Review introduced trust boundaries and perform scoped authorized negative testing before release.

  **Workflow:** Perform scoped security review/negative testing against applicable controls and deployed build; release-blocking findings stay open until evidenced fix/mitigation and owner review. **Rules:** Verify deployed identity, ingress, environment isolation, runtime DB policy, recovery and findings; unavailable or stale evidence does not pass.

  **Done when:** Release-blocking findings retain ownership until verified mitigation or fix evidence exists.

  **Feature prerequisites:** [F38.08](#f38-08) **Specification:** Documented parent requirement/contract: [Before deployment/public exposure](/home/mohamed-s/Desktop/Projects/solor-desk/docs/security/release-checklist.md#before-deploymentpublic-exposure).

</details>

**Demonstrate before closing this phase:** Complete a supported sign-in, return to the intended page, recover from a failed callback, revoke another session and sign out. Verification/reset links expire and cannot be reused. Record actual managed-provider results separately from local form checks.

<a id="phase-02"></a>

## Phase 02 — Protect an account with stronger sign-in controls

**User outcome:** A freelancer can enable supported second factors or passkeys and safely change a verified identity.

**Build after:** [Phase 01](#phase-01)

### Features delivered

- [ ] <a id="f02-05"></a>**F02.05 — Multi-factor authentication** · `S · specified` — Approved MFA enrollment/challenge/recovery policy, with tested managed-auth support before activation.

  **Workflow:** Enrollment, challenge and recovery use only supported reviewed factors; mandatory-factor and recovery requirements remain Q-08. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** Recovery cannot bypass the selected mandatory-factor policy or reactivate a revoked session.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.02](#f02-02) **Specification:** Documented parent requirement/contract: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

- [ ] <a id="f02-12"></a>**F02.12 — Verified identity changes** · `E · optional expansion` — Verified email changes and social-account linking/unlinking without duplicate-account takeover or lockout.

  **Workflow:** Identity-change and account-linking behavior needs a reviewed managed-auth contract; matching a contact email never proves account ownership. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** Linking from the wrong verified account cannot transfer existing sessions or business ownership.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.02](#f02-02), [F02.07](#f02-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

- [ ] <a id="f02-13"></a>**F02.13 — Passkey and passwordless sign-in** · `E · optional expansion` — Passkey/passwordless login and hardware-backed factor options if supported by the selected managed integration.

  **Workflow:** Passkey/passwordless support is conditional on the selected managed integration and Q-08 recovery policy; no new factor guarantee is inferred. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** An unsupported factor remains unavailable and never removes the last valid recovery route.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.02](#f02-02), [F02.07](#f02-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

**Demonstrate before closing this phase:** Enroll a supported factor, sign in with it, exercise the approved recovery path and reject a stale identity-change challenge. Unsupported managed-auth capabilities remain pending.

<a id="phase-03"></a>

## Phase 03 — Create and manage a private workspace

**User outcome:** A freelancer has a named workspace with explicit roles, permissions, settings and a history of access changes.

**Build after:** [Phase 01](#phase-01)

### Features delivered

- [ ] <a id="f03-01"></a>**F03.01 — Workspace creation** · `S · specified` — Create personal/team workspaces with stable IDs, name, timezone, locales, currency and legal-profile readiness.

  **Workflow:** Create a workspace with immutable identity and scoped legal/presentation defaults; account identity remains owned by Better Auth. **Rules:** PLT-001–018 require current online identity/authority; contacts and presentation settings cannot grant workspace membership.

  **Done when:** A newly created workspace cannot reference another workspace's client or membership.

  **Feature prerequisites:** [F38.04](#f38-04), [F02.01](#f02-01), [F38.06](#f38-06) **Specification:** Documented parent requirement/contract: [Capability requirements](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#capability-requirements).

  **Implementation progress — 1 November 2026 (PARTIAL; parent remains open):**

  - [x] Workspace creation, validated defaults, initial Owner grants and atomic receipt/audit/outbox writes exist in `lib/workspaces.ts`, migration 002, workspace actions and `components/workspace-panel.tsx`.
  - [ ] Real restricted-role migration, current-identity/tenant isolation and creation acceptance remain unproven.

- [ ] <a id="f03-05"></a>**F03.05 — Role templates** · `S · specified` — Owner/Admin/Manager/Contributor/Finance/Viewer templates refined by approved action/resource grants.

  **Workflow:** Translate Owner/Admin/Manager/Contributor/Finance/Viewer templates into explicit capabilities with the final matrix approved under Q-05. **Rules:** Role templates are proposed; current capability plus resource scope controls access, and bulk actions never widen that scope.

  **Done when:** A Finance actor can issue only when granted and cannot promote themselves through a role payload.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.01](#f03-01) **Specification:** Documented parent requirement/contract: [Access templates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#access-templates).

  **Implementation progress — 1 November 2026 (PARTIAL; parent remains open):**

  - [x] Owner/Admin/Member grant templates and role-ceiling checks exist in `lib/workspaces.ts`.
  - [ ] Manager/Contributor/Finance/Viewer templates, resource refinements and the full approved Q-05 matrix remain pending.

- [ ] <a id="f03-06"></a>**F03.06 — Resource and field permissions** · `S · specified` — Project/client scope and separate permissions for costs, finance, exports, integrations and policy changes.

  **Workflow:** Project/client scope and field-sensitive permissions govern costs, exports, finance, integrations and policy changes independently. **Rules:** Role templates are proposed; current capability plus resource scope controls access, and bulk actions never widen that scope.

  **Done when:** A Contributor cannot infer hidden costs from totals, snippets, CSV or attachment access.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.05](#f03-05) **Specification:** Documented parent requirement/contract: [Access templates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#access-templates).

  **Implementation progress — 1 November 2026 (PARTIAL; parent remains open):**

  - [x] Workspace membership/action-grant checks and restricted context/receipt projections exist in `lib/workspaces.ts` and workspace API routes.
  - [ ] Project/client scopes, sensitive business fields, search/count/export/file enforcement and real cross-tenant denial proof remain pending.

  **Completion audit — 2 November 2026:**

  - [x] Current matching workspace-scope persisted read/select/action grants intersect role ceilings before private context/command-receipt replay. Actual imported removed-grant receipt and bounded-choice query regressions pass fresh workspace tests.
  - [ ] Verify the same boundaries with real sessions, revoked grants, restricted roles/alternating pooled tenants and project/client/field/search/export/file scopes; no full authorization completion.

- [ ] <a id="f03-02"></a>**F03.02 — Workspace switching** · `S · specified` — Switch among authorized workspaces with visible context on consequential actions.

  **Workflow:** Show the active workspace on consequential screens and refresh its current grants before loading records or applying actions. **Rules:** Session expiry and pending draft state can coexist; protected actions require current server authority and honest recovery states.

  **Done when:** Switching workspace clears prior subscriptions and cannot reuse stale cost projections.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.01](#f03-01), [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [Browser connectivity and state contract](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#browser-connectivity-and-state-contract).

  **Implementation progress — 1 November 2026 (PARTIAL; parent remains open):**

  - [x] Authorized workspace list/context services, selection actions/cookie and a visible switcher exist in `lib/workspaces.ts`, `app/workspace-actions.ts` and `components/workspace-panel.tsx`.
  - [ ] Local stale-response disposal and runtime selection ownership are corrected as recorded below; real cross-tab/account switching and complete subscription/projection/browser acceptance remain open.

  **Shell implementation progress — 2 November 2026:**

  - [x] Shell workspace switcher, paginated choices, generation-based response disposal and context rechecks exist in `components/workspace-switcher.tsx`, `components/application-runtime.tsx`, `lib/application.ts` and workspace actions; direct list/context/grant contracts passed with mock adapters.

  **Completion audit — 2 November 2026:**

  - [x] Current-account UUID selection and required nonempty/4096-byte compare-before-clear selector contract pass actual imported action tests; the runtime serializes select/clear and re-reads matching context rather than assuming cookie-write success. Controlled delayed-page/member/mutation evidence matches current source.
  - [ ] Complete real cross-tab/account/cookie races, revoked authority and production Next Activity/history/subscription acceptance on an independently verified synthetic target.

- [ ] <a id="f03-09"></a>**F03.09 — Permission audit** · `S · specified` — Membership/grant audit with permitted change summaries and scoped audit export.

  **Workflow:** Expose actor, target, operation, revision and redacted change summary only to permitted audit readers/exporters. **Rules:** PLT-001–018 require current online identity/authority; contacts and presentation settings cannot grant workspace membership.

  **Done when:** An ordinary member cannot edit the grant-change record or export restricted audit fields.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [Capability requirements](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#capability-requirements).

  **Implementation progress — 1 November 2026 (PARTIAL; parent remains open):**

  - [x] Workspace membership and grant mutations write audit records alongside receipts in `lib/workspaces.ts` and migration 002.
  - [ ] Authorized audit-reader views, scoped audit export and real audit immutability/denial proof remain pending.

- [ ] <a id="f03-10"></a>**F03.10 — Capability configuration** · `S · specified` — Feature/settings dependency validation; disable new actions while retaining existing obligations/history.

  **Workflow:** Validate enabled capabilities and their dependencies; disabling future creation must preserve pending obligations, history and export access. **Rules:** PLT-001–018 require current online identity/authority; contacts and presentation settings cannot grant workspace membership.

  **Done when:** Turning off recurrence prevents new allowed generation without hiding old issued invoices.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [Capability requirements](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#capability-requirements).

  **Implementation progress — 1 November 2026 (PARTIAL; parent remains open):**

  - [x] Default-off workspace, invitation and ownership capability switches exist in `lib/auth/capabilities.ts` and are consumed by application code.
  - [ ] Dependency validation and preservation of required reads/history/export when disabling capabilities remain pending; no complete feature-policy lifecycle is established.

<details>
<summary>Supporting work included in this feature phase — 4 tracked entries</summary>

- [ ] <a id="f38-02"></a>**F38.02 — Reviewed database migrations** · `S · specified` — Use controlled expand/contract changes compatible with stale tabs and managed auth ownership.

  **Workflow:** Expand supported reads/schema before new writes, backfill in bounded batches and retire old formats only after compatibility/recovery proof and published window. **Rules:** Expand compatibility before writes and bounded backfill; remove old formats only after the published window, with explicit recovery for failed migration.

  **Done when:** The prior supported build runs safely during rollout and rollback testing.

  **Feature prerequisites:** [F38.01](#f38-01) **Specification:** Documented parent requirement/contract: [Persistence and migrations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#persistence-and-migrations).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: email-delivery and workspace migration SQL exist; controlled application, compatibility and recovery proof remain pending.

  **Implementation progress — 1 November 2026:**

  - [x] Auth-email receipt migration SQL and runtime-grant instructions exist in `migrations/001-email-deliveries.sql`.
  - [x] Workspace/membership/grant/invitation/receipt/audit/outbox schema and runtime/sender role definitions exist in `migrations/002-workspace-platform.sql`, with rollout notes in `migrations/002-workspace-platform.md`.
  - [ ] Migration application is not confirmed here; controlled execution, old-build compatibility and rollback/restore proof remain pending.

  **Completion audit — 2 November 2026:**

  - [x] All three migration CLI probes have 10-second bounds, assert process error/signal before status/output and inspect every stream for the synthetic secret; help/invalid/no-DB and retained ordering/history/lock/TLS/rollback tests pass in supported fresh execution. Runner/migrations unchanged.
  - [ ] Real migration application, restricted-role/transaction/pool effects, stale-build compatibility and rollback/restore acceptance remain unverified; sandbox execution failure stays separately recorded.

- [ ] <a id="f38-03"></a>**F38.03 — Runtime database least privilege** · `S · specified` — Use server-only pooled connections and restricted runtime roles.

  **Workflow:** Use trusted server-only pooled Neon queries with constrained grants/projections; verify pooled tenant isolation and avoid session-level tenant assumptions under pooling. **Rules:** State owner, bounds/index needs, transaction scope, external jobs and recovery; add only concrete patterns and test pooled tenant isolation/concurrency.

  **Done when:** Direct arbitrary table access or tenant reuse cannot bypass the policy boundary.

  **Feature prerequisites:** [F38.02](#f38-02) **Specification:** Documented parent requirement/contract: [Scalability review](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/design-patterns.md#scalability-review); [Tenant and resource authorization](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#tenant-and-resource-authorization).

- [ ] <a id="f38-04"></a>**F38.04 — Transactional command foundation** · `S · specified` — Commit business changes, receipt, audit and outbox atomically.

  **Workflow:** Atomically commit domain effect, expected revision/result receipt, audit and outbox with current actor/scope and stable payload-checked operation identity. **Rules:** Actor derives from verified session; expected revision and workspace/actor/type-scoped operation plus payload digest prevent stale or changed-payload replay.

  **Done when:** A fault between steps leaves neither a partial payment nor an orphan external effect.

  **Feature prerequisites:** [F38.02](#f38-02), [F38.03](#f38-03) **Specification:** Documented parent requirement/contract: [Common request/result envelope](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/api-contracts.md#common-requestresult-envelope).

- [ ] <a id="f37-08"></a>**F37.08 — Audit history viewer** · `S · specified` — Expose scoped actor, event, revision and reason without secrets.

  **Workflow:** Read central actor/workspace/operation/target/revision/time/reason/correlation events through separately scoped audit authority; ordinary members cannot alter them. **Rules:** PLT-001–018 require current online identity/authority; contacts and presentation settings cannot grant workspace membership.

  **Done when:** Ordinary members cannot alter or delete audit events.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04) **Specification:** Documented parent requirement/contract: [Capability requirements](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#capability-requirements).

</details>

**Demonstrate before closing this phase:** Create two workspaces and switch between them. A direct request using the other workspace’s record ID returns no private data. A failed transaction leaves no partial record or audit/outbox mismatch.

<a id="phase-04"></a>

## Phase 04 — Invite teammates and control their access

**User outcome:** An owner can invite the intended recipient, assign bounded access, revoke it and transfer ownership without orphaning the workspace.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03)

### Features delivered

- [ ] <a id="f03-03"></a>**F03.03 — Recipient-bound invitations** · `S · specified` — Invite a named recipient with role, resource scope and expiry; accept only with the intended identity.

  **Workflow:** Bind each invitation to its intended recipient, scope, expiry and one-time acceptance; a client contact is never implicitly a member. **Rules:** PLT-001–018 require current online identity/authority; contacts and presentation settings cannot grant workspace membership.

  **Done when:** A different account or a second acceptance cannot acquire the invitation's grants.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.06](#f03-06), [F02.02](#f02-02) **Specification:** Documented parent requirement/contract: [Capability requirements](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#capability-requirements).

  **Implementation progress — 1 November 2026 (PARTIAL; parent remains open):**

  - [x] Recipient-bound issue/accept services, expiry/token checks, encrypted delivery payloads and fragment-to-memory acceptance UI exist in `lib/workspaces.ts`, `lib/workspace-invitations.ts` and `components/workspace-invitation.tsx`.
  - [ ] Resource-specific invitation scope, independent key custody, an operational sender and real recipient/replay/delivery acceptance remain pending; the dispatch script currently only self-checks/validates manifest-file presence and exits.

  **Completion audit — 2 November 2026:**

  - [x] Early memory-only proof capture scrubs before decode, bounds raw/decoded proof, requires explicit gated acceptance and retains original command proof/ID across retry; recorded mounted malformed/oversized/disabled/hash-retarget assertions match current source.
  - [ ] Real recipient/expiry/replay/streamed-redirect and sender/delivery proof remains open; client proof handling does not establish service acceptance or dispatch.

- [ ] <a id="f03-04"></a>**F03.04 — Invitation management** · `S · specified` — Pending-invite list, resend with old-token invalidation, revoke and already-accepted handling.

  **Workflow:** List pending invitations and support reviewed resend/revoke behavior; replacement proof invalidates the old invitation token. **Rules:** PLT-001–018 require current online identity/authority; contacts and presentation settings cannot grant workspace membership.

  **Done when:** A resent or revoked token cannot later create membership.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.03](#f03-03) **Specification:** Documented parent requirement/contract: [Capability requirements](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#capability-requirements).

  **Implementation progress — 1 November 2026 (PARTIAL; parent remains open):**

  - [x] Invitation listing, resend with token generation rotation, revoke and corresponding controls exist in workspace services/actions and `components/workspace-panel.tsx`.
  - [ ] Real PostgreSQL resend/revoke/accept races and browser acceptance remain unproven.

- [ ] <a id="f03-07"></a>**F03.07 — Membership revocation** · `S · specified` — Member grant changes/removal with immediate current-authority checks and affected-work review.

  **Workflow:** Review affected work on member removal and invalidate authorized projections/subscriptions; record the permission change as an audited event. **Rules:** Role templates are proposed; current capability plus resource scope controls access, and bulk actions never widen that scope.

  **Done when:** A revoked editor's pending write fails without deleting previously accepted records.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.06](#f03-06), [F02.06](#f02-06) **Specification:** Documented parent requirement/contract: [Access templates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#access-templates).

  **Implementation progress — 1 November 2026 (PARTIAL; parent remains open):**

  - [x] Role-change, removal and leave services plus member-management controls and audit writes exist in `lib/workspaces.ts`, workspace actions and `components/workspace-panel.tsx`.
  - [ ] Affected-work review, projection/subscription invalidation and real revoked-member pending-write acceptance remain pending.

- [ ] <a id="f03-08"></a>**F03.08 — Workspace ownership transfer** · `S · specified` — Ownership transfer, leave-workspace flow and transaction-safe protection of the final owner.

  **Workflow:** Transfer ownership online with required reauthentication and prevent the final owner from being removed through concurrent operations. **Rules:** Role templates are proposed; current capability plus resource scope controls access, and bulk actions never widen that scope.

  **Done when:** Two simultaneous owner-removal attempts cannot leave an ownerless workspace.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.06](#f03-06), [F02.07](#f02-07) **Specification:** Documented parent requirement/contract: [Access templates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#access-templates).

  **Implementation progress — 1 November 2026 (PARTIAL; parent remains open):**

  - [x] Ownership transfer/leave code, a reauthentication guard and active-owner checks exist in `lib/workspaces.ts` and migration 002, with confirmation controls in `components/workspace-panel.tsx`.
  - [ ] Actual managed step-up support and concurrent final-owner retention proof remain gated; source checks and mocked tests do not establish live acceptance.

- [ ] <a id="f03-12"></a>**F03.12 — Member groups** · `E · optional expansion` — Member groups/project teams for assigning reviewed grant bundles; groups never bypass per-resource policy.

  **Workflow:** Group-based grant bundles need a separate approved specification; their members still pass current per-resource/action authorization. **Rules:** Role templates are proposed; current capability plus resource scope controls access, and bulk actions never widen that scope.

  **Done when:** A group assignment cannot grant a capability the acting administrator cannot delegate.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.06](#f03-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Access templates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#access-templates).

- [ ] <a id="f03-14"></a>**F03.14 — Temporary contractor access** · `E · optional expansion` — Temporary contractor access with explicit expiry, review reminders and reassignment/offboarding checklist.

  **Workflow:** Temporary access needs explicitly approved expiry and reassignment rules rather than a guessed contractor duration. **Rules:** Role templates are proposed; current capability plus resource scope controls access, and bulk actions never widen that scope.

  **Done when:** Once the selected expiry is reached, direct protected requests fail and historic time retains its actor.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.03](#f03-03), [F03.07](#f03-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Access templates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#access-templates).

- [ ] <a id="f03-15"></a>**F03.15 — Permission simulator** · `E · optional expansion` — Permission simulator showing the permitted actions of a selected role without impersonating its identity.

  **Workflow:** A permission preview is a proposed explanatory view, not identity impersonation or a way to execute the selected role's actions. **Rules:** Role templates are proposed; current capability plus resource scope controls access, and bulk actions never widen that scope.

  **Done when:** Testing a role in the preview cannot issue an invoice or mutate grants.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.06](#f03-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Access templates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#access-templates).

<details>
<summary>Supporting work included in this feature phase — 1 tracked entries</summary>

- [ ] <a id="f39-08"></a>**F39.08 — Tenant denial tests** · `S · specified` — Use at least two workspaces, all selected roles and direct service calls.

  **Workflow:** Exercise two tenants, selected roles, direct invocation and revoked grants across rows/fields/counts/search/files/exports/notices/jobs rather than UI visibility alone. **Rules:** Deny by default and recheck membership, resource and action at all reads, counts, exports, files, jobs and side effects.

  **Done when:** Reads, counts, exports, jobs and files reject revoked or wrong-resource authority.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [Tenant and resource authorization](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#tenant-and-resource-authorization).

</details>

**Demonstrate before closing this phase:** Invite a verified teammate, cancel or expire another invitation, revoke an open session’s workspace access and race two last-owner removals. The workspace always retains an authorized owner.

<a id="phase-05"></a>

## Phase 05 — Navigate the workspace and organize a personal home

**User outcome:** Members can navigate workspace and account pages, use reliable browser links and choose language and theme with accessible controls.

**Build after:** [Phase 03](#phase-03)

### Features delivered

- [ ] <a id="f04-01"></a>**F04.01 — Responsive navigation** · `S · specified` — Responsive desktop/sidebar and mobile navigation with workspace switcher and clear current location.

  **Workflow:** Compose shared responsive navigation with discoverable workspace, search, notices and timer controls; preserve ordinary browser navigation. **Rules:** Keep workspace/search/timer/notices/save/language discoverable; deep links authenticate and every drag/shortcut action has a visible accessible alternative.

  **Done when:** A keyboard user reaches the same destination on narrow and wide layouts.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [Navigation and interaction](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#navigation-and-interaction).

  **Shell implementation progress — 2 November 2026:**

  - [x] Dedicated app layout/template and shared sidebar/top bar wrap real `/app`, `/app/workspace` and `/app/account` destinations, with active links/breadcrumbs and no public SiteHeader or marketing footer in those pages.
  - [x] Shared Sidebar supports expanded/icon modes and a mobile Sheet; direction-aware placement, skip link, account menu and language/theme controls exist in `components/application-shell.tsx` and `components/ui/`.
  - [ ] Controlled Chrome drawer/focus, RTL/media and 36 viewport/theme/language checks pass in Feature 006; actual authenticated Next history, browser200%zoom, full-state/cross-engine and human acceptance remain unproven. Search/notices/timer navigation integrations remain pending under their own features; no dead controls were added for them.

- [ ] <a id="f04-05"></a>**F04.05 — Theme and language preferences** · `S · specified` — Light/Dark/System themes, English/Arabic switching, logical RTL layout and isolated mixed-direction IDs.

  **Workflow:** Use the current Light/Dark/System tokens and personal English/Arabic preference; isolate mixed-direction emails, IDs and numeric meaning. **Rules:** Personal UI locale and frozen document locale differ; preserve exact IDs/dates/amounts and preview ambiguous Arabic/Latin numeric input.

  **Done when:** Language or theme changes leave stored amounts, identifiers and issued snapshots unchanged.

  **Feature prerequisites:** Existing shared UI tokens and public/account locale routing; workspace authorization/navigation are needed only when future workspace screens consume these preferences. **Specification:** Documented parent requirement/contract: [Locale and direction contract](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#locale-and-direction-contract).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: locale/theme parser/handler/routing, semantic CSS and direction infrastructure pass local contracts; controlled shell media/RTL results are attributable to current source. Complete public/account translation and native preference/destination/history/dirty-form acceptance remain open. Future screens/artifacts must reuse the unchanged full contract.

  **Completion audit — 2 November 2026:**

  - [x] Existing locale/theme validation, exact-origin bounded preference handler, destination transport, catalog ICU and current-source controlled shell System/RTL checks are complete for their stated local/component scope.
  - [ ] Finish hardcoded current copy and actual native language/theme transitions with input/destination/context preservation, full mixed-direction/zoom/browser/human acceptance and future document-snapshot integration. Do not equate parity or mocked submit with a complete preference journey.

- [ ] <a id="f04-06"></a>**F04.06 — Accessible shared interactions** · `S · specified` — Accessible tables/lists/forms/dialogs, focus management, touch targets, reduced motion and non-drag alternatives.

  **Workflow:** Retain shared shadcn semantics for fields/tables/dialogs; provide focus restoration, readable errors and a non-drag path for each action. **Rules:** Target WCAG 2.2 AA with keyboard/focus/reader/contrast/reflow/motion checks; automated results alone do not establish conformance.

  **Done when:** Keyboard-only completion, 320 CSS-pixel reflow and 200% zoom retain labels and actions.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.01](#f04-01) **Specification:** Documented parent requirement/contract: [Accessibility acceptance](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#accessibility-acceptance).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: shared UI primitives exist; full business interaction/a11y acceptance remains open.

  **Implementation progress — 1 November 2026:**

  - [x] Reusable button/field/input/alert/avatar/menu/skeleton primitives and current auth loading states are implemented in `components/ui/` and `components/auth-skeleton.tsx`.
  - [ ] Business tables/dialogs, full non-drag journeys, assistive-technology, zoom/reflow and contrast acceptance remain open.

  **Shell implementation progress — 2 November 2026:**

  - [x] Shared Sidebar, Sheet, Breadcrumb, Tooltip and Collapsible primitives plus shell loading skeletons are implemented; accessible names, skip-link and modal semantics exist in source. Browser/manual accessibility acceptance is still required.

- [ ] <a id="f04-08"></a>**F04.08 — Recoverable error states** · `S · specified` — Clear validation/read/save/permission/network/quota/unknown-outcome states with recoverable input.

  **Workflow:** Resolve stable redacted error codes into localized field/recovery messages and preserve valid input after rejection or service failure. **Rules:** Return stable redacted codes and recovery actions, preserve input, check unknown outcomes and never leak inaccessible objects or raw exceptions.

  **Done when:** A validation failure focuses the relevant field and does not discard the rest of the edit.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.01](#f04-01) **Specification:** Documented parent requirement/contract: [Error taxonomy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/api-contracts.md#error-taxonomy).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: auth/profile/contact and shell context states exist; full business error/recovery states remain pending.

  **Implementation progress — 1 November 2026:**

  - [x] Auth validation/pending/retry and profile unavailable/denied/save feedback are implemented in `components/auth-email-form.tsx`, `components/auth-entry-page.tsx`, the account page and `components/live-profile.tsx`.
  - [ ] Shell in-memory recovery/immutable retry exists as recorded below; complete workspace/domain conflict, quota and authoritative unknown-commit reconciliation remain open.

  **Shell implementation progress — 2 November 2026:**

  - [x] `lib/application.ts` and the shell runtime/overview model disabled, empty-choice, unselected, checking, restricted and unavailable workspace states; mocked loader checks cover ready/unselected/restricted/disabled and unauthenticated denial.

  **Completion audit — 2 November 2026:**

  - [x] Real profile/create/settings/invite forms register with confirm-all-before-discard; recoverable edits remain in memory and explicit uncertain-command retry retains original operation/intent/target. Inspected current source and attributable controlled cancellation/failed-save/retry records support this limited slice.
  - [ ] Complete actual Next/native navigation, identity-loss/conflict/unknown-commit reconciliation and broader domain recovery. No persistent-save or guaranteed unload-prompt claim.

- [ ] <a id="f04-09"></a>**F04.09 — Browser navigation and deep links** · `S · specified` — Standard browser Back/Forward, deep links and refresh recovery with current permission checks.

  **Workflow:** HTTPS deep links resolve current account/workspace/resource scope and support refresh/Back/Forward without trusting route visibility as authorization. **Rules:** Keep workspace/search/timer/notices/save/language discoverable; deep links authenticate and every drag/shortcut action has a visible accessible alternative.

  **Done when:** Reopening an old resource URL after revocation shows no protected data.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.01](#f04-01) **Specification:** Documented parent requirement/contract: [Navigation and interaction](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#navigation-and-interaction).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: public/account and finite app child routes exist; business-resource deep links and real revoked-access/history acceptance remain pending.

  **Implementation progress — 1 November 2026:**

  - [x] Allowed public/account destinations, locale/theme rewriting, callback normalization and protected profile route checks are implemented in `lib/site.ts`, `proxy.ts` and the existing account routes; local destination-denial tests passed.
  - [ ] Business-resource deep links and revoked-resource browser-history acceptance remain pending; finite app child routes now exist as recorded below.

  **Shell implementation progress — 2 November 2026:**

  - [x] Finite app child destinations and destination-preserving auth/preference routes are implemented in `lib/site.ts`, `proxy.ts`, auth/callback callers and nested app pages; destination-denial and locale/ICU contracts passed locally.
  - [x] Session-expiry, pagehide/pageshow/focus rechecks and private-state concealment code exists in `components/application-runtime.tsx`; real history/BFCache, revoked-access and delayed-response acceptance remains pending.

  **Completion audit — 2 November 2026:**

  - [x] Actual imported preference/callback handlers explicitly clear fragments on bounded success/failure exits; finite destination/hostile-return/origin/body tests pass fresh local checks. Related auth completion/proxy callers retain explicit fragment-clearing exits.
  - [ ] Real sign-in/preference/streamed redirect, direct/refresh/Back/Forward/Activity and revoked-resource browser acceptance remain open; controlled navigation mocks cannot close this parent.

- [ ] <a id="f04-12"></a>**F04.12 — Guided onboarding** · `E · optional expansion` — Contextual onboarding tips, dismissible checklists and a keyboard-shortcut reference.

  **Workflow:** Onboarding guidance explains real limits and recoverable states; completion of a tip never acts as a financial approval or policy selection. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** Dismissing guidance cannot hide an unresolved storage or permissions error.

  **Feature prerequisites:** [F03.06](#f03-06), [F03.01](#f03-01), [F04.01](#f04-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f04-13"></a>**F04.13 — Installable web shortcuts** · `E · optional expansion` — Installable web manifest/app shortcuts where supported; offline behavior remains limited to the approved contract.

  **Workflow:** A web manifest/shortcut is an optional convenience with no native-process, background-job or durable-offline guarantee. **Rules:** Refresh identity, grants, revisions and receipts after tab return; suspended/closed pages cannot provide durable jobs or financial authority.

  **Done when:** Installing the shortcut cannot bypass session checks or enable unproved browser persistence.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.01](#f04-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Online authority and browser limits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#online-authority-and-browser-limits).

<details>
<summary>Supporting work included in this feature phase — 1 tracked entries</summary>

- [ ] <a id="f39-13"></a>**F39.13 — Usability validation** · `E · optional expansion` — Observe representative freelancers and small teams on critical bilingual journeys.

  **Workflow:** User research remains proposed observed task evidence from representative bilingual workflows, with consent/privacy and actual findings instead of invented interview results. **Rules:** Record exact build/schema/policy/browser/locale fixtures and expected versus observed evidence; disabled or unchecked requirements cannot be reported as accepted.

  **Done when:** Record task completion/problems as actual research, without invented interview evidence.

  **Feature prerequisites:** [F04.01](#f04-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [End-to-end release proof](/home/mohamed-s/Desktop/Projects/solor-desk/docs/quality/acceptance.md#end-to-end-release-proof).

</details>

**Demonstrate before closing this phase:** Use the sidebar, browser Back/Forward, a deep link and keyboard navigation in English and Arabic on a narrow screen. Failed pages offer a usable retry and preserve valid input; unavailable business pages do not display fictional records.

<a id="phase-06"></a>

## Phase 06 — Manage clients and their contacts

**User outcome:** A freelancer can keep a searchable client directory with contacts, business preferences and archive/restore.

**Build after:** [Phase 03](#phase-03), [Phase 04](#phase-04), [Phase 05](#phase-05)

### Features delivered

- [ ] <a id="f07-01"></a>**F07.01 — Client directory** · `S · specified` — Organization/individual client records with display/legal/billing names, addresses, country and optional registration IDs.

  **Workflow:** Create organization/individual records from a nonblank display name, then add legal identity, billing address, country and optional identifiers. **Rules:** Referenced parties archive rather than disappear; duplicates are suggestions, and merge needs atomic links plus proven backup or reversible journal.

  **Done when:** Renaming a client updates active pickers while an issued invoice retains its original party snapshot.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04) **Specification:** Documented parent requirement/contract: [CRM-001 — Clients, contacts, and relationship integrity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-001--clients-contacts-and-relationship-integrity).

- [ ] <a id="f07-02"></a>**F07.02 — Client business preferences** · `S · specified` — Currency/language/timezone/payment-term preferences, owner, tags and internal notes.

  **Workflow:** Store client currency, locale, timezone, payment-term preference, owner, tags and internal notes as defaults for future explicit choices. **Rules:** Referenced parties archive rather than disappear; duplicates are suggestions, and merge needs atomic links plus proven backup or reversible journal.

  **Done when:** Changing a default cannot alter an accepted proposal or issued total.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.01](#f07-01) **Specification:** Documented parent requirement/contract: [CRM-001 — Clients, contacts, and relationship integrity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-001--clients-contacts-and-relationship-integrity).

- [ ] <a id="f07-03"></a>**F07.03 — Client contacts** · `S · specified` — Multiple contacts and addresses, active/inactive status, and separate billing/delivery/decision-maker roles.

  **Workflow:** Maintain contact roles and active state, including separate billing, delivery and decision-maker relationships rather than one universal recipient. **Rules:** Referenced parties archive rather than disappear; duplicates are suggestions, and merge needs atomic links plus proven backup or reversible journal.

  **Done when:** Inactivating a contact preserves referenced historical decisions and document recipients.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.01](#f07-01) **Specification:** Documented parent requirement/contract: [CRM-001 — Clients, contacts, and relationship integrity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-001--clients-contacts-and-relationship-integrity).

- [ ] <a id="f07-04"></a>**F07.04 — Shared contact relationships** · `S · specified` — Contacts shared across client records without treating matching email as membership or identity proof.

  **Workflow:** Allow a contact to relate to multiple clients without deriving application identity, portal access or membership from an email match. **Rules:** Referenced parties archive rather than disappear; duplicates are suggestions, and merge needs atomic links plus proven backup or reversible journal.

  **Done when:** Two clients sharing an email remain separate permitted business records.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.03](#f07-03) **Specification:** Documented parent requirement/contract: [CRM-001 — Clients, contacts, and relationship integrity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-001--clients-contacts-and-relationship-integrity).

- [ ] <a id="f07-06"></a>**F07.06 — Client archive and restore** · `S · specified` — Archive/restore with active-work/timer/draft impact preview and preserved historical snapshots.

  **Workflow:** Archive/restore explicitly with affected projects, timers, drafts and future reminders reviewed; retain original lifecycle state and historical documents. **Rules:** Referenced parties archive rather than disappear; duplicates are suggestions, and merge needs atomic links plus proven backup or reversible journal.

  **Done when:** Referenced clients cannot be hard-deleted through the archive action.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.01](#f07-01) **Specification:** Documented parent requirement/contract: [CRM-001 — Clients, contacts, and relationship integrity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-001--clients-contacts-and-relationship-integrity).

- [ ] <a id="f07-07"></a>**F07.07 — Client relationship summary** · `S · specified` — Client detail tabs for activity, opportunities, projects, documents and permitted balances.

  **Workflow:** Client tabs aggregate only permitted linked activity, opportunities, delivery and balances; each total links to its authorized source. **Rules:** Referenced parties archive rather than disappear; duplicates are suggestions, and merge needs atomic links plus proven backup or reversible journal.

  **Done when:** Project-only access reveals minimum contact fields and no hidden receivable totals.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.01](#f07-01) **Specification:** Documented parent requirement/contract: [CRM-001 — Clients, contacts, and relationship integrity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-001--clients-contacts-and-relationship-integrity).

- [ ] <a id="f07-12"></a>**F07.12 — Client segmentation** · `E · optional expansion` — Flexible segmentation and saved account lists using approved client custom fields.

  **Workflow:** Segmentation is an extension over existing tags/fields; any new client custom-field schema needs a reviewed spec before use. **Rules:** Referenced parties archive rather than disappear; duplicates are suggestions, and merge needs atomic links plus proven backup or reversible journal.

  **Done when:** A saved segment cannot expose a restricted client through its count.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.01](#f07-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-001 — Clients, contacts, and relationship integrity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-001--clients-contacts-and-relationship-integrity).

- [ ] <a id="f07-13"></a>**F07.13 — Client organization hierarchy** · `E · optional expansion` — Client hierarchy/parent-company links and separate branch billing profiles without merging legal history.

  **Workflow:** Parent-company/branch relationships remain proposed; separate legal billing identities must not collapse existing invoices into a new party. **Rules:** Referenced parties archive rather than disappear; duplicates are suggestions, and merge needs atomic links plus proven backup or reversible journal.

  **Done when:** Reparenting an account cannot change the seller/customer snapshot of a historic document.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.01](#f07-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-001 — Clients, contacts, and relationship integrity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-001--clients-contacts-and-relationship-integrity).

- [ ] <a id="f04-07"></a>**F04.07 — Saved record views** · `S · specified` — Saved views, explicit filters, stable sort/pagination and distinction between empty data and no matches.

  **Workflow:** Persist filters, sorting, grouping and presentation rather than duplicating records; distinguish a true empty workspace from zero matches. **Rules:** Views contain the same permitted records; saved views store configuration, bulk failures identify exact rows and keyboard alternatives accompany dragging.

  **Done when:** A no-match view retains its filter summary and a clear-reset action.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.01](#f04-01) **Specification:** Documented parent requirement/contract: [WRK-004 — Views and filters](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-004--views-and-filters).

<details>
<summary>Supporting work included in this feature phase — 7 tracked entries</summary>

- [ ] <a id="f05-05"></a>**F05.05 — Command receipts and deduplication** · `S · specified` — Stable operation IDs and digest checks that reject reused IDs with changed payloads.

  **Workflow:** Scope write keys by workspace, actor and operation type and retain a digest of the submitted payload. **Rules:** Actor derives from verified session; expected revision and workspace/actor/type-scoped operation plus payload digest prevent stale or changed-payload replay.

  **Done when:** Reusing a key with changed content is rejected without modifying the earlier accepted result.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04) **Specification:** Documented parent requirement/contract: [Common request/result envelope](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/api-contracts.md#common-requestresult-envelope).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: auth-email and workspace command receipts exist; broader domain adoption and live replay/atomicity proof remain pending.

  **Implementation progress — 1 November 2026:**

  - [x] Auth-email event-ID/hash receipts reject changed payloads and deduplicate matching success in `lib/auth/email-webhook.ts`; mocked receipt/reconciliation tests passed.
  - [x] Workspace command intent digests, actor/operation receipts, revision checks and transactional domain/audit/outbox writes exist in `lib/workspaces.ts` and migration 002; mocked creation/replay contracts passed.
  - [ ] Real PostgreSQL concurrency, replay under changed authority and adoption by future business domains remain pending.

- [ ] <a id="f05-06"></a>**F05.06 — Revision conflicts** · `S · specified` — Revision-checked submissions and authorized local/base/server conflict comparison.

  **Workflow:** Compare permitted base/local/server values against expected revisions and preserve both same-field candidates for explicit resolution. **Rules:** Same-key changed payload is rejected; resolve lost replies through receipts, preserve same-field candidates and never merge financial postings.

  **Done when:** Two edits to one description cannot silently overwrite each other.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [Submission, refresh and conflicts](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#submission-refresh-and-conflicts).

- [ ] <a id="f05-10"></a>**F05.10 — Multi-tab revisions** · `S · specified` — Multi-tab coordination through server revisions; local channel hints remain advisory.

  **Workflow:** Use server revision/uniqueness checks for multiple tabs; local channels only prompt refresh and cannot decide financial or timer ownership. **Rules:** Same-key changed payload is rejected; resolve lost replies through receipts, preserve same-field candidates and never merge financial postings.

  **Done when:** Two isolated tabs still cannot create two authoritative timers by missing a local signal.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [Submission, refresh and conflicts](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#submission-refresh-and-conflicts).

- [ ] <a id="f05-11"></a>**F05.11 — Stale schema and tombstones** · `S · specified` — Tombstone/stale-schema handling that prevents deleted-record resurrection and blind old-command replay.

  **Workflow:** Tombstones and supported schema windows stop stale edits from recreating deleted records; old formats require reviewed refresh/import. **Rules:** Same-key changed payload is rejected; resolve lost replies through receipts, preserve same-field candidates and never merge financial postings.

  **Done when:** An old offline edit cannot silently resurrect a purged or archived financial reference.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [Submission, refresh and conflicts](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#submission-refresh-and-conflicts).

- [ ] <a id="f05-12"></a>**F05.12 — Revocation refresh** · `S · specified` — Permission downgrade/revocation refresh for views, queries, subscriptions and pending submissions.

  **Workflow:** Refresh current scope in views, subscriptions and pending commands; redact conflict candidates the member no longer has permission to inspect. **Rules:** Deny by default and recheck membership, resource and action at all reads, counts, exports, files, jobs and side effects.

  **Done when:** A downgraded member cannot read a formerly visible private-rate candidate in the conflict inbox.

  **Feature prerequisites:** [F03.06](#f03-06), [F03.07](#f03-07), [F05.10](#f05-10) **Specification:** Documented parent requirement/contract: [Tenant and resource authorization](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#tenant-and-resource-authorization).

- [ ] <a id="f39-09"></a>**F39.09 — Recovery and fault tests** · `S · specified` — Inject lost responses, DB/storage/provider outages and stale browser revisions.

  **Workflow:** Inject lost replies and DB/auth/blob/provider failures with named fixtures; compare observed source/receipt states rather than inferring recovery from a passing build. **Rules:** Record exact build/schema/policy/browser/locale fixtures and expected versus observed evidence; disabled or unchecked requirements cannot be reported as accepted.

  **Done when:** Failures preserve accepted data and never invent success or duplicate money.

  **Feature prerequisites:** [F38.04](#f38-04) **Specification:** Documented parent requirement/contract: [End-to-end release proof](/home/mohamed-s/Desktop/Projects/solor-desk/docs/quality/acceptance.md#end-to-end-release-proof).

- [ ] <a id="f39-12"></a>**F39.12 — Compatibility tests** · `S · specified` — Verify declared schema/API windows for stale tabs and queued jobs.

  **Workflow:** Test old supported tab/contracts and durable jobs through staged migrations, unknown protocol versions and forward/rollback boundaries without deleting pending data. **Rules:** Expand compatibility before writes and bounded backfill; remove old formats only after the published window, with explicit recovery for failed migration.

  **Done when:** Old contracts fail safely or remain compatible instead of corrupting new records.

  **Feature prerequisites:** [F38.02](#f38-02) **Specification:** Documented parent requirement/contract: [Persistence and migrations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#persistence-and-migrations).

</details>

**Demonstrate before closing this phase:** Create a client and two differently scoped contacts, edit a default, archive and restore the client. Retry a lost save response once and resolve a stale edit without duplicate records. Historical issued parties remain unchanged once invoicing is available.

<a id="phase-07"></a>

## Phase 07 — Create client projects and track their lifecycle

**User outcome:** Members can start a client project, see its status, pin it, review a portfolio and close or reopen it safely.

**Build after:** [Phase 03](#phase-03), [Phase 05](#phase-05), [Phase 06](#phase-06)

### Features delivered

- [ ] <a id="f12-01"></a>**F12.01 — Project lifecycle** · `S · specified` — Project create/edit lifecycle with client, owner/members, timezone, dates and explicit permissions.

  **Workflow:** Create a client-linked or explicitly internal project with title, owner/grants, timezone, dates, billing context and planned/active/on-hold/completed state. **Rules:** Project lifecycle and archive differ; completion reviews unresolved work and an archived project rejects new work until restored.

  **Done when:** An archived project rejects new work and proposal retry returns the original created project.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04) **Specification:** Documented parent requirement/contract: [WRK-001 — Project creation and lifecycle](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-001--project-creation-and-lifecycle).

- [ ] <a id="f12-02"></a>**F12.02 — Project overview** · `S · specified` — Project summary, status/health, linked commercial documents and work/time/finance tabs filtered by grants.

  **Workflow:** Compose project tabs from authorized work/time/finance projections; summary status is not permission to expose private source fields. **Rules:** Project lifecycle and archive differ; completion reviews unresolved work and an archived project rejects new work until restored.

  **Done when:** A Contributor can read assigned work without receiving restricted profitability props.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.01](#f12-01) **Specification:** Documented parent requirement/contract: [WRK-001 — Project creation and lifecycle](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-001--project-creation-and-lifecycle).

- [ ] <a id="f12-05"></a>**F12.05 — Project portfolio** · `S · specified` — Project portfolio filters, delivery risks, issues/decisions and explainable health overrides.

  **Workflow:** Filter permitted projects by client/owner/health/stage/target period and link risks/issues/decisions to supporting work. **Rules:** Health/risk claims expose sources and assumptions; missing dates are not on-time delivery and overrides carry reason/expiry.

  **Done when:** A missing due date does not appear as on-time delivery.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.01](#f12-01) **Specification:** Documented parent requirement/contract: [WRK-013 — Portfolio, risks and decision records](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-013--portfolio-risks-and-decision-records).

- [ ] <a id="f12-07"></a>**F12.07 — Project closure and recovery** · `S · specified` — Project archive/restore/transfer/closure and impact review for timers, allocated time and pending obligations.

  **Workflow:** Preview member/task/timer/review/billing effects when archiving, closing or transferring; retain referenced historical identity and documents. **Rules:** Moves preview client/currency/billing effects; allocated contradictions block moves, cross-workspace changes use reviewed import and identity history survives.

  **Done when:** Member removal requires reassignment review without deleting their time/audit actor.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.01](#f12-01) **Specification:** Documented parent requirement/contract: [WRK-014 — Archive, transfer and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-014--archive-transfer-and-recovery).

- [ ] <a id="f12-10"></a>**F12.10 — Program grouping** · `E · optional expansion` — Program/project grouping with rolled-up status and currency-safe budget summaries.

  **Workflow:** Program grouping is proposed portfolio organization; rollups inherit current project grants and separate currencies/financial bases. **Rules:** Health/risk claims expose sources and assumptions; missing dates are not on-time delivery and overrides carry reason/expiry.

  **Done when:** A group total cannot reveal a hidden project or add unlike currencies.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.05](#f12-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-013 — Portfolio, risks and decision records](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-013--portfolio-risks-and-decision-records).

- [ ] <a id="f12-12"></a>**F12.12 — Project risk scoring** · `E · optional expansion` — Project health checklists and configurable risk scoring with visible formula/override.

  **Workflow:** Any proposed score must name rules, source age and reason/expiry for overrides, consistent with documented explainable health. **Rules:** Health/risk claims expose sources and assumptions; missing dates are not on-time delivery and overrides carry reason/expiry.

  **Done when:** Missing inputs show unknown coverage instead of a confident score.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.01](#f12-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-013 — Portfolio, risks and decision records](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-013--portfolio-risks-and-decision-records).

- [ ] <a id="f04-10"></a>**F04.10 — Favorites and recent records** · `E · optional expansion` — Favorites/pinned projects, recently visited records and personal quick-create shortcuts.

  **Workflow:** Favorites/recent/quick-create are optional navigation aids; all displayed targets and invoked actions remain current-scope filtered. **Rules:** Keep workspace/search/timer/notices/save/language discoverable; deep links authenticate and every drag/shortcut action has a visible accessible alternative.

  **Done when:** A removed project is not exposed through a stale favorite or recent-item label.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.09](#f04-09) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Navigation and interaction](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#navigation-and-interaction).

**Demonstrate before closing this phase:** Create a project for a permitted client, add it to favorites, review a portfolio and close/reopen a project while preserving its linked work.

<a id="phase-08"></a>

## Phase 08 — Plan and complete project tasks

**User outcome:** Members can assign tasks, use checklists and boards, set dependencies and organize personal work.

**Build after:** [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 07](#phase-07)

### Features delivered

- [ ] <a id="f13-01"></a>**F13.01 — Task records** · `S · specified` — Task title/description, project, parent, assignee, status, priority, start/due dates and estimates.

  **Workflow:** Keep title, safe description, project, owner/collaborators, priority/status, estimates/dates/labels and recurring origin in the scoped task revision. **Rules:** Task hierarchy is bounded and acyclic; statuses map to semantic states, and task completion never generates time automatically.

  **Done when:** An unassigned task remains visible in permitted triage and no completion action creates time.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [WRK-002 — Tasks and hierarchy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-002--tasks-and-hierarchy).

- [ ] <a id="f13-02"></a>**F13.02 — Task hierarchy and checklists** · `S · specified` — Subtasks and checklists with cycle prevention and validated same-project hierarchy.

  **Workflow:** Use same-project bounded parent relationships and explicit behavior for unfinished child/checklist items at completion. **Rules:** Task hierarchy is bounded and acyclic; statuses map to semantic states, and task completion never generates time automatically.

  **Done when:** A concurrent parent edit cannot introduce a hierarchy cycle.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Documented parent requirement/contract: [WRK-002 — Tasks and hierarchy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-002--tasks-and-hierarchy).

- [ ] <a id="f13-03"></a>**F13.03 — Task workflow states** · `S · specified` — Semantic statuses mapped from configurable workflow states; distinct completion/archive semantics.

  **Workflow:** Map custom states to documented Backlog/To do/In progress/Blocked/In review/Done/Cancelled meanings and retain reopen history. **Rules:** Task hierarchy is bounded and acyclic; statuses map to semantic states, and task completion never generates time automatically.

  **Done when:** Archiving cannot masquerade as Done or erase cancellation history.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Documented parent requirement/contract: [WRK-002 — Tasks and hierarchy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-002--tasks-and-hierarchy).

- [ ] <a id="f13-04"></a>**F13.04 — Task list and board** · `S · specified` — List/Kanban views with filtering by assignee, project, status, dates and other approved metadata.

  **Workflow:** List and board share the same allowed records, filters and status transitions rather than maintaining two competing task stores. **Rules:** Views contain the same permitted records; saved views store configuration, bulk failures identify exact rows and keyboard alternatives accompany dragging.

  **Done when:** A no-match board shows active filters and reset instead of onboarding.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.03](#f13-03) **Specification:** Documented parent requirement/contract: [WRK-004 — Views and filters](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-004--views-and-filters).

- [ ] <a id="f13-05"></a>**F13.05 — Keyboard task movement** · `S · specified` — Keyboard card movement, accessible status forms and visual rollback on failed saves.

  **Workflow:** Provide visible forms/buttons for card moves, preserve focus and restore prior status when a save is rejected. **Rules:** Views contain the same permitted records; saved views store configuration, bulk failures identify exact rows and keyboard alternatives accompany dragging.

  **Done when:** A keyboard move that fails leaves the task and unsaved description recoverable.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.04](#f13-04) **Specification:** Documented parent requirement/contract: [WRK-004 — Views and filters](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-004--views-and-filters).

- [ ] <a id="f13-06"></a>**F13.06 — Task dependencies** · `S · specified` — Dependencies, blockers and linked milestones with cycle checks under concurrent edits.

  **Workflow:** Start with finish-to-start dependency semantics and versioned milestone links; validate cycles on every mutation/import/sync path. **Rules:** Initial dependency semantics are finish-to-start; cycles are rejected and task completion does not imply external milestone acceptance.

  **Done when:** A→B→C rejects C→A without changing existing edges.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Documented parent requirement/contract: [WRK-003 — Dependencies and milestones](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-003--dependencies-and-milestones).

- [ ] <a id="f13-07"></a>**F13.07 — Task bulk actions** · `S · specified` — Bulk assignment/status/date/archive with permission-aware per-item failure results.

  **Workflow:** Preview selected/excluded rows and return exact per-record outcomes with stable retry identity for partial updates. **Rules:** Views contain the same permitted records; saved views store configuration, bulk failures identify exact rows and keyboard alternatives accompany dragging.

  **Done when:** A bulk change cannot edit a private project or repeat successful rows blindly.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Documented parent requirement/contract: [WRK-004 — Views and filters](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-004--views-and-filters).

- [ ] <a id="f13-08"></a>**F13.08 — Personal assigned work** · `S · specified` — Personal assigned-work/saved views and current task timer linkage.

  **Workflow:** Filter assigned work by current grants and link the selected task to authorized timer context without duplicating task data. **Rules:** Views contain the same permitted records; saved views store configuration, bulk failures identify exact rows and keyboard alternatives accompany dragging.

  **Done when:** Losing a task grant removes its personal-view entry and prevents timer start for it.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Documented parent requirement/contract: [WRK-004 — Views and filters](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-004--views-and-filters).

- [ ] <a id="f13-10"></a>**F13.10 — Task custom fields** · `S · specified` — Validated custom fields with bounded data types/choices and scoped visibility.

  **Workflow:** Use documented bounded field types and financial classification; used definitions archive/migrate with historical values retained. **Rules:** Supported custom fields are bounded and classified; used fields archive/migrate and template copies remap dependencies without cross-tenant links.

  **Done when:** A field deletion cannot erase a previously exported value or expose a private field.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Documented parent requirement/contract: [WRK-007 — Templates and custom fields](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-007--templates-and-custom-fields).

- [ ] <a id="f13-11"></a>**F13.11 — Task move and recovery** · `S · specified` — Move/duplicate/archive/restore actions preserving linked time and financial references.

  **Workflow:** Preview client/currency/source implications for moves; duplicates are new records and referenced originals archive rather than disappear. **Rules:** Moves preview client/currency/billing effects; allocated contradictions block moves, cross-workspace changes use reviewed import and identity history survives.

  **Done when:** A task with locked allocated time cannot be moved into conflicting billing scope.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Documented parent requirement/contract: [WRK-014 — Archive, transfer and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-014--archive-transfer-and-recovery).

- [ ] <a id="f13-13"></a>**F13.13 — Related and duplicate tasks** · `E · optional expansion` — Additional typed task relationships such as duplicate/related, separate from blocking dependencies.

  **Workflow:** Additional related/duplicate edges remain proposals beyond initial scheduling semantics; define their cycle/transfer behavior before activation. **Rules:** Initial dependency semantics are finish-to-start; cycles are rejected and task completion does not imply external milestone acceptance.

  **Done when:** A related edge cannot silently become a scheduling blocker or create time.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-003 — Dependencies and milestones](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-003--dependencies-and-milestones).

- [ ] <a id="f13-14"></a>**F13.14 — Quick-capture inbox** · `E · optional expansion` — Personal quick-capture inbox with review before assigning a project/client.

  **Workflow:** Quick capture is proposed input awaiting explicit project/client assignment; it cannot become authoritative billable work from a partial note. **Rules:** Distinguish unsaved/local/queued/accepted/conflict/failure, preserve valid input and use real empty/no-match/error states rather than fictional data.

  **Done when:** Failed capture preserves input without showing a server-saved task.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Editor and status rules](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#editor-and-status-rules).

- [ ] <a id="f13-15"></a>**F13.15 — Cross-project board customization** · `E · optional expansion` — Saved cross-project board layouts and configurable task forms using the same authorized schema.

  **Workflow:** Store cross-project filter/group/sort/column choices and use the same field schema and granted record set as ordinary views. **Rules:** Views contain the same permitted records; saved views store configuration, bulk failures identify exact rows and keyboard alternatives accompany dragging.

  **Done when:** A custom form cannot set a hidden cost field through an extra payload key.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.04](#f13-04), [F04.07](#f04-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-004 — Views and filters](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-004--views-and-filters).

**Demonstrate before closing this phase:** Create an assigned task with a checklist and dependency, move it through the board using a keyboard, reject a dependency cycle and preserve permitted references during a bulk move.

<a id="phase-09"></a>

## Phase 09 — Track project time with a recoverable timer

**User outcome:** A freelancer can start, pause, switch and stop a timer, recover after reload and record or correct manual time.

**Build after:** [Phase 03](#phase-03), [Phase 05](#phase-05), [Phase 06](#phase-06), [Phase 07](#phase-07)

### Features delivered

- [ ] <a id="f16-01"></a>**F16.01 — Timer start** · `S · specified` — Start timer for an authorized active project/optional task with description and billable flag.

  **Workflow:** Select an active permitted project and optional same-project task, description and billable flag; persist server start before showing confirmed running state. **Rules:** Timer Running/Paused/RecoveryReview is separate from entry review, optional approval and financial allocation; one state never implies another.

  **Done when:** A mismatched task/project is rejected without creating a timer.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [State model](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#state-model).

- [ ] <a id="f16-03"></a>**F16.03 — Single authoritative timer** · `S · specified` — Transaction-enforced one authoritative online timer per workspace user across tabs/devices.

  **Workflow:** Enforce one authoritative online timer for a workspace user using server transactions/revisions, independent of local tab-channel delivery. **Rules:** Server acknowledgements establish confirmed evidence; tab suspension/clock gaps require review and browser channel hints are not global timer authority.

  **Done when:** Racing starts on two devices produce one confirmed timer and a reviewable conflict.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.01](#f16-01) **Specification:** Documented parent requirement/contract: [Persistence, clocks, and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#persistence-clocks-and-recovery).

- [ ] <a id="f16-02"></a>**F16.02 — Timer pause and switch** · `S · specified` — Pause/resume segments and atomic switch between work contexts.

  **Workflow:** Pause closes a segment, resume opens a new one and switching commits old-segment close plus new-context start atomically. **Rules:** Timer Running/Paused/RecoveryReview is separate from entry review, optional approval and financial allocation; one state never implies another.

  **Done when:** Paused gaps contribute zero duration and a failed switch keeps the prior authoritative state.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.01](#f16-01), [F16.03](#f16-03) **Specification:** Documented parent requirement/contract: [State model](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#state-model).

- [ ] <a id="f16-04"></a>**F16.04 — Idempotent timer stop** · `S · specified` — Stop into one recoverable entry; duplicate click/retry cannot create duplicate work.

  **Workflow:** Stop commits entry/segment evidence and clears active state together, with the original operation identity retained across retries. **Rules:** Timer Running/Paused/RecoveryReview is separate from entry review, optional approval and financial allocation; one state never implies another.

  **Done when:** A double stop or lost response cannot create two time records.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.01](#f16-01), [F16.03](#f16-03) **Specification:** Documented parent requirement/contract: [State model](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#state-model).

- [ ] <a id="f16-06"></a>**F16.06 — Timer recovery** · `S · specified` — Reload/crash/tab-close/device-sleep recovery showing confirmed evidence and uncertain gaps.

  **Workflow:** Recover acknowledged segments after reload/crash/sleep and present unknown clock/suspension intervals for explicit review. **Rules:** Server acknowledgements establish confirmed evidence; tab suspension/clock gaps require review and browser channel hints are not global timer authority.

  **Done when:** Reopening a suspended page never silently bills the full unknown gap.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.01](#f16-01) **Specification:** Documented parent requirement/contract: [Persistence, clocks, and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#persistence-clocks-and-recovery).

- [ ] <a id="f16-07"></a>**F16.07 — Clock anomaly review** · `S · specified` — Clock-jump/backward-time detection with review before affected time can be billed.

  **Workflow:** Compare clock evidence and mark backward jumps or unexplained intervals as uncertain instead of treating wall-clock movement as worked duration. **Rules:** Server acknowledgements establish confirmed evidence; tab suspension/clock gaps require review and browser channel hints are not global timer authority.

  **Done when:** Moving the client clock backward cannot create negative or fabricated billable seconds.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.06](#f16-06) **Specification:** Documented parent requirement/contract: [Persistence, clocks, and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#persistence-clocks-and-recovery).

- [ ] <a id="f16-08"></a>**F16.08 — Uncertain interval resolution** · `S · specified` — Explicit keep/discard/split/revise review of uncertain or optional in-site inactivity intervals.

  **Workflow:** Offer keep/discard/split/revise choices for suspected intervals under the selected review policy and preserve the decision history. **Rules:** Retain original integer seconds and source metadata; uncertain or overlapping work requires review before billing and financial allocation locks evidence.

  **Done when:** Discarding uncertain time leaves confirmed segments and their exact duration intact.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.07](#f16-07) **Specification:** Documented parent requirement/contract: [Requirements and user behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#requirements-and-user-behavior).

- [ ] <a id="f16-10"></a>**F16.10 — Manual time entry** · `S · specified` — Manual duration-only and start/end interval entries with original source/timezone/work date.

  **Workflow:** Support positive duration-only or consistent start/end entries with project, work date, source and timezone; disclose unverifiable overlap for duration-only entries. **Rules:** Retain original integer seconds and source metadata; uncertain or overlapping work requires review before billing and financial allocation locks evidence.

  **Done when:** DST/cross-midnight input preserves actual seconds and the explicitly chosen work-date semantics.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [Requirements and user behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#requirements-and-user-behavior).

- [ ] <a id="f16-11"></a>**F16.11 — Time entry revisions** · `S · specified` — Entry edit/split/merge/duplicate/move/undo with exact second conservation and source eligibility checks.

  **Workflow:** Preview split/merge/duplicate/move/undo, conserving seconds and checking matching scope/rate/approval/allocation conditions. **Rules:** Aggregate raw seconds before display rounding; approved billing policy controls grouping and allocations cannot consume more eligible source time.

  **Done when:** Splits sum to the original source; copying creates new unbilled evidence rather than copied allocation ownership.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.10](#f16-10) **Specification:** Documented parent requirement/contract: [Time arithmetic and allocation policy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#time-arithmetic-and-allocation-policy).

- [ ] <a id="f16-12"></a>**F16.12 — Overlap resolution** · `S · specified` — Overlap detection and documented exceptions; duration-only records disclose unprovable interval coverage.

  **Workflow:** Explain overlapping intervals for the same user and require resolution or an allowed reviewed exception before billing. **Rules:** Retain original integer seconds and source metadata; uncertain or overlapping work requires review before billing and financial allocation locks evidence.

  **Done when:** Overlap cannot be hidden by converting display hours or changing a filter.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.10](#f16-10) **Specification:** Documented parent requirement/contract: [Requirements and user behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#requirements-and-user-behavior).

- [ ] <a id="f16-13"></a>**F16.13 — Timezone and DST handling** · `S · specified` — Cross-midnight/DST buckets sum to original duration independently of displayed rounded hours.

  **Workflow:** Keep UTC instants, source timezone and work date distinct and aggregate source seconds before localized display buckets. **Rules:** Aggregate raw seconds before display rounding; approved billing policy controls grouping and allocations cannot consume more eligible source time.

  **Done when:** Cross-midnight/DST bucket totals equal the original record's exact seconds.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.10](#f16-10) **Specification:** Documented parent requirement/contract: [Time arithmetic and allocation policy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#time-arithmetic-and-allocation-policy).

- [ ] <a id="f16-14"></a>**F16.14 — Time record views** · `S · specified` — Filters/day-week calendars and source/review/allocation state, with raw-time import/export mapping.

  **Workflow:** Offer documented scope, billable/review/approval/allocation/source filters and personal saved views without altering source evidence. **Rules:** Retain original integer seconds and source metadata; uncertain or overlapping work requires review before billing and financial allocation locks evidence.

  **Done when:** A filtered total equals the matching raw seconds before display rounding.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.10](#f16-10) **Specification:** Documented parent requirement/contract: [Requirements and user behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#requirements-and-user-behavior).

- [ ] <a id="f16-15"></a>**F16.15 — Favorite time entries** · `E · optional expansion` — Reusable recent timer descriptions and favorites for starting authorized project/task work.

  **Workflow:** Favorite descriptions/context remain proposed shortcuts to an ordinary authorized start command, never cached authority to a removed project. **Rules:** Focus/reminders/goals are optional personal aids; activity signals, commits or calendar events never fabricate billable time or attendance.

  **Done when:** A favorite cannot start time after the user's project grant is revoked.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.10](#f16-10) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Productivity and reporting definitions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#productivity-and-reporting-definitions).

- [ ] <a id="f16-16"></a>**F16.16 — Explicit time suggestions** · `E · optional expansion` — Explicit user-selected meeting/task-to-manual-entry suggestions; no unattended time fabrication.

  **Workflow:** Suggestions remain proposed user-reviewed context from meeting/task records; acceptance must deliberately create/assign actual work evidence. **Rules:** Focus/reminders/goals are optional personal aids; activity signals, commits or calendar events never fabricate billable time or attendance.

  **Done when:** A calendar event or completed task alone creates zero billable seconds.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.10](#f16-10) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Productivity and reporting definitions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#productivity-and-reporting-definitions).

- [ ] <a id="f04-04"></a>**F04.04 — Persistent work indicators** · `S · specified` — Persistent timer and browser/server save indicators across applicable application routes.

  **Workflow:** Display active timer and truthful unsaved/browser-saved/submitting/accepted/unknown states without treating a refresh hint as commit evidence. **Rules:** Distinguish unsaved/local/queued/accepted/conflict/failure, preserve valid input and use real empty/no-match/error states rather than fictional data.

  **Done when:** A lost response displays checking status rather than a second timer or a false save.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.01](#f04-01) **Specification:** Documented parent requirement/contract: [Editor and status rules](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#editor-and-status-rules).

- [ ] <a id="f16-05"></a>**F16.05 — Visible timer controls** · `S · specified` — Persistent visible timer with keyboard controls and honest server acknowledgment.

  **Workflow:** Keep keyboard-accessible timer context/elapsed state visible; announce state changes without continuously flooding live regions. **Rules:** Retain original integer seconds and source metadata; uncertain or overlapping work requires review before billing and financial allocation locks evidence.

  **Done when:** Navigating between routes preserves confirmed timer context and focus usability.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F16.01](#f16-01), [F04.04](#f04-04) **Specification:** Documented parent requirement/contract: [Requirements and user behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#requirements-and-user-behavior).

<details>
<summary>Supporting work included in this feature phase — 1 tracked entries</summary>

- [ ] <a id="f39-10"></a>**F39.10 — Browser lifecycle tests** · `S · specified` — Exercise reload, navigation, sleep, multiple tabs and supported mobile layouts.

  **Workflow:** Test supported reload/sleep/navigation/multi-tab/storage-denial behavior; distinguish memory input, eligible local persistence and server-accepted authoritative state. **Rules:** Refresh identity, grants, revisions and receipts after tab return; suspended/closed pages cannot provide durable jobs or financial authority.

  **Done when:** Timer/draft states stay honest under suspension and storage denial.

  **Feature prerequisites:** [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [Online authority and browser limits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#online-authority-and-browser-limits).

</details>

**Demonstrate before closing this phase:** Start work, reload, open another tab and stop after a simulated lost response. Exactly one accepted timer and one final entry remain. Review uncertain gaps explicitly and test timezone/DST and overlap cases.

<a id="phase-10"></a>

## Phase 10 — Build an invoice with exact prices and fixed-fee lines

**User outcome:** A freelancer can configure seller details, select a currency and prepare an accurately calculated invoice draft for a client.

**Build after:** [Phase 03](#phase-03), [Phase 06](#phase-06)

### Features delivered

- [ ] <a id="f19-01"></a>**F19.01 — Seller billing profile** · `S · specified` — Configure legal identity, registrations, billing contacts, payment instructions and document defaults.

  **Workflow:** Maintain seller legal/address/registration/contact/payment defaults and branding; freeze the selected customer-visible values at document issuance. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** Updating the profile leaves issued seller snapshots unchanged.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue).

- [ ] <a id="f19-02"></a>**F19.02 — Currency metadata** · `S · specified` — Validate supported currency exponent, exact range and allowed precision per document.

  **Workflow:** Associate currency code/exponent with every monetary record; validate precision/range before exact conversion to the declared minor-unit representation. **Rules:** Posted amounts use currency-specific minor units; rates/quantities are exact values and excess precision or invalid range is rejected, never truncated.

  **Done when:** Zero- and three-decimal currency fixtures reject excess precision without truncation.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [Representation and precision](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#representation-and-precision).

- [ ] <a id="f19-03"></a>**F19.03 — Exact money calculator** · `S · specified` — Use integer minor-unit postings and exact quantities/rates with versioned policy.

  **Workflow:** Calculate quantities/rates exactly, round only at approved component boundaries and retain calculation-policy identity for later explanation. **Rules:** Posted amounts use currency-specific minor units; rates/quantities are exact values and excess precision or invalid range is rejected, never truncated.

  **Done when:** Invoice line components sum exactly under the approved arithmetic fixtures.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.02](#f19-02) **Specification:** Documented parent requirement/contract: [Representation and precision](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#representation-and-precision).

- [ ] <a id="f19-04"></a>**F19.04 — Line discounts** · `S · specified` — Support permitted fixed or percentage line discounts with exact bounds.

  **Workflow:** Validate fixed/percentage line discounts against eligible base and use the approved order before calculating the saved tax basis. **Rules:** Calculation order is proposed pending Q-03; deterministic discounts, saved tax bases/order and component rounding must reconcile to the document total.

  **Done when:** A discount exceeding the eligible base is rejected before issue.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03) **Specification:** Documented parent requirement/contract: [Proposed calculation order](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#proposed-calculation-order).

- [ ] <a id="f19-06"></a>**F19.06 — Exclusive taxes** · `S · specified` — Apply approved dated tax components with exemption evidence and explicit basis.

  **Workflow:** Version tax labels/rates, exemption evidence and exclusive basis; market eligibility/registration and effective-date treatment need Q-01/Q-03. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** A rate change after issue never recalculates past tax.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue).

- [ ] <a id="f19-10"></a>**F19.10 — Invoice draft editor** · `S · specified` — Create and preserve incomplete drafts with seller, client, dates, terms and lines.

  **Workflow:** Keep incomplete draft parties, dates, terms and lines editable with visible validation issues; allocating a number waits for online finalization. **Rules:** Draft/issued/void, delivery, settlement, dispute and overdue are separate; issued documents cannot be edited/deleted and voiding is jurisdiction-gated.

  **Done when:** A failed save retains input and never allocates a permanent number.

  **Feature prerequisites:** [F03.06](#f03-06), [F07.01](#f07-01), [F19.01](#f19-01), [F19.03](#f19-03), [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [Documents, states, and derived views](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#documents-states-and-derived-views).

- [ ] <a id="f19-11"></a>**F19.11 — Fixed-fee invoice lines** · `S · specified` — Create exact fixed service lines with explicit project and scope reference.

  **Workflow:** Store selected fixed scope/amount and project reference as a draft line; a project estimate or completion status is not authorization to invoice. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** A project budget cannot silently become a charge.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.10](#f19-10) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue).

- [ ] <a id="f19-15"></a>**F19.15 — Invoice draft duplication** · `S · specified` — Copy permitted content into a new unnumbered draft.

  **Workflow:** Copy only permitted draft content into a new unnumbered record; exclude issued number, source ownership, payment history and provider identity. **Rules:** Draft/issued/void, delivery, settlement, dispute and overdue are separate; issued documents cannot be edited/deleted and voiding is jurisdiction-gated.

  **Done when:** No settlement, allocation ownership, provider ID or delivery history is copied.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.10](#f19-10) **Specification:** Documented parent requirement/contract: [Documents, states, and derived views](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#documents-states-and-derived-views).

- [ ] <a id="f19-16"></a>**F19.16 — Invoice templates** · `S · specified` — Version supported layouts, notes, payment fields and hidden internal notes.

  **Workflow:** Version invoice/estimate/credit layout, locale, notes and approved payment fields separately from financial calculations and internal-only annotations. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** Template changes preserve issued snapshot values and render version.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.10](#f19-10) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue); [Locale and direction contract](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#locale-and-direction-contract).

- [ ] <a id="f19-17"></a>**F19.17 — Invoice readiness check** · `S · specified` — Show blocking missing terms, unresolved sources, dates and calculation failures.

  **Workflow:** Check required parties, nonzero valid lines, selected policy, dates/terms and unresolved source conflicts against the draft's expected revision. **Rules:** Draft/issued/void, delivery, settlement, dispute and overdue are separate; issued documents cannot be edited/deleted and voiding is jurisdiction-gated.

  **Done when:** Direct issuance rejects the same invalid input as the editor.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.10](#f19-10), [F19.11](#f19-11) **Specification:** Documented parent requirement/contract: [Documents, states, and derived views](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#documents-states-and-derived-views).

- [ ] <a id="f19-18"></a>**F19.18 — Purchase order references** · `E · optional expansion` — Store client PO/reference fields and optional contractual limits per engagement.

  **Workflow:** PO/references remain proposed supporting client metadata; any limit enforcement or legal meaning needs a separate approved agreement/profile rule. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** Editing a PO does not rewrite prior invoices or imply external authorization.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.10](#f19-10) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue).

<details>
<summary>Supporting work included in this feature phase — 3 tracked entries</summary>

- [ ] <a id="f05-13"></a>**F05.13 — Online financial authority** · `S · specified` — Financial drafts remain candidates; issuance/posting/publication require current online authority.

  **Workflow:** Offline document/source selections remain provisional; issue, post, allocate and publish require an online current-authority command. **Rules:** Offline selections are candidates only; online issue/post/publish requires current authority and one transactional immutable result.

  **Done when:** A disconnected invoice editor cannot allocate a final number or consume globally billable seconds.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [Time and financial operations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#time-and-financial-operations).

- [ ] <a id="f34-04"></a>**F34.04 — CSV formula protection** · `S · specified` — Escape dangerous spreadsheet cells in every export and preview.

  **Workflow:** Neutralize spreadsheet-formula text across all CSV exports/previews and retain exact numeric strings with documented encoding/delimiter. **Rules:** Matching suggestions require confirmation; imports dedupe, exports neutralize formulas and unknown delivery reconciles before resend without changing issued records.

  **Done when:** Names beginning with formula operators remain inert in declared spreadsheet consumers.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [Reconciliation, exports, delivery, and privacy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#reconciliation-exports-delivery-and-privacy).

- [ ] <a id="f39-07"></a>**F39.07 — Financial invariant tests** · `S · specified` — Use approved exact fixtures plus concurrent posting and source-conservation checks.

  **Workflow:** Use independently approved exact fixtures and real concurrency/rollback to conserve money/source seconds across discounts/taxes/allocations/credits/reversals and policy versions. **Rules:** Approved fixtures cover fractional quantities, rounding ties, 0/2/3-decimal currencies and partial-credit remainders; existing snapshots keep old policies.

  **Done when:** Taxes, discounts, reversals and allocations conserve every relevant minor unit/second.

  **Feature prerequisites:** [F19.03](#f19-03) **Specification:** Documented parent requirement/contract: [Arithmetic fixtures](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#arithmetic-fixtures); [Time arithmetic and allocation policy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#time-arithmetic-and-allocation-policy); [Failure and acceptance matrix](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#failure-and-acceptance-matrix).

</details>

**Demonstrate before closing this phase:** Create a draft with quantity, fixed-fee lines, supported discount and tax. Validate approved minor-unit fixtures and preserve input on failure. A draft has no issued number and cannot become an offline financial posting.

<a id="phase-11"></a>

## Phase 11 — Turn tracked work into billable invoice lines

**User outcome:** A freelancer can set dated rates, distinguish private costs from selling rates and select unbilled work for an invoice.

**Build after:** [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 09](#phase-09), [Phase 10](#phase-10)

### Features delivered

- [ ] <a id="f17-01"></a>**F17.01 — Dated billing rates** · `S · specified` — Resolve entry, task, project, client and workspace rates with explicit precedence and matching currency.

  **Workflow:** Resolve the documented proposed override chain using effective date and explicit currency; persist the chosen rate policy rather than relying on current defaults. **Rules:** Use effective-dated rate snapshots and explicit missing-rate handling; billed facts are corrected through audited adjustments rather than ordinary edits.

  **Done when:** A missing rate blocks billing instead of silently choosing zero.

  **Feature prerequisites:** [F03.06](#f03-06), [F12.01](#f12-01), [F19.03](#f19-03) **Specification:** Documented parent requirement/contract: [Rates, corrections, and billing handoff](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#rates-corrections-and-billing-handoff).

- [ ] <a id="f17-02"></a>**F17.02 — Private internal cost rates** · `S · specified` — Version labor costs separately from selling rates and apply restricted projections.

  **Workflow:** Keep internal labor costs distinct, private and versioned for permitted margin reports; display/export only allowed cost projections. **Rules:** Service margin uses the stated revenue basis minus known direct costs; missing cost is incomplete and no denominator means No data.

  **Done when:** A Contributor cannot infer cost from API, export, tooltip or task totals.

  **Feature prerequisites:** [F03.06](#f03-06), [F12.01](#f12-01), [F19.03](#f19-03) **Specification:** Documented parent requirement/contract: [INS-003 — Profitability and effective rates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-003--profitability-and-effective-rates).

- [ ] <a id="f17-03"></a>**F17.03 — Billing rounding profiles** · `S · specified` — Version grouping, minimum and rounding policies while retaining raw integer seconds.

  **Workflow:** Preview raw seconds, grouped billed quantity, rounding difference and policy version before selecting sources for an invoice. **Rules:** Aggregate raw seconds before display rounding; approved billing policy controls grouping and allocations cannot consume more eligible source time.

  **Done when:** 90 source seconds at 120.00/hour yields 3.00 under the unrounded approved profile.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03) **Specification:** Documented parent requirement/contract: [Time arithmetic and allocation policy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#time-arithmetic-and-allocation-policy).

- [ ] <a id="f17-04"></a>**F17.04 — Billable eligibility** · `S · specified` — Separate billability, review, approval and allocation; fixed-fee time remains cost evidence.

  **Workflow:** Show billable, ready/reviewed, approval and allocated dimensions independently; a fixed-fee record remains cost evidence unless explicitly billed by time. **Rules:** Retain original integer seconds and source metadata; uncertain or overlapping work requires review before billing and financial allocation locks evidence.

  **Done when:** Changing approval alone never releases consumed seconds.

  **Feature prerequisites:** [F03.06](#f03-06), [F16.10](#f16-10), [F17.01](#f17-01) **Specification:** Documented parent requirement/contract: [Requirements and user behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#requirements-and-user-behavior).

- [ ] <a id="f17-08"></a>**F17.08 — Unbilled work queue** · `S · specified` — Show eligible seconds, age, missing rates and active reservations by client/project.

  **Workflow:** Derive eligible unconsumed seconds with missing rate/review/approval blockers and visible draft reservations; summaries link to their sources. **Rules:** Retain original integer seconds and source metadata; uncertain or overlapping work requires review before billing and financial allocation locks evidence.

  **Done when:** Its total reconciles to eligible sources and excludes already-consumed time.

  **Feature prerequisites:** [F03.06](#f03-06), [F17.04](#f17-04) **Specification:** Documented parent requirement/contract: [Requirements and user behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#requirements-and-user-behavior).

- [ ] <a id="f17-09"></a>**F17.09 — Whole-entry invoice reservations** · `S · specified` — Reserve time for a draft and revalidate ownership at issuance.

  **Workflow:** Reserve acknowledged whole entries for a draft; revalidate permissions, policy/revisions and consumption in the issue transaction. **Rules:** Aggregate raw seconds before display rounding; approved billing policy controls grouping and allocations cannot consume more eligible source time.

  **Done when:** Two draft finalizations racing for one entry yield one consumption.

  **Feature prerequisites:** [F03.06](#f03-06), [F17.04](#f17-04), [F19.10](#f19-10), [F38.04](#f38-04) **Specification:** Documented parent requirement/contract: [Time arithmetic and allocation policy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#time-arithmetic-and-allocation-policy).

- [ ] <a id="f19-12"></a>**F19.12 — Time-based invoice lines** · `S · specified` — Preview raw seconds, policy-rounded quantity, rate and source reservations.

  **Workflow:** Reference eligible exact time and dated selling rate; show raw and rounded quantity and recheck source ownership at online issuance. **Rules:** Use effective-dated rate snapshots and explicit missing-rate handling; billed facts are corrected through audited adjustments rather than ordinary edits.

  **Done when:** Rounded display hours cannot change trusted monetary calculation.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.10](#f19-10), [F17.09](#f17-09) **Specification:** Documented parent requirement/contract: [Rates, corrections, and billing handoff](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#rates-corrections-and-billing-handoff); [Time arithmetic and allocation policy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#time-arithmetic-and-allocation-policy); [Invoice issuance, ownership, and numbering](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#invoice-issuance-ownership-and-numbering).

- [ ] <a id="f12-03"></a>**F12.03 — Project billing model** · `S · specified` — Hourly/fixed/milestone/mixed billing context with versioned budgets/rate references.

  **Workflow:** Store the selected billing model/currency and versioned budget/rate references; distinguish estimates, actual time, invoices and cash. **Rules:** Budget is a versioned plan; time, issued revenue, collected cash and commitments differ, and billing changes cannot reprice history.

  **Done when:** Recording fixed-fee effort does not generate an hourly invoice automatically.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.01](#f12-01), [F19.02](#f19-02) **Specification:** Documented parent requirement/contract: [WRK-012 — Budgets, rates and profitability context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-012--budgets-rates-and-profitability-context).

- [ ] <a id="f12-06"></a>**F12.06 — Budget indicators** · `S · specified` — Estimate/actual/budget indicators and threshold alerts with incomplete-data disclosure.

  **Workflow:** Compare recorded actuals against a specific plan revision and expose incomplete cost data with deduplicated threshold alerts. **Rules:** Budget is a versioned plan; time, issued revenue, collected cash and commitments differ, and billing changes cannot reprice history.

  **Done when:** Crossing one threshold repeatedly for the same revision cannot flood notices.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.01](#f12-01), [F19.03](#f19-03) **Specification:** Documented parent requirement/contract: [WRK-012 — Budgets, rates and profitability context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-012--budgets-rates-and-profitability-context).

**Demonstrate before closing this phase:** Select a time entry into a draft, try selecting it concurrently into another draft and reject the duplicate reservation. Changing today’s rate cannot rewrite an earlier agreed billing snapshot or reveal internal costs.

<a id="phase-12"></a>

## Phase 12 — Issue, download and share a permanent invoice

**User outcome:** A freelancer can issue a numbered invoice, download an English/Arabic PDF, record manual sharing and correct it through linked documents.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 10](#phase-10)

### Features delivered

- [ ] <a id="f20-02"></a>**F20.02 — Numbering series** · `S · specified` — Scope sequences by approved seller/type/period policy without number reuse.

  **Workflow:** Select an approved seller/type/period/sequence scope and formatting; preserve issued/voided/reserved numbering history across failures and restoration review. **Rules:** One online transaction validates revisions, snapshots, number and source ownership; reuse the original receipt after timeout and review numbering after restore.

  **Done when:** Concurrent issuance and year-boundary fixtures preserve uniqueness.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.01](#f19-01), [F38.04](#f38-04) **Specification:** Documented parent requirement/contract: [Invoice issuance, ownership, and numbering](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#invoice-issuance-ownership-and-numbering).

- [ ] <a id="f20-01"></a>**F20.01 — Atomic invoice issuance** · `S · specified` — Validate current references and commit number, snapshot, allocation, audit and receipt together.

  **Workflow:** Use expected draft revision, preview and original operation key; commit trusted snapshot, number, allocations, audit/receipt/outbox together or roll back. **Rules:** One online transaction validates revisions, snapshots, number and source ownership; reuse the original receipt after timeout and review numbering after restore.

  **Done when:** A rollback leaves no partial posting; lost-response retry returns the same invoice.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.17](#f19-17), [F20.02](#f20-02), [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [Invoice issuance, ownership, and numbering](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#invoice-issuance-ownership-and-numbering).

- [ ] <a id="f20-03"></a>**F20.03 — Issued document viewer** · `S · specified` — Show frozen parties, lines, totals, terms and linked correction history.

  **Workflow:** Display the saved issue snapshot and linked corrections rather than recomputing parties, prices or terms from mutable master data. **Rules:** Draft/issued/void, delivery, settlement, dispute and overdue are separate; issued documents cannot be edited/deleted and voiding is jurisdiction-gated.

  **Done when:** Editing client or rate master data leaves the view unchanged.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.01](#f20-01) **Specification:** Documented parent requirement/contract: [Documents, states, and derived views](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#documents-states-and-derived-views).

- [ ] <a id="f20-04"></a>**F20.04 — Bilingual PDF rendering** · `S · specified` — Render English/Arabic snapshots with shaping, selectable text and stable amounts.

  **Workflow:** Render the saved document with selected locale, tested Arabic shaping, selectable text and matching line/component totals using allowed assets only. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** Long Arabic names and mixed IDs remain readable without clipped totals.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.03](#f20-03), [F30.05](#f30-05) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue); [Locale and direction contract](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#locale-and-direction-contract).

- [ ] <a id="f20-05"></a>**F20.05 — PDF job recovery** · `S · specified` — Render immutable snapshots with durable progress, retry and cleanup.

  **Workflow:** Retry artifact generation for the existing snapshot/number through bounded job state; renderer failure never changes the issued obligation. **Rules:** Draft/issued/void, delivery, settlement, dispute and overdue are separate; issued documents cannot be edited/deleted and voiding is jurisdiction-gated.

  **Done when:** A renderer failure does not unissue or renumber the document.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.04](#f20-04) **Specification:** Documented parent requirement/contract: [Documents, states, and derived views](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#documents-states-and-derived-views); [INT-010 — Safe job execution](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-010--safe-job-execution).

- [ ] <a id="f20-06"></a>**F20.06 — Manual invoice sharing** · `S · specified` — Download/export the authorized artifact and separately record actual sharing evidence.

  **Workflow:** Export/download the authorized artifact and separately record actual sharing method/recipient; export itself is not verified sending or reading. **Rules:** Matching suggestions require confirmation; imports dedupe, exports neutralize formulas and unknown delivery reconciles before resend without changing issued records.

  **Done when:** A download is never presented as verified delivery or client reading.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.04](#f20-04) **Specification:** Documented parent requirement/contract: [Reconciliation, exports, delivery, and privacy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#reconciliation-exports-delivery-and-privacy).

- [ ] <a id="f20-07"></a>**F20.07 — Invoice delivery history** · `S · specified` — Track delivery attempts independently of issue and settlement.

  **Workflow:** Record per-recipient attempt identity and provider outcome separately from issuance, settlement and dispute state; reconcile unknown handoff before resend. **Rules:** Verified sender/recipient/template snapshots have distinct queued/accepted/delivered/bounced/unknown states; reconcile uncertain delivery before any resend.

  **Done when:** A bounce leaves the issued receivable intact.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.01](#f20-01) **Specification:** Documented parent requirement/contract: [INT-005 — Email and document delivery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-005--email-and-document-delivery).

- [ ] <a id="f20-08"></a>**F20.08 — Invoice print layout** · `S · specified` — Provide printable accessible output with controlled pagination and repeated identifiers.

  **Workflow:** Use snapshot fields and supported template pagination/continuation behavior; verify long localized content against the unchanged document totals. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** A multi-page invoice retains all lines and matching final total.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.04](#f20-04) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue); [Locale and direction contract](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#locale-and-direction-contract).

- [ ] <a id="f20-09"></a>**F20.09 — Permitted invoice void** · `S · specified` — Allow only approved jurisdiction/state rules with reason and explicit allocation policy.

  **Workflow:** Gate void by approved jurisdiction/state/reason and deliberate source-release policy; paid/credited/disputed invoices cannot bypass correction rules. **Rules:** Draft/issued/void, delivery, settlement, dispute and overdue are separate; issued documents cannot be edited/deleted and voiding is jurisdiction-gated.

  **Done when:** A paid, credited or disputed invoice cannot be voided by ordinary editing.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.01](#f20-01) **Specification:** Documented parent requirement/contract: [Documents, states, and derived views](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#documents-states-and-derived-views).

- [ ] <a id="f20-11"></a>**F20.11 — Document hashes and versions** · `S · specified` — Keep checksum, snapshot, renderer version and artifact references for reproducibility.

  **Workflow:** Retain attachment/checksum and snapshot/render version references; show missing-file repair without reconstructing historical amounts from current settings. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** A missing blob is repairable without reconstructing amounts from current master data.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.01](#f20-01) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue).

- [ ] <a id="f20-12"></a>**F20.12 — Payment instruction QR** · `S · specified` — Include only approved payment URL/QR fields from the immutable document context.

  **Workflow:** Include only configured approved payment instruction fields/URL/QR; QR appearance is not proof of payment or authorization to change the seller account. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** An unsafe URL or stale provider account blocks publication.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.04](#f20-04) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue); [INT-006 — Payment providers](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-006--payment-providers).

- [ ] <a id="f20-15"></a>**F20.15 — Financial document register** · `S · specified` — Filter issued documents and corrections by client, date, type, currency and lifecycle.

  **Workflow:** Query scoped document type, currency, dates, issue/correction/lifecycle and consistent as-of results with bounded pagination and source-linked totals. **Rules:** Use allowlisted filters and stable bounded cursors; scope counts/files/exports and expose revision/as-of rather than mixing pending and committed totals.

  **Done when:** Registry totals and permissions match the underlying issued records.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.01](#f20-01) **Specification:** Documented parent requirement/contract: [Queries, search and files](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/api-contracts.md#queries-search-and-files).

- [ ] <a id="f21-06"></a>**F21.06 — Credit note issuance** · `S · specified` — Issue partial/full reductions against original line, tax and discount components.

  **Workflow:** Allocate partial/full credit to original saved line/tax/discount capacities and retain reason/source links; credit does not automatically release billed work. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** Repeated credit attempts cannot exceed original credited capacity.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F20.01](#f20-01), [F20.02](#f20-02) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f20-10"></a>**F20.10 — Invoice replacement links** · `S · specified` — Link corrections/replacements to originals without overwriting history.

  **Workflow:** Link replacement/correction records to their original number/version and preserve immutable prior terms and financial components for export. **Rules:** Draft/issued/void, delivery, settlement, dispute and overdue are separate; issued documents cannot be edited/deleted and voiding is jurisdiction-gated.

  **Done when:** The original number remains traceable and cannot be reused.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.01](#f20-01), [F21.06](#f21-06) **Specification:** Documented parent requirement/contract: [Documents, states, and derived views](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#documents-states-and-derived-views).

<details>
<summary>Supporting work included in this feature phase — 8 tracked entries</summary>

- [ ] <a id="f30-05"></a>**F30.05 — Durable job engine** · `S · specified` — Lease bounded work with checkpoints, retry state and dead letters.

  **Workflow:** Persist occurrence, attempt, lease/checkpoint and result state; at-least-once worker invocation yields idempotent effects rather than exactly-once transport claims. **Rules:** Durable leased jobs have bounded retries/checkpoints and idempotent effects; cancellation/current grants are rechecked before external side effects.

  **Done when:** Two workers or a lease expiry cannot duplicate an invoice/payment effect.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04) **Specification:** Documented parent requirement/contract: [INT-010 — Safe job execution](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-010--safe-job-execution).

- [ ] <a id="f38-05"></a>**F38.05 — Private file service** · `S · specified` — Use scoped short-lived upload/download authority, quarantine and checked references.

  **Workflow:** Issue short-lived scoped file authority, bound supported bytes/type/size/quota and validate integrity before reference/publication; recheck download resource/version access. **Rules:** Attachments retain hash/type/size/version and upload state; incomplete uploads are not final files and conflicting note bodies preserve revisions.

  **Done when:** Unsigned downloads and cross-tenant object IDs fail before byte delivery.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [WRK-011 — Files, notes and knowledge links](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-011--files-notes-and-knowledge-links).

- [ ] <a id="f38-10"></a>**F38.10 — Redacted observability** · `S · specified` — Record correlated errors, bounded latency/queue metrics and redacted audit events.

  **Workflow:** Record redacted correlation/error/latency/query/queue metadata with defined access/retention and no customer document, token or raw environment dumps. **Rules:** Monitor bounded workloads and minimal redacted diagnostics; product analytics/crash uploads are opt-in and provider limits are verified rather than assumed.

  **Done when:** An attacker-controlled name cannot inject log structure or expose tokens.

  **Feature prerequisites:** [F38.01](#f38-01) **Specification:** Documented parent requirement/contract: [Quotas and observability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#quotas-and-observability).

- [ ] <a id="f38-11"></a>**F38.11 — Actionable alerting** · `S · specified` — Route service failures, financial anomalies and backup failures to accountable operators.

  **Workflow:** Choose alert owner/channel/thresholds under approved service policy and test actual delivery of meaningful failure/backlog/backup/financial anomaly signals. **Rules:** Monitor bounded workloads and minimal redacted diagnostics; product analytics/crash uploads are opt-in and provider limits are verified rather than assumed.

  **Done when:** A synthetic failure reaches the actual declared on-call path.

  **Feature prerequisites:** [F38.10](#f38-10) **Specification:** Documented parent requirement/contract: [Quotas and observability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#quotas-and-observability).

- [ ] <a id="f38-12"></a>**F38.12 — Database backup recovery** · `S · specified` — Restore into isolation and verify integrity and auth invalidation before use.

  **Workflow:** Restore DB into isolation, validate relationships/money/number/receipt constraints and revoke/rotate restored session authority before reopening writes. **Rules:** Validate manifests/relations/amounts/files in isolation, reconcile later external outcomes and invalidate restored sessions before reopening writes.

  **Done when:** Old restored sessions cannot regain access and numbering cannot reuse later issued values.

  **Feature prerequisites:** [F38.02](#f38-02), [F38.09](#f38-09) **Specification:** Documented parent requirement/contract: [Isolated restore and reconciliation](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#isolated-restore-and-reconciliation).

- [ ] <a id="f38-14"></a>**F38.14 — External outcome reconciliation** · `S · specified` — Reconcile later payments, sends and jobs before restored writes reopen.

  **Workflow:** After the restore point, reconcile provider payments/callbacks/sends/jobs and number authority before accepting new money effects or dispatching work. **Rules:** Validate manifests/relations/amounts/files in isolation, reconcile later external outcomes and invalidate restored sessions before reopening writes.

  **Done when:** A restore cannot replay a refund or resend an already accepted invoice blindly.

  **Feature prerequisites:** [F38.04](#f38-04) **Specification:** Documented parent requirement/contract: [Isolated restore and reconciliation](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#isolated-restore-and-reconciliation).

- [ ] <a id="f38-17"></a>**F38.17 — Controlled deployment** · `S · specified` — Use reviewed builds, migration gates, feature controls and compatible rollback/forward repair.

  **Workflow:** Record build/migration/auth-policy/features and compatibility window; stage rollout and use rollback only if data remains compatible, otherwise forward repair. **Rules:** Separate environments/credentials and synthetic preview data; deploy reviewed server-capable builds with compatible migrations and current ingress/auth/cache verification.

  **Done when:** A failed rollout cannot leave old tabs writing an incompatible financial schema.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.02](#f38-02), [F38.07](#f38-07) **Specification:** Documented parent requirement/contract: [Environments and delivery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#environments-and-delivery).

- [ ] <a id="f38-18"></a>**F38.18 — Incident response workflow** · `S · specified` — Contain exposure, revoke credentials, preserve evidence and recover under a rehearsed runbook.

  **Workflow:** Rehearse detection, containment, credential/session revoke, evidence preservation, recovery/reconciliation and approved communications with Q-16 operational ownership. **Rules:** Contain unsafe effects, preserve evidence and reconcile isolated DB-plus-files restore; support ownership and measured RPO/RTO remain Q-16.

  **Done when:** A synthetic compromised credential can be disabled and verified without rewriting history.

  **Feature prerequisites:** [F38.10](#f38-10), [F38.11](#f38-11) **Specification:** Documented parent requirement/contract: [Incidents and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#incidents-and-recovery).

</details>

**Demonstrate before closing this phase:** Issue concurrently and retry after a lost reply: retain one number and one immutable snapshot. Retry a failed PDF job, verify Arabic rendering, issue a permitted credit/correction and restore the document plus its private file in isolation. Before external release, complete the keyboard client-to-payment journey once payment recording is available.

<a id="phase-13"></a>

## Phase 13 — Record payments and see what clients still owe

**User outcome:** A freelancer can record full or partial payments, apply credit, record refunds/reversals and follow an invoice’s remaining balance.

**Build after:** [Phase 03](#phase-03), [Phase 10](#phase-10), [Phase 12](#phase-12)

### Features delivered

- [ ] <a id="f21-01"></a>**F21.01 — Manual payment recording** · `S · specified` — Post exact dated payments with payer, method, reference, currency and source evidence.

  **Workflow:** Post dated exact cash evidence with payer, method, currency, reference and attachments; allocation is explicit and provider execution is a separate capability. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** Posting twice with the same operation ID produces one payment.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F20.01](#f20-01) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-02"></a>**F21.02 — Partial payment allocation** · `S · specified` — Allocate payment amounts to one or more same-client/currency invoices.

  **Workflow:** Preview one payment's portions over compatible same-client/currency invoices; allocated plus unapplied value cannot exceed the net available payment. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** Allocation totals cannot exceed available payment or invoice debt.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.01](#f21-01) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-03"></a>**F21.03 — Balance and overdue projections** · `S · specified` — Derive unpaid, partial, settled and overdue flags from postings and due dates.

  **Workflow:** Compute remaining obligation, outstanding and surplus from issued debt, valid reductions and net settlement; overdue is derived from due date, not a destructive lifecycle change. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** A late payment clears overdue debt without rewriting invoice history.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.02](#f21-02) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-04"></a>**F21.04 — Unapplied client credit** · `S · specified` — Preserve overpayment as available client credit.

  **Workflow:** Keep money exceeding an invoice's remaining debt as explicit unapplied client credit rather than hiding it inside a negative invoice balance. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** An overpayment never produces a negative invoice balance.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.01](#f21-01) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-05"></a>**F21.05 — Client credit application** · `S · specified` — Allocate available client credit with reviewed amounts and source references.

  **Workflow:** Apply a selected available credit portion online with current invoice/credit revisions and unique ownership, preserving the remaining available balance. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** Two concurrent applications cannot consume the same credit twice.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.04](#f21-04), [F21.02](#f21-02) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-07"></a>**F21.07 — Manual refund recording** · `S · specified` — Post a cash refund linked to original payment or available client credit.

  **Workflow:** Record a refund against refundable original cash or client credit, previewing whether a linked debt reduction exists or the obligation will reopen. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** Recording a refund cannot silently void an invoice or contact a bank.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.01](#f21-01) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-08"></a>**F21.08 — Posting reversals** · `S · specified` — Correct payments/refunds/allocations with compensating events and reasons.

  **Workflow:** Use exact stored compensating events with reason and original references instead of editing/deleting posted payment, refund or allocation amounts. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** Reversal restores only the exact stored values and preserves original IDs.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.01](#f21-01) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-09"></a>**F21.09 — Payment receipt documents** · `E · optional expansion` — Render a client-facing receipt from posted payment and allocation facts.

  **Workflow:** Payment receipt output is proposed presentation of immutable payment/allocation evidence; disclose linked reversal history without rewriting original cash events. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** A reversed payment is marked through linked history rather than a falsified original receipt.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.01](#f21-01), [F20.04](#f20-04) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-10"></a>**F21.10 — Deposit schedules** · `S · specified` — Separate contracted deposit, invoice issued, cash received and final amount due.

  **Workflow:** Keep planned deposit, issued deposit invoice, cash receipt and remaining scope distinct; choose one approved final-billing deduction path for the same deposit. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** The deposit is deducted once in the final billing chain.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F19.10](#f19-10) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-12"></a>**F21.12 — Promised payment tracking** · `S · specified` — Record promises and follow-up dates without changing contractual due dates.

  **Workflow:** Record a promise and collection follow-up as subjective evidence separate from the contractual due date; forecasts must label its basis. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** A promised date affects the labeled forecast but not the invoice snapshot.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.03](#f21-03) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-13"></a>**F21.13 — Invoice disputes** · `S · specified` — Record dispute scope, reason, evidence and resolution status.

  **Workflow:** Attach dispute reason, scope and permitted evidence to existing debt; resolution records a separate event and preserves original issuance. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** Open disputes suppress configured reminders and preserve the original debt history.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F20.01](#f20-01) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-14"></a>**F21.14 — Write-off adjustments** · `S · specified` — Require approval and reason for operational collection adjustments.

  **Workflow:** Record approved write-off reductions separately from issued credit and cash, with no implicit tax-deductibility claim or repeated reduction of already-credited value. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** The UI makes no statutory deduction claim and retains the original invoice.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.03](#f21-03) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-15"></a>**F21.15 — Collection activity timeline** · `S · specified` — Link calls, reminders and outcomes under scoped finance access.

  **Workflow:** Link permitted collection activity to invoices and counterparties with occurred/recorded provenance; an internal logged message is not evidence of sending. **Rules:** Follow-up completion/snooze preserves history; recording communication never implies sending, and overdue catch-up is deduplicated.

  **Done when:** A project-only contributor cannot retrieve collection notes by direct API.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.01](#f21-01) **Specification:** Documented parent requirement/contract: [CRM-003 — Activity timeline, follow-ups, and communication records](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-003--activity-timeline-follow-ups-and-communication-records).

- [ ] <a id="f21-18"></a>**F21.18 — Client statements** · `E · optional expansion` — Generate as-of statements with invoices, payments, credits and closing balances by currency.

  **Workflow:** Client statements remain proposed as-of projections grouped by currency; reconstruct opening/posting/credit/refund/closing positions from immutable source events. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** The statement reconciles exactly to posted source records.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.03](#f21-03), [F21.04](#f21-04) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

**Demonstrate before closing this phase:** Partially settle an invoice, apply existing credit, reverse a mistaken posting and inspect the resulting balance and activity. Repeated requests cannot double-pay; corrections preserve the original evidence.

<a id="phase-14"></a>

## Phase 14 — See income, unpaid invoices and cash expectations

**User outcome:** A freelancer can see revenue, collected cash, overdue balances, expected cash and work progress with source-linked exports.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 05](#phase-05), [Phase 06](#phase-06), [Phase 08](#phase-08), [Phase 09](#phase-09), [Phase 10](#phase-10), [Phase 12](#phase-12), [Phase 13](#phase-13)

### Features delivered

- [ ] <a id="f25-01"></a>**F25.01 — Report definition registry** · `S · specified` — Version date basis, timezone, filters, formulas, currency and as-of boundary.

  **Workflow:** Record report version, date basis/timezone, scope, filters, currency inclusion/exclusion and consistent as-of boundary before computing or exporting totals. **Rules:** Definitions freeze basis, timezone, filters, scope and currency policy; every total reconciles to authorized source IDs.

  **Done when:** Changing a formula leaves an already-exported snapshot reproducible.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [INS-002 — Reporting definitions and drill-down](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-002--reporting-definitions-and-drill-down).

- [ ] <a id="f25-02"></a>**F25.02 — Revenue report** · `S · specified` — Separate invoiced net services, credits and configured taxes.

  **Workflow:** Project saved issued service components after selected discounts/credits and taxes according to the declared revenue basis, with authorized line-level drill-down. **Rules:** Definitions freeze basis, timezone, filters, scope and currency policy; every total reconciles to authorized source IDs.

  **Done when:** Totals reconcile to issued line components and source IDs.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F20.01](#f20-01) **Specification:** Documented parent requirement/contract: [INS-002 — Reporting definitions and drill-down](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-002--reporting-definitions-and-drill-down).

- [ ] <a id="f25-03"></a>**F25.03 — Cash collection report** · `S · specified` — Show posted collections/refunds by receipt basis and currency.

  **Workflow:** Project net receipts/refunds by explicit collection date and currency, retaining unapplied/retainer distinctions rather than labeling invoices as received cash. **Rules:** Definitions freeze basis, timezone, filters, scope and currency policy; every total reconciles to authorized source IDs.

  **Done when:** Collections never double-count retainers or unapplied cash.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F21.01](#f21-01) **Specification:** Documented parent requirement/contract: [INS-002 — Reporting definitions and drill-down](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-002--reporting-definitions-and-drill-down).

- [ ] <a id="f25-04"></a>**F25.04 — Receivables aging** · `S · specified` — Bucket debt by due-date basis with disputes and credits explicit.

  **Workflow:** Bucket outstanding debt against the stored due date/report timezone; identify credits, disputes, void exclusions and exact source reconciliation. **Rules:** Aging reconciles to current debt; forecast separates contractual due amounts, promises, draft projections and subjective weighted pipeline.

  **Done when:** The bucket sum equals outstanding receivables at the same as-of instant.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F21.03](#f21-03) **Specification:** Documented parent requirement/contract: [INS-004 — Receivables, aging and cash forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-004--receivables-aging-and-cash-forecast).

- [ ] <a id="f25-05"></a>**F25.05 — Cash forecast** · `S · specified` — Separate contracted due amounts, promises, recurring drafts and weighted opportunities.

  **Workflow:** Present contractual due amounts, subjective promised dates, recurring-draft projections and weighted open sales as separate forecast inputs with assumption/coverage labels. **Rules:** Aging reconciles to current debt; forecast separates contractual due amounts, promises, draft projections and subjective weighted pipeline.

  **Done when:** Changing a subjective promise never changes booked debt or guaranteed cash.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.04](#f25-04), [F21.12](#f21-12) **Specification:** Documented parent requirement/contract: [INS-004 — Receivables, aging and cash forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-004--receivables-aging-and-cash-forecast).

- [ ] <a id="f25-07"></a>**F25.07 — Effective rate report** · `S · specified` — Show labeled billed/collected rate with known work allocation and denominator.

  **Workflow:** Divide the selected billed/collected amount by known reviewed attributable hours; a missing denominator produces No data and no surveillance interpretation. **Rules:** Service margin uses the stated revenue basis minus known direct costs; missing cost is incomplete and no denominator means No data.

  **Done when:** No reviewed hours yields No data rather than infinity or zero earnings.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.03](#f25-03), [F16.10](#f16-10) **Specification:** Documented parent requirement/contract: [INS-003 — Profitability and effective rates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-003--profitability-and-effective-rates).

- [ ] <a id="f25-10"></a>**F25.10 — Delivery throughput report** · `S · specified` — Report cycle completion, blocked aging and milestone variance with documented semantics.

  **Workflow:** Measure cycle completion, blocked aging, milestone variance and accepted delivery using explicit denominators rather than interchangeable task/time counts. **Rules:** Task throughput, accepted delivery, capacity and effort are different measures; missing estimates remain visible and personnel surveillance is excluded.

  **Done when:** Task completion and client acceptance remain different measurements.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F13.03](#f13-03) **Specification:** Documented parent requirement/contract: [INS-005 — Capacity and delivery insights](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-005--capacity-and-delivery-insights).

- [ ] <a id="f25-14"></a>**F25.14 — Saved report views** · `S · specified` — Store personal/shared filters with current field permissions.

  **Workflow:** Save report filters/basis/presentation for personal or shared use and re-evaluate current field/resource access every time the definition runs. **Rules:** Render one authorized frozen snapshot; retry the same snapshot, verify Arabic output and recheck recipient access before scheduled delivery.

  **Done when:** A removed viewer cannot retrieve an old shared cost report.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F04.07](#f04-07) **Specification:** Documented parent requirement/contract: [INS-009 — Reports, schedules and exports](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-009--reports-schedules-and-exports).

- [ ] <a id="f25-15"></a>**F25.15 — Report CSV export** · `S · specified` — Export a consistent authorized snapshot with exact values and inert cells.

  **Workflow:** Export one consistent scoped snapshot with exact numeric strings, source refs/date basis and formula-safe text rather than live-changing paginated totals. **Rules:** Render one authorized frozen snapshot; retry the same snapshot, verify Arabic output and recheck recipient access before scheduled delivery.

  **Done when:** Formula-like client names remain text and totals reconcile across pages.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F34.04](#f34-04) **Specification:** Documented parent requirement/contract: [INS-009 — Reports, schedules and exports](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-009--reports-schedules-and-exports).

- [ ] <a id="f25-16"></a>**F25.16 — Report PDF export** · `S · specified` — Render localized as-of charts/tables from frozen snapshot data.

  **Workflow:** Render localized tables/charts from the frozen snapshot and tested fonts/assets; output failure leaves both report sources and snapshot identity unchanged. **Rules:** Render one authorized frozen snapshot; retry the same snapshot, verify Arabic output and recheck recipient access before scheduled delivery.

  **Done when:** Concurrent payment arrivals do not change pages within one export.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F20.04](#f20-04) **Specification:** Documented parent requirement/contract: [INS-009 — Reports, schedules and exports](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-009--reports-schedules-and-exports).

- [ ] <a id="f25-18"></a>**F25.18 — Business goals** · `S · specified` — Configure revenue/collection/utilization targets with explicit period and formula.

  **Workflow:** Store optional target, period, basis and source-linked progress for the selected business goal; dismissal/snooze cannot change source facts. **Rules:** Goals and thresholds expose formulas/source versions, dedupe crossings and never change charges, schedules or capacity automatically.

  **Done when:** A goal cannot change source facts or automatically charge clients.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01) **Specification:** Documented parent requirement/contract: [INS-010 — Goals, health and alerts](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-010--goals-health-and-alerts).

- [ ] <a id="f04-02"></a>**F04.02 — Personal home dashboard** · `S · specified` — Personal home with assigned tasks, reviews, active timer, pending drafts/conflicts and permitted finance cards.

  **Workflow:** Show source-linked assigned work, reviews, active timer, draft/conflict state and permitted finance cards with their filters/as-of. **Rules:** Widgets expose filters/as-of and source links; missing data is not zero and restricted finance never leaks through counts.

  **Done when:** A user lacking finance grants sees neither restricted amounts nor revealing finance counts.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.01](#f04-01) **Specification:** Documented parent requirement/contract: [INS-001 — Actionable home and saved views](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-001--actionable-home-and-saved-views).

  **Shell implementation progress — 2 November 2026:**

  - [x] Minimal account/workspace-context overview and links to existing account/team functions exist in `components/application-overview.tsx`; this is a shell landing screen, without business totals or a completed-dashboard claim.
  - [ ] Assigned work, reviews, active timer, protected draft/conflict indicators and authorized finance widgets remain unbuilt. The shell overview does not complete F04.02.

- [ ] <a id="f04-11"></a>**F04.11 — Personal view customization** · `E · optional expansion` — Configurable table columns/density and per-user widget ordering with accessible defaults.

  **Workflow:** Column/density/widget preferences affect layout only and cannot request restricted fields through a presentation setting. **Rules:** Views contain the same permitted records; saved views store configuration, bulk failures identify exact rows and keyboard alternatives accompany dragging.

  **Done when:** A saved cost column remains unavailable after the user's financial grant is removed.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.02](#f04-02), [F04.07](#f04-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-004 — Views and filters](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-004--views-and-filters).

- [ ] <a id="f03-16"></a>**F03.16 — Workspace usage dashboard** · `E · optional expansion` — Workspace storage/usage dashboards and policy-controlled limits, integrated with product entitlements.

  **Workflow:** Usage summaries use real measured resources and current access scope; numeric quotas/entitlements remain Q-02/Q-12 decisions. **Rules:** Monitor bounded workloads and minimal redacted diagnostics; product analytics/crash uploads are opt-in and provider limits are verified rather than assumed.

  **Done when:** Missing usage telemetry is shown as unavailable rather than a fabricated zero or unlimited guarantee.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.06](#f03-06), [F38.10](#f38-10) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Quotas and observability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#quotas-and-observability).

<details>
<summary>Supporting work included in this feature phase — 5 tracked entries</summary>

- [ ] <a id="f38-15"></a>**F38.15 — Service performance budgets** · `S · specified` — Measure declared browser/network/dataset fixtures and query/job bounds.

  **Workflow:** Declare measured supported browser/network/data/query/job budgets and index needs; private cache shortcuts cannot substitute for bounded authorized workloads. **Rules:** State owner, bounds/index needs, transaction scope, external jobs and recovery; add only concrete patterns and test pooled tenant isolation/concurrency.

  **Done when:** Report pagination stays bounded and protected data never uses unsafe shared cache shortcuts.

  **Feature prerequisites:** [F38.10](#f38-10) **Specification:** Documented parent requirement/contract: [Scalability review](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/design-patterns.md#scalability-review).

- [ ] <a id="f38-16"></a>**F38.16 — Tenant resource fairness** · `S · specified` — Bound pools, batch size, runtime, files and spend per tenant.

  **Workflow:** Limit page/batch/upload/job/time/pool/egress use and degrade nonessential operations first so one tenant cannot exhaust shared interactive capacity. **Rules:** Monitor bounded workloads and minimal redacted diagnostics; product analytics/crash uploads are opt-in and provider limits are verified rather than assumed.

  **Done when:** One large export cannot starve interactive work across all other tenants.

  **Feature prerequisites:** [F38.06](#f38-06), [F38.15](#f38-15) **Specification:** Documented parent requirement/contract: [Quotas and observability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#quotas-and-observability).

- [ ] <a id="f38-20"></a>**F38.20 — Provider cost and quota guardrails** · `S · specified` — Show usage, budget thresholds and safe degraded behavior for selected paid/free services.

  **Workflow:** Measure actual provider capacity/cost/quotas and surface pending/degraded work truthfully; caps/default alerts require approval rather than free-tier durability promises. **Rules:** Monitor bounded workloads and minimal redacted diagnostics; product analytics/crash uploads are opt-in and provider limits are verified rather than assumed.

  **Done when:** Provider quota exhaustion preserves accepted source records and exposes pending work honestly.

  **Feature prerequisites:** [F38.10](#f38-10) **Specification:** Documented parent requirement/contract: [Quotas and observability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#quotas-and-observability).

- [ ] <a id="f39-04"></a>**F39.04 — Keyboard and focus verification** · `S · specified` — Verify complete forms, tables, menus, dialogs and non-drag actions.

  **Workflow:** Exercise all navigation/forms/dialogs/tables and drag alternatives with visible unobscured focus and predictable focus restoration on success/error. **Rules:** Target WCAG 2.2 AA with keyboard/focus/reader/contrast/reflow/motion checks; automated results alone do not establish conformance.

  **Done when:** A keyboard user completes the client-to-payment flow without a focus trap.

  **Feature prerequisites:** [F39.01](#f39-01) **Specification:** Documented parent requirement/contract: [Accessibility acceptance](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#accessibility-acceptance).

- [ ] <a id="f39-05"></a>**F39.05 — Assistive technology verification** · `S · specified` — Test supported screen readers, labels, status announcements and errors.

  **Workflow:** Test supported screen-reader names/roles/reading order, validation summaries and bounded status announcements; exact browser/assistive matrix is Q-11. **Rules:** Target WCAG 2.2 AA with keyboard/focus/reader/contrast/reflow/motion checks; automated results alone do not establish conformance.

  **Done when:** Async save and validation states are announced without repeated noise.

  **Feature prerequisites:** [F39.04](#f39-04) **Specification:** Documented parent requirement/contract: [Accessibility acceptance](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#accessibility-acceptance).

</details>

**Demonstrate before closing this phase:** Compare issued revenue with actual cash after a partial payment. Drill each total back to its records, separate currencies and export the same filters. Label payment promises as assumptions and incomplete source data explicitly.

<a id="phase-15"></a>

## Phase 15 — Receive reminders and verified work notifications

**User outcome:** Members can receive a source-linked inbox, choose notification channels and quiet hours, and see real delivery outcomes.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 04](#phase-04), [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 08](#phase-08), [Phase 12](#phase-12)

### Features delivered

- [ ] <a id="f06-01"></a>**F06.01 — Notification inbox** · `S · specified` — In-app notification center with unread/read, dismiss, snooze and source links.

  **Workflow:** Open an in-app center with personal read/dismiss/snooze state and links checked against current source permissions. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** Marking a notice read does not complete the task or settle its invoice.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04) **Specification:** Documented parent requirement/contract: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f06-02"></a>**F06.02 — Domain-event notices** · `S · specified` — Task assignment, mention, review, milestone, time-approval and billing event categories respecting recipient scope.

  **Workflow:** Build assignment, mention, review and finance notices only from accepted source events and permitted projections. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** A role lacking invoice access receives no revealing invoice title, amount or count.

  **Feature prerequisites:** [F03.06](#f03-06), [F06.01](#f06-01) **Specification:** Documented parent requirement/contract: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f06-03"></a>**F06.03 — Notification preferences** · `S · specified` — Personal topic/channel preferences, timezone and quiet hours; separate documented security-notice policy.

  **Workflow:** Apply selected topic/channel/quiet-hour preferences in the user's timezone, with documented required-security-notice exceptions. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** Quiet hours delay eligible notices without disabling essential in-app access.

  **Feature prerequisites:** [F03.06](#f03-06), [F06.01](#f06-01) **Specification:** Documented parent requirement/contract: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f06-04"></a>**F06.04 — Browser notification consent** · `S · specified` — Opt-in browser notifications with capability detection and in-app fallback after denial.

  **Workflow:** Request browser notification consent only through a supported capability path and preserve an in-site alternative after denial. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** Denying browser permission does not suppress the source notification inside the app.

  **Feature prerequisites:** [F03.06](#f03-06), [F06.03](#f06-03) **Specification:** Documented parent requirement/contract: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f06-05"></a>**F06.05 — Notice deduplication** · `S · specified` — Deduplication by event/recipient/channel and summarized catch-up after downtime.

  **Workflow:** Identify deliveries by source event, recipient and channel and summarize missed activity rather than replaying an unlimited backlog. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** Repeated event ingestion creates one notice per eligible recipient/channel.

  **Feature prerequisites:** [F03.06](#f03-06), [F06.01](#f06-01), [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f06-06"></a>**F06.06 — Source-based reminders** · `S · specified` — Follow-up, budget threshold, renewal and overdue reminders with visible source/policy and suppression history.

  **Workflow:** Reminder content references the actual follow-up, threshold, renewal or overdue source and the policy/version that made it eligible. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** A snoozed source does not produce repeated old-date reminders.

  **Feature prerequisites:** [F03.06](#f03-06), [F06.05](#f06-05), [F30.05](#f30-05) **Specification:** Documented parent requirement/contract: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f06-07"></a>**F06.07 — Delivery authorization recheck** · `S · specified` — Recipient/grant/balance recheck before external delivery; paid/disputed/opted-out obligations are suppressed.

  **Workflow:** Immediately before external dispatch, recheck recipient scope and the relevant balance, dispute and suppression state. **Rules:** Verified sender/recipient/template snapshots have distinct queued/accepted/delivered/bounced/unknown states; reconcile uncertain delivery before any resend.

  **Done when:** Paying the final outstanding amount cancels an otherwise queued overdue reminder.

  **Feature prerequisites:** [F03.06](#f03-06), [F06.03](#f06-03), [F03.07](#f03-07) **Specification:** Documented parent requirement/contract: [INT-005 — Email and document delivery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-005--email-and-document-delivery).

- [ ] <a id="f06-08"></a>**F06.08 — Delivery outcome tracking** · `S · specified` — Separate queued, accepted, delivered, bounced, failed and unknown delivery states.

  **Workflow:** Show prepared/queued/provider-accepted/verified-delivered/bounced/failed/unknown independently from the underlying business state. **Rules:** Verified sender/recipient/template snapshots have distinct queued/accepted/delivered/bounced/unknown states; reconcile uncertain delivery before any resend.

  **Done when:** A provider timeout never appears as verified client delivery.

  **Feature prerequisites:** [F03.06](#f03-06), [F06.05](#f06-05), [F27.03](#f27-03) **Specification:** Documented parent requirement/contract: [INT-005 — Email and document delivery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-005--email-and-document-delivery).

- [ ] <a id="f06-09"></a>**F06.09 — Personal and team digests** · `E · optional expansion` — Daily/weekly personal digests and configurable team summaries through approved delivery jobs.

  **Workflow:** Digests are proposed scheduled summaries of permitted source events; recipient scope and approved delivery jobs remain prerequisites. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** A removed team member receives no old private summary after the schedule fires.

  **Feature prerequisites:** [F03.06](#f03-06), [F06.06](#f06-06), [F06.07](#f06-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f06-10"></a>**F06.10 — Reviewer escalation** · `E · optional expansion` — Notification routing/escalation to a delegated reviewer under explicit scope and quiet-hour rules.

  **Workflow:** Reviewer routing needs an explicit approved delegation/escalation policy and cannot expand either delegate's resource grants. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** An escalation never assigns a private review to someone who cannot read the source.

  **Feature prerequisites:** [F03.06](#f03-06), [F06.06](#f06-06), [F06.07](#f06-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f13-12"></a>**F13.12 — Task subscriptions** · `E · optional expansion` — Watch/follow tasks and explicit personal reminder subscriptions.

  **Workflow:** Watch/follow behavior is proposed personal routing; mention/thread read access remains required and subscriptions cannot expand scope. **Rules:** Internal/client-visible threads have separate classification; mentions require read access, presence is advisory/opt-out and surveillance is excluded.

  **Done when:** Removing the project grant prevents new subscribed comment content.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01), [F06.01](#f06-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-010 — Collaboration and activity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-010--collaboration-and-activity).

- [ ] <a id="f02-14"></a>**F02.14 — Security-event alerts** · `E · optional expansion` — New-session/security-change alerts, personal security history and session risk review without location-tracking promises.

  **Workflow:** Security notices use minimal metadata, scoped recipients and the documented exception policy for required alerts; avoid location or risk claims without evidence. **Rules:** Minimize/redact diagnostics and keep analytics opt-in; support is temporary/scoped and retention/recovery follow reviewed lifecycle decisions.

  **Done when:** A notice payload contains neither session secrets nor private tenant content.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.06](#f02-06), [F06.07](#f06-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Privacy, recovery and operations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#privacy-recovery-and-operations).

<details>
<summary>Supporting work included in this feature phase — 5 tracked entries</summary>

- [ ] <a id="f27-01"></a>**F27.01 — Connection registry** · `S · specified` — Show connected account, scopes, owner, health, last success and pending effects.

  **Workflow:** Show provider/account/workspace, enabled scopes, owner, last success, health and pending jobs across documented connection/degraded/reauth/disconnected states. **Rules:** Connections expose scopes/account/health and approved data sharing; read-only connections cannot write and disconnect cannot recall external copies.

  **Done when:** Switching workspace cannot reuse another tenant's provider account.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [INT-001 — Connector lifecycle](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-001--connector-lifecycle).

- [ ] <a id="f27-02"></a>**F27.02 — Provider authorization** · `S · specified` — Use reviewed OAuth/token exchange and server-only secret custody.

  **Workflow:** Preview fields leaving the workspace, validate state/redirect/account mapping and store provider credentials only on the trusted server boundary. **Rules:** Validate provider identity/state/redirects and keep minimal-scope secrets server-only; refresh failure suspends jobs without deleting business records.

  **Done when:** A wrong state/account callback cannot attach a connection.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.01](#f27-01), [F02.07](#f02-07), [F38.09](#f38-09) **Specification:** Documented parent requirement/contract: [INT-002 — Authorization and secret handling](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-002--authorization-and-secret-handling).

- [ ] <a id="f27-03"></a>**F27.03 — Verified email delivery** · `S · specified` — Send approved snapshot attachments through verified sender/reply-to settings.

  **Workflow:** Choose verified sender/reply-to and exact permitted recipient/artifact/template/locale; message identity tracks provider outcome separately from issue/payment. **Rules:** Verified sender/recipient/template snapshots have distinct queued/accepted/delivered/bounced/unknown states; reconcile uncertain delivery before any resend.

  **Done when:** A bounce or unknown provider outcome remains distinct from delivery success.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.02](#f27-02), [F30.05](#f30-05), [F38.14](#f38-14) **Specification:** Documented parent requirement/contract: [INT-005 — Email and document delivery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-005--email-and-document-delivery).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL/GATED: transactional email templates/transport exist; approved business sender/provider delivery and live inbox evidence remain pending.

  **Implementation progress — 1 November 2026:**

  - [x] Auth/contact email templates, escaped HTML/plain text and SMTP transport error handling are implemented in `emails/` and `lib/email.tsx`; synthetic render/send tests passed.
  - [ ] Workspace-approved business sender/recipients, immutable financial attachments, durable jobs and real delivered/bounced/unknown provider reconciliation remain pending.

- [ ] <a id="f27-04"></a>**F27.04 — Provider token refresh** · `S · specified` — Rotate/refresh server credentials and suspend failed connections.

  **Workflow:** Use minimal approved scope, supported server refresh and audit rotation; an expired/failed token suspends dependent jobs until repaired. **Rules:** Validate provider identity/state/redirects and keep minimal-scope secrets server-only; refresh failure suspends jobs without deleting business records.

  **Done when:** An expired token cannot trigger uncontrolled retries or delete source documents.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.02](#f27-02) **Specification:** Documented parent requirement/contract: [INT-002 — Authorization and secret handling](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-002--authorization-and-secret-handling).

- [ ] <a id="f27-05"></a>**F27.05 — Connection disconnect** · `S · specified` — Revoke credentials, cancel unsent jobs and disclose already-shared external copies.

  **Workflow:** Revoke/remove credentials where supported, cancel unsent work and disclose retained external copies; disconnected login remains distinct from business connector access. **Rules:** Connections expose scopes/account/health and approved data sharing; read-only connections cannot write and disconnect cannot recall external copies.

  **Done when:** A queued send after disconnect cannot execute with old authority.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.02](#f27-02) **Specification:** Documented parent requirement/contract: [INT-001 — Connector lifecycle](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-001--connector-lifecycle).

</details>

**Demonstrate before closing this phase:** Generate an assignment or reminder, retry delivery and keep one notice. Revoke the recipient before a queued send and cancel the unauthorized delivery. Show accepted, failed and unknown email outcomes accurately; browser notices require consent.

<a id="phase-16"></a>

## Phase 16 — Discuss work and share private project files

**User outcome:** Members can comment, mention permitted teammates, attach files and recover failed transfers without exposing private objects.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 12](#phase-12), [Phase 15](#phase-15)

### Features delivered

- [ ] <a id="f15-01"></a>**F15.01 — Internal comments and activity** · `S · specified` — Revisioned comments/notes, mentions, permitted activity timeline and clear internal/client visibility.

  **Workflow:** Maintain scoped threads, mentions, edit history/resolution and explicit internal/client-visible classification; default disclosure stays internal. **Rules:** Internal/client-visible threads have separate classification; mentions require read access, presence is advisory/opt-out and surveillance is excluded.

  **Done when:** A client-facing flag cannot expose a thread whose publication was never authorized.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [WRK-010 — Collaboration and activity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-010--collaboration-and-activity).

- [ ] <a id="f15-03"></a>**F15.03 — Validated file uploads** · `S · specified` — Bounded staged upload, content validation/quarantine policy, integrity verification and safe download names.

  **Workflow:** Validate supported bytes/type/size/quota and integrity before committing a file reference; scanning/publication remains separately gated. **Rules:** Attachments retain hash/type/size/version and upload state; incomplete uploads are not final files and conflicting note bodies preserve revisions.

  **Done when:** An unverified or unsafe upload cannot appear as a downloadable committed deliverable.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F38.05](#f38-05) **Specification:** Documented parent requirement/contract: [WRK-011 — Files, notes and knowledge links](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-011--files-notes-and-knowledge-links).

- [ ] <a id="f15-02"></a>**F15.02 — Scoped file attachments** · `S · specified` — Scoped files attached to clients/projects/tasks/documents with immutable object/version references.

  **Workflow:** Reference a particular private object/version with hash, type, size, upload state and scope rather than a permanent public URL. **Rules:** Attachments retain hash/type/size/version and upload state; incomplete uploads are not final files and conflicting note bodies preserve revisions.

  **Done when:** Editing an object identifier cannot fetch a sibling client's bytes.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.03](#f15-03) **Specification:** Documented parent requirement/contract: [WRK-011 — Files, notes and knowledge links](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-011--files-notes-and-knowledge-links).

- [ ] <a id="f15-04"></a>**F15.04 — File transfer recovery** · `S · specified` — Upload progress/failure/retry and missing-file repair states without fake committed attachments.

  **Workflow:** Expose staging/uploading/verified/failed outcomes and proven retry behavior without inventing resumability before implementation. **Rules:** Attachments retain hash/type/size/version and upload state; incomplete uploads are not final files and conflicting note bodies preserve revisions.

  **Done when:** An interrupted upload keeps its repair state and cannot duplicate final references.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.03](#f15-03) **Specification:** Documented parent requirement/contract: [WRK-011 — Files, notes and knowledge links](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-011--files-notes-and-knowledge-links).

- [ ] <a id="f15-09"></a>**F15.09 — Safe mention notifications** · `S · specified` — Mention/review notifications exclude restricted snippets and respect revocation.

  **Workflow:** Resolve mentioned people against source read permission and revalidate before building notice snippets or external delivery. **Rules:** Internal/client-visible threads have separate classification; mentions require read access, presence is advisory/opt-out and surveillance is excluded.

  **Done when:** A removed reviewer receives no fresh restricted comment excerpt.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.01](#f15-01), [F06.07](#f06-07) **Specification:** Documented parent requirement/contract: [WRK-010 — Collaboration and activity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-010--collaboration-and-activity).

- [ ] <a id="f15-10"></a>**F15.10 — Threaded discussions** · `E · optional expansion` — Threaded discussions, resolved discussion markers and explicit task creation from a comment.

  **Workflow:** Threading/resolution is documented collaboration behavior; creating a task from a comment remains an extension requiring an explicit project/task action. **Rules:** Internal/client-visible threads have separate classification; mentions require read access, presence is advisory/opt-out and surveillance is excluded.

  **Done when:** Resolving a thread cannot accept client delivery or fabricate a billable task interval.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.01](#f15-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-010 — Collaboration and activity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-010--collaboration-and-activity).

- [ ] <a id="f15-11"></a>**F15.11 — Artifact annotations** · `E · optional expansion` — Annotated review on supported PDF/image artifacts with safe rendering and version-bound coordinates.

  **Workflow:** Artifact annotation is proposed; a future supported format must bind comments to immutable file/version coordinates and safe rendering. **Rules:** Publication selects exact content and reviewers online; new versions preserve prior evidence and require the applicable new approval.

  **Done when:** An annotation on v1 cannot silently move to different v2 content.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.02](#f15-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-009 — Deliverables and acceptance](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-009--deliverables-and-acceptance).

- [ ] <a id="f15-13"></a>**F15.13 — File comparison** · `E · optional expansion` — File version comparison and external-link attachments with safe URL handling and access disclosure.

  **Workflow:** File comparison/external-link previews are proposed additions over versioned references; safe URL access cannot widen file grants. **Rules:** Attachments retain hash/type/size/version and upload state; incomplete uploads are not final files and conflicting note bodies preserve revisions.

  **Done when:** An external preview cannot fetch an arbitrary private-network URL.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.02](#f15-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-011 — Files, notes and knowledge links](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-011--files-notes-and-knowledge-links).

- [ ] <a id="f15-14"></a>**F15.14 — Transient presence** · `E · optional expansion` — Transient presence/editing indicators with minimal retention; no employee monitoring or automatic merge claims.

  **Workflow:** Show opt-out advisory presence only; it neither proves saved edits nor measures attendance, keystrokes or employee productivity. **Rules:** Internal/client-visible threads have separate classification; mentions require read access, presence is advisory/opt-out and surveillance is excluded.

  **Done when:** Presence loss does not discard a draft or imply a user stopped billable work.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.01](#f15-01), [F05.12](#f05-12) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-010 — Collaboration and activity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-010--collaboration-and-activity).

<details>
<summary>Supporting work included in this feature phase — 2 tracked entries</summary>

- [ ] <a id="f02-11"></a>**F02.11 — Profile avatar** · `E · optional expansion` — Avatar upload/crop/removal using the private-file rules and controlled public projection if desired.

  **Workflow:** If selected, avatar handling reuses verified file upload/reference rules; public exposure needs an explicit allowed projection rather than an unrestricted object URL. **Rules:** Attachments retain hash/type/size/version and upload state; incomplete uploads are not final files and conflicting note bodies preserve revisions.

  **Done when:** A failed upload leaves the previous profile reference intact and unsafe bytes cannot become a public avatar.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F02.09](#f02-09), [F38.05](#f38-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-011 — Files, notes and knowledge links](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-011--files-notes-and-knowledge-links).

  **Implementation progress — 1 November 2026:**

  - [x] Existing provider-image display and initial-letter fallback are implemented in `components/site-header-auth.tsx` and `components/ui/avatar.tsx`; header rendering tests passed.
  - [ ] Private avatar upload, crop, replacement/removal and file-validation flows are not implemented; display alone does not complete this feature.

- [ ] <a id="f38-13"></a>**F38.13 — Independent file backup** · `S · specified` — Recover authorized blobs, checksums and metadata independently of live storage.

  **Workflow:** Back up private object bytes with metadata/manifests/checksums and recover required keys/config through restricted procedures; database restore alone cannot restore external files. **Rules:** User exports exclude auth secrets; service backups include sensitive auth data and require encryption/isolation and restored credential invalidation.

  **Done when:** A restored database can identify missing file versions and repair from tested backups.

  **Feature prerequisites:** [F38.05](#f38-05), [F38.12](#f38-12) **Specification:** Documented parent requirement/contract: [Backup classes](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#backup-classes).

</details>

**Demonstrate before closing this phase:** Upload a bounded file, interrupt and resume/retry its transfer, then download it as an allowed member. A guessed object ID or revoked member receives no bytes; mention suggestions reveal no hidden member.

<a id="phase-17"></a>

## Phase 17 — Submit deliverables and preserve versioned approvals

**User outcome:** A freelancer can publish a specific deliverable version for review, collect a decision and submit a revision.

**Build after:** [Phase 03](#phase-03), [Phase 07](#phase-07), [Phase 16](#phase-16)

### Features delivered

- [ ] <a id="f15-05"></a>**F15.05 — Deliverable review requests** · `S · specified` — Internal deliverable review requests with assigned reviewers and exact reviewed revision.

  **Workflow:** Assign permitted internal reviewers to one exact deliverable revision and its criteria before ready/publication transitions. **Rules:** Publication selects exact content and reviewers online; new versions preserve prior evidence and require the applicable new approval.

  **Done when:** An old review cannot approve replacement bytes under the same display name.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.02](#f15-02) **Specification:** Documented parent requirement/contract: [WRK-009 — Deliverables and acceptance](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-009--deliverables-and-acceptance).

- [ ] <a id="f15-06"></a>**F15.06 — Published deliverable versions** · `S · specified` — Publish selected deliverable versions; comments/acceptance/change requests reference that version.

  **Workflow:** Publish selected artifact/version/recipients online and bind acceptance/change requests to that exact publication. **Rules:** Publication selects exact content and reviewers online; new versions preserve prior evidence and require the applicable new approval.

  **Done when:** Client A cannot review an unshared version by changing a URL parameter.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.05](#f15-05) **Specification:** Documented parent requirement/contract: [WRK-009 — Deliverables and acceptance](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-009--deliverables-and-acceptance).

- [ ] <a id="f15-07"></a>**F15.07 — Approval-preserving revisions** · `S · specified` — New file/deliverable revisions preserve prior evidence and do not inherit previous approval silently.

  **Workflow:** Save replacements as new versions, preserving previous files and approval evidence with visible reapproval requirements. **Rules:** Publication selects exact content and reviewers online; new versions preserve prior evidence and require the applicable new approval.

  **Done when:** Replacing approved v1 produces v2 awaiting its own required review.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.06](#f15-06) **Specification:** Documented parent requirement/contract: [WRK-009 — Deliverables and acceptance](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-009--deliverables-and-acceptance).

- [ ] <a id="f15-12"></a>**F15.12 — Multi-step review** · `E · optional expansion` — Reviewer checklists/multiple approval steps and documented conflict/delegation policy.

  **Workflow:** Multi-step approval is proposed and needs reviewer/delegation/conflict policy; each approved decision still identifies its exact version. **Rules:** Publication selects exact content and reviewers online; new versions preserve prior evidence and require the applicable new approval.

  **Done when:** A removed reviewer or modified artifact cannot satisfy a stale approval step.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.05](#f15-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-009 — Deliverables and acceptance](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-009--deliverables-and-acceptance).

**Demonstrate before closing this phase:** Approve version one, publish version two and demonstrate that the first approval stays attached to version one. A stale response cannot silently approve the replacement.

<a id="phase-18"></a>

## Phase 18 — Save eligible work drafts and recover after disconnection

**User outcome:** A freelancer can keep approved drafts locally, inspect pending changes and resolve conflicts after reconnecting.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 09](#phase-09), [Phase 12](#phase-12)

### Features delivered

- [ ] <a id="f05-01"></a>**F05.01 — Protected draft eligibility** · `S · specified` — Explicit eligible draft classes and protected browser-storage enablement only after key-custody review.

  **Workflow:** Define minimal eligible draft classes and reviewed encryption/key custody before any protected persistent browser data is enabled. **Rules:** Protected persistence stays disabled until Q-06/Q-07 proof; atomic IndexedDB save handles denial/eviction/key loss without a fake durable acknowledgement.

  **Done when:** Without Q-06/Q-07 proof, input is memory-only with an explicit reload-loss limit.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [Offline-draft security and persistence gate](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#offline-draft-security-and-persistence-gate).

- [ ] <a id="f05-07"></a>**F05.07 — Reviewed field merging** · `S · specified` — Proven independent-field merging and explicit review for same-field/rich-text conflicts.

  **Workflow:** Merge independent fields only where the base revision proves independence; rich-text and financial facts do not receive casual last-write-wins merging. **Rules:** Same-key changed payload is rejected; resolve lost replies through receipts, preserve same-field candidates and never merge financial postings.

  **Done when:** A proven independent field change survives while a same-field conflict remains reviewable.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.06](#f05-06) **Specification:** Documented parent requirement/contract: [Submission, refresh and conflicts](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#submission-refresh-and-conflicts).

- [ ] <a id="f05-08"></a>**F05.08 — Draft identity and key isolation** · `S · specified` — Account/workspace isolation, lock/expiry/key-loss states and approved recoverable-draft export.

  **Workflow:** Tie draft access to the approved account/key/retention policy; expose key-loss or expiry honestly without promising recall of downloaded information. **Rules:** Protected persistence stays disabled until Q-06/Q-07 proof; atomic IndexedDB save handles denial/eviction/key loss without a fake durable acknowledgement.

  **Done when:** Account switching cannot reveal another identity's ciphertext contents or unlocked draft.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.01](#f05-01) **Specification:** Documented parent requirement/contract: [Offline-draft security and persistence gate](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#offline-draft-security-and-persistence-gate).

- [ ] <a id="f05-02"></a>**F05.02 — Atomic local draft save** · `S · specified` — Atomic draft plus stable pending-operation save; distinct unsaved/browser-saved/submitting/server-accepted labels.

  **Workflow:** Commit draft content and its stable pending operation together in approved IndexedDB storage, then announce browser save separately from server acceptance. **Rules:** Protected persistence stays disabled until Q-06/Q-07 proof; atomic IndexedDB save handles denial/eviction/key loss without a fake durable acknowledgement.

  **Done when:** Interrupting a local save never leaves an acknowledged draft with no associated pending operation.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.01](#f05-01), [F05.08](#f05-08) **Specification:** Documented parent requirement/contract: [Offline-draft security and persistence gate](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#offline-draft-security-and-persistence-gate).

- [ ] <a id="f05-03"></a>**F05.03 — Pending-operation inbox** · `S · specified` — Pending-operation list with linked records, operation status, retry/repair and current authorization.

  **Workflow:** List pending operations with target, scope, status and safe retry/repair; derive actor again from the current session on submission. **Rules:** Actor derives from verified session; expected revision and workspace/actor/type-scoped operation plus payload digest prevent stale or changed-payload replay.

  **Done when:** A quarantined permission failure is actionable and does not retry forever.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.02](#f05-02), [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [Common request/result envelope](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/api-contracts.md#common-requestresult-envelope).

- [ ] <a id="f05-04"></a>**F05.04 — Connection recovery** · `S · specified` — Network interruption/reconnect handling with bounded backoff and receipt lookup after lost replies.

  **Workflow:** Reconnect with bounded retries and obtain the scoped operation receipt when the original reply is unknown. **Rules:** Same-key changed payload is rejected; resolve lost replies through receipts, preserve same-field candidates and never merge financial postings.

  **Done when:** A committed operation with a lost reply returns its original result instead of creating another effect.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.03](#f05-03), [F05.06](#f05-06) **Specification:** Documented parent requirement/contract: [Submission, refresh and conflicts](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#submission-refresh-and-conflicts).

- [ ] <a id="f05-09"></a>**F05.09 — Storage-loss recovery** · `S · specified` — Quota/eviction/storage-denial handling without unprotected fallback or false save success.

  **Workflow:** Handle storage permission, quota and eviction failures without falling back to unprotected persistence or announcing a durable save. **Rules:** Protected persistence stays disabled until Q-06/Q-07 proof; atomic IndexedDB save handles denial/eviction/key loss without a fake durable acknowledgement.

  **Done when:** Denied persistence keeps current memory input visible with an honest recovery/loss explanation.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.02](#f05-02) **Specification:** Documented parent requirement/contract: [Offline-draft security and persistence gate](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#offline-draft-security-and-persistence-gate).

- [ ] <a id="f05-14"></a>**F05.14 — Draft storage cleanup** · `E · optional expansion` — User-visible draft-storage usage and a scoped cleanup preview that preserves unresolved work.

  **Workflow:** Storage cleanup needs Q-13 retention and unresolved-work preview; no numeric limit or automatic purge rule is inferred from this feature. **Rules:** Protected persistence stays disabled until Q-06/Q-07 proof; atomic IndexedDB save handles denial/eviction/key loss without a fake durable acknowledgement.

  **Done when:** Cleanup cannot discard an unresolved recoverable operation without the approved policy and explicit impact review.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.02](#f05-02), [F37.03](#f37-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Offline-draft security and persistence gate](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#offline-draft-security-and-persistence-gate).

- [ ] <a id="f05-15"></a>**F05.15 — Sync diagnostics** · `E · optional expansion` — Manual connectivity diagnostics and a redacted sync-health report for support.

  **Workflow:** Diagnostics expose only redacted build/error/health metadata with a preview; they do not dump tenant content, credentials or encryption keys. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** A support export contains no auth token, raw document or other account's pending payload.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.03](#f05-03), [F38.10](#f38-10) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f16-09"></a>**F16.09 — Provisional offline time** · `S · specified` — Provisional offline capture only under the draft contract; reconcile overlaps before billing.

  **Workflow:** Allow only eligible gated local capture as provisional evidence and reconcile overlap/current grants when submitting online. **Rules:** Retain original integer seconds and source metadata; uncertain or overlapping work requires review before billing and financial allocation locks evidence.

  **Done when:** An offline candidate cannot supersede the server timer or reserve invoice sources.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F05.05](#f05-05), [F05.02](#f05-02), [F16.06](#f16-06) **Specification:** Documented parent requirement/contract: [Requirements and user behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#requirements-and-user-behavior).

**Demonstrate before closing this phase:** Save one eligible draft, disconnect, edit, reload and reconnect; explicitly review a conflicting server revision. Exercise account switching, storage denial, eviction and key loss. Keep protected persistence disabled until its data/key/recovery policy is approved.

<a id="phase-19"></a>

## Phase 19 — Import business records and export workspace data

**User outcome:** A freelancer can preview supported imports, inspect row errors and download a scoped data/files export.

**Build after:** [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 09](#phase-09), [Phase 10](#phase-10), [Phase 12](#phase-12), [Phase 18](#phase-18)

### Features delivered

- [ ] <a id="f34-01"></a>**F34.01 — Import batch workspace** · `S · specified` — Stage uploads, field mapping, previews, row errors and confirmation per supported domain.

  **Workflow:** Stage supported inert uploads and preview encoding, units, dates, currency, field mapping and row errors before any authoritative domain mutation. **Rules:** Preview locale/unit/currency mappings, duplicates and row failures; stable batch/source IDs dedupe imports and consistent exports disclose omissions.

  **Done when:** Parsing failure leaves authoritative business tables unchanged.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04) **Specification:** Documented parent requirement/contract: [Import and export](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#import-and-export).

- [ ] <a id="f34-02"></a>**F34.02 — Import duplicate registry** · `S · specified` — Track provider/source IDs and batch provenance across retries.

  **Workflow:** Keep batch/row/provider/account source identity and content hash; exact repeats skip safely while changed matches require update/skip/new review. **Rules:** Preview locale/unit/currency mappings, duplicates and row failures; stable batch/source IDs dedupe imports and consistent exports disclose omissions.

  **Done when:** A repeated import cannot recreate clients, time or financial postings.

  **Feature prerequisites:** [F03.06](#f03-06), [F34.01](#f34-01) **Specification:** Documented parent requirement/contract: [Import and export](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#import-and-export).

- [ ] <a id="f34-03"></a>**F34.03 — Import rollback boundary** · `S · specified` — Undo only eligible unreferenced staged/imported work with an impact preview.

  **Workflow:** Rollback remains limited to unreferenced eligible imported work; referenced finance and accepted downstream effects require explicit compensating/correction review. **Rules:** Preview locale/unit/currency mappings, duplicates and row failures; stable batch/source IDs dedupe imports and consistent exports disclose omissions.

  **Done when:** Already-issued financial evidence cannot disappear through batch rollback.

  **Feature prerequisites:** [F03.06](#f03-06), [F34.02](#f34-02) **Specification:** Documented parent requirement/contract: [Import and export](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#import-and-export).

- [ ] <a id="f34-05"></a>**F34.05 — Portable workspace export** · `S · specified` — Generate permission-scoped data/files manifest with schema and missing-object list.

  **Workflow:** Export one consistent permitted record/file snapshot with IDs, policy/schema versions, as-of, counts, checksums and exclusions; never include auth secrets. **Rules:** Preview locale/unit/currency mappings, duplicates and row failures; stable batch/source IDs dedupe imports and consistent exports disclose omissions.

  **Done when:** A project-only export includes no cost data or unrelated client files.

  **Feature prerequisites:** [F03.06](#f03-06), [F34.04](#f34-04) **Specification:** Documented parent requirement/contract: [Import and export](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#import-and-export).

- [ ] <a id="f34-06"></a>**F34.06 — Export job lifecycle** · `S · specified` — Expose bounded progress, expiry, cancellation boundary and verified download.

  **Workflow:** Run bounded scoped export/render work with cancel/retry/expiry and verified access at download; browser cancellation leaves authoritative source records intact. **Rules:** Use allowlisted filters and stable bounded cursors; scope counts/files/exports and expose revision/as-of rather than mixing pending and committed totals.

  **Done when:** Revoked access blocks delivery of a previously queued private export.

  **Feature prerequisites:** [F03.06](#f03-06), [F34.05](#f34-05), [F30.05](#f30-05) **Specification:** Documented parent requirement/contract: [Queries, search and files](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/api-contracts.md#queries-search-and-files).

- [ ] <a id="f34-12"></a>**F34.12 — Draft salvage import** · `S · specified` — Review recovered browser drafts against current schema/grants without command replay.

  **Workflow:** Recovered browser input is staged reviewed draft material against current grants/schema/revisions; it cannot replay old commands, revive sessions or reset number authority. **Rules:** Validate manifests/relations/amounts/files in isolation, reconcile later external outcomes and invalidate restored sessions before reopening writes.

  **Done when:** A restored draft cannot resurrect deleted records or issue stale money.

  **Feature prerequisites:** [F03.06](#f03-06), [F05.09](#f05-09), [F34.01](#f34-01) **Specification:** Documented parent requirement/contract: [Isolated restore and reconciliation](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#isolated-restore-and-reconciliation).

- [ ] <a id="f07-11"></a>**F07.11 — Client data import and export** · `S · specified` — Filtered search, source-preserving import/export and private-field exclusion.

  **Workflow:** Preview mapped fields and duplicates before import, retain stable source IDs and export only permitted client/contact projections. **Rules:** Preview locale/unit/currency mappings, duplicates and row failures; stable batch/source IDs dedupe imports and consistent exports disclose omissions.

  **Done when:** Reimporting an exact source creates no duplicate and private notes stay out of an ordinary export.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.01](#f07-01), [F34.01](#f34-01), [F34.05](#f34-05) **Specification:** Documented parent requirement/contract: [Import and export](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#import-and-export).

- [ ] <a id="f17-11"></a>**F17.11 — Time import** · `S · specified` — Preview unit/timezone mapping, external IDs, row errors and duplicate handling.

  **Workflow:** Preview source IDs, timezone, units, mappings, row errors and duplicates before accepting imported time; preserve provenance and permitted rollback boundary. **Rules:** Retain original integer seconds and source metadata; uncertain or overlapping work requires review before billing and financial allocation locks evidence.

  **Done when:** Importing the same source batch twice creates no new entries.

  **Feature prerequisites:** [F03.06](#f03-06), [F16.10](#f16-10), [F34.01](#f34-01) **Specification:** Documented parent requirement/contract: [Requirements and user behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#requirements-and-user-behavior).

- [ ] <a id="f17-12"></a>**F17.12 — Raw time export** · `S · specified` — Export scoped source seconds, revisions, timezone and allocation metadata.

  **Workflow:** Export filtered original seconds and source/review/allocation metadata with the correct privacy projection and declared date basis. **Rules:** Retain original integer seconds and source metadata; uncertain or overlapping work requires review before billing and financial allocation locks evidence.

  **Done when:** Summed exported seconds equal the filtered server records before display rounding.

  **Feature prerequisites:** [F03.06](#f03-06), [F16.10](#f16-10), [F34.04](#f34-04) **Specification:** Documented parent requirement/contract: [Requirements and user behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#requirements-and-user-behavior).

**Demonstrate before closing this phase:** Preview a synthetic import with invalid rows, import valid records twice without duplication, then export only allowed data. Revoke a queued export before download and prove that neither hidden fields nor unrelated files are delivered.

<a id="phase-20"></a>

## Phase 20 — Keep a client relationship history and follow-ups

**User outcome:** A freelancer can log conversations, set follow-ups, review relationships and merge confirmed duplicate clients safely.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 15](#phase-15)

### Features delivered

- [ ] <a id="f07-05"></a>**F07.05 — Client duplicate merge** · `S · specified` — Duplicate suggestions with disambiguation; reviewed atomic merge with alias/history and recovery protection.

  **Workflow:** Preview conflicts and affected relationships, select a surviving ID and preserve alias/history under the documented recovery prerequisite. **Rules:** Referenced parties archive rather than disappear; duplicates are suggestions, and merge needs atomic links plus proven backup or reversible journal.

  **Done when:** A failed merge leaves both originals and all links intact.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.01](#f07-01), [F07.03](#f07-03) **Specification:** Documented parent requirement/contract: [CRM-001 — Clients, contacts, and relationship integrity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-001--clients-contacts-and-relationship-integrity).

- [ ] <a id="f07-08"></a>**F07.08 — Communication activity records** · `S · specified` — Manual calls/meetings/email-summary notes with occurred/recorded timestamps and actual provenance.

  **Workflow:** Log subject, occurred/recorded time, outcome, next action and manual/import/connector provenance; an email summary is an internal activity record. **Rules:** Follow-up completion/snooze preserves history; recording communication never implies sending, and overdue catch-up is deduplicated.

  **Done when:** Logging a call or email sends no external message.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.03](#f07-03) **Specification:** Documented parent requirement/contract: [CRM-003 — Activity timeline, follow-ups, and communication records](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-003--activity-timeline-follow-ups-and-communication-records).

- [ ] <a id="f07-09"></a>**F07.09 — Client follow-ups** · `S · specified` — Follow-up scheduling/completion/snooze/cancel and owner assignment without silently sending a message.

  **Workflow:** Schedule, complete, snooze or cancel follow-ups while retaining old dates; create the next activity only through an explicit choice. **Rules:** Follow-up completion/snooze preserves history; recording communication never implies sending, and overdue catch-up is deduplicated.

  **Done when:** A missed reminder crossed while the browser was closed appears once on return.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.08](#f07-08), [F06.06](#f06-06) **Specification:** Documented parent requirement/contract: [CRM-003 — Activity timeline, follow-ups, and communication records](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-003--activity-timeline-follow-ups-and-communication-records).

- [ ] <a id="f07-10"></a>**F07.10 — Relationship reviews** · `S · specified` — Relationship review dates, renewal context and explainable health indicators.

  **Workflow:** Review renewal dates, delivery issues and permitted overdue values with source timestamps; label missing evidence as unknown. **Rules:** Health links to dated source evidence; missing history means unknown, and renewal opportunities never renew contracts or charge clients.

  **Done when:** A client with no calls is not automatically labeled dissatisfied.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.09](#f07-09) **Specification:** Documented parent requirement/contract: [CRM-010 — Renewals, account reviews, and explainable health](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-010--renewals-account-reviews-and-explainable-health).

- [ ] <a id="f07-14"></a>**F07.14 — Contact consent and suppression** · `E · optional expansion` — Consent/preference evidence and contact suppression lists for explicitly enabled communications.

  **Workflow:** Activity/contact provenance is not proof of legal marketing consent; any communication suppression model needs explicit policy and delivery enforcement. **Rules:** Follow-up completion/snooze preserves history; recording communication never implies sending, and overdue catch-up is deduplicated.

  **Done when:** A suppressed contact cannot receive an optional queued communication merely because they remain a billing contact.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F07.03](#f07-03), [F37.02](#f37-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-003 — Activity timeline, follow-ups, and communication records](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-003--activity-timeline-follow-ups-and-communication-records).

<details>
<summary>Supporting work included in this feature phase — 2 tracked entries</summary>

- [ ] <a id="f37-02"></a>**F37.02 — Consent records** · `E · optional expansion` — Track optional analytics/communication choices with timestamp and policy version.

  **Workflow:** Consent records remain proposed evidence of optional analytics/communications choices with defined scope/version/withdrawal semantics, not inferred legal consent from contact provenance. **Rules:** Minimize/redact diagnostics and keep analytics opt-in; support is temporary/scoped and retention/recovery follow reviewed lifecycle decisions.

  **Done when:** Withdrawal suppresses future optional collection without falsifying historical consent.

  **Feature prerequisites:** [F37.01](#f37-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Privacy, recovery and operations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#privacy-recovery-and-operations).

- [ ] <a id="f37-07"></a>**F37.07 — Private analytics controls** · `S · specified` — Collect minimal opt-in product metrics with declared retention.

  **Workflow:** Use opt-in minimal product analytics/crash upload and reviewed operational logging retention, excluding raw private content and credential-bearing URLs. **Rules:** Minimize/redact diagnostics and keep analytics opt-in; support is temporary/scoped and retention/recovery follow reviewed lifecycle decisions.

  **Done when:** Declining analytics preserves the complete core workflow.

  **Feature prerequisites:** [F37.02](#f37-02) **Specification:** Documented parent requirement/contract: [Privacy, recovery and operations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#privacy-recovery-and-operations).

</details>

**Demonstrate before closing this phase:** Log a call with its actual provenance, schedule a follow-up and preview a duplicate merge. Verify atomic relationship updates and recovery; a shared email never creates membership or communication consent.

<a id="phase-21"></a>

## Phase 21 — Track leads, opportunities and sales forecasts

**User outcome:** A freelancer can capture a lead, move opportunities through a pipeline and review value, next action and forecast assumptions.

**Build after:** [Phase 06](#phase-06), [Phase 10](#phase-10), [Phase 20](#phase-20)

### Features delivered

- [ ] <a id="f08-01"></a>**F08.01 — Lead capture** · `S · specified` — Capture qualified clients or unqualified leads with source, title, problem/outcome, owner and next action.

  **Workflow:** Capture an unqualified name/client reference, opportunity title, source, intended outcome, owner and next action before complete financial estimation. **Rules:** Probability is an explicit 0–100% assumption; missing values stay unestimated and unlike currencies never become one unlabeled total.

  **Done when:** A lead without value saves as not estimated and contributes no invented cash.

  **Feature prerequisites:** [F07.01](#f07-01) **Specification:** Documented parent requirement/contract: [CRM-002 — Opportunities, pipeline, and weighted forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-002--opportunities-pipeline-and-weighted-forecast).

- [ ] <a id="f08-02"></a>**F08.02 — Opportunity pipeline** · `S · specified` — Pipeline list/Kanban with open/on-hold/won/lost semantics and keyboard stage changes.

  **Workflow:** Map configurable stages to open/on-hold/won/lost semantics and use the same validated transition for board and form changes. **Rules:** Probability is an explicit 0–100% assumption; missing values stay unestimated and unlike currencies never become one unlabeled total.

  **Done when:** A failed board save restores the prior visual stage while keeping recoverable intent.

  **Feature prerequisites:** [F07.01](#f07-01), [F08.01](#f08-01) **Specification:** Documented parent requirement/contract: [CRM-002 — Opportunities, pipeline, and weighted forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-002--opportunities-pipeline-and-weighted-forecast).

- [ ] <a id="f08-03"></a>**F08.03 — Opportunity value and dates** · `S · specified` — Expected amount/range/currency, probability, decision date and expected work window.

  **Workflow:** Record amount/range, one currency, explicit confidence and decision/work dates; missing values remain visible instead of defaulting to zero. **Rules:** Probability is an explicit 0–100% assumption; missing values stay unestimated and unlike currencies never become one unlabeled total.

  **Done when:** An invalid reversed range cannot enter the monetary forecast.

  **Feature prerequisites:** [F07.01](#f07-01), [F08.02](#f08-02), [F19.03](#f19-03) **Specification:** Documented parent requirement/contract: [CRM-002 — Opportunities, pipeline, and weighted forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-002--opportunities-pipeline-and-weighted-forecast).

- [ ] <a id="f08-04"></a>**F08.04 — Stage probabilities** · `S · specified` — Stage defaults with visible assumptions and validated 0–100% probability.

  **Workflow:** Proposed stage probabilities are visible defaults that the user controls, rather than an undisclosed prediction. **Rules:** Probability is an explicit 0–100% assumption; missing values stay unestimated and unlike currencies never become one unlabeled total.

  **Done when:** Values below zero or above 100 are rejected through direct and UI mutations.

  **Feature prerequisites:** [F07.01](#f07-01), [F08.02](#f08-02) **Specification:** Documented parent requirement/contract: [CRM-002 — Opportunities, pipeline, and weighted forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-002--opportunities-pipeline-and-weighted-forecast).

- [ ] <a id="f08-05"></a>**F08.05 — Weighted sales forecast** · `S · specified` — Weighted forecasts grouped by currency and clearly separated from contracted revenue and cash.

  **Workflow:** Compute weighted open opportunity value separately from signed backlog, invoiced revenue and collected cash, grouped by currency. **Rules:** Probability is an explicit 0–100% assumption; missing values stay unestimated and unlike currencies never become one unlabeled total.

  **Done when:** USD 10,000 at 40% contributes USD 4,000 to open forecast and zero to payments.

  **Feature prerequisites:** [F07.01](#f07-01), [F08.03](#f08-03), [F08.04](#f08-04) **Specification:** Documented parent requirement/contract: [CRM-002 — Opportunities, pipeline, and weighted forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-002--opportunities-pipeline-and-weighted-forecast).

- [ ] <a id="f08-06"></a>**F08.06 — Opportunity outcome history** · `S · specified` — Won engagement/manual reason, lost reason and reopen history without deleting past outcomes.

  **Workflow:** Won references accepted evidence or a manual reason; lost/reopened cycles retain earlier outcomes and their linked proposals. **Rules:** Probability is an explicit 0–100% assumption; missing values stay unestimated and unlike currencies never become one unlabeled total.

  **Done when:** Reopening a lost deal cannot delete its earlier invoice or count two wins for one cycle.

  **Feature prerequisites:** [F07.01](#f07-01), [F08.02](#f08-02) **Specification:** Documented parent requirement/contract: [CRM-002 — Opportunities, pipeline, and weighted forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-002--opportunities-pipeline-and-weighted-forecast).

- [ ] <a id="f08-07"></a>**F08.07 — Sales relationship links** · `S · specified` — Linked contacts, services, proposals, activities and follow-up reminders.

  **Workflow:** Link selected contacts, proposed services, commercial versions and follow-up activities while preserving their individual permissions. **Rules:** Probability is an explicit 0–100% assumption; missing values stay unestimated and unlike currencies never become one unlabeled total.

  **Done when:** A pipeline link cannot expose internal contact notes to a portal guest.

  **Feature prerequisites:** [F07.01](#f07-01), [F08.01](#f08-01), [F07.03](#f07-03) **Specification:** Documented parent requirement/contract: [CRM-002 — Opportunities, pipeline, and weighted forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-002--opportunities-pipeline-and-weighted-forecast).

- [ ] <a id="f08-08"></a>**F08.08 — Pipeline completeness** · `S · specified` — Missing value/date coverage and stage-transition history.

  **Workflow:** Expose missing amounts/dates and stage history so forecasts identify their coverage rather than implying complete certainty. **Rules:** Probability is an explicit 0–100% assumption; missing values stay unestimated and unlike currencies never become one unlabeled total.

  **Done when:** A record with no expected decision date is counted as missing, not silently placed in the current period.

  **Feature prerequisites:** [F07.01](#f07-01), [F08.02](#f08-02) **Specification:** Documented parent requirement/contract: [CRM-002 — Opportunities, pipeline, and weighted forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-002--opportunities-pipeline-and-weighted-forecast).

- [ ] <a id="f08-10"></a>**F08.10 — Lead qualification** · `E · optional expansion` — Source/campaign conversion reports and configurable qualification checklists.

  **Workflow:** Qualification checklists/source conversion are extensions; existing stages and transition events remain the factual basis for any later metric. **Rules:** Probability is an explicit 0–100% assumption; missing values stay unestimated and unlike currencies never become one unlabeled total.

  **Done when:** A qualification answer cannot mark a deal legally accepted or create invoice authority.

  **Feature prerequisites:** [F07.01](#f07-01), [F08.01](#f08-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-002 — Opportunities, pipeline, and weighted forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-002--opportunities-pipeline-and-weighted-forecast).

- [ ] <a id="f08-12"></a>**F08.12 — Referral attribution** · `E · optional expansion` — Referral/source partner attribution without automatically creating commission liabilities.

  **Workflow:** Referral attribution is proposed source metadata; no commission, payable balance or provider money movement is implied by entering a source. **Rules:** Probability is an explicit 0–100% assumption; missing values stay unestimated and unlike currencies never become one unlabeled total.

  **Done when:** Editing the source of a won deal does not alter its contracted value or settlements.

  **Feature prerequisites:** [F07.01](#f07-01), [F08.01](#f08-01), [F37.02](#f37-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-002 — Opportunities, pipeline, and weighted forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-002--opportunities-pipeline-and-weighted-forecast).

**Demonstrate before closing this phase:** Move an opportunity from discovery to won or lost, reopen it and inspect the stage history. Weighted forecasts use visible assumptions and separate currencies rather than presenting a guaranteed cash total.

<a id="phase-22"></a>

## Phase 22 — Keep agreements, amendments and obligations

**User outcome:** A freelancer can register agreements, keep contract versions and track obligations and dates using reusable clauses.

**Build after:** [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 12](#phase-12), [Phase 15](#phase-15)

### Features delivered

- [ ] <a id="f10-09"></a>**F10.09 — Agreement register** · `S · specified` — Agreement/SOW/NDA/support agreement files and metadata with review/signature/executed/ended lifecycle.

  **Workflow:** Maintain agreement/SOW/NDA/support document parties, term/notice dates, related work and execution/evidence states. **Rules:** Executed copies remain fixed; amendments are linked documents, incomplete terms stay visible and legal/signature sufficiency remains a decision.

  **Done when:** Ending a contract does not void a linked invoice or delete delivered work.

  **Feature prerequisites:** [F03.06](#f03-06), [F07.01](#f07-01), [F38.05](#f38-05) **Specification:** Documented parent requirement/contract: [CRM-007 — Contracts, statements of work, and obligation tracking](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-007--contracts-statements-of-work-and-obligation-tracking).

- [ ] <a id="f10-10"></a>**F10.10 — Contract amendments** · `S · specified` — Amendments reference executed originals; terms and obligations are not rewritten in place.

  **Workflow:** Create a separate amendment linked to the executed original; never edit executed content or backfill invented clauses. **Rules:** Executed copies remain fixed; amendments are linked documents, incomplete terms stay visible and legal/signature sufficiency remains a decision.

  **Done when:** Changing an executed support period leaves both original and amendment traceable.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.09](#f10-09) **Specification:** Documented parent requirement/contract: [CRM-007 — Contracts, statements of work, and obligation tracking](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-007--contracts-statements-of-work-and-obligation-tracking).

- [ ] <a id="f10-11"></a>**F10.11 — Contract obligations** · `S · specified` — Renewal/notice/termination dates, responsible parties and obligation due/satisfied/waived/disputed evidence.

  **Workflow:** Track obligations with responsible actor, due state and satisfaction/waiver/dispute evidence; compute reminders from explicit date/timezone. **Rules:** Executed copies remain fixed; amendments are linked documents, incomplete terms stay visible and legal/signature sufficiency remains a decision.

  **Done when:** An ambiguous auto-renewal clause stays unresolved instead of being guessed.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.09](#f10-09), [F06.06](#f06-06) **Specification:** Documented parent requirement/contract: [CRM-007 — Contracts, statements of work, and obligation tracking](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-007--contracts-statements-of-work-and-obligation-tracking).

- [ ] <a id="f10-13"></a>**F10.13 — Clause library** · `E · optional expansion` — Controlled reusable clause/template library with reviewer/version provenance and no invented legal advice.

  **Workflow:** Clause/template reuse remains proposed controlled content; reviewer/version provenance cannot become a universal legal-compliance guarantee. **Rules:** Executed copies remain fixed; amendments are linked documents, incomplete terms stay visible and legal/signature sufficiency remains a decision.

  **Done when:** A missing legal clause is surfaced as incomplete rather than fabricated from a template name.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.09](#f10-09) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-007 — Contracts, statements of work, and obligation tracking](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-007--contracts-statements-of-work-and-obligation-tracking).

**Demonstrate before closing this phase:** Attach an agreement, add a dated amendment and schedule an obligation reminder. Prior versions remain readable, and templates make no unsupported jurisdiction-wide legal claims.

<a id="phase-23"></a>

## Phase 23 — Plan deadlines, milestones and team capacity

**User outcome:** Members can plan a timeline, milestones, working calendars, workload, sprints and explicitly reviewed scope changes.

**Build after:** [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 08](#phase-08), [Phase 09](#phase-09), [Phase 11](#phase-11), [Phase 12](#phase-12)

### Features delivered

- [ ] <a id="f14-01"></a>**F14.01 — Work calendar and timeline** · `S · specified` — Project/task calendar and timeline views with explicit timezone/date semantics.

  **Workflow:** Use one task/project record set across calendar/timeline and list/board with explicit dates, timezone and undated buckets. **Rules:** Views contain the same permitted records; saved views store configuration, bulk failures identify exact rows and keyboard alternatives accompany dragging.

  **Done when:** Changing view cannot hide otherwise permitted undated work or expose another project's task.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01) **Specification:** Documented parent requirement/contract: [WRK-004 — Views and filters](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-004--views-and-filters).

- [ ] <a id="f14-02"></a>**F14.02 — Delivery milestones** · `S · specified` — Milestones and dependencies with blocked/at-risk/complete context.

  **Workflow:** Track milestone target, included work, review criteria and accepted/cancelled evidence separately from task completion. **Rules:** Initial dependency semantics are finish-to-start; cycles are rejected and task completion does not imply external milestone acceptance.

  **Done when:** A canceled dependency produces a repair choice rather than auto-accepting the milestone.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01), [F13.06](#f13-06) **Specification:** Documented parent requirement/contract: [WRK-003 — Dependencies and milestones](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-003--dependencies-and-milestones).

- [ ] <a id="f14-03"></a>**F14.03 — Working-time calendar** · `S · specified` — Working days/hours, holidays and leave calendars under approved capacity policy.

  **Workflow:** Maintain member working timezone/hours and approved leave assumptions; calendar policy and limits remain Q-14. **Rules:** Capacity includes working calendar and leave; schedules remain suggestions until accepted, with missing estimates shown separately.

  **Done when:** Capacity calculations distinguish no configured calendar from zero available hours.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01), [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [WRK-005 — Scheduling, capacity and workload](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-005--scheduling-capacity-and-workload).

- [ ] <a id="f14-04"></a>**F14.04 — Workload capacity** · `S · specified` — Member/project workload and estimated/remaining capacity, labeling missing estimates.

  **Workflow:** Compute planned/remaining effort against available capacity and explicitly count missing estimates rather than guessing workload. **Rules:** Capacity includes working calendar and leave; schedules remain suggestions until accepted, with missing estimates shown separately.

  **Done when:** 28 planned hours against 20 available shows 8 overload and separate missing-estimate coverage.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01), [F14.03](#f14-03) **Specification:** Documented parent requirement/contract: [WRK-005 — Scheduling, capacity and workload](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-005--scheduling-capacity-and-workload).

- [ ] <a id="f14-05"></a>**F14.05 — Sprint planning** · `S · specified` — Sprint/cycle planning, carryover and completion history distinct from client acceptance.

  **Workflow:** Freeze cycle planned set/goals and completion history; moving unfinished work to the next cycle is an explicit action. **Rules:** Carryover is explicit; recurrence uses stable occurrence keys, previews calendar exceptions and runs enabled schedules on the server.

  **Done when:** Carryover preserves the previous cycle snapshot and does not mark unfinished work delivered.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01), [F13.03](#f13-03) **Specification:** Documented parent requirement/contract: [WRK-006 — Sprints, cycles and recurring work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-006--sprints-cycles-and-recurring-work).

- [ ] <a id="f14-06"></a>**F14.06 — Recurring work schedule** · `S · specified` — Recurring work cadence, exceptions, pause/end and missed-occurrence review.

  **Workflow:** Persist recurrence anchor, rule, timezone, end condition and occurrence identity; preview month-end/holiday and missed-run choices. **Rules:** Carryover is explicit; recurrence uses stable occurrence keys, previews calendar exceptions and runs enabled schedules on the server.

  **Done when:** Closing the tab does not stop an enabled server schedule or create duplicate catch-up occurrences.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01), [F30.05](#f30-05) **Specification:** Documented parent requirement/contract: [WRK-006 — Sprints, cycles and recurring work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-006--sprints-cycles-and-recurring-work).

- [ ] <a id="f14-07"></a>**F14.07 — Remaining effort** · `S · specified` — Estimate/actual/remaining effort and scope-change effects using source facts.

  **Workflow:** Compare source estimates, recorded work and remaining assumptions with approved scope/budget changes while preserving the accepted baseline. **Rules:** Capacity includes working calendar and leave; schedules remain suggestions until accepted, with missing estimates shown separately.

  **Done when:** A changed estimate cannot rewrite previously reported actual seconds.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01), [F16.10](#f16-10) **Specification:** Documented parent requirement/contract: [WRK-005 — Scheduling, capacity and workload](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-005--scheduling-capacity-and-workload).

- [ ] <a id="f14-08"></a>**F14.08 — Tentative resource bookings** · `E · optional expansion` — Tentative resource reservations and scenario planning before committed assignments.

  **Workflow:** Tentative reservations/scenarios remain proposed capacity plans; accepted assignment must still review availability and agreed dates. **Rules:** Capacity includes working calendar and leave; schedules remain suggestions until accepted, with missing estimates shown separately.

  **Done when:** A tentative booking does not create worked time or change a committed delivery date.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01), [F14.04](#f14-04) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-005 — Scheduling, capacity and workload](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-005--scheduling-capacity-and-workload).

- [ ] <a id="f14-09"></a>**F14.09 — Critical path** · `E · optional expansion` — Critical-path indicators calculated from supported dependency/date rules.

  **Workflow:** Critical-path analysis is proposed beyond the initial graph rule; supported relation/date assumptions need their own approved fixtures. **Rules:** Initial dependency semantics are finish-to-start; cycles are rejected and task completion does not imply external milestone acceptance.

  **Done when:** An unsupported dependency type cannot silently produce a trusted critical-path date.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01), [F13.06](#f13-06), [F14.07](#f14-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-003 — Dependencies and milestones](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-003--dependencies-and-milestones).

- [ ] <a id="f14-11"></a>**F14.11 — Leave review** · `E · optional expansion` — Team availability/leave approval workflow without payroll/employee-surveillance functions.

  **Workflow:** Leave approval is an extension to capacity records, not a payroll/attendance subsystem; reviewers and remaining-capacity rules need selection. **Rules:** Capacity includes working calendar and leave; schedules remain suggestions until accepted, with missing estimates shown separately.

  **Done when:** An unapproved leave rule cannot silently reduce a contractual work schedule.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01), [F14.03](#f14-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-005 — Scheduling, capacity and workload](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-005--scheduling-capacity-and-workload).

- [ ] <a id="f12-04"></a>**F12.04 — Scope change requests** · `S · specified` — Scope/effort/budget baselines and change requests with authorized approval of the exact proposed revision.

  **Workflow:** Submit requester/reason, affected scope, price/effort/date impact and options; apply only the reviewed approved baseline revision. **Rules:** An approved change applies only to its reviewed baseline revision; approval, invoice issuance and payment remain separate authorities.

  **Done when:** Applying against a changed affected baseline requires another review.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.01](#f12-01) **Specification:** Documented parent requirement/contract: [WRK-008 — Scope baseline and change requests](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-008--scope-baseline-and-change-requests).

- [ ] <a id="f12-08"></a>**F12.08 — Project templates** · `S · specified` — Reusable project templates, milestones and correctly remapped child records.

  **Workflow:** Copy versioned project content and remap tasks, dependencies, fields and milestones into the new allowed project scope. **Rules:** Supported custom fields are bounded and classified; used fields archive/migrate and template copies remap dependencies without cross-tenant links.

  **Done when:** A cloned dependency never points to an unrelated tenant's task.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.01](#f12-01) **Specification:** Documented parent requirement/contract: [WRK-007 — Templates and custom fields](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-007--templates-and-custom-fields).

- [ ] <a id="f12-13"></a>**F12.13 — Project planning scenarios** · `E · optional expansion` — Baseline/scenario comparison for proposed dates, effort and budget without changing accepted plans.

  **Workflow:** Proposed scenarios compare remaining effort/capacity/date assumptions without changing agreed commitments until reviewed acceptance. **Rules:** Capacity includes working calendar and leave; schedules remain suggestions until accepted, with missing estimates shown separately.

  **Done when:** Trying a scenario cannot overwrite the accepted delivery baseline.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.06](#f12-06), [F14.04](#f14-04) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-005 — Scheduling, capacity and workload](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-005--scheduling-capacity-and-workload).

- [ ] <a id="f13-09"></a>**F13.09 — Task planning templates** · `S · specified` — Task templates, recurring tasks, sprint/cycle assignment and stable occurrence IDs.

  **Workflow:** Templates/cycle assignment and recurrence keep version/occurrence provenance; unfinished cycle carryover remains explicit. **Rules:** Carryover is explicit; recurrence uses stable occurrence keys, previews calendar exceptions and runs enabled schedules on the server.

  **Done when:** Retried recurring generation creates one instance without editing completed earlier instances.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.02](#f13-02), [F12.08](#f12-08) **Specification:** Documented parent requirement/contract: [WRK-006 — Sprints, cycles and recurring work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-006--sprints-cycles-and-recurring-work).

**Demonstrate before closing this phase:** Set a milestone and dependency, record leave and inspect the changed capacity. Compare a planning scenario without mutating accepted delivery; recurring task retries create one scheduled occurrence.

<a id="phase-24"></a>

## Phase 24 — Price services and send a reviewed estimate

**User outcome:** A freelancer can maintain services, create exact estimates, compare alternatives and convert an approved quote into an invoice draft.

**Build after:** [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 10](#phase-10), [Phase 11](#phase-11), [Phase 23](#phase-23)

**Additional ordering clarification:** [Phase 23](#phase-23) supplies behavior referenced in the feature text but missing from its old prerequisite line. The original feature prerequisite lines remain intact.

### Features delivered

- [ ] <a id="f09-01"></a>**F09.01 — Service catalogue** · `S · specified` — Reusable service codes, descriptions, unit, quantity, currency, selling rate and active/archive state.

  **Workflow:** Maintain catalog code/title/description, unit, quantity, selling rate, currency, active state and revision; historic use archives rather than deletes. **Rules:** One currency and exact arithmetic apply; accepted/embedded estimates freeze, alternatives do not double count and missing cost is unavailable margin.

  **Done when:** Archiving a catalog service leaves earlier estimate snapshots reproducible.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03) **Specification:** Documented parent requirement/contract: [CRM-004 — Service catalog, estimates, and scenario comparison](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-004--service-catalog-estimates-and-scenario-comparison).

- [ ] <a id="f09-02"></a>**F09.02 — Exact estimate lines** · `S · specified` — Hourly/fixed/unit/milestone estimate lines with exact quantities and approved tax/discount policy.

  **Workflow:** Author hourly/fixed/unit/milestone lines in one currency using the selected exact pricing/tax/discount profile. **Rules:** One currency and exact arithmetic apply; accepted/embedded estimates freeze, alternatives do not double count and missing cost is unavailable margin.

  **Done when:** Unsupported tax policy blocks readiness rather than silently substituting a rate.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F07.01](#f07-01), [F09.01](#f09-01) **Specification:** Documented parent requirement/contract: [CRM-004 — Service catalog, estimates, and scenario comparison](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-004--service-catalog-estimates-and-scenario-comparison).

- [ ] <a id="f09-03"></a>**F09.03 — Estimate scope and validity** · `S · specified` — Scope, assumptions, exclusions, dependencies, effort, contingency and validity dates.

  **Workflow:** Record assumptions, exclusions, dependencies, validity and explicit effort/contingency context alongside the selected commercial scenario. **Rules:** One currency and exact arithmetic apply; accepted/embedded estimates freeze, alternatives do not double count and missing cost is unavailable margin.

  **Done when:** Missing scope terms remain incomplete fields instead of generated contractual promises.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F09.02](#f09-02) **Specification:** Documented parent requirement/contract: [CRM-004 — Service catalog, estimates, and scenario comparison](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-004--service-catalog-estimates-and-scenario-comparison).

- [ ] <a id="f09-04"></a>**F09.04 — Quote alternatives** · `S · specified` — Alternative/optional lines and scenario comparison that counts only the selected scenario.

  **Workflow:** Compare alternatives explicitly and select which scenario/options contribute to the commercial snapshot. **Rules:** One currency and exact arithmetic apply; accepted/embedded estimates freeze, alternatives do not double count and missing cost is unavailable margin.

  **Done when:** Choosing B removes A from the selected total without deleting either scenario's history.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F09.02](#f09-02) **Specification:** Documented parent requirement/contract: [CRM-004 — Service catalog, estimates, and scenario comparison](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-004--service-catalog-estimates-and-scenario-comparison).

- [ ] <a id="f09-05"></a>**F09.05 — Private estimate costing** · `S · specified` — Separate private cost assumptions and incomplete-margin warnings when inputs are missing.

  **Workflow:** Keep optional cost assumptions behind financial grants and identify incomplete margin when any required input is missing. **Rules:** One currency and exact arithmetic apply; accepted/embedded estimates freeze, alternatives do not double count and missing cost is unavailable margin.

  **Done when:** An absent cost is not treated as zero or exported in client output.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F09.02](#f09-02), [F17.02](#f17-02) **Specification:** Documented parent requirement/contract: [CRM-004 — Service catalog, estimates, and scenario comparison](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-004--service-catalog-estimates-and-scenario-comparison).

- [ ] <a id="f09-06"></a>**F09.06 — Catalogue price snapshots** · `S · specified` — Versioned catalog-to-estimate snapshots; draft refresh requires a before/after preview.

  **Workflow:** Save catalog revision references and snapshot values; refreshing an unaccepted draft requires a visible before/after preview. **Rules:** One currency and exact arithmetic apply; accepted/embedded estimates freeze, alternatives do not double count and missing cost is unavailable margin.

  **Done when:** Ten hours at USD 100 stays USD 1,000 after the catalog changes to USD 120.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F09.01](#f09-01), [F09.02](#f09-02) **Specification:** Documented parent requirement/contract: [CRM-004 — Service catalog, estimates, and scenario comparison](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-004--service-catalog-estimates-and-scenario-comparison).

- [ ] <a id="f09-07"></a>**F09.07 — Estimate approval** · `S · specified` — Quote readiness/approval and immutable embedded or accepted versions.

  **Workflow:** Move a complete draft to ready under the proposal workflow; embedded/accepted values freeze and later revisions cannot mutate them. **Rules:** One currency and exact arithmetic apply; accepted/embedded estimates freeze, alternatives do not double count and missing cost is unavailable margin.

  **Done when:** A stale draft revision cannot overwrite the estimate embedded in shared v1.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F09.03](#f09-03) **Specification:** Documented parent requirement/contract: [CRM-004 — Service catalog, estimates, and scenario comparison](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-004--service-catalog-estimates-and-scenario-comparison).

- [ ] <a id="f09-08"></a>**F09.08 — Quote conversion** · `S · specified` — Selected accepted lines convert to milestones/invoice drafts once, with source quantity/amount tracking.

  **Workflow:** Select accepted source lines/quantities for an invoice/milestone preview and retain consumed conversion identity. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** Retrying the same conversion cannot duplicate the amount already handed off.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F09.07](#f09-07), [F19.10](#f19-10) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue).

- [ ] <a id="f09-09"></a>**F09.09 — Localized estimates** · `S · specified` — English/Arabic output and exact saved calculation policy references.

  **Workflow:** Render the saved estimate with its document language and calculation policy, without translating legal names or changing amounts. **Rules:** One currency and exact arithmetic apply; accepted/embedded estimates freeze, alternatives do not double count and missing cost is unavailable margin.

  **Done when:** English and Arabic versions preserve the identical selected currency components.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F09.02](#f09-02) **Specification:** Documented parent requirement/contract: [CRM-004 — Service catalog, estimates, and scenario comparison](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-004--service-catalog-estimates-and-scenario-comparison).

- [ ] <a id="f09-10"></a>**F09.10 — Service bundles** · `E · optional expansion` — Reusable service bundles/packages with explicitly priced included/optional services.

  **Workflow:** Service packages remain proposed collections of catalog lines; included versus optional options still use explicit scenario selection. **Rules:** One currency and exact arithmetic apply; accepted/embedded estimates freeze, alternatives do not double count and missing cost is unavailable margin.

  **Done when:** A package cannot count both alternative offerings in one accepted total.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F09.01](#f09-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-004 — Service catalog, estimates, and scenario comparison](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-004--service-catalog-estimates-and-scenario-comparison).

- [ ] <a id="f09-11"></a>**F09.11 — Dated price books** · `E · optional expansion` — Volume/tier price books and customer-specific price agreements with approved effective-date rules.

  **Workflow:** Tier/customer price books require a separate effective-date/quantity policy; they may not silently reprice accepted source snapshots. **Rules:** One currency and exact arithmetic apply; accepted/embedded estimates freeze, alternatives do not double count and missing cost is unavailable margin.

  **Done when:** An unselected tier policy stays unavailable and changing a price book cannot affect shared v1.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F09.01](#f09-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-004 — Service catalog, estimates, and scenario comparison](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-004--service-catalog-estimates-and-scenario-comparison).

**Demonstrate before closing this phase:** Quote a service, change its catalogue price and retain the quote’s original snapshot. Approve one alternative and convert it twice with one resulting draft; private cost calculations never appear in client output.

<a id="phase-25"></a>

## Phase 25 — Write proposals and record commercial decisions

**User outcome:** A freelancer can write, preview, version and share a proposal, then record manual acceptance or rejection with evidence.

**Build after:** [Phase 03](#phase-03), [Phase 10](#phase-10), [Phase 12](#phase-12), [Phase 24](#phase-24)

### Features delivered

- [ ] <a id="f10-01"></a>**F10.01 — Proposal authoring** · `S · specified` — Proposal authoring with objectives, scope, deliverables, timeline, estimate and payment/acceptance terms.

  **Workflow:** Author objectives, scope/exclusions, deliverables, dependencies, timeline, estimate and payment/acceptance terms against one client/opportunity version. **Rules:** Sharing freezes a particular revision; later changes create a new draft and PDF export alone is not proof of sharing.

  **Done when:** Readiness identifies missing required sections or explicitly labeled nonpriced discovery scope.

  **Feature prerequisites:** [F03.06](#f03-06), [F09.02](#f09-02), [F38.05](#f38-05) **Specification:** Documented parent requirement/contract: [CRM-005 — Proposals, document revisions, and sharing](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-005--proposals-document-revisions-and-sharing).

- [ ] <a id="f10-02"></a>**F10.02 — Proposal lifecycle** · `S · specified` — Draft/ready/shared/accepted/rejected/expired/withdrawn/superseded lifecycle with exact revision identity.

  **Workflow:** Apply draft/ready/shared and terminal response states to the exact revision, preserving withdrawn/superseded alternatives. **Rules:** Sharing freezes a particular revision; later changes create a new draft and PDF export alone is not proof of sharing.

  **Done when:** A response to old v1 cannot approve current v2.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.01](#f10-01) **Specification:** Documented parent requirement/contract: [CRM-005 — Proposals, document revisions, and sharing](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-005--proposals-document-revisions-and-sharing).

- [ ] <a id="f10-03"></a>**F10.03 — Recipient preview** · `S · specified` — Recipient/content preview; private costs/internal notes excluded by construction.

  **Workflow:** Preview selected recipients and the precise client projection before export or sharing, excluding separate internal notes/cost assumptions. **Rules:** Sharing freezes a particular revision; later changes create a new draft and PDF export alone is not proof of sharing.

  **Done when:** Client preview contains neither private cost rates nor other-client attachments.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.01](#f10-01) **Specification:** Documented parent requirement/contract: [CRM-005 — Proposals, document revisions, and sharing](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-005--proposals-document-revisions-and-sharing).

- [ ] <a id="f10-05"></a>**F10.05 — Proposal versioning** · `S · specified` — Content changes after sharing create a new version while prior outputs remain reproducible.

  **Workflow:** After first sharing, content edits create a new draft revision and retain prior output, parties and issued metadata. **Rules:** Sharing freezes a particular revision; later changes create a new draft and PDF export alone is not proof of sharing.

  **Done when:** Editing scope/address after v1 sharing leaves the v1 PDF reproducible.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.01](#f10-01) **Specification:** Documented parent requirement/contract: [CRM-005 — Proposals, document revisions, and sharing](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-005--proposals-document-revisions-and-sharing).

- [ ] <a id="f10-04"></a>**F10.04 — Sharing evidence** · `S · specified` — Export, recorded sharing and verified delivery tracked as distinct evidence.

  **Workflow:** Record export, actual sharing method/recipient and verified delivery as separate evidence, with retries retaining the same source revision. **Rules:** Sharing freezes a particular revision; later changes create a new draft and PDF export alone is not proof of sharing.

  **Done when:** A downloaded PDF with no share event is Exported, sharing not recorded.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.03](#f10-03), [F10.05](#f10-05) **Specification:** Documented parent requirement/contract: [CRM-005 — Proposals, document revisions, and sharing](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-005--proposals-document-revisions-and-sharing).

- [ ] <a id="f10-06"></a>**F10.06 — Manual decision evidence** · `S · specified` — Manual decision capture recording the actual capturing operator, purported actor, method, timestamps and evidence.

  **Workflow:** Record manual decision method, purported actor, capturing member, occurred/recorded timestamps, selected options and evidence level separately. **Rules:** Capture operator and purported client actor separately; stale responses require review and manual evidence cannot display as verified signature.

  **Done when:** A phone acceptance is labeled owner-recorded and cannot display as verified signature.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.05](#f10-05) **Specification:** Documented parent requirement/contract: [CRM-006 — Decisions, acceptance evidence, and disagreement](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-006--decisions-acceptance-evidence-and-disagreement).

- [ ] <a id="f10-08"></a>**F10.08 — Decision disputes and withdrawal** · `S · specified` — Rejection/change request/dispute/correction history; stale/withdrawn acceptance requires explicit review.

  **Workflow:** Preserve rejected/change-request/dispute evidence; stale/expired/withdrawn responses follow explicit review or a newly eligible version. **Rules:** Capture operator and purported client actor separately; stale responses require review and manual evidence cannot display as verified signature.

  **Done when:** Withdrawing v1 cannot make a queued response silently accept v2.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.06](#f10-06) **Specification:** Documented parent requirement/contract: [CRM-006 — Decisions, acceptance evidence, and disagreement](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-006--decisions-acceptance-evidence-and-disagreement).

- [ ] <a id="f10-15"></a>**F10.15 — Commercial version comparison** · `E · optional expansion` — Version comparison highlighting changed scope/price/terms before reapproval.

  **Workflow:** Version comparison is proposed over immutable revisions; show changed content without modifying prior acceptance scope or saved financial values. **Rules:** Sharing freezes a particular revision; later changes create a new draft and PDF export alone is not proof of sharing.

  **Done when:** Comparing v1/v2 cannot retroactively move v1's approval to v2.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.05](#f10-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-005 — Proposals, document revisions, and sharing](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-005--proposals-document-revisions-and-sharing).

- [ ] <a id="f09-12"></a>**F09.12 — Quote negotiation history** · `E · optional expansion` — Quote comparison/negotiation history and validity-expiry reminders.

  **Workflow:** Negotiation reminders and comparisons remain proposed; source proposal revisions and expiry evidence are retained rather than replacing prior terms. **Rules:** Sharing freezes a particular revision; later changes create a new draft and PDF export alone is not proof of sharing.

  **Done when:** An expired quote reminder cannot silently extend validity or accept new prices.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F09.03](#f09-03), [F10.06](#f10-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-005 — Proposals, document revisions, and sharing](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-005--proposals-document-revisions-and-sharing).

**Demonstrate before closing this phase:** Share version one, revise the proposal and record the recipient’s actual decision against its exact version. Exporting or copying a link is not verified delivery; a manual phone/email note is labeled as such.

<a id="phase-26"></a>

## Phase 26 — Onboard a client and turn accepted work into a project

**User outcome:** A freelancer can request client information, follow an access-readiness checklist, hand accepted scope into a project and manage renewals or offboarding.

**Build after:** [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 15](#phase-15), [Phase 22](#phase-22), [Phase 23](#phase-23), [Phase 25](#phase-25)

**Additional ordering clarification:** [Phase 23](#phase-23) supplies behavior referenced in the feature text but missing from its old prerequisite line. The original feature prerequisite lines remain intact.

### Features delivered

- [ ] <a id="f11-01"></a>**F11.01 — Onboarding questionnaires** · `S · specified` — Engagement-specific onboarding questionnaires, readiness checklists and assignees/due dates.

  **Workflow:** Instantiate engagement questionnaires and readiness items with responsible people, due dates and explicit blocking/nonblocking classification. **Rules:** Readiness uses explicit blocking items, owner verification and documented waivers; templates cannot erase answers or store access credentials.

  **Done when:** A blocking unverified access item prevents readiness while a documented nonessential waiver does not.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [CRM-008 — Onboarding, questionnaires, and access readiness](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-008--onboarding-questionnaires-and-access-readiness).

- [ ] <a id="f11-02"></a>**F11.02 — Client information requests** · `S · specified` — Request and track required client files/information with explicit received/missing/blocked states.

  **Workflow:** Track requested information/files as missing, waiting, received or verified according to the onboarding item rather than inferring receipt from a filename. **Rules:** Readiness uses explicit blocking items, owner verification and documented waivers; templates cannot erase answers or store access credentials.

  **Done when:** A staged unverified upload cannot satisfy a blocking information request.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F11.01](#f11-01) **Specification:** Documented parent requirement/contract: [CRM-008 — Onboarding, questionnaires, and access readiness](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-008--onboarding-questionnaires-and-access-readiness).

- [ ] <a id="f11-03"></a>**F11.03 — Access-readiness checklist** · `S · specified` — Record access readiness using safe external references; do not turn notes into a credential vault.

  **Workflow:** Record access verification and safe external references only; repository/credential readiness is an owner assertion, not secret custody. **Rules:** Readiness uses explicit blocking items, owner verification and documented waivers; templates cannot erase answers or store access credentials.

  **Done when:** An invitation remains waiting until access is actually verified.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F11.01](#f11-01) **Specification:** Documented parent requirement/contract: [CRM-008 — Onboarding, questionnaires, and access readiness](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-008--onboarding-questionnaires-and-access-readiness).

- [ ] <a id="f11-04"></a>**F11.04 — Onboarding templates** · `S · specified` — Copy reviewed onboarding/project/task templates with correctly remapped IDs.

  **Workflow:** Copy a versioned onboarding/project/checklist instance with remapped references and preserve answers independently of later template revisions. **Rules:** Supported custom fields are bounded and classified; used fields archive/migrate and template copies remap dependencies without cross-tenant links.

  **Done when:** Updating a template cannot erase a prior engagement's submitted response.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F11.01](#f11-01) **Specification:** Documented parent requirement/contract: [WRK-007 — Templates and custom fields](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-007--templates-and-custom-fields).

- [ ] <a id="f11-05"></a>**F11.05 — Engagement-to-project handoff** · `S · specified` — Accepted-version-to-project conversion with one handoff per source version and retry-safe mapping.

  **Workflow:** Preview projects/tasks/milestones from one selected accepted source and commit source mapping with the created result. **Rules:** Source mapping and project creation are atomic or resumable under one handoff key; accepted amendments require reviewed scope changes.

  **Done when:** Two Create project attempts return one mapped project and one task set.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F10.06](#f10-06), [F12.01](#f12-01) **Specification:** Documented parent requirement/contract: [CRM-009 — Accepted-engagement handoff, loss, and reopen](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-009--accepted-engagement-handoff-loss-and-reopen).

- [ ] <a id="f11-06"></a>**F11.06 — Accepted scope baseline** · `S · specified` — Preserve accepted scope, commercial terms and source-document links in project baselines.

  **Workflow:** Preserve accepted commercial versions, exclusions, effort/budget baseline and change history separately from current working estimates. **Rules:** An approved change applies only to its reviewed baseline revision; approval, invoice issuance and payment remain separate authorities.

  **Done when:** A later amendment enters scope-change review rather than overwriting the original agreement.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F11.05](#f11-05) **Specification:** Documented parent requirement/contract: [WRK-008 — Scope baseline and change requests](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-008--scope-baseline-and-change-requests).

- [ ] <a id="f11-07"></a>**F11.07 — Engagement reopening** · `S · specified` — Track lost/reopened engagement cycles and explain project creation/close decisions.

  **Workflow:** Reopen commercial work through a new cycle/revision; retain earlier won/lost outcomes, deliverables and financial evidence. **Rules:** Source mapping and project creation are atomic or resumable under one handoff key; accepted amendments require reviewed scope changes.

  **Done when:** A lost engagement with a discovery invoice keeps the invoice readable.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F10.06](#f10-06) **Specification:** Documented parent requirement/contract: [CRM-009 — Accepted-engagement handoff, loss, and reopen](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-009--accepted-engagement-handoff-loss-and-reopen).

- [ ] <a id="f11-08"></a>**F11.08 — Renewal reviews** · `S · specified` — Renewal/account-review reminders and relationship health with visible evidence/override reasons.

  **Workflow:** Drive renewal/account-review notices from recorded dates and source-linked deterministic health context, with visible reasons and stale coverage. **Rules:** Health links to dated source evidence; missing history means unknown, and renewal opportunities never renew contracts or charge clients.

  **Done when:** Creating a renewal opportunity cannot renew a contract or charge the client.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F10.09](#f10-09), [F06.06](#f06-06) **Specification:** Documented parent requirement/contract: [CRM-010 — Renewals, account reviews, and explainable health](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-010--renewals-account-reviews-and-explainable-health).

- [ ] <a id="f11-10"></a>**F11.10 — Client offboarding** · `E · optional expansion` — Reusable client handover/offboarding checklist including file delivery and access-removal confirmations.

  **Workflow:** Offboarding checklists remain proposed evidence of handover and access-removal review, without storing passwords or claiming an external transfer happened automatically. **Rules:** Moves preview client/currency/billing effects; allocated contradictions block moves, cross-workspace changes use reviewed import and identity history survives.

  **Done when:** Confirming a checklist cannot delete member time or an outstanding invoice.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F12.07](#f12-07), [F07.06](#f07-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-014 — Archive, transfer and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-014--archive-transfer-and-recovery).

**Demonstrate before closing this phase:** Complete a questionnaire, record access readiness without saving credentials and convert the same accepted engagement twice into one project. Preserve scope provenance and disclose unresolved renewal or offboarding obligations.

<a id="phase-27"></a>

## Phase 27 — Review timesheets and safely correct billed work

**User outcome:** Members can submit time for approval, lock accepted evidence and allocate part of an entry without double billing.

**Build after:** [Phase 03](#phase-03), [Phase 09](#phase-09), [Phase 11](#phase-11), [Phase 12](#phase-12)

### Features delivered

- [ ] <a id="f17-05"></a>**F17.05 — Timesheet submission** · `S · specified` — Submit an exact period and source revisions with optional reviewer policy.

  **Workflow:** Submit a particular period and source revisions; freeze the comparison set and record withdrawal before ordinary edits can proceed. **Rules:** Timer Running/Paused/RecoveryReview is separate from entry review, optional approval and financial allocation; one state never implies another.

  **Done when:** An edit after submission requires withdrawal or a new review revision.

  **Feature prerequisites:** [F03.06](#f03-06), [F16.10](#f16-10) **Specification:** Documented parent requirement/contract: [State model](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#state-model).

- [ ] <a id="f17-06"></a>**F17.06 — Timesheet approval** · `S · specified` — Approve, reject with reason or delegate review under current project grants.

  **Workflow:** Record reviewer identity, decision/reason and the reviewed revisions; changed approved work requires the selected new review path. **Rules:** Timer Running/Paused/RecoveryReview is separate from entry review, optional approval and financial allocation; one state never implies another.

  **Done when:** A removed reviewer cannot approve a stale open timesheet.

  **Feature prerequisites:** [F03.06](#f03-06), [F17.05](#f17-05) **Specification:** Documented parent requirement/contract: [State model](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#state-model).

- [ ] <a id="f17-07"></a>**F17.07 — Time locking and correction** · `S · specified` — Lock invoiced source facts; use audited adjustments for billed corrections.

  **Workflow:** Keep allocated source facts locked and route corrections through adjustment plus any required credit/replacement instead of normal edit. **Rules:** Use effective-dated rate snapshots and explicit missing-rate handling; billed facts are corrected through audited adjustments rather than ordinary edits.

  **Done when:** Editing a billed entry cannot alter the issued PDF or expose the same seconds again.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.01](#f20-01), [F21.06](#f21-06) **Specification:** Documented parent requirement/contract: [Rates, corrections, and billing handoff](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#rates-corrections-and-billing-handoff).

- [ ] <a id="f17-10"></a>**F17.10 — Partial time allocations** · `S · specified` — Allocate supported second ranges or quantities with exact conservation and visible remainder.

  **Workflow:** Track exact consumed portions/remainder and immutable invoice ownership for advanced partial allocation; release requires an explicit correction rule. **Rules:** Aggregate raw seconds before display rounding; approved billing policy controls grouping and allocations cannot consume more eligible source time.

  **Done when:** Successive partial allocations never exceed original eligible seconds.

  **Feature prerequisites:** [F03.06](#f03-06), [F17.09](#f17-09) **Specification:** Documented parent requirement/contract: [Time arithmetic and allocation policy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#time-arithmetic-and-allocation-policy).

- [ ] <a id="f17-13"></a>**F17.13 — Time correction review** · `E · optional expansion` — Route unusual adjustments to an authorized reviewer with reason and preserved evidence.

  **Workflow:** Unusual-adjustment review remains an extension; use existing revision/audit/financial-lock boundaries and decide reviewer policy before adding a new state. **Rules:** Retain original integer seconds and source metadata; uncertain or overlapping work requires review before billing and financial allocation locks evidence.

  **Done when:** A manager cannot approve adjustments outside assigned projects.

  **Feature prerequisites:** [F03.06](#f03-06), [F17.07](#f17-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Requirements and user behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#requirements-and-user-behavior).

**Demonstrate before closing this phase:** Submit and reject/revise a timesheet, approve it and allocate only part of its source seconds. Correct already billed time through a linked authorized adjustment; consumed and remaining seconds always reconcile.

<a id="phase-28"></a>

## Phase 28 — Invoice milestones and apply advanced pricing rules

**User outcome:** A freelancer can combine fixed, time and milestone charges and apply supported document discounts, inclusive/compound tax and cash rounding.

**Build after:** [Phase 03](#phase-03), [Phase 10](#phase-10), [Phase 11](#phase-11), [Phase 23](#phase-23)

### Features delivered

- [ ] <a id="f19-05"></a>**F19.05 — Document discounts** · `S · specified` — Allocate document discounts deterministically over eligible lines.

  **Workflow:** Distribute document discount over eligible remaining lines using the approved deterministic remainder rule and stable tie-breaking order. **Rules:** Calculation order is proposed pending Q-03; deterministic discounts, saved tax bases/order and component rounding must reconcile to the document total.

  **Done when:** One minor unit split across equal lines conserves exactly one unit.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.04](#f19-04) **Specification:** Documented parent requirement/contract: [Proposed calculation order](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#proposed-calculation-order).

- [ ] <a id="f19-07"></a>**F19.07 — Inclusive taxes** · `S · specified` — Extract included tax under a reviewed rounding profile.

  **Workflow:** Extract inclusive tax only under a selected tested rounding/basis profile; the saved net/tax components must reconstruct original gross exactly. **Rules:** Calculation order is proposed pending Q-03; deterministic discounts, saved tax bases/order and component rounding must reconcile to the document total.

  **Done when:** Net plus included tax exactly equals the stored gross total.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03) **Specification:** Documented parent requirement/contract: [Proposed calculation order](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#proposed-calculation-order).

- [ ] <a id="f19-08"></a>**F19.08 — Compound taxes** · `S · specified` — Apply only expressly enabled ordered tax components.

  **Workflow:** Enable compound calculations only after explicit ordered-component approval and fixtures; do not derive tax order from label sorting. **Rules:** Calculation order is proposed pending Q-03; deterministic discounts, saved tax bases/order and component rounding must reconcile to the document total.

  **Done when:** Reordering components changes the preview and requires a new policy version.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.06](#f19-06) **Specification:** Documented parent requirement/contract: [Proposed calculation order](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#proposed-calculation-order).

- [ ] <a id="f19-09"></a>**F19.09 — Cash rounding** · `E · optional expansion` — Itemize jurisdiction-approved cash adjustments separately from invoice arithmetic.

  **Workflow:** A separate cash-rounding component is a proposed market-specific policy; keep it visible and unavailable until the actual jurisdiction rules are reviewed. **Rules:** Country, precision, tax/discount order, number series, correction policy, reporting basis and providers are unresolved until explicitly selected.

  **Done when:** The adjustment is visible and never silently modifies line net amounts.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Decisions requiring user input before dependent work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#decisions-requiring-user-input-before-dependent-work).

- [ ] <a id="f19-13"></a>**F19.13 — Milestone invoice lines** · `S · specified` — Reference an approved milestone and tracked amount already converted.

  **Workflow:** Select compatible approved milestone source/amount for conversion and retain consumed identity; milestone acceptance does not mean money was received. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** Repeated milestone conversion cannot invoice the same amount twice.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.10](#f19-10), [F14.02](#f14-02) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue); [WRK-003 — Dependencies and milestones](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-003--dependencies-and-milestones); [Invoice issuance, ownership, and numbering](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#invoice-issuance-ownership-and-numbering).

- [ ] <a id="f19-14"></a>**F19.14 — Mixed invoice lines** · `S · specified` — Combine fixed, milestone, time and approved expenses for one client/currency.

  **Workflow:** Permit compatible hourly/fixed/milestone/expense lines only for one customer and document currency, with source references retained by type. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** A cross-client or cross-currency source is rejected.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.11](#f19-11), [F19.12](#f19-12), [F19.13](#f19-13) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue).

**Demonstrate before closing this phase:** Issue a mixed-line invoice using approved order-of-operations fixtures. Compare preview with the immutable issued totals and demonstrate that each enabled currency/tax profile conserves minor units.

<a id="phase-29"></a>

## Phase 29 — Bill recurring services on a schedule

**User outcome:** A freelancer can generate recurring invoice drafts and manage a client service subscription’s start, change and cancellation.

**Build after:** [Phase 03](#phase-03), [Phase 10](#phase-10), [Phase 12](#phase-12)

### Features delivered

- [ ] <a id="f22-01"></a>**F22.01 — Recurring invoice schedules** · `S · specified` — Configure versioned calendar rules, templates, start/end and timezone.

  **Workflow:** Store cadence, timezone, original calendar anchor, period/end rule, template revision and generation mode; preview upcoming occurrences under the selected month-end policy. **Rules:** Server jobs dedupe each period; draft generation is default, auto-issue/send are separate, and money retainers differ from included service units.

  **Done when:** Month-end and DST schedules resolve using explicit approved rules.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F19.10](#f19-10), [F30.05](#f30-05) **Specification:** Documented parent requirement/contract: [Advanced agreements and recurring behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#advanced-agreements-and-recurring-behavior).

- [ ] <a id="f22-02"></a>**F22.02 — Recurring draft generation** · `S · specified` — Create one draft per stable schedule occurrence.

  **Workflow:** Generate a draft for a stable accepted occurrence identity; server scheduling handles closed tabs and repeated/missed execution without duplicating a period. **Rules:** Server jobs dedupe each period; draft generation is default, auto-issue/send are separate, and money retainers differ from included service units.

  **Done when:** Duplicate workers and missed-run catch-up cannot create duplicate periods.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F22.01](#f22-01) **Specification:** Documented parent requirement/contract: [Advanced agreements and recurring behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#advanced-agreements-and-recurring-behavior); [INT-010 — Safe job execution](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-010--safe-job-execution).

- [ ] <a id="f22-03"></a>**F22.03 — Recurring schedule lifecycle** · `S · specified` — Preview, pause, resume and end schedules while retaining existing obligations.

  **Workflow:** Pause/resume/end prospective generation while retaining issued records; review missed create/skip/merge choices and recheck cancellation before any side effect. **Rules:** Server jobs dedupe each period; draft generation is default, auto-issue/send are separate, and money retainers differ from included service units.

  **Done when:** Stopping a schedule during a leased run prevents an unauthorized future effect.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F22.01](#f22-01) **Specification:** Documented parent requirement/contract: [Advanced agreements and recurring behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#advanced-agreements-and-recurring-behavior).

- [ ] <a id="f22-08"></a>**F22.08 — Service subscription plans** · `S · specified` — Define agreed periods, quantities, prices and cancellation conditions.

  **Workflow:** Record accepted plan/version, quantity, currency, period anchor, advance/arrears mode and activation evidence with the documented subscription lifecycle. **Rules:** Activation/changes are authorized online and effective-dated; proration is disabled until selected, and cancellation never silently erases debt.

  **Done when:** Plan changes preserve accepted terms and every issued period.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F22.01](#f22-01) **Specification:** Documented parent requirement/contract: [Client service subscriptions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#client-service-subscriptions).

- [ ] <a id="f22-09"></a>**F22.09 — Subscription plan changes** · `S · specified` — Preview upgrades/downgrades and explicitly selected proration.

  **Workflow:** Create effective-dated changes with separate next-period and selected current-period adjustment preview; proration stays disabled until its method is chosen. **Rules:** Activation/changes are authorized online and effective-dated; proration is disabled until selected, and cancellation never silently erases debt.

  **Done when:** A mid-period change cannot silently duplicate already-invoiced service.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F22.08](#f22-08) **Specification:** Documented parent requirement/contract: [Client service subscriptions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#client-service-subscriptions).

- [ ] <a id="f22-10"></a>**F22.10 — Subscription cancellation** · `S · specified` — Support agreed end-date or period-end termination with clear remaining obligations.

  **Workflow:** Apply explicit agreement end/cancellation dates and any approved grace/service consequences; preserve already-issued periods and outstanding debt. **Rules:** Activation/changes are authorized online and effective-dated; proration is disabled until selected, and cancellation never silently erases debt.

  **Done when:** Canceling does not delete invoices or fabricate a refund.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F22.08](#f22-08) **Specification:** Documented parent requirement/contract: [Client service subscriptions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#client-service-subscriptions).

**Demonstrate before closing this phase:** Run the same occurrence twice and keep one draft. Pause/resume or cancel a schedule without backfilling unintended invoices or silently issuing/sending a document.

<a id="phase-30"></a>

## Phase 30 — Manage prepaid retainers and service allowances

**User outcome:** A freelancer can manage prepaid money or included work units, replenishment, expiry and a client statement.

**Build after:** [Phase 03](#phase-03), [Phase 10](#phase-10), [Phase 11](#phase-11), [Phase 13](#phase-13), [Phase 15](#phase-15)

### Features delivered

- [ ] <a id="f22-04"></a>**F22.04 — Prepaid-money retainers** · `S · specified` — Track receipt, allocation, remaining money and linked agreements in one currency.

  **Workflow:** Track agreed prepayment, receipts, allocations, replenishment/refund and remaining money in one explicit model with the selected reporting basis. **Rules:** Server jobs dedupe each period; draft generation is default, auto-issue/send are separate, and money retainers differ from included service units.

  **Done when:** A retainer payment is not counted again as a new unrelated collection.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.01](#f21-01) **Specification:** Documented parent requirement/contract: [Advanced agreements and recurring behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#advanced-agreements-and-recurring-behavior).

- [ ] <a id="f22-05"></a>**F22.05 — Included-unit retainers** · `S · specified` — Track included service units with explicit consumption and overage rules.

  **Workflow:** Track included hours/units by service period, approved source-second consumption, remaining allowance and explicit overage rather than treating units as cash. **Rules:** Server jobs dedupe each period; draft generation is default, auto-issue/send are separate, and money retainers differ from included service units.

  **Done when:** Unused units are not silently treated as a cash credit.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F17.04](#f17-04) **Specification:** Documented parent requirement/contract: [Advanced agreements and recurring behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#advanced-agreements-and-recurring-behavior).

- [ ] <a id="f22-06"></a>**F22.06 — Retainer replenishment** · `S · specified` — Apply configured thresholds and reviewed top-up requests.

  **Workflow:** Use accepted retainer terms to identify replenishment need and create only the permitted review/draft action; bank debit requires a separate approved provider. **Rules:** Server jobs dedupe each period; draft generation is default, auto-issue/send are separate, and money retainers differ from included service units.

  **Done when:** Crossing a threshold suggests or drafts a request without creating unauthorized cash.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F22.04](#f22-04) **Specification:** Documented parent requirement/contract: [Advanced agreements and recurring behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#advanced-agreements-and-recurring-behavior).

- [ ] <a id="f22-07"></a>**F22.07 — Retainer rollover and expiry** · `S · specified` — Version permitted expiry, cancellation and rollover terms.

  **Workflow:** Persist rollover cap/expiry/cancellation terms with their agreement version and distinguish expired service allowance from a cash-refund event. **Rules:** Server jobs dedupe each period; draft generation is default, auto-issue/send are separate, and money retainers differ from included service units.

  **Done when:** A terms change does not retroactively consume prior remaining units.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F22.04](#f22-04) **Specification:** Documented parent requirement/contract: [Advanced agreements and recurring behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#advanced-agreements-and-recurring-behavior).

- [ ] <a id="f22-11"></a>**F22.11 — Retainer statements** · `S · specified` — Publish period consumption and remaining balance with source drill-down.

  **Workflow:** Expose retainer period consumption/reversal and remainder with exact source links, preserving the distinction between prepaid money and service allowance. **Rules:** Server jobs dedupe each period; draft generation is default, auto-issue/send are separate, and money retainers differ from included service units.

  **Done when:** Summed consumption plus remainder reconciles to the agreement ledger.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F22.04](#f22-04) **Specification:** Documented parent requirement/contract: [Advanced agreements and recurring behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#advanced-agreements-and-recurring-behavior).

- [ ] <a id="f22-12"></a>**F22.12 — Service allowance alerts** · `E · optional expansion` — Notify an authorized owner/client before approved allowance limits are crossed.

  **Workflow:** Allowance alerts remain proposed deterministic thresholds over the accepted retainer model; alerting alone cannot stop service or authorize overage billing. **Rules:** Server jobs dedupe each period; draft generation is default, auto-issue/send are separate, and money retainers differ from included service units.

  **Done when:** Alerts never auto-stop work or create an unapproved overage invoice.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F22.05](#f22-05), [F06.06](#f06-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Advanced agreements and recurring behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#advanced-agreements-and-recurring-behavior).

**Demonstrate before closing this phase:** Apply an allowance, cross its threshold and review overage and expiry. Money and included units remain separate balances; retries and reversals cannot create or consume the same allowance twice.

<a id="phase-31"></a>

## Phase 31 — Track project expenses and recover approved costs

**User outcome:** Members can record costs and receipts, submit expenses for approval and add permitted billable costs to an invoice.

**Build after:** [Phase 03](#phase-03), [Phase 07](#phase-07), [Phase 10](#phase-10), [Phase 12](#phase-12), [Phase 16](#phase-16)

### Features delivered

- [ ] <a id="f23-01"></a>**F23.01 — Expense records** · `S · specified` — Record supplier, date, category, amount/currency, tax evidence, payment source and project.

  **Workflow:** Record supplier/date/category, original amount/currency, tax evidence, payment source and project/client; label billable eligibility rather than inferring it from category. **Rules:** Original expense currency and rebilling conversions remain separate; allocated amounts conserve source value and credits do not silently reopen billing eligibility.

  **Done when:** Original foreign-currency values remain intact after billing conversion.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F12.01](#f12-01) **Specification:** Documented parent requirement/contract: [Expenses, reimbursement, and profitability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#expenses-reimbursement-and-profitability).

- [ ] <a id="f23-02"></a>**F23.02 — Receipt attachments** · `S · specified` — Attach validated private receipts with checksum and source linkage.

  **Workflow:** Reference verified private receipt bytes/hash and scope; keep missing/quarantined attachment state visible independently from the recorded cost. **Rules:** Attachments retain hash/type/size/version and upload state; incomplete uploads are not final files and conflicting note bodies preserve revisions.

  **Done when:** A missing or quarantined receipt shows repair status without deleting the expense.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.01](#f23-01), [F15.03](#f15-03) **Specification:** Documented parent requirement/contract: [WRK-011 — Files, notes and knowledge links](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-011--files-notes-and-knowledge-links).

- [ ] <a id="f23-03"></a>**F23.03 — Expense categories** · `S · specified` — Manage active/archive categories and permitted tax metadata.

  **Workflow:** Maintain category references and active/archive state while preserving historical expense labels, tax-policy versions and exportable original components. **Rules:** Original expense currency and rebilling conversions remain separate; allocated amounts conserve source value and credits do not silently reopen billing eligibility.

  **Done when:** Archiving a category preserves earlier recorded labels and totals.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.01](#f23-01) **Specification:** Documented parent requirement/contract: [Expenses, reimbursement, and profitability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#expenses-reimbursement-and-profitability).

- [ ] <a id="f23-04"></a>**F23.04 — Expense submission** · `S · specified` — Submit a frozen expense revision for optional reviewer approval.

  **Workflow:** When selected, submit the exact expense revision and evidence set; preserve the documented draft/recorded/submitted/approved/rejected distinction. **Rules:** Original expense currency and rebilling conversions remain separate; allocated amounts conserve source value and credits do not silently reopen billing eligibility.

  **Done when:** A subsequent amount edit invalidates prior approval for new billing use.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.01](#f23-01) **Specification:** Documented parent requirement/contract: [Expenses, reimbursement, and profitability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#expenses-reimbursement-and-profitability).

- [ ] <a id="f23-05"></a>**F23.05 — Expense approval** · `S · specified` — Approve/reject under current scope with reason and preserved history.

  **Workflow:** Approve/reject using current reviewer scope and reason; later amount/evidence changes require the applicable reviewed revision before invoice eligibility. **Rules:** Original expense currency and rebilling conversions remain separate; allocated amounts conserve source value and credits do not silently reopen billing eligibility.

  **Done when:** A reviewer lacking the project grant cannot approve via direct invocation.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.04](#f23-04) **Specification:** Documented parent requirement/contract: [Expenses, reimbursement, and profitability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#expenses-reimbursement-and-profitability).

- [ ] <a id="f23-06"></a>**F23.06 — Billable expense recovery** · `S · specified` — Convert approved expenses at cost or approved markup into invoice sources.

  **Workflow:** Reserve/consume approved eligible expense value once using at-cost/markup and explicit rebilling currency/rate; save original source and issue-time conversion. **Rules:** Original expense currency and rebilling conversions remain separate; allocated amounts conserve source value and credits do not silently reopen billing eligibility.

  **Done when:** Two invoices cannot recover the same expense amount twice.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.05](#f23-05), [F19.10](#f19-10) **Specification:** Documented parent requirement/contract: [Expenses, reimbursement, and profitability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#expenses-reimbursement-and-profitability).

- [ ] <a id="f23-07"></a>**F23.07 — Employee reimbursement records** · `E · optional expansion` — Track reimbursement owed/recorded to a member as operational evidence.

  **Workflow:** Member reimbursement records remain proposed operational evidence; selecting a recipient or marking recorded cannot execute payroll or a bank payment. **Rules:** Original expense currency and rebilling conversions remain separate; allocated amounts conserve source value and credits do not silently reopen billing eligibility.

  **Done when:** Reimbursement status does not move money or run payroll.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.05](#f23-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Expenses, reimbursement, and profitability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#expenses-reimbursement-and-profitability).

- [ ] <a id="f23-08"></a>**F23.08 — Recurring expense drafts** · `E · optional expansion` — Create dated expense candidates from confirmed schedules.

  **Workflow:** Recurring expense candidates remain an extension: recurring invoice schedules do not themselves define expense recurrence, recognition or paid status. **Rules:** Server jobs dedupe each period; draft generation is default, auto-issue/send are separate, and money retainers differ from included service units.

  **Done when:** A generated candidate is not presented as a paid expense.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.01](#f23-01), [F30.05](#f30-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Advanced agreements and recurring behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#advanced-agreements-and-recurring-behavior); [Expenses, reimbursement, and profitability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#expenses-reimbursement-and-profitability).

- [ ] <a id="f23-09"></a>**F23.09 — Manual mileage expenses** · `E · optional expansion` — Calculate user-entered distance under approved units and reimbursement rates.

  **Workflow:** Mileage remains an extension without approved units/rates/tax treatment; use explicit manual evidence and select market-specific policy before calculation. **Rules:** Country, precision, tax/discount order, number series, correction policy, reporting basis and providers are unresolved until explicitly selected.

  **Done when:** Unit conversion and rate-version changes preserve the original claim; no GPS is collected.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.01](#f23-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Decisions requiring user input before dependent work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#decisions-requiring-user-input-before-dependent-work).

- [ ] <a id="f23-13"></a>**F23.13 — Expense split allocation** · `E · optional expansion` — Allocate one expense across projects using exact conserved proportions.

  **Workflow:** Split one eligible expense into explicit project portions that sum exactly to the allocatable total, distinguishing personal/nonreimbursable parts and correction history. **Rules:** Original expense currency and rebilling conversions remain separate; allocated amounts conserve source value and credits do not silently reopen billing eligibility.

  **Done when:** Allocated amounts sum to the original approved expense exactly.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.01](#f23-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Expenses, reimbursement, and profitability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#expenses-reimbursement-and-profitability).

**Demonstrate before closing this phase:** Submit a receipt-backed expense, reject/revise/approve it, split its allocation and invoice the allowed recovery once. Reimbursements are records rather than an implied bank transfer; mileage is entered manually.

<a id="phase-32"></a>

## Phase 32 — Manage suppliers and subcontractor commitments

**User outcome:** A freelancer can maintain suppliers, associate subcontractors with work and compare committed costs with actual expenses.

**Build after:** [Phase 03](#phase-03), [Phase 07](#phase-07), [Phase 10](#phase-10), [Phase 31](#phase-31)

### Features delivered

- [ ] <a id="f23-10"></a>**F23.10 — Supplier directory** · `E · optional expansion` — Maintain vendor identity and safe contact references for costs.

  **Workflow:** A supplier directory is proposed reference data for existing supplier fields; account identity/access and financial visibility remain independent of a vendor name. **Rules:** Original expense currency and rebilling conversions remain separate; allocated amounts conserve source value and credits do not silently reopen billing eligibility.

  **Done when:** Supplier details remain private to permitted cost users.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.01](#f23-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Expenses, reimbursement, and profitability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#expenses-reimbursement-and-profitability).

- [ ] <a id="f23-11"></a>**F23.11 — Subcontractor engagements** · `E · optional expansion` — Link contractor terms, expected deliverables and manual costs to a project.

  **Workflow:** Subcontractor engagements remain proposed links to versioned agreement/delivery and expense facts; no employment classification, payroll or automatic workspace invitation is implied. **Rules:** Original expense currency and rebilling conversions remain separate; allocated amounts conserve source value and credits do not silently reopen billing eligibility.

  **Done when:** The feature neither grants workspace access nor posts payroll automatically.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.10](#f23-10), [F12.01](#f12-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Expenses, reimbursement, and profitability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#expenses-reimbursement-and-profitability).

- [ ] <a id="f23-12"></a>**F23.12 — Purchase commitments** · `E · optional expansion` — Record approved planned costs separately from invoiced or paid expenses.

  **Workflow:** Track proposed planned commitments separately from recorded expenses and collected/paid cash; choose the forecasting basis before including them in margin views. **Rules:** Original expense currency and rebilling conversions remain separate; allocated amounts conserve source value and credits do not silently reopen billing eligibility.

  **Done when:** Forecast commitments never inflate recorded cash expenses.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F23.10](#f23-10) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Expenses, reimbursement, and profitability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#expenses-reimbursement-and-profitability).

**Demonstrate before closing this phase:** Create a supplier engagement and purchase commitment, then record the corresponding cost. A commitment remains distinct from payment and does not grant the supplier workspace access.

<a id="phase-33"></a>

## Phase 33 — Match bank transactions and prepare accounting exports

**User outcome:** A freelancer can import bank statements, review suggested matches and export accounting records with traceable mappings.

**Build after:** [Phase 03](#phase-03), [Phase 10](#phase-10), [Phase 13](#phase-13), [Phase 19](#phase-19)

### Features delivered

- [ ] <a id="f24-01"></a>**F24.01 — Bank statement import** · `S · specified` — Preview approved CSV formats, date/amount mapping and stable source IDs.

  **Workflow:** Stage statement data with encoding/date/amount/currency/account mapping and original source identities; show duplicates, changed rows and private-field implications before commit. **Rules:** Preview locale/unit/currency mappings, duplicates and row failures; stable batch/source IDs dedupe imports and consistent exports disclose omissions.

  **Done when:** Reimporting a bank statement creates no duplicate transactions.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F34.01](#f34-01) **Specification:** Documented parent requirement/contract: [Import and export](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#import-and-export).

- [ ] <a id="f24-02"></a>**F24.02 — Suggested payment matching** · `S · specified` — Suggest matches by explicit date/reference/amount criteria for human confirmation.

  **Workflow:** Suggest source matches without posting them; human confirmation checks exact references/amounts and leaves ambiguous evidence in the unmatched set. **Rules:** Matching suggestions require confirmation; imports dedupe, exports neutralize formulas and unknown delivery reconciles before resend without changing issued records.

  **Done when:** An ambiguous match stays unresolved and never settles an invoice automatically.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F24.01](#f24-01), [F21.01](#f21-01) **Specification:** Documented parent requirement/contract: [Reconciliation, exports, delivery, and privacy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#reconciliation-exports-delivery-and-privacy).

- [ ] <a id="f24-03"></a>**F24.03 — Split and combined matching** · `S · specified` — Match one statement row to multiple postings or multiple rows to one payment.

  **Workflow:** Represent supported many-to-many matching with explicit fee/transfer/conversion components so every matched amount and remainder is explained. **Rules:** Matching suggestions require confirmation; imports dedupe, exports neutralize formulas and unknown delivery reconciles before resend without changing issued records.

  **Done when:** Exact matched components reconcile without inventing residual cash.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F24.02](#f24-02) **Specification:** Documented parent requirement/contract: [Reconciliation, exports, delivery, and privacy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#reconciliation-exports-delivery-and-privacy).

- [ ] <a id="f24-04"></a>**F24.04 — Provider fee separation** · `S · specified` — Record gross payment, fees and net payout as distinct facts.

  **Workflow:** Preserve gross captured cash, expense/fee components and net payout links; a reduced provider payout is not customer underpayment by itself. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** A fee does not reduce the customer's correctly paid invoice balance.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F24.01](#f24-01), [F21.01](#f21-01) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f24-05"></a>**F24.05 — Unmatched transaction inbox** · `S · specified` — Show unmatched items with original source and repair actions.

  **Workflow:** Keep unmatched, disputed, personal/excluded and partial rows visible with source identity and review status; excluding a suggestion does not delete its evidence. **Rules:** Matching suggestions require confirmation; imports dedupe, exports neutralize formulas and unknown delivery reconciles before resend without changing issued records.

  **Done when:** Dismissing a suggestion does not delete imported evidence.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F24.01](#f24-01) **Specification:** Documented parent requirement/contract: [Reconciliation, exports, delivery, and privacy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#reconciliation-exports-delivery-and-privacy).

- [ ] <a id="f24-06"></a>**F24.06 — Reconciliation reversal** · `S · specified` — Undo confirmed matches through audited revisions.

  **Workflow:** Undo matching through an audited relationship correction while retaining imported transactions and underlying posted payment/expense facts. **Rules:** Matching suggestions require confirmation; imports dedupe, exports neutralize formulas and unknown delivery reconciles before resend without changing issued records.

  **Done when:** Undo does not reverse the underlying real payment implicitly.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F24.02](#f24-02) **Specification:** Documented parent requirement/contract: [Reconciliation, exports, delivery, and privacy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#reconciliation-exports-delivery-and-privacy).

- [ ] <a id="f24-07"></a>**F24.07 — Cross-currency settlement review** · `S · specified` — Require explicit rate, date, amounts and rounding evidence for approved conversion.

  **Workflow:** Cross-currency review needs selected original/settlement amounts, source/date/rate and rounding policy; the ledger never assumes identical value from unlike currency codes. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** A currency mismatch never becomes an automatic 1:1 allocation.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F24.02](#f24-02) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue).

- [ ] <a id="f24-08"></a>**F24.08 — Accounting export** · `S · specified` — Export stable IDs, source refs, taxes, exact amounts and compensating entries.

  **Workflow:** Export stable posting/source IDs, exact values, dates, currencies, component mappings and reversal links that reconcile to the selected snapshot. **Rules:** Matching suggestions require confirmation; imports dedupe, exports neutralize formulas and unknown delivery reconciles before resend without changing issued records.

  **Done when:** An accountant can reconcile every row to an immutable source event.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.01](#f21-01), [F34.04](#f34-04) **Specification:** Documented parent requirement/contract: [Reconciliation, exports, delivery, and privacy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#reconciliation-exports-delivery-and-privacy).

- [ ] <a id="f24-09"></a>**F24.09 — Accounting mapping versions** · `S · specified` — Version categories, tax codes and target account mappings.

  **Workflow:** Version target category/tax/account/currency mappings and preserve the mapping used for each acknowledged export rather than rewriting prior provider history. **Rules:** Portable exports precede named adapters; mappings/acknowledgements are versioned, matches need confirmation and feeds remain read-only.

  **Done when:** Changing mappings does not alter previously acknowledged exports.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F24.08](#f24-08) **Specification:** Documented parent requirement/contract: [INT-007 — Accounting and bank context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-007--accounting-and-bank-context).

- [ ] <a id="f24-12"></a>**F24.12 — Financial close review** · `E · optional expansion` — Freeze a reviewed operational period with controlled later adjustments.

  **Workflow:** Operational close is proposed review state; define authorized late adjustments/reopening before activation and never treat closing as permission to edit issued history. **Rules:** Matching suggestions require confirmation; imports dedupe, exports neutralize formulas and unknown delivery reconciles before resend without changing issued records.

  **Done when:** A reopened period records actor/reason and does not edit issued documents.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F24.02](#f24-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Reconciliation, exports, delivery, and privacy](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#reconciliation-exports-delivery-and-privacy).

**Demonstrate before closing this phase:** Import a statement twice, review a split or combined match, separate a provider fee and reverse an incorrect match. Cross-currency differences are explicit; no imported row silently posts or initiates a transfer.

<a id="phase-34"></a>

## Phase 34 — Understand project margins, costs and utilization

**User outcome:** A freelancer can compare estimates with actual work, inspect margins and costs and see client concentration and recurring revenue.

**Build after:** [Phase 03](#phase-03), [Phase 09](#phase-09), [Phase 10](#phase-10), [Phase 11](#phase-11), [Phase 14](#phase-14), [Phase 21](#phase-21), [Phase 23](#phase-23), [Phase 29](#phase-29), [Phase 31](#phase-31)

### Features delivered

- [ ] <a id="f25-06"></a>**F25.06 — Project margin report** · `S · specified` — Subtract known direct expenses and versioned internal costs from the selected revenue basis.

  **Workflow:** Use stated invoiced or collection basis minus known direct expenses/versioned internal labor; expose missing allocations and keep cost values behind financial grants. **Rules:** Service margin uses the stated revenue basis minus known direct costs; missing cost is incomplete and no denominator means No data.

  **Done when:** Missing labor costs produce incomplete margin rather than inflated profit.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.02](#f25-02), [F17.02](#f17-02), [F23.01](#f23-01) **Specification:** Documented parent requirement/contract: [INS-003 — Profitability and effective rates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-003--profitability-and-effective-rates).

- [ ] <a id="f25-08"></a>**F25.08 — Utilization report** · `S · specified` — Compare reviewed work and approved available capacity with explicit leave rules.

  **Workflow:** Compare reviewed work against approved available capacity/leave policy and display formula/coverage; configured time targets are not inferred attendance. **Rules:** Task throughput, accepted delivery, capacity and effort are different measures; missing estimates remain visible and personnel surveillance is excluded.

  **Done when:** Missing capacity cannot become an employee productivity score.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F16.10](#f16-10), [F14.03](#f14-03) **Specification:** Documented parent requirement/contract: [INS-005 — Capacity and delivery insights](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-005--capacity-and-delivery-insights); [WRK-005 — Scheduling, capacity and workload](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-005--scheduling-capacity-and-workload).

- [ ] <a id="f25-09"></a>**F25.09 — Estimate versus actual report** · `S · specified` — Compare accepted effort/budget baselines to exact work and approved scope changes.

  **Workflow:** Compare actual exact source effort/cost with the accepted estimate/budget revision and separately show later approved scope changes. **Rules:** Task throughput, accepted delivery, capacity and effort are different measures; missing estimates remain visible and personnel surveillance is excluded.

  **Done when:** A later estimate edit does not rewrite the original baseline variance.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F14.07](#f14-07) **Specification:** Documented parent requirement/contract: [INS-005 — Capacity and delivery insights](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-005--capacity-and-delivery-insights).

- [ ] <a id="f25-11"></a>**F25.11 — Expense report** · `S · specified` — Group original expense values by category, project and payment basis.

  **Workflow:** Group original expense facts by permitted category/project/currency and chosen record/payment basis; prevent reimbursement from being counted twice. **Rules:** Definitions freeze basis, timezone, filters, scope and currency policy; every total reconciles to authorized source IDs.

  **Done when:** A reimbursable expense is not counted twice when invoiced.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F23.01](#f23-01) **Specification:** Documented parent requirement/contract: [INS-002 — Reporting definitions and drill-down](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-002--reporting-definitions-and-drill-down).

- [ ] <a id="f25-12"></a>**F25.12 — Tax component summary** · `S · specified` — Summarize saved components by approved reporting basis.

  **Workflow:** Aggregate saved tax components using the declared operational basis; jurisdiction-specific return preparation/filing remains outside the feature. **Rules:** Definitions freeze basis, timezone, filters, scope and currency policy; every total reconciles to authorized source IDs.

  **Done when:** The summary is labeled operational and makes no automatic filing claim.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.02](#f25-02), [F19.06](#f19-06) **Specification:** Documented parent requirement/contract: [INS-002 — Reporting definitions and drill-down](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-002--reporting-definitions-and-drill-down).

- [ ] <a id="f25-13"></a>**F25.13 — Currency consolidation** · `S · specified` — Use explicit reporting currency, frozen rate/date/source and missing-rate policy.

  **Workflow:** Retain originals and use a selected frozen reporting currency/rate/date/source only for explicit consolidation, marking missing or stale conversion evidence. **Rules:** Keep originals and default currency groups; consolidation needs frozen source/date/rate policy and missing-rate handling, not implied FX accounting.

  **Done when:** Unavailable FX shows stale/incomplete values and never rewrites originals.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F19.02](#f19-02) **Specification:** Documented parent requirement/contract: [INS-006 — Multi-currency reporting](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-006--multi-currency-reporting).

- [ ] <a id="f25-22"></a>**F25.22 — Client concentration report** · `E · optional expansion` — Show dependency on major clients using a selected revenue/cash basis.

  **Workflow:** Client concentration is proposed derivation over an approved revenue/cash basis; define period/currency/zero-denominator treatment before making a percentage claim. **Rules:** Definitions freeze basis, timezone, filters, scope and currency policy; every total reconciles to authorized source IDs.

  **Done when:** Percentages use a known nonzero denominator and keep currencies explicit.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.02](#f25-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INS-002 — Reporting definitions and drill-down](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-002--reporting-definitions-and-drill-down).

- [ ] <a id="f25-23"></a>**F25.23 — Sales conversion report** · `E · optional expansion` — Measure stage conversion, lead source and time-to-close from actual transitions.

  **Workflow:** Conversion reporting remains proposed analysis of actual semantic stage transitions and retained reopen cycles, not inferred acceptance or recognized revenue. **Rules:** Probability is an explicit 0–100% assumption; missing values stay unestimated and unlike currencies never become one unlabeled total.

  **Done when:** Reopened deals do not create duplicate wins.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F08.06](#f08-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-002 — Opportunities, pipeline, and weighted forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-002--opportunities-pipeline-and-weighted-forecast).

- [ ] <a id="f25-24"></a>**F25.24 — Recurring revenue report** · `E · optional expansion` — Show contracted recurring service values with explicit period/currency assumptions.

  **Workflow:** Recurring-revenue reporting remains proposed and must state contract/period/currency/active-term assumptions; generated drafts and unsigned forecasts are different facts. **Rules:** Server jobs dedupe each period; draft generation is default, auto-issue/send are separate, and money retainers differ from included service units.

  **Done when:** Unsigned proposals and canceled terms are not counted as active recurring revenue.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01), [F22.08](#f22-08) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Advanced agreements and recurring behavior](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#advanced-agreements-and-recurring-behavior).

**Demonstrate before closing this phase:** Reconcile a project margin with its revenue, source time and expenses. Missing costs are labeled, report currency conversion uses a named dated basis and a forecast is distinguishable from realized income.

<a id="phase-35"></a>

## Phase 35 — Save reusable knowledge and search across work

**User outcome:** Members can keep notes, snippets, decisions and runbooks, reuse templates and search permitted records in English or Arabic.

**Build after:** [Phase 03](#phase-03), [Phase 05](#phase-05), [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 15](#phase-15)

### Features delivered

- [ ] <a id="f26-01"></a>**F26.01 — Knowledge notes** · `S · specified` — Create safe rich/Markdown notes with owner, scope, tags and revision history.

  **Workflow:** Maintain title/body revision, owner/access classification, tags, archive and linked attachments for personal/project/workspace knowledge without executable content. **Rules:** Notes/snippets/templates retain scoped revisions; conflicting bodies preserve versions and content cannot execute code or store credentials.

  **Done when:** Script markup cannot execute in editor, preview or export.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Documented parent requirement/contract: [INS-007 — Knowledge, notes and reusable material](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-007--knowledge-notes-and-reusable-material).

- [ ] <a id="f26-02"></a>**F26.02 — Code snippets** · `S · specified` — Store inert code examples with language labels and safe copy controls.

  **Workflow:** Store language-labeled snippets as safe text with permitted links/copy behavior; source code storage is not an execution environment or secret vault. **Rules:** Notes/snippets/templates retain scoped revisions; conflicting bodies preserve versions and content cannot execute code or store credentials.

  **Done when:** Snippet content cannot run on the server or browser.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.01](#f26-01) **Specification:** Documented parent requirement/contract: [INS-007 — Knowledge, notes and reusable material](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-007--knowledge-notes-and-reusable-material).

- [ ] <a id="f26-03"></a>**F26.03 — Decision records** · `S · specified` — Link decisions, rationale and superseding versions to work.

  **Workflow:** Preserve rationale and superseding decision revisions linked to affected project/scope sources; later decisions do not erase the earlier evidence. **Rules:** Notes/snippets/templates retain scoped revisions; conflicting bodies preserve versions and content cannot execute code or store credentials.

  **Done when:** A changed decision preserves the earlier record and referenced revision.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.01](#f26-01) **Specification:** Documented parent requirement/contract: [INS-007 — Knowledge, notes and reusable material](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-007--knowledge-notes-and-reusable-material).

- [ ] <a id="f26-04"></a>**F26.04 — Runbook library** · `S · specified` — Publish scoped operational checklists with versioned content.

  **Workflow:** Use versioned scoped runbook content and explicit owner/access, with client publication requiring its own reviewed projection rather than search visibility. **Rules:** Notes/snippets/templates retain scoped revisions; conflicting bodies preserve versions and content cannot execute code or store credentials.

  **Done when:** A client cannot discover an internal runbook via search counts or links.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.01](#f26-01) **Specification:** Documented parent requirement/contract: [INS-007 — Knowledge, notes and reusable material](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-007--knowledge-notes-and-reusable-material).

- [ ] <a id="f26-05"></a>**F26.05 — Reusable content templates** · `S · specified` — Insert approved content through a reviewed copy operation.

  **Workflow:** Copy approved reusable text into a new allowed record with reviewed context, keeping source provenance and excluding other-client protected details. **Rules:** Notes/snippets/templates retain scoped revisions; conflicting bodies preserve versions and content cannot execute code or store credentials.

  **Done when:** Copied templates cannot expose another client's hidden names or notes.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.01](#f26-01) **Specification:** Documented parent requirement/contract: [INS-007 — Knowledge, notes and reusable material](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-007--knowledge-notes-and-reusable-material).

- [ ] <a id="f26-06"></a>**F26.06 — Knowledge revision recovery** · `S · specified` — Compare and restore old content through a new revision.

  **Workflow:** Compare old/base/local/current body revisions and restore through a new permitted revision rather than overwriting concurrent rich-text changes. **Rules:** Notes/snippets/templates retain scoped revisions; conflicting bodies preserve versions and content cannot execute code or store credentials.

  **Done when:** Two conflicting body edits preserve both candidates for review.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.01](#f26-01), [F05.06](#f05-06) **Specification:** Documented parent requirement/contract: [INS-007 — Knowledge, notes and reusable material](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-007--knowledge-notes-and-reusable-material).

- [ ] <a id="f26-13"></a>**F26.13 — Knowledge review reminders** · `E · optional expansion` — Assign owners and stale-content review dates.

  **Workflow:** Review reminders remain proposed owner/date workflow for existing knowledge; generation/delivery must follow current scope and deduplicated notice contracts. **Rules:** Notes/snippets/templates retain scoped revisions; conflicting bodies preserve versions and content cannot execute code or store credentials.

  **Done when:** A reminder points to current scoped content without exposing its body externally.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.01](#f26-01), [F06.06](#f06-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INS-007 — Knowledge, notes and reusable material](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-007--knowledge-notes-and-reusable-material).

- [ ] <a id="f26-14"></a>**F26.14 — Template library curation** · `E · optional expansion` — Approve, version and retire reusable project/document/checklist templates.

  **Workflow:** Template curation remains proposed governance over versioned copies; retirement preserves prior instances and financial/source references rather than deleting their evidence. **Rules:** Supported custom fields are bounded and classified; used fields archive/migrate and template copies remap dependencies without cross-tenant links.

  **Done when:** Retiring a template preserves all previous copies and references.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.05](#f26-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-007 — Templates and custom fields](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-007--templates-and-custom-fields).

- [ ] <a id="f15-08"></a>**F15.08 — Linked knowledge** · `S · specified` — Link project notes/runbooks/decisions to source work and knowledge entries under current grants.

  **Workflow:** Link project notes/runbooks/decisions to permitted knowledge records and preserve note revision/access classification. **Rules:** Notes/snippets/templates retain scoped revisions; conflicting bodies preserve versions and content cannot execute code or store credentials.

  **Done when:** A search or note link cannot reveal internal knowledge to a guest.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F26.01](#f26-01) **Specification:** Documented parent requirement/contract: [INS-007 — Knowledge, notes and reusable material](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-007--knowledge-notes-and-reusable-material).

- [ ] <a id="f04-03"></a>**F04.03 — Search and command palette** · `S · specified` — Global search/command palette with resource-scoped results and safe keyboard shortcuts.

  **Workflow:** Search allowed fields before producing snippets/counts; palette commands invoke the same protected service as ordinary buttons. **Rules:** Apply current grants before snippets/counts, preserve original Arabic text and invalidate deleted/revoked index entries; palette actions use ordinary services.

  **Done when:** Revoking a resource removes its searchable snippet and prevents its command action.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.01](#f04-01) **Specification:** Documented parent requirement/contract: [INS-008 — Global search and command palette](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-008--global-search-and-command-palette).

- [ ] <a id="f26-07"></a>**F26.07 — Cross-domain search index** · `S · specified` — Index allowed client/project/task/document/note fields and invalidate revoked content.

  **Workflow:** Index permitted metadata/text and invalidate permission/deletion changes before serving snippets/counts; a fast index is never an alternative authorization source. **Rules:** Apply current grants before snippets/counts, preserve original Arabic text and invalidate deleted/revoked index entries; palette actions use ordinary services.

  **Done when:** Restricted snippets and result counts never reveal a revoked record.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.03](#f04-03) **Specification:** Documented parent requirement/contract: [INS-008 — Global search and command palette](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-008--global-search-and-command-palette).

- [ ] <a id="f26-08"></a>**F26.08 — Arabic search normalization** · `S · specified` — Support tested Arabic query normalization while preserving original display text.

  **Workflow:** Use normalization only to aid Arabic queries/indexing, preserve originals for display and verify diacritics, mixed names and stable identifiers. **Rules:** Apply current grants before snippets/counts, preserve original Arabic text and invalidate deleted/revoked index entries; palette actions use ordinary services.

  **Done when:** Diacritics and mixed-language identifiers find intended records without mutating stored text.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.07](#f26-07) **Specification:** Documented parent requirement/contract: [INS-008 — Global search and command palette](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-008--global-search-and-command-palette).

- [ ] <a id="f26-09"></a>**F26.09 — Scoped search filters** · `S · specified` — Provide bounded facets, stable pagination and source-aware results.

  **Workflow:** Apply bounded query/filter/tag/date combinations with stable authorized pagination and explicit online/approved-cache coverage. **Rules:** Apply current grants before snippets/counts, preserve original Arabic text and invalidate deleted/revoked index entries; palette actions use ordinary services.

  **Done when:** Changing permissions between pages removes inaccessible results and counts.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.07](#f26-07) **Specification:** Documented parent requirement/contract: [INS-008 — Global search and command palette](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-008--global-search-and-command-palette).

- [ ] <a id="f26-10"></a>**F26.10 — Search command actions** · `S · specified` — Invoke normal authorized services from palette commands.

  **Workflow:** Dispatch palette operations through ordinary services and current online requirements; discovering a command cannot grant its missing permission. **Rules:** Apply current grants before snippets/counts, preserve original Arabic text and invalidate deleted/revoked index entries; palette actions use ordinary services.

  **Done when:** A hidden finance command cannot bypass direct service permissions.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.09](#f26-09), [F04.03](#f04-03) **Specification:** Documented parent requirement/contract: [INS-008 — Global search and command palette](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-008--global-search-and-command-palette).

- [ ] <a id="f26-11"></a>**F26.11 — Searchable archive** · `E · optional expansion` — Offer explicit include-archived filters while preserving retained evidence.

  **Workflow:** Searchable archive controls remain a proposed view over retained source records; include-archived never widens document or cost grants. **Rules:** Apply current grants before snippets/counts, preserve original Arabic text and invalidate deleted/revoked index entries; palette actions use ordinary services.

  **Done when:** Archived invoices remain findable only to authorized finance users.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.07](#f26-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INS-008 — Global search and command palette](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-008--global-search-and-command-palette).

**Demonstrate before closing this phase:** Link a note to a project, revise and restore it, then locate a client/task/note through scoped Arabic-aware search. Archived and restricted records stay behind their explicit filters and permissions.

<a id="phase-36"></a>

## Phase 36 — Plan focus sessions and review personal work habits

**User outcome:** A freelancer can run focus sessions, choose break reminders and daily goals and review personal work without surveillance.

**Build after:** [Phase 03](#phase-03), [Phase 08](#phase-08), [Phase 09](#phase-09), [Phase 14](#phase-14), [Phase 15](#phase-15)

### Features delivered

- [ ] <a id="f18-01"></a>**F18.01 — Focus sessions** · `S · specified` — Run opt-in focus intervals linked to selected work only through explicit user action.

  **Workflow:** Start optional personal focus periods with explicit selected task context; any link to billable work requires a deliberate time-entry action. **Rules:** Focus/reminders/goals are optional personal aids; activity signals, commits or calendar events never fabricate billable time or attendance.

  **Done when:** Completing a focus interval alone creates no billable time.

  **Feature prerequisites:** [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Documented parent requirement/contract: [Productivity and reporting definitions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#productivity-and-reporting-definitions).

- [ ] <a id="f18-02"></a>**F18.02 — Break reminders** · `S · specified` — Offer dismissible break notices using browser capability limits.

  **Workflow:** Offer optional break prompts through supported page/browser signals; explain suspension/closed-tab limits and keep an in-site fallback. **Rules:** Focus/reminders/goals are optional personal aids; activity signals, commits or calendar events never fabricate billable time or attendance.

  **Done when:** A closed tab makes no promise of a running reminder process.

  **Feature prerequisites:** [F03.06](#f03-06), [F18.01](#f18-01), [F06.06](#f06-06) **Specification:** Documented parent requirement/contract: [Productivity and reporting definitions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#productivity-and-reporting-definitions).

- [ ] <a id="f18-03"></a>**F18.03 — Daily time goals** · `S · specified` — Track optional personal targets from reviewed records using an explicit work date.

  **Workflow:** Compare personal reviewed work-date totals with a selected target; goal tracking never rewrites the time source or rate. **Rules:** Focus/reminders/goals are optional personal aids; activity signals, commits or calendar events never fabricate billable time or attendance.

  **Done when:** Moving timezone does not double-count a cross-midnight entry.

  **Feature prerequisites:** [F03.06](#f03-06), [F16.10](#f16-10) **Specification:** Documented parent requirement/contract: [Productivity and reporting definitions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#productivity-and-reporting-definitions).

- [ ] <a id="f18-04"></a>**F18.04 — Weekly work review** · `S · specified` — Review uncertain time, unbilled work and upcoming commitments in one personal flow.

  **Workflow:** Review uncertain gaps, approvals/unbilled evidence and upcoming commitments; keep focus-session completion separate from time approval. **Rules:** Focus/reminders/goals are optional personal aids; activity signals, commits or calendar events never fabricate billable time or attendance.

  **Done when:** Review completion does not approve another member's time.

  **Feature prerequisites:** [F03.06](#f03-06), [F16.14](#f16-14) **Specification:** Documented parent requirement/contract: [Productivity and reporting definitions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#productivity-and-reporting-definitions).

- [ ] <a id="f18-05"></a>**F18.05 — Personal time budgets** · `E · optional expansion` — Set private category or project targets with visible scope and source totals.

  **Workflow:** Private personal category targets remain proposed goal configuration; do not infer team performance, absence or attendance from the comparison. **Rules:** Focus/reminders/goals are optional personal aids; activity signals, commits or calendar events never fabricate billable time or attendance.

  **Done when:** Personal targets do not become team performance rankings.

  **Feature prerequisites:** [F03.06](#f03-06), [F18.03](#f18-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Productivity and reporting definitions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#productivity-and-reporting-definitions).

- [ ] <a id="f18-06"></a>**F18.06 — Workday start and wrap-up** · `E · optional expansion` — Offer a personal checklist for planned work, timers and outstanding drafts.

  **Workflow:** Start/wrap-up checklists remain proposed guidance; show unresolved timers/drafts and retain recoverable work through any failed state change. **Rules:** Distinguish unsaved/local/queued/accepted/conflict/failure, preserve valid input and use real empty/no-match/error states rather than fictional data.

  **Done when:** Wrapping up warns about a running timer without discarding it.

  **Feature prerequisites:** [F03.06](#f03-06), [F04.02](#f04-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Editor and status rules](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#editor-and-status-rules).

- [ ] <a id="f18-07"></a>**F18.07 — Manual distraction notes** · `E · optional expansion` — Record user-entered interruptions without collecting browsing or app usage.

  **Workflow:** Interruption notes remain proposed explicitly entered personal content; no browser history or application-activity collection is implied. **Rules:** Focus/reminders/goals are optional personal aids; activity signals, commits or calendar events never fabricate billable time or attendance.

  **Done when:** Deleting a private note does not remove linked time evidence.

  **Feature prerequisites:** [F03.06](#f03-06), [F18.01](#f18-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Productivity and reporting definitions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#productivity-and-reporting-definitions).

- [ ] <a id="f18-08"></a>**F18.08 — Personal focus history** · `E · optional expansion` — Show optional session/break history with clear distinction from work evidence.

  **Workflow:** Optional focus-history reporting remains proposed; distinguish its sessions/breaks from confirmed time, approval and financial allocation states. **Rules:** Focus/reminders/goals are optional personal aids; activity signals, commits or calendar events never fabricate billable time or attendance.

  **Done when:** A session history export contains no inferred attendance.

  **Feature prerequisites:** [F03.06](#f03-06), [F18.01](#f18-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Productivity and reporting definitions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#productivity-and-reporting-definitions).

**Demonstrate before closing this phase:** Start a focus session, receive an opted-in break reminder and compare actual time with a personal goal. Focus settings neither create billable time automatically nor publish personal history to a manager.

<a id="phase-37"></a>

## Phase 37 — Give clients a private view of published project work

**User outcome:** A freelancer can invite a specific client to view selected progress, invoices, files and knowledge, with an accurate client-view preview.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 12](#phase-12), [Phase 15](#phase-15), [Phase 16](#phase-16), [Phase 26](#phase-26), [Phase 35](#phase-35)

### Features delivered

- [ ] <a id="f29-01"></a>**F29.01 — Portal identity and access** · `S · specified` — Authenticate the intended client recipient or use reviewed purpose-bound expiring links.

  **Workflow:** Use selected Better Auth login or Q-10 recipient-verified expiring link policy; bind identity and permitted actions to specific client/workspace resources. **Rules:** Every read/download/action rechecks recipient/resource/version scope; revocation blocks future access but cannot recall prior downloads.

  **Done when:** A forwarded/revoked link cannot grant sibling-project or workspace access.

  **Feature prerequisites:** [F03.06](#f03-06), [F02.02](#f02-02) **Specification:** Documented parent requirement/contract: [CRM-011 — Client portal (P08) and controlled external review](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-011--client-portal-p08-and-controlled-external-review).

- [ ] <a id="f29-02"></a>**F29.02 — Portal publication registry** · `S · specified` — Publish exact selected document/deliverable versions with audience and actions.

  **Workflow:** Record exact publication version, audience, allowed actions and withdrawal state; unpublished authoring remains internal until a new reviewed publication. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** Internal edits remain private until a separately authorized publication.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.01](#f29-01), [F38.05](#f38-05) **Specification:** Documented parent requirement/contract: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal).

- [ ] <a id="f29-03"></a>**F29.03 — Client portal home** · `S · specified` — Show only shared projects, requests, documents and next actions.

  **Workflow:** Aggregate only the client's explicitly shared projects/documents/review requests and next actions; exclude member lists, private cost and draft invoices. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** Internal finance costs, hidden tasks and counts cannot leak.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.02](#f29-02) **Specification:** Documented parent requirement/contract: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal).

- [ ] <a id="f29-04"></a>**F29.04 — Portal project progress** · `S · specified` — Display deliberately published milestones and status snapshots.

  **Workflow:** Display selected published milestone/status facts rather than internal health/notes or unrestricted project objects. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** Internal project-health notes do not appear through an API response.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.02](#f29-02), [F12.01](#f12-01) **Specification:** Documented parent requirement/contract: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal).

- [ ] <a id="f29-05"></a>**F29.05 — Portal invoice access** · `S · specified` — Present exact issued invoices, credits and permitted payment context.

  **Workflow:** Serve issued snapshot invoices and linked permitted corrections/payment context with current recipient/file grants rather than mutable billing drafts. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** A client cannot enumerate another client's invoice IDs.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.02](#f29-02), [F20.03](#f20-03) **Specification:** Documented parent requirement/contract: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal).

- [ ] <a id="f29-10"></a>**F29.10 — Client file requests** · `S · specified` — Collect requested files with bounded private upload and received/blocked states.

  **Workflow:** Receive requested files through staged verified private uploads and owner readiness review; a filename alone cannot satisfy a blocking onboarding request. **Rules:** Readiness uses explicit blocking items, owner verification and documented waivers; templates cannot erase answers or store access credentials.

  **Done when:** Unsafe files stay quarantined and cannot become a successful handover.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.02](#f29-02), [F15.03](#f15-03) **Specification:** Documented parent requirement/contract: [CRM-008 — Onboarding, questionnaires, and access readiness](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-008--onboarding-questionnaires-and-access-readiness); [WRK-011 — Files, notes and knowledge links](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-011--files-notes-and-knowledge-links).

- [ ] <a id="f29-11"></a>**F29.11 — Portal messaging** · `E · optional expansion` — Support explicit project conversations with internal/external visibility boundaries.

  **Workflow:** Client messaging remains proposed separately classified project threads; any internal-to-external disclosure needs explicit current publication authority. **Rules:** Internal/client-visible threads have separate classification; mentions require read access, presence is advisory/opt-out and surveillance is excluded.

  **Done when:** A private internal reply cannot be sent by switching a client-supplied flag.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.02](#f29-02), [F15.01](#f15-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-010 — Collaboration and activity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-010--collaboration-and-activity).

- [ ] <a id="f29-12"></a>**F29.12 — Portal profile preferences** · `E · optional expansion` — Allow reviewed client contact/language settings without workspace membership.

  **Workflow:** Client-editable contact/preferences remain proposed; select which fields are writable without turning a business contact edit into account ownership or workspace membership. **Rules:** Every read/download/action rechecks recipient/resource/version scope; revocation blocks future access but cannot recall prior downloads.

  **Done when:** Changing contact email cannot take over another recipient's portal identity.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.01](#f29-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-011 — Client portal (P08) and controlled external review](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-011--client-portal-p08-and-controlled-external-review).

- [ ] <a id="f29-13"></a>**F29.13 — Portal multi-project switching** · `E · optional expansion` — List only engagements explicitly shared with that client identity.

  **Workflow:** Multi-project navigation remains proposed recipient projection over individually shared resources; common client identity cannot reveal unshared engagements. **Rules:** Every read/download/action rechecks recipient/resource/version scope; revocation blocks future access but cannot recall prior downloads.

  **Done when:** Membership in one engagement never reveals unshared projects.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.03](#f29-03), [F29.04](#f29-04) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-011 — Client portal (P08) and controlled external review](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-011--client-portal-p08-and-controlled-external-review).

- [ ] <a id="f29-15"></a>**F29.15 — Client-view preview** · `E · optional expansion` — Provide a read-only publication preview using the actual recipient projection.

  **Workflow:** Read-only client preview remains proposed reuse of the actual publication projection, without impersonation, sending, signatures or payments. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** Preview actions cannot send, sign, pay or impersonate the client.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.02](#f29-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal).

- [ ] <a id="f12-11"></a>**F12.11 — Published project status** · `E · optional expansion` — Client-facing project status summaries based only on deliberately published fields.

  **Workflow:** External progress uses deliberately published snapshots rather than a broad internal project serializer. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** A client sees no unpublished risk commentary, cost or member list.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.01](#f12-01), [F29.02](#f29-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal).

- [ ] <a id="f26-12"></a>**F26.12 — Client knowledge publications** · `E · optional expansion` — Publish selected safe notes through portal snapshots.

  **Workflow:** Publishing knowledge to clients remains proposed exact-version portal content with explicit recipients; changing an internal draft cannot alter the published snapshot. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** Editing an internal draft does not silently republish confidential text.

  **Feature prerequisites:** [F03.06](#f03-06), [F26.01](#f26-01), [F29.02](#f29-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal); [INS-007 — Knowledge, notes and reusable material](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-007--knowledge-notes-and-reusable-material).

- [ ] <a id="f11-09"></a>**F11.09 — Client welcome packet** · `E · optional expansion` — Welcome packet and client setup checklist published through the portal.

  **Workflow:** Welcome packets remain proposed portal publications with deliberate audience, version and selected content; internal onboarding notes stay private. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** Changing an internal checklist cannot silently republish client-visible instructions.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F11.01](#f11-01), [F27.03](#f27-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal).

**Demonstrate before closing this phase:** Publish selected records, enter as that client and inspect exactly the allowed projection. Internal notes, private costs and unpublished files remain inaccessible through pages, direct URLs, search and downloads; revocation takes effect on later requests.

<a id="phase-38"></a>

## Phase 38 — Collect authenticated client approvals

**User outcome:** A client can accept or reject an exact proposal or deliverable version and review shared timesheets.

**Build after:** [Phase 03](#phase-03), [Phase 17](#phase-17), [Phase 25](#phase-25), [Phase 27](#phase-27), [Phase 37](#phase-37)

### Features delivered

- [ ] <a id="f10-07"></a>**F10.07 — Verified client acceptance** · `S · specified` — Authenticated client decisions on exact published versions with duplicate-click/callback protection.

  **Workflow:** Accept/reject only the currently eligible published version for the intended authorized reviewer using idempotent decision identity. **Rules:** Capture operator and purported client actor separately; stale responses require review and manual evidence cannot display as verified signature.

  **Done when:** Double-click acceptance creates one event and no duplicate project handoff.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.05](#f10-05), [F29.01](#f29-01), [F29.02](#f29-02) **Specification:** Documented parent requirement/contract: [CRM-006 — Decisions, acceptance evidence, and disagreement](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-006--decisions-acceptance-evidence-and-disagreement).

- [ ] <a id="f29-07"></a>**F29.07 — Portal proposal decisions** · `S · specified` — Record accept/reject/request-change against a current published version.

  **Workflow:** Record accepted/rejected/change-request result for the currently eligible published proposal version and selected options with capturing/verified identity provenance. **Rules:** Capture operator and purported client actor separately; stale responses require review and manual evidence cannot display as verified signature.

  **Done when:** Withdrawing a version invalidates an outstanding acceptance action.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.02](#f29-02), [F10.07](#f10-07) **Specification:** Documented parent requirement/contract: [CRM-006 — Decisions, acceptance evidence, and disagreement](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-006--decisions-acceptance-evidence-and-disagreement).

- [ ] <a id="f29-09"></a>**F29.09 — Portal deliverable acceptance** · `S · specified` — Bind review comments and decision to the exact delivered artifact.

  **Workflow:** Allow comments/acceptance/change requests only on the published deliverable version and retain earlier evidence after replacement or supersession. **Rules:** Publication selects exact content and reviewers online; new versions preserve prior evidence and require the applicable new approval.

  **Done when:** Uploading a replacement never inherits approval of its predecessor.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.02](#f29-02), [F15.06](#f15-06) **Specification:** Documented parent requirement/contract: [WRK-009 — Deliverables and acceptance](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-009--deliverables-and-acceptance).

- [ ] <a id="f17-14"></a>**F17.14 — Client timesheet review** · `E · optional expansion` — Publish selected timesheet snapshots for client acknowledgement separately from internal approval.

  **Workflow:** External timesheet acknowledgement remains an extension separate from internal time approval; publishing must expose only selected source versions and permitted fields. **Rules:** Every client read/download/action rechecks recipient/resource/version scope; external acknowledgement is separate from internal time approval and cannot change allocation authority.

  **Done when:** Client acknowledgement cannot change rate or financial allocation ownership.

  **Feature prerequisites:** [F03.06](#f03-06), [F17.06](#f17-06), [F29.02](#f29-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-011 — Client portal (P08) and controlled external review](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-011--client-portal-p08-and-controlled-external-review); [State model](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/time-and-productivity.md#state-model).

**Demonstrate before closing this phase:** Open a published revision, record a verified decision and reject a stale or replayed response against a replaced version. An expired invitation or withdrawn publication cannot authorize a new approval.

<a id="phase-39"></a>

## Phase 39 — Let clients pay invoices through hosted checkout

**User outcome:** A client can pay an invoice through an approved provider while the freelancer sees verified payments, refunds, disputes and payouts.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 12](#phase-12), [Phase 13](#phase-13), [Phase 15](#phase-15), [Phase 33](#phase-33), [Phase 37](#phase-37)

### Features delivered

- [ ] <a id="f27-06"></a>**F27.06 — Hosted payment checkout** · `S · specified` — Create an approved provider-hosted payment link for exact invoice context.

  **Workflow:** Create approved hosted checkout/payment context for the exact authorized invoice/customer/amount/currency; browser return navigation is not settlement evidence. **Rules:** Verify callback identity and amount/currency/customer/invoice; separate capture, fee, payout, refund and chargeback, with no raw card custody.

  **Done when:** The client browser handles no raw card data; amount/currency mismatch cannot settle debt.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.02](#f27-02), [F20.01](#f20-01) **Specification:** Documented parent requirement/contract: [INT-006 — Payment providers](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-006--payment-providers).

- [ ] <a id="f27-07"></a>**F27.07 — Payment webhooks** · `S · specified` — Verify signed callbacks, replay window, event identity and tenant mapping.

  **Workflow:** Verify signed/timestamped callbacks and unique provider event/account mapping before transactional business effects; out-of-order states cannot regress accepted facts. **Rules:** Verify callback identity and amount/currency/customer/invoice; separate capture, fee, payout, refund and chargeback, with no raw card custody.

  **Done when:** Duplicate and out-of-order events produce one valid state transition.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.06](#f27-06), [F30.03](#f30-03) **Specification:** Documented parent requirement/contract: [INT-006 — Payment providers](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-006--payment-providers).

- [ ] <a id="f27-08"></a>**F27.08 — Provider refunds** · `S · specified` — Initiate explicitly authorized refunds and reconcile uncertain outcomes.

  **Workflow:** Require current Finance action and explicit selected refund instruction; unknown provider results reconcile before another money-moving request. **Rules:** Verify callback identity and amount/currency/customer/invoice; separate capture, fee, payout, refund and chargeback, with no raw card custody.

  **Done when:** A lost provider reply never causes a blind second refund.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.07](#f27-07), [F21.07](#f21-07) **Specification:** Documented parent requirement/contract: [INT-006 — Payment providers](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-006--payment-providers).

- [ ] <a id="f27-09"></a>**F27.09 — Chargeback records** · `S · specified` — Track disputes, reversed cash and evidence deadlines separately from invoice lifecycle.

  **Workflow:** Link dispute/chargeback evidence to original cash allocations, deadlines and adjustments; preserve original receipt/invoice and explain the effect on debt. **Rules:** Verify callback identity and amount/currency/customer/invoice; separate capture, fee, payout, refund and chargeback, with no raw card custody.

  **Done when:** A chargeback never silently edits the original invoice.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.07](#f27-07), [F21.13](#f21-13) **Specification:** Documented parent requirement/contract: [INT-006 — Payment providers](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-006--payment-providers).

- [ ] <a id="f27-10"></a>**F27.10 — Payout reconciliation** · `S · specified` — Match provider gross receipts, fees, refunds and net payouts.

  **Workflow:** Reconcile source gross receipts, fees, refunds/chargebacks and net payout with explicit links instead of treating net payout as the amount the client paid. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** Totals explain every difference between paid invoice and bank payout.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.07](#f27-07), [F24.04](#f24-04) **Specification:** Documented parent requirement/contract: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits); [INT-006 — Payment providers](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-006--payment-providers).

- [ ] <a id="f29-06"></a>**F29.06 — Portal payment action** · `S · specified` — Launch configured hosted checkout with current payable balance.

  **Workflow:** Launch approved hosted payment context from current invoice facts and treat verified provider capture/reconciliation as the source of settlement. **Rules:** Verify callback identity and amount/currency/customer/invoice; separate capture, fee, payout, refund and chargeback, with no raw card custody.

  **Done when:** Paying in another tab prevents a stale link from creating unauthorized duplicate collection.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.05](#f29-05), [F27.06](#f27-06) **Specification:** Documented parent requirement/contract: [INT-006 — Payment providers](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-006--payment-providers).

<details>
<summary>Supporting work included in this feature phase — 1 tracked entries</summary>

- [ ] <a id="f30-03"></a>**F30.03 — Incoming webhook handlers** · `S · specified` — Validate provider signature, size, timestamp and event identity.

  **Workflow:** Bound and verify incoming provider events before dispatch; untrusted callback workspace/role/SQL/template fields never grant trusted authority. **Rules:** Tokens are scoped/revocable and bounded; webhooks use signatures/event IDs and reject private-network/redirect SSRF or privilege-bearing payloads.

  **Done when:** Forged, replayed or wrong-tenant events cannot invoke domain effects.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.04](#f38-04), [F38.06](#f38-06) **Specification:** Documented parent requirement/contract: [INT-008 — External API/webhooks](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-008--external-apiwebhooks).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL/GATED: auth email webhook code exists; generalized scoped business-provider inboxes remain pending.

  **Implementation progress — 1 November 2026:**

  - [x] Bounded signed auth-email webhook parsing and event receipt handling are implemented in `app/api/webhooks/neon-auth/route.tsx` and `lib/auth/email-webhook.ts`; mocked signature/replay/forgery tests passed.
  - [ ] Isolated webhook activation and generalized workspace-scoped business-provider handlers remain pending.

</details>

**Demonstrate before closing this phase:** Complete a provider test checkout, replay and reorder its signed callbacks and keep one payment. A browser return alone does not mark an invoice paid; reconcile an uncertain refund before retrying.

<a id="phase-40"></a>

## Phase 40 — Sign agreements through an approved signature provider

**User outcome:** A freelancer can route an exact agreement version for signatures and clients can use the approved signature flow.

**Build after:** [Phase 03](#phase-03), [Phase 15](#phase-15), [Phase 22](#phase-22), [Phase 37](#phase-37)

### Features delivered

- [ ] <a id="f10-12"></a>**F10.12 — Signature provider** · `S · specified` — Approved signature-provider integration and legal-evidence classification when enabled.

  **Workflow:** Connected signature behavior awaits Q-10 jurisdiction, provider and evidence policy; verified receipts alone establish supported signature states. **Rules:** Capture operator and purported client actor separately; stale responses require review and manual evidence cannot display as verified signature.

  **Done when:** A provider timeout remains awaiting confirmation rather than accepted.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.09](#f10-09), [F27.02](#f27-02) **Specification:** Documented parent requirement/contract: [CRM-006 — Decisions, acceptance evidence, and disagreement](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-006--decisions-acceptance-evidence-and-disagreement).

- [ ] <a id="f10-14"></a>**F10.14 — Signature routing** · `E · optional expansion` — Multi-party/multi-step signature routing, delegated authority and reminder policy after Q-10 approval.

  **Workflow:** Multi-party/delegated routing needs the approved signer/authority policy; current docs explicitly leave those choices blocking. **Rules:** Capture operator and purported client actor separately; stale responses require review and manual evidence cannot display as verified signature.

  **Done when:** A team operator cannot impersonate an absent client signatory or supply both roles without policy.

  **Feature prerequisites:** [F03.06](#f03-06), [F10.12](#f10-12) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-006 — Decisions, acceptance evidence, and disagreement](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-006--decisions-acceptance-evidence-and-disagreement).

- [ ] <a id="f29-08"></a>**F29.08 — Portal agreement signature** · `S · specified` — Use approved signature flow and evidence classification.

  **Workflow:** Present only the selected agreement/provider evidence policy and preserve verification level; uploaded/typed signatures are not universal legal proof. **Rules:** Capture operator and purported client actor separately; stale responses require review and manual evidence cannot display as verified signature.

  **Done when:** A typed name is never mislabeled as certified legal identity evidence.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.02](#f29-02), [F10.12](#f10-12) **Specification:** Documented parent requirement/contract: [CRM-006 — Decisions, acceptance evidence, and disagreement](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-006--decisions-acceptance-evidence-and-disagreement).

**Demonstrate before closing this phase:** Request a signature on one version, verify the returned provider evidence and reject mismatched or withdrawn versions. Provider availability and the selected evidence/jurisdiction policy are explicit activation prerequisites.

<a id="phase-41"></a>

## Phase 41 — Follow up on unpaid invoices with controlled reminders

**User outcome:** A freelancer can agree payment schedules, manage permitted late fees and send policy-approved reminders that respect disputes and recipient preferences.

**Build after:** [Phase 03](#phase-03), [Phase 10](#phase-10), [Phase 12](#phase-12), [Phase 13](#phase-13), [Phase 15](#phase-15)

### Features delivered

- [ ] <a id="f21-11"></a>**F21.11 — Collection reminders** · `S · specified` — Configure previewable schedules, quiet hours, suppression and send history.

  **Workflow:** Configure previewable overdue schedules and suppression/history; pending reminder jobs recheck paid, disputed, voided and opted-out states just before dispatch. **Rules:** FIN-001–035 preserve source identities, exact amounts and immutable issue/posting history; configurable policies require approval before activation.

  **Done when:** Paying or disputing an invoice before dispatch suppresses the pending reminder.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.03](#f21-03), [F21.13](#f21-13), [F06.07](#f06-07), [F27.03](#f27-03), [F30.05](#f30-05) **Specification:** Documented parent requirement/contract: [Requirements catalogue](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#requirements-catalogue); [INT-005 — Email and document delivery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-005--email-and-document-delivery).

- [ ] <a id="f21-16"></a>**F21.16 — Payment plan schedules** · `E · optional expansion` — Track agreed instalments and allocated receipts separately from invoice totals.

  **Workflow:** Instalment plans remain proposed accepted schedules over existing obligations; allocations/receipts remain authoritative and rescheduling cannot recreate the same debt. **Rules:** Payments conserve allocated plus unapplied value; credit/refund effects differ, surplus is explicit and a deposit never reduces the same debt twice.

  **Done when:** Missed instalments never duplicate or silently reissue original debt.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.03](#f21-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f21-17"></a>**F21.17 — Late fee policy** · `E · optional expansion` — Apply only explicitly accepted, jurisdiction-reviewed terms through a separate approved charge.

  **Workflow:** Late charges remain proposed jurisdiction/contract policy; select eligibility, calculation, correction and disclosure before any separate charge is drafted or issued. **Rules:** Country, precision, tax/discount order, number series, correction policy, reporting basis and providers are unresolved until explicitly selected.

  **Done when:** Disputed or legally ineligible balances do not accrue automatic fees.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F21.03](#f21-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Decisions requiring user input before dependent work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#decisions-requiring-user-input-before-dependent-work).

**Demonstrate before closing this phase:** Queue an overdue reminder, then record payment or open a dispute before execution. The job rechecks the balance and authority, suppresses the obsolete message and records the actual delivery result.

<a id="phase-42"></a>

## Phase 42 — Sync accounting records and optionally read bank feeds

**User outcome:** A freelancer can connect an approved accounting service, inspect acknowledgments and optionally import a read-only bank feed.

**Build after:** [Phase 03](#phase-03), [Phase 10](#phase-10), [Phase 15](#phase-15), [Phase 33](#phase-33)

### Features delivered

- [ ] <a id="f27-11"></a>**F27.11 — Accounting provider connector** · `S · specified` — Implement one selected provider after portable exports and approved mapping.

  **Workflow:** Implement a specifically selected accounting adapter over the existing portable export/versioned mapping and acknowledgement contracts. **Rules:** Portable exports precede named adapters; mappings/acknowledgements are versioned, matches need confirmation and feeds remain read-only.

  **Done when:** A partially accepted export resumes without external duplication.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.02](#f27-02), [F24.09](#f24-09) **Specification:** Documented parent requirement/contract: [INT-007 — Accounting and bank context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-007--accounting-and-bank-context).

- [ ] <a id="f27-12"></a>**F27.12 — Read-only bank feed** · `E · optional expansion` — Use a reviewed consent-based feed with expiry and reconnect states.

  **Workflow:** A live bank feed remains proposed read-only consent/expiry integration; imported evidence still needs explicit matching and cannot initiate transfers. **Rules:** Portable exports precede named adapters; mappings/acknowledgements are versioned, matches need confirmation and feeds remain read-only.

  **Done when:** Feed access cannot initiate transfers or silently match ambiguous cash.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.02](#f27-02), [F24.01](#f24-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-007 — Accounting and bank context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-007--accounting-and-bank-context).

- [ ] <a id="f24-10"></a>**F24.10 — Accounting sync acknowledgements** · `S · specified` — Track accepted/rejected rows with replay-safe identifiers.

  **Workflow:** Track accepted/rejected external rows and stable acknowledgement identity; retry only the appropriate unresolved work under current connection/grants. **Rules:** Portable exports precede named adapters; mappings/acknowledgements are versioned, matches need confirmation and feeds remain read-only.

  **Done when:** Retrying a rejected batch cannot duplicate previously accepted external rows.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F24.09](#f24-09), [F27.11](#f27-11) **Specification:** Documented parent requirement/contract: [INT-007 — Accounting and bank context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-007--accounting-and-bank-context).

**Demonstrate before closing this phase:** Sync an exported record twice, inspect its provider mapping and reconcile an uncertain acknowledgment. Disconnect stops new jobs without erasing historical mappings or implying a bank-transfer capability.

<a id="phase-43"></a>

## Phase 43 — Connect messaging channels and import client conversations

**User outcome:** A freelancer can use selected SMS/team-chat notices and import permitted communication threads into the client timeline.

**Build after:** [Phase 03](#phase-03), [Phase 15](#phase-15), [Phase 20](#phase-20)

### Features delivered

- [ ] <a id="f27-13"></a>**F27.13 — SMS delivery connector** · `E · optional expansion` — Offer explicitly opted-in transactional notices after provider/country review.

  **Workflow:** SMS is proposed channel selection without an approved provider/region/consent contract; any notice must obey scoped content, suppression and channel preferences. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** Suppressed contacts receive no queued text and sensitive details stay out of previews.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.02](#f27-02), [F06.07](#f06-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f27-14"></a>**F27.14 — Team chat notices** · `E · optional expansion` — Send bounded Slack/Teams-style notices to approved destinations.

  **Workflow:** External team-chat notices remain proposed destinations; select data-sharing/recipient policy and keep restricted source content out of broadly visible channels. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** Disconnect or recipient scope loss suppresses private content before dispatch.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.02](#f27-02), [F06.07](#f06-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f27-15"></a>**F27.15 — Communication thread import** · `E · optional expansion` — Import explicitly selected email threads with provenance and narrow scopes.

  **Workflow:** Thread import is proposed communication ingestion; preserve named-source/external-ID provenance and decide permitted message/attachment fields before connecting a mailbox. **Rules:** Follow-up completion/snooze preserves history; recording communication never implies sending, and overdue catch-up is deduplicated.

  **Done when:** A personal unrelated mailbox message cannot enter another client's timeline.

  **Feature prerequisites:** [F03.06](#f03-06), [F27.02](#f27-02), [F07.08](#f07-08) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-003 — Activity timeline, follow-ups, and communication records](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-003--activity-timeline-follow-ups-and-communication-records).

**Demonstrate before closing this phase:** Preview channel recipients, send through a test connection and disconnect before a queued send. Imported threads retain provenance and never turn matching addresses into portal access or consent.

<a id="phase-44"></a>

## Phase 44 — Connect issue trackers to project delivery

**User outcome:** Members can connect approved engineering tools, link issues/artifacts and apply explicit status mappings or reviewed synchronization.

**Build after:** [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 08](#phase-08), [Phase 15](#phase-15), [Phase 16](#phase-16), [Phase 19](#phase-19)

### Features delivered

- [ ] <a id="f28-01"></a>**F28.01 — GitHub connector** · `S · specified` — Map approved repositories and import/link issues, PRs and releases with stable IDs.

  **Workflow:** Select authorized GitHub repositories for read-only linked issues/PRs/releases, preserving external IDs and explicit workspace/project mapping without copying code by default. **Rules:** Initial engineering mode is links/read-only metadata with external-ID dedupe; repository changes cannot generate time, accept scope or bill.

  **Done when:** Repeated imports deduplicate and never copy private source code by default.

  **Feature prerequisites:** [F27.02](#f27-02), [F12.01](#f12-01) **Specification:** Documented parent requirement/contract: [INT-003 — GitHub/GitLab engineering context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-003--githubgitlab-engineering-context).

- [ ] <a id="f28-02"></a>**F28.02 — GitLab connector** · `S · specified` — Map selected projects and merge requests through an independently reviewed adapter.

  **Workflow:** Independently authorize selected GitLab project metadata and merge-request links; importing an inaccessible remote project cannot be enabled by editing its ID. **Rules:** Initial engineering mode is links/read-only metadata with external-ID dedupe; repository changes cannot generate time, accept scope or bill.

  **Done when:** An inaccessible remote project cannot be mapped by changing an external ID.

  **Feature prerequisites:** [F27.02](#f27-02), [F12.01](#f12-01) **Specification:** Documented parent requirement/contract: [INT-003 — GitHub/GitLab engineering context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-003--githubgitlab-engineering-context).

- [ ] <a id="f28-07"></a>**F28.07 — Engineering status rules** · `S · specified` — Allow selected PR/issue events to suggest or apply configured task transitions.

  **Workflow:** Configure a permitted repository event to suggest/apply a reviewed task transition only; it cannot log time, approve scope or issue an invoice. **Rules:** Initial engineering mode is links/read-only metadata with external-ID dedupe; repository changes cannot generate time, accept scope or bill.

  **Done when:** A merged PR cannot approve deliverables, log time or issue invoices.

  **Feature prerequisites:** [F27.02](#f27-02), [F28.01](#f28-01), [F13.03](#f13-03) **Specification:** Documented parent requirement/contract: [INT-003 — GitHub/GitLab engineering context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-003--githubgitlab-engineering-context).

- [ ] <a id="f28-08"></a>**F28.08 — Bidirectional issue sync** · `E · optional expansion` — Sync approved fields under versioned mapping and explicit conflict policy.

  **Workflow:** Bidirectional sync remains proposed per-project mapping/conflict policy; read-only connection scope cannot authorize remote writes. **Rules:** Initial engineering mode is links/read-only metadata with external-ID dedupe; repository changes cannot generate time, accept scope or bill.

  **Done when:** Concurrent local/remote status edits do not overwrite each other silently.

  **Feature prerequisites:** [F27.02](#f27-02), [F28.01](#f28-01), [F05.06](#f05-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-003 — GitHub/GitLab engineering context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-003--githubgitlab-engineering-context).

- [ ] <a id="f28-09"></a>**F28.09 — Jira connector** · `E · optional expansion` — Import/link selected issues with scoped external-ID mapping.

  **Workflow:** Jira is a proposed named adapter, not an approved connection; define supported issue fields, identity/grant checks and replay mapping before enabling it. **Rules:** Initial engineering mode is links/read-only metadata with external-ID dedupe; repository changes cannot generate time, accept scope or bill.

  **Done when:** Restricted issues do not appear through summaries or webhooks.

  **Feature prerequisites:** [F27.02](#f27-02), [F13.01](#f13-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-003 — GitHub/GitLab engineering context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-003--githubgitlab-engineering-context).

- [ ] <a id="f28-10"></a>**F28.10 — Linear connector** · `E · optional expansion` — Map selected teams/issues/projects and retain source references.

  **Workflow:** Linear is a proposed named adapter; keep source team/issue/project mapping scoped and review deleted remote metadata without silently recreating it. **Rules:** Initial engineering mode is links/read-only metadata with external-ID dedupe; repository changes cannot generate time, accept scope or bill.

  **Done when:** Remote deletion preserves local evidence without repeated recreation.

  **Feature prerequisites:** [F27.02](#f27-02), [F13.01](#f13-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-003 — GitHub/GitLab engineering context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-003--githubgitlab-engineering-context).

- [ ] <a id="f28-11"></a>**F28.11 — External task import adapters** · `E · optional expansion` — Add a separately scoped Trello/Asana/ClickUp adapter only when migration demand selects it.

  **Workflow:** Other task adapters remain candidates; pick one concrete source and mapping/exclusion contract instead of implementing a generic unrestricted task-sync engine. **Rules:** Initial engineering mode is links/read-only metadata with external-ID dedupe; repository changes cannot generate time, accept scope or bill.

  **Done when:** Each chosen adapter gets its own approval and idempotent import fixtures before coding.

  **Feature prerequisites:** [F27.02](#f27-02), [F34.01](#f34-01), [F13.01](#f13-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-003 — GitHub/GitLab engineering context](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-003--githubgitlab-engineering-context).

- [ ] <a id="f28-12"></a>**F28.12 — Design artifact links** · `E · optional expansion` — Attach reviewed Figma/design links with safe previews and access disclosure.

  **Workflow:** Design artifact previews remain proposed safe external references; source URL and client publication need explicit reviewed exposure and no arbitrary fetch authority. **Rules:** Attachments retain hash/type/size/version and upload state; incomplete uploads are not final files and conflicting note bodies preserve revisions.

  **Done when:** A preview cannot expose a private artifact to a portal guest.

  **Feature prerequisites:** [F27.02](#f27-02), [F15.02](#f15-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-011 — Files, notes and knowledge links](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-011--files-notes-and-knowledge-links); [INT-008 — External API/webhooks](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-008--external-apiwebhooks).

- [ ] <a id="f28-14"></a>**F28.14 — External storage references** · `E · optional expansion` — Reference selected Drive/Dropbox-style files under scoped access and retention rules.

  **Workflow:** External storage references remain proposed adapters; determine external access/retention and local-copy policy rather than promising indefinite cached availability. **Rules:** Commit attachment references only after verified bytes/hash; browser drafts are not backups and stale restored operations never replay blindly.

  **Done when:** Revoking the external share does not leave a falsely accessible cached copy.

  **Feature prerequisites:** [F27.02](#f27-02), [F15.02](#f15-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Files, deletion and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#files-deletion-and-recovery).

**Demonstrate before closing this phase:** Link a repository issue to a permitted task, replay its event and keep one mapped change. Show a conflicting edit for review; connecting GitHub, GitLab, Jira or Linear grants no access to unrelated projects.

<a id="phase-45"></a>

## Phase 45 — Connect calendars and reconcile availability

**User outcome:** Members can connect selected calendars, review busy time, reconcile conflicting updates and explicitly approve event invitations.

**Build after:** [Phase 07](#phase-07), [Phase 08](#phase-08), [Phase 15](#phase-15), [Phase 23](#phase-23)

### Features delivered

- [ ] <a id="f28-03"></a>**F28.03 — Google Calendar connector** · `S · specified` — Import selected busy intervals and optionally export approved events.

  **Workflow:** Choose selected Google calendars and read-only busy import or approved event export; retain timezone, external event identity/revision and privacy classification. **Rules:** Map selected events by external ID/revision, preserve private fields and timezone exceptions; invitations need separate consent and events are not work evidence.

  **Done when:** Private event titles stay hidden when only availability was authorized.

  **Feature prerequisites:** [F27.02](#f27-02), [F14.03](#f14-03) **Specification:** Documented parent requirement/contract: [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar).

- [ ] <a id="f28-04"></a>**F28.04 — Microsoft calendar connector** · `E · optional expansion` — Support selected Outlook calendars with explicit timezone and scope policy.

  **Workflow:** Microsoft calendar support remains proposed provider-specific work; the documented calendar contract supplies boundaries but not approved Outlook credentials or feature parity. **Rules:** Map selected events by external ID/revision, preserve private fields and timezone exceptions; invitations need separate consent and events are not work evidence.

  **Done when:** Disconnect stops updates and reconnect cannot duplicate events.

  **Feature prerequisites:** [F27.02](#f27-02), [F14.03](#f14-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar).

- [ ] <a id="f28-05"></a>**F28.05 — Calendar conflict reconciliation** · `S · specified` — Handle remote edits, cancellations, recurring exceptions and local revisions.

  **Workflow:** Review remote decline/cancel/move and recurrence/DST exceptions against local mapping/revision; reconnect resumes the same source rather than creating duplicates. **Rules:** Map selected events by external ID/revision, preserve private fields and timezone exceptions; invitations need separate consent and events are not work evidence.

  **Done when:** DST or organizer edits produce reviewable changes without fabricating worked time.

  **Feature prerequisites:** [F27.02](#f27-02), [F28.03](#f28-03) **Specification:** Documented parent requirement/contract: [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar).

- [ ] <a id="f28-06"></a>**F28.06 — Approved event invitations** · `S · specified` — Send only reviewed event updates with explicit recipients.

  **Workflow:** Preview intended recipients and explicitly enable invitation sending as a separate action from saving a local activity or importing availability. **Rules:** Map selected events by external ID/revision, preserve private fields and timezone exceptions; invitations need separate consent and events are not work evidence.

  **Done when:** A replayed job does not resend a new independent invitation.

  **Feature prerequisites:** [F27.02](#f27-02), [F28.03](#f28-03) **Specification:** Documented parent requirement/contract: [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar).

- [ ] <a id="f14-10"></a>**F14.10 — Busy-time availability** · `E · optional expansion` — Availability sharing using busy intervals without leaking private event titles.

  **Workflow:** Share reviewed busy intervals from selected calendars with source/timezone, without revealing event titles when only availability is authorized. **Rules:** Map selected events by external ID/revision, preserve private fields and timezone exceptions; invitations need separate consent and events are not work evidence.

  **Done when:** A private meeting title never enters a shared availability response.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01), [F28.03](#f28-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar).

**Demonstrate before closing this phase:** Import a busy interval without private event content, edit the same appointment on both sides and resolve the conflict. A sync retry cannot send duplicate invitations or recreate a deleted event blindly.

<a id="phase-46"></a>

## Phase 46 — Build deterministic work automations

**User outcome:** An authorized member can create typed event, schedule or threshold rules, preview their effects and stop automation in an emergency.

**Build after:** [Phase 03](#phase-03), [Phase 12](#phase-12), [Phase 15](#phase-15)

### Features delivered

- [ ] <a id="f30-06"></a>**F30.06 — Typed rule builder** · `S · specified` — Configure owner, trigger, allowlisted conditions/actions, scope and limits.

  **Workflow:** Author typed trigger/conditions/actions, owner/scope, recipients, timezone, quiet hours/cooldown and run limits using allowlisted operators only. **Rules:** Rules use typed allowlisted fields/operators/actions, explicit owner/scope and preview; sends/issue need separate permission and authority rechecks.

  **Done when:** An arbitrary script or unauthorized field is rejected by direct service input.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.05](#f30-05) **Specification:** Documented parent requirement/contract: [INT-009 — Rule builder](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-009--rule-builder).

- [ ] <a id="f30-07"></a>**F30.07 — Event-triggered rules** · `S · specified` — React to accepted domain events with stable event/occurrence identity.

  **Workflow:** Consume accepted domain events under stable identity; generated tasks/drafts use ordinary validated services with current grants and source revisions. **Rules:** Rules use typed allowlisted fields/operators/actions, explicit owner/scope and preview; sends/issue need separate permission and authority rechecks.

  **Done when:** A duplicated event does not recreate its draft or task.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.06](#f30-06) **Specification:** Documented parent requirement/contract: [INT-009 — Rule builder](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-009--rule-builder).

- [ ] <a id="f30-08"></a>**F30.08 — Scheduled rules** · `S · specified` — Execute timezone-aware schedules with explicit missed-run policy.

  **Workflow:** Compute explicit scheduled occurrence IDs with timezone/month-end and missed-run policy; the server, not an open browser, runs enabled schedules. **Rules:** Rules use typed allowlisted fields/operators/actions, explicit owner/scope and preview; sends/issue need separate permission and authority rechecks.

  **Done when:** Month-end/DST catch-up produces only supported occurrence IDs.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.06](#f30-06) **Specification:** Documented parent requirement/contract: [INT-009 — Rule builder](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-009--rule-builder).

- [ ] <a id="f30-09"></a>**F30.09 — Threshold rules** · `S · specified` — Notify once per configured crossing with visible source/policy.

  **Workflow:** Use named threshold source/version and once-per-crossing/cooldown rules with incomplete-data handling; rule effects remain separately permitted. **Rules:** Rules use typed allowlisted fields/operators/actions, explicit owner/scope and preview; sends/issue need separate permission and authority rechecks.

  **Done when:** A value hovering at the threshold cannot create an unbounded notification storm.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.06](#f30-06) **Specification:** Documented parent requirement/contract: [INT-009 — Rule builder](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-009--rule-builder).

- [ ] <a id="f30-10"></a>**F30.10 — Rule dry-run** · `S · specified` — Preview matched authorized records and proposed effects without external actions.

  **Workflow:** Preview matched allowed records and consequences without mutation or external effect; dry-run cannot send, issue or reserve source ownership. **Rules:** Rules use typed allowlisted fields/operators/actions, explicit owner/scope and preview; sends/issue need separate permission and authority rechecks.

  **Done when:** Dry-run cannot issue, send or write a posting.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.06](#f30-06) **Specification:** Documented parent requirement/contract: [INT-009 — Rule builder](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-009--rule-builder).

- [ ] <a id="f30-11"></a>**F30.11 — Protected send and issue rules** · `S · specified` — Require separate enabled policy and current authority for consequential actions.

  **Workflow:** Enable send/issue separately from draft creation and recheck consent, current owner grants, recipients/balance and document state immediately before execution. **Rules:** Rules use typed allowlisted fields/operators/actions, explicit owner/scope and preview; sends/issue need separate permission and authority rechecks.

  **Done when:** Owner removal or balance changes block execution immediately before effects.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.10](#f30-10), [F20.01](#f20-01), [F27.03](#f27-03) **Specification:** Documented parent requirement/contract: [INT-009 — Rule builder](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-009--rule-builder).

- [ ] <a id="f30-12"></a>**F30.12 — Rule loop protection** · `S · specified` — Bound cascades, recursion, run counts and per-tenant cost.

  **Workflow:** Bound trigger cascades, depth, runtime and run counts; suspend loops with auditable repair rather than retrying an unlimited chain. **Rules:** Durable leased jobs have bounded retries/checkpoints and idempotent effects; cancellation/current grants are rechecked before external side effects.

  **Done when:** A self-triggering update suspends safely with a repairable record.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.06](#f30-06) **Specification:** Documented parent requirement/contract: [INT-010 — Safe job execution](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-010--safe-job-execution).

- [ ] <a id="f30-13"></a>**F30.13 — Job operations dashboard** · `S · specified` — Show attempts, redacted failures, retry timing, dead letters and scoped repair.

  **Workflow:** Expose scoped queue/running/retry/review/cancel/dead-letter outcomes, last success and redacted diagnostics with safe repair actions. **Rules:** Expose health, quotas, backlog and redacted outcomes; bounded backoff honors provider limits and cost caps pause nonessential work without dropping money facts.

  **Done when:** Repairing a failed job cannot reexecute a known completed financial effect.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.05](#f30-05) **Specification:** Documented parent requirement/contract: [INT-012 — Reconciliation, audit and cost controls](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-012--reconciliation-audit-and-cost-controls).

- [ ] <a id="f30-14"></a>**F30.14 — Emergency automation stop** · `S · specified` — Pause future tenant/provider effects with an audited stop switch.

  **Workflow:** Stop future effects under an audited control while checking cancellation at the side-effect boundary; no promise to recall already-sent money/email. **Rules:** Durable leased jobs have bounded retries/checkpoints and idempotent effects; cancellation/current grants are rechecked before external side effects.

  **Done when:** Already-sent messages remain honestly irreversible while unsent work stops.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.05](#f30-05) **Specification:** Documented parent requirement/contract: [INT-010 — Safe job execution](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-010--safe-job-execution).

**Demonstrate before closing this phase:** Dry-run a rule against synthetic records, enable it and trigger a retry and loop. Effects remain deduplicated and bounded; sending or issuing requires its explicit authority and emergency stop prevents future execution.

<a id="phase-47"></a>

## Phase 47 — Connect external tools through a scoped API and webhooks

**User outcome:** A developer can create restricted tokens, call versioned domain APIs, subscribe to outgoing events and inspect webhook delivery.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 12](#phase-12), [Phase 39](#phase-39), [Phase 46](#phase-46)

### Features delivered

- [ ] <a id="f30-01"></a>**F30.01 — Scoped API tokens** · `S · specified` — Issue expiring revocable credentials whose grants cannot exceed their issuer.

  **Workflow:** Scope API credentials to revocable capabilities/resources and per-tenant limits; issuing a token cannot exceed or permanently preserve the actor's authority. **Rules:** Tokens are scoped/revocable and bounded; webhooks use signatures/event IDs and reject private-network/redirect SSRF or privilege-bearing payloads.

  **Done when:** Removing the issuing member immediately blocks protected token actions.

  **Feature prerequisites:** [F03.06](#f03-06), [F02.07](#f02-07) **Specification:** Documented parent requirement/contract: [INT-008 — External API/webhooks](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-008--external-apiwebhooks).

- [ ] <a id="f30-02"></a>**F30.02 — Versioned API contracts** · `S · specified` — Publish bounded schemas, cursor pagination, errors and compatibility policy.

  **Workflow:** Declare supported version/envelope, bounded payloads/cursors, errors and idempotent commands; exact endpoint schemas are approved phase-level implementation work. **Rules:** Tokens are scoped/revocable and bounded; webhooks use signatures/event IDs and reject private-network/redirect SSRF or privilege-bearing payloads.

  **Done when:** Unsupported fields/versions fail explicitly without silent data mutation.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.01](#f30-01), [F05.05](#f05-05) **Specification:** Documented parent requirement/contract: [INT-008 — External API/webhooks](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-008--external-apiwebhooks).

- [ ] <a id="f30-04"></a>**F30.04 — Outgoing webhooks** · `S · specified` — Send signed event IDs to reviewed HTTPS destinations with replay-safe retry.

  **Workflow:** Sign outgoing payload/event identity and use reviewed HTTPS destinations with retry/rotation; prevent private-network access through redirects or DNS targeting. **Rules:** Tokens are scoped/revocable and bounded; webhooks use signatures/event IDs and reject private-network/redirect SSRF or privilege-bearing payloads.

  **Done when:** Redirects to private/metadata addresses are rejected before network access.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.05](#f30-05), [F30.03](#f30-03) **Specification:** Documented parent requirement/contract: [INT-008 — External API/webhooks](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-008--external-apiwebhooks).

- [ ] <a id="f30-15"></a>**F30.15 — Webhook delivery console** · `E · optional expansion` — Inspect redacted delivery attempts and replay selected events under current grants.

  **Workflow:** Delivery inspection/replay is proposed API tooling; retain original event identity, redact payloads and revalidate scope before any replay. **Rules:** Tokens are scoped/revocable and bounded; webhooks use signatures/event IDs and reject private-network/redirect SSRF or privilege-bearing payloads.

  **Done when:** Replaying one event preserves its identity and cannot leak another tenant's payload.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.04](#f30-04), [F30.13](#f30-13) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-008 — External API/webhooks](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-008--external-apiwebhooks).

- [ ] <a id="f30-16"></a>**F30.16 — No-code integration adapter** · `E · optional expansion` — Expose reviewed Zapier/Make-style triggers/actions using the same API grants.

  **Workflow:** No-code platforms are proposed consumers of the same scoped API; select concrete platform/data-sharing contract without creating a bypass for paid or privileged actions. **Rules:** Tokens are scoped/revocable and bounded; webhooks use signatures/event IDs and reject private-network/redirect SSRF or privilege-bearing payloads.

  **Done when:** Third-party flows cannot bypass quotas, validation or invoice authority.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.02](#f30-02), [F30.04](#f30-04) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-008 — External API/webhooks](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-008--external-apiwebhooks).

- [ ] <a id="f30-17"></a>**F30.17 — Developer sandbox** · `E · optional expansion` — Provide synthetic fixtures and isolated credentials for integration trials.

  **Workflow:** A developer sandbox remains proposed isolated synthetic environment/credentials with distinct callbacks and grants; it cannot reuse production tenant authority. **Rules:** Separate environments/credentials and synthetic preview data; deploy reviewed server-capable builds with compatible migrations and current ingress/auth/cache verification.

  **Done when:** Sandbox callbacks cannot post into production tenant data.

  **Feature prerequisites:** [F03.06](#f03-06), [F30.02](#f30-02), [F38.01](#f38-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Environments and delivery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#environments-and-delivery); [INT-002 — Authorization and secret handling](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-002--authorization-and-secret-handling).

**Demonstrate before closing this phase:** Use a project-scoped token, reject another project’s record and revoke the token before a queued effect. Replay incoming/outgoing events safely and test a version mismatch without bypassing domain validation.

<a id="phase-48"></a>

## Phase 48 — Publish reusable client intake forms

**User outcome:** A freelancer can build a versioned form with conditional fields and attachments, publish or embed it and review routed submissions.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 16](#phase-16), [Phase 18](#phase-18)

### Features delivered

- [ ] <a id="f31-01"></a>**F31.01 — Reusable form schemas** · `E · optional expansion` — Define bounded text/choice/date/file fields with typed validation.

  **Workflow:** Reusable form schemas remain an extension over questionnaires/custom fields; select supported field types and validation without trusting submissions to set roles or price authority. **Rules:** Readiness uses explicit blocking items, owner verification and documented waivers; templates cannot erase answers or store access credentials.

  **Done when:** An unknown field cannot set role, price or trusted system metadata.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-008 — Onboarding, questionnaires, and access readiness](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-008--onboarding-questionnaires-and-access-readiness).

- [ ] <a id="f31-02"></a>**F31.02 — Conditional form fields** · `E · optional expansion` — Show reviewed field branches using allowlisted conditions.

  **Workflow:** Conditional branching has no approved rule language in current docs; define bounded predicates, required-field semantics and cycle rejection before implementation. **Rules:** Readiness uses explicit blocking items, owner verification and documented waivers; templates cannot erase answers or store access credentials.

  **Done when:** Hidden required fields and cycles cannot trap a user or bypass validation.

  **Feature prerequisites:** [F03.06](#f03-06), [F31.01](#f31-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-008 — Onboarding, questionnaires, and access readiness](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-008--onboarding-questionnaires-and-access-readiness).

- [ ] <a id="f31-03"></a>**F31.03 — Form versioning** · `E · optional expansion` — Freeze the schema shown to a respondent and preserve submitted answers.

  **Workflow:** Form versioning is proposed specialization of versioned questionnaires/templates; preserve which schema and prompt text a response actually answered. **Rules:** Readiness uses explicit blocking items, owner verification and documented waivers; templates cannot erase answers or store access credentials.

  **Done when:** Changing a questionnaire leaves previous responses interpretable.

  **Feature prerequisites:** [F03.06](#f03-06), [F31.01](#f31-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-008 — Onboarding, questionnaires, and access readiness](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-008--onboarding-questionnaires-and-access-readiness).

- [ ] <a id="f31-04"></a>**F31.04 — Form draft completion** · `E · optional expansion` — Allow approved save/resume with purpose-bound identity and expiry.

  **Workflow:** Resume behavior remains proposed recipient/expiry/draft policy; protected browser answers cannot persist until the existing offline key/recovery gate passes. **Rules:** Protected persistence stays disabled until Q-06/Q-07 proof; atomic IndexedDB save handles denial/eviction/key loss without a fake durable acknowledgement.

  **Done when:** An expired or forwarded resume link cannot expose protected answers.

  **Feature prerequisites:** [F03.06](#f03-06), [F31.03](#f31-03), [F05.02](#f05-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Offline-draft security and persistence gate](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#offline-draft-security-and-persistence-gate).

- [ ] <a id="f31-05"></a>**F31.05 — Form submission routing** · `E · optional expansion` — Assign reviewed responses to the correct workspace/client/project queue.

  **Workflow:** Submission routing remains proposed mapping into permitted client/project/onboarding records; choose routing policy and never accept payload tenant IDs as authority. **Rules:** Readiness uses explicit blocking items, owner verification and documented waivers; templates cannot erase answers or store access credentials.

  **Done when:** User-supplied routing IDs cannot redirect submissions across tenants.

  **Feature prerequisites:** [F03.06](#f03-06), [F31.03](#f31-03), [F38.06](#f38-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-008 — Onboarding, questionnaires, and access readiness](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-008--onboarding-questionnaires-and-access-readiness).

- [ ] <a id="f31-06"></a>**F31.06 — Form attachment intake** · `E · optional expansion` — Stage bounded uploads under the shared quarantine/access policy.

  **Workflow:** Attachment intake remains proposed reuse of staged private-file verification; keep unverified bytes separate from committed answers/readiness evidence. **Rules:** Attachments retain hash/type/size/version and upload state; incomplete uploads are not final files and conflicting note bodies preserve revisions.

  **Done when:** Submission success cannot publish an unverified attachment.

  **Feature prerequisites:** [F03.06](#f03-06), [F31.03](#f31-03), [F15.03](#f15-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-011 — Files, notes and knowledge links](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-011--files-notes-and-knowledge-links).

- [ ] <a id="f31-07"></a>**F31.07 — Form response review** · `E · optional expansion` — Review incomplete/duplicate submissions before converting them into business records.

  **Workflow:** Review/conversion remains proposed staged-import behavior: preview mapping, source identity, duplicates and unresolved errors before creating accepted business records. **Rules:** Preview locale/unit/currency mappings, duplicates and row failures; stable batch/source IDs dedupe imports and consistent exports disclose omissions.

  **Done when:** Replaying a submission cannot create a duplicate lead or task.

  **Feature prerequisites:** [F03.06](#f03-06), [F31.05](#f31-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Import and export](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#import-and-export).

- [ ] <a id="f31-08"></a>**F31.08 — Embeddable intake form** · `E · optional expansion` — Offer a reviewed embed with explicit frame, origin and abuse policy.

  **Workflow:** Embedded forms have no approved frame/origin/security contract; distinguish public intake from authenticated portal/workspace pages and review any new exposure boundary. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** Embedding a public form cannot embed the authenticated workspace.

  **Feature prerequisites:** [F03.06](#f03-06), [F31.05](#f31-05), [F38.07](#f38-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal); [Before deployment/public exposure](/home/mohamed-s/Desktop/Projects/solor-desk/docs/security/release-checklist.md#before-deploymentpublic-exposure).

- [ ] <a id="f08-09"></a>**F08.09 — Public intake forms** · `E · optional expansion` — Public lead/intake form with configurable safe fields, consent, spam protection and routing.

  **Workflow:** Public intake is a proposed capture path; the client model and abuse/identity rules apply, and submission never automatically grants membership. **Rules:** Referenced parties archive rather than disappear; duplicates are suggestions, and merge needs atomic links plus proven backup or reversible journal.

  **Done when:** A forged workspace/owner field cannot route a lead into an unrelated tenant.

  **Feature prerequisites:** [F07.01](#f07-01), [F31.01](#f31-01), [F31.05](#f31-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-001 — Clients, contacts, and relationship integrity](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-001--clients-contacts-and-relationship-integrity).

**Demonstrate before closing this phase:** Submit an older published form revision twice, preserve its field version and create one routed result. Untrusted uploads and public rate limits remain enforced; form input cannot create workspace membership.

<a id="phase-49"></a>

## Phase 49 — Let clients book, reschedule and cancel meetings

**User outcome:** A freelancer can publish bookable services and availability, collect intake answers and manage reservations and reminders.

**Build after:** [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 08](#phase-08), [Phase 15](#phase-15), [Phase 21](#phase-21), [Phase 23](#phase-23), [Phase 48](#phase-48)

### Features delivered

- [ ] <a id="f32-01"></a>**F32.01 — Booking service types** · `E · optional expansion` — Define meeting duration, host, location, notice and calendar timezone.

  **Workflow:** Booking service types remain proposed activity templates; approve host, duration, location and date/time policy before treating a request as confirmed availability. **Rules:** Follow-up completion/snooze preserves history; recording communication never implies sending, and overdue catch-up is deduplicated.

  **Done when:** An unavailable or disabled service cannot receive a confirmed booking.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-003 — Activity timeline, follow-ups, and communication records](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-003--activity-timeline-follow-ups-and-communication-records).

- [ ] <a id="f32-02"></a>**F32.02 — Booking availability windows** · `E · optional expansion` — Apply working hours, buffers, holidays, minimum notice and booking horizon.

  **Workflow:** Availability windows remain proposed use of working calendars and selected busy intervals; notice/buffer/horizon values are not supplied by current docs. **Rules:** Capacity includes working calendar and leave; schedules remain suggestions until accepted, with missing estimates shown separately.

  **Done when:** A DST transition never creates an impossible local slot.

  **Feature prerequisites:** [F03.06](#f03-06), [F32.01](#f32-01), [F14.03](#f14-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-005 — Scheduling, capacity and workload](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-005--scheduling-capacity-and-workload).

- [ ] <a id="f32-03"></a>**F32.03 — Booking reservation** · `E · optional expansion` — Hold and confirm one slot with concurrency-safe expiry.

  **Workflow:** Concurrent slot holding is not a documented baseline state machine; approve hold identity, expiry and confirmation rules before implementing reservation authority. **Rules:** Map selected events by external ID/revision, preserve private fields and timezone exceptions; invitations need separate consent and events are not work evidence.

  **Done when:** Two simultaneous customers cannot confirm a single-host slot twice.

  **Feature prerequisites:** [F03.06](#f03-06), [F32.02](#f32-02), [F38.04](#f38-04) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar).

- [ ] <a id="f32-04"></a>**F32.04 — Booking reschedule and cancel** · `E · optional expansion` — Use scoped expiring actions and retain prior timing history.

  **Workflow:** Reschedule/cancel actions remain proposed event-version changes; define recipient verification and retain source mapping/history so stale actions cannot affect replacement events. **Rules:** Map selected events by external ID/revision, preserve private fields and timezone exceptions; invitations need separate consent and events are not work evidence.

  **Done when:** A stale cancellation token cannot cancel a replacement booking.

  **Feature prerequisites:** [F03.06](#f03-06), [F32.03](#f32-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar).

- [ ] <a id="f32-05"></a>**F32.05 — Booking intake questions** · `E · optional expansion` — Collect approved session questions linked to the booking version.

  **Workflow:** Booking questions remain proposed questionnaire instances tied to the intended client/engagement rather than an unrestricted personal-data form. **Rules:** Readiness uses explicit blocking items, owner verification and documented waivers; templates cannot erase answers or store access credentials.

  **Done when:** Answers cannot expose another attendee's personal data.

  **Feature prerequisites:** [F03.06](#f03-06), [F32.03](#f32-03), [F31.01](#f31-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-008 — Onboarding, questionnaires, and access readiness](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-008--onboarding-questionnaires-and-access-readiness).

- [ ] <a id="f32-06"></a>**F32.06 — Booking reminders** · `E · optional expansion` — Deliver opted-in reminders from current booking facts.

  **Workflow:** Booking reminders remain proposed source-event notices; recheck the latest session time/cancellation and approved channel before delivery. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** Canceled or moved sessions suppress stale queued reminders.

  **Feature prerequisites:** [F03.06](#f03-06), [F32.03](#f32-03), [F06.06](#f06-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f08-11"></a>**F08.11 — Discovery-call requests** · `E · optional expansion` — Simple booking/discovery-call requests with availability review, timezone and cancellation rules.

  **Workflow:** Booking/discovery requests are proposed linked activities with explicit timezone and confirmation policy; they are not confirmed work intervals. **Rules:** Follow-up completion/snooze preserves history; recording communication never implies sending, and overdue catch-up is deduplicated.

  **Done when:** Requesting a meeting neither sends an invitation nor creates billable time automatically.

  **Feature prerequisites:** [F07.01](#f07-01), [F08.01](#f08-01), [F32.03](#f32-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-003 — Activity timeline, follow-ups, and communication records](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-003--activity-timeline-follow-ups-and-communication-records).

- [ ] <a id="f14-12"></a>**F14.12 — External meeting coordination** · `E · optional expansion` — External meeting/booking coordination through approved calendar integration, never automatic billable time.

  **Workflow:** External booking/event coordination uses mapped event IDs/revisions and separately enabled invite actions. **Rules:** Map selected events by external ID/revision, preserve private fields and timezone exceptions; invitations need separate consent and events are not work evidence.

  **Done when:** A canceled remote event is reconciled and never becomes automatically billed time.

  **Feature prerequisites:** [F12.01](#f12-01), [F13.01](#f13-01), [F32.03](#f32-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar).

- [ ] <a id="f28-13"></a>**F28.13 — Meeting provider links** · `E · optional expansion` — Generate approved conferencing links through a selected adapter.

  **Workflow:** Meeting-provider links remain proposed event integration; select provider/scopes and reconcile cancellation/reschedule before claiming a valid live meeting. **Rules:** Map selected events by external ID/revision, preserve private fields and timezone exceptions; invitations need separate consent and events are not work evidence.

  **Done when:** Canceled or rebooked sessions do not leave duplicate live bookings.

  **Feature prerequisites:** [F27.02](#f27-02), [F32.03](#f32-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar).

**Demonstrate before closing this phase:** Have two clients attempt the same slot simultaneously, keep one valid reservation and release expired holds. Reschedule across timezones and suppress reminders for the canceled booking.

<a id="phase-50"></a>

## Phase 50 — Offer group, team-routed and paid bookings

**User outcome:** A freelancer or team can offer group capacity, round-robin routing and explicitly payment- or signature-dependent bookings.

**Build after:** [Phase 03](#phase-03), [Phase 39](#phase-39), [Phase 40](#phase-40), [Phase 49](#phase-49)

### Features delivered

- [ ] <a id="f32-07"></a>**F32.07 — Group booking capacity** · `E · optional expansion` — Enforce explicit seat capacity and participant privacy.

  **Workflow:** Group booking is not currently specified; select capacity, concurrency and participant-privacy rules without exposing calendar titles or other attendee identities. **Rules:** Map selected events by external ID/revision, preserve private fields and timezone exceptions; invitations need separate consent and events are not work evidence.

  **Done when:** Concurrent reservations cannot exceed remaining seats.

  **Feature prerequisites:** [F03.06](#f03-06), [F32.03](#f32-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar).

- [ ] <a id="f32-08"></a>**F32.08 — Team round-robin booking** · `E · optional expansion` — Choose eligible hosts by reviewed availability/routing rules.

  **Workflow:** Round-robin host routing is an extension beyond documented capacity suggestions; choose assignment/fairness policy and current host eligibility before confirmation. **Rules:** Capacity includes working calendar and leave; schedules remain suggestions until accepted, with missing estimates shown separately.

  **Done when:** A removed or unavailable member cannot receive a new confirmed session.

  **Feature prerequisites:** [F03.06](#f03-06), [F32.02](#f32-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-005 — Scheduling, capacity and workload](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-005--scheduling-capacity-and-workload).

- [ ] <a id="f32-09"></a>**F32.09 — Paid booking prerequisite** · `E · optional expansion` — Confirm only after verified payment under explicit cancellation/refund terms.

  **Workflow:** Payment-conditioned booking lacks an approved commercial state contract; verified hosted-provider capture is necessary but refund/hold/cancel terms still need decisions. **Rules:** Verify callback identity and amount/currency/customer/invoice; separate capture, fee, payout, refund and chargeback, with no raw card custody.

  **Done when:** A checkout return URL alone cannot confirm payment or reserve forever.

  **Feature prerequisites:** [F03.06](#f03-06), [F32.03](#f32-03), [F27.06](#f27-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-006 — Payment providers](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-006--payment-providers); [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar); [Decisions requiring user input before dependent work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#decisions-requiring-user-input-before-dependent-work).

- [ ] <a id="f32-10"></a>**F32.10 — Booking signature prerequisite** · `E · optional expansion` — Require an approved agreement version where policy demands it.

  **Workflow:** Signature-conditioned booking lacks an approved reservation policy; choose exact agreement/evidence and eligibility rules without treating a stale signature as new consent. **Rules:** Capture operator and purported client actor separately; stale responses require review and manual evidence cannot display as verified signature.

  **Done when:** A stale or withdrawn signature version cannot satisfy the reservation gate.

  **Feature prerequisites:** [F03.06](#f03-06), [F32.03](#f32-03), [F10.12](#f10-12) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-006 — Decisions, acceptance evidence, and disagreement](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-006--decisions-acceptance-evidence-and-disagreement); [INT-004 — Calendar](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-004--calendar).

**Demonstrate before closing this phase:** Race the last group seat, skip an unavailable team member and expire an unpaid hold. Confirm only after the correct verified payment/signature evidence; retries cannot exceed capacity.

<a id="phase-51"></a>

## Phase 51 — Turn client requests and feedback into reviewed work

**User outcome:** Clients can submit requests or feedback while members triage bugs, classify scope and track the resulting tasks or incident work.

**Build after:** [Phase 03](#phase-03), [Phase 07](#phase-07), [Phase 08](#phase-08), [Phase 09](#phase-09), [Phase 37](#phase-37), [Phase 48](#phase-48)

### Features delivered

- [ ] <a id="f31-09"></a>**F31.09 — Service request classification** · `E · optional expansion` — Categorize bugs, support work and scope changes with explicit commercial review.

  **Workflow:** Request classification remains proposed commercial triage; bugs/support/scope requests still require an explicit accepted baseline change before new obligations apply. **Rules:** An approved change applies only to its reviewed baseline revision; approval, invoice issuance and payment remain separate authorities.

  **Done when:** A bug report never automatically becomes accepted out-of-scope billing.

  **Feature prerequisites:** [F03.06](#f03-06), [F31.05](#f31-05), [F13.01](#f13-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-008 — Scope baseline and change requests](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-008--scope-baseline-and-change-requests).

- [ ] <a id="f31-10"></a>**F31.10 — Request status communication** · `E · optional expansion` — Publish selected queue status and responses to the intended requester.

  **Workflow:** Requester-visible status remains proposed publication of selected responses; internal notes, triage costs and other clients' requests stay excluded. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** Internal triage notes and other clients' requests remain private.

  **Feature prerequisites:** [F03.06](#f03-06), [F31.09](#f31-09), [F29.02](#f29-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal).

- [ ] <a id="f29-14"></a>**F29.14 — Client feedback surveys** · `E · optional expansion` — Collect optional milestone/closure feedback with visible purpose and retention.

  **Workflow:** Feedback surveys remain proposed scoped content with reviewed purpose/retention; submitting a response cannot accept legal terms or alter settlement. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** Submitting feedback cannot approve an invoice or expand client access.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.02](#f29-02), [F31.01](#f31-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal).

- [ ] <a id="f29-18"></a>**F29.18 — Client request queue** · `E · optional expansion` — Let clients submit support/change requests with attachment and status limits.

  **Workflow:** Client request submission remains proposed reviewed input; convert a request through task/scope-change services rather than automatically accepting new commercial obligations. **Rules:** An approved change applies only to its reviewed baseline revision; approval, invoice issuance and payment remain separate authorities.

  **Done when:** A request never changes contracted scope or creates billable time automatically.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.02](#f29-02), [F31.09](#f31-09) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-008 — Scope baseline and change requests](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-008--scope-baseline-and-change-requests).

- [ ] <a id="f33-01"></a>**F33.01 — Client feedback links** · `E · optional expansion` — Associate a customer request with tasks/projects and original feedback evidence.

  **Workflow:** Feedback-to-work links remain proposed source evidence for later task/scope review; no request can silently rewrite the accepted commercial baseline. **Rules:** An approved change applies only to its reviewed baseline revision; approval, invoice issuance and payment remain separate authorities.

  **Done when:** Closing a task does not falsify the original requester conversation.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F31.09](#f31-09) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-008 — Scope baseline and change requests](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-008--scope-baseline-and-change-requests).

- [ ] <a id="f33-02"></a>**F33.02 — Bug triage** · `E · optional expansion` — Track severity, reproduction, affected version and duplicate links.

  **Workflow:** Bug severity/reproduction/version metadata remains proposed; any duplicate relationships must be defined independently from initial finish-to-start scheduling semantics. **Rules:** Initial dependency semantics are finish-to-start; cycles are rejected and task completion does not imply external milestone acceptance.

  **Done when:** A duplicate link preserves both reporters and cannot form a cycle.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-003 — Dependencies and milestones](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-003--dependencies-and-milestones).

- [ ] <a id="f33-12"></a>**F33.12 — Incident work records** · `E · optional expansion` — Link incident timeline, decisions and actual recovery work to a support engagement.

  **Workflow:** Incident work links remain proposed dated activity/source evidence; incident duration, task events or repository events cannot substitute for reviewed time capture. **Rules:** Follow-up completion/snooze preserves history; recording communication never implies sending, and overdue catch-up is deduplicated.

  **Done when:** Incident elapsed time alone never becomes billable time.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01), [F16.10](#f16-10) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-003 — Activity timeline, follow-ups, and communication records](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-003--activity-timeline-follow-ups-and-communication-records).

**Demonstrate before closing this phase:** Submit a portal request, classify and link it to a task, then publish a permitted status update. A request does not automatically amend paid scope or expose an internal incident record.

<a id="phase-52"></a>

## Phase 52 — Manage software releases, handovers and maintenance agreements

**User outcome:** A technical freelancer can record releases, client release notes, warranties, response commitments and project handover assets.

**Build after:** [Phase 03](#phase-03), [Phase 04](#phase-04), [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 08](#phase-08), [Phase 15](#phase-15), [Phase 17](#phase-17), [Phase 22](#phase-22), [Phase 26](#phase-26), [Phase 35](#phase-35), [Phase 37](#phase-37)

**Additional ordering clarification:** [Phase 17](#phase-17) supplies behavior referenced in the feature text but missing from its old prerequisite line. The original feature prerequisite lines remain intact.

### Features delivered

- [ ] <a id="f33-03"></a>**F33.03 — Release records** · `E · optional expansion` — Group approved deliverables into a release with exact references and notes.

  **Workflow:** Release records remain proposed grouping of immutable reviewed deliverable versions; releasing cannot transfer acceptance to newly replaced bytes. **Rules:** Publication selects exact content and reviewers online; new versions preserve prior evidence and require the applicable new approval.

  **Done when:** A release cannot inherit acceptance for an unreviewed replacement artifact.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F13.01](#f13-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-009 — Deliverables and acceptance](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-009--deliverables-and-acceptance).

- [ ] <a id="f33-04"></a>**F33.04 — Release readiness checklist** · `E · optional expansion` — Review agreed testing, deployment and handover evidence per engagement.

  **Workflow:** Release checklists remain proposed explicit criteria over the existing deliverable review lifecycle, not automatic approval from task completion alone. **Rules:** Publication selects exact content and reviewers online; new versions preserve prior evidence and require the applicable new approval.

  **Done when:** Unchecked critical requirements block a ready status rather than auto-accepting delivery.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F33.03](#f33-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-009 — Deliverables and acceptance](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-009--deliverables-and-acceptance).

- [ ] <a id="f33-05"></a>**F33.05 — Client release notes** · `E · optional expansion` — Publish selected change notes through controlled portal publications.

  **Workflow:** Client release notes remain proposed selected portal publications with exact audience/version; draft internal incident or cost notes are not default external content. **Rules:** Portal routes use the same authorized services and shared design system; publish exact recipients/versions while internal drafts, costs and sibling files remain excluded.

  **Done when:** Private incident or cost notes cannot enter client release notes by default.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F33.03](#f33-03), [F29.02](#f29-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal).

- [ ] <a id="f33-06"></a>**F33.06 — Support agreement coverage** · `E · optional expansion` — Track covered services, periods and exclusions from the accepted agreement.

  **Workflow:** Support coverage is a proposed view of the executed agreement's period, obligations and exclusions; plan selection alone cannot extend accepted terms. **Rules:** Executed copies remain fixed; amendments are linked documents, incomplete terms stay visible and legal/signature sufficiency remains a decision.

  **Done when:** Expired coverage cannot be silently renewed or billed.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F10.09](#f10-09) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-007 — Contracts, statements of work, and obligation tracking](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-007--contracts-statements-of-work-and-obligation-tracking).

- [ ] <a id="f33-07"></a>**F33.07 — Response commitment tracking** · `E · optional expansion` — Measure explicitly agreed support response windows and paused intervals.

  **Workflow:** Response-commitment timers are not specified beyond contractual obligations/dates; select calendar, pause, acknowledgement and resolution semantics before promising an SLA. **Rules:** Executed copies remain fixed; amendments are linked documents, incomplete terms stay visible and legal/signature sufficiency remains a decision.

  **Done when:** The calculation uses the stated timezone/business calendar and distinguishes acknowledgement from resolution.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F33.06](#f33-06), [F06.06](#f06-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-007 — Contracts, statements of work, and obligation tracking](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-007--contracts-statements-of-work-and-obligation-tracking).

- [ ] <a id="f33-08"></a>**F33.08 — Warranty period tracking** · `E · optional expansion` — Link agreed warranty windows and covered issue handling to delivered versions.

  **Workflow:** Warranty tracking remains proposed agreement/version metadata; current docs supply no default warranty duration, coverage or free-work policy. **Rules:** Executed copies remain fixed; amendments are linked documents, incomplete terms stay visible and legal/signature sufficiency remains a decision.

  **Done when:** A warranty ticket never changes issued billing or legal terms automatically.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F15.06](#f15-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-007 — Contracts, statements of work, and obligation tracking](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-007--contracts-statements-of-work-and-obligation-tracking).

- [ ] <a id="f33-09"></a>**F33.09 — Maintenance renewal checklist** · `E · optional expansion` — Track required renewal review and service handover before expiry.

  **Workflow:** Maintenance renewal remains proposed review of documented notice/renewal dates and linked follow-up; reminders do not execute renewal or create debt. **Rules:** Health links to dated source evidence; missing history means unknown, and renewal opportunities never renew contracts or charge clients.

  **Done when:** A reminder does not extend a contract or charge a customer.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F33.06](#f33-06), [F11.08](#f11-08) **Specification:** Supporting contract; feature-specific extension remains unapproved: [CRM-010 — Renewals, account reviews, and explainable health](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/client-lifecycle.md#crm-010--renewals-account-reviews-and-explainable-health).

- [ ] <a id="f33-10"></a>**F33.10 — Technical asset references** · `E · optional expansion` — Link domain, repository and environment ownership metadata without storing secrets.

  **Workflow:** Technical asset inventory remains proposed safe links/ownership references; snippets, repository URLs and readiness checks cannot store live passwords or private keys. **Rules:** Attachments retain hash/type/size/version and upload state; incomplete uploads are not final files and conflicting note bodies preserve revisions.

  **Done when:** Access tokens and private keys are rejected from structured credential fields.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F26.01](#f26-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-011 — Files, notes and knowledge links](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-011--files-notes-and-knowledge-links).

- [ ] <a id="f12-09"></a>**F12.09 — Project handover** · `S · specified` — Project handover with exact deliverable/source references and scoped private costs.

  **Workflow:** Review membership, task ownership, files and open obligations in handover while leaving financial/legal evidence immutable. **Rules:** Moves preview client/currency/billing effects; allocated contradictions block moves, cross-workspace changes use reviewed import and identity history survives.

  **Done when:** A handover cannot detach an issued invoice from its source project history.

  **Feature prerequisites:** [F07.01](#f07-01), [F03.06](#f03-06), [F38.04](#f38-04), [F12.01](#f12-01), [F03.08](#f03-08) **Specification:** Documented parent requirement/contract: [WRK-014 — Archive, transfer and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-014--archive-transfer-and-recovery).

- [ ] <a id="f33-11"></a>**F33.11 — Project handover inventory** · `E · optional expansion` — List agreed code/docs/environments and client receipt evidence.

  **Workflow:** Handover inventory remains proposed evidence over permitted files, membership/task ownership and verified readiness; avoid claiming external control moved from a checklist alone. **Rules:** Moves preview client/currency/billing effects; allocated contradictions block moves, cross-workspace changes use reviewed import and identity history survives.

  **Done when:** A transfer checklist cannot claim external ownership changed without recorded evidence.

  **Feature prerequisites:** [F12.01](#f12-01), [F03.06](#f03-06), [F33.10](#f33-10), [F12.09](#f12-09) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-014 — Archive, transfer and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-014--archive-transfer-and-recovery).

**Demonstrate before closing this phase:** Create a release checklist, publish selected notes and hand over an asset inventory without credentials. Track an expiring warranty or maintenance renewal without claiming an unapproved service commitment.

<a id="phase-53"></a>

## Phase 53 — Customize reports and deliver scheduled summaries

**User outcome:** A freelancer can build approved report views, compare scenarios, share permitted dashboards and schedule report delivery.

**Build after:** [Phase 03](#phase-03), [Phase 12](#phase-12), [Phase 14](#phase-14), [Phase 15](#phase-15)

### Features delivered

- [ ] <a id="f25-17"></a>**F25.17 — Scheduled reports** · `S · specified` — Deliver snapshots to approved recipients through bounded jobs.

  **Workflow:** Schedule snapshot generation/delivery with stable occurrence identity and approved recipient channels; recheck scope immediately before delivery. **Rules:** Render one authorized frozen snapshot; retry the same snapshot, verify Arabic output and recheck recipient access before scheduled delivery.

  **Done when:** Revoked recipients are filtered immediately before delivery.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.14](#f25-14), [F30.05](#f30-05), [F27.03](#f27-03), [F06.07](#f06-07) **Specification:** Documented parent requirement/contract: [INS-009 — Reports, schedules and exports](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-009--reports-schedules-and-exports).

- [ ] <a id="f25-19"></a>**F25.19 — Scenario forecasting** · `E · optional expansion` — Compare explicit optimistic/base/conservative inputs without altering committed plans.

  **Workflow:** Scenario forecasting remains proposed; compare disclosed date/value/probability assumptions separately from authoritative debt, committed schedules or guaranteed cash. **Rules:** Aging reconciles to current debt; forecast separates contractual due amounts, promises, draft projections and subjective weighted pipeline.

  **Done when:** Each scenario exposes assumptions and preserves original operational facts.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.05](#f25-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INS-004 — Receivables, aging and cash forecast](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-004--receivables-aging-and-cash-forecast).

- [ ] <a id="f25-20"></a>**F25.20 — Dashboard sharing** · `E · optional expansion` — Share scoped dashboard definitions with selected members.

  **Workflow:** Shared dashboard configuration is proposed presentation over permitted source widgets, with explicit audience and no hidden finance through labels/counts. **Rules:** Widgets expose filters/as-of and source links; missing data is not zero and restricted finance never leaks through counts.

  **Done when:** Chart labels, counts and drill-down obey current recipient permissions.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.14](#f25-14) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INS-001 — Actionable home and saved views](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-001--actionable-home-and-saved-views).

- [ ] <a id="f25-21"></a>**F25.21 — Custom report builder** · `E · optional expansion` — Offer bounded allowlisted dimensions/measures without arbitrary SQL.

  **Workflow:** A custom builder remains proposed bounded configuration; approve allowlisted dimensions/formulas and workload budgets before allowing new report shapes. **Rules:** Definitions freeze basis, timezone, filters, scope and currency policy; every total reconciles to authorized source IDs.

  **Done when:** An expensive or unauthorized grouping is rejected before query execution.

  **Feature prerequisites:** [F03.06](#f03-06), [F25.01](#f25-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INS-002 — Reporting definitions and drill-down](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/insights-and-knowledge.md#ins-002--reporting-definitions-and-drill-down).

**Demonstrate before closing this phase:** Schedule a report, revoke the recipient and prevent its queued delivery. A custom report uses approved fields rather than arbitrary SQL; forecasts label assumptions and shared dashboards omit restricted costs.

<a id="phase-54"></a>

## Phase 54 — Get help, track support requests and see service status

**User outcome:** A member can find help, send and follow a support request, choose release/incident notices and grant temporary support access.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 12](#phase-12), [Phase 15](#phase-15), [Phase 20](#phase-20)

### Features delivered

- [ ] <a id="f36-01"></a>**F36.01 — In-app help** · `E · optional expansion` — Link contextual guidance and bilingual searchable documentation.

  **Workflow:** In-app help remains proposed contextual English/Arabic guidance over documented auth, draft, timer, financial correction and portability behavior. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** Help remains accessible when a paid capability is disabled.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f36-02"></a>**F36.02 — Support request submission** · `E · optional expansion` — Collect minimal problem context, consent and optional redacted diagnostic reference.

  **Workflow:** Support intake remains proposed minimal user-provided context with optional reviewed diagnostic export; opening a ticket cannot grant tenant access implicitly. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** Submitting a ticket never attaches private invoice/profile content implicitly.

  **Feature prerequisites:** [F03.06](#f03-06), [F36.01](#f36-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f36-03"></a>**F36.03 — Support ticket status** · `E · optional expansion` — Show requester-visible status and responses with scoped attachments.

  **Workflow:** Ticket tracking remains proposed requester-specific visibility and response/files model; agree retention and external delivery before implementing support conversation storage. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** A different user cannot enumerate ticket bodies or files.

  **Feature prerequisites:** [F03.06](#f03-06), [F36.02](#f36-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f36-04"></a>**F36.04 — Temporary support grants** · `S · specified` — Require purpose, scope, expiry and audit for approved support access.

  **Workflow:** Require explicit tenant-authorized purpose, scope, expiry and audit for staff assistance; no support role is automatically workspace Owner. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** An expired grant cannot fetch tenant data or continue an old support session.

  **Feature prerequisites:** [F03.06](#f03-06), [F02.07](#f02-07) **Specification:** Documented parent requirement/contract: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f36-05"></a>**F36.05 — Support diagnostic bundle** · `S · specified` — Export selected redacted build/request/sync metadata for review.

  **Workflow:** Preview selected version/error/health fields with safe correlation IDs; exclude databases, customer content, secrets and raw environment dumps by default. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** Tokens, raw financial details and client messages are absent by default.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.10](#f38-10) **Specification:** Documented parent requirement/contract: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f36-06"></a>**F36.06 — Product feedback backlog** · `E · optional expansion` — Collect categorized suggestions with source consent and deduplication.

  **Workflow:** Feedback intake remains proposed privacy-scoped collection; product analytics consent does not imply permission to publish a tenant's business examples. **Rules:** Minimize/redact diagnostics and keep analytics opt-in; support is temporary/scoped and retention/recovery follow reviewed lifecycle decisions.

  **Done when:** Private tenant details are not published as feature requests.

  **Feature prerequisites:** [F03.06](#f03-06), [F36.02](#f36-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Privacy, recovery and operations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#privacy-recovery-and-operations).

- [ ] <a id="f36-07"></a>**F36.07 — Public feature requests** · `E · optional expansion` — Publish moderated, consented requests and optional votes with abuse bounds.

  **Workflow:** Public requests/voting remain proposed publication requiring reviewed moderation/consent/abuse policy; private reports stay private until explicitly selected. **Rules:** Minimize/redact diagnostics and keep analytics opt-in; support is temporary/scoped and retention/recovery follow reviewed lifecycle decisions.

  **Done when:** Internal feedback is private until explicitly selected for publication.

  **Feature prerequisites:** [F03.06](#f03-06), [F36.06](#f36-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Privacy, recovery and operations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#privacy-recovery-and-operations).

- [ ] <a id="f36-08"></a>**F36.08 — Release communication preferences** · `E · optional expansion` — Let users choose optional product news while keeping necessary security notices defined.

  **Workflow:** Release-news preference remains proposed optional topic routing; necessary security notices require their separately documented exception policy. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** Marketing opt-out does not disable critical account-security notices.

  **Feature prerequisites:** [F03.06](#f03-06), [F06.03](#f06-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f36-09"></a>**F36.09 — Service status page** · `S · specified` — Publish verified component incidents and updates with operational ownership.

  **Workflow:** Service status is operationally owned; define affected components and verified incident evidence without disclosing customer-specific failure details. **Rules:** Monitor bounded workloads and minimal redacted diagnostics; product analytics/crash uploads are opt-in and provider limits are verified rather than assumed.

  **Done when:** An outage is distinguishable from a customer-specific permission error.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.11](#f38-11) **Specification:** Documented parent requirement/contract: [Quotas and observability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#quotas-and-observability).

- [ ] <a id="f36-10"></a>**F36.10 — Incident subscription** · `E · optional expansion` — Offer opted-in status notifications through an approved channel.

  **Workflow:** Incident subscriptions remain proposed explicit channel consent and minimal service-status content, not a public stream of tenant incident evidence. **Rules:** Topic/channel preferences, quiet hours and security exceptions are explicit; build content after scope check and dedupe source-event/recipient/channel.

  **Done when:** Status emails contain no affected tenant identities or private incident evidence.

  **Feature prerequisites:** [F03.06](#f03-06), [F36.09](#f36-09), [F37.02](#f37-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-011 — Notification delivery and preferences](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-011--notification-delivery-and-preferences).

- [ ] <a id="f36-11"></a>**F36.11 — Abuse report intake** · `E · optional expansion` — Provide a bounded reporting channel and restricted triage workflow.

  **Workflow:** Abuse reporting remains proposed restricted triage with safe evidence handling; a submitted report itself cannot authorize support access or suspend another tenant. **Rules:** Contain unsafe effects, preserve evidence and reconcile isolated DB-plus-files restore; support ownership and measured RPO/RTO remain Q-16.

  **Done when:** A malicious report cannot grant support authority or expose the reported tenant.

  **Feature prerequisites:** [F03.06](#f03-06), [F38.06](#f38-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Incidents and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#incidents-and-recovery).

- [ ] <a id="f36-12"></a>**F36.12 — Administrative remediation** · `S · specified` — Use scoped audited repair actions with preview and current authorization.

  **Workflow:** Maintenance/remediation actions use the same authorized application services, current revisions and audit; unknown/partial outcomes reconcile rather than bypass invariants. **Rules:** Every direct entry point uses shared authorized services; sensitive commands require current online authority and queued jobs are not delivery evidence.

  **Done when:** A repair cannot edit posted money or bypass the normal domain service.

  **Feature prerequisites:** [F03.06](#f03-06), [F36.04](#f36-04), [F37.08](#f37-08) **Specification:** Documented parent requirement/contract: [Command families](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/api-contracts.md#command-families).

**Demonstrate before closing this phase:** Create a support request and provide a redacted diagnostic bundle. Grant and expire purpose-bound support access, inspect its audit and show an incident only from actual service status; remediation cannot edit financial history directly.

<a id="phase-55"></a>

## Phase 55 — Export personal data and close an account safely

**User outcome:** An owner can review an account/workspace closure, obtain allowed exports and understand retention, legal holds and deletion progress.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 04](#phase-04), [Phase 10](#phase-10), [Phase 19](#phase-19)

### Features delivered

- [ ] <a id="f03-11"></a>**F03.11 — Workspace and account closure** · `S · specified` — Account/workspace closure preview, owner transfer, export path, grace and retention/legal-hold behavior.

  **Workflow:** Preview ownership, obligations, export, legal hold, grace and retention before closure; do not equate subscription cancellation with deletion. **Rules:** Purge respects legal holds, references, auth dependencies and backup expiry; tombstones prevent resurrection and downloaded copies have no remote-wipe guarantee.

  **Done when:** Closing a user cannot silently erase another owner's workspace or retained invoices.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.08](#f03-08), [F02.07](#f02-07), [F37.03](#f37-03) **Specification:** Documented parent requirement/contract: [Retention and evidence](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#retention-and-evidence).

- [ ] <a id="f37-05"></a>**F37.05 — Account deletion workflow** · `S · specified` — Reauthenticate, preview ownership/obligations and execute reviewed deletion/anonymization rules.

  **Workflow:** Reauthenticate and preview ownership, obligations, export and legal holds; delete/anonymize eligible data across projections/files and eventual backup expiry under approved policy. **Rules:** Purge respects legal holds, references, auth dependencies and backup expiry; tombstones prevent resurrection and downloaded copies have no remote-wipe guarantee.

  **Done when:** Deleting one user does not destroy retained workspace invoices or another owner's access.

  **Feature prerequisites:** [F03.11](#f03-11), [F37.03](#f37-03), [F37.04](#f37-04) **Specification:** Documented parent requirement/contract: [Retention and evidence](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#retention-and-evidence).

- [ ] <a id="f37-06"></a>**F37.06 — Privacy access export** · `E · optional expansion` — Provide verified subject-access handling with reviewed third-party redaction.

  **Workflow:** Privacy access handling remains proposed verified requester/redaction workflow; ordinary workspace exports are not automatically a complete statutory subject-access process. **Rules:** Preview locale/unit/currency mappings, duplicates and row failures; stable batch/source IDs dedupe imports and consistent exports disclose omissions.

  **Done when:** A subject request cannot reveal another client's private data.

  **Feature prerequisites:** [F34.05](#f34-05), [F02.07](#f02-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Import and export](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#import-and-export); [Privacy, recovery and operations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#privacy-recovery-and-operations).

- [ ] <a id="f37-09"></a>**F37.09 — Audit export** · `S · specified` — Generate a permitted audit export with checksums and visible coverage/retention limits; independent tamper-evidence requires F37.10 proof.

  **Workflow:** Export only the approved permitted audit projection and disclose format/scope/as-of/checksums; independently tamper-evident claims require additional proof beyond an ordinary DB export. **Rules:** Ordinary members cannot alter audit history; reads/exports need current scope, and independent tamper-evidence requires separate proof.

  **Done when:** The export excludes private fields outside the requesting grant.

  **Feature prerequisites:** [F37.08](#f37-08), [F34.04](#f34-04) **Specification:** Documented parent requirement/contract: [Capability requirements — PLT-014](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#capability-requirements); [Privacy, recovery and operations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#privacy-recovery-and-operations).

- [ ] <a id="f37-10"></a>**F37.10 — Independent audit integrity** · `E · optional expansion` — Add reviewed append-only or independently verifiable evidence if a concrete need selects it.

  **Workflow:** Independent append-only audit integrity remains proposed: the current audit contract alone does not prove resistance to a privileged database operator. **Rules:** User exports exclude auth secrets; service backups include sensitive auth data and require encryption/isolation and restored credential invalidation.

  **Done when:** A database operator rewrite is detectable under the declared threat model.

  **Feature prerequisites:** [F37.08](#f37-08) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Backup classes](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#backup-classes).

<details>
<summary>Supporting work included in this feature phase — 1 tracked entries</summary>

- [ ] <a id="f38-19"></a>**F38.19 — Data lifecycle cleanup jobs** · `S · specified` — Remove expired temporary exports, abandoned uploads and eligible records within policy.

  **Workflow:** Purge only expired eligible exports/uploads/records after reference/hold/retention checks and preserve tombstones/current schema protections against stale resurrection. **Rules:** Purge respects legal holds, references, auth dependencies and backup expiry; tombstones prevent resurrection and downloaded copies have no remote-wipe guarantee.

  **Done when:** Cleanup cannot delete a committed file or unresolved recoverable draft accidentally.

  **Feature prerequisites:** [F37.03](#f37-03) **Specification:** Documented parent requirement/contract: [Retention and evidence](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#retention-and-evidence).

</details>

**Demonstrate before closing this phase:** Preview closure with open obligations, transfer ownership where required and apply a legal hold. Retained evidence stays readable under policy; deletion and cleanup cannot silently erase outstanding invoices, committed files or another owner’s records.

<a id="phase-56"></a>

## Phase 56 — Brand client documents and the portal

**User outcome:** A business can apply workspace branding and an approved verified portal domain without changing legal document history.

**Build after:** [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 37](#phase-37)

### Features delivered

- [ ] <a id="f03-13"></a>**F03.13 — Workspace branding** · `E · optional expansion` — Workspace branding/profile images, invitation branding and reusable onboarding presets.

  **Workflow:** Branding candidates must reuse current semantic tokens/components and approved file projections; branding cannot change legal seller snapshots. **Rules:** Reuse shared shadcn/Base UI components and semantic tokens with keyboard/focus/RTL; the current monochrome design overrides older visual recipes.

  **Done when:** An invitation label or image cannot inject active content or replace required workspace context.

  **Feature prerequisites:** [F38.04](#f38-04), [F03.06](#f03-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Components](/home/mohamed-s/Desktop/Projects/solor-desk/DESIGN.md#components).

- [ ] <a id="f29-16"></a>**F29.16 — Branded portal presentation** · `E · optional expansion` — Apply approved business logo/text within accessible shared tokens.

  **Workflow:** Portal branding remains proposed constrained use of current design-system tokens and allowed identity fields; mandatory seller/security disclosures remain intact. **Rules:** Reuse shared shadcn/Base UI components and semantic tokens with keyboard/focus/RTL; the current monochrome design overrides older visual recipes.

  **Done when:** Branding cannot inject CSS/scripts or hide mandatory identity/disclosure fields.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.03](#f29-03), [F03.13](#f03-13) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Components](/home/mohamed-s/Desktop/Projects/solor-desk/DESIGN.md#components).

- [ ] <a id="f40-01"></a>**F40.01 — Verified business domains** · `E · optional expansion` — Verify control of a domain for an approved organization policy.

  **Workflow:** Domain verification remains a proposed identity policy; Q-08 must define ownership proof/expiry and account/member effects, with no membership inferred from email suffix. **Rules:** Q decisions are unresolved gates, not implicit defaults; select policy, provider, budget and legal treatment before the dependent feature is activated.

  **Done when:** A matching email suffix alone never grants membership or SSO authority.

  **Feature prerequisites:** [F03.06](#f03-06), [F02.07](#f02-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Complex decisions still open](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#complex-decisions-still-open).

- [ ] <a id="f29-17"></a>**F29.17 — Portal custom domain** · `E · optional expansion` — Verify domain ownership and review cookies, TLS and tenant routing.

  **Workflow:** Custom domains have no approved routing/cookie/TLS contract in current docs; Q-10/Q-11 and an explicit architecture/security decision gate further detail. **Rules:** Q decisions are unresolved gates, not implicit defaults; select policy, provider, budget and legal treatment before the dependent feature is activated.

  **Done when:** An unverified host cannot serve another tenant's portal or auth cookies.

  **Feature prerequisites:** [F03.06](#f03-06), [F29.16](#f29-16), [F40.01](#f40-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Complex decisions still open](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#complex-decisions-still-open); [Client portal](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/sync-and-collaboration.md#client-portal); [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

**Demonstrate before closing this phase:** Verify domain control before activation, remove a stale mapping and reject a mismatched host. Branding updates affect future presentation while issued seller identity and document snapshots stay fixed.

<a id="phase-57"></a>

## Phase 57 — Subscribe to SoloDesk and manage the product plan

**User outcome:** A workspace billing owner can purchase a SoloDesk plan, review seats/trials, change plans, inspect provider invoices and cancel with export guidance.

**Build after:** [Phase 03](#phase-03), [Phase 04](#phase-04), [Phase 12](#phase-12), [Phase 15](#phase-15), [Phase 19](#phase-19)

### Features delivered

- [ ] <a id="f35-01"></a>**F35.01 — Product plan definitions** · `E · optional expansion` — Define published plans, seats, quotas and included capabilities with effective versions.

  **Workflow:** Product plans/limits need Q-12 selection and versioned published terms; do not infer numeric pricing or included capability counts from competitor research. **Rules:** Q decisions are unresolved gates, not implicit defaults; select policy, provider, budget and legal treatment before the dependent feature is activated.

  **Done when:** Changing a plan never hides historical financial exports needed by canceled users.

  **Feature prerequisites:** [F03.06](#f03-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Complex decisions still open](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#complex-decisions-still-open).

- [ ] <a id="f35-02"></a>**F35.02 — Product subscription checkout** · `E · optional expansion` — Purchase a chosen SoloDesk plan through approved hosted billing.

  **Workflow:** SoloDesk subscription checkout remains proposed hosted billing distinct from client invoices; confirm chosen provider/country and verified entitlement authority first. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** Returning from checkout alone grants no unverified entitlement.

  **Feature prerequisites:** [F03.06](#f03-06), [F35.01](#f35-01), [F27.02](#f27-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f35-03"></a>**F35.03 — Product entitlement projection** · `E · optional expansion` — Derive server-enforced capabilities from verified subscription state.

  **Workflow:** Entitlement projection is proposed application policy; distinguish feature availability from current resource permissions and retain accepted financial read/export obligations. **Rules:** PLT-001–018 require current online identity/authority; contacts and presentation settings cannot grant workspace membership.

  **Done when:** Changing a client flag cannot enable a paid feature or bypass a quota.

  **Feature prerequisites:** [F03.06](#f03-06), [F35.02](#f35-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Capability requirements](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#capability-requirements); [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f35-04"></a>**F35.04 — Seat billing** · `E · optional expansion` — Apply approved active/pending/contractor seat rules and visible price preview.

  **Workflow:** Seat counting has no approved active/pending/contractor definition or proration rule; Q-12 must choose these before invitation-based charges or caps apply. **Rules:** Q decisions are unresolved gates, not implicit defaults; select policy, provider, budget and legal treatment before the dependent feature is activated.

  **Done when:** Concurrent invites cannot exceed a hard cap or create unexplained charges.

  **Feature prerequisites:** [F03.06](#f03-06), [F35.03](#f35-03), [F03.03](#f03-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Complex decisions still open](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#complex-decisions-still-open).

- [ ] <a id="f35-05"></a>**F35.05 — Product free trial** · `E · optional expansion` — Track start/end, eligibility and explicit post-trial behavior.

  **Workflow:** Trials remain proposed commercial terms; choose eligibility, start/end, conversion and grace without adding a default duration or payment requirement. **Rules:** Q decisions are unresolved gates, not implicit defaults; select policy, provider, budget and legal treatment before the dependent feature is activated.

  **Done when:** Repeated signup or retry cannot create conflicting entitlements.

  **Feature prerequisites:** [F03.06](#f03-06), [F35.03](#f35-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Complex decisions still open](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#complex-decisions-still-open).

- [ ] <a id="f35-06"></a>**F35.06 — Product plan changes** · `E · optional expansion` — Preview effective date and approved proration before confirmation.

  **Workflow:** Plan change behavior remains proposed approved pricing/effective-date/grace policy; reduced availability must not delete history or break approved export access. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** A downgrade preserves data/history while blocking only newly disallowed actions.

  **Feature prerequisites:** [F03.06](#f03-06), [F35.03](#f35-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f35-07"></a>**F35.07 — Product payment method management** · `E · optional expansion` — Use the billing provider's authenticated hosted portal.

  **Workflow:** Payment-method self-service remains proposed use of the selected provider; provider-hosted handling avoids raw-card custody but capability support still needs verification. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** SoloDesk receives no raw payment-card values.

  **Feature prerequisites:** [F03.06](#f03-06), [F35.02](#f35-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f35-08"></a>**F35.08 — Product billing invoices** · `E · optional expansion` — Show provider-generated SoloDesk invoices/receipts under billing-owner scope.

  **Workflow:** SoloDesk billing documents remain separate from the workspace's invoices for clients and require the approved billing-owner visibility and provider record model. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** A workspace contributor cannot retrieve the owner's billing account.

  **Feature prerequisites:** [F03.06](#f03-06), [F35.02](#f35-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f35-09"></a>**F35.09 — Product failed-payment grace** · `E · optional expansion` — Define notices, grace period and safe restricted mode under approved terms.

  **Workflow:** Failed product payment needs Q-12 grace/restriction/notice terms; restriction must preserve accepted financial history and the chosen portability policy. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** A failed product renewal does not erase workspace data or client invoices.

  **Feature prerequisites:** [F03.06](#f03-06), [F35.03](#f35-03) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f35-10"></a>**F35.10 — Product cancellation** · `E · optional expansion` — Support period-end/immediate cancellation per agreed policy with export guidance.

  **Workflow:** Cancel the SoloDesk service under selected product terms without canceling client receivables, service subscriptions or retained evidence inside the workspace. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** Canceling SoloDesk does not cancel the workspace's client receivables.

  **Feature prerequisites:** [F03.06](#f03-06), [F35.03](#f35-03), [F34.05](#f34-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f35-11"></a>**F35.11 — Product coupon policies** · `E · optional expansion` — Apply approved eligibility, duration and price disclosures using provider facilities.

  **Workflow:** Coupons remain unapproved commercial policy; select plan eligibility, duration, interaction with trials and displayed terms before provider configuration. **Rules:** Q decisions are unresolved gates, not implicit defaults; select policy, provider, budget and legal treatment before the dependent feature is activated.

  **Done when:** An expired or wrong-plan coupon cannot alter checkout authority.

  **Feature prerequisites:** [F03.06](#f03-06), [F35.01](#f35-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Complex decisions still open](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#complex-decisions-still-open).

- [ ] <a id="f35-12"></a>**F35.12 — Product billing reconciliation** · `E · optional expansion` — Reconcile duplicate/out-of-order subscription webhooks and unknown changes.

  **Workflow:** Reconcile provider subscription/customer events under stable identity and approved local mapping; verified callbacks, not browser redirects, authorize status changes. **Rules:** Verify callback identity and amount/currency/customer/invoice; separate capture, fee, payout, refund and chargeback, with no raw card custody.

  **Done when:** One customer cannot gain two conflicting active subscriptions from a retry.

  **Feature prerequisites:** [F03.06](#f03-06), [F35.02](#f35-02), [F38.14](#f38-14) **Specification:** Supporting contract; feature-specific extension remains unapproved: [INT-006 — Payment providers](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/integrations-and-automation.md#int-006--payment-providers).

**Demonstrate before closing this phase:** Complete a test subscription, replay/out-of-order its callbacks and enforce one verified entitlement. Preview seat/proration charges, exercise failed-payment grace and downgrade/cancel without erasing client debts or preventing required historical exports.

<a id="phase-58"></a>

## Phase 58 — Manage organizational sign-in and access policies

**User outcome:** An approved organization can use selected enterprise identity, provisioning, MFA/session policies, access reviews and governed retention/residency.

**Build after:** [Phase 01](#phase-01), [Phase 02](#phase-02), [Phase 03](#phase-03), [Phase 56](#phase-56)

### Features delivered

- [ ] <a id="f40-02"></a>**F40.02 — Enterprise single sign-on** · `E · optional expansion` — Add one explicitly selected OIDC/SAML enterprise identity path if supported.

  **Workflow:** Enterprise OIDC/SAML remains proposed and conditional on managed Better Auth support, reviewed issuer/tenant mapping and approved recovery behavior. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** A wrong issuer, audience or tenant mapping cannot authenticate a member.

  **Feature prerequisites:** [F03.06](#f03-06), [F40.01](#f40-01), [F02.01](#f02-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

- [ ] <a id="f40-03"></a>**F40.03 — Managed user provisioning** · `E · optional expansion` — Add reviewed SCIM-style lifecycle sync with bounded organization mapping.

  **Workflow:** Managed provisioning has no approved SCIM schema/lifecycle contract; decide supported identity mapping, revocation and retained business-history behavior before enabling it. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** Deprovisioning revokes current grants and cannot delete retained financial evidence.

  **Feature prerequisites:** [F03.06](#f03-06), [F40.02](#f40-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

- [ ] <a id="f40-04"></a>**F40.04 — Workspace MFA policy** · `E · optional expansion` — Require approved factors for chosen roles with tested recovery/rollout rules.

  **Workflow:** Workspace factor enforcement remains proposed Q-08 role/recovery policy; validate managed support and rollout without guessing factor requirements or locking out the final owner. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** An owner cannot lock out the final recovery path through a stale policy edit.

  **Feature prerequisites:** [F03.06](#f03-06), [F02.05](#f02-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

- [ ] <a id="f40-05"></a>**F40.05 — Session duration policy** · `E · optional expansion` — Apply approved privileged-session expiry and step-up requirements.

  **Workflow:** Session-duration enforcement remains proposed exact expiry/cache/revocation policy; approved limits must be measurable across stale cookies and already-open tabs. **Rules:** Use reviewed Better Auth flows, trusted origins/redirects, bounded single-use challenges and current grants; exact factor/recovery policy remains Q-08.

  **Done when:** A cached cookie cannot exceed the documented revocation window.

  **Feature prerequisites:** [F03.06](#f03-06), [F02.06](#f02-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Better Auth and sessions](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#better-auth-and-sessions).

- [ ] <a id="f40-06"></a>**F40.06 — High-risk dual approval** · `E · optional expansion` — Require a second independent finance approver above selected posting thresholds.

  **Workflow:** Optional second approval for high-value credits/refunds is contemplated by the role contract but requires explicit threshold, actor-independence and delegation policy. **Rules:** Role templates are proposed; current capability plus resource scope controls access, and bulk actions never widen that scope.

  **Done when:** The requesting actor cannot satisfy both approvals through retries or delegated tokens.

  **Feature prerequisites:** [F03.06](#f03-06), [F02.07](#f02-07), [F03.05](#f03-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Access templates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#access-templates); [Invoice issuance, ownership, and numbering](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#invoice-issuance-ownership-and-numbering).

- [ ] <a id="f40-07"></a>**F40.07 — Member access reviews** · `E · optional expansion` — Review active grants, contractors and overdue expiry with audit evidence.

  **Workflow:** Periodic member review remains proposed grant governance over current scoped membership/expiry, not a renewal of access merely because a review checkbox is completed. **Rules:** Role templates are proposed; current capability plus resource scope controls access, and bulk actions never widen that scope.

  **Done when:** Completing a review does not extend an expired contractor grant silently.

  **Feature prerequisites:** [F03.06](#f03-06), [F03.09](#f03-09) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Access templates](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/platform-and-workspaces.md#access-templates).

- [ ] <a id="f02-15"></a>**F02.15 — Enterprise identity** · `E · optional expansion` — Business SSO/domain verification and managed user provisioning after enterprise requirements and compatibility review.

  **Workflow:** Treat enterprise identity as a compatibility/policy assessment first; F40 separates domain, SSO and provisioning candidates that have no approved implementation contract. **Rules:** Q decisions are unresolved gates, not implicit defaults; select policy, provider, budget and legal treatment before the dependent feature is activated.

  **Done when:** No enterprise login path is activated solely because its name appears in this roadmap.

  **Feature prerequisites:** [F38.01](#f38-01), [F38.07](#f38-07), [F40.02](#f40-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Complex decisions still open](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#complex-decisions-still-open).

- [ ] <a id="f37-11"></a>**F37.11 — Data residency selection** · `E · optional expansion` — Offer only regions whose database/files/backups/providers have a verified coverage contract.

  **Workflow:** Residency selection remains Q-02 plus provider-by-provider mapping for database/files/auth/backups/egress; current docs define no selectable region catalogue or guarantee. **Rules:** Q decisions are unresolved gates, not implicit defaults; select policy, provider, budget and legal treatment before the dependent feature is activated.

  **Done when:** A regional label cannot conceal cross-region provider transfers.

  **Feature prerequisites:** [F37.01](#f37-01), [F38.01](#f38-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Complex decisions still open](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#complex-decisions-still-open).

- [ ] <a id="f37-12"></a>**F37.12 — Enterprise retention overrides** · `E · optional expansion` — Bound workspace-specific policies by mandatory retention/legal obligations.

  **Workflow:** Enterprise overrides remain proposed policies constrained by legal holds/references and approved backup expiry; an owner setting cannot silently erase retained financial history. **Rules:** Purge respects legal holds, references, auth dependencies and backup expiry; tombstones prevent resurrection and downloaded copies have no remote-wipe guarantee.

  **Done when:** An owner cannot shorten a required financial hold through settings.

  **Feature prerequisites:** [F37.03](#f37-03), [F37.04](#f37-04) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Retention and evidence](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#retention-and-evidence).

**Demonstrate before closing this phase:** Verify a selected SSO issuer and tenant, deprovision a member and deny later direct requests. A requester cannot supply both approvals for a high-risk posting, and policy rollout preserves the approved recovery path.

<a id="phase-59"></a>

## Phase 59 — Keep multiple legal sellers and business brands separate

**User outcome:** An approved business can select separate seller and brand profiles with independent numbering and financial history.

**Build after:** [Phase 03](#phase-03), [Phase 10](#phase-10), [Phase 12](#phase-12), [Phase 56](#phase-56)

### Features delivered

- [ ] <a id="f40-08"></a>**F40.08 — Multiple seller profiles** · `E · optional expansion` — Separate approved legal sellers, number series, contracts and receivables within a reviewed model.

  **Workflow:** Multiple legal sellers are an unresolved finance decision; define identity, series, debt/allocation and correction boundaries before permitting more than the approved seller model. **Rules:** Country, precision, tax/discount order, number series, correction policy, reporting basis and providers are unresolved until explicitly selected.

  **Done when:** An invoice cannot mix sellers or transfer historic debt by changing a profile ID.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.01](#f19-01), [F20.02](#f20-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Decisions requiring user input before dependent work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#decisions-requiring-user-input-before-dependent-work); [Invoice issuance, ownership, and numbering](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#invoice-issuance-ownership-and-numbering); [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f40-09"></a>**F40.09 — Business brand profiles** · `E · optional expansion` — Apply selected identity/template defaults per engagement after seller rules exist.

  **Workflow:** Brand profiles remain proposed presentation presets under current semantic components; legal seller fields/history and mandatory disclosures cannot be altered by style selection. **Rules:** Reuse shared shadcn/Base UI components and semantic tokens with keyboard/focus/RTL; the current monochrome design overrides older visual recipes.

  **Done when:** A branding change never alters legal seller history or hides mandatory disclosures.

  **Feature prerequisites:** [F03.06](#f03-06), [F40.08](#f40-08), [F03.13](#f03-13) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Components](/home/mohamed-s/Desktop/Projects/solor-desk/DESIGN.md#components).

**Demonstrate before closing this phase:** Create invoices for two sellers and reject mixed-seller lines or a later reassignment of historic debt. Brand defaults never hide mandatory seller disclosures.

<a id="phase-60"></a>

## Phase 60 — Export and submit an approved electronic invoice format

**User outcome:** A seller in a specifically approved jurisdiction can generate its selected structured invoice format and submit it through a selected adapter.

**Build after:** [Phase 03](#phase-03), [Phase 12](#phase-12), [Phase 15](#phase-15)

### Features delivered

- [ ] <a id="f20-13"></a>**F20.13 — Structured e-invoice export** · `E · optional expansion` — Support a separately reviewed format and jurisdiction profile when required.

  **Workflow:** Structured e-invoice formats remain proposed market-specific profiles; Q-01 decides authority/schema, mandatory fields, validation and archival requirements. **Rules:** Country, precision, tax/discount order, number series, correction policy, reporting basis and providers are unresolved until explicitly selected.

  **Done when:** Official format fixtures and specialist review pass before the profile is advertised.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.01](#f20-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Decisions requiring user input before dependent work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#decisions-requiring-user-input-before-dependent-work).

- [ ] <a id="f20-14"></a>**F20.14 — E-invoice submission adapter** · `E · optional expansion` — Submit through an approved authority/provider with explicit acknowledgement states.

  **Workflow:** Authority submission remains a proposed provider workflow; determine country/provider/acknowledgement and legal issuance meaning before enabling it. **Rules:** Country, precision, tax/discount order, number series, correction policy, reporting basis and providers are unresolved until explicitly selected.

  **Done when:** A rejected or unknown submission never masquerades as authority acceptance.

  **Feature prerequisites:** [F03.06](#f03-06), [F20.13](#f20-13), [F27.02](#f27-02), [F30.05](#f30-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Decisions requiring user input before dependent work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#decisions-requiring-user-input-before-dependent-work).

**Demonstrate before closing this phase:** Validate a fixture for the explicitly chosen format, submit it in an approved test environment and reconcile rejection or an unknown submission result. Keep the format disabled until jurisdiction, seller eligibility and provider acceptance are confirmed; a PDF alone is not proof of statutory submission.

<a id="phase-61"></a>

## Phase 61 — Move existing business history into SoloDesk

**User outcome:** A freelancer can migrate supported Harvest, Toggl or selected CRM records, reviewed historical documents and opening balances.

**Build after:** [Phase 03](#phase-03), [Phase 06](#phase-06), [Phase 09](#phase-09), [Phase 10](#phase-10), [Phase 12](#phase-12), [Phase 19](#phase-19), [Phase 33](#phase-33)

### Features delivered

- [ ] <a id="f34-07"></a>**F34.07 — Historical document import** · `E · optional expansion` — Preserve original issue identity, numbers and source evidence in a reviewed migration mode.

  **Workflow:** Historical document import remains an extension gated by approved number ranges, opening balances, market profiles and original evidence, without sending or reissuing history. **Rules:** Country, precision, tax/discount order, number series, correction policy, reporting basis and providers are unresolved until explicitly selected.

  **Done when:** Imported historical work cannot become fresh billable allocations.

  **Feature prerequisites:** [F03.06](#f03-06), [F34.01](#f34-01), [F20.02](#f20-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Decisions requiring user input before dependent work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#decisions-requiring-user-input-before-dependent-work); [Invoice issuance, ownership, and numbering](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#invoice-issuance-ownership-and-numbering); [Balances, payments, credits, refunds, and deposits](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#balances-payments-credits-refunds-and-deposits).

- [ ] <a id="f34-08"></a>**F34.08 — Harvest migration** · `E · optional expansion` — Map supported clients/projects/time/expenses with explicit exclusions and reconciliation.

  **Workflow:** Harvest migration is a proposed named source; inspect actual samples and approve supported entities/mappings/exclusions before claiming lossless transfer. **Rules:** Preview locale/unit/currency mappings, duplicates and row failures; stable batch/source IDs dedupe imports and consistent exports disclose omissions.

  **Done when:** An isolated fixture round-trip preserves exact source seconds and money.

  **Feature prerequisites:** [F03.06](#f03-06), [F34.01](#f34-01), [F16.10](#f16-10) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Import and export](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#import-and-export).

- [ ] <a id="f34-09"></a>**F34.09 — Toggl migration** · `E · optional expansion` — Map supported time/projects/rate history with timezone and provenance review.

  **Workflow:** Toggl migration is a proposed named source; preserve original source seconds/timezone and identify missing historical rates rather than substituting current selling prices. **Rules:** Preview locale/unit/currency mappings, duplicates and row failures; stable batch/source IDs dedupe imports and consistent exports disclose omissions.

  **Done when:** Missing historical rates are flagged instead of silently replaced by current rates.

  **Feature prerequisites:** [F03.06](#f03-06), [F34.01](#f34-01), [F16.10](#f16-10) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Import and export](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#import-and-export).

- [ ] <a id="f34-10"></a>**F34.10 — Selected CRM migration** · `E · optional expansion` — Implement one approved CRM source mapping after a sample-file review.

  **Workflow:** A selected CRM adapter remains proposed; inspect real fields/provenance and distinguish business contacts from verified users/invitations during conversion. **Rules:** Preview locale/unit/currency mappings, duplicates and row failures; stable batch/source IDs dedupe imports and consistent exports disclose omissions.

  **Done when:** Contact identity never becomes workspace membership through an import.

  **Feature prerequisites:** [F03.06](#f03-06), [F34.01](#f34-01), [F07.01](#f07-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Import and export](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/data-lifecycle.md#import-and-export).

- [ ] <a id="f34-11"></a>**F34.11 — Workspace split or transfer** · `E · optional expansion` — Review legal/data ownership and remap permitted records through an explicit migration.

  **Workflow:** Workspace split/transfer remains proposed reviewed export/import with new IDs and legal/source checks, never direct reassignment of tenant IDs or issued seller identity. **Rules:** Moves preview client/currency/billing effects; allocated contradictions block moves, cross-workspace changes use reviewed import and identity history survives.

  **Done when:** No direct ID rewrite can detach invoices from their legal seller history.

  **Feature prerequisites:** [F03.06](#f03-06), [F34.01](#f34-01), [F34.05](#f34-05) **Specification:** Supporting contract; feature-specific extension remains unapproved: [WRK-014 — Archive, transfer and recovery](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/work-management.md#wrk-014--archive-transfer-and-recovery).

- [ ] <a id="f24-11"></a>**F24.11 — Opening balance migration** · `E · optional expansion` — Review imported receivables, credits, retainers and historical number ranges.

  **Workflow:** Historical receivables/credit/retainer/number migration remains an extension gated by Q-15; reconcile opening positions without recreating billable sources or sending old invoices. **Rules:** Country, precision, tax/discount order, number series, correction policy, reporting basis and providers are unresolved until explicitly selected.

  **Done when:** Opening positions reconcile and cannot be reused as newly billable source work.

  **Feature prerequisites:** [F03.06](#f03-06), [F19.03](#f19-03), [F24.01](#f24-01), [F34.07](#f34-07) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Decisions requiring user input before dependent work](/home/mohamed-s/Desktop/Projects/solor-desk/docs/specs/finance.md#decisions-requiring-user-input-before-dependent-work).

**Demonstrate before closing this phase:** Reconcile a synthetic source sample after import, preserve original seconds/numbers and flag missing historical rates. A repeated migration or workspace transfer cannot rebill imported evidence or detach invoices from their original seller.

<a id="phase-62"></a>

## Phase 62 — Publish feature, pricing and help pages for SoloDesk

**User outcome:** A visitor can understand real capabilities, try a labeled synthetic tour, find help/pricing/legal pages and submit a real contact or waitlist request.

**Build after:** [Phase 01](#phase-01), [Phase 20](#phase-20), [Phase 57](#phase-57)

### Features delivered

- [ ] <a id="f01-03"></a>**F01.03 — Feature pages** · `E · optional expansion` — Feature detail pages for CRM, projects, time, billing, reporting and the client portal.

  **Workflow:** Feature pages may explain only the current documented capability and its implementation status; publication of each page remains an extension. **Rules:** Keep workspace/search/timer/notices/save/language discoverable; deep links authenticate and every drag/shortcut action has a visible accessible alternative.

  **Done when:** A planned connector is described as planned and links to the relevant workflow rather than implying activation.

  **Feature prerequisites:** [F01.01](#f01-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Navigation and interaction](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#navigation-and-interaction).

- [ ] <a id="f01-04"></a>**F01.04 — Persona pages** · `E · optional expansion` — Persona/use-case pages for independent developers, consultants and boutique teams.

  **Workflow:** Persona content must retain the same freelancer/small-team scope and required cloud account; no alternative stack or unapproved product edition is introduced. **Rules:** Keep workspace/search/timer/notices/save/language discoverable; deep links authenticate and every drag/shortcut action has a visible accessible alternative.

  **Done when:** Each persona page retains equivalent Arabic navigation and accurate account requirements.

  **Feature prerequisites:** [F01.01](#f01-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Navigation and interaction](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#navigation-and-interaction).

- [ ] <a id="f01-05"></a>**F01.05 — Synthetic product tour** · `E · optional expansion` — Product tour and synthetic sample workspace that never exposes a real customer's data.

  **Workflow:** An isolated demo presents invented records as examples and keeps its state separate from signed-in customer data. **Rules:** Distinguish unsaved/local/queued/accepted/conflict/failure, preserve valid input and use real empty/no-match/error states rather than fictional data.

  **Done when:** Moving from demo to account cannot carry sample invoices into the customer's workspace.

  **Feature prerequisites:** [F01.01](#f01-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Editor and status rules](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#editor-and-status-rules).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: synthetic landing tour exists; a standalone interactive sample workspace does not.

  **Implementation progress — 1 November 2026:**

  - [x] Localized synthetic tour tabs and sample work previews are implemented in `components/product-tour.tsx`, `components/landing/tour-section.tsx` and `components/landing/work-preview.tsx`.
  - [ ] A separate interactive sample workspace/demo remains unbuilt; landing previews do not complete that scope.

- [ ] <a id="f01-06"></a>**F01.06 — Pricing comparison** · `E · optional expansion` — Pricing/plan comparison, monthly/annual presentation and clearly defined limits after Q-12.

  **Workflow:** Plan comparison awaits Q-12 definitions for prices, seats, limits and cancellation; the roadmap supplies no numeric commercial defaults. **Rules:** Q decisions are unresolved gates, not implicit defaults; select policy, provider, budget and legal treatment before the dependent feature is activated.

  **Done when:** Unselected prices or quotas are never rendered as confirmed offers.

  **Feature prerequisites:** [F35.01](#f35-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Complex decisions still open](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#complex-decisions-still-open).

- [ ] <a id="f01-07"></a>**F01.07 — Help and getting-started content** · `E · optional expansion` — FAQ, getting-started guides, documentation search and contact/support entry points.

  **Workflow:** Help explains sessions, invitations, timer recovery, exact billing and exports with consistent English/Arabic terminology. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** Guidance distinguishes browser save, server acceptance and recovery-required states.

  **Feature prerequisites:** [F01.01](#f01-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: landing FAQ exists; complete getting-started/help/search is pending.

  **Implementation progress — 1 November 2026:**

  - [x] Public FAQ and contact/help entry points are implemented in `components/landing/faq-section.tsx`, `components/landing/contact-section.tsx` and `components/landing/footer-section.tsx`.
  - [ ] Getting-started guides, documentation search and full in-app help remain unbuilt.

- [ ] <a id="f01-08"></a>**F01.08 — Public changelog** · `E · optional expansion` — Public changelog, release notes and service-status link with real operational ownership.

  **Workflow:** Release information separates documented plans from features verified in a named build and links service incidents to operational ownership. **Rules:** Support access needs tenant approval, purpose, expiry, least scope and audit; guidance/export/cancellation policies preserve accepted financial history.

  **Done when:** A draft release note cannot report an unchecked phase as shipped.

  **Feature prerequisites:** [F39.11](#f39-11) **Specification:** Supporting contract; feature-specific extension remains unapproved: [User support, retention and portability](/home/mohamed-s/Desktop/Projects/solor-desk/docs/operations/release-and-support.md#user-support-retention-and-portability).

- [ ] <a id="f01-09"></a>**F01.09 — Customer stories** · `E · optional expansion` — Customer stories/testimonials published only with the necessary consent and permissions.

  **Workflow:** Customer evidence requires permission to publish and must omit protected client/business details; testimonial collection is not a defined baseline workflow. **Rules:** Minimize/redact diagnostics and keep analytics opt-in; support is temporary/scoped and retention/recovery follow reviewed lifecycle decisions.

  **Done when:** Revoking publication permission prevents new publication without erasing required private audit history.

  **Feature prerequisites:** [F37.02](#f37-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Privacy, recovery and operations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#privacy-recovery-and-operations).

- [ ] <a id="f01-10"></a>**F01.10 — Public search metadata** · `E · optional expansion` — Share metadata, canonical URLs, sitemap, robots policy and localized page metadata for public content; exclude private routes from discovery.

  **Workflow:** Public metadata describes only intentionally public content; authenticated pages, exported files and private record identifiers are excluded from public discovery. **Rules:** Use allowlisted filters and stable bounded cursors; scope counts/files/exports and expose revision/as-of rather than mixing pending and committed totals.

  **Done when:** A public sitemap or page preview contains no tenant-specific title or URL.

  **Feature prerequisites:** [F01.01](#f01-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Queries, search and files](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/api-contracts.md#queries-search-and-files).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL: route metadata exists; full public discovery/canonical/sitemap audit is pending.

  **Implementation progress — 1 November 2026:**

  - [x] Localized page titles/metadata are implemented by the existing site/account route metadata exports.
  - [ ] The complete canonical/share-metadata, sitemap and robots policy remains unbuilt or unverified.

- [ ] <a id="f01-11"></a>**F01.11 — Contact and waitlist forms** · `E · optional expansion` — Accessible contact/demo/waitlist forms with abuse controls and explicit communication consent.

  **Workflow:** Submissions preserve valid input on failure and separate an inquiry from any permission to send unrelated communications. **Rules:** Distinguish unsaved/local/queued/accepted/conflict/failure, preserve valid input and use real empty/no-match/error states rather than fictional data.

  **Done when:** Invalid or failed submission shows a recovery action without falsely recording successful delivery.

  **Feature prerequisites:** [F38.06](#f38-06) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Editor and status rules](/home/mohamed-s/Desktop/Projects/solor-desk/docs/product/ux-and-localization.md#editor-and-status-rules).

  **Previously reported source status (2 November 2026; not reverified here):** PARTIAL/MOCK: contact handler exists behind a server switch; footer newsletter simulates success and does not subscribe anyone.

  **Implementation progress — 1 November 2026:**

  - [x] Contact form, consent fields, validation, bounded request handling and switched server delivery path are implemented in `components/contact-form.tsx`, `app/api/contact/route.ts`, `lib/contact.ts` and `lib/email.tsx`; synthetic email tests passed.
  - [ ] Demo/waitlist persistence and cross-instance abuse protection remain pending. Newsletter simulates success; contact visitor receipts conflict with Feature 002 FR-013e and can create a partial-send/failed-response retry ambiguity. Owner/spec reconciliation and real acceptance remain open.

- [ ] <a id="f01-12"></a>**F01.12 — Legal information pages** · `E · optional expansion` — Editable privacy/terms/acceptable-use and data-processing information reviewed for the chosen service and markets.

  **Workflow:** Legal pages reflect reviewed operating regions, retention, subprocessors and commercial policies; missing legal decisions stay visible rather than receiving generated terms. **Rules:** Q decisions are unresolved gates, not implicit defaults; select policy, provider, budget and legal treatment before the dependent feature is activated.

  **Done when:** Published claims can be traced to an approved policy version and named market.

  **Feature prerequisites:** [F37.01](#f37-01) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Complex decisions still open](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md#complex-decisions-still-open).

- [ ] <a id="f01-13"></a>**F01.13 — Consent-based acquisition analytics** · `E · optional expansion` — Opt-in acquisition analytics and campaign attribution with declared retention; avoid private record content.

  **Workflow:** Optional acquisition measurements use the documented opt-in privacy model and exclude customer records, credential-bearing URLs and raw form content. **Rules:** Minimize/redact diagnostics and keep analytics opt-in; support is temporary/scoped and retention/recovery follow reviewed lifecycle decisions.

  **Done when:** Declining optional analytics leaves account entry and public navigation usable.

  **Feature prerequisites:** [F37.02](#f37-02) **Specification:** Supporting contract; feature-specific extension remains unapproved: [Privacy, recovery and operations](/home/mohamed-s/Desktop/Projects/solor-desk/docs/architecture/security-and-privacy.md#privacy-recovery-and-operations).

**Demonstrate before closing this phase:** Walk public links in both languages and narrow layouts; compare published claims and prices with accepted features and plans. A failed contact/newsletter request shows failure, optional analytics require consent and customer stories require permission.

## Decisions that gate specific features

Keep these decisions in the existing [decision register](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/decisions.md). Resolve a decision before enabling its dependent behavior; continue independent work. They are feature prerequisites, not separate delivery phases.

| Gate      | Decision                                                                                       | Features it affects                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Q-01      | Launch jurisdictions, legal seller registrations, document/retention/e-invoice requirements    | [Phase 10](#phase-10), [Phase 12](#phase-12), [Phase 40](#phase-40), [Phase 60](#phase-60)                                               |
| Q-02      | Region/residency, budget, expected scale and operational commitments                           | [Phase 01](#phase-01), [Phase 12](#phase-12), [Phase 14](#phase-14), [Phase 58](#phase-58)                                               |
| Q-03      | Currencies, exact rate/time rounding, tax/discount order, numbering and approved fixtures      | [Phase 10](#phase-10), [Phase 11](#phase-11), [Phase 12](#phase-12), [Phase 28](#phase-28)                                               |
| Q-04      | Timer suspension, uncertain gaps, optional in-site inactivity review and manual-duration rules | [Phase 09](#phase-09), [Phase 18](#phase-18)                                                                                             |
| Q-05      | Roles, scopes, reviewer policy and independent/dual approvals                                  | [Phase 03](#phase-03), [Phase 04](#phase-04), [Phase 27](#phase-27), [Phase 58](#phase-58)                                               |
| Q-06/Q-07 | Eligible browser draft data, expiry, key custody, quota/eviction and recovery proof            | [Phase 18](#phase-18), [Phase 48](#phase-48)                                                                                             |
| Q-08      | Supported sign-in, factor, verification, recovery, session and invite-expiry policies          | [Phase 01](#phase-01), [Phase 02](#phase-02), [Phase 04](#phase-04), [Phase 58](#phase-58)                                               |
| Q-09      | Selected providers, countries, connection scopes, sender identities and credentials            | [Phase 15](#phase-15), [Phase 39](#phase-39), [Phase 42](#phase-42), [Phase 43](#phase-43), [Phase 44](#phase-44), [Phase 45](#phase-45) |
| Q-10      | Client portal identity/link expiry and exact acceptance/signature evidence policy              | [Phase 37](#phase-37), [Phase 38](#phase-38), [Phase 40](#phase-40)                                                                      |
| Q-11      | Supported browsers, devices, assistive technology and deployment host                          | [Phase 05](#phase-05), [Phase 09](#phase-09), [Phase 12](#phase-12)                                                                      |
| Q-12      | SoloDesk plan prices, seats, trials, grace and cancellation/export behavior                    | [Phase 57](#phase-57), [Phase 62](#phase-62)                                                                                             |
| Q-13      | Draft/tombstone/closure/backup retention, legal holds and deletion policy                      | [Phase 01](#phase-01), [Phase 18](#phase-18), [Phase 55](#phase-55)                                                                      |
| Q-14      | Capacity calendars, cost visibility, report basis and currency-conversion assumptions          | [Phase 23](#phase-23), [Phase 34](#phase-34), [Phase 53](#phase-53)                                                                      |
| Q-15      | Supported import samples, historical numbers and opening balances                              | [Phase 19](#phase-19), [Phase 33](#phase-33), [Phase 61](#phase-61)                                                                      |
| Q-16      | Support/incident ownership, recovery point/time objectives and independent file backup         | [Phase 12](#phase-12), [Phase 16](#phase-16), [Phase 54](#phase-54)                                                                      |

Select hosting, private storage, email, workers and external business providers only with current region/runtime/quota/recovery/cost information. No provider was selected or purchased by this rewrite. Disable gated capabilities honestly; a disabled capability does not satisfy its feature checkbox.

## Baseline requirement coverage

The **143 existing requirement IDs** remain authoritative: PLT-001–018, CRM-001–011, WRK-001–014, TIM-001–024, FIN-001–035, INS-001–010, INT-001–012 and NFR-001–019. Their per-ID acceptance/status remains in the [coverage register](/home/mohamed-s/Desktop/Projects/solor-desk/docs/planning/coverage.md). Feature IDs do not replace these requirement IDs. Update that register with actual build/evidence when implementation happens.

| Requirement family | Feature phases responsible                                                                                                                                                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PLT-001–018        | [Phase 01](#phase-01), [Phase 02](#phase-02), [Phase 03](#phase-03), [Phase 04](#phase-04), [Phase 05](#phase-05), [Phase 15](#phase-15), [Phase 16](#phase-16), [Phase 18](#phase-18), [Phase 19](#phase-19), [Phase 55](#phase-55)                                                                      |
| CRM-001–010        | [Phase 06](#phase-06), [Phase 20](#phase-20), [Phase 21](#phase-21), [Phase 22](#phase-22), [Phase 24](#phase-24), [Phase 25](#phase-25), [Phase 26](#phase-26)                                                                                                                                           |
| CRM-011            | [Phase 37](#phase-37), [Phase 38](#phase-38), [Phase 40](#phase-40)                                                                                                                                                                                                                                       |
| WRK-001–014        | [Phase 07](#phase-07), [Phase 08](#phase-08), [Phase 16](#phase-16), [Phase 17](#phase-17), [Phase 23](#phase-23), [Phase 37](#phase-37), [Phase 52](#phase-52)                                                                                                                                           |
| TIM-001–024        | [Phase 09](#phase-09), [Phase 11](#phase-11), [Phase 18](#phase-18), [Phase 19](#phase-19), [Phase 27](#phase-27), [Phase 36](#phase-36), [Phase 38](#phase-38)                                                                                                                                           |
| FIN-001–035        | [Phase 10](#phase-10), [Phase 11](#phase-11), [Phase 12](#phase-12), [Phase 13](#phase-13), [Phase 28](#phase-28), [Phase 29](#phase-29), [Phase 30](#phase-30), [Phase 31](#phase-31), [Phase 33](#phase-33), [Phase 39](#phase-39), [Phase 60](#phase-60)                                               |
| INS-001–010        | [Phase 14](#phase-14), [Phase 34](#phase-34), [Phase 35](#phase-35), [Phase 53](#phase-53)                                                                                                                                                                                                                |
| INT-001–012        | [Phase 15](#phase-15), [Phase 42](#phase-42), [Phase 43](#phase-43), [Phase 44](#phase-44), [Phase 45](#phase-45), [Phase 46](#phase-46), [Phase 47](#phase-47)                                                                                                                                           |
| NFR-001–019        | [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 04](#phase-04), [Phase 05](#phase-05), [Phase 06](#phase-06), [Phase 09](#phase-09), [Phase 10](#phase-10), [Phase 12](#phase-12), [Phase 14](#phase-14), [Phase 16](#phase-16), [Phase 18](#phase-18), [Phase 54](#phase-54), [Phase 55](#phase-55) |

All phases also inherit applicable NFR/security/quality contracts. Source implementation or a passing isolated test cannot establish full acceptance. Shared requirements close only after every applicable contribution in the enabled release passes. Any retirement of an existing requirement needs an explicit product decision rather than deletion from this plan.

## Feature family index

Original feature anchors remain stable. The family index replaces the old standalone catalogue: its features now live inside their delivery phases.

| Original family                                                                     | Delivery phases                                                                                                                                                 |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="category-01"></a>F01 — Public website, discovery and conversion              | [Phase 01](#phase-01), [Phase 62](#phase-62)                                                                                                                    |
| <a id="category-02"></a>F02 — Registration, identity and personal security          | [Phase 01](#phase-01), [Phase 02](#phase-02), [Phase 15](#phase-15), [Phase 16](#phase-16), [Phase 58](#phase-58)                                               |
| <a id="category-03"></a>F03 — Workspaces, members and permissions                   | [Phase 03](#phase-03), [Phase 04](#phase-04), [Phase 14](#phase-14), [Phase 55](#phase-55), [Phase 56](#phase-56)                                               |
| <a id="category-04"></a>F04 — Application shell, personal workspace and interaction | [Phase 05](#phase-05), [Phase 06](#phase-06), [Phase 07](#phase-07), [Phase 09](#phase-09), [Phase 14](#phase-14), [Phase 35](#phase-35)                        |
| <a id="category-05"></a>F05 — Browser drafts, sync and conflicts                    | [Phase 06](#phase-06), [Phase 10](#phase-10), [Phase 18](#phase-18)                                                                                             |
| <a id="category-06"></a>F06 — Notifications, inbox and reminders                    | [Phase 15](#phase-15)                                                                                                                                           |
| <a id="category-07"></a>F07 — Clients, contacts and relationship records            | [Phase 06](#phase-06), [Phase 19](#phase-19), [Phase 20](#phase-20)                                                                                             |
| <a id="category-08"></a>F08 — Lead pipeline and sales opportunities                 | [Phase 21](#phase-21), [Phase 48](#phase-48), [Phase 49](#phase-49)                                                                                             |
| <a id="category-09"></a>F09 — Service catalog, estimates and quoting                | [Phase 24](#phase-24), [Phase 25](#phase-25)                                                                                                                    |
| <a id="category-10"></a>F10 — Proposals, contracts and acceptance                   | [Phase 22](#phase-22), [Phase 25](#phase-25), [Phase 38](#phase-38), [Phase 40](#phase-40)                                                                      |
| <a id="category-11"></a>F11 — Onboarding, engagement handoff and renewals           | [Phase 26](#phase-26), [Phase 37](#phase-37)                                                                                                                    |
| <a id="category-12"></a>F12 — Projects, portfolios and commercial scope             | [Phase 07](#phase-07), [Phase 11](#phase-11), [Phase 23](#phase-23), [Phase 37](#phase-37), [Phase 52](#phase-52)                                               |
| <a id="category-13"></a>F13 — Tasks, checklists and personal work                   | [Phase 08](#phase-08), [Phase 15](#phase-15), [Phase 23](#phase-23)                                                                                             |
| <a id="category-14"></a>F14 — Scheduling, capacity and delivery planning            | [Phase 23](#phase-23), [Phase 45](#phase-45), [Phase 49](#phase-49)                                                                                             |
| <a id="category-15"></a>F15 — Collaboration, reviews, files and knowledge links     | [Phase 16](#phase-16), [Phase 17](#phase-17), [Phase 35](#phase-35)                                                                                             |
| <a id="category-16"></a>F16 — Timers, work evidence and recovery                    | [Phase 09](#phase-09), [Phase 18](#phase-18)                                                                                                                    |
| <a id="category-17"></a>F17 — Rates, timesheets and billing evidence                | [Phase 11](#phase-11), [Phase 19](#phase-19), [Phase 27](#phase-27), [Phase 38](#phase-38)                                                                      |
| <a id="category-18"></a>F18 — Personal focus and sustainable work                   | [Phase 36](#phase-36)                                                                                                                                           |
| <a id="category-19"></a>F19 — Invoice configuration, arithmetic and drafts          | [Phase 10](#phase-10), [Phase 11](#phase-11), [Phase 28](#phase-28)                                                                                             |
| <a id="category-20"></a>F20 — Issuance, documents and immutable history             | [Phase 12](#phase-12), [Phase 60](#phase-60)                                                                                                                    |
| <a id="category-21"></a>F21 — Payments, credits and collections                     | [Phase 12](#phase-12), [Phase 13](#phase-13), [Phase 41](#phase-41)                                                                                             |
| <a id="category-22"></a>F22 — Recurring services, retainers and subscriptions       | [Phase 29](#phase-29), [Phase 30](#phase-30)                                                                                                                    |
| <a id="category-23"></a>F23 — Expenses and subcontractor costs                      | [Phase 31](#phase-31), [Phase 32](#phase-32)                                                                                                                    |
| <a id="category-24"></a>F24 — Reconciliation and accounting handoff                 | [Phase 33](#phase-33), [Phase 42](#phase-42), [Phase 61](#phase-61)                                                                                             |
| <a id="category-25"></a>F25 — Dashboards, reports and forecasts                     | [Phase 14](#phase-14), [Phase 34](#phase-34), [Phase 53](#phase-53)                                                                                             |
| <a id="category-26"></a>F26 — Knowledge, search and reusable work                   | [Phase 35](#phase-35), [Phase 37](#phase-37)                                                                                                                    |
| <a id="category-27"></a>F27 — Provider connections and communication                | [Phase 15](#phase-15), [Phase 39](#phase-39), [Phase 42](#phase-42), [Phase 43](#phase-43)                                                                      |
| <a id="category-28"></a>F28 — Engineering and calendar connectors                   | [Phase 44](#phase-44), [Phase 45](#phase-45), [Phase 49](#phase-49)                                                                                             |
| <a id="category-29"></a>F29 — Client portal and external collaboration              | [Phase 37](#phase-37), [Phase 38](#phase-38), [Phase 39](#phase-39), [Phase 40](#phase-40), [Phase 51](#phase-51), [Phase 56](#phase-56)                        |
| <a id="category-30"></a>F30 — Developer API, jobs and deterministic automation      | [Phase 12](#phase-12), [Phase 39](#phase-39), [Phase 46](#phase-46), [Phase 47](#phase-47)                                                                      |
| <a id="category-31"></a>F31 — Forms, intake and service requests                    | [Phase 48](#phase-48), [Phase 51](#phase-51)                                                                                                                    |
| <a id="category-32"></a>F32 — Meeting booking and availability                      | [Phase 49](#phase-49), [Phase 50](#phase-50)                                                                                                                    |
| <a id="category-33"></a>F33 — Software delivery and ongoing maintenance             | [Phase 51](#phase-51), [Phase 52](#phase-52)                                                                                                                    |
| <a id="category-34"></a>F34 — Migration, portability and recovery tools             | [Phase 10](#phase-10), [Phase 19](#phase-19), [Phase 61](#phase-61)                                                                                             |
| <a id="category-35"></a>F35 — SoloDesk plans and subscription administration        | [Phase 57](#phase-57)                                                                                                                                           |
| <a id="category-36"></a>F36 — Support, feedback and service administration          | [Phase 54](#phase-54)                                                                                                                                           |
| <a id="category-37"></a>F37 — Privacy, retention and governance                     | [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 20](#phase-20), [Phase 55](#phase-55), [Phase 58](#phase-58)                                               |
| <a id="category-38"></a>F38 — Infrastructure, reliability and security delivery     | [Phase 01](#phase-01), [Phase 03](#phase-03), [Phase 12](#phase-12), [Phase 14](#phase-14), [Phase 16](#phase-16), [Phase 55](#phase-55)                        |
| <a id="category-39"></a>F39 — Accessibility, localization and release evidence      | [Phase 01](#phase-01), [Phase 04](#phase-04), [Phase 05](#phase-05), [Phase 06](#phase-06), [Phase 09](#phase-09), [Phase 10](#phase-10), [Phase 14](#phase-14) |
| <a id="category-40"></a>F40 — Advanced identity and organizational controls         | [Phase 56](#phase-56), [Phase 58](#phase-58), [Phase 59](#phase-59)                                                                                             |

## Compatibility with the previous P00–P09 documents

The old P00–P09 files remain referenced by the project. They are broad specification/work-package groupings, not the new feature phase numbers. This crosswalk prevents “Phase 01” here from being mistaken for an unchanged P01 implementation package. Detailed behavior remains in the linked source specifications.

| Previous package                                      | Where it is delivered now                                                                                                                                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P00 — Product rules and delivery contracts            | Decisions are resolved inside the feature that depends on them; there is no standalone product-rule phase.                                                                                                                           |
| P01 — Secure platform, team workspace and recovery    | [Phase 01](#phase-01), [Phase 02](#phase-02), [Phase 03](#phase-03), [Phase 04](#phase-04), [Phase 05](#phase-05), [Phase 15](#phase-15), [Phase 16](#phase-16), [Phase 18](#phase-18), [Phase 19](#phase-19), [Phase 55](#phase-55) |
| P02 — Clients, sales and agreements                   | [Phase 06](#phase-06), [Phase 20](#phase-20), [Phase 21](#phase-21), [Phase 22](#phase-22), [Phase 24](#phase-24), [Phase 25](#phase-25), [Phase 26](#phase-26)                                                                      |
| P03 — Projects, tasks and controlled delivery         | [Phase 07](#phase-07), [Phase 08](#phase-08), [Phase 16](#phase-16), [Phase 17](#phase-17), [Phase 23](#phase-23), [Phase 52](#phase-52)                                                                                             |
| P04 — Recoverable time, rates and review              | [Phase 09](#phase-09), [Phase 11](#phase-11), [Phase 27](#phase-27), [Phase 36](#phase-36)                                                                                                                                           |
| P05 — Exact billing, collections and advanced finance | [Phase 10](#phase-10), [Phase 12](#phase-12), [Phase 13](#phase-13), [Phase 28](#phase-28), [Phase 29](#phase-29), [Phase 30](#phase-30), [Phase 31](#phase-31), [Phase 32](#phase-32), [Phase 33](#phase-33), [Phase 41](#phase-41) |
| P06 — Insights, knowledge and search                  | [Phase 14](#phase-14), [Phase 34](#phase-34), [Phase 35](#phase-35), [Phase 53](#phase-53)                                                                                                                                           |
| P07 — Integrations and deterministic automation       | [Phase 15](#phase-15), [Phase 39](#phase-39), [Phase 42](#phase-42), [Phase 43](#phase-43), [Phase 44](#phase-44), [Phase 45](#phase-45), [Phase 46](#phase-46), [Phase 47](#phase-47)                                               |
| P08 — Client portal and external collaboration        | [Phase 37](#phase-37), [Phase 38](#phase-38), [Phase 40](#phase-40), [Phase 56](#phase-56)                                                                                                                                           |
| P09 — Release, operations and long-term support       | [Phase 12](#phase-12), [Phase 14](#phase-14), [Phase 16](#phase-16), [Phase 54](#phase-54), [Phase 55](#phase-55). Release/operations tasks accompany every relevant feature; they are not a separate phase.                         |

## Scope boundaries

All existing optional expansions are retained with their `E` label. Their presence is a backlog record, not a commitment to enable every provider, subscription model or enterprise option at launch.

Existing product exclusions remain: speculative AI features/agents, employee surveillance or automatic productivity scoring, native desktop/mobile wrappers and OS capture, raw payment-card custody, money transfer/wallet/lending/escrow operations, full accounting/payroll/statutory filing, arbitrary user code/SQL/plugin execution, full chat/video/source hosting and on-premise editions. Website shortcuts, manual payment records, hosted checkout, deterministic rules and linked external tools remain within their stated feature contracts.

Do not claim universal legal/tax compliance or guarantee browser durability. Jurisdiction-specific finance/signature/e-invoice behavior stays gated by approved policy and actual acceptance. New discoveries can extend the roadmap through new stable IDs; this plan does not claim to enumerate every possible future product feature.

## Handoff

Start by completing the missing acceptance of the existing account, workspace and navigation features. Then deliver the first client → project → task → time → invoice → payment journey. Reuse existing partial work; keep unverified provider/security/recovery claims open.

This rewrite changes the plan only. It preserves all 550 feature contracts and the inherited 60 checked implementation subtasks. It does not implement product features, run the application test suite, certify release readiness, send messages, provision services or deploy the website. Structural verification of IDs, scope, dependency order and links is separate from proving the product works.
