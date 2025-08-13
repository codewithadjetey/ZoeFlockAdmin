"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/shared';
import { 
  TextInput, 
  Textarea, 
  SelectInput, 
  ToggleSwitch, 
  Button,
  FormField, 
  TextArea
} from '@/components/ui';
import { Event, CreateEventRequest, UpdateEventRequest } from '@/interfaces/events';
import { EventsService } from '@/services/events';
import { EntitiesService } from '@/services/entities';
import { useAuth } from '@/contexts/AuthContext';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event;
  onSuccess: (event: Event) => void;
}

interface EventFormData extends Omit<CreateEventRequest, 'recurrence_pattern' | 'recurrence_settings'> {
  recurrence_pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_settings: Record<string, any>;
  status?: string;
}

export default function EventModal({ 
  isOpen, 
  onClose, 
  event, 
  onSuccess
}: EventModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<Array<{ id: number; name: string }>>([]);
  const [families, setFamilies] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    type: 'general',
    is_recurring: false,
    recurrence_pattern: 'weekly',
    recurrence_settings: {},
    recurrence_end_date: '',
    group_ids: [],
    family_ids: [],
    img_path: ''
  });

  const [errors, setErrors] = useState<{
    [key: string]: string | Record<string, string>;
  }>({});

  // Fetch entities when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEntities();
    }
  }, [isOpen]);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        start_date: event.start_date || '',
        end_date: event.end_date || '',
        location: event.location || '',
        type: event.type,
        status: event.status || 'draft',
        is_recurring: event.is_recurring,
        recurrence_pattern: event.recurrence_pattern || 'weekly',
        recurrence_settings: event.recurrence_settings || {},
        recurrence_end_date: event.recurrence_end_date || '',
        group_ids: event.groups?.map(g => g.id) || [],
        family_ids: event.families?.map(f => f.id) || [],
        img_path: event.img_path || ''
      });
    } else {
      // Set default start date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      setFormData({
        title: '',
        description: '',
        start_date: tomorrow.toISOString().slice(0, 16),
        end_date: '',
        location: '',
        type: 'general',
        status: 'draft',
        is_recurring: false,
        recurrence_pattern: 'weekly',
        recurrence_settings: {},
        recurrence_end_date: '',
        group_ids: [],
        family_ids: [],
        img_path: ''
      });
    }
    setErrors({});
  }, [event]);

  const fetchEntities = async () => {
    setIsLoadingEntities(true);
    try {
      const result = await EntitiesService.getGroupsAndFamilies();
      setGroups(result.groups);
      setFamilies(result.families);
    } catch (error) {
      console.error('Error fetching entities:', error);
    } finally {
      setIsLoadingEntities(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Start date is only required for non-recurring events
    if (!formData.is_recurring && !formData.start_date) {
      newErrors.start_date = 'Start date is required for non-recurring events';
    } else if (formData.start_date) {
      const startDate = new Date(formData.start_date);
      if (startDate <= new Date()) {
        newErrors.start_date = 'Start date must be in the future';
      }
    }

    if (formData.end_date && formData.start_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (formData.is_recurring && !formData.recurrence_pattern) {
      newErrors.recurrence_pattern = 'Recurrence pattern is required for recurring events';
    }

    if (formData.is_recurring && formData.recurrence_end_date && formData.start_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.recurrence_end_date);
      if (endDate <= startDate) {
        newErrors.recurrence_end_date = 'Recurrence end date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let result;
      
      if (event) {
        result = await EventsService.updateEvent(event.id, formData);
      } else {
        result = await EventsService.createEvent(formData);
      }

      if (result.success) {
        onSuccess(result.data);
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving event:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRecurrenceSettingsFields = () => {
    if (!formData.is_recurring) return null;

    const fields: React.ReactNode[] = [];

    // Pattern selection
    fields.push(
      <FormField key="pattern" label="Recurrence Pattern" error={errors.recurrence_pattern}>
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
    );

    // Interval
    fields.push(
      <FormField key="interval" label="Interval" error={
        typeof errors.recurrence_settings === 'object' ? errors.recurrence_settings.interval : undefined
      }>
        <TextInput
          type="number"
          min="1"
          value={formData.recurrence_settings?.interval || 1}
          onChange={(e) => handleInputChange('recurrence_settings', {
            ...formData.recurrence_settings,
            interval: parseInt(e.target.value)
          })}
          placeholder="1"
        />
      </FormField>
    );

    // Weekdays for weekly pattern
    if (formData.recurrence_pattern === 'weekly') {
      const weekdays = formData.recurrence_settings?.weekdays || [1]; // Monday by default
      fields.push(
        <FormField key="weekdays" label="Days of Week" error={
        typeof errors.recurrence_settings === 'object' ? errors.recurrence_settings.weekdays : undefined
      }>
          <div className="flex gap-2 flex-wrap">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <label key={day} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={weekdays.includes(index + 1)}
                  onChange={(e) => {
                    const newWeekdays = e.target.checked
                      ? [...weekdays, index + 1]
                      : weekdays.filter((d: number) => d !== index + 1);
                    handleInputChange('recurrence_settings', {
                      ...formData.recurrence_settings,
                      weekdays: newWeekdays
                    });
                  }}
                />
                {day}
              </label>
            ))}
          </div>
        </FormField>
      );
    }

    // Day of month for monthly pattern
    if (formData.recurrence_pattern === 'monthly') {
      fields.push(
        <FormField key="dayOfMonth" label="Day of Month" error={
        typeof errors.recurrence_settings === 'object' ? errors.recurrence_settings.day_of_month : undefined
      }>
          <TextInput
            type="number"
            min="1"
            max="31"
            value={formData.recurrence_settings?.day_of_month || 1}
            onChange={(e) => handleInputChange('recurrence_settings', {
              ...formData.recurrence_settings,
              day_of_month: parseInt(e.target.value)
            })}
            placeholder="1"
          />
        </FormField>
      );
    }

    // Recurrence end date
    fields.push(
              <FormField key="recurrenceEndDate" label="Recurrence End Date" error={errors.recurrence_end_date}>
          <TextInput
            type="datetime-local"
            value={formData.recurrence_end_date || ''}
            onChange={(e) => handleInputChange('recurrence_end_date', e.target.value)}
            placeholder="Leave empty for no end date"
          />
        </FormField>
    );

    return fields;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          {event ? 'Edit Event' : 'Create New Events'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Title" error={errors.title}>
              <TextInput
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Event title"
              />
            </FormField>

            <FormField label="Type" error={errors.type}>
              <SelectInput
                value={formData.type}
                onChange={(value) => handleInputChange('type', value)}
                options={[
                  { value: 'general', label: 'General' },
                  { value: 'group', label: 'Group' },
                  { value: 'family', label: 'Family' }
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Status" error={errors.status}>
              <SelectInput
                value={formData.status || 'draft'}
                onChange={(value) => handleInputChange('status', value)}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' }
                ]}
              />
            </FormField>

            <FormField label="Location" error={errors.location}>
              <TextInput
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Event location"
              />
            </FormField>
          </div>

          <FormField label="Description" error={errors.description}>
            <TextArea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Event description"
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label={`Start Date & Time${formData.is_recurring ? ' (Optional for recurring events)' : ''}`}
              error={errors.start_date}
            >
              <TextInput
                type="datetime-local"
                value={formData.start_date || ''}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
              />
              {formData.is_recurring && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Leave empty to start recurring events from today
                </p>
              )}
            </FormField>

            <FormField label="End Date & Time" error={errors.end_date}>
              <TextInput
                type="datetime-local"
                value={formData.end_date || ''}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                placeholder="Leave empty for no end time"
              />
            </FormField>
          </div>

          {/* Recurring Event Settings */}
          <div className="border-t pt-6">
            <FormField label="Recurring Event">
              <ToggleSwitch
                checked={formData.is_recurring || false}
                onChange={(checked) => handleInputChange('is_recurring', checked)}
                label="Make this event recurring"
              />
            </FormField>

            {formData.is_recurring && (
              <div className="ml-6 mt-4 space-y-4">
                {getRecurrenceSettingsFields()}
              </div>
            )}
          </div>

          {/* Group and Family Associations */}
          {(formData.type === 'group' || formData.type === 'family') && (
            <div className="border-t pt-6">
              {formData.type === 'group' && (
                <FormField label="Associated Groups" error={errors.group_ids}>
                  {isLoadingEntities ? (
                    <div className="text-gray-500 text-sm">Loading groups...</div>
                  ) : groups.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {groups.map(group => (
                        <label key={group.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.group_ids?.includes(group.id)}
                            onChange={(e) => {
                              const newGroupIds = e.target.checked
                                ? [...(formData.group_ids || []), group.id]
                                : (formData.group_ids || []).filter(id => id !== group.id);
                              handleInputChange('group_ids', newGroupIds);
                            }}
                          />
                          {group.name}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No groups available</div>
                  )}
                </FormField>
              )}

              {formData.type === 'family' && (
                <FormField label="Associated Families" error={errors.family_ids}>
                  {isLoadingEntities ? (
                    <div className="text-gray-500 text-sm">Loading families...</div>
                  ) : families.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {families.map(family => (
                        <label key={family.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.family_ids?.includes(family.id)}
                            onChange={(e) => {
                              const newFamilyIds = e.target.checked
                                ? [...(formData.family_ids || []), family.id]
                                : (formData.family_ids || []).filter(id => id !== family.id);
                              handleInputChange('family_ids', newFamilyIds);
                            }}
                          />
                          {family.name}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No families available</div>
                  )}
                </FormField>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
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
              {isLoading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 