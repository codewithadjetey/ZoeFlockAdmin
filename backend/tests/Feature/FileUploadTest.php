<?php

namespace Tests\Feature;

use App\Models\FileUpload;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FileUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_user_can_upload_single_file()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $file = UploadedFile::fake()->create('document.pdf', 1024);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->post('/api/v1/files/upload', [
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'upload_token',
                    'filename',
                    'url',
                    'size',
                    'mime_type',
                ],
            ]);

        $this->assertDatabaseHas('file_uploads', [
            'filename' => 'document.pdf',
            'mime_type' => 'application/pdf',
        ]);
    }

    public function test_user_can_upload_multiple_files()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $files = [
            UploadedFile::fake()->create('image1.jpg', 1024),
            UploadedFile::fake()->create('image2.png', 1024),
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->post('/api/v1/files/upload-multiple', [
            'files' => $files,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'upload_token',
                        'filename',
                        'url',
                        'size',
                        'mime_type',
                    ],
                ],
            ]);

        $this->assertDatabaseCount('file_uploads', 2);
    }

    public function test_user_can_upload_file_with_model_association()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $file = UploadedFile::fake()->create('profile.jpg', 1024);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->post('/api/v1/files/upload', [
            'file' => $file,
            'model_type' => User::class,
            'model_id' => $user->id,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('file_uploads', [
            'model_type' => User::class,
            'model_id' => $user->id,
            'filename' => 'profile.jpg',
        ]);
    }

    public function test_user_can_get_files_by_model()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        // Create some file uploads
        FileUpload::factory()->count(3)->create([
            'model_type' => User::class,
            'model_id' => $user->id,
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get('/api/v1/files/by-model', [
            'model_type' => User::class,
            'model_id' => $user->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'model_type',
                        'model_id',
                        'upload_token',
                        'filename',
                        'path',
                        'mime_type',
                        'size',
                        'created_at',
                        'updated_at',
                    ],
                ],
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_user_can_get_file_information()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $fileUpload = FileUpload::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->get("/api/v1/files/{$fileUpload->upload_token}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'upload_token',
                    'filename',
                    'url',
                    'size',
                    'mime_type',
                    'is_image',
                    'is_document',
                    'created_at',
                ],
            ]);
    }

    public function test_user_can_delete_file()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $fileUpload = FileUpload::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->delete("/api/v1/files/{$fileUpload->upload_token}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'File deleted successfully',
            ]);

        $this->assertDatabaseMissing('file_uploads', [
            'id' => $fileUpload->id,
        ]);
    }

    public function test_upload_fails_without_authentication()
    {
        $file = UploadedFile::fake()->create('document.pdf', 1024);

        $response = $this->post('/api/v1/files/upload', [
            'file' => $file,
        ]);

        $response->assertStatus(401);
    }

    public function test_upload_fails_with_invalid_file()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->post('/api/v1/files/upload', [
            'file' => 'not-a-file',
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'errors',
            ]);
    }

    public function test_upload_fails_with_file_too_large()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        // Create a file larger than 10MB
        $file = UploadedFile::fake()->create('large-file.pdf', 11 * 1024 * 1024);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->post('/api/v1/files/upload', [
            'file' => $file,
        ]);

        $response->assertStatus(422);
    }

    public function test_delete_fails_with_invalid_token()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->delete('/api/v1/files/invalid-token');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'File not found',
            ]);
    }

    public function test_file_upload_generates_unique_tokens()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $file1 = UploadedFile::fake()->create('file1.pdf', 1024);
        $file2 = UploadedFile::fake()->create('file2.pdf', 1024);

        $response1 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->post('/api/v1/files/upload', [
            'file' => $file1,
        ]);

        $response2 = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->post('/api/v1/files/upload', [
            'file' => $file2,
        ]);

        $token1 = $response1->json('data.upload_token');
        $token2 = $response2->json('data.upload_token');

        $this->assertNotEquals($token1, $token2);
    }
}
