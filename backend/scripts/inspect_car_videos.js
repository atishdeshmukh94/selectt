const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("mysql -u selectt-api -p'6a3c631e8da6181f' -e 'SHOW DATABASES;'", (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
});
