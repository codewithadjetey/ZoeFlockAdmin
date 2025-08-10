<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\Member;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attendance>
 */
class AttendanceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Attendance::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'member_id' => Member::factory(),
            'status' => $this->faker->randomElement(['present', 'absent', 'first_timer']),
            'check_in_time' => $this->faker->optional()->dateTimeBetween('-2 hours', 'now'),
            'check_out_time' => $this->faker->optional()->dateTimeBetween('now', '+2 hours'),
            'notes' => $this->faker->optional()->sentence(),
            'recorded_by' => User::factory(),
        ];
    }

    /**
     * Indicate that the member is present.
     */
    public function present(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'present',
            'check_in_time' => $this->faker->dateTimeBetween('-2 hours', 'now'),
        ]);
    }

    /**
     * Indicate that the member is absent.
     */
    public function absent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'absent',
            'check_in_time' => null,
            'check_out_time' => null,
        ]);
    }

    /**
     * Indicate that the member is a first timer.
     */
    public function firstTimer(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'first_timer',
            'check_in_time' => $this->faker->optional()->dateTimeBetween('-2 hours', 'now'),
        ]);
    }
} 