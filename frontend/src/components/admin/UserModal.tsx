"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/shared";
import { FormField, SimpleInput, SimpleSelect, Checkbox, Button } from "@/components/ui";
import { formatDateForInput } from "@/utils/helpers";
import { toast } from 'react-toastify';
import { api } from "@/utils/api";
import { User, Role } from "@/interfaces";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  user?: User;
  roles: Role[];
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  user,
  roles,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    date_of_birth: "" as string,
    gender: "",
    is_active: true,
    roles: [] as string[],
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        date_of_birth: formatDateForInput(user.date_of_birth),
        gender: user.gender || "",
        is_active: user.is_active,
        roles: user.roles.map((role) => role.name),
        password: "",
        password_confirmation: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        date_of_birth: "",
        gender: "",
        is_active: true,
        roles: [],
        password: "",
        password_confirmation: "",
      });
    }
    setErrors({});
  }, [user, isOpen]);

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

  const handleRoleChange = (roleName: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      roles: checked
        ? [...prev.roles, roleName]
        : prev.roles.filter((role) => role !== roleName),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!isEditing && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    if (formData.roles.length === 0) {
      newErrors.roles = "At least one role is required";
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

      const submitData = { ...formData };
      if (!formData.password) {
        delete (submitData as any).password;
        delete (submitData as any).password_confirmation;
      }

      // Handle date_of_birth - ensure it's properly formatted or null
      if (submitData.date_of_birth === '') {
        submitData.date_of_birth = '';
      }

      // Debug logging
      console.log('Form data before submission:', formData);
      console.log('Submit data:', submitData);
      console.log('Date of birth value:', submitData.date_of_birth);
      console.log('Date of birth type:', typeof submitData.date_of_birth);

      let response;
      if (isEditing) {
        response = await api.put(`/users/${user.id}`, submitData);
      } else {
        response = await api.post("/users", submitData);
      }

      if (response.data.success) {
        onSuccess(response.data.data);
        toast.success(`User ${isEditing ? 'updated' : 'created'} successfully`);
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(
          error.response?.data?.message || "Error saving user"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit User" : "Create New User"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name *" error={errors.name}>
            <SimpleInput
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter full name"
            />
          </FormField>

          <FormField label="Email *" error={errors.email}>
            <SimpleInput
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
            />
          </FormField>

          <FormField label="Phone" error={errors.phone}>
            <SimpleInput
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
            />
          </FormField>

          <FormField label="Gender" error={errors.gender}>
            <SimpleSelect
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </SimpleSelect>
          </FormField>

          <FormField label="Date of Birth" error={errors.date_of_birth}>
            <SimpleInput
              type="date"
              value={formatDateForInput(formData.date_of_birth)}
              onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
            />
          </FormField>

          <FormField label="Status">
            <div className="flex items-center">
              <Checkbox
                checked={formData.is_active}
                onChange={(e) => handleInputChange("is_active", e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </div>
          </FormField>
        </div>

        <FormField label="Address" error={errors.address}>
          <SimpleInput
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Enter address"
          />
        </FormField>

        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Password *" error={errors.password}>
              <SimpleInput
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter password"
              />
            </FormField>

            <FormField label="Confirm Password *" error={errors.password_confirmation}>
              <SimpleInput
                type="password"
                value={formData.password_confirmation}
                onChange={(e) =>
                  handleInputChange("password_confirmation", e.target.value)
                }
                placeholder="Confirm password"
              />
            </FormField>
          </div>
        )}

        <FormField label="Roles *" error={errors.roles}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center">
                <Checkbox
                  checked={formData.roles.includes(role.name)}
                  onChange={(e) => handleRoleChange(role.name, e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">
                  {role.display_name}
                </span>
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
            {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal; 