<?php

namespace Database\Seeders;

use App\Models\Family;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FamilyTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $families = [
            [
                'name' => 'Empowered',
                'slogan' => 'Empowering lives through faith',
                'description' => 'A family focused on empowering members to reach their full potential in Christ.',
                'family_head_id' => 25, // Jessica Oyeson
                'active' => true,
                'deleted' => false,
            ],
            [
                'name' => 'Zoe Generals',
                'slogan' => 'Leading with life and purpose',
                'description' => 'A family of leaders committed to spreading the life of Christ.',
                'family_head_id' => 1, // Derrick Doe
                'active' => true,
                'deleted' => false,
            ],
            [
                'name' => 'Alpha Royals',
                'slogan' => 'Royalty in Christ',
                'description' => 'A family embracing their royal identity in Christ Jesus.',
                'family_head_id' => 23, // Ann Rock
                'active' => true,
                'deleted' => false,
            ],
            [
                'name' => 'Higher Life',
                'slogan' => 'Living life to the fullest',
                'description' => 'A family committed to experiencing the abundant life that Christ offers.',
                'family_head_id' => 24, // Enda Owusu
                'active' => true,
                'deleted' => false,
            ],
        ];

        foreach ($families as $familyData) {
            $family = Family::create($familyData);

            //add family_members table with family_id
            DB::table('family_members')->insert([
                'family_id' => $family->id,
                'member_id' => $familyData['family_head_id'],
                "role" => "head",
            ]);
        }
        

        $this->command->info('Family seeder completed successfully!');
        $this->command->info('Created families: ' . implode(', ', array_column($families, 'name')));
    }
}
