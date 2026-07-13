import os

words = ['city', 'pincode', 'select', 'LocationContext', 'useLocation']

files = ['src/app/map/page.tsx', 'src/app/emergency/page.tsx']

for path in files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        found = [w for w in words if w.lower() in content.lower()]
        print(f"{path}: contains {found}")
