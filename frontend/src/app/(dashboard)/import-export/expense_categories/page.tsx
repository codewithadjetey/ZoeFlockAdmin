'use client';

import { useRouter } from 'next/navigation';
import ImportForm from '@/components/import/ImportForm';
import { Receipt } from 'lucide-react';

export default function ExpenseCategoriesImportPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/import-export');
  };

  return (
    <ImportForm
      type="expense_categories"
      title="Import Expense Categories"
      description="Import expense category data for financial tracking"
      icon={<Receipt className="h-6 w-6" />}
      color="bg-red-500"
      onBack={handleBack}
    />
  );
} 