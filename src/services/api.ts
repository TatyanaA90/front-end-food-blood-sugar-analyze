import axios from 'axios';
import { config } from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the API base URL being used
console.log('🚀 API Base URL:', config.apiBaseUrl);

// Request interceptor to add auth token
api.interceptors.request.use(
  (axiosConfig) => {
    console.log('🌐 API Request:', axiosConfig.method?.toUpperCase(), axiosConfig.url);
    const token = localStorage.getItem(config.jwtStorageKey);
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request');
    } else {
      console.log('🔍 No token found for request');
    }
    return axiosConfig;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config?.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.detail || error.message
    });

    // Only redirect on 401 errors for authenticated requests (not login/register attempts)
    if (
      error.response?.status === 401 &&
      error.config?.url !== '/login' &&
      error.config?.url !== '/admin/login' &&
      error.config?.url !== '/users'
    ) {
      console.log('🔑 Token expired or invalid, redirecting to login');
      // Token expired or invalid for authenticated requests - redirect to login
      localStorage.removeItem(config.jwtStorageKey);
      window.location.href = '/login';
    }

    // For login attempts, don't log as error since 401 is expected for invalid credentials
    if (error.response?.status === 401 && error.config?.url === '/login') {
      console.log('🔍 Login attempt failed - invalid credentials');
    }

    return Promise.reject(error);
  }
);

export default api;

export const uploadCsv = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/cgm-upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data as { imported: number; skipped: number; errors: string[] };
};