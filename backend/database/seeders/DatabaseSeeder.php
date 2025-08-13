<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            RolePermissionSeeder::class,
            UserSeeder::class,
            GroupSeeder::class,
            FamilySeeder::class,
            MemberSeeder::class,
            EventCategorySeeder::class,
            EventSeeder::class,
            AttendanceSeeder::class,
        ]);

        // Create additional test users if needed
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
