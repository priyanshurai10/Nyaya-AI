import os

path = "backend/app/core/security.py"
with open(path, "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "mask_aadhaar" in line or "mask_pan" in line or "XXXXX" in line or 'return """' in line:
        pass
    else:
        new_lines.append(line)

with open(path, "w") as f:
    f.writelines(new_lines)
    f.write("\n")
    f.write("def mask_aadhaar(aadhaar: str) -> str:\n")
    f.write("    if not aadhaar or len(str(aadhaar)) < 4: return ''\n")
    f.write("    return 'XXXX-XXXX-' + str(aadhaar)[-4:]\n\n")
    f.write("def mask_pan(pan: str) -> str:\n")
    f.write("    if not pan or len(str(pan)) < 4: return ''\n")
    f.write("    return 'XXXXX' + str(pan)[-4:]\n")
