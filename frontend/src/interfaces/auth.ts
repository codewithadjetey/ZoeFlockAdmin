// Permission Types
export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

// Role Types
export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: Permission[];
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  profile_picture?: string | null;
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: Permission[];
  role_display_name: string;
  is_admin: boolean;
  is_pastor: boolean;
  is_member: boolean;
}

// Authentication Credentials
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Authentication State
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Authentication Context
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasRole: (role: string) => boolean;
  isFamilyHead: () => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
} 