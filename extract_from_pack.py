import os
import re

pack_files = [
    r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\.next\cache\webpack\client-production\0.pack',
    r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\.next\cache\webpack\server-production\0.pack',
    r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\.next\cache\webpack\server-production\5.pack'
]

for pf in pack_files:
    if not os.path.exists(pf):
        print(f"Not found: {pf}")
        continue
    print(f"Reading: {pf}")
    with open(pf, 'rb') as f:
        data = f.read().decode('utf-8', errors='ignore')
        
    # Search for translations keywords
    for key in ['mktEmailInvoiceBtn', 'apiClient', 'useLocation']:
        matches = [m.start() for m in re.finditer(key, data)]
        print(f"  Keyword '{key}' matches count: {len(matches)}")
        for idx, pos in enumerate(matches[:5]):
            # Extract surrounding block
            start = max(0, pos - 2000)
            end = min(len(data), pos + 10000)
            chunk = data[start:end]
            
            # Save chunk to verify
            out_name = f"extracted_{key}_{idx}.txt"
            with open(out_name, 'w', encoding='utf-8') as out_f:
                out_f.write(chunk)
            print(f"    Saved block to {out_name}")
