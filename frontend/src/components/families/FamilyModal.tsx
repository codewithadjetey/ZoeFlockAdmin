"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/shared';
import { Button, TextInput, Textarea, SelectInput } from '@/components/ui';
import { FileUploader } from '@/components/shared';
import { Family } from '@/services/families';
import { MembersService, Member } from '@/services/members';
import { toast } from 'react-toastify';
import { getImageUrl } from '@/utils/helpers';

interface FamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (familyData: Family & { upload_token?: string }) => void;
  family?: Family | null;
  mode: 'create' | 'edit';
}

export default function FamilyModal({ isOpen, onClose, onSave, family, mode }: FamilyModalProps) {
  const [formData, setFormData] = useState<Partial<Family>>({
    name: '',
    slogan: '',
    description: '',
    active: true,
    family_head_id: 0,
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [familyImagePreview, setFamilyImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
      if (mode === 'edit' && family) {
        setFormData({
          name: family.name,
          slogan: family.slogan || '',
          description: family.description || '',
          active: family.active,
          family_head_id: family.family_head_id,
        });
        // Set image preview for existing family
        setFamilyImagePreview(family.img_url ? getImageUrl(family.img_url) : null);
      } else {
        setFormData({
          name: '',
          slogan: '',
          description: '',
          active: true,
          family_head_id: 0,
        });
        setFamilyImagePreview(null);
      }
    }
  }, [isOpen, mode, family]);

  const loadMembers = async () => {
    try {
      const response = await MembersService.getMembers();
      if (response.success) {
        // For now, show all members since family information is not available in the API response
        setMembers(response.members.data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load members');
    }
  };

  const handleInputChange = (field: keyof Family, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.family_head_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    const familyData = {
      ...formData,
    } as Family & { upload_token?: string };

    // Debug logging
    console.log('Submitting family data:', familyData);
    console.log('Upload token:', familyData.upload_token);

    onSave(familyData);
  };

  const handleFileUpload = (files: any[]) => {
    // Since we only allow one image, take the first file
    if (files.length > 0) {
      console.log('File uploaded successfully:', files[0]);
      setFormData(prev => ({
        ...prev,
        upload_token: files[0].upload_token
      }));
    }
  };

  const handleFileError = (error: string) => {
    console.error('File upload error:', error);
    toast.error(`File upload failed: ${error}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${mode === 'create' ? 'Create' : 'Edit'} Family`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Family Name *
          </label>
          <TextInput
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter family name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slogan
          </label>
          <TextInput
            type="text"
            value={formData.slogan}
            onChange={(e) => handleInputChange('slogan', e.target.value)}
            placeholder="Enter family slogan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter family description"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Family Head *
          </label>
          <SelectInput
            value={String(formData.family_head_id)}
            onChange={(value) => handleInputChange('family_head_id', parseInt(value))}
            options={[
              { value: '0', label: 'Select a family head' },
              ...members.map((member) => ({
                value: String(member.id),
                label: `${member.first_name} ${member.last_name}`
              }))
            ]}
          />
        </div>

        {mode === 'edit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <SelectInput
              value={formData.active ? 'true' : 'false'}
              onChange={(value) => handleInputChange('active', value === 'true')}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' }
              ]}
            />
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Family Image
          </label>
          <div className="flex items-center space-x-4">
            {familyImagePreview && (
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={familyImagePreview}
                  alt="Family image preview"
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
              modelType="App\\Models\\Family"
              modelId={mode === 'edit' ? family?.id : undefined}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Upload a single image for the family (max 5MB, JPG, PNG, GIF, WebP)
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : mode === 'create' ? 'Create Family' : 'Update Family'}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 