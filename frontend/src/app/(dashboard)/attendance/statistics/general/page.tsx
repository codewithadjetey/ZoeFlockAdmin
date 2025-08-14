"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, Button, SelectInput, Card, TextInput, DateRangePicker } from "@/components/ui";
import ReactECharts from "echarts-for-react";

type ChartType = "line" | "bar" | "pie";
type DataType = "members" | "firstTimers";
type Granularity = "weekly" | "monthly" | "yearly";

interface GeneralAttendanceData {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  familyId: number;
  familyName: string;
  totalAttendance: number;
  firstTimersCount: number;
  notes?: string;
}

export default function GeneralAttendanceStatisticsPage() {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [dataType, setDataType] = useState<DataType>("members");
  const [granularity, setGranularity] = useState<Granularity>("weekly");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [familyFilter, setFamilyFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<GeneralAttendanceData[]>([]);

  // Mock data for demonstration - replace with actual API call
  const mockData: GeneralAttendanceData[] = [
    { eventId: 1, eventTitle: "Sunday Service", eventDate: "2025-07-15", familyId: 1, familyName: "Smith Family", totalAttendance: 25, firstTimersCount: 3, notes: "Great turnout" },
    { eventId: 1, eventTitle: "Sunday Service", eventDate: "2025-07-15", familyId: 2, familyName: "Johnson Family", totalAttendance: 18, firstTimersCount: 2, notes: "Good attendance" },
    { eventId: 1, eventTitle: "Sunday Service", eventDate: "2025-07-15", familyId: 3, familyName: "Williams Family", totalAttendance: 22, firstTimersCount: 1, notes: "Steady attendance" },
    { eventId: 2, eventTitle: "Bible Study", eventDate: "2025-07-22", familyId: 1, familyName: "Smith Family", totalAttendance: 20, firstTimersCount: 0, notes: "Regular members" },
    { eventId: 2, eventTitle: "Bible Study", eventDate: "2025-07-22", familyId: 2, familyName: "Johnson Family", totalAttendance: 15, firstTimersCount: 1, notes: "Good discussion" },
    { eventId: 2, eventTitle: "Bible Study", eventDate: "2025-07-22", familyId: 3, familyName: "Williams Family", totalAttendance: 18, firstTimersCount: 0, notes: "Engaged group" },
    { eventId: 3, eventTitle: "Youth Meeting", eventDate: "2025-07-29", familyId: 1, familyName: "Smith Family", totalAttendance: 12, firstTimersCount: 2, notes: "New youth members" },
    { eventId: 3, eventTitle: "Youth Meeting", eventDate: "2025-07-29", familyId: 2, familyName: "Johnson Family", totalAttendance: 10, firstTimersCount: 1, notes: "Growing youth group" },
    { eventId: 3, eventTitle: "Youth Meeting", eventDate: "2025-07-29", familyId: 3, familyName: "Williams Family", totalAttendance: 14, firstTimersCount: 0, notes: "Active participation" },
  ];

  // Set default date range (last 30 days)
  const setDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    console.log('Setting default date range (general):', {
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
      setLoading(false);
    }, 1000);
  }, [startDate, endDate, familyFilter, granularity]);

  const getFilteredData = () => {
    let filtered = [...attendanceData];
    
    if (startDate && endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.eventDate);
        return itemDate >= startDate && itemDate <= endDate;
      });
      
      console.log('General attendance date filtering:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        originalDataLength: attendanceData.length,
        filteredDataLength: filtered.length,
        sampleDates: attendanceData.slice(0, 3).map(item => item.eventDate)
      });
    }

    if (familyFilter !== "all") {
      filtered = filtered.filter(item => item.familyName === familyFilter);
    }
    
    return filtered;
  };

  const processDataByGranularity = (data: GeneralAttendanceData[]) => {
    if (granularity === "weekly") {
      return data; // Keep weekly data as is
    }
    
    if (granularity === "monthly") {
      // Group by month
      const monthlyData = new Map<string, { 
        totalAttendance: number; 
        firstTimersCount: number; 
        count: number 
      }>();
      
      data.forEach(item => {
        const monthKey = new Date(item.eventDate).toISOString().slice(0, 7); // YYYY-MM format
        const existing = monthlyData.get(monthKey) || { 
          totalAttendance: 0, 
          firstTimersCount: 0, 
          count: 0 
        };
        
        monthlyData.set(monthKey, {
          totalAttendance: existing.totalAttendance + item.totalAttendance,
          firstTimersCount: existing.firstTimersCount + item.firstTimersCount,
          count: existing.count + 1
        });
      });
      
      return Array.from(monthlyData.entries()).map(([month, stats]) => ({
        eventId: 0, // Placeholder for grouped data
        eventTitle: month,
        eventDate: month,
        familyId: 0, // Placeholder for grouped data
        familyName: "All Families", // Placeholder for grouped data
        totalAttendance: Math.round(stats.totalAttendance / stats.count),
        firstTimersCount: Math.round(stats.firstTimersCount / stats.count)
      }));
    }
    
    if (granularity === "yearly") {
      // Group by year
      const yearlyData = new Map<string, { 
        totalAttendance: number; 
        firstTimersCount: number; 
        count: number 
      }>();
      
      data.forEach(item => {
        const yearKey = new Date(item.eventDate).getFullYear().toString();
        const existing = yearlyData.get(yearKey) || { 
          totalAttendance: 0, 
          firstTimersCount: 0, 
          count: 0 
        };
        
        yearlyData.set(yearKey, {
          totalAttendance: existing.totalAttendance + item.totalAttendance,
          firstTimersCount: existing.firstTimersCount + item.firstTimersCount,
          count: existing.count + 1
        });
      });
      
      return Array.from(yearlyData.entries()).map(([year, stats]) => ({
        eventId: 0, // Placeholder for grouped data
        eventTitle: year,
        eventDate: year,
        familyId: 0, // Placeholder for grouped data
        familyName: "All Families", // Placeholder for grouped data
        totalAttendance: Math.round(stats.totalAttendance / stats.count),
        firstTimersCount: Math.round(stats.firstTimersCount / stats.count)
      }));
    }
    
    return data;
  };

  const getChartOption = () => {
    const filteredData = getFilteredData();
    const processedData = processDataByGranularity(filteredData);
    const events = [...new Set(processedData.map(item => item.eventTitle))];
    const families = [...new Set(processedData.map(item => item.familyName))];
    
    let chartData: any[] = [];
    let xAxisData: string[] = [];
    
    if (dataType === "members") {
      // Group by event and sum total attendance
      const eventAttendance = events.map(eventTitle => {
        const eventData = processedData.filter(item => item.eventTitle === eventTitle);
        const totalAttendance = eventData.reduce((sum, item) => sum + item.totalAttendance, 0);
        return { event: eventTitle, attendance: totalAttendance };
      });
      
      chartData = eventAttendance.map(item => item.attendance);
      xAxisData = eventAttendance.map(item => item.event);
    } else {
      // Group by event and sum first timers
      const eventFirstTimers = events.map(eventTitle => {
        const eventData = processedData.filter(item => item.eventTitle === eventTitle);
        const totalFirstTimers = eventData.reduce((sum, item) => sum + item.firstTimersCount, 0);
        return { event: eventTitle, firstTimers: totalFirstTimers };
      });
      
      chartData = eventFirstTimers.map(item => item.firstTimers);
      xAxisData = eventFirstTimers.map(item => item.event);
    }

    switch (chartType) {
      case "line":
        return {
          title: {
            text: `${dataType === "members" ? "Members" : "First Timers"} Attendance Trends (${granularity.charAt(0).toUpperCase() + granularity.slice(1)})`,
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
            data: [dataType === "members" ? "Total Members" : "First Timers"],
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
            data: xAxisData,
            axisLabel: {
              color: "#6b7280",
              rotate: 45
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
              name: dataType === "members" ? "Total Members" : "First Timers",
              type: "line",
              data: chartData,
              smooth: true,
              lineStyle: { 
                color: dataType === "members" ? "#10b981" : "#3b82f6", 
                width: 3 
              },
              itemStyle: { 
                color: dataType === "members" ? "#10b981" : "#3b82f6" 
              },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { 
                      offset: 0, 
                      color: dataType === "members" 
                        ? "rgba(16, 185, 129, 0.3)" 
                        : "rgba(59, 130, 246, 0.3)" 
                    },
                    { 
                      offset: 1, 
                      color: dataType === "members" 
                        ? "rgba(16, 185, 129, 0.05)" 
                        : "rgba(59, 130, 246, 0.05)" 
                    }
                  ]
                }
              }
            }
          ]
        };

      case "bar":
        return {
          title: {
            text: `${dataType === "members" ? "Members" : "First Timers"} Attendance Comparison (${granularity.charAt(0).toUpperCase() + granularity.slice(1)})`,
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
            data: [dataType === "members" ? "Total Members" : "First Timers"],
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
            data: xAxisData,
            axisLabel: {
              color: "#6b7280",
              rotate: 45
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
              name: dataType === "members" ? "Total Members" : "First Timers",
              type: "bar",
              data: chartData,
              itemStyle: { 
                color: dataType === "members" ? "#10b981" : "#3b82f6" 
              },
              barWidth: "60%"
            }
          ]
        };

      case "pie":
        // For pie chart, show family distribution
        const familyData = families.map(familyName => {
          const familyItems = processedData.filter(item => item.familyName === familyName);
          const total = familyItems.reduce((sum, item) => 
            sum + (dataType === "members" ? item.totalAttendance : item.firstTimersCount), 0
          );
          return { name: familyName, value: total };
        });
        
        return {
          title: {
            text: `${dataType === "members" ? "Members" : "First Timers"} by Family (${granularity.charAt(0).toUpperCase() + granularity.slice(1)})`,
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
              name: dataType === "members" ? "Members" : "First Timers",
              type: "pie",
              radius: ["40%", "70%"],
              center: ["60%", "50%"],
              data: familyData.map((item, index) => ({
                ...item,
                itemStyle: { 
                  color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5] 
                }
              })),
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
    const filteredData = getFilteredData();
    const processedData = processDataByGranularity(filteredData);
    if (processedData.length === 0) return { totalMembers: 0, totalFirstTimers: 0, averageMembers: 0, averageFirstTimers: 0 };
    
    const totalMembers = processedData.reduce((sum, item) => sum + item.totalAttendance, 0);
    const totalFirstTimers = processedData.reduce((sum, item) => sum + item.firstTimersCount, 0);
    const uniqueEvents = new Set(processedData.map(item => item.eventTitle)).size;
    const averageMembers = Math.round(totalMembers / uniqueEvents);
    const averageFirstTimers = Math.round(totalFirstTimers / uniqueEvents);
    
    return { totalMembers, totalFirstTimers, averageMembers, averageFirstTimers };
  };

  const summaryStats = getSummaryStats();
  const uniqueFamilies = [...new Set(attendanceData.map(item => item.familyName))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="General Attendance Statistics"
          description="View detailed statistics and analytics for general attendance across events"
        />

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
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Type:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={dataType === "members" ? "primary" : "outline"}
                  onClick={() => setDataType("members")}
                  className="min-w-[120px]"
                >
                  <i className="fas fa-users mr-2"></i>
                  Members
                </Button>
                <Button
                  size="sm"
                  variant={dataType === "firstTimers" ? "primary" : "outline"}
                  onClick={() => setDataType("firstTimers")}
                  className="min-w-[120px]"
                >
                  <i className="fas fa-star mr-2"></i>
                  First Timers
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
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Family:</span>
              <SelectInput
                value={familyFilter}
                onChange={(value) => setFamilyFilter(value)}
                className="w-40"
              >
                <option value="all">All Families</option>
                {uniqueFamilies.map(family => (
                  <option key={family} value={family}>{family}</option>
                ))}
              </SelectInput>
            </div>
          </div>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{summaryStats.totalMembers}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Members</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{summaryStats.totalFirstTimers}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total First Timers</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{summaryStats.averageMembers}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Members/Event</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{summaryStats.averageFirstTimers}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg First Timers/Event</div>
          </Card>
        </div>

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