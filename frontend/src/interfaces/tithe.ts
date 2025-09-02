export interface Tithe {
  id: number;
  member_id: number;
  amount: number;
  frequency: 'weekly' | 'monthly';
  start_date: string;
  next_due_date: string;
  is_active: boolean;
  is_paid: boolean;
  paid_amount: number;
  remaining_amount: number;
  paid_date?: string;
  notes?: string;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  member?: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  creator?: {
    id: number;
    name: string;
  };
  updater?: {
    id: number;
    name: string;
  };
  payments?: TithePayment[];
}

export interface TithePayment {
  id: number;
  tithe_id: number;
  member_id: number;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'check' | 'bank_transfer' | 'mobile_money' | 'other';
  reference_number?: string;
  notes?: string;
  recorded_by: number;
  created_at: string;
  updated_at: string;
  recorder?: {
    id: number;
    name: string;
  };
}

export interface CreateTitheRequest {
  member_id: number;
  amount: number;
  frequency: 'weekly' | 'monthly';
  start_date: string;
  notes?: string;
}

export interface UpdateTitheRequest {
  amount?: number;
  frequency?: 'weekly' | 'monthly';
  start_date?: string;
  is_active?: boolean;
  notes?: string;
}

export interface MarkTithePaidRequest {
  paid_amount?: number;
  notes?: string;
}

export interface AddTithePaymentRequest {
  amount: number;
  payment_method: 'cash' | 'check' | 'bank_transfer' | 'mobile_money' | 'other';
  reference_number?: string;
  notes?: string;
  payment_date?: string;
}

export interface UpdateTithePaymentRequest {
  amount?: number;
  payment_method?: 'cash' | 'check' | 'bank_transfer' | 'mobile_money' | 'other';
  reference_number?: string;
  notes?: string;
  payment_date?: string;
}

export interface TitheFilters {
  member_id?: number;
  status?: 'active' | 'paid' | 'unpaid' | 'overdue' | 'partially_paid';
  frequency?: 'weekly' | 'monthly';
  start_date?: string;
  end_date?: string;
}

export interface TitheStatistics {
  total_tithes: number;
  active_tithes: number;
  paid_tithes: number;
  unpaid_tithes: number;
  overdue_tithes: number;
  partially_paid_tithes: number;
  total_amount: number;
  total_paid_amount: number;
  total_outstanding: number;
  weekly_tithes: number;
  monthly_tithes: number;
}

export interface TitheMonthlyTrend {
  period: string;
  total_tithes: number;
  total_amount: number;
  total_paid: number;
  total_outstanding: number;
  paid_count: number;
  unpaid_count: number;
  payment_rate: number;
}

export interface TitheMemberPerformance {
  member: {
    id: number;
    name: string;
  };
  total_tithes: number;
  total_amount: number;
  total_paid: number;
  total_outstanding: number;
  paid_count: number;
  unpaid_count: number;
  overdue_count: number;
  payment_rate: number;
  average_amount: number;
}

export interface TitheFrequencyAnalysis {
  weekly: {
    count: number;
    total_amount: number;
    paid_amount: number;
    outstanding: number;
    paid_count: number;
    unpaid_count: number;
    percentage: number;
  };
  monthly: {
    count: number;
    total_amount: number;
    paid_amount: number;
    outstanding: number;
    paid_count: number;
    unpaid_count: number;
    percentage: number;
  };
}

export interface TitheRecentActivity {
  type: 'Tithe' | 'Payment';
  amount: string;
  description: string;
  time: string;
  color: string;
  status: string;
}

export const TITHE_FREQUENCIES = {
  weekly: 'Weekly',
  monthly: 'Monthly',
} as const;

export const TITHE_STATUSES = {
  active: 'Active',
  paid: 'Paid',
  unpaid: 'Unpaid',
  overdue: 'Overdue',
  partially_paid: 'Partially Paid',
} as const;

export const PAYMENT_METHODS = {
  cash: 'Cash',
  check: 'Check',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  other: 'Other',
} as const; 