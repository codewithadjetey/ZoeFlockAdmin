export interface IncomeCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Income {
  id: number;
  category_id: number;
  category?: { id: number; name: string };
  description?: string;
  amount: number;
  received_date: string;
  due_date?: string;
  is_received: boolean;
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