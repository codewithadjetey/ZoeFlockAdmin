'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/shared/Modal';
import { Button, SelectInput, Textarea } from '@/components/ui';
import { GroupsService } from '@/services/groups';
import { MembersService, Member } from '@/services/members';
import { toast } from 'react-toastify';

interface MemberGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
}

export const MemberGroupsModal: React.FC<MemberGroupsModalProps> = ({
  isOpen,
  onClose,
  member
}) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('member');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen && member) {
      loadMemberGroups();
      loadAvailableGroups();
    }
  }, [isOpen, member]);

  const loadMemberGroups = async () => {
    try {
      setLoading(true);
      // This would need to be implemented in the backend
      // For now, we'll show a placeholder
      setGroups([]);
    } catch (err) {
      toast.error('Failed to load member groups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableGroups = async () => {
    try {
      const response = await GroupsService.getGroups({ status: 'Active' });
      if (response.success) {
        // Filter out groups the member is already in
        const memberGroupIds = groups.map(g => g.id);
        const available = response.groups.data.filter(g => !memberGroupIds.includes(g.id));
        setAvailableGroups(available);
      }
    } catch (err) {
      console.error('Failed to load available groups:', err);
    }
  };

  const handleAddToGroup = async () => {
    if (!selectedGroupId) {
      toast.error('Please select a group');
      return;
    }

    try {
      const response = await GroupsService.addMemberToGroup(
        parseInt(selectedGroupId),
        member.id!,
        { role: selectedRole, notes }
      );

      if (response.success) {
        toast.success('Member added to group successfully');
        setSelectedGroupId('');
        setSelectedRole('member');
        setNotes('');
        loadMemberGroups();
        loadAvailableGroups();
      } else {
        toast.error(response.message || 'Failed to add member to group');
      }
    } catch (err) {
      toast.error('Failed to add member to group');
      console.error(err);
    }
  };

  const handleRemoveFromGroup = async (groupId: number) => {
    if (!confirm('Are you sure you want to remove this member from the group?')) {
      return;
    }

    try {
      const response = await GroupsService.removeMemberFromGroup(groupId, member.id!);
      if (response.success) {
        toast.success('Member removed from group successfully');
        loadMemberGroups();
        loadAvailableGroups();
      } else {
        toast.error(response.message || 'Failed to remove member from group');
      }
    } catch (err) {
      toast.error('Failed to remove member from group');
      console.error(err);
    }
  };

  const roleOptions = [
    { value: 'member', label: 'Member' },
    { value: 'leader', label: 'Leader' },
    { value: 'assistant', label: 'Assistant' },
    { value: 'coordinator', label: 'Coordinator' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Groups for ${member.first_name} ${member.last_name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Current Groups */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Current Groups</h3>
          {loading ? (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin text-gray-400"></i>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <i className="fas fa-users text-gray-300 text-2xl mb-2"></i>
              <p>Not a member of any groups yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                    <p className="text-sm text-gray-600">Role: {group.role || 'Member'}</p>
                    {group.notes && <p className="text-sm text-gray-500">{group.notes}</p>}
                  </div>
                  <button
                    onClick={() => handleRemoveFromGroup(group.id)}
                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                    title="Remove from group"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add to Group */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Add to Group</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput
              label="Select Group"
              value={selectedGroupId}
              onChange={setSelectedGroupId}
              options={availableGroups.map(g => ({ value: g.id.toString(), label: g.name }))}
              placeholder="Choose a group..."
            />
            <SelectInput
              label="Role"
              value={selectedRole}
              onChange={setSelectedRole}
              options={roleOptions}
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this membership..."
              rows={3}
            />
          </div>
          <div className="mt-4">
            <Button
              onClick={handleAddToGroup}
              disabled={!selectedGroupId}
              className="w-full"
            >
              <i className="fas fa-plus mr-2"></i>
              Add to Group
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}; 