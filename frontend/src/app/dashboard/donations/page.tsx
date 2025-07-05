"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DonationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const donations = [
    {
      id: 1,
      donor: "John Smith",
      email: "john@example.com",
      amount: 250.00,
      category: "Tithe",
      method: "Online",
      date: "2024-03-20",
      status: "Completed",
      note: "Monthly tithe",
    },
    {
      id: 2,
      donor: "Sarah Johnson",
      email: "sarah@example.com",
      amount: 100.00,
      category: "Offering",
      method: "Cash",
      date: "2024-03-19",
      status: "Completed",
      note: "Sunday offering",
    },
    {
      id: 3,
      donor: "Michael Brown",
      email: "michael@example.com",
      amount: 500.00,
      category: "Building Fund",
      method: "Check",
      date: "2024-03-18",
      status: "Pending",
      note: "Building fund contribution",
    },
    {
      id: 4,
      donor: "Emily Davis",
      email: "emily@example.com",
      amount: 75.00,
      category: "Missions",
      method: "Online",
      date: "2024-03-17",
      status: "Completed",
      note: "Missions support",
    },
    {
      id: 5,
      donor: "David Wilson",
      email: "david@example.com",
      amount: 150.00,
      category: "Tithe",
      method: "Cash",
      date: "2024-03-16",
      status: "Completed",
      note: "Weekly tithe",
    },
    {
      id: 6,
      donor: "Lisa Miller",
      email: "lisa@example.com",
      amount: 300.00,
      category: "Special Project",
      method: "Online",
      date: "2024-03-15",
      status: "Completed",
      note: "Youth ministry support",
    },
  ];

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch = donation.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || donation.category === categoryFilter;
    const matchesStatus = statusFilter === "All Status" || donation.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalDonations = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const completedDonations = filteredDonations.filter(d => d.status === "Completed").reduce((sum, donation) => sum + donation.amount, 0);
  const pendingDonations = filteredDonations.filter(d => d.status === "Pending").reduce((sum, donation) => sum + donation.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Tithe":
        return "bg-blue-100 text-blue-800";
      case "Offering":
        return "bg-green-100 text-green-800";
      case "Building Fund":
        return "bg-purple-100 text-purple-800";
      case "Missions":
        return "bg-orange-100 text-orange-800";
      case "Special Project":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "Online":
        return "bg-blue-100 text-blue-800";
      case "Cash":
        return "bg-green-100 text-green-800";
      case "Check":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 font-['Poppins'] mb-2">Donations</h2>
              <p className="text-gray-600">Track and manage church donations</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center mt-4 md:mt-0">
              <i className="fas fa-plus mr-2"></i>Record Donation
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search donors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 search-input rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 appearance-none bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option>All Categories</option>
                <option>Tithe</option>
                <option>Offering</option>
                <option>Building Fund</option>
                <option>Missions</option>
                <option>Special Project</option>
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 appearance-none bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option>All Status</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">${totalDonations.toFixed(2)}</h3>
            <p className="text-sm text-gray-600">Total Donations</p>
          </div>
          
          <div className="stat-card rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-check-circle text-blue-600 text-xl"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">${completedDonations.toFixed(2)}</h3>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          
          <div className="stat-card rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">${pendingDonations.toFixed(2)}</h3>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </section>

      {/* Donations Table */}
      <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{donation.donor}</div>
                      <div className="text-sm text-gray-500">{donation.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">${donation.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(donation.category)}`}>
                      {donation.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(donation.method)}`}>
                      {donation.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(donation.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                      {donation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Charts Section */}
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="chart-container rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Donations by Category</h3>
          <div className="space-y-4">
            {["Tithe", "Offering", "Building Fund", "Missions", "Special Project"].map((category) => {
              const categoryTotal = filteredDonations
                .filter(d => d.category === category)
                .reduce((sum, d) => sum + d.amount, 0);
              const percentage = totalDonations > 0 ? (categoryTotal / totalDonations) * 100 : 0;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${getCategoryColor(category).replace('text-', 'bg-').replace('800', '500')}`}></div>
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">${categoryTotal.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="chart-container rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 font-['Poppins'] mb-6">Monthly Donations Trend</h3>
          <div className="h-64 flex items-end justify-center space-x-4">
            {[12000, 15000, 18000, 14000, 22000, 19000].map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-10 bg-green-500 rounded-t"
                  style={{ height: `${(value / 25000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
} 