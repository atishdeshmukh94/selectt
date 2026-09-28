const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BUNNY_CONFIG = {
    libraryId: process.env.BUNNY_STREAM_LIBRARY_ID || '762989',
    apiKey: process.env.BUNNY_STREAM_API_KEY || 'bdeb8046-5192-47f1-bcfdeaf48d97-ef01-4450',
    cdnHostname: process.env.BUNNY_STREAM_CDN_HOSTNAME || 'vz-0ed4d2e7-46d.b-cdn.net'
};

const LOCAL_UPLOADS = path.join(__dirname, '..', 'public', 'uploads');

async function uploadAllVideosToBunny() {
    console.log(`--- Starting Dedicated Bunny Stream Upload ---`);
    console.log(`Target Library ID: ${BUNNY_CONFIG.libraryId}`);

    const files = fs.readdirSync(LOCAL_UPLOADS).filter(f => f.endsWith('.mp4'));
    console.log(`Found ${files.length} MP4 videos to upload.`);

    for (const file of files) {
        const filePath = path.join(LOCAL_UPLOADS, file);
        const stats = fs.statSync(filePath);
        const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
        const title = file.replace('.mp4', '');

        try {
            console.log(`[UPLOADING] ${file} (${sizeMb} MB) to Bunny.net Stream...`);

            // 1. Create Video
            const createRes = await axios.post(
                `https://video.bunnycdn.com/library/${BUNNY_CONFIG.libraryId}/videos`,
                { title },
                {
                    headers: {
                        AccessKey: BUNNY_CONFIG.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const videoId = createRes.data.guid;

            // 2. Upload binary
            const fileStream = fs.createReadStream(filePath);
            await axios.put(
                `https://video.bunnycdn.com/library/${BUNNY_CONFIG.libraryId}/videos/${videoId}`,
                fileStream,
                {
                    headers: {
                        AccessKey: BUNNY_CONFIG.apiKey,
                        'Content-Type': 'application/octet-stream'
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            );

            const embedUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_CONFIG.libraryId}/${videoId}`;
            console.log(`✓ [SUCCESS] ${file} uploaded to Bunny! Video ID: ${videoId}`);
            console.log(`  Embed URL: ${embedUrl}`);
        } catch (err) {
            console.error(`Failed ${file}:`, err.response?.data || err.message);
        }
    }

    console.log('--- All videos uploaded to Bunny.net Stream! ---');
}

uploadAllVideosToBunny();
