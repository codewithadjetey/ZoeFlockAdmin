"use client";

import React, { useState, useEffect } from 'react';
import { Button, DataTable, PageHeader } from '@/components/ui';
import { TitheModal } from '@/components/tithes/TitheModal';
import { TithePaymentModal } from '@/components/tithes/TithePaymentModal';
import { TitheFilters } from '@/components/tithes/TitheFilters';
import { useToast } from '@/hooks/useToast';
import { titheService } from '@/services/tithes';
import { Tithe, TitheFilters as TitheFiltersType, TitheStatistics, TITHE_FREQUENCIES, TITHE_STATUSES } from '@/interfaces';
import { formatCurrency, formatDate } from '@/utils/helpers';


export default function TithesPage() {
  const { showToast } = useToast();
  const [tithes, setTithes] = useState<Tithe[]>([]);
  const [statistics, setStatistics] = useState<TitheStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<TitheFiltersType>({});
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTithe, setSelectedTithe] = useState<Tithe | null>(null);

  useEffect(() => {
    loadTithes();
    loadStatistics();
  }, [currentPage, filters]);

  const loadTithes = async () => {
    try {
      setLoading(true);
      const response = await titheService.getTithes(filters, currentPage);
      setTithes(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || 0);
    } catch (error: any) {
      console.error('Error loading tithes:', error);
      showToast(error.response?.data?.message || 'Error loading tithes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await titheService.getTitheStatistics({
        start_date: filters.start_date,
        end_date: filters.end_date,
      });
      setStatistics(response.data.data);
    } catch (error: any) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleCreateSuccess = () => {
    loadTithes();
    loadStatistics();
  };

  const handleEditSuccess = () => {
    loadTithes();
    loadStatistics();
  };

  const handlePaymentSuccess = () => {
    loadTithes();
    loadStatistics();
  };

  const handleEdit = (tithe: Tithe) => {
    setSelectedTithe(tithe);
    setShowEditModal(true);
  };

  const handleMarkPaid = async (tithe: Tithe) => {
    if (!confirm(`Are you sure you want to mark this tithe as fully paid? This will mark the remaining amount of $${tithe.remaining_amount} as paid.`)) return;

    try {
      // Mark the tithe as fully paid with the remaining amount
      await titheService.markTitheAsPaid(tithe.id, {
        paid_amount: tithe.remaining_amount,
        notes: 'Marked as fully paid'
      });
      
      showToast('Tithe marked as fully paid successfully', 'success');
      loadTithes();
      loadStatistics();
    } catch (error: any) {
      console.error('Error marking tithe as paid:', error);
      showToast(error.response?.data?.message || 'Error marking tithe as paid', 'error');
    }
  };

  const handleAddPayment = (tithe: Tithe) => {
    setSelectedTithe(tithe);
    setShowPaymentModal(true);
  };

  const handleDelete = async (tithe: Tithe) => {
    if (!confirm('Are you sure you want to delete this tithe?')) return;

    try {
      await titheService.deleteTithe(tithe.id);
      showToast('Tithe deleted successfully', 'success');
      loadTithes();
      loadStatistics();
    } catch (error: any) {
      console.error('Error deleting tithe:', error);
      showToast(error.response?.data?.message || 'Error deleting tithe', 'error');
    }
  };

  const handleFiltersChange = (newFilters: TitheFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleFiltersReset = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const getStatusBadge = (tithe: Tithe) => {
    let status = tithe.is_paid ? 'paid' : 'unpaid';
    if (!tithe.is_paid && new Date(tithe.next_due_date) < new Date()) {
      status = 'overdue';
    } else if (tithe.paid_amount > 0 && tithe.remaining_amount > 0) {
      status = 'partially_paid';
    }

    const statusConfig = {
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      unpaid: { label: 'Unpaid', className: 'bg-yellow-100 text-yellow-800' },
      overdue: { label: 'Overdue', className: 'bg-red-100 text-red-800' },
      partially_paid: { label: 'Partially Paid', className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentProgress = (tithe: Tithe) => {
    const progress = tithe.amount > 0 ? (tithe.paid_amount / tithe.amount) * 100 : 0;
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>${tithe.paid_amount}</span>
          <span>${tithe.amount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {progress.toFixed(1)}% complete
        </div>
      </div>
    );
  };

  const columns = [
    {
      key: 'member',
      label: 'Member',
      render: (value: any, row: any) => (
        <div className="font-medium text-gray-900">
          {row.member ? 
            `${row.member.first_name} ${row.member.last_name}` : 
            'Unknown Member'
          }
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: any, row: any) => (
        <div className="font-medium text-gray-900">
          {formatCurrency(row.amount)}
        </div>
      ),
    },
    {
      key: 'payment_progress',
      label: 'Payment Progress',
      render: (value: any, row: any) => getPaymentProgress(row),
    },
    {
      key: 'frequency',
      label: 'Frequency',
      render: (value: any, row: any) => (
        <span className="capitalize text-gray-600">
          {TITHE_FREQUENCIES[row.frequency as keyof typeof TITHE_FREQUENCIES] || row.frequency}
        </span>
      ),
    },
    {
      key: 'start_date',
      label: 'Start Date',
      render: (value: any, row: any) => (
        <span className="text-gray-600">
          {formatDate(row.start_date)}
        </span>
      ),
    },
    {
      key: 'next_due_date',
      label: 'Next Due',
      render: (value: any, row: any) => (
        <span className="text-gray-600">
          {formatDate(row.next_due_date)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => getStatusBadge(row),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          {!row.is_paid && row.remaining_amount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAddPayment(row)}
            >
              Add Payment
            </Button>
          )}
          {!row.is_paid && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMarkPaid(row)}
            >
              Mark Paid
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Tithe Management"
        description="Manage church member tithes and recurring payments"
      />
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tithe Management</h1>
          <p className="text-gray-600">Manage church member tithes and recurring payments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <i className="fas fa-plus mr-2"></i>
          Create Tithe
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="fas fa-church text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tithes</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_tithes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <i className="fas fa-check-circle text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.total_paid_amount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <i className="fas fa-exclamation-triangle text-yellow-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.total_outstanding)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <i className="fas fa-clock text-red-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.overdue_tithes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="fas fa-percentage text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Partially Paid</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.partially_paid_tithes || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <TitheFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      {/* Tithes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={columns}
          data={tithes}
          loading={loading}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            perPage: 15,
            onPageChange: setCurrentPage,
            onPerPageChange: () => {},
          }}
        />
      </div>

      {/* Modals */}
      <TitheModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        mode="create"
      />

      <TitheModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        tithe={selectedTithe || undefined}
        mode="edit"
      />

      <TithePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        tithe={selectedTithe}
      />
    </div>
    </>
  );
} 