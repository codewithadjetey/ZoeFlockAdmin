import { api } from '@/utils/api';
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventFilters,
  EventListResponse,
  EventResponse,
  EventMessageResponse
} from '@/interfaces/events';

export class EventsService {
  /**
   * Get all events with optional filters
   */
  static async getEvents(filters: EventFilters = {}): Promise<EventListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  }

  /**
   * Get all events including those without start dates
   */
  static async getAllEvents(filters: EventFilters = {}): Promise<EventListResponse> {
    return this.getEvents({
      show_all: true,
      ...filters
    });
  }

  /**
   * Get a specific event by ID
   */
  static async getEvent(id: number): Promise<EventResponse> {
    const response = await api.get(`/events/${id}`);
    return response.data;
  }

  /**
   * Create a new event
   */
  static async createEvent(eventData: CreateEventRequest): Promise<EventResponse> {
    const response = await api.post('/events', eventData);
    return response.data;
  }

  /**
   * Update an existing event
   */
  static async updateEvent(id: number, eventData: UpdateEventRequest): Promise<EventResponse> {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  }

  /**
   * Delete an event
   */
  static async deleteEvent(id: number): Promise<EventMessageResponse> {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  }

  /**
   * Cancel an event
   */
  static async cancelEvent(id: number, reason?: string, cancelFutureInstances?: boolean): Promise<EventResponse> {
    const response = await api.post(`/events/${id}/cancel`, {
      reason,
      cancel_future_instances: cancelFutureInstances
    });
    return response.data;
  }

  /**
   * Publish an event
   */
  static async publishEvent(id: number): Promise<EventResponse> {
    const response = await api.post(`/events/${id}/publish`);
    return response.data;
  }

  /**
   * Get events for a specific member
   */
  static async getMemberEvents(memberId: number, filters: EventFilters = {}): Promise<EventListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/events/member/${memberId}?${params.toString()}`);
    return response.data;
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(filters: EventFilters = {}): Promise<EventListResponse> {
    return this.getEvents({
      status: 'published',
      ...filters
    });
  }

  /**
   * Get past events
   */
  static async getPastEvents(filters: EventFilters = {}): Promise<EventListResponse> {
    return this.getEvents({
      status: 'completed',
      ...filters
    });
  }

  /**
   * Get events by type
   */
  static async getEventsByType(type: 'group' | 'family' | 'general', filters: EventFilters = {}): Promise<EventListResponse> {
    return this.getEvents({
      type,
      ...filters
    });
  }

  /**
   * Get events by group
   */
  static async getEventsByGroup(groupId: number, filters: EventFilters = {}): Promise<EventListResponse> {
    return this.getEvents({
      group_id: groupId,
      ...filters
    });
  }

  /**
   * Get events by family
   */
  static async getEventsByFamily(familyId: number, filters: EventFilters = {}): Promise<EventListResponse> {
    return this.getEvents({
      family_id: familyId,
      ...filters
    });
  }

  /**
   * Get recurring events
   */
  static async getRecurringEvents(filters: EventFilters = {}): Promise<EventListResponse> {
    return this.getEvents({
      ...filters
    }).then(response => {
      // Filter for recurring events on the client side since the API doesn't have a direct filter
      const recurringEvents = response.data.data.filter(event => event.is_recurring);
      return {
        ...response,
        data: {
          ...response.data,
          data: recurringEvents,
          total: recurringEvents.length
        }
      };
    });
  }

  /**
   * Get families associated with an event
   */
  static async getEventFamilies(eventId: number): Promise<{ success: boolean; data: any[] }> {
    const response = await api.get(`/events/${eventId}/families`);
    return response.data;
  }

  /**
   * Add families to an event
   */
  static async addFamiliesToEvent(eventId: number, familyIds: number[], isRequired: boolean = false, notes?: string): Promise<{ success: boolean; message: string; data: any[] }> {
    const response = await api.post(`/events/${eventId}/families`, {
      family_ids: familyIds,
      is_required: isRequired,
      notes
    });
    return response.data;
  }

  /**
   * Update family relationship for an event
   */
  static async updateEventFamily(eventId: number, familyId: number, isRequired?: boolean, notes?: string): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.put(`/events/${eventId}/families/${familyId}`, {
      is_required: isRequired,
      notes
    });
    return response.data;
  }

  /**
   * Remove a family from an event
   */
  static async removeFamilyFromEvent(eventId: number, familyId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/events/${eventId}/families/${familyId}`);
    return response.data;
  }
} 