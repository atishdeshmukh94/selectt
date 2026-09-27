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

async function runCmd(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) => {
            if (err) return reject(err);
            let stdout = '';
            let stderr = '';
            stream.on('data', d => { stdout += d.toString(); });
            stream.stderr.on('data', d => { stderr += d.toString(); });
            stream.on('close', code => resolve({ code, stdout, stderr, ok: code === 0 }));
        });
    });
}

async function fastPut(sftp, localFile, remoteFile) {
    return new Promise((resolve, reject) => {
        sftp.fastPut(localFile, remoteFile, {
            concurrency: 64,
            chunkSize: 32768
        }, (err) => {
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

    console.log('\n=== Step 3: Fixing Live VPS Schema ===');
    const schemaFixSql = `
        ALTER TABLE banners ADD COLUMN IF NOT EXISTS flip_image tinyint(1) DEFAULT 0;
        ALTER TABLE banners MODIFY COLUMN type varchar(50) NOT NULL;
    `;
    const fixCmd = `mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "${schemaFixSql.replace(/"/g, '\\"')}"`;
    const fixRes = await runCmd(conn, fixCmd);
    console.log('Schema fix result:', fixRes.stdout || 'OK');

    console.log('\n=== Step 4: Transferring uploads.tar.gz to VPS ===');
    const localTar = path.join(__dirname, '..', 'uploads.tar.gz');
    const remoteTar = '/home/selectt-api/htdocs/api.selectt.in/uploads.tar.gz';
    const remoteUploadsDir = '/home/selectt-api/htdocs/api.selectt.in/public/uploads';

    await runCmd(conn, `mkdir -p ${remoteUploadsDir}`);

    const sftp = await new Promise((resolve, reject) => {
        conn.sftp((err, sftp) => {
            if (err) reject(err);
            else resolve(sftp);
        });
    });

    console.log('Uploading archive (371 MB)...');
    const startTime = Date.now();
    await fastPut(sftp, localTar, remoteTar);
    console.log(`Archive uploaded in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    console.log('\n=== Step 5: Extracting Archive on VPS ===');
    const extractCmd = `tar -xzf ${remoteTar} -C ${remoteUploadsDir} && rm -f ${remoteTar}`;
    const extractRes = await runCmd(conn, extractCmd);
    console.log('Extraction result:', extractRes.ok ? 'SUCCESS' : extractRes.stderr);

    const checkCount = await runCmd(conn, `ls -1 ${remoteUploadsDir} | wc -l`);
    console.log(`Total files in VPS uploads directory: ${checkCount.stdout.trim()}`);

    console.log('\n=== Step 6: Syncing Database Tables (Localhost -> VPS) ===');
    for (const table of TABLES_TO_SYNC) {
        try {
            const [tables] = await localDb.query(`SHOW TABLES LIKE '${table}'`);
            if (tables.length === 0) continue;

            const [rows] = await localDb.query(`SELECT * FROM \`${table}\``);
            console.log(`Table '${table}': found ${rows.length} rows.`);
            if (rows.length === 0) continue;

            const columns = Object.keys(rows[0]);
            const escapedCols = columns.map(c => `\`${c}\``).join(', ');
            const chunkSize = 50;
            let fullSql = `SET FOREIGN_KEY_CHECKS=0;\nDELETE FROM \`${table}\`;\n`;

            const values = rows.map(row => {
                return `(${columns.map(col => {
                    const val = row[col];
                    if (val === null || val === undefined) return 'NULL';
                    if (typeof val === 'number') return val;
                    if (typeof val === 'boolean') return val ? 1 : 0;
                    if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                    if (typeof val === 'object') return mysql.escape(JSON.stringify(val));
                    return mysql.escape(String(val));
                }).join(', ')})`;
            });

            for (let i = 0; i < values.length; i += chunkSize) {
                const chunk = values.slice(i, i + chunkSize);
                fullSql += `INSERT INTO \`${table}\` (${escapedCols}) VALUES \n${chunk.join(',\n')};\n`;
            }
            fullSql += `SET FOREIGN_KEY_CHECKS=1;\n`;

            const remoteSqlFile = `/tmp/sync_${table}.sql`;
            await new Promise((resolve, reject) => {
                const stream = sftp.createWriteStream(remoteSqlFile);
                stream.on('close', resolve);
                stream.on('error', reject);
                stream.end(fullSql);
            });

            const importCmd = `mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} < ${remoteSqlFile} && rm -f ${remoteSqlFile}`;
            const importRes = await runCmd(conn, importCmd);
            if (importRes.ok) {
                console.log(`  ✓ Table '${table}' synced successfully`);
            } else {
                console.error(`  ✗ Error syncing table '${table}':`, importRes.stderr);
            }
        } catch (err) {
            console.error(`  ✗ Exception syncing table '${table}':`, err.message);
        }
    }

    console.log('\n=== Step 7: Uploading latest index.js to VPS ===');
    const localIndex = path.join(__dirname, '..', 'index.js');
    const remoteIndex = '/home/selectt-api/htdocs/api.selectt.in/index.js';
    await fastPut(sftp, localIndex, remoteIndex);
    console.log('index.js uploaded to VPS.');

    console.log('\n=== Step 8: Restarting PM2 ===');
    const pm2Res = await runCmd(conn, `cd /home/selectt-api/htdocs/api.selectt.in && pm2 restart selectt-api || pm2 restart all`);
    console.log('PM2 restart:', pm2Res.stdout || pm2Res.stderr);

    console.log('\n=== Step 9: Verifying Live VPS Data ===');
    const vCmd = `
        echo "--- BANNERS GROUP BY PAGE ---"
        mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "SELECT page, type, count(*) as count FROM banners GROUP BY page, type;" 2>/dev/null
        echo "--- TOTAL CARS ---"
        mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "SELECT count(*) as total_cars FROM cars;" 2>/dev/null
        echo "--- TOTAL BRANDS ---"
        mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "SELECT count(*) as total_brands FROM brands;" 2>/dev/null
        echo "--- TOTAL SITE SETTINGS ---"
        mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "SELECT count(*) as total_settings FROM site_settings;" 2>/dev/null
    `;
    const vRes = await runCmd(conn, vCmd);
    console.log(vRes.stdout);

    await localDb.end();
    conn.end();
    console.log('\n=============================================');
    console.log('🎉 ALL MEDIA & DATABASE DATA SYNCED TO LIVE SERVER!');
    console.log('=============================================');
}

main().catch(err => {
    console.error('Fatal error during sync:', err);
    process.exit(1);
});
