const { Client } = require('ssh2');
const mysql = require('mysql2/promise');

async function cleanLocal() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'selectt-db'
    });
    const [rows] = await conn.execute("SELECT id, more_images FROM cars WHERE more_images IS NOT NULL;");
    for (const r of rows) {
      if (!r.more_images) continue;
      try {
        const arr = typeof r.more_images === 'string' ? JSON.parse(r.more_images) : r.more_images;
        if (Array.isArray(arr)) {
          const cleaned = arr.filter(url => typeof url === 'string' && !url.endsWith('.mp4') && !url.endsWith('.mov') && !url.endsWith('.webm') && !url.includes('iframe.mediadelivery.net'));
          await conn.execute("UPDATE cars SET more_images = ? WHERE id = ?", [JSON.stringify(cleaned), r.id]);
        }
      } catch(e) {}
    }
    console.log('Local DB more_images cleaned of video files!');
    await conn.end();
  } catch(e) {
    console.warn('Local DB error:', e.message);
  }
}

function cleanVPS() {
  const conn = new Client();
  conn.on('ready', () => {
    const sql = `
      SELECT id, more_images FROM cars WHERE more_images IS NOT NULL;
    `;
    conn.exec(`mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "SELECT id, more_images FROM cars WHERE more_images IS NOT NULL;"`, async (err, stream) => {
      if (err) throw err;
      let data = '';
      stream.on('data', d => data += d);
      stream.on('close', async () => {
        const lines = data.split('\n').filter(l => l.trim().length > 0);
        const header = lines.shift();
        let updateSql = '';
        for (const l of lines) {
          const firstTab = l.indexOf('\t');
          if (firstTab === -1) continue;
          const id = l.substring(0, firstTab).trim();
          const moreImagesStr = l.substring(firstTab + 1).trim();
          try {
            const arr = JSON.parse(moreImagesStr);
            if (Array.isArray(arr)) {
              const cleaned = arr.filter(url => typeof url === 'string' && !url.endsWith('.mp4') && !url.endsWith('.mov') && !url.endsWith('.webm') && !url.includes('iframe.mediadelivery.net'));
              const jsonVal = JSON.stringify(cleaned).replace(/'/g, "\\'");
              updateSql += `UPDATE cars SET more_images = '${jsonVal}' WHERE id = ${id}; `;
            }
          } catch(e) {}
        }
        if (updateSql) {
          conn.exec(`mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "${updateSql}"`, (err2, stream2) => {
            if (err2) throw err2;
            stream2.on('close', () => {
              console.log('VPS DB more_images cleaned of video files successfully!');
              conn.end();
            });
          });
        } else {
          conn.end();
        }
      });
    });
  }).connect({
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
  });
}

cleanLocal().then(() => cleanVPS());
