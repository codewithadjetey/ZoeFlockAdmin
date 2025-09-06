'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { TextInput, Textarea, SelectInput, Button } from '@/components/ui';
import { GroupsService, FileUpload } from '@/services/groups';
import { Group } from '@/interfaces/groups';
import FileUploader from '../shared/FileUploader';
import { getImageUrl } from '@/utils/helpers';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group?: Group | null;
  onSave: (group: Group & { upload_token?: string }) => void;
  mode: 'create' | 'edit';
}

const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  group,
  onSave,
  mode
}) => {
  const [formData, setFormData] = useState<Partial<Group> & { upload_token?: string }>({
    name: '',
    description: '',
    max_members: 10,
    meeting_day: '',
    meeting_time: '',
    location: '',
    status: 'Active',
    upload_token: undefined
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Group, string>>>({});
  const [groupImagePreview, setGroupImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (group && mode === 'edit') {
      setFormData({
        ...group,
        upload_token: undefined // Will be set when user uploads a new image
      });
      // Set image preview for existing group
      setGroupImagePreview(group.img_path ? getImageUrl(group.img_path) : null);
    } else {
      setFormData({
        name: '',
        description: '',
        max_members: 10,
        meeting_day: '',
        meeting_time: '',
        location: '',
        status: 'Active',
        upload_token: undefined
      });
      setGroupImagePreview(null);
    }
    setErrors({});
  }, [group, mode, isOpen]);

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
    
    // Send form data with upload_token if an image was uploaded
    onSave(formData as Group & { upload_token?: string });
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

  const handleFileUpload = (files: FileUpload[]) => {
    // Since we only allow one image, take the first file
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        upload_token: files[0].upload_token
      }));
    }
  };

  const handleFileError = (error: string) => {
    console.error('File upload error:', error);
    // You can add toast notification here if needed
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
              value={formData.name || ''}
              onChange={handleInputChange('name')}
              placeholder="Enter group name"
              error={errors.name}
            />
          </div>
          
          <div>
            <SelectInput
              label="Status"
              value={formData.status || ''}
              onChange={handleSelectChange('status')}
              options={statusOptions}
              placeholder="Select status"
            />
          </div>
        </div>

        <div>
          <Textarea
            label="Description"
            value={formData.description || ''}
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
            value={formData.max_members?.toString() || '10'}
            onChange={handleInputChange('max_members')}
            placeholder="Enter max members"
            error={errors.max_members}
          />
        </div>

        {/* Meeting Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SelectInput
              label="Meeting Day"
              value={formData.meeting_day || ''}
              onChange={handleSelectChange('meeting_day')}
              options={dayOptions}
              placeholder="Select day"
              error={errors.meeting_day}
            />
          </div>
          
          <div>
            <SelectInput
              label="Meeting Time"
              value={formData.meeting_time || ''}
              onChange={handleSelectChange('meeting_time')}
              options={timeOptions}
              placeholder="Select time"
              error={errors.meeting_time}
            />
          </div>
        </div>

        <div>
          <TextInput
            label="Location"
            value={formData.location || ''}
            onChange={handleInputChange('location')}
            placeholder="Enter meeting location"
            error={errors.location}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Image
          </label>
          <div className="flex items-center space-x-4">
            {groupImagePreview && (
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={groupImagePreview}
                  alt="Group image preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <FileUploader
              multiple={false}
              maxFiles={1}
              maxSize={5}
              acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
              onUpload={handleFileUpload}
              onError={handleFileError}
              modelType="App\\Models\\Group"
              modelId={mode === 'edit' ? group?.id : undefined}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Upload a single image for the group (max 5MB, JPG, PNG, GIF, WebP)
          </p>
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