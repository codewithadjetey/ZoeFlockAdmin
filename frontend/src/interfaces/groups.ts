import { User } from './auth';

export interface GroupMember {
  id: number;
  name: string;
  email?: string;
  role: string;
  joined_at: string;
  is_active: boolean;
  notes?: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  max_members: number;
  meeting_day: string;
  meeting_time: string;
  location: string;
  status: string;
  img_path?: string;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  member_count?: number;
  available_spots?: number;
  is_full?: boolean;
  members?: GroupMember[];
  creator?: User;
  updater?: User;
}

export interface CreateGroup {
  name: string;
  description: string;
  max_members: number;
  meeting_day: string;
  meeting_time: string;
  location: string;
  status?: string;
  img_path?: string;
}

export interface GroupFilters {
  search?: string;
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