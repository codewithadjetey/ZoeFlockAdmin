<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Attendance;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth; // Added this import for Auth::user()

class AttendanceController extends Controller
{
    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * Get attendance records for a specific event
     */
    public function getEventAttendance(int $eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);
            
            // Check if user is a Family Head and restrict to their family members
            $user = Auth::user();
            if ($user && $user->hasRole('family-head')) {
                // Get the member record for the authenticated user
                $member = \App\Models\Member::where('user_id', $user->id)->first();
                if ($member && $member->family) {
                    // Only show attendance records for members from the same family
                    \Log::info('Family Head filtering attendance', [
                        'user_id' => $user->id,
                        'member_id' => $member->id,
                        'family_id' => $member->family->id,
                        'event_id' => $eventId
                    ]);
                    
                    $attendances = Attendance::with(['member:id,first_name,last_name,email,profile_image_path'])
                        ->where('event_id', $eventId)
                        ->whereHas('member', function($query) use ($member) {
                            $query->whereHas('families', function($familyQuery) use ($member) {
                                $familyQuery->where('family_id', $member->family->id)->where('is_active', true);
                            });
                        })
                        ->orderBy('created_at', 'desc')
                        ->get();
                    
                    \Log::info('Filtered attendances for Family Head', [
                        'total_attendances' => $attendances->count(),
                        'attendances' => $attendances->toArray()
                    ]);
                } else {
                    // If family head has no family, return empty result
                    \Log::warning('Family Head has no family', ['user_id' => $user->id]);
                    $attendances = collect([]);
                }
            } else {
                // For admins and other roles, show all attendance records
                $attendances = Attendance::with(['member:id,first_name,last_name,email,profile_image_path'])
                    ->where('event_id', $eventId)
                    ->orderBy('created_at', 'desc')
                    ->get();
            }

            $stats = $this->attendanceService->getEventAttendanceStats($eventId);

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => $event,
                    'attendances' => $attendances,
                    'statistics' => $stats
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update individual attendance status
     */
    public function updateAttendanceStatus(Request $request, int $eventId, int $memberId): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(['present', 'absent', 'first_timer'])],
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            $result = $this->attendanceService->updateAttendanceStatus(
                $eventId,
                $memberId,
                $request->status,
                $request->notes
            );

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'data' => $result['attendance']
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
                'message' => 'Failed to update attendance status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark check-in for a member
     */
    public function markCheckIn(int $eventId, int $memberId): JsonResponse
    {
        try {
            $result = $this->attendanceService->markCheckIn($eventId, $memberId);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'data' => $result['attendance']
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
                'message' => 'Failed to mark check-in',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark check-out for a member
     */
    public function markCheckOut(int $eventId, int $memberId): JsonResponse
    {
        try {
            $result = $this->attendanceService->markCheckOut($eventId, $memberId);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'data' => $result['attendance']
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
                'message' => 'Failed to mark check-out',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get eligible members for an event
     */
    public function getEligibleMembers(int $eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);
            
            // Check if user is a Family Head and restrict to their family members
            $user = Auth::user();
            if ($user && $user->hasRole('family-head')) {
                // Get the member record for the authenticated user
                $member = \App\Models\Member::where('user_id', $user->id)->first();
                if ($member && $member->family) {
                    // Only show members from the same family
                    $eligibleMembers = $this->attendanceService->getEligibleMembersForEvent($event, $member->family->id);
                } else {
                    // If family head has no family, return empty result
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'event' => $event,
                            'eligible_members' => collect([]),
                            'total_count' => 0
                        ]
                    ]);
                }
            } else {
                $eligibleMembers = $this->attendanceService->getEligibleMembersForEvent($event);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => $event,
                    'eligible_members' => $eligibleMembers,
                    'total_count' => $eligibleMembers->count()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch eligible members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update attendance statuses
     */
    public function bulkUpdateAttendance(Request $request, int $eventId): JsonResponse
    {
        $request->validate([
            'attendances' => 'required|array',
            'attendances.*.member_id' => 'required|integer|exists:members,id',
            'attendances.*.status' => ['required', Rule::in(['present', 'absent', 'first_timer'])],
            'attendances.*.notes' => 'nullable|string|max:500'
        ]);

        try {
            $results = [];
            $successCount = 0;
            $errorCount = 0;

            foreach ($request->attendances as $attendanceData) {
                $result = $this->attendanceService->updateAttendanceStatus(
                    $eventId,
                    $attendanceData['member_id'],
                    $attendanceData['status'],
                    $attendanceData['notes'] ?? null
                );

                if ($result['success']) {
                    $successCount++;
                    $results[] = [
                        'member_id' => $attendanceData['member_id'],
                        'status' => 'success',
                        'data' => $result['attendance']
                    ];
                } else {
                    $errorCount++;
                    $results[] = [
                        'member_id' => $attendanceData['member_id'],
                        'status' => 'error',
                        'error' => $result['error']
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Bulk update completed. {$successCount} successful, {$errorCount} failed.",
                'data' => [
                    'results' => $results,
                    'summary' => [
                        'total' => count($request->attendances),
                        'successful' => $successCount,
                        'failed' => $errorCount
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to perform bulk update',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ensure all attendance records exist for an event
     */
    public function ensureAttendanceRecords(int $eventId): JsonResponse
    {
        try {
            $result = $this->attendanceService->ensureAllAttendanceRecordsExist($eventId);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'data' => $result
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to ensure attendance records',
                    'error' => $result['error']
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to ensure attendance records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get individual attendance statistics (dynamic, for dashboard)
     */
    public function getIndividualStatistics(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'granularity' => 'nullable|in:none,monthly,yearly',
            'member_id' => 'nullable|integer|exists:members,id',
            'event_id' => 'nullable|integer|exists:events,id',
            'category_id' => 'nullable|integer|exists:event_categories,id',
        ]);

        try {
            $data = $this->attendanceService->getIndividualStatistics($request->all());
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch individual attendance statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 