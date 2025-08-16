<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PartnershipCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\PartnershipCategory::insert([
            [
                'name' => 'Church Project',
                'description' => 'Support for church building and projects',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rhapsody',
                'description' => 'Rhapsody of Realities partnership',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Foundation School',
                'description' => 'Support for Foundation School initiatives',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
