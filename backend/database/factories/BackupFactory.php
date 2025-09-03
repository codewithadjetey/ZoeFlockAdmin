<?php

namespace Database\Factories;

use App\Models\Backup;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Backup>
 */
class BackupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(['pending', 'in_progress', 'completed', 'failed']);
        $type = $this->faker->randomElement(['database', 'full']);
        $filename = "backup_{$type}_" . now()->format('Y-m-d_H-i-s') . ".sql";
        
        return [
            'filename' => $filename,
            'file_path' => "backups/{$filename}",
            'file_size' => $status === 'completed' ? $this->faker->numberBetween(1024, 10485760) : null, // 1KB to 10MB
            'backup_type' => $type,
            'status' => $status,
            'created_by' => User::factory(),
            'notes' => $this->faker->optional(0.7)->sentence(),
            'completed_at' => $status === 'completed' ? $this->faker->dateTimeBetween('-1 month', 'now') : null,
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }

    /**
     * Indicate that the backup is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'completed_at' => null,
            'file_size' => null,
        ]);
    }

    /**
     * Indicate that the backup is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'completed_at' => null,
            'file_size' => null,
        ]);
    }

    /**
     * Indicate that the backup is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'file_size' => $this->faker->numberBetween(1024, 10485760),
        ]);
    }

    /**
     * Indicate that the backup failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'completed_at' => null,
            'file_size' => null,
            'notes' => $this->faker->sentence(),
        ]);
    }

    /**
     * Indicate that the backup is a database backup.
     */
    public function database(): static
    {
        return $this->state(fn (array $attributes) => [
            'backup_type' => 'database',
        ]);
    }

    /**
     * Indicate that the backup is a full system backup.
     */
    public function full(): static
    {
        return $this->state(fn (array $attributes) => [
            'backup_type' => 'full',
        ]);
    }
} 