import { api } from '@/utils/api';
import {
  EventInvitation,
  InvitationResponse,
  CreateInvitationRequest,
  SubmitResponseRequest,
  InvitationAnalytics,
  MemberInvitationStats,
  PublicInvitationData,
} from '@/interfaces/invitations';

const invitationService = {
  /**
   * Create invitations for an event
   */
  createInvitations: async (data: CreateInvitationRequest): Promise<{ invitations: EventInvitation[]; count: number }> => {
    const response = await api.post('/invitations/create', data);
    return response.data.data;
  },

  /**
   * Get invitation by token (public endpoint)
   */
  getInvitationByToken: async (token: string): Promise<PublicInvitationData> => {
    const response = await api.get(`/invitations/token/${token}`);
    return response.data.data;
  },

  /**
   * Submit guest response to invitation (public endpoint)
   */
  submitResponse: async (token: string, data: SubmitResponseRequest): Promise<InvitationResponse> => {
    const response = await api.post(`/invitations/token/${token}/respond`, data);
    return response.data.data;
  },

  /**
   * Get analytics for an event
   */
  getEventAnalytics: async (
    eventId: number,
    filterType?: 'church' | 'family' | 'member',
    filterId?: number
  ): Promise<InvitationAnalytics> => {
    const params = new URLSearchParams();
    if (filterType) params.append('filter_type', filterType);
    if (filterId) params.append('filter_id', filterId.toString());

    const response = await api.get(`/invitations/events/${eventId}/analytics?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Get all responses for an event
   */
  getEventResponses: async (eventId: number, status?: string): Promise<InvitationResponse[]> => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/invitations/events/${eventId}/responses${params}`);
    return response.data.data;
  },

  /**
   * Get member's invitation statistics
   */
  getMemberStats: async (memberId: number): Promise<MemberInvitationStats> => {
    const response = await api.get(`/invitations/members/${memberId}/stats`);
    return response.data.data;
  },

  /**
   * Deactivate an invitation
   */
  deactivateInvitation: async (invitationId: number): Promise<void> => {
    await api.put(`/invitations/${invitationId}/deactivate`);
  },

  /**
   * Reactivate an invitation
   */
  reactivateInvitation: async (invitationId: number): Promise<void> => {
    await api.put(`/invitations/${invitationId}/reactivate`);
  },

  /**
   * Update response status
   */
  updateResponseStatus: async (
    responseId: number,
    status: 'pending' | 'confirmed' | 'declined' | 'attended'
  ): Promise<InvitationResponse> => {
    const response = await api.put(`/invitations/responses/${responseId}/status`, { status });
    return response.data.data;
  },
};

export default invitationService;
