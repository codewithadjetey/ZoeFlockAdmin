<?php

namespace App\Services;

use App\Models\Member;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class MemberService
{
    /**
     * Get all members with optional filters
     */
    public function getMembers(array $filters = []): array
    {
        $query = Member::with(['creator', 'updater']);

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->search($search);
        }

        // Apply status filter
        if (!empty($filters['status'])) {
            if ($filters['status'] === 'active') {
                $query->active();
            } elseif ($filters['status'] === 'inactive') {
                $query->inactive();
            }
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'first_name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        
        if (in_array($sortBy, ['first_name', 'last_name', 'email', 'created_at', 'membership_date'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $members = $query->paginate($filters['per_page'] ?? 10);

        return [
            'success' => true,
            'message' => 'Members retrieved successfully',
            'members' => $members
        ];
    }

    /**
     * Create a new member
     */
    public function createMember(array $data): array
    {
        try {
            DB::beginTransaction();

            $member = Member::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'marital_status' => $data['marital_status'] ?? null,
                'occupation' => $data['occupation'] ?? null,
                'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
                'baptism_date' => $data['baptism_date'] ?? null,
                'membership_date' => $data['membership_date'] ?? null,
                'notes' => $data['notes'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Member created successfully',
                'data' => [
                    'member' => $member->load(['creator'])
                ]
            ];
        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to create member: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get a specific member
     */
    public function getMember(int $id): array
    {
        $member = Member::with(['creator', 'updater', 'groups'])->find($id);

        if (!$member) {
            return [
                'success' => false,
                'message' => 'Member not found'
            ];
        }

        return [
            'success' => true,
            'data' => [
                'member' => $member
            ]
        ];
    }

    /**
     * Update a member
     */
    public function updateMember(int $id, array $data): array
    {
        try {
            $member = Member::find($id);

            if (!$member) {
                return [
                    'success' => false,
                    'message' => 'Member not found'
                ];
            }

            DB::beginTransaction();

            $member->update(array_merge($data, [
                'updated_by' => Auth::id()
            ]));

            DB::commit();

            return [
                'success' => true,
                'message' => 'Member updated successfully',
                'data' => [
                    'member' => $member->load(['creator', 'updater'])
                ]
            ];
        } catch (Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to update member: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Delete a member
     */
    public function deleteMember(int $id): array
    {
        try {
            $member = Member::find($id);

            if (!$member) {
                return [
                    'success' => false,
                    'message' => 'Member not found'
                ];
            }

            $member->delete();

            return [
                'success' => true,
                'message' => 'Member deleted successfully'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete member: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get member statistics
     */
    public function getStatistics(): array
    {
        try {
            $totalMembers = Member::count();
            $activeMembers = Member::active()->count();
            $inactiveMembers = Member::inactive()->count();
            $newMembersThisMonth = Member::where('created_at', '>=', now()->startOfMonth())->count();
            $newMembersThisYear = Member::where('created_at', '>=', now()->startOfYear())->count();

            // Gender distribution
            $genderDistribution = Member::selectRaw('gender, COUNT(*) as count')
                ->whereNotNull('gender')
                ->groupBy('gender')
                ->pluck('count', 'gender')
                ->toArray();

            // Marital status distribution
            $maritalStatusDistribution = Member::selectRaw('marital_status, COUNT(*) as count')
                ->whereNotNull('marital_status')
                ->groupBy('marital_status')
                ->pluck('count', 'marital_status')
                ->toArray();

            // Age groups
            $ageGroups = Member::selectRaw('
                CASE 
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 18 THEN "Under 18"
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 18 AND 25 THEN "18-25"
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 26 AND 35 THEN "26-35"
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 36 AND 50 THEN "36-50"
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 51 AND 65 THEN "51-65"
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) > 65 THEN "Over 65"
                    ELSE "Unknown"
                END as age_group,
                COUNT(*) as count
            ')
                ->whereNotNull('date_of_birth')
                ->groupBy('age_group')
                ->pluck('count', 'age_group')
                ->toArray();

            return [
                'success' => true,
                'message' => 'Statistics retrieved successfully',
                'data' => [
                    'total_members' => $totalMembers,
                    'active_members' => $activeMembers,
                    'inactive_members' => $inactiveMembers,
                    'new_members_this_month' => $newMembersThisMonth,
                    'new_members_this_year' => $newMembersThisYear,
                    'gender_distribution' => $genderDistribution,
                    'marital_status_distribution' => $maritalStatusDistribution,
                    'age_groups' => $ageGroups,
                ]
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get available gender options
     */
    public function getGenderOptions(): array
    {
        return [
            'male' => 'Male',
            'female' => 'Female',
            'other' => 'Other',
        ];
    }

    /**
     * Get available marital status options
     */
    public function getMaritalStatusOptions(): array
    {
        return [
            'single' => 'Single',
            'married' => 'Married',
            'divorced' => 'Divorced',
            'widowed' => 'Widowed',
        ];
    }
} 