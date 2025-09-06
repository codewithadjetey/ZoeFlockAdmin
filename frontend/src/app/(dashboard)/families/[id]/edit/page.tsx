"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FamilyModal from "@/components/families/FamilyModal";
import { FamiliesService, Family } from "@/services/families";
import { toast } from 'react-toastify';
import { 
  PageHeader, 
  Button
} from "@/components/ui";

export default function EditFamilyPage() {
  const params = useParams();
  const router = useRouter();
  const familyId = parseInt(params.id as string);
  
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    if (familyId) {
      loadFamily();
    }
  }, [familyId]);

  const loadFamily = async () => {
    try {
      setLoading(true);
      const response = await FamiliesService.getFamily(familyId);
      
      if (response.success && response.data) {
        setFamily(response.data);
      } else {
        toast.error(response.message || 'Family not found');
        router.push('/families');
      }
    } catch (error) {
      console.error('Error loading family:', error);
      toast.error('Failed to load family');
      router.push('/families');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFamily = async (familyData: Family & { upload_token?: string }) => {
    try {
      setLoading(true);
      const response = await FamiliesService.updateFamily(familyId, familyData);

      if (response.success) {
        toast.success(response.message);
        router.push(`/families/${familyId}`);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error updating family:', error);
      toast.error('Failed to update family');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    router.push(`/families/${familyId}`);
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading family...</div>
        </div>
       </>
    );
  }

  if (!family) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Family not found</div>
        </div>
       </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={`Edit ${family.name}`}
          description="Update family information"
          actionButton={{
            text: "Cancel",
            icon: "fas fa-times",
            onClick: handleCloseModal
          }}
        />

        <FamilyModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveFamily}
          family={family}
          mode="edit"
        />
      </div>
     </>
  );
} 