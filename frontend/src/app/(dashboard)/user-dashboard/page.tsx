"use client";
import React, { useState, useEffect } from "react";
import { 
  PageHeader, 
  StatCard,
  ContentCard 
} from "@/components/ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    {
      title: "My Events",
      value: "0",
      description: "Events you're attending",
      icon: "fas fa-calendar",
      iconColor: "text-indigo-600",
      iconBgColor: "bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/20 dark:to-indigo-800/20",
    },
    {
      title: "My Groups",
      value: "0",
      description: "Groups you're part of",
      icon: "fas fa-layer-group",
      iconColor: "text-yellow-600",
      iconBgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20",
    },
    {
      title: "My Family",
      value: "0",
      description: "Family members",
      icon: "fas fa-home",
      iconColor: "text-purple-600",
      iconBgColor: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20",
    },
    {
      title: "My Attendance",
      value: "0",
      description: "This month",
      icon: "fas fa-clipboard-check",
      iconColor: "text-green-600",
      iconBgColor: "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20",
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate loading user data
        setTimeout(() => {
          setStats(prevStats => prevStats.map(stat => {
            if (stat.title === "My Events") {
              return {
                ...stat,
                value: "3",
                description: "Events you're attending"
              };
            }
            if (stat.title === "My Groups") {
              return {
                ...stat,
                value: "2",
                description: "Groups you're part of"
              };
            }
            if (stat.title === "My Family") {
              return {
                ...stat,
                value: "4",
                description: "Family members"
              };
            }
            if (stat.title === "My Attendance") {
              return {
                ...stat,
                value: "85%",
                description: "This month"
              };
            }
            return stat;
          }));
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching user dashboard data:', error);
        setLoading(false);
      }
    };

    fetchUserDashboardData();
  }, []);

  const attendanceData = [
    { name: 'Sun', attendance: 120, target: 150 },
    { name: 'Mon', attendance: 85, target: 100 },
    { name: 'Tue', attendance: 95, target: 100 },
    { name: 'Wed', attendance: 110, target: 120 },
    { name: 'Thu', attendance: 75, target: 80 },
    { name: 'Fri', attendance: 90, target: 100 },
    { name: 'Sat', attendance: 65, target: 80 },
  ];

  const myUpcomingEvents = [
    {
      id: 1,
      title: "Sunday Service",
      date: "March 24, 2024",
      time: "10:00 AM",
      location: "Main Sanctuary",
      category: "Worship",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      id: 2,
      title: "Youth Bible Study",
      date: "March 22, 2024",
      time: "7:00 PM",
      location: "Youth Room",
      category: "Education",
      color: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      id: 3,
      title: "Prayer Meeting",
      date: "March 20, 2024",
      time: "6:30 PM",
      location: "Prayer Room",
      category: "Prayer",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
  ];

  const myGroups = [
    {
      id: 1,
      name: "Youth Group",
      members: 25,
      nextMeeting: "March 22, 2024",
      icon: "fas fa-users",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      id: 2,
      name: "Prayer Team",
      members: 12,
      nextMeeting: "March 20, 2024",
      icon: "fas fa-pray",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
  ];

  const quickActions = [
    {
      title: "View My Profile",
      icon: "fas fa-user",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      href: "/profile",
    },
    {
      title: "My Events",
      icon: "fas fa-calendar",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      href: "/events",
    },
    {
      title: "My Groups",
      icon: "fas fa-layer-group",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      href: "/groups",
    },
    {
      title: "My Attendance",
      icon: "fas fa-clipboard-check",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      href: "/attendance",
    },
  ];

  return (
    <>
      {/* Modern Welcome Section */}
      <section className="mb-8">
        <div className="welcome-gradient rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-3 font-['Poppins'] bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Welcome, <span className="text-yellow-300">
                  {user?.name}
                </span>! 👋
              </h2>
              <p className="text-blue-100 dark:text-blue-200 text-lg">
                Here's your personal dashboard overview.
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex space-x-4">
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105">
                <i className="fas fa-user mr-2"></i>My Profile
              </button>
              <button className="bg-white text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-200 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105">
                <i className="fas fa-calendar mr-2"></i>My Events
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Statistics Cards */}
      <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`stat-card rounded-3xl shadow-xl p-6 flex items-center cursor-pointer transition-all duration-300 hover:transform hover:scale-105 ${loading ? 'opacity-75' : ''}`}
            onClick={() => {
              if (!loading) {
                switch (stat.title) {
                  case 'My Events':
                    window.location.href = '/events';
                    break;
                  case 'My Groups':
                    window.location.href = '/groups';
                    break;
                  case 'My Family':
                    window.location.href = '/families';
                    break;
                  case 'My Attendance':
                    window.location.href = '/attendance';
                    break;
                }
              }
            }}
          >
            <div className={`w-16 h-16 ${stat.iconBgColor} rounded-2xl flex items-center justify-center mr-5 shadow-lg`}>
              <i className={`${stat.icon} text-3xl ${stat.iconColor}`}></i>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.title}</dt>
              <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 rounded"></div>
                ) : (
                  stat.value
                )}
              </dd>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {loading ? (
                  <span className="inline-block animate-pulse bg-gray-300 dark:bg-gray-600 h-3 w-20 rounded"></span>
                ) : (
                  stat.description
                )}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Modern Charts & Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Modern Attendance Chart */}
        <div className="chart-container rounded-3xl shadow-xl p-8 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-['Poppins']">My Attendance Overview</h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium shadow-lg">This Month</button>
              <button className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium shadow-lg">Last Month</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  className="dark:stroke-gray-400"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  className="dark:stroke-gray-400"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Modern Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 font-['Poppins']">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{ background: action.gradient }}
              >
                <i className={`${action.icon} mr-3 text-lg`}></i>
                {action.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modern My Events & My Groups */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* My Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-['Poppins']">My Upcoming Events</h3>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200">View All</button>
          </div>
          <div className="space-y-4">
            {myUpcomingEvents.map((event) => (
              <div key={event.id} className="event-item flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:transform hover:scale-[1.02]">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${event.color} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                    <i className={`fas fa-calendar text-white`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{event.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.date} at {event.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{event.location}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{event.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Groups */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-['Poppins']">My Groups</h3>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200">View All</button>
          </div>
          <div className="space-y-4">
            {myGroups.map((group) => (
              <div key={group.id} className="group-item flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:transform hover:scale-[1.02]">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${group.color} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                    <i className={`${group.icon} text-white`}></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{group.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{group.members} members</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Next meeting</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{group.nextMeeting}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
} 