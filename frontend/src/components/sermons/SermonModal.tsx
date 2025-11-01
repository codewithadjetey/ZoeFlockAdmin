"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { Button, TextInput, Textarea, SelectInput } from '@/components/ui';
import FileUploader from '@/components/shared/FileUploader';
import { SermonsService, Sermon } from '@/services/sermons';
import { SermonSeriesService, type SermonSeries } from '@/services/sermonSeries';

interface SermonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sermon: Sermon) => void;
  sermon?: Sermon;
}

export const SermonModal: React.FC<SermonModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sermon
}) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    speaker: '',
    sermon_date: '',
    series_id: '',
    scripture_reference: '',
    description: '',
    status: 'draft' as 'draft' | 'published',
    published_at: '',
  });

  const [seriesList, setSeriesList] = useState<SermonSeries[]>([]);
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSeries();
    if (sermon) {
      setFormData({
        title: sermon.title || '',
        slug: sermon.slug || '',
        speaker: sermon.speaker || '',
        sermon_date: sermon.sermon_date || '',
        series_id: sermon.series_id ? String(sermon.series_id) : '',
        scripture_reference: sermon.scripture_reference || '',
        description: sermon.description || '',
        status: sermon.status || 'draft',
        published_at: sermon.published_at || '',
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        speaker: '',
        sermon_date: '',
        series_id: '',
        scripture_reference: '',
        description: '',
        status: 'draft',
        published_at: '',
      });
    }
    setUploadToken(null);
  }, [sermon]);

  const loadSeries = async () => {
    try {
      const response = await SermonSeriesService.getSeries({});
      if (response.success) {
        setSeriesList(response.data);
      }
    } catch (error) {
      console.error('Error loading series:', error);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
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
      const sermonData = {
        ...formData,
        series_id: formData.series_id ? Number(formData.series_id) : undefined,
        ...(uploadToken && { upload_token: uploadToken })
      };

      let response;
      if (sermon) {
        response = await SermonsService.updateSermon(sermon.id, sermonData);
      } else {
        response = await SermonsService.createSermon(sermonData);
      }

      if (response.success) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error saving sermon:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' }
  ];

  const seriesOptions = [
    { value: '', label: 'No Series' },
    ...seriesList.map(s => ({ value: String(s.id), label: s.name }))
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sermon ? 'Edit Sermon' : 'Create Sermon'}
      size="xxl"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="Speaker"
            value={formData.speaker}
            onChange={handleInputChange('speaker')}
            required
          />

          <TextInput
            label="Sermon Date"
            type="date"
            value={formData.sermon_date}
            onChange={handleInputChange('sermon_date')}
            required
          />

          <SelectInput
            label="Series"
            value={formData.series_id}
            onChange={handleInputChange('series_id')}
            options={seriesOptions}
          />
        </div>

        <TextInput
          label="Scripture Reference"
          value={formData.scripture_reference}
          onChange={handleInputChange('scripture_reference')}
          placeholder="e.g. John 3:16"
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={handleInputChange('description')}
          rows={5}
          placeholder="Sermon description or notes"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Status"
            value={formData.status}
            onChange={handleInputChange('status')}
            options={statusOptions}
          />

          <TextInput
            label="Published At"
            type="datetime-local"
            value={formData.published_at}
            onChange={handleInputChange('published_at')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thumbnail
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
            {loading ? 'Saving...' : (sermon ? 'Update Sermon' : 'Create Sermon')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

