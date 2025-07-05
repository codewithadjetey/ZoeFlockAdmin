"use client";
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  StatCard,
  ContentCard 
} from "@/components/ui";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Members",
      value: "1,247",
      description: "Active church members",
      icon: "fas fa-users",
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-100",
    },
    {
      title: "Events This Month",
      value: "12",
      description: "Upcoming events",
      icon: "fas fa-calendar",
      iconColor: "text-green-600",
      iconBgColor: "bg-green-100",
    },
    {
      title: "Donations",
      value: "$45,230",
      description: "This month's donations",
      icon: "fas fa-dollar-sign",
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-100",
    },
    {
      title: "Groups",
      value: "8",
      description: "Active ministries",
      icon: "fas fa-church",
      iconColor: "text-orange-600",
      iconBgColor: "bg-orange-100",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "member",
      title: "New Member Registration",
      description: "Sarah Johnson joined the church",
      time: "2 hours ago",
      icon: "fas fa-user-plus",
      color: "text-green-600",
    },
    {
      id: 2,
      type: "donation",
      title: "Donation Received",
      description: "John Smith donated $150",
      time: "4 hours ago",
      icon: "fas fa-hand-holding-heart",
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "event",
      title: "Event Created",
      description: "Youth Ministry Meeting scheduled",
      time: "6 hours ago",
      icon: "fas fa-calendar-plus",
      color: "text-purple-600",
    },
    {
      id: 4,
      type: "message",
      title: "Message Sent",
      description: "Weekly newsletter sent to 1,200 members",
      time: "1 day ago",
      icon: "fas fa-envelope",
      color: "text-orange-600",
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
    },
    {
      id: 2,
      title: "Youth Bible Study",
      date: "March 22, 2024",
      time: "7:00 PM",
      location: "Youth Room",
      attendees: 18,
    },
    {
      id: 3,
      title: "Prayer Meeting",
      date: "March 20, 2024",
      time: "6:30 PM",
      location: "Prayer Room",
      attendees: 12,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening in your church."
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBgColor={stat.iconBgColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <ContentCard>
          <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Recent Activities</h3>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className={`${activity.icon} ${activity.color}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>

        {/* Upcoming Events */}
        <ContentCard>
          <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Upcoming Events</h3>
          
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <span className="text-xs text-gray-500">{event.attendees} attending</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <i className="fas fa-calendar text-gray-400 mr-2"></i>
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-clock text-gray-400 mr-2"></i>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Quick Actions */}
      <ContentCard className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <i className="fas fa-user-plus text-blue-600 text-xl"></i>
            </div>
            <span className="text-sm font-medium text-gray-900">Add Member</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <i className="fas fa-calendar-plus text-green-600 text-xl"></i>
            </div>
            <span className="text-sm font-medium text-gray-900">Create Event</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <i className="fas fa-hand-holding-heart text-purple-600 text-xl"></i>
            </div>
            <span className="text-sm font-medium text-gray-900">Record Donation</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
              <i className="fas fa-envelope text-orange-600 text-xl"></i>
            </div>
            <span className="text-sm font-medium text-gray-900">Send Message</span>
          </button>
        </div>
      </ContentCard>
    </DashboardLayout>
  );
} 