# Website design-system quality and handoff

Updated 29 October 2026. Design-system quality, scalability, security and shadcn/ui reuse are primary acceptance requirements. This is a future verification plan, not a passed implementation test.

## Authority and reuse

[DESIGN.md](../../DESIGN.md) owns semantic tokens, shared variants, component composition and responsive/RTL behavior. [Visual recipes](component-visual-specs.md) defines proposed exact values; domain specs own money, permissions and lifecycle. Existing reference HTML is an illustrative specimen and does not replace production shadcn/ui primitives. Neon/Better Auth choices are confirmed; their integration and any component family are not yet installed.

Use shared `components/ui` shadcn/ui source, then reusable business composites, then feature screens. Record any custom-component gap, accessibility behavior and token/variant impact. Avoid copied controls, per-feature color systems or wrappers that merely rename primitive props. Component changes update every affected caller, both themes, token checks and state examples; breaking APIs include migration guidance.

## Browser, locale and viewport matrix

Every applicable feature covers light/English, dark/English, light/Arabic RTL and dark/Arabic RTL, preserving input/workspace across theme/locale changes. Test phone 390×844, tablet 768×1024 and wide 1280×800/1440×900, 320 CSS-pixel reflow, 200% zoom, touch, reduced motion and forced colors. Q-11 approves final browser/version/device support; there is no native window minimum or overlay/tray gate.

Verify real keyboard/focus/reading order and screen-reader behavior alongside automated checks. Preserve browser links/history/open-in-new-tab, standard text selection and accessible upload/download flows. Browser notification denial leaves working in-site alternatives. Font files/licenses and Arabic shaping/PDF embedding need separate evidence.

## Color and state evidence

Target WCAG 2.2 AA behavior: ordinary text/placeholder contrast 4.5:1, qualifying large text 3:1 and meaningful controls/icons 3:1 against adjacent colors. Use full-precision contrast checks on declared roles in both themes; decorative separators are not control boundaries. Pair charts with labels/line markers and accessible table alternatives.

Fixtures: long mixed-language names/IDs, unknown versus zero values, exact 0/2/3-decimal currencies, empty/filter-empty/failure, revoked grants/session, unsaved/pending/conflicted/rejected drafts, storage quota/eviction/denial and lost financial replies. Show browser save separately from server acceptance; protected offline drafts stay gated until key/recovery proof. A UI cannot expose restricted data in hidden DOM, props, tooltips, counts or exports.

## Feature handoff

1. Link requirement/UI IDs, actor/task, data/action scope and domain transitions. Native-specific F references in [coverage](phase-coverage.md) are superseded, not implementation instructions.
2. Name reused shadcn/ui primitives/composites, semantic tokens and complete interaction/state/RTL behavior.
3. Describe module/application-service/data-access/adapter ownership, query/job bounds and pattern rationale; [patterns](../architecture/design-patterns.md) governs scalable boundaries.
4. Use Better Auth identity and current server grants, server-only Neon transactions and minimum permitted projections. Direct actions/API calls require the same security as visible buttons.
5. Exercise meaningful behavior, failure/retry/authorization, browser accessibility and responsive theme/locale cases. Capture exact build/browser/fixture and state evidence; old screenshots do not satisfy it.
6. Update feature guidance/observed QA, affected specs, migrations and operations. Report limitations; approval, merge and deployment follow current authorization and [governance](../development/delivery-governance.md).

## Design evolution and remaining gates

Version substantial token/component changes with rationale, affected screens and migration steps. Re-run token/link checks and affected visual/interaction cases; do not claim a screenshot proves auth, financial correctness or legal compliance. Unresolved markets/finance fixtures, browser draft protection, auth recovery, private files/email/hosting and measured service recovery remain explicit gates in [decisions](../planning/decisions.md).

[Current validation](current-validation.md) records only executed source/artifact checks. [Historical captures](previews/README.md), [old review](review.md) and [old validation](validation.md) preserve prior observations without implying fresh website QA.
