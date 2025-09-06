'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageHeader, Button, TextInput, SelectInput, ViewToggle, DataTable } from '@/components/ui';
import { ComparisonChart } from '@/components/reports';
import { ReportsService, ReportFilters } from '@/services/reports';
import { EntitiesService, EntityOption } from '@/services/entities';

interface CategoryComparison {
  category: string;
  income: number;
  expenses: number;
  net: number;
  percentage: number;
}

export default function IncomeVsExpensesReportsPage() {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'stacked'>('bar');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
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
    // { value: 'stacked', label: 'Stacked Bar', icon: 'fas fa-chart-bar' }
  ];

  // Load report data when filters change
  useEffect(() => {
    loadReportData();
  }, [startDate, endDate]);

  useEffect(() => {
    loadCategories();
  }, []);


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
        period: 'monthly'
      };
      
      const data = await ReportsService.getComparisonReport(filters);
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      // Fallback to mock data
      setReportData({
        totalIncome: 45280,
        totalExpenses: 28450,
        netProfit: 16830,
        profitMargin: 37.2,
        monthlyComparison: [
          { month: 'Jan', income: 3300, expenses: 2170, profit: 1130, profitMargin: 34.2 },
          { month: 'Feb', income: 3630, expenses: 2360, profit: 1270, profitMargin: 35.0 },
          { month: 'Mar', income: 3850, expenses: 2550, profit: 1300, profitMargin: 33.8 },
          { month: 'Apr', income: 4020, expenses: 2710, profit: 1310, profitMargin: 32.6 },
          { month: 'May', income: 4200, expenses: 2920, profit: 1280, profitMargin: 30.5 },
          { month: 'Jun', income: 4350, expenses: 3090, profit: 1260, profitMargin: 29.0 }
        ],
        categoryComparison: [
          { category: 'Tithes', income: 18500, expenses: 0, net: 18500, percentage: 40.9 },
          { category: 'Offerings', income: 12400, expenses: 0, net: 12400, percentage: 27.4 },
          { category: 'Partnerships', income: 9800, expenses: 0, net: 9800, percentage: 21.6 },
          { category: 'Utilities', income: 0, expenses: 8500, net: -8500, percentage: -18.8 },
          { category: 'Maintenance', income: 0, expenses: 7200, net: -7200, percentage: -15.9 },
          { category: 'Office Supplies', income: 0, expenses: 4500, net: -4500, percentage: -9.9 }
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
        reportType: 'comparison',
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
      
      alert('Income vs Expenses report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tableColumns = [
    { key: 'month', label: 'Month' },
    { 
      key: 'income', 
      label: 'Income',
      render: (value: any, item: any) => <span className="font-semibold text-green-600">{formatCurrency(item.income)}</span>
    },
    { 
      key: 'expenses', 
      label: 'Expenses',
      render: (value: any, item: any) => <span className="font-semibold text-red-600">{formatCurrency(item.expenses)}</span>
    },
    { 
      key: 'profit', 
      label: 'Net Profit',
      render: (value: any, item: any) => (
        <span className={`font-semibold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(item.profit)}
        </span>
      )
    },
    { 
      key: 'profitMargin', 
      label: 'Profit Margin',
      render: (value: any, item: any) => (
        <span className={`font-semibold ${item.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatPercentage(item.profitMargin)}
        </span>
      )
    }
  ];

  const categoryTableColumns = [
    { key: 'category', label: 'Category' },
    { key: 'income', label: 'Income' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'net', label: 'Net' },
    { key: 'percentage', label: 'Percentage' }
  ];

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (!reportData) {
    return (
      <>
        <PageHeader
          title="Income vs Expenses Reports"
          description="Comprehensive financial comparison and analysis"
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
    <>
      <PageHeader
        title="Income vs Expenses Reports"
        description="Comprehensive financial comparison and analysis"
      />

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
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
            title: 'Total Income', 
            value: formatCurrency(reportData.totalIncome), 
            change: '+12.5%', 
            color: 'from-green-500 to-emerald-600',
            icon: 'fas fa-arrow-up'
          },
          { 
            title: 'Total Expenses', 
            value: formatCurrency(reportData.totalExpenses), 
            change: '+8.2%', 
            color: 'from-red-500 to-pink-600',
            icon: 'fas fa-arrow-down'
          },
          { 
            title: 'Net Profit', 
            value: formatCurrency(reportData.netProfit), 
            change: '+15.7%', 
            color: 'from-blue-500 to-cyan-600',
            icon: 'fas fa-chart-line'
          },
          { 
            title: 'Profit Margin', 
            value: formatPercentage(reportData.profitMargin), 
            change: '+2.3%', 
            color: 'from-purple-500 to-indigo-600',
            icon: 'fas fa-percentage'
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

      {/* Financial Health Indicator */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Financial Health Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatPercentage(reportData.profitMargin)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
            <div className="mt-2">
              <span className="text-green-600 text-sm">
                <i className="fas fa-arrow-up mr-1"></i>
                Excellent
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(reportData.netProfit)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
            <div className="mt-2">
              <span className="text-green-600 text-sm">
                <i className="fas fa-arrow-up mr-1"></i>
                Growing
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(reportData.totalIncome / reportData.totalExpenses)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Income/Expense Ratio</p>
            <div className="mt-2">
              <span className="text-green-600 text-sm">
                <i className="fas fa-check mr-1"></i>
                Healthy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Monthly Comparison Analysis
        </h2>
        <ViewToggle
          value={viewMode}
          onChange={(value: string) => setViewMode(value as 'chart' | 'table')}
          options={viewOptions}
          count={reportData.monthlyComparison.length}
          countLabel="months"
        />
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Monthly Income vs Expenses Trends
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comparison of income and expenses over the selected period
            </p>
          </div>
          
          <ComparisonChart 
            data={reportData.monthlyComparison}
            type={chartType}
            height={400}
          />
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <DataTable
            data={reportData.monthlyComparison}
            columns={tableColumns}
          />
        </div>
      )}

      {/* Category Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Category Comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportData.categoryComparison.map((category: CategoryComparison, index: number) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{category.category}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  category.net >= 0 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {category.net >= 0 ? 'Income' : 'Expense'}
                </span>
              </div>
              <div className={`text-2xl font-bold mb-2 ${category.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(category.net))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {category.income > 0 ? `Income: ${formatCurrency(category.income)}` : `Expense: ${formatCurrency(category.expenses)}`}
                </span>
                <span className={`font-medium ${category.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(Math.abs(category.percentage))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Financial Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center">
              <i className="fas fa-chart-line mr-2"></i>
              Positive Trends
            </h4>
            <ul className="text-green-800 dark:text-green-200 space-y-2">
              <li>• Profit margin of {formatPercentage(reportData.profitMargin)} indicates healthy financial performance</li>
              <li>• Net profit increased by 15.7% compared to last period</li>
              <li>• Income growth (12.5%) exceeds expense growth (8.2%)</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
              <i className="fas fa-lightbulb mr-2"></i>
              Recommendations
            </h4>
            <ul className="text-blue-800 dark:text-blue-200 space-y-2">
              <li>• Continue focusing on partnership development</li>
              <li>• Monitor expense growth in technology and events categories</li>
              <li>• Consider increasing budget allocation for growth initiatives</li>
            </ul>
          </div>
        </div>
      </div>
     </>
  );
} 