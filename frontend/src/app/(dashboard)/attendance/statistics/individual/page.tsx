"use client";
import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, Button, SelectInput, Card, DateRangePicker } from "@/components/ui";
import ReactECharts from "echarts-for-react";
import { AttendanceService } from '@/services/attendance';

type ChartType = "line" | "bar" | "pie";
type Granularity = 'none' | 'monthly' | 'yearly';

interface IndividualAttendanceData {
  xLabel: string;
  present: number;
  absent: number;
  first_timers: number;
  total: number;
  event_id?: number;
  event?: any;
}

interface EventCategory {
  id: number;
  name: string;
}

interface Event {
  id: number;
  title: string;
  category_id: number;
}

export default function IndividualAttendanceStatisticsPage() {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [granularity, setGranularity] = useState<Granularity>('none');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<IndividualAttendanceData[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>({});

  // TODO: Replace with real API for categories/events if needed
  const eventCategories: EventCategory[] = [];
  const events: Event[] = [];

  // Set default date range (one year ago to now)
  const setDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    setEndDate(end);
    setStartDate(start);
  };

  // Fetch attendance statistics from backend
  const loadAttendanceData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
        granularity,
      };
      if (selectedCategory !== 'all') params.categoryId = selectedCategory;
      if (selectedEvent !== 'all') params.eventId = selectedEvent;
      const response = await AttendanceService.getIndividualAttendanceStatistics(params);
      if (response.success) {
        setAttendanceData(response.data.individual_attendance || []);
        setSummaryStats(response.data.summary_stats || {});
      } else {
        setAttendanceData([]);
        setSummaryStats({});
      }
    } catch (error) {
      setAttendanceData([]);
      setSummaryStats({});
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, granularity, selectedCategory, selectedEvent]);

  useEffect(() => {
    setDefaultDateRange();
  }, []);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  // Chart data mapping
  const xAxisData = attendanceData.map(item => item.xLabel);
  const presentData = attendanceData.map(item => item.present);
  const absentData = attendanceData.map(item => item.absent);

  const getChartOption = () => {
    if (attendanceData.length === 0) {
      return {
        title: {
          text: 'No data available',
          left: 'center',
          top: 'center',
          textStyle: {
            color: '#999',
            fontSize: 16
          }
        }
      };
    }
    if (chartType === 'line') {
      return {
        title: {
          text: 'Individual Attendance Trends',
          left: 'center'
        },
        tooltip: { trigger: 'axis' },
        legend: { data: ['Present', 'Absent'], top: 30 },
        xAxis: { type: 'category', data: xAxisData, axisLabel: { interval: 0 } },
        yAxis: { type: 'value', name: 'Count' },
        series: [
          {
            name: 'Present',
            data: presentData,
            type: 'line',
            smooth: true,
            itemStyle: { color: '#10b981' },
            areaStyle: { color: 'rgba(16, 185, 129, 0.18)' },
            z: 1
          },
          {
            name: 'Absent',
            data: absentData,
            type: 'line',
            smooth: true,
            itemStyle: { color: '#ef4444' },
            areaStyle: { color: 'rgba(239, 68, 68, 0.12)' },
            z: 2
          }
        ]
      };
    }
    if (chartType === 'bar') {
      return {
        title: {
          text: 'Individual Attendance Comparison',
          left: 'center'
        },
        tooltip: { trigger: 'axis' },
        legend: { data: ['Present', 'Absent'], top: 30 },
        xAxis: { type: 'category', data: xAxisData, axisLabel: { interval: 0 } },
        yAxis: { type: 'value', name: 'Count' },
        series: [
          {
            name: 'Present',
            data: presentData,
            type: 'bar',
            itemStyle: { color: '#10b981' },
            barWidth: '40%'
          },
          {
            name: 'Absent',
            data: absentData,
            type: 'bar',
            itemStyle: { color: '#ef4444' },
            barWidth: '40%'
          }
        ]
      };
    }
    if (chartType === 'pie') {
      const totalPresent = presentData.reduce((sum, val) => sum + val, 0);
      const totalAbsent = absentData.reduce((sum, val) => sum + val, 0);
      return {
        title: { text: 'Overall Attendance Distribution', left: 'center' },
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
        legend: { data: ['Present', 'Absent'], top: 30 },
        series: [
          {
            name: 'Attendance',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            data: [
              { value: totalPresent, name: 'Present', itemStyle: { color: '#10b981' } },
              { value: totalAbsent, name: 'Absent', itemStyle: { color: '#ef4444' } }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
    }
    return {};
  };

  // Summary stats
  const totalPresent = summaryStats.total_present || 0;
  const totalAbsent = summaryStats.total_absent || 0;
  const totalFirstTimers = summaryStats.total_first_timers || 0;
  const totalRecords = summaryStats.total_records || 0;
  const averageAttendance = totalRecords > 0 ? Math.round(totalPresent / totalRecords) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Individual Attendance Statistics"
          description="View detailed statistics and analytics for individual member attendance"
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Present
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {totalPresent}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Absent
              </h3>
              <p className="text-2xl font-bold text-red-600">
                {totalAbsent}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total First Timers
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {totalFirstTimers}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Average Attendance
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {averageAttendance}
              </p>
            </div>
          </Card>
        </div>

        {/* Chart Controls */}
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Chart Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chart Type
                </label>
                <div className="flex gap-2">
                  {(['line', 'bar', 'pie'] as ChartType[]).map((type) => (
                    <Button
                      key={type}
                      variant={chartType === type ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setChartType(type)}
                    >
                      {type === 'line' ? 'Area' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Granularity Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Granularity
                </label>
                <div className="flex gap-2">
                  {(['none', 'monthly', 'yearly'] as Granularity[]).map((gran) => (
                    <Button
                      key={gran}
                      variant={granularity === gran ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setGranularity(gran)}
                    >
                      {gran === 'none' ? 'None' : gran.charAt(0).toUpperCase() + gran.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date Range
                </label>
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onDateRangeChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                />
              </div>

              {/* (Optional) Event Category and Event Filters - can be enhanced later */}
            </div>
          </div>
        </Card>

        {/* Chart */}
        <Card>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : (
              <ReactECharts
                option={getChartOption()}
                style={{ height: '400px' }}
                opts={{ renderer: 'canvas' }}
              />
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
} 