# Current website documentation validation

Checked 29 October 2026. Scope: current documentation, token recipes, requirement coverage and reference script syntax. This is not application, browser-interaction or security test evidence.

Run `python3 docs/design/validate.py` from the repository root. `--write` refreshes this report using only executed source checks; it never rewrites [historical validation](validation.md). Uses Python standard library and Node script parsing without installing packages or contacting services.

88 declared contrast pairs pass; 25 component size recipes and 9 appearance recipes consistent; 73 screen families; 151 retained feature references with native entries superseded/retired; 143 requirements match coverage; 881 current local links; 30 historical notices; reference JavaScript syntax valid.

Local links in active Markdown and current historical notices are checked. Original absent-source references inside historical records are preserved and excluded; these are not current navigation/setup instructions. Feature counts retain stable references and do not claim implementation. HTML/token values are illustrative proposals.

Not run: website/business tests, live Neon/Better Auth integration, browser interaction/screenshots, screen readers, fluent Arabic review, PDF output, load/deployment or service recovery. No integration was installed/provisioned. Historical screenshots and results do not satisfy these gates.

## Declared contrast pairs

Named role pairs only; full-precision WCAG luminance comparison, rounded display. This does not certify all website accessibility.

| Theme | Foreground | Background | Ratio | Required |
| --- | --- | --- | --- | --- |
| light | `foreground` | `background` | 15.08:1 | 4.5:1 |
| light | `foreground` | `surface` | 16.19:1 | 4.5:1 |
| light | `foreground` | `surface-subtle` | 14.40:1 | 4.5:1 |
| light | `muted-foreground` | `background` | 5.88:1 | 4.5:1 |
| light | `muted-foreground` | `surface` | 6.32:1 | 4.5:1 |
| light | `muted-foreground` | `muted` | 5.42:1 | 4.5:1 |
| light | `primary-foreground` | `primary` | 6.09:1 | 4.5:1 |
| light | `primary-foreground` | `primary-hover` | 7.57:1 | 4.5:1 |
| light | `primary-foreground` | `primary-pressed` | 9.39:1 | 4.5:1 |
| light | `secondary-foreground` | `secondary` | 10.49:1 | 4.5:1 |
| light | `accent-foreground` | `accent` | 6.19:1 | 4.5:1 |
| light | `link` | `surface` | 7.20:1 | 4.5:1 |
| light | `link` | `background` | 6.71:1 | 4.5:1 |
| light | `destructive-foreground` | `destructive` | 6.45:1 | 4.5:1 |
| light | `destructive-foreground` | `destructive-hover` | 8.17:1 | 4.5:1 |
| light | `success` | `success-bg` | 6.02:1 | 4.5:1 |
| light | `warning` | `warning-bg` | 6.14:1 | 4.5:1 |
| light | `danger` | `danger-bg` | 5.77:1 | 4.5:1 |
| light | `info` | `info-bg` | 6.03:1 | 4.5:1 |
| light | `neutral-status` | `neutral-status-bg` | 5.83:1 | 4.5:1 |
| light | `sidebar-foreground` | `sidebar` | 10.49:1 | 4.5:1 |
| light | `sidebar-accent-foreground` | `sidebar-accent` | 5.68:1 | 4.5:1 |
| light | `selection-foreground` | `selection` | 12.88:1 | 4.5:1 |
| light | `input-border` | `surface` | 3.71:1 | 3:1 |
| light | `input-border` | `background` | 3.46:1 | 3:1 |
| light | `ring` | `surface` | 6.09:1 | 3:1 |
| light | `ring` | `background` | 5.67:1 | 3:1 |
| light | `ring` | `muted` | 5.22:1 | 3:1 |
| light | `ring` | `sidebar` | 5.22:1 | 3:1 |
| light | `chart-1` | `surface` | 6.09:1 | 3:1 |
| light | `chart-2` | `surface` | 4.91:1 | 3:1 |
| light | `chart-3` | `surface` | 5.37:1 | 3:1 |
| light | `chart-4` | `surface` | 5.23:1 | 3:1 |
| light | `chart-5` | `surface` | 5.74:1 | 3:1 |
| light | `chart-6` | `surface` | 5.42:1 | 3:1 |
| light | `foreground` | `surface-hover` | 13.63:1 | 4.5:1 |
| light | `foreground` | `muted` | 13.88:1 | 4.5:1 |
| light | `secondary-foreground` | `surface-hover` | 10.30:1 | 4.5:1 |
| light | `danger` | `surface` | 6.69:1 | 4.5:1 |
| light | `danger` | `background` | 6.23:1 | 4.5:1 |
| light | `ring` | `accent` | 5.24:1 | 3:1 |
| light | `input-border` | `surface-hover` | 3.12:1 | 3:1 |
| light | `input-border` | `muted` | 3.18:1 | 3:1 |
| light | `input-border` | `accent` | 3.19:1 | 3:1 |
| dark | `foreground` | `background` | 16.27:1 | 4.5:1 |
| dark | `foreground` | `surface` | 14.89:1 | 4.5:1 |
| dark | `foreground` | `surface-subtle` | 13.55:1 | 4.5:1 |
| dark | `muted-foreground` | `background` | 9.72:1 | 4.5:1 |
| dark | `muted-foreground` | `surface` | 8.90:1 | 4.5:1 |
| dark | `muted-foreground` | `muted` | 6.97:1 | 4.5:1 |
| dark | `primary-foreground` | `primary` | 9.36:1 | 4.5:1 |
| dark | `primary-foreground` | `primary-hover` | 11.04:1 | 4.5:1 |
| dark | `primary-foreground` | `primary-pressed` | 7.40:1 | 4.5:1 |
| dark | `secondary-foreground` | `secondary` | 10.64:1 | 4.5:1 |
| dark | `accent-foreground` | `accent` | 7.60:1 | 4.5:1 |
| dark | `link` | `surface` | 10.61:1 | 4.5:1 |
| dark | `link` | `background` | 11.58:1 | 4.5:1 |
| dark | `destructive-foreground` | `destructive` | 9.55:1 | 4.5:1 |
| dark | `destructive-foreground` | `destructive-hover` | 11.07:1 | 4.5:1 |
| dark | `success` | `success-bg` | 8.07:1 | 4.5:1 |
| dark | `warning` | `warning-bg` | 8.31:1 | 4.5:1 |
| dark | `danger` | `danger-bg` | 7.90:1 | 4.5:1 |
| dark | `info` | `info-bg` | 7.40:1 | 4.5:1 |
| dark | `neutral-status` | `neutral-status-bg` | 7.61:1 | 4.5:1 |
| dark | `sidebar-foreground` | `sidebar` | 13.05:1 | 4.5:1 |
| dark | `sidebar-accent-foreground` | `sidebar-accent` | 7.60:1 | 4.5:1 |
| dark | `selection-foreground` | `selection` | 7.63:1 | 4.5:1 |
| dark | `input-border` | `surface` | 4.71:1 | 3:1 |
| dark | `input-border` | `background` | 5.15:1 | 3:1 |
| dark | `ring` | `surface` | 8.99:1 | 3:1 |
| dark | `ring` | `background` | 9.82:1 | 3:1 |
| dark | `ring` | `muted` | 7.04:1 | 3:1 |
| dark | `ring` | `sidebar` | 9.08:1 | 3:1 |
| dark | `chart-1` | `surface` | 8.99:1 | 3:1 |
| dark | `chart-2` | `surface` | 9.61:1 | 3:1 |
| dark | `chart-3` | `surface` | 7.89:1 | 3:1 |
| dark | `chart-4` | `surface` | 9.55:1 | 3:1 |
| dark | `chart-5` | `surface` | 8.45:1 | 3:1 |
| dark | `chart-6` | `surface` | 8.91:1 | 3:1 |
| dark | `foreground` | `surface-hover` | 11.50:1 | 4.5:1 |
| dark | `foreground` | `muted` | 11.67:1 | 4.5:1 |
| dark | `secondary-foreground` | `surface-hover` | 10.49:1 | 4.5:1 |
| dark | `danger` | `surface` | 9.52:1 | 4.5:1 |
| dark | `danger` | `background` | 10.39:1 | 4.5:1 |
| dark | `ring` | `accent` | 5.85:1 | 3:1 |
| dark | `input-border` | `surface-hover` | 3.64:1 | 3:1 |
| dark | `input-border` | `muted` | 3.69:1 | 3:1 |
| dark | `input-border` | `accent` | 3.07:1 | 3:1 |
