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
    const loadUser = async () => {
      try {
    
        // Check if we have stored user data and token
        const storedUser = retrieveAndDecrypt(AUTH_STORAGE_KEY) as User | null;
        const storedToken = localStorage.getItem('auth_token');
        


        if (storedUser && storedToken) {
          // Token will be automatically added by the interceptor
          
          // Verify token with backend
          try {

            const response = await api.get('/auth/profile');
            const responseData = response.data as { success: boolean; message?: string; data?: { user: User } };
            if (responseData.success && responseData.data?.user) {

              setState(prev => ({ 
                ...prev, 
                user: responseData.data!.user, 
                isAuthenticated: true,
                isLoading: false
              }));
            } else {

              throw new Error('Token invalid');
            }
          } catch (error) {

            // Only clear data if it's a real authentication error, not a network error
            if (error instanceof Error && error.message.includes('Token invalid')) {
              removeEncryptedData(AUTH_STORAGE_KEY);
              localStorage.removeItem('auth_token');
              // Interceptor will handle missing tokens automatically
            }
            setState(prev => ({ 
              ...prev, 
              user: null, 
              isAuthenticated: false,
              isLoading: false
            }));
          }
        } else {

          setState(prev => ({ 
            ...prev, 
            user: null, 
            isAuthenticated: false,
            isLoading: false
          }));
        }
      } catch (error) {
        console.error('[AuthContext] Failed to load user from storage:', error);
        // Clear corrupted data
        removeEncryptedData(AUTH_STORAGE_KEY);
        localStorage.removeItem('auth_token');
        setState(prev => ({ 
          ...prev, 
          user: null, 
          isAuthenticated: false,
          isLoading: false
        }));
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
      
      // Store token in localStorage (interceptor will handle headers)
      localStorage.setItem('auth_token', token);
      
      // Encrypt and store user data
      encryptAndStore(AUTH_STORAGE_KEY, userData);

      setState(prev => ({ 
        ...prev, 
        user: userData, 
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {

      // Call logout endpoint to revoke token
      await api.post('/auth/logout');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      // Clear local state regardless of API call success

      setState(prev => ({ 
        ...prev, 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      }));
      removeEncryptedData(AUTH_STORAGE_KEY);
      localStorage.removeItem('auth_token');
      // Interceptor will handle missing tokens automatically
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
      
      // Store token in localStorage (interceptor will handle headers)
      localStorage.setItem('auth_token', token);
      
      // Encrypt and store user data
      encryptAndStore(AUTH_STORAGE_KEY, newUser);

      setState(prev => ({ 
        ...prev, 
        user: newUser, 
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error: any) {
      console.error('[AuthContext] Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
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

      setState(prev => ({ 
        ...prev, 
        user: updatedUser,
        isLoading: false
      }));
    } catch (error: any) {
      console.error('[AuthContext] Profile update error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    updateProfile,
    hasRole: (role: string) => state.user?.roles?.some(r => r.name === role) ?? false,
    isFamilyHead: () => state.user?.roles?.some(r => r.name === 'family-head') ?? false,
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