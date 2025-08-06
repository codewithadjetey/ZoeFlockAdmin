'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { TextInput, Textarea, SelectInput, Button } from '@/components/ui';
import { GroupsService, Group } from '@/services/groups';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group?: Group | null;
  onSave: (group: Group) => void;
  mode: 'create' | 'edit';
}

const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  group,
  onSave,
  mode
}) => {
  const [formData, setFormData] = useState<Group>({
    name: '',
    description: '',
    category: '',
    max_members: 10,
    meeting_day: '',
    meeting_time: '',
    location: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState<Partial<Group>>({});

  useEffect(() => {
    if (group && mode === 'edit') {
      setFormData(group);
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        max_members: 10,
        meeting_day: '',
        meeting_time: '',
        location: '',
        status: 'Active'
      });
    }
    setErrors({});
  }, [group, mode, isOpen]);

  const categoryOptions = [
    { value: 'Ministry', label: 'Ministry' },
    { value: 'Education', label: 'Education' },
    { value: 'Prayer', label: 'Prayer' },
    { value: 'Music', label: 'Music' },
    { value: 'Fellowship', label: 'Fellowship' },
    { value: 'Outreach', label: 'Outreach' },
    { value: 'Children', label: 'Children' },
    { value: 'Youth', label: 'Youth' },
    { value: 'Seniors', label: 'Seniors' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Full', label: 'Full' },
  ];

  const dayOptions = [
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' },
  ];

  const timeOptions = [
    { value: '8:00 AM', label: '8:00 AM' },
    { value: '9:00 AM', label: '9:00 AM' },
    { value: '10:00 AM', label: '10:00 AM' },
    { value: '11:00 AM', label: '11:00 AM' },
    { value: '12:00 PM', label: '12:00 PM' },
    { value: '1:00 PM', label: '1:00 PM' },
    { value: '2:00 PM', label: '2:00 PM' },
    { value: '3:00 PM', label: '3:00 PM' },
    { value: '4:00 PM', label: '4:00 PM' },
    { value: '5:00 PM', label: '5:00 PM' },
    { value: '6:00 PM', label: '6:00 PM' },
    { value: '6:30 PM', label: '6:30 PM' },
    { value: '7:00 PM', label: '7:00 PM' },
    { value: '7:30 PM', label: '7:30 PM' },
    { value: '8:00 PM', label: '8:00 PM' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
      onSave(formData);
      onClose();
  };

  const handleInputChange = (field: keyof Group) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'max_members' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSelectChange = (field: keyof Group) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Group' : 'Edit Group'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TextInput
              label="Group Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="Enter group name"
              error={errors.name}
            />
          </div>
          
          <div>
            <SelectInput
              label="Category"
              value={formData.category}
              onChange={handleSelectChange('category')}
              options={categoryOptions}
              placeholder="Select category"
              error={errors.category}
            />
          </div>
        </div>

        <div>
          <Textarea
            label="Description"
            value={formData.description}
            onChange={handleInputChange('description')}
            placeholder="Describe the group's purpose and activities"
            error={errors.description}
            rows={3}
          />
        </div>

        {/* Capacity */}
        <div>
          <TextInput
            label="Maximum Members"
            type="number"
            value={formData.max_members.toString()}
            onChange={handleInputChange('max_members')}
            placeholder="Enter max members"
            error={errors.max_members}
            min={1}
          />
        </div>

        {/* Meeting Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <SelectInput
              label="Meeting Day"
              value={formData.meeting_day}
              onChange={handleSelectChange('meeting_day')}
              options={dayOptions}
              placeholder="Select day"
              error={errors.meeting_day}
            />
          </div>
          
          <div>
            <SelectInput
              label="Meeting Time"
              value={formData.meeting_time}
              onChange={handleSelectChange('meeting_time')}
              options={timeOptions}
              placeholder="Select time"
              error={errors.meeting_time}
            />
          </div>
          
          <div>
            <TextInput
              label="Location"
              value={formData.location}
              onChange={handleInputChange('location')}
              placeholder="Enter meeting location"
              error={errors.location}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <SelectInput
            label="Status"
            value={formData.status}
            onChange={handleSelectChange('status')}
            options={statusOptions}
            placeholder="Select status"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            {mode === 'create' ? 'Create Group' : 'Update Group'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupModal; 