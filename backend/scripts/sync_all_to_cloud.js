const fs = require('fs');
const path = require('path');
const ImageKit = require('imagekit');
const axios = require('axios');
const mysql = require('mysql2/promise');

// 1. ImageKit Configuration
const ik = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_6cuIDfKYa22dql//M1rxKCv0Y0o=',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_zhPh1CfqVPsDiqwgzth5v3auCAo=',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/selectt'
});

// 2. Bunny Stream Configuration
const BUNNY_CONFIG = {
    libraryId: process.env.BUNNY_STREAM_LIBRARY_ID || '762989',
    apiKey: process.env.BUNNY_STREAM_API_KEY || 'bdeb8046-5192-47f1-bcfdeaf48d97-ef01-4450',
    cdnHostname: process.env.BUNNY_STREAM_CDN_HOSTNAME || 'vz-0ed4d2e7-46d.b-cdn.net'
};

const LOCAL_UPLOADS = path.join(__dirname, '..', 'public', 'uploads');

async function syncAllCarMedia() {
    console.log('--- Starting Cloud Media Synchronization ---');
    console.log(`Checking local directory: ${LOCAL_UPLOADS}`);

    if (!fs.existsSync(LOCAL_UPLOADS)) {
        console.error('Local uploads folder not found!');
        return;
    }

    const allFiles = fs.readdirSync(LOCAL_UPLOADS);
    const imageFiles = allFiles.filter(f => f.startsWith('car_') && (f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png')));
    const videoFiles = allFiles.filter(f => f.startsWith('car_') && f.endsWith('.mp4'));

    console.log(`Found ${imageFiles.length} car image files to sync to ImageKit.`);
    console.log(`Found ${videoFiles.length} car video files to sync to Bunny.net Stream.`);

    // 1. Fetch already existing files in ImageKit folder to avoid duplicate uploads
    console.log('\n[1/3] Fetching existing ImageKit files in /selectt/uploads...');
    const existingIkNames = new Set();
    try {
        let skip = 0;
        let hasMore = true;
        while (hasMore) {
            const list = await ik.listFiles({
                path: '/selectt/uploads',
                limit: 100,
                skip: skip
            });
            list.forEach(item => existingIkNames.add(item.name));
            if (list.length < 100) {
                hasMore = false;
            } else {
                skip += 100;
            }
        }
        console.log(`Found ${existingIkNames.size} existing files in ImageKit.`);
    } catch (e) {
        console.warn('Could not fetch existing ImageKit list:', e.message);
    }

    // 2. Upload Car Images to ImageKit in parallel batches of 5
    console.log('\n[2/3] Uploading car images to ImageKit...');
    const batchSize = 5;
    let uploadedImagesCount = 0;

    for (let i = 0; i < imageFiles.length; i += batchSize) {
        const chunk = imageFiles.slice(i, i + batchSize);
        await Promise.all(chunk.map(async (fileName) => {
            if (existingIkNames.has(fileName)) {
                console.log(`[SKIP] ImageKit already has: ${fileName}`);
                return;
            }

            const filePath = path.join(LOCAL_UPLOADS, fileName);
            try {
                const fileBuffer = fs.readFileSync(filePath);
                await ik.upload({
                    file: fileBuffer,
                    fileName: fileName,
                    folder: '/selectt/uploads',
                    useUniqueFileName: false
                });
                uploadedImagesCount++;
                console.log(`[UPLOADED -> ImageKit] ${fileName} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
            } catch (err) {
                console.error(`Failed to upload ${fileName} to ImageKit:`, err.message);
            }
        }));
    }

    console.log(`\n✓ ImageKit sync finished! Uploaded ${uploadedImagesCount} new images.`);

    // 3. Upload Car Videos to Bunny.net Stream
    console.log('\n[3/3] Uploading car videos to Bunny.net Stream...');
    const videoMap = {}; // local filename -> Bunny embed URL

    for (const videoFile of videoFiles) {
        const filePath = path.join(LOCAL_UPLOADS, videoFile);
        const stats = fs.statSync(filePath);
        const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
        const title = videoFile.replace('.mp4', '');

        try {
            console.log(`[UPLOADING -> Bunny.net Stream] ${videoFile} (${sizeMb} MB)...`);

            // Create Video in Bunny library
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

            // Upload binary buffer
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
            videoMap[`/uploads/${videoFile}`] = embedUrl;
            console.log(`✓ [DONE -> Bunny.net Stream] ${videoFile} -> Embed URL: ${embedUrl}`);
        } catch (err) {
            console.error(`Failed to upload ${videoFile} to Bunny Stream:`, err.response?.data || err.message);
        }
    }

    console.log('\n--- ALL MEDIA SUCCESSFULLY SYNCED TO CLOUD! ---');
    console.log('Video Mapping:');
    console.log(JSON.stringify(videoMap, null, 2));
}

syncAllCarMedia();
