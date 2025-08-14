<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Group;
use App\Models\Family;
use App\Models\User;
use App\Services\FileUploadService;
// Removed: No longer using RecurringEventService
// use App\Services\RecurringEventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    protected $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Display a listing of events
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::query();

        // Always exclude deleted events unless explicitly requested
        if (!$request->boolean('include_deleted')) {
            $query->where('deleted', false);
        }

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

        // Filter for attendance events - only show events from today or in the past
        if ($request->boolean('for_attendance')) {
            $query->attendanceEvents();
        }

        // Add filter to show all events (including those without dates)
        if ($request->has('show_all') && $request->boolean('show_all')) {
            // Don't apply any date restrictions
        } elseif ($request->has('include_no_date') && $request->boolean('include_no_date')) {
            // Include events without dates along with upcoming events
            $query->where(function($q) {
                $q->whereNotNull('start_date')
                  ->where('start_date', '>', now())
                  ->orWhereNull('start_date');
            });
        } elseif (!$request->has('status') && !$request->has('date_from') && !$request->has('date_to')) {
            // Default to upcoming events if no specific filter
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
            'start_date' => 'required_without:is_recurring|nullable|date|after:now',
            'end_date' => 'nullable|date|after:start_date',
            'location' => 'nullable|string|max:255',
            'type' => ['required', Rule::in(['group', 'family', 'general'])],
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'required_if:is_recurring,true|nullable|string|in:daily,weekly,monthly,yearly',
            'recurrence_settings' => 'required_if:is_recurring,true|nullable|array',
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
                'message' => 'Validation failed',
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

            // For recurring events without start_date, we don't set a default
            // The RecurringEventService will handle creating instances from today
            // Only set start_date if it's provided
            if ($request->start_date) {
                $eventData['start_date'] = $request->start_date;
            }

            $eventData['created_by'] = auth()->id();
            $eventData['status'] = 'draft';

            $event = Event::create($eventData);

            // Associate groups if provided
            if ($request->has('group_ids')) {
                $groupData = collect($request->group_ids)->mapWithKeys(function ($groupId) {
                    return [$groupId => ['is_required' => false]];
                })->toArray();
                $event->groups()->attach($groupData);
            }

            // Associate families if provided
            if ($request->has('family_ids')) {
                $familyData = collect($request->family_ids)->mapWithKeys(function ($familyId) {
                    return [$familyId => ['is_required' => false]];
                })->toArray();
                $event->families()->attach($familyData);
            }

            // Create recurring instances if needed
            // Removed: Don't create multiple event instances for recurring events
            // if ($event->is_recurring && $event->recurrence_pattern) {
            //     $this->recurringEventService->createRecurringInstances($event);
            // }

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
        $event->load(['groups', 'families', 'creator']);

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
            'start_date' => 'sometimes|required_without:is_recurring|nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'location' => 'nullable|string|max:255',
            'type' => ['sometimes', 'required', Rule::in(['group', 'family', 'general'])],
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'required_if:is_recurring,true|nullable|string|in:daily,weekly,monthly,yearly',
            'recurrence_settings' => 'required_if:is_recurring,true|nullable|array',
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
                'message' => 'Validation failed',
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

            // For recurring events without start_date, we don't set a default
            // The RecurringEventService will handle creating instances from today
            // Only set start_date if it's provided
            if ($request->start_date) {
                $eventData['start_date'] = $request->start_date;
            }

            $eventData['updated_by'] = auth()->id();

            $event->update($eventData);

            // Update group associations if provided
            if ($request->has('group_ids')) {
                $event->groups()->detach();
                if (!empty($request->group_ids)) {
                    $groupData = collect($request->group_ids)->mapWithKeys(function ($groupId) {
                        return [$groupId => ['is_required' => false]];
                    })->toArray();
                    $event->groups()->attach($groupData);
                }
            }

            // Update family associations if provided
            if ($request->has('family_ids')) {
                $event->families()->detach();
                if (!empty($request->family_ids)) {
                    $familyData = collect($request->family_ids)->mapWithKeys(function ($familyId) {
                        return [$familyId => ['is_required' => false]];
                    })->toArray();
                    $event->families()->attach($familyData);
                }
            }

            // Handle recurring event updates
            // Removed: Don't create multiple event instances for recurring events
            // if ($event->is_recurring && $event->recurrence_pattern) {
            //     // Cancel future instances and regenerate
            //     $this->recurringEventService->cancelFutureInstances($event);
            //     $this->recurringEventService->createRecurringInstances($event);
            // } else {
            //     // Cancel all future instances if no longer recurring
            //     $this->recurringEventService->cancelFutureInstances($event);
            // }

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

            // Cancel all future recurring instances
            // Removed: No longer creating multiple event instances for recurring events
            // if ($event->is_recurring) {
            //     $this->recurringEventService->cancelFutureInstances($event);
            // }

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
     * Cancel the specified event
     */
    public function cancel(Request $request, Event $event): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500',
            'cancel_future_instances' => 'boolean'
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

            $reason = $request->get('reason');
            $cancelFutureInstances = $request->get('cancel_future_instances', false);

            // Cancel future recurring instances if requested
            // Removed: No longer creating multiple event instances for recurring events
            // if ($cancelFutureInstances && $event->is_recurring) {
            //     $this->recurringEventService->cancelFutureInstances($event, $reason);
            // }

            $event->cancel($reason);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Event cancelled successfully',
                'data' => $event
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
     * Publish the specified event
     */
    public function publish(Event $event): JsonResponse
    {
        try {
            if ($event->status === 'published') {
                return response()->json([
                    'success' => false,
                    'message' => 'Event is already published'
                ], 400);
            }

            $event->update([
                'status' => 'published',
                'updated_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event published successfully',
                'data' => $event
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
        try {
            $member = \App\Models\Member::findOrFail($memberId);
            
            $query = Event::query()
                ->where('status', 'published')
                ->where('deleted', false);

            // Get events where member can attend
            $query->where(function ($q) use ($member) {
                // General events
                $q->where('type', 'general');
                
                // Group events where member belongs
                $q->orWhereHas('groups', function ($groupQuery) use ($member) {
                    $groupQuery->whereHas('members', function ($memberQuery) use ($member) {
                        $memberQuery->where('member_id', $member->id)
                                   ->where('is_active', true);
                    });
                });
                
                // Family events where member belongs
                $q->orWhereHas('families', function ($familyQuery) use ($member) {
                    $familyQuery->whereHas('members', function ($memberQuery) use ($member) {
                        $memberQuery->where('member_id', $member->id)
                                   ->where('is_active', true);
                    });
                });
            });

            $events = $query->with(['groups', 'families'])
                ->orderBy('start_date')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $events
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get member events',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get families associated with an event
     */
    public function getEventFamilies(Event $event): JsonResponse
    {
        try {
            $families = $event->families()->with(['familyHead', 'members'])->get();

            return response()->json([
                'success' => true,
                'data' => $families
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get event families',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add families to an event
     */
    public function addFamiliesToEvent(Request $request, Event $event): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'family_ids' => 'required|array',
            'family_ids.*' => 'exists:families,id',
            'is_required' => 'boolean',
            'notes' => 'nullable|string|max:1000'
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

            $familyData = collect($request->family_ids)->mapWithKeys(function ($familyId) use ($request) {
                return [$familyId => [
                    'is_required' => $request->get('is_required', false),
                    'notes' => $request->get('notes')
                ]];
            })->toArray();

            $event->families()->attach($familyData);

            DB::commit();

            $event->load(['families']);

            return response()->json([
                'success' => true,
                'message' => 'Families added to event successfully',
                'data' => $event->families
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add families to event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update family relationship for an event
     */
    public function updateEventFamily(Request $request, Event $event, $familyId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_required' => 'boolean',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $family = \App\Models\Family::findOrFail($familyId);
            
            $event->families()->updateExistingPivot($familyId, [
                'is_required' => $request->get('is_required'),
                'notes' => $request->get('notes')
            ]);

            $updatedFamily = $event->families()->where('family_id', $familyId)->first();

            return response()->json([
                'success' => true,
                'message' => 'Event family relationship updated successfully',
                'data' => $updatedFamily
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event family relationship',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a family from an event
     */
    public function removeFamilyFromEvent(Event $event, $familyId): JsonResponse
    {
        try {
            $family = \App\Models\Family::findOrFail($familyId);
            
            $event->families()->detach($familyId);

            return response()->json([
                'success' => true,
                'message' => 'Family removed from event successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove family from event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get groups associated with an event
     */
    public function getEventGroups(Event $event): JsonResponse
    {
        try {
            $groups = $event->groups()->with(['members'])->get();

            return response()->json([
                'success' => true,
                'data' => $groups
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get event groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add groups to an event
     */
    public function addGroupsToEvent(Request $request, Event $event): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'group_ids' => 'required|array',
            'group_ids.*' => 'exists:groups,id',
            'is_required' => 'boolean',
            'notes' => 'nullable|string|max:1000'
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

            $groupData = collect($request->group_ids)->mapWithKeys(function ($groupId) use ($request) {
                return [$groupId => [
                    'is_required' => $request->get('is_required', false),
                    'notes' => $request->get('notes')
                ]];
            })->toArray();

            $event->groups()->attach($groupData);

            DB::commit();

            $event->load(['groups']);

            return response()->json([
                'success' => true,
                'message' => 'Groups added to event successfully',
                'data' => $event->groups
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add groups to event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update group relationship for an event
     */
    public function updateEventGroup(Request $request, Event $event, $groupId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_required' => 'boolean',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $group = \App\Models\Group::findOrFail($groupId);
            
            $event->groups()->updateExistingPivot($groupId, [
                'is_required' => $request->get('is_required'),
                'notes' => $request->get('notes')
            ]);

            $updatedGroup = $event->groups()->where('group_id', $groupId)->first();

            return response()->json([
                'success' => true,
                'message' => 'Event group relationship updated successfully',
                'data' => $updatedGroup
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update event group relationship',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a group from an event
     */
    public function removeGroupFromEvent(Event $event, $groupId): JsonResponse
    {
        try {
            $group = \App\Models\Group::findOrFail($groupId);
            
            $event->groups()->detach($groupId);

            return response()->json([
                'success' => true,
                'message' => 'Group removed from event successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove group from event',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 