'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PartnershipsService, Partnership } from '@/services/partnerships';
import { PartnershipModal } from '@/components/partnerships/PartnershipModal';
import Button from '@/components/ui/Button';

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const loadPartnerships = async () => {
    setLoading(true);
    try {
      const data = await PartnershipsService.list({ search, page, per_page: perPage });
      setPartnerships(data.data.data || data);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerships();
    // eslint-disable-next-line
  }, [search, page, perPage]);

  const handleAdd = () => {
    setModalMode('create');
    setSelectedPartnership(null);
    setIsModalOpen(true);
  };

  const handleEdit = (partnership: Partnership) => {
    setModalMode('edit');
    setSelectedPartnership(partnership);
    setIsModalOpen(true);
  };

  const handleDelete = async (partnership: Partnership) => {
    if (window.confirm('Are you sure you want to delete this partnership?')) {
      await PartnershipsService.delete(partnership.id);
      loadPartnerships();
    }
  };

  const handleSave = () => {
    loadPartnerships();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Partnerships</h1>
          <Button variant="primary" onClick={handleAdd}>Add Partnership</Button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : partnerships.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No partnerships found.</td></tr>
              ) : (
                partnerships.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{p.member?.first_name} {p.member?.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{p.category?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{p.pledge_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{p.frequency}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{p.start_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{p.end_date || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(p)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(p)}>Delete</Button>
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
        <PartnershipModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          partnership={selectedPartnership}
          onSave={handleSave}
          mode={modalMode}
        />
      </div>
    </DashboardLayout>
  );
}