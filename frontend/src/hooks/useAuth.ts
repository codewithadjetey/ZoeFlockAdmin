// This hook is now deprecated. Use the AuthContext instead.
// import { useAuth } from '@/contexts/AuthContext';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from './useLocalStorage';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('isAuthenticated', false);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated');
      const userData = localStorage.getItem('user');
      
      if (auth === 'true' && userData) {
        try {
          const user = JSON.parse(userData);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo credentials
      const validCredentials = [
        { email: 'admin@church.com', password: 'admin123', role: 'admin', name: 'Administrator' },
        { email: 'pastor@church.com', password: 'pastor123', role: 'pastor', name: 'Pastor' },
        { email: 'member@church.com', password: 'member123', role: 'member', name: 'Member' }
      ];

      const credential = validCredentials.find(
        cred => cred.email === email && cred.password === password
      );

      if (credential) {
        const user: User = {
          id: Date.now().toString(),
          email: credential.email,
          role: credential.role,
          name: credential.name
        };

        setUser(user);
        setIsAuthenticated(true);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });

        return true;
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    router.push('/auth/login');
  };

  const checkAuth = () => {
    return authState.isAuthenticated && authState.user !== null;
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
    checkAuth
  };
} 