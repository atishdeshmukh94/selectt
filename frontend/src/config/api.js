export const API_BASE_URL = typeof import.meta.env.VITE_API_BASE_URL === 'string'
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:5000';
export const API_URL = API_BASE_URL; // Alias for convenience
