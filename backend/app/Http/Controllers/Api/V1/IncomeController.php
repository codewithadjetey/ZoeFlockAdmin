<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Income;
use App\Models\IncomeCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * @OA\Tag(
 *     name="Income",
 *     description="API Endpoints for income management"
 * )
 */
class IncomeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-incomes');
        
        // Apply specific permissions to methods
        $this->middleware('permission:create-incomes')->only(['store']);
        $this->middleware('permission:edit-incomes')->only(['update']);
        $this->middleware('permission:delete-incomes')->only(['destroy']);
    }

    /**
     * Display a listing of income records
     * 
     * @OA\Get(
     *     path="/api/v1/incomes",
     *     summary="Get all income records",
     *     tags={"Income"},
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
     *         description="Income records retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="category_id", type="integer", example=1),
     *                 @OA\Property(property="description", type="string", example="Sunday offering"),
     *                 @OA\Property(property="amount", type="number", example=2500.00),
     *                 @OA\Property(property="received_date", type="string", format="date", example="2024-01-15"),
     *                 @OA\Property(property="due_date", type="string", format="date", example="2024-01-20"),
     *                 @OA\Property(property="is_received", type="boolean", example=true),
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
        $incomes = Income::with('category')->orderBy('id', 'desc')->paginate($perPage);
        return response()->json([
            'data' => $incomes->items(),
            'meta' => [
                'current_page' => $incomes->currentPage(),
                'last_page' => $incomes->lastPage(),
                'per_page' => $incomes->perPage(),
                'total' => $incomes->total(),
            ],
        ]);
    }

    /**
     * Store a newly created income record
     * 
     * @OA\Post(
     *     path="/api/v1/incomes",
     *     summary="Create a new income record",
     *     tags={"Income"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"category_id","amount","received_date"},
     *             @OA\Property(property="category_id", type="integer", example=1, description="Income category ID"),
     *             @OA\Property(property="description", type="string", example="Sunday offering", description="Income description"),
     *             @OA\Property(property="amount", type="number", example=2500.00, description="Income amount"),
     *             @OA\Property(property="received_date", type="string", format="date", example="2024-01-15", description="Date when income was received"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-01-20", description="Due date for receipt"),
     *             @OA\Property(property="is_received", type="boolean", example=true, description="Whether the income is received")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Income record created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="description", type="string", example="Sunday offering"),
     *             @OA\Property(property="amount", type="number", example=2500.00),
     *             @OA\Property(property="received_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-01-20"),
     *             @OA\Property(property="is_received", type="boolean", example=true),
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
            'category_id' => 'required|exists:income_categories,id',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'received_date' => 'required|date',
            'due_date' => 'nullable|date',
            'is_received' => 'boolean',
        ]);
        $income = Income::create($validated);
        return response()->json($income->load('category'), 201);
    }

    /**
     * Display the specified income record
     * 
     * @OA\Get(
     *     path="/api/v1/incomes/{id}",
     *     summary="Get a specific income record",
     *     tags={"Income"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Income record ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Income record retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="description", type="string", example="Sunday offering"),
     *             @OA\Property(property="amount", type="number", example=2500.00),
     *             @OA\Property(property="received_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-01-20"),
     *             @OA\Property(property="is_received", type="boolean", example=true),
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
     *         description="Income record not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Income record not found")
     *         )
     *     )
     * )
     */
    public function show($id)
    {
        $income = Income::with('category')->findOrFail($id);
        return response()->json($income);
    }

    /**
     * Update the specified income record
     * 
     * @OA\Put(
     *     path="/api/v1/incomes/{id}",
     *     summary="Update an income record",
     *     tags={"Income"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Income record ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="category_id", type="integer", example=1, description="Income category ID"),
     *             @OA\Property(property="description", type="string", example="Sunday offering", description="Income description"),
     *             @OA\Property(property="amount", type="number", example=2500.00, description="Income amount"),
     *             @OA\Property(property="received_date", type="string", format="date", example="2024-01-15", description="Date when income was received"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-01-20", description="Due date for receipt"),
     *             @OA\Property(property="is_received", type="boolean", example=true, description="Whether the income is received")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Income record updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="description", type="string", example="Sunday offering"),
     *             @OA\Property(property="amount", type="number", example=2500.00),
     *             @OA\Property(property="received_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-01-20"),
     *             @OA\Property(property="is_received", type="boolean", example=true),
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
     *         description="Income record not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Income record not found")
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
        $income = Income::findOrFail($id);
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:income_categories,id',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0',
            'received_date' => 'sometimes|required|date',
            'due_date' => 'nullable|date',
            'is_received' => 'boolean',
        ]);
        $income->update($validated);
        return response()->json($income->load('category'));
    }

    /**
     * Remove the specified income record
     * 
     * @OA\Delete(
     *     path="/api/v1/incomes/{id}",
     *     summary="Delete an income record",
     *     tags={"Income"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Income record ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Income record deleted successfully",
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
     *         description="Income record not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Income record not found")
     *         )
     *     )
     * )
     */
    public function destroy($id)
    {
        $income = Income::findOrFail($id);
        $income->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}