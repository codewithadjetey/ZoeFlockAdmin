<?php

namespace Database\Factories;

use App\Models\GeneralAttendance;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GeneralAttendance>
 */
class GeneralAttendanceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = GeneralAttendance::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'total_attendance' => $this->faker->numberBetween(10, 200),
            'first_timers_count' => $this->faker->numberBetween(0, 20),
            'notes' => $this->faker->optional()->sentence(),
            'recorded_by' => User::factory(),
        ];
    }

    /**
     * Indicate a small attendance event.
     */
    public function small(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_attendance' => $this->faker->numberBetween(10, 50),
            'first_timers_count' => $this->faker->numberBetween(0, 5),
        ]);
    }

    /**
     * Indicate a medium attendance event.
     */
    public function medium(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_attendance' => $this->faker->numberBetween(50, 150),
            'first_timers_count' => $this->faker->numberBetween(5, 15),
        ]);
    }

    /**
     * Indicate a large attendance event.
     */
    public function large(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_attendance' => $this->faker->numberBetween(150, 300),
            'first_timers_count' => $this->faker->numberBetween(15, 30),
        ]);
    }
} 