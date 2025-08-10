<?php

namespace Database\Seeders;

use App\Models\Family;
use App\Models\Member;
use Illuminate\Database\Seeder;

class FamilySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some existing members to use as family heads
        $members = Member::take(10)->get();

        if ($members->isEmpty()) {
            // If no members exist, create some first
            $members = Member::factory(10)->create();
        }

        $familyData = [
            [
                'name' => 'Johnson Family',
                'slogan' => 'Faith, Love, Unity',
                'description' => 'A loving family dedicated to serving God and our community.',
                'family_head_id' => $members->shift()->id,
            ],
            [
                'name' => 'Smith Family',
                'slogan' => 'Together in Christ',
                'description' => 'Building strong relationships through faith and fellowship.',
                'family_head_id' => $members->shift()->id,
            ],
            [
                'name' => 'Williams Family',
                'slogan' => 'Blessed and Grateful',
                'description' => 'Thankful for God\'s grace and the gift of family.',
                'family_head_id' => $members->shift()->id,
            ],
            [
                'name' => 'Brown Family',
                'slogan' => 'Growing in Grace',
                'description' => 'Learning and growing together in God\'s love.',
                'family_head_id' => $members->shift()->id,
            ],
            [
                'name' => 'Davis Family',
                'slogan' => 'Faithful Servants',
                'description' => 'Serving God and others with love and compassion.',
                'family_head_id' => $members->shift()->id,
            ],
        ];

        foreach ($familyData as $familyInfo) {
            Family::create($familyInfo);
        }

        // Create additional families using the factory
        Family::factory(5)->create();

        $this->command->info('Families seeded successfully!');
    }
} 