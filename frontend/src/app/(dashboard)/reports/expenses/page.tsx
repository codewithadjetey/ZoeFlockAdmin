'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageHeader, Button, TextInput, SelectInput, ViewToggle, DataTable } from '@/components/ui';
import { ExpensesChart } from '@/components/reports';
import { ReportsService, ReportFilters } from '@/services/reports';
import { ExpenseCategory } from '@/interfaces/expenses';

export default function ExpensesReportPage() {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'stacked' | 'budget-comparison'>('line');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  const viewOptions = [
    { value: 'chart', label: 'Chart', icon: 'fas fa-chart-bar' },
    { value: 'table', label: 'Table', icon: 'fas fa-table' }
  ];

  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart', icon: 'fas fa-chart-line' },
    { value: 'area', label: 'Area Chart', icon: 'fas fa-chart-area' },
    { value: 'bar', label: 'Bar Chart', icon: 'fas fa-chart-bar' },
    { value: 'stacked', label: 'Stacked Bar', icon: 'fas fa-chart-bar' },
    { value: 'budget-comparison', label: 'Budget vs Actual', icon: 'fas fa-balance-scale' }
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
        totalExpenses: 32450,
        totalBudget: 30500,
        variance: -1950,
        averagePerMonth: 5408,
        categoryBreakdown: [
          { category: 'Utilities', amount: 8500, budget: 8000, count: 12, avgAmount: 708.33, trend: '+5.2%', status: 'over_budget' },
          { category: 'Maintenance', amount: 6200, budget: 6000, count: 8, avgAmount: 775.00, trend: '+12.8%', status: 'over_budget' },
          { category: 'Office Supplies', amount: 3200, budget: 3500, count: 15, avgAmount: 213.33, trend: '-2.1%', status: 'under_budget' },
          { category: 'Events', amount: 7800, budget: 7000, count: 6, avgAmount: 1300.00, trend: '+18.5%', status: 'over_budget' },
          { category: 'Technology', amount: 4500, budget: 4000, count: 4, avgAmount: 1125.00, trend: '+8.7%', status: 'over_budget' },
          { category: 'Miscellaneous', amount: 2250, budget: 2000, count: 12, avgAmount: 187.50, trend: '+1.3%', status: 'over_budget' }
        ],
        monthlyTrends: [
          { month: 'Jan', utilities: 720, maintenance: 580, office: 280, events: 650, tech: 380, total: 2610 },
          { month: 'Feb', utilities: 750, maintenance: 620, office: 290, events: 720, tech: 400, total: 2780 },
          { month: 'Mar', utilities: 780, maintenance: 680, office: 300, events: 800, tech: 420, total: 2980 },
          { month: 'Apr', utilities: 800, maintenance: 720, office: 310, events: 850, tech: 450, total: 3130 },
          { month: 'May', utilities: 820, maintenance: 750, office: 320, events: 900, tech: 480, total: 3270 },
          { month: 'Jun', utilities: 850, maintenance: 800, office: 330, events: 950, tech: 500, total: 3430 }
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

  const getBudgetStatus = (amount: number, budget: number) => {
    const percentage = (amount / budget) * 100;
    if (percentage <= 90) return { text: 'Under Budget', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (percentage <= 110) return { text: 'On Budget', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    return { text: 'Over Budget', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
  };

  if (!reportData) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Expenses Report"
          description="Comprehensive expense tracking and analysis"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-red-500 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400">Loading report data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Expenses Report"
        description="Comprehensive expense tracking and analysis"
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
            { title: 'Total Expenses', value: formatCurrency(reportData.totalExpenses), change: '+8.2%', color: 'from-red-500 to-pink-600', icon: 'fas fa-chart-bar' },
            { title: 'Total Budget', value: formatCurrency(reportData.totalBudget), change: '+5.0%', color: 'from-blue-500 to-cyan-600', icon: 'fas fa-calculator' },
            { title: 'Variance', value: formatCurrency(reportData.variance), change: '+15.2%', color: 'from-yellow-500 to-orange-600', icon: 'fas fa-exclamation-triangle' },
            { title: 'Avg per Month', value: formatCurrency(reportData.averagePerMonth), change: '+2.1%', color: 'from-purple-500 to-indigo-600', icon: 'fas fa-calendar-alt' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.title === 'Variance' ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white text-xl`}>
                  <i className={stat.icon}></i>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${stat.title === 'Variance' ? 'text-red-600' : 'text-green-600'}`}>
                  {stat.change}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
              </div>
            </div>
          ))}
        </div>

        {/* Budget vs Actual Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Budget vs Actual Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportData.categoryBreakdown.map((expense: any, index: number) => {
              const status = getBudgetStatus(expense.amount, expense.budget);
              const percentage = (expense.amount / expense.budget) * 100;
              
              return (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">{expense.category}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {formatCurrency(expense.amount)}
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Budget: {formatCurrency(expense.budget)}</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          percentage <= 90 ? 'bg-green-500' : 
                          percentage <= 110 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {expense.count} transactions
                    </span>
                    <span className={`font-medium ${
                      expense.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {expense.trend}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Expense Analysis
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
                Monthly Expense Trends
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Expense breakdown by category over the selected period
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
              renderCell={(item: any, column: any) => {
                switch (column.key) {
                  case 'amount':
                    return <span className="font-semibold text-red-600">{formatCurrency(item.amount)}</span>;
                  case 'budget':
                    return <span className="text-gray-600 dark:text-gray-400">{formatCurrency(item.budget)}</span>;
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
                    const status = getBudgetStatus(item.amount, item.budget);
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
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

        {/* Spending Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Spending Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <i className="fas fa-lightbulb mr-2"></i>
                Top Spending Category
              </h4>
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Utilities</strong> accounts for 26.2% of total expenses, 
                which is 6.3% above budget. Consider energy efficiency improvements.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center">
                <i className="fas fa-check-circle mr-2"></i>
                Well Managed
              </h4>
              <p className="text-green-800 dark:text-green-200">
                <strong>Office Supplies</strong> is 8.6% under budget with 
                efficient procurement practices. Great job!
              </p>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
} 