"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import ColorSwitcher from "@/components/ui/ColorSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface TopbarProps {
  onSidebarToggle?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onSidebarToggle }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { currentTheme } = useTheme();
  const router = useRouter();

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

  const handleLogout = async () => {
    // Confirm logout
    if (!window.confirm('Are you sure you want to logout?')) {
      return;
    }
    
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const notifications = [
    {
      id: 1,
      type: "user",
      icon: "fas fa-user-plus",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      title: "New Member Registration",
      message: "Sarah Johnson has joined the church",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "donation",
      icon: "fas fa-donate",
      iconColor: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      title: "Donation Received",
      message: "$250 donation from John Smith",
      time: "30 minutes ago",
    },
    {
      id: 3,
      type: "event",
      icon: "fas fa-calendar",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      title: "Event Reminder",
      message: "Sunday Service starts in 2 hours",
      time: "1 hour ago",
    },
  ];

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-xl border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 h-20 transition-all duration-300">
      <div className="flex items-center space-x-6">
        <button 
          onClick={onSidebarToggle}
          className="lg:hidden text-gray-600 dark:text-gray-300 focus:outline-none transition-all duration-300 hover:text-primary-500 hover:scale-110"
        >
          <i className="fas fa-bars text-2xl"></i>
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-['Poppins'] bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Dashboard</h1>
          <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400">Welcome to your church management system</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Theme Switcher */}
        <ColorSwitcher showDarkMode={true} />

        {/* Modern Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative text-gray-600 dark:text-gray-300 hover:text-primary-500 focus:outline-none transition-all duration-300 hover:scale-110"
          >
            <i className="fas fa-bell text-2xl"></i>
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-lg">
              {notifications.length}
            </span>
          </button>

          {/* Modern Notifications Dropdown Menu */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">You have {notifications.length} new notifications</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:transform hover:scale-[1.02]"
                  >
                    <div className="flex items-start">
                      <div className={`w-10 h-10 ${notification.bgColor} rounded-xl flex items-center justify-center mr-3 shadow-lg`}>
                        <i className={`${notification.icon} ${notification.iconColor}`}></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{notification.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                <button className="w-full text-center text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modern User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl px-4 py-2 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="User Avatar"
              className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-md"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <i className="fas fa-chevron-down text-gray-400 dark:text-gray-500 text-xs transition-transform duration-300"></i>
          </button>

          {/* Modern Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <div className="p-2">
                <Link
                  href="/settings"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:transform hover:scale-[1.02]"
                >
                  <i className="fas fa-user mr-3 text-gray-400 dark:text-gray-500"></i>
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:transform hover:scale-[1.02]"
                >
                  <i className="fas fa-cog mr-3 text-gray-400 dark:text-gray-500"></i>
                  Settings
                </Link>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className={`fas ${isLoggingOut ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'} mr-3`}></i>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
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