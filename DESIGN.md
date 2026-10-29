# SoloDesk website design system

Updated 29 October 2026. Design system quality and scalability are primary requirements. This document governs future website implementation; existing reference artifacts are illustrative and the starter does not implement this system.

## Component authority

Use **shadcn/ui first** for buttons, fields, dialogs, sheets, menus, tables, tabs, navigation, feedback and other supported controls. Keep reviewed component source in a shared `components/ui` directory. Compose those primitives into reusable business components and feature screens. Choose and document one compatible primitive implementation when installing shadcn/ui; this checkout has no installed primitive family yet. Preserve its semantic, keyboard, focus and composition contracts.

Do not build competing controls or introduce another general UI kit for an existing shadcn/ui use case. A custom component needs a concrete gap, shared-token styling and accessibility evidence. Avoid wrappers that only rename props or duplicate existing primitives.

## Tokens and visual direction

[Tokens](docs/design/tokens.json) defines the existing proposed light/dark palette, typography, spacing, strokes, focus, radii, geometry and motion. Map semantic roles to shadcn/ui CSS variables and Tailwind utilities during implementation. Features consume semantic roles and named variants; no isolated palettes or copied control styles. Shared token changes update both themes, component recipes, contrast checks and examples together.

Preserve the spacious productivity-workspace direction, calm readable hierarchy and the existing proposed brand treatment. Original logo references and screenshots are historical design inputs; verify asset availability before implementation. Use approved Latin/Arabic font files and licenses before shipping. Light/dark themes follow System by default, with an explicit personal override.

## Website behavior

Support phone, tablet and wide-screen browsers. Collapse sidebar/context into accessible navigation on narrow screens; no minimum desktop window requirement. Keep browser Back/Forward, URLs, open-in-new-tab and standard keyboard behavior useful. Browser chrome belongs to the browser. The timer, workspace, permissions and honest save/connectivity state remain discoverable without a custom title bar or tray.

English/Arabic RTL uses logical CSS, appropriate direction and isolated mixed-language identifiers. Test WCAG 2.2 AA behavior, keyboard focus, screen readers, touch targets, reduced motion, forced colors, 200% zoom and 320 CSS-pixel reflow. Financial documents retain exact saved values and independently validated Arabic output.

## Reuse and evolution

Shared primitives → reusable business composites → feature screens is the UI dependency direction. Routes compose screens; they do not fork control semantics. Every feature documents component reuse and loading/empty/dirty/saving/pending/conflict/rejected/failed/read-only states. A local draft is distinct from a server-accepted save. Never expose server-only data through component props or hidden markup.

Component changes include affected callers, migration guidance for breaking APIs, behavior/accessibility checks and representative theme/locale/viewport captures. See [components](docs/design/components-and-interactions.md), [visual recipes](docs/design/component-visual-specs.md), [screens](docs/design/screens.md) and [handoff](docs/design/quality-and-handoff.md).
