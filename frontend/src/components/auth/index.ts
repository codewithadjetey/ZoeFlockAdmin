// Auth Guards
export { 
  AuthGuard, 
  ProtectedRoute, 
  GuestRoute
} from './AuthGuard';

// Re-export auth context for convenience
export { useAuth, AuthProvider } from '@/contexts/AuthContext';
export type { User, LoginCredentials, RegisterData, AuthState, AuthContextType } from '@/interfaces'; 