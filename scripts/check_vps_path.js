const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('ls -la /home/selectt-api/htdocs; export PATH=$PATH:~/.nvm/versions/node/$(ls ~/.nvm/versions/node 2>/dev/null | tail -n 1)/bin; which node; which pm2; pm2 list', (err, stream) => {
    let out = '';
    stream.on('close', () => {
      console.log(out);
      conn.end();
    }).on('data', d => { out += d; }).stderr.on('data', d => { out += d; });
  });
}).connect({
  host: '200.97.166.12',
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
});
