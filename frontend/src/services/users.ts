import { api } from '@/utils/api';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserListResponse,
  UserResponse,
  UserMessageResponse,
  PasswordUpdateRequest
} from '@/interfaces/users';
import { User } from '@/interfaces/auth';

export class UsersService {
  /**
   * Get all users with optional filters
   */
  static async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/users?${params.toString()}`);
    return response.data as UserListResponse;
  }

  /**
   * Get a specific user by ID
   */
  static async getUser(id: number): Promise<UserResponse> {
    const response = await api.get(`/users/${id}`);
    return response.data as UserResponse;
  }

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const response = await api.post('/users', userData);
    return response.data as UserResponse;
  }

  /**
   * Update an existing user
   */
  static async updateUser(id: number, userData: UpdateUserRequest): Promise<UserResponse> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data as UserResponse;
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: number): Promise<UserMessageResponse> {
    const response = await api.delete(`/users/${id}`);
    return response.data as UserMessageResponse;
  }

  /**
   * Update user password
   */
  static async updatePassword(id: number, passwordData: PasswordUpdateRequest): Promise<UserMessageResponse> {
    const response = await api.post(`/users/${id}/password`, passwordData);
    return response.data as UserMessageResponse;
  }

  /**
   * Assign roles to a user
   */
  static async assignRoles(userId: number, roleIds: number[]): Promise<UserResponse> {
    const response = await api.post(`/users/${userId}/roles`, {
      role_ids: roleIds
    });
    return response.data as UserResponse;
  }

  /**
   * Remove roles from a user
   */
  static async removeRoles(userId: number, roleIds: number[]): Promise<UserResponse> {
    const response = await api.delete(`/users/${userId}/roles`, {
      data: { role_ids: roleIds }
    } as any);
    return response.data as UserResponse;
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(id: number): Promise<UserResponse> {
    const response = await api.post(`/users/${id}/toggle-status`);
    return response.data as UserResponse;
  }
}
