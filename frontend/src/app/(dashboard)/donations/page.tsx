"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  PageHeader, 
  SearchInput, 
  SelectInput, 
  ViewToggle, 
  DataGrid, 
  DataTable,
  StatCard,
  StatusBadge 
} from "@/components/ui";

export default function DonationsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const donations = [
    {
      id: 1,
      donor: "Sarah Johnson",
      email: "sarah@example.com",
      amount: 150.00,
      type: "Tithe",
      date: "2024-03-15",
      status: "Completed",
      method: "Online",
      reference: "TXN-001",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 2,
      donor: "John Smith",
      email: "john@example.com",
      amount: 75.50,
      type: "Offering",
      date: "2024-03-14",
      status: "Completed",
      method: "Cash",
      reference: "TXN-002",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 3,
      donor: "Emily Davis",
      email: "emily@example.com",
      amount: 200.00,
      type: "Building Fund",
      date: "2024-03-13",
      status: "Pending",
      method: "Check",
      reference: "TXN-003",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 4,
      donor: "Michael Brown",
      email: "michael@example.com",
      amount: 50.00,
      type: "Tithe",
      date: "2024-03-12",
      status: "Completed",
      method: "Online",
      reference: "TXN-004",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 5,
      donor: "Lisa Wilson",
      email: "lisa@example.com",
      amount: 300.00,
      type: "Missions",
      date: "2024-03-11",
      status: "Completed",
      method: "Online",
      reference: "TXN-005",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 6,
      donor: "David Miller",
      email: "david@example.com",
      amount: 125.75,
      type: "Offering",
      date: "2024-03-10",
      status: "Failed",
      method: "Online",
      reference: "TXN-006",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face",
    },
  ];

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch = donation.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All Types" || donation.type === typeFilter;
    const matchesStatus = statusFilter === "All Status" || donation.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalAmount = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const completedDonations = filteredDonations.filter(d => d.status === "Completed").length;
  const pendingDonations = filteredDonations.filter(d => d.status === "Pending").length;

  const typeOptions = [
    { value: "All Types", label: "All Types" },
    { value: "Tithe", label: "Tithe" },
    { value: "Offering", label: "Offering" },
    { value: "Building Fund", label: "Building Fund" },
    { value: "Missions", label: "Missions" },
  ];

  const statusOptions = [
    { value: "All Status", label: "All Status" },
    { value: "Completed", label: "Completed" },
    { value: "Pending", label: "Pending" },
    { value: "Failed", label: "Failed" },
  ];

  const viewToggleOptions = [
    { value: "grid", label: "Grid", icon: "fas fa-th" },
    { value: "list", label: "List", icon: "fas fa-list" },
  ];

  const tableColumns = [
    { key: "donor", label: "Donor", render: (_: any, donation: any) => (
      <div className="flex items-center">
        <img
          src={donation.avatar}
          alt={donation.donor}
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{donation.donor}</div>
          <div className="text-sm text-gray-500">{donation.email}</div>
        </div>
      </div>
    )},
    { key: "amount", label: "Amount", render: (amount: any) => `$${amount.toFixed(2)}` },
    { key: "type", label: "Type" },
    { key: "method", label: "Method" },
    { key: "status", label: "Status", render: (status: any) => <StatusBadge status={status} /> },
    { key: "date", label: "Date", render: (date: any) => new Date(date).toLocaleDateString() },
    { key: "actions", label: "Actions", render: () => (
      <div className="text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
        <button className="text-red-600 hover:text-red-900">Delete</button>
      </div>
    )},
  ];

  const renderDonationCard = (donation: any) => (
    <div className="member-card rounded-2xl shadow-lg p-6 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            src={donation.avatar}
            alt={donation.donor}
            className="w-12 h-12 rounded-full border-2 border-white shadow-md"
          />
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{donation.donor}</h3>
            <p className="text-sm text-gray-500">{donation.email}</p>
          </div>
        </div>
        <StatusBadge status={donation.status} />
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="text-lg font-bold text-green-600">${donation.amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Type:</span>
          <span className="text-sm font-medium text-gray-900">{donation.type}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Method:</span>
          <span className="text-sm text-gray-900">{donation.method}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Date:</span>
          <span className="text-sm text-gray-900">
            {new Date(donation.date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Reference:</span>
          <span className="text-xs text-gray-500 font-mono">{donation.reference}</span>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button className="text-blue-600 hover:text-blue-700 text-sm">
          <i className="fas fa-eye mr-1"></i>View
        </button>
        <button className="text-red-600 hover:text-red-700 text-sm">
          <i className="fas fa-trash mr-1"></i>Delete
        </button>
      </div>
    </div>
  );

  const handleViewModeChange = (value: string) => {
    setViewMode(value as "grid" | "list");
  };

  return (
    <>>
      <PageHeader
        title="Donations"
        description="Track and manage church donations"
        actionButton={{
          text: "Record Donation",
          icon: "fas fa-plus",
          onClick: () => console.log("Record donation clicked")
        }}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Amount"
          value={`$${totalAmount.toFixed(2)}`}
          description="Total donations"
          icon="fas fa-dollar-sign"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Completed"
          value={completedDonations.toString()}
          description="Completed donations"
          icon="fas fa-check-circle"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="Pending"
          value={pendingDonations.toString()}
          description="Pending donations"
          icon="fas fa-clock"
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <SearchInput
            placeholder="Search donations..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <SelectInput
          value={typeFilter}
          onChange={setTypeFilter}
          options={typeOptions}
        />
        <SelectInput
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
      </div>

      {/* View Toggle */}
      <ViewToggle
        value={viewMode}
        onChange={handleViewModeChange}
        options={viewToggleOptions}
        count={filteredDonations.length}
        countLabel="donations"
      />

      {/* Donations Grid/List */}
      {viewMode === "grid" ? (
        <DataGrid
          data={filteredDonations}
          renderCard={renderDonationCard}
          columns={3}
        />
      ) : (
        <DataTable
          columns={tableColumns}
          data={filteredDonations}
        />
      )}
     </>
  );
} 