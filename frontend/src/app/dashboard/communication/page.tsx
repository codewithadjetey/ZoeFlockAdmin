"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState("compose");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [messageData, setMessageData] = useState({
    subject: "",
    content: "",
    recipients: [],
    scheduledDate: "",
  });

  const templates = [
    {
      id: 1,
      name: "Welcome Message",
      subject: "Welcome to Our Church Family!",
      content: "Dear [Name],\n\nWelcome to our church family! We're excited to have you join us.\n\nBlessings,\n[Church Name]",
      category: "Welcome",
    },
    {
      id: 2,
      name: "Event Reminder",
      subject: "Reminder: [Event Name]",
      content: "Dear [Name],\n\nThis is a friendly reminder about [Event Name] on [Date] at [Time].\n\nWe look forward to seeing you!\n\nBlessings,\n[Church Name]",
      category: "Events",
    },
    {
      id: 3,
      name: "Prayer Request",
      subject: "Prayer Request Update",
      content: "Dear [Name],\n\nWe wanted to let you know that we're praying for you and your family.\n\nBlessings,\n[Church Name]",
      category: "Prayer",
    },
    {
      id: 4,
      name: "Donation Receipt",
      subject: "Thank You for Your Generosity",
      content: "Dear [Name],\n\nThank you for your generous donation of $[Amount]. Your support helps us continue our ministry.\n\nBlessings,\n[Church Name]",
      category: "Donations",
    },
  ];

  const recentMessages = [
    {
      id: 1,
      subject: "Welcome to Our Church Family!",
      recipients: 15,
      sentDate: "2024-03-20",
      status: "Sent",
      type: "Email",
    },
    {
      id: 2,
      subject: "Reminder: Sunday Service",
      recipients: 125,
      sentDate: "2024-03-19",
      status: "Sent",
      type: "SMS",
    },
    {
      id: 3,
      subject: "Prayer Meeting Tonight",
      recipients: 45,
      sentDate: "2024-03-18",
      status: "Scheduled",
      type: "Email",
    },
  ];

  const recipientGroups = [
    { id: 1, name: "All Members", count: 1247 },
    { id: 2, name: "Youth Group", count: 89 },
    { id: 3, name: "Bible Study", count: 45 },
    { id: 4, name: "Choir Members", count: 23 },
    { id: 5, name: "Leadership Team", count: 12 },
  ];

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id);
    setMessageData({
      subject: template.subject,
      content: template.content,
      recipients: [],
      scheduledDate: "",
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle message sending
    console.log("Message sent:", messageData);
  };

  const tabs = [
    { id: "compose", label: "Compose", icon: "fas fa-edit" },
    { id: "templates", label: "Templates", icon: "fas fa-file-alt" },
    { id: "history", label: "History", icon: "fas fa-history" },
    { id: "groups", label: "Recipient Groups", icon: "fas fa-users" },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">Communication</h2>
              <p className="text-gray-600">Send messages and stay connected with your church community</p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center">
                <i className="fas fa-envelope mr-2"></i>Send Email
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center">
                <i className="fas fa-sms mr-2"></i>Send SMS
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Compose Message */}
      {activeTab === "compose" && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Compose Message</h3>
              <form onSubmit={handleSendMessage} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select recipient group</option>
                    {recipientGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.count} members)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={messageData.subject}
                    onChange={(e) => setMessageData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter message subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
                  <textarea
                    value={messageData.content}
                    onChange={(e) => setMessageData(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your message content..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Email</option>
                      <option>SMS</option>
                      <option>Push Notification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
                    <input
                      type="datetime-local"
                      value={messageData.scheduledDate}
                      onChange={(e) => setMessageData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Members</span>
                  <span className="font-semibold text-blue-600">1,247</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">Messages Sent</span>
                  <span className="font-semibold text-green-600">156</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-600">Open Rate</span>
                  <span className="font-semibold text-purple-600">87%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Templates */}
      {activeTab === "templates" && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <i className="fas fa-file-alt text-blue-600 text-xl"></i>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {template.category}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.content}</p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => handleTemplateSelect(template)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Message History */}
      {activeTab === "history" && (
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 font-['Poppins']">Message History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{message.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        message.type === "Email" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}>
                        {message.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{message.recipients}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.sentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        message.status === "Sent" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {message.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recipient Groups */}
      {activeTab === "groups" && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipientGroups.map((group) => (
            <div key={group.id} className="member-card rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <i className="fas fa-users text-purple-600 text-xl"></i>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  <i className="fas fa-edit"></i>
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{group.count} members</p>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors">
                  Send Message
                </button>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded-lg transition-colors">
                  View Members
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </DashboardLayout>
  );
} 