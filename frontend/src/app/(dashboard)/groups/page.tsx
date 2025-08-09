"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GroupModal from "@/components/groups/GroupModal";
import { GroupsService, Group } from "@/services/groups";
import { toast } from 'react-toastify';
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
import { getImageUrl } from "@/utils/helpers";

export default function GroupsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [links, setLinks] = useState<{ url: string | null; label: string; active: boolean }[]>([]);

  // Load groups from API
  useEffect(() => {
    loadGroups();
  }, [page, perPage]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await GroupsService.getGroups({
        search: searchTerm,
        category: categoryFilter === "All Categories" ? undefined : categoryFilter,
        status: statusFilter === "All Status" ? undefined : statusFilter,
        include_files: true,
        page,
        per_page: perPage,
      });
      
      if (response.success) {
        setGroups(response.groups.data);
        setTotal(response.groups.total);
        setLinks(response.groups.links || []);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error('Failed to load groups');
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reload groups when filters change
  useEffect(() => {
    setPage(1);
    loadGroups();
  }, [searchTerm, categoryFilter, statusFilter]);

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

  const perPageOptions = [
    { value: 10, label: '10 / page' },
    { value: 25, label: '25 / page' },
    { value: 50, label: '50 / page' },
  ];

  const tableColumns = [
    { key: "group", label: "Group", render: (_: any, group: any) => (
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
          {group.img_path ? (
            <img src={getImageUrl(group.img_path) || ''} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            <i className="fas fa-users text-white"></i>
          )}
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{group.name}</div>
          <div className="text-sm text-gray-500">{group.description}</div>
        </div>
      </div>
    )},

    { key: "category", label: "Category", render: (category: any) => <CategoryBadge category={category} /> },
    { key: "member_count", label: "Members", render: (member_count: any, group: any) => `${member_count || 0}/${group.max_members}` },
    { key: "status", label: "Status", render: (status: any) => <StatusBadge status={status} /> },
    { key: "meeting_day", label: "Meeting", render: (day: any, group: any) => `${day} ${group.meeting_time}` },
    { key: "actions", label: "Actions", render: (_: any, group: any) => (
      <div className="text-sm font-medium">
        <button 
          className="text-blue-600 hover:text-blue-900 mr-3"
          onClick={() => handleEditGroup(group)}
        >
          Edit
        </button>
        <button 
          className="text-red-600 hover:text-red-900"
          onClick={() => handleDeleteGroup(group.id)}
        >
          Delete
        </button>
      </div>
    )},
  ];

  const renderGroupCard = (group: any) => {
    const imageUrl = getImageUrl(group.img_path) || group.files?.find((file: any) => file.is_image)?.url;
    
    return (
      <div className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          {imageUrl ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden">
              <img 
                src={imageUrl} 
                alt={group.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-users text-white text-xl"></i>
            </div>
          )}
          <StatusBadge status={group.status} />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{group.description}</p>
      
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <i className="fas fa-calendar text-gray-400 mr-2"></i>
            <span className="text-gray-600">
              {group.meeting_day} {group.meeting_time}
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
  };

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

  const handleSaveGroup = async (groupData: Group & { upload_token?: string }) => {
    try {
      if (modalMode === 'create') {
        const response = await GroupsService.createGroup(groupData);
        if (response.success) {
          toast.success('Group created successfully!');
          loadGroups(); // Reload groups
        } else {
          toast.error(response.message || 'Failed to create group');
        }
      } else {
        if (selectedGroup?.id) {
          const response = await GroupsService.updateGroup(selectedGroup.id, groupData);
          if (response.success) {
            toast.success('Group updated successfully!');
            loadGroups(); // Reload groups
          } else {
            toast.error(response.message || 'Failed to update group');
          }
        }
      }
    } catch (err) {
      toast.error('An error occurred while saving the group');
      console.error('Error saving group:', err);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await GroupsService.deleteGroup(groupId);
      if (response.success) {
        toast.success('Group deleted successfully!');
        loadGroups(); // Reload groups
      } else {
        toast.error(response.message || 'Failed to delete group');
      }
    } catch (err) {
      toast.error('An error occurred while deleting the group');
      console.error('Error deleting group:', err);
    }
  };

  const followLink = async (url: string | null) => {
    if (!url) return;
    try {
      setLoading(true);
      // Ensure per_page is preserved when following links
      const u = new URL(url);
      if (!u.searchParams.get('per_page')) {
        u.searchParams.set('per_page', String(perPage));
      }
      const response = await GroupsService.getByPageUrl(u.toString());
      if (response.success) {
        setGroups(response.groups.data);
        setTotal(response.groups.total);
        setLinks(response.groups.links || []);
        // Sync page state if present
        const nextPage = Number(u.searchParams.get('page') || '1');
        setPage(nextPage);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error('Failed to load page');
      console.error('Pagination error:', err);
    } finally {
      setLoading(false);
    }
  };

  const prevLink = links.find(l => l.label.includes('Previous'));
  const nextLink = links.find(l => l.label.includes('Next'));

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
          onChange={(val: string) => { setCategoryFilter(val); setPage(1); }}
          options={categoryOptions}
        />
        <SelectInput
          value={statusFilter}
          onChange={(val: string) => { setStatusFilter(val); setPage(1); }}
          options={statusOptions}
        />
      </div>

      {/* View Toggle and Per Page */}
      <div className="flex items-center justify-between mb-4">
        <ViewToggle
          value={viewMode}
          onChange={handleViewModeChange}
          options={[{ value: "grid", label: "Grid", icon: "fas fa-th" }, { value: "list", label: "List", icon: "fas fa-list" }]}
          count={total}
          countLabel="groups"
        />
        <div className="w-40">
          <SelectInput
            value={String(perPage)}
            onChange={(val: string) => { setPerPage(Number(val)); setPage(1); }}
            options={perPageOptions.map(p => ({ value: String(p.value), label: p.label }))}
          />
        </div>
      </div>

      {/* Groups Grid/List */}
      {viewMode === "grid" ? (
        <DataGrid
          data={groups}
          renderCard={renderGroupCard}
          columns={3}
        />
      ) : (
        <DataTable
          columns={tableColumns}
          data={groups}
        />
      )}

      {/* Pagination Links */}
      <div className="mt-6 flex items-center justify-center space-x-2">
        <button
          className={`px-3 py-1 rounded ${prevLink?.url ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
          disabled={!prevLink?.url}
          onClick={() => followLink(prevLink?.url || null)}
        >
          « Prev
        </button>
        {links.filter(l => !l.label.includes('Previous') && !l.label.includes('Next')).map((link, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded ${link.active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            disabled={!link.url}
            onClick={() => followLink(link.url)}
          >
            {link.label}
          </button>
        ))}
        <button
          className={`px-3 py-1 rounded ${nextLink?.url ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
          disabled={!nextLink?.url}
          onClick={() => followLink(nextLink?.url || null)}
        >
          Next »
        </button>
      </div>

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