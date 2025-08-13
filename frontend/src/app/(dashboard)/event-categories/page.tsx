"use client";
import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  SearchInput, 
  SelectInput, 
  ViewToggle, 
  DataGrid, 
  ContentCard,
  StatusBadge,
  Button,
  DataTable,
  Modal,
  FormField,
  TextInput,
  TextArea,
  ColorInput,
  ToggleSwitch
} from "@/components/ui";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { EventCategory } from "@/interfaces/events";
import { EventCategoriesService, EventCategoryFilters } from "@/services/eventCategories";
import { useAuth } from "@/contexts/AuthContext";

interface EventCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: EventCategory;
  onSuccess: (category: EventCategory) => void;
}

const EventCategoryModal: React.FC<EventCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSuccess
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '',
    attendance_type: 'individual' as 'individual' | 'general' | 'none',
    is_active: true,
    is_recurring: false,
    recurrence_pattern: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurrence_settings: { interval: 1, weekdays: [1], day_of_month: 1 } as Record<string, any>,
    default_start_time: '',
    default_duration: 60,
    default_location: '',
    default_description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color,
        icon: category.icon || '',
        attendance_type: category.attendance_type,
        is_active: category.is_active,
        is_recurring: category.is_recurring,
        recurrence_pattern: category.recurrence_pattern || 'weekly',
        recurrence_settings: category.recurrence_settings || { interval: 1, weekdays: [1], day_of_month: 1 },
        default_start_time: category.default_start_time || '',
        default_duration: category.default_duration || 60,
        default_location: category.default_location || '',
        default_description: category.default_description || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: '',
        attendance_type: 'individual',
        is_active: true,
        is_recurring: false,
        recurrence_pattern: 'weekly',
        recurrence_settings: { interval: 1, weekdays: [1], day_of_month: 1 },
        default_start_time: '',
        default_duration: 60,
        default_location: '',
        default_description: ''
      });
    }
    setErrors({});
  }, [category]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      let response;
      if (category) {
        response = await EventCategoriesService.updateEventCategory(category.id, formData);
      } else {
        response = await EventCategoriesService.createEventCategory(formData);
      }
      
      if (response.success) {
        onSuccess(response.data);
      }
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.message || 'An error occurred' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRecurrenceSettingsFields = () => {
    switch (formData.recurrence_pattern) {
      case 'daily':
        return (
          <FormField label="Interval (days)">
            <TextInput
              type="number"
              min="1"
              value={String(formData.recurrence_settings.interval || 1)}
              onChange={(e) => handleInputChange('recurrence_settings', {
                ...formData.recurrence_settings,
                interval: parseInt(e.target.value)
              })}
            />
          </FormField>
        );
      
      case 'weekly':
        return (
          <div className="space-y-4">
            <FormField label="Interval (weeks)">
              <TextInput
                type="number"
                min="1"
                value={String(formData.recurrence_settings.interval || 1)}
                onChange={(e) => handleInputChange('recurrence_settings', {
                  ...formData.recurrence_settings,
                  interval: parseInt(e.target.value)
                })}
              />
            </FormField>
            <FormField label="Weekdays">
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <label key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.recurrence_settings.weekdays?.includes(index) || false}
                      onChange={(e) => {
                        const weekdays = formData.recurrence_settings.weekdays || [];
                        if (e.target.checked) {
                          weekdays.push(index);
                        } else {
                          const idx = weekdays.indexOf(index);
                          if (idx > -1) weekdays.splice(idx, 1);
                        }
                        handleInputChange('recurrence_settings', {
                          ...formData.recurrence_settings,
                          weekdays: weekdays.sort()
                        });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </FormField>
          </div>
        );
      
      case 'monthly':
        return (
          <div className="space-y-4">
            <FormField label="Interval (months)">
              <TextInput
                type="number"
                min="1"
                value={String(formData.recurrence_settings.interval || 1)}
                onChange={(e) => handleInputChange('recurrence_settings', {
                  ...formData.recurrence_settings,
                  interval: parseInt(e.target.value)
                })}
              />
            </FormField>
            <FormField label="Day of month">
              <TextInput
                type="number"
                min="1"
                max="31"
                value={String(formData.recurrence_settings.day_of_month || 1)}
                onChange={(e) => handleInputChange('recurrence_settings', {
                  ...formData.recurrence_settings,
                  day_of_month: parseInt(e.target.value)
                })}
              />
            </FormField>
          </div>
        );
      
      case 'yearly':
        return (
          <FormField label="Interval (years)">
            <TextInput
              type="number"
              min="1"
              value={String(formData.recurrence_settings.interval || 1)}
              onChange={(e) => handleInputChange('recurrence_settings', {
                ...formData.recurrence_settings,
                interval: parseInt(e.target.value)
              })}
            />
          </FormField>
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Event Category' : 'Create Event Category'}
      size="xxl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name" error={errors.name}>
            <TextInput
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter category name"
            />
          </FormField>

          <FormField label="Color">
            <ColorInput
              value={formData.color}
              onChange={(color) => handleInputChange('color', color)}
            />
          </FormField>
        </div>

        <FormField label="Description" error={errors.description}>
          <TextArea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter category description"
            rows={3}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Icon (FontAwesome class)" error={errors.icon}>
            <TextInput
              value={formData.icon}
              onChange={(e) => handleInputChange('icon', e.target.value)}
              placeholder="fas fa-calendar"
            />
          </FormField>

          <FormField label="Attendance Type" error={errors.attendance_type}>
            <SelectInput
              value={formData.attendance_type}
              onChange={(value) => handleInputChange('attendance_type', value)}
              options={[
                { value: 'individual', label: 'Individual Attendance' },
                { value: 'general', label: 'General Attendance' },
                { value: 'none', label: 'No Attendance' }
              ]}
            />
          </FormField>
        </div>

        <div className="space-y-4">
          <FormField label="Category Settings">
            <div className="space-y-3">
              <ToggleSwitch
                checked={formData.is_active}
                onChange={(checked) => handleInputChange('is_active', checked)}
                label="Active"
              />
              
              <ToggleSwitch
                checked={formData.is_recurring}
                onChange={(checked) => handleInputChange('is_recurring', checked)}
                label="Recurring Category"
              />
            </div>
          </FormField>

          {formData.is_recurring && (
            <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
              <FormField label="Recurrence Pattern" error={errors.recurrence_pattern}>
                <SelectInput
                  value={formData.recurrence_pattern}
                  onChange={(value) => handleInputChange('recurrence_pattern', value)}
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' }
                  ]}
                />
              </FormField>

              {getRecurrenceSettingsFields()}
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Default Event Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Default Start Time">
              <TextInput
                type="time"
                value={formData.default_start_time}
                onChange={(e) => handleInputChange('default_start_time', e.target.value + ':00')}
              />
            </FormField>

            <FormField label="Default Duration (minutes)">
              <TextInput
                type="number"
                min="15"
                value={String(formData.default_duration)}
                onChange={(e) => handleInputChange('default_duration', parseInt(e.target.value))}
                placeholder="60"
              />
            </FormField>
          </div>

          <FormField label="Default Location">
            <TextInput
              value={formData.default_location}
              onChange={(e) => handleInputChange('default_location', e.target.value)}
              placeholder="Enter default location"
            />
          </FormField>

          <FormField label="Default Description">
            <TextArea
              value={formData.default_description}
              onChange={(e) => handleInputChange('default_description', e.target.value)}
              placeholder="Enter default event description"
              rows={2}
            />
          </FormField>
        </div>

        {errors.general && (
          <div className="text-red-600 text-sm">{errors.general}</div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : (category ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default function EventCategoriesPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "calendar" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventCategory | undefined>();
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  useEffect(() => {
    loadCategories();
  }, [statusFilter, attendanceFilter, pagination.current_page]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const filters: EventCategoryFilters = {
        per_page: pagination.per_page
      };

      if (statusFilter !== 'all') {
        filters.is_active = statusFilter === 'active';
      }

      if (attendanceFilter !== 'all') {
        filters.attendance_type = attendanceFilter as 'individual' | 'general' | 'none';
      }

      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await EventCategoriesService.getEventCategories(filters);
      if (response.success) {
        setCategories(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total
        });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: EventCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCategorySuccess = (category: EventCategory) => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
    } else {
      setCategories(prev => [category, ...prev]);
    }
    setIsModalOpen(false);
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await EventCategoriesService.deleteEventCategory(categoryId);
        setCategories(prev => prev.filter(c => c.id !== categoryId));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleToggleStatus = async (category: EventCategory) => {
    try {
      const response = await EventCategoriesService.toggleStatus(category.id);
      if (response.success) {
        setCategories(prev => prev.map(c => 
          c.id === category.id ? response.data : c
        ));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleGenerateEvents = async (category: EventCategory) => {
    if (!category.is_recurring) {
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
        alert(`Successfully generated events!`);
      }
    } catch (error: any) {
      alert(`Error generating events: ${error.message}`);
    }
  };

  const getCategoryStatusColor = (status: boolean) => {
    return status ? 'bg-green-500' : 'bg-red-500';
  };

  const getCategoryTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'bg-blue-500';
      case 'general': return 'bg-purple-500';
      case 'none': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // DataTable columns configuration
  const tableColumns = [
    {
      key: 'name',
      label: 'Category',
      sortable: true,
      render: (value: any, category: EventCategory) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{category.description}</div>
        </div>
      )
    },
    {
      key: 'attendance_type',
      label: 'Attendance Type',
      sortable: true,
      render: (value: any, category: EventCategory) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          category.attendance_type === 'individual' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
          category.attendance_type === 'general' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
        }`}>
          {category.attendance_type.charAt(0).toUpperCase() + category.attendance_type.slice(1)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: any, category: EventCategory) => (
        <StatusBadge status={category.is_active ? 'active' : 'inactive'} />
      )
    },
    {
      key: 'recurring',
      label: 'Recurring',
      render: (value: any, category: EventCategory) => (
        <div className="text-sm">
          {category.is_recurring ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
              <i className="fas fa-redo mr-1"></i>
              {category.recurrence_pattern}
            </span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">One-time</span>
          )}
        </div>
      )
    },
    {
      key: 'events_count',
      label: 'Events',
      render: (value: any, category: EventCategory) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {category.events?.length || 0} events
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, category: EventCategory) => (
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-700 text-sm p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={() => handleEditCategory(category)}
            title="Edit Category"
          >
            <i className="fas fa-edit"></i>
          </button>
          
          {category.is_recurring && (
            <button 
              className="text-green-600 hover:text-green-700 text-sm p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={() => handleGenerateEvents(category)}
              title="Generate Events"
            >
              <i className="fas fa-magic"></i>
            </button>
          )}
          
          <button 
            className="text-orange-600 hover:text-orange-700 text-sm p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20"
            onClick={() => handleToggleStatus(category)}
            title={category.is_active ? 'Deactivate' : 'Activate'}
          >
            <i className={`fas fa-${category.is_active ? 'pause' : 'play'}`}></i>
          </button>
          
          <button 
            className="text-red-600 hover:text-red-700 text-sm p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => handleDeleteCategory(category.id)}
            title="Delete Category"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      )
    }
  ];

  // DataTable filters configuration
  const tableFilters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      key: 'attendance_type',
      label: 'Attendance Type',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'individual', label: 'Individual' },
        { value: 'general', label: 'General' },
        { value: 'none', label: 'None' }
      ]
    }
  ];

  // Handle filters change
  const handleFiltersChange = (filters: Record<string, any>) => {
    // Apply filters to categories
    const filteredCategories = categories.filter((category) => {
      const matchesStatus = !filters.status || filters.status === 'all' || 
        (filters.status === 'active' ? category.is_active : !category.is_active);
      const matchesType = !filters.attendance_type || filters.attendance_type === 'all' || 
        category.attendance_type === filters.attendance_type;
      
      return matchesStatus && matchesType;
    });
    
    // Update pagination
    setPagination(prev => ({
      ...prev,
      current_page: 1,
      total: filteredCategories.length
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const handlePerPageChange = (perPage: number) => {
    setPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }));
  };

  // Handle sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Apply sorting to categories
  const sortedCategories = useMemo(() => {
    if (!sortConfig) return categories;
    
    return [...categories].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof EventCategory];
      const bValue = b[sortConfig.key as keyof EventCategory];
      
      if (aValue === undefined || bValue === undefined) return 0;
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [categories, sortConfig]);

  const filteredCategories = sortedCategories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const viewToggleOptions = [
    { value: "table", label: "Table", icon: "fas fa-table" },
    { value: "grid", label: "Grid", icon: "fas fa-th" },
    { value: "calendar", label: "Calendar", icon: "fas fa-calendar" },
  ];

  const renderCategoryCard = (category: EventCategory) => (
    <div className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${getCategoryTypeColor(category.attendance_type)} rounded-xl flex items-center justify-center`}>
          <i className={`${category.icon || 'fas fa-tag'} text-white text-xl`}></i>
        </div>
        <StatusBadge status={category.is_active ? 'active' : 'inactive'} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{category.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <i className="fas fa-users text-gray-400 mr-2"></i>
          <span className="text-gray-600">
            {category.attendance_type.charAt(0).toUpperCase() + category.attendance_type.slice(1)} Attendance
          </span>
        </div>
        <div className="flex items-center text-sm">
          <i className="fas fa-calendar text-gray-400 mr-2"></i>
          <span className="text-gray-600">
            {category.is_recurring ? `${category.recurrence_pattern} recurring` : 'One-time'}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <i className="fas fa-tag text-gray-400 mr-2"></i>
          <span className="text-gray-600">
            {category.events?.length || 0} events
          </span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
          <span className="text-gray-600">Color</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-700 text-sm"
            onClick={() => handleEditCategory(category)}
          >
            <i className="fas fa-edit"></i>
          </button>
          
          {category.is_recurring && (
            <button 
              className="text-green-600 hover:text-green-700 text-sm"
              onClick={() => handleGenerateEvents(category)}
              title="Generate Events"
            >
              <i className="fas fa-magic"></i>
            </button>
          )}
          
          <button 
            className="text-orange-600 hover:text-orange-700 text-sm"
            onClick={() => handleToggleStatus(category)}
            title={category.is_active ? 'Deactivate' : 'Activate'}
          >
            <i className={`fas fa-${category.is_active ? 'pause' : 'play'}`}></i>
          </button>
          
          <button 
            className="text-red-600 hover:text-red-700 text-sm"
            onClick={() => handleDeleteCategory(category.id)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );

  const handleViewModeChange = (value: string) => {
    setViewMode(value as "grid" | "calendar" | "table");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Event Categories"
        description="Manage event categories and their recurrence settings. Create categories to organize your events."
        actionButton={{
          text: "Create Category",
          icon: "fas fa-tag",
          onClick: handleCreateCategory
        }}
      />

      {/* Status Summary */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center text-blue-800 dark:text-blue-200">
          <i className="fas fa-info-circle mr-2"></i>
          <span className="text-sm">
            <strong>Tip:</strong> Create event categories to organize your events. Configure recurring patterns to automatically generate events.
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <i className="fas fa-tags text-blue-600 dark:text-blue-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <i className="fas fa-check-circle text-green-600 dark:text-green-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {categories.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <i className="fas fa-pause-circle text-red-600 dark:text-red-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {categories.filter(c => !c.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <i className="fas fa-redo text-purple-600 dark:text-purple-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recurring</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {categories.filter(c => c.is_recurring).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <i className="fas fa-calendar text-orange-600 dark:text-orange-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Events</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {categories.reduce((total, c) => total + (c.events?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <SearchInput
            placeholder="Search categories..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <SelectInput
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
        />
        <SelectInput
          value={attendanceFilter}
          onChange={setAttendanceFilter}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'individual', label: 'Individual' },
            { value: 'general', label: 'General' },
            { value: 'none', label: 'None' }
          ]}
        />
      </div>

      {/* View Toggle */}
      <ViewToggle
        value={viewMode}
        onChange={handleViewModeChange}
        options={viewToggleOptions}
        count={filteredCategories.length}
        countLabel="categories"
      />

      {/* Categories Table View */}
      {viewMode === "table" && (
        <DataTable
          columns={tableColumns}
          data={filteredCategories}
          filters={tableFilters}
          pagination={{
            currentPage: pagination.current_page,
            totalPages: pagination.last_page,
            totalItems: pagination.total,
            perPage: pagination.per_page,
            onPageChange: handlePageChange,
            onPerPageChange: handlePerPageChange
          }}
          sorting={{
            sortConfig,
            onSort: handleSort
          }}
          onFiltersChange={handleFiltersChange}
          loading={isLoading}
          emptyMessage="No event categories found. Create your first category to get started."
          className="mb-6"
        />
      )}

      {/* Categories Grid */}
      {viewMode === "grid" && (
        <DataGrid
          data={filteredCategories}
          renderCard={renderCategoryCard}
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
              // For categories, we'll show them on the first day of each month
              // since categories don't have specific dates like events
              const dayCategories = day === 1 ? filteredCategories.slice(0, 3) : [];
              
              return (
                <div
                  key={day}
                  className="p-2 border border-gray-200 min-h-[80px] hover:bg-gray-50 cursor-pointer"
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                  {dayCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`text-xs p-1 rounded mb-1 text-white ${getCategoryTypeColor(category.attendance_type)}`}
                      title={category.name}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </ContentCard>
      )}

      {/* Event Category Modal */}
      <EventCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSuccess={handleCategorySuccess}
      />
    </DashboardLayout>
  );
} 