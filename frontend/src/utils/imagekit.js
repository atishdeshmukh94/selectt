/**
 * ImageKit CDN URL Generator & Optimizer for Frontend
 */

const IMAGEKIT_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/selectt';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Transforms an image URL or relative path into an optimized ImageKit CDN URL
 * @param {string} src - Image path or full URL
 * @param {Object} [options] - Transformations (width, height, quality, format)
 * @returns {string} Optimized CDN URL
 */
export function getOptimizedImageUrl(src, options = {}) {
  if (!src) return '';

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    blur,
    crop
  } = options;

  // Build ImageKit transformation string
  const trList = [];
  if (width) trList.push(`w-${width}`);
  if (height) trList.push(`h-${height}`);
  if (quality) trList.push(`q-${quality}`);
  if (format) trList.push(`f-${format}`);
  if (blur) trList.push(`bl-${blur}`);
  if (crop) trList.push(`c-${crop}`);

  const trQuery = trList.length > 0 ? `?tr=${trList.join(',')}` : '';

  // Case 1: Already an ImageKit URL
  if (src.includes('ik.imagekit.io')) {
    const cleanUrl = src.split('?')[0];
    return `${cleanUrl}${trQuery}`;
  }

  // Case 2: Relative backend path (/uploads/car-123.webp)
  if (src.startsWith('/uploads/') || src.startsWith('uploads/')) {
    const cleanPath = src.startsWith('/') ? src : `/${src}`;
    // If ImageKit endpoint is configured, pull via ImageKit CDN
    if (IMAGEKIT_ENDPOINT && !IMAGEKIT_ENDPOINT.includes('localhost')) {
      return `${IMAGEKIT_ENDPOINT.replace(/\/$/, '')}${cleanPath}${trQuery}`;
    }
    return `${API_URL}${cleanPath}`;
  }

  // Case 3: Other full URL
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Case 4: Other relative path
  if (src.startsWith('/')) {
    return `${API_URL}${src}`;
  }

  return src;
}
