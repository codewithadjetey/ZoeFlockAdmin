<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class InvitationPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create invitation permissions
        $permissions = [
            'create-event-invitations' => 'Create Event Invitations',
            'view-event-invitations' => 'View Event Invitations',
            'manage-event-invitations' => 'Manage Event Invitations',
        ];

        // Create permissions
        foreach ($permissions as $name => $description) {
            Permission::firstOrCreate(
                ['name' => $name],
                ['guard_name' => 'web', 'description' => $description]
            );
        }

        // Assign permissions to roles
        $this->assignPermissionsToRoles();
    }

    /**
     * Assign invitation permissions to appropriate roles
     */
    private function assignPermissionsToRoles(): void
    {
        // Super Admin - gets all permissions
        $superAdmin = Role::where('name', 'Super Admin')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo([
                'create-event-invitations',
                'view-event-invitations',
                'manage-event-invitations',
            ]);
        }

        // Admin - gets all permissions
        $admin = Role::where('name', 'Admin')->first();
        if ($admin) {
            $admin->givePermissionTo([
                'create-event-invitations',
                'view-event-invitations',
                'manage-event-invitations',
            ]);
        }

        // Event Manager - gets all permissions
        $eventManager = Role::where('name', 'Event Manager')->first();
        if ($eventManager) {
            $eventManager->givePermissionTo([
                'create-event-invitations',
                'view-event-invitations',
                'manage-event-invitations',
            ]);
        }

        // Pastor - gets view and manage permissions
        $pastor = Role::where('name', 'Pastor')->first();
        if ($pastor) {
            $pastor->givePermissionTo([
                'view-event-invitations',
                'manage-event-invitations',
            ]);
        }

        // Family Head - gets view permission only
        $familyHead = Role::where('name', 'Family Head')->first();
        if ($familyHead) {
            $familyHead->givePermissionTo([
                'view-event-invitations',
            ]);
        }

        // Member - gets view permission only
        $member = Role::where('name', 'Member')->first();
        if ($member) {
            $member->givePermissionTo([
                'view-event-invitations',
            ]);
        }

        // Visitor - no permissions (they can only access public invitation forms)
        // No permissions assigned to Visitor role
    }
}