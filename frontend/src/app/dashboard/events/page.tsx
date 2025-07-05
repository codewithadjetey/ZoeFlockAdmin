"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const events = [
    {
      id: 1,
      title: "Sunday Service",
      description: "Weekly Sunday worship service with praise and worship",
      date: "2024-03-24",
      time: "10:00 AM",
      duration: "2 hours",
      category: "Worship",
      location: "Main Sanctuary",
      attendees: 125,
      maxAttendees: 200,
      status: "Upcoming",
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Youth Bible Study",
      description: "Weekly Bible study for youth group members",
      date: "2024-03-22",
      time: "7:00 PM",
      duration: "1.5 hours",
      category: "Education",
      location: "Youth Room",
      attendees: 18,
      maxAttendees: 25,
      status: "Upcoming",
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Prayer Meeting",
      description: "Community prayer meeting for church needs",
      date: "2024-03-20",
      time: "6:30 PM",
      duration: "1 hour",
      category: "Prayer",
      location: "Prayer Room",
      attendees: 12,
      maxAttendees: 20,
      status: "Completed",
      color: "bg-purple-500",
    },
    {
      id: 4,
      title: "Choir Practice",
      description: "Weekly choir practice for Sunday service",
      date: "2024-03-21",
      time: "7:30 PM",
      duration: "2 hours",
      category: "Music",
      location: "Choir Room",
      attendees: 15,
      maxAttendees: 20,
      status: "Upcoming",
      color: "bg-orange-500",
    },
    {
      id: 5,
      title: "Men's Fellowship",
      description: "Monthly men's fellowship and Bible study",
      date: "2024-03-25",
      time: "6:00 PM",
      duration: "2 hours",
      category: "Fellowship",
      location: "Fellowship Hall",
      attendees: 8,
      maxAttendees: 15,
      status: "Upcoming",
      color: "bg-red-500",
    },
    {
      id: 6,
      title: "Women's Ministry",
      description: "Monthly women's ministry meeting",
      date: "2024-03-26",
      time: "7:00 PM",
      duration: "1.5 hours",
      category: "Fellowship",
      location: "Conference Room",
      attendees: 22,
      maxAttendees: 30,
      status: "Upcoming",
      color: "bg-pink-500",
    },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || event.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Worship":
        return "bg-blue-100 text-blue-800";
      case "Education":
        return "bg-green-100 text-green-800";
      case "Prayer":
        return "bg-purple-100 text-purple-800";
      case "Music":
        return "bg-orange-100 text-orange-800";
      case "Fellowship":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewModeChange = (mode: "grid" | "calendar", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewMode(mode);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">Events</h2>
              <p className="text-gray-600">Manage church events and activities</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center mt-4 md:mt-0">
              <i className="fas fa-calendar-plus mr-2"></i>Create Event
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 search-input rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 appearance-none bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option>All Categories</option>
                <option>Worship</option>
                <option>Education</option>
                <option>Prayer</option>
                <option>Music</option>
                <option>Fellowship</option>
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between mt-6 relative z-10 view-toggle-container" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
                <button
                  data-view-toggle="grid"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    setViewMode("grid");
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <i className="fas fa-th mr-1"></i>Grid
                </button>
                <button
                  data-view-toggle="calendar"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    setViewMode("calendar");
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === "calendar"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <i className="fas fa-calendar mr-1"></i>Calendar
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <span>{filteredEvents.length} events</span>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      {viewMode === "grid" && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${event.color} rounded-xl flex items-center justify-center`}>
                  <i className="fas fa-calendar text-white text-xl"></i>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{event.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <i className="fas fa-calendar-day text-gray-400 mr-2"></i>
                  <span className="text-gray-600">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="fas fa-clock text-gray-400 mr-2"></i>
                  <span className="text-gray-600">{event.time} ({event.duration})</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                  <span className="text-gray-600">{event.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="fas fa-users text-gray-400 mr-2"></i>
                  <span className="text-gray-600">
                    {event.attendees}/{event.maxAttendees} attendees
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="text-red-600 hover:text-red-700 text-sm">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 font-['Poppins']">March 2024</h3>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const dayEvents = filteredEvents.filter(
                (event) => new Date(event.date).getDate() === day
              );
              
              return (
                <div
                  key={day}
                  className="p-2 border border-gray-200 min-h-[80px] hover:bg-gray-50 cursor-pointer"
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded mb-1 text-white ${event.color}`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </DashboardLayout>
  );
} 