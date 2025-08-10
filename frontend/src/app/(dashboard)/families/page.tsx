"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FamilyModal from "@/components/families/FamilyModal";
import { FamilyMembersModal } from "@/components/families/FamilyMembersModal";
import FamilyFilters from "@/components/families/FamilyFilters";
import { FamiliesService, Family } from "@/services/families";
import { toast } from 'react-toastify';
import { 
  PageHeader, 
  SearchInput, 
  SelectInput, 
  ViewToggle, 
  DataGrid, 
  DataTable,
  StatusBadge,
  Avatar
} from "@/components/ui";
import { getImageUrl } from "@/utils/helpers";

export default function FamiliesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedFamilyForMembers, setSelectedFamilyForMembers] = useState<Family | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [links, setLinks] = useState<{ url: string | null; label: string; active: boolean }[]>([]);

  // Load families from API
  useEffect(() => {
    loadFamilies();
  }, [page, perPage]);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      const response = await FamiliesService.getFamilies({
        search: searchTerm,
        active: statusFilter === "All Status" ? undefined : statusFilter === "Active",
        include_files: true,
        page,
        per_page: perPage,
      });
      
      if (response.success && response.families) {
        setFamilies(response.families.data);
        setTotal(response.families.total);
        setLinks(response.families.links || []);
      } else {
        toast.error(response.message || 'Failed to load families');
      }
    } catch (err) {
      toast.error('Failed to load families');
      console.error('Error loading families:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reload families when filters change
  useEffect(() => {
    setPage(1);
    loadFamilies();
  }, [searchTerm, statusFilter]);

  const statusOptions = [
    { value: "All Status", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const perPageOptions = [
    { value: 10, label: '10 / page' },
    { value: 25, label: '25 / page' },
    { value: 50, label: '50 / page' },
  ];

  const tableColumns = [
    { key: "family", label: "Family", render: (_: any, family: any) => (
      <div className="flex items-center">
        <Avatar
          src={getImageUrl(family.img_url)}
          alt={family.name}
          size="sm"
          className="mr-3"
        />
        <div>
          <div className="font-medium text-gray-900">{family.name}</div>
          {family.slogan && (
            <div className="text-sm text-gray-500">{family.slogan}</div>
          )}
        </div>
      </div>
    )},
    { key: "family_head", label: "Family Head", render: (_: any, family: any) => (
      <div className="text-sm text-gray-900">
        {family.family_head ? `${family.family_head.first_name} ${family.family_head.last_name}` : 'N/A'}
      </div>
    )},
    { key: "member_count", label: "Members", render: (_: any, family: any) => (
      <div className="text-sm text-gray-900">{family.member_count || 0}</div>
    )},
    { key: "status", label: "Status", render: (_: any, family: any) => (
      <StatusBadge status={family.active ? 'active' : 'inactive'} />
    )},
    { key: "created_at", label: "Created", render: (_: any, family: any) => (
      <div className="text-sm text-gray-500">
        {new Date(family.created_at).toLocaleDateString()}
      </div>
    )},
    { key: "actions", label: "Actions", render: (_: any, family: any) => (
      <div className="flex space-x-2">
        <button
          onClick={() => handleEditFamily(family)}
          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => handleManageMembers(family)}
          className="text-green-600 hover:text-green-900 text-sm font-medium"
        >
          Members
        </button>
        <button
          onClick={() => handleDeleteFamily(family.id!)}
          className="text-red-600 hover:text-red-900 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    )},
  ];

  const renderFamilyCard = (family: any) => (
    <div key={family.id} className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        <img
          src={getImageUrl(family.img_url) || '/images/family-placeholder.jpg'}
          alt={family.name}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{family.name}</h3>
          <StatusBadge status={family.active ? 'active' : 'inactive'} />
        </div>
        
        {family.slogan && (
          <p className="text-sm text-gray-600 mb-2 italic">"{family.slogan}"</p>
        )}
        
        {family.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{family.description}</p>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">Head:</span>
            <span className="ml-2">
              {family.family_head ? `${family.family_head.first_name} ${family.family_head.last_name}` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">Members:</span>
            <span className="ml-2">{family.member_count || 0}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">Created:</span>
            <span className="ml-2">{new Date(family.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditFamily(family)}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleManageMembers(family)}
            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Members
          </button>
          <button
            onClick={() => handleDeleteFamily(family.id!)}
            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const handleViewModeChange = (value: string) => {
    setViewMode(value as "grid" | "list");
  };

  const handleCreateFamily = () => {
    setModalMode('create');
    setSelectedFamily(null);
    setIsModalOpen(true);
  };

  const handleEditFamily = (family: any) => {
    setModalMode('edit');
    setSelectedFamily(family);
    setIsModalOpen(true);
  };

  const handleManageMembers = (family: any) => {
    setSelectedFamilyForMembers(family);
    setIsMemberModalOpen(true);
  };

  const handleSaveFamily = async (familyData: Family & { upload_token?: string }) => {
    try {
      setLoading(true);
      let response;
      
      if (modalMode === 'create') {
        response = await FamiliesService.createFamily(familyData);
      } else {
        response = await FamiliesService.updateFamily(selectedFamily!.id!, familyData);
      }

      if (response.success) {
        toast.success(response.message);
        setIsModalOpen(false);
        loadFamilies();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error saving family:', error);
      toast.error('Failed to save family');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFamily = async (familyId: number) => {
    if (!confirm('Are you sure you want to delete this family? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await FamiliesService.deleteFamily(familyId);
      
      if (response.success) {
        toast.success(response.message);
        loadFamilies();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error deleting family:', error);
      toast.error('Failed to delete family');
    } finally {
      setLoading(false);
    }
  };

  const followLink = async (url: string | null) => {
    if (!url) return;
    
    try {
      setLoading(true);
      const response = await FamiliesService.getByPageUrl(url);
      if (response.success && response.families) {
        setFamilies(response.families.data);
        setLinks(response.families.links || []);
      }
    } catch (error) {
      console.error('Error following link:', error);
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Families"
          description="Manage church families and their members"
          actionButton={{
            text: "Create Family",
            icon: "fas fa-plus",
            onClick: handleCreateFamily
          }}
        />

        {/* Filters and Controls */}
        <FamilyFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onFiltersChange={(filters) => {
            // Handle advanced filters here
            console.log('Advanced filters:', filters);
          }}
          onReset={() => {
            setSearchTerm('');
            setStatusFilter('All Status');
            setPage(1);
          }}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ViewToggle
              value={viewMode}
              onChange={handleViewModeChange}
              options={[
                { value: "grid", label: "Grid", icon: "grid" },
                { value: "list", label: "List", icon: "list" }
              ]}
            />
            <SelectInput
              value={String(perPage)}
              onChange={(value) => {
                setPerPage(Number(value));
                setPage(1);
              }}
              options={perPageOptions.map(opt => ({ value: String(opt.value), label: opt.label }))}
              className="w-32"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading families...</p>
          </div>
        ) : families.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <i className="fas fa-users"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No families found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'All Status' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first family'
              }
            </p>
            {!searchTerm && statusFilter === 'All Status' && (
              <button
                onClick={handleCreateFamily}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Family
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <DataGrid
                data={families}
                renderCard={renderFamilyCard}
                columns={3}
                className=""
              />
            ) : (
              <DataTable
                data={families}
                columns={tableColumns}
                className=""
              />
            )}
          </>
        )}
        
        {/* Pagination for list view */}
        {viewMode === "list" && families.length > 0 && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, total)} of {total} results
            </div>
            <div className="flex space-x-2">
              {links.map((link, index) => (
                <button
                  key={index}
                  onClick={() => followLink(link.url)}
                  disabled={!link.url || link.active}
                  className={`px-3 py-1 text-sm rounded ${
                    link.active
                      ? 'bg-blue-600 text-white cursor-default'
                      : link.url
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <FamilyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFamily}
        family={selectedFamily}
        mode={modalMode}
      />

      <FamilyMembersModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        family={selectedFamilyForMembers}
      />
    </DashboardLayout>
  );
} 