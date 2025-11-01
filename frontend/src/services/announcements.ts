import { http } from '@/utils';
import type { Paginated } from '@/interfaces/api';

export interface Announcement {
  id: number;
  title: string;
  slug: string;
  content?: string;
  featured_image?: string;
  category: 'general' | 'events' | 'updates' | 'urgent';
  priority: 'low' | 'medium' | 'high';
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  creator?: any;
  updater?: any;
}

export interface AnnouncementsResponse {
  success: boolean;
  message: string;
  announcements: Paginated<Announcement>;
}

export interface AnnouncementResponse {
  success: boolean;
  message: string;
  data: Announcement;
}

export class AnnouncementsService {
  static async getAnnouncements(filters: {
    search?: string;
    category?: 'general' | 'events' | 'updates' | 'urgent';
    priority?: 'low' | 'medium' | 'high';
    is_active?: boolean;
    show_active_only?: boolean;
    page?: number;
    per_page?: number;
  } = {}): Promise<AnnouncementsResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active));
    if (filters.show_active_only) params.append('show_active_only', String(filters.show_active_only));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));

    const response = await http({ method: 'get', url: `/announcements?${params.toString()}` });
    return response.data as AnnouncementsResponse;
  }

  static async getAnnouncement(id: number): Promise<AnnouncementResponse> {
    const response = await http({ method: 'get', url: `/announcements/${id}` });
    return response.data as AnnouncementResponse;
  }

  static async createAnnouncement(data: {
    title: string;
    slug?: string;
    content?: string;
    featured_image?: string;
    category: 'general' | 'events' | 'updates' | 'urgent';
    priority: 'low' | 'medium' | 'high';
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
    upload_token?: string;
  }): Promise<AnnouncementResponse> {
    const response = await http({ method: 'post', url: '/announcements', data });
    return response.data;
  }

  static async updateAnnouncement(id: number, data: Partial<Announcement> & { upload_token?: string }): Promise<AnnouncementResponse> {
    const response = await http({ method: 'put', url: `/announcements/${id}`, data });
    return response.data;
  }

  static async deleteAnnouncement(id: number): Promise<any> {
    const response = await http({ method: 'delete', url: `/announcements/${id}` });
    return response.data;
  }
}

