'use client';

import { useRouter } from 'next/navigation';
import ImportForm from '@/components/import/ImportForm';
import { Building2 } from 'lucide-react';

export default function FamiliesImportPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/import-export');
  };

  return (
    <ImportForm
      type="families"
      title="Import Families"
      description="Import family data with family head assignments"
      icon={<Building2 className="h-6 w-6" />}
      color="bg-blue-500"
      onBack={handleBack}
    />
  );
} 