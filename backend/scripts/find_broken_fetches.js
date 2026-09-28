const fs = require('fs');
const path = require('path');

function scan(dir, label) {
    const results = [];
    function walk(d) {
        if (!fs.existsSync(d)) return;
        const list = fs.readdirSync(d, { withFileTypes: true });
        for (const item of list) {
            const p = path.join(d, item.name);
            if (item.isDirectory()) {
                if (item.name !== 'node_modules' && item.name !== 'dist') walk(p);
            } else if (item.isFile() && /\.(jsx?|tsx?)$/.test(item.name)) {
                const text = fs.readFileSync(p, 'utf8');
                const lines = text.split('\n');
                lines.forEach((line, i) => {
                    // Match fetch('/api... or fetch(`/api... but not fetch(`${API... or fetch(`${API_URL...
                    if (/fetch\(\s*['`]\/api\//.test(line)) {
                        results.push({ file: p, line: i + 1, code: line.trim() });
                    }
                });
            }
        }
    }
    walk(dir);
    console.log(`\n=== Found ${results.length} relative fetch calls in ${label} ===`);
    results.forEach(r => console.log(`${r.file}:${r.line} -> ${r.code}`));
    return results;
}

const frontendHits = scan(path.resolve(__dirname, '../../frontend/src'), 'frontend/src');
const adminHits = scan(path.resolve(__dirname, '../../admin/src'), 'admin/src');
