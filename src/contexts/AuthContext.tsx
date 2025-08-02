import React, { useState, useEffect, type ReactNode } from 'react';
import { config } from '../config';
import { AuthContext, type User, type AuthContextType } from './AuthContext.ts';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem(config.jwtStorageKey);
    if (storedToken) {
      setToken(storedToken);
      // TODO: Validate token with backend
      // For now, we'll assume it's valid
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${config.apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem(config.jwtStorageKey, data.access_token);
      setToken(data.access_token);
      
      // Set user data
      setUser(data.user);
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${config.apiBaseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username, username, email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem(config.jwtStorageKey, data.access_token);
      setToken(data.access_token);
      
      // Set user data
      setUser(data.user);
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(config.jwtStorageKey);
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

 