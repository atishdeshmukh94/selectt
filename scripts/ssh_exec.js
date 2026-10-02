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
  const arg = process.argv[2];
  let cmd = arg;
  if (!cmd) {
    cmd = "echo 'No command specified'";
  } else if (cmd.trim().toUpperCase().startsWith('SELECT') || cmd.trim().toUpperCase().startsWith('UPDATE') || cmd.trim().toUpperCase().startsWith('INSERT') || cmd.trim().toUpperCase().startsWith('SHOW') || cmd.trim().toUpperCase().startsWith('ALTER')) {
    cmd = `mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' -D connect-db -e "${cmd.replace(/"/g, '\\"')}"`;
  }
  const res = await runSsh(cmd);
  if (res.out) console.log(res.out);
  if (res.errOut) console.error(res.errOut);
})();
