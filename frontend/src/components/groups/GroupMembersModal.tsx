'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { Button, SelectInput, Textarea } from '@/components/ui';
import { GroupsService } from '@/services/groups';
import { MembersService, Member } from '@/services/members';
import { Group } from '@/interfaces/groups';
import { toast } from 'react-toastify';

interface GroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | undefined;
}

export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  isOpen,
  onClose,
  group
}) => {
  const [members, setMembers] = useState<any[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('member');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen && group) {
      loadGroupMembers();
      loadAvailableMembers();
    }
  }, [isOpen, group]);

  // Don't render if no group is provided
  if (!group) {
    return null;
  }

  const loadGroupMembers = async () => {
    try {
      setLoading(true);
      const response = await GroupsService.getGroupMembers(group.id!);
      if (response.success) {
        setMembers(response.data);
      } else {
        toast.error(response.message || 'Failed to load group members');
      }
    } catch (err) {
      toast.error('Failed to load group members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMembers = async () => {
    try {
      const response = await MembersService.getMembers({ status: 'active' });
      if (response.success) {
        // Filter out members who are already in this group
        const groupMemberIds = members.map(m => m.id);
        const available = response.members.data.filter(m => !groupMemberIds.includes(m.id));
        setAvailableMembers(available);
      }
    } catch (err) {
      console.error('Failed to load available members:', err);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) {
      toast.error('Please select a member');
      return;
    }

    try {
      const response = await GroupsService.addMemberToGroup(
        group.id!,
        parseInt(selectedMemberId),
        { role: selectedRole, notes }
      );

      if (response.success) {
        toast.success('Member added to group successfully');
        setSelectedMemberId('');
        setSelectedRole('member');
        setNotes('');
        loadGroupMembers();
        loadAvailableMembers();
      } else {
        toast.error(response.message || 'Failed to add member to group');
      }
    } catch (err) {
      toast.error('Failed to add member to group');
      console.error(err);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this member from the group?')) {
      return;
    }

    try {
      const response = await GroupsService.removeMemberFromGroup(group.id!, memberId);
      if (response.success) {
        toast.success('Member removed from group successfully');
        loadGroupMembers();
        loadAvailableMembers();
      } else {
        toast.error(response.message || 'Failed to remove member from group');
      }
    } catch (err) {
      toast.error('Failed to remove member from group');
      console.error(err);
    }
  };

  const memberOptions = availableMembers.map(member => ({
    value: member.id?.toString() || '',
    label: `${member.first_name} ${member.last_name} (${member.email})`
  }));

  const roleOptions = GroupsService.getMemberRoles().map(role => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1)
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Members - ${group.name}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Add Member Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectInput
              label="Select Member"
              value={selectedMemberId}
              onChange={setSelectedMemberId}
              options={memberOptions}
              placeholder="Choose a member"
            />
            <SelectInput
              label="Role"
              value={selectedRole}
              onChange={setSelectedRole}
              options={roleOptions}
            />
            <div className="flex items-end">
              <Button onClick={handleAddMember} disabled={!selectedMemberId}>
                Add Member
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <Textarea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this member's role or participation"
              rows={2}
            />
          </div>
        </div>

        {/* Current Members Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Current Members ({members.length}/{group.max_members})
          </h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-users text-4xl mb-2"></i>
              <p>No members in this group yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-blue-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Role: {member.pivot?.role || 'member'} • Joined: {member.pivot?.joined_at ? new Date(member.pivot.joined_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};