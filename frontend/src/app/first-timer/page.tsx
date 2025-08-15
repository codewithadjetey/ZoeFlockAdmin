"use client"

import React, { useState } from 'react';
import TextInput from '@/components/ui/TextInput';
import Textarea from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import Checkbox from '@/components/ui/Checkbox';

const getDeviceFingerprint = () => {
  // Simple device fingerprinting (placeholder, replace with a real library for production)
  return typeof window !== 'undefined' ? window.navigator.userAgent + '_' + window.screen.width + 'x' + window.screen.height : '';
};

export default function FirstTimerRegistration() {
  const [form, setForm] = useState({
    name: '',
    location: '',
    primary_mobile_number: '',
    secondary_mobile_number: '',
    how_was_service: '',
    is_first_time: true,
    has_permanent_place_of_worship: false,
    invited_by: '',
    would_like_to_stay: false,
    device_fingerprint: '',
    self_registered: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    setForm(f => ({ ...f, device_fingerprint: getDeviceFingerprint() }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/v1/first-timers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess('Registration successful!');
      setForm({
        name: '',
        location: '',
        primary_mobile_number: '',
        secondary_mobile_number: '',
        how_was_service: '',
        is_first_time: true,
        has_permanent_place_of_worship: false,
        invited_by: '',
        would_like_to_stay: false,
        device_fingerprint: getDeviceFingerprint(),
        self_registered: true,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-8 px-2">
      <Card className="w-full max-w-xl rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-primary-700 dark:text-primary-300">First Timer Registration</CardTitle>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Welcome! Please fill out this form to help us get to know you better.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput name="name" label="Full Name" value={form.name} onChange={handleChange} required />
                <TextInput name="location" label="Location" value={form.location} onChange={handleChange} />
                <TextInput name="primary_mobile_number" label="Primary Mobile Number" value={form.primary_mobile_number} onChange={handleChange} required />
                <TextInput name="secondary_mobile_number" label="Secondary Mobile Number" value={form.secondary_mobile_number} onChange={handleChange} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Service Experience</h2>
              <Textarea name="how_was_service" label="How was the service?" value={form.how_was_service} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox name="is_first_time" label="First Time?" checked={form.is_first_time} onChange={handleChange} />
              <Checkbox name="has_permanent_place_of_worship" label="Has Permanent Place of Worship?" checked={form.has_permanent_place_of_worship} onChange={handleChange} />
              <div className="col-span-1 md:col-span-2">
                <TextInput name="invited_by" label="Invited By (Name)" value={form.invited_by} onChange={handleChange} className="col-span-1 md:col-span-2" />
              </div>
              <Checkbox name="would_like_to_stay" label="Would Like to Stay?" checked={form.would_like_to_stay} onChange={handleChange} />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-lg shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Register'}
            </button>
            {error && <div className="text-red-600 text-center font-medium mt-2">{error}</div>}
            {success && <div className="text-green-600 text-center font-medium mt-2">{success}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}