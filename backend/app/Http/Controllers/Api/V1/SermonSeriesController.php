<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
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
 *     name="Sermon Series",
 *     description="Sermon Series Management API"
 * )
 */
class SermonSeriesController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
        
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-sermons');
    }

    public function index(Request $request): JsonResponse
    {
        $query = SermonSeries::withCount('sermons');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        $series = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Sermon series retrieved successfully',
            'data' => $series
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:sermon_series,slug',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
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

            $slug = $request->input('slug') ?: Str::slug($request->input('name'));
            $existingSlug = SermonSeries::where('slug', $slug)->exists();
            
            if ($existingSlug) {
                $slug = $slug . '-' . time();
            }

            $seriesData = [
                'name' => $request->input('name'),
                'slug' => $slug,
                'description' => $request->input('description'),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
            ];

            // Handle file upload if provided
            if ($request->filled('upload_token')) {
                $attachedFile = $this->fileUploadService->attachFileToModel(
                    $request->input('upload_token'),
                    SermonSeries::class,
                    0 // Will be updated after series creation
                );

                if ($attachedFile) {
                    $seriesData['image'] = $attachedFile->path;
                }
            }

            $series = SermonSeries::create($seriesData);

            // Update the file with the actual series ID
            if ($request->filled('upload_token') && $attachedFile ?? null) {
                $attachedFile->model_id = $series->id;
                $attachedFile->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sermon series created successfully',
                'data' => $series
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create sermon series: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $series = SermonSeries::with(['sermons.media'])->find($id);

        if (!$series) {
            return response()->json([
                'success' => false,
                'message' => 'Sermon series not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Sermon series retrieved successfully',
            'data' => $series
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $series = SermonSeries::find($id);

        if (!$series) {
            return response()->json([
                'success' => false,
                'message' => 'Sermon series not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:sermon_series,slug,' . $id,
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
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

            $updateData = $request->only(['name', 'slug', 'description', 'start_date', 'end_date']);

            // Handle file upload if provided
            if ($request->filled('upload_token')) {
                $attachedFile = $this->fileUploadService->attachFileToModel(
                    $request->input('upload_token'),
                    SermonSeries::class,
                    $series->id
                );

                if ($attachedFile) {
                    $updateData['image'] = $attachedFile->path;
                }
            }

            $series->update($updateData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sermon series updated successfully',
                'data' => $series
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update sermon series: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $series = SermonSeries::find($id);

        if (!$series) {
            return response()->json([
                'success' => false,
                'message' => 'Sermon series not found'
            ], 404);
        }

        try {
            $series->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sermon series deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete sermon series: ' . $e->getMessage()
            ], 500);
        }
    }
}

