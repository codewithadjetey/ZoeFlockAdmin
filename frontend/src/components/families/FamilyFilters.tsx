"use client";
import React, { useState } from 'react';
import { SearchInput, SelectInput, Button, ToggleSwitch } from '@/components/ui';

interface FamilyFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
}

export default function FamilyFilters({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusChange, 
  onFiltersChange, 
  onReset 
}: FamilyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    hasMembers: '',
    createdAfter: '',
    createdBefore: '',
    memberCountMin: '',
    memberCountMax: '',
    hasImage: '',
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setFilters({
      hasMembers: '',
      createdAfter: '',
      createdBefore: '',
      memberCountMin: '',
      memberCountMax: '',
      hasImage: '',
    });
    onReset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </Button>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search families..."
          className="w-full"
        />
        
        <SelectInput
          value={statusFilter}
          onChange={onStatusChange}
          options={[
            { value: "All Status", label: "All Status" },
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ]}
          className="w-full"
        />

        <div className="flex items-center space-x-2">
          <ToggleSwitch
            checked={filters.hasImage === 'true'}
            onChange={(checked) => handleFilterChange('hasImage', checked ? 'true' : '')}
            label="Has Image"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Has Members
              </label>
              <SelectInput
                value={filters.hasMembers}
                onChange={(value) => handleFilterChange('hasMembers', value)}
                options={[
                  { value: '', label: 'Any' },
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created After
              </label>
              <input
                type="date"
                value={filters.createdAfter}
                onChange={(e) => handleFilterChange('createdAfter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created Before
              </label>
              <input
                type="date"
                value={filters.createdBefore}
                onChange={(e) => handleFilterChange('createdBefore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Members
              </label>
              <input
                type="number"
                min="0"
                value={filters.memberCountMin}
                onChange={(e) => handleFilterChange('memberCountMin', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Members
              </label>
              <input
                type="number"
                min="0"
                value={filters.memberCountMax}
                onChange={(e) => handleFilterChange('memberCountMax', e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 