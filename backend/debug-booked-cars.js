const fs = require('fs');
const filePath = 'd:/selectt/admin/src/pages/BookedCars.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Log quote style around Status header
const statusIdx = content.indexOf('Status');
console.log('Context around Status:', JSON.stringify(content.substring(statusIdx - 30, statusIdx + 50)));

// Log context around Actions td
const actionsIdx = content.indexOf('flex items-center gap-2');
console.log('Context around flex items:', JSON.stringify(content.substring(actionsIdx - 120, actionsIdx + 60)));
