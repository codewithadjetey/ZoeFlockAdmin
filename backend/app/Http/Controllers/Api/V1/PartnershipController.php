<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Partnership;
use App\Models\PartnershipCategory;
use App\Models\Member;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Exception;

/**
 * @OA\Tag(
 *     name="Partnerships",
 *     description="API Endpoints for partnership management"
 * )
 */
class PartnershipController extends Controller
{
    protected $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
        
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-partnerships');
        
        // Apply specific permissions to methods
        $this->middleware('permission:create-partnerships')->only(['store']);
        $this->middleware('permission:edit-partnerships')->only(['update']);
        $this->middleware('permission:delete-partnerships')->only(['destroy']);
        $this->middleware('permission:generate-partnership-schedule')->only(['generateSchedule']);
    }

    /**
     * Display a listing of the resource.
     * 
     * @OA\Get(
     *     path="/api/v1/partnerships",
     *     summary="Get all partnerships",
     *     tags={"Partnerships"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="member_id",
     *         in="query",
     *         description="Filter by member ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="category_id",
     *         in="query",
     *         description="Filter by category ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="frequency",
     *         in="query",
     *         description="Filter by frequency",
     *         required=false,
     *         @OA\Schema(type="string", enum={"weekly","monthly","yearly","one-time"})
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of records per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partnerships retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="data", type="array", @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="member_id", type="integer", example=1),
     *                     @OA\Property(property="category_id", type="integer", example=1),
     *                     @OA\Property(property="pledge_amount", type="number", example=1000.00),
     *                     @OA\Property(property="frequency", type="string", example="monthly"),
     *                     @OA\Property(property="due_date", type="string", format="date", example="2024-12-31"),
     *                     @OA\Property(property="start_date", type="string", format="date", example="2024-01-01"),
     *                     @OA\Property(property="end_date", type="string", format="date", example="2024-12-31"),
     *                     @OA\Property(property="notes", type="string", example="Building fund partnership"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time"),
     *                     @OA\Property(property="member", type="object"),
     *                     @OA\Property(property="category", type="object")
     *                 )),
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=1),
     *                 @OA\Property(property="per_page", type="integer", example=15),
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
        $query = Partnership::with(['member', 'category']);
        if ($request->has('member_id')) {
            $query->where('member_id', $request->member_id);
        }
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('frequency')) {
            $query->where('frequency', $request->frequency);
        }
        $partnerships = $query->paginate($request->get('per_page', 15));
        return response()->json(['success' => true, 'data' => $partnerships]);
    }

    /**
     * Store a newly created resource in storage.
     * 
     * @OA\Post(
     *     path="/api/v1/partnerships",
     *     summary="Create a new partnership",
     *     tags={"Partnerships"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"member_id","category_id","pledge_amount","frequency"},
     *             @OA\Property(property="member_id", type="integer", example=1, description="Member ID"),
     *             @OA\Property(property="category_id", type="integer", example=1, description="Partnership category ID"),
     *             @OA\Property(property="pledge_amount", type="number", example=1000.00, description="Pledge amount"),
     *             @OA\Property(property="frequency", type="string", enum={"weekly","monthly","yearly","one-time"}, example="monthly", description="Payment frequency"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-12-31", description="Due date for one-time partnerships"),
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-01", description="Start date for recurring partnerships"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-12-31", description="End date for recurring partnerships"),
     *             @OA\Property(property="notes", type="string", example="Building fund partnership", description="Additional notes")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Partnership created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Partnership created successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="member_id", type="integer", example=1),
     *                 @OA\Property(property="category_id", type="integer", example=1),
     *                 @OA\Property(property="pledge_amount", type="number", example=1000.00),
     *                 @OA\Property(property="frequency", type="string", example="monthly"),
     *                 @OA\Property(property="due_date", type="string", format="date", example="2024-12-31"),
     *                 @OA\Property(property="start_date", type="string", format="date", example="2024-01-01"),
     *                 @OA\Property(property="end_date", type="string", format="date", example="2024-12-31"),
     *                 @OA\Property(property="notes", type="string", example="Building fund partnership"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="member", type="object"),
     *                 @OA\Property(property="category", type="object")
     *             )
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
            $validator = Validator::make($request->all(), [
                'member_id' => 'required|exists:members,id',
                'category_id' => 'required|exists:partnership_categories,id',
                'pledge_amount' => 'required|numeric|min:0',
                'frequency' => 'required|in:weekly,monthly,yearly,one-time',
                'due_date' => 'required_if:frequency,one-time|date',
                'start_date' => 'required_if:frequency,weekly,monthly,yearly|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'notes' => 'nullable|string',
            ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        $partnership = Partnership::create($request->all());
        // TODO: Generate schedule records based on frequency
        return response()->json([
            'success' => true,
            'message' => 'Partnership created successfully',
            'data' => $partnership->load(['member', 'category'])
        ], 201);
    }

    /**
     * Display the specified resource.
     * 
     * @OA\Get(
     *     path="/api/v1/partnerships/{id}",
     *     summary="Get a specific partnership",
     *     tags={"Partnerships"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Partnership ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partnership retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="member_id", type="integer", example=1),
     *                 @OA\Property(property="category_id", type="integer", example=1),
     *                 @OA\Property(property="pledge_amount", type="number", example=1000.00),
     *                 @OA\Property(property="frequency", type="string", example="monthly"),
     *                 @OA\Property(property="due_date", type="string", format="date", example="2024-12-31"),
     *                 @OA\Property(property="start_date", type="string", format="date", example="2024-01-01"),
     *                 @OA\Property(property="end_date", type="string", format="date", example="2024-12-31"),
     *                 @OA\Property(property="notes", type="string", example="Building fund partnership"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="member", type="object"),
     *                 @OA\Property(property="category", type="object")
     *             )
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
     *         description="Partnership not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Partnership not found")
     *         )
     *     )
     * )
     */
    public function show($id)
    {
        $partnership = Partnership::with(['member', 'category'])->find($id);
        if (!$partnership) {
            return response()->json(['success' => false, 'message' => 'Partnership not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $partnership]);
    }

    /**
     * Update the specified resource in storage.
     * 
     * @OA\Put(
     *     path="/api/v1/partnerships/{id}",
     *     summary="Update a partnership",
     *     tags={"Partnerships"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Partnership ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="member_id", type="integer", example=1, description="Member ID"),
     *             @OA\Property(property="category_id", type="integer", example=1, description="Partnership category ID"),
     *             @OA\Property(property="pledge_amount", type="number", example=1000.00, description="Pledge amount"),
     *             @OA\Property(property="frequency", type="string", enum={"weekly","monthly","yearly","one-time"}, example="monthly", description="Payment frequency"),
     *             @OA\Property(property="due_date", type="string", format="date", example="2024-12-31", description="Due date for one-time partnerships"),
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-01", description="Start date for recurring partnerships"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-12-31", description="End date for recurring partnerships"),
     *             @OA\Property(property="notes", type="string", example="Building fund partnership", description="Additional notes")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partnership updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Partnership updated successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="member_id", type="integer", example=1),
     *                 @OA\Property(property="category_id", type="integer", example=1),
     *                 @OA\Property(property="pledge_amount", type="number", example=1000.00),
     *                 @OA\Property(property="frequency", type="string", example="monthly"),
     *                 @OA\Property(property="due_date", type="string", format="date", example="2024-12-31"),
     *                 @OA\Property(property="start_date", type="string", format="date", example="2024-01-01"),
     *                 @OA\Property(property="end_date", type="string", format="date", example="2024-12-31"),
     *                 @OA\Property(property="notes", type="string", example="Building fund partnership"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="member", type="object"),
     *                 @OA\Property(property="category", type="object")
     *             )
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
     *         description="Partnership not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Partnership not found")
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
        $partnership = Partnership::find($id);
        if (!$partnership) {
            return response()->json(['success' => false, 'message' => 'Partnership not found'], 404);
        }
        $validator = Validator::make($request->all(), [
            'member_id' => 'sometimes|required|exists:members,id',
            'category_id' => 'sometimes|required|exists:partnership_categories,id',
            'pledge_amount' => 'sometimes|required|numeric|min:0',
            'frequency' => 'sometimes|required|in:weekly,monthly,yearly,one-time',
            'due_date' => 'sometimes|required_if:frequency,one-time|date',
            'start_date' => 'sometimes|required_if:frequency,weekly,monthly,yearly',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        $partnership->fill($request->all());
        $partnership->save();
        // TODO: Update schedule records if needed
        return response()->json([
            'success' => true,
            'message' => 'Partnership updated successfully',
            'data' => $partnership->load(['member', 'category'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * 
     * @OA\Delete(
     *     path="/api/v1/partnerships/{id}",
     *     summary="Delete a partnership",
     *     tags={"Partnerships"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Partnership ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Partnership deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Partnership deleted successfully")
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
     *         description="Partnership not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Partnership not found")
     *         )
     *     )
     * )
     */
    public function destroy($id)
    {
        $partnership = Partnership::find($id);
        if (!$partnership) {
            return response()->json(['success' => false, 'message' => 'Partnership not found'], 404);
        }
        $partnership->delete();
        // TODO: Delete schedule records if implemented
        return response()->json(['success' => true, 'message' => 'Partnership deleted successfully']);
    }

    /**
     * Generate schedule for a partnership
     * 
     * @OA\Post(
     *     path="/api/v1/partnerships/{id}/generate-schedule",
     *     summary="Generate payment schedule for a partnership",
     *     tags={"Partnerships"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Partnership ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Schedule generation not yet implemented",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Schedule generation not yet implemented")
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
     *         description="Partnership not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Partnership not found")
     *         )
     *     )
     * )
     */
    public function generateSchedule($id)
    {
        // TODO: Implement schedule generation logic based on frequency
        return response()->json(['success' => true, 'message' => 'Schedule generation not yet implemented']);
    }
}
