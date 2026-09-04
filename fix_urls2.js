const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let changed = false;

      // Ensure process.env.NEXT_PUBLIC_API_URL is the primary source
      const targetUrl = '`${process.env.NEXT_PUBLIC_API_URL || "https://nyaya-ai-backend-tyy5.onrender.com/api/v1"}`';
      
      const regex1 = /['"]https:\/\/nyaya-ai-backend-tyy5\.onrender\.com\/api\/v1['"]/g;
      if (regex1.test(content)) {
        content = content.replace(regex1, targetUrl);
        changed = true;
      }
      
      // In auth/page.tsx
      if (fullPath.includes('auth\\page.tsx') || fullPath.includes('auth/page.tsx')) {
        content = content.replace(/const baseUrl = .*/g, `const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nyaya-ai-backend-tyy5.onrender.com/api/v1';`);
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log('Fixed env vars', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
