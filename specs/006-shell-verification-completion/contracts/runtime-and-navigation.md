# Runtime and Navigation Correction Contract

This refines implementation obligations from [Feature 005 navigation](../../005-application-shell-sidebar/contracts/shell-and-navigation.md) and [authority](../../005-application-shell-sidebar/contracts/runtime-and-authority.md); it does not replace its service/domain contracts. All behavior below is **planned, acceptance pending**. The current source does not satisfy every row.

## Protected Interfaces and Authority

| Interface | Input / result | Required correction or preservation |
| --- | --- | --- |
| `getApplicationContext(): Promise<ApplicationContext>` and render-pass cached wrapper | Current trusted request/session; narrow existing envelope | Reuse `currentSession` and authorized workspace reads. Bound choices 20/max 50; disabled means no workspace SQL. Preserve genuine unavailable/empty/restricted distinctions; stable safe error codes, no raw exceptions or unneeded private projections. Render-pass deduplication never substitutes for fresh action authority. |
| `GET /api/app/context` | No query fields; current cookies; same envelope | 200 for valid account even when workspace-only state is unavailable/disabled; 400 invalid query, 401 invalid account, 503 unavailable account authority. Generic stable error code without private payload/exception message. Unexpected errors fail closed. Keep private/no-store and preserve framework `Vary` while including Cookie. GET makes no selection/domain mutation. |
| `selectWorkspaceAction(workspaceId: string)` | Existing `ActionResult<{ selected: string }>` | Reuse exported `validateUUID`; current account plus workspace read/select membership/grants before cookie write. Keep existing host-only HttpOnly/SameSite=Lax/path/production Secure policy and result envelope. No role/cookie/client actor as authority. |
| `clearWorkspaceSelectionAction(expectedWorkspaceId: string)` | Same `ActionResult<{ cleared: true }>` envelope; argument becomes required | Check current account first. Expected cookie value is nonempty and at most 4096 UTF-8 bytes; it may be a malformed stale UUID, so clearing does not require it to be a valid authorized workspace. Missing/oversized input fails safely without deletion. Delete only matching request cookie; absent cookie is idempotent, different cookie is untouched. Acknowledgement never lets client assume the current selection; re-read context. |
| Workspace domain actions and receipts | Existing typed IDs/revisions/intent; existing service result | Preserve transactions, current grant checks before effect/private replay, role ceilings, last-owner safeguards, validation/error codes, original operation ID/target/revisions, audit/outbox and unknown-outcome reconciliation. No new domain handler or unsupported step-up. |
| Profile GET/save/live seal | Existing own-user contract and error codes | Runtime actor must match own profile; keep exact own-row/expiry/seal predicates and scoped renewal. Workspace failure/disablement is independent. Dispose existing subscriptions on private lifetime loss. |
| Managed sign-out | Supported existing auth client result | One in-flight operation; inspect returned `error` and thrown failures. Conceal before request; success leaves with empty fragment. Failure gets visible localized retry/recheck, never false redirect or ready state. |

Review all direct entry points and origin/CSRF safeguards; a layout/proxy/menu is not authorization. A browser generation, expected selector and DTO capability are coordination inputs, never trusted grants.

## Existing Runtime Interface Changes

Retain `switchWorkspace`, `clearSelection`, `loadNextWorkspacePage`, `refreshContext`, `signOut`, `registerDirtyForm`, `isAnyFormDirty`, `confirmNavigationDiscard` and existing account/selection fields. Add only:

- `navigate(destination: AppDestination | "/"): Promise<boolean>`: validate finite destination, confirm/discard current forms, conceal/invalidate the departing private context and schedule exactly one permitted transition. True means scheduled, not committed. App paths use the installed router; public home uses explicit fragment clearing.
- `teamEpoch: number`: reset team-private lifetime when confirmed selection/authority changes require disposal, independently of request generations used by routine rechecks.
- Required `discard(): void` on the existing dirty handler, alongside `isDirty()` and optional `confirmDiscard(): Promise<boolean>`. Confirm every dirty handler first; call discard only if all agreed. Handler cancellation must be side-effect free.

`errorMessage` and per-state errors carry stable local message keys/codes. Localized presentation maps them through current message namespaces; raw action/exception strings never become fallback user copy. No public barrel/config API is added.

## One Private Context Owner

`ApplicationRuntime` owns current account, choice list, verified selection, pending write and private lifetime. `WorkspacePanel` is used only on workspace page; it consumes runtime rather than retaining independent initial selection/choices. Keep form/list mechanics in the same module, with a keyed team subtree when useful. Overview reads selected context only when ready. Every create/select path uses runtime switching; no parallel cookie action followed by unconditional reload.

Switch protocol:

1. Confirm/discard before changing state. Reject overlapping select/clear writes using a ref acquired before awaiting the cookie action; do not queue stale user intent invisibly.
2. Advance request generation and teamEpoch, abort obsolete readers, set checking with `context: null`, close obsolete team menus and dispose old team-private views/subscriptions. Keep personal data independent of workspace-only uncertainty.
3. Invoke the original explicit-target selection action, then fetch current context with abort/15-second timeout.
4. Reveal only for current mounted generation, matching account, finite future expiry, matching requested selected/context UUID and ready authority. Reordered responses, cross-tab cookie mismatch or missing grant keep context concealed with accurate recovery.
5. Release write guard in finally, without allowing an obsolete completion to release/overwrite a newer request's state. Never infer server rollback from an aborted request.

Member/invitation initial loads, manual refresh and mutation follow-up capture actor/workspace/teamEpoch. At start clear unauthorized previous lists; at completion update only the matching current lifetime. Freeze submitted workspace/resource IDs, operation ID and expected revisions; a late result may require reconciliation for its original target but cannot populate current views.

Pagination is bounded and actor/generation/cursor-scoped, with a single pending page request and ID deduplication. Later-page failure keeps previously verified choices and a localized retry. No service failure becomes empty or successful selection.

## Concealment, Recovery and Profile Lifetime

Render checking/unavailable/sign-out error/retry UI outside the hidden private subtree. Hide/inert private DOM synchronously before uncertain authority, pagehide and cached-route restoration; clean up readers/effects on Activity hide/unmount. Revalidate before restored reveal, even when the template/bootstrap was retained. Test this under a production build with current cache flags.

Successful recheck verifies actor/expiry and current team/grants. Team/permission change invalidates its private epoch before reveal; changed actor disposes old private state and reloads while concealed. A context response alone cannot validate stale server-rendered profile/team children. Profile validates its own current actor-bound envelope/seal before mounting its subscription. Routine same-actor/same-context recovery preserves valid in-memory dirty input; it does not reset forms merely because a read generation changed.

Always arm a fresh expiry timer after successful validation, including when expiry timestamp is unchanged. Keep one 55-second visible-tab account recheck owner, immediate foreground/route checks and direct server authorization on protected operations. Profile-specific seal renewal remains; remove its second general session loop/sign-out implementation while preserving its validation and cleanup.

On denial/identity change discard private drafts/proof/lists/subscriptions. On a recoverable same-actor outage conceal and retain only permitted memory for retry. Account-unavailable state is not signed out, successful empty membership, or permission to keep showing stale private content.

## Routes, Returns, Forms and Focus

Existing browser paths remain `/`, `/sign-in`, `/sign-up`, `/app`, `/app/workspace`, `/app/account`; authentication resumption accepts only the three app paths. Existing `lib/site.ts` helpers own validation. Preserve 2048-byte preference/query bounds, exact unique fields and exact-origin checks; no prefix route matching or arbitrary external return. Preserve locale/theme rewrites and rejection of unsupported public aliases.

| Interaction | Commit rule | Cancellation/focus rule |
| --- | --- | --- |
| Shell/breadcrumb/account-menu/overview/switcher destination | `Link.onNavigate` synchronously prevents eligible SPA default, delegates to shared `navigate`, then one explicit push/public exit | Modified/new-tab clicks keep native behavior. Cancel leaves URL/input/selection/drawer/focus intact. All private links disable speculative prefetch per the existing contract. |
| Language/theme POST | Synchronously prevent default, capture actual form before await, confirm all dirty input, then submit that form once through native submission | No POST/cookie/preference change on cancel; no recursive requestSubmit. Preserve current finite return/workspace and validation. |
| Workspace selection | Shared serialized runtime switch only | Cancel before selector/write/private disposal. Confirmed switch follows current-authority protocol. |
| Successful route commit | Observe actual committed finite pathname, close drawer and focus new visible heading/main | Do not close/focus merely because navigation was scheduled; same-path/cancelled transitions preserve current state. |
| Modal dismissal / breakpoint | Base UI Sheet remains modal with appropriate initial/final focus and visible labeled close | Dismissal restores opener; resize closes obsolete modal and focuses equivalent visible control. No background interaction/scroll or lingering lock. |

Register current profile/create/settings/invite forms, preserving existing validation/conflicts. Return clean state after successful save or explicit discard; preserve valid input after recoverable failure. A cancelled second form confirmation leaves every form untouched. Warn honestly about reload/closure; no protected persistence or guaranteed browser close prompt.

Shared shell retains skip link, navigation/header/main landmarks, active announcements, visible focus, 44px shell controls using existing variants, short-screen scrolling and logical RTL alignment. Sidebar/Sheet localizable props retain safe defaults for utility consumers. Arabic mirrors appropriate navigation icons and placement, isolates user identifiers and keeps sensible reading/keyboard order. No token palette or framework replacement.

## Invitation Entry and Acceptance

Reuse `workspace-invitation.tsx` for the early app-layout provider and authenticated acceptance view. Provider retains no private workspace DTO; it only bounds/scrubs proof in memory and exposes non-private states. Mount before private loading, while recognizing the server cannot observe URL fragments and hydration may lose a redirect race.

- Preserve framework `history.state` when scrubbing; bound raw fragment 4096 characters and decoded proof 1024, catch malformed encoding and offer localized generic guidance.
- Every sign-in/recovery/public/preference exit explicitly clears the fragment. Do not forward proof into return/query/callback data, storage, logs, analytics or captures.
- Require current recipient authority and existing workspace/invitation gate before explicit acceptance. Invalid/expired/reused/revoked/wrong-recipient proofs expose no forbidden metadata or effects.
- Capture proof and operation ID once for an acceptance command; hashchange cannot retarget pending intent. Use existing uncertain-result reconciliation where supported; no new-ID automatic retry or delivery.
- Clear proof on route/preference/identity exit, denial, dismissal or consumption; clean timers/listeners. Lost proof explains sign-in and reopening the original link.

## Mandatory Mounted Cases

Exercise: two-form cancel/discard; delayed A→B switches and later-page/member/mutation results; revoked grant without role change; account mismatch while polling; Activity/Back/Forward restore; expiry unchanged after recheck; sign-out returned/thrown failures; signed-out streamed redirect with proof; hashchange during acceptance; drawer dismiss/commit/resize at 767/768/769 pixels. Include personal read/update/live behavior during workspace-only failure. Controlled network faults prove client handling only; direct real-service/session denial is a separate gate.
