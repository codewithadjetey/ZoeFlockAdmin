"use client";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { Button, DataTable, SearchInput, Alert } from "@/components/ui";
import RoleModal from "@/components/admin/RoleModal";
import { useToast } from "@/hooks/useToast";
import { api } from "@/utils/api";

interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  created_at: string;
  permissions: Array<{
    id: number;
    name: string;
    display_name: string;
  }>;
  users_count: number;
}

interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
}

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);
  const { showToast } = useToast();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [currentPage, searchTerm]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await api.get(`/roles?${params}`);
      if (response.data.success) {
        setRoles(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      }
    } catch (error) {
      showToast("Error fetching roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get("/roles/permissions");
      if (response.data.success) {
        setPermissions(response.data.data);
      }
    } catch (error) {
      showToast("Error fetching permissions", "error");
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await api.delete(`/roles/${roleId}`);
      if (response.data.success) {
        showToast("Role deleted successfully", "success");
        fetchRoles();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Error deleting role", "error");
    }
  };

  const handleDuplicateRole = async (roleId: number) => {
    try {
      const response = await api.post(`/roles/${roleId}/duplicate`);
      if (response.data.success) {
        showToast("Role duplicated successfully", "success");
        fetchRoles();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Error duplicating role", "error");
    }
  };

  const columns = [
    {
      key: "display_name",
      label: "Role",
      render: (value: any, row: Role) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <i className="fas fa-shield-alt text-purple-600 text-sm"></i>
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.display_name}</div>
            <div className="text-sm text-gray-500">{row.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value: any, row: Role) => row.description || "No description",
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (value: any, row: Role) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions.slice(0, 3).map((permission: any) => (
            <span
              key={permission.id}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
            >
              {permission.display_name}
            </span>
          ))}
          {row.permissions.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
              +{row.permissions.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: "users_count",
      label: "Users",
      render: (value: any, row: Role) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {row.users_count || 0}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (value: any, row: Role) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: Role) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditRole(row)}
          >
            <i className="fas fa-edit mr-1"></i>
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDuplicateRole(row.id)}
          >
            <i className="fas fa-copy mr-1"></i>
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteRole(row.id)}
            disabled={row.users_count > 0}
          >
            <i className="fas fa-trash mr-1"></i>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-600 mt-2">
              Manage user roles and their associated permissions
            </p>
          </div>
          <Button onClick={handleCreateRole}>
            <i className="fas fa-plus mr-2"></i>
            Add Role
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Roles
              </label>
              <SearchInput
                placeholder="Search by name, display name, or description..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
              >
                <i className="fas fa-times mr-2"></i>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <DataTable
            columns={columns}
            data={roles}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              totalItems: roles.length * totalPages, // Estimate total items
              perPage,
              onPageChange: setCurrentPage,
              onPerPageChange: () => {}, // Not implemented yet
            }}
          />
        </div>

        {/* Role Modal */}
        {showRoleModal && (
          <RoleModal
            isOpen={showRoleModal}
            role={editingRole}
            permissions={permissions}
            onClose={() => setShowRoleModal(false)}
            onSuccess={(role) => {
              setShowRoleModal(false);
              fetchRoles();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default RolesPage; 