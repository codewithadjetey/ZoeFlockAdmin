import { api } from '@/utils/api';

export interface Partnership {
  id: number;
  member_id: number;
  category_id: number;
  pledge_amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly' | 'one-time';
  start_date: string;
  end_date?: string;
  notes?: string;
  member?: any;
  category?: any;
}

export interface PartnershipCategory {
  id: number;
  name: string;
  description?: string;
}

export const PartnershipsService = {
  async list(params: any = {}) {
    const res = await api.get('/partnerships', { params });
    return res.data;
  },
  async get(id: number) {
    const res = await api.get(`/partnerships/${id}`);
    return res.data.data;
  },
  async create(data: Partial<Partnership>) {
    const res = await api.post('/partnerships', data);
    return res.data.data;
  },
  async update(id: number, data: Partial<Partnership>) {
    const res = await api.put(`/partnerships/${id}`, data);
    return res.data.data;
  },
  async delete(id: number) {
    const res = await api.delete(`/partnerships/${id}`);
    return res.data;
  },
  async listCategories() {
    const res = await api.get('/partnership-categories');
    return res.data.data;
  },
};