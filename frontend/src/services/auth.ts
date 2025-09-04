import { http } from '@/utils';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  profile_picture?: string;
  is_active: boolean;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
  roles?: any[];
  permissions?: any[];
  role_display_name?: string;
  is_admin?: boolean;
  is_pastor?: boolean;
  is_member?: boolean;
}

export interface ProfileUpdateRequest {
  name?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  profile_picture?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export class AuthService {
  /**
   * Get current user profile
   */
  static async getProfile(): Promise<ProfileResponse> {
    const response = await http({ method: 'get', url: '/auth/profile' });
    return response.data;
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: ProfileUpdateRequest): Promise<ProfileResponse> {
    const response = await http({ method: 'put', url: '/auth/profile', data });
    return response.data;
  }

  /**
   * Change user password
   */
  static async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await http({ method: 'put', url: '/auth/change-password', data });
    return response.data;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<{ success: boolean; message: string }> {
    const response = await http({ method: 'post', url: '/auth/logout' });
    return response.data;
  }
} 