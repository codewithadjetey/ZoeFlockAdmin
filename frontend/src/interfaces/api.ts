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

// Pagination Types
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface Paginated<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// general saved response
export interface AcceptedResponse<T> {
  success: boolean;
  message: string;
  data: T;
}