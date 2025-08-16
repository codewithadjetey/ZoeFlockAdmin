"use client";
import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, ViewToggle, DataGrid, DataTable, Button, StatCard, SearchInput, SelectInput } from "@/components/ui";
import FirstTimerModal, { FirstTimer } from "@/components/first-timers/FirstTimerModal";
import { FirstTimersService } from '@/services/firstTimers';
import { toast } from "react-toastify";

export default function FirstTimersAdminPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [firstTimers, setFirstTimers] = useState<FirstTimer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedFirstTimer, setSelectedFirstTimer] = useState<FirstTimer | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const [errors, setErrors] = useState<any>({});
  const fetchFirstTimers = async () => {
    setLoading(true);
    try {
      const res = await FirstTimersService.getFirstTimers({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: pagination.current_page,
        per_page: pagination.per_page
      });
      if (res.success) {
        setFirstTimers(res.data.data);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          total: res.data.total
        });
      } else {
        toast.error(res.message || 'Failed to load first timers');
      }
    } catch (err) {
      toast.error('Failed to load first timers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirstTimers();
    // eslint-disable-next-line
  }, [searchTerm, statusFilter, pagination.current_page]);

  const openCreate = () => {
    setModalMode('create');
    setSelectedFirstTimer(null);
    setIsModalOpen(true);
  };

  const openEdit = (ft: FirstTimer) => {
    setModalMode('edit');
    setSelectedFirstTimer(ft);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<FirstTimer>) => {
    try {
      if (modalMode === 'create') {
        const res = await FirstTimersService.createFirstTimer(data).then(res => {
          toast.success('First timer created')
        })
      } else if (selectedFirstTimer && selectedFirstTimer.id) {
        const res = await FirstTimersService.updateFirstTimer(selectedFirstTimer.id, data);
        toast.success('First timer updated');
      }

      setIsModalOpen(false);
    } catch (err: any) {
        switch (err.response.status) {
          case 429:
            toast.error(err.response.data.message || 'Failed to create');
            break;
          case 422:
            setErrors(err.response.data.errors);
            break;
          default:
            toast.error(err.response.data.message || 'Failed to create');
        }
      }
  };

  const handleDelete = async (ft: FirstTimer) => {
    if (!ft.id || !confirm(`Delete ${ft.name}?`)) return;
    try {
      const res = await FirstTimersService.deleteFirstTimer(ft.id);
      if (res.success) toast.success('First timer deleted'); else toast.error(res.message || 'Failed to delete');
      fetchFirstTimers();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete first timer');
    }
  };

  // Statistics
  const total = firstTimers.length;
  const newToday = useMemo(() => firstTimers.filter(ft => ft.created_at && new Date(ft.created_at).toDateString() === new Date().toDateString()).length, [firstTimers]);
  const converted = useMemo(() => firstTimers.filter(ft => ft.status === 'converted').length, [firstTimers]);

  // Table columns
  const tableColumns = [
    { key: "name", label: "Name", render: (_: any, ft: FirstTimer) => ft.name },
    { key: "primary_mobile_number", label: "Primary Mobile", render: (_: any, ft: FirstTimer) => ft.primary_mobile_number },
    { key: "status", label: "Status", render: (_: any, ft: FirstTimer) => ft.status || (ft.is_first_time ? "First Timer" : "Visitor") },
    { key: "invited_by", label: "Invited By", render: (_: any, ft: FirstTimer) => ft.invited_by || '-' },
    { key: "actions", label: "Actions", render: (_: any, ft: FirstTimer) => (
      <div className="flex space-x-2">
        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium" onClick={() => openEdit(ft)}>Edit</button>
        <button className="text-red-600 hover:text-red-900 text-sm font-medium" onClick={() => handleDelete(ft)}>Delete</button>
      </div>
    ) },
  ];

  const renderFirstTimerCard = (ft: FirstTimer) => (
    <div className="rounded-3xl shadow-xl p-6 cursor-pointer bg-white dark:bg-gray-800" onClick={() => openEdit(ft)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{ft.name}</h3>
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{ft.primary_mobile_number}</div>
      <div className="text-xs text-gray-400 mb-2">Invited By: {ft.invited_by || '-'}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">{ft.status || (ft.is_first_time ? "First Timer" : "Visitor")}</span>
        <button className="text-blue-600 hover:text-blue-900 text-xs font-medium" onClick={e => { e.stopPropagation(); openEdit(ft); }}>Edit</button>
      </div>
    </div>
  );

  // Filters
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'first_timer', label: 'First Timer' },
    { value: 'visitor', label: 'Visitor' },
    { value: 'converted', label: 'Converted' },
  ];

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };
  const handlePerPageChange = (perPage: number) => {
    setPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }));
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="First Timers"
        description="Manage and view all first timers and visitors."
        actionButton={{
          text: "Add First Timer",
          icon: "fas fa-user-plus",
          onClick: openCreate
        }}
      />
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon="fas fa-user-plus" iconColor="text-blue-600" iconBgColor="bg-blue-100" title="Total" value={total} description="Total First Timers" />
        <StatCard icon="fas fa-calendar-day" iconColor="text-green-600" iconBgColor="bg-green-100" title="New Today" value={newToday} description="Registered Today" />
        <StatCard icon="fas fa-user-check" iconColor="text-yellow-600" iconBgColor="bg-yellow-100" title="Converted" value={converted} description="Converted to Members" />
      </div>
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <SearchInput placeholder="Search first timers..." value={searchTerm} onChange={setSearchTerm} />
        </div>
        <SelectInput value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
      </div>
      {/* View Toggle */}
      <ViewToggle
        value={viewMode}
        onChange={v => setViewMode(v as any)}
        options={[
          { value: "table", label: "Table", icon: "fas fa-table" },
          { value: "grid", label: "Grid", icon: "fas fa-th" }
        ]}
        count={total}
        countLabel="first timers"
      />
      {/* DataTable and DataGrid */}
      {viewMode === "table" ? (
        <DataTable
          columns={tableColumns}
          data={firstTimers}
          loading={loading}
          pagination={{
            currentPage: pagination.current_page,
            totalPages: pagination.last_page,
            totalItems: pagination.total,
            perPage: pagination.per_page,
            onPageChange: handlePageChange,
            onPerPageChange: handlePerPageChange
          }}
          emptyMessage="No first timers found"
          responsive={true}
        />
      ) : (
        <DataGrid data={firstTimers} renderCard={renderFirstTimerCard} columns={4} loading={loading} />
      )}
      <FirstTimerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        firstTimer={selectedFirstTimer}
        onSave={handleSave}
        mode={modalMode}
        errors={errors}
      />
    </DashboardLayout>
  );
}