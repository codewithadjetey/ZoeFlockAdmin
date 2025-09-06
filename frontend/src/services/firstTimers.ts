import { http } from '@/utils';

export interface FirstTimer {
  id?: number;
  name: string;
  location?: string;
  primary_mobile_number: string;
  secondary_mobile_number?: string;
  how_was_service?: string;
  is_first_time: boolean;
  has_permanent_place_of_worship: boolean;
  invited_by?: string;
  invited_by_member_id?: number;
  would_like_to_stay: boolean;
  self_registered?: boolean;
  status?: 'first_timer' | 'visitor' | 'converted' | 'member';
  created_at?: string;
  updated_at?: string;
}

export interface FirstTimersResponse {
  success: boolean;
  message: string;
  data: {
    data: FirstTimer[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface FirstTimerResponse {
  success: boolean;
  message: string;
  data: {
    first_timer: FirstTimer;
  };
}

export class FirstTimersService {
  static async getFirstTimers(params: Record<string, any> = {}): Promise<FirstTimersResponse> {
    const searchParams = new URLSearchParams(params);
    const response = await http({ method: 'get', url: `/first-timers?${searchParams.toString()}` });
    return response.data as FirstTimersResponse;
  }

  static async createFirstTimer(data: Partial<FirstTimer>): Promise<FirstTimerResponse> {
    const response = await http({ method: 'post', url: '/first-timers', data });
    return response.data as FirstTimerResponse;
  }

  static async updateFirstTimer(id: number, data: Partial<FirstTimer>): Promise<FirstTimerResponse> {
    const response = await http({ method: 'put', url: `/first-timers/${id}`, data });
    return response.data as FirstTimerResponse;
  }

  static async deleteFirstTimer(id: number): Promise<any> {
    const response = await http({ method: 'delete', url: `/first-timers/${id}` });
    return response.data;
  }
}