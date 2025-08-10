"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  StatCard,
  ContentCard 
} from "@/components/ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FamiliesService } from "@/services/families";
import { GroupsService } from "@/services/groups";
import { MembersService } from "@/services/members";

export default function DashboardPage() {
  const [stats, setStats] = useState([
    {
      title: "Total Members",
      value: "0",
      description: "Loading...",
      icon: "fas fa-users",
      iconColor: "text-blue-600",
      iconBgColor: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20",
    },
    {
      title: "Total Families",
      value: "0",
      description: "Loading...",
      icon: "fas fa-home",
      iconColor: "text-purple-600",
      iconBgColor: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20",
    },
    {
      title: "Active Groups",
      value: "0",
      description: "Loading...",
      icon: "fas fa-layer-group",
      iconColor: "text-yellow-600",
      iconBgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20",
    },
    {
      title: "Upcoming Events",
      value: "0",
      description: "Loading...",
      icon: "fas fa-calendar",
      iconColor: "text-indigo-600",
      iconBgColor: "bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/20 dark:to-indigo-800/20",
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch family statistics
        const familyStats = await FamiliesService.getStatistics();
        
        // Fetch member count
        const membersResponse = await MembersService.getMembers();
        
        // Fetch group count
        const groupsResponse = await GroupsService.getGroups();
        
        if (familyStats.success && familyStats.data) {
          const data = familyStats.data;
          setStats(prevStats => prevStats.map(stat => {
            if (stat.title === "Total Families") {
              return {
                ...stat,
                value: data.total_families?.toString() || "0",
                description: `${data.active_families || 0} active families`
              };
            }
            if (stat.title === "Total Members") {
              return {
                ...stat,
                value: data.total_members?.toString() || "0",
                description: `${data.active_members || 0} active members`
              };
            }
            if (stat.title === "Active Groups") {
              return {
                ...stat,
                value: groupsResponse.success ? groupsResponse.groups?.data?.length?.toString() || "0" : "0",
                description: "Groups in the system"
              };
            }
            return stat;
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const attendanceData = [
    { name: 'Sun', attendance: 120, target: 150 },
    { name: 'Mon', attendance: 85, target: 100 },
    { name: 'Tue', attendance: 95, target: 100 },
    { name: 'Wed', attendance: 110, target: 120 },
    { name: 'Thu', attendance: 75, target: 80 },
    { name: 'Fri', attendance: 90, target: 100 },
    { name: 'Sat', attendance: 65, target: 80 },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "member",
      title: "Sarah Johnson",
      description: "joined as a new member",
      time: "2 min ago",
      icon: "fas fa-user-plus",
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20",
    },
    {
      id: 2,
      type: "event",
      title: "Men's Fellowship",
      description: "event was created",
      time: "10 min ago",
      icon: "fas fa-calendar-plus",
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20",
    },
    {
      id: 3,
      type: "donation",
      title: "$250 donation",
      description: "received from John Smith",
      time: "30 min ago",
      icon: "fas fa-donate",
      color: "text-yellow-600",
      bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20",
    },
    {
      id: 4,
      type: "profile",
      title: "Profile updated",
      description: "by Michael Brown",
      time: "1 hr ago",
      icon: "fas fa-user-edit",
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Sunday Service",
      date: "March 24, 2024",
      time: "10:00 AM",
      location: "Main Sanctuary",
      attendees: 125,
      category: "Worship",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      id: 2,
      title: "Youth Bible Study",
      date: "March 22, 2024",
      time: "7:00 PM",
      location: "Youth Room",
      attendees: 18,
      category: "Education",
      color: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      id: 3,
      title: "Prayer Meeting",
      date: "March 20, 2024",
      time: "6:30 PM",
      location: "Prayer Room",
      attendees: 12,
      category: "Prayer",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
    {
      id: 4,
      title: "Choir Practice",
      date: "March 21, 2024",
      time: "7:30 PM",
      location: "Choir Room",
      attendees: 15,
      category: "Music",
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
    },
  ];

  const quickActions = [
    {
      title: "Create New Event",
      icon: "fas fa-plus",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      href: "/dashboard/events",
    },
    {
      title: "Add New Member",
      icon: "fas fa-user-plus",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      href: "/dashboard/members",
    },
    {
      title: "Manage Families",
      icon: "fas fa-home",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      href: "/dashboard/families",
    },
    {
      title: "Send Message",
      icon: "fas fa-envelope",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      href: "/dashboard/communication",
    },
  ];

  return (
    <DashboardLayout>
      {/* Modern Welcome Section */}
      <section className="mb-8">
        <div className="welcome-gradient rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-3 font-['Poppins'] bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Welcome back, <span className="text-yellow-300">Admin</span>! 👋
              </h2>
              <p className="text-blue-100 dark:text-blue-200 text-lg">
                Here's what's happening with your church community today.
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex space-x-4">
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105">
                <i className="fas fa-plus mr-2"></i>Add Event
              </button>
              <button className="bg-white text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-200 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105">
                <i className="fas fa-user-plus mr-2"></i>Add Member
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Statistics Cards */}
      <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`stat-card rounded-3xl shadow-xl p-6 flex items-center cursor-pointer transition-all duration-300 hover:transform hover:scale-105 ${loading ? 'opacity-75' : ''}`}
            onClick={() => {
              if (!loading) {
                switch (stat.title) {
                  case 'Total Members':
                    window.location.href = '/dashboard/members';
                    break;
                  case 'Total Families':
                    window.location.href = '/dashboard/families';
                    break;
                  case 'Active Groups':
                    window.location.href = '/dashboard/groups';
                    break;
                  case 'Upcoming Events':
                    window.location.href = '/dashboard/events';
                    break;
                }
              }
            }}
          >
            <div className={`w-16 h-16 ${stat.iconBgColor} rounded-2xl flex items-center justify-center mr-5 shadow-lg`}>
              <i className={`${stat.icon} text-3xl ${stat.iconColor}`}></i>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.title}</dt>
              <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 rounded"></div>
                ) : (
                  stat.value
                )}
              </dd>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {loading ? (
                  <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-3 w-20 rounded"></div>
                ) : (
                  stat.description
                )}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Family Statistics Overview */}
      {!loading && (
        <section className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-['Poppins']">Family Overview</h3>
              <button 
                onClick={() => window.location.href = '/dashboard/families'}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
              >
                View All Families
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-home text-white text-2xl"></i>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Families</h4>
                <p className="text-3xl font-bold text-blue-600">{stats.find(s => s.title === 'Total Families')?.value || '0'}</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-users text-white text-2xl"></i>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Family Members</h4>
                <p className="text-3xl font-bold text-green-600">{stats.find(s => s.title === 'Total Members')?.value || '0'}</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-layer-group text-white text-2xl"></i>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Active Groups</h4>
                <p className="text-3xl font-bold text-purple-600">{stats.find(s => s.title === 'Active Groups')?.value || '0'}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modern Charts & Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Modern Attendance Chart */}
        <div className="chart-container rounded-3xl shadow-xl p-8 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-['Poppins']">Attendance Overview</h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium shadow-lg">This Month</button>
              <button className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium shadow-lg">Last Month</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  className="dark:stroke-gray-400"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  className="dark:stroke-gray-400"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Modern Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 font-['Poppins']">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{ background: action.gradient }}
              >
                <i className={`${action.icon} mr-3 text-lg`}></i>
                {action.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Recent Activity & Upcoming Events */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Modern Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-['Poppins']">Recent Activity</h3>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:transform hover:scale-[1.02]">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${activity.bgColor} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                    <i className={`${activity.icon} ${activity.color}`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modern Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-['Poppins']">Upcoming Events</h3>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200">View All</button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-item flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:transform hover:scale-[1.02]">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${event.color} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                    <i className={`fas fa-calendar text-white`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{event.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.date} at {event.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{event.location}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{event.attendees} attending</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
} 