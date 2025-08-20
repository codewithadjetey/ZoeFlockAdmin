import { api } from '@/utils/api';
import { ExpenseCategory } from '@/interfaces/expenses';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const ExpensesService = {
  async getCategories(params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<ExpenseCategory>> {
    const res = await api.get('/expense-categories', { params });
    return res.data;
  },

  async createCategory(data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const res = await api.post('/expense-categories', data);
    return res.data;
  },

  async updateCategory(id: number, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const res = await api.put(`/expense-categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/expense-categories/${id}`);
  },
};