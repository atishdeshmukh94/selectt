const { Client } = require('ssh2');

function runSsh(cmd) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(cmd, (err, stream) => {
        if (err) return reject(err);
        let out = '';
        let errOut = '';
        stream.on('close', (code) => {
          conn.end();
          resolve({ code, out, errOut });
        }).on('data', (d) => { out += d; })
          .stderr.on('data', (d) => { errOut += d; });
      });
    }).on('error', reject).connect({
      host: '200.97.166.12',
      port: 22,
      username: 'selectt-api',
      password: 'qdBG7QXFQayXUuwvHPzo'
    });
  });
}

(async () => {
  const queryCmd = `mysql -u selectt-wepnex -p6EVSUZ7RNYA9bV0WUoxy -D connect-db -e "DESCRIBE cars; SELECT id, name, email, role FROM users;"`;
  const res = await runSsh(queryCmd);
  console.log('--- MYSQL OUTPUT ---');
  console.log(res.out || res.errOut);
})();
