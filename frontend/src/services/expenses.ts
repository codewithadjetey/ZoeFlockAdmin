import { api } from '@/utils/api';
import { Expense, ExpenseCategory, PaginatedResponse } from '@/interfaces/expenses';

export const ExpensesService = {
  async getExpenses(params?: { 
    page?: number; 
    per_page?: number; 
    category_id?: string; 
    is_paid?: string; 
    search?: string; 
  }): Promise<PaginatedResponse<Expense>> {
    const res = await api.get('/expenses', { params });
    return res.data as any;
  },

  async getCategories(params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<ExpenseCategory>> {
    const res = await api.get('/expense-categories', { params });
    return res.data as any;
  },

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    const res = await api.post('/expenses', data);
    return res.data as any;
  },

  async updateExpense(id: number, data: Partial<Expense>): Promise<Expense> {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data as any;
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },

  async createCategory(data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const res = await api.post('/expense-categories', data);
    return res.data as any;
  },

  async updateCategory(id: number, data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const res = await api.put(`/expense-categories/${id}`, data);
    return res.data as any;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/expense-categories/${id}`);
  },
};