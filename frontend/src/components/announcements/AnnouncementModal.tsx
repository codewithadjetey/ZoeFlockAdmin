"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { Button, TextInput, Textarea, SelectInput } from '@/components/ui';
import FileUploader from '@/components/shared/FileUploader';
import { AnnouncementsService, Announcement } from '@/services/announcements';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (announcement: Announcement) => void;
  announcement?: Announcement;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  announcement
}) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: 'general' as 'general' | 'events' | 'updates' | 'urgent',
    priority: 'medium' as 'low' | 'medium' | 'high',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        slug: announcement.slug || '',
        content: announcement.content || '',
        category: announcement.category || 'general',
        priority: announcement.priority || 'medium',
        start_date: announcement.start_date ? announcement.start_date.substring(0, 16) : '',
        end_date: announcement.end_date ? announcement.end_date.substring(0, 16) : '',
        is_active: announcement.is_active ?? true,
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        category: 'general',
        priority: 'medium',
        start_date: '',
        end_date: '',
        is_active: true,
      });
    }
    setUploadToken(null);
  }, [announcement]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (files: any[]) => {
    if (files && files.length > 0) {
      setUploadToken(files[0].upload_token);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const announcementData = {
        ...formData,
        ...(uploadToken && { upload_token: uploadToken })
      };

      let response;
      if (announcement) {
        response = await AnnouncementsService.updateAnnouncement(announcement.id, announcementData);
      } else {
        response = await AnnouncementsService.createAnnouncement(announcementData);
      }

      if (response.success) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'events', label: 'Events' },
    { value: 'updates', label: 'Updates' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={announcement ? 'Edit Announcement' : 'Create Announcement'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Title"
            value={formData.title}
            onChange={handleInputChange('title')}
            required
          />

          <TextInput
            label="Slug"
            value={formData.slug}
            onChange={handleInputChange('slug')}
            placeholder="auto-generated if empty"
          />
        </div>

        <Textarea
          label="Content"
          value={formData.content}
          onChange={handleInputChange('content')}
          rows={6}
          placeholder="Announcement content"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectInput
            label="Category"
            value={formData.category}
            onChange={handleInputChange('category')}
            options={categoryOptions}
          />

          <SelectInput
            label="Priority"
            value={formData.priority}
            onChange={handleInputChange('priority')}
            options={priorityOptions}
          />

          <div className="flex items-center pt-5">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={handleCheckboxChange('is_active')}
              className="w-4 h-4 mr-2"
            />
            <label htmlFor="is_active" className="text-sm">Active</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Start Date"
            type="datetime-local"
            value={formData.start_date}
            onChange={handleInputChange('start_date')}
          />

          <TextInput
            label="End Date"
            type="datetime-local"
            value={formData.end_date}
            onChange={handleInputChange('end_date')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Featured Image
          </label>
          <FileUploader
            onUploadSuccess={handleFileUpload}
            maxFiles={1}
            accept="image/*"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : (announcement ? 'Update Announcement' : 'Create Announcement')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

