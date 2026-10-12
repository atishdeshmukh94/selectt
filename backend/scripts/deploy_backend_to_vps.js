const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS SSH.');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    const localIndex = path.join(__dirname, '../index.js');
    const remoteIndex = '/home/selectt-api/htdocs/api.selectt.in/index.js';
    const localWa = path.join(__dirname, '../whatsapp-service.js');
    const remoteWa = '/home/selectt-api/htdocs/api.selectt.in/whatsapp-service.js';

    console.log('Uploading', localIndex, 'to', remoteIndex);
    sftp.fastPut(localIndex, remoteIndex, (putErr) => {
      if (putErr) throw putErr;
      console.log('index.js uploaded successfully!');

      console.log('Uploading', localWa, 'to', remoteWa);
      sftp.fastPut(localWa, remoteWa, (waErr) => {
        if (waErr) console.warn('whatsapp-service.js put err (optional):', waErr.message);
        else console.log('whatsapp-service.js uploaded successfully!');

        const restartCmd = 'export PATH=/home/selectt-api/.nvm/versions/node/v24.21.0/bin:$PATH; pm2 reload selectt-api || pm2 restart selectt-api';
        conn.exec(restartCmd, (execErr, stream) => {
          if (execErr) throw execErr;
          stream.on('data', d => process.stdout.write(d));
          stream.stderr.on('data', d => process.stderr.write(d));
          stream.on('close', code => {
            console.log('PM2 restart finished with exit code:', code);
            conn.end();
          });
        });
      });
    });
  });
}).connect({
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
});
