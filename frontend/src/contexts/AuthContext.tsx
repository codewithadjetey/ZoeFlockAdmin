'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { config } from '@/utils/config';
import { encryptAndStore, retrieveAndDecrypt, removeEncryptedData } from '@/utils/encryption';

// API Response Types
interface AuthResponse {
  user: User;
  token: string;
}

interface UserResponse {
  user: User;
}

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  role: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'zoe_flock_auth';

// Provider component
interface AuthProviderProps {
  children: ReactNode;
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
        if (storedUser) {
          setState(prev => ({ ...prev, user: storedUser }));
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        // Clear corrupted data
        removeEncryptedData(AUTH_STORAGE_KEY);
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData: User = await response.json();
      
      // Encrypt and store user data
      encryptAndStore(AUTH_STORAGE_KEY, userData);
      setState(prev => ({ ...prev, user: userData }));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null }));
    removeEncryptedData(AUTH_STORAGE_KEY);
  };

  const register = async (userData: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const newUser: User = await response.json();
      
      // Encrypt and store user data
      encryptAndStore(AUTH_STORAGE_KEY, newUser);
      setState(prev => ({ ...prev, user: newUser }));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser: User = await response.json();
      
      // Encrypt and store updated user data
      encryptAndStore(AUTH_STORAGE_KEY, updatedUser);
      setState(prev => ({ ...prev, user: updatedUser }));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
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