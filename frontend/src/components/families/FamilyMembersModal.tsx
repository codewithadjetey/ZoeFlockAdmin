"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/shared';
import { Button, TextInput, SelectInput, Avatar, StatusBadge } from '@/components/ui';
import { Family, FamilyMember, FamiliesService } from '@/services/families';
import { MembersService, Member } from '@/services/members';
import { toast } from 'react-toastify';

interface FamilyMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family | null;
}

export function FamilyMembersModal({ isOpen, onClose, family }: FamilyMembersModalProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<string>('member');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen && family) {
      loadFamilyMembers();
      loadAvailableMembers();
    }
  }, [isOpen, family]);

  const loadFamilyMembers = async () => {
    if (!family) return;
    
    try {
      setLoading(true);
      const response = await FamiliesService.getFamilyMembers(family.id!);
      if (response.success) {
        setMembers(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMembers = async () => {
    try {
      const response = await MembersService.getMembers();
      if (response.success) {
        // For now, show all members since family information is not available in the API response
        setAvailableMembers(response.members.data);
      }
    } catch (error) {
      console.error('Error loading available members:', error);
    }
  };

  const handleAddMember = async () => {
    if (!family || !selectedMemberId) {
      toast.error('Please select a member to add');
      return;
    }

    try {
      setLoading(true);
      const response = await FamiliesService.addMemberToFamily(
        family.id!,
        selectedMemberId,
        { role: selectedRole, notes }
      );

      if (response.success) {
        toast.success('Member added to family successfully');
        setSelectedMemberId(0);
        setSelectedRole('member');
        setNotes('');
        loadFamilyMembers();
        loadAvailableMembers();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error adding member to family:', error);
      toast.error('Failed to add member to family');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!family) return;

    if (!confirm('Are you sure you want to remove this member from the family?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await FamiliesService.removeMemberFromFamily(family.id!, memberId);

      if (response.success) {
        toast.success('Member removed from family successfully');
        loadFamilyMembers();
        loadAvailableMembers();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error removing member from family:', error);
      toast.error('Failed to remove member from family');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'head':
        return 'bg-blue-100 text-blue-800';
      case 'deputy':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'head':
        return 'Family Head';
      case 'deputy':
        return 'Deputy';
      default:
        return 'Member';
    }
  };

  if (!family) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage ${family.name} Members`} size="xl">
      <div className="space-y-6">
        {/* Add Member Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Member
              </label>
              <SelectInput
                value={String(selectedMemberId)}
                onChange={(value) => setSelectedMemberId(parseInt(value))}
                options={[
                  { value: '0', label: 'Choose a member' },
                  ...availableMembers.map((member) => ({
                    value: String(member.id),
                    label: `${member.first_name} ${member.last_name}`
                  }))
                ]}
                searchable={true}
                placeholder="Search and select a member..."
                clearable={true}
                maxHeight="200px"
                noOptionsMessage="No members found matching your search"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <SelectInput
                value={selectedRole}
                onChange={(value) => setSelectedRole(value)}
                options={[
                  { value: 'member', label: 'Member' },
                  { value: 'deputy', label: 'Deputy' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <TextInput
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddMember}
                disabled={loading || !selectedMemberId}
                className="w-full"
              >
                Add Member
              </Button>
            </div>
          </div>
        </div>

        {/* Current Members Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Members ({members.length})</h3>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No members found</div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={undefined}
                      alt={`${member.first_name} ${member.last_name}`}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{member.first_name} {member.last_name}</div>
                      <div className="text-sm text-gray-500">
                        Joined: {new Date(member.joined_at).toLocaleDateString()}
                      </div>
                      {member.notes && (
                        <div className="text-sm text-gray-500">{member.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                    <StatusBadge status={member.is_active ? 'active' : 'inactive'} />
                    {member.role !== 'head' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={loading}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
} 