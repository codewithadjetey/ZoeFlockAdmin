"use client";

import React, { useState, useEffect } from 'react';
import { Button, TextInput, Textarea, SimpleSelect } from '@/components/ui';
import Modal from '@/components/shared/Modal';
import { toast } from 'react-toastify';
import { titheService } from '@/services/tithes';
import { Tithe, CreateTitheRequest, UpdateTitheRequest } from '@/interfaces';
import { MembersService, Member } from '@/services/members';

interface TitheModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tithe?: Tithe;
  mode: 'create' | 'edit';
}

export const TitheModal: React.FC<TitheModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tithe,
  mode,
}) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState<CreateTitheRequest | UpdateTitheRequest>({
    member_id: 0,
    amount: 0,
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadMembers();
      if (tithe && mode === 'edit') {
        setFormData({
          member_id: tithe.member_id,
          amount: tithe.amount,
          frequency: tithe.frequency,
          start_date: tithe.start_date.split('T')[0],
          notes: tithe.notes || '',
        });
      } else {
        setFormData({
          member_id: 0,
          amount: 0,
          frequency: 'monthly',
          start_date: new Date().toISOString().split('T')[0],
          notes: '',
        });
      }
    }
  }, [isOpen, tithe, mode]);

  const loadMembers = async () => {
    try {
      const response = await MembersService.getMembers({ status: 'active' });
      setMembers(response.members.data || []);
    } catch (error: any) {
      console.error('Error loading members:', error);
      toast.error('Error loading members');
    }
  };

  const handleInputChange = (field: keyof (CreateTitheRequest | UpdateTitheRequest), value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateInputChange = (field: keyof CreateTitheRequest, value: any) => {
    if (mode === 'create') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleUpdateInputChange = (field: keyof UpdateTitheRequest, value: any) => {
    if (mode === 'edit') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      const createData = formData as CreateTitheRequest;
      if (!createData.member_id || createData.amount <= 0) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else {
      const updateData = formData as UpdateTitheRequest;
      if (updateData.amount !== undefined && updateData.amount <= 0) {
        toast.error('Amount must be greater than 0');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        await titheService.createTithe(formData as CreateTitheRequest);
        toast.success('Tithe created successfully');
      } else {
        if (tithe) {
          await titheService.updateTithe(tithe.id, formData as UpdateTitheRequest);
          toast.success('Tithe updated successfully');
        }
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} tithe:`, error);
      toast.error(error.response?.data?.message || `Error ${mode === 'create' ? 'creating' : 'updating'} tithe`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Create New Tithe' : 'Edit Tithe'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Member Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Member <span className="text-red-500">*</span>
          </label>
          <SimpleSelect
            value={mode === 'create' ? (formData as CreateTitheRequest).member_id : tithe?.member_id}
            onChange={(e) => {
              if (mode === 'create') {
                handleCreateInputChange('member_id', parseInt(e.target.value));
              }
            }}
            disabled={mode === 'edit'}
          >
            <option value="">Select a member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name}
              </option>
            ))}
          </SimpleSelect>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount <span className="text-red-500">*</span>
          </label>
          <TextInput
            type="number"
            value={formData.amount?.toString() || ''}
            onChange={(e) => {
              if (mode === 'create') {
                handleCreateInputChange('amount', parseFloat(e.target.value) || 0);
              } else {
                handleUpdateInputChange('amount', parseFloat(e.target.value) || 0);
              }
            }}
            placeholder="Enter tithe amount"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency <span className="text-red-500">*</span>
          </label>
          <SimpleSelect
            value={formData.frequency}
            onChange={(e) => {
              if (mode === 'create') {
                handleCreateInputChange('frequency', e.target.value);
              } else {
                handleUpdateInputChange('frequency', e.target.value);
              }
            }}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </SimpleSelect>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <TextInput
            type="date"
            value={formData.start_date || ''}
            onChange={(e) => {
              if (mode === 'create') {
                handleCreateInputChange('start_date', e.target.value);
              } else {
                handleUpdateInputChange('start_date', e.target.value);
              }
            }}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Optional notes about this tithe"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
          >
            {mode === 'create' ? 'Create Tithe' : 'Update Tithe'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 