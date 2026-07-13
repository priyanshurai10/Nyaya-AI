import os
import glob
import re

app_dir = r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\src'
tsx_files = glob.glob(f'{app_dir}/**/*.tsx', recursive=True)

print(f"Cleaning duplicate/conflicting Tailwind classes in {len(tsx_files)} files...")

def resolve_classes(classes_str):
    # Split by whitespace
    classes = classes_str.split()
    
    seen_prefixes = {}
    cleaned_classes = []
    
    # Priority groups: if multiple classes exist in these groups, keep the first one
    prefixes = ['dark:bg-', 'dark:text-', 'dark:border-', 'bg-', 'text-', 'border-']
    
    # But wait, what if 'text-center' and 'text-white' both exist? We shouldn't remove text-center.
    # Tailwind classes are complex. We specifically only want to resolve conflicts introduced by our script:
    # Multiple dark:text-colors or dark:bg-colors.
    
    # Let's just find and remove the exact strings added by the bad script if there was already a valid one.
    # Wait, the simplest way is to remove duplicate classes EXACTLY matching (e.g. `dark:text-white dark:text-white`)
    # And specifically remove `dark:bg-[#111827]` if there is another `dark:bg-` in the same string.
    # Same for text, border etc.
    
    for c in classes:
        # Check for duplicates exactly
        if c in cleaned_classes:
            continue
            
        cleaned_classes.append(c)
        
    # Now resolve specific known conflicts created by the previous script
    final_classes = []
    has_dark_bg = any(c.startswith('dark:bg-') and c not in ['dark:bg-[#111827]', 'dark:bg-[#0B1220]', 'dark:bg-[#1F2937]'] for c in cleaned_classes)
    has_dark_text = any(c.startswith('dark:text-') and c not in ['dark:text-white', 'dark:text-white/90', 'dark:text-white/80', 'dark:text-white/70', 'dark:text-white/60', 'dark:text-white/55', 'dark:text-white/50', 'dark:text-white/40', 'dark:text-white/30'] for c in cleaned_classes)
    
    # Actually, we can just say: if there are TWO dark:bg- classes, remove the one added by the script.
    
    bad_dark_bgs = ['dark:bg-[#111827]', 'dark:bg-[#0B1220]', 'dark:bg-[#1F2937]']
    bad_dark_texts = ['dark:text-white', 'dark:text-white/90', 'dark:text-white/80', 'dark:text-white/70', 'dark:text-white/60', 'dark:text-white/55', 'dark:text-white/50', 'dark:text-white/40', 'dark:text-white/30']
    bad_dark_borders = ['dark:border-white/5']
    
    for c in cleaned_classes:
        if c in bad_dark_bgs:
            # check if there's another dark:bg-
            others = [x for x in cleaned_classes if x.startswith('dark:bg-') and x != c]
            if others:
                continue # drop the bad one
        if c in bad_dark_texts:
            others = [x for x in cleaned_classes if x.startswith('dark:text-') and x != c]
            if others:
                continue # drop the bad one
        if c in bad_dark_borders:
            others = [x for x in cleaned_classes if x.startswith('dark:border-') and x != c]
            if others:
                continue
                
        final_classes.append(c)
        
    return ' '.join(final_classes)

for file_path in tsx_files:
    if 'node_modules' in file_path or '.next' in file_path:
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    orig_content = content
    
    def replace_class_name(match):
        classes_str = match.group(1)
        # We need to not mess up template literals if they have complex logic, but let's assume they are space separated
        return 'className="' + resolve_classes(classes_str) + '"'
        
    content = re.sub(r'className="([^"]*)"', replace_class_name, content)
    
    def replace_class_name_backtick(match):
        classes_str = match.group(1)
        return 'className={`' + resolve_classes(classes_str) + '`}'
        
    # Fix the regex for backticks
    content = re.sub(r'className=\{`([^`]*)\`\}', replace_class_name_backtick, content)
    
    if content != orig_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed conflicts in: {os.path.basename(file_path)}")

print("Done cleaning classes!")
