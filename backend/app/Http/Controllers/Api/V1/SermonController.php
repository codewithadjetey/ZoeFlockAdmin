<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Sermon;
use App\Models\SermonMedia;
use App\Models\SermonSeries;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * @OA\Tag(
 *     name="Sermons",
 *     description="Sermon Management API"
 * )
 */
class SermonController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
        
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-sermons');
        
        $this->middleware('permission:create-sermons')->only(['store']);
        $this->middleware('permission:edit-sermons')->only(['update']);
        $this->middleware('permission:delete-sermons')->only(['destroy']);
        $this->middleware('permission:publish-sermons')->only(['publish']);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Sermon::with(['creator', 'updater', 'series', 'media']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('speaker', 'LIKE', "%{$search}%")
                  ->orWhere('scripture_reference', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('series_id')) {
            $query->where('series_id', $request->input('series_id'));
        }

        if ($request->filled('speaker')) {
            $query->where('speaker', 'LIKE', "%{$request->input('speaker')}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 15);
        $sermons = $query->orderBy('sermon_date', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Sermons retrieved successfully',
            'data' => $sermons
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:sermons,slug',
            'speaker' => 'required|string|max:255',
            'sermon_date' => 'required|date',
            'series_id' => 'nullable|integer|exists:sermon_series,id',
            'scripture_reference' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:draft,published',
            'published_at' => 'nullable|date',
            'thumbnail' => 'nullable|string',
            'upload_token' => 'nullable|string',
            'media' => 'nullable|array',
            'media.*.media_type' => 'required|in:audio,video,youtube,document',
            'media.*.file_path' => 'nullable|string',
            'media.*.youtube_url' => 'nullable|url',
            'media.*.external_url' => 'nullable|url',
            'media.*.duration' => 'nullable|integer|min:0',
            'media.*.order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $slug = $request->input('slug') ?: Str::slug($request->input('title'));
            $existingSlug = Sermon::where('slug', $slug)->exists();
            
            if ($existingSlug) {
                $slug = $slug . '-' . time();
            }

            $sermonData = [
                'title' => $request->input('title'),
                'slug' => $slug,
                'speaker' => $request->input('speaker'),
                'sermon_date' => $request->input('sermon_date'),
                'series_id' => $request->input('series_id'),
                'scripture_reference' => $request->input('scripture_reference'),
                'description' => $request->input('description'),
                'status' => $request->input('status'),
                'published_at' => $request->input('published_at'),
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ];

            // Handle thumbnail upload if provided
            if ($request->filled('upload_token')) {
                $attachedFile = $this->fileUploadService->attachFileToModel(
                    $request->input('upload_token'),
                    Sermon::class,
                    0 // Will be updated after sermon creation
                );

                if ($attachedFile) {
                    $sermonData['thumbnail'] = $attachedFile->path;
                }
            }

            $sermon = Sermon::create($sermonData);

            // Update the file with the actual sermon ID
            if ($request->filled('upload_token') && $attachedFile ?? null) {
                $attachedFile->model_id = $sermon->id;
                $attachedFile->save();
            }

            // Handle media items
            if ($request->filled('media') && is_array($request->input('media'))) {
                foreach ($request->input('media') as $mediaData) {
                    SermonMedia::create([
                        'sermon_id' => $sermon->id,
                        'media_type' => $mediaData['media_type'],
                        'file_path' => $mediaData['file_path'] ?? null,
                        'youtube_url' => $mediaData['youtube_url'] ?? null,
                        'external_url' => $mediaData['external_url'] ?? null,
                        'duration' => $mediaData['duration'] ?? null,
                        'file_size' => 0, // Will be calculated
                        'order' => $mediaData['order'] ?? 0,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sermon created successfully',
                'data' => $sermon->load(['creator', 'updater', 'series', 'media'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create sermon: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $sermon = Sermon::with(['creator', 'updater', 'series', 'media'])->find($id);

        if (!$sermon) {
            return response()->json([
                'success' => false,
                'message' => 'Sermon not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Sermon retrieved successfully',
            'data' => $sermon
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $sermon = Sermon::find($id);

        if (!$sermon) {
            return response()->json([
                'success' => false,
                'message' => 'Sermon not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:sermons,slug,' . $id,
            'speaker' => 'sometimes|required|string|max:255',
            'sermon_date' => 'sometimes|required|date',
            'series_id' => 'nullable|integer|exists:sermon_series,id',
            'scripture_reference' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:draft,published',
            'published_at' => 'nullable|date',
            'thumbnail' => 'nullable|string',
            'upload_token' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $updateData = $request->only([
                'title', 'slug', 'speaker', 'sermon_date', 'series_id',
                'scripture_reference', 'description', 'status', 'published_at'
            ]);
            $updateData['updated_by'] = Auth::id();

            // Handle thumbnail upload if provided
            if ($request->filled('upload_token')) {
                $attachedFile = $this->fileUploadService->attachFileToModel(
                    $request->input('upload_token'),
                    Sermon::class,
                    $sermon->id
                );

                if ($attachedFile) {
                    $updateData['thumbnail'] = $attachedFile->path;
                }
            }

            $sermon->update($updateData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sermon updated successfully',
                'data' => $sermon->load(['creator', 'updater', 'series', 'media'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update sermon: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $sermon = Sermon::find($id);

        if (!$sermon) {
            return response()->json([
                'success' => false,
                'message' => 'Sermon not found'
            ], 404);
        }

        try {
            $sermon->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sermon deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete sermon: ' . $e->getMessage()
            ], 500);
        }
    }

    public function publish(int $id): JsonResponse
    {
        $sermon = Sermon::find($id);

        if (!$sermon) {
            return response()->json([
                'success' => false,
                'message' => 'Sermon not found'
            ], 404);
        }

        try {
            $sermon->update([
                'status' => 'published',
                'published_at' => now(),
                'updated_by' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sermon published successfully',
                'data' => $sermon->load(['creator', 'updater', 'series', 'media'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to publish sermon: ' . $e->getMessage()
            ], 500);
        }
    }

    public function addMedia(Request $request, int $id): JsonResponse
    {
        $sermon = Sermon::find($id);

        if (!$sermon) {
            return response()->json([
                'success' => false,
                'message' => 'Sermon not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'media_type' => 'required|in:audio,video,youtube,document',
            'file_path' => 'nullable|string',
            'youtube_url' => 'nullable|url',
            'external_url' => 'nullable|url',
            'duration' => 'nullable|integer|min:0',
            'order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $maxOrder = SermonMedia::where('sermon_id', $id)->max('order');

            $media = SermonMedia::create([
                'sermon_id' => $id,
                'media_type' => $request->input('media_type'),
                'file_path' => $request->input('file_path'),
                'youtube_url' => $request->input('youtube_url'),
                'external_url' => $request->input('external_url'),
                'duration' => $request->input('duration'),
                'file_size' => 0,
                'order' => $request->input('order', ($maxOrder ?? 0) + 1),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Media added successfully',
                'data' => $media
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add media: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateMedia(Request $request, int $id, int $mediaId): JsonResponse
    {
        $media = SermonMedia::where('sermon_id', $id)->find($mediaId);

        if (!$media) {
            return response()->json([
                'success' => false,
                'message' => 'Media not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'media_type' => 'sometimes|required|in:audio,video,youtube,document',
            'file_path' => 'nullable|string',
            'youtube_url' => 'nullable|url',
            'external_url' => 'nullable|url',
            'duration' => 'nullable|integer|min:0',
            'order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $media->update($request->only([
                'media_type', 'file_path', 'youtube_url', 
                'external_url', 'duration', 'order'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Media updated successfully',
                'data' => $media
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update media: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteMedia(int $id, int $mediaId): JsonResponse
    {
        $media = SermonMedia::where('sermon_id', $id)->find($mediaId);

        if (!$media) {
            return response()->json([
                'success' => false,
                'message' => 'Media not found'
            ], 404);
        }

        try {
            $media->delete();

            return response()->json([
                'success' => true,
                'message' => 'Media deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete media: ' . $e->getMessage()
            ], 500);
        }
    }
}

