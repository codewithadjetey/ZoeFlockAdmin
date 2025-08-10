<?php

namespace App\Services;

use App\Models\Group;
use App\Models\User;
use App\Models\FileUpload;
use App\Services\FileUploadService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;

class GroupService
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Get all groups with optional filters and pagination
     */
    public function getGroups(array $filters = [], int $perPage = 10): array
    {
        $query = Group::with(['creator'])->where('deleted', 0);

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

        // Apply member filter
        if (!empty($filters['member_id'])) {
            $query->byMember($filters['member_id']);
        }

        // Apply available spots filter
        if (!empty($filters['with_available_spots'])) {
            $query->withAvailableSpots();
        }

        $groups = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'success' => true,
            'message' => 'Groups retrieved successfully',
            'data' => $groups
        ];
    }

    /**
     * Create a new group with file upload support
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

            // Handle file upload if provided
            if (!empty($data['upload_token'])) {
                $attachedFile = $this->fileUploadService->attachFileToModel(
                    $data['upload_token'],
                    Group::class,
                    $group->id
                );

                if ($attachedFile) {
                    $group->img_path = $attachedFile->path;
                    $group->save();
                }
            }

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
     * Get a specific group with full details
     */
    public function getGroup(int $id): array
    {
        $group = Group::with(['creator', 'members.creator', 'events'])->find($id);

        if (!$group || $group->deleted) {
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
     * Update a group with file upload support
     */
    public function updateGroup(int $id, array $data): array
    {
        try {
            $group = Group::find($id);

            if (!$group || $group->deleted) {
                return [
                    'success' => false,
                    'message' => 'Group not found'
                ];
            }

            DB::beginTransaction();

            // Handle file upload if provided
            if (!empty($data['upload_token'])) {
                $attachedFile = $this->fileUploadService->attachFileToModel(
                    $data['upload_token'],
                    Group::class,
                    $group->id
                );

                if ($attachedFile) {
                    $data['img_path'] = $attachedFile->path;
                }
            }

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
     * Soft delete a group
     */
    public function deleteGroup(int $id): array
    {
        try {
            $group = Group::find($id);

            if (!$group || $group->deleted) {
                return [
                    'success' => false,
                    'message' => 'Group not found'
                ];
            }

            $group->deleted = 1;
            $group->save();

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
            'Bible Study',
            'Worship',
            'Service',
            'Social',
            'Technical',
            'Administrative',
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
            'Suspended',
            'Archived',
        ];
    }

    /**
     * Get group members with pagination
     */
    public function getGroupMembers(int $groupId, int $perPage = 15): array
    {
        try {
            $group = Group::find($groupId);

            if (!$group || $group->deleted) {
                return [
                    'success' => false,
                    'message' => 'Group not found'
                ];
            }

            $members = $group->members()
                ->with(['creator'])
                ->orderBy('pivot_joined_at', 'desc')
                ->paginate($perPage);

            return [
                'success' => true,
                'message' => 'Group members retrieved successfully',
                'data' => $members
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve group members: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Add member to group with validation
     */
    public function addMemberToGroup(int $groupId, int $memberId, array $data = []): array
    {
        try {
            $group = Group::find($groupId);

            if (!$group || $group->deleted) {
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

            // Update group status if it becomes full
            if ($group->fresh()->is_full) {
                $group->update(['status' => 'Full']);
            }

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

            if (!$group || $group->deleted) {
                return [
                    'success' => false,
                    'message' => 'Group not found'
                ];
            }

            $group->members()->detach($memberId);

            // Update group status if it's no longer full
            if ($group->fresh()->status === 'Full' && !$group->is_full) {
                $group->update(['status' => 'Active']);
            }

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
     * Update member role in group
     */
    public function updateMemberRole(int $groupId, int $memberId, string $role): array
    {
        try {
            $group = Group::find($groupId);

            if (!$group || $group->deleted) {
                return [
                    'success' => false,
                    'message' => 'Group not found'
                ];
            }

            $group->members()->updateExistingPivot($memberId, [
                'role' => $role,
                'updated_at' => now()
            ]);

            return [
                'success' => true,
                'message' => 'Member role updated successfully'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to update member role: ' . $e->getMessage()
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
            'assistant',
            'secretary',
            'treasurer',
        ];
    }

    /**
     * Get group statistics
     */
    public function getGroupStats(int $groupId): array
    {
        try {
            $group = Group::find($groupId);

            if (!$group || $group->deleted) {
                return [
                    'success' => false,
                    'message' => 'Group not found'
                ];
            }

            $stats = [
                'total_members' => $group->member_count,
                'available_spots' => $group->available_spots,
                'is_full' => $group->is_full,
                'total_events_count' => $group->events()->count(),
            ];

            return [
                'success' => true,
                'message' => 'Group statistics retrieved successfully',
                'data' => $stats
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve group statistics: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get overall groups statistics
     */
    public function getOverallStats(): array
    {
        try {
            $stats = [
                'total_groups' => Group::where('deleted', 0)->count(),
                'active_groups' => Group::where('deleted', 0)->active()->count(),
                'full_groups' => Group::where('deleted', 0)->full()->count(),
                'groups_by_category' => Group::where('deleted', 0)
                    ->selectRaw('category, COUNT(*) as count')
                    ->groupBy('category')
                    ->pluck('count', 'category')
                    ->toArray(),
                'total_members_across_groups' => DB::table('group_members')
                    ->where('is_active', true)
                    ->distinct('member_id')
                    ->count('member_id'),
            ];

            return [
                'success' => true,
                'message' => 'Overall statistics retrieved successfully',
                'data' => $stats
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve overall statistics: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Search groups with advanced filters
     */
    public function searchGroups(array $filters, int $perPage = 15): array
    {
        try {
            $query = Group::with(['creator'])->where('deleted', 0);

            // Text search
            if (!empty($filters['search'])) {
                $search = $filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%");
                });
            }

            // Category filter
            if (!empty($filters['category'])) {
                $query->byCategory($filters['category']);
            }

            // Status filter
            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            // Member count filter
            if (!empty($filters['min_members'])) {
                $query->whereRaw('(SELECT COUNT(*) FROM group_members WHERE group_members.group_id = groups.id AND group_members.is_active = 1) >= ?', [$filters['min_members']]);
            }

            if (!empty($filters['max_members'])) {
                $query->whereRaw('(SELECT COUNT(*) FROM group_members WHERE group_members.group_id = groups.id AND group_members.is_active = 1) <= ?', [$filters['max_members']]);
            }

            // Meeting day filter
            if (!empty($filters['meeting_day'])) {
                $query->where('meeting_day', $filters['meeting_day']);
            }

            // Available spots filter
            if (!empty($filters['with_available_spots'])) {
                $query->withAvailableSpots();
            }

            // Sort options
            $sortBy = $filters['sort_by'] ?? 'created_at';
            $sortOrder = $filters['sort_order'] ?? 'desc';
            
            if (in_array($sortBy, ['name', 'created_at', 'updated_at', 'max_members'])) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            $groups = $query->paginate($perPage);

            return [
                'success' => true,
                'message' => 'Groups search completed successfully',
                'data' => $groups
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to search groups: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Bulk update group statuses
     */
    public function bulkUpdateStatus(array $groupIds, string $status): array
    {
        try {
            if (!in_array($status, $this->getStatuses())) {
                return [
                    'success' => false,
                    'message' => 'Invalid status provided'
                ];
            }

            $updatedCount = Group::whereIn('id', $groupIds)
                ->where('deleted', 0)
                ->update([
                    'status' => $status,
                    'updated_by' => Auth::id()
                ]);

            return [
                'success' => true,
                'message' => "Updated {$updatedCount} groups successfully",
                'data' => ['updated_count' => $updatedCount]
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to bulk update groups: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get groups that need attention (full, inactive, etc.)
     */
    public function getGroupsNeedingAttention(): array
    {
        try {
            $groups = Group::where('deleted', 0)
                ->where(function ($query) {
                    $query->where('status', 'Full')
                          ->orWhere('status', 'Inactive')
                          ->orWhereRaw('(SELECT COUNT(*) FROM group_members WHERE group_members.group_id = groups.id AND group_members.is_active = 1) = 0');
                })
                ->with(['creator'])
                ->orderBy('updated_at', 'desc')
                ->get();

            return [
                'success' => true,
                'message' => 'Groups needing attention retrieved successfully',
                'data' => $groups
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve groups needing attention: ' . $e->getMessage()
            ];
        }
    }
} 