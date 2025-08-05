"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  ContentCard,
  FormField,
  TextInput,
  Textarea,
  SelectInput 
} from "@/components/ui";

export default function CommunicationPage() {
  const [messageType, setMessageType] = useState("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("all");
  const [scheduledDate, setScheduledDate] = useState("");

  const messageTypeOptions = [
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
    { value: "push", label: "Push Notification" },
  ];

  const recipientOptions = [
    { value: "all", label: "All Members" },
    { value: "active", label: "Active Members" },
    { value: "youth", label: "Youth Ministry" },
    { value: "choir", label: "Choir Members" },
    { value: "bible_study", label: "Bible Study Group" },
    { value: "custom", label: "Custom Selection" },
  ];

  const recentMessages = [
    {
      id: 1,
      type: "Email",
      subject: "Sunday Service Reminder",
      recipients: "All Members",
      status: "Sent",
      date: "2024-03-20",
      time: "10:30 AM",
    },
    {
      id: 2,
      type: "SMS",
      subject: "Youth Ministry Meeting",
      recipients: "Youth Ministry",
      status: "Sent",
      date: "2024-03-19",
      time: "2:15 PM",
    },
    {
      id: 3,
      type: "Push",
      subject: "Prayer Request",
      recipients: "All Members",
      status: "Scheduled",
      date: "2024-03-22",
      time: "9:00 AM",
    },
    {
      id: 4,
      type: "Email",
      subject: "Monthly Newsletter",
      recipients: "Active Members",
      status: "Draft",
      date: "2024-03-18",
      time: "11:45 AM",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sent":
        return "bg-green-100 text-green-800";
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Email":
        return "fas fa-envelope";
      case "SMS":
        return "fas fa-sms";
      case "Push":
        return "fas fa-bell";
      default:
        return "fas fa-comment";
    }
  };

  const handleSendMessage = () => {
    console.log("Sending message:", {
      type: messageType,
      subject,
      message,
      recipients,
      scheduledDate,
    });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Communication"
        description="Send messages and notifications to church members"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Message Form */}
        <ContentCard>
          <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Send Message</h3>
          
          <div className="space-y-6">
            <FormField label="Message Type">
              <SelectInput
                value={messageType}
                onChange={setMessageType}
                options={messageTypeOptions}
              />
            </FormField>

            <FormField label="Recipients">
              <SelectInput
                value={recipients}
                onChange={setRecipients}
                options={recipientOptions}
              />
            </FormField>

            <FormField label="Subject">
              <TextInput
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject..."
              />
            </FormField>

            <FormField label="Message">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={6}
              />
            </FormField>

            <FormField label="Schedule (Optional)">
              <TextInput
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </FormField>

            <div className="flex space-x-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200">
                <i className="fas fa-paper-plane mr-2"></i>Send Now
              </button>
              <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200">
                <i className="fas fa-save mr-2"></i>Save Draft
              </button>
            </div>
          </div>
        </ContentCard>

        {/* Recent Messages */}
        <ContentCard>
          <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Recent Messages</h3>
          
          <div className="space-y-4">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <i className={`${getTypeIcon(msg.type)} text-blue-600`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{msg.subject}</h4>
                      <p className="text-sm text-gray-500">{msg.recipients}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(msg.status)}`}>
                    {msg.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{msg.date} at {msg.time}</span>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-700">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="text-green-600 hover:text-green-700">
                      <i className="fas fa-redo"></i>
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Message Templates */}
      <ContentCard className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Message Templates</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-500 cursor-pointer transition-colors">
            <div className="flex items-center mb-3">
              <i className="fas fa-file-alt text-blue-600 mr-2"></i>
              <h4 className="font-medium text-gray-900">Service Reminder</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Remind members about upcoming Sunday service</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Use Template
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-500 cursor-pointer transition-colors">
            <div className="flex items-center mb-3">
              <i className="fas fa-file-alt text-green-600 mr-2"></i>
              <h4 className="font-medium text-gray-900">Event Announcement</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Announce upcoming church events</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Use Template
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-500 cursor-pointer transition-colors">
            <div className="flex items-center mb-3">
              <i className="fas fa-file-alt text-purple-600 mr-2"></i>
              <h4 className="font-medium text-gray-900">Prayer Request</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Share prayer requests with the congregation</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Use Template
            </button>
          </div>
        </div>
      </ContentCard>
    </DashboardLayout>
  );
} 