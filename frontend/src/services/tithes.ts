import { http } from '@/utils';
import {
  Tithe,
  CreateTitheRequest,
  UpdateTitheRequest,
  MarkTithePaidRequest,
  TitheFilters,
  TitheStatistics,
  TitheMonthlyTrend,
  TitheMemberPerformance,
  TitheFrequencyAnalysis,
  TitheRecentActivity,
  AddTithePaymentRequest,
  UpdateTithePaymentRequest,
  TithePayment,
} from '@/interfaces';

export const titheService = {
  /**
   * Get all tithes with optional filters
   */
  async getTithes(filters?: TitheFilters, page: number = 1) {
    const params = new URLSearchParams();
    
    if (filters?.member_id) params.append('member_id', filters.member_id.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.frequency) params.append('frequency', filters.frequency);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (page > 1) params.append('page', page.toString());

    const response = await http({ method: 'get', url: `/tithes?${params.toString()}` });
    return response.data;
  },

  /**
   * Get a specific tithe by ID
   */
  async getTithe(id: number) {
    const response = await http({ method: 'get', url: `/tithes/${id}` });
    return response.data;
  },

  /**
   * Create a new tithe
   */
  async createTithe(data: CreateTitheRequest) {
    const response = await http({ method: 'post', url: '/tithes', data });
    return response.data;
  },

  /**
   * Update an existing tithe
   */
  async updateTithe(id: number, data: UpdateTitheRequest) {
    const response = await http({ method: 'put', url: `/tithes/${id}`, data });
    return response.data;
  },

  /**
   * Delete a tithe
   */
  async deleteTithe(id: number) {
    const response = await http({ method: 'delete', url: `/tithes/${id}` });
    return response.data;
  },

  /**
   * Mark a tithe as paid
   */
  async markTitheAsPaid(id: number, data: MarkTithePaidRequest) {
    const response = await http({ method: 'post', url: `/tithes/${id}/mark-paid`, data });
    return response.data;
  },

  /**
   * Get tithe statistics
   */
  async getTitheStatistics(filters?: { start_date?: string; end_date?: string }) {
    const params = new URLSearchParams();
    
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const response = await http({ method: 'get', url: `/tithes/statistics?${params.toString()}` });
    return response.data;
  },

  /**
   * Get monthly trends for tithes
   */
  async getMonthlyTrends(filters?: { start_date?: string; end_date?: string }): Promise<{ data: TitheMonthlyTrend[] }> {
    const params = new URLSearchParams();
    
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const response = await http({ method: 'get', url: `/tithes/monthly-trends?${params.toString()}` });
    return response.data;
  },

  /**
   * Get member performance analytics
   */
  async getMemberPerformance(filters?: { start_date?: string; end_date?: string }): Promise<{ data: TitheMemberPerformance[] }> {
    const params = new URLSearchParams();
    
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const response = await http({ method: 'get', url: `/tithes/member-performance?${params.toString()}` });
    return response.data;
  },

  /**
   * Get frequency analysis
   */
  async getFrequencyAnalysis(filters?: { start_date?: string; end_date?: string }): Promise<{ data: TitheFrequencyAnalysis }> {
    const params = new URLSearchParams();
    
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const response = await http({ method: 'get', url: `/tithes/frequency-analysis?${params.toString()}` });
    return response.data;
  },

  /**
   * Get recent tithe activity
   */
  async getRecentActivity(): Promise<{ data: TitheRecentActivity[] }> {
    const response = await http({ method: 'get', url: '/tithes/recent-activity' });
    return response.data;
  },

  /**
   * Export tithe report
   */
  async exportReport(data: {
    format: 'excel' | 'pdf' | 'csv';
    type: 'summary' | 'detailed' | 'member_performance';
    start_date?: string;
    end_date?: string;
  }) {
    const response = await http({ method: 'post', url: '/tithes/export', data });
    return response.data;
  },

  /**
   * Get tithes for a specific member
   */
  async getMemberTithes(memberId: number, filters?: Omit<TitheFilters, 'member_id'>) {
    const params = new URLSearchParams();
    params.append('member_id', memberId.toString());
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.frequency) params.append('frequency', filters.frequency);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const response = await http({ method: 'get', url: `/tithes?${params.toString()}` });
    return response.data;
  },

  /**
   * Get overdue tithes
   */
  async getOverdueTithes() {
    const response = await http({ method: 'get', url: '/tithes?status=overdue' });
    return response.data;
  },

  /**
   * Get active tithes
   */
  async getActiveTithes() {
    const response = await http({ method: 'get', url: '/tithes?status=active' });
    return response.data;
  },

  /**
   * Get unpaid tithes
   */
  async getUnpaidTithes() {
    const response = await http({ method: 'get', url: '/tithes?status=unpaid' });
    return response.data;
  },

  // New payment methods
  /**
   * Add a partial payment to a tithe
   */
  async addPayment(titheId: number, data: AddTithePaymentRequest) {
    const response = await http({ method: 'post', url: `/tithes/${titheId}/payments`, data });
    return response.data;
  },

  /**
   * Get payment history for a tithe
   */
  async getPaymentHistory(titheId: number) {
    const response = await http({ method: 'get', url: `/tithes/${titheId}/payments` });
    return response.data;
  },

  /**
   * Get a specific payment
   */
  async getPayment(titheId: number, paymentId: number) {
    const response = await http({ method: 'get', url: `/tithes/${titheId}/payments/${paymentId}` });
    return response.data;
  },

  /**
   * Update a payment
   */
  async updatePayment(titheId: number, paymentId: number, data: UpdateTithePaymentRequest) {
    const response = await http({ method: 'put', url: `/tithes/${titheId}/payments/${paymentId}`, data });
    return response.data;
  },

  /**
   * Delete a payment
   */
  async deletePayment(titheId: number, paymentId: number) {
    const response = await http({ method: 'delete', url: `/tithes/${titheId}/payments/${paymentId}` });
    return response.data;
  },
}; 