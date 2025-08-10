<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\Group;
use App\Models\Family;
use App\Models\User;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some existing groups and families for associations
        $groups = Group::take(5)->get();
        $families = Family::take(3)->get();
        $users = User::take(3)->get();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        // Create general events
        Event::factory(10)
            ->general()
            ->published()
            ->upcoming()
            ->create([
                'created_by' => $users->random()->id,
            ]);

        // Create group events
        if ($groups->isNotEmpty()) {
            Event::factory(8)
                ->forGroups()
                ->published()
                ->upcoming()
                ->create([
                    'created_by' => $users->random()->id,
                ])->each(function ($event) use ($groups) {
                    // Associate with 1-3 random groups
                    $selectedGroups = $groups->random(rand(1, min(3, $groups->count())));
                    $groupData = [];
                    foreach ($selectedGroups as $group) {
                        $groupData[$group->id] = [
                            'is_required' => rand(0, 1),
                            'notes' => rand(0, 1) ? 'Important event for this group' : null,
                        ];
                    }
                    $event->groups()->attach($groupData);
                });
        }

        // Create family events
        if ($families->isNotEmpty()) {
            Event::factory(6)
                ->forFamilies()
                ->published()
                ->upcoming()
                ->create([
                    'created_by' => $users->random()->id,
                ])->each(function ($event) use ($families) {
                    // Associate with 1-2 random families
                    $selectedFamilies = $families->random(rand(1, min(2, $families->count())));
                    $familyData = [];
                    foreach ($selectedFamilies as $family) {
                        $familyData[$family->id] = [
                            'is_required' => rand(0, 1),
                            'notes' => rand(0, 1) ? 'Family gathering event' : null,
                        ];
                    }
                    $event->families()->attach($familyData);
                });
        }

        // Create recurring events
        Event::factory(5)
            ->recurring()
            ->published()
            ->create([
                'created_by' => $users->random()->id,
                'recurrence_pattern' => 'weekly',
                'recurrence_settings' => [
                    'interval' => 1,
                    'weekdays' => [1, 3, 5], // Monday, Wednesday, Friday
                ],
                'recurrence_end_date' => Carbon::now()->addMonths(6),
            ])->each(function ($event) use ($groups, $families) {
                // Randomly associate with groups or families
                if (rand(0, 1) && $groups->isNotEmpty()) {
                    $selectedGroups = $groups->random(rand(1, min(2, $groups->count())));
                    $groupData = [];
                    foreach ($selectedGroups as $group) {
                        $groupData[$group->id] = [
                            'is_required' => true,
                            'notes' => 'Regular weekly meeting',
                        ];
                    }
                    $event->groups()->attach($groupData);
                } elseif ($families->isNotEmpty()) {
                    $selectedFamilies = $families->random(rand(1, min(2, $families->count())));
                    $familyData = [];
                    foreach ($selectedFamilies as $family) {
                        $familyData[$family->id] = [
                            'is_required' => true,
                            'notes' => 'Weekly family devotion',
                        ];
                    }
                    $event->families()->attach($familyData);
                }
            });

        // Create past events
        Event::factory(15)
            ->past()
            ->create([
                'created_by' => $users->random()->id,
            ])->each(function ($event) use ($groups, $families) {
                // Randomly associate with groups or families
                if (rand(0, 1) && $groups->isNotEmpty()) {
                    $selectedGroups = $groups->random(rand(1, min(2, $groups->count())));
                    $groupData = [];
                    foreach ($selectedGroups as $group) {
                        $groupData[$group->id] = [
                            'is_required' => rand(0, 1),
                            'notes' => 'Past event',
                        ];
                    }
                    $event->groups()->attach($groupData);
                } elseif ($families->isNotEmpty()) {
                    $selectedFamilies = $families->random(rand(1, min(2, $families->count())));
                    $familyData = [];
                    foreach ($selectedFamilies as $family) {
                        $familyData[$family->id] = [
                            'is_required' => rand(0, 1),
                            'notes' => 'Past family event',
                        ];
                    }
                    $event->families()->attach($familyData);
                }
            });

        // Create some cancelled events
        Event::factory(3)
            ->cancelled()
            ->create([
                'created_by' => $users->random()->id,
            ]);

        $this->command->info('Events seeded successfully!');
        $this->command->info('Created: ' . Event::count() . ' events');
    }
} 