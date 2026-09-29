const { Client } = require('ssh2');
const { formatCarForMeta, generateMetaCatalogXml } = require('../meta-catalog-service');

const conn = new Client();
conn.on('ready', () => {
  conn.exec("mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e \"SELECT * FROM cars WHERE id=41;\"", (err, stream) => {
    let data = '';
    stream.on('data', d => data += d.toString());
    stream.on('close', () => {
      const lines = data.trim().split('\n');
      const headers = lines[0].split('\t');
      const row = lines[1].split('\t');
      const car = {};
      headers.forEach((h, idx) => car[h] = row[idx]);
      console.log('Car from DB:', { id: car.id, video_url: car.video_url, more_images: car.more_images });
      const item = formatCarForMeta(car, 'https://selectt.in');
      console.log('Formatted item video_link:', item.video_link);
      const xml = generateMetaCatalogXml([car], 'https://selectt.in');
      console.log('Generated XML snippet:\n', xml);
      conn.end();
    });
  });
}).connect({
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
});
