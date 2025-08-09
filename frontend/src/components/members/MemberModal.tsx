"use client";
import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { Button, TextInput, SelectInput, Textarea, ToggleSwitch } from '@/components/ui';
import FileUploader from '@/components/shared/FileUploader';
import { Member } from '../../services/members';
import { getImageUrl } from '../../utils/helpers';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Partial<Member>) => void;
  member?: Member | null;
  mode: 'create' | 'edit';
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  member,
  mode
}) => {
  const [formData, setFormData] = useState<Partial<Member>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: 'male',
    marital_status: 'single',
    occupation: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    baptism_date: '',
    membership_date: '',
    is_active: true,
    notes: '',
  });

  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (member && mode === 'edit') {
      setFormData({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
        date_of_birth: member.date_of_birth || '',
        gender: member.gender || 'male',
        marital_status: member.marital_status || 'single',
        occupation: member.occupation || '',
        emergency_contact_name: member.emergency_contact_name || '',
        emergency_contact_phone: member.emergency_contact_phone || '',
        baptism_date: member.baptism_date || '',
        membership_date: member.membership_date || '',
        is_active: member.is_active ?? true,
        notes: member.notes || '',
      });
      setProfileImagePreview(member.profile_image_path ? getImageUrl(member.profile_image_path) : null);
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        date_of_birth: '',
        gender: 'male',
        marital_status: 'single',
        occupation: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        baptism_date: '',
        membership_date: '',
        is_active: true,
        notes: '',
      });
      setProfileImagePreview(null);
    }
    setUploadToken(null);
  }, [member, mode]);

  const handleInputChange = (field: keyof Member) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleFileError = (error: string) => {
    console.error('File upload error:', error);
    // You can add toast notification here if needed
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const memberData = {
      ...formData,
      ...(uploadToken && { upload_token: uploadToken })
    };
    
    onSave(memberData);
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      date_of_birth: '',
      gender: 'male',
      marital_status: 'single',
      occupation: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      baptism_date: '',
      membership_date: '',
      is_active: true,
      notes: '',
    });
    setUploadToken(null);
    setProfileImagePreview(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`${mode === 'create' ? 'Create' : 'Edit'} Member`}
      size="xxl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
      

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="First Name"
            value={formData.first_name || ''}
            onChange={handleInputChange('first_name')}
          />
          <TextInput
            label="Last Name"
            value={formData.last_name || ''}
            onChange={handleInputChange('last_name')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={handleInputChange('email')}
          />
          <TextInput
            label="Phone"
            value={formData.phone || ''}
            onChange={handleInputChange('phone')}
          />
        </div>

        <TextInput
          label="Address"
          value={formData.address || ''}
          onChange={handleInputChange('address')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth || ''}
            onChange={handleInputChange('date_of_birth')}
          />
          <SelectInput
            label="Gender"
            value={formData.gender || 'male'}
            onChange={(value) => handleInputChange('gender')({ target: { value } } as any)}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Marital Status"
            value={formData.marital_status || 'single'}
            onChange={(value) => handleInputChange('marital_status')({ target: { value } } as any)}
            options={[
              { value: 'single', label: 'Single' },
              { value: 'married', label: 'Married' },
              { value: 'divorced', label: 'Divorced' },
              { value: 'widowed', label: 'Widowed' }
            ]}
          />
          <TextInput
            label="Occupation"
            value={formData.occupation || ''}
            onChange={handleInputChange('occupation')}
          />
        </div>

        {/* Emergency Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Emergency Contact Name"
            value={formData.emergency_contact_name || ''}
            onChange={handleInputChange('emergency_contact_name')}
          />
          <TextInput
            label="Emergency Contact Phone"
            value={formData.emergency_contact_phone || ''}
            onChange={handleInputChange('emergency_contact_phone')}
          />
        </div>

        {/* Church Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Baptism Date"
            type="date"
            value={formData.baptism_date || ''}
            onChange={handleInputChange('baptism_date')}
          />
          <TextInput
            label="Membership Date"
            type="date"
            value={formData.membership_date || ''}
            onChange={handleInputChange('membership_date')}
          />
        </div>

        <ToggleSwitch
          label="Active Member"
          checked={formData.is_active || false}
          onChange={(checked) => handleInputChange('is_active')({ target: { value: checked } } as any)}
        />

        <Textarea
          label="Notes"
          value={formData.notes || ''}
          onChange={handleInputChange('notes')}
          rows={3}
        />

          {/* Profile Image Upload */}
          <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Profile Image
          </label>
          <div className="flex items-center space-x-4">
            {profileImagePreview && (
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src={profileImagePreview}
                  alt="Profile preview"
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
              modelType="App\\Models\\Member"
              modelId={mode === 'edit' ? member?.id : undefined}
              className="flex-1"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button type="submit">
            {mode === 'create' ? 'Create' : 'Update'} Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};