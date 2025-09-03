<?php

namespace Tests\Feature;

use App\Models\Backup;
use App\Models\User;
use App\Services\BackupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BackupTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_user_can_view_backups_with_permission()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);
        $user->assignRole($role);
        $role->givePermissionTo('view-backups');

        $response = $this->actingAs($user)
            ->getJson('/api/v1/backups');

        $response->assertStatus(200);
    }

    public function test_user_cannot_view_backups_without_permission()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/backups');

        $response->assertStatus(403);
    }

    public function test_user_can_create_backup_with_permission()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);
        $user->assignRole($role);
        $role->givePermissionTo(['view-backups', 'create-backups']);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/backups', [
                'type' => 'database',
                'notes' => 'Test backup',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('backups', [
            'backup_type' => 'database',
            'status' => 'pending',
            'notes' => 'Test backup',
        ]);
    }

    public function test_user_cannot_create_backup_without_permission()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);
        $user->assignRole($role);
        $role->givePermissionTo('view-backups');

        $response = $this->actingAs($user)
            ->postJson('/api/v1/backups', [
                'type' => 'database',
                'notes' => 'Test backup',
            ]);

        $response->assertStatus(403);
    }

    public function test_user_can_delete_backup_with_permission()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);
        $user->assignRole($role);
        $role->givePermissionTo(['view-backups', 'delete-backups']);

        $backup = Backup::factory()->create([
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/backups/{$backup->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('backups', ['id' => $backup->id]);
    }

    public function test_user_cannot_delete_backup_without_permission()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);
        $user->assignRole($role);
        $role->givePermissionTo('view-backups');

        $backup = Backup::factory()->create([
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/backups/{$backup->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_restore_backup_with_permission()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);
        $user->assignRole($role);
        $role->givePermissionTo(['view-backups', 'restore-backups']);

        $backup = Backup::factory()->completed()->create([
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->postJson("/api/v1/backups/{$backup->id}/restore");

        $response->assertStatus(200);
    }

    public function test_user_cannot_restore_incomplete_backup()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);
        $user->assignRole($role);
        $role->givePermissionTo(['view-backups', 'restore-backups']);

        $backup = Backup::factory()->pending()->create([
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->postJson("/api/v1/backups/{$backup->id}/restore");

        $response->assertStatus(400);
    }

    public function test_user_can_download_completed_backup()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);
        $user->assignRole($role);
        $role->givePermissionTo('view-backups');

        $backup = Backup::factory()->completed()->create([
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/v1/backups/{$backup->id}/download");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => ['download_url', 'filename', 'file_size'],
        ]);
    }

    public function test_user_cannot_download_incomplete_backup()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);
        $user->assignRole($role);
        $role->givePermissionTo('view-backups');

        $backup = Backup::factory()->pending()->create([
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/v1/backups/{$backup->id}/download");

        $response->assertStatus(400);
    }

    public function test_user_can_process_backups_with_permission()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);
        $user->assignRole($role);
        $role->givePermissionTo(['view-backups', 'process-backups']);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/backups/process');

        $response->assertStatus(200);
    }

    public function test_user_cannot_process_backups_without_permission()
    {
        $user = User::factory()->create();
        $role = Role::create(['name' => 'admin']);
        $user->assignRole($role);
        $role->givePermissionTo('view-backups');

        $response = $this->actingAs($user)
            ->postJson('/api/v1/backups/process');

        $response->assertStatus(403);
    }

    public function test_backup_service_can_create_backup_request()
    {
        $user = User::factory()->create();
        $service = new BackupService();

        $backup = $service->createBackupRequest('database', $user, 'Test backup');

        $this->assertInstanceOf(Backup::class, $backup);
        $this->assertEquals('database', $backup->backup_type);
        $this->assertEquals('pending', $backup->status);
        $this->assertEquals($user->id, $backup->created_by);
        $this->assertEquals('Test backup', $backup->notes);
    }

    public function test_backup_service_can_get_stats()
    {
        Backup::factory()->count(5)->completed()->create();
        Backup::factory()->count(3)->pending()->create();
        Backup::factory()->count(2)->failed()->create();

        $service = new BackupService();
        $stats = $service->getBackupStats();

        $this->assertEquals(10, $stats['total']);
        $this->assertEquals(5, $stats['completed']);
        $this->assertEquals(3, $stats['pending']);
        $this->assertEquals(2, $stats['failed']);
    }

    public function test_backup_model_has_correct_attributes()
    {
        $backup = Backup::factory()->create();

        $this->assertArrayHasKey('file_size_formatted', $backup->toArray());
        $this->assertArrayHasKey('status_label', $backup->toArray());
    }

    public function test_backup_model_status_methods()
    {
        $pendingBackup = Backup::factory()->pending()->create();
        $completedBackup = Backup::factory()->completed()->create();
        $failedBackup = Backup::factory()->failed()->create();

        $this->assertTrue($pendingBackup->isPending());
        $this->assertTrue($completedBackup->isCompleted());
        $this->assertTrue($failedBackup->isFailed());
    }
} 