import os
import re

def strip_metadata_from_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if file has metadata phrases
    phrases = [
        "The above content shows the entire, complete file contents",
        "The above content does NOT show the entire file contents",
        "Please note that any changes targeting the original code should remove the line number"
    ]
    
    found = False
    for p in phrases:
        if p in content:
            found = True
            break
            
    if not found:
        return
        
    lines = content.split('\n')
    cleaned_lines = []
    
    # We also remove line number prefix if any exists like "1: 'use client';"
    line_num_re = re.compile(r'^\s*\d+:\s')
    
    for line in lines:
        # Check if line contains any of the phrases
        skip = False
        for p in phrases:
            if p in line:
                skip = True
                break
        if skip:
            print(f"  Skipping metadata line: {line[:50]}...")
            continue
            
        if line_num_re.match(line):
            cleaned_lines.append(line_num_re.sub('', line))
        else:
            cleaned_lines.append(line)
            
    new_content = '\n'.join(cleaned_lines)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Cleaned metadata and line numbers from: {file_path}")

# Scan src directory
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            strip_metadata_from_file(os.path.join(root, file))

print("Metadata stripping complete!")
