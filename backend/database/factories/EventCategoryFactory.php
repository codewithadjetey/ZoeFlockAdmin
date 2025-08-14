<?php

namespace Database\Factories;

use App\Models\EventCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventCategory>
 */
class EventCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $isRecurring = $this->faker->boolean(30);
        
        return [
            'name' => $this->faker->unique()->words(2, true),
            'description' => $this->faker->optional(0.8)->sentence(),
            'color' => $this->faker->randomElement([
                '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
                '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
            ]),
            'icon' => $this->faker->randomElement([
                'fas fa-calendar', 'fas fa-users', 'fas fa-church', 'fas fa-pray',
                'fas fa-music', 'fas fa-book', 'fas fa-heart', 'fas fa-star'
            ]),
            'attendance_type' => $this->faker->randomElement(['individual', 'general', 'none']),
            'is_active' => $this->faker->boolean(90),
            'is_recurring' => $isRecurring,
            'recurrence_pattern' => $isRecurring ? $this->faker->randomElement(['daily', 'weekly', 'monthly', 'yearly']) : null,
            'recurrence_settings' => $isRecurring ? $this->getRecurrenceSettings() : null,
            'default_start_time' => $this->faker->optional(0.7)->time(),
            'default_duration' => $this->faker->optional(0.6)->randomElement([30, 60, 90, 120, 180]),
            'default_location' => $this->faker->optional(0.5)->city(),
            'default_description' => $this->faker->optional(0.4)->sentence(),
            'created_by' => User::factory(),
            'updated_by' => null,
        ];
    }

    /**
     * Indicate that the category is recurring.
     */
    public function recurring(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_recurring' => true,
            'recurrence_pattern' => $this->faker->randomElement(['daily', 'weekly', 'monthly', 'yearly']),
            'recurrence_settings' => $this->getRecurrenceSettings(),
        ]);
    }

    /**
     * Indicate that the category supports individual attendance.
     */
    public function individualAttendance(): static
    {
        return $this->state(fn (array $attributes) => [
            'attendance_type' => 'individual',
        ]);
    }

    /**
     * Indicate that the category supports general attendance.
     */
    public function generalAttendance(): static
    {
        return $this->state(fn (array $attributes) => [
            'attendance_type' => 'general',
        ]);
    }

    /**
     * Indicate that the category supports no attendance.
     */
    public function noAttendance(): static
    {
        return $this->state(fn (array $attributes) => [
            'attendance_type' => 'none',
        ]);
    }

    /**
     * Indicate that the category is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Get recurrence settings based on pattern
     */
    protected function getRecurrenceSettings(): array
    {
        $pattern = $this->faker->randomElement(['daily', 'weekly', 'monthly', 'yearly']);
        
        switch ($pattern) {
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
                return ['interval' => 1];
        }
    }
}
