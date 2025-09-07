<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or find admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@zoeflock.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin123'),
                'phone' => '+1234567890',
                'address' => '123 Admin Street, Admin City, AC 12345',
                'date_of_birth' => '1990-01-01',
                'gender' => 'other',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role to admin user
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $admin->assignRole($adminRole);
            $this->command->info('Admin role assigned to admin user');
        } else {
            $this->command->info('Admin role not found');
        }

        $this->command->info('Admin - Email: admin@zoeflock.com, Password: admin123');
    }
} 