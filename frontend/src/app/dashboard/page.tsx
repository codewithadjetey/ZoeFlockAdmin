"use client";
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  StatCard,
  ContentCard 
} from "@/components/ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Members",
      value: "1,234",
      description: "+12% this month",
      icon: "fas fa-users",
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-100",
    },
    {
      title: "Upcoming Events",
      value: "8",
      description: "Next: Sunday Service",
      icon: "fas fa-calendar",
      iconColor: "text-indigo-600",
      iconBgColor: "bg-indigo-100",
    },
    {
      title: "Monthly Donations",
      value: "$5,200",
      description: "+8% vs last month",
      icon: "fas fa-donate",
      iconColor: "text-green-600",
      iconBgColor: "bg-green-100",
    },
    {
      title: "Active Groups",
      value: "12",
      description: "3 new this week",
      icon: "fas fa-layer-group",
      iconColor: "text-yellow-600",
      iconBgColor: "bg-yellow-100",
    },
  ];

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
      bgColor: "bg-green-100",
    },
    {
      id: 2,
      type: "event",
      title: "Men's Fellowship",
      description: "event was created",
      time: "10 min ago",
      icon: "fas fa-calendar-plus",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: 3,
      type: "donation",
      title: "$250 donation",
      description: "received from John Smith",
      time: "30 min ago",
      icon: "fas fa-donate",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      id: 4,
      type: "profile",
      title: "Profile updated",
      description: "by Michael Brown",
      time: "1 hr ago",
      icon: "fas fa-user-edit",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
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
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Youth Bible Study",
      date: "March 22, 2024",
      time: "7:00 PM",
      location: "Youth Room",
      attendees: 18,
      category: "Education",
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Prayer Meeting",
      date: "March 20, 2024",
      time: "6:30 PM",
      location: "Prayer Room",
      attendees: 12,
      category: "Prayer",
      color: "bg-purple-500",
    },
    {
      id: 4,
      title: "Choir Practice",
      date: "March 21, 2024",
      time: "7:30 PM",
      location: "Choir Room",
      attendees: 15,
      category: "Music",
      color: "bg-orange-500",
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
      title: "Record Donation",
      icon: "fas fa-donate",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      href: "/dashboard/donations",
    },
    {
      title: "Send Message",
      icon: "fas fa-envelope",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      href: "/dashboard/communication",
    },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="welcome-gradient rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-3 font-['Poppins']">
                Welcome back, <span className="text-yellow-300">Admin</span>! 👋
              </h2>
              <p className="text-blue-100 text-lg">
                Here's what's happening with your church community today.
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex space-x-4">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center">
                <i className="fas fa-plus mr-2"></i>Add Event
              </button>
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center">
                <i className="fas fa-user-plus mr-2"></i>Add Member
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card rounded-2xl shadow-lg p-6 flex items-center cursor-pointer transition-all duration-300 hover:transform hover:scale-105">
            <div className={`w-16 h-16 ${stat.iconBgColor} rounded-2xl flex items-center justify-center mr-5`}>
              <i className={`${stat.icon} text-3xl ${stat.iconColor}`}></i>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-1">{stat.title}</dt>
              <dd className="text-3xl font-bold text-gray-900">{stat.value}</dd>
              <p className="text-xs text-green-600 mt-1">{stat.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Charts & Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Attendance Chart */}
        <div className="chart-container rounded-2xl shadow-lg p-8 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 font-['Poppins']">Attendance Overview</h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium">This Month</button>
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">Last Month</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
        
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 font-['Poppins']">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center transition-all duration-200 hover:transform hover:scale-105"
                style={{ background: action.gradient }}
              >
                <i className={`${action.icon} mr-3 text-lg`}></i>
                {action.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity & Upcoming Events */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 font-['Poppins']">Recent Activity</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${activity.bgColor} rounded-full flex items-center justify-center mr-4`}>
                    <i className={`${activity.icon} ${activity.color}`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 font-['Poppins']">Upcoming Events</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-item flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${event.color} rounded-full flex items-center justify-center mr-4`}>
                    <i className={`fas fa-calendar text-white`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">{event.location}</span>
                  <p className="text-xs text-gray-500">{event.attendees} attending</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
} 