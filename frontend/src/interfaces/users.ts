import { User, Role } from './auth';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  role_ids?: number[];
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  // All fields are optional for updates
  password?: string;
  password_confirmation?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
  per_page?: number;
}

export interface UserListResponse {
  success: boolean;
  data: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface UserMessageResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface PasswordUpdateRequest {
  password: string;
  password_confirmation: string;
}
