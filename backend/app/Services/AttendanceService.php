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
use Illuminate\Support\Facades\Auth;

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
     * Get eligible members for an event
     */
    public function getEligibleMembersForEvent(Event $event, ?int $familyId = null): \Illuminate\Database\Eloquent\Collection
    {
        $memberIds = collect();

        if ($event->type === 'general') {
            // For general events, all active members are eligible
            if ($familyId) {
                // If familyId is provided, only return members from that family
                return Member::where('is_active', true)
                    ->whereHas('families', function ($q) use ($familyId) {
                        $q->where('family_id', $familyId)->where('is_active', true);
                    })->get();
            }
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
        $query = Member::whereIn('id', $memberIds->unique())
            ->where('is_active', true);
            
        // If familyId is provided, filter by family
        if ($familyId) {
            $query->whereHas('families', function ($q) use ($familyId) {
                $q->where('family_id', $familyId)->where('is_active', true);
            });
        }
        
        return $query->get();
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
            // Check if user is a Family Head and get their family
            $user = Auth::user();
            $familyId = null;
            
            if ($user && $user->hasRole('family-head')) {
                // Get the member record for the authenticated user
                $member = Member::where('user_id', $user->id)->first();
                if ($member && $member->family) {
                    $familyId = $member->family->id;
                } else {
                    return [
                        'success' => false,
                        'error' => 'Family Head must be associated with a family to record general attendance'
                    ];
                }
            }

            $generalAttendance = GeneralAttendance::updateOrCreate(
                [
                    'event_id' => $eventId,
                    'family_id' => $familyId
                ],
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
     * Get event attendance statistics
     */
    public function getEventAttendanceStats(int $eventId): array
    {
        $event = Event::findOrFail($eventId);
        
        // Check if user is a Family Head and restrict to their family members
        $user = Auth::user();
        $familyId = null;
        
        if ($user && $user->hasRole('family-head')) {
            // Get the member record for the authenticated user
            $member = Member::where('user_id', $user->id)->first();
            if ($member && $member->family) {
                $familyId = $member->family->id;
            }
        }
        
        $individualStats = Attendance::where('event_id', $eventId);
        
        // If Family Head, only show attendance for their family members
        if ($familyId) {
            \Log::info('Filtering attendance stats for Family Head', [
                'family_id' => $familyId,
                'event_id' => $eventId
            ]);
            
            $individualStats->whereHas('member', function ($q) use ($familyId) {
                $q->whereHas('families', function ($familyQuery) use ($familyId) {
                    $familyQuery->where('family_id', $familyId)->where('is_active', true);
                });
            });
        }
        
        $individualStats = $individualStats->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
            
        \Log::info('Individual attendance stats', [
            'family_id' => $familyId,
            'event_id' => $eventId,
            'stats' => $individualStats
        ]);

        // Get general attendance for the specific family (if Family Head) or all families (if admin)
        $generalAttendanceQuery = GeneralAttendance::where('event_id', $eventId);
        if ($familyId) {
            // Family Head sees only their family's general attendance
            $generalAttendanceQuery->where('family_id', $familyId);
        }
        $generalAttendance = $generalAttendanceQuery->first();

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
                'first_timers_count' => $generalAttendance->first_timers_count,
                'family_id' => $generalAttendance->family_id
            ] : null,
            'eligible_members_count' => $this->getEligibleMembersForEvent($event, $familyId)->count()
        ];
    }

    /**
     * Get attendance analytics for reporting
     */
    public function getAttendanceAnalytics(Carbon $startDate = null, Carbon $endDate = null): array
    {
        $startDate = $startDate ?? Carbon::now()->subYear()->startOfMonth();
        $endDate = $endDate ?? Carbon::now()->endOfMonth();

        // Check if user is a Family Head and restrict to their family events
        $user = Auth::user();
        $familyId = null;
        
        if ($user && $user->hasRole('family-head')) {
            // Get the member record for the authenticated user
            $member = Member::where('user_id', $user->id)->first();
            if ($member && $member->family) {
                $familyId = $member->family->id;
            }
        }

        $eventsQuery = Event::whereBetween('start_date', [$startDate, $endDate])
            ->where('status', '!=', 'cancelled')
            ->where('deleted', false);

        // If Family Head, only show events where their family is eligible
        if ($familyId !== null) {
            $eventsQuery->where(function ($q) use ($familyId) {
                $q->where('type', 'general') // General events are always eligible
                  ->orWhereHas('families', function ($familyQuery) use ($familyId) {
                      $familyQuery->where('family_id', $familyId);
                  });
            });
        }

        $events = $eventsQuery->get();

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

    /**
     * Get families for filter dropdown
     */
    public function getFamiliesForFilter(): array
    {
        try {
            $families = \App\Models\Family::select('id', 'name')
                ->orderBy('name')
                ->get()
                ->map(function ($family) {
                    return [
                        'id' => $family->id,
                        'name' => $family->name
                    ];
                })
                ->toArray();

            return [
                'success' => true,
                'data' => $families
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get individual attendance statistics for dashboard
     */
    public function getIndividualStatistics($params)
    {
        $startDate = isset($params['start_date']) ? Carbon::parse($params['start_date']) : null;
        $endDate = isset($params['end_date']) ? Carbon::parse($params['end_date']) : null;
        $granularity = $params['granularity'] ?? 'none';
        $memberId = $params['member_id'] ?? null;
        $eventId = $params['event_id'] ?? null;
        $categoryId = $params['category_id'] ?? null;
        $familyId = $params['family_id'] ?? null;

        $query = Attendance::with(['event:id,title,start_date,category_id', 'member:id,first_name,last_name'])
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereHas('event', function ($eventQuery) use ($startDate, $endDate) {
                    $eventQuery->whereBetween('start_date', [$startDate, $endDate]);
                });
            })
            ->when($memberId, function ($q) use ($memberId) {
                $q->where('member_id', $memberId);
            })
            ->when($eventId, function ($q) use ($eventId) {
                $q->where('event_id', $eventId);
            })
            ->when($categoryId, function ($q) use ($categoryId) {
                $q->whereHas('event', function ($eventQuery) use ($categoryId) {
                    $eventQuery->where('category_id', $categoryId);
                });
            })
            ->when($familyId, function ($q) use ($familyId) {
                $q->whereHas('member.families', function ($familyQuery) use ($familyId) {
                    $familyQuery->where('family_id', $familyId)->where('is_active', true);
                });
            });

        $attendances = $query->get();

        // Group and aggregate
        if ($granularity === 'none') {
            $data = $attendances->groupBy('event_id')->map(function ($group) {
                $event = $group->first()->event;
                $present = $group->where('status', 'present')->count();
                $absent = $group->where('status', 'absent')->count();
                $firstTimers = $group->where('status', 'first_timer')->count();
                $total = $group->count();
                return [
                    'xLabel' => $event ? $event->title : 'Unknown Event',
                    'event_id' => $event ? $event->id : null,
                    'present' => $present,
                    'absent' => $absent,
                    'first_timers' => $firstTimers,
                    'total' => $total,
                    'event' => $event,
                ];
            })->values();
        } elseif ($granularity === 'monthly') {
            $data = $attendances->groupBy(function ($item) {
                return Carbon::parse($item->event->start_date)->format('Y-m');
            })->map(function ($group) {
                $monthLabel = $group->first()->event->start_date
                    ? Carbon::parse($group->first()->event->start_date)->format('F Y')
                    : 'Unknown Month';
                $present = $group->where('status', 'present')->count();
                $absent = $group->where('status', 'absent')->count();
                $firstTimers = $group->where('status', 'first_timer')->count();
                $total = $group->count();
                return [
                    'xLabel' => $monthLabel,
                    'present' => $present,
                    'absent' => $absent,
                    'first_timers' => $firstTimers,
                    'total' => $total,
                ];
            })->values();
        } elseif ($granularity === 'yearly') {
            $data = $attendances->groupBy(function ($item) {
                return Carbon::parse($item->event->start_date)->format('Y');
            })->map(function ($group) {
                $yearLabel = $group->first()->event->start_date
                    ? Carbon::parse($group->first()->event->start_date)->format('Y')
                    : 'Unknown Year';
                $present = $group->where('status', 'present')->count();
                $absent = $group->where('status', 'absent')->count();
                $firstTimers = $group->where('status', 'first_timer')->count();
                $total = $group->count();
                return [
                    'xLabel' => $yearLabel,
                    'present' => $present,
                    'absent' => $absent,
                    'first_timers' => $firstTimers,
                    'total' => $total,
                ];
            })->values();
        } else {
            $data = collect();
        }

        // Summary stats
        $summary = [
            'total_present' => $attendances->where('status', 'present')->count(),
            'total_absent' => $attendances->where('status', 'absent')->count(),
            'total_first_timers' => $attendances->where('status', 'first_timer')->count(),
            'total_records' => $attendances->count(),
        ];

        return [
            'individual_attendance' => $data,
            'summary_stats' => $summary,
            'filters' => [
                'start_date' => $startDate ? $startDate->format('Y-m-d') : null,
                'end_date' => $endDate ? $endDate->format('Y-m-d') : null,
                'granularity' => $granularity,
                'member_id' => $memberId,
                'event_id' => $eventId,
                'category_id' => $categoryId,
                'family_id' => $familyId,
            ]
        ];
    }
} 