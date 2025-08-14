<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AddFamilyHeadRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create attendance permissions if they don't exist
        $attendancePermissions = [
            'view-attendance' => 'View Attendance',
            'create-attendance' => 'Create Attendance',
            'edit-attendance' => 'Edit Attendance',
            'delete-attendance' => 'Delete Attendance',
        ];

        foreach ($attendancePermissions as $name => $displayName) {
            Permission::firstOrCreate([
                'name' => $name,
                'guard_name' => 'web',
            ], [
                'display_name' => $displayName,
                'description' => "Permission to {$displayName}",
            ]);
        }

        // Create Family Head role if it doesn't exist
        $familyHeadRole = Role::firstOrCreate([
            'name' => 'family-head',
            'guard_name' => 'web',
        ], [
            'display_name' => 'Family Head',
            'description' => 'Family head with ability to manage family members and take attendance',
        ]);

        // Assign permissions to Family Head role
        $familyHeadPermissions = [
            'view-members', 'create-members', 'edit-members',
            'view-events', 'view-attendance', 'create-attendance', 'edit-attendance',
            'view-groups',
        ];

        $familyHeadRole->givePermissionTo($familyHeadPermissions);

        // Assign Family Head role to existing family heads
        $this->assignFamilyHeadRoles();

        $this->command->info('Family Head role and permissions created successfully!');
    }

    /**
     * Assign Family Head role to existing family heads
     */
    private function assignFamilyHeadRoles(): void
    {
        // Get all members who are family heads
        $familyHeads = \App\Models\Member::whereHas('families', function ($q) {
            $q->where('role', 'head')->where('is_active', true);
        })->get();

        $assignedCount = 0;
        foreach ($familyHeads as $familyHead) {
            if ($familyHead->user && !$familyHead->user->hasRole('family-head')) {
                $familyHead->user->assignRole('family-head');
                $assignedCount++;
            }
        }

        $this->command->info("Assigned Family Head role to {$assignedCount} existing family heads.");
    }
} 