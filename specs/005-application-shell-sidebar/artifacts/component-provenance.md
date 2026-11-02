# Component Provenance and Source Review: Base UI UI Primitives

**Feature**: Feature 005 — Application Shell and Sidebar Navigation  
**Date**: 2026-11-01  
**Style**: `base-nova` (Base UI 1.9.0, shadcn CLI 4.23.0)

## Overview

In accordance with project constraints, `components.json` specifies `"style": "base-nova"`, pairing shadcn CLI component scaffolding with `@base-ui/react` primitives. No preset replacement, dependency addition, or migration from Radix to Base UI is required as the project already utilizes Base UI.

## Component Resolutions & Imports

### 1. `components/ui/sidebar.tsx`

- **Upstream Registry**: `https://ui.shadcn.com/r/styles/base-nova/sidebar.json`
- **Primitive Source**: Base UI (`@base-ui/react/merge-props`, `@base-ui/react/use-render`), Lucide React (`PanelLeftIcon`)
- **Dependencies**: Reuses existing `@/components/ui/button`, `@/components/ui/input`, `@/components/ui/separator`, `@/components/ui/skeleton`, `@/components/ui/sheet`, `@/components/ui/tooltip`, `@/hooks/use-mobile`, `cn`.
- **Modifications for Feature 005 (T052 / Shell Contract)**:
  - Memory-only state: removed unsolicited `document.cookie` read/writes (persisting `sidebar_state`), ensuring layout state resets across documents and persists only in memory across in-app navigations.
  - Removed unrequested `Ctrl/Cmd+B` keyboard shortcut to avoid hijacking browser/editor shortcuts.
  - Mobile breakpoint strictly synchronized to 768px via `useIsMobile`.
  - Directional and RTL support applied via Base UI DirectionProvider / logical classes.

### 2. `components/ui/sheet.tsx`

- **Upstream Registry**: `https://ui.shadcn.com/r/styles/base-nova/sheet.json`
- **Primitive Source**: `@base-ui/react/dialog` (`SheetPrimitive.Root`, `SheetPrimitive.Portal`, `SheetPrimitive.Backdrop`, `SheetPrimitive.Popup`, `SheetPrimitive.Close`, `SheetPrimitive.Title`, `SheetPrimitive.Description`)
- **Dependencies**: `@/components/ui/button`, `lucide-react` (`XIcon`), `cn`.
- **Modifications for Feature 005 (T053)**:
  - Focus containment, inert/background scroll lock, Escape dismissal, and title accessibility.
  - Direction-aware side sheets (`left` / `right`) respecting logical layout and document `dir`.

### 3. `components/ui/tooltip.tsx`

- **Upstream Registry**: `https://ui.shadcn.com/r/styles/base-nova/tooltip.json`
- **Primitive Source**: `@base-ui/react/tooltip` (`TooltipPrimitive.Provider`, `TooltipPrimitive.Root`, `TooltipPrimitive.Trigger`, `TooltipPrimitive.Portal`, `TooltipPrimitive.Positioner`, `TooltipPrimitive.Popup`, `TooltipPrimitive.Arrow`)
- **Dependencies**: `cn`.
- **Modifications**: Zero additional dependencies; handles collapsed icon rail tooltips with accessible labels.

### 4. `components/ui/breadcrumb.tsx`

- **Upstream Registry**: `https://ui.shadcn.com/r/styles/base-nova/breadcrumb.json`
- **Primitive Source**: `@base-ui/react/merge-props`, `@base-ui/react/use-render`
- **Dependencies**: `lucide-react` (`ChevronRightIcon`, `MoreHorizontalIcon`), `cn`.
- **Modifications**: Reuses semantic tokens, supports `useRender` link rendering, and RTL arrow orientation.

### 5. `hooks/use-mobile.ts`

- **Upstream Registry**: `https://ui.shadcn.com/r/styles/base-nova/use-mobile.json`
- **Breakpoint**: Explicitly 768 CSS pixels (`MOBILE_BREAKPOINT = 768`), exactly matching `@media (min-width: 768px)` Tailwind md breakpoint.

## Overwrite Protection

A dry-run resolution confirmed that `shadcn add` attempts to overwrite existing customized project primitives:

- `components/ui/button.tsx` (contains custom height/sizing variants like `h-11`)
- `components/ui/input.tsx` (contains custom borders and height)
- `components/ui/separator.tsx`
- `components/ui/skeleton.tsx`

These 4 files are intentionally preserved. Only the 4 required new component files (`sidebar.tsx`, `sheet.tsx`, `tooltip.tsx`, `breadcrumb.tsx`) and 1 hook (`use-mobile.ts`) will be added, avoiding any regressions.
