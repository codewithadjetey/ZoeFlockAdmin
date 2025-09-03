'use client';

import { useRouter } from 'next/navigation';
import ImportForm from '@/components/import/ImportForm';
import { Handshake } from 'lucide-react';

export default function PartnershipCategoriesImportPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/import-export');
  };

  return (
    <ImportForm
      type="partnership_categories"
      title="Import Partnership Categories"
      description="Import partnership category data with amount and frequency settings"
      icon={<Handshake className="h-6 w-6" />}
      color="bg-indigo-500"
      onBack={handleBack}
    />
  );
} 