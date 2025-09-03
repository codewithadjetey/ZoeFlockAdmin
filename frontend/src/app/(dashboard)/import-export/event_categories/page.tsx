'use client';

import { useRouter } from 'next/navigation';
import ImportForm from '@/components/import/ImportForm';
import { Calendar } from 'lucide-react';

export default function EventCategoriesImportPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/import-export');
  };

  return (
    <ImportForm
      type="event_categories"
      title="Import Event Categories"
      description="Import event category data with recurrence settings"
      icon={<Calendar className="h-6 w-6" />}
      color="bg-orange-500"
      onBack={handleBack}
    />
  );
} 