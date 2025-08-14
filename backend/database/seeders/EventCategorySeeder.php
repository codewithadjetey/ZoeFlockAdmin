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
                'recurrence_start_date' => now()->addWeek()->startOfWeek(0), // Next Sunday
                'recurrence_end_date' => now()->addYear(), // One year from now
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
                'recurrence_start_date' => now()->addWeek()->startOfWeek(2), // Next Tuesday
                'recurrence_end_date' => now()->addYear(), // One year from now
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
                'recurrence_start_date' => now()->addWeek()->startOfWeek(4), // Next Thursday
                'recurrence_end_date' => now()->addYear(), // One year from now
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
                'recurrence_start_date' => now()->addWeek()->startOfWeek(5), // Next Friday
                'recurrence_end_date' => now()->addYear(), // One year from now
                'default_location' => 'Church Auditorium Loveworld Treasureland',
                'default_description' => 'Prayer and intercession'
            ],
            [
                'name' => 'Youth Conference',
                'description' => 'Annual youth conference and workshop',
                'color' => '#EC4899',
                'icon' => 'fas fa-star',
                'attendance_type' => 'individual',
                'is_active' => true,
                'is_recurring' => false,
                'recurrence_pattern' => null,
                'recurrence_settings' => null,
                'default_start_time' => '10:00:00',
                'default_duration' => 480, // 8 hours
                'recurrence_start_date' => null,
                'recurrence_end_date' => null,
                'default_location' => 'Church Auditorium Loveworld Treasureland',
                'default_description' => 'Annual youth conference with workshops, worship, and fellowship'
            ],
            [
                'name' => 'Bible Study',
                'description' => 'Monthly Bible study session',
                'color' => '#06B6D4',
                'icon' => 'fas fa-book-open',
                'attendance_type' => 'individual',
                'is_active' => true,
                'is_recurring' => true,
                'recurrence_pattern' => 'monthly',
                'recurrence_settings' => [
                    'interval' => 1,
                    'day_of_month' => 15
                ],
                'default_start_time' => '19:00:00',
                'default_duration' => 90,
                'recurrence_start_date' => now()->addMonth()->day(15), // 15th of next month
                'recurrence_end_date' => now()->addYear(), // One year from now
                'default_location' => 'Church Auditorium Loveworld Treasureland',
                'default_description' => 'Monthly Bible study and discussion'
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
