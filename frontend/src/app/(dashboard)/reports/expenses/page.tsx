'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageHeader, Button, TextInput, SelectInput, ViewToggle, DataTable } from '@/components/ui';
import { ExpensesChart } from '@/components/reports';
import { ReportsService, ReportFilters } from '@/services/reports';
import { ExpenseCategory } from '@/interfaces/expenses';

export default function ExpensesReportsPage() {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'stacked'>('bar');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

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
      const response = await fetch('/api/expense-categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadReportData = async () => {
    setIsLoading(true);
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
      // Fallback to mock data
      setReportData({
        totalExpenses: 28450,
        totalBudget: 32000,
        variance: 3550,
        averagePerMonth: 2370.83,
        categoryBreakdown: [
          { category: 'Utilities', amount: 8500, budget: 9000, count: 12, avgAmount: 708.33, trend: '+5.2%', status: 'under_budget' },
          { category: 'Maintenance', amount: 7200, budget: 8000, count: 8, avgAmount: 900.00, trend: '+3.1%', status: 'under_budget' },
          { category: 'Office Supplies', amount: 4500, budget: 5000, count: 15, avgAmount: 300.00, trend: '+1.8%', status: 'under_budget' },
          { category: 'Events', amount: 3800, budget: 3500, count: 6, avgAmount: 633.33, trend: '+12.5%', status: 'over_budget' },
          { category: 'Technology', amount: 3200, budget: 3000, count: 4, avgAmount: 800.00, trend: '+8.7%', status: 'over_budget' },
          { category: 'Miscellaneous', amount: 1250, budget: 1500, count: 10, avgAmount: 125.00, trend: '-2.3%', status: 'under_budget' }
        ],
        monthlyTrends: [
          { month: 'Jan', utilities: 680, maintenance: 580, office: 380, events: 280, tech: 250, total: 2170 },
          { month: 'Feb', utilities: 720, maintenance: 620, office: 420, events: 320, tech: 280, total: 2360 },
          { month: 'Mar', utilities: 750, maintenance: 650, office: 450, events: 380, tech: 320, total: 2550 },
          { month: 'Apr', utilities: 780, maintenance: 680, office: 480, events: 420, tech: 350, total: 2710 },
          { month: 'May', utilities: 820, maintenance: 720, office: 520, events: 480, tech: 380, total: 2920 },
          { month: 'Jun', utilities: 850, maintenance: 750, office: 550, events: 520, tech: 420, total: 3090 }
        ]
      });
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
    { key: 'amount', label: 'Total Amount' },
    { key: 'budget', label: 'Budget' },
    { key: 'count', label: 'Transactions' },
    { key: 'avgAmount', label: 'Average Amount' },
    { key: 'trend', label: 'Trend' },
    { key: 'status', label: 'Status' }
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
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
                onChange={(e) => setChartType(e as any)}
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
          
          <ExpensesChart 
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
            renderCell={(item, column) => {
              switch (column.key) {
                case 'amount':
                  return <span className="font-semibold text-red-600">{formatCurrency(item.amount)}</span>;
                case 'budget':
                  return <span className="text-blue-600">{formatCurrency(item.budget)}</span>;
                case 'avgAmount':
                  return <span className="text-gray-600 dark:text-gray-400">{formatCurrency(item.avgAmount)}</span>;
                case 'trend':
                  return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.trend.startsWith('+') 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {item.trend}
                    </span>
                  );
                case 'status':
                  return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  );
                default:
                  return item[column.key as keyof typeof item];
              }
            }}
            searchable={false}
            sortable={true}
            pagination={false}
          />
        </div>
      )}

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Category Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportData.categoryBreakdown.map((category, index) => (
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
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 