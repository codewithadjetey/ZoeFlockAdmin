import { User } from './auth';
import { Event } from './events';
import { Member } from '../services/members';

// Base Attendance Interface
export interface Attendance {
  id: number;
  event_id: number;
  member_id: number;
  status: 'present' | 'absent' | 'first_timer';
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  recorded_by: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  event?: Event;
  member?: Member;
  recordedBy?: User;
}

// General Attendance Interface
export interface GeneralAttendance {
  id: number;
  event_id: number;
  total_attendance: number;
  first_timers_count: number;
  notes?: string;
  recorded_by: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  event?: Event;
  recordedBy?: User;
}

// Attendance Statistics Interface
export interface AttendanceStats {
  event: Event;
  individual_attendance: {
    present: number;
    absent: number;
    first_timer: number;
    total_individual: number;
  };
  general_attendance?: {
    total_attendance: number;
    first_timers_count: number;
  };
  eligible_members_count: number;
}

// Attendance Analytics Interface
export interface AttendanceAnalytics {
  event_id: number;
  event_title: string;
  event_date: string;
  individual_stats: {
    present: number;
    absent: number;
    first_timer: number;
    total_individual: number;
  };
  general_stats?: {
    total_attendance: number;
    first_timers_count: number;
  };
  eligible_members: number;
}

// Attendance Summary Interface
export interface AttendanceSummary {
  current_month: {
    total_events: number;
    total_attendance: number;
    total_first_timers: number;
    average_attendance: number;
  };
  last_month: {
    total_events: number;
    total_attendance: number;
    total_first_timers: number;
    average_attendance: number;
  };
}

// Bulk Attendance Update Interface
export interface BulkAttendanceUpdate {
  member_id: number;
  status: 'present' | 'absent' | 'first_timer';
  notes?: string;
}

// Attendance Filters Interface
export interface AttendanceFilters {
  event_id?: number;
  member_id?: number;
  status?: 'present' | 'absent' | 'first_timer';
  date_from?: string;
  date_to?: string;
  recorded_by?: number;
  per_page?: number;
}

// Member Identification Interface
export interface MemberIdentification {
  member_id: number;
  member_identification_id: string;
  member_name: string;
}

// Barcode Scan Interface
export interface BarcodeScanData {
  barcode: string;
  event_id: number;
  notes?: string;
}

// Response Interfaces
export interface AttendanceResponse {
  success: boolean;
  message: string;
  data: Attendance;
}

export interface AttendanceListResponse {
  success: boolean;
  message: string;
  data: {
    data: Attendance[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AttendanceStatsResponse {
  success: boolean;
  message: string;
  data: {
    event: Event;
    attendances: Attendance[];
    statistics: AttendanceStats;
  };
}

export interface EligibleMembersResponse {
  success: boolean;
  message: string;
  data: {
    event: Event;
    eligible_members: Member[];
    total_count: number;
  };
}

export interface GeneralAttendanceResponse {
  success: boolean;
  message: string;
  data: {
    event: Event;
    general_attendance: GeneralAttendance | GeneralAttendance[];
  };
}

export interface AttendanceAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    analytics: AttendanceAnalytics[];
    summary: {
      total_events: number;
      total_attendance: number;
      total_first_timers: number;
      average_attendance: number;
    };
  };
}

export interface AttendanceSummaryResponse {
  success: boolean;
  message: string;
  data: AttendanceSummary;
}

export interface MemberIdentificationResponse {
  success: boolean;
  message: string;
  data: MemberIdentification;
}

export interface BarcodeScanResponse {
  success: boolean;
  message: string;
  data: {
    attendance: Attendance;
    member: Member;
    event: Event;
  };
}

// Request Interfaces
export interface UpdateAttendanceStatusRequest {
  status: 'present' | 'absent' | 'first_timer';
  notes?: string;
}

export interface BulkAttendanceUpdateRequest {
  attendances: BulkAttendanceUpdate[];
}

export interface GeneralAttendanceRequest {
  total_attendance: number;
  first_timers_count: number;
  notes?: string;
}

export interface AttendanceAnalyticsRequest {
  start_date: string;
  end_date: string;
  event_type?: 'group' | 'family' | 'general';
}

// Legacy interfaces for backward compatibility
