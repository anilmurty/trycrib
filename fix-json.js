const fs = require('fs');

// Read the file
let content = fs.readFileSync('washougal-oct-5-2025-1.json', 'utf8');

// Fix common JSON issues
// 1. Add missing commas between objects
content = content.replace(/}\s*\n\s*{/g, '},\n{');

// 2. Ensure proper array structure
// If the file doesn't start with [, add it
if (!content.trim().startsWith('[')) {
  content = '[' + content;
}

// If the file doesn't end with ], add it
if (!content.trim().endsWith(']')) {
  content = content + ']';
}

// Write the fixed content
fs.writeFileSync('washougal-oct-5-2025-1-fixed.json', content);

console.log('JSON fixed! Saved as washougal-oct-5-2025-1-fixed.json');

// Validate the fixed JSON
try {
  const data = JSON.parse(content);
  console.log('✅ JSON is valid! Found', data.length, 'properties');
} catch (error) {
  console.log('❌ JSON still has errors:', error.message);
}
