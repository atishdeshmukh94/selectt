const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'selectt-wepnex',
    password: '6EVSUZ7RNYA9bV0WUoxy',
    database: 'connect-db'
  });

  const [rows] = await conn.execute("SELECT id, more_images FROM cars;");
  console.log('Found cars:', rows.length);
  for (const r of rows) {
    if (!r.more_images) continue;
    let images = [];
    if (typeof r.more_images === 'string') {
      try {
        images = JSON.parse(r.more_images);
      } catch {
        const raw = r.more_images.replace(/^\[|\]$/g, '');
        images = raw.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }
    } else if (Array.isArray(r.more_images)) {
      images = r.more_images;
    }
    const cleanImages = images.filter(url => typeof url === 'string' && !url.endsWith('.mp4') && !url.endsWith('.mov') && !url.endsWith('.webm') && !url.includes('iframe.mediadelivery.net'));
    await conn.execute("UPDATE cars SET more_images = ? WHERE id = ?", [JSON.stringify(cleanImages), r.id]);
  }
  console.log('Successfully fixed and sanitized more_images for all cars in connect-db!');
  await conn.end();
}

run().catch(console.error);
