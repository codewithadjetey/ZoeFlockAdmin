import { api } from '@/utils/api';
import {
  EventCategory,
  EventListResponse,
  EventResponse
} from '@/interfaces/events';

export interface EventCategoryFilters {
  is_active?: boolean;
  is_recurring?: boolean;
  attendance_type?: 'individual' | 'general' | 'none';
  search?: string;
  per_page?: number;
}

export interface EventCategoryListResponse {
  success: boolean;
  data: {
    current_page: number;
    data: EventCategory[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface EventCategoryResponse {
  success: boolean;
  data: EventCategory;
}

export interface EventCategoryMessageResponse {
  success: boolean;
  message: string;
}

export interface GenerateEventsResponse {
  success: boolean;
  data: {
    generated_count: number;
    category: EventCategory;
  };
}

export interface GenerateEventsRequest {
  from_date?: string;
  count?: number;
  auto_publish?: boolean;
}

export class EventCategoriesService {
  /**
   * Get all event categories with optional filters
   */
  static async getEventCategories(filters: EventCategoryFilters = {}): Promise<EventCategoryListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/event-categories?${params.toString()}`);
    return response.data as any;
  }

  /**
   * Get a specific event category by ID
   */
  static async getEventCategory(id: number): Promise<EventCategoryResponse> {
    const response = await api.get(`/event-categories/${id}`);
    return response.data as any;
  }

  /**
   * Create a new event category
   */
  static async createEventCategory(categoryData: Partial<EventCategory>): Promise<EventCategoryResponse> {
    const response = await api.post('/event-categories', categoryData);
    return response.data as any;
  }

  /**
   * Update an existing event category
   */
  static async updateEventCategory(id: number, categoryData: Partial<EventCategory>): Promise<EventCategoryResponse> {
    const response = await api.put(`/event-categories/${id}`, categoryData);
    return response.data as any;
  }

  /**
   * Delete an event category
   */
  static async deleteEventCategory(id: number): Promise<EventCategoryMessageResponse> {
    const response = await api.delete(`/event-categories/${id}`);
    return response.data as any;
  }

  /**
   * Get all events for a specific category
   */
  static async getCategoryEvents(categoryId: number, filters: any = {}): Promise<EventListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/event-categories/${categoryId}/events?${params.toString()}`);
    return response.data as any;
  }

  /**
   * Generate events for a category based on recurrence settings
   */
  static async generateEvents(categoryId: number, data: GenerateEventsRequest = {}): Promise<GenerateEventsResponse> {
    const response = await api.post(`/event-categories/${categoryId}/generate-events`, data);
    return response.data as any;
  }

  /**
   * Generate a single one-time event for a category
   */
  static async generateOneTimeEvent(categoryId: number, data: { auto_publish?: boolean } = {}): Promise<EventCategoryResponse> {
    const response = await api.post(`/event-categories/${categoryId}/generate-one-time-event`, data);
    return response.data as any;
  }

  /**
   * Toggle category active status
   */
  static async toggleStatus(categoryId: number): Promise<EventCategoryResponse> {
    const response = await api.post(`/event-categories/${categoryId}/toggle-status`);
    return response.data as any;
  }

  /**
   * Get category statistics
   */
  static async getCategoryStatistics(categoryId: number): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/event-categories/${categoryId}/statistics`);
    return response.data as any;
  }

  /**
   * Get active event categories
   */
  static async getActiveEventCategories(): Promise<EventCategoryListResponse> {
    return this.getEventCategories({ is_active: true });
  }

  /**
   * Get recurring event categories
   */
  static async getRecurringEventCategories(): Promise<EventCategoryListResponse> {
    return this.getEventCategories({ is_recurring: true });
  }

  /**
   * Get categories by attendance type
   */
  static async getCategoriesByAttendanceType(type: 'individual' | 'general' | 'none'): Promise<EventCategoryListResponse> {
    return this.getEventCategories({ attendance_type: type });
  }
} 