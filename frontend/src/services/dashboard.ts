import { http } from '@/utils';

export interface DashboardStatistics {
  total_members: number;
  total_families: number;
  active_groups: number;
  upcoming_events: number;
  active_families: number;
  total_family_members: number;
}

export interface AttendanceDataPoint {
  name: string;
  attendance: number;
  target: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: string;
  color: string;
}

export interface QuickStats {
  new_members_this_month: number;
  new_families_this_month: number;
  events_this_month: number;
  total_tithes_this_month: number;
  attendance_rate: number;
}

export interface DashboardData {
  statistics: DashboardStatistics;
  attendance_data: AttendanceDataPoint[];
  recent_activities: RecentActivity[];
  upcoming_events: UpcomingEvent[];
  quick_stats: QuickStats;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data?: DashboardData;
  error?: string;
}

export class DashboardService {
  /**
   * Get comprehensive dashboard data
   */
  static async getDashboardData(): Promise<DashboardResponse> {
    try {
      const response = await http({ method: 'get', url: '/dashboard/data' });
      return response.data as DashboardResponse;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dashboard data',
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Get only statistics data
   */
  static async getStatistics(): Promise<DashboardStatistics | null> {
    const response = await this.getDashboardData();
    return response.success ? response.data?.statistics || null : null;
  }

  /**
   * Get only attendance data
   */
  static async getAttendanceData(): Promise<AttendanceDataPoint[]> {
    const response = await this.getDashboardData();
    return response.success ? response.data?.attendance_data || [] : [];
  }

  /**
   * Get only recent activities
   */
  static async getRecentActivities(): Promise<RecentActivity[]> {
    const response = await this.getDashboardData();
    return response.success ? response.data?.recent_activities || [] : [];
  }

  /**
   * Get only upcoming events
   */
  static async getUpcomingEvents(): Promise<UpcomingEvent[]> {
    const response = await this.getDashboardData();
    return response.success ? response.data?.upcoming_events || [] : [];
  }

  /**
   * Get only quick stats
   */
  static async getQuickStats(): Promise<QuickStats | null> {
    const response = await this.getDashboardData();
    return response.success ? response.data?.quick_stats || null : null;
  }
} 