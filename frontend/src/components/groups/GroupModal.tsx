'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { TextInput, Textarea, SelectInput, Button } from '@/components/ui';

interface Group {
  id?: number;
  name: string;
  description: string;
  category: string;
  leader: string;
  maxMembers: number;
  meetingDay: string;
  meetingTime: string;
  location: string;
  status: string;
}

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
    leader: '',
    maxMembers: 10,
    meetingDay: '',
    meetingTime: '',
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
        leader: '',
        maxMembers: 10,
        meetingDay: '',
        meetingTime: '',
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

  const validateForm = (): boolean => {
    const newErrors: Partial<Group> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.leader.trim()) {
      newErrors.leader = 'Leader is required';
    }

    if (!formData.meetingDay) {
      newErrors.meetingDay = 'Meeting day is required';
    }

    if (!formData.meetingTime) {
      newErrors.meetingTime = 'Meeting time is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.maxMembers < 1) {
      newErrors.maxMembers = 'Maximum members must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof Group, value: string | number) => {
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
              onChange={(value) => handleInputChange('name', value)}
              placeholder="Enter group name"
              error={errors.name}
              required
            />
          </div>
          
          <div>
            <SelectInput
              label="Category"
              value={formData.category}
              onChange={(value) => handleInputChange('category', value)}
              options={categoryOptions}
              placeholder="Select category"
              error={errors.category}
              required
            />
          </div>
        </div>

        <div>
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            placeholder="Describe the group's purpose and activities"
            error={errors.description}
            required
            rows={3}
          />
        </div>

        {/* Leadership and Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <TextInput
              label="Group Leader"
              value={formData.leader}
              onChange={(value) => handleInputChange('leader', value)}
              placeholder="Enter leader's name"
              error={errors.leader}
              required
            />
          </div>
          
          <div>
            <TextInput
              label="Maximum Members"
              type="number"
              value={formData.maxMembers.toString()}
              onChange={(value) => handleInputChange('maxMembers', parseInt(value) || 0)}
              placeholder="Enter max members"
              error={errors.maxMembers}
              required
              min={1}
            />
          </div>
        </div>

        {/* Meeting Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <SelectInput
              label="Meeting Day"
              value={formData.meetingDay}
              onChange={(value) => handleInputChange('meetingDay', value)}
              options={dayOptions}
              placeholder="Select day"
              error={errors.meetingDay}
              required
            />
          </div>
          
          <div>
            <SelectInput
              label="Meeting Time"
              value={formData.meetingTime}
              onChange={(value) => handleInputChange('meetingTime', value)}
              options={timeOptions}
              placeholder="Select time"
              error={errors.meetingTime}
              required
            />
          </div>
          
          <div>
            <TextInput
              label="Location"
              value={formData.location}
              onChange={(value) => handleInputChange('location', value)}
              placeholder="Enter meeting location"
              error={errors.location}
              required
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <SelectInput
            label="Status"
            value={formData.status}
            onChange={(value) => handleInputChange('status', value)}
            options={statusOptions}
            placeholder="Select status"
            required
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