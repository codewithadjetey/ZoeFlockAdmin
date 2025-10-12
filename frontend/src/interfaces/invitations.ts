export interface EventInvitation {
  id: number;
  event_id: number;
  member_id: number;
  unique_token: string;
  invitation_url: string;
  expires_at: string | null;
  is_active: boolean;
  click_count: number;
  response_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  event?: {
    id: number;
    title: string;
    start_date: string;
  };
  member?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface InvitationResponse {
  id: number;
  event_invitation_id: number;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  status: 'pending' | 'confirmed' | 'declined' | 'attended';
  number_of_guests: number;
  notes: string | null;
  special_requirements: string | null;
  responded_at: string;
  created_at: string;
  updated_at: string;
  invited_by?: {
    id: number;
    name: string;
  };
}

export interface CreateInvitationRequest {
  event_id: number;
  member_ids?: number[];
  family_id?: number;
  church_wide?: boolean;
  expires_at?: string;
}

export interface SubmitResponseRequest {
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  status: 'pending' | 'confirmed' | 'declined';
  number_of_guests: number;
  notes?: string;
  special_requirements?: string;
}

export interface InvitationAnalytics {
  summary: {
    total_invitations: number;
    total_clicks: number;
    total_responses: number;
    total_guests: number;
    confirmed_guests: number;
    click_through_rate: number;
    response_rate: number;
  };
  responses_breakdown: {
    confirmed: number;
    declined: number;
    pending: number;
    attended: number;
  };
  top_performers: Array<{
    member_id: number;
    member_name: string;
    clicks: number;
    responses: number;
    guests: number;
    confirmed_guests: number;
  }>;
  invitations: Array<{
    id: number;
    member: {
      id: number;
      name: string;
      email: string | null;
    };
    unique_token: string;
    invitation_url: string;
    clicks: number;
    responses: number;
    total_guests: number;
    confirmed_guests: number;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
  }>;
}

export interface MemberInvitationStats {
  total_invitations: number;
  total_clicks: number;
  total_responses: number;
  total_guests: number;
  invitations: Array<{
    id: number;
    event: {
      id: number;
      title: string;
      start_date: string;
    };
    invitation_url: string;
    clicks: number;
    responses: number;
    guests: number;
  }>;
}

export interface PublicInvitationData {
  event: {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    img_path: string | null;
  };
  invited_by: {
    name: string;
    email: string;
  };
  invitation: {
    expires_at: string | null;
  };
}
