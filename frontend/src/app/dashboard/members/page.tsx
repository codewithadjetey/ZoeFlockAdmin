"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function MembersPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [groupFilter, setGroupFilter] = useState("All Groups");

  const members = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 123-4567",
      status: "Active",
      group: "Youth Ministry",
      joinDate: "2024-01-15",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "John Smith",
      email: "john@example.com",
      phone: "+1 (555) 234-5678",
      status: "Active",
      group: "Bible Study",
      joinDate: "2023-11-20",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "+1 (555) 345-6789",
      status: "Active",
      group: "Choir",
      joinDate: "2024-02-10",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Michael Brown",
      email: "michael@example.com",
      phone: "+1 (555) 456-7890",
      status: "Inactive",
      group: "Prayer Group",
      joinDate: "2023-09-05",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 5,
      name: "Lisa Wilson",
      email: "lisa@example.com",
      phone: "+1 (555) 567-8901",
      status: "Active",
      group: "Youth Ministry",
      joinDate: "2024-01-25",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 6,
      name: "David Miller",
      email: "david@example.com",
      phone: "+1 (555) 678-9012",
      status: "Active",
      group: "Bible Study",
      joinDate: "2023-12-15",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face",
    },
  ];

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || member.status === statusFilter;
    const matchesGroup = groupFilter === "All Groups" || member.group === groupFilter;
    
    return matchesSearch && matchesStatus && matchesGroup;
  });

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
              <h2 className="text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">Member Directory</h2>
              <p className="text-gray-600">Manage and view all church members</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center mt-4 md:mt-0">
              <i className="fas fa-user-plus mr-2"></i>Add New Member
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 search-input rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 appearance-none bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>New</option>
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
            <div className="relative">
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="w-full px-4 py-3 appearance-none bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option>All Groups</option>
                <option>Youth Ministry</option>
                <option>Bible Study</option>
                <option>Choir</option>
                <option>Prayer Group</option>
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
              <span>{filteredMembers.length} members</span>
            </div>
          </div>
        </div>
      </section>

      {/* Members Grid/List */}
      {viewMode === "grid" ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
              <div className="flex items-center mb-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full border-2 border-white shadow-md"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <i className="fas fa-phone text-gray-400 mr-2"></i>
                  <span className="text-gray-600">{member.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <i className="fas fa-users text-gray-400 mr-2"></i>
                  <span className="text-gray-600">{member.group}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {member.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    Joined {new Date(member.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.group}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.joinDate).toLocaleDateString()}
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
    </DashboardLayout>
  );
} 