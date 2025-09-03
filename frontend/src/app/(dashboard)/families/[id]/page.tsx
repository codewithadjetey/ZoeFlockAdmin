"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FamilyMembersModal } from "@/components/families/FamilyMembersModal";
import { FamiliesService, Family } from "@/services/families";
import { toast } from 'react-toastify';
import { 
  PageHeader, 
  StatusBadge,
  Avatar,
  Button
} from "@/components/ui";
import { getImageUrl } from "@/utils/helpers";

export default function FamilyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const familyId = parseInt(params.id as string);
  
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

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

  const handleManageMembers = () => {
    setIsMemberModalOpen(true);
  };

  const handleEditFamily = () => {
    router.push(`/families/${familyId}/edit`);
  };

  const handleBackToFamilies = () => {
    router.push('/families');
  };

  if (loading) {
    return (
      <>>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading family...</div>
        </div>
       </>
    );
  }

  if (!family) {
    return (
      <>>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Family not found</div>
        </div>
       </>
    );
  }

  return (
    <>>
      <div className="space-y-6">
        <PageHeader
          title={family.name}
          description="Family Details"
        />
        
        <div className="flex justify-between items-center mb-6">
          <Button variant="secondary" onClick={handleBackToFamilies}>
            Back to Families
          </Button>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={handleEditFamily}>
              Edit Family
            </Button>
            <Button onClick={handleManageMembers}>
              Manage Members
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Family Image and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src={family.img_url ? (getImageUrl(family.img_url) || '/images/family-placeholder.jpg') : '/images/family-placeholder.jpg'}
                  alt={family.name}
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{family.name}</h2>
                  <StatusBadge status={family.active ? 'active' : 'inactive'} />
                </div>
                
                {family.slogan && (
                  <p className="text-lg text-gray-600 mb-4 italic">"{family.slogan}"</p>
                )}
                
                {family.description && (
                  <p className="text-gray-700 mb-4">{family.description}</p>
                )}
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Created:</span>
                    <span>{new Date(family.created_at!).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Last Updated:</span>
                    <span>{new Date(family.updated_at!).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Family Details and Members */}
          <div className="lg:col-span-2 space-y-6">
            {/* Family Head */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Head</h3>
              {family.family_head ? (
                <div className="flex items-center space-x-4">
                  <Avatar
                    src={family.family_head.profile_image}
                    alt={`${family.family_head.first_name} ${family.family_head.last_name}`}
                    size="lg"
                  />
                  <div>
                    <div className="text-xl font-medium text-gray-900">
                      {family.family_head.first_name} {family.family_head.last_name}
                    </div>
                    <div className="text-gray-600">{family.family_head.email}</div>
                    <div className="text-sm text-gray-500">
                      Family Head since {new Date(family.created_at!).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No family head assigned</div>
              )}
            </div>

            {/* Family Members */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Family Members ({family.member_count || 0})
                </h3>
                <Button onClick={handleManageMembers}>
                  Manage Members
                </Button>
              </div>
              
              {family.members && family.members.length > 0 ? (
                <div className="space-y-3">
                  {family.members.map((member: any) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={member.profile_image}
                          alt={member.name}
                          size="sm"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">
                            Role: {member.role === 'head' ? 'Family Head' : member.role === 'deputy' ? 'Deputy' : 'Member'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined: {new Date(member.joined_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg font-medium mb-2">No members yet</div>
                  <div className="text-sm">Add members to this family to get started</div>
                </div>
              )}
            </div>

            {/* Family Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{family.member_count || 0}</div>
                  <div className="text-sm text-blue-800">Total Members</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {family.active ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-green-800">Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Modal */}
      <FamilyMembersModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        family={family}
      />
     </>
  );
} 