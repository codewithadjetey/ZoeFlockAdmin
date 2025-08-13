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
                'name' => 'Bible Study',
                'description' => 'Weekly Bible study and discussion',
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
                'default_location' => 'Fellowship Hall',
                'default_description' => 'Weekly Bible study and group discussion'
            ],
            [
                'name' => 'Youth Group',
                'description' => 'Youth ministry and activities',
                'color' => '#F59E0B',
                'icon' => 'fas fa-users',
                'attendance_type' => 'general',
                'is_active' => true,
                'is_recurring' => true,
                'recurrence_pattern' => 'weekly',
                'recurrence_settings' => [
                    'interval' => 1,
                    'weekdays' => [5] // Friday
                ],
                'default_start_time' => '18:00:00',
                'default_duration' => 120,
                'default_location' => 'Youth Center',
                'default_description' => 'Youth group activities and fellowship'
            ],
            [
                'name' => 'Prayer Meeting',
                'description' => 'Community prayer and intercession',
                'color' => '#8B5CF6',
                'icon' => 'fas fa-pray',
                'attendance_type' => 'individual',
                'is_active' => true,
                'is_recurring' => true,
                'recurrence_pattern' => 'weekly',
                'recurrence_settings' => [
                    'interval' => 1,
                    'weekdays' => [3] // Wednesday
                ],
                'default_start_time' => '18:30:00',
                'default_duration' => 60,
                'default_location' => 'Prayer Room',
                'default_description' => 'Community prayer meeting'
            ],
            [
                'name' => 'Community Outreach',
                'description' => 'Community service and outreach events',
                'color' => '#EF4444',
                'icon' => 'fas fa-heart',
                'attendance_type' => 'general',
                'is_active' => true,
                'is_recurring' => false,
                'default_start_time' => '10:00:00',
                'default_duration' => 180,
                'default_location' => 'Various Locations',
                'default_description' => 'Community service and outreach activities'
            ],
            [
                'name' => 'Special Events',
                'description' => 'Special occasions and celebrations',
                'color' => '#EC4899',
                'icon' => 'fas fa-star',
                'attendance_type' => 'none',
                'is_active' => true,
                'is_recurring' => false,
                'default_start_time' => '19:00:00',
                'default_duration' => 120,
                'default_location' => 'Main Sanctuary',
                'default_description' => 'Special events and celebrations'
            ],
            [
                'name' => 'Monthly Fellowship',
                'description' => 'Monthly community fellowship dinner',
                'color' => '#06B6D4',
                'icon' => 'fas fa-utensils',
                'attendance_type' => 'general',
                'is_active' => true,
                'is_recurring' => true,
                'recurrence_pattern' => 'monthly',
                'recurrence_settings' => [
                    'interval' => 1,
                    'day_of_month' => 15
                ],
                'default_start_time' => '18:00:00',
                'default_duration' => 150,
                'default_location' => 'Fellowship Hall',
                'default_description' => 'Monthly community fellowship dinner'
            ],
            [
                'name' => 'Annual Conference',
                'description' => 'Annual church conference and workshops',
                'color' => '#84CC16',
                'icon' => 'fas fa-graduation-cap',
                'attendance_type' => 'individual',
                'is_active' => true,
                'is_recurring' => true,
                'recurrence_pattern' => 'yearly',
                'recurrence_settings' => [
                    'interval' => 1
                ],
                'default_start_time' => '09:00:00',
                'default_duration' => 480,
                'default_location' => 'Conference Center',
                'default_description' => 'Annual church conference with workshops and sessions'
            ]
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
