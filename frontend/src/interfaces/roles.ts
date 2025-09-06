export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
  users_count: number;
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoleRequest {
  name: string;
  display_name: string;
  description?: string;
  permission_ids?: number[];
}

export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {
  // All fields are optional for updates
}

export interface RoleFilters {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface RoleListResponse {
  success: boolean;
  data: {
    data: Role[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface RoleResponse {
  success: boolean;
  data: Role;
}

export interface RoleMessageResponse {
  success: boolean;
  message: string;
  data?: Role;
}

export interface PermissionListResponse {
  success: boolean;
  data: Permission[];
}
