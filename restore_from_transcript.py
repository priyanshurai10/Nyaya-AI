"""
Scan transcript for write_to_file and replace_file_content tool calls
targeting the broken files. Extract the LAST successful CodeContent
or ReplacementContent written to each file.
"""
import os
import json
import re

transcript_path = r'C:\Users\priya\.gemini\antigravity\brain\6ca68ca6-f778-4a2d-8629-11407db7e169\.system_generated\logs\transcript.jsonl'

targets = {
    'agents/page.tsx': r'src\app\agents\page.tsx',
    'case-builder/page.tsx': r'src\app\case-builder\page.tsx',
    'document-generator/page.tsx': r'src\app\document-generator\page.tsx',
    'drafts/page.tsx': r'src\app\drafts\page.tsx',
    'emergency/page.tsx': r'src\app\emergency\page.tsx',
    'journey/page.tsx': r'src\app\journey\page.tsx',
    'judge-simulator/page.tsx': r'src\app\judge-simulator\page.tsx',
    'map/page.tsx': r'src\app\map\page.tsx',
    'observability/page.tsx': r'src\app\observability\page.tsx',
    'research/page.tsx': r'src\app\research\page.tsx',
    'risk/page.tsx': r'src\app\risk\page.tsx',
    'strategy/page.tsx': r'src\app\strategy\page.tsx',
}

# Collect last write for each file
last_write = {}

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f):
        try:
            step = json.loads(line)
            if 'tool_calls' not in step:
                continue
            for tc in step['tool_calls']:
                tool_name = tc.get('tool_name', '')
                args = tc.get('args', {})
                
                if tool_name == 'write_to_file':
                    target_file = args.get('TargetFile', '')
                    code = args.get('CodeContent', '')
                    if code and any(k in target_file for k in targets.keys()):
                        for k, v in targets.items():
                            if k in target_file:
                                last_write[k] = code
                                break
        except Exception:
            pass

print("Files found in transcript write_to_file calls:")
for k, v in last_write.items():
    print(f"  {k}: {len(v)} chars")

# Now look for files NOT found via write_to_file
missing = [k for k in targets.keys() if k not in last_write]
print(f"\nMissing (no write_to_file found): {missing}")
print("These were likely created by Python scripts, not direct write_to_file calls.")

# Write the ones we found
base = r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\src\app'
for k, code in last_write.items():
    path = os.path.join(base, k.replace('/', '\\'))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as out_f:
        out_f.write(code)
    print(f"Restored: {k}")

print("\nDone!")
