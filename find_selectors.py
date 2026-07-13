import os

search_terms = ['DemoCitySelector', 'PincodeSearch']

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            found = [term for term in search_terms if term in content]
            if found:
                print(f"{path}: contains {found}")
