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
        // Create admin user
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@zoeflock.com',
            'password' => Hash::make('admin123'),
            'phone' => '+1234567890',
            'address' => '123 Admin Street, Admin City, AC 12345',
            'date_of_birth' => '1990-01-01',
            'gender' => 'other',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Assign admin role to admin user
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }

        // Create pastor user
        $pastor = User::create([
            'name' => 'Pastor John',
            'email' => 'pastor@zoeflock.com',
            'password' => Hash::make('pastor123'),
            'phone' => '+1234567891',
            'address' => '456 Pastor Street, Pastor City, PC 12345',
            'date_of_birth' => '1985-05-15',
            'gender' => 'male',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Assign pastor role to pastor user
        $pastorRole = Role::where('name', 'pastor')->first();
        if ($pastorRole) {
            $pastor->assignRole($pastorRole);
        }

        // Create member user
        $member = User::create([
            'name' => 'Jane Member',
            'email' => 'member@zoeflock.com',
            'password' => Hash::make('member123'),
            'phone' => '+1234567892',
            'address' => '789 Member Street, Member City, MC 12345',
            'date_of_birth' => '1995-10-20',
            'gender' => 'female',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Assign member role to member user
        $memberRole = Role::where('name', 'member')->first();
        if ($memberRole) {
            $member->assignRole($memberRole);
        }

        $this->command->info('Test users created successfully!');
        $this->command->info('Admin - Email: admin@zoeflock.com, Password: admin123');
        $this->command->info('Pastor - Email: pastor@zoeflock.com, Password: pastor123');
        $this->command->info('Member - Email: member@zoeflock.com, Password: member123');
    }
} 