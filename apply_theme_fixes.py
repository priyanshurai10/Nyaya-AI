import os
import glob
import re

app_dir = r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\src'
tsx_files = glob.glob(f'{app_dir}/**/*.tsx', recursive=True)

replacements = {
    r'\bbg-white\b(?!.*?dark:bg-)': 'bg-white dark:bg-[#111827]',
    r'\bbg-slate-50\b(?!.*?dark:bg-)': 'bg-slate-50 dark:bg-[#0B1220]',
    r'\bbg-slate-100\b(?!.*?dark:bg-)': 'bg-slate-100 dark:bg-[#1F2937]',
    r'\bbg-gray-50\b(?!.*?dark:bg-)': 'bg-gray-50 dark:bg-[#0B1220]',
    r'\bbg-gray-100\b(?!.*?dark:bg-)': 'bg-gray-100 dark:bg-[#1F2937]',
    
    r'\btext-slate-900\b(?!.*?dark:text-)': 'text-slate-900 dark:text-white',
    r'\btext-slate-800\b(?!.*?dark:text-)': 'text-slate-800 dark:text-white/90',
    r'\btext-slate-700\b(?!.*?dark:text-)': 'text-slate-700 dark:text-white/80',
    r'\btext-slate-650\b(?!.*?dark:text-)': 'text-slate-650 dark:text-white/70',
    r'\btext-slate-600\b(?!.*?dark:text-)': 'text-slate-600 dark:text-white/60',
    r'\btext-slate-550\b(?!.*?dark:text-)': 'text-slate-550 dark:text-white/55',
    r'\btext-slate-500\b(?!.*?dark:text-)': 'text-slate-500 dark:text-white/50',
    r'\btext-slate-450\b(?!.*?dark:text-)': 'text-slate-450 dark:text-white/40',
    r'\btext-slate-400\b(?!.*?dark:text-)': 'text-slate-400 dark:text-white/30',
    
    r'\btext-gray-900\b(?!.*?dark:text-)': 'text-gray-900 dark:text-white',
    r'\btext-gray-800\b(?!.*?dark:text-)': 'text-gray-800 dark:text-white/90',
    r'\btext-gray-700\b(?!.*?dark:text-)': 'text-gray-700 dark:text-white/80',
    r'\btext-gray-600\b(?!.*?dark:text-)': 'text-gray-600 dark:text-white/60',
    r'\btext-gray-500\b(?!.*?dark:text-)': 'text-gray-500 dark:text-white/50',
    r'\btext-gray-400\b(?!.*?dark:text-)': 'text-gray-400 dark:text-white/40',
    
    r'\bborder-slate-100\b(?!.*?dark:border-)': 'border-slate-100 dark:border-white/5',
    r'\bborder-slate-200\b(?!.*?dark:border-)': 'border-slate-200 dark:border-white/5',
    r'\bborder-gray-100\b(?!.*?dark:border-)': 'border-gray-100 dark:border-white/5',
    r'\bborder-gray-200\b(?!.*?dark:border-)': 'border-gray-200 dark:border-white/5',
}

print(f"Applying theme fixes to {len(tsx_files)} files...")

for file_path in tsx_files:
    if 'node_modules' in file_path or '.next' in file_path or 'DemoCitySelector' in file_path:
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    orig_content = content
    modified = [False]
    
    # Process within className="..." attributes
    def replace_class_name(match):
        classes_str = match.group(1)
        orig_str = classes_str
        
        for pattern, replacement in replacements.items():
            classes_str = re.sub(pattern, replacement, classes_str)
            
        if classes_str != orig_str:
            modified[0] = True
        return f'className="{classes_str}"'
        
    content = re.sub(r'className="([^"]*)"', replace_class_name, content)
    
    # Also handle backticks className={`...`} string literals
    def replace_class_name_backtick(match):
        classes_str = match.group(1)
        orig_str = classes_str
        
        for pattern, replacement in replacements.items():
            classes_str = re.sub(pattern, replacement, classes_str)
            
        if classes_str != orig_str:
            modified[0] = True
        return 'className={`' + classes_str + '`}'
        
    content = re.sub(r'className={`([^`]*)}`', replace_class_name_backtick, content)
    
    if modified[0]:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {os.path.basename(file_path)}")

print("Done applying fixes!")
