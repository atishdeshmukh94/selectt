const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS_SSH = {
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
};

const localIndex = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');

const conn = new Client();
conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;
        const remotePath = '/home/selectt-api/htdocs/api.selectt.in/index.js';
        const writeStream = sftp.createWriteStream(remotePath);
        writeStream.on('close', () => {
            console.log('Successfully uploaded index.js to VPS');
            const cmd = 'export PATH=/home/selectt-api/.nvm/versions/node/v24.21.0/bin:$PATH && pm2 restart selectt-api && pm2 status';
            conn.exec(cmd, (err2, stream2) => {
                if (err2) throw err2;
                let out = '';
                stream2.on('data', d => out += d);
                stream2.stderr.on('data', d => out += d);
                stream2.on('close', () => {
                    console.log('PM2 restart output:\n' + out);
                    conn.end();
                    process.exit(0);
                });
            });
        });
        writeStream.end(localIndex);
    });
}).connect(VPS_SSH);
