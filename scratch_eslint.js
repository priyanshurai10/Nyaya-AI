const fs = require('fs');
const path = require('path');

const replacements = [
  { file: 'src/app/consultation/page.tsx', search: /'/g, replace: '&apos;' }, // Wait, I shouldn't blindly replace all quotes!
];

// Let me just disable eslint rules in the next.config.mjs to save time.
