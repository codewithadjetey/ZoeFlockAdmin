<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FirstTimer;
use App\Models\Event;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="First Timers",
 *     description="API Endpoints for first timer management"
 * )
 */
class FirstTimerController extends Controller
{
    /**
     * Store a new first timer or update visit count if already exists.
     * 
     * @OA\Post(
     *     path="/api/v1/first-timers",
     *     summary="Create a new first timer or update visit count",
     *     tags={"First Timers"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","primary_mobile_number","event_id"},
     *             @OA\Property(property="name", type="string", example="John Doe", description="First timer's full name"),
     *             @OA\Property(property="location", type="string", example="New York", description="Location"),
     *             @OA\Property(property="primary_mobile_number", type="string", example="+1234567890", description="Primary mobile number"),
     *             @OA\Property(property="secondary_mobile_number", type="string", example="+0987654321", description="Secondary mobile number"),
     *             @OA\Property(property="how_was_service", type="string", example="Great experience", description="Feedback about the service"),
     *             @OA\Property(property="is_first_time", type="boolean", example=true, description="Is this their first time"),
     *             @OA\Property(property="has_permanent_place_of_worship", type="boolean", example=false, description="Do they have a permanent place of worship"),
     *             @OA\Property(property="invited_by", type="string", example="Jane Smith", description="Who invited them"),
     *             @OA\Property(property="invited_by_member_id", type="integer", example=1, description="Member ID who invited them"),
     *             @OA\Property(property="would_like_to_stay", type="boolean", example=true, description="Would they like to stay"),
     *             @OA\Property(property="self_registered", type="boolean", example=false, description="Did they register themselves"),
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID")
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
     *                 @OA\Property(property="primary_mobile_number", type="string", example="+1234567890"),
     *                 @OA\Property(property="visit_count", type="integer", example=1),
     *                 @OA\Property(property="status", type="string", example="first_timer"),
     *                 @OA\Property(property="event_id", type="integer", example=1),
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
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=429,
     *         description="Already registered for this event",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="First Timer already registered for this event.")
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
    public function store(Request $request)
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
            'self_registered' => 'nullable|boolean',
            'event_id' => 'required|exists:events,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $today = Carbon::today();

     

        $alreadyRegistered = FirstTimer::where('primary_mobile_number', $data['primary_mobile_number'])->where('event_id', $data['event_id'])->first();
        if ($alreadyRegistered) {
            return response()->json(['message' => 'First Timer already registered for this event.'], 429);
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

    /**
     * Display a paginated listing of the first timers with filters.
     * 
     * @OA\Get(
     *     path="/api/v1/first-timers",
     *     summary="Get all first timers with filters",
     *     tags={"First Timers"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="event_id",
     *         in="query",
     *         description="Filter by event ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="date",
     *         in="query",
     *         description="Filter by date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by name or phone number",
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
     *         description="First timers retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="data", type="array", @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="John Doe"),
     *                     @OA\Property(property="primary_mobile_number", type="string", example="+1234567890"),
     *                     @OA\Property(property="visit_count", type="integer", example=1),
     *                     @OA\Property(property="status", type="string", example="first_timer"),
     *                     @OA\Property(property="event_id", type="integer", example=1),
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
    public function index(Request $request)
    {
        $query = FirstTimer::query();

        // Filter by event_id
        if ($request->has('event_id')) {
            $query->where('event_id', $request->event_id);
        }
        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }
        // Search by name or phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('primary_mobile_number', 'like', "%{$search}%");
            });
        }
        // Pagination
        $perPage = $request->get('per_page', 15);
        $firstTimers = $query->paginate($perPage);
        return response()->json(['success' => true, 'data' => $firstTimers]);
    }

    /**
     * Display the specified first timer.
     * 
     * @OA\Get(
     *     path="/api/v1/first-timers/{id}",
     *     summary="Get a specific first timer",
     *     tags={"First Timers"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="First timer ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="First timer retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="primary_mobile_number", type="string", example="+1234567890"),
     *                 @OA\Property(property="visit_count", type="integer", example=1),
     *                 @OA\Property(property="status", type="string", example="first_timer"),
     *                 @OA\Property(property="event_id", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="First timer not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="First timer not found.")
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
    public function show($id)
    {
        $firstTimer = FirstTimer::find($id);
        if (!$firstTimer) {
            return response()->json(['success' => false, 'message' => 'First timer not found.'], 404);
        }
        return response()->json(['success' => true, 'data' => $firstTimer]);
    }

    /**
     * Update the specified first timer.
     * 
     * @OA\Put(
     *     path="/api/v1/first-timers/{id}",
     *     summary="Update a first timer",
     *     tags={"First Timers"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="First timer ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="John Doe", description="First timer's full name"),
     *             @OA\Property(property="location", type="string", example="New York", description="Location"),
     *             @OA\Property(property="primary_mobile_number", type="string", example="+1234567890", description="Primary mobile number"),
     *             @OA\Property(property="secondary_mobile_number", type="string", example="+0987654321", description="Secondary mobile number"),
     *             @OA\Property(property="how_was_service", type="string", example="Great experience", description="Feedback about the service"),
     *             @OA\Property(property="is_first_time", type="boolean", example=true, description="Is this their first time"),
     *             @OA\Property(property="has_permanent_place_of_worship", type="boolean", example=false, description="Do they have a permanent place of worship"),
     *             @OA\Property(property="invited_by", type="string", example="Jane Smith", description="Who invited them"),
     *             @OA\Property(property="invited_by_member_id", type="integer", example=1, description="Member ID who invited them"),
     *             @OA\Property(property="would_like_to_stay", type="boolean", example=true, description="Would they like to stay"),
     *             @OA\Property(property="self_registered", type="boolean", example=false, description="Did they register themselves"),
     *             @OA\Property(property="event_id", type="integer", example=1, description="Event ID")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="First timer updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="primary_mobile_number", type="string", example="+1234567890"),
     *                 @OA\Property(property="visit_count", type="integer", example=1),
     *                 @OA\Property(property="status", type="string", example="first_timer"),
     *                 @OA\Property(property="event_id", type="integer", example=1),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="First timer not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="First timer not found.")
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
    public function update(Request $request, $id)
    {
        $firstTimer = FirstTimer::find($id);
        if (!$firstTimer) {
            return response()->json(['success' => false, 'message' => 'First timer not found.'], 404);
        }
        $firstTimer->update($request->all());
        return response()->json(['success' => true, 'data' => $firstTimer]);
    }

    /**
     * Remove the specified first timer.
     * 
     * @OA\Delete(
     *     path="/api/v1/first-timers/{id}",
     *     summary="Delete a first timer",
     *     tags={"First Timers"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="First timer ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="First timer deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="First timer deleted.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="First timer not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="First timer not found.")
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
    public function destroy($id)
    {
        $firstTimer = FirstTimer::find($id);
        if (!$firstTimer) {
            return response()->json(['success' => false, 'message' => 'First timer not found.'], 404);
        }
        $firstTimer->delete();
        return response()->json(['success' => true, 'message' => 'First timer deleted.']);
    }
}