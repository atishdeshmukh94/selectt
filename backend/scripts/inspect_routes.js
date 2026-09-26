const fs = require('fs');
const path = require('path');

const indexJsPath = path.join(__dirname, '..', 'index.js');
const content = fs.readFileSync(indexJsPath, 'utf8');

const routeBlockRegex = /app\.(get|post|put|patch|delete)\s*\(\s*([^,]+),\s*([\s\S]*?)(?=\napp\.(get|post|put|patch|delete)|\n\/\/ ===|\nmodule\.exports|\nconst server =|\napp\.listen|$)/g;

const routes = [];
let match;

while ((match = routeBlockRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const routePathRaw = match[2].trim();
    const body = match[3];

    // Extract path(s)
    let paths = [];
    if (routePathRaw.startsWith('[') && routePathRaw.endsWith(']')) {
        paths = routePathRaw.slice(1, -1).split(',').map(s => s.trim().replace(/['"`]/g, ''));
    } else {
        paths = [routePathRaw.replace(/['"`]/g, '')];
    }

    const hasAuthMiddleware = body.includes('authMiddleware');
    const hasCustomerAuth = body.includes('customerAuth');
    const hasIsAdmin = body.includes('isAdmin');
    const hasUpload = body.includes('upload.') || body.includes('multer');
    
    // Check if query uses req.params without checking customer ID or admin
    const usesParams = body.includes('req.params');
    const hasDbQuery = body.includes('db.query');

    paths.forEach(p => {
        routes.push({
            method,
            path: p,
            hasAuthMiddleware,
            hasCustomerAuth,
            hasIsAdmin,
            hasUpload,
            usesParams,
            hasDbQuery,
            isStateMutating: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
        });
    });
}

console.log(`Total parsed routes: ${routes.length}`);

// Find all mutating routes that are completely unauthenticated
const unauthenticatedMutations = routes.filter(r => 
    r.isStateMutating && 
    !r.hasAuthMiddleware && 
    !r.hasCustomerAuth && 
    !r.hasIsAdmin
);

console.log(`\n=== Unauthenticated Mutating Routes (${unauthenticatedMutations.length}) ===`);
unauthenticatedMutations.forEach(r => {
    console.log(`${r.method} ${r.path}`);
});

fs.writeFileSync(path.join(__dirname, 'routes_inventory.json'), JSON.stringify(routes, null, 2));
console.log('\nWrote routes inventory to routes_inventory.json');
