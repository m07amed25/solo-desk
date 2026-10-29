# Current website documentation validation

Checked 29 October 2026. Scope: current documentation, token recipes, requirement coverage and reference script syntax. This is not application, browser-interaction or security test evidence.

Run `python3 docs/design/validate.py` from the repository root. `--write` refreshes this report using only executed source checks; it never rewrites [historical validation](validation.md). Uses Python standard library and Node script parsing without installing packages or contacting services.

72/88 declared contrast pairs pass; 16 contrast gaps; 25 component size recipes and 9 appearance recipes consistent; 73 screen families; 151 retained feature references with native entries superseded/retired; 143 requirements match coverage; 889 current local links; 30 historical notices; reference JavaScript syntax valid.

Local links in active Markdown and current historical notices are checked. Original absent-source references inside historical records are preserved and excluded; these are not current navigation/setup instructions. Feature counts retain stable references and do not claim implementation. Runtime CSS owns the current theme; the old HTML reference is historical. Contrast gaps remain release-review evidence.

Not run: website/business tests, live Neon/Better Auth integration, browser interaction/screenshots, screen readers, fluent Arabic review, PDF output, load/deployment or service recovery. No integration was installed/provisioned. Historical screenshots and results do not satisfy these gates.

## Declared contrast pairs

Named role pairs only; WCAG luminance comparison of rounded sRGB token mirrors, rounded display. Alpha compositing is not simulated. This does not certify all website accessibility.

| Theme | Foreground | Background | Ratio | Required |
| --- | --- | --- | --- | --- |
| light | `foreground` | `background` | 20.47:1 | 4.5:1 |
| light | `foreground` | `surface` | 21.00:1 | 4.5:1 |
| light | `foreground` | `surface-subtle` | 19.26:1 | 4.5:1 |
| light | `muted-foreground` | `background` | 7.62:1 | 4.5:1 |
| light | `muted-foreground` | `surface` | 7.81:1 | 4.5:1 |
| light | `muted-foreground` | `muted` | 7.17:1 | 4.5:1 |
| light | `primary-foreground` | `primary` | 21.00:1 | 4.5:1 |
| light | `primary-foreground` | `primary-hover` | 21.00:1 | 4.5:1 |
| light | `primary-foreground` | `primary-pressed` | 21.00:1 | 4.5:1 |
| light | `secondary-foreground` | `secondary` | 17.62:1 | 4.5:1 |
| light | `accent-foreground` | `accent` | 17.62:1 | 4.5:1 |
| light | `link` | `surface` | 21.00:1 | 4.5:1 |
| light | `link` | `background` | 20.47:1 | 4.5:1 |
| light | `destructive-foreground` | `destructive` | 3.85:1 | 4.5:1 |
| light | `destructive-foreground` | `destructive-hover` | 3.85:1 | 4.5:1 |
| light | `success` | `success-bg` | 19.26:1 | 4.5:1 |
| light | `warning` | `warning-bg` | 19.26:1 | 4.5:1 |
| light | `danger` | `danger-bg` | 19.26:1 | 4.5:1 |
| light | `info` | `info-bg` | 19.26:1 | 4.5:1 |
| light | `neutral-status` | `neutral-status-bg` | 7.17:1 | 4.5:1 |
| light | `sidebar-foreground` | `sidebar` | 20.47:1 | 4.5:1 |
| light | `sidebar-accent-foreground` | `sidebar-accent` | 17.62:1 | 4.5:1 |
| light | `selection-foreground` | `selection` | 21.00:1 | 4.5:1 |
| light | `input-border` | `surface` | 1.19:1 | 3:1 |
| light | `input-border` | `background` | 1.16:1 | 3:1 |
| light | `ring` | `surface` | 21.00:1 | 3:1 |
| light | `ring` | `background` | 20.47:1 | 3:1 |
| light | `ring` | `muted` | 19.26:1 | 3:1 |
| light | `ring` | `sidebar` | 20.47:1 | 3:1 |
| light | `chart-1` | `surface` | 1.86:1 | 3:1 |
| light | `chart-2` | `surface` | 5.12:1 | 3:1 |
| light | `chart-3` | `surface` | 2.49:1 | 3:1 |
| light | `chart-4` | `surface` | 1.27:1 | 3:1 |
| light | `chart-5` | `surface` | 4.67:1 | 3:1 |
| light | `chart-6` | `surface` | 4.67:1 | 3:1 |
| light | `foreground` | `surface-hover` | 17.62:1 | 4.5:1 |
| light | `foreground` | `muted` | 19.26:1 | 4.5:1 |
| light | `secondary-foreground` | `surface-hover` | 17.62:1 | 4.5:1 |
| light | `danger` | `surface` | 21.00:1 | 4.5:1 |
| light | `danger` | `background` | 20.47:1 | 4.5:1 |
| light | `ring` | `accent` | 17.62:1 | 3:1 |
| light | `input-border` | `surface-hover` | 1.00:1 | 3:1 |
| light | `input-border` | `muted` | 1.09:1 | 3:1 |
| light | `input-border` | `accent` | 1.00:1 | 3:1 |
| dark | `foreground` | `background` | 21.00:1 | 4.5:1 |
| dark | `foreground` | `surface` | 19.91:1 | 4.5:1 |
| dark | `foreground` | `surface-subtle` | 16.86:1 | 4.5:1 |
| dark | `muted-foreground` | `background` | 8.42:1 | 4.5:1 |
| dark | `muted-foreground` | `surface` | 7.99:1 | 4.5:1 |
| dark | `muted-foreground` | `muted` | 6.76:1 | 4.5:1 |
| dark | `primary-foreground` | `primary` | 21.00:1 | 4.5:1 |
| dark | `primary-foreground` | `primary-hover` | 21.00:1 | 4.5:1 |
| dark | `primary-foreground` | `primary-pressed` | 21.00:1 | 4.5:1 |
| dark | `secondary-foreground` | `secondary` | 15.91:1 | 4.5:1 |
| dark | `accent-foreground` | `accent` | 12.63:1 | 4.5:1 |
| dark | `link` | `surface` | 19.91:1 | 4.5:1 |
| dark | `link` | `background` | 21.00:1 | 4.5:1 |
| dark | `destructive-foreground` | `destructive` | 6.90:1 | 4.5:1 |
| dark | `destructive-foreground` | `destructive-hover` | 6.90:1 | 4.5:1 |
| dark | `success` | `success-bg` | 16.86:1 | 4.5:1 |
| dark | `warning` | `warning-bg` | 16.86:1 | 4.5:1 |
| dark | `danger` | `danger-bg` | 16.86:1 | 4.5:1 |
| dark | `info` | `info-bg` | 16.86:1 | 4.5:1 |
| dark | `neutral-status` | `neutral-status-bg` | 6.76:1 | 4.5:1 |
| dark | `sidebar-foreground` | `sidebar` | 18.73:1 | 4.5:1 |
| dark | `sidebar-accent-foreground` | `sidebar-accent` | 12.63:1 | 4.5:1 |
| dark | `selection-foreground` | `selection` | 21.00:1 | 4.5:1 |
| dark | `input-border` | `surface` | 1.58:1 | 3:1 |
| dark | `input-border` | `background` | 1.66:1 | 3:1 |
| dark | `ring` | `surface` | 7.99:1 | 3:1 |
| dark | `ring` | `background` | 8.42:1 | 3:1 |
| dark | `ring` | `muted` | 6.76:1 | 3:1 |
| dark | `ring` | `sidebar` | 7.52:1 | 3:1 |
| dark | `chart-1` | `surface` | 10.72:1 | 3:1 |
| dark | `chart-2` | `surface` | 4.50:1 | 3:1 |
| dark | `chart-3` | `surface` | 4.26:1 | 3:1 |
| dark | `chart-4` | `surface` | 2.55:1 | 3:1 |
| dark | `chart-5` | `surface` | 15.66:1 | 3:1 |
| dark | `chart-6` | `surface` | 15.66:1 | 3:1 |
| dark | `foreground` | `surface-hover` | 12.63:1 | 4.5:1 |
| dark | `foreground` | `muted` | 16.86:1 | 4.5:1 |
| dark | `secondary-foreground` | `surface-hover` | 12.63:1 | 4.5:1 |
| dark | `danger` | `surface` | 19.91:1 | 4.5:1 |
| dark | `danger` | `background` | 21.00:1 | 4.5:1 |
| dark | `ring` | `accent` | 5.07:1 | 3:1 |
| dark | `input-border` | `surface-hover` | 1.00:1 | 3:1 |
| dark | `input-border` | `muted` | 1.33:1 | 3:1 |
| dark | `input-border` | `accent` | 1.00:1 | 3:1 |

## Public and account-entry runtime evidence — 30 October 2026

The 29 October documentation-only report and contrast table above are preserved as historical
evidence. This dated addition records the current public/account-entry presentation; it does
not close feature acceptance or the security release gate.

The local browser records in `.impeccable/review/browser-matrix.json` contain 24 landing cases
across English/Arabic, Light/Dark/System and 1440, 768, 390 and 320 CSS-pixel widths.
`account-matrix.json` contains 48 sign-in/sign-up cases across the same language/theme matrix
and desktop/tablet/narrow widths, including a 352px case. All 72 recorded rows have equal
document scroll/client widths, with no measured horizontal overflow. The landing records show
the correct language direction, loaded wordmark and expected computed Light/Dark foregrounds
and backgrounds. System was observed only on a dark OS preference.

`recapture-log.json` records replacement first-viewport captures; `context-log.json` records
overlapping landing frames covering English Dark and Arabic Light through their footers at
desktop/mobile widths. The current evidence directory contains 66 JPGs and no PNGs. The UI
reviewer inspected all 40 required first-viewport JPGs plus the overlapping context frames,
including the replaced Arabic Dark mobile sign-in header. `showcase-light.jpg` and
`showcase-dark.jpg` corroborate the repaired scoped black/white text. The review disposition
was **ship for public/account-entry UI only**, recorded in the local review artifact
`/tmp/solodesk-ui-review.md`; that temporary file is not durable release evidence. The
Impeccable detector was not rerun.

Source inspection confirms Dark by default; separate native language/theme POST forms;
Dark → Light → System cycling; English LTR/Arabic RTL; finite 8px controls/12px panels;
existing 44px Button `lg`/`icon-lg` targets; supplied public wordmark and provider SVG masks;
and explicit showcase Light/Dark isolation. The shared Input now uses a muted-foreground
boundary rather than the supplied input color for its border. This subsequent Input change
was outside the reviewer's visual disposition; its final runtime verification is recorded
separately by the implementation owner. The supplied input palette remains unchanged.

`python3 docs/design/validate.py` was rerun on 30 October without `--write`: exit **1**, with
the same **72/88 passing declared contrast pairs and 16 unresolved palette gaps**. Metadata,
CSS token consistency, component recipes, requirement coverage, local-link and reference
script checks completed; the current scan counted 888 local links. These rounded sRGB checks
still do not simulate compositing or establish runtime Input-state accessibility. No contrast
gap was reclassified as a pass. The broader component recipes in `tokens.json` remain
documentation recipes; `runtimeComponents` records the observed shared/public differences.
The pre-feature `.impeccable/design.json` remains stale and was preserved, not adopted as the
current implementation's design authority.

Still unrun: fluent human Arabic review; screen-reader review; 200% zoom; System with an OS
Light preference; failed-font/media behavior; five-person comprehension checks; isolated
OAuth/Neon/Better Auth journeys; production, load, recovery and deployment checks. Browser
geometry and screenshots do not prove these behaviors. Build/HTTP evidence and security
checks belong to the implementation/release records and are not inferred by this design pass.
