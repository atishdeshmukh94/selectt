/**
 * ImageKit CDN URL Generator & Optimizer for Admin Portal
 */

const IMAGEKIT_ENDPOINT = (import.meta as any).env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/selectt';
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  blur?: number;
  crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
}

export function getOptimizedImageUrl(src: string, options: ImageOptions = {}): string {
  if (!src) return '';

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    blur,
    crop
  } = options;

  const trList: string[] = [];
  if (width) trList.push(`w-${width}`);
  if (height) trList.push(`h-${height}`);
  if (quality) trList.push(`q-${quality}`);
  if (format) trList.push(`f-${format}`);
  if (blur) trList.push(`bl-${blur}`);
  if (crop) trList.push(`c-${crop}`);

  const trQuery = trList.length > 0 ? `?tr=${trList.join(',')}` : '';

  if (src.includes('ik.imagekit.io')) {
    const cleanUrl = src.split('?')[0];
    return `${cleanUrl}${trQuery}`;
  }

  if (src.startsWith('/uploads/') || src.startsWith('uploads/')) {
    const cleanPath = src.startsWith('/') ? src : `/${src}`;
    if (IMAGEKIT_ENDPOINT && !IMAGEKIT_ENDPOINT.includes('localhost')) {
      return `${IMAGEKIT_ENDPOINT.replace(/\/$/, '')}${cleanPath}${trQuery}`;
    }
    return `${API_URL}${cleanPath}`;
  }

  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  if (src.startsWith('/')) {
    return `${API_URL}${src}`;
  }

  return src;
}
