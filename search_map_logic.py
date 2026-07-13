with open('src/app/map/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'pincode' in line.lower() or 'city' in line.lower() or 'select' in line.lower():
        # Print line number and line (and surrounding lines if possible)
        print(f"Line {idx+1}: {line.strip()[:100]}")
