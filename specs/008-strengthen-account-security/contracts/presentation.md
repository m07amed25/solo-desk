# Account Protection Presentation Contract

**Status**: conditional UX contract, not implemented controls or browser acceptance. Preserve [DESIGN.md](../../../DESIGN.md), existing account shell and the spec's English/Arabic outcomes. Current support/identity/policy gates apply to real interactions.

## Entry, ownership and truthful states

Place one clearly named security section inside `/app/account`, alongside the existing personal profile/security content, without a dashboard, new account hierarchy or workspace-role requirement. Reuse shadcn/Base UI Button, Field, Input, Label, Card, Alert and existing confirmation/status primitives with semantic Tailwind tokens. Add no new primitive/dependency without an actual supported interaction need.

Keep account protection observation separate from operation availability. A known enabled factor may be enabled while a removal action is unavailable; provider outage means unknown/unavailable, not an empty list or disabled protection. Show `setup`, `pending`, `enabled`, `unavailable` and recoverable failure accurately. An explanation-only entry has no live setup/remove placeholder buttons and does not deliver F02.05. Identify conditional expansions as unavailable/unselected without implying completion.

The account page currently depends on profile/Realtime loading. Review whether a profile/Realtime failure conceals security access and provide truthful existing-shell recovery before claiming the entry independently usable; do not duplicate account authority or rebuild unrelated profile work. If capability projection uses `lib/application.ts`/app-context, update its closed shape and all fixtures together only when necessary.

## Supported enrollment and sign-in

Before setup, explain voluntary enrollment, sign-in consequences, recovery custody and the lost-all-methods limit. Use only approved supported owner confirmation. Pending setup is distinct from confirmed TOTP and complete recovery setup; provider-accepted activation with incomplete/unknown recovery cannot be falsely presented as undone or safely complete.

One-time setup/recovery material uses a dedicated confidential transient view. Explain safe user custody and that acknowledgement does not mean SoloDesk saved an external copy. Never offer later secret read-back, send a seed to remote QR generation or persist material to survive navigation. Do not claim a lost secret response was delivered; reconcile and offer only a supported freshly authorized replacement.

Sign-in challenges retain the initiating allowed destination/language/theme through supported confidential provider state, not proof-bearing URLs. Cancel, expire, invalid proof, cooldown and restart each have truthful bounded guidance. No protected application view is rendered from a primary/session/callback success before the enrolled policy completes. Unsupported social/recovery challenge coverage keeps activation blocked.

## Removal, recovery and unknown effects

Consequential disable/replace/remove/identity actions name what changes, required confirmation, surviving methods and expected session outcomes. Prevent last-route removal at the service/provider boundary, not merely through disabled UI. Voluntary MFA disablement is distinct from recovery; no lost-device recovery silently disables protection.

Recovery must explain all-prior-session termination and the need to confirm replacement protection and sign in again. An expired/revoked initiating session cannot be reused for status or replay; provider-supported recovery-only continuation may show only its permitted recovery state. No support override or guaranteed recovery exists when all usable methods/codes are lost.

Display accepted/rejected/pending/unknown results distinctly. Disable conflicting submissions while intent is unresolved, retain safe non-secret input under its owner and reconcile before retry. A button returning 2xx/202 or a provider redirect does not establish success. Preserve consequence/error text and a concrete next action after recoverable failure without storing proof.

## Existing client lifetime and navigation

Reuse `ApplicationRuntime` account generation, concealment, abort/ignore-late-result and dirty-form owners; do not introduce another auth store. Lists, confirmation, confidential displays, overlays and operation results belong to their original account/session and disappear on expiry/sign-out/switch/unmount. History/BFCache and slow responses cannot reveal prior-owner material.

Register meaningful unsaved non-secret edits with existing navigation guards. Supported provider departure must warn honestly about transient state loss. Browser locale/theme forms and finite callback destinations keep their current owners. No localStorage/IndexedDB/service-worker cache is added for credentials, codes, setup material or protected drafts. Ordinary sign-out remains reachable without step-up or a functioning new-attempt limiter.

## Language, accessibility and acceptance

All actual labels, explanation/error/status/retry/consequence text and essential security messages are equivalent in English/Arabic. Preserve current browser-choice → saved-account → English language semantics and separate account/browser settings. Logical placement follows RTL; email/code identifiers remain readable LTR or isolated mixed-direction content without altering canonical values or leading zeros.

Keyboard users can enter/leave setup, paste proof, cancel prompts, select permitted alternatives and reach recovery. Move focus to a meaningful next heading/control or relevant error; restore it appropriately on cancellation. Announce status/errors accessibly without every countdown tick. Required controls stay reachable at 320 CSS pixels and actual 200% zoom across Light/Dark/System; status is not communicated by color alone. Respect reduced motion and actual target-size/contrast contracts.

Run actual supported-account journeys in both languages and all themes on phone/tablet/wide layouts, with long mixed-direction labels, mobile keyboards, browser/device cancellation, expiry/lost-reply and account-switch cases. Automated key parity/rendering/screenshot checks supplement actual keyboard/screen-reader/contrast review. Record named fluent-Arabic and assistive reviewers; unavailable engines/devices/humans remain gaps. Execute SC-008's five-person usability review only after supported enrollment/recovery works; a scripted operator cannot stand in for participants.

## Local execution checkpoint — 3 November 2026

[Scoped evidence](../evidence.md) records the implemented informational entry and current tests/gaps. This changes no protected-operation contract or policy value. Actual managed/human/Next-route acceptance and the full verification gate remain incomplete; F02.05/F02.12/F02.13 and delivery totals stay pending. Resolve support/policy and applicable inherited gates, then revise supported design/checklist/tasks/analyze before protected implementation; finish local acceptance before final convergence.
