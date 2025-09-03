<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class BackupPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create backup permissions if they don't exist
        $backupPermissions = [
            'view-backups' => 'View Backups',
            'create-backups' => 'Create Backups',
            'restore-backups' => 'Restore Backups',
            'delete-backups' => 'Delete Backups',
            'process-backups' => 'Process Backups',
        ];

        foreach ($backupPermissions as $name => $displayName) {
            Permission::firstOrCreate([
                'name' => $name,
                'guard_name' => 'web',
            ], [
                'display_name' => $displayName,
                'description' => "Permission to {$displayName}",
            ]);
        }

        // Assign permissions to roles
        $this->assignPermissionsToRoles();
    }

    /**
     * Assign backup permissions to roles
     */
    private function assignPermissionsToRoles(): void
    {
        // Admin role - all permissions
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo([
                'view-backups',
                'create-backups',
                'restore-backups',
                'delete-backups',
                'process-backups',
            ]);
        }

        // Pastor role - limited permissions
        $pastorRole = Role::where('name', 'pastor')->first();
        if ($pastorRole) {
            $pastorRole->givePermissionTo([
                'view-backups',
                'create-backups',
            ]);
        }

        // Family head role - no backup permissions
        $familyHeadRole = Role::where('name', 'family-head')->first();
        if ($familyHeadRole) {
            $familyHeadRole->revokePermissionTo([
                'view-backups',
                'create-backups',
                'restore-backups',
                'delete-backups',
                'process-backups',
            ]);
        }

        // Member role - no backup permissions
        $memberRole = Role::where('name', 'member')->first();
        if ($memberRole) {
            $memberRole->revokePermissionTo([
                'view-backups',
                'create-backups',
                'restore-backups',
                'delete-backups',
                'process-backups',
            ]);
        }
    }
} 