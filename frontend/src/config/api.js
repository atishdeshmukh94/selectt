export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_URL = API_BASE_URL;

// Clean neutral white blank placeholder (No 3rd-party stock images)
export const BLANK_WHITE_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" fill="none"><rect width="800" height="500" fill="%23F8FAFC"/><g transform="translate(360, 210)" opacity="0.45" stroke="%2394A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14 16H86L76 6H24L14 16Z"/><circle cx="30" cy="24" r="6"/><circle cx="70" cy="24" r="6"/><path d="M6 16H94V24H6V16Z"/></g></svg>';

export const DEFAULT_CAR_FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%23F1F5F9"/><g transform="translate(250, 160)" stroke="%2394A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14 16H86L76 6H24L14 16Z"/><circle cx="30" cy="24" r="6"/><circle cx="70" cy="24" r="6"/><path d="M6 16H94V24H6V16Z"/></g><text x="300" y="225" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="13" font-weight="600" fill="%2394A3B8" text-anchor="middle">Selectt Certified</text></svg>';

export const DEFAULT_BANNER_FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="280" viewBox="0 0 600 280" fill="none"><rect width="600" height="280" rx="16" fill="%23F8FAFC"/><rect x="1" y="1" width="598" height="278" rx="15" stroke="%23E2E8F0" stroke-width="1.5"/><g transform="translate(260, 100)" opacity="0.4" stroke="%2394A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M14 16H86L76 6H24L14 16Z"/><circle cx="30" cy="24" r="6"/><circle cx="70" cy="24" r="6"/><path d="M6 16H94V24H6V16Z"/></g><text x="300" y="165" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="12" font-weight="600" fill="%2394A3B8" text-anchor="middle">Selectt Assured</text></svg>';

export const getCarImageUrl = (img, fallback = DEFAULT_CAR_FALLBACK_IMAGE) => {
  if (!img || typeof img !== 'string' || img.trim() === '') return fallback;
  const trimmed = img.trim();
  // Filter out any 3rd party stock photography links
  if (trimmed.includes('images.unsplash.com') || trimmed.includes('shutterstock.com')) {
    return fallback;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_URL}${cleanPath}`;
};

