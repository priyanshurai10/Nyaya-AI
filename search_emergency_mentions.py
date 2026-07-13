import json

transcript_path = r'C:\Users\priya\.gemini\antigravity\brain\6ca68ca6-f778-4a2d-8629-11407db7e169\.system_generated\logs\transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_no, line in enumerate(f, 1):
        try:
            step = json.loads(line)
            serialized = json.dumps(step)
            if 'emergency' in serialized:
                # print some details about the step
                print(f"Step {line_no} ({step.get('type')}): contains 'emergency'")
                if 'tool_calls' in step:
                    for tc in step['tool_calls']:
                        if 'emergency' in json.dumps(tc):
                            print(f"  Tool Call: {tc['name']} with args keys: {list(tc.get('args', {}).keys())}")
        except Exception:
            pass
