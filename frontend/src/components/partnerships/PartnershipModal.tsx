'use client';

import React, { useEffect, useState } from 'react';
import { PartnershipsService, Partnership, PartnershipCategory } from '@/services/partnerships';
import Button from '@/components/ui/Button';
import { EntitiesService, EntityOption } from '@/services/entities';
import TextInput from '@/components/ui/TextInput';
import Textarea from '@/components/ui/Textarea';
import SelectInput from '@/components/ui/SelectInput';
import Modal from '@/components/shared/Modal';
import { getMemberOptions, getPartnershipCategoryOptions } from '@/utils';
import { SearchableSelect } from '../ui';
import { toast } from 'react-toastify';

interface PartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnership?: Partnership | null;
  onSave: (data: Partnership) => void;
  mode: 'create' | 'edit';
}

const frequencyOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-Time' },
];

export const PartnershipModal: React.FC<PartnershipModalProps> = ({ isOpen, onClose, partnership, onSave, mode }) => {
  const [form, setForm] = useState<Partial<Partnership>>({});
  const [members, setMembers] = useState<EntityOption[]>([]);
  const [categories, setCategories] = useState<PartnershipCategory[]>([]);
  const [loading, setLoading] = useState(false);
  // Add error state if you want to show validation errors
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      setForm(partnership || {});
      EntitiesService.getEntities('members,partnership-categories').then((res) => {
        setMembers(res.data.members || []);
        setCategories(res.data.partnership_categories || []);
      });
    }
  }, [isOpen, partnership]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      let result;
      if (mode === 'create') {
        result = await PartnershipsService.create(form);
      } else if (partnership?.id) {
        result = await PartnershipsService.update(partnership.id, form);
      }
      onSave(result);
      setErrors({});
      toast.success(result.data.message);
      onClose();
    } catch (err: any) {
      switch (err.response.status) {
        case 422:
          setErrors(err.response.data.errors);
          break;
        default:
          toast.error(err.response.data.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Partnership' : 'Edit Partnership'}
      size="xxl"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
        <SearchableSelect
          label="Member"
          value={form.member_id ? String(form.member_id) : ''}
          onChange={val => setForm(prev => ({ ...prev, member_id: Number(val) }))}
          options={getMemberOptions(members)}
          placeholder="Select Member"
          error={errors.member_id}
        />
        <SearchableSelect
          label="Category"
          value={form.category_id ? String(form.category_id) : ''}
          onChange={val => setForm(prev => ({ ...prev, category_id: Number(val) }))}
          options={getPartnershipCategoryOptions(categories)}
          placeholder="Select Category"
          error={errors.category_id}
        />
        <TextInput
          label="Pledge Amount"
          name="pledge_amount"
          type="number"
          value={form.pledge_amount ? String(form.pledge_amount) : ''}
          onChange={e => setForm(prev => ({ ...prev, pledge_amount: Number(e.target.value) }))}
          min={0}
          error={errors.pledge_amount}
        />
        <SelectInput
          label="Frequency"
          value={form.frequency || ''}
          onChange={val => setForm(prev => ({ ...prev, frequency: val as 'weekly' | 'monthly' | 'yearly' | 'one-time' }))}
          options={frequencyOptions}
          placeholder="Select Frequency"
          error={errors.frequency}
        />
        <div className="col-span-2">
        <TextInput
          label="Due Date"
          name="due_date"
          type="date"
          value={form.due_date || ''}
          onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))}
          error={errors.due_date}
        />
        </div>
        {form.frequency !== 'one-time' && (
          <>
            <TextInput
              label="Start Date"
              name="start_date"
              type="date"
              value={form.start_date || ''}
              onChange={e => setForm(prev => ({ ...prev, start_date: e.target.value }))}
              error={errors.start_date}
            />
            <TextInput
              label="End Date"
              name="end_date"
              type="date"
              value={form.end_date || ''}
              onChange={e => setForm(prev => ({ ...prev, end_date: e.target.value }))}
              error={errors.end_date}
            />
          </>
        )}

        <div className="col-span-2">
        <Textarea
          label="Notes"
          name="notes"
          value={form.notes || ''}
          onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          error={errors.notes}
        />
        </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>{mode === 'create' ? 'Save' : 'Update'}</Button>
        </div>
      </form>
    </Modal>
  );
};