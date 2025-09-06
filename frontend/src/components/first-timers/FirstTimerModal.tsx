import React, { useState, useEffect } from 'react';
import TextInput from '@/components/ui/TextInput';
import Textarea from '@/components/ui/Textarea';
import { Modal } from '../shared';
import SearchableSelect from '@/components/ui/SearchableSelect';
import Checkbox from '@/components/ui/Checkbox';
import { EntitiesService, EntityOption } from '@/services/entities';
import SelectInput from '@/components/ui/SelectInput';

export interface FirstTimer {
  id?: number;
  name: string;
  location?: string;
  primary_mobile_number: string;
  secondary_mobile_number?: string;
  how_was_service?: string;
  is_first_time: boolean;
  has_permanent_place_of_worship: boolean;
  invited_by?: string;
  invited_by_member_id?: number;
  would_like_to_stay: boolean;
  self_registered?: boolean;
  event_id?: number;
  // Add more fields as needed
}

interface FirstTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FirstTimer>) => void;
  firstTimer?: FirstTimer | null;
  mode: 'create' | 'edit';
  errors: any;
}

const defaultState: FirstTimer = {
  name: '',
  location: '',
  primary_mobile_number: '',
  secondary_mobile_number: '',
  how_was_service: '',
  is_first_time: true,
  has_permanent_place_of_worship: false,
  invited_by: '',
  invited_by_member_id: undefined,
  would_like_to_stay: false,
  self_registered: false,
  event_id: undefined,
};

const FirstTimerModal: React.FC<FirstTimerModalProps> = ({ isOpen, onClose, onSave, firstTimer, mode, errors }) => {
  const [form, setForm] = useState<FirstTimer>(defaultState);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<EntityOption[]>([]);
  const [eventsToday, setEventsToday] = useState<any[]>([]);

  useEffect(() => {
    if (firstTimer && mode === 'edit') {
      setForm({ ...defaultState, ...firstTimer });
    } else {
      setForm(defaultState);
    }
  }, [firstTimer, mode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      EntitiesService.getEntities('members,events-today').then(res => {
        setMembers(res.data.members || []);
        setEventsToday(res.data.events || []);
      });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleMemberChange = (value: string) => {
    setForm(f => ({ ...f, invited_by_member_id: value ? Number(value) : undefined }));
  };

  const handleEventChange = (value: string) => {
    setForm(f => ({ ...f, event_id: value ? Number(value) : undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    onSave(form);
    setSubmitting(false);
  };

  return (
    <Modal 
        size='xl'
        isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? 'Edit First Timer' : 'Add First Timer'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.event_id && <p className="text-red-500">{errors.event_id}</p>}
        <TextInput name="name" label="Full Name" value={form.name} onChange={handleChange} required error={errors.name} />
        <TextInput name="location" label="Location" value={form.location || ''} onChange={handleChange} />
        <TextInput name="primary_mobile_number" label="Primary Mobile Number" value={form.primary_mobile_number} onChange={handleChange} required error={errors.primary_mobile_number} />
        <TextInput name="secondary_mobile_number" label="Secondary Mobile Number" value={form.secondary_mobile_number || ''} onChange={handleChange} error={errors.secondary_mobile_number} />
        <Textarea name="how_was_service" label="How was the service?" value={form.how_was_service || ''} onChange={handleChange} error={errors.how_was_service} />
        <Checkbox name="is_first_time" label="First Time?" checked={form.is_first_time} onChange={handleChange} />
        <Checkbox name="has_permanent_place_of_worship" label="Has Permanent Place of Worship?" checked={form.has_permanent_place_of_worship} onChange={handleChange} />
        <TextInput name="invited_by" label="Invited By (Name)" value={form.invited_by || ''} onChange={handleChange} />
        <SearchableSelect
          value={form.invited_by_member_id ? String(form.invited_by_member_id) : ''}
          onChange={handleMemberChange}
          options={[
            { value: '', label: 'Select a member (optional)' },
            ...members.map(m => ({
              value: String(m.id),
              label: ((m as any).first_name && (m as any).last_name)
                ? `${(m as any).first_name} ${(m as any).last_name}`
                : m.name || ''
            }))
          ]}
          label="Select Member Who Invited"
          placeholder="Search and select member..."
          searchable={true}
        />
        <SearchableSelect
          label="Select Event (Today)"
          value={form.event_id ? String(form.event_id) : ''}
          onChange={handleEventChange}
          options={[
            ...eventsToday.map(ev => ({ value: String(ev.id), label: `${ev.title}${ev.start_time ? ' - ' + ev.start_time : ''}` }))
          ]}
        />
        
        <Checkbox name="would_like_to_stay" label="Would Like to Stay?" checked={form.would_like_to_stay} onChange={handleChange} />
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white font-semibold" disabled={submitting}>{mode === 'edit' ? 'Save Changes' : 'Add First Timer'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default FirstTimerModal;