import os
import re

pack_files = [
    r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\.next\cache\webpack\client-production\0.pack',
    r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\.next\cache\webpack\server-production\0.pack',
    r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\.next\cache\webpack\server-production\5.pack'
]

targets = ['agents/page', 'emergency/page', 'journey/page', 'observability/page', 'research/page', 'risk/page', 'strategy/page', 'map/page']

for pf in pack_files:
    if not os.path.exists(pf):
        continue
    with open(pf, 'rb') as f:
        data = f.read().decode('utf-8', errors='ignore')
    print(f"\nPack: {pf}")
    for target in targets:
        matches = [m.start() for m in re.finditer(re.escape(target), data)]
        if matches:
            print(f"  Found '{target}' at {len(matches)} positions: {matches[:3]}")
            # Print search area for the first match
            pos = matches[0]
            print(f"    Sample: {repr(data[pos-50:pos+150])}")
