import json

transcript_path = r'C:\Users\priya\.gemini\antigravity\brain\6ca68ca6-f778-4a2d-8629-11407db7e169\.system_generated\logs\transcript.jsonl'

modified_files = set()

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            if 'tool_calls' in step:
                for tc in step['tool_calls']:
                    args = tc.get('args', {})
                    if 'TargetFile' in args:
                        modified_files.add(args['TargetFile'])
        except Exception:
            pass

print("Modified files in transcript:")
for f in sorted(modified_files):
    print(f"  {f}")
