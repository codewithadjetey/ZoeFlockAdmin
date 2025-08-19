"use client";
import { useState } from "react";
import {
  PageHeader,
  DataTable,
  Button,
  FormField,
  TextInput,
  Switch,
} from "@/components/ui";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

const mockCategories: ExpenseCategory[] = [
  { id: 1, name: "Utilities", description: "Electricity, water, etc.", is_active: true },
  { id: 2, name: "Salaries", description: "Staff and payroll", is_active: true },
  { id: 3, name: "Maintenance", description: "Repairs and maintenance", is_active: false },
];

export default function ExpensesCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>(mockCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [form, setForm] = useState({ name: "", description: "", is_active: true });

  const handleOpenModal = (category?: ExpenseCategory) => {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        description: category.description || "",
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      setForm({ name: "", description: "", is_active: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setForm({ name: "", description: "", is_active: true });
  };

  const handleFormChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, ...form } : cat
        )
      );
    } else {
      setCategories((prev) => [
        ...prev,
        { id: prev.length + 1, ...form },
      ]);
    }
    handleCloseModal();
  };

  const columns = [
    { key: "name", label: "Category Name" },
    { key: "description", label: "Description" },
    {
      key: "is_active",
      label: "Active",
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${value ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: ExpenseCategory) => (
        <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
          <i className="fas fa-edit mr-1"></i>Edit
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Expenses Categories"
          description="Manage categories for all your expenses."
        />
        <div className="flex justify-end mb-4">
          <Button onClick={() => handleOpenModal()}>
            <i className="fas fa-plus mr-2"></i>New Category
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={categories}
          emptyMessage="No expense categories found."
        />
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">
                {editingCategory ? "Edit Category" : "New Category"}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-4"
              >
                <FormField label="Category Name" required>
                  <TextInput
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Description">
                  <TextInput
                    value={form.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                  />
                </FormField>
                <FormField label="Active">
                  <Switch
                    checked={form.is_active}
                    onChange={(checked) => handleFormChange("is_active", checked)}
                  />
                </FormField>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={handleCloseModal} type="button">
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCategory ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}