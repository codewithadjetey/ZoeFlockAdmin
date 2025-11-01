"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { Button, TextInput, Textarea, SelectInput } from '@/components/ui';
import FileUploader from '@/components/shared/FileUploader';
import { CmsPagesService, CmsPage } from '@/services/cmsPages';

interface CmsPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (page: CmsPage) => void;
  page?: CmsPage;
}

export const CmsPageModal: React.FC<CmsPageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  page
}) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    template: 'default',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    published_at: '',
  });

  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title || '',
        slug: page.slug || '',
        content: page.content || '',
        excerpt: page.excerpt || '',
        template: page.template || 'default',
        status: page.status || 'draft',
        seo_title: page.seo_title || '',
        seo_description: page.seo_description || '',
        seo_keywords: page.seo_keywords || '',
        published_at: page.published_at || '',
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        template: 'default',
        status: 'draft',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        published_at: '',
      });
    }
    setUploadToken(null);
  }, [page]);

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
      const pageData = {
        ...formData,
        ...(uploadToken && { upload_token: uploadToken })
      };

      let response;
      if (page) {
        response = await CmsPagesService.updatePage(page.id, pageData);
      } else {
        response = await CmsPagesService.createPage(pageData);
      }

      if (response.success) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'scheduled', label: 'Scheduled' }
  ];

  const templateOptions = [
    { value: 'default', label: 'Default' },
    { value: 'page', label: 'Page' },
    { value: 'full-width', label: 'Full Width' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={page ? 'Edit Page' : 'Create Page'}
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

        <Textarea
          label="Excerpt"
          value={formData.excerpt}
          onChange={handleInputChange('excerpt')}
          rows={3}
          placeholder="Short description (optional)"
        />

        <Textarea
          label="Content"
          value={formData.content}
          onChange={handleInputChange('content')}
          rows={10}
          placeholder="Page content (HTML supported)"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectInput
            label="Status"
            value={formData.status}
            onChange={handleInputChange('status')}
            options={statusOptions}
          />

          <SelectInput
            label="Template"
            value={formData.template}
            onChange={handleInputChange('template')}
            options={templateOptions}
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
            Featured Image
          </label>
          <FileUploader
            onUploadSuccess={handleFileUpload}
            maxFiles={1}
            accept="image/*"
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">SEO Settings</h3>
          <div className="space-y-4">
            <TextInput
              label="SEO Title"
              value={formData.seo_title}
              onChange={handleInputChange('seo_title')}
              placeholder="Optional SEO title"
            />

            <Textarea
              label="SEO Description"
              value={formData.seo_description}
              onChange={handleInputChange('seo_description')}
              rows={2}
              placeholder="Meta description"
            />

            <TextInput
              label="SEO Keywords"
              value={formData.seo_keywords}
              onChange={handleInputChange('seo_keywords')}
              placeholder="Comma-separated keywords"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : (page ? 'Update Page' : 'Create Page')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

