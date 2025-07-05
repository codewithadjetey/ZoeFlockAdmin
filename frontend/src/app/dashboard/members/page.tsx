"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  SearchInput, 
  SelectInput, 
  ViewToggle, 
  DataGrid, 
  DataTable,
  StatusBadge 
} from "@/components/ui";

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

  const statusOptions = [
    { value: "All Status", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "New", label: "New" },
  ];

  const groupOptions = [
    { value: "All Groups", label: "All Groups" },
    { value: "Youth Ministry", label: "Youth Ministry" },
    { value: "Bible Study", label: "Bible Study" },
    { value: "Choir", label: "Choir" },
    { value: "Prayer Group", label: "Prayer Group" },
  ];

  const viewToggleOptions = [
    { value: "grid", label: "Grid", icon: "fas fa-th" },
    { value: "list", label: "List", icon: "fas fa-list" },
  ];

  const tableColumns = [
    { key: "member", label: "Member", render: (_: any, member: any) => (
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
    )},
    { key: "phone", label: "Contact" },
    { key: "group", label: "Group" },
    { key: "status", label: "Status", render: (status: any) => <StatusBadge status={status} /> },
    { key: "joinDate", label: "Joined", render: (date: any) => new Date(date).toLocaleDateString() },
    { key: "actions", label: "Actions", render: () => (
      <div className="text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
        <button className="text-red-600 hover:text-red-900">Delete</button>
      </div>
    )},
  ];

  const renderMemberCard = (member: any) => (
    <div className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
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
          <StatusBadge status={member.status} />
          <span className="text-xs text-gray-400">
            Joined {new Date(member.joinDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  const handleViewModeChange = (value: string) => {
    setViewMode(value as "grid" | "list");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Member Directory"
        description="Manage and view all church members"
        actionButton={{
          text: "Add New Member",
          icon: "fas fa-user-plus",
          onClick: () => console.log("Add member clicked")
        }}
      />

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <SearchInput
            placeholder="Search members..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <SelectInput
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
        <SelectInput
          value={groupFilter}
          onChange={setGroupFilter}
          options={groupOptions}
        />
      </div>

      {/* View Toggle */}
      <ViewToggle
        value={viewMode}
        onChange={handleViewModeChange}
        options={viewToggleOptions}
        count={filteredMembers.length}
        countLabel="members"
      />

      {/* Members Grid/List */}
      {viewMode === "grid" ? (
        <DataGrid
          data={filteredMembers}
          renderCard={renderMemberCard}
          columns={4}
        />
      ) : (
        <DataTable
          columns={tableColumns}
          data={filteredMembers}
        />
      )}
    </DashboardLayout>
  );
} 