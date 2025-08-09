<?php

namespace App\Services;

use App\Models\FileUpload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    /**
     * Upload a single file.
     */
    public function uploadFile(UploadedFile $file, ?string $modelType = null, ?int $modelId = null): FileUpload
    {
        $uploadToken = FileUpload::generateUploadToken();
        $filename = $this->generateUniqueFilename($file);
        $path = $this->storeFile($file, $filename);

        return FileUpload::create([
            'model_type' => $modelType,
            'model_id' => $modelId,
            'upload_token' => $uploadToken,
            'filename' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
    }

    /**
     * Upload multiple files.
     */
    public function uploadMultipleFiles(array $files, ?string $modelType = null, ?int $modelId = null): array
    {
        $uploads = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $uploads[] = $this->uploadFile($file, $modelType, $modelId);
            }
        }

        return $uploads;
    }

    /**
     * Delete a file upload and its associated file.
     */
    public function deleteFile(FileUpload $fileUpload): bool
    {
        // Delete the physical file
        if (Storage::disk('public')->exists($fileUpload->path)) {
            Storage::disk('public')->delete($fileUpload->path);
        }

        // Delete the database record
        return $fileUpload->delete();
    }

    /**
     * Generate a unique filename for the uploaded file.
     */
    private function generateUniqueFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $name = Str::random(40);
        
        return $name . '.' . $extension;
    }

    /**
     * Store the file in the storage disk.
     */
    private function storeFile(UploadedFile $file, string $filename): string
    {
        $path = 'uploads/' . date('Y/m/d') . '/' . $filename;
        
        Storage::disk('public')->putFileAs(
            dirname($path),
            $file,
            basename($path)
        );

        return $path;
    }

    /**
     * Get file uploads by model.
     */
    public function getFilesByModel(string $modelType, int $modelId): array
    {
        return FileUpload::where('model_type', $modelType)
            ->where('model_id', $modelId)
            ->get()
            ->toArray();
    }

    /**
     * Get file upload by token.
     */
    public function getFileByToken(string $token): ?FileUpload
    {
        return FileUpload::where('upload_token', $token)->first();
    }

    // Attach file to model using token. Returns the FileUpload on success, or null on failure
    public function attachFileToModel(string $token, string $modelType, int $modelId): ?FileUpload
    {
        $file = $this->getFileByToken($token);
        if (!$file) {
            return null;
        }

        // If already attached to some model, do not re-attach
        if ($file->model_type && $file->model_id) {
            return $file;
        }

        $file->model_type = $modelType;
        $file->model_id = $modelId;
        $file->save();
        return $file;
    }
} 