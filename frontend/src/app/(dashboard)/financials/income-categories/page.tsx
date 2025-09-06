"use client";
import { useState, useEffect } from "react";
import {
  PageHeader,
  DataTable,
  Button,
  FormField,
  TextInput
} from "@/components/ui";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataGrid from "@/components/ui/DataGrid";
import ViewToggle from "@/components/ui/ViewToggle";
import Modal from "@/components/shared/Modal";
import { IncomeCategory, PaginatedResponse } from "@/interfaces/income";
import { IncomeService } from "@/services/income";
import { toast } from 'react-toastify';

export default function IncomeCategoriesPage() {
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IncomeCategory | null>(null);
  const [form, setForm] = useState({ name: "", description: "", is_active: true });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    IncomeService.getCategories({ page: currentPage, per_page: perPage })
      .then((res) => {
        setCategories(res.data);
        setTotalItems(res.meta.total);
        setTotalPages(res.meta.last_page);
      })
      .catch(() => {
        setError("Failed to load categories.");
        toast.error('Failed to load income categories');
      })
      .finally(() => setLoading(false));
  }, [currentPage, perPage]);

  const handleOpenModal = (category?: IncomeCategory) => {
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (editingCategory) {
        const updated = await IncomeService.updateCategory(editingCategory.id, form);
        setCategories((prev) => prev.map((cat) => (cat.id === updated.id ? updated : cat)));
        toast.success('Income category updated successfully');
      } else {
        const created = await IncomeService.createCategory(form);
        setCategories((prev) => [...prev, created]);
        toast.success('Income category created successfully');
      }
      handleCloseModal();
    } catch (e: any) {
      setError("Failed to save category.");
      toast.error('Failed to save income category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setLoading(true);
    setError(null);
    try {
      await IncomeService.deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast.success('Income category deleted successfully');
    } catch (e) {
      setError("Failed to delete category.");
      toast.error('Failed to delete income category');
    } finally {
      setLoading(false);
    }
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
      render: (_: any, row: IncomeCategory) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            <i className="fas fa-edit mr-1"></i>Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
            <i className="fas fa-trash mr-1"></i>Delete
          </Button>
        </div>
      ),
    },
  ];

  const renderCategoryCard = (category: IncomeCategory) => (
    <div className="rounded-xl shadow-lg p-6 bg-white dark:bg-gray-800 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${category.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
          {category.is_active ? "Active" : "Inactive"}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{category.description || 'No description'}</p>
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => handleOpenModal(category)}>
          <i className="fas fa-edit mr-1"></i>Edit
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Income Categories"
          description="Manage categories for all your income sources."
        />
        <div className="flex justify-between items-center mb-4">
          <ViewToggle
            value={viewMode}
            onChange={(val) => setViewMode(val as 'table' | 'grid')}
            options={[
              { value: 'table', label: 'Table', icon: 'fas fa-table' },
              { value: 'grid', label: 'Grid', icon: 'fas fa-th' },
            ]}
            count={totalItems}
            countLabel="categories"
          />
          <Button onClick={() => handleOpenModal()}>
            <i className="fas fa-plus mr-2"></i>New Category
          </Button>
        </div>
        {viewMode === 'table' ? (
          <DataTable
            columns={columns}
            data={categories}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              perPage,
              onPageChange: setCurrentPage,
              onPerPageChange: (val) => {
                setPerPage(val);
                setCurrentPage(1);
              },
            }}
            emptyMessage="No income categories found."
          />
        ) : (
          <DataGrid
            data={categories}
            renderCard={renderCategoryCard}
            columns={3}
          />
        )}
        {showModal && (
          <Modal isOpen={showModal} onClose={handleCloseModal} title={editingCategory ? "Edit Category" : "New Category"} size="md">
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
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => handleFormChange("is_active", e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-sm">Active</span>
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
          </Modal>
        )}
      </div>
     </>
  );
}