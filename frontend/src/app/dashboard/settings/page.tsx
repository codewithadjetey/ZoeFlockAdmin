"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: "Admin User",
    email: "admin@church.com",
    phone: "+1 (555) 123-4567",
    role: "Administrator",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
    eventReminders: true,
    donationReceipts: true,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    loginAttempts: "5",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: "fas fa-user" },
    { id: "notifications", label: "Notifications", icon: "fas fa-bell" },
    { id: "security", label: "Security", icon: "fas fa-shield-alt" },
    { id: "appearance", label: "Appearance", icon: "fas fa-palette" },
    { id: "backup", label: "Backup", icon: "fas fa-download" },
  ];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update
    console.log("Profile updated");
  };

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSecurityChange = (key: string, value: string) => {
    setSecurity(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">Settings</h2>
            <p className="text-gray-600">Manage your account preferences and system settings</p>
          </div>
        </div>
      </section>

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
                      ? "bg-blue-100 text-blue-700 font-medium"
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
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Profile Settings</h3>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <img
                      src={profileData.avatar}
                      alt="Profile"
                      className="w-20 h-20 rounded-full border-2 border-gray-200"
                    />
                    <div>
                      <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
                        Change Photo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        value={profileData.role}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle("emailNotifications")}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications.emailNotifications ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          notifications.emailNotifications ? "translate-x-6" : "translate-x-1"
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle("smsNotifications")}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications.smsNotifications ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          notifications.smsNotifications ? "translate-x-6" : "translate-x-1"
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-500">Receive push notifications</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle("pushNotifications")}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications.pushNotifications ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          notifications.pushNotifications ? "translate-x-6" : "translate-x-1"
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">Event Reminders</h4>
                        <p className="text-sm text-gray-500">Get reminded about upcoming events</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle("eventReminders")}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notifications.eventReminders ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          notifications.eventReminders ? "translate-x-6" : "translate-x-1"
                        }`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <button
                      onClick={() => setSecurity(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        security.twoFactorAuth ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        security.twoFactorAuth ? "translate-x-6" : "translate-x-1"
                      }`}></div>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <select
                        value={security.sessionTimeout}
                        onChange={(e) => handleSecurityChange("sessionTimeout", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                      <select
                        value={security.passwordExpiry}
                        onChange={(e) => handleSecurityChange("passwordExpiry", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors">
                      Save Security Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Appearance Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      <button className="p-4 border-2 border-blue-500 rounded-xl bg-blue-50">
                        <div className="w-full h-8 bg-blue-600 rounded mb-2"></div>
                        <span className="text-sm font-medium">Light</span>
                      </button>
                      <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500">
                        <div className="w-full h-8 bg-gray-800 rounded mb-2"></div>
                        <span className="text-sm font-medium">Dark</span>
                      </button>
                      <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500">
                        <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded mb-2"></div>
                        <span className="text-sm font-medium">Auto</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === "backup" && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Backup & Export</h3>
                <div className="space-y-6">
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
                    <p className="text-sm text-gray-500 mb-4">Download your church data in various formats</p>
                    <div className="flex space-x-4">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
                        Export as CSV
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors">
                        Export as JSON
                      </button>
                    </div>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">Backup Settings</h4>
                    <p className="text-sm text-gray-500 mb-4">Configure automatic backup settings</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Auto backup every week</span>
                      <button className="w-12 h-6 bg-blue-600 rounded-full">
                        <div className="w-5 h-5 bg-white rounded-full translate-x-6"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 