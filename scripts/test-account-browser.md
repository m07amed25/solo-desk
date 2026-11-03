# User Story 2: Account Sessions & Revocation Browser Test Matrix

**Document**: `scripts/test-account-browser.md`  
**Purpose**: Multi-session, multi-account browser test fixture and verification steps for User Story 2 and User Story 4.  
**Status**: Procedure only. No live execution or provider acceptance is recorded here. G1/G3/G5 remain blocked; the user confirmed on 3 November 2026 that no owner-verified target/evidence is available.

**Requirement Mapping**: FR-007, FR-008, FR-009, FR-010, FR-013, FR-014, FR-015, FR-027–030.

---

## 1. Test Matrix Topology

### Accounts & Sessions

| Identity                               | Session Label      | User Agent / Device Type     | Initial State | Expected Terminal State   |
| :------------------------------------- | :----------------- | :--------------------------- | :------------ | :------------------------ |
| **Account A** (`user-a@solodesk.test`) | **A1** (Current)   | Chrome Desktop (Primary Tab) | Authenticated | Active & Valid            |
| **Account A** (`user-a@solodesk.test`) | **A2** (Secondary) | Firefox Desktop              | Authenticated | Revoked via Step-Up       |
| **Account A** (`user-a@solodesk.test`) | **A3** (Tertiary)  | Safari Mobile                | Authenticated | Revoked via Revoke-Others |
| **Account B** (`user-b@solodesk.test`) | **B1** (Foreign)   | Chrome Incognito             | Authenticated | Completely Isolated       |
| **Account B** (`user-b@solodesk.test`) | **B2** (Foreign)   | Edge Desktop                 | Authenticated | Completely Isolated       |

---

## 2. Test Scenarios

### Scenario 1: Own Session Listing & Safe Metadata

1. **Action**: Sign in as Account A on Browser A1. Navigate to `/app/account`.
2. **Observations**:
   - The Sessions card displays items A1, A2, and A3.
   - Session A1 is explicitly flagged with badge `Current` (`current: true`).
   - Sessions A2 and A3 display `current: false` with action buttons `Revoke`.
   - Device labels reflect sanitized browser/OS indicators (e.g. `Chrome on macOS`).
   - Timestamps show localized relative or formatted date/times.
   - Zero sessions belonging to Account B (B1, B2) appear in the list.
   - Only the account-scoped opaque reference may appear in the DTO. No bearer tokens, IP addresses, provider grants, or unallowlisted fields may appear in DOM, responses, screenshots, or traces. The reference grants no authority by itself.

### Scenario 2: Individual Session Revocation with Reauthentication

1. **Action**: In Browser A1, click `Revoke` on session A2.
2. **Behavior**:
   - Inline confirmation card opens prompting for reauthentication.
   - Notice displayed: `Confirmation proof is valid for 5 minutes.`
   - Submitting incorrect password displays error: `Invalid password`.
   - Submitting correct password verifies freshness and dispatches exact revocation for A2.
   - Receipt displayed with status `accepted` and target reference A2 marked `revoked`.
3. **Verification on Target A2**:
   - Switch to Browser A2 (Firefox) and make any protected request (e.g. refresh `/app/account`).
   - Request is rejected with `401 Unauthorized` and redirected to `/sign-in`.
   - Browser A1 and A3 remain fully authenticated.

### Scenario 3: Bulk "Revoke All Other Sessions"

1. **Action**: In Browser A1, click `Revoke other sessions`.
2. **Behavior**:
   - Step-up confirmation modal/card requires password entry.
   - Enter password and submit.
   - The server freezes a complete authoritative snapshot excluding A1 before confirmation. The browser submits only operationId and confirmationId. Reservation is committed locally before provider dispatch; proof is consumed after known success. A local transaction cannot atomically include provider effects.
   - Success alert appears: `Other sessions have been successfully revoked.`
3. **Verification on Targets**:
   - Browser A3 (Safari Mobile) makes next protected mutation or navigation: rejected with 401.
   - Browser A1 remains valid and can continue performing work without re-authenticating.

### Scenario 4: Ordinary Current Session Sign-Out

1. **Action**: In Browser A1, click `Sign out` in the user menu.
2. **Behavior**:
   - No step-up reauthentication dialog is shown. Current session sign-out is strictly exempt.
   - The SDK confirms sign-out; inspect actual deletion cookies privately without retaining cookie values. Missing acknowledgement, returned error, thrown failure, and lost reply keep identity concealed and expose retry/recheck rather than success navigation.
   - Browser navigates cleanly to `/` with no private account content lingering in BFCache or DOM.

### Scenario 5: Account Switching & Multi-User Isolation

1. **Action**: In a fresh window, sign in as Account B.
2. **Behavior**:
   - Navigate to `/app/account`.
   - Session list shows only B1 and B2.
   - No data, drafts, or cached session references from Account A are present.

### Scenario 6: Upstream Provider Unavailability Handling

1. **Action**: Simulate upstream provider listing failure or rate limit outage.
2. **Behavior**:
   - Sessions card displays honest alert: `Your sessions are temporarily unavailable. Please try again.`
   - `Retry` button re-attempts own listing GET.
   - Ordinary current-session navigation and sign-out continue functioning normally without dependency on session listing health.


## 3. Required controlled failure and race fixtures (local only)

Use mocked auth/listing/revocation adapters with synthetic accounts. These checks establish UI and application behavior only; they cannot pass G1/G5, revoke a real session, or prove provider freshness.

| Case | Action and required observation |
| --- | --- |
| Listing loading/empty | Hold the GET promise; announce loading and expose no prior list. Resolve an empty authoritative list; show honest empty state without inventing a current row. |
| Metadata unknown | Supply missing, invalid or unavailable optional timestamps/device metadata; show null/unknown, never the current time as fabricated activity. |
| Foreign reference/cursor | Submit B's reference/cursor while acting as A, including a replay after account switching. Return the contract's non-disclosing denial and expose no B metadata/count. |
| Bounds/completeness | Exercise page sizes 0/20/100/101, malformed/oversized cursors, oversized or incomplete upstream lists and listing-age denial. No incomplete snapshot may authorize bulk revoke; pagination is not evidence of provider completeness. |
| Late listing | Start A's listing, switch to B or expire A, then resolve A's promise. It must not restore A rows, metadata, overlays or actions. |
| Unknown/duplicate dispatch | Lose a reply, retry the original operation ID, then change its confirmation/payload. Reconcile the original result; reject changed intent; never dispatch a second operation from one proof. |
| Partial bulk result | Revoke one target then fail/time out another. Keep per-target partial/unknown status, frozen scope and current-session preservation; no overall-success message. |
| Expiry and authority | Exercise 299999/300000 ms and revoke A1 between two target dispatches. No new work after expiry or original-session denial. |
| Current sign-out | On each public header and account surface, exercise acknowledged success, returned error, throw, missing acknowledgement and lost reply. Pending/unknown conceals account content at both 390px and 1280px; resize cannot restore it. Retry/reload stays available; sign-out needs neither a new-attempt limiter nor step-up. |
| Lifetime/history | With a dirty A-name draft and an open private overlay, trigger expiry, A→B switch, pagehide/pageshow, Back/Forward and delayed save/profile/context replies. Conceal synchronously; dispose subscriptions/overlays; never show A input under B. Reload loses in-memory input as disclosed. Synthesized page events do not establish actual BFCache behavior. |

## 4. Public and human review

On the actual current Next candidate, check English/Arabic × Light/Dark/System, 320/390/768/1280/1440 CSS-pixel widths and short height, reduced motion and live System changes. Visit every tour tab. Footer links must match their section/account destinations; there is no newsletter form, fabricated subscription/health state, corporate suffix or generic social homepage. Preview names, amounts, timers and activity are synthetic.

Use keyboard-only navigation through menu, retry and reload controls; verify visible focus, error announcements, reading order, RTL and mixed-script isolation. Record engine/version, real 200% browser zoom (not device scale), actual screen-reader review and fluent-Arabic review separately. Missing human reviews remain gaps. Required disclosure/legal decisions remain owner review; removing unrelated links grants no waiver.

For live scenarios record the independently verified synthetic target, source/build/schema/policy identities, each expected/observed result and exact command. Keep credentials/challenges/cookie values out of evidence. Missing provider/owner evidence is BLOCKED, never a mocked PASS.
