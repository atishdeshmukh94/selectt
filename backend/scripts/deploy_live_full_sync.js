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
            chunkSize: 65536
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

    const sftp = await new Promise((resolve, reject) => {
        conn.sftp((err, sftp) => {
            if (err) reject(err);
            else resolve(sftp);
        });
    });

    console.log('\n=== Step 3: Syncing Database Schemas & Data (Localhost -> Live VPS) ===');
    for (const table of TABLES_TO_SYNC) {
        try {
            const [tables] = await localDb.query(`SHOW TABLES LIKE '${table}'`);
            if (tables.length === 0) continue;

            // 1. Get exact CREATE TABLE statement from local
            const [createRes] = await localDb.query(`SHOW CREATE TABLE \`${table}\``);
            const createSql = createRes[0]['Create Table'];

            // 2. Get all rows from local
            const [rows] = await localDb.query(`SELECT * FROM \`${table}\``);
            console.log(`Table '${table}': found ${rows.length} rows locally.`);

            let tableSql = `SET FOREIGN_KEY_CHECKS=0;\nDROP TABLE IF EXISTS \`${table}\`;\n${createSql};\n`;

            if (rows.length > 0) {
                const columns = Object.keys(rows[0]);
                const escapedCols = columns.map(c => `\`${c}\``).join(', ');
                const chunkSize = 50;

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
                    tableSql += `INSERT INTO \`${table}\` (${escapedCols}) VALUES \n${chunk.join(',\n')};\n`;
                }
            }
            tableSql += `SET FOREIGN_KEY_CHECKS=1;\n`;

            // Write and execute on VPS
            const remoteSqlFile = `/tmp/sync_${table}.sql`;
            await new Promise((resolve, reject) => {
                const stream = sftp.createWriteStream(remoteSqlFile);
                stream.on('close', resolve);
                stream.on('error', reject);
                stream.end(tableSql);
            });

            const importCmd = `mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} < ${remoteSqlFile} && rm -f ${remoteSqlFile}`;
            const importRes = await runCmd(conn, importCmd);
            if (importRes.ok) {
                console.log(`  ✓ Table '${table}' schema & ${rows.length} rows synced successfully!`);
            } else {
                console.error(`  ✗ Error syncing table '${table}':`, importRes.stderr || importRes.stdout);
            }
        } catch (err) {
            console.error(`  ✗ Exception syncing table '${table}':`, err.message);
        }
    }

    console.log('\n=== Step 4: Transferring Media Archive (uploads_images.tar.gz) ===');
    const localArchive = path.join(__dirname, '..', 'uploads_images.tar.gz');
    const remoteArchive = '/home/selectt-api/htdocs/api.selectt.in/uploads_images.tar.gz';
    const remoteUploadsDir = '/home/selectt-api/htdocs/api.selectt.in/public/uploads';

    await runCmd(conn, `mkdir -p ${remoteUploadsDir}`);

    console.log('Uploading archive to VPS...');
    const startTime = Date.now();
    await fastPut(sftp, localArchive, remoteArchive);
    console.log(`Archive uploaded in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    console.log('\n=== Step 5: Extracting Media Archive on VPS ===');
    const extractCmd = `tar -xzf ${remoteArchive} -C ${remoteUploadsDir} && rm -f ${remoteArchive}`;
    const extractRes = await runCmd(conn, extractCmd);
    console.log('Extract status:', extractRes.ok ? 'SUCCESS' : extractRes.stderr);

    const checkCount = await runCmd(conn, `ls -1 ${remoteUploadsDir} | wc -l`);
    console.log(`Total files in VPS uploads directory: ${checkCount.stdout.trim()}`);

    console.log('\n=== Step 6: Deploying Updated index.js to VPS ===');
    const localIndex = path.join(__dirname, '..', 'index.js');
    const remoteIndex = '/home/selectt-api/htdocs/api.selectt.in/index.js';
    await fastPut(sftp, localIndex, remoteIndex);
    console.log('index.js uploaded to VPS.');

    console.log('\n=== Step 7: Restarting PM2 on VPS ===');
    const pm2Cmd = `
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
        cd /home/selectt-api/htdocs/api.selectt.in
        pm2 restart selectt-api || pm2 start index.js --name selectt-api --env production
        pm2 save
        pm2 status
    `;
    const pm2Res = await runCmd(conn, pm2Cmd);
    console.log(pm2Res.stdout || pm2Res.stderr);

    console.log('\n=== Step 8: Live Verification of Live Data on VPS ===');
    const vCmd = `
        echo "=== LIVE BANNERS IN VPS DB ==="
        mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "SELECT page, type, title, subtitle, image_url FROM banners;" 2>/dev/null
        echo "=== LIVE CARS IN VPS DB ==="
        mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "SELECT id, make, model, year, price, location, image FROM cars;" 2>/dev/null
        echo "=== LIVE BRANDS IN VPS DB ==="
        mysql -u ${VPS_DB_CONFIG.user} -p'${VPS_DB_CONFIG.pass}' ${VPS_DB_CONFIG.db} -e "SELECT id, name, logo_url FROM brands;" 2>/dev/null
    `;
    const vRes = await runCmd(conn, vCmd);
    console.log(vRes.stdout);

    await localDb.end();
    conn.end();
    console.log('\n=============================================');
    console.log('🎉 ALL LIVE DATA, IMAGES & BANNERS FULLY SYNCED!');
    console.log('=============================================');
}

main().catch(err => {
    console.error('Fatal error during deploy:', err);
    process.exit(1);
});
