<?php

namespace App\Services;

use App\Models\Group;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class GroupService
{
    /**
     * Get all groups with optional filters
     */
    public function getGroups(array $filters = []): array
    {
        $query = Group::with(['creator']);

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('leader_name', 'like', "%{$search}%");
            });
        }

        // Apply category filter
        if (!empty($filters['category'])) {
            $query->byCategory($filters['category']);
        }

        // Apply status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $groups = $query->orderBy('created_at', 'desc')->get();

        return [
            'success' => true,
            'message' => 'Groups retrieved successfully',
            'data' => $groups
        ];
    }

    /**
     * Create a new group
     */
    public function createGroup(array $data): array
    {
        try {
            DB::beginTransaction();

                    $group = Group::create([
            'name' => $data['name'],
            'description' => $data['description'],
            'category' => $data['category'],
            'max_members' => $data['max_members'],
            'meeting_day' => $data['meeting_day'],
            'meeting_time' => $data['meeting_time'],
            'location' => $data['location'],
            'status' => $data['status'] ?? 'Active',
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Group created successfully',
                'data' => $group->load(['creator'])
            ];
        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to create group: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get a specific group
     */
    public function getGroup(int $id): array
    {
        $group = Group::with(['creator'])->find($id);

        if (!$group) {
            return [
                'success' => false,
                'message' => 'Group not found'
            ];
        }

        return [
            'success' => true,
            'message' => 'Group retrieved successfully',
            'data' => $group
        ];
    }

    /**
     * Update a group
     */
    public function updateGroup(int $id, array $data): array
    {
        try {
            $group = Group::find($id);

            if (!$group) {
                return [
                    'success' => false,
                    'message' => 'Group not found'
                ];
            }

            DB::beginTransaction();

            $group->update(array_merge($data, [
                'updated_by' => Auth::id()
            ]));

            DB::commit();

            return [
                'success' => true,
                'message' => 'Group updated successfully',
                'data' => $group->load(['creator'])
            ];
        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to update group: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Delete a group
     */
    public function deleteGroup(int $id): array
    {
        try {
            $group = Group::find($id);

            if (!$group) {
                return [
                    'success' => false,
                    'message' => 'Group not found'
                ];
            }

            $group->delete();

            return [
                'success' => true,
                'message' => 'Group deleted successfully'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete group: ' . $e->getMessage()
            ];
        }
    }



    /**
     * Get available categories
     */
    public function getCategories(): array
    {
        return [
            'Ministry',
            'Education',
            'Prayer',
            'Music',
            'Fellowship',
            'Outreach',
            'Children',
            'Youth',
            'Seniors',
        ];
    }

    /**
     * Get available statuses
     */
    public function getStatuses(): array
    {
        return [
            'Active',
            'Inactive',
            'Full',
        ];
    }

    /**
     * Get group members
     */
    public function getGroupMembers(int $groupId): array
    {
        try {
            $group = Group::with(['members.creator'])->find($groupId);

            if (!$group) {
                return [
                    'success' => false,
                    'message' => 'Group not found'
                ];
            }

            return [
                'success' => true,
                'message' => 'Group members retrieved successfully',
                'data' => $group->members
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve group members: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Add member to group
     */
    public function addMemberToGroup(int $groupId, int $memberId, array $data = []): array
    {
        try {
            $group = Group::find($groupId);

            if (!$group) {
                return [
                    'success' => false,
                    'message' => 'Group not found'
                ];
            }

            // Check if member is already in the group
            if ($group->members()->where('member_id', $memberId)->exists()) {
                return [
                    'success' => false,
                    'message' => 'Member is already in this group'
                ];
            }

            // Check if group is full
            if ($group->is_full) {
                return [
                    'success' => false,
                    'message' => 'Group is full'
                ];
            }

            $group->members()->attach($memberId, [
                'role' => $data['role'] ?? 'member',
                'notes' => $data['notes'] ?? null,
                'joined_at' => now(),
                'is_active' => true,
            ]);

            return [
                'success' => true,
                'message' => 'Member added to group successfully'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to add member to group: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Remove member from group
     */
    public function removeMemberFromGroup(int $groupId, int $memberId): array
    {
        try {
            $group = Group::find($groupId);

            if (!$group) {
                return [
                    'success' => false,
                    'message' => 'Group not found'
                ];
            }

            $group->members()->detach($memberId);

            return [
                'success' => true,
                'message' => 'Member removed from group successfully'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to remove member from group: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get available member roles
     */
    public function getMemberRoles(): array
    {
        return [
            'member',
            'leader',
            'coordinator',
            'mentor',
        ];
    }
} 