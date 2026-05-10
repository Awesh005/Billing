import axios from 'axios';

// Hardcoded to ensure no cache issues — must match backend PORT
const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // Set to false to avoid CORS preflight issues in dev
  timeout: 15000,         // 15 second timeout — prevents infinite loading
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request (unless already provided)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    if (config.headers && config.headers.Authorization) {
      return config;
    }
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle responses + 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('API timeout — is the backend running on port 5001?');
    }
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isMasterPath = window.location.pathname.startsWith('/master');
      const isLoginRequest = error.config?.url?.includes('/login');
      
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        if (isMasterPath) {
          localStorage.removeItem('master-auth-storage');
          window.location.href = '/master/login';
        } else {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
