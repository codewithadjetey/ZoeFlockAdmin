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
            'toggle-user-status' => 'Toggle User Status',
            'change-user-password' => 'Change User Password',
            
            // Member Management
            'view-members' => 'View Members',
            'create-members' => 'Create Members',
            'edit-members' => 'Edit Members',
            'delete-members' => 'Delete Members',
            'view-member-statistics' => 'View Member Statistics',
            'create-user-account' => 'Create User Account',
            'manage-member-groups' => 'Manage Member Groups',
            'update-member-group-role' => 'Update Member Group Role',
            
            // Group Management
            'view-groups' => 'View Groups',
            'create-groups' => 'Create Groups',
            'edit-groups' => 'Edit Groups',
            'delete-groups' => 'Delete Groups',
            'view-group-statistics' => 'View Group Statistics',
            'view-group-overall-stats' => 'View Group Overall Statistics',
            'view-groups-needing-attention' => 'View Groups Needing Attention',
            'search-groups' => 'Search Groups',
            'bulk-update-group-status' => 'Bulk Update Group Status',
            'manage-group-members' => 'Manage Group Members',
            'update-group-member-role' => 'Update Group Member Role',
            
            // Event Management
            'view-events' => 'View Events',
            'create-events' => 'Create Events',
            'edit-events' => 'Edit Events',
            'delete-events' => 'Delete Events',
            'cancel-events' => 'Cancel Events',
            'publish-events' => 'Publish Events',
            'manage-event-families' => 'Manage Event Families',
            'manage-event-groups' => 'Manage Event Groups',
            'view-member-events' => 'View Member Events',
            
            // Event Category Management
            'view-event-categories' => 'View Event Categories',
            'create-event-categories' => 'Create Event Categories',
            'edit-event-categories' => 'Edit Event Categories',
            'delete-event-categories' => 'Delete Event Categories',
            'view-category-events' => 'View Category Events',
            'generate-category-events' => 'Generate Category Events',
            'generate-one-time-event' => 'Generate One Time Event',
            'toggle-category-status' => 'Toggle Category Status',
            'view-category-statistics' => 'View Category Statistics',
            
            // Attendance Management
            'view-attendance' => 'View Attendance',
            'create-attendance' => 'Create Attendance',
            'edit-attendance' => 'Edit Attendance',
            'delete-attendance' => 'Delete Attendance',
            'scan-member-id' => 'Scan Member ID',
            'get-member-identification-id' => 'Get Member Identification ID',
            'generate-member-identification-id' => 'Generate Member Identification ID',
            'get-event-attendance' => 'Get Event Attendance',
            'get-eligible-members' => 'Get Eligible Members',
            'update-attendance-status' => 'Update Attendance Status',
            'mark-check-in' => 'Mark Check In',
            'mark-check-out' => 'Mark Check Out',
            'bulk-update-attendance' => 'Bulk Update Attendance',
            'ensure-attendance-records' => 'Ensure Attendance Records',
            'get-individual-statistics' => 'Get Individual Statistics',
            
            // General Attendance Management
            'view-general-attendance' => 'View General Attendance',
            'create-general-attendance' => 'Create General Attendance',
            'edit-general-attendance' => 'Edit General Attendance',
            'get-event-general-attendance' => 'Get Event General Attendance',
            'update-general-attendance' => 'Update General Attendance',
            'get-attendance-analytics' => 'Get Attendance Analytics',
            'get-general-attendance-summary' => 'Get General Attendance Summary',
            'get-general-attendance-statistics' => 'Get General Attendance Statistics',
            'get-general-attendance-families' => 'Get General Attendance Families',
            
            // Family Management
            'view-families' => 'View Families',
            'create-families' => 'Create Families',
            'edit-families' => 'Edit Families',
            'delete-families' => 'Delete Families',
            'manage-family-members' => 'Manage Family Members',
            'get-family-events' => 'Get Family Events',
            'get-my-family' => 'Get My Family',
            'get-family-statistics' => 'Get Family Statistics',
            
            // First Timer Management
            'view-first-timers' => 'View First Timers',
            'create-first-timers' => 'Create First Timers',
            'edit-first-timers' => 'Edit First Timers',
            'delete-first-timers' => 'Delete First Timers',
            'create-first-timer-guest' => 'Create First Timer Guest',
            'get-today-event' => 'Get Today Event',
            
            // File Management
            'view-files' => 'View Files',
            'create-files' => 'Create Files',
            'edit-files' => 'Edit Files',
            'delete-files' => 'Delete Files',
            'upload-files' => 'Upload Files',
            'upload-multiple-files' => 'Upload Multiple Files',
            'get-files-by-model' => 'Get Files By Model',
            
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
            'generate-partnership-schedule' => 'Generate Partnership Schedule',
            
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
            'view-tithe-statistics' => 'View Tithe Statistics',
            'view-monthly-trends' => 'View Monthly Trends',
            'view-member-performance' => 'View Member Performance',
            'view-frequency-analysis' => 'View Frequency Analysis',
            'view-recent-activity' => 'View Recent Activity',
            'export-tithe-report' => 'Export Tithe Report',
            'mark-tithe-paid' => 'Mark Tithe Paid',
            
            // Tithe Payment Management
            'view-tithe-payments' => 'View Tithe Payments',
            'create-tithe-payments' => 'Create Tithe Payments',
            'edit-tithe-payments' => 'Edit Tithe Payments',
            'delete-tithe-payments' => 'Delete Tithe Payments',
            
            // Reports Management
            'view-reports' => 'View Reports',
            'create-reports' => 'Create Reports',
            'export-reports' => 'Export Reports',
            'get-income-report' => 'Get Income Report',
            'get-expense-report' => 'Get Expense Report',
            'get-comparison-report' => 'Get Comparison Report',
            'export-report' => 'Export Report',
            'get-export-history' => 'Get Export History',
            'download-report' => 'Download Report',
            'delete-export' => 'Delete Export',
            'get-dashboard-summary' => 'Get Dashboard Summary',
            'get-financial-insights' => 'Get Financial Insights',
            'get-recent-activity' => 'Get Recent Activity',
            
            // Import/Export Management
            'view-imports' => 'View Imports',
            'create-imports' => 'Create Imports',
            'delete-imports' => 'Delete Imports',
            'download-import-sample' => 'Download Import Sample',
            'process-import' => 'Process Import',
            'get-audit-logs' => 'Get Audit Logs',
            
            // Dashboard Management
            'view-dashboard' => 'View Dashboard',
            'get-dashboard-data' => 'Get Dashboard Data',
            
            // Backup Management
            'view-backups' => 'View Backups',
            'create-backups' => 'Create Backups',
            'restore-backups' => 'Restore Backups',
            'delete-backups' => 'Delete Backups',
            'process-backups' => 'Process Backups',
            'download-backup' => 'Download Backup',
            'view-backup-stats' => 'View Backup Stats',
            
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
            'view-role-statistics' => 'View Role Statistics',
            'view-role-permissions' => 'View Role Permissions',
            'duplicate-role' => 'Duplicate Role',
            
            // Permission Management
            'view-permissions' => 'View Permissions',
            'create-permissions' => 'Create Permissions',
            'edit-permissions' => 'Edit Permissions',
            'delete-permissions' => 'Delete Permissions',
            
            // Entity Management
            'view-entities' => 'View Entities',
            
            // Documentation Management
            'view-api-info' => 'View API Info',
            'view-api-health' => 'View API Health',
            
            // Authentication Management
            'register' => 'Register',
            'login' => 'Login',
            'logout' => 'Logout',
            'forgot-password' => 'Forgot Password',
            'reset-password' => 'Reset Password',
            'view-profile' => 'View Profile',
            'edit-profile' => 'Edit Profile',
            'change-password' => 'Change Password',
            'send-verification-email' => 'Send Verification Email',
            'verify-email' => 'Verify Email',
            'resend-verification-email' => 'Resend Verification Email',
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
                    'view-users', 'create-users', 'edit-users', 'toggle-user-status', 'change-user-password',
                    
                    // Member Management
                    'view-members', 'create-members', 'edit-members', 'view-member-statistics', 'create-user-account', 'manage-member-groups', 'update-member-group-role',
                    
                    // Group Management
                    'view-groups', 'create-groups', 'edit-groups', 'view-group-statistics', 'view-group-overall-stats', 'view-groups-needing-attention', 'search-groups', 'bulk-update-group-status', 'manage-group-members', 'update-group-member-role',
                    
                    // Event Management
                    'view-events', 'create-events', 'edit-events', 'cancel-events', 'publish-events', 'manage-event-families', 'manage-event-groups', 'view-member-events',
                    
                    // Event Category Management
                    'view-event-categories', 'create-event-categories', 'edit-event-categories', 'view-category-events', 'generate-category-events', 'generate-one-time-event', 'toggle-category-status', 'view-category-statistics',
                    
                    // Attendance Management
                    'view-attendance', 'create-attendance', 'edit-attendance', 'scan-member-id', 'get-member-identification-id', 'generate-member-identification-id', 'get-event-attendance', 'get-eligible-members', 'update-attendance-status', 'mark-check-in', 'mark-check-out', 'bulk-update-attendance', 'ensure-attendance-records', 'get-individual-statistics',
                    
                    // General Attendance Management
                    'view-general-attendance', 'create-general-attendance', 'edit-general-attendance', 'get-event-general-attendance', 'update-general-attendance', 'get-attendance-analytics', 'get-general-attendance-summary', 'get-general-attendance-statistics', 'get-general-attendance-families',
                    
                    // Family Management
                    'view-families', 'create-families', 'edit-families', 'manage-family-members', 'get-family-events', 'get-my-family', 'get-family-statistics',
                    
                    // First Timer Management
                    'view-first-timers', 'create-first-timers', 'edit-first-timers', 'create-first-timer-guest', 'get-today-event',
                    
                    // File Management
                    'view-files', 'create-files', 'edit-files', 'upload-files', 'upload-multiple-files', 'get-files-by-model',
                    
                    // Financial Management - Full access
                    'view-incomes', 'create-incomes', 'edit-incomes',
                    'view-income-categories', 'create-income-categories', 'edit-income-categories',
                    'view-expenses', 'create-expenses', 'edit-expenses',
                    'view-expense-categories', 'create-expense-categories', 'edit-expense-categories',
                    'view-partnerships', 'create-partnerships', 'edit-partnerships', 'generate-partnership-schedule',
                    'view-partnership-categories', 'create-partnership-categories', 'edit-partnership-categories',
                    'view-tithes', 'create-tithes', 'edit-tithes', 'view-tithe-statistics', 'view-monthly-trends', 'view-member-performance', 'view-frequency-analysis', 'view-recent-activity', 'export-tithe-report', 'mark-tithe-paid',
                    'view-tithe-payments', 'create-tithe-payments', 'edit-tithe-payments',
                    
                    // Reports Management
                    'view-reports', 'create-reports', 'export-reports', 'get-income-report', 'get-expense-report', 'get-comparison-report', 'export-report', 'get-export-history', 'download-report', 'delete-export', 'get-dashboard-summary', 'get-financial-insights', 'get-recent-activity',
                    
                    // Import Management
                    'view-imports', 'create-imports', 'download-import-sample', 'process-import', 'get-audit-logs',
                    
                    // Dashboard Management
                    'view-dashboard', 'get-dashboard-data',
                    
                    // Settings Management
                    'view-settings', 'edit-settings',
                    
                    // Role Management
                    'view-roles', 'create-roles', 'edit-roles', 'view-role-statistics', 'view-role-permissions', 'duplicate-role',
                    
                    // Backup Management - Limited
                    'view-backups', 'create-backups', 'view-backup-stats',
                    
                    // Entity Management
                    'view-entities',
                    
                    // Documentation Management
                    'view-api-info', 'view-api-health',
                    
                    // Authentication Management
                    'logout', 'view-profile', 'edit-profile', 'change-password', 'resend-verification-email',
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
                    'view-attendance', 'create-attendance', 'edit-attendance', 'scan-member-id', 'get-member-identification-id', 'generate-member-identification-id', 'get-event-attendance', 'get-eligible-members', 'update-attendance-status', 'mark-check-in', 'mark-check-out', 'bulk-update-attendance', 'ensure-attendance-records', 'get-individual-statistics',
                    
                    // General Attendance Management
                    'view-general-attendance', 'create-general-attendance', 'get-event-general-attendance', 'update-general-attendance', 'get-general-attendance-summary', 'get-general-attendance-statistics', 'get-general-attendance-families',
                    
                    // Family Management - Own family
                    'view-families', 'edit-families', 'get-my-family', 'get-family-statistics',
                    
                    // First Timer Management - Limited
                    'view-first-timers', 'create-first-timers', 'create-first-timer-guest', 'get-today-event',
                    
                    // File Management - Limited
                    'view-files', 'create-files', 'upload-files', 'upload-multiple-files', 'get-files-by-model',
                    
                    // Financial Management - Limited to family
                    'view-tithes', 'create-tithes', 'edit-tithes', 'view-tithe-statistics', 'view-monthly-trends', 'view-member-performance', 'view-frequency-analysis', 'view-recent-activity', 'export-tithe-report', 'mark-tithe-paid',
                    'view-tithe-payments', 'create-tithe-payments',
                    
                    // Reports Management - Limited
                    'view-reports', 'get-dashboard-summary', 'get-recent-activity',
                    
                    // Dashboard Management
                    'view-dashboard', 'get-dashboard-data',
                    
                    // Authentication Management
                    'logout', 'view-profile', 'edit-profile', 'change-password', 'resend-verification-email',
                ],
            ],
            'member' => [
                'display_name' => 'Member',
                'description' => 'Regular church member',
                'permissions' => [
                    // Limited access to own data
                    'view-members', 'edit-members',
                    'view-events', 'view-event-categories',
                    'view-attendance', 'create-attendance', 'get-individual-statistics',
                    'view-families', 'get-my-family',
                    'view-tithes', 'create-tithe-payments', 'view-tithe-statistics', 'view-monthly-trends', 'view-member-performance', 'view-frequency-analysis', 'view-recent-activity',
                    'view-reports', 'get-dashboard-summary', 'get-recent-activity',
                    'view-dashboard', 'get-dashboard-data',
                    'logout', 'view-profile', 'edit-profile', 'change-password', 'resend-verification-email',
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
