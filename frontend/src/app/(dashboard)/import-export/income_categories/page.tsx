'use client';

import { useRouter } from 'next/navigation';
import ImportForm from '@/components/import/ImportForm';
import { DollarSign } from 'lucide-react';

export default function IncomeCategoriesImportPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/import-export');
  };

  return (
    <ImportForm
      type="income_categories"
      title="Import Income Categories"
      description="Import income category data for financial tracking"
      icon={<DollarSign className="h-6 w-6" />}
      color="bg-emerald-500"
      onBack={handleBack}
    />
  );
} 