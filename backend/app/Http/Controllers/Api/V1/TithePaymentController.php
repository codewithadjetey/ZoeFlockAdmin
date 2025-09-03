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

/**
 * @OA\Tag(
 *     name="Tithe Payments",
 *     description="API Endpoints for tithe payment management"
 * )
 */
class TithePaymentController extends Controller
{
    /**
     * Add a partial payment to a tithe
     * 
     * @OA\Post(
     *     path="/api/v1/tithes/{tithe}/payments",
     *     summary="Add a partial payment to a tithe",
     *     tags={"Tithe Payments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tithe",
     *         in="path",
     *         description="Tithe ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"amount", "payment_method"},
     *             @OA\Property(property="amount", type="number", format="float", example=50.00, description="Payment amount"),
     *             @OA\Property(property="payment_method", type="string", enum={"cash", "check", "bank_transfer", "mobile_money", "other"}, example="cash", description="Payment method"),
     *             @OA\Property(property="reference_number", type="string", example="REF123456", description="Payment reference number"),
     *             @OA\Property(property="notes", type="string", example="Partial payment", description="Payment notes"),
     *             @OA\Property(property="payment_date", type="string", format="date", example="2024-01-15", description="Payment date")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Payment added successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="member_id", type="integer", example=1),
     *                 @OA\Property(property="amount", type="number", format="float", example=100.00),
     *                 @OA\Property(property="frequency", type="string", example="monthly"),
     *                 @OA\Property(property="start_date", type="string", format="date-time"),
     *                 @OA\Property(property="next_due_date", type="string", format="date-time"),
     *                 @OA\Property(property="is_active", type="boolean", example=true),
     *                 @OA\Property(property="is_paid", type="boolean", example=false),
     *                 @OA\Property(property="paid_amount", type="number", format="float", example=50.00),
     *                 @OA\Property(property="remaining_amount", type="number", format="float", example=50.00),
     *                 @OA\Property(property="notes", type="string", example="Monthly tithe"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="member", type="object"),
     *                 @OA\Property(property="creator", type="object"),
     *                 @OA\Property(property="payments", type="array", @OA\Items(type="object"))
     *             ),
     *             @OA\Property(property="message", type="string", example="Payment added successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad request",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="This tithe is already fully paid")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Unauthorized to access this tithe")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error adding payment")
     *         )
     *     )
     * )
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
     * 
     * @OA\Get(
     *     path="/api/v1/tithes/{tithe}/payments",
     *     summary="Get payment history for a tithe",
     *     tags={"Tithe Payments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tithe",
     *         in="path",
     *         description="Tithe ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Payment history retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="tithe_id", type="integer", example=1),
     *                 @OA\Property(property="amount", type="number", format="float", example=50.00),
     *                 @OA\Property(property="payment_method", type="string", example="cash"),
     *                 @OA\Property(property="reference_number", type="string", example="REF123456"),
     *                 @OA\Property(property="notes", type="string", example="Partial payment"),
     *                 @OA\Property(property="payment_date", type="string", format="date-time"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="recorder", type="object")
     *             )),
     *             @OA\Property(property="message", type="string", example="Payment history retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Unauthorized to access this tithe")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error retrieving payment history")
     *         )
     *     )
     * )
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
     * 
     * @OA\Get(
     *     path="/api/v1/tithes/{tithe}/payments/{payment}",
     *     summary="Get a specific payment",
     *     tags={"Tithe Payments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tithe",
     *         in="path",
     *         description="Tithe ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="payment",
     *         in="path",
     *         description="Payment ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Payment retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="tithe_id", type="integer", example=1),
     *                 @OA\Property(property="amount", type="number", format="float", example=50.00),
     *                 @OA\Property(property="payment_method", type="string", example="cash"),
     *                 @OA\Property(property="reference_number", type="string", example="REF123456"),
     *                 @OA\Property(property="notes", type="string", example="Partial payment"),
     *                 @OA\Property(property="payment_date", type="string", format="date-time"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="recorder", type="object")
     *             ),
     *             @OA\Property(property="message", type="string", example="Payment retrieved successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Unauthorized to access this tithe")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Payment not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Payment not found for this tithe")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error retrieving payment")
     *         )
     *     )
     * )
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
     * 
     * @OA\Put(
     *     path="/api/v1/tithes/{tithe}/payments/{payment}",
     *     summary="Update a payment",
     *     tags={"Tithe Payments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tithe",
     *         in="path",
     *         description="Tithe ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="payment",
     *         in="path",
     *         description="Payment ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="amount", type="number", format="float", example=50.00, description="Payment amount"),
     *             @OA\Property(property="payment_method", type="string", enum={"cash", "check", "bank_transfer", "mobile_money", "other"}, example="cash", description="Payment method"),
     *             @OA\Property(property="reference_number", type="string", example="REF123456", description="Payment reference number"),
     *             @OA\Property(property="notes", type="string", example="Updated payment", description="Payment notes"),
     *             @OA\Property(property="payment_date", type="string", format="date", example="2024-01-15", description="Payment date")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Payment updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="payment", type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="tithe_id", type="integer", example=1),
     *                     @OA\Property(property="amount", type="number", format="float", example=50.00),
     *                     @OA\Property(property="payment_method", type="string", example="cash"),
     *                     @OA\Property(property="reference_number", type="string", example="REF123456"),
     *                     @OA\Property(property="notes", type="string", example="Updated payment"),
     *                     @OA\Property(property="payment_date", type="string", format="date-time"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time"),
     *                     @OA\Property(property="recorder", type="object")
     *                 ),
     *                 @OA\Property(property="tithe", type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="member_id", type="integer", example=1),
     *                     @OA\Property(property="amount", type="number", format="float", example=100.00),
     *                     @OA\Property(property="frequency", type="string", example="monthly"),
     *                     @OA\Property(property="start_date", type="string", format="date-time"),
     *                     @OA\Property(property="next_due_date", type="string", format="date-time"),
     *                     @OA\Property(property="is_active", type="boolean", example=true),
     *                     @OA\Property(property="is_paid", type="boolean", example=false),
     *                     @OA\Property(property="paid_amount", type="number", format="float", example=50.00),
     *                     @OA\Property(property="remaining_amount", type="number", format="float", example=50.00),
     *                     @OA\Property(property="notes", type="string", example="Monthly tithe"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time"),
     *                     @OA\Property(property="member", type="object"),
     *                     @OA\Property(property="creator", type="object"),
     *                     @OA\Property(property="payments", type="array", @OA\Items(type="object"))
     *                 )
     *             ),
     *             @OA\Property(property="message", type="string", example="Payment updated successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad request",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="New payment amount would exceed remaining tithe amount")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Unauthorized to update payments")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Payment not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Payment not found for this tithe")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error updating payment")
     *         )
     *     )
     * )
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
     * 
     * @OA\Delete(
     *     path="/api/v1/tithes/{tithe}/payments/{payment}",
     *     summary="Delete a payment",
     *     tags={"Tithe Payments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tithe",
     *         in="path",
     *         description="Tithe ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="payment",
     *         in="path",
     *         description="Payment ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Payment deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="member_id", type="integer", example=1),
     *                 @OA\Property(property="amount", type="number", format="float", example=100.00),
     *                 @OA\Property(property="frequency", type="string", example="monthly"),
     *                 @OA\Property(property="start_date", type="string", format="date-time"),
     *                 @OA\Property(property="next_due_date", type="string", format="date-time"),
     *                 @OA\Property(property="is_active", type="boolean", example=true),
     *                 @OA\Property(property="is_paid", type="boolean", example=false),
     *                 @OA\Property(property="paid_amount", type="number", format="float", example=0.00),
     *                 @OA\Property(property="remaining_amount", type="number", format="float", example=100.00),
     *                 @OA\Property(property="notes", type="string", example="Monthly tithe"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="member", type="object"),
     *                 @OA\Property(property="creator", type="object"),
     *                 @OA\Property(property="payments", type="array", @OA\Items(type="object"))
     *             ),
     *             @OA\Property(property="message", type="string", example="Payment deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Unauthorized to delete payments")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Payment not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Payment not found for this tithe")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error deleting payment")
     *         )
     *     )
     * )
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