"use client";

import React, { useState, useEffect } from 'react';
import { Button, Input, SelectInput } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import { titheService } from '@/services/tithes';
import { TitheStatistics } from '@/interfaces';
import { formatCurrency, formatDate } from '@/utils/helpers';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TitheChart from '@/components/reports/TitheChart';

export default function TitheReportsPage() {
  const { showToast } = useToast();
  const [statistics, setStatistics] = useState<TitheStatistics | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [memberPerformance, setMemberPerformance] = useState<any[]>([]);
  const [frequencyAnalysis, setFrequencyAnalysis] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    end_date: new Date().toISOString().split('T')[0], // Today
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [exportType, setExportType] = useState<'summary' | 'detailed' | 'member_performance'>('summary');

  useEffect(() => {
    loadAllData();
  }, [dateRange]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all data in parallel
      const [
        statisticsResponse,
        trendsResponse,
        performanceResponse,
        frequencyResponse,
        activityResponse
      ] = await Promise.all([
        titheService.getTitheStatistics(dateRange),
        titheService.getMonthlyTrends(dateRange),
        titheService.getMemberPerformance(dateRange),
        titheService.getFrequencyAnalysis(dateRange),
        titheService.getRecentActivity()
      ]);

      setStatistics(statisticsResponse.data);
      setMonthlyTrends(trendsResponse.data);
      setMemberPerformance(performanceResponse.data);
      setFrequencyAnalysis(frequencyResponse.data);
      setRecentActivity(activityResponse.data);
    } catch (error: any) {
      console.error('Error loading tithe data:', error);
      setError('Failed to load tithe data. Please try again.');
      showToast(error.response?.data?.message || 'Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field: 'start_date' | 'end_date', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const response = await titheService.exportReport({
        format: exportFormat,
        type: exportType,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });

      // Download the file
      const fileUrl = response.data.file_url;
      const fileName = response.data.file_name;
      
      // Try to download using fetch first (for better error handling)
      try {
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
          throw new Error(`HTTP error! status: ${fileResponse.status}`);
        }
        
        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (fetchError) {
        // Fallback to direct link if fetch fails
        console.warn('Fetch download failed, trying direct link:', fetchError);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      showToast('Report exported successfully', 'success');
    } catch (error: any) {
      console.error('Error exporting report:', error);
      showToast(error.response?.data?.message || 'Error exporting report', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const getFrequencyChartData = () => {
    if (!frequencyAnalysis) return [];
    
    return [
      { name: 'Weekly', value: frequencyAnalysis.weekly.count, color: '#3B82F6' },
      { name: 'Monthly', value: frequencyAnalysis.monthly.count, color: '#10B981' }
    ];
  };

  const getPaymentStatusChartData = () => {
    if (!statistics) return [];
    
    return [
      { name: 'Paid', value: statistics.paid_tithes, color: '#10B981' },
      { name: 'Unpaid', value: statistics.unpaid_tithes, color: '#F59E0B' },
      { name: 'Overdue', value: statistics.overdue_tithes, color: '#EF4444' }
    ];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tithe analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadAllData} variant="primary">
              <i className="fas fa-sync-alt mr-2"></i>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tithe Reports & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive analysis of church tithe collections and trends</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={loadAllData} disabled={loading} variant="outline" size="sm">
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </Button>
            <Button onClick={handleExport} disabled={exportLoading} variant="primary" size="sm">
              {exportLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Exporting...
                </>
              ) : (
                <>
                  <i className="fas fa-download mr-2"></i>
                  Export Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Date Range</h3>
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => handleDateRangeChange('end_date', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Export Options</h3>
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <SelectInput
                value={exportFormat}
                onChange={(value) => setExportFormat(value as 'excel' | 'pdf' | 'csv')}
                options={[
                  { value: 'excel', label: 'Excel' },
                  { value: 'pdf', label: 'PDF' },
                  { value: 'csv', label: 'CSV' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <SelectInput
                value={exportType}
                onChange={(value) => setExportType(value as 'summary' | 'detailed' | 'member_performance')}
                options={[
                  { value: 'summary', label: 'Summary Report' },
                  { value: 'detailed', label: 'Detailed Report' },
                  { value: 'member_performance', label: 'Member Performance' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <i className="fas fa-church text-blue-600 dark:text-blue-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tithes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total_tithes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <i className="fas fa-check-circle text-green-600 dark:text-green-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid Tithes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.paid_tithes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unpaid Tithes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.unpaid_tithes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <i className="fas fa-clock text-red-600 dark:text-red-400"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Tithes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.overdue_tithes}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Summary */}
        {statistics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Financial Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(statistics.total_amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(statistics.total_paid_amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Outstanding:</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{formatCurrency(statistics.total_outstanding)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Frequency Distribution</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Weekly Tithes:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{statistics.weekly_tithes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Monthly Tithes:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{statistics.monthly_tithes}</span>
                </div>
                <div className="pt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${statistics.total_tithes > 0 ? (statistics.weekly_tithes / statistics.total_tithes) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Weekly</span>
                    <span>Monthly</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Paid:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{statistics.paid_tithes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Unpaid:</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{statistics.unpaid_tithes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Overdue:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{statistics.overdue_tithes}</span>
                </div>
                <div className="pt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${statistics.total_tithes > 0 ? (statistics.paid_tithes / statistics.total_tithes) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    Payment Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends Chart */}
          {monthlyTrends.length > 0 && (
            <TitheChart
              data={monthlyTrends}
              type="line"
              title="Monthly Trends"
              height={400}
            />
          )}

          {/* Frequency Distribution Chart */}
          {frequencyAnalysis && (
            <TitheChart
              data={getFrequencyChartData()}
              type="pie"
              title="Frequency Distribution"
              height={400}
            />
          )}
        </div>

        {/* Member Performance */}
        {memberPerformance.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Member Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Tithes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Average Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {memberPerformance.map((member, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {member.member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {member.total_tithes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(member.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(member.total_paid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          member.payment_rate >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          member.payment_rate >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {member.payment_rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(member.average_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${
                      activity.type === 'Payment' ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-cyan-600'
                    } flex items-center justify-center text-white mr-4`}>
                      <i className={`fas ${activity.type === 'Payment' ? 'fa-arrow-up' : 'fa-church'}`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{activity.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${activity.color}`}>
                    {activity.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for Recent Activity */}
        {recentActivity.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
            <div className="text-center py-8">
              <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600 dark:text-gray-400">No recent activity found</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Recent tithe transactions will appear here</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 