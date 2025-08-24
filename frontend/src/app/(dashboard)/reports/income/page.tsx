'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageHeader, Button, TextInput, SelectInput, ViewToggle, DataTable, DataGrid } from '@/components/ui';

export default function IncomeReportsPage() {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const viewOptions = [
    { value: 'chart', label: 'Chart', icon: 'fas fa-chart-area' },
    { value: 'table', label: 'Table', icon: 'fas fa-table' }
  ];

  const mockIncomeData = [
    { id: 1, category: 'Tithes', amount: 18500, count: 156, avgAmount: 118.59, trend: '+12.5%' },
    { id: 2, category: 'Offerings', amount: 12400, count: 89, avgAmount: 139.33, trend: '+8.2%' },
    { id: 3, category: 'Partnerships', amount: 9800, count: 23, avgAmount: 426.09, trend: '+15.7%' },
    { id: 4, category: 'Pledges', amount: 3200, count: 12, avgAmount: 266.67, trend: '+5.3%' },
    { id: 5, category: 'Donations', amount: 1380, count: 8, avgAmount: 172.50, trend: '+2.1%' }
  ];

  const mockMonthlyData = [
    { month: 'Jan', tithes: 1520, offerings: 980, partnerships: 800, total: 3300 },
    { month: 'Feb', tithes: 1680, offerings: 1100, partnerships: 850, total: 3630 },
    { month: 'Mar', tithes: 1750, offerings: 1200, partnerships: 900, total: 3850 },
    { month: 'Apr', tithes: 1820, offerings: 1250, partnerships: 950, total: 4020 },
    { month: 'May', tithes: 1900, offerings: 1300, partnerships: 1000, total: 4200 },
    { month: 'Jun', tithes: 1950, offerings: 1350, partnerships: 1050, total: 4350 }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'tithes', label: 'Tithes' },
    { value: 'offerings', label: 'Offerings' },
    { value: 'partnerships', label: 'Partnerships' },
    { value: 'pledges', label: 'Pledges' },
    { value: 'donations', label: 'Donations' }
  ];

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      alert('Income report exported successfully!');
    }, 2000);
  };

  const chartColumns = [
    { key: 'month', label: 'Month' },
    { key: 'tithes', label: 'Tithes' },
    { key: 'offerings', label: 'Offerings' },
    { key: 'partnerships', label: 'Partnerships' },
    { key: 'total', label: 'Total' }
  ];

  const tableColumns = [
    { key: 'category', label: 'Category' },
    { key: 'amount', label: 'Total Amount' },
    { key: 'count', label: 'Transactions' },
    { key: 'avgAmount', label: 'Average Amount' },
    { key: 'trend', label: 'Trend' }
  ];

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <DashboardLayout>
      <PageHeader
        title="Income Reports"
        description="Comprehensive income analysis and reporting"
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
            { title: 'Total Income', value: '$45,280', change: '+12.5%', color: 'from-green-500 to-emerald-600' },
            { title: 'Total Transactions', value: '288', change: '+8.2%', color: 'from-blue-500 to-cyan-600' },
            { title: 'Average Amount', value: '$157.22', change: '+4.1%', color: 'from-purple-500 to-indigo-600' },
            { title: 'Growth Rate', value: '12.5%', change: '+2.3%', color: 'from-yellow-500 to-orange-600' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white text-xl`}>
                  <i className="fas fa-chart-line"></i>
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
            onChange={setViewMode}
            options={viewOptions}
            count={mockIncomeData.length}
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
            
            {/* Mock Chart - In real app, use Chart.js or similar */}
            <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-chart-area text-6xl text-blue-500 mb-4"></i>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Interactive Chart
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Monthly income trends would be displayed here
                </p>
                <div className="mt-4 grid grid-cols-6 gap-2">
                  {mockMonthlyData.map((data, index) => (
                    <div key={index} className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{data.month}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">${data.total}</div>
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
              data={mockIncomeData}
              columns={tableColumns}
              renderCell={(item, column) => {
                switch (column.key) {
                  case 'amount':
                    return <span className="font-semibold text-green-600">{formatCurrency(item.amount)}</span>;
                  case 'avgAmount':
                    return <span className="text-gray-600 dark:text-gray-400">{formatCurrency(item.avgAmount)}</span>;
                  case 'trend':
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.trend.startsWith('+') 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {item.trend}
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
            {mockIncomeData.map((category, index) => (
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
          </div>
      </div>
    </DashboardLayout>
  );
} 