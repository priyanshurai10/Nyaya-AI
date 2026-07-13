import os
import json
import re

transcript_path = r'C:\Users\priya\.gemini\antigravity\brain\6ca68ca6-f778-4a2d-8629-11407db7e169\.system_generated\logs\transcript_full.jsonl'

targets = [
    'src/app/agents/page.tsx',
    'src/app/case-builder/page.tsx',
    'src/app/document-generator/page.tsx',
    'src/app/emergency/page.tsx',
    'src/app/journey/page.tsx',
    'src/app/map/page.tsx',
    'src/app/observability/page.tsx'
]

best_contents = {t: "" for t in targets}

def clean_extracted_code(code):
    # If the code block is wrapped in lines like:
    # 1: import ...
    # 2: ...
    # we need to clean up the line numbers!
    lines = code.split('\n')
    cleaned_lines = []
    line_num_re = re.compile(r'^\s*\d+:\s')
    for line in lines:
        if line_num_re.match(line):
            cleaned_lines.append(line_num_re.sub('', line))
        else:
            cleaned_lines.append(line)
    return '\n'.join(cleaned_lines)

# Read transcript_full.jsonl
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line_idx, line in enumerate(f):
        try:
            step = json.loads(line)
            # Search in tool_calls, content, or system messages
            serialized = json.dumps(step)
            for t in targets:
                if t in serialized:
                    # Look for code content blocks
                    # Let's search for substrings of code
                    # Usually found in tool responses for view_file or tool arguments for write_to_file / replace_file_content
                    # We look for strings starting with "import " or "const " and having React elements
                    # Let's extract any string values in the JSON object recursively
                    def extract_strings(obj):
                        res = []
                        if isinstance(obj, str):
                            res.append(obj)
                        elif isinstance(obj, dict):
                            for v in obj.values():
                                res.extend(extract_strings(v))
                        elif isinstance(obj, list):
                            for v in obj:
                                res.extend(extract_strings(v))
                        return res
                    
                    for s in extract_strings(step):
                        if 'import ' in s and ('export default' in s or 'export function' in s or 'const ' in s):
                            # Skip webpack boilerplates
                            if '__next_app_require__' in s or 'AppPageRouteModule' in s:
                                continue
                            
                            cleaned = clean_extracted_code(s)
                            if len(cleaned) > len(best_contents[t]):
                                best_contents[t] = cleaned
                                
        except Exception as e:
            pass

# Write the best found code blocks to files
for t, code in best_contents.items():
    if code:
        path = os.path.join(r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai', t.replace('/', '\\'))
        # Create directories if they do not exist
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as out_f:
            out_f.write(code)
        print(f"Restored from logs: {t} ({len(code)} characters)")
    else:
        print(f"Could not restore from logs: {t}")

print("Done!")
