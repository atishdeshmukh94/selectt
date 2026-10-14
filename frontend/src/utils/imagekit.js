/**
 * ImageKit CDN URL Generator & Optimizer for Frontend
 */

import { API_URL, CDN_URL } from '../config/api';

const IMAGEKIT_ENDPOINT = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '').trim();

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

  // Case 2: Rewrite VPS direct upload URL to CDN
  if (src.startsWith('https://api.selectt.in/uploads/')) {
    const relativePart = src.replace('https://api.selectt.in', '');
    if (IMAGEKIT_ENDPOINT && !IMAGEKIT_ENDPOINT.includes('localhost')) {
      return `${IMAGEKIT_ENDPOINT.replace(/\/$/, '')}${relativePart}${trQuery}`;
    }
    return `${CDN_URL || API_URL}${relativePart}`;
  }

  // Case 3: Relative backend path (/uploads/car-123.webp)
  if (src.startsWith('/uploads/') || src.startsWith('uploads/')) {
    const cleanPath = src.startsWith('/') ? src : `/${src}`;
    // If ImageKit endpoint is configured, pull via ImageKit CDN
    if (IMAGEKIT_ENDPOINT && !IMAGEKIT_ENDPOINT.includes('localhost')) {
      return `${IMAGEKIT_ENDPOINT.replace(/\/$/, '')}${cleanPath}${trQuery}`;
    }
    return `${CDN_URL || API_URL}${cleanPath}`;
  }

  // Case 4: Other full URL
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Case 5: Other relative path
  if (src.startsWith('/')) {
    return `${CDN_URL || API_URL}${src}`;
  }

  return src;
}
