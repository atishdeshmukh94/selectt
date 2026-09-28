const ImageKit = require('imagekit');
const fs = require('fs');
const path = require('path');

let activeImageKit = null;

function initImageKit(customConfig = null) {
  const publicKey = customConfig?.publicKey || process.env.IMAGEKIT_PUBLIC_KEY || 'public_6cuIDfKYa22dql//M1rxKCv0Y0o=';
  const privateKey = customConfig?.privateKey || process.env.IMAGEKIT_PRIVATE_KEY || 'private_zhPh1CfqVPsDiqwgzth5v3auCAo=';
  const urlEndpoint = customConfig?.urlEndpoint || process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/selectt';

  if (publicKey && privateKey) {
    try {
      activeImageKit = new ImageKit({
        publicKey: publicKey.trim(),
        privateKey: privateKey.trim(),
        urlEndpoint: urlEndpoint.trim()
      });
      return activeImageKit;
    } catch (err) {
      console.warn('⚠️ ImageKit initialization error:', err.message);
      return null;
    }
  }
  return null;
}

// Initial initialization
initImageKit();

/**
 * Get client-side authentication parameters for secure frontend direct uploads
 */
function getAuthenticationParameters(customConfig = null) {
  const ik = customConfig ? new ImageKit(customConfig) : (activeImageKit || initImageKit());
  if (!ik) {
    throw new Error('ImageKit is not configured. Please enter API keys in Admin Settings.');
  }
  return ik.getAuthenticationParameters();
}

/**
 * Upload a file (Buffer, base64, or local file path) directly to ImageKit CDN
 */
async function uploadToImageKit({ file, fileName, folder = '/selectt', tags = [], customConfig = null }) {
  const ik = customConfig ? new ImageKit(customConfig) : (activeImageKit || initImageKit());
  if (!ik) {
    throw new Error('ImageKit is not configured.');
  }

  const uploadOptions = {
    file,
    fileName: fileName || `media-${Date.now()}`,
    folder,
    tags,
    useUniqueFileName: true
  };

  return await ik.upload(uploadOptions);
}

/**
 * Tests connection to ImageKit with provided or saved credentials
 */
async function testImageKitConnection({ publicKey, privateKey, urlEndpoint }) {
  const testIk = new ImageKit({
    publicKey: (publicKey || '').trim(),
    privateKey: (privateKey || '').trim(),
    urlEndpoint: (urlEndpoint || '').trim()
  });

  // Call listFiles with limit 1 to verify credentials
  const result = await testIk.listFiles({ limit: 1 });
  return { success: true, message: 'ImageKit credentials verified successfully!', count: result.length };
}

/**
 * Helper to generate an optimized transformation URL for any image
 */
function getOptimizedImageUrl(imagePath, transformation = {}) {
  if (!imagePath) return '';
  const ik = activeImageKit || initImageKit();
  if (!ik) return imagePath;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    if (!imagePath.includes('ik.imagekit.io')) {
      return imagePath;
    }
  }

  const defaultTransform = {
    quality: 80,
    format: 'auto',
    ...transformation
  };

  return ik.url({
    path: imagePath.startsWith('/') ? imagePath : `/${imagePath}`,
    transformation: [defaultTransform]
  });
}

/**
 * Deletes an image from ImageKit by URL, filename, path, or fileId
 */
async function deleteFromImageKit(urlOrPath, customConfig = null) {
  if (!urlOrPath || typeof urlOrPath !== 'string') return;
  const ik = customConfig ? new ImageKit(customConfig) : (activeImageKit || initImageKit());
  if (!ik) return;

  try {
    const cleanPath = urlOrPath.split('?')[0].split('#')[0].trim();
    if (!cleanPath) return;

    // Check if directly a 24-char hex fileId
    if (/^[0-9a-fA-F]{24}$/.test(cleanPath)) {
      await ik.deleteFile(cleanPath);
      console.log(`[ImageKit] Deleted file by fileId: ${cleanPath}`);
      return;
    }

    const filename = path.basename(cleanPath);
    if (!filename || filename === '.' || filename === '/') return;

    // Search exact filename in ImageKit
    let files = await ik.listFiles({
      searchQuery: `name = ${JSON.stringify(filename)}`,
      limit: 10
    });

    if (!files || files.length === 0) {
      // Try search by raw name without extension prefix if applicable
      const rawName = path.parse(filename).name;
      if (rawName && rawName.length > 3) {
        files = await ik.listFiles({
          searchQuery: `name : ${JSON.stringify(rawName)}`,
          limit: 10
        });
      }
    }

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.fileId) {
          await ik.deleteFile(file.fileId);
          console.log(`[ImageKit] Deleted file: ${file.name} (fileId: ${file.fileId})`);
        }
      }
    }
  } catch (err) {
    console.warn(`[ImageKit] Deletion warning for "${urlOrPath}":`, err.message);
  }
}

module.exports = {
  imagekit: activeImageKit,
  initImageKit,
  getAuthenticationParameters,
  uploadToImageKit,
  testImageKitConnection,
  getOptimizedImageUrl,
  deleteFromImageKit
};

