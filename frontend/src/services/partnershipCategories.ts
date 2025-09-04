import { api } from '@/utils/api';

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface PartnershipCategory {
  id: number;
  name: string;
  description?: string;
}

export const PartnershipCategoriesService = {
  async list(params: any = {}) {
    const res = await api.get<ApiResponse<PaginatedResponse<PartnershipCategory>>>('/partnership-categories', { params });
    return (res.data as ApiResponse<PaginatedResponse<PartnershipCategory>>).data;
  },
  async get(id: number) {
    const res = await api.get<ApiResponse<PartnershipCategory>>(`/partnership-categories/${id}`);
    return (res.data as ApiResponse<PartnershipCategory>).data;
  },
  async create(data: Partial<PartnershipCategory>) {
    const res = await api.post<ApiResponse<PartnershipCategory>>('/partnership-categories', data);
    return (res.data as ApiResponse<PartnershipCategory>);
  },
  async update(id: number, data: Partial<PartnershipCategory>) {
    const res = await api.put<ApiResponse<PartnershipCategory>>(`/partnership-categories/${id}`, data);
    return (res.data as ApiResponse<PartnershipCategory>);
  },
  async delete(id: number) {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/partnership-categories/${id}`);
    return (res.data as ApiResponse<{ message: string }>);
  },
};