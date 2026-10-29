"""Read-only website documentation/design checks; --write refreshes current-validation.md.
Run: python3 docs/design/validate.py --write
No application, cloud, or dependency changes. Python standard library only.
"""
from pathlib import Path
import argparse
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
DESIGN = ROOT / 'docs/design'

def luminance(color):
    channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in channels]
    return sum(a * b for a, b in zip(linear, [0.2126, 0.7152, 0.0722]))

def contrast(a, b):
    lower, upper = sorted([luminance(a), luminance(b)])
    return (upper + 0.05) / (lower + 0.05)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    tokens = json.loads((DESIGN / 'tokens.json').read_text())
    assert set(tokens['themes']['light']) == set(tokens['themes']['dark']), 'Theme roles differ'
    roles = set(tokens['themes']['light'])
    for stroke in tokens['strokes'].values():
        assert stroke['width'] in [0, 1, 2], 'Unknown stroke width'
        if stroke['width']:
            assert stroke['colorRole'] in roles and stroke['style'] in ['solid', 'dashed']
    assert tokens['focus']['colorRole'] in roles
    for name, size in tokens['componentSizes'].items():
        if 'radius' in size:
            assert size['radius'] in tokens['radii'], (name, 'unknown radius')
        if 'stroke' in size:
            assert size['stroke'] in tokens['strokes'], (name, 'unknown stroke')
        for target in ['hitHeight', 'hitWidth']:
            if target in size:
                assert size[target] >= 44, (name, 'undersized target')
    for name, recipe in tokens['componentPaints'].items():
        for state in ['default', 'hover', 'pressed']:
            if state not in recipe:
                continue
            paint = recipe[state]
            assert paint['backgroundRole'] in roles | {'transparent'}, (name, state)
            assert paint['foregroundRole'] in roles, (name, state)
            assert paint['stroke'] in tokens['strokes'], (name, state)
    assert tokens['componentSizes']['buttonStandard']['minHeight'] == tokens['geometry']['primaryControlHeight']
    assert tokens['componentSizes']['input']['minHeight'] == tokens['geometry']['controlHeight']
    assert tokens['componentSizes']['table']['rowMinHeight'] == tokens['geometry']['tableRowMin']
    css = (ROOT / 'app/globals.css').read_text()
    for mode, selector in [('light', ':root'), ('dark', '.dark')]:
        block = re.search(re.escape(selector) + r'(?:,\s*\.light)?\s*\{([^}]+)\}', css).group(1)
        actual = dict(re.findall(r'--([\w-]+):\s*([^;]+);', block))
        for name, value in tokens['cssVariables'][mode].items():
            if name in ['font-sans', 'font-mono']:
                assert 'var(--font-geist-' in actual[name], (mode, name)
            else:
                assert actual[name].strip() == value, (mode, name, 'CSS/token drift')
    pairs = []
    gaps = []
    for mode, colors in tokens['themes'].items():
        for role, value in colors.items():
            assert re.fullmatch(r'#[0-9A-Fa-f]{6}', value), (role, value)
        for p in tokens['contrastPairs']:
            value = contrast(colors[p['foreground']], colors[p['background']])
            if value < p['minimum']:
                gaps.append((mode, p['foreground'], p['background'], value, p['minimum']))
            pairs.append((mode, p['foreground'], p['background'], value, p['minimum']))
    screen_doc = (DESIGN / 'screens.md').read_text()
    screen_ids = re.findall(r'^\| (UI-\d{3}) ', screen_doc, re.M)
    assert screen_ids == [f'UI-{i:03}' for i in range(1, 74)], 'Screen inventory missing/duplicate ID'
    phase_doc = (DESIGN / 'phase-coverage.md').read_text()
    phase_ids = re.findall(r'^\| \[(F\d{3})\]', phase_doc, re.M)
    expected = [f'F{i:03}' for i in range(1, 152)]
    assert phase_ids == expected, 'Phase coverage missing/duplicate ID'
    # Native feature references remain traceable but do not require an absent old root plan.
    for feature in ['F004', 'F006', 'F007', 'F025', 'F029', 'F145', 'F146', 'F147']:
        row = next(line for line in phase_doc.splitlines() if line.startswith(f'| [{feature}]'))
        assert 'Superseded:' in row or 'Retired:' in row, (feature, 'native scope is still active')
    coverage = (ROOT / 'docs/planning/coverage.md').read_text()
    canonical_ids = re.findall(r'^\| ((?:PLT|CRM|WRK|TIM|FIN|INS|INT|NFR)-\d{3}) ', coverage, re.M)
    assert len(canonical_ids) == len(set(canonical_ids)), 'Duplicate coverage IDs'
    family_sources = {
        'PLT': 'platform-and-workspaces', 'CRM': 'client-lifecycle', 'WRK': 'work-management',
        'TIM': 'time-and-productivity', 'FIN': 'finance', 'INS': 'insights-and-knowledge',
        'INT': 'integrations-and-automation',
    }
    definitions = set()
    for family, source in {**family_sources, 'NFR': '../product/requirements'}.items():
        source_text = (ROOT / 'docs/specs' / (source + '.md')).read_text()
        definitions.update(re.findall(r'^\| (' + family + r'-\d{3}) \|', source_text, re.M))
        definitions.update(re.findall(r'^## (' + family + r'-\d{3}) —', source_text, re.M))
    assert set(canonical_ids) == definitions, 'Coverage differs from current requirement definitions'
    assert len(definitions) == 143, 'Expected retained requirements plus NFR-016–019'
    assert set(re.findall(r'UI-\d{3}', phase_doc)) <= set(screen_ids), 'Unknown UI-ID in phase map'
    checked_links = 0
    historical_count = 0
    paths = [ROOT / name for name in ['README.md', 'PRODUCT.md', 'DESIGN.md', 'AGENTS.md']]
    paths += sorted((ROOT / 'docs').rglob('*.md'))
    for path in paths:
        body = path.read_text()
        historical = ((path.parent.name in ['features', 'qa'] and path.name != 'README.md')
                      or path in [DESIGN / 'review.md', DESIGN / 'validation.md'])
        if historical:
            assert '**Historical ' in body, f'Unmarked historical record: {path}'
            # Preserve old missing-source references; validate the current notice links only.
            body = body.split('\n\n')[1]
            historical_count += 1
        for link in re.findall(r'\]\(([^)]+)\)', body):
            if '://' in link or link.startswith('#'):
                continue
            target = (path.parent / link.split('#')[0]).resolve()
            if target == DESIGN / 'current-validation.md' and args.write and not target.exists():
                continue
            assert target.exists(), f'Broken link: {path.relative_to(ROOT)} -> {link}'
            checked_links += 1
    html = (DESIGN / 'reference.html').read_text()
    assert '__TOKENS__' not in html and '__JSON__' not in html
    match = re.search(r'<script>([\s\S]*?)</script>', html)
    assert match, 'Reference script missing'
    # Parse without executing browser logic or installing a tool.
    subprocess.run(['node', '-e', "new (require('node:vm').Script)(require('node:fs').readFileSync(0,'utf8'));"], input=match[1], text=True, check=True, cwd=ROOT)
    assert (ROOT / 'public/solodesk_no_bg_no_text.png').exists()
    summary = (f'{len(pairs) - len(gaps)}/{len(pairs)} declared contrast pairs pass; {len(gaps)} contrast gaps; '
               f'{len(tokens["componentSizes"])} component size '
               f'recipes and {len(tokens["componentPaints"])} appearance recipes consistent; '
               f'{len(screen_ids)} screen families; {len(phase_ids)} retained feature references with native '
               f'entries superseded/retired; {len(definitions)} requirements match coverage; '
               f'{checked_links} current local links; {historical_count} historical notices; reference JavaScript syntax valid.')
    print(summary)
    for mode, fg, bg, value, minimum in gaps:
        print(f'GAP {mode}: {fg} on {bg}: {value:.2f}:1 < {minimum}:1')
    if args.write:
        report = '# Current website documentation validation\n\n'
        report += 'Checked 29 October 2026. Scope: current documentation, token recipes, requirement coverage and reference script syntax. This is not application, browser-interaction or security test evidence.\n\n'
        report += 'Run `python3 docs/design/validate.py` from the repository root. `--write` refreshes this report using only executed source checks; it never rewrites [historical validation](validation.md). Uses Python standard library and Node script parsing without installing packages or contacting services.\n\n'
        report += summary + '\n\n'
        report += 'Local links in active Markdown and current historical notices are checked. Original absent-source references inside historical records are preserved and excluded; these are not current navigation/setup instructions. Feature counts retain stable references and do not claim implementation. Runtime CSS owns the current theme; the old HTML reference is historical. Contrast gaps remain release-review evidence.\n\n'
        report += 'Not run: website/business tests, live Neon/Better Auth integration, browser interaction/screenshots, screen readers, fluent Arabic review, PDF output, load/deployment or service recovery. No integration was installed/provisioned. Historical screenshots and results do not satisfy these gates.\n\n'
        report += '## Declared contrast pairs\n\nNamed role pairs only; WCAG luminance comparison of rounded sRGB token mirrors, rounded display. Alpha compositing is not simulated. This does not certify all website accessibility.\n\n'
        report += '| Theme | Foreground | Background | Ratio | Required |\n| --- | --- | --- | --- | --- |\n'
        report += ''.join(f'| {mode} | `{fg}` | `{bg}` | {value:.2f}:1 | {minimum}:1 |\n'
                          for mode, fg, bg, value, minimum in pairs)
        (DESIGN / 'current-validation.md').write_text(report)

    if gaps:
        raise SystemExit(1)

if __name__ == '__main__':
    main()
