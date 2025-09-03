'use client';

import { useRouter } from 'next/navigation';
import ImportForm from '@/components/import/ImportForm';
import { Users } from 'lucide-react';

export default function GroupsImportPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/import-export');
  };

  return (
    <ImportForm
      type="groups"
      title="Import Groups"
      description="Import group data with leader assignments"
      icon={<Users className="h-6 w-6" />}
      color="bg-green-500"
      onBack={handleBack}
    />
  );
} 