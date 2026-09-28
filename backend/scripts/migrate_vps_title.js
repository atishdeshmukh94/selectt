const { Client } = require('ssh2');

const VPS_SSH = {
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
};

const scriptCode = `
require('dotenv').config({ path: '/home/selectt-api/htdocs/api.selectt.in/.env' });
const mysql = require('mysql2/promise');
(async () => {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASS || process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    const [cols] = await db.query("SHOW COLUMNS FROM cars LIKE 'title'");
    if (cols.length === 0) {
      await db.query("ALTER TABLE cars ADD COLUMN title VARCHAR(255) NULL AFTER id");
      console.log('✓ Added title column on VPS');
    } else {
      console.log('ℹ title column already exists on VPS');
    }
    await db.query("UPDATE cars SET title = TRIM(CONCAT_WS(' ', year, make, model, variant)) WHERE title IS NULL OR title = ''");
    console.log('✓ Populated titles on VPS');
    const [rows] = await db.query("SELECT id, title, make, model FROM cars LIMIT 5");
    console.log('Sample cars on VPS:', rows);
    await db.end();
    process.exit(0);
  } catch(e) {
    console.error('VPS error:', e);
    process.exit(1);
  }
})();
`;

const escapedScript = Buffer.from(scriptCode).toString('base64');
const cmd = `export PATH=/home/selectt-api/.nvm/versions/node/v24.21.0/bin:$PATH && cd /home/selectt-api/htdocs/api.selectt.in && node -e "eval(Buffer.from('${escapedScript}', 'base64').toString('utf8'))"`;

const conn = new Client();
conn.on('ready', () => {
  console.log('✓ SSH connected to VPS');
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('VPS Result:\n', out);
      conn.end();
    });
  });
}).connect(VPS_SSH);
