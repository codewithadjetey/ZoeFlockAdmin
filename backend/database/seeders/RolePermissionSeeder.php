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
            
            // Event Category Management
            'view-event-categories' => 'View Event Categories',
            'create-event-categories' => 'Create Event Categories',
            'edit-event-categories' => 'Edit Event Categories',
            'delete-event-categories' => 'Delete Event Categories',
            
            // Attendance Management
            'view-attendance' => 'View Attendance',
            'create-attendance' => 'Create Attendance',
            'edit-attendance' => 'Edit Attendance',
            'delete-attendance' => 'Delete Attendance',
            
            // General Attendance Management
            'view-general-attendance' => 'View General Attendance',
            'create-general-attendance' => 'Create General Attendance',
            'edit-general-attendance' => 'Edit General Attendance',
            
            // Family Management
            'view-families' => 'View Families',
            'create-families' => 'Create Families',
            'edit-families' => 'Edit Families',
            'delete-families' => 'Delete Families',
            
            // First Timer Management
            'view-first-timers' => 'View First Timers',
            'create-first-timers' => 'Create First Timers',
            'edit-first-timers' => 'Edit First Timers',
            'delete-first-timers' => 'Delete First Timers',
            
            // File Management
            'view-files' => 'View Files',
            'create-files' => 'Create Files',
            'edit-files' => 'Edit Files',
            'delete-files' => 'Delete Files',
            
            // Income Management
            'view-incomes' => 'View Incomes',
            'create-incomes' => 'Create Incomes',
            'edit-incomes' => 'Edit Incomes',
            'delete-incomes' => 'Delete Incomes',
            
            // Income Category Management
            'view-income-categories' => 'View Income Categories',
            'create-income-categories' => 'Create Income Categories',
            'edit-income-categories' => 'Edit Income Categories',
            'delete-income-categories' => 'Delete Income Categories',
            
            // Expense Management
            'view-expenses' => 'View Expenses',
            'create-expenses' => 'Create Expenses',
            'edit-expenses' => 'Edit Expenses',
            'delete-expenses' => 'Delete Expenses',
            
            // Expense Category Management
            'view-expense-categories' => 'View Expense Categories',
            'create-expense-categories' => 'Create Expense Categories',
            'edit-expense-categories' => 'Edit Expense Categories',
            'delete-expense-categories' => 'Delete Expense Categories',
            
            // Partnership Management
            'view-partnerships' => 'View Partnerships',
            'create-partnerships' => 'Create Partnerships',
            'edit-partnerships' => 'Edit Partnerships',
            'delete-partnerships' => 'Delete Partnerships',
            
            // Partnership Category Management
            'view-partnership-categories' => 'View Partnership Categories',
            'create-partnership-categories' => 'Create Partnership Categories',
            'edit-partnership-categories' => 'Edit Partnership Categories',
            'delete-partnership-categories' => 'Delete Partnership Categories',
            
            // Tithe Management
            'view-tithes' => 'View Tithes',
            'create-tithes' => 'Create Tithes',
            'edit-tithes' => 'Edit Tithes',
            'delete-tithes' => 'Delete Tithes',
            
            // Tithe Payment Management
            'view-tithe-payments' => 'View Tithe Payments',
            'create-tithe-payments' => 'Create Tithe Payments',
            'edit-tithe-payments' => 'Edit Tithe Payments',
            'delete-tithe-payments' => 'Delete Tithe Payments',
            
            // Reports Management
            'view-reports' => 'View Reports',
            'create-reports' => 'Create Reports',
            'export-reports' => 'Export Reports',
            
            // Import/Export Management
            'view-imports' => 'View Imports',
            'create-imports' => 'Create Imports',
            'delete-imports' => 'Delete Imports',
            
            // Donation Management (keeping for future use)
            'view-donations' => 'View Donations',
            'create-donations' => 'Create Donations',
            'edit-donations' => 'Edit Donations',
            'delete-donations' => 'Delete Donations',
            
            // Communication Management (keeping for future use)
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
            
            // Backup Management
            'view-backups' => 'View Backups',
            'create-backups' => 'Create Backups',
            'restore-backups' => 'Restore Backups',
            'delete-backups' => 'Delete Backups',
            'process-backups' => 'Process Backups',
        ];

        // Create permissions
        foreach ($permissions as $name => $displayName) {
            Permission::firstOrCreate([
                'name' => $name,
                'guard_name' => 'web',
            ], [
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
                    // User Management - Limited
                    'view-users', 'create-users', 'edit-users',
                    
                    // Member Management
                    'view-members', 'create-members', 'edit-members',
                    
                    // Group Management
                    'view-groups', 'create-groups', 'edit-groups',
                    
                    // Event Management
                    'view-events', 'create-events', 'edit-events',
                    'view-event-categories', 'create-event-categories', 'edit-event-categories',
                    
                    // Attendance Management
                    'view-attendance', 'create-attendance', 'edit-attendance',
                    'view-general-attendance', 'create-general-attendance', 'edit-general-attendance',
                    
                    // Family Management
                    'view-families', 'create-families', 'edit-families',
                    
                    // First Timer Management
                    'view-first-timers', 'create-first-timers', 'edit-first-timers',
                    
                    // File Management
                    'view-files', 'create-files', 'edit-files',
                    
                    // Financial Management - Full access
                    'view-incomes', 'create-incomes', 'edit-incomes',
                    'view-income-categories', 'create-income-categories', 'edit-income-categories',
                    'view-expenses', 'create-expenses', 'edit-expenses',
                    'view-expense-categories', 'create-expense-categories', 'edit-expense-categories',
                    'view-partnerships', 'create-partnerships', 'edit-partnerships',
                    'view-partnership-categories', 'create-partnership-categories', 'edit-partnership-categories',
                    'view-tithes', 'create-tithes', 'edit-tithes',
                    'view-tithe-payments', 'create-tithe-payments', 'edit-tithe-payments',
                    
                    // Reports Management
                    'view-reports', 'create-reports', 'export-reports',
                    
                    // Import Management
                    'view-imports', 'create-imports',
                    
                    // Settings Management
                    'view-settings', 'edit-settings',
                    
                    // Backup Management - Limited
                    'view-backups', 'create-backups',
                ],
            ],
            'family-head' => [
                'display_name' => 'Family Head',
                'description' => 'Family head with ability to manage family members and take attendance',
                'permissions' => [
                    // Member Management - Limited to family
                    'view-members', 'create-members', 'edit-members',
                    
                    // Group Management - View only
                    'view-groups',
                    
                    // Event Management - View only
                    'view-events', 'view-event-categories',
                    
                    // Attendance Management - Family attendance
                    'view-attendance', 'create-attendance', 'edit-attendance',
                    'view-general-attendance', 'create-general-attendance',
                    
                    // Family Management - Own family
                    'view-families', 'edit-families',
                    
                    // First Timer Management - Limited
                    'view-first-timers', 'create-first-timers',
                    
                    // File Management - Limited
                    'view-files', 'create-files',
                    
                    // Financial Management - Limited to family
                    'view-tithes', 'create-tithes', 'edit-tithes',
                    'view-tithe-payments', 'create-tithe-payments',
                    
                    // Reports Management - Limited
                    'view-reports',
                ],
            ],
            'member' => [
                'display_name' => 'Member',
                'description' => 'Regular church member',
                'permissions' => [
                    // Limited access to own data
                    'view-members', 'edit-members',
                    'view-events', 'view-event-categories',
                    'view-attendance', 'create-attendance',
                    'view-families',
                    'view-tithes', 'create-tithe-payments',
                    'view-reports',
                ],
            ],
        ];

        // Create roles and assign permissions
        foreach ($roles as $name => $roleData) {
            $role = Role::firstOrCreate([
                'name' => $name,
                'guard_name' => 'web',
            ], [
                'display_name' => $roleData['display_name'],
                'description' => $roleData['description'],
            ]);

            $role->syncPermissions($roleData['permissions']);
        }

        // Assign Family Head role to existing family heads
        $this->assignFamilyHeadRoles();
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

        foreach ($familyHeads as $familyHead) {
            if ($familyHead->user) {
                $familyHead->user->assignRole('family-head');
            }
        }
    }
}
