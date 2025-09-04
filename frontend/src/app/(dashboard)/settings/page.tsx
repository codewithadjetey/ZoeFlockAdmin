"use client";
import React, { useState } from "react";
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

export default function SettingsPage() {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile-update");
  const [settings, setSettings] = useState({
    name: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    autoBackup: true,
    darkMode: false,
    language: "English",
    timezone: "UTC-5",
    dateFormat: "MM/DD/YYYY",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: "profile-update", label: "Profile Update", icon: "fas fa-user-edit" },
    { id: "notifications", label: "Notifications", icon: "fas fa-bell" },
    { id: "security", label: "Security", icon: "fas fa-shield-alt" },
    { id: "appearance", label: "Appearance", icon: "fas fa-palette" },
  ];

  const renderProfileUpdateSettings = () => (
    <div className="space-y-6">
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

    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
          <p className="text-sm text-gray-600">Receive notifications via email</p>
        </div>
        <ToggleSwitch
          checked={settings.emailNotifications}
          onChange={(checked) => handleSettingChange("emailNotifications", checked)}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">SMS Notifications</h3>
          <p className="text-sm text-gray-600">Receive notifications via SMS</p>
        </div>
        <ToggleSwitch
          checked={settings.smsNotifications}
          onChange={(checked) => handleSettingChange("smsNotifications", checked)}
        />
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
        <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200">
          Change Password
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-600">Add an extra layer of security</p>
        </div>
        <button className="bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200">
          Enable 2FA
        </button>
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
                <button className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all duration-200">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 