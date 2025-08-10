"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  SearchInput, 
  SelectInput, 
  ViewToggle, 
  DataGrid, 
  ContentCard,
  StatusBadge,
  CategoryBadge,
  Button
} from "@/components/ui";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Event, EventFilters } from "@/interfaces/events";
import { EventsService } from "@/services/events";
import { EntitiesService } from "@/services/entities";
import EventModal from "@/components/events/EventModal";
import { useAuth } from "@/contexts/AuthContext";

export default function EventsPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  useEffect(() => {
    loadEvents();
  }, [statusFilter, typeFilter, pagination.current_page]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const filters: EventFilters = {
        per_page: pagination.per_page
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      if (typeFilter !== 'all') {
        filters.type = typeFilter;
      }

      if (searchTerm) {
        // Note: API doesn't have search yet, so we'll filter client-side
        // In a real implementation, you'd add search to the API
      }

      const response = await EventsService.getEvents(filters);
      if (response.success) {
        setEvents(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total
        });
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleCreateEvent = () => {
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleEventSuccess = (event: Event) => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    } else {
      setEvents(prev => [event, ...prev]);
    }
    setIsModalOpen(false);
    setEditingEvent(undefined);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await EventsService.deleteEvent(eventId);
        setEvents(prev => prev.filter(e => e.id !== eventId));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleCancelEvent = async (event: Event) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason !== null) {
      try {
        const cancelFutureInstances = event.is_recurring && 
          confirm('This is a recurring event. Cancel all future instances?');
        
        await EventsService.cancelEvent(event.id, reason, cancelFutureInstances);
        await loadEvents(); // Reload to get updated status
      } catch (error) {
        console.error('Error cancelling event:', error);
      }
    }
  };

  const handlePublishEvent = async (event: Event) => {
    try {
      await EventsService.publishEvent(event.id);
      await loadEvents(); // Reload to get updated status
    } catch (error) {
      console.error('Error publishing event:', error);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'group': return 'bg-blue-500';
      case 'family': return 'bg-purple-500';
      case 'general': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Sample event data for demonstration
  const sampleEvents = [
    {
      id: 1,
      title: "Sample Event",
      description: "This is a sample event",
      maxAttendees: 30,
      status: "Upcoming",
      color: "bg-pink-500",
    },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
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

  const renderEventCard = (event: Event) => (
    <div className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${getEventTypeColor(event.type)} rounded-xl flex items-center justify-center`}>
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
            {formatEventDate(event.start_date)}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <i className="fas fa-clock text-gray-400 mr-2"></i>
          <span className="text-gray-600">
            {formatEventTime(event.start_date)}
            {event.end_date && ` - ${formatEventTime(event.end_date)}`}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
          <span className="text-gray-600">{event.location}</span>
        </div>
        <div className="flex items-center text-sm">
          <i className="fas fa-tag text-gray-400 mr-2"></i>
          <span className="text-gray-600">{event.type}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-700 text-sm"
            onClick={() => handleEditEvent(event)}
          >
            <i className="fas fa-edit"></i>
          </button>
          {event.status === 'draft' && (
            <button 
              className="text-green-600 hover:text-green-700 text-sm"
              onClick={() => handlePublishEvent(event)}
              title="Publish Event"
            >
              <i className="fas fa-globe"></i>
            </button>
          )}
          {event.status === 'published' && (
            <button 
              className="text-orange-600 hover:text-orange-700 text-sm"
              onClick={() => handleCancelEvent(event)}
              title="Cancel Event"
            >
              <i className="fas fa-ban"></i>
            </button>
          )}
          <button 
            className="text-red-600 hover:text-red-700 text-sm"
            onClick={() => handleDeleteEvent(event.id)}
          >
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
        description="Manage church events and activities. Create drafts and publish when ready."
        actionButton={{
          text: "Create Event",
          icon: "fas fa-calendar-plus",
          onClick: handleCreateEvent
        }}
      />

      {/* Status Summary */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center text-blue-800 dark:text-blue-200">
          <i className="fas fa-info-circle mr-2"></i>
          <span className="text-sm">
            <strong>Tip:</strong> Create events as drafts first, then publish them when ready. Use the globe icon to publish draft events.
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <i className="fas fa-calendar text-blue-600 dark:text-blue-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{events.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <i className="fas fa-edit text-yellow-600 dark:text-yellow-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {events.filter(e => e.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <i className="fas fa-globe text-green-600 dark:text-green-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {events.filter(e => e.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <i className="fas fa-ban text-red-600 dark:text-red-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {events.filter(e => e.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <i className="fas fa-check-circle text-gray-600 dark:text-gray-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {events.filter(e => e.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <SearchInput
            placeholder="Search events..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <SelectInput
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'completed', label: 'Completed' }
          ]}
        />
        <SelectInput
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'general', label: 'General' },
            { value: 'group', label: 'Group' },
            { value: 'family', label: 'Family' }
          ]}
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
                (event) => new Date(event.start_date).getDate() === day
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
                      className={`text-xs p-1 rounded mb-1 text-white ${getEventTypeColor(event.type)}`}
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

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={editingEvent}
        onSuccess={handleEventSuccess}
      />
    </DashboardLayout>
  );
} 