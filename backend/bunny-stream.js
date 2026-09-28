const axios = require('axios');
const fs = require('fs');

const BASE_API_URL = 'https://video.bunnycdn.com';

function getBunnyConfig(customConfig = null) {
  return {
    libraryId: (customConfig?.libraryId || process.env.BUNNY_STREAM_LIBRARY_ID || '').trim(),
    apiKey: (customConfig?.apiKey || process.env.BUNNY_STREAM_API_KEY || '').trim(),
    cdnHostname: (customConfig?.cdnHostname || process.env.BUNNY_STREAM_CDN_HOSTNAME || 'iframe.mediadelivery.net').trim()
  };
}

/**
 * Creates a video entry in the Bunny Stream video library
 */
async function createVideo({ title, collectionId, customConfig = null }) {
  const { libraryId, apiKey } = getBunnyConfig(customConfig);
  if (!libraryId || !apiKey) {
    throw new Error('Bunny Stream credentials not configured (Library ID & API Key are required).');
  }

  const payload = { title: title || `Video_${Date.now()}` };
  if (collectionId) payload.collectionId = collectionId;

  const response = await axios.post(
    `${BASE_API_URL}/library/${libraryId}/videos`,
    payload,
    {
      headers: {
        AccessKey: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }
  );

  return response.data;
}

/**
 * Uploads a video binary file buffer or readable stream to Bunny Stream
 */
async function uploadVideoBinary({ videoId, videoBuffer, customConfig = null }) {
  const { libraryId, apiKey } = getBunnyConfig(customConfig);
  if (!libraryId || !apiKey) {
    throw new Error('Bunny Stream credentials not configured.');
  }

  const response = await axios.put(
    `${BASE_API_URL}/library/${libraryId}/videos/${videoId}`,
    videoBuffer,
    {
      headers: {
        AccessKey: apiKey,
        'Content-Type': 'application/octet-stream'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    }
  );

  return response.data;
}

/**
 * Complete helper to create & upload a video in one step
 */
async function createAndUploadVideo({ title, fileBuffer, collectionId, customConfig = null }) {
  const { libraryId, cdnHostname } = getBunnyConfig(customConfig);
  const videoObj = await createVideo({ title, collectionId, customConfig });
  const videoId = videoObj.guid;

  await uploadVideoBinary({ videoId, videoBuffer: fileBuffer, customConfig });

  return {
    videoId,
    title: videoObj.title,
    libraryId,
    embedUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`,
    hlsUrl: `https://${cdnHostname}/${videoId}/playlist.m3u8`,
    thumbnailUrl: `https://${cdnHostname}/${videoId}/thumbnail.jpg`,
    status: videoObj.status
  };
}

/**
 * Fetches video metadata and encoding status from Bunny Stream
 */
async function getVideoStatus(videoId, customConfig = null) {
  const { libraryId, apiKey } = getBunnyConfig(customConfig);
  if (!libraryId || !apiKey) {
    throw new Error('Bunny Stream credentials not configured.');
  }

  const response = await axios.get(
    `${BASE_API_URL}/library/${libraryId}/videos/${videoId}`,
    {
      headers: {
        AccessKey: apiKey,
        Accept: 'application/json'
      }
    }
  );

  return response.data;
}

/**
 * Tests connection to Bunny Stream Video Library
 */
async function testBunnyConnection({ libraryId, apiKey }) {
  if (!libraryId || !apiKey) {
    throw new Error('Please provide both Library ID and API Key.');
  }

  const response = await axios.get(
    `${BASE_API_URL}/library/${libraryId}`,
    {
      headers: {
        AccessKey: apiKey,
        Accept: 'application/json'
      }
    }
  );

  return {
    success: true,
    message: 'Bunny Stream library verified successfully!',
    name: response.data.Name,
    storageUsage: response.data.StorageUsage
  };
}

/**
 * Deletes a video from Bunny Stream library
 */
async function deleteVideo(videoId, customConfig = null) {
  const { libraryId, apiKey } = getBunnyConfig(customConfig);
  if (!libraryId || !apiKey) {
    throw new Error('Bunny Stream credentials not configured.');
  }

  const response = await axios.delete(
    `${BASE_API_URL}/library/${libraryId}/videos/${videoId}`,
    {
      headers: {
        AccessKey: apiKey,
        Accept: 'application/json'
      }
    }
  );

  return response.data;
}

/**
 * Helper to delete a video from Bunny Stream using full embed URL, HLS URL, or video GUID
 */
async function deleteFromBunnyStream(videoUrlOrId, customConfig = null) {
  if (!videoUrlOrId || typeof videoUrlOrId !== 'string') return;
  try {
    const raw = videoUrlOrId.trim();
    if (!raw) return;

    // Extract UUID format (guid)
    const uuidMatch = raw.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    let videoId = uuidMatch ? uuidMatch[0] : null;

    if (!videoId && raw.includes('/embed/')) {
      const parts = raw.split('/embed/')[1].split('?')[0].split('/');
      videoId = parts[parts.length - 1];
    }

    if (videoId && videoId.length > 20) {
      await deleteVideo(videoId, customConfig);
      console.log(`[BunnyStream] Deleted video: ${videoId}`);
    }
  } catch (err) {
    console.warn(`[BunnyStream] Deletion warning for "${videoUrlOrId}":`, err.message);
  }
}

module.exports = {
  createVideo,
  uploadVideoBinary,
  createAndUploadVideo,
  getVideoStatus,
  testBunnyConnection,
  deleteVideo,
  deleteFromBunnyStream,
  getBunnyConfig
};

