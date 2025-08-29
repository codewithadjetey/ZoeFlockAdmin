<?php

namespace Database\Factories;

use App\Models\Tithe;
use App\Models\Member;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class TitheFactory extends Factory
{
    protected $model = Tithe::class;

    public function definition()
    {
        $frequencies = ['weekly', 'monthly'];
        $frequency = $this->faker->randomElement($frequencies);
        $startDate = $this->faker->dateTimeBetween('-1 year', 'now');
        $nextDueDate = $frequency === 'weekly' 
            ? Carbon::parse($startDate)->addWeek() 
            : Carbon::parse($startDate)->addMonth();

        return [
            'member_id' => Member::factory(),
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'frequency' => $frequency,
            'start_date' => $startDate,
            'next_due_date' => $nextDueDate,
            'is_active' => $this->faker->boolean(80), // 80% chance of being active
            'is_paid' => $this->faker->boolean(60), // 60% chance of being paid
            'paid_amount' => function (array $attributes) {
                return $attributes['is_paid'] ? $this->faker->randomFloat(2, $attributes['amount'], $attributes['amount'] * 1.2) : null;
            },
            'paid_date' => function (array $attributes) {
                return $attributes['is_paid'] ? $this->faker->dateTimeBetween($attributes['start_date'], 'now') : null;
            },
            'notes' => $this->faker->optional(0.3)->sentence(),
            'created_by' => User::factory(),
            'updated_by' => null,
        ];
    }

    /**
     * Indicate that the tithe is active.
     */
    public function active()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => true,
            ];
        });
    }

    /**
     * Indicate that the tithe is inactive.
     */
    public function inactive()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }

    /**
     * Indicate that the tithe is paid.
     */
    public function paid()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_paid' => true,
                'paid_amount' => $this->faker->randomFloat(2, $attributes['amount'], $attributes['amount'] * 1.2),
                'paid_date' => $this->faker->dateTimeBetween($attributes['start_date'], 'now'),
            ];
        });
    }

    /**
     * Indicate that the tithe is unpaid.
     */
    public function unpaid()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_paid' => false,
                'paid_amount' => null,
                'paid_date' => null,
            ];
        });
    }

    /**
     * Indicate that the tithe is overdue.
     */
    public function overdue()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_paid' => false,
                'next_due_date' => $this->faker->dateTimeBetween('-30 days', '-1 day'),
            ];
        });
    }

    /**
     * Indicate that the tithe is weekly.
     */
    public function weekly()
    {
        return $this->state(function (array $attributes) {
            $startDate = Carbon::parse($attributes['start_date']);
            return [
                'frequency' => 'weekly',
                'next_due_date' => $startDate->addWeek(),
            ];
        });
    }

    /**
     * Indicate that the tithe is monthly.
     */
    public function monthly()
    {
        return $this->state(function (array $attributes) {
            $startDate = Carbon::parse($attributes['start_date']);
            return [
                'frequency' => 'monthly',
                'next_due_date' => $startDate->addMonth(),
            ];
        });
    }
} 