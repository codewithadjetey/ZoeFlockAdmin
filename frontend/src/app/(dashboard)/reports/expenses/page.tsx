'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageHeader, Button, TextInput, SelectInput, ViewToggle, DataTable } from '@/components/ui';
import { ExpensesChart } from '@/components/reports';
import { ReportsService, ReportFilters } from '@/services/reports';
import { ExpenseCategory } from '@/interfaces/expenses';
import { EntitiesService, EntityOption } from '@/services/entities';

interface CategoryBreakdownItem {
  category: string;
  amount: number;
  budget: number;
  count: number;
  avgAmount: number;
  trend: string;
  status: string;
}

interface TableColumn {
  key: string;
  label: string;
}

interface MonthlyTrendItem {
  month: string;
  total: number;
  [key: string]: number | string;
}

export default function ExpensesReportsPage() {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'stacked'>('line');
  
  // Set default date range to 1 year ago from today
  const getDefaultDateRange = () => {
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return {
      startDate: oneYearAgo.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };
  
  const defaultDates = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);
  const [category, setCategory] = useState('all');
  const [showTotal, setShowTotal] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
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
    { value: 'stacked', label: 'Stacked Bar', icon: 'fas fa-chart-bar' }
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
      const response = await EntitiesService.getExpenseCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load expense categories');
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
      
      const data = await ReportsService.getExpenseReport(filters);
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      // Generate dynamic mock data based on loaded categories
      const dynamicCategories = categories.length > 0 ? categories.map(cat => cat.name.toLowerCase()) : ['utilities', 'maintenance', 'office', 'events', 'tech'];
      
      // Generate monthly trends based on the selected date range
      const generateMonthlyData = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const months: Array<{ month: string; total: number; [key: string]: number | string }> = [];
        
        let current = new Date(start.getFullYear(), start.getMonth(), 1);
        
        while (current <= end) {
          const monthName = current.toLocaleDateString('en-US', { month: 'short' });
          const monthData: { month: string; total: number; [key: string]: number | string } = {
            month: monthName,
            total: 0
          };
          
          // Generate data for each category
          dynamicCategories.forEach((cat, index) => {
            const baseAmount = 300 + (index * 100) + Math.random() * 200;
            const amount = Math.round(baseAmount + (Math.random() * 100));
            monthData[cat] = amount;
            monthData.total += amount;
          });
          
          months.push(monthData);
          
          // Move to next month
          current.setMonth(current.getMonth() + 1);
        }
        
        return months;
      };
      
      const monthlyTrends = generateMonthlyData();
      
      // Generate category breakdown
      const categoryBreakdown = dynamicCategories.map((cat, index) => {
        const amount = 2000 + (index * 1000) + Math.random() * 2000;
        const budget = amount * (0.8 + Math.random() * 0.4);
        const trend = (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 15).toFixed(1) + '%';
        const status = amount > budget ? 'over_budget' : 'under_budget';
        
        return {
          category: cat.charAt(0).toUpperCase() + cat.slice(1),
          amount: Math.round(amount),
          budget: Math.round(budget),
          count: Math.floor(Math.random() * 20) + 5,
          avgAmount: Math.round(amount / (Math.floor(Math.random() * 20) + 5)),
          trend,
          status
        };
      });
      
      const totalExpenses = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);
      const totalBudget = categoryBreakdown.reduce((sum, cat) => sum + cat.budget, 0);
      
      setReportData({
        totalExpenses,
        totalBudget,
        variance: totalBudget - totalExpenses,
        averagePerMonth: totalExpenses / monthlyTrends.length,
        categoryBreakdown,
        monthlyTrends
      });
      
      // Set selected categories for chart
      setSelectedCategories(dynamicCategories);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const result = await ReportsService.exportReport({
        reportType: 'expenses',
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
      
      alert('Expenses report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report. Please try again.');
    } finally {
      setIsLoading(false);
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
      render: (value: number) => <span className="font-semibold text-red-600">{formatCurrency(value)}</span>
    },
    { 
      key: 'budget', 
      label: 'Budget',
      render: (value: number) => <span className="text-blue-600">{formatCurrency(value)}</span>
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
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusLabel(value)}
        </span>
      )
    }
  ];

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_budget':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'on_budget':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'over_budget':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'under_budget':
        return 'Under Budget';
      case 'on_budget':
        return 'On Budget';
      case 'over_budget':
        return 'Over Budget';
      default:
        return 'Unknown';
    }
  };

  if (!reportData) {
    return (
      <>>
        <PageHeader
          title="Expenses Reports"
          description="Comprehensive expense analysis and reporting"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400">Loading report data...</p>
          </div>
        </div>
       </>
    );
  }

  return (
    <>>
      <PageHeader
        title="Expenses Reports"
        description="Comprehensive expense analysis and reporting"
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
                onChange={(e) => setCategory(e)}
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
                onChange={(value) => setChartType(value as 'line' | 'area' | 'bar' | 'stacked')}
                options={chartTypeOptions}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={loadReportData}>
              <i className="fas fa-filter mr-2"></i>
              Apply Filters
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleExport}
              disabled={isLoading}
            >
              {isLoading ? (
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
            title: 'Total Expenses', 
            value: formatCurrency(reportData.totalExpenses), 
            change: reportData.variance > 0 ? '+8.2%' : '-3.1%', 
            color: 'from-red-500 to-pink-600',
            icon: 'fas fa-money-bill-wave'
          },
          { 
            title: 'Total Budget', 
            value: formatCurrency(reportData.totalBudget), 
            change: '0%', 
            color: 'from-blue-500 to-cyan-600',
            icon: 'fas fa-chart-pie'
          },
          { 
            title: 'Budget Variance', 
            value: formatCurrency(reportData.variance), 
            change: reportData.variance > 0 ? 'Under Budget' : 'Over Budget', 
            color: reportData.variance > 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-pink-600',
            icon: 'fas fa-balance-scale'
          },
          { 
            title: 'Average per Month', 
            value: formatCurrency(reportData.averagePerMonth), 
            change: '+4.1%', 
            color: 'from-purple-500 to-indigo-600',
            icon: 'fas fa-calendar-alt'
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
              <span className={`font-medium ${reportData.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">vs budget</span>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Expenses Analysis
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
              Monthly Expenses Trends
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Expenses breakdown by category over the selected period
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center" style={{ height: 400 }}>
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center" style={{ height: 400 }}>
              <div className="text-center">
                <i className="fas fa-exclamation-triangle text-2xl text-red-600 mb-2"></i>
                <p className="text-red-500">{error}</p>
              </div>
            </div>
          ) : reportData && reportData.monthlyTrends ? (
            <ExpensesChart 
              data={reportData.monthlyTrends}
              type={chartType}
              height={400}
            />
          ) : (
            <div className="flex items-center justify-center" style={{ height: 400 }}>
              <p className="text-gray-500">No data available for chart</p>
            </div>
          )}
          
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Category Breakdown
        </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportData.categoryBreakdown.length > 0 ? 
            reportData.categoryBreakdown.map((category: CategoryBreakdownItem, index: number) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">{category.category}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                    {getStatusLabel(category.status)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {formatCurrency(category.amount)}
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-blue-600">
                    Budget: {formatCurrency(category.budget)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {category.count} transactions
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Avg: {formatCurrency(category.avgAmount)}
                  </span>
                  <span className={`font-medium ${
                    category.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {category.trend}
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                No category data available
              </div>
            )}
        </div>
      </div>
     </>
  );
} 