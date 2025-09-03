<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;

class CreateBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:create 
                            {type=database : Type of backup (database|full)}
                            {--notes= : Additional notes for the backup}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new backup request';

    /**
     * Execute the console command.
     */
    public function handle(BackupService $backupService): int
    {
        $type = $this->argument('type');
        $notes = $this->option('notes');

        if (!in_array($type, ['database', 'full'])) {
            $this->error('Invalid backup type. Use "database" or "full".');
            return Command::FAILURE;
        }

        try {
            $backup = $backupService->createBackupRequest($type, null, $notes);

            $this->info("Backup request created successfully!");
            $this->info("ID: {$backup->id}");
            $this->info("Type: {$backup->backup_type}");
            $this->info("Status: {$backup->status}");
            $this->info("Filename: {$backup->filename}");

            $this->info("\nTo process this backup, run:");
            $this->info("php artisan backup:process");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Failed to create backup request: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
} 