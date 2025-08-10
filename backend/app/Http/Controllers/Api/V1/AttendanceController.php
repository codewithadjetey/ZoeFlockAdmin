<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Attendance;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

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
            
            $attendances = Attendance::with(['member:id,first_name,last_name,email,profile_image_path'])
                ->where('event_id', $eventId)
                ->orderBy('created_at', 'desc')
                ->get();

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
            $eligibleMembers = $this->attendanceService->getEligibleMembersForEvent($event);

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
} 