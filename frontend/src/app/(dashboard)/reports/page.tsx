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
  const [financialInsights, setFinancialInsights] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load dashboard summary
      const summary = await ReportsService.getDashboardSummary();
      setDashboardData(summary);

      // Load financial insights
      const insights = await ReportsService.getFinancialInsights();
      setFinancialInsights(insights);

      // Load recent activity from API
      const activity = await ReportsService.getRecentActivity();
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      setDashboardData(null);
      setFinancialInsights(null);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  const overviewStats = [
    {
      title: 'Total Income',
      value: dashboardData ? `$${dashboardData.totalIncome.toLocaleString()}` : '$0',
      description: 'Total income for current period',
      icon: 'fas fa-arrow-up',
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Total Expenses',
      value: dashboardData ? `$${dashboardData.totalExpenses.toLocaleString()}` : '$0',
      description: 'Total expenses for current period',
      icon: 'fas fa-arrow-down',
      iconColor: 'text-red-600',
      iconBgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    {
      title: 'Net Profit',
      value: dashboardData ? `$${dashboardData.netProfit.toLocaleString()}` : '$0',
      description: 'Net profit for current period',
      icon: 'fas fa-chart-line',
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Pending Payments',
      value: dashboardData ? `$${dashboardData.pendingPayments.toLocaleString()}` : '$0',
      description: 'Pending payments to be received',
      icon: 'fas fa-clock',
      iconColor: 'text-yellow-600',
      iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
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

  if (error) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Financial Reports Dashboard"
          description="Comprehensive financial analysis and reporting tools"
          actions={
            <Button
              onClick={loadDashboardData}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Retry
            </Button>
          }
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={loadDashboardData} variant="primary">
              <i className="fas fa-sync-alt mr-2"></i>
              Try Again
            </Button>
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
        actions={
          <Button
            onClick={loadDashboardData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Refreshing...
              </>
            ) : (
              <>
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh Data
              </>
            )}
          </Button>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBgColor={stat.iconBgColor}
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

      {/* Financial Insights */}
      {financialInsights && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Financial Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center">
                <i className="fas fa-lightbulb mr-2"></i>
                Growth Opportunities
              </h4>
              <ul className="text-green-800 dark:text-green-200 space-y-2">
                {financialInsights.growthOpportunities?.map((opportunity: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Risk Factors
              </h4>
              <ul className="text-blue-800 dark:text-blue-200 space-y-2">
                {financialInsights.riskFactors?.map((risk: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${
                    activity.type === 'Income' ? 'from-green-500 to-emerald-600' : 'from-red-500 to-pink-600'
                  } flex items-center justify-center text-white mr-4`}>
                    <i className={`fas ${activity.type === 'Income' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
                <div className={`font-semibold ${activity.color}`}>
                  {activity.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State for Recent Activity */}
      {recentActivity.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h3>
          <div className="text-center py-8">
            <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400">No recent activity found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Recent transactions will appear here</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 