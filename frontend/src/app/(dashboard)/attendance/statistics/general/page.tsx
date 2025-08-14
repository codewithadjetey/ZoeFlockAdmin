"use client";
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";

export default function GeneralAttendanceStatisticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="General Attendance Statistics"
          description="View detailed statistics and analytics for general attendance across events"
        />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-12">
            <i className="fas fa-chart-bar text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              General Attendance Statistics
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This page will display detailed statistics and analytics for general attendance across all events.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 