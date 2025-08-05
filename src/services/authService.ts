import api from './api';
import { config } from '../config';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    is_admin: boolean;
    weight?: number;
    weight_unit?: string;
  };
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    is_admin: boolean;
    weight?: number;
    weight_unit?: string;
  };
}

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', credentials);
    
    // Store token
    localStorage.setItem(config.jwtStorageKey, response.data.access_token);
    
    return response.data;
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/users', userData);
    
    // Store token for immediate login
    localStorage.setItem(config.jwtStorageKey, response.data.access_token);
    
    return response.data;
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem(config.jwtStorageKey);
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem(config.jwtStorageKey);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    return !!token;
  },

  // Get current user data
  getCurrentUser: async () => {
    const response = await api.get('/me');
    return response.data;
  },
};