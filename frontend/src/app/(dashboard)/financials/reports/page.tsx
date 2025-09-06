'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PartnershipsService, Partnership } from '@/services/partnerships';
import { PartnershipCategoriesService, PartnershipCategory } from '@/services/partnershipCategories';

export default function FinancialReportsPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [categories, setCategories] = useState<PartnershipCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      PartnershipsService.list({ per_page: 1000 }),
      PartnershipCategoriesService.list(),
    ]).then(([p, c]) => {
      setPartnerships(p.data.data || []);
      setCategories(c.data || c);
    }).finally(() => setLoading(false));
  }, []);

  const totalPledged = partnerships.reduce((sum, p) => sum + Number(p.pledge_amount || 0), 0);
  const byCategory = categories.map(cat => ({
    ...cat,
    total: partnerships.filter(p => p.category_id === cat.id).reduce((sum, p) => sum + Number(p.pledge_amount || 0), 0),
    count: partnerships.filter(p => p.category_id === cat.id).length,
  }));

  return (
    <>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">{partnerships.length}</div>
            <div className="text-gray-500 mt-2">Total Partnerships</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-300">GHS {totalPledged.toLocaleString()}</div>
            <div className="text-gray-500 mt-2">Total Pledged</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-300">{categories.length}</div>
            <div className="text-gray-500 mt-2">Categories</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-6">
          <h2 className="text-lg font-bold mb-4">Breakdown by Category</h2>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Partnerships</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pledged</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : byCategory.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-gray-400">No data found.</td></tr>
              ) : (
                byCategory.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{cat.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{cat.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">GHS {cat.total.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Placeholder for future charts/visualizations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-6 text-center text-gray-400">
          Charts and advanced analytics coming soon...
        </div>
      </div>
     </>
  );
}