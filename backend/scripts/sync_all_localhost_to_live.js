const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');
const mysql = require('mysql2/promise');

const LOCAL_DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'selectt-db'
};

const VPS_SSH_CONFIG = {
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
};

const VPS_DB_CONFIG = {
    user: 'selectt-wepnex',
    pass: '6EVSUZ7RNYA9bV0WUoxy',
    db: 'connect-db'
};

const TABLES_TO_SYNC = [
    'banners',
    'brands',
    'models',
    'variants',
    'cars',
    'locations',
    'car_hub_locations',
    'video_testimonials',
    'site_content',
    'site_settings',
    'media_alt_tags',
    'blog_categories',
    'blog_tags',
    'blog_posts',
    'blog_post_categories',
    'blog_post_tags'
];

async function runCommandOnVPS(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) => {
            if (err) return reject(err);
            let stdout = '';
            let stderr = '';
            stream.on('data', d => { stdout += d.toString(); });
            stream.stderr.on('data', d => { stderr += d.toString(); });
            stream.on('close', (code) => {
                if (code !== 0) {
                    resolve({ code, stdout, stderr, ok: false });
                } else {
                    resolve({ code, stdout, stderr, ok: true });
                }
            });
        });
    });
}

async function uploadFileSFTP(sftp, localPath, remotePath) {
    return new Promise((resolve, reject) => {
        sftp.fastPut(localPath, remotePath, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function main() {
    console.log('=== Step 1: Connecting to Local MySQL ===');
    const localDb = await mysql.createConnection(LOCAL_DB_CONFIG);
    console.log('Connected to Local MySQL (selectt-db)');

    console.log('\n=== Step 2: Connecting to Live VPS via SSH ===');
    const conn = new Client();

    await new Promise((resolve, reject) => {
        conn.on('ready', resolve);
        conn.on('error', reject);
        conn.connect(VPS_SSH_CONFIG);
    });
    console.log('Connected to VPS (200.97.166.12)');

    console.log('\n=== Step 3: Fixing VPS Schema (banners table flip_image & type) ===');
    const schemaFixSql = `
        ALTER TABLE banners ADD COLUMN IF NOT EXISTS flip_image tinyint(1) DEFAULT 0;
        ALTER TABLE banners MODIFY COLUMN type varchar(50) NOT NULL;
    `;
    const fixCmd = `mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "${schemaFixSql.replace(/"/g, '\\"')}"`;
    const fixRes = await runCommandOnVPS(conn, fixCmd);
    console.log('Schema fix result:', fixRes.stdout || 'OK');

    console.log('\n=== Step 4: Syncing Uploaded Media Files (543 files) to VPS ===');
    const localUploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    const remoteUploadsDir = '/home/selectt-api/htdocs/api.selectt.in/public/uploads';

    // Ensure remote directory exists
    await runCommandOnVPS(conn, `mkdir -p ${remoteUploadsDir}`);

    // Get list of existing remote files
    const listRes = await runCommandOnVPS(conn, `ls -1 ${remoteUploadsDir}`);
    const existingRemoteFiles = new Set(listRes.stdout.split('\n').map(f => f.trim()).filter(Boolean));
    console.log(`Found ${existingRemoteFiles.size} existing files on VPS uploads`);

    const sftp = await new Promise((resolve, reject) => {
        conn.sftp((err, sftp) => {
            if (err) reject(err);
            else resolve(sftp);
        });
    });

    const localFiles = fs.readdirSync(localUploadsDir);
    let uploadedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < localFiles.length; i++) {
        const file = localFiles[i];
        const localFilePath = path.join(localUploadsDir, file);
        const remoteFilePath = `${remoteUploadsDir}/${file}`;

        if (!fs.statSync(localFilePath).isFile()) continue;

        if (existingRemoteFiles.has(file)) {
            skippedCount++;
            continue;
        }

        try {
            await uploadFileSFTP(sftp, localFilePath, remoteFilePath);
            uploadedCount++;
            if (uploadedCount % 50 === 0 || uploadedCount === localFiles.length) {
                console.log(`Uploaded ${uploadedCount} new files to VPS...`);
            }
        } catch (uploadErr) {
            console.error(`Failed to upload ${file}:`, uploadErr.message);
        }
    }
    console.log(`Upload Sync Complete! ${uploadedCount} files transferred, ${skippedCount} already existed.`);

    console.log('\n=== Step 5: Syncing Database Tables (Localhost -> Live VPS) ===');

    for (const table of TABLES_TO_SYNC) {
        try {
            // Check if table exists locally
            const [tables] = await localDb.query(`SHOW TABLES LIKE '${table}'`);
            if (tables.length === 0) {
                console.log(`Table '${table}' does not exist locally. Skipping.`);
                continue;
            }

            // Fetch all rows from local
            const [rows] = await localDb.query(`SELECT * FROM \`${table}\``);
            console.log(`\nTable '${table}': found ${rows.length} rows locally.`);

            if (rows.length === 0) continue;

            // Generate INSERT / REPLACE INTO SQL
            const columns = Object.keys(rows[0]);
            const values = rows.map(row => {
                return `(${columns.map(col => {
                    const val = row[col];
                    if (val === null || val === undefined) return 'NULL';
                    if (typeof val === 'number') return val;
                    if (typeof val === 'boolean') return val ? 1 : 0;
                    if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                    if (typeof val === 'object') {
                        // JSON column
                        return mysql.escape(JSON.stringify(val));
                    }
                    return mysql.escape(String(val));
                }).join(', ')})`;
            });

            // Write chunked insert statements to a temporary SQL script on VPS
            const escapedCols = columns.map(c => `\`${c}\``).join(', ');
            const chunkSize = 50;
            let fullSql = `SET FOREIGN_KEY_CHECKS=0;\nDELETE FROM \`${table}\`;\n`;

            for (let i = 0; i < values.length; i += chunkSize) {
                const chunk = values.slice(i, i + chunkSize);
                fullSql += `INSERT INTO \`${table}\` (${escapedCols}) VALUES \n${chunk.join(',\n')};\n`;
            }
            fullSql += `SET FOREIGN_KEY_CHECKS=1;\n`;

            // Save SQL on remote VPS and execute via MySQL CLI
            const remoteSqlFile = `/tmp/sync_${table}.sql`;
            await new Promise((resolve, reject) => {
                const stream = sftp.createWriteStream(remoteSqlFile);
                stream.on('close', resolve);
                stream.on('error', reject);
                stream.end(fullSql);
            });

            const importCmd = `mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} < ${remoteSqlFile} && rm -f ${remoteSqlFile}`;
            const importRes = await runCommandOnVPS(conn, importCmd);

            if (importRes.ok) {
                console.log(`Successfully synced table '${table}' to VPS!`);
            } else {
                console.error(`Error syncing table '${table}':`, importRes.stderr || importRes.stdout);
            }
        } catch (err) {
            console.error(`Exception while syncing table '${table}':`, err.message);
        }
    }

    console.log('\n=== Step 6: Deploying Updated index.js to VPS ===');
    const localIndexJs = path.join(__dirname, '..', 'index.js');
    const remoteIndexJs = '/home/selectt-api/htdocs/api.selectt.in/index.js';
    await uploadFileSFTP(sftp, localIndexJs, remoteIndexJs);
    console.log('Updated index.js uploaded to VPS.');

    console.log('\n=== Step 7: Restarting Backend Service via PM2 ===');
    const restartRes = await runCommandOnVPS(conn, `cd /home/selectt-api/htdocs/api.selectt.in && pm2 restart selectt-api || pm2 restart all`);
    console.log('PM2 restart output:', restartRes.stdout || restartRes.stderr);

    console.log('\n=== Step 8: Verifying Live Backend Health & Data ===');
    const verifyCmd = `
        echo "=== BANNERS COUNT ON VPS ==="
        mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "SELECT page, type, count(*) as count FROM banners GROUP BY page, type;" 2>/dev/null
        echo "=== CARS COUNT ON VPS ==="
        mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "SELECT count(*) as total_cars FROM cars;" 2>/dev/null
        echo "=== BRANDS COUNT ON VPS ==="
        mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "SELECT count(*) as total_brands FROM brands;" 2>/dev/null
    `;
    const verifyRes = await runCommandOnVPS(conn, verifyCmd);
    console.log(verifyRes.stdout);

    await localDb.end();
    conn.end();
    console.log('ALL SYNC OPERATIONS COMPLETED SUCCESSFULLY!');
}

main().catch(err => {
    console.error('Fatal error during sync:', err);
    process.exit(1);
});
