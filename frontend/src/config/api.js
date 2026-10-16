const resolveApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://api.selectt.in';
    }
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = resolveApiBaseUrl();
export const API_URL = API_BASE_URL;

const resolveCdnBaseUrl = () => {
  const envCdn = (import.meta.env.VITE_CDN_URL || '').trim();
  if (envCdn) return envCdn;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://selectt-media.b-cdn.net';
    }
  }
  return API_URL || 'http://localhost:5000';
};

export const CDN_URL = resolveCdnBaseUrl();

// Clean neutral white blank placeholder (No 3rd-party stock images)
export const BLANK_WHITE_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" fill="none"><rect width="800" height="500" fill="%23F8FAFC"/><g transform="translate(360, 210)" opacity="0.45" stroke="%2394A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14 16H86L76 6H24L14 16Z"/><circle cx="30" cy="24" r="6"/><circle cx="70" cy="24" r="6"/><path d="M6 16H94V24H6V16Z"/></g></svg>';

export const DEFAULT_CAR_FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%23F1F5F9"/><g transform="translate(250, 160)" stroke="%2394A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14 16H86L76 6H24L14 16Z"/><circle cx="30" cy="24" r="6"/><circle cx="70" cy="24" r="6"/><path d="M6 16H94V24H6V16Z"/></g><text x="300" y="225" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="13" font-weight="600" fill="%2394A3B8" text-anchor="middle">Selectt Certified</text></svg>';

export const DEFAULT_BANNER_FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="280" viewBox="0 0 600 280" fill="none"><rect width="600" height="280" rx="16" fill="%23F8FAFC"/><rect x="1" y="1" width="598" height="278" rx="15" stroke="%23E2E8F0" stroke-width="1.5"/><g transform="translate(260, 100)" opacity="0.4" stroke="%2394A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14 16H86L76 6H24L14 16Z"/><circle cx="30" cy="24" r="6"/><circle cx="70" cy="24" r="6"/><path d="M6 16H94V24H6V16Z"/></g><text x="300" y="165" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="12" font-weight="600" fill="%2394A3B8" text-anchor="middle">Selectt Assured</text></svg>';

/**
 * Resolves static media URLs (images, uploads, videos, banners)
 * through Bunny.net CDN (https://selectt-media.b-cdn.net) in production,
 * eliminating direct VPS bandwidth usage and speeding up content delivery.
 */
export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // If already pointing to VPS uploads, rewrite to CDN
  if (trimmed.startsWith('https://api.selectt.in/uploads/')) {
    return trimmed.replace('https://api.selectt.in', CDN_URL);
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${CDN_URL}${cleanPath}`;
};

/**
 * Ultra-fast, lightweight thumbnail image resolver.
 * Delivers tiny 4-8 KB images (w-180 to w-240, q-70, f-auto) for gallery thumbnails,
 * mobile chips, and quick previews. Reduces initial payload by 95%+.
 */
export const getCarThumbnailUrl = (img, width = 180, fallback = DEFAULT_CAR_FALLBACK_IMAGE) => {
  if (!img || typeof img !== 'string' || img.trim() === '') return fallback;
  const trimmed = img.trim();
  if (trimmed.includes('images.unsplash.com') || trimmed.includes('shutterstock.com')) {
    return fallback;
  }
  if (trimmed.startsWith('https://api.selectt.in/uploads/')) {
    return trimmed.replace('https://api.selectt.in', CDN_URL);
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    if (trimmed.includes('ik.imagekit.io')) {
      const cleanUrl = trimmed.split('?')[0];
      const targetW = Math.max(Math.round(width), 100);
      return `${cleanUrl}?tr=w-${targetW},q-70,f-auto`;
    }
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (cleanPath.startsWith('/uploads/')) {
    return `${CDN_URL}${cleanPath}`;
  }
  const base = (CDN_URL && CDN_URL.trim()) || (API_URL && API_URL.trim()) || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://selectt-media.b-cdn.net' : 'http://localhost:5000');
  return `${base}${cleanPath}`;
};

/**
 * Pristine original/high-resolution image resolver for Zoom, Fullscreen Lightbox, and Modal views.
 * Delivers razor-sharp 1800px crystal clarity at high quality.
 */
export const getCarOriginalImageUrl = (img, fallback = DEFAULT_CAR_FALLBACK_IMAGE) => {
  if (!img || typeof img !== 'string' || img.trim() === '') return fallback;
  const trimmed = img.trim();
  if (trimmed.includes('images.unsplash.com') || trimmed.includes('shutterstock.com')) {
    return fallback;
  }
  if (trimmed.startsWith('https://api.selectt.in/uploads/')) {
    return trimmed.replace('https://api.selectt.in', CDN_URL);
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    if (trimmed.includes('ik.imagekit.io')) {
      const cleanUrl = trimmed.split('?')[0];
      return `${cleanUrl}?tr=w-1800,q-90,f-auto`;
    }
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (cleanPath.startsWith('/uploads/')) {
    return `${CDN_URL}${cleanPath}`;
  }
  const base = (CDN_URL && CDN_URL.trim()) || (API_URL && API_URL.trim()) || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://selectt-media.b-cdn.net' : 'http://localhost:5000');
  return `${base}${cleanPath}`;
};

/**
 * Standard car image resolver.
 * For main viewports: delivers balanced crisp 900px at q-80 (~80-95 KB) for instant loading.
 */
export const getCarImageUrl = (img, fallback = DEFAULT_CAR_FALLBACK_IMAGE, width = null) => {
  if (!img || typeof img !== 'string' || img.trim() === '') return fallback;
  const trimmed = img.trim();
  // Filter out any 3rd party stock photography links
  if (trimmed.includes('images.unsplash.com') || trimmed.includes('shutterstock.com')) {
    return fallback;
  }
  if (trimmed.startsWith('https://api.selectt.in/uploads/')) {
    return trimmed.replace('https://api.selectt.in', CDN_URL);
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    if (trimmed.includes('ik.imagekit.io')) {
      const cleanUrl = trimmed.split('?')[0];
      if (width) {
        const targetW = Math.max(Math.round(width), 200);
        return `${cleanUrl}?tr=w-${targetW},q-80,f-auto`;
      }
      // Main car details view: optimized 900px (fast, lightweight, yet super crisp)
      return `${cleanUrl}?tr=w-900,q-80,f-auto`;
    }
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (cleanPath.startsWith('/uploads/')) {
    return `${CDN_URL}${cleanPath}`;
  }
  const base = (CDN_URL && CDN_URL.trim()) || (API_URL && API_URL.trim()) || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? 'https://selectt-media.b-cdn.net' : 'http://localhost:5000');
  return `${base}${cleanPath}`;
};

