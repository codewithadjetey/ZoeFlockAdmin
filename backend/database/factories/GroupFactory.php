<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Group>
 */
class GroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'category' => fake()->randomElement(['Ministry', 'Education', 'Fellowship', 'Service', 'Worship', 'Prayer', 'Music', 'Outreach', 'Children', 'Youth', 'Seniors', 'Bible Study', 'Social', 'Technical', 'Administrative']),
            'max_members' => fake()->numberBetween(10, 50),
            'meeting_day' => fake()->randomElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
            'meeting_time' => fake()->time(),
            'location' => fake()->address(),
            'img_path' => null,
            'status' => 'Active',
            'deleted' => false,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
        ];
    }

    /**
     * Indicate that the group is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Inactive',
        ]);
    }

    /**
     * Indicate that the group is full.
     */
    public function full(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Full',
        ]);
    }

    /**
     * Indicate that the group is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Active',
        ]);
    }

    /**
     * Indicate that the group is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Suspended',
        ]);
    }

    /**
     * Indicate that the group is archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Archived',
        ]);
    }

    /**
     * Indicate that the group is deleted (soft delete).
     */
    public function deleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'deleted' => true,
        ]);
    }
} 