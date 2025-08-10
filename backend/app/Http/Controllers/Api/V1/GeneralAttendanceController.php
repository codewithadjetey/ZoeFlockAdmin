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
            $generalAttendance = GeneralAttendance::where('event_id', $eventId)->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => $event,
                    'general_attendance' => $generalAttendance
                ]
            ]);
        } catch (\Exception $e) {
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
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
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

            // Current month statistics
            $currentMonthStats = GeneralAttendance::whereHas('event', function ($query) use ($currentMonth) {
                $query->whereMonth('start_date', $currentMonth->month)
                      ->whereYear('start_date', $currentMonth->year);
            })->get();

            // Last month statistics
            $lastMonthStats = GeneralAttendance::whereHas('event', function ($query) use ($lastMonth) {
                $query->whereMonth('start_date', $lastMonth->month)
                      ->whereYear('start_date', $lastMonth->year);
            })->get();

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