<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Members",
 *     description="Member management endpoints"
 * )
 */
class MemberController extends Controller
{
    /**
     * Display a listing of members
     * 
     * @OA\Get(
     *     path="/members",
     *     operationId="getMembers",
     *     tags={"Members"},
     *     summary="Get all members",
     *     description="Returns a paginated list of all members with search and filtering capabilities",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search term for name, email, or phone",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by status (active/inactive)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"active", "inactive"})
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort field",
     *         required=false,
     *         @OA\Schema(type="string", default="name")
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         description="Sort order",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc", "desc"}, default="asc")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Members retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="total", type="integer", example=50)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden - Insufficient permissions",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="This action is unauthorized.")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('view-members');

        $query = User::with('roles')->whereHas('roles', function ($q) {
            $q->where('name', 'member');
        });

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $members = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $members
        ]);
    }

    /**
     * Store a newly created member
     * 
     * @OA\Post(
     *     path="/members",
     *     operationId="createMember",
     *     tags={"Members"},
     *     summary="Create a new member",
     *     description="Creates a new member with the member role",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password"},
     *             @OA\Property(property="name", type="string", example="John Doe", description="Member's full name"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", description="Member's email address"),
     *             @OA\Property(property="password", type="string", format="password", example="password123", description="Member's password"),
     *             @OA\Property(property="phone", type="string", example="+1234567890", description="Member's phone number"),
     *             @OA\Property(property="address", type="string", example="123 Church St", description="Member's address"),
     *             @OA\Property(property="date_of_birth", type="string", format="date", example="1990-01-01", description="Member's date of birth"),
     *             @OA\Property(property="gender", type="string", enum={"male","female","other"}, example="male", description="Member's gender")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Member created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member created successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="member", type="object")
     *             )
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
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create-members');

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $member = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'is_active' => true,
        ]);

        $member->assignRole('member');

        return response()->json([
            'success' => true,
            'message' => 'Member created successfully',
            'data' => [
                'member' => $member->load('roles')
            ]
        ], 201);
    }

    /**
     * Display the specified member
     * 
     * @OA\Get(
     *     path="/members/{member}",
     *     operationId="getMember",
     *     tags={"Members"},
     *     summary="Get member details",
     *     description="Returns detailed information about a specific member",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="member",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member details retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="member", type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Member not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="User is not a member")
     *         )
     *     )
     * )
     */
    public function show(User $member): JsonResponse
    {
        $this->authorize('view-members');

        // Ensure the user is a member
        if (!$member->hasRole('member')) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a member'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'member' => $member->load('roles')
            ]
        ]);
    }

    /**
     * Update the specified member
     * 
     * @OA\Put(
     *     path="/members/{member}",
     *     operationId="updateMember",
     *     tags={"Members"},
     *     summary="Update member",
     *     description="Updates the information of a specific member",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="member",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="John Doe", description="Member's full name"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", description="Member's email address"),
     *             @OA\Property(property="phone", type="string", example="+1234567890", description="Member's phone number"),
     *             @OA\Property(property="address", type="string", example="123 Church St", description="Member's address"),
     *             @OA\Property(property="date_of_birth", type="string", format="date", example="1990-01-01", description="Member's date of birth"),
     *             @OA\Property(property="gender", type="string", enum={"male","female","other"}, example="male", description="Member's gender"),
     *             @OA\Property(property="is_active", type="boolean", example=true, description="Member's active status")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member updated successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="member", type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Member not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="User is not a member")
     *         )
     *     )
     * )
     */
    public function update(Request $request, User $member): JsonResponse
    {
        $this->authorize('edit-members');

        // Ensure the user is a member
        if (!$member->hasRole('member')) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a member'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $member->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $member->update($request->only([
            'name', 'email', 'phone', 'address', 'date_of_birth', 'gender', 'is_active'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Member updated successfully',
            'data' => [
                'member' => $member->load('roles')
            ]
        ]);
    }

    /**
     * Remove the specified member
     * 
     * @OA\Delete(
     *     path="/members/{member}",
     *     operationId="deleteMember",
     *     tags={"Members"},
     *     summary="Delete member",
     *     description="Permanently deletes a member from the system",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="member",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Member not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="User is not a member")
     *         )
     *     )
     * )
     */
    public function destroy(User $member): JsonResponse
    {
        $this->authorize('delete-members');

        // Ensure the user is a member
        if (!$member->hasRole('member')) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a member'
            ], 404);
        }

        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Member deleted successfully'
        ]);
    }

    /**
     * Get member statistics
     * 
     * @OA\Get(
     *     path="/members/statistics",
     *     operationId="getMemberStatistics",
     *     tags={"Members"},
     *     summary="Get member statistics",
     *     description="Returns statistical information about members",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="total_members", type="integer", example=150),
     *                 @OA\Property(property="active_members", type="integer", example=120),
     *                 @OA\Property(property="inactive_members", type="integer", example=30),
     *                 @OA\Property(property="gender_distribution", type="array", @OA\Items(type="object"))
     *             )
     *         )
     *     )
     * )
     */
    public function statistics(): JsonResponse
    {
        $this->authorize('view-members');

        $totalMembers = User::whereHas('roles', function ($q) {
            $q->where('name', 'member');
        })->count();

        $activeMembers = User::whereHas('roles', function ($q) {
            $q->where('name', 'member');
        })->where('is_active', true)->count();

        $inactiveMembers = $totalMembers - $activeMembers;

        $genderStats = User::whereHas('roles', function ($q) {
            $q->where('name', 'member');
        })->selectRaw('gender, count(*) as count')
          ->groupBy('gender')
          ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_members' => $totalMembers,
                'active_members' => $activeMembers,
                'inactive_members' => $inactiveMembers,
                'gender_distribution' => $genderStats
            ]
        ]);
    }
}
