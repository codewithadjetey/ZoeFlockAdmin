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
                $generalAttendance = $generalAttendanceQuery->where('family_id', null)->get();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => $event,
                    'general_attendance' => $generalAttendance,
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

    /**
     * Get general attendance statistics with filtering options
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'granularity' => 'nullable|in:weekly,monthly,yearly',
                'family_id' => 'nullable|integer|exists:families,id',
                'data_type' => 'nullable|in:members,firstTimers'
            ]);

            $startDate = $request->start_date ? \Carbon\Carbon::parse($request->start_date) : null;
            $endDate = $request->end_date ? \Carbon\Carbon::parse($request->end_date) : null;
            $granularity = $request->granularity ?? 'weekly';
            $familyId = $request->family_id;
            $dataType = $request->data_type ?? 'members';

            // Check if user is a Family Head and restrict to their family
            $user = auth()->user();
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

        



            // Build base query
            $query = GeneralAttendance::with(['event:id,title,start_date', 'family:id,name'])
                // ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                //     $q->whereHas('event', function ($eventQuery) use ($startDate, $endDate) {
                //         $eventQuery->whereBetween('start_date', [$startDate, $endDate]);
                //     });
                // })
                ->when($familyId === null, function ($q) {
                    $q->whereNull('family_id');
                })
                ->when($familyId, function ($q) use ($familyId) {
                    // If family_id is provided, show only records for that family
                    $q->where('family_id', $familyId);
                });
                // If no family_id provided, show ALL records (no filtering)

            $generalAttendance = $query->get();

            // Process data based on granularity
            $processedData = $this->processDataByGranularity($generalAttendance, $granularity, $dataType);

            // Get summary statistics
            $summaryStats = $this->getSummaryStats($generalAttendance);

            return response()->json([
                'success' => true,
                'data' => [
                    'general_attendance' => $processedData,
                    'summary_stats' => $summaryStats,
                    'filters' => [
                        'start_date' => $startDate ? $startDate->format('Y-m-d') : null,
                        'end_date' => $endDate ? $endDate->format('Y-m-d') : null,
                        'granularity' => $granularity,
                        'family_id' => $familyId,
                        'data_type' => $dataType
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('getStatistics error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process data based on granularity
     */
    private function processDataByGranularity($data, $granularity, $dataType)
    {
        if ($granularity === 'weekly') {
            return $data;
        }

        if ($granularity === 'monthly') {
            $monthlyData = $data->groupBy(function ($item) {
                return \Carbon\Carbon::parse($item->event->start_date)->format('Y-m');
            })->map(function ($group) use ($dataType) {
                $count = $group->count();
                $totalAttendance = $group->sum('total_attendance');
                $totalFirstTimers = $group->sum('first_timers_count');

                return [
                    'period' => $group->first()->event->start_date ? 
                        \Carbon\Carbon::parse($group->first()->event->start_date)->format('Y-m') : 'Unknown',
                    'total_attendance' => $dataType === 'members' ? 
                        round($totalAttendance / $count) : round($totalFirstTimers / $count),
                    'first_timers_count' => $dataType === 'firstTimers' ? 
                        round($totalFirstTimers / $count) : round($totalAttendance / $count),
                    'event_count' => $count
                ];
            })->values();
        }

        if ($granularity === 'yearly') {
            $yearlyData = $data->groupBy(function ($item) {
                return \Carbon\Carbon::parse($item->event->start_date)->format('Y');
            })->map(function ($group) use ($dataType) {
                $count = $group->count();
                $totalAttendance = $group->sum('total_attendance');
                $totalFirstTimers = $group->sum('first_timers_count');

                return [
                    'period' => $group->first()->event->start_date ? 
                        \Carbon\Carbon::parse($group->first()->event->start_date)->format('Y') : 'Unknown',
                    'total_attendance' => $dataType === 'members' ? 
                        round($totalAttendance / $count) : round($totalFirstTimers / $count),
                    'first_timers_count' => $dataType === 'firstTimers' ? 
                        round($totalFirstTimers / $count) : round($totalAttendance / $count),
                    'event_count' => $count
                ];
            })->values();
        }

        return $data;
    }

    /**
     * Get summary statistics
     */
    private function getSummaryStats($data)
    {
        if ($data->isEmpty()) {
            return [
                'total_members' => 0,
                'total_first_timers' => 0,
                'average_members' => 0,
                'average_first_timers' => 0
            ];
        }

        $uniqueEvents = $data->pluck('event_id')->unique()->count();
        $totalMembers = $data->sum('total_attendance');
        $totalFirstTimers = $data->sum('first_timers_count');

        return [
            'total_members' => $totalMembers,
            'total_first_timers' => $totalFirstTimers,
            'average_members' => $uniqueEvents > 0 ? round($totalMembers / $uniqueEvents) : 0,
            'average_first_timers' => $uniqueEvents > 0 ? round($totalFirstTimers / $uniqueEvents) : 0
        ];
    }

    /**
     * Test statistics endpoint for debugging
     */
    public function testStatistics(): JsonResponse
    {
        try {
            // Get raw counts
            $totalEvents = \App\Models\Event::count();
            $totalGeneralAttendance = \App\Models\GeneralAttendance::count();
            $totalFamilies = \App\Models\Family::count();
            
            // Get sample data
            $sampleGeneralAttendance = \App\Models\GeneralAttendance::with(['event:id,title,start_date', 'family:id,name'])->take(3)->get();
            $sampleEvents = \App\Models\Event::take(3)->get(['id', 'title', 'start_date', 'type', 'status']);
            
            // Test queries
            $query1 = \App\Models\GeneralAttendance::with(['event:id,title,start_date', 'family:id,name']);
            $query1Count = $query1->count();
            
            $query2 = \App\Models\GeneralAttendance::with(['event:id,title,start_date', 'family:id,name'])
                ->where('family_id', 1);
            $query2Count = $query2->count();
            
            $query3 = \App\Models\GeneralAttendance::with(['event:id,title,start_date', 'family:id,name'])
                ->whereNull('family_id');
            $query3Count = $query3->count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'database_totals' => [
                        'total_events' => $totalEvents,
                        'total_general_attendance' => $totalGeneralAttendance,
                        'total_families' => $totalFamilies
                    ],
                    'sample_general_attendance' => $sampleGeneralAttendance,
                    'sample_events' => $sampleEvents,
                    'query_tests' => [
                        'all_records' => $query1Count,
                        'family_id_1' => $query2Count,
                        'family_id_null' => $query3Count
                    ],
                    'current_time' => now()->toISOString(),
                    'one_year_ago' => now()->subYear()->toISOString(),
                    'end_of_month' => now()->endOfMonth()->toISOString()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get families for filter dropdown
     */
    public function getFamilies(): JsonResponse
    {
        try {
            $families = \App\Models\Family::select('id', 'name')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $families
            ]);
        } catch (\Exception $e) {
            \Log::error('getFamilies error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch families',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 