<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessBackups extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:process {--force : Force processing even if no pending backups}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process pending database backups';

    /**
     * Execute the console command.
     */
    public function handle(BackupService $backupService): int
    {
        $this->info('Starting backup processing...');

        try {
            $results = $backupService->processPendingBackups();

            $this->info("Backup processing completed:");
            $this->info("- Processed: {$results['processed']}");
            $this->info("- Success: {$results['success']}");
            $this->info("- Failed: {$results['failed']}");

            if (!empty($results['errors'])) {
                $this->warn("Errors encountered:");
                foreach ($results['errors'] as $error) {
                    $this->error("- {$error}");
                }
            }

            if ($results['processed'] === 0 && !$this->option('force')) {
                $this->info('No pending backups to process.');
            }

            Log::info("Backup processing completed", $results);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Backup processing failed: " . $e->getMessage());
            Log::error("Backup processing failed: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
} 