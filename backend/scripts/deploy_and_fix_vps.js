const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS_SSH = {
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
};

const localIndex = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
const localMetaService = fs.readFileSync(path.join(__dirname, '..', 'meta-catalog-service.js'), 'utf8');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection established');
  conn.sftp((err, sftp) => {
    if (err) throw err;

    console.log('1. Uploading meta-catalog-service.js...');
    const metaStream = sftp.createWriteStream('/home/selectt-api/htdocs/api.selectt.in/meta-catalog-service.js');
    metaStream.on('close', () => {
      console.log('✓ Uploaded meta-catalog-service.js to VPS');

      console.log('2. Uploading index.js...');
      const indexStream = sftp.createWriteStream('/home/selectt-api/htdocs/api.selectt.in/index.js');
      indexStream.on('close', () => {
        console.log('✓ Uploaded index.js to VPS');

        // Fix database more_images JSON and clean video URLs properly via Node mysql2
        const nodeScript = `
require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASS || process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const isVideo = (url) => {
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

    const [cars] = await db.query('SELECT id, make, model, image, video_url, more_images FROM cars');
    console.log('Processing', cars.length, 'cars from DB...');

    for (const car of cars) {
      let imagesArray = [];
      let videoUrl = car.video_url || null;

      if (car.more_images) {
        if (typeof car.more_images === 'string') {
          try {
            imagesArray = JSON.parse(car.more_images);
          } catch (e) {
            // Fix unquoted string format like [/uploads/a.webp,/uploads/b.webp]
            const cleanStr = car.more_images.replace(/^\\[|\\]$/g, '').trim();
            if (cleanStr) {
              imagesArray = cleanStr.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
            }
          }
        } else if (Array.isArray(car.more_images)) {
          imagesArray = car.more_images;
        }
      }

      if (!Array.isArray(imagesArray)) imagesArray = [];

      // Extract videos from gallery if any
      const videosInGallery = imagesArray.filter(isVideo);
      const cleanPhotos = imagesArray.filter(u => !isVideo(u));

      if (!videoUrl && videosInGallery.length > 0) {
        videoUrl = videosInGallery[0];
      }

      const validJsonString = JSON.stringify(cleanPhotos);
      await db.query('UPDATE cars SET more_images = ?, video_url = ? WHERE id = ?', [validJsonString, videoUrl, car.id]);
      console.log('Fixed car #' + car.id + ' (' + car.make + ' ' + car.model + '): photos count = ' + cleanPhotos.length + ', video = ' + (videoUrl ? 'yes' : 'no'));
    }

    console.log('✅ All cars in database cleaned and normalized with valid JSON!');
    await db.end();
  } catch (err) {
    console.error('❌ Error updating DB:', err);
    process.exit(1);
  }
})();
`;
        const escapedScript = Buffer.from(nodeScript).toString('base64');
        const cmd = `
          export NVM_DIR="$HOME/.nvm"
          [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
          cd /home/selectt-api/htdocs/api.selectt.in
          node -e "eval(Buffer.from('${escapedScript}', 'base64').toString('utf8'))"
          pm2 restart selectt-api
          pm2 status
        `;

        conn.exec(cmd, (err2, stream2) => {
          if (err2) throw err2;
          let out = '';
          stream2.on('data', d => out += d);
          stream2.stderr.on('data', d => out += d);
          stream2.on('close', () => {
            console.log('\nRemote execution output:\n' + out);
            conn.end();
          });
        });
      });
      indexStream.end(localIndex);
    });
    metaStream.end(localMetaService);
  });
}).connect(VPS_SSH);
