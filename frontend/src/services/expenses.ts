import { api } from '@/utils/api';
import { ExpenseCategory } from '@/interfaces/expenses';

export const ExpensesService = {
  async getCategories(): Promise<ExpenseCategory[]> {
    const res = await api.get('/expense-categories');
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