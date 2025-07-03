import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Dashboard</h1>
        <p className="text-neutral-600 mb-8">Welcome to your dashboard! Here you can manage members, events, donations, and more.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Total Members</h2>
            <p className="text-3xl font-bold text-primary-600">1,247</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Upcoming Events</h2>
            <p className="text-3xl font-bold text-secondary-600">8</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Monthly Donations</h2>
            <p className="text-3xl font-bold text-green-600">$24,580</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage; 