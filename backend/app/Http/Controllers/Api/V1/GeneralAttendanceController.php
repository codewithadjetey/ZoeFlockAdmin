<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\GeneralAttendance;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GeneralAttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * Get general attendance for a specific event
     */
    public function getEventGeneralAttendance(int $eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);
            
            // Check if user is a Family Head and restrict to their family
            $user = auth()->user();
            $generalAttendanceQuery = GeneralAttendance::where('event_id', $eventId);
            
            if ($user && $user->hasRole('family-head')) {
                $member = \App\Models\Member::where('user_id', $user->id)->first();
                if ($member && $member->family) {
                    // Family Head only sees their family's general attendance
                    $generalAttendanceQuery->where('family_id', $member->family->id);
                    // Return single record for Family Heads
                    $generalAttendance = $generalAttendanceQuery->first();
                    
                    // Debug: Log the actual query and result
                    \Log::info('Family Head query', [
                        'user_id' => $user->id,
                        'family_id' => $member->family->id,
                        'sql' => $generalAttendanceQuery->toSql(),
                        'bindings' => $generalAttendanceQuery->getBindings(),
                        'result_count' => $generalAttendance ? 1 : 0,
                        'result' => $generalAttendance ? $generalAttendance->toArray() : null
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Family Head must be associated with a family'
                    ], 400);
                }
            } else {
                // Admin users see all general attendance records
                $generalAttendance = $generalAttendanceQuery->get();
                
                // Debug: Log the admin query
                \Log::info('Admin query', [
                    'user_id' => $user ? $user->id : null,
                    'sql' => $generalAttendanceQuery->toSql(),
                    'bindings' => $generalAttendanceQuery->getBindings(),
                    'result_count' => $generalAttendance->count()
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => $event,
                    'general_attendance' => $generalAttendance,
                    'debug_info' => [
                        'method' => 'getEventGeneralAttendance',
                        'user_role' => $user && $user->hasRole('family-head') ? 'family-head' : 'admin',
                        'result_type' => is_array($generalAttendance) ? 'array' : 'object',
                        'result_count' => is_array($generalAttendance) ? count($generalAttendance) : 1
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('getEventGeneralAttendance error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch general attendance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create or update general attendance for an event
     */
    public function updateGeneralAttendance(Request $request, int $eventId): JsonResponse
    {
        $request->validate([
            'total_attendance' => 'required|integer|min:0',
            'first_timers_count' => 'nullable|integer|min:0',
            'notes' => 'nullable|string|max:1000',
            'family_id' => 'nullable|integer|exists:families,id'
        ]);

        try {
            // Check if user is a Family Head and automatically set family_id
            $user = auth()->user();
            if ($user && $user->hasRole('family-head')) {
                $member = \App\Models\Member::where('user_id', $user->id)->first();
                if ($member && $member->family) {
                    // Family Head can only update their own family's attendance
                    $request->merge(['family_id' => $member->family->id]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Family Head must be associated with a family to record general attendance'
                    ], 400);
                }
            } else {
                // For admin users, family_id is required
                if (!$request->has('family_id') || !$request->family_id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Family ID is required for general attendance'
                    ], 400);
                }
            }

            $result = $this->attendanceService->updateGeneralAttendance(
                $eventId,
                $request->total_attendance,
                $request->first_timers_count ?? 0,
                $request->notes
            );

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'data' => $result['general_attendance']
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['error']
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update general attendance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get attendance analytics for reporting
     */
    public function getAttendanceAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date'
        ]);

        try {
            $startDate = $request->start_date ? \Carbon\Carbon::parse($request->start_date) : null;
            $endDate = $request->end_date ? \Carbon\Carbon::parse($request->end_date) : null;

            $analytics = $this->attendanceService->getAttendanceAnalytics($startDate, $endDate);

            return response()->json([
                'success' => true,
                'data' => [
                    'analytics' => $analytics,
                    'date_range' => [
                        'start_date' => $startDate?->format('Y-m-d'),
                        'end_date' => $endDate?->format('Y-m-d')
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get general attendance summary for dashboard
     */
    public function getGeneralAttendanceSummary(): JsonResponse
    {
        try {
            $currentMonth = \Carbon\Carbon::now()->startOfMonth();
            $lastMonth = \Carbon\Carbon::now()->subMonth()->startOfMonth();

            // Check if user is a Family Head and restrict to their family
            $user = auth()->user();
            $familyId = null;
            
            if ($user && $user->hasRole('family-head')) {
                $member = \App\Models\Member::where('user_id', $user->id)->first();
                if ($member && $member->family) {
                    $familyId = $member->family->id;
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Family Head must be associated with a family'
                    ], 400);
                }
            }

            // Build query for current month statistics
            $currentMonthQuery = GeneralAttendance::whereHas('event', function ($query) use ($currentMonth) {
                $query->whereMonth('start_date', $currentMonth->month)
                      ->whereYear('start_date', $currentMonth->year);
            });
            
            // Build query for last month statistics
            $lastMonthQuery = GeneralAttendance::whereHas('event', function ($query) use ($lastMonth) {
                $query->whereMonth('start_date', $lastMonth->month)
                      ->whereYear('start_date', $lastMonth->year);
            });

            // Apply family filter if Family Head
            if ($familyId) {
                $currentMonthQuery->where('family_id', $familyId);
                $lastMonthQuery->where('family_id', $familyId);
            }

            $currentMonthStats = $currentMonthQuery->get();
            $lastMonthStats = $lastMonthQuery->get();

            $summary = [
                'current_month' => [
                    'total_events' => $currentMonthStats->count(),
                    'total_attendance' => $currentMonthStats->sum('total_attendance'),
                    'total_first_timers' => $currentMonthStats->sum('first_timers_count'),
                    'average_attendance' => $currentMonthStats->count() > 0 ? 
                        round($currentMonthStats->sum('total_attendance') / $currentMonthStats->count(), 2) : 0
                ],
                'last_month' => [
                    'total_events' => $lastMonthStats->count(),
                    'total_attendance' => $lastMonthStats->sum('total_attendance'),
                    'total_first_timers' => $lastMonthStats->sum('first_timers_count'),
                    'average_attendance' => $lastMonthStats->count() > 0 ? 
                        round($lastMonthStats->sum('total_attendance') / $lastMonthStats->count(), 2) : 0
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 