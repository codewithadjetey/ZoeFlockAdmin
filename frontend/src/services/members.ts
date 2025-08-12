import { http } from '@/utils';
import type { Paginated } from '@/interfaces/api';

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  occupation?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  baptism_date?: string;
  membership_date?: string;
  is_active: boolean;
  notes?: string;
  profile_image_path?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MembersResponse {
  success: boolean;
  message: string;
  members: Paginated<Member>;
}

export interface MemberResponse {
  success: boolean;
  message: string;
  data: {
    member: Member;
  };
}

export class MembersService {
  static async getMembers(filters: {
    search?: string;
    status?: 'active' | 'inactive';
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
    unassigned_family?: boolean;
  } = {}): Promise<MembersResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));
    if (filters.unassigned_family) params.append('unassigned_family', String(filters.unassigned_family));

    const response = await http({ method: 'get', url: `/members?${params.toString()}` });
    return response.data as MembersResponse;
  }

  static async getByPageUrl(url: string): Promise<MembersResponse> {
    const response = await http({ method: 'get', url });
    return response.data as MembersResponse;
  }

  static async createMember(data: { 
    first_name: string; 
    last_name: string; 
    email: string; 
    phone?: string; 
    address?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
    occupation?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    baptism_date?: string;
    membership_date?: string;
    notes?: string;
    upload_token?: string;
  }): Promise<MemberResponse> {
    const response = await http({ method: 'post', url: '/members', data });
    return response.data;
  }

  static async updateMember(id: number, data: Partial<Member> & { upload_token?: string }): Promise<MemberResponse> {
    const response = await http({ method: 'put', url: `/members/${id}`, data });
    return response.data;
  }

  static async deleteMember(id: number): Promise<any> {
    const response = await http({ method: 'delete', url: `/members/${id}` });
    return response.data;
  }

  static async getStatistics(): Promise<any> {
    const response = await http({ method: 'get', url: '/members/statistics' });
    return response.data;
  }
}