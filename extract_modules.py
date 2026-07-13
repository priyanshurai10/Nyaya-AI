import os
import re

pack_files = [
    r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\.next\cache\webpack\client-production\0.pack',
    r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\.next\cache\webpack\server-production\0.pack',
    r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\.next\cache\webpack\server-production\5.pack'
]

# We search for module paths
targets = {
    'translations.ts': ['./src/lib/translations.ts', 'src/lib/translations.ts', 'translations.ts'],
    'api-client.ts': ['./src/lib/api-client.ts', 'src/lib/api-client.ts', 'api-client.ts'],
    'LocationContext.tsx': ['./src/context/LocationContext.tsx', 'src/context/LocationContext.tsx', 'LocationContext.tsx']
}

for pf in pack_files:
    if not os.path.exists(pf):
        continue
    print(f"\nProcessing pack: {pf}")
    with open(pf, 'rb') as f:
        data = f.read().decode('utf-8', errors='ignore')
        
    for name, patterns in targets.items():
        for pat in patterns:
            matches = [m.start() for m in re.finditer(re.escape(pat), data)]
            if matches:
                print(f"  Found '{pat}' matches: {matches}")
                # For each match, let's extract a block and write it out
                for i, pos in enumerate(matches):
                    # We look for where the code starts and ends.
                    # Usually it's inside quotes or followed by function/object declarations.
                    block = data[pos - 50:pos + 80000]
                    # Write to a file
                    out_path = f"extracted_{name}_{i}.txt"
                    with open(out_path, 'w', encoding='utf-8') as out_f:
                        out_f.write(block)
                    print(f"    Saved {out_path} (size: {len(block)} chars)")
