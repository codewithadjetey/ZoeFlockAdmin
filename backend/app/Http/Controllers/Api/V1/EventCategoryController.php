<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use App\Models\Event;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * @OA\Tag(
 *     name="Event Categories",
 *     description="API Endpoints for event category management"
 * )
 */
class EventCategoryController extends Controller
{
    protected $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
        
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-event-categories');
        
        // Apply specific permissions to methods
        $this->middleware('permission:create-event-categories')->only(['store']);
        $this->middleware('permission:edit-event-categories')->only(['update']);
        $this->middleware('permission:delete-event-categories')->only(['destroy']);
        $this->middleware('permission:view-category-events')->only(['getCategoryEvents']);
        $this->middleware('permission:generate-category-events')->only(['generateEvents']);
        $this->middleware('permission:generate-one-time-event')->only(['generateOneTimeEvent']);
        $this->middleware('permission:toggle-category-status')->only(['toggleStatus']);
        $this->middleware('permission:view-category-statistics')->only(['getStatistics']);
    }

    /**
     * Display a listing of event categories
     * 
     * @OA\Get(
     *     path="/api/v1/event-categories",
     *     summary="Get all event categories",
     *     tags={"Event Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="is_active",
     *         in="query",
     *         description="Filter by active status",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Parameter(
     *         name="is_recurring",
     *         in="query",
     *         description="Filter by recurring status",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Parameter(
     *         name="attendance_type",
     *         in="query",
     *         description="Filter by attendance type",
     *         required=false,
     *         @OA\Schema(type="string", enum={"individual","general","none"})
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by name or description",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of records per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event categories retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="data", type="array", @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Sunday Service"),
     *                     @OA\Property(property="description", type="string", example="Weekly worship service"),
     *                     @OA\Property(property="color", type="string", example="#FF5733"),
     *                     @OA\Property(property="icon", type="string", example="church"),
     *                     @OA\Property(property="attendance_type", type="string", example="individual"),
     *                     @OA\Property(property="is_active", type="boolean", example=true),
     *                     @OA\Property(property="is_recurring", type="boolean", example=true),
     *                     @OA\Property(property="recurrence_pattern", type="string", example="weekly"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time")
     *                 )),
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=1),
     *                 @OA\Property(property="per_page", type="integer", example=15),
     *                 @OA\Property(property="total", type="integer", example=1)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = EventCategory::query();

        // Apply filters
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('is_recurring')) {
            $query->where('is_recurring', $request->boolean('is_recurring'));
        }

        if ($request->has('attendance_type')) {
            $query->where('attendance_type', $request->attendance_type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Default to active categories
        if (!$request->has('is_active')) {
            $query->active();
        }

        $categories = $query->with(['creator', 'updater'])
            ->orderBy('name')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Store a newly created event category
     * 
     * @OA\Post(
     *     path="/api/v1/event-categories",
     *     summary="Create a new event category",
     *     tags={"Event Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","attendance_type"},
     *             @OA\Property(property="name", type="string", example="Sunday Service", description="Category name"),
     *             @OA\Property(property="description", type="string", example="Weekly worship service", description="Category description"),
     *             @OA\Property(property="color", type="string", example="#FF5733", description="Category color"),
     *             @OA\Property(property="icon", type="string", example="church", description="Category icon"),
     *             @OA\Property(property="attendance_type", type="string", enum={"individual","general","none"}, example="individual", description="Type of attendance tracking"),
     *             @OA\Property(property="is_active", type="boolean", example=true, description="Is category active"),
     *             @OA\Property(property="is_recurring", type="boolean", example=true, description="Is category recurring"),
     *             @OA\Property(property="recurrence_pattern", type="string", enum={"daily","weekly","monthly","yearly"}, example="weekly", description="Recurrence pattern"),
     *             @OA\Property(property="recurrence_settings", type="object", description="Recurrence settings"),
     *             @OA\Property(property="default_start_time", type="string", example="10:00:00", description="Default start time"),
     *             @OA\Property(property="default_duration", type="integer", example=120, description="Default duration in minutes"),
     *             @OA\Property(property="start_date_time", type="string", example="2024-01-01 10:00:00", description="Start date time for one-time events"),
     *             @OA\Property(property="end_date_time", type="string", example="2024-01-01 12:00:00", description="End date time for one-time events"),
     *             @OA\Property(property="recurrence_start_date", type="string", example="2024-01-01", description="Recurrence start date"),
     *             @OA\Property(property="recurrence_end_date", type="string", example="2024-12-31", description="Recurrence end date"),
     *             @OA\Property(property="default_location", type="string", example="Main Hall", description="Default location"),
     *             @OA\Property(property="default_description", type="string", example="Default event description", description="Default event description")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Event category created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Event category created successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Sunday Service"),
     *                 @OA\Property(property="description", type="string", example="Weekly worship service"),
     *                 @OA\Property(property="color", type="string", example="#FF5733"),
     *                 @OA\Property(property="icon", type="string", example="church"),
     *                 @OA\Property(property="attendance_type", type="string", example="individual"),
     *                 @OA\Property(property="is_active", type="boolean", example=true),
     *                 @OA\Property(property="is_recurring", type="boolean", example=true),
     *                 @OA\Property(property="recurrence_pattern", type="string", example="weekly"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to create event category"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
            'attendance_type' => 'required|in:individual,general,none',
            'is_active' => 'boolean',
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'required_if:is_recurring,true|nullable|in:daily,weekly,monthly,yearly',
            'recurrence_settings' => 'required_if:is_recurring,true|nullable|array',
            'default_start_time' => 'required_if:is_recurring,true|nullable|date_format:H:i:s',
            'default_duration' => 'required_if:is_recurring,true|nullable|integer|min:1',
            'start_date_time' => 'required_if:is_recurring,false|nullable|date_format:Y-m-d H:i:s',
            'end_date_time' => 'required_if:is_recurring,false|nullable|date_format:Y-m-d H:i:s',
            'recurrence_start_date' => 'required_if:is_recurring,true|nullable|date|after_or_equal:today',
            'recurrence_end_date' => 'nullable|date|after:recurrence_start_date',
            'default_location' => 'nullable|string|max:255',
            'default_description' => 'nullable|string',
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

            $categoryData = $request->only([
                'name', 'description', 'color', 'icon', 'attendance_type',
                'is_active', 'is_recurring', 'recurrence_pattern', 'recurrence_settings',
                'default_start_time', 'start_date_time', 'end_date_time', 'recurrence_start_date', 
                'recurrence_end_date', 'default_duration', 'default_location', 'default_description'
            ]);

            $categoryData['created_by'] = auth()->id();
            $categoryData['is_active'] = $request->boolean('is_active', true);
            $categoryData['is_recurring'] = $request->boolean('is_recurring', false);

            $category = EventCategory::create($categoryData);

            DB::commit();

            $category->load(['creator']);

            return response()->json([
                'success' => true,
                'message' => 'Event category created successfully',
                'data' => $category
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create event category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified event category
     * 
     * @OA\Get(
     *     path="/api/v1/event-categories/{category}",
     *     summary="Get a specific event category",
     *     tags={"Event Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="Event category ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event category retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Sunday Service"),
     *                 @OA\Property(property="description", type="string", example="Weekly worship service"),
     *                 @OA\Property(property="color", type="string", example="#FF5733"),
     *                 @OA\Property(property="icon", type="string", example="church"),
     *                 @OA\Property(property="attendance_type", type="string", example="individual"),
     *                 @OA\Property(property="is_active", type="boolean", example=true),
     *                 @OA\Property(property="is_recurring", type="boolean", example=true),
     *                 @OA\Property(property="recurrence_pattern", type="string", example="weekly"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event category not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Event category not found")
     *         )
     *     )
     * )
     */
    public function show(EventCategory $category): JsonResponse
    {
        $category->load(['creator', 'updater']);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Update the specified event category
     * 
     * @OA\Put(
     *     path="/api/v1/event-categories/{category}",
     *     summary="Update an event category",
     *     tags={"Event Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="Event category ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","attendance_type"},
     *             @OA\Property(property="name", type="string", example="Sunday Service", description="Category name"),
     *             @OA\Property(property="description", type="string", example="Weekly worship service", description="Category description"),
     *             @OA\Property(property="color", type="string", example="#FF5733", description="Category color"),
     *             @OA\Property(property="icon", type="string", example="church", description="Category icon"),
     *             @OA\Property(property="attendance_type", type="string", enum={"individual","general","none"}, example="individual", description="Type of attendance tracking"),
     *             @OA\Property(property="is_active", type="boolean", example=true, description="Is category active"),
     *             @OA\Property(property="is_recurring", type="boolean", example=true, description="Is category recurring"),
     *             @OA\Property(property="recurrence_pattern", type="string", enum={"daily","weekly","monthly","yearly"}, example="weekly", description="Recurrence pattern"),
     *             @OA\Property(property="recurrence_settings", type="object", description="Recurrence settings"),
     *             @OA\Property(property="default_start_time", type="string", example="10:00:00", description="Default start time"),
     *             @OA\Property(property="default_duration", type="integer", example=120, description="Default duration in minutes"),
     *             @OA\Property(property="start_date_time", type="string", example="2024-01-01 10:00:00", description="Start date time for one-time events"),
     *             @OA\Property(property="end_date_time", type="string", example="2024-01-01 12:00:00", description="End date time for one-time events"),
     *             @OA\Property(property="recurrence_start_date", type="string", example="2024-01-01", description="Recurrence start date"),
     *             @OA\Property(property="recurrence_end_date", type="string", example="2024-12-31", description="Recurrence end date"),
     *             @OA\Property(property="default_location", type="string", example="Main Hall", description="Default location"),
     *             @OA\Property(property="default_description", type="string", example="Default event description", description="Default event description")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event category updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Event category updated successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Sunday Service"),
     *                 @OA\Property(property="description", type="string", example="Weekly worship service"),
     *                 @OA\Property(property="color", type="string", example="#FF5733"),
     *                 @OA\Property(property="icon", type="string", example="church"),
     *                 @OA\Property(property="attendance_type", type="string", example="individual"),
     *                 @OA\Property(property="is_active", type="boolean", example=true),
     *                 @OA\Property(property="is_recurring", type="boolean", example=true),
     *                 @OA\Property(property="recurrence_pattern", type="string", example="weekly"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event category not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Event category not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to update event category"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function update(Request $request, EventCategory $category): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
            'attendance_type' => 'required|in:individual,general,none',
            'is_active' => 'boolean',
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'required_if:is_recurring,true|nullable|in:daily,weekly,monthly,yearly',
            'recurrence_settings' => 'required_if:is_recurring,true|nullable|array',
            'default_start_time' => 'required_if:is_recurring,true|nullable|date_format:H:i:s',
            'default_duration' => 'required_if:is_recurring,true|nullable|integer|min:1',
            'start_date_time' => 'required_if:is_recurring,false|nullable|date_format:Y-m-d H:i:s',
            'end_date_time' => 'required_if:is_recurring,false|nullable|date_format:Y-m-d H:i:s',
            'recurrence_start_date' => 'required_if:is_recurring,true|nullable|date|after_or_equal:today',
            'recurrence_end_date' => 'nullable|date|after:recurrence_start_date',
            'default_location' => 'nullable|string|max:255',
            'default_description' => 'nullable|string',
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

            $categoryData = $request->only([
                'name', 'description', 'color', 'icon', 'attendance_type',
                'is_active', 'is_recurring', 'recurrence_pattern', 'recurrence_settings',
                'default_start_time', 'start_date_time', 'end_date_time', 'recurrence_start_date', 
                'recurrence_end_date', 'default_duration', 'default_location', 'default_description'
            ]);

            $categoryData['updated_by'] = auth()->id();

            $category->update($categoryData);

            DB::commit();

            $category->load(['creator', 'updater']);

            return response()->json([
                'success' => true,
                'message' => 'Event category updated successfully',
                'data' => $category
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified event category
     * 
     * @OA\Delete(
     *     path="/api/v1/event-categories/{category}",
     *     summary="Delete an event category",
     *     tags={"Event Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="Event category ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Event category deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Event category deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event category not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Event category not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Cannot delete category with events",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Cannot delete category with existing events. Please delete or reassign events first.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to delete event category"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function destroy(EventCategory $category): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Check if category has events
            if ($category->events()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with existing events. Please delete or reassign events first.'
                ], 422);
            }

            // Soft delete the category
            $category->softDelete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Event category deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all events for a specific category
     * 
     * @OA\Get(
     *     path="/api/v1/event-categories/{category}/events",
     *     summary="Get events for a specific category",
     *     tags={"Event Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="Event category ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by event status",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="date_from",
     *         in="query",
     *         description="Filter by start date from",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="date_to",
     *         in="query",
     *         description="Filter by start date to",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of records per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Category events retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="category", type="object"),
     *                 @OA\Property(property="events", type="object",
     *                     @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *                     @OA\Property(property="current_page", type="integer", example=1),
     *                     @OA\Property(property="last_page", type="integer", example=1),
     *                     @OA\Property(property="per_page", type="integer", example=15),
     *                     @OA\Property(property="total", type="integer", example=1)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event category not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Event category not found")
     *         )
     *     )
     * )
     */
    public function getCategoryEvents(Request $request, EventCategory $category): JsonResponse
    {
        $query = $category->events();

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('start_date', '<=', $request->date_to);
        }

        // Default to upcoming events if no specific filter
        if (!$request->has('status') && !$request->has('date_from') && !$request->has('date_to')) {
            $query->whereNotNull('start_date')
                  ->where('start_date', '>', now())
                  ->where('status', '!=', 'cancelled')
                  ->where('deleted', false);
        }

        $events = $query->with(['groups', 'families', 'creator'])
            ->orderBy('start_date')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => [
                'category' => $category->load(['creator']),
                'events' => $events
            ]
        ]);
    }

    /**
     * Generate events for a category based on recurrence settings
     * 
     * @OA\Post(
     *     path="/api/v1/event-categories/{category}/generate-events",
     *     summary="Generate recurring events for a category",
     *     tags={"Event Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="Event category ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="from_date", type="string", example="2024-01-01", description="Start date for generation"),
     *             @OA\Property(property="count", type="integer", example=10, description="Number of events to generate"),
     *             @OA\Property(property="auto_publish", type="boolean", example=false, description="Auto publish generated events")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Events generated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="10 events generated successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="category", type="object"),
     *                 @OA\Property(property="generated_count", type="integer", example=10),
     *                 @OA\Property(property="events", type="array", @OA\Items(type="object"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event category not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Event category not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error or category not configured for recurring events",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="This category is not configured for recurring events")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to generate events"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function generateEvents(Request $request, EventCategory $category): JsonResponse
    {
        if (!$category->is_recurring) {
            return response()->json([
                'success' => false,
                'message' => 'This category is not configured for recurring events'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'from_date' => 'nullable|date',
            'count' => 'nullable|integer|min:1|max:50',
            'auto_publish' => 'boolean'
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

            $fromDate = $request->has('from_date') ? Carbon::parse($request->from_date) : now();
            $count = $request->get('count', 10);
            $autoPublish = $request->boolean('auto_publish', false);

            // Generate event data
            $eventsData = $category->generateEvents($fromDate, $count);

            if (empty($eventsData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No events could be generated with current settings'
                ], 422);
            }

            $generatedEvents = [];
            foreach ($eventsData as $eventData) {
                if ($autoPublish) {
                    $eventData['status'] = 'published';
                }
                
                $event = Event::create($eventData);
                $generatedEvents[] = $event;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($generatedEvents) . ' events generated successfully',
                'data' => [
                    'category' => $category,
                    'generated_count' => count($generatedEvents),
                    'events' => $generatedEvents
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate events',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate a single one-time event for a category
     * 
     * @OA\Post(
     *     path="/api/v1/event-categories/{category}/generate-one-time-event",
     *     summary="Generate a one-time event for a category",
     *     tags={"Event Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="Event category ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="auto_publish", type="boolean", example=false, description="Auto publish generated event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="One-time event generated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="One-time event generated successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="category", type="object"),
     *                 @OA\Property(property="event", type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event category not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Event category not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error or category not suitable for one-time events",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="This category is configured for recurring events. Use generateEvents instead.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to generate one-time event"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function generateOneTimeEvent(Request $request, EventCategory $category): JsonResponse
    {
        if ($category->is_recurring) {
            return response()->json([
                'success' => false,
                'message' => 'This category is configured for recurring events. Use generateEvents instead.'
            ], 422);
        }

        // Check if start_date_time and end_date_time are configured
        if (!$category->start_date_time || !$category->end_date_time) {
            return response()->json([
                'success' => false,
                'message' => 'This category does not have start and end date/time configured. Please configure the event schedule first.'
            ], 422);
        }

        // Check if an event already exists for this one-time category
        if ($category->events()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'An event already exists for this one-time category. One-time categories can only generate one event.'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'auto_publish' => 'boolean'
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

            $autoPublish = $request->boolean('auto_publish', false);

            // Generate one-time event data
            $eventData = $category->generateOneTimeEvent();

            if (empty($eventData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No event could be generated with current settings'
                ], 422);
            }

            if ($autoPublish) {
                $eventData['status'] = 'published';
            }
            
            $event = Event::create($eventData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'One-time event generated successfully',
                'data' => [
                    'category' => $category,
                    'event' => $event
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate one-time event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle category active status
     * 
     * @OA\Post(
     *     path="/api/v1/event-categories/{category}/toggle-status",
     *     summary="Toggle category active status",
     *     tags={"Event Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="Event category ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Category status updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Category status updated successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event category not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Event category not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to update category status"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function toggleStatus(EventCategory $category): JsonResponse
    {
        try {
            $category->update([
                'is_active' => !$category->is_active,
                'updated_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Category status updated successfully',
                'data' => $category
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update category status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category statistics
     * 
     * @OA\Get(
     *     path="/api/v1/event-categories/{category}/statistics",
     *     summary="Get category statistics",
     *     tags={"Event Categories"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="category",
     *         in="path",
     *         description="Event category ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Category statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="total_events", type="integer", example=50),
     *                 @OA\Property(property="published_events", type="integer", example=30),
     *                 @OA\Property(property="draft_events", type="integer", example=15),
     *                 @OA\Property(property="cancelled_events", type="integer", example=5),
     *                 @OA\Property(property="upcoming_events", type="integer", example=10),
     *                 @OA\Property(property="past_events", type="integer", example=40),
     *                 @OA\Property(property="attendance_type", type="string", example="individual"),
     *                 @OA\Property(property="is_recurring", type="boolean", example=true),
     *                 @OA\Property(property="recurrence_pattern", type="string", example="weekly")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event category not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Event category not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to get category statistics"),
     *             @OA\Property(property="error", type="string")
     *         )
     *     )
     * )
     */
    public function getStatistics(EventCategory $category): JsonResponse
    {
        try {
            $stats = [
                'total_events' => $category->events()->count(),
                'published_events' => $category->events()->where('status', 'published')->count(),
                'draft_events' => $category->events()->where('status', 'draft')->count(),
                'cancelled_events' => $category->events()->where('status', 'cancelled')->count(),
                'upcoming_events' => $category->upcomingEvents()->count(),
                'past_events' => $category->pastEvents()->count(),
                'attendance_type' => $category->attendance_type,
                'is_recurring' => $category->is_recurring,
                'recurrence_pattern' => $category->recurrence_pattern,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get category statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
