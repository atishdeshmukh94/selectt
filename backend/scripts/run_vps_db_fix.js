const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const fixScript = `
const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'selectt-wepnex',
    password: '6EVSUZ7RNYA9bV0WUoxy',
    database: 'connect-db'
  });
  const [rows] = await conn.execute("SELECT id, more_images FROM cars;");
  for (const r of rows) {
    if (!r.more_images) continue;
    let images = [];
    if (typeof r.more_images === 'string') {
      try {
        images = JSON.parse(r.more_images);
      } catch {
        const raw = r.more_images.replace(/^\\[|\\]$/g, '');
        images = raw.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }
    } else if (Array.isArray(r.more_images)) {
      images = r.more_images;
    }
    const cleanImages = images.filter(url => typeof url === 'string' && !url.endsWith('.mp4') && !url.endsWith('.mov') && !url.endsWith('.webm') && !url.includes('iframe.mediadelivery.net'));
    await conn.execute("UPDATE cars SET more_images = ? WHERE id = ?", [JSON.stringify(cleanImages), r.id]);
  }
  console.log('VPS DB more_images fixed and sanitized successfully!');
  await conn.end();
}
run().catch(console.error);
`;

  conn.exec(`node -e "${fixScript.replace(/"/g, '\\"')}"`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => {
      conn.exec('pm2 restart selectt-api', (pmErr, pmStream) => {
        if (pmErr) throw pmErr;
        pmStream.on('data', d => process.stdout.write(d));
        pmStream.on('close', () => conn.end());
      });
    });
  });
}).connect({
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
});
