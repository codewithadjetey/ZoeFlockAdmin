import { http } from '@/utils';
import type { Paginated } from '@/interfaces/api';

export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  template: string;
  status: 'draft' | 'published' | 'scheduled';
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  published_at?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  creator?: any;
  updater?: any;
}

export interface CmsPagesResponse {
  success: boolean;
  message: string;
  data: Paginated<CmsPage>;
}

export interface CmsPageResponse {
  success: boolean;
  message: string;
  data: CmsPage;
}

export class CmsPagesService {
  static async getPages(filters: {
    search?: string;
    status?: 'draft' | 'published' | 'scheduled';
    page?: number;
    per_page?: number;
  } = {}): Promise<CmsPagesResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));

    const response = await http({ method: 'get', url: `/cms/pages?${params.toString()}` });
    return response.data as CmsPagesResponse;
  }

  static async getPage(id: number): Promise<CmsPageResponse> {
    const response = await http({ method: 'get', url: `/cms/pages/${id}` });
    return response.data as CmsPageResponse;
  }

  static async createPage(data: {
    title: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featured_image?: string;
    template?: string;
    status: 'draft' | 'published' | 'scheduled';
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    published_at?: string;
    upload_token?: string;
  }): Promise<CmsPageResponse> {
    const response = await http({ method: 'post', url: '/cms/pages', data });
    return response.data;
  }

  static async updatePage(id: number, data: Partial<CmsPage> & { upload_token?: string }): Promise<CmsPageResponse> {
    const response = await http({ method: 'put', url: `/cms/pages/${id}`, data });
    return response.data;
  }

  static async deletePage(id: number): Promise<any> {
    const response = await http({ method: 'delete', url: `/cms/pages/${id}` });
    return response.data;
  }

  static async publishPage(id: number): Promise<CmsPageResponse> {
    const response = await http({ method: 'post', url: `/cms/pages/${id}/publish` });
    return response.data;
  }
}

