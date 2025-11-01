import { http } from '@/utils';

export interface SermonSeries {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  sermons_count?: number;
}

export interface SermonSeriesResponse {
  success: boolean;
  message: string;
  data: SermonSeries[];
}

export interface SermonSeriesItemResponse {
  success: boolean;
  message: string;
  data: SermonSeries;
}

export class SermonSeriesService {
  static async getSeries(filters: {
    search?: string;
  } = {}): Promise<SermonSeriesResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);

    const response = await http({ method: 'get', url: `/sermons/series?${params.toString()}` });
    return response.data as SermonSeriesResponse;
  }

  static async getSerie(id: number): Promise<SermonSeriesItemResponse> {
    const response = await http({ method: 'get', url: `/sermons/series/${id}` });
    return response.data as SermonSeriesItemResponse;
  }

  static async createSeries(data: {
    name: string;
    slug?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    upload_token?: string;
  }): Promise<SermonSeriesItemResponse> {
    const response = await http({ method: 'post', url: '/sermons/series', data });
    return response.data;
  }

  static async updateSeries(id: number, data: Partial<SermonSeries> & { upload_token?: string }): Promise<SermonSeriesItemResponse> {
    const response = await http({ method: 'put', url: `/sermons/series/${id}`, data });
    return response.data;
  }

  static async deleteSeries(id: number): Promise<any> {
    const response = await http({ method: 'delete', url: `/sermons/series/${id}` });
    return response.data;
  }
}

