<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Backup;
use App\Services\BackupService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class BackupController extends Controller
{
    public function __construct(
        private BackupService $backupService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-backups');
        
        // Apply specific permissions to methods
        $this->middleware('permission:create-backups')->only(['store']);
        $this->middleware('permission:restore-backups')->only(['restore']);
        $this->middleware('permission:delete-backups')->only(['destroy']);
        $this->middleware('permission:process-backups')->only(['process']);
    }

    /**
     * Get list of backups
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
            'status' => Rule::in(['pending', 'in_progress', 'completed', 'failed']),
            'type' => Rule::in(['database', 'full']),
        ]);

        $query = Backup::with('creator')
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('backup_type', $request->type);
        }

        $perPage = $request->get('per_page', 15);
        $backups = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $backups->items(),
            'pagination' => [
                'current_page' => $backups->currentPage(),
                'last_page' => $backups->lastPage(),
                'per_page' => $backups->perPage(),
                'total' => $backups->total(),
            ],
        ]);
    }

    /**
     * Create a new backup request
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => ['required', Rule::in(['database', 'full'])],
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $backup = $this->backupService->createBackupRequest(
                $request->type,
                Auth::user(),
                $request->notes
            );

            return response()->json([
                'success' => true,
                'message' => 'Backup request created successfully',
                'data' => $backup->load('creator'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create backup request: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get backup details
     */
    public function show(Backup $backup): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $backup->load('creator'),
        ]);
    }

    /**
     * Download backup file
     */
    public function download(Backup $backup): JsonResponse
    {
        if (!$backup->isCompleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Backup is not completed yet',
            ], 400);
        }

        if (!Storage::exists($backup->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Backup file not found',
            ], 404);
        }

        $downloadUrl = $this->backupService->getDownloadUrl($backup);

        return response()->json([
            'success' => true,
            'data' => [
                'download_url' => $downloadUrl,
                'filename' => $backup->filename,
                'file_size' => $backup->file_size_formatted,
            ],
        ]);
    }

    /**
     * Restore backup
     */
    public function restore(Backup $backup): JsonResponse
    {
        if (!$backup->isCompleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot restore incomplete backup',
            ], 400);
        }

        try {
            $this->backupService->restoreBackup($backup);

            return response()->json([
                'success' => true,
                'message' => 'Backup restored successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete backup
     */
    public function destroy(Backup $backup): JsonResponse
    {
        try {
            $this->backupService->deleteBackup($backup);

            return response()->json([
                'success' => true,
                'message' => 'Backup deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get backup statistics
     */
    public function stats(): JsonResponse
    {
        $stats = $this->backupService->getBackupStats();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Process pending backups (admin only)
     */
    public function process(): JsonResponse
    {
        try {
            $results = $this->backupService->processPendingBackups();

            return response()->json([
                'success' => true,
                'message' => 'Backup processing completed',
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process backups: ' . $e->getMessage(),
            ], 500);
        }
    }
} 