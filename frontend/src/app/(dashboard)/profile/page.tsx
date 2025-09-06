"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import UserPasswordUpdateModal from "@/components/profile/UserPasswordUpdateModal";

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    date_of_birth: user?.date_of_birth || "",
    gender: user?.gender || undefined,
    profile_picture: user?.profile_picture || "",
    whatsapp_number: user?.whatsapp_number || "",
    email_notifications_enabled: user?.email_notifications_enabled ?? true,
    email_notification_types: user?.email_notification_types || [],
    sms_notifications_enabled: user?.sms_notifications_enabled ?? false,
    sms_notification_types: user?.sms_notification_types || [],
    whatsapp_notifications_enabled: user?.whatsapp_notifications_enabled ?? false,
    whatsapp_notification_types: user?.whatsapp_notification_types || [],
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        date_of_birth: user.date_of_birth || "",
        gender: user.gender || undefined,
        profile_picture: user.profile_picture || "",
        whatsapp_number: user.whatsapp_number || "",
        email_notifications_enabled: user.email_notifications_enabled ?? true,
        email_notification_types: user.email_notification_types || [],
        sms_notifications_enabled: user.sms_notifications_enabled ?? false,
        sms_notification_types: user.sms_notification_types || [],
        whatsapp_notifications_enabled: user.whatsapp_notifications_enabled ?? false,
        whatsapp_notification_types: user.whatsapp_notification_types || [],
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationTypeChange = (notificationType: string, channel: 'email' | 'sms' | 'whatsapp') => {
    const fieldName = `${channel}_notification_types` as keyof typeof formData;
    const currentTypes = formData[fieldName] as string[];
    
    const updatedTypes = currentTypes.includes(notificationType)
      ? currentTypes.filter(type => type !== notificationType)
      : [...currentTypes, notificationType];
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: updatedTypes
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);

      //reload the page
      window.location.reload();
      // Show success message (you could add a toast notification here)
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show error message (you could add a toast notification here)
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      date_of_birth: user?.date_of_birth || "",
      gender: user?.gender || undefined,
      profile_picture: user?.profile_picture || "",
      whatsapp_number: user?.whatsapp_number || "",
      email_notifications_enabled: user?.email_notifications_enabled ?? true,
      email_notification_types: user?.email_notification_types || [],
      sms_notifications_enabled: user?.sms_notifications_enabled ?? false,
      sms_notification_types: user?.sms_notification_types || [],
      whatsapp_notifications_enabled: user?.whatsapp_notifications_enabled ?? false,
      whatsapp_notification_types: user?.whatsapp_notification_types || [],
    });
    setIsEditing(false);
  };

  const handlePasswordUpdateSuccess = () => {
    toast.success("Password updated successfully!");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-['Poppins']">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your personal information and preferences</p>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-6 shadow-lg">
              <i className="fas fa-user text-white text-3xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'} mr-2`}></i>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Form */}
        <div className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Enter your full address"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
            
            {/* Email Notifications */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <i className="fas fa-envelope text-blue-600 mr-3"></i>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="email_notifications_enabled"
                    checked={formData.email_notifications_enabled}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {formData.email_notifications_enabled && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['events', 'attendance', 'reports', 'announcements', 'reminders'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.email_notification_types.includes(type)}
                        onChange={() => handleNotificationTypeChange(type, 'email')}
                        disabled={!isEditing}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* SMS Notifications */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <i className="fas fa-sms text-green-600 mr-3"></i>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">SMS Notifications</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="sms_notifications_enabled"
                    checked={formData.sms_notifications_enabled}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {formData.sms_notifications_enabled && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['events', 'attendance', 'reports', 'announcements', 'reminders'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.sms_notification_types.includes(type)}
                        onChange={() => handleNotificationTypeChange(type, 'sms')}
                        disabled={!isEditing}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* WhatsApp Notifications */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <i className="fab fa-whatsapp text-green-500 mr-3"></i>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">WhatsApp Notifications</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="whatsapp_notifications_enabled"
                    checked={formData.whatsapp_notifications_enabled}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {formData.whatsapp_notifications_enabled && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['events', 'attendance', 'reports', 'announcements', 'reminders'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.whatsapp_notification_types.includes(type)}
                        onChange={() => handleNotificationTypeChange(type, 'whatsapp')}
                        disabled={!isEditing}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
        </div>

        {/* Security Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mr-6 shadow-lg">
                <i className="fas fa-shield-alt text-white text-3xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage your account security</p>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-6">
            {/* Password Update Section */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <i className="fas fa-key text-blue-600 mr-3"></i>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Update your password for better security</p>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Update
                  </button>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <div className="flex items-start">
                <i className="fas fa-lightbulb text-green-600 mr-3 mt-1"></i>
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Security Tips</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Use a strong, unique password</li>
                    <li>• Enable two-factor authentication if available</li>
                    <li>• Never share your password with others</li>
                    <li>• Log out from shared devices</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Update Modal */}
      <UserPasswordUpdateModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordUpdateSuccess}
      />
    </div>
  );
} 