import re

path = 'src/app/user/profile/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the messy fetch profile error handling
content = content.replace('''      if (!res.ok) {
        res = await fetch(`${BACKEND_URL}/api/v1/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.status === 401) {
          localStorage.removeItem("nyaya_token");
          localStorage.removeItem("nyaya_user");
          window.location.href = "/auth?expired=true";
          return;
        }
      }
      const json = await res.json();''', '''      if (!res.ok) {
        res = await fetch(`${BACKEND_URL}/api/v1/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      const json = await res.json();
      if (res.status === 401) {
        localStorage.removeItem("nyaya_token");
        localStorage.removeItem("nyaya_user");
        window.location.href = "/auth?expired=true";
        return;
      }''')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
