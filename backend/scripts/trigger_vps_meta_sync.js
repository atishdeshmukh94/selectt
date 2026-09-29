const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS_SSH = {
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
};

const localSyncScript = fs.readFileSync(path.join(__dirname, 'sync_meta_catalog.js'), 'utf8');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection established');
  conn.sftp((err, sftp) => {
    if (err) throw err;

    const stream = sftp.createWriteStream('/home/selectt-api/htdocs/api.selectt.in/sync_meta_catalog.js');
    stream.on('close', () => {
      console.log('Uploaded sync_meta_catalog.js to VPS');
      const cmd = `
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
        cd /home/selectt-api/htdocs/api.selectt.in
        node sync_meta_catalog.js
      `;
      conn.exec(cmd, (err2, stream2) => {
        if (err2) throw err2;
        stream2.on('data', d => process.stdout.write(d));
        stream2.stderr.on('data', d => process.stderr.write(d));
        stream2.on('close', () => {
          console.log('\nMeta Catalog Sync Finished!');
          conn.end();
        });
      });
    });
    stream.end(localSyncScript);
  });
}).connect(VPS_SSH);
