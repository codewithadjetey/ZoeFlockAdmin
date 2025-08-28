<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tithe;
use App\Models\TithePayment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TithePaymentController extends Controller
{
    /**
     * Add a partial payment to a tithe
     */
    public function store(Request $request, Tithe $tithe): JsonResponse
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
                'amount' => 'required|numeric|min:0.01',
                'payment_method' => 'required|in:cash,check,bank_transfer,mobile_money,other',
                'reference_number' => 'nullable|string|max:100',
                'notes' => 'nullable|string|max:1000',
                'payment_date' => 'sometimes|date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if tithe is already fully paid
            if ($tithe->isFullyPaid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This tithe is already fully paid'
                ], 400);
            }

            // Check if payment amount exceeds remaining amount
            if ($request->amount > $tithe->remaining_amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment amount cannot exceed remaining amount of ' . $tithe->remaining_amount
                ], 400);
            }

            DB::transaction(function () use ($tithe, $request, $user) {
                // Add payment to tithe
                $payment = $tithe->addPayment(
                    $request->amount,
                    $request->payment_method,
                    $request->reference_number,
                    $request->notes,
                    $user->id
                );

                // Set custom payment date if provided
                if ($request->has('payment_date')) {
                    $payment->payment_date = $request->payment_date;
                    $payment->save();
                }
            });

            $tithe->refresh()->load(['member', 'creator', 'payments']);

            return response()->json([
                'success' => true,
                'data' => $tithe,
                'message' => 'Payment added successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment history for a tithe
     */
    public function index(Request $request, Tithe $tithe): JsonResponse
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

            $payments = $tithe->payments()
                ->with(['recorder'])
                ->orderBy('payment_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $payments,
                'message' => 'Payment history retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving payment history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific payment
     */
    public function show(Tithe $tithe, TithePayment $payment): JsonResponse
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

            // Verify payment belongs to this tithe
            if ($payment->tithe_id !== $tithe->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found for this tithe'
                ], 404);
            }

            $payment->load(['recorder']);

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Payment retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a payment
     */
    public function update(Request $request, Tithe $tithe, TithePayment $payment): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Only admins and pastors can update payments
            if (!$user->hasRole('admin') && !$user->hasRole('pastor')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update payments'
                ], 403);
            }

            // Verify payment belongs to this tithe
            if ($payment->tithe_id !== $tithe->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found for this tithe'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'amount' => 'sometimes|numeric|min:0.01',
                'payment_method' => 'sometimes|in:cash,check,bank_transfer,mobile_money,other',
                'reference_number' => 'nullable|string|max:100',
                'notes' => 'nullable|string|max:1000',
                'payment_date' => 'sometimes|date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // If amount is being changed, we need to recalculate tithe totals
            if ($request->has('amount') && $request->amount != $payment->amount) {
                $amountDifference = $request->amount - $payment->amount;
                
                // Check if new amount would exceed remaining amount
                if ($amountDifference > $tithe->remaining_amount) {
                    return response()->json([
                        'success' => false,
                        'message' => 'New payment amount would exceed remaining tithe amount'
                    ], 400);
                }

                DB::transaction(function () use ($tithe, $payment, $request, $amountDifference) {
                    // Update payment
                    $payment->update($request->only([
                        'amount', 'payment_method', 'reference_number', 'notes', 'payment_date'
                    ]));

                    // Recalculate tithe totals
                    $tithe->paid_amount += $amountDifference;
                    $tithe->remaining_amount -= $amountDifference;
                    
                    // Check if fully paid
                    if ($tithe->remaining_amount <= 0) {
                        $tithe->is_paid = true;
                        $tithe->paid_date = now();
                        $tithe->next_due_date = $tithe->calculateNextDueDate();
                    }
                    
                    $tithe->save();
                });
            } else {
                // Update payment without changing amount
                $payment->update($request->only([
                    'payment_method', 'reference_number', 'notes', 'payment_date'
                ]));
            }

            $payment->refresh()->load(['recorder']);
            $tithe->refresh()->load(['member', 'creator', 'payments']);

            return response()->json([
                'success' => true,
                'data' => [
                    'payment' => $payment,
                    'tithe' => $tithe
                ],
                'message' => 'Payment updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a payment
     */
    public function destroy(Tithe $tithe, TithePayment $payment): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Only admins and pastors can delete payments
            if (!$user->hasRole('admin') && !$user->hasRole('pastor')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete payments'
                ], 403);
            }

            // Verify payment belongs to this tithe
            if ($payment->tithe_id !== $tithe->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found for this tithe'
                ], 404);
            }

            DB::transaction(function () use ($tithe, $payment) {
                // Recalculate tithe totals
                $tithe->paid_amount -= $payment->amount;
                $tithe->remaining_amount += $payment->amount;
                
                // Reset paid status if not fully paid
                if ($tithe->remaining_amount > 0) {
                    $tithe->is_paid = false;
                    $tithe->paid_date = null;
                }
                
                $tithe->save();
                
                // Delete payment
                $payment->delete();
            });

            $tithe->refresh()->load(['member', 'creator', 'payments']);

            return response()->json([
                'success' => true,
                'data' => $tithe,
                'message' => 'Payment deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting payment: ' . $e->getMessage()
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