"use client";
import React, { useEffect, useMemo, useState } from "react";
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
import MemberIdCard from "@/components/members/MemberIdCard";
import BarcodeGenerator from "@/components/members/BarcodeGenerator";
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
  
  // QR Code Modal State
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrModalMode, setQrModalMode] = useState<'generate' | 'print'>('generate');
  
  // Bulk Selection State
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

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

  const openQRCodeModal = (member: Member, mode: 'generate' | 'print') => {
    setSelectedMember(member);
    setQrModalMode(mode);
    setIsQRModalOpen(true);
  };

  const closeQRCodeModal = () => {
    setIsQRModalOpen(false);
    setSelectedMember(null);
  };

  const handleMemberSelection = (member: Member, isSelected: boolean) => {
    if (isSelected) {
      setSelectedMembers(prev => [...prev, member]);
    } else {
      setSelectedMembers(prev => prev.filter(m => m.id !== member.id));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedMembers(members);
    } else {
      setSelectedMembers([]);
    }
  };

  const openBulkQRModal = () => {
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member');
      return;
    }
    setIsBulkModalOpen(true);
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
      key: "select", 
      label: "Select", 
      sortable: false,
      render: (_: any, member: Member) => (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedMembers.some(m => m.id === member.id)}
            onChange={(e) => handleMemberSelection(member, e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-xs text-gray-500">Select</span>
        </div>
      )
    },
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
            title="Edit Member"
          >
            Edit
          </button>
          <button 
            className="text-purple-600 hover:text-purple-900 text-sm font-medium"
            onClick={() => openQRCodeModal(m, 'generate')}
            title="Generate QR Code"
          >
            <i className="fas fa-qrcode mr-1"></i>
            QR Code
          </button>
          <button 
            className="text-green-600 hover:text-green-900 text-sm font-medium"
            onClick={() => openQRCodeModal(m, 'print')}
            title="Print ID Card"
          >
            <i className="fas fa-print mr-1"></i>
            Print
          </button>
          <button 
            className="text-red-600 hover:text-red-900 text-sm font-medium"
            onClick={() => handleDelete(m)}
            title="Delete Member"
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
              className="text-purple-600 hover:text-purple-700 text-sm p-1 rounded hover:bg-purple-50"
              onClick={(e) => {
                e.stopPropagation();
                openQRCodeModal(member, 'generate');
              }}
              title="Generate QR Code"
            >
              <i className="fas fa-qrcode"></i>
            </button>
            <button 
              className="text-green-600 hover:text-green-700 text-sm p-1 rounded hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation();
                openQRCodeModal(member, 'print');
              }}
              title="Print ID Card"
            >
              <i className="fas fa-print"></i>
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
    <>
      <PageHeader
        title={isFamilyHead() ? "Family Members" : "Member Directory"}
        description={isFamilyHead() ? "Manage and view members in your family" : "Manage and view all church members"}
        actionButton={{
          text: isFamilyHead() ? "Add Family Member" : "Add New Member",
          icon: "fas fa-user-plus",
          onClick: openCreate
        }}
      />

      {/* Bulk Actions Bar */}
      {selectedMembers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedMembers([])}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={openBulkQRModal}
                variant="outline"
                size="sm"
                className="flex items-center border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <i className="fas fa-qrcode mr-2"></i>
                Generate QR Codes
              </Button>
            </div>
          </div>
        </div>
      )}

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
        <div>
          {/* Select All Controls */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedMembers.length === members.length && members.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({selectedMembers.length}/{members.length})
                </span>
              </label>
              {selectedMembers.length > 0 && (
                <button
                  onClick={() => setSelectedMembers([])}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear selection
                </button>
              )}
            </div>
          </div>
          
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
        </div>
      )}

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        onSave={handleSave}
        mode={modalMode}
      />

      {/* QR Code Modal */}
      {selectedMember && (
        <div className={`fixed inset-0 z-50 overflow-y-auto ${isQRModalOpen ? 'block' : 'hidden'}`}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeQRCodeModal}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {qrModalMode === 'generate' ? 'Generate QR Code' : 'Print ID Card'} - {selectedMember.first_name} {selectedMember.last_name}
                  </h3>
                  <button
                    onClick={closeQRCodeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                
                <div className="mt-4">
                  {qrModalMode === 'generate' ? (
                    <BarcodeGenerator 
                      member={selectedMember}
                      onBarcodeGenerated={() => {
                        toast.success('QR Code generated successfully!');
                      }}
                    />
                  ) : (
                    <MemberIdCard 
                      member={selectedMember}
                      showPrintButton={false}
                    />
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeQRCodeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk QR Code Modal */}
      <div className={`fixed inset-0 z-50 overflow-y-auto ${isBulkModalOpen ? 'block' : 'hidden'}`}>
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsBulkModalOpen(false)}></div>
          
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Generate QR Codes for {selectedMembers.length} Members
                </h3>
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {selectedMembers.map((member) => (
                    <div key={member.id} className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Avatar 
                          src={member.profile_image_path}
                          fallback={`${member.first_name} ${member.last_name}`}
                          size="sm"
                          alt={`${member.first_name} ${member.last_name}`}
                        />
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {member.member_identification_id}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            openQRCodeModal(member, 'generate');
                            setIsBulkModalOpen(false);
                          }}
                          className="flex-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                        >
                          <i className="fas fa-qrcode mr-1"></i>
                          Generate
                        </button>
                        <button
                          onClick={() => {
                            openQRCodeModal(member, 'print');
                            setIsBulkModalOpen(false);
                          }}
                          className="flex-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                        >
                          <i className="fas fa-print mr-1"></i>
                          Print
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setSelectedMembers([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 