import { api } from '@/utils/api';
import { Income, IncomeCategory, PaginatedResponse } from '@/interfaces/income';

export const IncomeService = {
  async getIncomes(params?: { page?: number; per_page?: number; category_id?: string; is_received?: string; search?: string }): Promise<PaginatedResponse<Income>> {
    const res = await api.get('/incomes', { params });
    return res.data as any;
  },

  async createIncome(data: Partial<Income>): Promise<Income> {
    const res = await api.post('/incomes', data);
    return res.data as any;
  },

  async updateIncome(id: number, data: Partial<Income>): Promise<Income> {
    const res = await api.put(`/incomes/${id}`, data);
    return res.data as any;
  },

  async deleteIncome(id: number): Promise<void> {
    await api.delete(`/incomes/${id}`);
  },

  async getCategories(params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<IncomeCategory>> {
    const res = await api.get('/income-categories', { params });
    return res.data as any;
  },

  async createCategory(data: Partial<IncomeCategory>): Promise<IncomeCategory> {
    const res = await api.post('/income-categories', data);
    return res.data as any;
  },

  async updateCategory(id: number, data: Partial<IncomeCategory>): Promise<IncomeCategory> {
    const res = await api.put(`/income-categories/${id}`, data);
    return res.data as any;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/income-categories/${id}`);
  },
};