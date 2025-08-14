<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EventCategory;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class EventCategoryController extends Controller
{
    /**
     * Display a listing of event categories
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
