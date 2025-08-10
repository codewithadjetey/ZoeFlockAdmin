<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Attendance;
use App\Models\GeneralAttendance;
use App\Models\Member;
use App\Models\Group;
use App\Models\Family;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttendanceService
{
    /**
     * Create attendance records for an event at midnight
     */
    public function createEventAttendance(Event $event): array
    {
        $eligibleMembers = $this->getEligibleMembersForEvent($event);
        $createdRecords = [];
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($eligibleMembers as $member) {
                // Check if attendance record already exists
                $existingAttendance = Attendance::where('event_id', $event->id)
                    ->where('member_id', $member->id)
                    ->first();

                if (!$existingAttendance) {
                    $attendance = Attendance::create([
                        'event_id' => $event->id,
                        'member_id' => $member->id,
                        'status' => 'absent', // Default status
                        'recorded_by' => 1, // System user ID
                    ]);
                    $createdRecords[] = $attendance;
                }
            }

            DB::commit();
            return [
                'success' => true,
                'created_records' => count($createdRecords),
                'total_eligible_members' => count($eligibleMembers),
                'errors' => $errors
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'created_records' => 0,
                'total_eligible_members' => count($eligibleMembers)
            ];
        }
    }

    /**
     * Ensure attendance records exist for an event and member
     */
    public function ensureAttendanceRecordExists(int $eventId, int $memberId): ?Attendance
    {
        $attendance = Attendance::where('event_id', $eventId)
            ->where('member_id', $memberId)
            ->first();

        if (!$attendance) {
            // Create default attendance record
            $attendance = Attendance::create([
                'event_id' => $eventId,
                'member_id' => $memberId,
                'status' => 'absent', // Default status
                'recorded_by' => auth()->id() ?? 1,
            ]);
        }

        return $attendance;
    }

    /**
     * Ensure all eligible members have attendance records for an event
     */
    public function ensureAllAttendanceRecordsExist(int $eventId): array
    {
        try {
            $event = Event::findOrFail($eventId);
            $eligibleMembers = $this->getEligibleMembersForEvent($event);
            $createdRecords = [];
            $existingRecords = [];

            foreach ($eligibleMembers as $member) {
                $attendance = Attendance::where('event_id', $eventId)
                    ->where('member_id', $member->id)
                    ->first();

                if (!$attendance) {
                    $attendance = Attendance::create([
                        'event_id' => $eventId,
                        'member_id' => $member->id,
                        'status' => 'absent', // Default status
                        'recorded_by' => auth()->id() ?? 1,
                    ]);
                    $createdRecords[] = $attendance;
                } else {
                    $existingRecords[] = $attendance;
                }
            }

            return [
                'success' => true,
                'created_records' => count($createdRecords),
                'existing_records' => count($existingRecords),
                'total_eligible_members' => count($eligibleMembers),
                'message' => 'Attendance records ensured successfully'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get all members eligible to attend a specific event
     */
    public function getEligibleMembersForEvent(Event $event): \Illuminate\Database\Eloquent\Collection
    {
        $memberIds = collect();

        if ($event->type === 'general') {
            // For general events, all active members are eligible
            return Member::where('is_active', true)->get();
        }

        // Get members from associated groups
        if ($event->groups()->exists()) {
            $groupMemberIds = Member::whereHas('groups', function ($q) use ($event) {
                $q->whereIn('group_id', $event->groups()->pluck('group_id'))
                  ->where('is_active', true);
            })->pluck('id');
            
            $memberIds = $memberIds->merge($groupMemberIds);
        }

        // Get members from associated families
        if ($event->families()->exists()) {
            $familyMemberIds = Member::whereHas('families', function ($q) use ($event) {
                $q->whereIn('family_id', $event->families()->pluck('family_id'))
                  ->where('is_active', true);
            })->pluck('id');
            
            $memberIds = $memberIds->merge($familyMemberIds);
        }

        // Remove duplicates and return unique members
        return Member::whereIn('id', $memberIds->unique())
            ->where('is_active', true)
            ->get();
    }

    /**
     * Update individual attendance status
     */
    public function updateAttendanceStatus(int $eventId, int $memberId, string $status, ?string $notes = null): array
    {
        try {
            $attendance = Attendance::where('event_id', $eventId)
                ->where('member_id', $memberId)
                ->first();

            if (!$attendance) {
                // Create the attendance record if it doesn't exist
                $attendance = Attendance::create([
                    'event_id' => $eventId,
                    'member_id' => $memberId,
                    'status' => $status,
                    'notes' => $notes,
                    'recorded_by' => auth()->id() ?? 1,
                ]);

                return [
                    'success' => true,
                    'attendance' => $attendance,
                    'message' => 'Attendance created successfully'
                ];
            }

            // Update existing attendance record
            $attendance->update([
                'status' => $status,
                'notes' => $notes,
                'recorded_by' => auth()->id() ?? 1
            ]);

            return [
                'success' => true,
                'attendance' => $attendance,
                'message' => 'Attendance updated successfully'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create or update general attendance
     */
    public function updateGeneralAttendance(int $eventId, int $totalAttendance, int $firstTimersCount = 0, ?string $notes = null): array
    {
        try {
            $generalAttendance = GeneralAttendance::updateOrCreate(
                ['event_id' => $eventId],
                [
                    'total_attendance' => $totalAttendance,
                    'first_timers_count' => $firstTimersCount,
                    'notes' => $notes,
                    'recorded_by' => auth()->id() ?? 1
                ]
            );

            return [
                'success' => true,
                'general_attendance' => $generalAttendance,
                'message' => 'General attendance updated successfully'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get attendance statistics for an event
     */
    public function getEventAttendanceStats(int $eventId): array
    {
        $event = Event::findOrFail($eventId);
        
        $individualStats = Attendance::where('event_id', $eventId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $generalAttendance = GeneralAttendance::where('event_id', $eventId)->first();

        return [
            'event' => $event,
            'individual_attendance' => [
                'present' => $individualStats['present'] ?? 0,
                'absent' => $individualStats['absent'] ?? 0,
                'first_timers' => $individualStats['first_timer'] ?? 0,
                'total_individual' => array_sum($individualStats)
            ],
            'general_attendance' => $generalAttendance ? [
                'total_attendance' => $generalAttendance->total_attendance,
                'first_timers_count' => $generalAttendance->first_timers_count
            ] : null,
            'eligible_members_count' => $this->getEligibleMembersForEvent($event)->count()
        ];
    }

    /**
     * Get attendance analytics for reporting
     */
    public function getAttendanceAnalytics(Carbon $startDate = null, Carbon $endDate = null): array
    {
        $startDate = $startDate ?? Carbon::now()->startOfMonth();
        $endDate = $endDate ?? Carbon::now()->endOfMonth();

        $events = Event::whereBetween('start_date', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled')
            ->where('deleted', false)
            ->get();

        $analytics = [];
        foreach ($events as $event) {
            $stats = $this->getEventAttendanceStats($event->id);
            $analytics[] = [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'event_date' => $event->start_date,
                'individual_stats' => $stats['individual_attendance'],
                'general_stats' => $stats['general_attendance'],
                'eligible_members' => $stats['eligible_members_count']
            ];
        }

        return $analytics;
    }

    /**
     * Mark check-in time for a member
     */
    public function markCheckIn(int $eventId, int $memberId): array
    {
        try {
            $attendance = Attendance::where('event_id', $eventId)
                ->where('member_id', $memberId)
                ->first();

            if (!$attendance) {
                // Create the attendance record if it doesn't exist
                $attendance = Attendance::create([
                    'event_id' => $eventId,
                    'member_id' => $memberId,
                    'status' => 'present', // Default to present when checking in
                    'recorded_by' => auth()->id() ?? 1,
                ]);
            }

            $attendance->update([
                'check_in_time' => now(),
                'recorded_by' => auth()->id() ?? 1
            ]);

            return [
                'success' => true,
                'attendance' => $attendance,
                'message' => 'Check-in recorded successfully'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Mark check-out time for a member
     */
    public function markCheckOut(int $eventId, int $memberId): array
    {
        try {
            $attendance = Attendance::where('event_id', $eventId)
                ->where('member_id', $memberId)
                ->first();

            if (!$attendance) {
                // Create the attendance record if it doesn't exist
                $attendance = Attendance::create([
                    'event_id' => $eventId,
                    'member_id' => $memberId,
                    'status' => 'present', // Default to present when checking out
                    'recorded_by' => auth()->id() ?? 1,
                ]);
            }

            $attendance->update([
                'check_out_time' => now(),
                'recorded_by' => auth()->id() ?? 1
            ]);

            return [
                'success' => true,
                'attendance' => $attendance,
                'message' => 'Check-out recorded successfully'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
            }
        }
} 