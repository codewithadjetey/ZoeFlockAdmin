import { http } from '@/utils';

export class FrontendService {
  static async createFirstTimerGuest(data: Record<string, any>) {
    const response = await http({ method: 'post', url: '/frontend/first-timer', data });
    return response.data;
  }

  static async getEventCategory(id: number) {
    const response = await http({ method: 'get', url: `/frontend/event-category/${id}` });
    return response.data;
  }
}