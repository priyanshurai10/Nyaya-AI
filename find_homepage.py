import json
import re

transcript_path = r'C:\Users\priya\.gemini\antigravity\brain\6ca68ca6-f778-4a2d-8629-11407db7e169\.system_generated\logs\transcript_full.jsonl'

# Look for write_to_file targeting src/app/page.tsx or content containing home screen details
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            serialized = json.dumps(step)
            if 'src/app/page.tsx' in serialized or 'src\\app\\page.tsx' in serialized:
                # Let's see what's in here
                if 'tool_calls' in step:
                    for tc in step['tool_calls']:
                        if tc.get('name') == 'write_to_file' and 'page.tsx' in tc.get('args', {}).get('TargetFile', ''):
                            print("FOUND write_to_file for page.tsx:")
                            print(tc['args']['CodeContent'][:500] + "...")
                            print("---------------------------------")
        except Exception:
            pass
