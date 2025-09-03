<?php

namespace App\Http\Controllers\Api\V1\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\FirstTimer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Frontend First Timers",
 *     description="Public API Endpoints for first timer registration (no authentication required)"
 * )
 */
class FirstTimerController extends Controller
{
    /**
     * Get today's event based on category id and today's date
     * 
     * @OA\Get(
     *     path="/api/v1/frontend/event-category/{categoryId}/today",
     *     summary="Get today's event for a specific category",
     *     tags={"Frontend First Timers"},
     *     @OA\Parameter(
     *         name="categoryId",
     *         in="path",
     *         description="Event category ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Today's event retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="category_id", type="integer", example=1),
     *                 @OA\Property(property="title", type="string", example="Sunday Service"),
     *                 @OA\Property(property="description", type="string", example="Weekly Sunday worship service"),
     *                 @OA\Property(property="start_date", type="string", format="date-time"),
     *                 @OA\Property(property="end_date", type="string", format="date-time"),
     *                 @OA\Property(property="start_time", type="string", example="10:00:00"),
     *                 @OA\Property(property="end_time", type="string", example="12:00:00"),
     *                 @OA\Property(property="location", type="string", example="Main Auditorium"),
     *                 @OA\Property(property="is_active", type="boolean", example=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event category or event not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Event category not found.")
     *         )
     *     )
     * )
     */
    public function getTodayEvent($categoryId)
    {
        $eventCategory = EventCategory::find($categoryId);
        if(!$eventCategory) {
            return response()->json(['success' => false, 'message' => 'Event category not found.'], 404);
        }
        
        $today = Carbon::today();
        $eventToday = Event::whereDate('start_date', '<=', $today)
        ->whereDate('end_date', '>=', $today)
        ->first();

        if(!$eventToday) {
            return response()->json(['success' => false, 'message' => 'No event found for today.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $eventToday
        ]);
    }

    /**
     * Create first timer guest registration
     * 
     * @OA\Post(
     *     path="/api/v1/frontend/first-timer",
     *     summary="Register a first timer guest",
     *     tags={"Frontend First Timers"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "primary_mobile_number", "event_id"},
     *             @OA\Property(property="name", type="string", example="John Doe", description="Full name of the first timer"),
     *             @OA\Property(property="location", type="string", example="New York", description="Location/address"),
     *             @OA\Property(property="primary_mobile_number", type="string", example="+1234567890", description="Primary mobile number"),
     *             @OA\Property(property="secondary_mobile_number", type="string", example="+1234567891", description="Secondary mobile number"),
     *             @OA\Property(property="how_was_service", type="string", example="Amazing experience", description="Feedback about the service"),
     *             @OA\Property(property="is_first_time", type="boolean", example=true, description="Whether this is their first time"),
     *             @OA\Property(property="has_permanent_place_of_worship", type="boolean", example=false, description="Whether they have a permanent place of worship"),
     *             @OA\Property(property="invited_by", type="string", example="Jane Smith", description="Name of person who invited them"),
     *             @OA\Property(property="invited_by_member_id", type="integer", example=1, description="ID of member who invited them"),
     *             @OA\Property(property="would_like_to_stay", type="boolean", example=true, description="Whether they would like to stay"),
     *             @OA\Property(property="device_fingerprint", type="string", example="abc123", description="Device fingerprint for rate limiting"),
     *             @OA\Property(property="self_registered", type="boolean", example=true, description="Whether they self-registered"),
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID they are registering for")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="First timer registered successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="First timer registered"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="location", type="string", example="New York"),
     *                 @OA\Property(property="primary_mobile_number", type="string", example="+1234567890"),
     *                 @OA\Property(property="secondary_mobile_number", type="string", example="+1234567891"),
     *                 @OA\Property(property="how_was_service", type="string", example="Amazing experience"),
     *                 @OA\Property(property="is_first_time", type="boolean", example=true),
     *                 @OA\Property(property="has_permanent_place_of_worship", type="boolean", example=false),
     *                 @OA\Property(property="invited_by", type="string", example="Jane Smith"),
     *                 @OA\Property(property="invited_by_member_id", type="integer", example=1),
     *                 @OA\Property(property="would_like_to_stay", type="boolean", example=true),
     *                 @OA\Property(property="device_fingerprint", type="string", example="abc123"),
     *                 @OA\Property(property="self_registered", type="boolean", example=true),
     *                 @OA\Property(property="event_id", type="integer", example=1),
     *                 @OA\Property(property="visit_count", type="integer", example=1),
     *                 @OA\Property(property="status", type="string", example="first_timer"),
     *                 @OA\Property(property="last_submission_date", type="string", format="date"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Visit updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Visit updated"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Self-registration not allowed",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Self-registration is only allowed on event days.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=429,
     *         description="Rate limit exceeded or already registered",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="You have reached the maximum number of submissions for today.")
     *         )
     *     )
     * )
     */
    public function createFirstTimerGuest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'primary_mobile_number' => 'required|string|max:20',
            'secondary_mobile_number' => 'nullable|string|max:20',
            'how_was_service' => 'nullable|string',
            'is_first_time' => 'nullable|boolean',
            'has_permanent_place_of_worship' => 'nullable|boolean',
            'invited_by' => 'nullable|string|max:255',
            'invited_by_member_id' => 'nullable|exists:members,id',
            'would_like_to_stay' => 'nullable|boolean',
            'device_fingerprint' => 'nullable|string|max:255', [
                'device_fingerprint.required' => 'We could not verify your device.',
            ],
            'self_registered' => 'nullable|boolean',
            'event_id' => 'required|exists:events,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $today = Carbon::today();

        $event = Event::where("id", $request->event_id)->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->first();
        if (!$event) {
            return response()->json(['error' => 'Self-registration is only allowed on event days.'], 403);
        }
        // Check for existing submission today by device or phone
        $totalSubmissionsToday = FirstTimer::where(function($q) use ($data) {
                $q->where('device_fingerprint', $data['device_fingerprint']);
            })
            ->whereDate('last_submission_date', $today)
            ->count();

        if ($totalSubmissionsToday >= env('MAX_FIRST_TIMER_SUBMISSIONS_PER_DAY')) {
            return response()->json(['message' => 'You have reached the maximum number of submissions for today.'], 429);
        }

        //aside rate limiter make sure the phone number is not already registered for that event
        $alreadyRegistered = FirstTimer::where('primary_mobile_number', $data['primary_mobile_number'])->where('event_id', $data['event_id'])->first();
        if ($alreadyRegistered) {
            return response()->json(['message' => 'You have already registered for this event.'], 429);
        }

        // Check if primary_mobile_number already exists
        $firstTimer = FirstTimer::where('primary_mobile_number', $data['primary_mobile_number'])->first();
        if ($firstTimer) {
            // Update visit count and status
            $firstTimer->visit_count += 1;
            if ($firstTimer->visit_count == 2) {
                $firstTimer->status = 'visitor';
            } elseif ($firstTimer->visit_count == 3) {
                $firstTimer->status = 'potential_member';
                // TODO: Trigger admin notification here
            }
            $firstTimer->last_submission_date = $today;
            $firstTimer->fill($data);
            $firstTimer->save();
            return response()->json(['message' => 'Visit updated', 'data' => $firstTimer], 200);
        } else {
            // Create new record
            $data['visit_count'] = 1;
            $data['status'] = 'first_timer';
            $data['last_submission_date'] = $today;
            $firstTimer = FirstTimer::create($data);
            return response()->json(['message' => 'First timer registered', 'data' => $firstTimer], 201);
        }
    }

}
