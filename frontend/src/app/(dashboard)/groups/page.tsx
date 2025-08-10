"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GroupModal from "@/components/groups/GroupModal";
import { GroupMembersModal } from "@/components/groups/GroupMembersModal";
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
  CategoryBadge,
  Avatar
} from "@/components/ui";
import { getImageUrl } from "@/utils/helpers";
import { 
  StatCard,
  ContentCard,
  Button
} from "@/components/ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function GroupsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [links, setLinks] = useState<{ url: string | null; label: string; active: boolean }[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Load groups from API
  useEffect(() => {
    loadGroups();
    loadAnalytics();
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

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const [overallStats, groupsNeedingAttention] = await Promise.all([
        GroupsService.getOverallStats(),
        GroupsService.getGroupsNeedingAttention()
      ]);

      if (overallStats.success && groupsNeedingAttention.success) {
        setAnalytics({
          overall: overallStats.data,
          needingAttention: groupsNeedingAttention.data
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

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
        <Avatar 
          src={group.img_path}
          fallback={group.name}
          size="md"
          alt={group.name}
        />
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
          className="text-green-600 hover:text-green-900 mr-3"
          onClick={() => handleManageMembers(group)}
        >
          Members
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
          <Avatar 
            src={group.img_path}
            fallback={group.name}
            size="lg"
            alt={group.name}
          />
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
              className="text-blue-600 hover:text-blue-700 text-sm p-1 rounded hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                handleEditGroup(group);
              }}
              title="Edit Group"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              className="text-red-600 hover:text-red-700 text-sm p-1 rounded hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteGroup(group.id!);
              }}
              title="Delete Group"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <button 
            className="text-green-600 hover:text-green-700 text-sm flex items-center hover:bg-green-50 px-2 py-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              handleManageMembers(group);
            }}
            title="Manage Members"
          >
            <i className="fas fa-users mr-1"></i>
            Manage Members
          </button>
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

  const handleManageMembers = (group: any) => {
    setSelectedGroupForMembers(group);
    setIsMemberModalOpen(true);
  };

  const handleSaveGroup = async (groupData: Group & { upload_token?: string }) => {
    try {
      if (modalMode === 'create') {
        const response = await GroupsService.createGroup(groupData);
        if (response.success) {
          toast.success('Group created successfully!');
          setGroups([response.data, ...groups ]);
        } else {
          toast.error(response.message || 'Failed to create group');
        }
      } else {
        if (selectedGroup?.id) {
          const response = await GroupsService.updateGroup(selectedGroup.id, groupData);
          if (response.success) {
            toast.success('Group updated successfully!');
            setGroups(groups.map(group => group.id === selectedGroup.id ? response.data : group));
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
        setGroups(groups.filter(group => group.id !== groupId));
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

  // Add analytics data for charts
  const getChartData = () => {
    if (!analytics?.overall) return [];

    const categoryData = Object.entries(analytics.overall.groups_by_category || {}).map(([category, count]) => ({
      name: category,
      value: count,
      fill: getRandomColor()
    }));

    return categoryData;
  };

  const getRandomColor = () => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getPerformanceData = () => {
    if (!groups.length) return [];

    return groups.slice(0, 8).map(group => ({
      name: group.name.substring(0, 15) + (group.name.length > 15 ? '...' : ''),
      members: group.member_count || 0,
      capacity: group.max_members || 0,
      utilization: group.max_members ? Math.round(((group.member_count || 0) / group.max_members) * 100) : 0
    }));
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Groups Management"
        description="Manage church groups, members, and activities"
        actions={
          <div className="flex space-x-3">
            <Button
              onClick={() => handleCreateGroup()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Group
            </Button>
          </div>
        }
      />

      {/* Analytics Dashboard */}
      {!analyticsLoading && analytics && (
        <section className="mb-8">
          <ContentCard>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Groups"
                value={analytics.overall.total_groups || 0}
                description="All groups in the system"
                icon="fas fa-layer-group"
                iconColor="text-blue-600"
                iconBgColor="bg-blue-100"
              />
              <StatCard
                title="Active Groups"
                value={analytics.overall.active_groups || 0}
                description="Currently active groups"
                icon="fas fa-check-circle"
                iconColor="text-green-600"
                iconBgColor="bg-green-100"
              />
              <StatCard
                title="Full Groups"
                value={analytics.overall.full_groups || 0}
                description="Groups at capacity"
                icon="fas fa-exclamation-triangle"
                iconColor="text-yellow-600"
                iconBgColor="bg-yellow-100"
              />
              <StatCard
                title="Total Members"
                value={analytics.overall.total_members_across_groups || 0}
                description="Members across all groups"
                icon="fas fa-users"
                iconColor="text-purple-600"
                iconBgColor="bg-purple-100"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Groups by Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Group Performance */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Utilization</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getPerformanceData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="utilization" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Groups Needing Attention */}
            {analytics.needingAttention && analytics.needingAttention.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Groups Needing Attention</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.needingAttention.slice(0, 6).map((group: any) => (
                    <div key={group.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-yellow-800">{group.name}</h4>
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                          {group.status}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-2">{group.description}</p>
                      <div className="mt-3">
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="text-sm text-yellow-700 hover:text-yellow-900 underline"
                        >
                          Review Group
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ContentCard>
        </section>
      )}

      {/* Search and Filters */}
      <section className="mb-6">
        <ContentCard>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <SearchInput
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
              />
              <SelectInput
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="w-full md:w-40"
              >
                <option value="">All Categories</option>
                <option value="youth">Youth</option>
                <option value="adults">Adults</option>
                <option value="seniors">Seniors</option>
                <option value="bible_study">Bible Study</option>
                <option value="prayer">Prayer</option>
                <option value="worship">Worship</option>
                <option value="outreach">Outreach</option>
              </SelectInput>
              <SelectInput
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full md:w-40"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="full">Full</option>
                <option value="forming">Forming</option>
              </SelectInput>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-table mr-2"></i>
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-th-large mr-2"></i>
                Cards
              </button>
            </div>
          </div>
        </ContentCard>
      </section>

      {/* Groups List */}
      <section>
        <ContentCard>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-layer-group text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first group.</p>
              <Button
                onClick={() => handleCreateGroup()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Group
              </Button>
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {tableColumns.map((column) => (
                          <th
                            key={column.key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groups.map((group) => (
                        <tr key={group.id} className="hover:bg-gray-50">
                          {tableColumns.map((column) => (
                            <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                              {column.render
                                ? column.render(group[column.key as keyof Group], group)
                                : group[column.key as keyof Group]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groups.map((group) => renderGroupCard(group))}
                </div>
              )}
            </>
          )}
        </ContentCard>
      </section>

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

      {/* Group Members Modal */}
      {selectedGroupForMembers && (
        <GroupMembersModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          group={selectedGroupForMembers}
        />
      )}

    </DashboardLayout>
  );
} 