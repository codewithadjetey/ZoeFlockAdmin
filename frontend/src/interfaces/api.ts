import { User } from '@/interfaces/auth';

// API Response Types
export interface AuthResponse {
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

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface UserResponse {
  user: User;
} 