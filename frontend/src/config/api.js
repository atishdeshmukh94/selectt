export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_URL = API_BASE_URL;

export const DEFAULT_CAR_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600';

export const getCarImageUrl = (img, fallback = DEFAULT_CAR_FALLBACK_IMAGE) => {
  if (!img || typeof img !== 'string' || img.trim() === '') return fallback;
  const trimmed = img.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_URL}${cleanPath}`;
};

