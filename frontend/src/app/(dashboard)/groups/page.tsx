"use client";
import React, { useState, useEffect, useMemo } from "react";
import { 
  PageHeader, 
  SearchInput, 
  SelectInput, 
  ViewToggle, 
  DataGrid, 
  ContentCard,
  StatusBadge,
  Button,
  DataTable,
  StatCard
} from "@/components/ui";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Group, GroupFilters } from "@/interfaces/groups";
import { GroupsService } from "@/services/groups";
import { EntitiesService } from "@/services/entities";
import GroupModal from "@/components/groups/GroupModal";
import { GroupMembersModal } from "@/components/groups/GroupMembersModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'react-toastify';

export default function GroupsPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | undefined>();
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>();
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  useEffect(() => {
    loadGroups();
  }, [statusFilter, typeFilter, pagination.current_page]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const filters: GroupFilters = {
        per_page: pagination.per_page
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      if (typeFilter !== 'all') {
        filters.type = typeFilter;
      }

      const response = await GroupsService.getGroups(filters);
      if (response.success) {
        setGroups(response.groups.data);
        setPagination({
          current_page: response.groups.current_page,
          last_page: response.groups.last_page,
          per_page: response.groups.per_page,
          total: response.groups.total
        });
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = () => {
    setEditingGroup(undefined);
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleViewMembers = (group: Group) => {
    if (!group || !group.id) {
      console.error('Invalid group provided to handleViewMembers:', group);
      return;
    }
    setSelectedGroup(group);
    setIsMembersModalOpen(true);
  };

  const handleGroupSuccess = (group: Group) => {
    if (editingGroup) {
      setGroups(prev => prev.map(g => g.id === group.id ? group : g));
      toast.success('Group updated successfully');
    } else {
      setGroups(prev => [group, ...prev]);
      toast.success('Group created successfully');
    }
    setIsModalOpen(false);
    setEditingGroup(undefined);
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (confirm('Are you sure you want to delete this group?')) {
      try {
        await GroupsService.deleteGroup(groupId);
        setGroups(prev => prev.filter(g => g.id !== groupId));
        toast.success('Group deleted successfully');
      } catch (error) {
        console.error('Error deleting group:', error);
        toast.error('Failed to delete group');
      }
    }
  };

  const handleArchiveGroup = async (group: Group) => {
    try {
      await GroupsService.updateGroup(group.id!, { status: 'archived' });
      await loadGroups(); // Reload to get updated status
      toast.success('Group archived successfully');
    } catch (error) {
      console.error('Error archiving group:', error);
      toast.error('Failed to archive group');
    }
  };

  const handleActivateGroup = async (group: Group) => {
    try {
      await GroupsService.updateGroup(group.id!, { status: 'active' });
      await loadGroups(); // Reload to get updated status
      toast.success('Group activated successfully');
    } catch (error) {
      console.error('Error activating group:', error);
      toast.error('Failed to activate group');
    }
  };

  const getGroupStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  // DataTable columns configuration
  const tableColumns = [
    {
      key: 'name',
      label: 'Group',
      sortable: true,
      render: (value: any, group: Group) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{group.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{group.description}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: any, group: Group) => (
        <StatusBadge status={group.status} />
      )
    },
    {
      key: 'member_count',
      label: 'Members',
      sortable: true,
      render: (value: any, group: Group) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {group.member_count || 0} / {group.max_members} members
        </div>
      )
    },
    {
      key: 'leader',
      label: 'Leader',
      render: (value: any, group: Group) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {group.leader?.name || 'No leader assigned'}
        </div>
      )
    },
    {
      key: 'meeting_day',
      label: 'Meeting Schedule',
      render: (value: any, group: Group) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {group.meeting_day} {group.meeting_time}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, group: Group) => (
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-700 text-sm p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={() => handleEditGroup(group)}
            title="Edit Group"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            className="text-green-600 hover:text-green-700 text-sm p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
            onClick={() => handleViewMembers(group)}
            title="View Members"
          >
            <i className="fas fa-users"></i>
          </button>
          {group.status === 'Active' && (
            <button 
              className="text-orange-600 hover:text-orange-700 text-sm p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20"
              onClick={() => handleArchiveGroup(group)}
              title="Archive Group"
            >
              <i className="fas fa-archive"></i>
            </button>
          )}
          {group.status === 'Archived' && (
            <button 
              className="text-green-600 hover:text-green-700 text-sm p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={() => handleActivateGroup(group)}
              title="Activate Group"
            >
              <i className="fas fa-play"></i>
            </button>
          )}
          <button 
            className="text-red-600 hover:text-red-700 text-sm p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => handleDeleteGroup(group.id!)}
            title="Delete Group"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      )
    }
  ];

  // DataTable filters configuration
  const tableFilters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Archived', label: 'Archived' }
      ]
    },
    {
      key: 'member_count_min',
      label: 'Min Members',
      type: 'text' as const,
      placeholder: 'Enter minimum member count'
    },
    {
      key: 'member_count_max',
      label: 'Max Members',
      type: 'text' as const,
      placeholder: 'Enter maximum member count'
    }
  ];

  // Handle filters change
  const handleFiltersChange = (filters: Record<string, any>) => {
    // Apply filters to groups
    const filteredGroups = groups.filter((group) => {
      const matchesStatus = !filters.status || filters.status === 'all' || group.status === filters.status;
      
      let matchesMemberCount = true;
      if (filters.member_count_min) {
        matchesMemberCount = (group.member_count || 0) >= parseInt(filters.member_count_min);
      }
      if (filters.member_count_max) {
        matchesMemberCount = matchesMemberCount && (group.member_count || 0) <= parseInt(filters.member_count_max);
      }
      
      return matchesStatus && matchesMemberCount;
    });
    
    // Update pagination
    setPagination(prev => ({
      ...prev,
      current_page: 1,
      total: filteredGroups.length
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const handlePerPageChange = (perPage: number) => {
    setPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }));
  };

  // Handle sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Apply sorting to groups
  const sortedGroups = useMemo(() => {
    if (!sortConfig) return groups;
    
    return [...groups].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Group];
      const bValue = b[sortConfig.key as keyof Group];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [groups, sortConfig]);

  const filteredGroups = sortedGroups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const viewToggleOptions = [
    { value: "table", label: "Table", icon: "fas fa-table" },
    { value: "grid", label: "Grid", icon: "fas fa-th" },
  ];

  const renderGroupCard = (group: Group) => (
    <div className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center`}>
          <i className="fas fa-users text-white text-xl"></i>
        </div>
        <StatusBadge status={group.status} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{group.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <i className="fas fa-users text-gray-400 mr-2"></i>
          <span className="text-gray-600">{group.member_count || 0} members</span>
        </div>
        <div className="flex items-center text-sm">
          <i className="fas fa-clock text-gray-400 mr-2"></i>
          <span className="text-gray-600">{group.meeting_day} at {group.meeting_time}</span>
        </div>
        <div className="flex items-center text-sm">
          <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
          <span className="text-gray-600">{group.location}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-700 text-sm"
            onClick={() => handleEditGroup(group)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            className="text-green-600 hover:text-green-700 text-sm"
            onClick={() => handleViewMembers(group)}
          >
            <i className="fas fa-users"></i>
          </button>
          {group.status === 'active' && (
            <button 
              className="text-orange-600 hover:text-orange-700 text-sm"
              onClick={() => handleArchiveGroup(group)}
              title="Archive Group"
            >
              <i className="fas fa-archive"></i>
            </button>
          )}
          {group.status === 'archived' && (
            <button 
              className="text-green-600 hover:text-green-700 text-sm"
              onClick={() => handleActivateGroup(group)}
              title="Activate Group"
            >
              <i className="fas fa-play"></i>
            </button>
          )}
          <button 
            className="text-red-600 hover:text-red-700 text-sm"
            onClick={() => handleDeleteGroup(group.id!)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );

  const handleViewModeChange = (value: string) => {
    setViewMode(value as "grid" | "table");
  };

  return (
    <>
      <PageHeader
        title="Groups"
        description="Manage church groups, ministries, and fellowships. Organize members into different communities."
        actionButton={{
          text: "Create Group",
          icon: "fas fa-users",
          onClick: handleCreateGroup
        }}
      />

      {/* Status Summary */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center text-blue-800 dark:text-blue-200">
          <i className="fas fa-info-circle mr-2"></i>
          <span className="text-sm">
            <strong>Tip:</strong> Groups help organize members into communities. You can archive inactive groups instead of deleting them.
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon="fas fa-users"
          iconColor="text-blue-600 dark:text-blue-400"
          iconBgColor="bg-blue-100 dark:bg-blue-900"
          title="Total"
          value={groups.length}
          description="Total Groups"
        />
        <StatCard
          icon="fas fa-check-circle"
          iconColor="text-green-600 dark:text-green-400"
          iconBgColor="bg-green-100 dark:bg-green-900"
          title="Active"
          value={groups.filter(g => g.status === 'active').length}
          description="Active Groups"
        />
        <StatCard
          icon="fas fa-pause"
          iconColor="text-yellow-600 dark:text-yellow-400"
          iconBgColor="bg-yellow-100 dark:bg-yellow-900"
          title="Inactive"
          value={groups.filter(g => g.status === 'inactive').length}
          description="Inactive Groups"
        />
        <StatCard
          icon="fas fa-archive"
          iconColor="text-gray-600 dark:text-gray-400"
          iconBgColor="bg-gray-100 dark:bg-gray-700"
          title="Archived"
          value={groups.filter(g => g.status === 'archived').length}
          description="Archived Groups"
        />
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <SearchInput
            placeholder="Search groups..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <SelectInput
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'archived', label: 'Archived' }
          ]}
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

      {/* Groups Table View */}
      {viewMode === "table" && (
        <DataTable
          columns={tableColumns}
          data={filteredGroups}
          filters={tableFilters}
          pagination={{
            currentPage: pagination.current_page,
            totalPages: pagination.last_page,
            totalItems: pagination.total,
            perPage: pagination.per_page,
            onPageChange: handlePageChange,
            onPerPageChange: handlePerPageChange
          }}
          sorting={{
            sortConfig,
            onSort: handleSort
          }}
          onFiltersChange={handleFiltersChange}
          loading={isLoading}
          emptyMessage="No groups found. Create your first group to get started."
          className="mb-6"
        />
      )}

      {/* Groups Grid */}
      {viewMode === "grid" && (
        <DataGrid
          data={filteredGroups}
          renderCard={renderGroupCard}
          columns={3}
        />
      )}

      {/* Group Modal */}
      <GroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        group={editingGroup}
        onSave={handleGroupSuccess}
        mode={editingGroup ? 'edit' : 'create'}
      />

      {/* Group Members Modal */}
      <GroupMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        group={selectedGroup}
      />
    </>
  );
} 