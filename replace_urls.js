const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace fetch('/api/v1/...') or fetch("/api/v1/...") with fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/...`)
    // Also handle fetch(`/api/v1/...`)
    content = content.replace(/fetch\(\s*['"](\/api\/v1\/[^'"]+)['"]/g, "fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}$1`");
    content = content.replace(/fetch\(\s*`(\/api\/v1\/[^`]+)`/g, "fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}$1`");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Total files updated: ${changedCount}`);
