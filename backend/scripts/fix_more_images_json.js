const mysql = require('mysql2/promise');

async function fixDb() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'selectt-db'
  });

  const [rows] = await conn.execute("SELECT id, more_images FROM cars;");
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
  console.log('Fixed local DB more_images!');
  await conn.end();
}

fixDb().catch(console.error);
