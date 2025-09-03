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
import { 
  formatTimeForInput, 
  formatDateForInput, 
  formatDateTimeLocalForInput,
  formatDateTimeForBackend,
  formatDateForBackend
} from "@/utils/helpers";
import QRCode from 'react-qr-code';
import { useRef } from 'react';
import ReactDOM from 'react-dom';

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
    recurrence_settings: { interval: 1, weekdays: [1], day_of_month: 1 } as { interval: number; weekdays: number[]; day_of_month: number },
    default_start_time: '',
    start_date_time: '',
    end_date_time: '',
    recurrence_start_date: '',
    recurrence_end_date: '',
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
        default_start_time: formatTimeForInput(category.default_start_time),
        start_date_time: formatDateTimeLocalForInput(category.start_date_time),
        end_date_time: formatDateTimeLocalForInput(category.end_date_time),
        recurrence_start_date: formatDateForInput(category.recurrence_start_date),
        recurrence_end_date: formatDateForInput(category.recurrence_end_date),
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
        start_date_time: '',
        end_date_time: '',
        recurrence_start_date: '',
        recurrence_end_date: '',
        default_duration: 60,
        default_location: '',
        default_description: ''
      });
    }
    setErrors({});
  }, [category]);

  const handleInputChange = (field: string, value: any) => {
    // Clear non-required fields when switching event types
    if (field === 'is_recurring') {
      if (value === true) {
        // Switching to recurring: clear one-time specific fields
        setFormData(prev => ({
          ...prev,
          [field]: value,
          start_date_time: '',
          end_date_time: '',
          recurrence_start_date: '',
          recurrence_end_date: ''
        }));
      } else {
        // Switching to one-time: clear recurring specific fields
        setFormData(prev => ({
          ...prev,
          [field]: value,
          default_start_time: '',
          default_duration: 60,
          recurrence_pattern: 'weekly',
          recurrence_settings: { interval: 1, weekdays: [1], day_of_month: 1 },
          recurrence_start_date: '',
          recurrence_end_date: ''
        }));
      }
    } else {
      // Normal field update
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Convert datetime-local values to backend format
      const submitData = { ...formData };
      
      if (!submitData.is_recurring) {
        // For one-time events, convert datetime-local to Y-m-d H:i:s format
        if (submitData.start_date_time) {
          submitData.start_date_time = formatDateTimeForBackend(submitData.start_date_time);
        }
        
        if (submitData.end_date_time) {
          submitData.end_date_time = formatDateTimeForBackend(submitData.end_date_time);
        }
        
        // Clear recurring fields for one-time events
        submitData.recurrence_start_date = '';
        submitData.recurrence_end_date = '';
        submitData.default_start_time = '';
        submitData.default_duration = 0;
      } else {
        // For recurring events, convert date to Y-m-d format
        if (submitData.recurrence_start_date) {
          submitData.recurrence_start_date = formatDateForBackend(submitData.recurrence_start_date);
        }
        
        if (submitData.recurrence_end_date) {
          submitData.recurrence_end_date = formatDateForBackend(submitData.recurrence_end_date);
        }
        
        // Clear one-time fields for recurring events
        submitData.start_date_time = '';
        submitData.end_date_time = '';
      }

      let response;
      if (category) {
        response = await EventCategoriesService.updateEventCategory(category.id, submitData);
      } else {
        response = await EventCategoriesService.createEventCategory(submitData);
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

          <FormField label="Color" error={errors.color}>
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
          
          {/* Time and Duration Settings - Only for recurring categories */}
          {formData.is_recurring && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Default Start Time" error={errors.default_start_time}>
                <TextInput
                  type="time"
                  value={formData.default_start_time}
                  onChange={(e) => handleInputChange('default_start_time', e.target.value + ':00')}
                />
              </FormField>

              <FormField label="Default Duration (minutes)" error={errors.default_duration}>
                <TextInput
                  type="number"
                  min="15"
                  value={String(formData.default_duration)}
                  onChange={(e) => handleInputChange('default_duration', parseInt(e.target.value))}
                  placeholder="60"
                />
              </FormField>
            </div>
          )}

          {/* Date Settings - Conditional based on event type */}
          {!formData.is_recurring && (
            <div className="space-y-4">
              <FormField label="Start Date & Time (for one-time events)" error={errors.start_date_time}>
                <TextInput
                  type="datetime-local"
                  value={formData.start_date_time}
                  onChange={(e) => handleInputChange('start_date_time', e.target.value)}
                  placeholder="YYYY-MM-DDTHH:MM"
                />
              </FormField>
              
              <FormField label="End Date & Time (for one-time events)" error={errors.end_date_time}>
                <TextInput
                  type="datetime-local"
                  value={formData.end_date_time}
                  onChange={(e) => handleInputChange('end_date_time', e.target.value)}
                  placeholder="YYYY-MM-DDTHH:MM"
                />
              </FormField>
            </div>
          )}

          {formData.is_recurring && (
            <div className="space-y-4">
              <FormField label="Recurrence Start Date" error={errors.recurrence_start_date}>
                <TextInput
                  type="date"
                  value={formData.recurrence_start_date}
                  onChange={(e) => handleInputChange('recurrence_start_date', e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              </FormField>

              <FormField label="Recurrence End Date (optional)" error={errors.recurrence_end_date}>
                <TextInput
                  type="date"
                  value={formData.recurrence_end_date}
                  onChange={(e) => handleInputChange('recurrence_end_date', e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              </FormField>
            </div>
          )}

          <FormField label="Default Location" error={errors.default_location}>
            <TextInput
              value={formData.default_location}
              onChange={(e) => handleInputChange('default_location', e.target.value)}
              placeholder="Enter default location"
            />
          </FormField>

          <FormField label="Default Description" error={errors.default_description}>
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
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCategory, setQrCategory] = useState<EventCategory | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

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
    console.log('Generate events clicked for category:', category);
    console.log('Category is recurring:', category.is_recurring);
    console.log('Category start_date_time:', category.start_date_time);
    
    if (category.is_recurring) {
      // Handle recurring events
      const count = prompt('How many events to generate?', '10');
      if (!count) return;

      const autoPublish = confirm('Auto-publish generated events?');

      try {
        const response = await EventCategoriesService.generateEvents(category.id, {
          count: parseInt(count),
          auto_publish: autoPublish
        });

        if (response.success) {
          alert(`Successfully generated recurring events!`);
        }
      } catch (error: any) {
        alert(`Error generating recurring events: ${error.message}`);
      }
    } else {
      // Handle one-time events
      console.log('Handling one-time event generation');
      
      // Check if event already exists
      if (category.events && category.events.length > 0) {
        alert('An event already exists for this one-time category. One-time categories can only generate one event.');
        return;
      }

      // Check if start_date_time and end_date_time are configured
      if (!category.start_date_time || !category.end_date_time) {
        alert('This category does not have start and end date/time configured. Please configure the event schedule first.');
        return;
      }

      const autoPublish = confirm('Auto-publish the generated event?');

      try {
        const response = await EventCategoriesService.generateOneTimeEvent(category.id, {
          auto_publish: autoPublish
        });

        if (response.success) {
          alert('Successfully generated one-time event!');
          // Refresh the categories to show the new event
          loadCategories();
        }
      } catch (error: any) {
        alert(`Error generating one-time event: ${error.message}`);
      }
    }
  };

  const handleShowQr = (category: EventCategory) => {
    setQrCategory(category);
    setQrModalOpen(true);
  };

  const handleDownloadQr = () => {
    if (!qrCategory) return;
    const qrValue = `${window.location.origin}/first-timer/${getEncryptedId(qrCategory.id)}`;
    // Create a hidden canvas for high-res QR code
    const canvas = document.createElement('canvas');
    const size = 800;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    // Use react-qr-code to render SVG, then draw to canvas
    // Create a temporary SVG element
    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);
    import('react-dom/client').then(ReactDOM => {
      ReactDOM.createRoot(tempDiv).render(
        React.createElement(QRCode, { value: qrValue, size: size })
      );
      setTimeout(() => {
        const svg = tempDiv.querySelector('svg');
        if (!svg) {
          document.body.removeChild(tempDiv);
          return;
        }
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const img = new window.Image();
        img.onload = function () {
          ctx.drawImage(img, 0, 0, size, size);
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngFile;
          downloadLink.download = `event-category-qr.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          document.body.removeChild(tempDiv);
        };
        img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
      }, 100); // Wait for SVG to render
    });
  };

  const getEncryptedId = (id: number) => {
    // Placeholder: use base64 encoding for now
    return btoa(String(id));
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

  // Table columns configuration
  const tableColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value: any, category: EventCategory) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg mr-3 flex items-center justify-center" style={{ backgroundColor: category.color }}>
            <i className={`${category.icon || 'fas fa-tag'} text-white text-sm`}></i>
          </div>
          <div>
            <div className="font-medium text-gray-900">{category.name}</div>
            <div className="text-sm text-gray-500">{category.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'attendance_type',
      label: 'Attendance Type',
      sortable: true,
      render: (value: any, category: EventCategory) => (
        <span className="capitalize">{category.attendance_type}</span>
      )
    },
    {
      key: 'is_recurring',
      label: 'Type',
      sortable: true,
      render: (value: any, category: EventCategory) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          category.is_recurring 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          {category.is_recurring ? 'Recurring' : 'One-time'}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value: any, category: EventCategory) => (
        <StatusBadge status={category.is_active ? 'active' : 'inactive'} />
      )
    },
    {
      key: 'events_count',
      label: 'Events',
      sortable: true,
      render: (value: any, category: EventCategory) => (
        <span className="text-gray-600">{category.events?.length || 0}</span>
      )
    },
    {
      key: 'qr',
      label: 'QR Code',
      sortable: false,
      render: (value: any, category: EventCategory) => (
        <Button size="sm" variant="outline" onClick={() => handleShowQr(category)}>
          <i className="fas fa-qrcode mr-2"></i> QR Code
        </Button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value: any, category: EventCategory) => (
        <div className="flex items-center space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
            onClick={() => handleEditCategory(category)}
            title="Edit Category"
          >
            <i className="fas fa-edit text-sm"></i>
          </button>
          
          <button 
            className={`px-2 py-1 rounded text-xs font-medium ${
              category.is_recurring 
                ? 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100' 
                : 'text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100'
            } ${!category.is_recurring && (!category.start_date_time || !category.end_date_time || (category.events && category.events.length > 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleGenerateEvents(category)}
            title={category.is_recurring ? 'Generate Events' : 'Generate Event'}
            disabled={!category.is_recurring && (!category.start_date_time || !category.end_date_time || (category.events && category.events.length > 0))}
          >
            <i className={`fas ${category.is_recurring ? 'fa-magic' : 'fa-calendar-plus'} mr-1`}></i>
            {category.is_recurring ? 'Events' : 'Event'}
          </button>
          
          <button 
            className="text-orange-600 hover:text-orange-700 p-1 rounded hover:bg-orange-50"
            onClick={() => handleToggleStatus(category)}
            title={category.is_active ? 'Deactivate' : 'Activate'}
          >
            <i className={`fas fa-${category.is_active ? 'pause' : 'play'} text-sm`}></i>
          </button>
          
          <button 
            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
            onClick={() => handleDeleteCategory(category.id)}
            title="Delete Category"
          >
            <i className="fas fa-trash text-sm"></i>
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
          
          <button 
            className={`text-sm px-2 py-1 rounded ${
              category.is_recurring 
                ? 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100' 
                : 'text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100'
            } ${!category.is_recurring && (!category.start_date_time || !category.end_date_time || (category.events && category.events.length > 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handleGenerateEvents(category)}
            title={category.is_recurring ? 'Generate Events' : 'Generate Event'}
            disabled={!category.is_recurring && (!category.start_date_time || !category.end_date_time || (category.events && category.events.length > 0))}
          >
            <i className={`fas ${category.is_recurring ? 'fa-magic' : 'fa-calendar-plus'} mr-1`}></i>
            {category.is_recurring ? 'Generate Events' : 'Generate Event'}
          </button>
          
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
        <Button size="sm" variant="outline" onClick={() => handleShowQr(category)}>
          <i className="fas fa-qrcode mr-2"></i> QR Code
        </Button>
      </div>
    </div>
  );

  const handleViewModeChange = (value: string) => {
    setViewMode(value as "grid" | "calendar" | "table");
  };

  return (
    <>
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
            <strong>Tip:</strong> Create event categories to organize your events. Configure recurring patterns or set specific dates to automatically generate events.
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

      {/* QR Code Modal */}
      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Event Category QR Code">
        {qrCategory && (
          <div className="flex flex-col items-center gap-4 p-4">
            <div ref={qrRef}>
              <QRCode value={`${window.location.origin}/first-timer/${getEncryptedId(qrCategory.id)}`} size={200} />
            </div>
            <div className="text-sm text-gray-600 break-all text-center mt-2">
              {window.location.origin}/first-timer/{getEncryptedId(qrCategory.id)}
            </div>
            <button
              className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
              onClick={handleDownloadQr}
            >
              <i className="fas fa-download mr-2"></i>Download QR Code
            </button>
          </div>
        )}
      </Modal>
    </>
  );
} 