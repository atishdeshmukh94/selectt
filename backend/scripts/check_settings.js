const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("mysql -u u111718873_selectt -p'Selectt#2026!' u111718873_selectt -e \"SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE '%og%' OR setting_key LIKE '%logo%' OR setting_key LIKE '%banner%' OR setting_key LIKE '%image%';\"", (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('=== SITE SETTINGS IMAGE KEYS ===');
      console.log(out);
      conn.end();
    });
  });
}).connect({
  host: '200.97.166.12',
  port: 65002,
  username: 'u111718873',
  password: 'Password#2026!'
});
