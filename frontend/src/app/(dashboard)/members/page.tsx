"use client";
import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  SearchInput, 
  SelectInput, 
  ViewToggle, 
  DataGrid, 
  DataTable,
  StatusBadge,
  Button,
  Avatar,
  StatCard
} from "@/components/ui";
import { MembersService, type Member } from "@/services/members";
import { formatDate } from "@/utils/helpers";
import { toast } from "react-toastify";
import { MemberModal } from "@/components/members/MemberModal";
import type { Column, Filter, SortConfig } from "@/components/ui/DataTable";
import { useAuth } from "@/contexts/AuthContext";

export default function MembersPage() {
  const { isFamilyHead } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [members, setMembers] = useState<Member[]>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  const statusOptions = [
    { value: "All Status", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const perPageOptions = [10, 25, 50, 100];

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await MembersService.getMembers({
        search: searchTerm || undefined,
        status: statusFilter === "All Status" ? undefined : (statusFilter as 'active' | 'inactive'),
        sort_by: sortConfig?.key,
        sort_order: sortConfig?.direction,
        page,
        per_page: perPage,
      });
      if (response.success) {
        setMembers(response.members.data);
        setTotal(response.members.total);
      } else {
        toast.error(response.message || 'Failed to load members');
      }
    } catch (err) {
      toast.error('Failed to load members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await MembersService.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  useEffect(() => {
    loadMembers();
    loadStatistics();
  }, [page, perPage, sortConfig]);

  useEffect(() => {
    setPage(1);
    loadMembers();
  }, [searchTerm, statusFilter]);

  const openCreate = () => {
    setModalMode('create');
    setSelectedMember(null);
    setIsModalOpen(true);
  };
  
  const openEdit = (m: Member) => {
    setModalMode('edit');
    setSelectedMember(m);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Member> & { upload_token?: string }) => {
    try {
      if (modalMode === 'create') {
        if (!data.first_name || !data.last_name || !data.email) {
          toast.error('First name, last name and email are required');
          return;
        }
        const res = await MembersService.createMember({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          marital_status: data.marital_status,
          occupation: data.occupation,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          baptism_date: data.baptism_date,
          membership_date: data.membership_date,
          notes: data.notes,
          upload_token: (data as any).upload_token,
        });
        if (res.success) toast.success('Member created'); else toast.error(res.message || 'Failed to create');
      } else if (selectedMember) {
        const res = await MembersService.updateMember(selectedMember.id, {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          marital_status: data.marital_status,
          occupation: data.occupation,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          baptism_date: data.baptism_date,
          membership_date: data.membership_date,
          is_active: data.is_active,
          notes: data.notes,
          upload_token: (data as any).upload_token,
        });
        if (res.success) toast.success('Member updated'); else toast.error(res.message || 'Failed to update');
      }
      setIsModalOpen(false);
      loadMembers();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save member');
    }
  };

  const handleDelete = async (member: Member) => {
    if (!confirm(`Delete ${member.first_name} ${member.last_name}?`)) return;
    try {
      const res = await MembersService.deleteMember(member.id);
      if (res.success) toast.success('Member deleted'); else toast.error(res.message || 'Failed to delete');
      loadMembers();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete member');
    }
  };

  const handleManageMemberGroups = (member: Member) => {
    // This will open a modal to manage member groups
    // For now, we'll show a toast message
    toast.info(`Manage groups for ${member.first_name} ${member.last_name}`);
    // TODO: Implement member group management modal
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleFiltersChange = (filters: Record<string, any>) => {
    if (filters.search !== undefined) setSearchTerm(filters.search);
    if (filters.status !== undefined) setStatusFilter(filters.status);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const tableColumns: Column<Member>[] = [
    { 
      key: "member", 
      label: "Member", 
      sortable: false,
      render: (_: any, member: Member) => (
        <div className="flex items-center">
          <Avatar 
            src={member.profile_image_path}
            fallback={`${member.first_name} ${member.last_name}`}
            size="md"
            alt={`${member.first_name} ${member.last_name}`}
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{member.first_name} {member.last_name}</div>
            <div className="text-sm text-gray-500">{member.email}</div>
          </div>
        </div>
      )
    },
    { 
      key: "phone", 
      label: "Contact", 
      sortable: false,
      render: (_: any, member: Member) => (
        <div className="text-sm text-gray-900">
          {member.phone || '-'}
        </div>
      )
    },
    { 
      key: "is_active", 
      label: "Status", 
      sortable: true,
      render: (_: any, m: Member) => <StatusBadge status={m.is_active ? 'Active' : 'Inactive'} /> 
    },
    { 
      key: "created_at", 
      label: "Joined", 
      sortable: true,
      render: (_: any, m: Member) => m.created_at ? formatDate(m.created_at) : '-' 
    },
    { 
      key: "actions", 
      label: "Actions", 
      sortable: false,
      render: (_: any, m: Member) => (
        <div className="flex space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            onClick={() => openEdit(m)}
          >
            Edit
          </button>
          <button 
            className="text-red-600 hover:text-red-900 text-sm font-medium"
            onClick={() => handleDelete(m)}
          >
            Delete
          </button>
        </div>
      ) 
    },
  ];

  const tableFilters: Filter[] = [
    {
      key: "search",
      label: "Search",
      type: "text",
      placeholder: "Search by name, email, or phone..."
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "All Status", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" }
      ]
    }
  ];

  const renderMemberCard = (member: Member) => (
    <div className="member-card rounded-3xl shadow-xl p-6 cursor-pointer">
      <div className="flex items-center mb-4">
        <Avatar 
          src={member.profile_image_path}
          fallback={`${member.first_name} ${member.last_name}`}
          size="lg"
          alt={`${member.first_name} ${member.last_name}`}
        />
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {member.first_name} {member.last_name}
          </h3>
          <p className="text-sm text-gray-600">
            {member.email}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center text-sm">
          <i className="fas fa-phone text-gray-400 mr-2" />
          <span className="text-gray-600">{member.phone || '-'}</span>
        </div>
        <div className="flex items-center justify-between">
          <StatusBadge status={member.is_active ? 'Active' : 'Inactive'} />
          <span className="text-xs text-gray-400">
            Joined {member.created_at ? formatDate(member.created_at) : '-'}
          </span>
        </div>
        <div className="flex items-center justify-end pt-2">
          <div className="flex space-x-2">
            <button 
              className="text-blue-600 hover:text-blue-700 text-sm p-1 rounded hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(member);
              }}
              title="Edit Member"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              className="text-red-600 hover:text-red-700 text-sm p-1 rounded hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(member);
              }}
              title="Delete Member"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <PageHeader
        title={isFamilyHead() ? "Family Members" : "Member Directory"}
        description={isFamilyHead() ? "Manage and view members in your family" : "Manage and view all church members"}
        actionButton={{
          text: isFamilyHead() ? "Add Family Member" : "Add New Member",
          icon: "fas fa-user-plus",
          onClick: openCreate
        }}
      />

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon="fas fa-users"
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            title="Total Members"
            value={statistics.total_members}
            description="Total Members"
          />
          <StatCard
            icon="fas fa-user-check"
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            title="Active Members"
            value={statistics.active_members}
            description="Active Members"
          />
          <StatCard
            icon="fas fa-user-plus"
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
            title="New This Month"
            value={statistics.new_members_this_month}
            description="New This Month"
          />
          <StatCard
            icon="fas fa-calendar-plus"
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            title="New This Year"
            value={statistics.new_members_this_year}
            description="New This Year"
          />
        </div>
      )}

      <div className="mb-6">
        <ViewToggle
          value={viewMode}
          onChange={(v) => setViewMode(v as any)}
          options={[{ value: "grid", label: "Grid", icon: "fas fa-th" }, { value: "list", label: "List", icon: "fas fa-list" }]}
          count={total}
          countLabel="members"
        />
      </div>

      {viewMode === "grid" ? (
        <DataGrid data={members} renderCard={renderMemberCard} columns={4} />
      ) : (
        <DataTable 
          columns={tableColumns} 
          data={members} 
          filters={tableFilters}
          pagination={{
            currentPage: page,
            totalPages: Math.ceil(total / perPage),
            totalItems: total,
            perPage: perPage,
            onPageChange: handlePageChange,
            onPerPageChange: handlePerPageChange
          }}
          sorting={{
            sortConfig: sortConfig,
            onSort: handleSort
          }}
          onFiltersChange={handleFiltersChange}
          loading={loading}
          emptyMessage="No members found"
          perPageOptions={perPageOptions}
          showPerPageSelector={true}
          showPagination={true}
          responsive={true}
        />
      )}

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        onSave={handleSave}
        mode={modalMode}
      />
    </DashboardLayout>
  );
} 