const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const REMOTE_BASE = '/home/selectt-api/htdocs/api.selectt.in';
const LOCAL_BACKEND = path.join(__dirname, '..');
const LOCAL_ROOT = path.join(__dirname, '..', '..');

const filesToUpload = [
    { local: path.join(LOCAL_BACKEND, 'index.js'), remote: `${REMOTE_BASE}/index.js` },
    { local: path.join(LOCAL_BACKEND, 'receipt-pdf.js'), remote: `${REMOTE_BASE}/receipt-pdf.js` },
    { local: path.join(LOCAL_BACKEND, 'auth-middleware.js'), remote: `${REMOTE_BASE}/auth-middleware.js` },
    { local: path.join(LOCAL_BACKEND, 'package.json'), remote: `${REMOTE_BASE}/package.json` },
    { local: path.join(LOCAL_BACKEND, 'package-lock.json'), remote: `${REMOTE_BASE}/package-lock.json` },
    { local: path.join(LOCAL_BACKEND, 'ecosystem.config.js'), remote: `${REMOTE_BASE}/ecosystem.config.js` },
    { local: path.join(LOCAL_BACKEND, 'imagekit.js'), remote: `${REMOTE_BASE}/imagekit.js` },
    { local: path.join(LOCAL_BACKEND, 'bunny-stream.js'), remote: `${REMOTE_BASE}/bunny-stream.js` },
    { local: path.join(LOCAL_BACKEND, 'whatsapp-service.js'), remote: `${REMOTE_BASE}/whatsapp-service.js` },
    { local: path.join(LOCAL_BACKEND, 'redis-client.js'), remote: `${REMOTE_BASE}/redis-client.js` },
    { local: path.join(LOCAL_BACKEND, 'fonts', 'NotoSans-Regular.ttf'), remote: `${REMOTE_BASE}/fonts/NotoSans-Regular.ttf` },
    { local: path.join(LOCAL_BACKEND, 'fonts', 'NotoSans-Bold.ttf'), remote: `${REMOTE_BASE}/fonts/NotoSans-Bold.ttf` },
    { local: path.join(LOCAL_BACKEND, 'fonts', 'NotoSansDevanagari.ttf'), remote: `${REMOTE_BASE}/fonts/NotoSansDevanagari.ttf` },
    { local: path.join(LOCAL_BACKEND, 'public', 'img', 'dark-logo.svg'), remote: `${REMOTE_BASE}/public/img/dark-logo.svg` },
    { local: path.join(LOCAL_BACKEND, 'schema.sql'), remote: `${REMOTE_BASE}/schema.sql` },
    { local: path.join(LOCAL_ROOT, 'database.sql'), remote: `${REMOTE_BASE}/database.sql` },
    { local: path.join(LOCAL_BACKEND, '.env.example'), remote: `${REMOTE_BASE}/.env.example` },
];

async function ensureRemoteDir(sftp, remoteDir) {
    return new Promise((resolve) => {
        sftp.mkdir(remoteDir, { mode: 0o775 }, () => resolve());
    });
}

async function uploadFile(sftp, localPath, remotePath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(localPath)) {
            console.warn(`Local file not found: ${localPath}`);
            return resolve();
        }
        sftp.fastPut(localPath, remotePath, (err) => {
            if (err) return reject(err);
            console.log(`Uploaded: ${path.basename(localPath)} -> ${remotePath}`);
            resolve();
        });
    });
}

const conn = new Client();

console.log('Connecting to VPS for SFTP file deployment...');

conn.on('ready', () => {
    console.log('Connected! Opening SFTP channel...');
    conn.sftp(async (err, sftp) => {
        if (err) throw err;

        try {
            await ensureRemoteDir(sftp, `${REMOTE_BASE}/public`);
            await ensureRemoteDir(sftp, `${REMOTE_BASE}/public/uploads`);
            await ensureRemoteDir(sftp, `${REMOTE_BASE}/public/uploads/thumbnails`);
            await ensureRemoteDir(sftp, `${REMOTE_BASE}/public/img`);
            await ensureRemoteDir(sftp, `${REMOTE_BASE}/fonts`);

            for (const f of filesToUpload) {
                await uploadFile(sftp, f.local, f.remote);
            }

            console.log('\nAll core backend files uploaded successfully via SFTP!');

            // Now execute npm install on remote VPS
            console.log('\nRunning npm install on remote VPS...');
            const installCmd = `
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
                export PATH="/home/selectt-api/.nvm/versions/node/v24.21.0/bin:$PATH"
                cd ${REMOTE_BASE}
                npm install --omit=dev
                echo "NPM install finished!"
                pm2 restart selectt-api || pm2 restart all
                pm2 status
            `;

            conn.exec(installCmd, (execErr, stream) => {
                if (execErr) throw execErr;
                stream.on('data', (d) => process.stdout.write(d));
                stream.on('close', (code) => {
                    console.log(`\nRemote NPM install exited with code ${code}`);
                    conn.end();
                });
            });

        } catch (uploadErr) {
            console.error('Upload error:', uploadErr);
            conn.end();
        }
    });
}).connect({
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
});
