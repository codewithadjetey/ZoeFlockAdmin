"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  ContentCard,
  ToggleSwitch,
  FormField,
  TabNavigation,
  SelectInput
} from "@/components/ui";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
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
    { id: "general", label: "General", icon: "fas fa-cog" },
    { id: "notifications", label: "Notifications", icon: "fas fa-bell" },
    { id: "security", label: "Security", icon: "fas fa-shield-alt" },
    { id: "appearance", label: "Appearance", icon: "fas fa-palette" },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <FormField label="Language">
        <SelectInput
          value={settings.language}
          onChange={(value: string) => handleSettingChange("language", value)}
          options={[
            { value: "English", label: "English" },
            { value: "Spanish", label: "Spanish" },
            { value: "French", label: "French" },
          ]}
        />
      </FormField>
      
      <FormField label="Timezone">
        <SelectInput
          value={settings.timezone}
          onChange={(value: string) => handleSettingChange("timezone", value)}
          options={[
            { value: "UTC-5", label: "Eastern Time (UTC-5)" },
            { value: "UTC-6", label: "Central Time (UTC-6)" },
            { value: "UTC-7", label: "Mountain Time (UTC-7)" },
            { value: "UTC-8", label: "Pacific Time (UTC-8)" },
          ]}
        />
      </FormField>
      
      <FormField label="Date Format">
        <SelectInput
          value={settings.dateFormat}
          onChange={(value: string) => handleSettingChange("dateFormat", value)}
          options={[
            { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
            { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
            { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
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
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weekly Reports</h3>
          <p className="text-sm text-gray-600">Receive weekly summary reports</p>
        </div>
        <ToggleSwitch
          checked={settings.weeklyReports}
          onChange={(checked) => handleSettingChange("weeklyReports", checked)}
        />
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Auto Backup</h3>
          <p className="text-sm text-gray-600">Automatically backup data weekly</p>
        </div>
        <ToggleSwitch
          checked={settings.autoBackup}
          onChange={(checked) => handleSettingChange("autoBackup", checked)}
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Password</h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200">
          Change Password
        </button>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200">
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
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Theme Colors</h3>
        <div className="grid grid-cols-5 gap-3">
          {["blue", "green", "purple", "orange", "pink"].map((color) => (
            <button
              key={color}
              className={`w-12 h-12 rounded-full bg-${color}-500 border-2 border-white shadow-md hover:scale-110 transition-transform duration-200`}
              title={color.charAt(0).toUpperCase() + color.slice(1)}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "appearance":
        return renderAppearanceSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        description="Manage your account and application preferences"
      />

      <ContentCard>
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="mt-8">
          {renderTabContent()}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <button className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
              Cancel
            </button>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200">
              Save Changes
            </button>
          </div>
        </div>
      </ContentCard>
    </DashboardLayout>
  );
} 