import axios from 'axios';
import { config } from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (axiosConfig) => {
    const token = localStorage.getItem(config.jwtStorageKey);
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 errors for authenticated requests (not login/register attempts)
    if (error.response?.status === 401 && error.config?.url !== '/login' && error.config?.url !== '/users') {
      // Token expired or invalid for authenticated requests - redirect to login
      localStorage.removeItem(config.jwtStorageKey);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;