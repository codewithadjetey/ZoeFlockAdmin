'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui';
import BarcodeScanner from '@/components/shared/BarcodeScanner';
import { useToast } from '@/hooks/useToast';

interface AttendanceRecord {
  member: {
    id: number;
    name: string;
    email: string;
  };
  event: {
    id: number;
    name: string;
    date: string;
  };
  attendance: any;
  action: 'created' | 'updated';
  timestamp: Date;
}

const AttendanceScannerPage: React.FC = () => {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState('scanner');
  const { showToast } = useToast();

  const handleAttendanceMarked = (data: any) => {
    const newRecord: AttendanceRecord = {
      ...data,
      timestamp: new Date()
    };
    
    setAttendanceHistory(prev => [newRecord, ...prev.slice(0, 9)]); // Keep last 10 records
    
    showToast(`Attendance recorded for ${data.member.name}`, 'success');
  };

  const clearHistory = () => {
    setAttendanceHistory([]);
    showToast('Attendance history cleared', 'info');
  };

  const tabs = [
    { id: 'scanner', label: 'Barcode Scanner', icon: 'fas fa-qrcode' },
    { id: 'history', label: 'Recent Scans', icon: 'fas fa-history' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Attendance Scanner"
          description="Scan member barcodes to mark attendance for events"
        />

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'scanner' && (
              <BarcodeScanner onAttendanceMarked={handleAttendanceMarked} />
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Recent Attendance Scans</h3>
                  {attendanceHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {attendanceHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i className="fas fa-history text-4xl mb-4"></i>
                    <p>No attendance scans yet.</p>
                    <p className="text-sm">Start scanning to see recent activity here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attendanceHistory.map((record, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-3 h-3 rounded-full ${
                                record.action === 'created' ? 'bg-green-500' : 'bg-blue-500'
                              }`}></div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {record.member.name}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                record.action === 'created' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {record.action === 'created' ? 'New' : 'Updated'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <div>
                                <span className="font-medium">Event:</span> {record.event.name}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {new Date(record.event.date).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Email:</span> {record.member.email}
                              </div>
                              <div>
                                <span className="font-medium">Time:</span> {record.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                            {record.timestamp.toLocaleDateString()}
                            <br />
                            {record.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceScannerPage; 