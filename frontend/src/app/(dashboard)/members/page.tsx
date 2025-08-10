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
  Avatar
} from "@/components/ui";
import { MembersService, type Member } from "@/services/members";
import { formatDate } from "@/utils/helpers";
import { toast } from "react-toastify";
import { MemberModal } from "@/components/members/MemberModal";

export default function MembersPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [members, setMembers] = useState<Member[]>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [links, setLinks] = useState<{ url: string | null; label: string; active: boolean }[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  const statusOptions = [
    { value: "All Status", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const perPageOptions = [
    { value: 10, label: '10 / page' },
    { value: 25, label: '25 / page' },
    { value: 50, label: '50 / page' },
  ];

  const loadMembers = async () => {
    try {
      const response = await MembersService.getMembers({
        search: searchTerm || undefined,
        status: statusFilter === "All Status" ? undefined : (statusFilter as 'active' | 'inactive'),
        page,
        per_page: perPage,
      });
      if (response.success) {
        setMembers(response.members.data);
        setTotal(response.members.total);
        setLinks(response.members.links || []);
      } else {
        toast.error(response.message || 'Failed to load members');
      }
    } catch (err) {
      toast.error('Failed to load members');
      console.error(err);
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
  }, [page, perPage]);

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

  const tableColumns = [
    { 
      key: "member", 
      label: "Member", 
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
    { key: "phone", label: "Contact" },
    { 
      key: "status", 
      label: "Status", 
      render: (_: any, m: Member) => <StatusBadge status={m.is_active ? 'Active' : 'Inactive'} /> 
    },
    { 
      key: "joinDate", 
      label: "Joined", 
      render: (_: any, m: Member) => m.created_at ? formatDate(m.created_at) : '-' 
    },
    { 
      key: "actions", 
      label: "Actions", 
      render: (_: any, m: Member) => (
        <div className="text-sm font-medium">
          <button className="text-blue-600 hover:text-blue-900 mr-3" onClick={() => openEdit(m)}>Edit</button>
          <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(m)}>Delete</button>
        </div>
      ) 
    },
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

  const followLink = async (url: string | null) => {
    if (!url) return;
    try {
      const u = new URL(url);
      if (!u.searchParams.get('per_page')) u.searchParams.set('per_page', String(perPage));
      const response = await MembersService.getByPageUrl(u.toString());
      if (response.success) {
        setMembers(response.members.data);
        setTotal(response.members.total);
        setLinks(response.members.links || []);
        const nextPage = Number(u.searchParams.get('page') || '1');
        setPage(nextPage);
      } else {
        toast.error(response.message || 'Failed to load members');
      }
    } catch (err) {
      toast.error('Failed to load page');
    }
  };

  const prevLink = links.find(l => l.label.includes('Previous'));
  const nextLink = links.find(l => l.label.includes('Next'));

  return (
    <DashboardLayout>
      <PageHeader
        title="Member Directory"
        description="Manage and view all church members"
        actionButton={{
          text: "Add New Member",
          icon: "fas fa-user-plus",
          onClick: openCreate
        }}
      />

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_members}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <i className="fas fa-user-check text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.active_members}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <i className="fas fa-user-plus text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.new_members_this_month}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <i className="fas fa-calendar-plus text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New This Year</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.new_members_this_year}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
          onChange={(val: string) => { setStatusFilter(val); setPage(1); }}
          options={statusOptions}
        />
        <div className="w-40">
          <SelectInput
            value={String(perPage)}
            onChange={(val: string) => { setPerPage(Number(val)); setPage(1); }}
            options={perPageOptions.map(p => ({ value: String(p.value), label: p.label }))}
          />
        </div>
      </div>

      <ViewToggle
        value={viewMode}
        onChange={(v) => setViewMode(v as any)}
        options={[{ value: "grid", label: "Grid", icon: "fas fa-th" }, { value: "list", label: "List", icon: "fas fa-list" }]}
        count={total}
        countLabel="members"
      />

      {viewMode === "grid" ? (
        <DataGrid data={members} renderCard={renderMemberCard} columns={4} />
      ) : (
        <DataTable columns={tableColumns} data={members} />
      )}

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