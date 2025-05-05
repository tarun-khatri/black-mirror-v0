const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : 'https://black-mirror-v0.onrender.com');

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    socialMedia: `${API_BASE_URL}/api/social-media`,
    cache: `${API_BASE_URL}/api/cache`,
    direct: `${API_BASE_URL}/api/direct`,
  },
};

export default apiConfig; 