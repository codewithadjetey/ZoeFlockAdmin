<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Event;
use App\Models\Attendance;
use App\Models\Income;
use App\Models\Expense;
use App\Models\Tithe;
use App\Models\Family;
use App\Models\Group;
use App\Models\FirstTimer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-dashboard');
        
        // Apply specific permissions to methods
        $this->middleware('permission:get-dashboard-data')->only(['getDashboardData']);
    }

    /**
     * Get comprehensive dashboard data
     */
    public function getDashboardData(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Get basic statistics
            $data = [
                'total_members' => Member::where('deleted', 0)->count(),
                'total_events' => Event::where('deleted', false)->count(),
                'total_families' => Family::count(),
                'total_groups' => Group::count(),
                'total_first_timers' => FirstTimer::count(),
            ];

            // Get financial data if user has permission
            if ($user->hasPermissionTo('view-incomes') || $user->hasPermissionTo('view-expenses')) {
                $data['total_income'] = Income::where('is_received', true)->sum('amount');
                $data['total_expenses'] = Expense::sum('amount');
                $data['net_income'] = $data['total_income'] - $data['total_expenses'];
            }

            // Get attendance data if user has permission
            if ($user->hasPermissionTo('view-attendance')) {
                $data['total_attendance_records'] = Attendance::count();
                $data['recent_attendance'] = Attendance::with(['event', 'member'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get();
            }

            // Get tithe data if user has permission
            if ($user->hasPermissionTo('view-tithes')) {
                $data['total_tithes'] = Tithe::count();
                $data['total_tithe_amount'] = Tithe::sum('amount');
                $data['total_tithe_paid'] = Tithe::sum('paid_amount');
            }

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Dashboard data retrieved successfully'
            $data = [
                'statistics' => $this->getStatistics(),
                'attendance_data' => $this->getAttendanceData(),
                'recent_activities' => $this->getRecentActivities(),
                'upcoming_events' => $this->getUpcomingEvents(),
                'quick_stats' => $this->getQuickStats(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Dashboard data retrieved successfully',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }
                'message' => 'Failed to retrieve dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get main statistics
     */
    private function getStatistics(): array
    {
        $totalMembers = Member::where('deleted', false)->count();
        $totalFamilies = Family::where('deleted', false)->count();
        $activeGroups = Group::where('status', 'Active')->where('deleted', false)->count();
        
        // Get upcoming events count (next 30 days)
        $upcomingEventsCount = Event::where('start_date', '>=', now())
            ->where('start_date', '<=', now()->addDays(30))
            ->where('deleted', false)
            ->whereNull('cancelled_at')
            ->count();

        // Get active event categories count
        $activeEventCategories = EventCategory::where('is_active', true)->count();

        // Get total tithes this month
        $thisMonth = now()->startOfMonth();
        $totalTithesThisMonth = Tithe::where('created_at', '>=', $thisMonth)->sum('amount');

        return [
            'total_members' => $totalMembers,
            'total_families' => $totalFamilies,
            'active_groups' => $activeGroups,
            'upcoming_events' => $upcomingEventsCount,
            'active_families' => Family::where('active', true)->where('deleted', false)->count(),
            'total_family_members' => Member::whereHas('families', function($query) {
                $query->where('active', true);
            })->where('deleted', false)->count(),
            'active_event_categories' => $activeEventCategories,
            'total_tithes_this_month' => $totalTithesThisMonth,
        ];
    }

    /**
     * Get attendance data for the chart
     */
    private function getAttendanceData(): array
    {
        $days = 7;
        $attendanceData = [];
        
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayName = $date->format('D');
            
            // Get actual attendance for this day
            $actualAttendance = Attendance::whereDate('created_at', $date)
                ->where('status', 'present')
                ->count();
            
            // Calculate target attendance (you can adjust this logic)
            $targetAttendance = $this->calculateTargetAttendance($date);
            
            $attendanceData[] = [
                'name' => $dayName,
                'attendance' => $actualAttendance,
                'target' => $targetAttendance,
            ];
        }

        return $attendanceData;
    }

    /**
     * Calculate target attendance for a given date
     */
    private function calculateTargetAttendance($date): int
    {
        // Base target on total members, adjust for day of week
        $totalMembers = Member::where('deleted', false)->count();
        $dayOfWeek = $date->dayOfWeek;
        
        // Sunday typically has higher attendance
        if ($dayOfWeek === 0) { // Sunday
            return (int) ($totalMembers * 0.8);
        } elseif ($dayOfWeek === 6) { // Saturday
            return (int) ($totalMembers * 0.3);
        } else { // Weekdays
            return (int) ($totalMembers * 0.2);
        }
    }

    /**
     * Get recent activities
     */
    private function getRecentActivities(): array
    {
        $activities = [];
        
        // Recent member registrations
        $recentMembers = Member::where('deleted', false)
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();
            
        foreach ($recentMembers as $member) {
            $activities[] = [
                'id' => $member->id,
                'type' => 'member',
                'title' => $member->first_name . ' ' . $member->last_name,
                'description' => 'joined as a new member',
                'time' => $member->created_at->diffForHumans(),
                'icon' => 'fas fa-user-plus',
                'color' => 'text-green-600',
                'bgColor' => 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20',
            ];
        }

        // Recent events with category info
        $recentEvents = Event::with('category')
            ->where('deleted', false)
            ->whereNull('cancelled_at')
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();
            
        foreach ($recentEvents as $event) {
            $activities[] = [
                'id' => $event->id,
                'type' => 'event',
                'title' => $event->title,
                'description' => 'event was created',
                'time' => $event->created_at->diffForHumans(),
                'icon' => 'fas fa-calendar-plus',
                'color' => 'text-blue-600',
                'bgColor' => 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20',
            ];
        }

        // Recent tithes with member info
        $recentTithes = Tithe::with('member')
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();
            
        foreach ($recentTithes as $tithe) {
            $memberName = $tithe->member ? $tithe->member->first_name . ' ' . $tithe->member->last_name : 'Member';
            $activities[] = [
                'id' => $tithe->id,
                'type' => 'donation',
                'title' => '$' . number_format($tithe->amount, 2) . ' tithe',
                'description' => 'received from ' . $memberName,
                'time' => $tithe->created_at->diffForHumans(),
                'icon' => 'fas fa-donate',
                'color' => 'text-yellow-600',
                'bgColor' => 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20',
            ];
        }

        // Recent first timers
        $recentFirstTimers = FirstTimer::orderBy('created_at', 'desc')
            ->limit(1)
            ->get();
            
        foreach ($recentFirstTimers as $firstTimer) {
            $activities[] = [
                'id' => $firstTimer->id,
                'type' => 'first_timer',
                'title' => $firstTimer->name,
                'description' => 'registered as first timer',
                'time' => $firstTimer->created_at->diffForHumans(),
                'icon' => 'fas fa-star',
                'color' => 'text-purple-600',
                'bgColor' => 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20',
            ];
        }

        // Sort by creation time and limit to 4 most recent
        usort($activities, function($a, $b) {
            return strtotime($b['time']) - strtotime($a['time']);
        });

        return array_slice($activities, 0, 4);
    }

    /**
     * Get upcoming events
     */
    private function getUpcomingEvents(): array
    {
        $events = Event::with('category')
            ->where('start_date', '>=', now())
            ->where('deleted', false)
            ->whereNull('cancelled_at')
            ->orderBy('start_date', 'asc')
            ->limit(4)
            ->get();

        // Get all active event categories with their colors
        $eventCategories = EventCategory::where('is_active', true)
            ->pluck('color', 'name')
            ->toArray();

        // Default color mapping for categories not in database
        $defaultColors = [
            'Worship' => 'bg-gradient-to-r from-blue-500 to-blue-600',
            'Education' => 'bg-gradient-to-r from-green-500 to-green-600',
            'Prayer' => 'bg-gradient-to-r from-purple-500 to-purple-600',
            'Music' => 'bg-gradient-to-r from-orange-500 to-orange-600',
            'Youth' => 'bg-gradient-to-r from-pink-500 to-pink-600',
            'Mid-Week Service' => 'bg-gradient-to-r from-indigo-500 to-indigo-600',
            'Sunday Service' => 'bg-gradient-to-r from-blue-500 to-blue-600',
            'Bible Study' => 'bg-gradient-to-r from-emerald-500 to-emerald-600',
            'Fellowship' => 'bg-gradient-to-r from-teal-500 to-teal-600',
            'Meeting' => 'bg-gradient-to-r from-cyan-500 to-cyan-600',
            'default' => 'bg-gradient-to-r from-gray-500 to-gray-600',
        ];

        return $events->map(function($event) use ($eventCategories, $defaultColors) {
            $categoryName = $event->category ? $event->category->name : 'default';
            
            // Use database color if available, otherwise fall back to default
            $color = $eventCategories[$categoryName] ?? $defaultColors[$categoryName] ?? $defaultColors['default'];
            
            return [
                'id' => $event->id,
                'title' => $event->title,
                'date' => $event->start_date->format('F j, Y'),
                'time' => $event->start_date->format('g:i A'),
                'location' => $event->location ?? $event->category?->default_location ?? 'Main Sanctuary',
                'attendees' => $event->expected_attendees ?? 0,
                'category' => $categoryName,
                'color' => $color,
            ];
        })->toArray();
    }

    /**
     * Get quick stats for additional insights
     */
    private function getQuickStats(): array
    {
        $thisMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        return [
            'new_members_this_month' => Member::where('deleted', false)
                ->where('created_at', '>=', $thisMonth)
                ->count(),
            'new_families_this_month' => Family::where('deleted', false)
                ->where('created_at', '>=', $thisMonth)
                ->count(),
            'events_this_month' => Event::where('deleted', false)
                ->whereNull('cancelled_at')
                ->where('start_date', '>=', $thisMonth)
                ->where('start_date', '<', $thisMonth->copy()->addMonth())
                ->count(),
            'total_tithes_this_month' => Tithe::where('created_at', '>=', $thisMonth)
                ->sum('amount'),
            'attendance_rate' => $this->calculateAttendanceRate(),
            'total_event_categories' => EventCategory::where('is_active', true)->count(),
            'total_first_timers_this_month' => FirstTimer::where('created_at', '>=', $thisMonth)->count(),
        ];
    }

    /**
     * Calculate overall attendance rate
     */
    private function calculateAttendanceRate(): float
    {
        $totalMembers = Member::where('deleted', false)->count();
        if ($totalMembers === 0) return 0;

        $recentAttendance = Attendance::where('created_at', '>=', now()->subDays(30))
            ->where('status', 'present')
            ->distinct('member_id')
            ->count();

        return round(($recentAttendance / $totalMembers) * 100, 1);
    }
} 