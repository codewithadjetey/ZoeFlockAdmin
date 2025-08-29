export interface Attendance {
  id?: number;
  event_id: number;
  member_id: number;
  status: 'present' | 'absent';
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  recorded_by: number;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  event?: Event;
  member?: Member;
  recordedBy?: User;
}

export interface GeneralAttendance {
  id?: number;
  event_id: number;
  family_id: number;
  total_attendance: number;
  first_timers_count: number;
  notes?: string;
  recorded_by: number;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  event?: Event;
  recordedBy?: User;
  family?: any;
}

export interface AttendanceStats {
  event: Event;
  individual_attendance: {
    present: number;
    absent: number;
    total_individual: number;
  };
  general_attendance?: {
    total_attendance: number;
    first_timers_count: number;
  };
  eligible_members_count: number;
}

export interface AttendanceAnalytics {
  event_id: number;
  event_title: string;
  event_date: string;
  individual_stats: {
    present: number;
    absent: number;
    total_individual: number;
  };
  general_stats?: {
    total_attendance: number;
    first_timers_count: number;
  };
  eligible_members: number;
}

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

export interface BulkAttendanceUpdate {
  member_id: number;
  status: 'present' | 'absent';
  notes?: string;
}

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_path?: string;
  member_identification_id: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  type: 'group' | 'family' | 'general';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
} 