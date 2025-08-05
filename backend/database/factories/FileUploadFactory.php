<?php

namespace Database\Factories;

use App\Models\FileUpload;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FileUpload>
 */
class FileUploadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $filename = $this->faker->randomElement([
            'document.pdf',
            'image.jpg',
            'spreadsheet.xlsx',
            'presentation.pptx',
            'text.txt',
        ]);

        $mimeTypes = [
            'document.pdf' => 'application/pdf',
            'image.jpg' => 'image/jpeg',
            'spreadsheet.xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'presentation.pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text.txt' => 'text/plain',
        ];

        return [
            'model_type' => null,
            'model_id' => null,
            'upload_token' => Str::random(32),
            'filename' => $filename,
            'path' => 'uploads/' . date('Y/m/d') . '/' . Str::random(40) . '.' . pathinfo($filename, PATHINFO_EXTENSION),
            'mime_type' => $mimeTypes[$filename],
            'size' => $this->faker->numberBetween(1024, 10 * 1024 * 1024), // 1KB to 10MB
        ];
    }

    /**
     * Indicate that the file upload is associated with a specific model.
     */
    public function forModel(string $modelType, int $modelId): static
    {
        return $this->state(fn (array $attributes) => [
            'model_type' => $modelType,
            'model_id' => $modelId,
        ]);
    }

    /**
     * Indicate that the file upload is an image.
     */
    public function image(): static
    {
        return $this->state(fn (array $attributes) => [
            'filename' => $this->faker->randomElement(['image1.jpg', 'image2.png', 'image3.gif']),
            'mime_type' => $this->faker->randomElement(['image/jpeg', 'image/png', 'image/gif']),
        ]);
    }

    /**
     * Indicate that the file upload is a document.
     */
    public function document(): static
    {
        return $this->state(fn (array $attributes) => [
            'filename' => $this->faker->randomElement(['document.pdf', 'report.docx', 'data.xlsx']),
            'mime_type' => $this->faker->randomElement([
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]),
        ]);
    }
}
