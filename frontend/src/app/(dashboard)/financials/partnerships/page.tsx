'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PartnershipsService, Partnership } from '@/services/partnerships';
import { PartnershipModal } from '@/components/partnerships/PartnershipModal';
import Button from '@/components/ui/Button';
import DataTable, { Column } from '@/components/ui/DataTable';
import { formatCurrency, formatDate } from '@/utils/helpers';
import StatCard from '@/components/ui/StatCard';
import ViewToggle from '@/components/ui/ViewToggle';
import ContentCard from '@/components/ui/ContentCard';

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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const loadPartnerships = async () => {
    setLoading(true);
    try {
      const response = await PartnershipsService.list({ search, page, per_page: perPage });
      const paginated = response.data;
      setPartnerships(paginated.data || []);
      setTotal(paginated.total || 0);
      setPage(paginated.current_page || 1);
      setPerPage(paginated.per_page || 10);
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

  // Statistics
  const totalPledged = partnerships.reduce((sum, p) => sum + (p.pledge_amount || 0), 0);
  const activeCount = partnerships.filter(p => p.status === 'active').length;
  const completedCount = partnerships.filter(p => p.status === 'completed').length;

  // DataTable columns
  const columns: Column<Partnership>[] = [
    {
      key: 'member',
      label: 'Member',
      render: (v, row) => `${row.member?.first_name || ''} ${row.member?.last_name || ''}`.trim(),
    },
    {
      key: 'category',
      label: 'Category',
      render: (v, row) => row.category?.name || '',
    },
    {
      key: 'pledge_amount',
      label: 'Amount',
      render: (v, row) => formatCurrency(row.pledge_amount || 0),
    },
    {
      key: 'frequency',
      label: 'Frequency',
      render: (v, row) => row.frequency.charAt(0).toUpperCase() + row.frequency.slice(1),
    },
    {
      key: 'start_date',
      label: 'Start Date',
      render: (v, row) => formatDate(row.start_date),
    },
    {
      key: 'end_date',
      label: 'End Date',
      render: (v, row) => row.end_date ? formatDate(row.end_date) : '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (v, row) => (
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
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatCard
            icon="fas fa-users"
            iconColor="text-blue-500"
            iconBgColor="bg-blue-100"
            title="Total Partnerships"
            value={partnerships.length}
            description="Total Partnerships"
          />
          <StatCard
            icon="fas fa-hand-holding-usd"
            iconColor="text-green-500"
            iconBgColor="bg-green-100"
            title="Total Pledged"
            value={formatCurrency(totalPledged)}
            description="Total Pledged Amount"
          />
          <StatCard
            icon="fas fa-check-circle"
            iconColor="text-purple-500"
            iconBgColor="bg-purple-100"
            title="Active / Completed"
            value={`${activeCount} / ${completedCount}`}
            description="Active / Completed Partnerships"
          />
        </div>
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
        <ViewToggle
          value={viewMode}
          onChange={val => setViewMode(val as 'table' | 'grid')}
          options={[
            { value: 'table', label: 'Table', icon: 'fas fa-table' },
            { value: 'grid', label: 'Grid', icon: 'fas fa-th-large' },
          ]}
          count={partnerships.length}
          countLabel="Partnerships"
        />
        {viewMode === 'table' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-0 overflow-x-auto">
            <DataTable
              columns={columns}
              data={partnerships}
              loading={loading}
              emptyMessage="No partnerships found."
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {partnerships.map((p) => (
              <ContentCard key={p.id}>
                <div className="flex flex-col gap-2">
                  <div className="font-semibold text-lg">{p.member?.first_name} {p.member?.last_name}</div>
                  <div className="text-gray-500">{p.category?.name}</div>
                  <div className="text-gray-700 font-bold">{formatCurrency(p.pledge_amount || 0)}</div>
                  <div className="text-xs text-gray-400">Frequency: {p.frequency.charAt(0).toUpperCase() + p.frequency.slice(1)}</div>
                  <div className="text-xs text-gray-400">Due: {p.due_date}</div>
                  {p.start_date && <div className="text-xs text-gray-400">Start: {p.start_date}</div>}
                  {p.end_date && <div className="text-xs text-gray-400">End: {p.end_date}</div>}
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(p)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(p)}>Delete</Button>
                  </div>
                </div>
              </ContentCard>
            ))}
            {partnerships.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-8">No partnerships found.</div>
            )}
          </div>
        )}
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