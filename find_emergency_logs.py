import json

transcript_path = r'C:\Users\priya\.gemini\antigravity\brain\6ca68ca6-f778-4a2d-8629-11407db7e169\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            if 'tool_calls' in step:
                for tc in step['tool_calls']:
                    if tc.get('name') == 'write_to_file' and 'emergency' in tc.get('args', {}).get('TargetFile', ''):
                        print("FOUND write_to_file for emergency/page.tsx:")
                        print(tc['args']['CodeContent'][:500] + "...")
                        print("---------------------------------")
        except Exception:
            pass
