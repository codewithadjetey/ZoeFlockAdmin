import { http } from '@/utils';
import type { Paginated } from '@/interfaces/api';
import { Group, CreateGroup, GroupFilters, GroupsResponse, GroupResponse } from '@/interfaces/groups';

export interface FileUpload {
  upload_token: string;
  filename: string;
  url: string;
  size: string;
  mime_type: string;
}

export class GroupsService {
  /**
   * Get groups with optional filters and pagination
   */
  static async getGroups(filters: GroupFilters = {}): Promise<GroupsResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.member_count_min) params.append('member_count_min', filters.member_count_min.toString());
    if (filters.member_count_max) params.append('member_count_max', filters.member_count_max.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

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
  static async createGroup(groupData: CreateGroup): Promise<GroupResponse> {
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