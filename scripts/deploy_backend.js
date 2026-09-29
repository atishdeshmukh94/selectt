const { Client } = require('ssh2');
const path = require('path');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH connection ready. Uploading backend files...');
  conn.sftp((err, sftp) => {
    if (err) throw err;

    const filesToUpload = [
      { local: path.join(__dirname, '../backend/index.js'), remote: '/home/selectt-api/htdocs/api.selectt.in/index.js' },
      { local: path.join(__dirname, '../backend/meta-catalog-service.js'), remote: '/home/selectt-api/htdocs/api.selectt.in/meta-catalog-service.js' }
    ];

    let completed = 0;
    filesToUpload.forEach(f => {
      sftp.fastPut(f.local, f.remote, {}, (err) => {
        if (err) {
          console.error(`SFTP upload error for ${f.local}:`, err);
          conn.end();
          return;
        }
        console.log(`Uploaded ${path.basename(f.local)} successfully.`);
        completed++;
        if (completed === filesToUpload.length) {
          console.log('All files uploaded. Restarting PM2 process...');
          const restartCmd = 'export PATH=$PATH:~/.nvm/versions/node/v24.21.0/bin; pm2 restart selectt-api';
          conn.exec(restartCmd, (err, stream) => {
            if (err) throw err;
            let out = '';
            stream.on('close', (code) => {
              console.log(`PM2 restart finished with code ${code}`);
              console.log(out);
              conn.end();
            }).on('data', (d) => { out += d; })
              .stderr.on('data', (d) => { out += d; });
          });
        }
      });
    });
  });
}).on('error', (err) => {
  console.error('SSH error:', err);
}).connect({
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
});
