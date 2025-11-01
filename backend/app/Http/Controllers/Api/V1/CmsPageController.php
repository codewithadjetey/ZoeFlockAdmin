<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * @OA\Tag(
 *     name="CMS Pages",
 *     description="Content Management System - Pages API"
 * )
 */
class CmsPageController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
        
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-cms-pages');
        
        $this->middleware('permission:create-cms-pages')->only(['store']);
        $this->middleware('permission:edit-cms-pages')->only(['update']);
        $this->middleware('permission:delete-cms-pages')->only(['destroy']);
        $this->middleware('permission:publish-cms-pages')->only(['publish']);
    }

    public function index(Request $request): JsonResponse
    {
        $query = CmsPage::with(['creator', 'updater']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('slug', 'LIKE', "%{$search}%")
                  ->orWhere('content', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 15);
        $pages = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Pages retrieved successfully',
            'data' => $pages
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:cms_pages,slug',
            'content' => 'nullable|string',
            'excerpt' => 'nullable|string|max:1000',
            'featured_image' => 'nullable|string',
            'template' => 'nullable|string|max:255',
            'status' => 'required|in:draft,published,scheduled',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'seo_keywords' => 'nullable|string',
            'published_at' => 'nullable|date',
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
            $existingSlug = CmsPage::where('slug', $slug)->exists();
            
            if ($existingSlug) {
                $slug = $slug . '-' . time();
            }

            $pageData = [
                'title' => $request->input('title'),
                'slug' => $slug,
                'content' => $request->input('content'),
                'excerpt' => $request->input('excerpt'),
                'template' => $request->input('template', 'default'),
                'status' => $request->input('status'),
                'seo_title' => $request->input('seo_title'),
                'seo_description' => $request->input('seo_description'),
                'seo_keywords' => $request->input('seo_keywords'),
                'published_at' => $request->input('published_at'),
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ];

            // Handle file upload if provided
            if ($request->filled('upload_token')) {
                $attachedFile = $this->fileUploadService->attachFileToModel(
                    $request->input('upload_token'),
                    CmsPage::class,
                    0 // Will be updated after page creation
                );

                if ($attachedFile) {
                    $pageData['featured_image'] = $attachedFile->path;
                }
            }

            $page = CmsPage::create($pageData);

            // Update the file with the actual page ID
            if ($request->filled('upload_token') && $attachedFile ?? null) {
                $attachedFile->model_id = $page->id;
                $attachedFile->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Page created successfully',
                'data' => $page->load(['creator', 'updater'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create page: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $page = CmsPage::with(['creator', 'updater'])->find($id);

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Page retrieved successfully',
            'data' => $page
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $page = CmsPage::find($id);

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:cms_pages,slug,' . $id,
            'content' => 'nullable|string',
            'excerpt' => 'nullable|string|max:1000',
            'featured_image' => 'nullable|string',
            'template' => 'nullable|string|max:255',
            'status' => 'sometimes|required|in:draft,published,scheduled',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'seo_keywords' => 'nullable|string',
            'published_at' => 'nullable|date',
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
                'title', 'slug', 'content', 'excerpt', 'template', 
                'status', 'seo_title', 'seo_description', 'seo_keywords', 'published_at'
            ]);
            $updateData['updated_by'] = Auth::id();

            // Handle file upload if provided
            if ($request->filled('upload_token')) {
                $attachedFile = $this->fileUploadService->attachFileToModel(
                    $request->input('upload_token'),
                    CmsPage::class,
                    $page->id
                );

                if ($attachedFile) {
                    $updateData['featured_image'] = $attachedFile->path;
                }
            }

            $page->update($updateData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Page updated successfully',
                'data' => $page->load(['creator', 'updater'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update page: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $page = CmsPage::find($id);

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found'
            ], 404);
        }

        try {
            $page->delete();

            return response()->json([
                'success' => true,
                'message' => 'Page deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete page: ' . $e->getMessage()
            ], 500);
        }
    }

    public function publish(int $id): JsonResponse
    {
        $page = CmsPage::find($id);

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found'
            ], 404);
        }

        try {
            $page->update([
                'status' => 'published',
                'published_at' => now(),
                'updated_by' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Page published successfully',
                'data' => $page->load(['creator', 'updater'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to publish page: ' . $e->getMessage()
            ], 500);
        }
    }
}

