import subprocess
import collections

try:
    res = subprocess.run('npx tsc --noEmit', shell=True, capture_output=True, text=True, encoding='utf-8')
    output = res.stdout + '\n' + res.stderr
except Exception as e:
    output = str(e)

file_errors = collections.defaultdict(list)
for line in output.split('\n'):
    if '(' in line and '): error TS' in line:
        parts = line.split('(')
        filename = parts[0].strip()
        file_errors[filename].append(line)

print(f"Total files with errors: {len(file_errors)}")
for fname, errs in sorted(file_errors.items()):
    print(f"  {fname}: {len(errs)} errors")
    if len(errs) <= 5:
        for err in errs:
            print(f"    -> {err}")
