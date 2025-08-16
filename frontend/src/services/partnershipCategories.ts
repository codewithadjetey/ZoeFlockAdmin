import { api } from '@/utils/api';

export interface PartnershipCategory {
  id: number;
  name: string;
  description?: string;
}

export const PartnershipCategoriesService = {
  async list(params: any = {}) {
    const res = await api.get('/partnership-categories', { params });
    return res.data.data;
  },
  async get(id: number) {
    const res = await api.get(`/partnership-categories/${id}`);
    return res.data.data;
  },
  async create(data: Partial<PartnershipCategory>) {
    const res = await api.post('/partnership-categories', data);
    return res.data.data;
  },
  async update(id: number, data: Partial<PartnershipCategory>) {
    const res = await api.put(`/partnership-categories/${id}`, data);
    return res.data.data;
  },
  async delete(id: number) {
    const res = await api.delete(`/partnership-categories/${id}`);
    return res.data;
  },
};