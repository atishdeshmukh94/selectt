const mysql = require('mysql2/promise');
const { Client } = require('ssh2');
require('dotenv').config({ path: __dirname + '/../.env' });

const VPS_SSH = {
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
};

async function migrate() {
  console.log('1. Migrating local database...');
  try {
    const localDb = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'selectt'
    });

    const [cols] = await localDb.query("SHOW COLUMNS FROM cars LIKE 'title'");
    if (cols.length === 0) {
      await localDb.query("ALTER TABLE cars ADD COLUMN title VARCHAR(255) NULL AFTER id");
      console.log('✓ Added `title` column to local cars table');
    } else {
      console.log('ℹ `title` column already exists locally');
    }

    // Populate missing titles
    await localDb.query("UPDATE cars SET title = TRIM(CONCAT(IFNULL(year, ''), ' ', IFNULL(make, ''), ' ', IFNULL(model, ''), ' ', IFNULL(variant, ''))) WHERE title IS NULL OR title = ''");
    console.log('✓ Populated existing car titles locally');
    await localDb.end();
  } catch (err) {
    console.error('Local DB Migration error:', err.message);
  }

  console.log('\n2. Migrating VPS database...');
  const conn = new Client();
  conn.on('ready', () => {
    console.log('✓ Connected to VPS');
    const remoteNode = `
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
    await db.query("UPDATE cars SET title = TRIM(CONCAT(IFNULL(year, ''), ' ', IFNULL(make, ''), ' ', IFNULL(model, ''), ' ', IFNULL(variant, ''))) WHERE title IS NULL OR title = ''");
    console.log('✓ Populated titles on VPS');
    const [rows] = await db.query("SELECT id, title, make, model FROM cars LIMIT 5");
    console.log('Sample cars:', rows);
    await db.end();
    process.exit(0);
  } catch(e) {
    console.error('VPS error:', e);
    process.exit(1);
  }
})();
    `;

    conn.exec(`node -e "${remoteNode.replace(/"/g, '\\"')}"`, (err, stream) => {
      if (err) throw err;
      let output = '';
      stream.on('data', (d) => output += d);
      stream.on('close', (code) => {
        console.log('VPS Migration Result:\n', output);
        conn.end();
      });
    });
  }).connect(VPS_SSH);
}

migrate();
