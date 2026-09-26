const { Client } = require('ssh2');
const path = require('path');

const REMOTE_BASE = '/home/selectt-api/htdocs/api.selectt.in';
const LOCAL_BACKEND = path.join(__dirname, '..');

const conn = new Client();

conn.on('ready', () => {
    conn.sftp((err, sftp) => {
        if (err) throw err;

        sftp.fastPut(path.join(LOCAL_BACKEND, 'meta-catalog-service.js'), `${REMOTE_BASE}/meta-catalog-service.js`, (uploadErr) => {
            if (uploadErr) throw uploadErr;
            console.log('Uploaded meta-catalog-service.js successfully!');

            const cmd = `
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                pm2 restart selectt-api
                sleep 2
                pm2 status
                curl -s http://127.0.0.1:5000/health || curl -s http://127.0.0.1:3000/health
            `;

            conn.exec(cmd, (execErr, stream) => {
                if (execErr) throw execErr;
                stream.on('data', d => process.stdout.write(d));
                stream.on('close', () => conn.end());
            });
        });
    });
}).connect({
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
});
