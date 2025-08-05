"use client";
import React, { useState, useMemo } from "react";
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
import { getMembers, searchMembers, getMembersByStatus, getMembersByGroup, type Member } from "@/data/members";
import { STATUS_OPTIONS, GROUP_OPTIONS } from "@/utils/constants";
import { formatDate } from "@/utils/helpers";

export default function MembersPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [groupFilter, setGroupFilter] = useState("All Groups");

  const allMembers = getMembers();

  const filteredMembers = useMemo(() => {
    let filtered = allMembers;

    // Apply search filter
    if (searchTerm) {
      filtered = searchMembers(searchTerm);
    }

    // Apply status filter
    if (statusFilter !== "All Status") {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    // Apply group filter
    if (groupFilter !== "All Groups") {
      filtered = filtered.filter(member => member.group === groupFilter);
    }

    return filtered;
  }, [searchTerm, statusFilter, groupFilter]);

  const viewToggleOptions = [
    { value: "grid", label: "Grid", icon: "fas fa-th" },
    { value: "list", label: "List", icon: "fas fa-list" },
  ];

  const tableColumns = [
    { 
      key: "member", 
      label: "Member", 
      render: (_: any, member: Member) => (
        <div className="flex items-center">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-md"
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">
              {member.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              {member.email}
            </div>
          </div>
        </div>
      )
    },
    { key: "phone", label: "Contact" },
    { key: "group", label: "Group" },
    { 
      key: "status", 
      label: "Status", 
      render: (status: string) => <StatusBadge status={status} /> 
    },
    { 
      key: "joinDate", 
      label: "Joined", 
      render: (date: string) => formatDate(date) 
    },
    { 
      key: "actions", 
      label: "Actions", 
      render: () => (
        <div className="text-sm font-medium">
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3 transition-colors duration-200">
            Edit
          </button>
          <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200">
            Delete
          </button>
        </div>
      )
    },
  ];

  const renderMemberCard = (member: Member) => (
    <div className="member-card rounded-3xl shadow-xl p-6 cursor-pointer transition-all duration-300 hover:transform hover:scale-105">
      <div className="flex items-center mb-4">
        <img
          src={member.avatar}
          alt={member.name}
          className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-700 shadow-md"
        />
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">
            {member.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
            {member.email}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center text-sm">
          <i className="fas fa-phone text-gray-400 dark:text-gray-500 mr-2 transition-colors duration-200" />
          <span className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
            {member.phone}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <i className="fas fa-users text-gray-400 dark:text-gray-500 mr-2 transition-colors duration-200" />
          <span className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
            {member.group}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <StatusBadge status={member.status} />
          <span className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-200">
            Joined {formatDate(member.joinDate)}
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
          options={STATUS_OPTIONS}
        />
        <SelectInput
          value={groupFilter}
          onChange={setGroupFilter}
          options={GROUP_OPTIONS}
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