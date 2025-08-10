import { http } from '@/utils';
import type { Paginated } from '@/interfaces/api';

export interface Group {
  id?: number;
  name: string;
  description: string;
  category: string;
  max_members: number;
  member_count?: number;
  meeting_day: string;
  meeting_time: string;
  location: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  img_path?: string | null;
}

export interface FileUpload {
  upload_token: string;
  filename: string;
  url: string;
  size: string;
  mime_type: string;
}

export interface GroupsResponse {
  success: boolean;
  message: string;
  groups: Paginated<Group>;
}

export interface GroupResponse {
  success: boolean;
  message: string;
  data: Group;
}

export class GroupsService {
  /**
   * Get groups with optional filters and pagination
   */
  static async getGroups(filters: {
    search?: string;
    category?: string;
    status?: string;
    include_files?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<GroupsResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.include_files) params.append('include_files', 'true');
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));

    const response = await http({ method: 'get', url: `/groups?${params.toString()}` });
    return response.data as GroupsResponse;
  }

  /**
   * Follow a pagination URL returned by the API
   */
  static async getByPageUrl(url: string): Promise<GroupsResponse> {
    const response = await http({ method: 'get', url });
    return response.data as GroupsResponse;
  }

  /**
   * Get a specific group
   */
  static async getGroup(id: number): Promise<GroupResponse> {
    const response = await http({ method: 'get', url: `/groups/${id}` });
    return response.data;
  }

  /**
   * Create a new group
   */
  static async createGroup(groupData: Omit<Group, 'id'>): Promise<GroupResponse> {
    const response = await http({ method: 'post', url: '/groups', data: groupData });
    return response.data;
  }

  /**
   * Update a group
   */
  static async updateGroup(id: number, groupData: Partial<Group>): Promise<GroupResponse> {
    const response = await http({ method: 'put', url: `/groups/${id}`, data: groupData });
    return response.data;
  }

  /**
   * Delete a group
   */
  static async deleteGroup(id: number): Promise<{ success: boolean; message: string }> {
    const response = await http({ method: 'delete', url: `/groups/${id}` });
    return response.data;
  }

  /**
   * Get available categories
   */
  static getCategories(): string[] {
    return [
      'Ministry',
      'Education',
      'Prayer',
      'Music',
      'Fellowship',
      'Outreach',
      'Children',
      'Youth',
      'Seniors',
    ];
  }

  /**
   * Get available statuses
   */
  static getStatuses(): string[] {
    return [
      'Active',
      'Inactive',
      'Full',
    ];
  }

  /**
   * Get available meeting days
   */
  static getMeetingDays(): string[] {
    return [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
  }

  /**
   * Get available meeting times
   */
  static getMeetingTimes(): string[] {
    return [
      '8:00 AM',
      '9:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM',
      '1:00 PM',
      '2:00 PM',
      '3:00 PM',
      '4:00 PM',
      '5:00 PM',
      '6:00 PM',
      '6:30 PM',
      '7:00 PM',
      '7:30 PM',
      '8:00 PM',
    ];
  }

  /**
   * Get group members
   */
  static async getGroupMembers(groupId: number): Promise<{ success: boolean; message: string; data: any[] }> {
    const response = await http({ method: 'get', url: `/groups/${groupId}/members` });
    return response.data;
  }

  /**
   * Add member to group
   */
  static async addMemberToGroup(groupId: number, memberId: number, data: { role?: string; notes?: string } = {}): Promise<{ success: boolean; message: string }> {
    const response = await http({ method: 'post', url: `/groups/${groupId}/members`, data: { member_id: memberId, ...data } });
    return response.data;
  }

  /**
   * Remove member from group
   */
  static async removeMemberFromGroup(groupId: number, memberId: number): Promise<{ success: boolean; message: string }> {
    const response = await http({ method: 'delete', url: `/groups/${groupId}/members/${memberId}` });
    return response.data;
  }

  /**
   * Get member roles
   */
  static getMemberRoles(): string[] {
    return ['member', 'leader', 'coordinator', 'mentor'];
  }

  /**
   * Get overall groups statistics
   */
  static async getOverallStats(): Promise<{ success: boolean; message: string; data: any }> {
    const response = await http({ method: 'get', url: '/groups/statistics/overall' });
    return response.data;
  }

  /**
   * Get groups that need attention
   */
  static async getGroupsNeedingAttention(): Promise<{ success: boolean; message: string; data: any[] }> {
    const response = await http({ method: 'get', url: '/groups/statistics/needing-attention' });
    return response.data;
  }

  /**
   * Get group statistics
   */
  static async getGroupStats(groupId: number): Promise<{ success: boolean; message: string; data: any }> {
    const response = await http({ method: 'get', url: `/groups/${groupId}/statistics` });
    return response.data;
  }
} 