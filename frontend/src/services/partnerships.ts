import { AcceptedResponse } from '@/interfaces';
import { api } from '@/utils/api';

export interface Partnership {
  id: number;
  member_id: number;
  category_id: number;
  pledge_amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly' | 'one-time';
  due_date?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  status?: 'active' | 'completed' | 'cancelled' | 'pending';
  member?: any;
  category?: any;
}

// /AcceptedResponse
export interface PartnershipResponse extends AcceptedResponse<Partnership> {
  data: Partnership;
  message: string;
  success: boolean;
}

export interface PartnershipCategory {
  id: number;
  name: string;
  description?: string;
}

export interface PartnershipListResponse {
  success: boolean;
  data: {
    data: Partnership[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const PartnershipsService = {
  async list(params: any = {}) {
    const res = await api.get('/partnerships', { params });
    return res.data as PartnershipListResponse;
  },
  async get(id: number) {
    const res = await api.get(`/partnerships/${id}`);
    return res.data;
  },
  async create(data: Partial<Partnership>) {
    const res = await api.post('/partnerships', data);
    return res.data as PartnershipResponse;
  },
  async update(id: number, data: Partial<Partnership>) {
    const res = await api.put(`/partnerships/${id}`, data);
    return res.data as PartnershipResponse;
  },
  async delete(id: number) {
    const res = await api.delete(`/partnerships/${id}`);
    return res.data as PartnershipResponse;
  }
};