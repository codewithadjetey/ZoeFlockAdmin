import { http } from '@/utils';
import type { 
  Attendance, 
  GeneralAttendance, 
  AttendanceStats, 
  AttendanceAnalytics, 
  AttendanceSummary,
  BulkAttendanceUpdate 
} from '@/interfaces/attendance';

export interface AttendanceResponse {
  success: boolean;
  message: string;
  data: Attendance[];
}

export interface AttendanceStatsResponse {
  success: boolean;
  message: string;
  data: {
    event: any;
    attendances: Attendance[];
    statistics: AttendanceStats;
  };
}

export interface EligibleMembersResponse {
  success: boolean;
  message: string;
  data: {
    event: any;
    eligible_members: any[];
    total_count: number;
  };
}

export interface GeneralAttendanceResponse {
  success: boolean;
  message: string;
  data: {
    event: any;
    general_attendance: GeneralAttendance;
  };
}

export interface AttendanceAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    analytics: AttendanceAnalytics[];
    date_range: {
      start_date: string;
      end_date: string;
    };
  };
}

export interface AttendanceSummaryResponse {
  success: boolean;
  message: string;
  data: AttendanceSummary;
}

export class AttendanceService {
  /**
   * Get attendance records for a specific event
   */
  static async getEventAttendance(eventId: number): Promise<AttendanceStatsResponse> {
    const response = await http({ method: 'get', url: `/events/${eventId}/attendance` });
    return response.data as AttendanceStatsResponse;
  }

  /**
   * Get eligible members for an event
   */
  static async getEligibleMembers(eventId: number): Promise<EligibleMembersResponse> {
    const response = await http({ method: 'get', url: `/events/${eventId}/attendance/eligible-members` });
    return response.data as EligibleMembersResponse;
  }

  /**
   * Update individual attendance status
   */
  static async updateAttendanceStatus(
    eventId: number, 
    memberId: number, 
    data: { status: string; notes?: string }
  ): Promise<{ success: boolean; message: string; data: Attendance }> {
    const response = await http({ 
      method: 'put', 
      url: `/events/${eventId}/attendance/${memberId}/status`,
      data 
    });
    return response.data;
  }

  /**
   * Mark check-in for a member
   */
  static async markCheckIn(eventId: number, memberId: number): Promise<{ success: boolean; message: string; data: Attendance }> {
    const response = await http({ method: 'post', url: `/events/${eventId}/attendance/${memberId}/check-in` });
    return response.data;
  }

  /**
   * Mark check-out for a member
   */
  static async markCheckOut(eventId: number, memberId: number): Promise<{ success: boolean; message: string; data: Attendance }> {
    const response = await http({ method: 'post', url: `/events/${eventId}/attendance/${memberId}/check-out` });
    return response.data;
  }

  /**
   * Bulk update attendance statuses
   */
  static async bulkUpdateAttendance(
    eventId: number, 
    attendances: BulkAttendanceUpdate[]
  ): Promise<{ success: boolean; message: string; data: any }> {
    const response = await http({ 
      method: 'post', 
      url: `/events/${eventId}/attendance/bulk-update`,
      data: { attendances } 
    });
    return response.data;
  }

  /**
   * Get general attendance for an event
   */
  static async getEventGeneralAttendance(eventId: number): Promise<GeneralAttendanceResponse> {
    const response = await http({ method: 'get', url: `/general-attendance/event/${eventId}` });
    return response.data as GeneralAttendanceResponse;
  }

  /**
   * Update general attendance for an event
   */
  static async updateGeneralAttendance(
    eventId: number, 
    data: { total_attendance: number; first_timers_count?: number; notes?: string }
  ): Promise<{ success: boolean; message: string; data: GeneralAttendance }> {
    const response = await http({ 
      method: 'post', 
      url: `/general-attendance/event/${eventId}`,
      data 
    });
    return response.data;
  }

  /**
   * Get attendance analytics
   */
  static async getAttendanceAnalytics(
    startDate?: string, 
    endDate?: string
  ): Promise<AttendanceAnalyticsResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await http({ 
      method: 'get', 
      url: `/general-attendance/analytics?${params.toString()}` 
    });
    return response.data as AttendanceAnalyticsResponse;
  }

  /**
   * Get attendance summary for dashboard
   */
  static async getAttendanceSummary(): Promise<AttendanceSummaryResponse> {
    const response = await http({ method: 'get', url: '/general-attendance/summary' });
    return response.data as AttendanceSummaryResponse;
  }

  /**
   * Get available attendance statuses
   */
  static getAttendanceStatuses(): string[] {
    return ['present', 'absent', 'first_timer'];
  }

  /**
   * Get status badge color
   */
  static getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'first_timer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
} 