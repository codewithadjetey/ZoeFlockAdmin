'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageHeader, StatCard, Button } from '@/components/ui';
import { ReportsService } from '@/services/reports';

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load dashboard summary
      const summary = await ReportsService.getDashboardSummary();
      setDashboardData(summary);

      // Load recent activity (mock data for now)
      setRecentActivity([
        { type: 'Income', amount: '+$2,500', description: 'Tithes received', time: '2 hours ago', color: 'text-green-600' },
        { type: 'Expense', amount: '-$850', description: 'Utility payment', time: '4 hours ago', color: 'text-red-600' },
        { type: 'Income', amount: '+$1,200', description: 'Partnership contribution', time: '1 day ago', color: 'text-green-600' },
        { type: 'Expense', amount: '-$320', description: 'Office supplies', time: '2 days ago', color: 'text-red-600' },
        { type: 'Income', amount: '+$800', description: 'Offering collection', time: '3 days ago', color: 'text-green-600' }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data
      setDashboardData({
        totalIncome: 45280,
        totalExpenses: 32450,
        netProfit: 12830,
        pendingPayments: 5200,
        monthlyTrends: [
          { month: 'Jan', income: 3300, expenses: 2610, profit: 690 },
          { month: 'Feb', income: 3630, expenses: 2780, profit: 850 },
          { month: 'Mar', income: 3850, expenses: 2980, profit: 870 },
          { month: 'Apr', income: 4020, expenses: 3130, profit: 890 },
          { month: 'May', income: 4200, expenses: 3270, profit: 930 },
          { month: 'Jun', income: 4350, expenses: 3430, profit: 920 }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const overviewStats = [
    {
      title: 'Total Income',
      value: dashboardData ? `$${dashboardData.totalIncome.toLocaleString()}` : '$45,280',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'fas fa-arrow-up',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Total Expenses',
      value: dashboardData ? `$${dashboardData.totalExpenses.toLocaleString()}` : '$32,450',
      change: '+8.2%',
      changeType: 'negative',
      icon: 'fas fa-arrow-down',
      color: 'from-red-500 to-pink-600'
    },
    {
      title: 'Net Profit',
      value: dashboardData ? `$${dashboardData.netProfit.toLocaleString()}` : '$12,830',
      change: '+18.7%',
      changeType: 'positive',
      icon: 'fas fa-chart-line',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Pending Payments',
      value: dashboardData ? `$${dashboardData.pendingPayments.toLocaleString()}` : '$5,200',
      change: '-3.1%',
      changeType: 'neutral',
      icon: 'fas fa-clock',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  const quickReports = [
    {
      title: 'Income Reports',
      description: 'Detailed income analysis by category, source, and time period',
      icon: 'fas fa-chart-line',
      href: '/reports/income',
      color: 'from-green-500 to-emerald-600',
      stats: ['Monthly trends', 'Category breakdown', 'Source analysis']
    },
    {
      title: 'Expenses Report',
      description: 'Comprehensive expense tracking and categorization',
      icon: 'fas fa-chart-bar',
      href: '/reports/expenses',
      color: 'from-red-500 to-pink-600',
      stats: ['Spending patterns', 'Budget vs actual', 'Category analysis']
    },
    {
      title: 'Income vs Expenses',
      description: 'Comparative analysis and profitability insights',
      icon: 'fas fa-balance-scale',
      href: '/reports/income-vs-expenses',
      color: 'from-blue-500 to-cyan-600',
      stats: ['Profit margins', 'Trend comparison', 'Forecasting']
    },
    {
      title: 'Export Report',
      description: 'Generate and export financial data in various formats',
      icon: 'fas fa-file-export',
      href: '/reports/export',
      color: 'from-purple-500 to-indigo-600',
      stats: ['Excel export', 'PDF reports', 'Custom formats']
    }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Financial Reports Dashboard"
          description="Comprehensive financial analysis and reporting tools"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400">Loading financial data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Financial Reports Dashboard"
        description="Comprehensive financial analysis and reporting tools"
      />

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              color={stat.color}
              isLoading={false}
            />
          ))}
        </div>

        {/* Quick Reports Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {quickReports.map((report, index) => (
            <Link
              key={index}
              href={report.href}
              className="group block"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-transparent">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${report.color} flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    <i className={report.icon}></i>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Quick Access</div>
                    <i className="fas fa-arrow-right text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300"></i>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {report.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {report.description}
                </p>
                
                <div className="space-y-2">
                  {report.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      {stat}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Financial Activity</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${activity.color.replace('text-', 'bg-')}`}></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{activity.description}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</div>
                  </div>
                </div>
                <div className={`font-semibold ${activity.color}`}>
                  {activity.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends Summary */}
        {dashboardData && dashboardData.monthlyTrends && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Financial Trends</h3>
              <Button variant="outline" size="sm">
                View Detailed Trends
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {dashboardData.monthlyTrends.map((month: any, index: number) => (
                <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{month.month}</div>
                  <div className="space-y-1">
                    <div className="text-sm text-green-600">+${month.income.toLocaleString()}</div>
                    <div className="text-sm text-red-600">-${month.expenses.toLocaleString()}</div>
                    <div className="text-sm font-medium text-blue-600">${month.profit.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </DashboardLayout>
  );
} 