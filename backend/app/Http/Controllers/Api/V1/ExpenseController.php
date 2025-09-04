<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * @OA\Tag(
 *     name="Expenses",
 *     description="API Endpoints for expense management"
 * )
 */
class ExpenseController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-expenses');
        
        // Apply specific permissions to methods
        $this->middleware('permission:create-expenses')->only(['store']);
        $this->middleware('permission:edit-expenses')->only(['update']);
        $this->middleware('permission:delete-expenses')->only(['destroy']);
    }

    /**
     * Display a listing of expenses
     * 
     * @OA\Get(
     *     path="/api/v1/expenses",
     *     summary="Get all expenses",
     *     tags={"Expenses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of records per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=10)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Expenses retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="category_id", type="integer", example=1),
     *                 @OA\Property(property="description", type="string", example="Office supplies"),
     *                 @OA\Property(property="amount", type="number", example=150.00),
     *                 @OA\Property(property="paid_date", type="string", format="date", example="2024-01-15"),
     *                 @OA\Property(property="due_date", type="string", format="date", example="2024-01-20"),
     *                 @OA\Property(property="is_paid", type="boolean", example=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="category", type="object")
     *             )),
     *             @OA\Property(property="meta", type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=1),
     *                 @OA\Property(property="per_page", type="integer", example=10),
     *                 @OA\Property(property="total", type="integer", example=1)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $expenses = Expense::with('category')->orderBy('id', 'desc')->paginate($perPage);
        return response()->json([
            'data' => $expenses->items(),
            'meta' => [
                'current_page' => $expenses->currentPage(),
                'last_page' => $expenses->lastPage(),
                'per_page' => $expenses->perPage(),
                'total' => $expenses->total(),
            ],
        ]);
    }

    /**
     * Store a newly created expense
     * 
     * @OA\Post(
     *     path="/api/v1/expenses",
     *     summary="Create a new expense",
     *     tags={"Expenses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"category_id","amount","paid_date"},
     *             @OA\Property(property="category_id", type="integer", example=1, description="Expense category ID"),
     *             @OA\Property(property="description", type="string", example="Office supplies", description="Expense description"),
     *             @OA\Property(property="amount", type="number", example=150.00, description="Expense amount"),
     *             @OA\Property(property="paid_date", type="string", format="date", example="2024-01-15", description="Date when expense was paid"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-01-20", description="Due date for payment"),
     *             @OA\Property(property="is_paid", type="boolean", example=true, description="Whether the expense is paid")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Expense created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="description", type="string", example="Office supplies"),
     *             @OA\Property(property="amount", type="number", example=150.00),
     *             @OA\Property(property="paid_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-01-20"),
     *             @OA\Property(property="is_paid", type="boolean", example=true),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time"),
     *             @OA\Property(property="category", type="object")
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
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:expense_categories,id',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'paid_date' => 'required|date',
            'due_date' => 'nullable|date',
            'is_paid' => 'boolean',
        ]);
        $expense = Expense::create($validated);
        return response()->json($expense->load('category'), 201);
    }

    /**
     * Display the specified expense
     * 
     * @OA\Get(
     *     path="/api/v1/expenses/{id}",
     *     summary="Get a specific expense",
     *     tags={"Expenses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Expense ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Expense retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="description", type="string", example="Office supplies"),
     *             @OA\Property(property="amount", type="number", example=150.00),
     *             @OA\Property(property="paid_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-01-20"),
     *             @OA\Property(property="is_paid", type="boolean", example=true),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time"),
     *             @OA\Property(property="category", type="object")
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
     *         response=404,
     *         description="Expense not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Expense not found")
     *         )
     *     )
     * )
     */
    public function show($id)
    {
        $expense = Expense::with('category')->findOrFail($id);
        return response()->json($expense);
    }

    /**
     * Update the specified expense
     * 
     * @OA\Put(
     *     path="/api/v1/expenses/{id}",
     *     summary="Update an expense",
     *     tags={"Expenses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Expense ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="category_id", type="integer", example=1, description="Expense category ID"),
     *             @OA\Property(property="description", type="string", example="Office supplies", description="Expense description"),
     *             @OA\Property(property="amount", type="number", example=150.00, description="Expense amount"),
     *             @OA\Property(property="paid_date", type="string", format="date", example="2024-01-15", description="Date when expense was paid"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-01-20", description="Due date for payment"),
     *             @OA\Property(property="is_paid", type="boolean", example=true, description="Whether the expense is paid")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Expense updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="description", type="string", example="Office supplies"),
     *             @OA\Property(property="amount", type="number", example=150.00),
     *             @OA\Property(property="paid_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-01-20"),
     *             @OA\Property(property="is_paid", type="boolean", example=true),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time"),
     *             @OA\Property(property="category", type="object")
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
     *         response=404,
     *         description="Expense not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Expense not found")
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
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:expense_categories,id',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0',
            'paid_date' => 'sometimes|required|date',
            'due_date' => 'nullable|date',
            'is_paid' => 'boolean',
        ]);
        $expense->update($validated);
        return response()->json($expense->load('category'));
    }

    /**
     * Remove the specified expense
     * 
     * @OA\Delete(
     *     path="/api/v1/expenses/{id}",
     *     summary="Delete an expense",
     *     tags={"Expenses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Expense ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Expense deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Deleted successfully")
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
     *         response=404,
     *         description="Expense not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Expense not found")
     *         )
     *     )
     * )
     */
    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}