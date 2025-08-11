<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Group;
use DB;


class GroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = [
            [
                'id' => 1,
                'name' => 'Choir',
                'description' => 'The supernatural Choir',
                'max_members' => 0,
                'meeting_day' => 'Monday',
                'meeting_time' => '10:00 AM',
                'location' => 'Church Auditorium',
                'status' => 'active',
                'created_by' => 1
            ],
            [
                'id' => 2,
                'name' => 'Technical Team',
                'description' => 'The technical team',
                'max_members' => 0,
                'meeting_day' => 'Monday',
                'meeting_time' => '10:00 AM',
                'location' => 'Church Auditorium',
                'status' => 'active',
                'created_by' => 1
            ],
            [
                'id' => 3,
                'name' => 'Urshers',
                'description' => 'The Urshers',
                'max_members' => 0,
                'meeting_day' => 'Monday',
                'meeting_time' => '10:00 AM',
                'location' => 'Church Auditorium',
                'status' => 'active',
                'created_by' => 1
            ],
            [
                'id' => 4,
                'name' => 'Protocol Team',
                'description' => 'The Protocol Team',
                'max_members' => 0,
                'meeting_day' => 'Monday',
                'meeting_time' => '10:00 AM',
                'location' => 'Church Auditorium',
                'status' => 'active',
                'created_by' => 1
            ],
            [
                'id' => 5,
                'name' => 'Church Office',
                'description' => 'The Church Office',
                'max_members' => 0,
                'meeting_day' => 'Monday',
                'meeting_time' => '10:00 AM',
                'location' => 'Church Auditorium',
                'status' => 'active',
                'created_by' => 1
            ],
        ];

        foreach ($groups as $group) {
            Group::create($group);
        }

        $this->command->info('Groups seeded successfully');

        //how to seed only GroupTableSeeder
    }
}
