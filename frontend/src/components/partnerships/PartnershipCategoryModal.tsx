'use client';
import React, { useEffect, useState } from 'react';
import { PartnershipCategory } from '@/services/partnershipCategories';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import Textarea from '@/components/ui/Textarea';

interface PartnershipCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: PartnershipCategory | null;
  onSave: (data: PartnershipCategory) => void;
  mode: 'create' | 'edit';
  TextInput?: typeof TextInput;
  Textarea?: typeof Textarea;
  errors: any;
}

export const  PartnershipCategoryModal: React.FC<PartnershipCategoryModalProps> = ({ isOpen, onClose, category, onSave, mode, TextInput = TextInputDefault, Textarea = TextareaDefault, errors = {} }) => {
  const [form, setForm] = useState<Partial<PartnershipCategory>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(category || {});
    }
  }, [isOpen, category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      onSave(form as PartnershipCategory);
      // Do not close modal here; parent will close it only on success
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-6">{mode === 'create' ? 'Add Category' : 'Edit Category'}</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <TextInput
            label="Name"
            name="name"
            value={form.name || ''}
            onChange={handleChange as any}
            error={errors.name}
          />
          <Textarea
            label="Description"
            name="description"
            value={form.description || ''}
            onChange={handleChange as any}
            rows={2}
            error={errors.description}
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" loading={loading}>{mode === 'create' ? 'Save' : 'Update'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Fallbacks for default usage
const TextInputDefault = TextInput;
const TextareaDefault = Textarea;