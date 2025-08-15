'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { SelectInput } from '@/components/ui';
import { DateRangePicker } from '@/components/ui';
import ReactECharts from 'echarts-for-react';
import { AttendanceService } from '@/services/attendance';
import DashboardLayout from '@/components/layout/DashboardLayout';

type ChartType = 'line' | 'bar' | 'pie';
type DataType = 'members' | 'firstTimers';
type Granularity = 'weekly' | 'monthly' | 'yearly';

interface GeneralAttendanceData {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  familyId: number;
  familyName: string;
  totalAttendance: number;
  firstTimersCount: number;
  notes: string;
}

interface Family {
  id: number;
  name: string;
}

export default function GeneralAttendanceStatisticsPage() {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [dataType, setDataType] = useState<DataType>('members');
  const [granularity, setGranularity] = useState<Granularity>('weekly');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<GeneralAttendanceData[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);

  // Set default date range (one year ago to now)
  const setDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    
    console.log('Setting default date range (general):', {
      start: start.toISOString(),
      end: end.toISOString(),
      startDate: start.toDateString(),
      endDate: end.toDateString()
    });
    
    setEndDate(end);
    setStartDate(start);
  };

  // Load families for filter dropdown
  const loadFamilies = useCallback(async () => {
    try {
      const response = await AttendanceService.getFamilies();
      if (response.success) {
        setFamilies(response.data);
      }
    } catch (error) {
      console.error('Failed to load families:', error);
    }
  }, []);

  // Load attendance data
  const loadAttendanceData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AttendanceService.getGeneralAttendanceStatistics({
        startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
        granularity,
        familyId: familyFilter !== 'all' ? parseInt(familyFilter) : undefined,
        dataType
      });

      if (response.success) {
        // Transform the API data to match our interface
        const transformedData = response.data.general_attendance.map((item: any) => ({
          eventId: item.event?.id || item.id,
          eventTitle: item.event?.title || 'Unknown Event',
          eventDate: item.event?.start_date || item.period || 'Unknown Date',
          familyId: item.family?.id || 0,
          familyName: item.family?.name || 'Unknown Family',
          totalAttendance: item.total_attendance || 0,
          firstTimersCount: item.first_timers_count || 0,
          notes: item.notes || ''
        }));

        setAttendanceData(transformedData);
        console.log('Loaded attendance data:', transformedData);
      }
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, granularity, familyFilter, dataType]);

  // Load data when component mounts
  useEffect(() => {
    setDefaultDateRange();
    loadFamilies();
  }, [loadFamilies]);

  // Reload data when filters change
  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  const getFilteredData = () => {
    // Since filtering is now handled by the backend API,
    // we just return the data as-is
    return attendanceData;
  };

  const processDataByGranularity = (data: GeneralAttendanceData[]) => {
    if (granularity === 'weekly') {
      return data;
    }

    if (granularity === 'monthly') {
      const monthlyData = data.reduce((acc, item) => {
        const month = new Date(item.eventDate).toISOString().slice(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = {
            period: month,
            totalAttendance: 0,
            firstTimersCount: 0,
            eventCount: 0
          };
        }
        acc[month].totalAttendance += item.totalAttendance;
        acc[month].firstTimersCount += item.firstTimersCount;
        acc[month].eventCount += 1;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(monthlyData).map(item => ({
        ...item,
        totalAttendance: Math.round(item.totalAttendance / item.eventCount),
        firstTimersCount: Math.round(item.firstTimersCount / item.eventCount)
      }));
    }

    if (granularity === 'yearly') {
      const yearlyData = data.reduce((acc, item) => {
        const year = new Date(item.eventDate).getFullYear().toString();
        if (!acc[year]) {
          acc[year] = {
            period: year,
            totalAttendance: 0,
            firstTimersCount: 0,
            eventCount: 0
          };
        }
        acc[year].totalAttendance += item.totalAttendance;
        acc[year].firstTimersCount += item.firstTimersCount;
        acc[year].eventCount += 1;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(yearlyData).map(item => ({
        ...item,
        totalAttendance: Math.round(item.totalAttendance / item.eventCount),
        firstTimersCount: Math.round(item.firstTimersCount / item.eventCount)
      }));
    }

    return data;
  };

  const getChartOption = () => {
    const filteredData = getFilteredData();
    const processedData = processDataByGranularity(filteredData);

    if (processedData.length === 0) {
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

    const xAxisData = processedData.map(item => item.period || item.eventTitle);
    const yAxisData = processedData.map(item => 
      dataType === 'members' ? item.totalAttendance : item.firstTimersCount
    );

    if (chartType === 'line') {
      return {
        title: {
          text: `${dataType === 'members' ? 'Members' : 'First Timers'} Attendance Over Time`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          name: dataType === 'members' ? 'Members' : 'First Timers'
        },
        series: [{
          data: yAxisData,
          type: 'line',
          smooth: true,
          itemStyle: {
            color: dataType === 'members' ? '#3B82F6' : '#10B981'
          }
        }]
      };
    }

    if (chartType === 'bar') {
      return {
        title: {
          text: `${dataType === 'members' ? 'Members' : 'First Timers'} Attendance by ${granularity === 'weekly' ? 'Event' : granularity === 'monthly' ? 'Month' : 'Year'}`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          name: dataType === 'members' ? 'Members' : 'First Timers'
        },
        series: [{
          data: yAxisData,
          type: 'bar',
          itemStyle: {
            color: dataType === 'members' ? '#3B82F6' : '#10B981'
          }
        }]
      };
    }

    if (chartType === 'pie') {
      const total = yAxisData.reduce((sum, value) => sum + value, 0);
      const pieData = xAxisData.map((label, index) => ({
        name: label,
        value: yAxisData[index]
      }));

      return {
        title: {
          text: `${dataType === 'members' ? 'Members' : 'First Timers'} Distribution`,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [{
          name: dataType === 'members' ? 'Members' : 'First Timers',
          type: 'pie',
          radius: '50%',
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
    }

    return {};
  };

  const getSummaryStats = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return {
        totalMembers: 0,
        totalFirstTimers: 0,
        averageMembers: 0,
        averageFirstTimers: 0
      };
    }

    const totalMembers = filteredData.reduce((sum, item) => sum + item.totalAttendance, 0);
    const totalFirstTimers = filteredData.reduce((sum, item) => sum + item.firstTimersCount, 0);
    const uniqueEvents = new Set(filteredData.map(item => item.eventId)).size;

    return {
      totalMembers,
      totalFirstTimers,
      averageMembers: uniqueEvents > 0 ? Math.round(totalMembers / uniqueEvents) : 0,
      averageFirstTimers: uniqueEvents > 0 ? Math.round(totalFirstTimers / uniqueEvents) : 0
    };
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const summaryStats = getSummaryStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="General Attendance Statistics"
          description="View detailed statistics and analytics for general attendance across events"
        />

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
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Data Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data Type
                </label>
                <div className="flex gap-2">
                  {(['members', 'firstTimers'] as DataType[]).map((type) => (
                    <Button
                      key={type}
                      variant={dataType === type ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setDataType(type)}
                    >
                      {type === 'members' ? 'Members' : 'First Timers'}
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
                  {(['weekly', 'monthly', 'yearly'] as Granularity[]).map((gran) => (
                    <Button
                      key={gran}
                      variant={granularity === gran ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setGranularity(gran)}
                    >
                      {gran.charAt(0).toUpperCase() + gran.slice(1)}
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
                  onDateRangeChange={handleDateRangeChange}
                />
              </div>

              {/* Family Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Family Filter
                </label>
                <SelectInput
                  value={familyFilter}
                  onChange={(value) => setFamilyFilter(value)}
                  options={[
                    { value: 'all', label: 'All Families' },
                    ...families.map(family => ({
                      value: family.id.toString(),
                      label: family.name
                    }))
                  ]}
                  placeholder="Select family"
                  className="w-48"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Members
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.totalMembers}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total First Timers
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.totalFirstTimers}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Average Members/Event
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.averageMembers}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Average First Timers/Event
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryStats.averageFirstTimers}
              </p>
            </div>
          </Card>
        </div>

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