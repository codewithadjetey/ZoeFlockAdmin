<?php

namespace App\Http\Controllers\Api\V1\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\FirstTimer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FirstTimerController extends Controller
{
    //get today's event based on category id and today's date
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
