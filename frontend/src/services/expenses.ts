import { api } from '@/utils/api';
import { Expense, PaginatedResponse } from '@/interfaces/expenses';

export const ExpensesService = {
  async getExpenses(params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<Expense>> {
    const res = await api.get('/expenses', { params });
    return res.data;
  },

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    const res = await api.post('/expenses', data);
    return res.data;
  },

  async updateExpense(id: number, data: Partial<Expense>): Promise<Expense> {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data;
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};