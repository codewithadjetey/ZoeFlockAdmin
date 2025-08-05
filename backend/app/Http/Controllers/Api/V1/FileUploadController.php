<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FileUpload;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="File Uploads",
 *     description="API Endpoints for file upload management"
 * )
 */

class FileUploadController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Upload a single file.
     * 
     * @OA\Post(
     *     path="/api/v1/files/upload",
     *     operationId="uploadSingleFile",
     *     tags={"File Uploads"},
     *     summary="Upload a single file",
     *     description="Upload a single file with optional model association",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"file"},
     *                 @OA\Property(
     *                     property="file",
     *                     type="string",
     *                     format="binary",
     *                     description="The file to upload (max 10MB)"
     *                 ),
     *                 @OA\Property(
     *                     property="model_type",
     *                     type="string",
     *                     description="The model type for association (e.g., App\\Models\\User)"
     *                 ),
     *                 @OA\Property(
     *                     property="model_id",
     *                     type="integer",
     *                     description="The model ID for association"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="File uploaded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="File uploaded successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="upload_token", type="string", example="abc123def456..."),
     *                 @OA\Property(property="filename", type="string", example="document.pdf"),
     *                 @OA\Property(property="url", type="string", example="http://example.com/storage/uploads/2024/01/15/abc123.pdf"),
     *                 @OA\Property(property="size", type="string", example="2.5 MB"),
     *                 @OA\Property(property="mime_type", type="string", example="application/pdf")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation failed",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 @OA\Property(property="file", type="array", @OA\Items(type="string"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="File upload failed"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function upload(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // 10MB max
            'model_type' => 'nullable|string',
            'model_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $fileUpload = $this->fileUploadService->uploadFile(
                $request->file('file'),
                $request->input('model_type'),
                $request->input('model_id')
            );

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'data' => [
                    'upload_token' => $fileUpload->upload_token,
                    'filename' => $fileUpload->filename,
                    'url' => $fileUpload->url,
                    'size' => $fileUpload->human_size,
                    'mime_type' => $fileUpload->mime_type,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'File upload failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload multiple files.
     * 
     * @OA\Post(
     *     path="/api/v1/files/upload-multiple",
     *     operationId="uploadMultipleFiles",
     *     tags={"File Uploads"},
     *     summary="Upload multiple files",
     *     description="Upload multiple files at once with optional model association",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"files"},
     *                 @OA\Property(
     *                     property="files",
     *                     type="array",
     *                     @OA\Items(type="string", format="binary"),
     *                     description="Array of files to upload (max 10MB each)"
     *                 ),
     *                 @OA\Property(
     *                     property="model_type",
     *                     type="string",
     *                     description="The model type for association (e.g., App\\Models\\User)"
     *                 ),
     *                 @OA\Property(
     *                     property="model_id",
     *                     type="integer",
     *                     description="The model ID for association"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Files uploaded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="3 files uploaded successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="upload_token", type="string", example="abc123def456..."),
     *                     @OA\Property(property="filename", type="string", example="image1.jpg"),
     *                     @OA\Property(property="url", type="string", example="http://example.com/storage/uploads/2024/01/15/abc123.jpg"),
     *                     @OA\Property(property="size", type="string", example="1.2 MB"),
     *                     @OA\Property(property="mime_type", type="string", example="image/jpeg")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation failed",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 @OA\Property(property="files", type="array", @OA\Items(type="string"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="File upload failed"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function uploadMultiple(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'files.*' => 'required|file|max:10240', // 10MB max per file
            'model_type' => 'nullable|string',
            'model_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $files = $request->file('files');
            $uploads = $this->fileUploadService->uploadMultipleFiles(
                $files,
                $request->input('model_type'),
                $request->input('model_id')
            );

            $uploadData = collect($uploads)->map(function ($upload) {
                return [
                    'upload_token' => $upload->upload_token,
                    'filename' => $upload->filename,
                    'url' => $upload->url,
                    'size' => $upload->human_size,
                    'mime_type' => $upload->mime_type,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => count($uploads) . ' files uploaded successfully',
                'data' => $uploadData,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'File upload failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get files by model.
     * 
     * @OA\Get(
     *     path="/api/v1/files/by-model",
     *     operationId="getFilesByModel",
     *     tags={"File Uploads"},
     *     summary="Get files by model",
     *     description="Retrieve all files associated with a specific model",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="model_type",
     *         in="query",
     *         required=true,
     *         description="The model type (e.g., App\\Models\\User)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="model_id",
     *         in="query",
     *         required=true,
     *         description="The model ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Files retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="model_type", type="string", example="App\\Models\\User"),
     *                     @OA\Property(property="model_id", type="integer", example=123),
     *                     @OA\Property(property="upload_token", type="string", example="abc123def456..."),
     *                     @OA\Property(property="filename", type="string", example="profile.jpg"),
     *                     @OA\Property(property="path", type="string", example="uploads/2024/01/15/abc123.jpg"),
     *                     @OA\Property(property="mime_type", type="string", example="image/jpeg"),
     *                     @OA\Property(property="size", type="integer", example=1258291),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation failed",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 @OA\Property(property="model_type", type="array", @OA\Items(type="string")),
     *                 @OA\Property(property="model_id", type="array", @OA\Items(type="string"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to retrieve files"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function getByModel(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'model_type' => 'required|string',
            'model_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $files = $this->fileUploadService->getFilesByModel(
                $request->input('model_type'),
                $request->input('model_id')
            );

            return response()->json([
                'success' => true,
                'data' => $files,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve files',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a file upload.
     * 
     * @OA\Delete(
     *     path="/api/v1/files/{token}",
     *     operationId="deleteFile",
     *     tags={"File Uploads"},
     *     summary="Delete a file",
     *     description="Delete a file by its upload token",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="token",
     *         in="path",
     *         required=true,
     *         description="The upload token of the file to delete",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="File deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="File deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="File not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="File not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to delete file"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function delete(Request $request, string $token): JsonResponse
    {
        try {
            $fileUpload = $this->fileUploadService->getFileByToken($token);

            if (!$fileUpload) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found',
                ], 404);
            }

            $this->fileUploadService->deleteFile($fileUpload);

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get file information by token.
     * 
     * @OA\Get(
     *     path="/api/v1/files/{token}",
     *     operationId="getFileInfo",
     *     tags={"File Uploads"},
     *     summary="Get file information",
     *     description="Get detailed information about a specific file by its upload token",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="token",
     *         in="path",
     *         required=true,
     *         description="The upload token of the file",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="File information retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="upload_token", type="string", example="abc123def456..."),
     *                 @OA\Property(property="filename", type="string", example="document.pdf"),
     *                 @OA\Property(property="url", type="string", example="http://example.com/storage/uploads/2024/01/15/abc123.pdf"),
     *                 @OA\Property(property="size", type="string", example="2.5 MB"),
     *                 @OA\Property(property="mime_type", type="string", example="application/pdf"),
     *                 @OA\Property(property="is_image", type="boolean", example=false),
     *                 @OA\Property(property="is_document", type="boolean", example=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="File not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="File not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to retrieve file information"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function show(string $token): JsonResponse
    {
        try {
            $fileUpload = $this->fileUploadService->getFileByToken($token);

            if (!$fileUpload) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'upload_token' => $fileUpload->upload_token,
                    'filename' => $fileUpload->filename,
                    'url' => $fileUpload->url,
                    'size' => $fileUpload->human_size,
                    'mime_type' => $fileUpload->mime_type,
                    'is_image' => $fileUpload->isImage(),
                    'is_document' => $fileUpload->isDocument(),
                    'created_at' => $fileUpload->created_at,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve file information',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
