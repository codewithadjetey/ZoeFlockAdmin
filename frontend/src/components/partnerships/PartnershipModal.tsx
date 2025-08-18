'use client';

import React, { useEffect, useState } from 'react';
import { PartnershipsService, Partnership, PartnershipCategory } from '@/services/partnerships';
import { MembersService, Member } from '@/services/members';
import Button from '@/components/ui/Button';
import { EntitiesService } from '@/services/entities';
import TextInput from '@/components/ui/TextInput';
import Textarea from '@/components/ui/Textarea';
import SelectInput from '@/components/ui/SelectInput';
import Modal from '@/components/shared/Modal';

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
  const [members, setMembers] = useState<Member[]>([]);
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
    setLoading(true);
    try {
      let result;
      if (mode === 'create') {
        result = await PartnershipsService.create(form);
      } else if (partnership?.id) {
        result = await PartnershipsService.update(partnership.id, form);
      }
      onSave(result);
      onClose();
    } catch (err) {
      // TODO: Show error toast
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
      size="lg"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <SelectInput
          label="Member"
          value={form.member_id ? String(form.member_id) : ''}
          onChange={val => setForm(prev => ({ ...prev, member_id: val }))}
          options={members.map(m => ({ value: String(m.id), label: `${m.first_name} ${m.last_name}` }))}
          placeholder="Select Member"
          error={errors.member_id}
        />
        <SelectInput
          label="Category"
          value={form.category_id ? String(form.category_id) : ''}
          onChange={val => setForm(prev => ({ ...prev, category_id: val }))}
          options={categories.map(c => ({ value: String(c.id), label: c.name }))}
          placeholder="Select Category"
          error={errors.category_id}
        />
        <TextInput
          label="Pledge Amount"
          name="pledge_amount"
          type="number"
          value={form.pledge_amount || ''}
          onChange={e => setForm(prev => ({ ...prev, pledge_amount: e.target.value }))}
          min={0}
          error={errors.pledge_amount}
        />
        <SelectInput
          label="Frequency"
          value={form.frequency || ''}
          onChange={val => setForm(prev => ({ ...prev, frequency: val }))}
          options={frequencyOptions}
          placeholder="Select Frequency"
          error={errors.frequency}
        />
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
        <Textarea
          label="Notes"
          name="notes"
          value={form.notes || ''}
          onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          error={errors.notes}
        />
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>{mode === 'create' ? 'Save' : 'Update'}</Button>
        </div>
      </form>
    </Modal>
  );
};