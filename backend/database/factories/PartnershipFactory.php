<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Member;
use App\Models\PartnershipCategory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Partnership>
 */
class PartnershipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'member_id' => Member::factory(),
            'category_id' => PartnershipCategory::factory(),
            'pledge_amount' => $this->faker->randomFloat(2, 100, 10000),
            'frequency' => $this->faker->randomElement(['weekly', 'monthly', 'yearly', 'one-time']),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->optional()->date(),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
