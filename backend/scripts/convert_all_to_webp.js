const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
    console.log("=== Updating Database Image Paths to WebP ===");
    
    const uploadsDir = path.join(__dirname, '../public/uploads');
    const files = fs.readdirSync(uploadsDir);
    const replacementMap = new Map();

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.bmp', '.tiff'].includes(ext)) {
            const baseName = path.basename(file, ext);
            const webpFilename = `${baseName}.webp`;
            if (fs.existsSync(path.join(uploadsDir, webpFilename))) {
                replacementMap.set(file, webpFilename);
                replacementMap.set(`/uploads/${file}`, `/uploads/${webpFilename}`);
            }
        }
    }

    console.log(`Loaded ${replacementMap.size / 2} WebP conversion mapping pairs.`);

    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'selectt',
    });

    // Helper to update columns in any table
    async function updateTable(tableName, columns) {
        try {
            const [rows] = await db.query(`SELECT id, ${columns.join(', ')} FROM \`${tableName}\``);
            let updated = 0;
            for (const row of rows) {
                let changed = false;
                const updateObj = {};
                for (const col of columns) {
                    let val = row[col];
                    if (val && typeof val === 'string') {
                        let original = val;
                        for (const [oldName, newName] of replacementMap.entries()) {
                            if (val.includes(oldName)) {
                                val = val.split(oldName).join(newName);
                            }
                        }
                        if (val !== original) {
                            updateObj[col] = val;
                            changed = true;
                        }
                    }
                }
                if (changed) {
                    const setClause = Object.keys(updateObj).map(k => `\`${k}\` = ?`).join(', ');
                    const values = [...Object.values(updateObj), row.id];
                    await db.query(`UPDATE \`${tableName}\` SET ${setClause} WHERE id = ?`, values);
                    updated++;
                }
            }
            console.log(`[Table: ${tableName}] Updated ${updated} records.`);
        } catch (err) {
            console.log(`[Table: ${tableName}] Skipped or error: ${err.message}`);
        }
    }

    // Inspect cars columns dynamically
    const [carCols] = await db.query('DESCRIBE cars');
    const carImageFields = carCols
        .map(c => c.Field)
        .filter(f => ['image', 'images', 'photos', 'gallery', 'video_thumbnail', 'inspection_report'].includes(f) || f.toLowerCase().includes('image') || f.toLowerCase().includes('photo'));
    
    console.log(`Cars image fields detected: ${carImageFields.join(', ')}`);
    await updateTable('cars', carImageFields);
    await updateTable('banners', ['image', 'mobile_image']);
    await updateTable('blog_posts', ['featured_image', 'content']);
    await updateTable('brands', ['logo_url']);
    await updateTable('users', ['image']);
    await updateTable('locations', ['image']);

    await db.end();
    console.log("=== All Database References Successfully Updated to WebP! ===");
}

main().catch(console.error);
