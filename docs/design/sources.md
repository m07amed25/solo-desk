# UI design reference sources

Updated 29 October 2026; stack links checked against official documentation for this website update. Earlier visual-quality references remain design inputs. These support design choices and implementation verification; product behavior and legal profiles remain in the project specifications.

## User-selected quality references

- [Linear product](https://linear.app/features): reference for focused work navigation and consistent issue interactions. SoloDesk keeps the user's spacious preference rather than copying a compact screen.
- [Notion product](https://www.notion.com/product): reference for calm readable content and progressive detail. No Notion branding, proprietary assets or AI product functionality is adopted.
- [GitHub Primer product UI](https://primer.style/product/): reference for explicit action/state semantics and mature component consistency. SoloDesk still uses its required Tailwind/shadcn stack.

These are visual-quality references, not dependencies or affiliation claims. The original supplied SoloDesk logo remains the brand authority.

## Accessibility and layout

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): overall renderer/portal verification target.
- [Text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): 4.5:1 ordinary text and 3:1 qualifying large text, with stated exceptions.
- [Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): meaningful graphical/control contrast target.
- [Target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): WCAG AA minimum criterion. SoloDesk's 44px spacious target is a stronger design recommendation, not the criterion's exact numeric threshold.
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/): keyboard/focus patterns for interactive components; verify behavior of the installed primitive.
- [CSS logical properties](https://www.w3.org/TR/css-logical-1/): direction-aware layout vocabulary.

## Fonts and website/component constraints

- [Inter official project](https://rsms.me/inter/): Latin UI font recommendation, tabular numeral features and linked redistribution license. Pin exact chosen files/version and preserve license before bundling.
- [Noto Arabic source](https://github.com/notofonts/arabic) and [Noto Sans Arabic specimen](https://fonts.google.com/noto/specimen/Noto+Sans+Arabic): Arabic font candidate; inspect exact release/license and shaping/PDF behavior before bundling.
- [shadcn documentation](https://ui.shadcn.com/docs) and [Base UI](https://base-ui.com/react/overview/quick-start): primary selected component-system foundation and optional primitive reference; neither shadcn/ui nor a primitive family is installed in this checkout. Check actual package versions and API behavior at implementation time.

Generated exploration images use the built-in image generation tool with the original logo as reference. Each image has a neighboring JSON containing its exact prompt, reference origin, approval status and intended use. Original user logos are not modified to embed metadata; their paths and origin are recorded here instead.

## Selected stack and patterns

- [shadcn/ui introduction](https://ui.shadcn.com/docs) and [theming](https://ui.shadcn.com/docs/theming): component ownership/composition and semantic CSS-variable roles.
- [Neon pooling](https://neon.com/docs/connect/connection-pooling): pooled runtime connections, direct migration/backup connections and transaction-mode limitations.
- [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next), [PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql) and [security](https://better-auth.com/docs/reference/security): server integration and origin/session protections.
- Installed Next.js version-specific guides live at `node_modules/next/dist/docs/`; see [setup](../development/setup.md). Read them before implementation.

[Project patterns](../architecture/design-patterns.md) are project design decisions grounded in concrete module boundaries, not claims that provider selection alone ensures security or scalability.
