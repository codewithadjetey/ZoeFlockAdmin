"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TextInput from '@/components/ui/TextInput';
import Textarea from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import Checkbox from '@/components/ui/Checkbox';
import { FrontendService } from '@/services/frontend';
import { EventCategoriesService } from '@/services/eventCategories';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface Event {
    id: number;
    title: string;
    description: string;
}

function decodeId(encryptedId: string): number | null {
  try {
    return parseInt(atob(encryptedId));
  } catch {
    return null;
  }
}

export default function FirstTimerCategoryRegistration() {
  const router = useRouter();
  const { encryptedId } = useParams<{ encryptedId: string }>();
  const [category, setCategory] = useState<any>(null);
  const [errors, setErrors] = useState<any>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
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
    event_id: undefined as number | undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let idParam = encryptedId;
    if (Array.isArray(encryptedId)) idParam = encryptedId[0];
    const decodedParam = decodeURIComponent(idParam as string);
    if (decodedParam) {
      const id = decodeId(decodedParam);
      if (id) {
        setForm(f => ({ ...f, event_id: id }));
            const response =  FrontendService.getEventCategory(id).then(res => {
                setEvent(res.data);
                setForm(f => ({ ...f, event_id: res.data.id }));
                toast.success(res.message);
                setLoading(false);
              }).catch(err => {
                switch (err.response.status) {
                    case 404:
                        setError('Invalid QR code or link.');
                        break;
                    default:
                        setError('An error occurred. Please try again.');
                        break;
                }
                setLoading(false);
                toast.error(err.response.data.message || 'An error occurred. Please try again.');

                //redirect to home page
                router.push('/');
              });

        setLoading(false);
      }
    }
  }, [encryptedId]);

  const getDeviceFingerprint = () => {
    return typeof window !== 'undefined' ? window.navigator.userAgent + '_' + window.screen.width + 'x' + window.screen.height : '';
  };

  useEffect(() => {
    setForm(f => ({ ...f, device_fingerprint: getDeviceFingerprint() }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
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
      const res = await FrontendService.createFirstTimerGuest(form);
      toast.success(res.message);
      setTimeout(() => {
        router.push('/');
      }, 3000);
        setForm(f => ({ ...f, name: '', location: '', primary_mobile_number: '', secondary_mobile_number: '', how_was_service: '', is_first_time: true, has_permanent_place_of_worship: false, invited_by: '', would_like_to_stay: false, device_fingerprint: getDeviceFingerprint() }));
    } catch (err: any) {
        switch (err.response.status) {
            case 422:
                setErrors(err.response.data.errors);
                break;
            case 429:
                toast.error(err.response.data.message);
                setTimeout(() => {
                    router.push('/');
                }, 3000);
                break;
            default:
                toast.error(err.response.data.message || 'An error occurred. Please try again.');
                break;
        }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-8 px-2">
      <Card className="w-full max-w-xl rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary-700 dark:text-primary-300">
            First Timer Registration
          </CardTitle>
          {event && <div className="text-center text-gray-500 dark:text-gray-400 mt-2">For: <span className="font-semibold">{event.title}</span></div>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput name="name" label="Full Name" value={form.name} onChange={handleChange} required error={errors?.name}/>
                <TextInput name="location" label="Location" value={form.location} onChange={handleChange} error={errors?.location}/>
                <TextInput name="primary_mobile_number" label="Primary Mobile Number" value={form.primary_mobile_number} onChange={handleChange} required error={errors?.primary_mobile_number}/>
                <TextInput name="secondary_mobile_number" label="Secondary Mobile Number" value={form.secondary_mobile_number} onChange={handleChange} error={errors?.secondary_mobile_number}/>
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