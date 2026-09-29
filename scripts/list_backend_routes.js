const fs = require('fs');

const content = fs.readFileSync('backend/index.js', 'utf8');
const lines = content.split('\n');

const routes = [];
lines.forEach((line, index) => {
  const match = line.match(/app\.(get|post|put|delete|patch)\(\s*(\[[^\]]+\]|'[^']+'|"[^"]+"|\`[^\`]+\`)/);
  if (match) {
    routes.push({ line: index + 1, method: match[1].toUpperCase(), path: match[2] });
  }
});

console.log(`Found ${routes.length} routes in backend/index.js:`);
routes.forEach(r => console.log(`Line ${r.line}: ${r.method} ${r.path}`));
