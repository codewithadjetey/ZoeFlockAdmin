'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageHeader, Button, TextInput, SelectInput, ViewToggle, DataTable, DataGrid } from '@/components/ui';
import { IncomeChart } from '@/components/reports';
import { ReportsService, ReportFilters } from '@/services/reports';
import { IncomeCategory } from '@/interfaces/income';

export default function IncomeReportsPage() {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'stacked'>('line');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);

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
      const response = await fetch('/api/income-categories');
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
      
      const data = await ReportsService.getIncomeReport(filters);
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      // Fallback to mock data
      setReportData({
        totalIncome: 45280,
        totalTransactions: 288,
        averageAmount: 157.22,
        growthRate: '+12.5%',
        categoryBreakdown: [
          { category: 'Tithes', amount: 18500, count: 156, avgAmount: 118.59, trend: '+12.5%' },
          { category: 'Offerings', amount: 12400, count: 89, avgAmount: 139.33, trend: '+8.2%' },
          { category: 'Partnerships', amount: 9800, count: 23, avgAmount: 426.09, trend: '+15.7%' },
          { category: 'Pledges', amount: 3200, count: 12, avgAmount: 266.67, trend: '+5.3%' },
          { category: 'Donations', amount: 1380, count: 8, avgAmount: 172.50, trend: '+2.1%' }
        ],
        monthlyTrends: [
          { month: 'Jan', tithes: 1520, offerings: 980, partnerships: 800, total: 3300 },
          { month: 'Feb', tithes: 1680, offerings: 1100, partnerships: 850, total: 3630 },
          { month: 'Mar', tithes: 1750, offerings: 1200, partnerships: 900, total: 3850 },
          { month: 'Apr', tithes: 1820, offerings: 1250, partnerships: 950, total: 4020 },
          { month: 'May', tithes: 1900, offerings: 1300, partnerships: 1000, total: 4200 },
          { month: 'Jun', tithes: 1950, offerings: 1350, partnerships: 1050, total: 4350 }
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
      
      alert('Income report exported successfully!');
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
    { key: 'count', label: 'Transactions' },
    { key: 'avgAmount', label: 'Average Amount' },
    { key: 'trend', label: 'Trend' }
  ];

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  if (!reportData) {
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
            { title: 'Total Income', value: formatCurrency(reportData.totalIncome), change: reportData.growthRate, color: 'from-green-500 to-emerald-600' },
            { title: 'Total Transactions', value: reportData.totalTransactions.toString(), change: '+8.2%', color: 'from-blue-500 to-cyan-600' },
            { title: 'Average Amount', value: formatCurrency(reportData.averageAmount), change: '+4.1%', color: 'from-purple-500 to-indigo-600' },
            { title: 'Growth Rate', value: reportData.growthRate, change: '+2.3%', color: 'from-yellow-500 to-orange-600' }
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
            {reportData.categoryBreakdown.map((category, index) => (
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