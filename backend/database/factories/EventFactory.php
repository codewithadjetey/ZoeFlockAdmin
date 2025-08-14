<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use App\Models\Group;
use App\Models\Family;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('now', '+2 months');
        
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->optional(0.8)->paragraph(),
            'start_date' => $startDate,
            'end_date' => $this->faker->optional(0.7)->dateTimeBetween($startDate, (clone $startDate)->modify('+7 days')),
            'location' => $this->faker->optional(0.6)->city(),
            'type' => $this->faker->randomElement(['group', 'family', 'general']),
            'category_id' => null, // Will be set by seeder if needed
            'status' => $this->faker->randomElement(['draft', 'published', 'cancelled', 'completed']),
            'is_recurring' => $this->faker->boolean(20),
            'recurrence_pattern' => function (array $attributes) {
                return $attributes['is_recurring'] 
                    ? $this->faker->randomElement(['daily', 'weekly', 'monthly', 'yearly'])
                    : null;
            },
            'recurrence_settings' => function (array $attributes) {
                if (!$attributes['is_recurring']) {
                    return null;
                }
                
                switch ($attributes['recurrence_pattern']) {
                    case 'daily':
                        return ['interval' => $this->faker->randomElement([1, 2, 3, 7])];
                    case 'weekly':
                        return [
                            'interval' => $this->faker->randomElement([1, 2]),
                            'weekdays' => $this->faker->randomElements([0, 1, 2, 3, 4, 5, 6], $this->faker->numberBetween(1, 3))
                        ];
                    case 'monthly':
                        return [
                            'interval' => $this->faker->randomElement([1, 2, 3]),
                            'day_of_month' => $this->faker->randomElement([1, 28])
                        ];
                    case 'yearly':
                        return ['interval' => $this->faker->randomElement([1, 2, 3])];
                    default:
                        return null;
                }
            },
            'recurrence_end_date' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
            'img_path' => $this->faker->optional(0.3)->imageUrl(640, 480, 'events'),
            'created_by' => User::factory(),
            'updated_by' => null,
            'deleted' => false,
        ];
    }

    /**
     * Indicate that the event is recurring.
     */
    public function recurring(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_recurring' => true,
            'recurrence_pattern' => $this->faker->randomElement(['daily', 'weekly', 'monthly', 'yearly']),
        ]);
    }

    /**
     * Indicate that the event is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    /**
     * Indicate that the event is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancelled_at' => function (array $attributes) {
                $startDate = $attributes['start_date'];
                if ($startDate && $startDate > now()) {
                    // If start date is in the future, cancel it before the start date
                    return $this->faker->dateTimeBetween('now', $startDate);
                } else {
                    // If start date is in the past, cancel it after the start date
                    return $this->faker->dateTimeBetween($startDate, 'now');
                }
            },
            'cancellation_reason' => $this->faker->optional(0.7)->sentence(),
        ]);
    }

    /**
     * Indicate that the event is for groups.
     */
    public function forGroups(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'group',
        ]);
    }

    /**
     * Indicate that the event is for families.
     */
    public function forFamilies(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'family',
        ]);
    }

    /**
     * Indicate that the event is general.
     */
    public function general(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'general',
        ]);
    }

    /**
     * Indicate that the event is upcoming.
     */
    public function upcoming(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => $this->faker->dateTimeBetween('now', '+2 months'),
            'status' => 'published',
        ]);
    }

    /**
     * Indicate that the event is past.
     */
    public function past(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => $this->faker->dateTimeBetween('-6 months', '-2 days'),
            'end_date' => function (array $attributes) {
                $startDate = $attributes['start_date'];
                // Ensure end_date is after start_date but before now
                $maxEndDate = (clone $startDate)->modify('+7 days');
                if ($maxEndDate > now()) {
                    $maxEndDate = now();
                }
                return $this->faker->dateTimeBetween($startDate, $maxEndDate);
            },
            'status' => 'completed',
        ]);
    }
} 