export interface Group {
  id?: number;
  name: string;
  description: string;
  category: string;
  type?: 'ministry' | 'fellowship' | 'study' | 'service' | 'other';
  status: string;
  max_members: number;
  member_count?: number;
  meeting_day: string;
  meeting_time: string;
  meeting_schedule?: string;
  location: string;
  leader?: {
    id: number;
    name: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
  img_path?: string | null;
}

export interface GroupFilters {
  search?: string;
  category?: string;
  type?: string;
  status?: string;
  member_count_min?: number;
  member_count_max?: number;
  page?: number;
  per_page?: number;
}

export interface GroupsResponse {
  success: boolean;
  message: string;
  groups: {
    data: Group[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface GroupResponse {
  success: boolean;
  message: string;
  data: Group;
} 