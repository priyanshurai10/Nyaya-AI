import os
import json

history_dir = r'C:\Users\priya\AppData\Roaming\Code\User\History'

results = []

for root, dirs, files in os.walk(history_dir):
    if 'entries.json' in files:
        entries_path = os.path.join(root, 'entries.json')
        try:
            with open(entries_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                resource = data.get('resource', '')
                if 'translations.ts' in resource or 'api-client.ts' in resource or 'LocationContext.tsx' in resource:
                    print(f"Found match: {resource}")
                    for entry in data.get('entries', []):
                        file_id = entry.get('id')
                        timestamp = entry.get('timestamp')
                        backup_path = os.path.join(root, file_id)
                        if os.path.exists(backup_path):
                            print(f"  Backup: {backup_path} ({timestamp}) size: {os.path.getsize(backup_path)} bytes")
                            results.append((resource, timestamp, backup_path))
        except Exception as e:
            continue

print(f"Total backups found: {len(results)}")
