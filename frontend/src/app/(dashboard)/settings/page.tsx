"use client";
import React, { useState, useEffect } from "react";
import { 
  PageHeader, 
  ContentCard,
  ToggleSwitch,
  FormField,
  TabNavigation,
  SelectInput
} from "@/components/ui";
import ColorSwitcher from "@/components/ui/ColorSwitcher";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthService, type User } from "@/services/auth";
import { toast } from 'react-toastify';
import PasswordChangeModal from "@/components/auth/PasswordChangeModal";

export default function SettingsPage() {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile-update");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [settings, setSettings] = useState({
    name: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    // Notification settings
    emailNotificationsEnabled: true,
    emailNotificationTypes: [] as string[],
    smsNotificationsEnabled: false,
    smsNotificationTypes: [] as string[],
    whatsappNotificationsEnabled: false,
    whatsappNotificationTypes: [] as string[],
    whatsappNumber: "",
    // Other settings
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    autoBackup: true,
    darkMode: false,
    language: "English",
    timezone: "UTC-5",
    dateFormat: "MM/DD/YYYY",
  });

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await AuthService.getProfile();
      if (response.success && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        setSettings(prev => ({
          ...prev,
          name: userData.name || "",
          phone: userData.phone || "",
          address: userData.address || "",
          dateOfBirth: userData.date_of_birth || "",
          gender: userData.gender || "",
          emailNotificationsEnabled: userData.email_notifications_enabled ?? true,
          emailNotificationTypes: userData.email_notification_types || [],
          smsNotificationsEnabled: userData.sms_notifications_enabled ?? false,
          smsNotificationTypes: userData.sms_notification_types || [],
          whatsappNotificationsEnabled: userData.whatsapp_notifications_enabled ?? false,
          whatsappNotificationTypes: userData.whatsapp_notification_types || [],
          whatsappNumber: userData.whatsapp_number || "",
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const profileData = {
        name: settings.name,
        phone: settings.phone,
        address: settings.address,
        date_of_birth: settings.dateOfBirth || null,
        gender: (settings.gender as 'male' | 'female' | 'other') || null,
        email_notifications_enabled: settings.emailNotificationsEnabled,
        email_notification_types: settings.emailNotificationTypes,
        sms_notifications_enabled: settings.smsNotificationsEnabled,
        sms_notification_types: settings.smsNotificationTypes,
        whatsapp_notifications_enabled: settings.whatsappNotificationsEnabled,
        whatsapp_notification_types: settings.whatsappNotificationTypes,
        whatsapp_number: settings.whatsappNumber,
      };

      const response = await AuthService.updateProfile(profileData);
      if (response.success) {
        toast.success('Profile updated successfully');
        // Reload user profile to get updated data
        await loadUserProfile();
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile-update", label: "Profile Update", icon: "fas fa-user-edit" },
    { id: "notifications", label: "Notifications", icon: "fas fa-bell" },
    { id: "security", label: "Security", icon: "fas fa-shield-alt" },
    { id: "appearance", label: "Appearance", icon: "fas fa-palette" },
  ];

    const renderProfileUpdateSettings = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      ) : (
        <>
          <FormField label="Full Name">
            <input
              type="text"
              value={settings.name}
              onChange={(e) => handleSettingChange("name", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </FormField>
          
          <FormField label="Phone Number">
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleSettingChange("phone", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </FormField>
          
          <FormField label="Address">
            <textarea
              value={settings.address}
              onChange={(e) => handleSettingChange("address", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your address"
              rows={3}
            />
          </FormField>
          
          <FormField label="Date of Birth">
            <input
              type="date"
              value={settings.dateOfBirth}
              onChange={(e) => handleSettingChange("dateOfBirth", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>
          
          <FormField label="Gender">
            <SelectInput
              value={settings.gender}
              onChange={(value: string) => handleSettingChange("gender", value)}
              options={[
                { value: "", label: "Select gender" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
            />
          </FormField>
        </>
      )}
    </div>
  );

    const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-600">Receive notifications via email</p>
          </div>
          <ToggleSwitch
            checked={settings.emailNotificationsEnabled}
            onChange={(checked) => handleSettingChange("emailNotificationsEnabled", checked)}
          />
        </div>
        
        {settings.emailNotificationsEnabled && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Notification Types:</p>
            {[
              { value: 'events', label: 'Events & Announcements' },
              { value: 'attendance', label: 'Attendance Reports' },
              { value: 'reports', label: 'Weekly Reports' },
              { value: 'announcements', label: 'Important Announcements' },
              { value: 'reminders', label: 'Reminders' },
            ].map((type) => (
              <label key={type.value} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.emailNotificationTypes.includes(type.value)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...settings.emailNotificationTypes, type.value]
                      : settings.emailNotificationTypes.filter(t => t !== type.value);
                    handleSettingChange("emailNotificationTypes", newTypes);
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* SMS Notifications */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SMS Notifications</h3>
            <p className="text-sm text-gray-600">Receive notifications via SMS</p>
          </div>
          <ToggleSwitch
            checked={settings.smsNotificationsEnabled}
            onChange={(checked) => handleSettingChange("smsNotificationsEnabled", checked)}
          />
        </div>
        
        {settings.smsNotificationsEnabled && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Notification Types:</p>
            {[
              { value: 'events', label: 'Events & Announcements' },
              { value: 'attendance', label: 'Attendance Reports' },
              { value: 'reports', label: 'Weekly Reports' },
              { value: 'announcements', label: 'Important Announcements' },
              { value: 'reminders', label: 'Reminders' },
            ].map((type) => (
              <label key={type.value} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.smsNotificationTypes.includes(type.value)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...settings.smsNotificationTypes, type.value]
                      : settings.smsNotificationTypes.filter(t => t !== type.value);
                    handleSettingChange("smsNotificationTypes", newTypes);
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Notifications */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">WhatsApp Notifications</h3>
            <p className="text-sm text-gray-600">Receive notifications via WhatsApp</p>
          </div>
          <ToggleSwitch
            checked={settings.whatsappNotificationsEnabled}
            onChange={(checked) => handleSettingChange("whatsappNotificationsEnabled", checked)}
          />
        </div>
        
        {settings.whatsappNotificationsEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={settings.whatsappNumber}
                onChange={(e) => handleSettingChange("whatsappNumber", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter WhatsApp number (e.g., +1234567890)"
              />
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Notification Types:</p>
              {[
                { value: 'events', label: 'Events & Announcements' },
                { value: 'attendance', label: 'Attendance Reports' },
                { value: 'reports', label: 'Weekly Reports' },
                { value: 'announcements', label: 'Important Announcements' },
                { value: 'reminders', label: 'Reminders' },
              ].map((type) => (
                <label key={type.value} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.whatsappNotificationTypes.includes(type.value)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...settings.whatsappNotificationTypes, type.value]
                        : settings.whatsappNotificationTypes.filter(t => t !== type.value);
                      handleSettingChange("whatsappNotificationTypes", newTypes);
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Password</h3>
          <p className="text-sm text-gray-600">Update your account password</p>
        </div>
        <button 
          onClick={() => setShowPasswordModal(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
        >
          Change Password
        </button>
      </div>
      
      {/* Two-Factor Authentication - Commented out for now */}
      {/*
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-600">Add an extra layer of security</p>
        </div>
        <button className="bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200">
          Enable 2FA
        </button>
      </div>
      */}
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <i className="fas fa-info-circle text-yellow-400"></i>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Security Recommendations
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Use a strong, unique password</li>
                <li>Never share your password with anyone</li>
                <li>Log out when using shared devices</li>
                <li>Two-factor authentication coming soon</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dark Mode</h3>
          <p className="text-sm text-gray-600">Switch to dark theme</p>
        </div>
        <ToggleSwitch
          checked={settings.darkMode}
          onChange={(checked) => handleSettingChange("darkMode", checked)}
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile-update":
        return renderProfileUpdateSettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "appearance":
        return renderAppearanceSettings();
      default:
        return renderProfileUpdateSettings();
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences"
      />

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary-100 text-primary-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <i className={`${tab.icon} mr-3 text-lg`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8">
              {renderTabContent()}
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <button className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
} 