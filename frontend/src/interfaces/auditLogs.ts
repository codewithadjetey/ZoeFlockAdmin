export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  model_type: string;
  model_id: number;
  description: string;
  details: any;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'error' | 'warning';
  error_message: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface AuditLogFilters {
  search?: string;
  user_id?: number;
  model_type?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface AuditLogListResponse {
  success: boolean;
  data: {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
