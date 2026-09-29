const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected. Fetching cars...');
  
  conn.exec("mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e \"SELECT id, make, model, video_url, more_images FROM cars;\"", (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('data', d => data += d.toString());
    stream.on('close', async () => {
      const lines = data.trim().split('\n');
      if (lines.length <= 1) {
        console.log('No cars found.');
        conn.end();
        return;
      }

      const headers = lines[0].split('\t');
      const cars = lines.slice(1).map(l => {
        const parts = l.split('\t');
        return {
          id: parts[0],
          make: parts[1],
          model: parts[2],
          video_url: parts[3] === 'NULL' ? null : parts[3],
          more_images: parts[4] === 'NULL' ? null : parts[4]
        };
      });

      console.log(`Found ${cars.length} cars. Processing...`);

      const isVideoUrl = (url) => {
        if (!url || typeof url !== 'string') return false;
        const u = url.trim().toLowerCase();
        return u.includes('iframe.mediadelivery.net') ||
               u.includes('b-cdn.net') ||
               u.includes('bunnycdn.com') ||
               u.includes('youtube.com') ||
               u.includes('youtu.be') ||
               u.endsWith('.mp4') ||
               u.endsWith('.mov') ||
               u.endsWith('.webm') ||
               u.includes('.mp4?') ||
               u.includes('.mov?');
      };

      const updates = [];

      for (const car of cars) {
        if (!car.more_images) continue;
        try {
          const parsed = JSON.parse(car.more_images);
          if (!Array.isArray(parsed)) continue;

          const videosInGallery = parsed.filter(isVideoUrl);
          const cleanImages = parsed.filter(u => !isVideoUrl(u));

          let newVideoUrl = car.video_url;
          if (!newVideoUrl && videosInGallery.length > 0) {
            newVideoUrl = videosInGallery[0];
          }

          if (cleanImages.length !== parsed.length || (!car.video_url && newVideoUrl)) {
            updates.push({
              id: car.id,
              make: car.make,
              model: car.model,
              old_images_count: parsed.length,
              new_images_count: cleanImages.length,
              new_video_url: newVideoUrl,
              new_more_images: JSON.stringify(cleanImages)
            });
          }
        } catch (e) {
          // ignore non-json
        }
      }

      console.log(`Found ${updates.length} cars needing updates.`);

      if (updates.length === 0) {
        conn.end();
        return;
      }

      let sqlStatements = '';
      for (const u of updates) {
        const escapedImages = u.new_more_images.replace(/'/g, "\\'");
        const escapedVideo = u.new_video_url ? `'${u.new_video_url.replace(/'/g, "\\'")}'` : 'NULL';
        sqlStatements += `UPDATE cars SET more_images = '${escapedImages}', video_url = ${escapedVideo} WHERE id = ${u.id}; `;
      }

      conn.exec(`mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "${sqlStatements}"`, (err2, stream2) => {
        if (err2) throw err2;
        stream2.on('data', d => process.stdout.write(d));
        stream2.on('close', () => {
          console.log('Successfully updated cars on VPS!');
          conn.exec("mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e \"SELECT id, make, model, video_url, more_images FROM cars WHERE id = 41;\"", (err3, stream3) => {
            stream3.on('data', d => process.stdout.write(d));
            stream3.on('close', () => conn.end());
          });
        });
      });
    });
  });
}).connect({
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
});
