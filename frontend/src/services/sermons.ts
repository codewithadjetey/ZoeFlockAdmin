import { http } from '@/utils';
import type { Paginated } from '@/interfaces/api';

export interface SermonMedia {
  id: number;
  sermon_id: number;
  media_type: 'audio' | 'video' | 'youtube' | 'document';
  file_path?: string;
  youtube_url?: string;
  external_url?: string;
  duration?: number;
  file_size?: number;
  order: number;
  created_at?: string;
  updated_at?: string;
  url?: string;
}

export interface Sermon {
  id: number;
  title: string;
  slug: string;
  speaker: string;
  sermon_date: string;
  series_id?: number;
  scripture_reference?: string;
  description?: string;
  thumbnail?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  creator?: any;
  updater?: any;
  series?: any;
  media?: SermonMedia[];
}

export interface SermonsResponse {
  success: boolean;
  message: string;
  data: Paginated<Sermon>;
}

export interface SermonResponse {
  success: boolean;
  message: string;
  data: Sermon;
}

export class SermonsService {
  static async getSermons(filters: {
    search?: string;
    series_id?: number;
    speaker?: string;
    status?: 'draft' | 'published';
    page?: number;
    per_page?: number;
  } = {}): Promise<SermonsResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.series_id) params.append('series_id', String(filters.series_id));
    if (filters.speaker) params.append('speaker', filters.speaker);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));

    const response = await http({ method: 'get', url: `/sermons?${params.toString()}` });
    return response.data as SermonsResponse;
  }

  static async getSermon(id: number): Promise<SermonResponse> {
    const response = await http({ method: 'get', url: `/sermons/${id}` });
    return response.data as SermonResponse;
  }

  static async createSermon(data: {
    title: string;
    slug?: string;
    speaker: string;
    sermon_date: string;
    series_id?: number;
    scripture_reference?: string;
    description?: string;
    status: 'draft' | 'published';
    published_at?: string;
    upload_token?: string;
    media?: Array<{
      media_type: 'audio' | 'video' | 'youtube' | 'document';
      file_path?: string;
      youtube_url?: string;
      external_url?: string;
      duration?: number;
      order?: number;
    }>;
  }): Promise<SermonResponse> {
    const response = await http({ method: 'post', url: '/sermons', data });
    return response.data;
  }

  static async updateSermon(id: number, data: Partial<Sermon> & { upload_token?: string }): Promise<SermonResponse> {
    const response = await http({ method: 'put', url: `/sermons/${id}`, data });
    return response.data;
  }

  static async deleteSermon(id: number): Promise<any> {
    const response = await http({ method: 'delete', url: `/sermons/${id}` });
    return response.data;
  }

  static async publishSermon(id: number): Promise<SermonResponse> {
    const response = await http({ method: 'post', url: `/sermons/${id}/publish` });
    return response.data;
  }

  static async addMedia(sermonId: number, data: {
    media_type: 'audio' | 'video' | 'youtube' | 'document';
    file_path?: string;
    youtube_url?: string;
    external_url?: string;
    duration?: number;
    order?: number;
  }): Promise<any> {
    const response = await http({ method: 'post', url: `/sermons/${sermonId}/media`, data });
    return response.data;
  }

  static async updateMedia(sermonId: number, mediaId: number, data: Partial<SermonMedia>): Promise<any> {
    const response = await http({ method: 'put', url: `/sermons/${sermonId}/media/${mediaId}`, data });
    return response.data;
  }

  static async deleteMedia(sermonId: number, mediaId: number): Promise<any> {
    const response = await http({ method: 'delete', url: `/sermons/${sermonId}/media/${mediaId}` });
    return response.data;
  }
}

