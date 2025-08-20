<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\ExpenseCategory;
use App\Models\Group;
use App\Models\Family;
use App\Models\IncomeCategory;
use App\Models\Member;
use App\Models\PartnershipCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Entities",
 *     description="API Endpoints for fetching entity data for forms"
 * )
 */
class EntityController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/entities",
     *     summary="Get entities for form selection",
     *     tags={"Entities"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="entities",
     *         in="query",
     *         description="Comma-separated list of entities to fetch (e.g., groups,families)",
     *         required=true,
     *         @OA\Schema(type="string", example="groups,families")
     *     ),
     *     @OA\Parameter(
     *         name="active_only",
     *         in="query",
     *         description="Filter only active entities",
     *         required=false,
     *         @OA\Schema(type="boolean", default=true)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Entities retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Entities retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="groups",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="Youth Ministry")
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="families",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="Smith Family")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad request - invalid entities parameter"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        // Validate the entities parameter
        $request->validate([
            'entities' => 'required|string|regex:/^[a-zA-Z\-,]+$/'
        ]);

        $entities = explode(',', strtolower(trim($request->entities)));
        $activeOnly = $request->boolean('active_only', true);
        $data = [];
        $family = null;

        //check is has role family-head
        $user = Auth::user();
        if ($user->hasRole('family-head')) {
            $member = Member::where('user_id', $user->id)->first();
            // if ($member) {
            //     $family = $member->family;
            // }
        }

        foreach ($entities as $entity) {
            $entity = trim($entity);
            
            switch ($entity) {
                case 'groups':
                    $query = Group::select('id', 'name');
                    if ($activeOnly) {
                        $query->where('status', 'Active');
                    }
                    $data['groups'] = $query->orderBy('name')->get();
                    break;
                    
                case 'families':
                    $query = Family::select('id', 'name');
                    if ($activeOnly) {
                        $query->where('active', true);
                    }
                    $data['families'] = $query->orderBy('name')->get();
                    break;
                case 'members':
                    $query = Member::select('id', 'first_name', 'last_name');
                    if ($family) {
                        $family->familyMembers()->where('is_active', true)->get();
                    }
                    $data['members'] = $query->orderBy('first_name')->get();
                    break;
                case 'events':
                    $query = Event::select('id', 'name');
                    if ($activeOnly) {
                        $query->where('active', true);
                    }
                    $data['events'] = $query->orderBy('name')->get();
                    break;
                case 'events-today':
                    $today = Carbon::today();
                    $query = Event::select('id', 'title');
                    $query->whereDate('start_date', '<=', $today)
                        ->whereDate('end_date', '>=', $today);
                    $data['events'] = $query->orderBy('title')->get();
                    break;
                case 'partnership-categories':
                    $query = PartnershipCategory::select('id', 'name', "description");
                    $data['partnership_categories'] = $query->orderBy('name')->get();
                    break;
                case 'expense-categories':
                    $query = ExpenseCategory::where('is_active', true)->select('id', 'name', "description");
                    $data['expense_categories'] = $query->orderBy('name')->get();
                    break;
                case 'income-categories':
                    $query = IncomeCategory::where('is_active', true)->select('id', 'name', "description");
                    $data['income_categories'] = $query->orderBy('name')->get();
                    break;
                default:
                    // Skip unknown entities
                    break;
            }
        }

        if (empty($data)) {
            return response()->json([
                'success' => false,
                'message' => 'No valid entities specified. Supported entities: groups, families'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Entities retrieved successfully',
            'data' => $data
        ]);
    }
} 