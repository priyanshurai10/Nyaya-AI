import os

def fix_hardcoded_dark(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace hardcoded dark root backgrounds with responsive ones
    content = content.replace('bg-[#020813] text-white', 'bg-slate-50 dark:bg-[#020813] text-slate-900 dark:text-white')
    
    # Replace transparent white glows/cards with adaptive ones
    content = content.replace('bg-white/[0.01]', 'bg-white dark:bg-white/[0.02]')
    
    # Text colors
    content = content.replace('text-white/50', 'text-slate-500 dark:text-white/50')
    content = content.replace('text-white/60', 'text-slate-600 dark:text-white/60')
    content = content.replace('text-white/40', 'text-slate-400 dark:text-white/40')
    content = content.replace('text-white/30', 'text-slate-400 dark:text-white/30')
    content = content.replace('border-white/5', 'border-slate-200 dark:border-white/5')
    content = content.replace('border-white/10', 'border-slate-200 dark:border-white/10')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {filepath}")

fix_hardcoded_dark(r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\src\app\page.tsx')
fix_hardcoded_dark(r'C:\Users\priya\.gemini\antigravity\scratch\nyaya-ai\src\app\auth\page.tsx')

