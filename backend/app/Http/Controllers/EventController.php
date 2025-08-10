<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Group;
use App\Models\Family;
use App\Services\RecurringEventService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    protected $recurringEventService;

    public function __construct(RecurringEventService $recurringEventService)
    {
        $this->recurringEventService = $recurringEventService;
    }

    /**
     * Display a listing of events
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::query();

        // Apply filters
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('group_id')) {
            $query->byGroup($request->group_id);
        }

        if ($request->has('family_id')) {
            $query->byFamily($request->family_id);
        }

        if ($request->has('creator_id')) {
            $query->byCreator($request->creator_id);
        }

        if ($request->has('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('start_date', '<=', $request->date_to);
        }

        // Default to upcoming events if no specific filter
        if (!$request->has('status') && !$request->has('date_from') && !$request->has('date_to')) {
            $query->upcoming();
        }

        $events = $query->with(['groups', 'families', 'creator'])
            ->orderBy('start_date')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    /**
     * Store a newly created event
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date|after:now',
            'end_date' => 'nullable|date|after:start_date',
            'location' => 'nullable|string|max:255',
            'type' => ['required', Rule::in(['group', 'family', 'general'])],
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'nullable|string|in:daily,weekly,monthly,yearly',
            'recurrence_settings' => 'nullable|array',
            'recurrence_end_date' => 'nullable|date|after:start_date',
            'group_ids' => 'nullable|array',
            'group_ids.*' => 'exists:groups,id',
            'family_ids' => 'nullable|array',
            'family_ids.*' => 'exists:families,id',
            'img_path' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $eventData = $request->only([
                'title', 'description', 'start_date', 'end_date', 'location',
                'type', 'is_recurring', 'recurrence_pattern', 'recurrence_settings',
                'recurrence_end_date', 'img_path'
            ]);

            $eventData['created_by'] = auth()->id();
            $eventData['status'] = 'draft';

            $event = Event::create($eventData);

            // Associate with groups
            if ($request->has('group_ids')) {
                $groupData = [];
                foreach ($request->group_ids as $groupId) {
                    $groupData[$groupId] = [
                        'is_required' => $request->input("groups.{$groupId}.is_required", false),
                        'notes' => $request->input("groups.{$groupId}.notes"),
                    ];
                }
                $event->groups()->attach($groupData);
            }

            // Associate with families
            if ($request->has('family_ids')) {
                $familyData = [];
                foreach ($request->family_ids as $familyId) {
                    $familyData[$familyId] = [
                        'is_required' => $request->input("families.{$familyId}.is_required", false),
                        'notes' => $request->input("families.{$familyId}.notes"),
                    ];
                }
                $event->families()->attach($familyData);
            }

            // Create recurring instances if needed
            if ($event->is_recurring && $event->recurrence_pattern) {
                $this->recurringEventService->createRecurringInstances($event);
            }

            DB::commit();

            $event->load(['groups', 'families', 'creator']);

            return response()->json([
                'success' => true,
                'message' => 'Event created successfully',
                'data' => $event
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified event
     */
    public function show(Event $event): JsonResponse
    {
        $event->load(['groups', 'families', 'creator', 'recurringInstances']);

        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    /**
     * Update the specified event
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after:start_date',
            'location' => 'nullable|string|max:255',
            'type' => ['sometimes', 'required', Rule::in(['group', 'family', 'general'])],
            'status' => ['sometimes', 'required', Rule::in(['draft', 'published', 'cancelled', 'completed'])],
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'nullable|string|in:daily,weekly,monthly,yearly',
            'recurrence_settings' => 'nullable|array',
            'recurrence_end_date' => 'nullable|date|after:start_date',
            'group_ids' => 'nullable|array',
            'group_ids.*' => 'exists:groups,id',
            'family_ids' => 'nullable|array',
            'family_ids.*' => 'exists:families,id',
            'img_path' => 'nullable|string',
            'update_future_instances' => 'boolean', // Whether to update recurring instances
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $eventData = $request->only([
                'title', 'description', 'start_date', 'end_date', 'location',
                'type', 'status', 'is_recurring', 'recurrence_pattern', 'recurrence_settings',
                'recurrence_end_date', 'img_path'
            ]);

            $eventData['updated_by'] = auth()->id();

            $event->update($eventData);

            // Update group associations
            if ($request->has('group_ids')) {
                $event->groups()->detach();
                $groupData = [];
                foreach ($request->group_ids as $groupId) {
                    $groupData[$groupId] = [
                        'is_required' => $request->input("groups.{$groupId}.is_required", false),
                        'notes' => $request->input("groups.{$groupId}.notes"),
                    ];
                }
                $event->groups()->attach($groupData);
            }

            // Update family associations
            if ($request->has('family_ids')) {
                $event->families()->detach();
                $familyData = [];
                foreach ($request->family_ids as $familyId) {
                    $familyData[$familyId] = [
                        'is_required' => $request->input("families.{$familyId}.is_required", false),
                        'notes' => $request->input("families.{$familyId}.notes"),
                    ];
                }
                $event->families()->attach($familyData);
            }

            // Update recurring instances if requested
            if ($request->boolean('update_future_instances') && $event->is_recurring) {
                $this->recurringEventService->updateFutureInstances($event, $eventData);
            }

            DB::commit();

            $event->load(['groups', 'families', 'creator']);

            return response()->json([
                'success' => true,
                'message' => 'Event updated successfully',
                'data' => $event
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified event
     */
    public function destroy(Event $event): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Cancel all recurring instances if this is a parent event
            if ($event->is_recurring) {
                $this->recurringEventService->cancelFutureInstances($event, 'Parent event deleted');
            }

            // Soft delete the event
            $event->update(['deleted' => true]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel an event
     */
    public function cancel(Request $request, Event $event): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500',
            'cancel_future_instances' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $reason = $request->input('reason');
            $cancelFutureInstances = $request->boolean('cancel_future_instances');

            // Cancel the current event
            $event->cancel($reason);

            // Cancel future recurring instances if requested
            if ($cancelFutureInstances && $event->is_recurring) {
                $this->recurringEventService->cancelFutureInstances($event, $reason);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Event cancelled successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Publish an event
     */
    public function publish(Event $event): JsonResponse
    {
        try {
            $event->update(['status' => 'published']);

            return response()->json([
                'success' => true,
                'message' => 'Event published successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to publish event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get events for a specific member
     */
    public function getMemberEvents(Request $request, $memberId): JsonResponse
    {
        $query = Event::query();

        // Get events accessible to the member
        $query->where(function ($q) use ($memberId) {
            // Events through groups
            $q->whereHas('groups.members', function ($subQ) use ($memberId) {
                $subQ->where('member_id', $memberId)->where('is_active', true);
            });
        })->orWhere(function ($q) use ($memberId) {
            // Events through families
            $q->whereHas('families.members', function ($subQ) use ($memberId) {
                $subQ->where('member_id', $memberId)->where('is_active', true);
            });
        })->orWhere('type', 'general');

        // Apply additional filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('start_date', '<=', $request->date_to);
        }

        $events = $query->with(['groups', 'families'])
            ->orderBy('start_date')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }
} 