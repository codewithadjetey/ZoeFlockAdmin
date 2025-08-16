<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FirstTimer;
use App\Models\Event;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class FirstTimerController extends Controller
{
    /**
     * Store a new first timer or update visit count if already exists.
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