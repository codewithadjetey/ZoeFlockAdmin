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
                'total_amount' => $query->clone()->sum('amount'),
                'total_paid_amount' => $query->clone()->paid()->sum('paid_amount'),
                'total_outstanding' => $query->clone()->unpaid()->sum('amount'),
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