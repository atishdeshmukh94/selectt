import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = 'C:\\MAMP\\htdocs\\clinch\\img';
const destDir = path.join(__dirname, 'public', 'img');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.webp') || file.endsWith('.svg')) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    }
}
console.log('Images copied successfully!');
