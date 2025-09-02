'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageHeader, Button, TextInput, SelectInput, ViewToggle, DataTable, DataGrid } from '@/components/ui';
import { IncomeChart } from '@/components/reports';
import { ReportsService, ReportFilters, IncomeReportData } from '@/services/reports';
import { EntitiesService, EntityOption } from '@/services/entities';

interface CategoryBreakdownItem {
  category: string;
  amount: number;
  count: number;
  avgAmount: number;
  trend: string;
}

export default function IncomeReportsPage() {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  // Set default date range to one year from today
  const getDefaultDateRange = () => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    return {
      startDate: oneYearAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState<IncomeReportData | null>(null);
  const [categories, setCategories] = useState<EntityOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const viewOptions = [
    { value: 'chart', label: 'Chart', icon: 'fas fa-chart-area' },
    { value: 'table', label: 'Table', icon: 'fas fa-table' }
  ];

  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart', icon: 'fas fa-chart-line' },
    { value: 'area', label: 'Area Chart', icon: 'fas fa-chart-area' },
    { value: 'bar', label: 'Bar Chart', icon: 'fas fa-chart-bar' },
    // { value: 'stacked', label: 'Stacked Bar', icon: 'fas fa-chart-bar' }
  ];

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load report data when filters change
  useEffect(() => {
    loadReportData();
  }, [startDate, endDate, category]);

  const loadCategories = async () => {
    try {
      const response = await EntitiesService.getIncomeCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load income categories');
    }
  };

  const loadReportData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filters: ReportFilters = {
        startDate,
        endDate,
        category: category === 'all' ? undefined : category,
        period: 'monthly'
      };
      
      const data = await ReportsService.getIncomeReport(filters);
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      setError('Failed to load income report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await ReportsService.exportReport({
        reportType: 'income',
        startDate,
        endDate,
        format: 'excel',
        includeCharts: true,
        includeTables: true
      });
      
      // Create download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      alert('Income report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat.name.toLowerCase(), label: cat.name }))
  ];

  const tableColumns = [
    { key: 'category', label: 'Category' },
    { 
      key: 'amount', 
      label: 'Total Amount',
      render: (value: number) => <span className="font-semibold text-green-600">{formatCurrency(value)}</span>
    },
    { key: 'count', label: 'Transactions' },
    { 
      key: 'avgAmount', 
      label: 'Average Amount',
      render: (value: number) => <span className="text-gray-600 dark:text-gray-400">{formatCurrency(value)}</span>
    },
    { 
      key: 'trend', 
      label: 'Trend',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value.startsWith('+') 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  // Loading state
  if (isLoading && !reportData) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Income Reports"
          description="Comprehensive income analysis and reporting"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400">Loading report data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error && !reportData) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Income Reports"
          description="Comprehensive income analysis and reporting"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button variant="primary" onClick={loadReportData}>
              <i className="fas fa-refresh mr-2"></i>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // No data state
  if (!reportData) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Income Reports"
          description="Comprehensive income analysis and reporting"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400">No income data available for the selected period.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Income Reports"
        description="Comprehensive income analysis and reporting"
      />

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <TextInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <TextInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <SelectInput
                value={category}
                onChange={(value) => setCategory(value)}
                options={categoryOptions}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chart Type
              </label>
                              <SelectInput
                  value={chartType}
                  onChange={(value) => setChartType(value as 'line' | 'area' | 'bar')}
                  options={chartTypeOptions}
                  className="w-full"
                />
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={loadReportData}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-filter mr-2"></i>
                  Apply Filters
                </>
              )}
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleExport}
              disabled={isExporting || !reportData}
            >
              {isExporting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Exporting...
                </>
              ) : (
                <>
                  <i className="fas fa-file-excel mr-2"></i>
                  Export to Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: 'Total Income', 
            value: formatCurrency(reportData.totalIncome), 
            change: reportData.growthRate, 
            color: 'from-green-500 to-emerald-600',
            icon: 'fas fa-dollar-sign'
          },
          { 
            title: 'Total Transactions', 
            value: reportData.totalTransactions.toString(), 
            change: '+8.2%', 
            color: 'from-blue-500 to-cyan-600',
            icon: 'fas fa-receipt'
          },
          { 
            title: 'Average Amount', 
            value: formatCurrency(reportData.averageAmount), 
            change: '+4.1%', 
            color: 'from-purple-500 to-indigo-600',
            icon: 'fas fa-chart-line'
          },
          { 
            title: 'Growth Rate', 
            value: reportData.growthRate, 
            change: '+2.3%', 
            color: 'from-yellow-500 to-orange-600',
            icon: 'fas fa-trending-up'
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white text-xl`}>
                <i className={stat.icon}></i>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{stat.change}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Income Analysis
        </h2>
        <ViewToggle
          value={viewMode}
          onChange={(value: string) => setViewMode(value as 'chart' | 'table')}
          options={viewOptions}
          count={reportData.categoryBreakdown.length}
          countLabel="categories"
        />
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Monthly Income Trends
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Income breakdown by category over the selected period
            </p>
          </div>
          
          <IncomeChart 
            data={reportData.monthlyTrends}
            type={chartType}
            height={400}
          />
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <DataTable
            data={reportData.categoryBreakdown}
            columns={tableColumns}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              totalItems: reportData.categoryBreakdown.length,
              perPage: reportData.categoryBreakdown.length,
              onPageChange: () => {},
              onPerPageChange: () => {}
            }}
          />
        </div>
      )}

      {/* Category Breakdown */}
      {/* <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Category Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportData.categoryBreakdown.map((category: CategoryBreakdownItem, index: number) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{category.category}</h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">{category.count} transactions</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {formatCurrency(category.amount)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Avg: {formatCurrency(category.avgAmount)}
                </span>
                <span className={`font-medium ${
                  category.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {category.trend}
                </span>
              </div>
            </div>
          ))}
        </div> */}
      {/* </div> */}
    </DashboardLayout>
  );
} 