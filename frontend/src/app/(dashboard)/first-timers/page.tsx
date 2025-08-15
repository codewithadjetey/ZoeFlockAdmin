"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, ViewToggle, DataGrid, DataTable, Button, StatCard } from "@/components/ui";
import FirstTimerModal, { FirstTimer } from "@/components/first-timers/FirstTimerModal";

const dummyFirstTimers: FirstTimer[] = [
  {
    id: 1,
    name: "John Doe",
    location: "Lagos",
    primary_mobile_number: "08012345678",
    secondary_mobile_number: "",
    how_was_service: "Great!",
    is_first_time: true,
    has_permanent_place_of_worship: false,
    invited_by: "Jane Smith",
    would_like_to_stay: true,
    self_registered: false,
  },
  // Add more dummy data as needed
];

export default function FirstTimersAdminPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [firstTimers, setFirstTimers] = useState<FirstTimer[]>(dummyFirstTimers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedFirstTimer, setSelectedFirstTimer] = useState<FirstTimer | null>(null);

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

  const handleSave = (data: Partial<FirstTimer>) => {
    if (modalMode === 'create') {
      setFirstTimers(prev => [...prev, { ...data, id: Date.now() } as FirstTimer]);
    } else if (selectedFirstTimer) {
      setFirstTimers(prev => prev.map(ft => ft.id === selectedFirstTimer.id ? { ...ft, ...data } as FirstTimer : ft));
    }
    setIsModalOpen(false);
  };

  const handleDelete = (ft: FirstTimer) => {
    if (!confirm(`Delete ${ft.name}?`)) return;
    setFirstTimers(prev => prev.filter(f => f.id !== ft.id));
  };

  const tableColumns = [
    { key: "name", label: "Name", render: (_: any, ft: FirstTimer) => ft.name },
    { key: "primary_mobile_number", label: "Primary Mobile", render: (_: any, ft: FirstTimer) => ft.primary_mobile_number },
    { key: "status", label: "Status", render: (_: any, ft: FirstTimer) => ft.is_first_time ? "First Timer" : "Visitor" },
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
        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">{ft.is_first_time ? "First Timer" : "Visitor"}</span>
        <button className="text-blue-600 hover:text-blue-900 text-xs font-medium" onClick={e => { e.stopPropagation(); openEdit(ft); }}>Edit</button>
      </div>
    </div>
  );

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
      {/* Optionally add statistics here */}
      <div className="mb-6">
        <ViewToggle
          value={viewMode}
          onChange={v => setViewMode(v as any)}
          options={[
            { value: "grid", label: "Grid", icon: "fas fa-th" },
            { value: "list", label: "List", icon: "fas fa-list" }
          ]}
          count={firstTimers.length}
          countLabel="first timers"
        />
      </div>
      {viewMode === "grid" ? (
        <DataGrid data={firstTimers} renderCard={renderFirstTimerCard} columns={4} />
      ) : (
        <DataTable
          columns={tableColumns}
          data={firstTimers}
          loading={false}
          emptyMessage="No first timers found"
          responsive={true}
        />
      )}
      <FirstTimerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        firstTimer={selectedFirstTimer}
        onSave={handleSave}
        mode={modalMode}
      />
    </DashboardLayout>
  );
}