const fs = require('fs');
const path = require('path');

const indexJsPath = path.join(__dirname, '..', 'index.js');
let lines = fs.readFileSync(indexJsPath, 'utf8').split('\n');

// Find index of "// CORS Configuration"
const idx = lines.findIndex(l => l.includes('// CORS Configuration'));
if (idx !== -1) {
    // Remove 5 lines: "// CORS Configuration" + 4 lines of const allowedOrigins
    lines.splice(idx, 5);
    fs.writeFileSync(indexJsPath, lines.join('\n'), 'utf8');
    console.log('Successfully spliced out first allowedOrigins declaration.');
}
