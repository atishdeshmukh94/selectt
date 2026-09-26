const fs = require('fs');
const path = require('path');

const indexJsPath = path.join(__dirname, '..', 'index.js');
let content = fs.readFileSync(indexJsPath, 'utf8');

const duplicateSnippet = `// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://selectt.in', 'https://admin.selectt.in'];\n\n`;

content = content.replace(duplicateSnippet, '');

fs.writeFileSync(indexJsPath, content, 'utf8');
console.log('Cleaned up duplicate allowedOrigins definition.');
