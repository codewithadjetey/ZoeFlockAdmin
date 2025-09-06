import { api } from '@/utils/api';
import { Income } from '@/interfaces/income';
import { Expense } from '@/interfaces/expenses';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  category?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface IncomeReportData {
  totalIncome: number;
  totalTransactions: number;
  averageAmount: number;
  growthRate: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    avgAmount: number;
    trend: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    tithes: number;
    offerings: number;
    partnerships: number;
    total: number;
  }>;
}

export interface ExpenseReportData {
  totalExpenses: number;
  totalBudget: number;
  variance: number;
  averagePerMonth: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    budget: number;
    count: number;
    avgAmount: number;
    trend: string;
    status: 'under_budget' | 'on_budget' | 'over_budget';
  }>;
  monthlyTrends: Array<{
    month: string;
    utilities: number;
    maintenance: number;
    office: number;
    events: number;
    tech: number;
    total: number;
  }>;
}

export interface ComparisonReportData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyComparison: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  }>;
  categoryComparison: Array<{
    category: string;
    income: number;
    expenses: number;
    net: number;
    percentage: number;
  }>;
}

export interface ExportReportOptions {
  reportType: 'comprehensive' | 'income' | 'expenses' | 'comparison' | 'budget' | 'custom';
  startDate: string;
  endDate: string;
  format: 'excel' | 'pdf' | 'csv' | 'json';
  includeCharts: boolean;
  includeTables: boolean;
}

export const ReportsService = {
  // Get income report data
  async getIncomeReport(filters: ReportFilters): Promise<IncomeReportData> {
    const params = {
      start_date: filters.startDate,
      end_date: filters.endDate,
      category: filters.category,
      period: filters.period,
    };
    
    const res = await api.get('/reports/income', { params });
    return res.data as any;
  },

  // Get expense report data
  async getExpenseReport(filters: ReportFilters): Promise<ExpenseReportData> {
    const params = {
      start_date: filters.startDate,
      end_date: filters.endDate,
      category: filters.category,
      period: filters.period,
    };
    
    const res = await api.get('/reports/expenses', { params });
    return res.data as any;
  },

  // Get income vs expenses comparison report
  async getComparisonReport(filters: ReportFilters): Promise<ComparisonReportData> {
    const params = {
      start_date: filters.startDate,
      end_date: filters.endDate,
      period: filters.period,
    };
    
    const res = await api.get('/reports/comparison', { params });
    return res.data as any;
  },

  // Generate and export report
  async exportReport(options: ExportReportOptions): Promise<{ downloadUrl: string; filename: string }> {
    const res = await api.post('/reports/export', options);
    return res.data as any;
  },

  // Get export history
  async getExportHistory(): Promise<Array<{
    id: number;
    name: string;
    type: string;
    format: string;
    date: string;
    status: 'completed' | 'processing' | 'failed';
    size: string;
    downloadUrl?: string;
  }>> {
    const res = await api.get('/reports/export/history');
    return res.data as any;
  },

  // Download exported report
  async downloadReport(exportId: number): Promise<Blob> {
    const res = await api.get(`/reports/export/${exportId}/download`, {
      responseType: 'blob'
    });
    return res.data as any;
  },

  // Delete exported report
  async deleteExport(exportId: number): Promise<void> {
    await api.delete(`/reports/export/${exportId}`);
  },

  // Get report summary for dashboard
  async getDashboardSummary(): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    pendingPayments: number;
    monthlyTrends: Array<{
      month: string;
      income: number;
      expenses: number;
      profit: number;
    }>;
  }> {
    const res = await api.get('/reports/dashboard-summary');
    return res.data as any;
  },

  // Get financial insights
  async getFinancialInsights(): Promise<{
    topIncomeCategory: string;
    topExpenseCategory: string;
    budgetVariance: number;
    growthOpportunities: string[];
    riskFactors: string[];
  }> {
    const res = await api.get('/reports/insights');
    return res.data as any;
  },

  // Get recent activity
  async getRecentActivity(): Promise<Array<{
    type: 'Income' | 'Expense';
    amount: string;
    description: string;
    time: string;
    color: string;
  }>> {
    const res = await api.get('/reports/recent-activity');
    return res.data as any;
  }
}; 