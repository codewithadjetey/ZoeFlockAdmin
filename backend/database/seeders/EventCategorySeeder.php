<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\EventCategory;
use App\Models\User;

class EventCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first admin user or create one
        $adminUser = User::where('email', 'admin@example.com')->first();
        if (!$adminUser) {
            $adminUser = User::first();
        }

        if (!$adminUser) {
            $this->command->error('No users found. Please run UserSeeder first.');
            return;
        }

        $categories = [
            [
                'name' => 'Sunday Service',
                'description' => 'Weekly Sunday worship service',
                'color' => '#3B82F6',
                'icon' => 'fas fa-church',
                'attendance_type' => 'individual',
                'is_active' => true,
                'is_recurring' => true,
                'recurrence_pattern' => 'weekly',
                'recurrence_settings' => [
                    'interval' => 1,
                    'weekdays' => [0] // Sunday
                ],
                'default_start_time' => '09:00:00',
                'default_duration' => 90,
                'default_location' => 'Church Auditorium Loveworld Treasureland',
                'default_description' => 'Join us for our weekly Sunday worship service'
            ],
            [
                'name' => 'Family Meetings',
                'description' => 'Weekly Family Meetings',
                'color' => '#10B981',
                'icon' => 'fas fa-book',
                'attendance_type' => 'individual',
                'is_active' => true,
                'is_recurring' => true,
                'recurrence_pattern' => 'weekly',
                'recurrence_settings' => [
                    'interval' => 1,
                    'weekdays' => [2] // Tuesday
                ],
                'default_start_time' => '19:00:00',
                'default_duration' => 60,
                'default_location' => 'Church Auditorium Loveworld Treasureland',
                'default_description' => 'Weekly Family Meetings'
            ],
            [
                'name' => 'Choir Rehearsal',
                'description' => 'Choir Rehearsal by Supernatural Choir',
                'color' => '#F59E0B',
                'icon' => 'fas fa-users',
                'attendance_type' => 'general',
                'is_active' => true,
                'is_recurring' => true,
                'recurrence_pattern' => 'weekly',
                'recurrence_settings' => [
                    'interval' => 1,
                    'weekdays' => [4, 6] // Thursday and Saturday
                ],
                'default_start_time' => '18:00:00',
                'default_duration' => 120,
                'default_location' => 'Church Auditorium Loveworld Treasureland',
                'default_description' => 'Choir Rehearsal by Supernatural Choir'
            ],
            [
                'name' => 'Prayer Meeting',
                'description' => 'Prayer and intercession',
                'color' => '#8B5CF6',
                'icon' => 'fas fa-pray',
                'attendance_type' => 'individual',
                'is_active' => true,
                'is_recurring' => true,
                'recurrence_pattern' => 'weekly',
                'recurrence_settings' => [
                    'interval' => 1,
                    'weekdays' => [5] // Friday
                ],
                'default_start_time' => '18:30:00',
                'default_duration' => 120,
                'default_location' => 'Church Auditorium Loveworld Treasureland',
                'default_description' => 'Prayer and intercession'
            ],
        ];

        foreach ($categories as $categoryData) {
            EventCategory::create([
                ...$categoryData,
                'created_by' => $adminUser->id
            ]);
        }

        $this->command->info('Event categories seeded successfully!');
    }
}
