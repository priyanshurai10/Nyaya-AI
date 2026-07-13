import os
import re

# Files with "Created At:" metadata prefix - strip until 'use client' or first import
metadata_files = [
    'src/app/agents/page.tsx',
    'src/app/case-builder/page.tsx',
    'src/app/emergency/page.tsx',
]

for f in metadata_files:
    with open(f, encoding='utf-8') as fh:
        content = fh.read()
    
    # Find the actual code start
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
        print(f"Cleaned metadata from {f}: removed {best_pos} chars of header")
    else:
        print(f"WARNING: Could not find code start in {f}")

print("\nDone cleaning metadata files!")
