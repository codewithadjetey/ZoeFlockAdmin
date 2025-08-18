'use client';

import React, { useEffect, useState } from 'react';
import { PartnershipsService, Partnership, PartnershipCategory } from '@/services/partnerships';
import { MembersService, Member } from '@/services/members';
import Button from '@/components/ui/Button';
import { EntitiesService } from '@/services/entities';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-6">{mode === 'create' ? 'Add Partnership' : 'Edit Partnership'}</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Member</label>
            <select name="member_id" value={form.member_id || ''} onChange={handleChange} className="w-full rounded border px-3 py-2">
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select name="category_id" value={form.category_id || ''} onChange={handleChange} className="w-full rounded border px-3 py-2">
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Pledge Amount</label>
            <input type="number" name="pledge_amount" value={form.pledge_amount || ''} onChange={handleChange} className="w-full rounded border px-3 py-2" min="0" step="0.01" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Frequency</label>
            <select name="frequency" value={form.frequency || ''} onChange={handleChange} className="w-full rounded border px-3 py-2">
              <option value="">Select Frequency</option>
              {frequencyOptions.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Start Date</label>
              <input type="date" name="start_date" value={form.start_date || ''} onChange={handleChange} className="w-full rounded border px-3 py-2" />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium">End Date</label>
              <input type="date" name="end_date" value={form.end_date || ''} onChange={handleChange} className="w-full rounded border px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Notes</label>
            <textarea name="notes" value={form.notes || ''} onChange={handleChange} className="w-full rounded border px-3 py-2" rows={2} />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" loading={loading}>{mode === 'create' ? 'Save' : 'Update'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};