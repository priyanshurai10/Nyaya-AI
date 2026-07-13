import json
import os

transcript_path = r'C:\Users\priya\.gemini\antigravity\brain\6ca68ca6-f778-4a2d-8629-11407db7e169\.system_generated\logs\transcript_full.jsonl'

best_code = ""

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            if 'tool_calls' in step:
                for tc in step['tool_calls']:
                    if tc.get('name') == 'write_to_file' and 'src/app/page.tsx' in tc.get('args', {}).get('TargetFile', '').replace('\\', '/'):
                        code = tc['args']['CodeContent']
                        if 'RootLayout' not in code and len(code) > len(best_code):
                            best_code = code
        except Exception:
            pass

if best_code:
    with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(best_code)
    print(f"Restored page.tsx (homepage) with {len(best_code)} characters")
else:
    print("Could not find homepage code in logs")
