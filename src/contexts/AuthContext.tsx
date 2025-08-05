import React, { useState, useEffect, type ReactNode } from 'react';
import { AuthContext, type User, type AuthContextType } from './AuthContext.ts';
import { authService } from '../services/authService';

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
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          setToken(storedToken);
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If token is invalid, clear auth state
          setToken(null);
          setUser(null);
          authService.logout();
        }
      }
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
      throw error;
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

 