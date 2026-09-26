const fs = require('fs');
const path = require('path');

const indexJsPath = path.join(__dirname, '..', 'index.js');
const content = fs.readFileSync(indexJsPath, 'utf8');
const lines = content.split('\n');

console.log('=== SELECTT BACKEND STATIC AUDIT SCAN ===');
console.log(`Total lines: ${lines.length}`);

// 1. Enumerate endpoints
const routeRegex = /app\.(get|post|put|patch|delete)\s*\(\s*(?:\[([^\]]+)\]|['"`]([^'"`]+)['"`])\s*,\s*([\s\S]*?)(?=\napp\.|\nconst|\nlet|\nvar|\n\/\/ ===|\nmodule\.exports|\nserver\.listen|\napp\.listen|$)/g;

let routeMatches = 0;
const endpoints = [];

const simpleRouteRegex = /app\.(get|post|put|patch|delete)\s*\(\s*(?:\[([^\]]+)\]|['"`]([^'"`]+)['"`])\s*,\s*(.*?)\s*=>/g;
let match;
while ((match = simpleRouteRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const rawPaths = match[2] ? match[2].split(',').map(s => s.trim().replace(/['"`]/g, '')) : [match[3]];
    const middlewarePart = match[4];
    const hasAuth = middlewarePart.includes('authMiddleware');
    const hasAdmin = middlewarePart.includes('isAdmin');
    const hasUpload = middlewarePart.includes('upload.');
    
    for (const p of rawPaths) {
        if (p) {
            endpoints.push({ method, path: p, hasAuth, hasAdmin, hasUpload });
        }
    }
}

console.log(`Found ${endpoints.length} API endpoints.`);

// 2. Check for SQL Injection risks (string concatenation in db.query)
const sqlInjectionRisks = [];
lines.forEach((line, idx) => {
    if (line.includes('db.query(') || line.includes('connection.query(') || line.includes('db.execute(')) {
        // Check if template literals or concatenation is used directly inside db.query
        if (line.includes('`') && (line.includes('${') || line.includes(' + '))) {
            sqlInjectionRisks.push({ line: idx + 1, content: line.trim() });
        } else if (line.includes(' + ') && !line.includes('?')) {
            sqlInjectionRisks.push({ line: idx + 1, content: line.trim() });
        }
    }
});

console.log(`\n=== SQL Injection Suspects (${sqlInjectionRisks.length}) ===`);
sqlInjectionRisks.forEach(r => console.log(`Line ${r.line}: ${r.content}`));

// 3. Check for raw error disclosure in API responses
const errorDisclosure = [];
lines.forEach((line, idx) => {
    if ((line.includes('res.status(500)') || line.includes('res.status(400)')) && (line.includes('err.message') || line.includes('err.sqlMessage') || line.includes('error: err') || line.includes('error: err.message'))) {
        errorDisclosure.push({ line: idx + 1, content: line.trim() });
    }
});

console.log(`\n=== Potential Raw Error Leakage Points (${errorDisclosure.length}) ===`);
console.log(`Sample (first 10 of ${errorDisclosure.length}):`);
errorDisclosure.slice(0, 10).forEach(r => console.log(`Line ${r.line}: ${r.content}`));

// 4. Check for JWT Secret fallback or weak secrets
const jwtSecretRisks = [];
lines.forEach((line, idx) => {
    if (line.includes('JWT_SECRET') && (line.includes('||') || line.includes('??'))) {
        jwtSecretRisks.push({ line: idx + 1, content: line.trim() });
    }
});

console.log(`\n=== JWT Secret Weak Fallbacks (${jwtSecretRisks.length}) ===`);
jwtSecretRisks.forEach(r => console.log(`Line ${r.line}: ${r.content}`));

// 5. Check for hardcoded credentials / tokens
const secretPattern = /(?:api[_-]?key|secret|password|auth[_-]?token|bearer)\s*[:=]\s*['"`][a-zA-Z0-9_\-\.\/+=]{8,}['"`]/i;
const hardcodedSecrets = [];
lines.forEach((line, idx) => {
    if (secretPattern.test(line) && !line.includes('process.env') && !line.includes('example') && !line.includes('bcrypt') && !line.includes('req.')) {
        hardcodedSecrets.push({ line: idx + 1, content: line.trim() });
    }
});

console.log(`\n=== Suspected Hardcoded Secrets (${hardcodedSecrets.length}) ===`);
hardcodedSecrets.forEach(r => console.log(`Line ${r.line}: ${r.content}`));

// 6. Inspect Admin vs Public route protection
const adminRoutesWithoutProtection = [];
endpoints.forEach(ep => {
    if ((ep.path.startsWith('/api/admin') || ep.path.includes('/admin/')) && !ep.path.includes('login') && !ep.hasAdmin && !ep.hasAuth) {
        adminRoutesWithoutProtection.push(ep);
    }
});

console.log(`\n=== Admin Routes Missing authMiddleware/isAdmin (${adminRoutesWithoutProtection.length}) ===`);
adminRoutesWithoutProtection.forEach(r => console.log(`${r.method} ${r.path}`));
