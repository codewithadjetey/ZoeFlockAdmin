export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: number;
  category_id: number;
  category?: { id: number; name: string };
  description?: string;
  amount: number;
  paid_date: string;
  due_date?: string;
  is_paid: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}