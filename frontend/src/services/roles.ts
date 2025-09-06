import { api } from '@/utils/api';
import {
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleFilters,
  RoleListResponse,
  RoleResponse,
  RoleMessageResponse,
  PermissionListResponse
} from '@/interfaces/roles';

export class RolesService {
  /**
   * Get all roles with optional filters
   */
  static async getRoles(filters: RoleFilters = {}): Promise<RoleListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/roles?${params.toString()}`);
    return response.data as RoleListResponse;
  }

  /**
   * Get a specific role by ID
   */
  static async getRole(id: number): Promise<RoleResponse> {
    const response = await api.get(`/roles/${id}`);
    return response.data as RoleResponse;
  }

  /**
   * Create a new role
   */
  static async createRole(roleData: CreateRoleRequest): Promise<RoleResponse> {
    const response = await api.post('/roles', roleData);
    return response.data as RoleResponse;
  }

  /**
   * Update an existing role
   */
  static async updateRole(id: number, roleData: UpdateRoleRequest): Promise<RoleResponse> {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data as RoleResponse;
  }

  /**
   * Delete a role
   */
  static async deleteRole(id: number): Promise<RoleMessageResponse> {
    const response = await api.delete(`/roles/${id}`);
    return response.data as RoleMessageResponse;
  }

  /**
   * Duplicate a role
   */
  static async duplicateRole(id: number): Promise<RoleResponse> {
    const response = await api.post(`/roles/${id}/duplicate`);
    return response.data as RoleResponse;
  }

  /**
   * Get all permissions
   */
  static async getPermissions(): Promise<PermissionListResponse> {
    const response = await api.get('/roles/permissions');
    return response.data as PermissionListResponse;
  }

  /**
   * Assign permissions to a role
   */
  static async assignPermissions(roleId: number, permissionIds: number[]): Promise<RoleResponse> {
    const response = await api.post(`/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    });
    return response.data as RoleResponse;
  }

  /**
   * Remove permissions from a role
   */
  static async removePermissions(roleId: number, permissionIds: number[]): Promise<RoleResponse> {
    const response = await api.delete(`/roles/${roleId}/permissions`, {
      data: { permission_ids: permissionIds }
    } as any);
    return response.data as RoleResponse;
  }

  /**
   * Get users assigned to a role
   */
  static async getRoleUsers(roleId: number): Promise<{ success: boolean; data: any[] }> {
    const response = await api.get(`/roles/${roleId}/users`);
    return response.data as { success: boolean; data: any[] };
  }

  /**
   * Assign users to a role
   */
  static async assignUsers(roleId: number, userIds: number[]): Promise<{ success: boolean; message: string; data: any[] }> {
    const response = await api.post(`/roles/${roleId}/users`, {
      user_ids: userIds
    });
    return response.data as { success: boolean; message: string; data: any[] };
  }

  /**
   * Remove users from a role
   */
  static async removeUsers(roleId: number, userIds: number[]): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/roles/${roleId}/users`, {
      data: { user_ids: userIds }
    } as any);
    return response.data as { success: boolean; message: string };
  }
}
