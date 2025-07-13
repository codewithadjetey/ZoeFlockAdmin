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
        console.log('[AuthContext] Loading user from storage...');
        // Check if we have stored user data and token
        const storedUser = retrieveAndDecrypt(AUTH_STORAGE_KEY) as User | null;
        const storedToken = localStorage.getItem('auth_token');
        
        console.log('[AuthContext] Checking stored auth data:', { 
          hasStoredUser: !!storedUser, 
          hasStoredToken: !!storedToken 
        });

        if (storedUser && storedToken) {
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token with backend
          try {
            console.log('[AuthContext] Verifying token with backend...');
            const response = await api.get('/auth/profile');
            const responseData = response.data as { success: boolean; message?: string; data?: { user: User } };
            if (responseData.success && responseData.data?.user) {
              console.log('[AuthContext] Token verified, user authenticated');
              setState(prev => ({ 
                ...prev, 
                user: responseData.data!.user, 
                isAuthenticated: true,
                isLoading: false
              }));
            } else {
              console.log('[AuthContext] Token invalid, clearing data');
              throw new Error('Token invalid');
            }
          } catch (error) {
            console.log('[AuthContext] Token verification failed:', error);
            // Only clear data if it's a real authentication error, not a network error
            if (error instanceof Error && error.message.includes('Token invalid')) {
              removeEncryptedData(AUTH_STORAGE_KEY);
              localStorage.removeItem('auth_token');
              delete api.defaults.headers.common['Authorization'];
            }
            setState(prev => ({ 
              ...prev, 
              user: null, 
              isAuthenticated: false,
              isLoading: false
            }));
          }
        } else {
          console.log('[AuthContext] No stored user or token, not authenticated');
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
      console.log('[AuthContext] Attempting login...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const responseData = response.data;
      console.log('[AuthContext] Login response:', responseData);

      if (!responseData.success) {
        throw new Error(responseData.message || 'Login failed');
      }

      const { user: userData, token } = responseData.data;
      
      // Store token in localStorage and set in API headers
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Encrypt and store user data
      encryptAndStore(AUTH_STORAGE_KEY, userData);
      console.log('[AuthContext] Login successful, user stored');
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
      console.log('[AuthContext] Logging out...');
      // Call logout endpoint to revoke token
      await api.post('/auth/logout');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      console.log('[AuthContext] Clearing local auth data');
      setState(prev => ({ 
        ...prev, 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      }));
      removeEncryptedData(AUTH_STORAGE_KEY);
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      console.log('[AuthContext] Attempting registration...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await api.post<AuthResponse>('/auth/register', userData);

      const responseData = response.data;
      console.log('[AuthContext] Registration response:', responseData);

      if (!responseData.success) {
        throw new Error(responseData.message || 'Registration failed');
      }

      const { user: newUser, token } = responseData.data;
      
      // Store token in localStorage and set in API headers
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Encrypt and store user data
      encryptAndStore(AUTH_STORAGE_KEY, newUser);
      console.log('[AuthContext] Registration successful, user stored');
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
      console.log('[AuthContext] Updating profile...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await api.put<ProfileResponse>('/auth/profile', data);

      const responseData = response.data;

      if (!responseData.success) {
        throw new Error(responseData.message || 'Profile update failed');
      }

      const updatedUser: User = responseData.data.user;
      
      // Encrypt and store updated user data
      encryptAndStore(AUTH_STORAGE_KEY, updatedUser);
      console.log('[AuthContext] Profile updated successfully');
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