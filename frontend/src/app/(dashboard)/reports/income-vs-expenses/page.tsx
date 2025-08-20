'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { SelectInput } from '@/components/ui/SelectInput';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { DataTable } from '@/components/ui/DataTable';

export default function IncomeVsExpensesPage() {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [period, setPeriod] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const mockComparisonData = [
    { month: 'Jan', income: 3300, expenses: 2610, profit: 690, profitMargin: 20.9 },
    { month: 'Feb', income: 3630, expenses: 2780, profit: 850, profitMargin: 23.4 },
    { month: 'Mar', income: 3850, expenses: 2980, profit: 870, profitMargin: 22.6 },
    { month: 'Apr', income: 4020, expenses: 3130, profit: 890, profitMargin: 22.1 },
    { month: 'May', income: 4200, expenses: 3270, profit: 930, profitMargin: 22.1 },
    { month: 'Jun', income: 4350, expenses: 3430, profit: 920, profitMargin: 21.1 }
  ];

  const mockCategoryComparison = [
    { category: 'Tithes', income: 18500, expenses: 0, net: 18500, percentage: 40.8 },
    { category: 'Offerings', income: 12400, expenses: 0, net: 12400, percentage: 27.4 },
    { category: 'Partnerships', income: 9800, expenses: 0, net: 9800, percentage: 21.6 },
    { category: 'Utilities', income: 0, expenses: 8500, net: -8500, percentage: 18.8 },
    { category: 'Maintenance', income: 0, expenses: 6200, net: -6200, percentage: 13.7 },
    { category: 'Events', income: 0, expenses: 7800, net: -7800, percentage: 17.2 }
  ];

  const periodOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      alert('Income vs Expenses report exported successfully!');
    }, 2000);
  };

  const tableColumns = [
    { key: 'month', label: 'Period' },
    { key: 'income', label: 'Income' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'profit', label: 'Net Profit' },
    { key: 'profitMargin', label: 'Profit Margin' }
  ];

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const totalIncome = mockComparisonData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = mockComparisonData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;
  const overallProfitMargin = (totalProfit / totalIncome) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title="Income vs Expenses Report"
        subtitle="Comparative analysis and profitability insights"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports', href: '/reports' },
          { label: 'Income vs Expenses Report', href: '/reports/income-vs-expenses' }
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
                  Period
                </label>
                <SelectInput
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  options={periodOptions}
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

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Income', value: formatCurrency(totalIncome), change: '+12.5%', color: 'from-green-500 to-emerald-600', icon: 'fas fa-arrow-up' },
            { title: 'Total Expenses', value: formatCurrency(totalExpenses), change: '+8.2%', color: 'from-red-500 to-pink-600', icon: 'fas fa-arrow-down' },
            { title: 'Net Profit', value: formatCurrency(totalProfit), change: '+18.7%', color: 'from-blue-500 to-cyan-600', icon: 'fas fa-chart-line' },
            { title: 'Profit Margin', value: formatPercentage(overallProfitMargin), change: '+5.2%', color: 'from-purple-500 to-indigo-600', icon: 'fas fa-percentage' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className={`text-2xl font-bold ${
                    stat.title === 'Total Expenses' ? 'text-red-600' : 
                    stat.title === 'Net Profit' ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                  }`}>
                    {stat.value}
                  </p>
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

        {/* Profitability Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Profitability Trend
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockComparisonData.map((data, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="text-center mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white text-lg">{data.month}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Income:</span>
                    <span className="font-medium text-green-600">{formatCurrency(data.income)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Expenses:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.expenses)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-900 dark:text-white">Profit:</span>
                      <span className="text-blue-600">{formatCurrency(data.profit)}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      Margin: {formatPercentage(data.profitMargin)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Comparative Analysis
          </h2>
          <ViewToggle
            viewMode={viewMode}
            onViewChange={setViewMode}
            count={mockComparisonData.length}
          />
        </div>

        {/* Chart View */}
        {viewMode === 'chart' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Income vs Expenses Comparison
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visual comparison of income and expenses over the selected period
              </p>
            </div>
            
            {/* Mock Chart - In real app, use Chart.js or similar */}
            <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-balance-scale text-6xl text-blue-500 mb-4"></i>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Interactive Comparison Chart
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Income vs Expenses comparison would be displayed here
                </p>
                <div className="mt-4 grid grid-cols-6 gap-2">
                  {mockComparisonData.map((data, index) => (
                    <div key={index} className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{data.month}</div>
                      <div className="text-xs text-green-600">+${data.income}</div>
                      <div className="text-xs text-red-600">-${data.expenses}</div>
                      <div className="text-xs text-blue-600 font-medium">${data.profit}</div>
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
              data={mockComparisonData}
              columns={tableColumns}
              renderCell={(item, column) => {
                switch (column.key) {
                  case 'income':
                    return <span className="font-semibold text-green-600">{formatCurrency(item.income)}</span>;
                  case 'expenses':
                    return <span className="font-semibold text-red-600">{formatCurrency(item.expenses)}</span>;
                  case 'profit':
                    return <span className="font-semibold text-blue-600">{formatCurrency(item.profit)}</span>;
                  case 'profitMargin':
                    return <span className="text-gray-600 dark:text-gray-400">{formatPercentage(item.profitMargin)}</span>;
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
            {mockCategoryComparison.map((category, index) => (
              <div key={index} className={`p-4 rounded-xl border ${
                category.net > 0 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">{category.category}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.net > 0 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {category.net > 0 ? 'Income' : 'Expense'}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${
                  category.net > 0 ? 'text-green-600' : 'text-red-600'
                } mb-2`}>
                  {category.net > 0 ? '+' : ''}{formatCurrency(Math.abs(category.net))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {category.net > 0 ? 'Income' : 'Expense'}: {formatCurrency(Math.abs(category.net > 0 ? category.income : category.expenses))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatPercentage(category.percentage)} of total
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Financial Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <i className="fas fa-chart-line mr-2"></i>
                Profitability Trend
              </h4>
              <p className="text-blue-800 dark:text-blue-200">
                Your organization maintains a strong <strong>{formatPercentage(overallProfitMargin)} profit margin</strong>, 
                with consistent profitability across all months. The highest margin was achieved in February at 23.4%.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center">
                <i className="fas fa-lightbulb mr-2"></i>
                Growth Opportunity
              </h4>
              <p className="text-green-800 dark:text-green-200">
                <strong>Tithes and Offerings</strong> contribute 68.2% of total income. 
                Consider expanding partnership programs to diversify income sources and reduce dependency on traditional giving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 