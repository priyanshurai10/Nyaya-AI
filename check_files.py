import os

files = [
    'src/app/agents/page.tsx',
    'src/app/case-builder/page.tsx', 
    'src/app/document-generator/page.tsx',
    'src/app/drafts/page.tsx',
    'src/app/emergency/page.tsx',
    'src/app/journey/page.tsx',
    'src/app/judge-simulator/page.tsx',
    'src/app/map/page.tsx',
    'src/app/observability/page.tsx',
    'src/app/research/page.tsx',
    'src/app/risk/page.tsx',
    'src/app/strategy/page.tsx',
]
for f in files:
    with open(f, encoding='utf-8') as fh:
        c = fh.read()
    has_use_client = "'use client'" in c or '"use client"' in c
    has_export_default = "export default" in c
    first_line = c.split('\n')[0][:80] if c else "(empty)"
    print(f"{f}: {len(c)} chars | 'use client': {has_use_client} | export default: {has_export_default}")
    print(f"  first line: {first_line}")
