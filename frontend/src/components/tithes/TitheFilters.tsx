"use client";

import React, { useState, useEffect } from 'react';
import { Button, TextInput, SimpleSelect } from '@/components/ui';
import { TitheFilters as TitheFiltersType } from '@/interfaces';
import { MembersService, Member } from '@/services/members';

interface TitheFiltersProps {
  filters: TitheFiltersType;
  onFiltersChange: (filters: TitheFiltersType) => void;
  onReset: () => void;
}

export const TitheFilters: React.FC<TitheFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [localFilters, setLocalFilters] = useState<TitheFiltersType>(filters);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const loadMembers = async () => {
    try {
      const response = await MembersService.getMembers({ status: 'active' });
      setMembers(response.members.data || []);
    } catch (error: any) {
      console.error('Error loading members:', error);
    }
  };

  const handleFilterChange = (field: keyof TitheFiltersType, value: any) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Member Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Member
          </label>
          <SimpleSelect
            value={localFilters.member_id || ''}
            onChange={(e) => handleFilterChange('member_id', e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">All Members</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </SimpleSelect>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <SimpleSelect
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
            <option value="partially_paid">Partially Paid</option>
          </SimpleSelect>
        </div>

        {/* Frequency Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency
          </label>
          <SimpleSelect
            value={localFilters.frequency || ''}
            onChange={(e) => handleFilterChange('frequency', e.target.value || undefined)}
          >
            <option value="">All Frequencies</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </SimpleSelect>
        </div>

        {/* Start Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <TextInput
            type="date"
            value={localFilters.start_date || ''}
            onChange={(e) => handleFilterChange('start_date', e.target.value || undefined)}
          />
        </div>

        {/* End Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <TextInput
            type="date"
            value={localFilters.end_date || ''}
            onChange={(e) => handleFilterChange('end_date', e.target.value || undefined)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}; 