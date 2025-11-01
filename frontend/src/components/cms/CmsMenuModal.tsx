"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { Button, TextInput, SelectInput } from '@/components/ui';
import { CmsMenusService, CmsMenu } from '@/services/cmsMenus';

interface CmsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (menu: CmsMenu) => void;
  menu?: CmsMenu;
}

export const CmsMenuModal: React.FC<CmsMenuModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  menu
}) => {
  const [formData, setFormData] = useState({
    name: '',
    location: 'header' as 'header' | 'footer' | 'sidebar',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name || '',
        location: menu.location || 'header',
      });
    } else {
      setFormData({
        name: '',
        location: 'header',
      });
    }
  }, [menu]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (menu) {
        response = await CmsMenusService.updateMenu(menu.id, formData);
      } else {
        response = await CmsMenusService.createMenu(formData);
      }

      if (response.success) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error saving menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const locationOptions = [
    { value: 'header', label: 'Header' },
    { value: 'footer', label: 'Footer' },
    { value: 'sidebar', label: 'Sidebar' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={menu ? 'Edit Menu' : 'Create Menu'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <TextInput
          label="Menu Name"
          value={formData.name}
          onChange={handleInputChange('name')}
          required
        />

        <SelectInput
          label="Location"
          value={formData.location}
          onChange={handleInputChange('location')}
          options={locationOptions}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : (menu ? 'Update Menu' : 'Create Menu')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

