<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Seeder;

class GroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a user for creating groups
        $user = User::first() ?? User::factory()->create();

        // Create sample groups
        $groups = [
            [
                'name' => 'Youth Ministry',
                'description' => 'Engaging young people in faith and community service',
                'category' => 'Youth',
                'max_members' => 30,
                'meeting_day' => 'Sunday',
                'meeting_time' => '4:00 PM',
                'location' => 'Youth Room',
                'status' => 'Active',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ],
            [
                'name' => 'Prayer Warriors',
                'description' => 'Dedicated group for intercessory prayer and spiritual warfare',
                'category' => 'Prayer',
                'max_members' => 25,
                'meeting_day' => 'Wednesday',
                'meeting_time' => '7:00 PM',
                'location' => 'Prayer Room',
                'status' => 'Active',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ],
            [
                'name' => 'Worship Team',
                'description' => 'Leading the congregation in worship through music and praise',
                'category' => 'Worship',
                'max_members' => 20,
                'meeting_day' => 'Saturday',
                'meeting_time' => '10:00 AM',
                'location' => 'Sanctuary',
                'status' => 'Active',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ],
            [
                'name' => 'Bible Study Fellowship',
                'description' => 'Deep dive into scripture and theological discussions',
                'category' => 'Bible Study',
                'max_members' => 35,
                'meeting_day' => 'Tuesday',
                'meeting_time' => '6:30 PM',
                'location' => 'Fellowship Hall',
                'status' => 'Active',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ],
            [
                'name' => 'Outreach Ministry',
                'description' => 'Serving the community through various outreach programs',
                'category' => 'Outreach',
                'max_members' => 40,
                'meeting_day' => 'Thursday',
                'meeting_time' => '6:00 PM',
                'location' => 'Community Center',
                'status' => 'Active',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ],
            [
                'name' => 'Children\'s Ministry',
                'description' => 'Nurturing faith in children through age-appropriate activities',
                'category' => 'Children',
                'max_members' => 50,
                'meeting_day' => 'Sunday',
                'meeting_time' => '9:00 AM',
                'location' => 'Children\'s Wing',
                'status' => 'Active',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ],
            [
                'name' => 'Senior Saints',
                'description' => 'Fellowship and ministry opportunities for senior members',
                'category' => 'Seniors',
                'max_members' => 30,
                'meeting_day' => 'Monday',
                'meeting_time' => '2:00 PM',
                'location' => 'Senior Center',
                'status' => 'Active',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ],
            [
                'name' => 'Technical Support',
                'description' => 'Managing audio, video, and technical aspects of services',
                'category' => 'Technical',
                'max_members' => 15,
                'meeting_day' => 'Friday',
                'meeting_time' => '5:00 PM',
                'location' => 'Technical Booth',
                'status' => 'Active',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ],
            [
                'name' => 'Administrative Team',
                'description' => 'Supporting church operations and administrative tasks',
                'category' => 'Administrative',
                'max_members' => 12,
                'meeting_day' => 'Wednesday',
                'meeting_time' => '9:00 AM',
                'location' => 'Office',
                'status' => 'Active',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ],
            [
                'name' => 'Music Ministry',
                'description' => 'Choir and instrumental music for worship services',
                'category' => 'Music',
                'max_members' => 25,
                'meeting_day' => 'Thursday',
                'meeting_time' => '7:30 PM',
                'location' => 'Choir Room',
                'status' => 'Active',
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ],
        ];

        foreach ($groups as $groupData) {
            Group::create($groupData);
        }

        // Create some additional groups using factory for variety
        Group::factory(5)->create([
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);

        $this->command->info('Groups seeded successfully!');
    }
} 