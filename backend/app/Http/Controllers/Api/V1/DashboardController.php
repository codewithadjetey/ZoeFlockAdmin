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
     * Get dashboard data
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
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }
} 