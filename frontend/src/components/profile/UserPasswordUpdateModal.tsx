"use client";
import React, { useState } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { api } from "@/utils/api";
import { toast } from "react-toastify";

interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

interface UserPasswordUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UserPasswordUpdateModal: React.FC<UserPasswordUpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.current_password) {
      toast.error("Current password is required");
      return;
    }
    
    if (!formData.new_password) {
      toast.error("New password is required");
      return;
    }
    
    if (formData.new_password.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    
    if (formData.new_password !== formData.new_password_confirmation) {
      toast.error("New password confirmation does not match");
      return;
    }

    try {
      setLoading(true);

      const response = await api.put<PasswordChangeResponse>('/auth/change-password', formData);
      
      if (response.data.success) {
        toast.success("Password updated successfully!");
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error updating password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Password">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <i className="fas fa-shield-alt text-blue-600 mr-3 mt-1"></i>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Security Notice</p>
              <p>Choose a strong password with at least 8 characters. Avoid using personal information or common words.</p>
            </div>
          </div>
        </div>

        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password *
          </label>
          <div className="relative">
            <Input
              type={showPasswords.current ? "text" : "password"}
              name="current_password"
              value={formData.current_password}
              onChange={handleInputChange}
              placeholder="Enter your current password"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <i className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password *
          </label>
          <div className="relative">
            <Input
              type={showPasswords.new ? "text" : "password"}
              name="new_password"
              value={formData.new_password}
              onChange={handleInputChange}
              placeholder="Enter new password (min 8 characters)"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters long
          </p>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm New Password *
          </label>
          <div className="relative">
            <Input
              type={showPasswords.confirm ? "text" : "password"}
              name="new_password_confirmation"
              value={formData.new_password_confirmation}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        {/* Password Strength Indicator */}
        {formData.new_password && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Password Strength:</div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((level) => {
                const strength = Math.min(4, Math.floor(formData.new_password.length / 2));
                return (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded ${
                      level <= strength
                        ? formData.new_password.length >= 8
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                );
              })}
            </div>
            <div className="text-xs text-gray-500">
              {formData.new_password.length < 8
                ? "Password is too short"
                : formData.new_password.length >= 12
                ? "Strong password"
                : "Good password"}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.current_password || !formData.new_password || !formData.new_password_confirmation}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-key mr-2"></i>
                Update Password
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserPasswordUpdateModal;
