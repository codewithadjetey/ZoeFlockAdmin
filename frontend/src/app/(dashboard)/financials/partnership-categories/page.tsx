'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PartnershipCategoriesService, PartnershipCategory } from '@/services/partnershipCategories';
import { PartnershipCategoryModal } from '@/components/partnerships/PartnershipCategoryModal';
import Button from '@/components/ui/Button';

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
    setIsModalOpen(true);
  };

  const handleEdit = (category: PartnershipCategory) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (category: PartnershipCategory) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await PartnershipCategoriesService.delete(category.id);
      loadCategories();
    }
  };

  const handleSave = async (data: PartnershipCategory) => {
    if (modalMode === 'create') {
      await PartnershipCategoriesService.create(data);
    } else if (selectedCategory) {
      await PartnershipCategoriesService.update(selectedCategory.id, data);
    }
    setIsModalOpen(false);
    loadCategories();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Partnership Category</h1>
          <Button variant="primary" onClick={handleAdd}>Add Category</Button>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded border px-3 py-2 w-64"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-gray-400">No categories found.</td></tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{c.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(c)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(c)}>Delete</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-end items-center gap-2 mt-4">
          <span>Page</span>
          <input
            type="number"
            min={1}
            value={page}
            onChange={e => setPage(Number(e.target.value))}
            className="w-16 rounded border px-2 py-1"
          />
          <span>of {Math.ceil(total / perPage) || 1}</span>
          <select value={perPage} onChange={e => setPerPage(Number(e.target.value))} className="rounded border px-2 py-1">
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
        <PartnershipCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          category={selectedCategory}
          onSave={handleSave}
          mode={modalMode}
        />
      </div>
    </DashboardLayout>
  );
}