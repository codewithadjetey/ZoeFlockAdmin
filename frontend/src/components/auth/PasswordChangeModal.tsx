"use client";
import React, { useState } from 'react';
import { Modal } from '@/components/shared';
import { Button, TextInput, PasswordInput } from '@/components/ui';
import { AuthService } from '@/services/auth';
import { toast } from 'react-toastify';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Real-time validation for password confirmation
    if (field === 'new_password_confirmation' && formData.new_password && e.target.value) {
      if (e.target.value !== formData.new_password) {
        setErrors(prev => ({
          ...prev,
          new_password_confirmation: 'Passwords do not match'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          new_password_confirmation: ''
        }));
      }
    }
    
    // Real-time validation for new password length
    if (field === 'new_password' && e.target.value) {
      if (e.target.value.length < 8) {
        setErrors(prev => ({
          ...prev,
          new_password: 'Password must be at least 8 characters long'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          new_password: ''
        }));
      }
      
      // Also validate confirmation if it has a value
      if (formData.new_password_confirmation && e.target.value !== formData.new_password_confirmation) {
        setErrors(prev => ({
          ...prev,
          new_password_confirmation: 'Passwords do not match'
        }));
      } else if (formData.new_password_confirmation) {
        setErrors(prev => ({
          ...prev,
          new_password_confirmation: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long';
    }

    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Please confirm your new password';
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.changePassword(formData);
      if (response.success) {
        toast.success('Password changed successfully');
        // Reset form
        setFormData({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
        setErrors({});
        onClose();
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
      
      // Set specific errors if provided by the API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Password"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <PasswordInput
            label="Current Password"
            value={formData.current_password}
            onChange={handleInputChange('current_password')}
            placeholder="Enter your current password"
            error={errors.current_password}
          />
          
          <PasswordInput
            label="New Password"
            value={formData.new_password}
            onChange={handleInputChange('new_password')}
            placeholder="Enter your new password"
            error={errors.new_password}
          />
          
          <PasswordInput
            label="Confirm New Password"
            value={formData.new_password_confirmation}
            onChange={handleInputChange('new_password_confirmation')}
            placeholder="Confirm your new password"
            error={errors.new_password_confirmation}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Should be different from your current password</li>
            <li>• Consider using a mix of letters, numbers, and symbols</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Change Password
          </Button>
        </div>
      </form>
    </Modal>
  );
} 