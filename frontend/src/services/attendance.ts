import { http } from '@/utils';
import type { 
  Attendance, 
  GeneralAttendance, 
  AttendanceStats, 
  AttendanceAnalytics, 
  AttendanceSummary,
  BulkAttendanceUpdate,
  AttendanceFilters,
  MemberIdentification,
  BarcodeScanData,
  AttendanceResponse,
  AttendanceListResponse,
  AttendanceStatsResponse,
  EligibleMembersResponse,
  GeneralAttendanceResponse,
  AttendanceAnalyticsResponse,
  AttendanceSummaryResponse,
  MemberIdentificationResponse,
  BarcodeScanResponse,
  UpdateAttendanceStatusRequest,
  BulkAttendanceUpdateRequest,
  GeneralAttendanceRequest,
  AttendanceAnalyticsRequest
} from '@/interfaces/attendance';

export class AttendanceService {
  /**
   * Validate attendance status
   */
  static isValidStatus(status: string): status is 'present' | 'absent' | 'first_timer' {
    return ['present', 'absent', 'first_timer'].includes(status);
  }

  /**
   * Calculate attendance statistics from attendance records
   */
  static calculateAttendanceStats(attendances: Attendance[]): {
    present: number;
    absent: number;
    first_timer: number;
    total: number;
  } {
    const stats = {
      present: 0,
      absent: 0,
      first_timer: 0,
      total: attendances.length
    };

    attendances.forEach(attendance => {
      switch (attendance.status) {
        case 'present':
          stats.present++;
          break;
        case 'absent':
          stats.absent++;
          break;
        case 'first_timer':
          stats.first_timer++;
          break;
      }
    });

    return stats;
  }

  /**
   * Get status badge color for UI
   */
  static getStatusBadgeColor(status: 'present' | 'absent' | 'first_timer'): string {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'first_timer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  /**
   * Get status icon for UI
   */
  static getStatusIcon(status: 'present' | 'absent' | 'first_timer'): string {
    switch (status) {
      case 'present':
        return 'fas fa-check-circle';
      case 'absent':
        return 'fas fa-times-circle';
      case 'first_timer':
        return 'fas fa-star';
      default:
        return 'fas fa-question-circle';
    }
  }

  /**
   * Get status display name for UI
   */
  static getStatusDisplayName(status: 'present' | 'absent' | 'first_timer'): string {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'first_timer':
        return 'First Timer';
      default:
        return 'Unknown';
    }
  }

  /**
   * Format attendance time for display
   */
  static formatAttendanceTime(timeString: string): string {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  /**
   * Get all attendance records with optional filters
   */
  static async getAttendances(filters: AttendanceFilters = {}): Promise<AttendanceListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await http({ method: 'get', url: `/attendances?${params.toString()}` });
    return response.data as AttendanceListResponse;
  }

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
   * Ensure attendance records exist for an event
   */
  static async ensureAttendanceRecords(eventId: number): Promise<{ success: boolean; message: string; data: any }> {
    const response = await http({ method: 'post', url: `/events/${eventId}/attendance/ensure-records` });
    return response.data as { success: boolean; message: string; data: any };
  }

  /**
   * Update attendance status for a specific member
   */
  static async updateAttendanceStatus(
    eventId: number, 
    memberId: number, 
    data: UpdateAttendanceStatusRequest
  ): Promise<AttendanceResponse> {
    const response = await http({ 
      method: 'put', 
      url: `/events/${eventId}/attendance/${memberId}/status`, 
      data 
    });
    return response.data as AttendanceResponse;
  }

  /**
   * Mark check-in for a member
   */
  static async markCheckIn(eventId: number, memberId: number): Promise<AttendanceResponse> {
    const response = await http({ method: 'post', url: `/events/${eventId}/attendance/${memberId}/check-in` });
    return response.data as AttendanceResponse;
  }

  /**
   * Mark check-out for a member
   */
  static async markCheckOut(eventId: number, memberId: number): Promise<AttendanceResponse> {
    const response = await http({ method: 'post', url: `/events/${eventId}/attendance/${memberId}/check-out` });
    return response.data as AttendanceResponse;
  }

  /**
   * Bulk update attendance for multiple members
   */
  static async bulkUpdateAttendance(
    eventId: number, 
    data: BulkAttendanceUpdateRequest
  ): Promise<{ success: boolean; message: string; data: Attendance[] }> {
    const response = await http({ 
      method: 'post', 
      url: `/events/${eventId}/attendance/bulk-update`, 
      data 
    });
    return response.data as { success: boolean; message: string; data: Attendance[] };
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
    data: GeneralAttendanceRequest
  ): Promise<GeneralAttendanceResponse> {
    const response = await http({ 
      method: 'post', 
      url: `/general-attendance/event/${eventId}`, 
      data 
    });
    return response.data as GeneralAttendanceResponse;
  }

  /**
   * Get attendance analytics for a date range
   */
  static async getAttendanceAnalytics(
    filters: AttendanceAnalyticsRequest
  ): Promise<AttendanceAnalyticsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await http({ method: 'get', url: `/general-attendance/analytics?${params.toString()}` });
    return response.data as AttendanceAnalyticsResponse;
  }

  /**
   * Get attendance summary for dashboard
   */
  static async getAttendanceSummary(): Promise<AttendanceSummaryResponse> {
    const response = await http({ method: 'get', url: `/general-attendance/summary` });
    return response.data as AttendanceSummaryResponse;
  }

  /**
   * Get general attendance statistics
   */
  static async getGeneralAttendanceStatistics(params: {
    start_date?: string;
    end_date?: string;
    event_type?: 'group' | 'family' | 'general';
    per_page?: number;
  } = {}): Promise<AttendanceAnalyticsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await http({ method: 'get', url: `/general-attendance/statistics?${queryParams.toString()}` });
    return response.data as AttendanceAnalyticsResponse;
  }

  /**
   * Get individual attendance statistics
   */
  static async getIndividualAttendanceStatistics(params: {
    member_id?: number;
    start_date?: string;
    end_date?: string;
    status?: 'present' | 'absent' | 'first_timer';
    per_page?: number;
  } = {}): Promise<AttendanceListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await http({ method: 'get', url: `/attendances/statistics?${queryParams.toString()}` });
    return response.data as AttendanceListResponse;
  }

  /**
   * Get families for attendance
   */
  static async getFamilies(): Promise<{
    success: boolean;
    data: Array<{
      id: number;
      name: string;
      member_count: number;
      active_members: number;
    }>;
  }> {
    const response = await http({ method: 'get', url: '/families' });
    return response.data as {
      success: boolean;
      data: Array<{
        id: number;
        name: string;
        member_count: number;
        active_members: number;
      }>;
    };
  }

  /**
   * Scan member ID for attendance
   */
  static async scanMemberId(data: BarcodeScanData): Promise<BarcodeScanResponse> {
    const response = await http({ 
      method: 'post', 
      url: '/attendance/scan-member-id', 
      data 
    });
    return response.data as BarcodeScanResponse;
  }

  /**
   * Get member identification ID
   */
  static async getMemberIdentificationId(memberId: number): Promise<MemberIdentificationResponse> {
    const response = await http({ method: 'get', url: `/members/${memberId}/identification-id` });
    return response.data as MemberIdentificationResponse;
  }

  /**
   * Generate member identification ID
   */
  static async generateMemberIdentificationId(memberId: number): Promise<MemberIdentificationResponse> {
    const response = await http({ method: 'post', url: `/members/${memberId}/generate-identification-id` });
    return response.data as MemberIdentificationResponse;
  }

  /**
   * Get attendance records for a specific member
   */
  static async getMemberAttendance(memberId: number, filters: AttendanceFilters = {}): Promise<AttendanceListResponse> {
    const params = new URLSearchParams();
    params.append('member_id', memberId.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await http({ method: 'get', url: `/attendances?${params.toString()}` });
    return response.data as AttendanceListResponse;
  }

  /**
   * Get attendance records for a specific date range
   */
  static async getAttendanceByDateRange(
    startDate: string, 
    endDate: string, 
    filters: AttendanceFilters = {}
  ): Promise<AttendanceListResponse> {
    const params = new URLSearchParams();
    params.append('date_from', startDate);
    params.append('date_to', endDate);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await http({ method: 'get', url: `/attendances?${params.toString()}` });
    return response.data as AttendanceListResponse;
  }

  /**
   * Get attendance records by status
   */
  static async getAttendanceByStatus(
    status: 'present' | 'absent' | 'first_timer', 
    filters: AttendanceFilters = {}
  ): Promise<AttendanceListResponse> {
    const params = new URLSearchParams();
    params.append('status', status);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await http({ method: 'get', url: `/attendances?${params.toString()}` });
    return response.data as AttendanceListResponse;
  }

  /**
   * Export attendance data
   */
  static async exportAttendance(
    filters: AttendanceFilters = {},
    format: 'csv' | 'excel' | 'pdf' = 'excel'
  ): Promise<{ success: boolean; download_url: string; filename: string }> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await http({ method: 'get', url: `/attendances/export?${params.toString()}` });
    return response.data as { success: boolean; download_url: string; filename: string };
  }
}