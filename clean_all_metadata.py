import os

files = [
    'src/app/agents/page.tsx',
    'src/app/case-builder/page.tsx',
    'src/app/document-generator/page.tsx',
    'src/app/emergency/page.tsx',
    'src/app/journey/page.tsx',
    'src/app/map/page.tsx',
    'src/app/observability/page.tsx'
]

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as fh:
            content = fh.read()
        markers = ["'use client'", '"use client"', 'import ', 'const ']
        best_pos = len(content)
        for marker in markers:
            pos = content.find(marker)
            if pos != -1 and pos < best_pos:
                best_pos = pos
        if best_pos < len(content):
            clean = content[best_pos:]
            with open(f, 'w', encoding='utf-8') as out_f:
                out_f.write(clean)
            print(f"Cleaned {f}: removed {best_pos} chars")
        else:
            print(f"No cleaning needed for {f}")
