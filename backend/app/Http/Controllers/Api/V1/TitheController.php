<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tithe;
use App\Models\Member;
use App\Models\Family;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use App\Models\TithePayment;

class TitheController extends Controller
{
    /**
     * Display a listing of tithes based on user role
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = Tithe::with(['member', 'creator']);

            // Filter by member if specified
            if ($request->has('member_id')) {
                $query->where('member_id', $request->member_id);
            }

            // Filter by status
            if ($request->has('status')) {
                switch ($request->status) {
                    case 'active':
                        $query->active();
                        break;
                    case 'paid':
                        $query->paid();
                        break;
                    case 'unpaid':
                        $query->unpaid();
                        break;
                    case 'overdue':
                        $query->overdue();
                        break;
                }
            }

            // Filter by frequency
            if ($request->has('frequency')) {
                $query->where('frequency', $request->frequency);
            }

            // Date range filters
            if ($request->has('start_date')) {
                $query->where('start_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('start_date', '<=', $request->end_date);
            }

            // Role-based access control
            if ($user->hasRole('admin')) {
                // Admin can see all tithes
            } elseif ($user->hasRole('family_head')) {
                // Family head can only see tithes from their family members
                $family = Family::where('family_head_id', $user->member->id)->first();
                if ($family) {
                    $memberIds = $family->members->pluck('id');
                    $query->whereIn('member_id', $memberIds);
                } else {
                    // If no family, only show their own tithes
                    $query->where('member_id', $user->member->id);
                }
            } else {
                // Regular members can only see their own tithes
                $query->where('member_id', $user->member->id);
            }

            $tithes = $query->orderBy('created_at', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $tithes,
                'message' => 'Tithes retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving tithes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created tithe
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
    

            $validator = Validator::make($request->all(), [
                'member_id' => 'required|exists:members,id',
                'amount' => 'required|numeric|min:0.01',
                'frequency' => 'required|in:weekly,monthly',
                'start_date' => 'required|date',
                'notes' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Calculate next due date
            $startDate = Carbon::parse($request->start_date);
            $nextDueDate = $request->frequency === 'weekly' 
                ? $startDate->copy()->addWeek() 
                : $startDate->copy()->addMonth();

            $tithe = Tithe::create([
                'member_id' => $request->member_id,
                'amount' => $request->amount,
                'frequency' => $request->frequency,
                'start_date' => $startDate,
                'next_due_date' => $nextDueDate,
                'is_active' => true,
                'is_paid' => false,
                'notes' => $request->notes,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            $tithe->load(['member', 'creator']);

            return response()->json([
                'success' => true,
                'data' => $tithe,
                'message' => 'Tithe created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating tithe: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified tithe
     */
    public function show(Tithe $tithe): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Check if user can view this tithe
            if (!$this->canAccessTithe($user, $tithe)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this tithe'
                ], 403);
            }

            $tithe->load(['member', 'creator', 'updater']);

            return response()->json([
                'success' => true,
                'data' => $tithe,
                'message' => 'Tithe retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving tithe: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified tithe
     */
    public function update(Request $request, Tithe $tithe): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Only admins and pastors can update tithes
            if (!$user->hasRole('admin') && !$user->hasRole('pastor')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update tithes'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'amount' => 'sometimes|numeric|min:0.01',
                'frequency' => 'sometimes|in:weekly,monthly',
                'start_date' => 'sometimes|date',
                'is_active' => 'sometimes|boolean',
                'notes' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update fields
            $updateData = $request->only(['amount', 'frequency', 'start_date', 'is_active', 'notes']);
            $updateData['updated_by'] = $user->id;

            // Recalculate next due date if frequency or start date changed
            if (isset($updateData['frequency']) || isset($updateData['start_date'])) {
                $startDate = isset($updateData['start_date']) 
                    ? Carbon::parse($updateData['start_date']) 
                    : $tithe->start_date;
                $frequency = $updateData['frequency'] ?? $tithe->frequency;
                
                $updateData['next_due_date'] = $frequency === 'weekly' 
                    ? $startDate->copy()->addWeek() 
                    : $startDate->copy()->addMonth();
            }

            $tithe->update($updateData);
            $tithe->load(['member', 'creator', 'updater']);

            return response()->json([
                'success' => true,
                'data' => $tithe,
                'message' => 'Tithe updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating tithe: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark tithe as paid
     */
    public function markAsPaid(Request $request, Tithe $tithe): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Check if user can access this tithe
            if (!$this->canAccessTithe($user, $tithe)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to access this tithe'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'paid_amount' => 'sometimes|numeric|min:0.01',
                'notes' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::transaction(function () use ($tithe, $request) {
                // Mark current tithe as paid
                $tithe->markAsPaid(
                    $request->paid_amount,
                    $request->notes
                );

                // Create next recurring tithe if active
                if ($tithe->is_active) {
                    $tithe->createNextRecurring();
                }
            });

            $tithe->refresh()->load(['member', 'creator', 'updater']);

            return response()->json([
                'success' => true,
                'data' => $tithe,
                'message' => 'Tithe marked as paid successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error marking tithe as paid: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified tithe
     */
    public function destroy(Tithe $tithe): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Only admins and pastors can delete tithes
            if (!$user->hasRole('admin') && !$user->hasRole('pastor')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete tithes'
                ], 403);
            }

            $tithe->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tithe deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting tithe: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get tithe statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = Tithe::query();

            // Role-based access control
            if ($user->hasRole('admin') || $user->hasRole('pastor')) {
                // Admin and pastor can see all statistics
            } elseif ($user->hasRole('family-head')) {
                // Family head can only see statistics from their family members
                $family = Family::where('family_head_id', $user->member->id)->first();
                if ($family) {
                    $memberIds = $family->members->pluck('id');
                    $query->whereIn('member_id', $memberIds);
                } else {
                    $query->where('member_id', $user->member->id);
                }
            } else {
                // Regular members can only see their own statistics
                $query->where('member_id', $user->member->id);
            }

            // Date range filter
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date]);
            }

            $statistics = [
                'total_tithes' => $query->count(),
                'active_tithes' => $query->clone()->active()->count(),
                'paid_tithes' => $query->clone()->paid()->count(),
                'unpaid_tithes' => $query->clone()->unpaid()->count(),
                'overdue_tithes' => $query->clone()->overdue()->count(),
                'partially_paid_tithes' => $query->clone()->partiallyPaid()->count(),
                'total_amount' => $query->clone()->sum('amount'),
                'total_paid_amount' => $query->clone()->sum('paid_amount'),
                'total_outstanding' => $query->clone()->unpaid()->sum('remaining_amount'),
                'weekly_tithes' => $query->clone()->where('frequency', 'weekly')->count(),
                'monthly_tithes' => $query->clone()->where('frequency', 'monthly')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $statistics,
                'message' => 'Tithe statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving tithe statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly trends for tithes
     */
    public function monthlyTrends(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = Tithe::query();

            // Apply role-based access control
            $this->applyRoleBasedAccess($user, $query);

            // Date range filter
            $startDate = $request->get('start_date', now()->subMonths(11)->startOfMonth());
            $endDate = $request->get('end_date', now()->endOfMonth());

            $trends = DB::table('tithes')
                ->selectRaw('
                    YEAR(start_date) as year,
                    MONTH(start_date) as month,
                    COUNT(*) as total_tithes,
                    SUM(amount) as total_amount,
                    SUM(paid_amount) as total_paid,
                    SUM(remaining_amount) as total_outstanding,
                    COUNT(CASE WHEN is_paid = 1 THEN 1 END) as paid_count,
                    COUNT(CASE WHEN is_paid = 0 THEN 1 END) as unpaid_count
                ')
                ->whereBetween('start_date', [$startDate, $endDate]);

            // Apply role-based filtering
            if (!$user->hasRole('admin') && !$user->hasRole('pastor')) {
                if ($user->hasRole('family-head')) {
                    $family = Family::where('family_head_id', $user->member->id)->first();
                    if ($family) {
                        $memberIds = $family->members->pluck('id');
                        $trends->whereIn('member_id', $memberIds);
                    } else {
                        $trends->where('member_id', $user->member->id);
                    }
                } else {
                    $trends->where('member_id', $user->member->id);
                }
            }

            $trends = $trends->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'period' => Carbon::createFromDate($item->year, $item->month, 1)->format('M Y'),
                        'total_tithes' => $item->total_tithes,
                        'total_amount' => $item->total_amount,
                        'total_paid' => $item->total_paid,
                        'total_outstanding' => $item->total_outstanding,
                        'paid_count' => $item->paid_count,
                        'unpaid_count' => $item->unpaid_count,
                        'payment_rate' => $item->total_tithes > 0 ? round(($item->paid_count / $item->total_tithes) * 100, 2) : 0
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $trends,
                'message' => 'Monthly trends retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving monthly trends: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get member performance analytics
     */
    public function memberPerformance(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = Tithe::query();

            // Apply role-based access control
            $this->applyRoleBasedAccess($user, $query);

            // Date range filter
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date]);
            }

            $performance = $query->with('member')
                ->selectRaw('
                    member_id,
                    COUNT(*) as total_tithes,
                    SUM(amount) as total_amount,
                    SUM(paid_amount) as total_paid,
                    SUM(remaining_amount) as total_outstanding,
                    COUNT(CASE WHEN is_paid = 1 THEN 1 END) as paid_count,
                    COUNT(CASE WHEN is_paid = 0 THEN 1 END) as unpaid_count,
                    COUNT(CASE WHEN next_due_date < NOW() AND is_paid = 0 THEN 1 END) as overdue_count
                ')
                ->groupBy('member_id')
                ->orderBy('total_amount', 'desc')
                ->limit(20)
                ->get()
                ->map(function ($item) {
                    return [
                        'member' => [
                            'id' => $item->member->id,
                            'name' => $item->member->full_name,
                        ],
                        'total_tithes' => $item->total_tithes,
                        'total_amount' => $item->total_amount,
                        'total_paid' => $item->total_paid,
                        'total_outstanding' => $item->total_outstanding,
                        'paid_count' => $item->paid_count,
                        'unpaid_count' => $item->unpaid_count,
                        'overdue_count' => $item->overdue_count,
                        'payment_rate' => $item->total_tithes > 0 ? round(($item->paid_count / $item->total_tithes) * 100, 2) : 0,
                        'average_amount' => $item->total_tithes > 0 ? round($item->total_amount / $item->total_tithes, 2) : 0
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $performance,
                'message' => 'Member performance retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving member performance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get frequency analysis
     */
    public function frequencyAnalysis(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = Tithe::query();

            // Apply role-based access control
            $this->applyRoleBasedAccess($user, $query);

            // Date range filter
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date]);
            }

            $analysis = [
                'weekly' => [
                    'count' => $query->clone()->where('frequency', 'weekly')->count(),
                    'total_amount' => $query->clone()->where('frequency', 'weekly')->sum('amount'),
                    'paid_amount' => $query->clone()->where('frequency', 'weekly')->sum('paid_amount'),
                    'outstanding' => $query->clone()->where('frequency', 'weekly')->unpaid()->sum('remaining_amount'),
                    'paid_count' => $query->clone()->where('frequency', 'weekly')->paid()->count(),
                    'unpaid_count' => $query->clone()->where('frequency', 'weekly')->unpaid()->count(),
                ],
                'monthly' => [
                    'count' => $query->clone()->where('frequency', 'monthly')->count(),
                    'total_amount' => $query->clone()->where('frequency', 'monthly')->sum('amount'),
                    'paid_amount' => $query->clone()->where('frequency', 'monthly')->sum('paid_amount'),
                    'outstanding' => $query->clone()->where('frequency', 'monthly')->unpaid()->sum('remaining_amount'),
                    'paid_count' => $query->clone()->where('frequency', 'monthly')->paid()->count(),
                    'unpaid_count' => $query->clone()->where('frequency', 'monthly')->unpaid()->count(),
                ]
            ];

            // Calculate percentages
            $totalTithes = $analysis['weekly']['count'] + $analysis['monthly']['count'];
            if ($totalTithes > 0) {
                $analysis['weekly']['percentage'] = round(($analysis['weekly']['count'] / $totalTithes) * 100, 2);
                $analysis['monthly']['percentage'] = round(($analysis['monthly']['count'] / $totalTithes) * 100, 2);
            } else {
                $analysis['weekly']['percentage'] = 0;
                $analysis['monthly']['percentage'] = 0;
            }

            return response()->json([
                'success' => true,
                'data' => $analysis,
                'message' => 'Frequency analysis retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving frequency analysis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export tithe report
     */
    public function exportReport(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $format = $request->get('format', 'excel');
            $type = $request->get('type', 'summary');

            // Validate format
            if (!in_array($format, ['excel', 'pdf', 'csv'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid export format'
                ], 422);
            }

            // Get data based on type
            $data = $this->getExportData($user, $request, $type);

            // Generate file using ExportService
            $exportService = new \App\Services\ExportService();
            $startDate = $request->get('start_date', now()->subMonths(1)->format('Y-m-d'));
            $endDate = $request->get('end_date', now()->format('Y-m-d'));
            
            switch ($format) {
                case 'excel':
                    $filePath = $exportService->exportToExcel($data, $type, $startDate, $endDate);
                    break;
                case 'pdf':
                    $filePath = $exportService->exportToPdf($data, $type, $startDate, $endDate);
                    break;
                case 'csv':
                    $filePath = $exportService->exportToCsv($data, $type, $startDate, $endDate);
                    break;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'file_url' => url('/storage/exports/' . basename($filePath)),
                    'file_name' => basename($filePath)
                ],
                'message' => 'Report exported successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error exporting report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent tithe activity
     */
    public function recentActivity(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = Tithe::query();

            // Apply role-based access control
            $this->applyRoleBasedAccess($user, $query);

            // Get recent tithes
            $recentTithes = $query->with(['member', 'payments'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($tithe) {
                    $timeString = 'Recently';
                    try {
                        if ($tithe->created_at) {
                            $createdDate = is_string($tithe->created_at) 
                                ? Carbon::parse($tithe->created_at) 
                                : $tithe->created_at;
                            $timeString = $createdDate->diffForHumans();
                        }
                    } catch (\Exception $e) {
                        $timeString = 'Recently';
                    }

                    return [
                        'type' => 'Tithe',
                        'amount' => '$' . number_format($tithe->amount, 2),
                        'description' => $tithe->member ? $tithe->member->full_name . ' - ' . ucfirst($tithe->frequency) . ' tithe' : 'Tithe created',
                        'time' => $timeString,
                        'color' => $tithe->is_paid ? 'text-green-600' : 'text-yellow-600',
                        'status' => $tithe->is_paid ? 'Paid' : 'Unpaid'
                    ];
                });

            // Get recent payments
            $recentPayments = TithePayment::with(['tithe.member'])
                ->orderBy('payment_date', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($payment) {
                    $timeString = 'Recently';
                    try {
                        if ($payment->payment_date) {
                            $paymentDate = is_string($payment->payment_date) 
                                ? Carbon::parse($payment->payment_date) 
                                : $payment->payment_date;
                            $timeString = $paymentDate->diffForHumans();
                        }
                    } catch (\Exception $e) {
                        $timeString = 'Recently';
                    }

                    return [
                        'type' => 'Payment',
                        'amount' => '+$' . number_format($payment->amount, 2),
                        'description' => $payment->tithe && $payment->tithe->member ? 
                            $payment->tithe->member->full_name . ' - Payment received' : 'Payment received',
                        'time' => $timeString,
                        'color' => 'text-green-600',
                        'status' => 'Paid'
                    ];
                });

            $recentActivity = $recentTithes->concat($recentPayments)
                ->sortByDesc(function ($item) {
                    return $item['time'];
                })
                ->take(15)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $recentActivity,
                'message' => 'Recent activity retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving recent activity: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Apply role-based access control to query
     */
    private function applyRoleBasedAccess($user, $query): void
    {
        if (!$user->hasRole('admin') && !$user->hasRole('pastor')) {
            if ($user->hasRole('family-head')) {
                $family = Family::where('family_head_id', $user->member->id)->first();
                if ($family) {
                    $memberIds = $family->members->pluck('id');
                    $query->whereIn('member_id', $memberIds);
                } else {
                    $query->where('member_id', $user->member->id);
                }
            } else {
                $query->where('member_id', $user->member->id);
            }
        }
    }

    /**
     * Get data for export
     */
    private function getExportData($user, $request, $type): array
    {
        $query = Tithe::query();
        $this->applyRoleBasedAccess($user, $query);

        // Date range filter
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('start_date', [$request->start_date, $request->end_date]);
        }

        switch ($type) {
            case 'summary':
                return $this->getSummaryData($query);
            case 'detailed':
                return $this->getDetailedData($query);
            case 'member_performance':
                return $this->getMemberPerformanceData($query);
            default:
                return $this->getSummaryData($query);
        }
    }

    /**
     * Get summary data for export
     */
    private function getSummaryData($query): array
    {
        $statistics = [
            'total_tithes' => $query->count(),
            'active_tithes' => $query->clone()->active()->count(),
            'paid_tithes' => $query->clone()->paid()->count(),
            'unpaid_tithes' => $query->clone()->unpaid()->count(),
            'overdue_tithes' => $query->clone()->overdue()->count(),
            'total_amount' => $query->clone()->sum('amount'),
            'total_paid_amount' => $query->clone()->sum('paid_amount'),
            'total_outstanding' => $query->clone()->unpaid()->sum('remaining_amount'),
        ];

        return [
            'title' => 'Tithe Summary Report',
            'headers' => ['Metric', 'Value'],
            'data' => [
                ['Total Tithes', $statistics['total_tithes']],
                ['Active Tithes', $statistics['active_tithes']],
                ['Paid Tithes', $statistics['paid_tithes']],
                ['Unpaid Tithes', $statistics['unpaid_tithes']],
                ['Overdue Tithes', $statistics['overdue_tithes']],
                ['Total Amount', '$' . number_format($statistics['total_amount'], 2)],
                ['Total Paid', '$' . number_format($statistics['total_paid_amount'], 2)],
                ['Total Outstanding', '$' . number_format($statistics['total_outstanding'], 2)],
            ]
        ];
    }

    /**
     * Get detailed data for export
     */
    private function getDetailedData($query): array
    {
        $tithes = $query->with(['member', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($tithe) {
                return [
                    $tithe->member ? $tithe->member->full_name : 'N/A',
                    '$' . number_format($tithe->amount, 2),
                    ucfirst($tithe->frequency),
                    $tithe->start_date->format('M d, Y'),
                    $tithe->is_paid ? 'Paid' : 'Unpaid',
                    '$' . number_format($tithe->paid_amount, 2),
                    '$' . number_format($tithe->remaining_amount, 2),
                    $tithe->creator ? $tithe->creator->name : 'N/A',
                    $tithe->created_at->format('M d, Y'),
                ];
            });

        return [
            'title' => 'Detailed Tithe Report',
            'headers' => ['Member', 'Amount', 'Frequency', 'Start Date', 'Status', 'Paid Amount', 'Outstanding', 'Created By', 'Created Date'],
            'data' => $tithes->toArray()
        ];
    }

    /**
     * Get member performance data for export
     */
    private function getMemberPerformanceData($query): array
    {
        $performance = $query->with('member')
            ->selectRaw('
                member_id,
                COUNT(*) as total_tithes,
                SUM(amount) as total_amount,
                SUM(paid_amount) as total_paid,
                SUM(remaining_amount) as total_outstanding,
                COUNT(CASE WHEN is_paid = 1 THEN 1 END) as paid_count
            ')
            ->groupBy('member_id')
            ->orderBy('total_amount', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    $item->member ? $item->member->full_name : 'N/A',
                    $item->total_tithes,
                    '$' . number_format($item->total_amount, 2),
                    '$' . number_format($item->total_paid, 2),
                    '$' . number_format($item->total_outstanding, 2),
                    $item->total_tithes > 0 ? round(($item->paid_count / $item->total_tithes) * 100, 2) . '%' : '0%',
                ];
            });

        return [
            'title' => 'Member Performance Report',
            'headers' => ['Member', 'Total Tithes', 'Total Amount', 'Total Paid', 'Total Outstanding', 'Payment Rate'],
            'data' => $performance->toArray()
        ];
    }

    /**
     * Check if user can access a specific tithe
     */
    private function canAccessTithe($user, Tithe $tithe): bool
    {
        if ($user->hasRole('admin') || $user->hasRole('pastor')) {
            return true;
        }

        if ($user->hasRole('family-head')) {
            $family = Family::where('family_head_id', $user->member->id)->first();
            if ($family) {
                $memberIds = $family->members->pluck('id');
                return $memberIds->contains($tithe->member_id);
            }
        }

        return $tithe->member_id === $user->member->id;
    }
} 