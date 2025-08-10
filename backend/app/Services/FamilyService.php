<?php

namespace App\Services;

use App\Models\Family;
use App\Models\Member;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FamilyService
{
    /**
     * Create a new family with the specified family head
     */
    public function createFamily(array $data): Family
    {
        return DB::transaction(function () use ($data) {
            // Check if the family head is already in another family
            $familyHead = Member::find($data['family_head_id']);
            if ($familyHead->family) {
                throw new \Exception('Family head is already a member of another family');
            }

            $family = Family::create([
                'name' => $data['name'],
                'slogan' => $data['slogan'] ?? null,
                'description' => $data['description'] ?? null,
                'family_head_id' => $data['family_head_id'],
                'active' => true,
                'deleted' => false,
            ]);

            // Add the family head as a member with 'head' role
            $family->members()->attach($data['family_head_id'], [
                'role' => 'head',
                'joined_at' => now(),
                'is_active' => true,
            ]);

            return $family;
        });
    }

    /**
     * Add a member to a family
     */
    public function addMemberToFamily(Family $family, int $memberId, array $data = []): bool
    {
        return DB::transaction(function () use ($family, $memberId, $data) {
            // Check if member is already in this family
            if ($family->members()->where('member_id', $memberId)->exists()) {
                throw new \Exception('Member is already in this family');
            }

            // Check if member is already in another family
            $member = Member::find($memberId);
            if ($member->family) {
                throw new \Exception('Member is already a member of another family');
            }

            // Check if family is active
            if (!$family->active) {
                throw new \Exception('Cannot add members to inactive family');
            }

            $family->members()->attach($memberId, [
                'role' => $data['role'] ?? 'member',
                'notes' => $data['notes'] ?? null,
                'joined_at' => now(),
                'is_active' => true,
            ]);

            return true;
        });
    }

    /**
     * Remove a member from a family
     */
    public function removeMemberFromFamily(Family $family, int $memberId): bool
    {
        return DB::transaction(function () use ($family, $memberId) {
            // Prevent removing the family head
            if ($family->family_head_id === $memberId) {
                throw new \Exception('Cannot remove the family head');
            }

            $family->members()->detach($memberId);
            return true;
        });
    }

    /**
     * Update family head
     */
    public function updateFamilyHead(Family $family, int $newHeadId): bool
    {
        return DB::transaction(function () use ($family, $newHeadId) {
            // Check if new head is already in another family
            $newHead = Member::find($newHeadId);
            if ($newHead->family && $newHead->family->id !== $family->id) {
                throw new \Exception('New family head is already a member of another family');
            }

            // Update the family head
            $family->family_head_id = $newHeadId;
            $family->save();

            // Update member roles
            $family->members()->updateExistingPivot($newHeadId, ['role' => 'head']);
            
            // If the old head exists, change their role to member
            if ($family->family_head_id !== $newHeadId) {
                $family->members()->updateExistingPivot($family->family_head_id, ['role' => 'member']);
            }

            return true;
        });
    }

    /**
     * Get families that a member can join
     */
    public function getAvailableFamiliesForMember(int $memberId): \Illuminate\Database\Eloquent\Collection
    {
        $member = Member::find($memberId);
        
        // If member is already in a family, return empty collection
        if ($member->family) {
            return collect();
        }

        // Return active families that are not deleted
        return Family::active()->get();
    }

    /**
     * Check if a member can manage a specific family
     */
    public function canMemberManageFamily(int $memberId, Family $family): bool
    {
        return $family->canMemberManage($memberId);
    }

    /**
     * Get family statistics
     */
    public function getFamilyStatistics(): array
    {
        $totalFamilies = Family::where('deleted', false)->count();
        $activeFamilies = Family::active()->count();
        $inactiveFamilies = Family::inactive()->count();
        $totalFamilyMembers = DB::table('family_members')
            ->join('families', 'families.id', '=', 'family_members.family_id')
            ->where('families.deleted', false)
            ->where('families.active', true)
            ->where('family_members.is_active', true)
            ->count();

        return [
            'total_families' => $totalFamilies,
            'active_families' => $activeFamilies,
            'inactive_families' => $inactiveFamilies,
            'total_family_members' => $totalFamilyMembers,
            'average_members_per_family' => $activeFamilies > 0 ? round($totalFamilyMembers / $activeFamilies, 2) : 0,
        ];
    }

    /**
     * Search families with filters
     */
    public function searchFamilies(array $filters = []): \Illuminate\Database\Eloquent\Builder
    {
        $query = Family::where('deleted', false)->with(['familyHead']);

        // Search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('slogan', 'like', "%{$search}%");
            });
        }

        // Active filter
        if (isset($filters['active'])) {
            $query->where('active', $filters['active']);
        }

        // Family head filter
        if (!empty($filters['family_head_id'])) {
            $query->where('family_head_id', $filters['family_head_id']);
        }

        return $query;
    }
} 