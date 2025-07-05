"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

interface TopbarProps {
  onSidebarToggle?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onSidebarToggle }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notifications = [
    {
      id: 1,
      type: "user",
      icon: "fas fa-user-plus",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      title: "New Member Registration",
      message: "Sarah Johnson has joined the church",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "donation",
      icon: "fas fa-donate",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      title: "Donation Received",
      message: "$250 donation from John Smith",
      time: "30 minutes ago",
    },
    {
      id: 3,
      type: "event",
      icon: "fas fa-calendar",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      title: "Event Reminder",
      message: "Sunday Service starts in 2 hours",
      time: "1 hour ago",
    },
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 flex items-center justify-between px-8 h-20">
      <div className="flex items-center space-x-6">
        <button 
          onClick={onSidebarToggle}
          className="lg:hidden text-gray-600 focus:outline-none transition-colors hover:text-primary-500"
        >
          <i className="fas fa-bars text-2xl"></i>
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-['Poppins']">Dashboard</h1>
          <p className="hidden md:block text-sm text-gray-500">Welcome to your church management system</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative text-gray-600 hover:text-primary-500 focus:outline-none transition-colors"
          >
            <i className="fas fa-bell text-2xl"></i>
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
              {notifications.length}
            </span>
          </button>

          {/* Notifications Dropdown Menu */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-500">You have {notifications.length} new notifications</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start">
                      <div className={`w-10 h-10 ${notification.bgColor} rounded-full flex items-center justify-center mr-3`}>
                        <i className={`${notification.icon} ${notification.iconColor}`}></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100">
                <button className="w-full text-center text-sm text-primary-500 hover:text-primary-600 font-medium">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="User Avatar"
              className="w-10 h-10 rounded-full border-2 border-white shadow-md"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@church.com</p>
              </div>
              <div className="p-2">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <i className="fas fa-user mr-3 text-gray-400"></i>
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <i className="fas fa-cog mr-3 text-gray-400"></i>
                  Settings
                </Link>
                <hr className="my-2" />
                <button
                  onClick={() => {
                    localStorage.removeItem("isAuthenticated");
                    localStorage.removeItem("userRole");
                    window.location.href = "/auth/login";
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <i className="fas fa-sign-out-alt mr-3"></i>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar; 