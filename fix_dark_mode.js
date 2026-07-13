const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
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
  // Replace `bg-white` (if not followed by / and not already prefixed by dark:)
  // But safely, we can just replace `bg-white ` with `bg-white dark:bg-slate-900 `
  // and `bg-white"` with `bg-white dark:bg-slate-900"`
  
  // A safe regex: match 'bg-white' not preceded by '-' (like hover:bg-white) 
  // not followed by '/' (like bg-white/10)
  // Let's use negative lookbehind/lookahead
  const regex = /(?<!:|\-)bg-white(?!\/)/g;
  
  if (regex.test(content)) {
    let newContent = content.replace(regex, 'bg-white dark:bg-slate-900');
    // We also want text-slate-900 to become text-slate-900 dark:text-white
    const textRegex = /(?<!:|\-)text-slate-900(?!\/)/g;
    newContent = newContent.replace(textRegex, 'text-slate-900 dark:text-white');
    
    // Also fix text-slate-800 to dark:text-slate-200
    const textRegex800 = /(?<!:|\-)text-slate-800(?!\/)/g;
    newContent = newContent.replace(textRegex800, 'text-slate-800 dark:text-slate-200');

    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      changedCount++;
      console.log('Fixed:', file);
    }
  }
});

console.log('Total files fixed:', changedCount);
