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
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.detail || error.message
    });
    
    // Only redirect on 401 errors for authenticated requests (not login/register attempts)
    if (error.response?.status === 401 && error.config?.url !== '/login' && error.config?.url !== '/users') {
      console.log('Token expired or invalid, redirecting to login');
      // Token expired or invalid for authenticated requests - redirect to login
      localStorage.removeItem(config.jwtStorageKey);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;