export interface Event {
  id: number;
  title: string;
  description?: string;
  start_date?: string; // Optional for recurring events
  end_date?: string;
  location?: string;
  type: 'group' | 'family' | 'general';
  category_id?: number; // Link to event category
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_settings?: Record<string, any>;
  recurrence_end_date?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  img_path?: string;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  deleted: boolean;
  
  // Relationships
  groups?: EventGroup[];
  families?: EventFamily[];
  creator?: User;
  updater?: User;
  category?: EventCategory;
  image?: FileUpload;
}

export interface EventGroup {
  id: number;
  name: string;
  description?: string;
  color?: string;
  pivot: {
    is_required: boolean;
    notes?: string;
  };
}

export interface EventFamily {
  id: number;
  name: string;
  description?: string;
  pivot: {
    is_required: boolean;
    notes?: string;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  display_name?: string;
}

export interface FileUpload {
  id: number;
  token: string;
  original_name: string;
  file_path: string;
  mime_type: string;
  size: number;
  model_type: string;
  model_id: number;
}

export interface EventCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  attendance_type: 'individual' | 'general' | 'none';
  is_active: boolean;
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_settings?: Record<string, any>;
  default_start_time?: string;
  default_duration?: number;
  default_location?: string;
  default_description?: string;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  deleted: boolean;
  
  // Relationships
  creator?: User;
  updater?: User;
  events?: Event[];
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  start_date?: string; // Optional for recurring events
  end_date?: string;
  location?: string;
  type: 'group' | 'family' | 'general';
  is_recurring?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_settings?: Record<string, any>;
  recurrence_end_date?: string;
  group_ids?: number[];
  family_ids?: number[];
  img_path?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  // All fields are optional for updates
}

export interface EventFilters {
  type?: string;
  status?: string;
  group_id?: number;
  family_id?: number;
  creator_id?: number;
  date_from?: string;
  date_to?: string;
  per_page?: number;
}

export interface EventListResponse {
  success: boolean;
  data: {
    data: Event[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface EventResponse {
  success: boolean;
  data: Event;
}

export interface EventMessageResponse {
  success: boolean;
  message: string;
  data?: Event;
} 