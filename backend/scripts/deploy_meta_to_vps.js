const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS_SSH = {
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
};

const token = 'EAIo8QpxjUvIBShFcXMZC7YlPGwBIuMlhJFObguvxS6yvipTWYjBSuY03all2R6qxybMyeyRuThOrXjB5Hl6lKhUc0o50ZA96okACvvdPZBa8rla3ukxqYwSXhKVjDfa5xFBpVeeSVlBpjZB3F1hobJMp6ONoN9HF0UVUO9SRyyRpJx8vlddbqPuWHoxluwZDZD';
const catalogId = '2206855529763290';
const pixelId = '1289001699087868';
const businessId = '535964300375557';

const localIndex = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const localMetaService = fs.readFileSync(path.join(__dirname, '..', 'meta-catalog-service.js'), 'utf8');

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH connection established');
    conn.sftp((err, sftp) => {
        if (err) throw err;

        // 1. Upload meta-catalog-service.js
        const metaStream = sftp.createWriteStream('/home/selectt-api/htdocs/api.selectt.in/meta-catalog-service.js');
        metaStream.on('close', () => {
            console.log('✓ Uploaded meta-catalog-service.js to VPS');

            // 2. Upload index.js
            const indexStream = sftp.createWriteStream('/home/selectt-api/htdocs/api.selectt.in/index.js');
            indexStream.on('close', () => {
                console.log('✓ Uploaded index.js to VPS');

                // 3. Update DB & restart PM2 on VPS
                const nodeScript = `
require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS || process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  const entries = [
    ['meta_catalog_id', '${catalogId}'],
    ['meta_secondary_catalog_id', '1096255408500197'],
    ['meta_access_token', '${token}'],
    ['meta_pixel_id', '${pixelId}'],
    ['meta_business_id', '${businessId}'],
    ['meta_catalog_auto_sync', 'true'],
    ['meta_catalog_fallback_brand', 'Selectt Cars'],
    ['meta_catalog_currency', 'INR']
  ];
  for (const [k, v] of entries) {
    await db.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [k, v, v]);
  }
  console.log('✅ DB settings updated successfully on live server');
  await db.end();
})();
`;
                const escapedScript = Buffer.from(nodeScript).toString('base64');
                const cmd = `export PATH=/home/selectt-api/.nvm/versions/node/v24.21.0/bin:$PATH && cd /home/selectt-api/htdocs/api.selectt.in && node -e "eval(Buffer.from('${escapedScript}', 'base64').toString('utf8'))" && pm2 restart selectt-api && pm2 status`;

                conn.exec(cmd, (err2, stream2) => {
                    if (err2) throw err2;
                    let out = '';
                    stream2.on('data', d => out += d);
                    stream2.stderr.on('data', d => out += d);
                    stream2.on('close', () => {
                        console.log('Remote execution output:\n' + out);
                        conn.end();
                        process.exit(0);
                    });
                });
            });
            indexStream.end(localIndex);
        });
        metaStream.end(localMetaService);
    });
}).connect(VPS_SSH);
