"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/shared";
import { Button, SimpleInput, Checkbox, FormField } from "@/components/ui";
import { toast } from 'react-toastify';
import { api } from "@/utils/api";

interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  permissions: Array<{
    id: number;
    name: string;
    display_name: string;
  }>;
}

interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
}

interface RoleModalProps {
  isOpen: boolean;
  role: Role | null;
  permissions: Permission[];
  onClose: () => void;
  onSuccess: (role: Role) => void;
}

const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  role,
  permissions,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    display_name: "",
    description: "",
    permissions: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!role;

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        display_name: role.display_name,
        description: role.description || "",
        permissions: role.permissions.map((permission) => permission.name),
      });
    } else {
      setFormData({
        name: "",
        display_name: "",
        description: "",
        permissions: [],
      });
    }
    setErrors({});
  }, [role, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionName]
        : prev.permissions.filter((permission) => permission !== permissionName),
    }));
  };

  const handleSelectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: permissions.map((permission) => permission.name),
    }));
  };

  const handleClearAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    } else if (!/^[a-z0-9_-]+$/.test(formData.name)) {
      newErrors.name = "Role name can only contain lowercase letters, numbers, hyphens, and underscores";
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = "Display name is required";
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = "At least one permission is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let response;
      if (isEditing) {
        response = await api.put(`/roles/${role.id}`, formData);
      } else {
        response = await api.post("/roles", formData);
      }

      if (response.data.success) {
        onSuccess(response.data.data);
        toast.success(`Role ${isEditing ? 'updated' : 'created'} successfully`);
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || "Error saving role");
      }
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const module = permission.name.split('-')[0];
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);

  const getModuleDisplayName = (module: string) => {
    const moduleNames: Record<string, string> = {
      'view': 'View',
      'create': 'Create',
      'edit': 'Edit',
      'delete': 'Delete',
      'user': 'User Management',
      'member': 'Member Management',
      'group': 'Group Management',
      'event': 'Event Management',
      'donation': 'Donation Management',
      'communication': 'Communication Management',
      'setting': 'Settings Management',
      'role': 'Role Management',
      'permission': 'Permission Management',
    };
    return moduleNames[module] || module.charAt(0).toUpperCase() + module.slice(1);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Role" : "Create New Role"}
      size="xxl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Role Name *" error={errors.name}>
            <SimpleInput
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., moderator, editor"
              disabled={isEditing && ['admin', 'pastor', 'member'].includes(role?.name || '')}
            />
            <p className="text-xs text-gray-500 mt-1">
              Lowercase letters, numbers, hyphens, and underscores only
            </p>
          </FormField>

          <FormField label="Display Name *" error={errors.display_name}>
            <SimpleInput
              value={formData.display_name}
              onChange={(e) => handleInputChange("display_name", e.target.value)}
              placeholder="e.g., Moderator, Editor"
            />
          </FormField>
        </div>

        <FormField label="Description" error={errors.description}>
          <SimpleInput
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe the role's purpose and responsibilities"
          />
        </FormField>

        <FormField label="Permissions *" error={errors.permissions}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSelectAllPermissions}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClearAllPermissions}
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
              <div key={module} className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm border-b border-gray-200 pb-1">
                  {getModuleDisplayName(module)}
                </h4>
                <div className="space-y-2">
                  {modulePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center">
                      <Checkbox
                        checked={formData.permissions.includes(permission.name)}
                        onChange={(e) => handlePermissionChange(permission.name, e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {permission.display_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FormField>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Role' : 'Create Role')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleModal; 