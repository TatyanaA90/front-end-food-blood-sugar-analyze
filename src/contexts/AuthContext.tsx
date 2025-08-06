import React, { useState, useEffect, type ReactNode } from 'react';
import { AuthContext, type User, type AuthContextType } from './AuthContext.ts';
import { authService } from '../services/authService';
import { config } from '../config';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token and fetch user data on app load
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Initializing auth...');
      console.log('🚀 API Base URL:', config.apiBaseUrl);
      
      const storedToken = authService.getToken();
      console.log('🔍 Stored token:', storedToken ? 'exists' : 'none');
      
      if (storedToken) {
        try {
          console.log('🔍 Attempting to fetch user data...');
          setToken(storedToken);
          const userData = await authService.getCurrentUser();
          console.log('✅ User data fetched successfully:', userData);
          setUser(userData);
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          // If token is invalid, clear auth state
          setToken(null);
          setUser(null);
          authService.logout();
        }
      } else {
        console.log('🔍 No stored token found');
      }
      
      console.log('🔍 Setting isLoading to false');
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      const data = await authService.login({ username, password });
      
      // Set auth state
      setToken(data.access_token);
      setUser(data.user);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error types for better user feedback
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password. Please check your credentials and try again.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.response?.status === 0 || !error.response) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, weight?: string, weight_unit?: string) => {
    try {
      setIsLoading(true);
      
      const data = await authService.register({
        name: username,
        username,
        email,
        password,
        weight: weight ? parseFloat(weight) : undefined,
        weight_unit: weight_unit || 'kg'
      });
      
      // Set auth state for immediate login
      setToken(data.access_token);
      setUser(data.user);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error types
      if (error.response?.status === 409) {
        throw new Error('Username or email already exists. Please try different credentials.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid registration data. Please check your information.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

 