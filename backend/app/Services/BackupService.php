<?php

namespace App\Services;

use App\Models\Backup;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Exception;

class BackupService
{
    protected $backupPath = 'backups';
    protected $maxBackups = 10; // Keep only last 10 backups

    /**
     * Create a new backup request
     */
    public function createBackupRequest(string $type = 'database', ?User $user = null, ?string $notes = null): Backup
    {
        $filename = $this->generateFilename($type);
        $filePath = $this->backupPath . '/' . $filename;

        return Backup::create([
            'filename' => $filename,
            'file_path' => $filePath,
            'backup_type' => $type,
            'status' => Backup::STATUS_PENDING,
            'created_by' => $user?->id,
            'notes' => $notes,
        ]);
    }

    /**
     * Process pending backups
     */
    public function processPendingBackups(): array
    {
        $results = [
            'processed' => 0,
            'success' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        $pendingBackups = Backup::where('status', Backup::STATUS_PENDING)
            ->orderBy('created_at', 'asc')
            ->get();

        foreach ($pendingBackups as $backup) {
            try {
                $results['processed']++;
                
                // Update status to in progress
                $backup->update(['status' => Backup::STATUS_IN_PROGRESS]);

                // Perform the backup
                $this->performBackup($backup);

                $results['success']++;
            } catch (Exception $e) {
                $results['failed']++;
                $results['errors'][] = "Backup {$backup->id}: " . $e->getMessage();
                
                $backup->update([
                    'status' => Backup::STATUS_FAILED,
                    'notes' => $e->getMessage(),
                ]);

                Log::error("Backup failed for ID {$backup->id}: " . $e->getMessage());
            }
        }

        // Clean up old backups
        $this->cleanupOldBackups();

        return $results;
    }

    /**
     * Perform the actual backup
     */
    protected function performBackup(Backup $backup): void
    {
        $startTime = now();
        
        try {
            if ($backup->backup_type === Backup::TYPE_DATABASE) {
                $this->backupDatabase($backup);
            } else {
                $this->backupFull($backup);
            }

            $backup->update([
                'status' => Backup::STATUS_COMPLETED,
                'completed_at' => now(),
                'file_size' => $this->getFileSize($backup->file_path),
            ]);

            Log::info("Backup completed successfully: {$backup->filename}");
        } catch (Exception $e) {
            throw new Exception("Backup failed: " . $e->getMessage());
        }
    }

    /**
     * Backup database only
     */
    protected function backupDatabase(Backup $backup): void
    {
        $connection = config('database.default');
        $database = config("database.connections.{$connection}.database");
        $host = config("database.connections.{$connection}.host");
        $port = config("database.connections.{$connection}.port");
        $username = config("database.connections.{$connection}.username");
        $password = config("database.connections.{$connection}.password");

        // Create backup directory if it doesn't exist
        Storage::makeDirectory($this->backupPath);

        $command = $this->buildMysqldumpCommand($database, $host, $port, $username, $password, $backup->file_path);
        
        $output = [];
        $returnCode = 0;
        
        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new Exception("mysqldump failed with return code: {$returnCode}");
        }

        if (!Storage::exists($backup->file_path)) {
            throw new Exception("Backup file was not created");
        }
    }

    /**
     * Build mysqldump command
     */
    protected function buildMysqldumpCommand(string $database, string $host, string $port, string $username, string $password, string $filePath): string
    {
        $fullPath = Storage::path($filePath);
        
        $command = "mysqldump";
        $command .= " --no-defaults";
        $command .= " --host={$host}";
        $command .= " --port={$port}";
        $command .= " --user={$username}";
        
        if ($password) {
            $command .= " --password={$password}";
        }
        
        $command .= " --single-transaction";
        $command .= " --routines";
        $command .= " --triggers";
        $command .= " --databases {$database}";
        $command .= " > {$fullPath}";

        return $command;
    }

    /**
     * Backup full system (database + files)
     */
    protected function backupFull(Backup $backup): void
    {
        // For now, we'll just do database backup
        // In the future, this could include file system backup
        $this->backupDatabase($backup);
    }

    /**
     * Restore database from backup
     */
    public function restoreBackup(Backup $backup): bool
    {
        if (!$backup->isCompleted()) {
            throw new Exception("Cannot restore incomplete backup");
        }

        if (!Storage::exists($backup->file_path)) {
            throw new Exception("Backup file not found");
        }

        $connection = config('database.default');
        $database = config("database.connections.{$connection}.database");
        $host = config("database.connections.{$connection}.host");
        $port = config("database.connections.{$connection}.port");
        $username = config("database.connections.{$connection}.username");
        $password = config("database.connections.{$connection}.password");

        $command = $this->buildMysqlRestoreCommand($database, $host, $port, $username, $password, $backup->file_path);
        
        $output = [];
        $returnCode = 0;
        
        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new Exception("mysql restore failed with return code: {$returnCode}");
        }

        return true;
    }

    /**
     * Build mysql restore command
     */
    protected function buildMysqlRestoreCommand(string $database, string $host, string $port, string $username, string $password, string $filePath): string
    {
        $fullPath = Storage::path($filePath);
        
        $command = "mysql";
        $command .= " --no-defaults";
        $command .= " --host={$host}";
        $command .= " --port={$port}";
        $command .= " --user={$username}";
        
        if ($password) {
            $command .= " --password={$password}";
        }
        
        $command .= " {$database}";
        $command .= " < {$fullPath}";

        return $command;
    }

    /**
     * Get file size in bytes
     */
    protected function getFileSize(string $filePath): int
    {
        return Storage::exists($filePath) ? Storage::size($filePath) : 0;
    }

    /**
     * Generate filename for backup
     */
    protected function generateFilename(string $type): string
    {
        $timestamp = now()->format('Y-m-d_H-i-s');
        $type = Str::slug($type);
        return "backup_{$type}_{$timestamp}.sql";
    }

    /**
     * Clean up old backups
     */
    protected function cleanupOldBackups(): void
    {
        $oldBackups = Backup::where('status', Backup::STATUS_COMPLETED)
            ->orderBy('created_at', 'desc')
            ->skip($this->maxBackups)
            ->take(100) // Limit to prevent too many deletions
            ->get();

        foreach ($oldBackups as $backup) {
            // Delete file
            if (Storage::exists($backup->file_path)) {
                Storage::delete($backup->file_path);
            }

            // Delete record
            $backup->delete();
        }
    }

    /**
     * Get backup statistics
     */
    public function getBackupStats(): array
    {
        return [
            'total' => Backup::count(),
            'completed' => Backup::where('status', Backup::STATUS_COMPLETED)->count(),
            'pending' => Backup::where('status', Backup::STATUS_PENDING)->count(),
            'in_progress' => Backup::where('status', Backup::STATUS_IN_PROGRESS)->count(),
            'failed' => Backup::where('status', Backup::STATUS_FAILED)->count(),
            'total_size' => Backup::where('status', Backup::STATUS_COMPLETED)->sum('file_size'),
        ];
    }

    /**
     * Get backup file download URL
     */
    public function getDownloadUrl(Backup $backup): ?string
    {
        if (!$backup->isCompleted() || !Storage::exists($backup->file_path)) {
            return null;
        }

        return Storage::url($backup->file_path);
    }

    /**
     * Delete backup and its file
     */
    public function deleteBackup(Backup $backup): bool
    {
        // Delete file
        if (Storage::exists($backup->file_path)) {
            Storage::delete($backup->file_path);
        }

        // Delete record
        return $backup->delete();
    }
} 