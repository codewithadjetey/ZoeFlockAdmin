<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * @OA\Tag(
 *     name="Announcements",
 *     description="Announcement Management API"
 * )
 */
class AnnouncementController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
        
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-announcements');
        
        $this->middleware('permission:create-announcements')->only(['store']);
        $this->middleware('permission:edit-announcements')->only(['update']);
        $this->middleware('permission:delete-announcements')->only(['destroy']);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Announcement::with(['creator', 'updater']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('content', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->input('is_active') == '1' ? 1 : 0);
        }

        if ($request->filled('show_active_only') && $request->input('show_active_only') == '1') {
            $query->active();
        }

        $perPage = $request->input('per_page', 15);
        $announcements = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Announcements retrieved successfully',
            'announcements' => $announcements
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:announcements,slug',
            'content' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'category' => 'required|in:general,events,updates,urgent',
            'priority' => 'required|in:low,medium,high',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'nullable|boolean',
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

            $slug = $request->input('slug') ?: Str::slug($request->input('title'));
            $existingSlug = Announcement::where('slug', $slug)->exists();
            
            if ($existingSlug) {
                $slug = $slug . '-' . time();
            }

            $announcementData = [
                'title' => $request->input('title'),
                'slug' => $slug,
                'content' => $request->input('content'),
                'category' => $request->input('category'),
                'priority' => $request->input('priority'),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
                'is_active' => $request->input('is_active', true),
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ];

            // Handle file upload if provided
            if ($request->filled('upload_token')) {
                $attachedFile = $this->fileUploadService->attachFileToModel(
                    $request->input('upload_token'),
                    Announcement::class,
                    0 // Will be updated after announcement creation
                );

                if ($attachedFile) {
                    $announcementData['featured_image'] = $attachedFile->path;
                }
            }

            $announcement = Announcement::create($announcementData);

            // Update the file with the actual announcement ID
            if ($request->filled('upload_token') && $attachedFile ?? null) {
                $attachedFile->model_id = $announcement->id;
                $attachedFile->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Announcement created successfully',
                'data' => $announcement->load(['creator', 'updater'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create announcement: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $announcement = Announcement::with(['creator', 'updater'])->find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Announcement retrieved successfully',
            'data' => $announcement
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:announcements,slug,' . $id,
            'content' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'category' => 'sometimes|required|in:general,events,updates,urgent',
            'priority' => 'sometimes|required|in:low,medium,high',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'nullable|boolean',
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
                'title', 'slug', 'content', 'category', 'priority',
                'start_date', 'end_date', 'is_active'
            ]);
            $updateData['updated_by'] = Auth::id();

            // Handle file upload if provided
            if ($request->filled('upload_token')) {
                $attachedFile = $this->fileUploadService->attachFileToModel(
                    $request->input('upload_token'),
                    Announcement::class,
                    $announcement->id
                );

                if ($attachedFile) {
                    $updateData['featured_image'] = $attachedFile->path;
                }
            }

            $announcement->update($updateData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Announcement updated successfully',
                'data' => $announcement->load(['creator', 'updater'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update announcement: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found'
            ], 404);
        }

        try {
            $announcement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Announcement deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete announcement: ' . $e->getMessage()
            ], 500);
        }
    }
}

