import { User } from '@/interfaces/auth';

// API Response Types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserResponse {
  user: User;
} 