'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PartnershipCategoriesService, PartnershipCategory } from '@/services/partnershipCategories';
import { PartnershipCategoryModal } from '@/components/partnerships/PartnershipCategoryModal';
import Button from '@/components/ui/Button';
import DataTable, { Column } from '@/components/ui/DataTable';
import TextInput from '@/components/ui/TextInput';
import Textarea from '@/components/ui/Textarea';
import { toast } from 'react-toastify';

export default function PartnershipCategoriesPage() {
  const [categories, setCategories] = useState<PartnershipCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<PartnershipCategory | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [errors, setErrors] = useState<any>({});

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await PartnershipCategoriesService.list({ search, page, per_page: perPage });
      setCategories(data.data || data);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line
  }, [search, page, perPage]);

  const handleAdd = () => {
    setModalMode('create');
    setSelectedCategory(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (category: PartnershipCategory) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (category: PartnershipCategory) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await PartnershipCategoriesService.delete(category.id);
      loadCategories();
    }
  };

  const handleSave = async (data: PartnershipCategory) => {
   try {
    if (modalMode === 'create') {
      await PartnershipCategoriesService.create(data);
    } else if (selectedCategory) {
      await PartnershipCategoriesService.update(selectedCategory.id, data);
    }
   
   } catch (error: any) {
    switch (error.response.status) {
      case 422:
        setErrors(error.response.data.errors);
        toast.error(error.response.data.message);
        break;
      default:
        setErrors({});
        toast.error(error.response.data.message || 'An error occurred');
    }
   }
   setIsModalOpen(false);
   loadCategories();

  };

  // Define columns for DataTable
  const columns: Column<PartnershipCategory>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description' },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => handleEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Partnership Category</h1>
          <Button variant="primary" onClick={handleAdd}>Add Category</Button>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <TextInput
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-0 overflow-x-auto">
          <DataTable
            columns={columns}
            data={categories}
            loading={loading}
            emptyMessage="No categories found."
            pagination={{
              currentPage: page,
              totalPages: Math.ceil(total / perPage) || 1,
              totalItems: total,
              perPage: perPage,
              onPageChange: setPage,
              onPerPageChange: setPerPage,
            }}
            showPagination={true}
            showPerPageSelector={true}
          />
        </div>
        <PartnershipCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          category={selectedCategory}
          onSave={handleSave}
          mode={modalMode}
          TextInput={TextInput}
          Textarea={Textarea}
          errors={errors}
        />
      </div>
    </DashboardLayout>
  );
}