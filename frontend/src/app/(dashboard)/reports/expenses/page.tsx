'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { SelectInput } from '@/components/ui/SelectInput';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { DataTable } from '@/components/ui/DataTable';

export default function ExpensesReportPage() {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const mockExpenseData = [
    { id: 1, category: 'Utilities', amount: 8500, count: 12, avgAmount: 708.33, trend: '+5.2%', budget: 8000 },
    { id: 2, category: 'Maintenance', amount: 6200, count: 8, avgAmount: 775.00, trend: '+12.8%', budget: 6000 },
    { id: 3, category: 'Office Supplies', amount: 3200, count: 15, avgAmount: 213.33, trend: '-2.1%', budget: 3500 },
    { id: 4, category: 'Events', amount: 7800, count: 6, avgAmount: 1300.00, trend: '+18.5%', budget: 7000 },
    { id: 5, category: 'Technology', amount: 4500, count: 4, avgAmount: 1125.00, trend: '+8.7%', budget: 4000 },
    { id: 6, category: 'Miscellaneous', amount: 2250, count: 12, avgAmount: 187.50, trend: '+1.3%', budget: 2000 }
  ];

  const mockMonthlyData = [
    { month: 'Jan', utilities: 720, maintenance: 580, office: 280, events: 650, tech: 380, total: 2610 },
    { month: 'Feb', utilities: 750, maintenance: 620, office: 290, events: 720, tech: 400, total: 2780 },
    { month: 'Mar', utilities: 780, maintenance: 680, office: 300, events: 800, tech: 420, total: 2980 },
    { month: 'Apr', utilities: 800, maintenance: 720, office: 310, events: 850, tech: 450, total: 3130 },
    { month: 'May', utilities: 820, maintenance: 750, office: 320, events: 900, tech: 480, total: 3270 },
    { month: 'Jun', utilities: 850, maintenance: 800, office: 330, events: 950, tech: 500, total: 3430 }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'office', label: 'Office Supplies' },
    { value: 'events', label: 'Events' },
    { value: 'technology', label: 'Technology' },
    { value: 'miscellaneous', label: 'Miscellaneous' }
  ];

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      alert('Expenses report exported successfully!');
    }, 2000);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="Expenses Report"
        subtitle="Comprehensive expense tracking and analysis"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports', href: '/reports' },
          { label: 'Expenses Report', href: '/reports/expenses' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  Category
                </label>
                <SelectInput
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={categoryOptions}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg">
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
            { title: 'Total Expenses', value: '$32,450', change: '+8.2%', color: 'from-red-500 to-pink-600', icon: 'fas fa-chart-bar' },
            { title: 'Total Budget', value: '$30,500', change: '+5.0%', color: 'from-blue-500 to-cyan-600', icon: 'fas fa-calculator' },
            { title: 'Variance', value: '-$1,950', change: '+15.2%', color: 'from-yellow-500 to-orange-600', icon: 'fas fa-exclamation-triangle' },
            { title: 'Avg per Month', value: '$5,408', change: '+2.1%', color: 'from-purple-500 to-indigo-600', icon: 'fas fa-calendar-alt' }
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
            {mockExpenseData.map((expense, index) => {
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
            viewMode={viewMode}
            onViewChange={setViewMode}
            count={mockExpenseData.length}
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
            
            {/* Mock Chart - In real app, use Chart.js or similar */}
            <div className="h-80 bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-chart-bar text-6xl text-red-500 mb-4"></i>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Interactive Chart
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Monthly expense trends would be displayed here
                </p>
                <div className="mt-4 grid grid-cols-6 gap-2">
                  {mockMonthlyData.map((data, index) => (
                    <div key={index} className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{data.month}</div>
                      <div className="text-xs text-red-600">${data.total}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <DataTable
              data={mockExpenseData}
              columns={tableColumns}
              renderCell={(item, column) => {
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
      </div>
    </div>
  );
} 