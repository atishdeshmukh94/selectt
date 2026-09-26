const fs = require('fs');
const path = require('path');

const indexJsPath = path.join(__dirname, '..', 'index.js');
const content = fs.readFileSync(indexJsPath, 'utf8');

const lines = content.split('\n');
const authMiddlewareRoutes = [];

lines.forEach((line, idx) => {
    if (line.includes('authMiddleware') && !line.includes('isAdmin') && !line.includes('require(') && !line.includes('module.exports')) {
        authMiddlewareRoutes.push({ lineNum: idx + 1, line: line.trim() });
    }
});

console.log(`Routes using authMiddleware WITHOUT isAdmin (${authMiddlewareRoutes.length}):`);
authMiddlewareRoutes.forEach(r => console.log(`Line ${r.lineNum}: ${r.line}`));
