import json
import re
import os

brain_dir = r'C:\Users\priya\.gemini\antigravity\brain'

transcript_paths = []
for root, dirs, files in os.walk(brain_dir):
    for file in files:
        if file == 'transcript_full.jsonl':
            transcript_paths.append(os.path.join(root, file))

print(f"Found {len(transcript_paths)} transcript logs.")

# Mapping of file path to dict of {line_number: content}
file_lines = {}

for transcript_path in transcript_paths:
    # Print the name of the folder containing the log
    parts = transcript_path.split(os.sep)
    # The folder name is 3 levels up from transcript_full.jsonl:
    # .../brain/<folder_name>/.system_generated/logs/transcript_full.jsonl
    folder_name = parts[-4] if len(parts) >= 4 else "unknown"
    print(f"Reading log from folder: {folder_name}")
    
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
                    
                    # Check if it contains line numbers
                    lines = content.split('\n')
                    for l in lines:
                        m = re.match(r'^(\d+):\s(.*)', l)
                        if m:
                            line_num = int(m.group(1))
                            line_content = m.group(2)
                            if file_path not in file_lines:
                                file_lines[file_path] = {}
                            # We keep the one with the longest line content or just update
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
                            if tf_clean not in file_lines:
                                file_lines[tf_clean] = {}
                            for i, l in enumerate(content.split('\n')):
                                file_lines[tf_clean][i+1] = l

print(f"Reconstructed paths across all logs: {list(file_lines.keys())}")

# Overwrite files with their last reconstructed states
for path, lines_dict in file_lines.items():
    if not os.path.exists(path) and not path.endswith('.tsx') and not path.endswith('.ts'):
        continue
        
    max_line = max(lines_dict.keys())
    reconstructed_content = []
    for i in range(1, max_line + 1):
        reconstructed_content.append(lines_dict.get(i, ''))
        
    full_text = '\n'.join(reconstructed_content)
    
    # We only restore the ones corrupted in nyaya-ai/src
    if 'nyaya-ai\\src' in path:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        print(f"Restored: {path} ({max_line} lines)")

print("Global restore completed!")
