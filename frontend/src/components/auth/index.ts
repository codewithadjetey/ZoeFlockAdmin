// Auth Guards
export { 
  AuthGuard, 
  ProtectedRoute, 
  GuestRoute, 
  AdminRoute, 
  PastorRoute 
} from './AuthGuard';

// Re-export auth context for convenience
export { useAuth, AuthProvider } from '@/contexts/AuthContext';
export type { User, LoginCredentials, RegisterData, AuthState, AuthContextType } from '@/contexts/AuthContext'; 