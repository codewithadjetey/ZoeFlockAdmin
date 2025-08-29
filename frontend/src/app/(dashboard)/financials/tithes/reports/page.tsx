"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import { titheService } from '@/services/tithes';
import { TitheStatistics } from '@/interfaces';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function TitheReportsPage() {
  const { showToast } = useToast();
  const [statistics, setStatistics] = useState<TitheStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    end_date: new Date().toISOString().split('T')[0], // Today
  });

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await titheService.getTitheStatistics(dateRange);
      setStatistics(response.data.data);
    } catch (error: any) {
      console.error('Error loading tithe statistics:', error);
      showToast(error.response?.data?.message || 'Error loading statistics', 'error');
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
      // This would integrate with your export service
      showToast('Export functionality coming soon', 'info');
    } catch (error: any) {
      showToast('Error exporting report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tithe Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive analysis of church tithe collections and trends</p>
        </div>
        <Button onClick={handleExport}>
          <i className="fas fa-download mr-2"></i>
          Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

      {/* Key Metrics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="fas fa-church text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tithes</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_tithes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <i className="fas fa-check-circle text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Tithes</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.paid_tithes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <i className="fas fa-exclamation-triangle text-yellow-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unpaid Tithes</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.unpaid_tithes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <i className="fas fa-clock text-red-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Tithes</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.overdue_tithes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(statistics.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-semibold text-green-600">{formatCurrency(statistics.total_paid_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Outstanding:</span>
                <span className="font-semibold text-yellow-600">{formatCurrency(statistics.total_outstanding)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Frequency Distribution</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Weekly Tithes:</span>
                <span className="font-semibold text-gray-900">{statistics.weekly_tithes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Tithes:</span>
                <span className="font-semibold text-gray-900">{statistics.monthly_tithes}</span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${statistics.total_tithes > 0 ? (statistics.weekly_tithes / statistics.total_tithes) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Weekly</span>
                  <span>Monthly</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid:</span>
                <span className="font-semibold text-green-600">{statistics.paid_tithes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unpaid:</span>
                <span className="font-semibold text-yellow-600">{statistics.unpaid_tithes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overdue:</span>
                <span className="font-semibold text-red-600">{statistics.overdue_tithes}</span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${statistics.total_tithes > 0 ? (statistics.paid_tithes / statistics.total_tithes) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">
                  Payment Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Analytics Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trends & Insights</h3>
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-chart-line text-4xl mb-4"></i>
          <p>Advanced analytics and trend visualization coming soon</p>
          <p className="text-sm">This will include monthly trends, member contribution patterns, and predictive insights</p>
        </div>
      </div>
    </div>
  );
} 