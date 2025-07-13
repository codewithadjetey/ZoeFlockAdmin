'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { config, getApiUrl } from '@/utils/config';
import { encryptAndStore, retrieveAndDecrypt, removeEncryptedData } from '@/utils/encryption';
import { 
  User, 
  RegisterData, 
  AuthState, 
  AuthContextType, 
  AuthProviderProps 
} from '@/interfaces';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'zoe_flock_auth';

// API Response Types
interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string | null;
  };
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Load user from encrypted localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = retrieveAndDecrypt<User>(AUTH_STORAGE_KEY);
        const token = localStorage.getItem('auth_token');
        
        if (storedUser && token) {
          // Set the token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setState(prev => ({ 
            ...prev, 
            user: storedUser, 
            isAuthenticated: true 
          }));
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        // Clear corrupted data
        removeEncryptedData(AUTH_STORAGE_KEY);
        localStorage.removeItem('auth_token');
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const responseData = response.data;

      if (!responseData.success) {
        throw new Error(responseData.message || 'Login failed');
      }

      const { user: userData, token } = responseData.data;
      
      // Store token in localStorage and set in API headers
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Encrypt and store user data
      encryptAndStore(AUTH_STORAGE_KEY, userData);
      setState(prev => ({ 
        ...prev, 
        user: userData, 
        isAuthenticated: true 
      }));
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to revoke token
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      setState(prev => ({ 
        ...prev, 
        user: null, 
        isAuthenticated: false 
      }));
      removeEncryptedData(AUTH_STORAGE_KEY);
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await api.post<AuthResponse>('/auth/register', userData);

      const responseData = response.data;

      if (!responseData.success) {
        throw new Error(responseData.message || 'Registration failed');
      }

      const { user: newUser, token } = responseData.data;
      
      // Store token in localStorage and set in API headers
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Encrypt and store user data
      encryptAndStore(AUTH_STORAGE_KEY, newUser);
      setState(prev => ({ 
        ...prev, 
        user: newUser, 
        isAuthenticated: true 
      }));
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await api.put<ProfileResponse>('/auth/profile', data);

      const responseData = response.data;

      if (!responseData.success) {
        throw new Error(responseData.message || 'Profile update failed');
      }

      const updatedUser: User = responseData.data.user;
      
      // Encrypt and store updated user data
      encryptAndStore(AUTH_STORAGE_KEY, updatedUser);
      setState(prev => ({ ...prev, user: updatedUser }));
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      throw new Error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 