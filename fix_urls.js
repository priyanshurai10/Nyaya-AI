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

      // Replace double /api/v1/api/v1
      if (content.includes('${baseUrl}/api/v1/user/register')) {
        content = content.replace(/\$\{baseUrl\}\/api\/v1\//g, '${baseUrl}/');
        changed = true;
      }
      
      // Fix fallback URL in profile/page.tsx
      if (fullPath.includes('profile') && content.includes('BACKEND_URL')) {
        content = content.replace(/process\.env\.NEXT_PUBLIC_BACKEND_URL \|\| "https:\/\/nyaya-ai-backend-tyy5\.onrender\.com"/g, '"https://nyaya-ai-backend-tyy5.onrender.com"');
        content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/nyaya-ai-backend-tyy5\.onrender\.com'/g, '"https://nyaya-ai-backend-tyy5.onrender.com"');
        // also fix fetch('/api/v1/user/profile') directly
        content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\}\/api\/v1/g, '${process.env.NEXT_PUBLIC_API_URL}');
        changed = true;
      }

      // Find any fetch(process.env.NEXT_PUBLIC_API_URL + '/api/v1... and fix it
      // Replace all instances of `process.env.NEXT_PUBLIC_API_URL || 'https://nyaya-ai-backend-tyy5.onrender.com'}/api/v1`
      // with just `https://nyaya-ai-backend-tyy5.onrender.com/api/v1` for absolute certainty to Render.
      const regex = /\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| ['"]https:\/\/nyaya-ai-backend-tyy5\.onrender\.com['"]\}\/api\/v1/g;
      if (regex.test(content)) {
        content = content.replace(regex, 'https://nyaya-ai-backend-tyy5.onrender.com/api/v1');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log('Fixed', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
