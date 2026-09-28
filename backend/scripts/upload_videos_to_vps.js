const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const LOCAL_UPLOADS = path.join(__dirname, '..', 'public', 'uploads');
const REMOTE_UPLOADS = '/home/selectt-api/htdocs/api.selectt.in/public/uploads';

const VPS_CONFIG = {
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
};

async function syncVideos() {
    if (!fs.existsSync(LOCAL_UPLOADS)) {
        console.error('Local uploads directory not found:', LOCAL_UPLOADS);
        return;
    }

    const files = fs.readdirSync(LOCAL_UPLOADS).filter(f => f.endsWith('.mp4') || f.endsWith('.mov') || f.endsWith('.webm'));
    console.log(`Found ${files.length} local video files to check.`);

    const conn = new Client();
    conn.on('ready', () => {
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

                const remoteFileNames = new Set(remoteList.map(r => r.filename));

                for (const file of files) {
                    const localPath = path.join(LOCAL_UPLOADS, file);
                    const remotePath = `${REMOTE_UPLOADS}/${file}`;
                    const stats = fs.statSync(localPath);
                    const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);

                    if (remoteFileNames.has(file)) {
                        console.log(`[SKIP] Already exists on VPS: ${file} (${sizeMb} MB)`);
                        continue;
                    }

                    console.log(`[UPLOADING] ${file} (${sizeMb} MB)...`);
                    await new Promise((resolve) => {
                        sftp.fastPut(localPath, remotePath, (uploadErr) => {
                            if (uploadErr) {
                                console.error(`Failed to upload ${file}:`, uploadErr);
                            } else {
                                console.log(`[DONE] Uploaded ${file} (${sizeMb} MB)`);
                            }
                            resolve();
                        });
                    });
                }

                console.log('All video uploads complete!');
                conn.end();
            });
        });
    }).connect(VPS_CONFIG);
}

syncVideos();
