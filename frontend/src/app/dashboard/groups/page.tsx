"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const groups = [
    {
      id: 1,
      name: "Youth Ministry",
      description: "Engaging young people in faith and fellowship",
      category: "Ministry",
      leader: "Sarah Johnson",
      memberCount: 89,
      maxMembers: 100,
      meetingDay: "Friday",
      meetingTime: "7:00 PM",
      location: "Youth Room",
      status: "Active",
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Bible Study Group",
      description: "In-depth Bible study and discussion",
      category: "Education",
      leader: "John Smith",
      memberCount: 45,
      maxMembers: 50,
      meetingDay: "Wednesday",
      meetingTime: "6:30 PM",
      location: "Conference Room",
      status: "Active",
      color: "bg-green-500",
    },
    {
      id: 3,
      name: "Choir",
      description: "Worship through music and song",
      category: "Music",
      leader: "Emily Davis",
      memberCount: 23,
      maxMembers: 30,
      meetingDay: "Thursday",
      meetingTime: "7:30 PM",
      location: "Choir Room",
      status: "Active",
      color: "bg-purple-500",
    },
    {
      id: 4,
      name: "Prayer Warriors",
      description: "Dedicated prayer and intercession ministry",
      category: "Prayer",
      leader: "Michael Brown",
      memberCount: 18,
      maxMembers: 25,
      meetingDay: "Tuesday",
      meetingTime: "6:00 PM",
      location: "Prayer Room",
      status: "Active",
      color: "bg-orange-500",
    },
    {
      id: 5,
      name: "Men's Fellowship",
      description: "Men's ministry and spiritual growth",
      category: "Fellowship",
      leader: "David Wilson",
      memberCount: 32,
      maxMembers: 40,
      meetingDay: "Saturday",
      meetingTime: "8:00 AM",
      location: "Fellowship Hall",
      status: "Active",
      color: "bg-red-500",
    },
    {
      id: 6,
      name: "Women's Ministry",
      description: "Women's spiritual development and support",
      category: "Fellowship",
      leader: "Lisa Miller",
      memberCount: 28,
      maxMembers: 35,
      meetingDay: "Monday",
      meetingTime: "7:00 PM",
      location: "Women's Room",
      status: "Active",
      color: "bg-pink-500",
    },
  ];

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || group.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Ministry":
        return "bg-blue-100 text-blue-800";
      case "Education":
        return "bg-green-100 text-green-800";
      case "Music":
        return "bg-purple-100 text-purple-800";
      case "Prayer":
        return "bg-orange-100 text-orange-800";
      case "Fellowship":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewModeChange = (mode: "grid" | "list", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewMode(mode);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">Groups</h2>
              <p className="text-gray-600">Manage church groups and ministries</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center mt-4 md:mt-0">
              <i className="fas fa-plus mr-2"></i>Create Group
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 search-input rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 appearance-none bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option>All Categories</option>
                <option>Ministry</option>
                <option>Education</option>
                <option>Music</option>
                <option>Prayer</option>
                <option>Fellowship</option>
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
            <div className="relative">
              <select className="w-full px-4 py-3 appearance-none bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between mt-6 relative z-10 view-toggle-container" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
                <button
                  data-view-toggle="grid"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    setViewMode("grid");
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <i className="fas fa-th mr-1"></i>Grid
                </button>
                <button
                  data-view-toggle="list"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    setViewMode("list");
                  }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <i className="fas fa-list mr-1"></i>List
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <span>{filteredGroups.length} groups</span>
            </div>
          </div>
        </div>
      </section>

      {/* Groups Grid */}
      {viewMode === "grid" && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div key={group.id} className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${group.color} rounded-xl flex items-center justify-center`}>
                  <i className="fas fa-layer-group text-white text-xl"></i>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                  {group.status}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{group.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <i className="fas fa-user text-gray-400 mr-2"></i>
                  <span className="text-gray-600">Leader: {group.leader}</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="fas fa-users text-gray-400 mr-2"></i>
                  <span className="text-gray-600">{group.memberCount}/{group.maxMembers} members</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="fas fa-calendar text-gray-400 mr-2"></i>
                  <span className="text-gray-600">{group.meetingDay}s at {group.meetingTime}</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                  <span className="text-gray-600">{group.location}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(group.category)}`}>
                  {group.category}
                </span>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="text-red-600 hover:text-red-700 text-sm">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Groups List */}
      {viewMode === "list" && (
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leader</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meeting</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{group.name}</div>
                        <div className="text-sm text-gray-500">{group.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{group.leader}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{group.memberCount}/{group.maxMembers}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(group.memberCount / group.maxMembers) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.meetingDay}s at {group.meetingTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(group.category)}`}>
                        {group.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                        {group.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Statistics */}
      <section className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="stat-card rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-layer-group text-blue-600 text-xl"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{groups.length}</h3>
            <p className="text-sm text-gray-600">Total Groups</p>
          </div>
          
          <div className="stat-card rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-users text-green-600 text-xl"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {groups.reduce((sum, group) => sum + group.memberCount, 0)}
            </h3>
            <p className="text-sm text-gray-600">Total Members</p>
          </div>
          
          <div className="stat-card rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-user-friends text-purple-600 text-xl"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {groups.filter(g => g.status === "Active").length}
            </h3>
            <p className="text-sm text-gray-600">Active Groups</p>
          </div>
          
          <div className="stat-card rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-calendar text-orange-600 text-xl"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(groups.reduce((sum, group) => sum + group.memberCount, 0) / groups.length)}
            </h3>
            <p className="text-sm text-gray-600">Avg. Group Size</p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
} 