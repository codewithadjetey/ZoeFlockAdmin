<?php

namespace Database\Factories;

use App\Models\Family;
use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Family>
 */
class FamilyFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Family::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->lastName . ' Family',
            'slogan' => $this->faker->optional()->sentence(3, false),
            'img_url' => $this->faker->optional()->imageUrl(400, 300, 'people'),
            'description' => $this->faker->optional()->paragraph(3),
            'active' => $this->faker->boolean(80), // 80% chance of being active
            'deleted' => false,
            'family_head_id' => Member::factory(),
        ];
    }

    /**
     * Indicate that the family is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'active' => true,
        ]);
    }

    /**
     * Indicate that the family is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'active' => false,
        ]);
    }

    /**
     * Indicate that the family is deleted.
     */
    public function deleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'deleted' => true,
        ]);
    }

    /**
     * Create a family with a specific family head.
     */
    public function withFamilyHead(Member $member): static
    {
        return $this->state(fn (array $attributes) => [
            'family_head_id' => $member->id,
        ]);
    }
} 