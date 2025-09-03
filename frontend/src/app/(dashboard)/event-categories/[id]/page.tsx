"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  SearchInput, 
  SelectInput, 
  DataTable, 
  ContentCard,
  StatusBadge,
  Button,
  LoadingSpinner,
  CategoryBadge
} from "@/components/ui";
import { EventCategory, Event } from "@/interfaces/events";
import { EventCategoriesService } from "@/services/eventCategories";
import { EventsService } from "@/services/events";
import { useAuth } from "@/contexts/AuthContext";

export default function EventCategoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  useEffect(() => {
    if (id) {
      loadCategory();
      loadCategoryEvents();
    }
  }, [id, statusFilter, pagination.current_page]);

  const loadCategory = async () => {
    try {
      const response = await EventCategoriesService.getEventCategory(parseInt(id as string));
      if (response.success) {
        setCategory(response.data);
      }
    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoryEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const filters: any = {
        per_page: pagination.per_page
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await EventCategoriesService.getCategoryEvents(parseInt(id as string), filters);
      if (response.success) {
        setEvents(response.data.events.data);
        setPagination({
          current_page: response.data.events.current_page,
          last_page: response.data.events.last_page,
          per_page: response.data.events.per_page,
          total: response.data.events.total
        });
      }
    } catch (error) {
      console.error('Error loading category events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleGenerateEvents = async () => {
    if (!category?.is_recurring) {
      alert('This category is not configured for recurring events.');
      return;
    }

    const count = prompt('How many events to generate?', '10');
    if (!count) return;

    const autoPublish = confirm('Auto-publish generated events?');

    try {
      const response = await EventCategoriesService.generateEvents(category.id, {
        count: parseInt(count),
        auto_publish: autoPublish
      });

      if (response.success) {
        alert(`Successfully generated ${response.data.generated_count} events!`);
        loadCategoryEvents(); // Reload events
      }
    } catch (error: any) {
      alert(`Error generating events: ${error.message}`);
    }
  };

  const handleCreateEvent = () => {
    router.push(`/events/create?category_id=${category?.id}`);
  };

  const handleEditCategory = () => {
    router.push(`/event-categories/${category?.id}/edit`);
  };

  const handleBackToCategories = () => {
    router.push('/event-categories');
  };

  const getAttendanceTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'success';
      case 'general': return 'warning';
      case 'none': return 'secondary';
      default: return 'default';
    }
  };

  const getRecurrencePatternLabel = (pattern: string) => {
    switch (pattern) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return pattern;
    }
  };

  const tableColumns = [
    {
      key: 'title',
      label: 'Event',
      render: (value: any, event: Event) => (
        <div>
          <div className="font-medium">{event.title}</div>
          {event.description && (
            <div className="text-sm text-gray-500">{event.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date & Time',
      render: (value: any, event: Event) => (
        <div className="text-sm">
          {event.start_date ? (
            <div>
              <div className="font-medium">
                {new Date(event.start_date).toLocaleDateString()}
              </div>
              <div className="text-gray-500">
                {new Date(event.start_date).toLocaleTimeString()}
                {event.end_date && ` - ${new Date(event.end_date).toLocaleTimeString()}`}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">No date set</span>
          )}
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: any, event: Event) => (
        <div className="text-sm">
          {event.location || 'No location specified'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, event: Event) => (
        <StatusBadge
          status={event.status}
          variant={event.status === 'published' ? 'success' : 
                  event.status === 'draft' ? 'warning' : 
                  event.status === 'cancelled' ? 'danger' : 'default'}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, event: Event) => (
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-700 text-sm p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={() => router.push(`/events/${event.id}`)}
            title="View Event"
          >
            <i className="fas fa-eye"></i>
          </button>
          <button 
            className="text-green-600 hover:text-green-700 text-sm p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
            onClick={() => router.push(`/events/${event.id}/edit`)}
            title="Edit Event"
          >
            <i className="fas fa-edit"></i>
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <>>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
       </>
    );
  }

  if (!category) {
    return (
      <>>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Category Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The event category you're looking for doesn't exist.
          </p>
          <Button onClick={handleBackToCategories}>
            Back to Categories
          </Button>
        </div>
       </>
    );
  }

  return (
    <>>
      <div className="space-y-6">
        <PageHeader
          title={category.name}
          description={category.description || 'Event category details'}
          action={
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={handleBackToCategories}>
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Categories
              </Button>
              <Button variant="secondary" onClick={handleEditCategory}>
                <i className="fas fa-edit mr-2"></i>
                Edit Category
              </Button>
              {category.is_recurring && (
                <Button onClick={handleGenerateEvents}>
                  <i className="fas fa-magic mr-2"></i>
                  Generate Events
                </Button>
              )}
              <Button onClick={handleCreateEvent}>
                <i className="fas fa-plus mr-2"></i>
                Create Event
              </Button>
            </div>
          }
        />

        {/* Category Details */}
        <ContentCard>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-gray-600">Color: {category.color}</span>
                  </div>
                  {category.icon && (
                    <div className="flex items-center space-x-2">
                      <i className={`${category.icon} text-gray-600`}></i>
                      <span className="text-sm text-gray-600">Icon: {category.icon}</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    Created: {new Date(category.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <StatusBadge
                      status={category.is_active ? 'active' : 'inactive'}
                      variant={category.is_active ? 'success' : 'secondary'}
                    />
                    <span className="text-sm text-gray-600">Status</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CategoryBadge
                      category={category.attendance_type}
                      variant={getAttendanceTypeColor(category.attendance_type)}
                    />
                    <span className="text-sm text-gray-600">Attendance Type</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge
                      status={category.is_recurring ? 'recurring' : 'one-time'}
                      variant={category.is_recurring ? 'warning' : 'secondary'}
                    />
                    <span className="text-sm text-gray-600">Recurring</span>
                  </div>
                </div>
              </div>
            </div>

            {category.is_recurring && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Recurrence Settings</h3>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Pattern: {getRecurrencePatternLabel(category.recurrence_pattern || '')}
                    </div>
                    {category.recurrence_settings?.interval && (
                      <div className="text-sm text-gray-600">
                        Interval: {category.recurrence_settings.interval}
                      </div>
                    )}
                    {category.recurrence_settings?.weekdays && (
                      <div className="text-sm text-gray-600">
                        Weekdays: {category.recurrence_settings.weekdays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Default Settings */}
          {(category.default_start_time || category.default_duration || category.default_location || category.default_description) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Default Event Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.default_start_time && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Default Start Time</label>
                    <div className="text-sm text-gray-600">{category.default_start_time}</div>
                  </div>
                )}
                {category.default_duration && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Default Duration</label>
                    <div className="text-sm text-gray-600">{category.default_duration} minutes</div>
                  </div>
                )}
                {category.default_location && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Default Location</label>
                    <div className="text-sm text-gray-600">{category.default_location}</div>
                  </div>
                )}
                {category.default_description && (
                  <div className="col-span-full">
                    <label className="text-sm font-medium text-gray-700">Default Description</label>
                    <div className="text-sm text-gray-600">{category.default_description}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </ContentCard>

        {/* Category Events */}
        <ContentCard>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-4">Events in this Category</h3>
            <div className="flex justify-between items-center mb-4">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search events..."
                onSearch={loadCategoryEvents}
              />
              <SelectInput
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                className="w-48"
              />
            </div>
          </div>

          <DataTable
            data={events}
            columns={tableColumns}
            pagination={{
              currentPage: pagination.current_page,
              totalPages: pagination.last_page,
              totalItems: pagination.total,
              perPage: pagination.per_page,
              onPageChange: (page) => setPagination(prev => ({ ...prev, current_page: page })),
              onPerPageChange: (perPage) => setPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }))
            }}
            loading={isLoadingEvents}
            emptyMessage="No events found in this category"
          />
        </ContentCard>
      </div>
     </>
  );
} 