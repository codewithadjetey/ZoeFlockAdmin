<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions for different modules
        $permissions = [
            // User Management
            'view-users' => 'View Users',
            'create-users' => 'Create Users',
            'edit-users' => 'Edit Users',
            'delete-users' => 'Delete Users',
            
            // Member Management
            'view-members' => 'View Members',
            'create-members' => 'Create Members',
            'edit-members' => 'Edit Members',
            'delete-members' => 'Delete Members',
            
            // Group Management
            'view-groups' => 'View Groups',
            'create-groups' => 'Create Groups',
            'edit-groups' => 'Edit Groups',
            'delete-groups' => 'Delete Groups',
            
            // Event Management
            'view-events' => 'View Events',
            'create-events' => 'Create Events',
            'edit-events' => 'Edit Events',
            'delete-events' => 'Delete Events',
            
            // Donation Management
            'view-donations' => 'View Donations',
            'create-donations' => 'Create Donations',
            'edit-donations' => 'Edit Donations',
            'delete-donations' => 'Delete Donations',
            
            // Communication Management
            'view-communications' => 'View Communications',
            'create-communications' => 'Create Communications',
            'edit-communications' => 'Edit Communications',
            'delete-communications' => 'Delete Communications',
            
            // Settings Management
            'view-settings' => 'View Settings',
            'edit-settings' => 'Edit Settings',
            
            // Role Management
            'view-roles' => 'View Roles',
            'create-roles' => 'Create Roles',
            'edit-roles' => 'Edit Roles',
            'delete-roles' => 'Delete Roles',
            
            // Permission Management
            'view-permissions' => 'View Permissions',
            'create-permissions' => 'Create Permissions',
            'edit-permissions' => 'Edit Permissions',
            'delete-permissions' => 'Delete Permissions',
        ];

        // Create permissions
        foreach ($permissions as $name => $displayName) {
            Permission::create([
                'name' => $name,
                'guard_name' => 'web',
                'display_name' => $displayName,
                'description' => "Permission to {$displayName}",
            ]);
        }

        // Create roles
        $roles = [
            'admin' => [
                'display_name' => 'Administrator',
                'description' => 'Full access to all features',
                'permissions' => array_keys($permissions),
            ],
            'pastor' => [
                'display_name' => 'Pastor',
                'description' => 'Church pastor with limited administrative access',
                'permissions' => [
                    'view-users', 'view-members', 'create-members', 'edit-members',
                    'view-groups', 'create-groups', 'edit-groups',
                    'view-events', 'create-events', 'edit-events',
                    'view-donations', 'create-donations', 'edit-donations',
                    'view-communications', 'create-communications', 'edit-communications',
                    'view-settings',
                ],
            ],
            'member' => [
                'display_name' => 'Member',
                'description' => 'Regular church member',
                'permissions' => [
                ],
            ],
        ];

        // Create roles and assign permissions
        foreach ($roles as $name => $roleData) {
            $role = Role::create([
                'name' => $name,
                'guard_name' => 'web',
                'display_name' => $roleData['display_name'],
                'description' => $roleData['description'],
            ]);

            $role->givePermissionTo($roleData['permissions']);
        }
    }
}
