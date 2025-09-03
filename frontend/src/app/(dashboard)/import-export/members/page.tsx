'use client';

import { useRouter } from 'next/navigation';
import ImportForm from '@/components/import/ImportForm';
import { User } from 'lucide-react';

export default function MembersImportPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/import-export');
  };

  return (
    <ImportForm
      type="members"
      title="Import Members"
      description="Import member data with family assignments and family head designation. Required fields: First Name, Last Name, Email, Phone, Date of Birth"
      icon={<User className="h-6 w-6" />}
      color="bg-purple-500"
      onBack={handleBack}
    />
  );
} 