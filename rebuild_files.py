import json
import re
import os

transcript_path = r'C:\Users\priya\.gemini\antigravity\brain\6ca68ca6-f778-4a2d-8629-11407db7e169\.system_generated\logs\transcript_full.jsonl'

# Mapping of file path to dict of {line_number: content}
file_lines = {}

# We also scan for write_to_file tool calls
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
        except Exception:
            continue
            
        # 1. Check for VIEW_FILE step responses
        if step.get('type') == 'VIEW_FILE' and step.get('content'):
            content = step['content']
            # Find file path in content
            path_match = re.search(r'File Path:\s+`file:///(.*?)`', content)
            if not path_match:
                path_match = re.search(r'File Path:\s+`(.*?)`', content)
            if path_match:
                file_path = path_match.group(1).replace('/', '\\')
                if ':' not in file_path:
                    # Linux style path without drive letter, but we are on Windows
                    pass
                else:
                    # Windows absolute path
                    # E.g. C:\Users\priya...
                    pass
                
                # Check if it contains line numbers
                lines = content.split('\n')
                for l in lines:
                    m = re.match(r'^(\d+):\s(.*)', l)
                    if m:
                        line_num = int(m.group(1))
                        line_content = m.group(2)
                        if file_path not in file_lines:
                            file_lines[file_path] = {}
                        file_lines[file_path][line_num] = line_content

        # 2. Check for write_to_file or replace_file_content in PLANNER_RESPONSE
        if step.get('type') == 'PLANNER_RESPONSE' and step.get('tool_calls'):
            for tc in step['tool_calls']:
                if tc.get('name') == 'write_to_file':
                    args = tc.get('args', {})
                    tf = args.get('TargetFile')
                    content = args.get('CodeContent')
                    if tf and content:
                        tf_clean = tf.replace('/', '\\')
                        if tf_clean.startswith('file:\\\\\\'):
                            tf_clean = tf_clean[8:]
                        # Store whole content
                        file_lines[tf_clean] = {i+1: l for i, l in enumerate(content.split('\n'))}

print(f"Reconstructed paths: {list(file_lines.keys())}")

# Overwrite files with their last reconstructed states
for path, lines_dict in file_lines.items():
    if not os.path.exists(path) and not path.endswith('.tsx') and not path.endswith('.ts'):
        # Only restore active source code files
        continue
        
    max_line = max(lines_dict.keys())
    reconstructed_content = []
    for i in range(1, max_line + 1):
        reconstructed_content.append(lines_dict.get(i, ''))
        
    full_text = '\n'.join(reconstructed_content)
    
    # Check if we should restore this file
    # We only restore the ones corrupted by theme script
    filename = os.path.basename(path)
    if 'nyaya-ai\\src' in path:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        print(f"Restored: {path} ({max_line} lines)")

print("Restore operation completed!")
