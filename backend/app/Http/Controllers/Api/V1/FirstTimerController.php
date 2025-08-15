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
            'device_fingerprint' => 'nullable|string|max:255',
            'self_registered' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $today = Carbon::today();

        // Restrict QR code submissions: only one per device/phone per day, and only on event days
        if (!empty($data['self_registered']) && $data['self_registered']) {
            // Check if today is an event day
            $eventToday = Event::whereDate('start_datetime', '<=', $today)
                ->whereDate('end_datetime', '>=', $today)
                ->exists();
            if (!$eventToday) {
                return response()->json(['error' => 'Self-registration is only allowed on event days.'], 403);
            }
            // Check for existing submission today by device or phone
            $existing = FirstTimer::where(function($q) use ($data) {
                    $q->where('primary_mobile_number', $data['primary_mobile_number']);
                    if (!empty($data['device_fingerprint'])) {
                        $q->orWhere('device_fingerprint', $data['device_fingerprint']);
                    }
                })
                ->whereDate('last_submission_date', $today)
                ->first();
            if ($existing) {
                return response()->json(['error' => 'You have already submitted today.'], 429);
            }
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