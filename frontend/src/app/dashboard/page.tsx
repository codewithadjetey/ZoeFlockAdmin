"use client";
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Members",
      value: "1,247",
      change: "+12%",
      changeType: "positive",
      icon: "fas fa-users",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Groups",
      value: "24",
      change: "+3",
      changeType: "positive",
      icon: "fas fa-layer-group",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "This Month's Donations",
      value: "$12,450",
      change: "+8.2%",
      changeType: "positive",
      icon: "fas fa-donate",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Upcoming Events",
      value: "8",
      change: "+2",
      changeType: "positive",
      icon: "fas fa-calendar",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "member",
      icon: "fas fa-user-plus",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      title: "New Member Registration",
      description: "Sarah Johnson has joined the church",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "donation",
      icon: "fas fa-donate",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      title: "Donation Received",
      description: "$250 donation from John Smith",
      time: "30 minutes ago",
    },
    {
      id: 3,
      type: "event",
      icon: "fas fa-calendar",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      title: "Event Created",
      description: "Youth Bible Study scheduled for Friday",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "group",
      icon: "fas fa-layer-group",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      title: "New Group Formed",
      description: "Prayer Warriors group has been created",
      time: "2 hours ago",
    },
  ];

  const quickActions = [
    { label: "Add Member", icon: "fas fa-user-plus", href: "/dashboard/members/create" },
    { label: "Create Event", icon: "fas fa-calendar-plus", href: "/dashboard/events/create" },
    { label: "Record Donation", icon: "fas fa-donate", href: "/dashboard/donations/create" },
    { label: "Send Message", icon: "fas fa-envelope", href: "/dashboard/communication" },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="welcome-gradient rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] mb-2">
                Welcome back, Admin!
              </h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening with your church today.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <p className="text-blue-200 text-sm">Today's Date</p>
                <p className="text-2xl font-bold">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <i className={`${stat.icon} ${stat.color} text-xl`}></i>
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 font-['Poppins'] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="quick-action-btn text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex flex-col items-center text-center hover:shadow-lg"
              >
                <i className={`${action.icon} text-2xl mb-2`}></i>
                <span className="text-sm">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-['Poppins']">Recent Activities</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="activity-item flex items-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 cursor-pointer"
              >
                <div className={`w-12 h-12 ${activity.bgColor} rounded-full flex items-center justify-center mr-4`}>
                  <i className={`${activity.icon} ${activity.iconColor}`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
                  <p className="text-xs text-gray-600">{activity.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Chart */}
        <div className="chart-container rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Weekly Attendance</h3>
          <div className="h-64 flex items-end justify-center space-x-2">
            {[65, 72, 68, 75, 82, 78, 85].map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-8 bg-blue-500 rounded-t"
                  style={{ height: `${(value / 100) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Donations Chart */}
        <div className="chart-container rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Monthly Donations</h3>
          <div className="h-64 flex items-end justify-center space-x-4">
            {[12000, 15000, 18000, 14000, 22000, 19000].map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-10 bg-green-500 rounded-t"
                  style={{ height: `${(value / 25000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
} 