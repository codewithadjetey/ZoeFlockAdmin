"use client";
import React, { useState, useEffect } from "react";

import { Button, DataTable, SearchInput, Alert } from "@/components/ui";
import UserModal from "@/components/admin/UserModal";
import PasswordUpdateModal from "@/components/admin/PasswordUpdateModal";
import { toast } from 'react-toastify';
import { formatDateForInput } from "@/utils/helpers";
import { User, Role } from "@/interfaces";
import { UsersService } from '@/services/users';
import { RolesService } from '@/services/roles';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [currentPage, searchTerm, selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UsersService.getUsers({
        page: currentPage,
        per_page: perPage,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole && { role: selectedRole }),
      });
      
      if (response.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.last_page);
      }
    } catch (error) {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await RolesService.getRoles();
      if (response.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      toast.error("Error fetching roles");
    }
  };

  const handleCreateUser = () => {
    setEditingUser(undefined);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await UsersService.deleteUser(userId);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        toast.error("Error deleting user");
      }
    }
  };

  const handleUpdatePassword = (user: User) => {
    setSelectedUserForPassword(user);
    setShowPasswordModal(true);
  };

  const handlePasswordUpdateSuccess = () => {
    setShowPasswordModal(false);
    setSelectedUserForPassword(null);
    fetchUsers();
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const response = await UsersService.toggleUserStatus(userId);
      if (response.success) {
        toast.success("User status updated successfully");
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error updating user status");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value: any, row: User) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <i className="fas fa-user text-blue-600 text-sm"></i>
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (value: any, row: User) => row.phone || "N/A",
    },
    {
      key: "date_of_birth",
      label: "Date of Birth",
      render: (value: any, row: User) => row.date_of_birth ? formatDateForInput(row.date_of_birth) : "N/A",
    },
    {
      key: "roles",
      label: "Roles",
      render: (value: any, row: User) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((role: any) => (
            <span
              key={role.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {role.display_name}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (value: any, row: User) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (value: any, row: User) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: User) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditUser(row)}
          >
            <i className="fas fa-edit mr-1"></i>
            Edit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleUpdatePassword(row)}
          >
            <i className="fas fa-key mr-1"></i>
            Password
          </Button>
          <Button
            size="sm"
            variant={row.is_active ? "danger" : "primary"}
            onClick={() => handleToggleStatus(row.id)}
          >
            <i className={`fas fa-${row.is_active ? 'ban' : 'check'} mr-1`}></i>
            {row.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteUser(row.id)}
          >
            <i className="fas fa-trash mr-1"></i>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">
              Manage system users, roles, and permissions
            </p>
          </div>
          <Button onClick={handleCreateUser}>
            <i className="fas fa-plus mr-2"></i>
            Add User
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <SearchInput
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRole("");
                }}
              >
                <i className="fas fa-times mr-2"></i>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              totalItems: users.length * totalPages, // Estimate total items
              perPage,
              onPageChange: setCurrentPage,
              onPerPageChange: () => {}, // Not implemented yet
            }}
          />
        </div>

        {/* User Modal */}
        {showUserModal && (
          <UserModal
            isOpen={showUserModal}
            user={editingUser}
            roles={roles}
            onClose={() => setShowUserModal(false)}
            onSuccess={(user) => {
              setShowUserModal(false);
              fetchUsers();
            }}
          />
        )}

        {/* Password Update Modal */}
        {showPasswordModal && (
          <PasswordUpdateModal
            isOpen={showPasswordModal}
            user={selectedUserForPassword}
            onClose={() => setShowPasswordModal(false)}
            onSuccess={handlePasswordUpdateSuccess}
          />
        )}
      </div>
    </>
  );
};

export default UsersPage; 