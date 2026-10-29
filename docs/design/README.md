# SoloDesk website design documentation

Updated 29 October 2026. A coherent scalable design system and **shadcn/ui-first components** are primary requirements. The running checkout remains a Next.js starter; the design specification and standalone specimen do not implement business features, Neon or Better Auth.

Start with [DESIGN.md](../../DESIGN.md), then [components](components-and-interactions.md), [visual recipes](component-visual-specs.md) and [screens](screens.md). Preserve the spacious productivity direction, light/dark/System themes and English/Arabic RTL. Adapt every surface to phone/tablet/wide-screen browsers and standard website navigation.

| Artifact | Authority |
| --- | --- |
| [Design system](../../DESIGN.md) | shadcn/ui-first composition, shared tokens, variants, responsive/RTL/accessibility and change rules |
| [Brief](brief.md) | Audience, task, inherited visual direction and website constraints |
| [Tokens](tokens.json) | Proposed paired semantic palette, spacing/type/stroke/focus/radius/motion and contrast pairs |
| [Components](components-and-interactions.md) | Shared accessible control and business-composite behavior |
| [Visual recipes](component-visual-specs.md) | Exact proposed dimensions, paint, borders, states and variant recipes |
| [Screens](screens.md) | 73 planned surface families, fields/actions/states and flows |
| [Feature coverage](phase-coverage.md) | Retained F001–F151 planning references with native-specific entries explicitly superseded/retired |
| [Handoff](quality-and-handoff.md) | Design-system reuse, browser/locale/theme matrix and feature release evidence |
| [Current validation](current-validation.md) | Reproducible current source/token/link/coverage checks and their limits |
| [Reference](reference.html) | Disconnected illustrative visual specimen; no production shadcn/ui/auth/database functionality |
| [Sources](sources.md) | Official component/theming, accessibility and framework references |
| [Historical review](review.md), [validation](validation.md), [captures](previews/README.md), [exploration](exploration/README.md) | Earlier observations/provenance, not website implementation or current visual test evidence |

The reference has illustrative theme/language/state/view controls and synthetic content. Its custom HTML demonstrates visual intent; production controls must use reviewed shared shadcn/ui components. Browser draft examples inherit [security/storage gates](../architecture/sync-and-collaboration.md), not a guarantee of persistence. Token values are proposals until implemented and tested. Domain specs remain authoritative for finance, permissions and exact publication.
