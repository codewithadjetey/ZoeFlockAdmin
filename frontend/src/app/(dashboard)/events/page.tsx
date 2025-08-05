"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  SearchInput, 
  SelectInput, 
  ViewToggle, 
  DataGrid, 
  ContentCard,
  StatusBadge,
  CategoryBadge 
} from "@/components/ui";

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
      location: "Women's Room",
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

  const categoryOptions = [
    { value: "All Categories", label: "All Categories" },
    { value: "Worship", label: "Worship" },
    { value: "Education", label: "Education" },
    { value: "Prayer", label: "Prayer" },
    { value: "Music", label: "Music" },
    { value: "Fellowship", label: "Fellowship" },
  ];

  const viewToggleOptions = [
    { value: "grid", label: "Grid", icon: "fas fa-th" },
    { value: "calendar", label: "Calendar", icon: "fas fa-calendar" },
  ];

  const renderEventCard = (event: any) => (
    <div className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${event.color} rounded-xl flex items-center justify-center`}>
          <i className="fas fa-calendar text-white text-xl"></i>
        </div>
        <StatusBadge status={event.status} />
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
        <CategoryBadge category={event.category} />
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
  );

  const handleViewModeChange = (value: string) => {
    setViewMode(value as "grid" | "calendar");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Events"
        description="Manage church events and activities"
        actionButton={{
          text: "Create Event",
          icon: "fas fa-calendar-plus",
          onClick: () => console.log("Create event clicked")
        }}
      />

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <SearchInput
            placeholder="Search events..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <SelectInput
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
        />
      </div>

      {/* View Toggle */}
      <ViewToggle
        value={viewMode}
        onChange={handleViewModeChange}
        options={viewToggleOptions}
        count={filteredEvents.length}
        countLabel="events"
      />

      {/* Events Grid */}
      {viewMode === "grid" && (
        <DataGrid
          data={filteredEvents}
          renderCard={renderEventCard}
          columns={3}
        />
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <ContentCard>
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
        </ContentCard>
      )}
    </DashboardLayout>
  );
} 