import { http } from '@/utils';

export interface Group {
  id?: number;
  name: string;
  description: string;
  category: string;
  max_members: number;
  meeting_day: string;
  meeting_time: string;
  location: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface GroupsResponse {
  success: boolean;
  message: string;
  data: Group[];
}

export interface GroupResponse {
  success: boolean;
  message: string;
  data: Group;
}

export class GroupsService {
  /**
   * Get all groups with optional filters
   */
  static async getGroups(filters: {
    search?: string;
    category?: string;
    status?: string;
  } = {}): Promise<GroupsResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);

    const response = await http({ method: 'get', url: `/groups?${params.toString()}` });
    return response.data;
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
} 