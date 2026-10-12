const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const LOCAL_UPLOADS = path.resolve(__dirname, '../public/uploads');
const REMOTE_UPLOADS = '/home/selectt-api/htdocs/api.selectt.in/public/uploads';

const VPS_CONFIG = {
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
};

async function syncImages() {
    if (!fs.existsSync(LOCAL_UPLOADS)) {
        console.error('Local uploads not found:', LOCAL_UPLOADS);
        return;
    }

    const allLocal = fs.readdirSync(LOCAL_UPLOADS);
    const localImages = allLocal.filter(f => /\.(webp|png|jpe?g|svg|gif)$/i.test(f));
    console.log(`📦 Found ${localImages.length} image files locally in backend/public/uploads`);

    const conn = new Client();
    conn.on('ready', () => {
        console.log('✅ Connected to VPS SSH');
        conn.sftp(async (err, sftp) => {
            if (err) {
                console.error('SFTP error:', err);
                conn.end();
                return;
            }

            sftp.readdir(REMOTE_UPLOADS, async (readdirErr, remoteList) => {
                if (readdirErr) {
                    console.error('Remote readdir error:', readdirErr);
                    conn.end();
                    return;
                }

                const remoteSet = new Set(remoteList.map(r => r.filename));
                const missing = localImages.filter(f => !remoteSet.has(f));
                console.log(`🔍 Remote already has ${remoteList.length} files. ${missing.length} missing files to upload.`);

                if (missing.length === 0) {
                    console.log('🎉 All files already in sync!');
                    conn.end();
                    return;
                }

                let uploaded = 0;
                const batchSize = 10;
                for (let i = 0; i < missing.length; i += batchSize) {
                    const batch = missing.slice(i, i + batchSize);
                    await Promise.all(batch.map((file) => {
                        return new Promise((resolve) => {
                            const localPath = path.join(LOCAL_UPLOADS, file);
                            const remotePath = `${REMOTE_UPLOADS}/${file}`;
                            sftp.fastPut(localPath, remotePath, (upErr) => {
                                if (upErr) {
                                    console.error(`\n❌ Failed to upload ${file}:`, upErr.message);
                                } else {
                                    uploaded++;
                                }
                                resolve();
                            });
                        });
                    }));
                    process.stdout.write(`\r📤 Progress: ${uploaded}/${missing.length} images uploaded...`);
                }

                console.log(`\n✅ Completed! Successfully uploaded ${uploaded} images to live server.`);
                conn.end();
            });
        });
    }).connect(VPS_CONFIG);
}

syncImages();
