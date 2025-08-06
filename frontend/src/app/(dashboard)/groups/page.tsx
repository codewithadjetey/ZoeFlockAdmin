"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GroupModal from "@/components/groups/GroupModal";
import { 
  PageHeader, 
  SearchInput, 
  SelectInput, 
  ViewToggle, 
  DataGrid, 
  DataTable,
  StatusBadge,
  CategoryBadge 
} from "@/components/ui";

export default function GroupsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const groups = [
    {
      id: 1,
      name: "Youth Ministry",
      description: "Engaging young people in faith and community",
      category: "Ministry",
      leader: "Sarah Johnson",
      members: 25,
      maxMembers: 30,
      status: "Active",
      meetingDay: "Sunday",
      meetingTime: "4:00 PM",
      location: "Youth Room",
      avatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Bible Study Group",
      description: "Weekly Bible study and discussion",
      category: "Education",
      leader: "John Smith",
      members: 12,
      maxMembers: 15,
      status: "Active",
      meetingDay: "Wednesday",
      meetingTime: "7:00 PM",
      location: "Fellowship Hall",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Prayer Warriors",
      description: "Dedicated prayer group for church needs",
      category: "Prayer",
      leader: "Emily Davis",
      members: 8,
      maxMembers: 12,
      status: "Active",
      meetingDay: "Tuesday",
      meetingTime: "6:30 PM",
      location: "Prayer Room",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Choir",
      description: "Church choir for worship services",
      category: "Music",
      leader: "Michael Brown",
      members: 18,
      maxMembers: 20,
      status: "Active",
      meetingDay: "Thursday",
      meetingTime: "7:30 PM",
      location: "Choir Room",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 5,
      name: "Men's Fellowship",
      description: "Monthly men's fellowship and Bible study",
      category: "Fellowship",
      leader: "David Wilson",
      members: 10,
      maxMembers: 15,
      status: "Active",
      meetingDay: "Saturday",
      meetingTime: "8:00 AM",
      location: "Conference Room",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 6,
      name: "Women's Ministry",
      description: "Women's ministry and support group",
      category: "Fellowship",
      leader: "Lisa Miller",
      members: 22,
      maxMembers: 25,
      status: "Active",
      meetingDay: "Monday",
      meetingTime: "7:00 PM",
      location: "Women's Room",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face",
    },
  ];

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.leader.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || group.category === categoryFilter;
    const matchesStatus = statusFilter === "All Status" || group.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categoryOptions = [
    { value: "All Categories", label: "All Categories" },
    { value: "Ministry", label: "Ministry" },
    { value: "Education", label: "Education" },
    { value: "Prayer", label: "Prayer" },
    { value: "Music", label: "Music" },
    { value: "Fellowship", label: "Fellowship" },
  ];

  const statusOptions = [
    { value: "All Status", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Full", label: "Full" },
  ];

  const viewToggleOptions = [
    { value: "grid", label: "Grid", icon: "fas fa-th" },
    { value: "list", label: "List", icon: "fas fa-list" },
  ];

  const tableColumns = [
    { key: "group", label: "Group", render: (_, group: any) => (
      <div className="flex items-center">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <i className="fas fa-users text-white"></i>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{group.name}</div>
          <div className="text-sm text-gray-500">{group.description}</div>
        </div>
      </div>
    )},
    { key: "leader", label: "Leader" },
    { key: "category", label: "Category", render: (category: any) => <CategoryBadge category={category} /> },
    { key: "members", label: "Members", render: (members: any, group: any) => `${members}/${group.maxMembers}` },
    { key: "status", label: "Status", render: (status: any) => <StatusBadge status={status} /> },
    { key: "meetingDay", label: "Meeting", render: (day: any, group: any) => `${day} ${group.meetingTime}` },
    { key: "actions", label: "Actions", render: (_: any, group: any) => (
      <div className="text-sm font-medium">
        <button 
          className="text-blue-600 hover:text-blue-900 mr-3"
          onClick={() => handleEditGroup(group)}
        >
          Edit
        </button>
        <button className="text-red-600 hover:text-red-900">Delete</button>
      </div>
    )},
  ];

  const renderGroupCard = (group: any) => (
    <div className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
          <i className="fas fa-users text-white text-xl"></i>
        </div>
        <StatusBadge status={group.status} />
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
          <span className="text-gray-600">
            {group.members}/{group.maxMembers} members
          </span>
        </div>
        <div className="flex items-center text-sm">
          <i className="fas fa-calendar text-gray-400 mr-2"></i>
          <span className="text-gray-600">
            {group.meetingDay} {group.meetingTime}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
          <span className="text-gray-600">{group.location}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <CategoryBadge category={group.category} />
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-700 text-sm"
            onClick={() => handleEditGroup(group)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button className="text-red-600 hover:text-red-700 text-sm">
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );

  const handleViewModeChange = (value: string) => {
    setViewMode(value as "grid" | "list");
  };

  const handleCreateGroup = () => {
    setModalMode('create');
    setSelectedGroup(null);
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: any) => {
    setModalMode('edit');
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleSaveGroup = (groupData: any) => {
    if (modalMode === 'create') {
      // Add new group to the list
      const newGroup = {
        ...groupData,
        id: Math.max(...groups.map(g => g.id)) + 1,
        members: 0,
        avatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=60&h=60&fit=crop&crop=face"
      };
      console.log('Creating new group:', newGroup);
    } else {
      // Update existing group
      console.log('Updating group:', groupData);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Groups"
        description="Manage church groups and ministries"
        actionButton={{
          text: "Create Group",
          icon: "fas fa-plus",
          onClick: handleCreateGroup
        }}
      />

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <SearchInput
            placeholder="Search groups..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <SelectInput
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
        />
        <SelectInput
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
      </div>

      {/* View Toggle */}
      <ViewToggle
        value={viewMode}
        onChange={handleViewModeChange}
        options={viewToggleOptions}
        count={filteredGroups.length}
        countLabel="groups"
      />

      {/* Groups Grid/List */}
      {viewMode === "grid" ? (
        <DataGrid
          data={filteredGroups}
          renderCard={renderGroupCard}
          columns={3}
        />
      ) : (
        <DataTable
          columns={tableColumns}
          data={filteredGroups}
        />
      )}

      {/* Group Modal */}
      <GroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        group={selectedGroup}
        onSave={handleSaveGroup}
        mode={modalMode}
      />
    </DashboardLayout>
  );
} 