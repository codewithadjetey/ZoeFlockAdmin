'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageHeader, Button, TextInput, SelectInput, DataTable } from '@/components/ui';

export default function ExportReportPage() {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [reportType, setReportType] = useState('comprehensive');
  const [format, setFormat] = useState('excel');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [exportHistory, setExportHistory] = useState([
    { id: 1, name: 'Q1 Financial Report', type: 'Quarterly', format: 'Excel', date: '2024-04-01', status: 'completed', size: '2.4 MB' },
    { id: 2, name: 'Annual Income Summary', type: 'Annual', format: 'PDF', date: '2024-01-15', status: 'completed', size: '1.8 MB' },
    { id: 3, name: 'Monthly Expense Report', type: 'Monthly', format: 'Excel', date: '2024-03-31', status: 'completed', size: '856 KB' },
    { id: 4, name: 'Partnership Analysis', type: 'Custom', format: 'Excel', date: '2024-02-28', status: 'completed', size: '1.2 MB' },
    { id: 5, name: 'Budget vs Actual Q2', type: 'Quarterly', format: 'PDF', date: '2024-06-30', status: 'processing', size: '--' }
  ]);

  const reportTypeOptions = [
    { value: 'comprehensive', label: 'Comprehensive Financial Report' },
    { value: 'income', label: 'Income Report Only' },
    { value: 'expenses', label: 'Expenses Report Only' },
    { value: 'comparison', label: 'Income vs Expenses Comparison' },
    { value: 'budget', label: 'Budget vs Actual Analysis' },
    { value: 'custom', label: 'Custom Report' }
  ];

  const formatOptions = [
    { value: 'excel', label: 'Excel (.xlsx)' },
    { value: 'pdf', label: 'PDF Document' },
    { value: 'csv', label: 'CSV File' },
    { value: 'json', label: 'JSON Data' }
  ];

  const handleExport = () => {
    setIsLoading(true);
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      const newExport = {
        id: exportHistory.length + 1,
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        type: reportType === 'comprehensive' ? 'Comprehensive' : reportType.charAt(0).toUpperCase() + reportType.slice(1),
        format: format.toUpperCase(),
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`
      };
      setExportHistory([newExport, ...exportHistory]);
      alert('Report exported successfully!');
    }, 3000);
  };

  const downloadExport = (exportItem: any) => {
    if (exportItem.status === 'completed') {
      // Simulate download
      alert(`Downloading ${exportItem.name}...`);
    }
  };

  const deleteExport = (id: number) => {
    setExportHistory(exportHistory.filter(item => item.id !== id));
  };

  const tableColumns = [
    { key: 'name', label: 'Report Name' },
    { key: 'type', label: 'Type' },
    { key: 'format', label: 'Format' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
    { key: 'size', label: 'Size' },
    { key: 'actions', label: 'Actions' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</span>;
      case 'processing':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Processing</span>;
      case 'failed':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">{status}</span>;
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Export Report"
        description="Generate and export financial data in various formats"
      />

        {/* Export Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Export Configuration
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Settings */}
            <div className="space-y-6">
              <h4 className="font-medium text-gray-900 dark:text-white text-lg">Basic Settings</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Report Type
                </label>
                <SelectInput
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  options={reportTypeOptions}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Format
                </label>
                <SelectInput
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  options={formatOptions}
                  className="w-full"
                />
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-6">
              <h4 className="font-medium text-gray-900 dark:text-white text-lg">Advanced Options</h4>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                    Include Charts and Graphs
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeTables}
                    onChange={(e) => setIncludeTables(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                    Include Detailed Tables
                  </span>
                </label>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <i className="fas fa-info-circle mr-2"></i>
                  Export Preview
                </h5>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <div>• Report Type: {reportTypeOptions.find(opt => opt.value === reportType)?.label}</div>
                  <div>• Date Range: {startDate} to {endDate}</div>
                  <div>• Format: {formatOptions.find(opt => opt.value === format)?.label}</div>
                  <div>• Charts: {includeCharts ? 'Included' : 'Excluded'}</div>
                  <div>• Tables: {includeTables ? 'Included' : 'Excluded'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleExport}
              disabled={isLoading}
              className="px-8"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Generating Report...
                </>
              ) : (
                <>
                  <i className="fas fa-file-export mr-2"></i>
                  Generate & Export Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Export History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Export History
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your previously generated reports and download them anytime
            </p>
          </div>
          
          <DataTable
            data={exportHistory}
            columns={tableColumns}
            renderCell={(item, column) => {
              switch (column.key) {
                case 'status':
                  return getStatusBadge(item.status);
                case 'actions':
                  return (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadExport(item)}
                        disabled={item.status !== 'completed'}
                        className="text-xs"
                      >
                        <i className="fas fa-download mr-1"></i>
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteExport(item.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Delete
                      </Button>
                    </div>
                  );
                default:
                  return item[column.key as keyof typeof item];
              }
            }}
            searchable={true}
            sortable={true}
            pagination={false}
          />
        </div>

        {/* Export Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Export Tips & Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="fas fa-lightbulb text-blue-600 text-sm"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Excel Format</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Best for data analysis, calculations, and further processing. Includes multiple sheets for different data types.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="fas fa-file-pdf text-green-600 text-sm"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">PDF Format</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ideal for sharing, printing, and archiving. Maintains formatting and includes charts and tables.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="fas fa-clock text-purple-600 text-sm"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Processing Time</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Larger reports may take 2-5 minutes to generate. You'll receive a notification when ready.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="fas fa-save text-yellow-600 text-sm"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Storage</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Exported reports are stored for 30 days. Download and save important reports to your local storage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
} 