"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, Button, SelectInput, Card, DateRangePicker } from "@/components/ui";
import ReactECharts from "echarts-for-react";

type ChartType = "line" | "bar" | "pie";
type Granularity = "weekly" | "monthly" | "yearly";

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  total: number;
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
  const [chartType, setChartType] = useState<ChartType>("line");
  const [granularity, setGranularity] = useState<Granularity>("weekly");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // Mock data for demonstration - replace with actual API call
  const mockData: AttendanceData[] = [
    { date: "2025-07-15", present: 45, absent: 12, total: 57 },
    { date: "2025-07-22", present: 52, absent: 8, total: 60 },
    { date: "2025-07-29", present: 48, absent: 15, total: 63 },
    { date: "2025-08-05", present: 55, absent: 10, total: 65 },
    { date: "2025-08-12", present: 50, absent: 13, total: 63 },
    { date: "2025-08-19", present: 58, absent: 7, total: 65 },
    { date: "2025-08-26", present: 53, absent: 11, total: 64 },
  ];

  // Mock event categories
  const mockEventCategories: EventCategory[] = [
    { id: 1, name: "Sunday Service" },
    { id: 2, name: "Bible Study" },
    { id: 3, name: "Youth Meeting" },
    { id: 4, name: "Prayer Meeting" },
    { id: 5, name: "Special Events" },
  ];

  // Mock events
  const mockEvents: Event[] = [
    { id: 1, title: "Sunday Service - Week 1", category_id: 1 },
    { id: 2, title: "Sunday Service - Week 2", category_id: 1 },
    { id: 3, title: "Bible Study - Genesis", category_id: 2 },
    { id: 4, title: "Bible Study - Exodus", category_id: 2 },
    { id: 5, title: "Youth Meeting - January", category_id: 3 },
    { id: 6, title: "Prayer Meeting - Evening", category_id: 4 },
    { id: 7, title: "Christmas Celebration", category_id: 5 },
  ];

  // Set default date range (last 30 days)
  const setDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    console.log('Setting default date range:', {
      start: start.toISOString(),
      end: end.toISOString(),
      startDate: start.toDateString(),
      endDate: end.toDateString()
    });
    
    setEndDate(end);
    setStartDate(start);
  };

  useEffect(() => {
    // Set default date range on first load
    if (!startDate || !endDate) {
      setDefaultDateRange();
    }
    
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setAttendanceData(mockData);
      setEventCategories(mockEventCategories);
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, [startDate, endDate, granularity, selectedCategory, selectedEvent]);

  const getFilteredEvents = () => {
    if (selectedCategory === "all") {
      return events;
    }
    return events.filter(event => event.category_id === parseInt(selectedCategory));
  };

  const filterDataByDateRange = (data: AttendanceData[]) => {
    if (!startDate || !endDate) {
      return data;
    }
    
    const filtered = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
    
    console.log('Date filtering:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      originalDataLength: data.length,
      filteredDataLength: filtered.length,
      sampleDates: data.slice(0, 3).map(item => item.date)
    });
    
    return filtered;
  };

  const processDataByGranularity = (data: AttendanceData[]) => {
    if (granularity === "weekly") {
      return data; // Keep weekly data as is
    }
    
    if (granularity === "monthly") {
      // Group by month
      const monthlyData = new Map<string, { present: number; absent: number; total: number; count: number }>();
      
      data.forEach(item => {
        const monthKey = new Date(item.date).toISOString().slice(0, 7); // YYYY-MM format
        const existing = monthlyData.get(monthKey) || { present: 0, absent: 0, total: 0, count: 0 };
        
        monthlyData.set(monthKey, {
          present: existing.present + item.present,
          absent: existing.absent + item.absent,
          total: existing.total + item.total,
          count: existing.count + 1
        });
      });
      
      return Array.from(monthlyData.entries()).map(([month, stats]) => ({
        date: month,
        present: Math.round(stats.present / stats.count),
        absent: Math.round(stats.absent / stats.count),
        total: Math.round(stats.total / stats.count)
      }));
    }
    
    if (granularity === "yearly") {
      // Group by year
      const yearlyData = new Map<string, { present: number; absent: number; total: number; count: number }>();
      
      data.forEach(item => {
        const yearKey = new Date(item.date).getFullYear().toString();
        const existing = yearlyData.get(yearKey) || { present: 0, absent: 0, total: 0, count: 0 };
        
        yearlyData.set(yearKey, {
          present: existing.present + item.present,
          absent: existing.absent + item.absent,
          total: existing.total + item.total,
          count: existing.count + 1
        });
      });
      
      return Array.from(yearlyData.entries()).map(([year, stats]) => ({
        date: year,
        present: Math.round(stats.present / stats.count),
        absent: Math.round(stats.absent / stats.count),
        total: Math.round(stats.total / stats.count)
      }));
    }
    
    return data;
  };

  const getChartOption = () => {
    const dateFilteredData = filterDataByDateRange(attendanceData);
    const processedData = processDataByGranularity(dateFilteredData);
    const dates = processedData.map(item => item.date);
    const presentData = processedData.map(item => item.present);
    const absentData = processedData.map(item => item.absent);

    switch (chartType) {
      case "line":
        return {
          title: {
            text: `Individual Attendance Trends (${granularity.charAt(0).toUpperCase() + granularity.slice(1)})`,
            left: "center",
            textStyle: {
              color: "#374151",
              fontSize: 18,
              fontWeight: "bold"
            }
          },
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#e5e7eb",
            borderWidth: 1,
            textStyle: {
              color: "#374151"
            }
          },
          legend: {
            data: ["Present", "Absent"],
            bottom: 10,
            textStyle: {
              color: "#6b7280"
            }
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "15%",
            top: "15%",
            containLabel: true
          },
          xAxis: {
            type: "category",
            data: dates,
            axisLabel: {
              color: "#6b7280",
              formatter: (value: string) => new Date(value).toLocaleDateString()
            }
          },
          yAxis: {
            type: "value",
            axisLabel: {
              color: "#6b7280"
            }
          },
          series: [
            {
              name: "Present",
              type: "line",
              data: presentData,
              smooth: true,
              lineStyle: { color: "#10b981", width: 3 },
              itemStyle: { color: "#10b981" },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
                    { offset: 1, color: "rgba(16, 185, 129, 0.05)" }
                  ]
                }
              }
            },
            {
              name: "Absent",
              type: "line",
              data: absentData,
              smooth: true,
              lineStyle: { color: "#ef4444", width: 3 },
              itemStyle: { color: "#ef4444" },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(239, 68, 68, 0.3)" },
                    { offset: 1, color: "rgba(239, 68, 68, 0.05)" }
                  ]
                }
              }
            }
          ]
        };

      case "bar":
        return {
          title: {
            text: `Individual Attendance Comparison (${granularity.charAt(0).toUpperCase() + granularity.slice(1)})`,
            left: "center",
            textStyle: {
              color: "#374151",
              fontSize: 18,
              fontWeight: "bold"
            }
          },
          tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#e5e7eb",
            borderWidth: 1,
            textStyle: {
              color: "#374151"
            }
          },
          legend: {
            data: ["Present", "Absent"],
            bottom: 10,
            textStyle: {
              color: "#6b7280"
            }
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "15%",
            top: "15%",
            containLabel: true
          },
          xAxis: {
            type: "category",
            data: dates,
            axisLabel: {
              color: "#6b7280",
              formatter: (value: string) => new Date(value).toLocaleDateString()
            }
          },
          yAxis: {
            type: "value",
            axisLabel: {
              color: "#6b7280"
            }
          },
          series: [
            {
              name: "Present",
              type: "bar",
              data: presentData,
              itemStyle: { color: "#10b981" },
              barWidth: "60%"
            },
            {
              name: "Absent",
              type: "bar",
              data: absentData,
              itemStyle: { color: "#ef4444" },
              barWidth: "60%"
            }
          ]
        };

      case "pie":
        const totalPresent = presentData.reduce((sum, val) => sum + val, 0);
        const totalAbsent = absentData.reduce((sum, val) => sum + val, 0);
        
        return {
          title: {
            text: "Overall Attendance Distribution",
            left: "center",
            textStyle: {
              color: "#374151",
              fontSize: 18,
              fontWeight: "bold"
            }
          },
          tooltip: {
            trigger: "item",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#e5e7eb",
            borderWidth: 1,
            textStyle: {
              color: "#374151"
            },
            formatter: "{a} <br/>{b}: {c} ({d}%)"
          },
          legend: {
            orient: "vertical",
            left: "left",
            textStyle: {
              color: "#6b7280"
            }
          },
          series: [
            {
              name: "Attendance",
              type: "pie",
              radius: ["40%", "70%"],
              center: ["60%", "50%"],
              data: [
                { value: totalPresent, name: "Present", itemStyle: { color: "#10b981" } },
                { value: totalAbsent, name: "Absent", itemStyle: { color: "#ef4444" } }
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)"
                }
              }
            }
          ]
        };

      default:
        return {};
    }
  };

  const getSummaryStats = () => {
    const dateFilteredData = filterDataByDateRange(attendanceData);
    const processedData = processDataByGranularity(dateFilteredData);
    if (processedData.length === 0) return { totalPresent: 0, totalAbsent: 0, averageAttendance: 0 };
    
    const totalPresent = processedData.reduce((sum, item) => sum + item.present, 0);
    const totalAbsent = processedData.reduce((sum, item) => sum + item.absent, 0);
    const averageAttendance = Math.round(totalPresent / processedData.length);
    
    return { totalPresent, totalAbsent, averageAttendance };
  };

  const summaryStats = getSummaryStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Individual Attendance Statistics"
          description="View detailed statistics and analytics for individual member attendance"
        />

      

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{summaryStats.totalPresent}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Present</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{summaryStats.totalAbsent}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Absent</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{summaryStats.averageAttendance}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Attendance</div>
          </Card>
        </div>

        {/* Chart Controls */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chart Type:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={chartType === "line" ? "primary" : "outline"}
                  onClick={() => setChartType("line")}
                  className="min-w-[80px]"
                >
                  <i className="fas fa-chart-line mr-2"></i>
                  Line
                </Button>
                <Button
                  size="sm"
                  variant={chartType === "bar" ? "primary" : "outline"}
                  onClick={() => setChartType("bar")}
                  className="min-w-[80px]"
                >
                  <i className="fas fa-chart-bar mr-2"></i>
                  Bar
                </Button>
                <Button
                  size="sm"
                  variant={chartType === "pie" ? "primary" : "outline"}
                  onClick={() => setChartType("pie")}
                  className="min-w-[80px]"
                >
                  <i className="fas fa-chart-pie mr-2"></i>
                  Pie
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Granularity:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={granularity === "weekly" ? "primary" : "outline"}
                  onClick={() => setGranularity("weekly")}
                  className="min-w-[80px]"
                >
                  <i className="fas fa-calendar-week mr-2"></i>
                  Weekly
                </Button>
                <Button
                  size="sm"
                  variant={granularity === "monthly" ? "primary" : "outline"}
                  onClick={() => setGranularity("monthly")}
                  className="min-w-[80px]"
                >
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Monthly
                </Button>
                <Button
                  size="sm"
                  variant={granularity === "yearly" ? "primary" : "outline"}
                  onClick={() => setGranularity("yearly")}
                  className="min-w-[80px]"
                >
                  <i className="fas fa-calendar mr-2"></i>
                  Yearly
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range:</span>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
                className="w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Event Category:</span>
              <SelectInput
                value={selectedCategory}
                onChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedEvent("all"); // Reset event selection when category changes
                }}
                className="w-40"
              >
                <option value="all">All Categories</option>
                {eventCategories.map(category => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Event:</span>
              <SelectInput
                value={selectedEvent}
                onChange={(value) => setSelectedEvent(value)}
                className="w-48"
                disabled={selectedCategory === "all"}
              >
                <option value="all">
                  {selectedCategory === "all" ? "Select Category First" : "All Events"}
                </option>
                {getFilteredEvents().map(event => (
                  <option key={event.id} value={event.id.toString()}>
                    {event.title}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>
        </Card>

        {/* Chart */}
        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <i className="fas fa-spinner animate-spin text-4xl text-blue-600 mb-4"></i>
                <p className="text-gray-600 dark:text-gray-400">Loading chart data...</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-96">
              <ReactECharts
                option={getChartOption()}
                style={{ height: "100%", width: "100%" }}
                opts={{ renderer: "canvas" }}
              />
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
} 