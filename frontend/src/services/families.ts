import { http } from '@/utils';
import type { Paginated } from '@/interfaces/api';

export interface Family {
  id?: number;
  name: string;
  slogan?: string;
  description?: string;
  img_url?: string | null;
  active: boolean;
  deleted: boolean;
  family_head_id: number;
  created_at?: string;
  updated_at?: string;
  family_head?: any;
  members?: any[];
  member_count?: number;
}

export interface FamilyResponse {
  success: boolean;
  message: string;
  families?: Paginated<Family>;
  data?: Family;
}

export interface FamilyMember {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  role: string;
  joined_at: string;
  is_active: boolean;
  notes?: string;
}

export class FamiliesService {
  /**
   * Get families with optional filters and pagination
   */
  static async getFamilies(filters: {
    search?: string;
    active?: boolean;
    include_files?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<FamilyResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.active !== undefined) params.append('active', String(filters.active));
    if (filters.include_files) params.append('include_files', 'true');
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));

    const response = await http({ method: 'get', url: `/families?${params.toString()}` });
    return response.data as FamilyResponse;
  }

  /**
   * Follow a pagination URL returned by the API
   */
  static async getByPageUrl(url: string): Promise<FamilyResponse> {
    const response = await http({ method: 'get', url });
    return response.data as FamilyResponse;
  }

  /**
   * Get a specific family
   */
  static async getFamily(id: number): Promise<FamilyResponse> {
    const response = await http({ method: 'get', url: `/families/${id}` });
    return response.data;
  }

  /**
   * Create a new family
   */
  static async createFamily(familyData: Omit<Family, 'id' | 'active' | 'deleted'> & { upload_token?: string }): Promise<FamilyResponse> {
    const response = await http({ method: 'post', url: '/families', data: familyData });
    return response.data;
  }

  /**
   * Update a family
   */
  static async updateFamily(id: number, familyData: Partial<Family> & { upload_token?: string }): Promise<FamilyResponse> {
    const response = await http({ method: 'put', url: `/families/${id}`, data: familyData });
    return response.data;
  }

  /**
   * Delete a family
   */
  static async deleteFamily(id: number): Promise<{ success: boolean; message: string }> {
    const response = await http({ method: 'delete', url: `/families/${id}` });
    return response.data;
  }

  /**
   * Get family members
   */
  static async getFamilyMembers(familyId: number): Promise<{ success: boolean; message: string; data: FamilyMember[] }> {
    const response = await http({ method: 'get', url: `/families/${familyId}/members` });
    return response.data;
  }

  /**
   * Add member to family
   */
  static async addMemberToFamily(familyId: number, memberId: number, data: { role?: string; notes?: string } = {}): Promise<{ success: boolean; message: string }> {
    const response = await http({ method: 'post', url: `/families/${familyId}/members`, data: { member_id: memberId, ...data } });
    return response.data;
  }

  /**
   * Remove member from family
   */
  static async removeMemberFromFamily(familyId: number, memberId: number): Promise<{ success: boolean; message: string }> {
    const response = await http({ method: 'delete', url: `/families/${familyId}/members/${memberId}` });
    return response.data;
  }

  /**
   * Get current user's family
   */
  static async getMyFamily(): Promise<FamilyResponse> {
    const response = await http({ method: 'get', url: '/families/my-family' });
    return response.data;
  }

  /**
   * Get member roles for families
   */
  static getMemberRoles(): string[] {
    return ['member', 'deputy'];
  }

  /**
   * Get family statuses
   */
  static getStatuses(): string[] {
    return ['Active', 'Inactive'];
  }

  /**
   * Get family statistics
   */
  static async getStatistics(): Promise<{ success: boolean; message: string; data?: any }> {
    const response = await http({ method: 'get', url: '/families/statistics' });
    return response.data;
  }
} 