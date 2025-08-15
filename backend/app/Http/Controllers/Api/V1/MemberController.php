<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Services\FileUploadService;
use App\Services\MemberService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * @OA\Tag(
 *     name="Members",
 *     description="Member management endpoints"
 * )
 */
class MemberController extends Controller
{
    protected FileUploadService $fileUploadService;
    protected MemberService $memberService;

    public function __construct(FileUploadService $fileUploadService, MemberService $memberService)
    {
        $this->fileUploadService = $fileUploadService;
        $this->memberService = $memberService;
    }

    /**
     * Display a listing of members
     * 
     * @OA\Get(
     *     path="/api/v1/members",
     *     operationId="getMembers",
     *     tags={"Members"},
     *     summary="Get all members",
     *     description="Returns a paginated list of all members with search and filtering capabilities",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search term for first name, last name, email, or phone",
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
     *         name="group_id",
     *         in="query",
     *         description="Filter by group membership",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="unassigned_family",
     *         in="query",
     *         description="Filter to show only members not assigned to any family",
     *         required=false,
     *         @OA\Schema(type="boolean", default=false)
     *     ),
     *     @OA\Parameter(
     *         name="include_groups",
     *         in="query",
     *         description="Include group information in response",
     *         required=false,
     *         @OA\Schema(type="boolean", default=false)
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort field",
     *         required=false,
     *         @OA\Schema(type="string", default="first_name")
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
     *         description="Items per page (default 10)",
     *         required=false,
     *         @OA\Schema(type="integer", example=10)
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Members retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Members retrieved successfully"),
     *             @OA\Property(property="members", type="object",
     *                 @OA\Property(property="data", type="array",
     *                     @OA\Items(type="object",
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="first_name", type="string", example="John"),
     *                         @OA\Property(property="last_name", type="string", example="Doe"),
     *                         @OA\Property(property="email", type="string", example="john@example.com"),
     *                         @OA\Property(property="phone", type="string", example="+1234567890"),
     *                         @OA\Property(property="is_active", type="boolean", example=true),
     *                         @OA\Property(property="profile_image_path", type="string", nullable=true),
     *                         @OA\Property(property="created_at", type="string", format="date-time"),
     *                         @OA\Property(property="updated_at", type="string", format="date-time")
     *                     )
     *                 ),
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="first_page_url", type="string"),
     *                 @OA\Property(property="from", type="integer", nullable=true),
     *                 @OA\Property(property="last_page", type="integer"),
     *                 @OA\Property(property="last_page_url", type="string"),
     *                 @OA\Property(property="next_page_url", type="string", nullable=true),
     *                 @OA\Property(property="path", type="string"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="prev_page_url", type="string", nullable=true),
     *                 @OA\Property(property="to", type="integer", nullable=true),
     *                 @OA\Property(property="total", type="integer"),
     *                 @OA\Property(property="links", type="array",
     *                     @OA\Items(type="object",
     *                         @OA\Property(property="url", type="string", nullable=true),
     *                         @OA\Property(property="label", type="string"),
     *                         @OA\Property(property="active", type="boolean")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Member::where('deleted', 0);

        // Check if user is a Family Head and restrict to their family members
        $user = Auth::user();
        if ($user && $user->hasRole('family-head')) {
            // Get the member record for the authenticated user
            $member = Member::where('user_id', $user->id)->first();
            if ($member && $member->family) {
                // Only show members from the same family
                $query->whereHas('families', function ($q) use ($member) {
                    $q->where('family_id', $member->family->id)->where('is_active', true);
                });
            } else {
                // If family head has no family, return empty result
                return response()->json([
                    'success' => true,
                    'message' => 'No family members found',
                    'members' => []
                ]);
            }
        }

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->search($search);
        }

        // Status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->inactive();
            }
        }

        // Group filter
        if ($request->filled('group_id')) {
            $query->byGroup($request->group_id);
        }

        // Unassigned family filter - only show members not assigned to any family
        if ($request->boolean('unassigned_family')) {
            $query->whereDoesntHave('families', function ($q) {
                $q->where('is_active', true);
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'first_name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        if (in_array($sortBy, ['first_name', 'last_name', 'email', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        
        // Include groups if requested
        $withRelations = ['creator', 'updater'];
        if ($request->boolean('include_groups')) {
            $withRelations[] = 'groups';
        }
        
        $members = $query->with($withRelations)->paginate($perPage);

        // Transform members to include group count if groups are not loaded
        if (!$request->boolean('include_groups')) {
            $members->getCollection()->transform(function ($member) {
                $member->groups_count = $member->active_groups_count;
                return $member;
            });
        }

        return response()->json([
            'success' => true,
            'message' => 'Members retrieved successfully',
            'members' => $members
        ]);
    }

    /**
     * Store a newly created member
     * 
     * @OA\Post(
     *     path="/api/v1/members",
     *     operationId="storeMember",
     *     tags={"Members"},
     *     summary="Create a new member",
     *     description="Creates a new church member",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"first_name","last_name","email"},
     *             @OA\Property(property="first_name", type="string", example="John"),
     *             @OA\Property(property="last_name", type="string", example="Doe"),
     *             @OA\Property(property="email", type="string", example="john@example.com"),
     *             @OA\Property(property="phone", type="string", example="+1234567890"),
     *             @OA\Property(property="address", type="string", example="123 Main St"),
     *             @OA\Property(property="date_of_birth", type="string", format="date", example="1990-01-01"),
     *             @OA\Property(property="gender", type="string", enum={"male","female","other"}, example="male"),
     *             @OA\Property(property="marital_status", type="string", enum={"single","married","divorced","widowed"}, example="single"),
     *             @OA\Property(property="occupation", type="string", example="Engineer"),
     *             @OA\Property(property="emergency_contact_name", type="string", example="Jane Doe"),
     *             @OA\Property(property="emergency_contact_phone", type="string", example="+1234567890"),
     *             @OA\Property(property="baptism_date", type="string", format="date", example="2000-01-01"),
     *             @OA\Property(property="membership_date", type="string", format="date", example="2020-01-01"),
     *             @OA\Property(property="notes", type="string", example="New member"),
     *             @OA\Property(property="upload_token", type="string", nullable=true, example="abc123def456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Member created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member created successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="member", type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation failed"
     *     )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:members',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'marital_status' => 'nullable|in:single,married,divorced,widowed',
            'occupation' => 'nullable|string|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'baptism_date' => 'nullable|date',
            'membership_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
            'upload_token' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user is a Family Head and ensure they can only create members for their family
        $user = Auth::user();
        if ($user && $user->hasRole('family-head')) {
            // Get the member record for the authenticated user
            $member = Member::where('user_id', $user->id)->first();
            if (!$member || !$member->family) {
                return response()->json([
                    'success' => false,
                    'message' => 'Family Head must be associated with a family to create members'
                ], 403);
            }
            
            // Add family_id to the request data to ensure the new member is added to the same family
            $request->merge(['family_id' => $member->family->id]);
        }

        // Create member using service (this will also create user account via observer)
        $result = $this->memberService->createMember($request->all());

        if (!$result['success']) {
            return response()->json($result, 500);
        }

        $member = $result['data']['member'];

        // Handle profile image upload if an image was uploaded
        $attachedFile = null;
        if ($request->has('upload_token') && !empty($request->upload_token)) {
            $attachedFile = $this->fileUploadService->attachFileToModel(
                $request->upload_token,
                Member::class,
                $member->id
            );

            if ($attachedFile) {
                $member->profile_image_path = $attachedFile->path;
                $member->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Member created successfully',
            'data' => [
                'member' => $member->load(['creator', 'user']),
                'user_account_created' => $result['data']['user_account_created']
            ]
        ], 201);
    }

    /**
     * Display the specified member
     * 
     * @OA\Get(
     *     path="/api/v1/members/{id}",
     *     operationId="getMember",
     *     tags={"Members"},
     *     summary="Get member details",
     *     description="Returns detailed information about a specific member",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
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
     *         description="Member not found"
     *     )
     * )
     */
    public function show(int $id): JsonResponse
    {
        $member = Member::with(['creator', 'updater', 'groups'])->find($id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        $member->load(['family', 'groups', 'user']);

        // Add group information
        $member->groups->each(function ($group) {
            $group->member_count = $group->activeMembers()->count();
            $group->available_spots = max(0, $group->max_members - $group->member_count);
            $group->is_full = $group->member_count >= $group->max_members;
        });

        return response()->json([
            'success' => true,
            'message' => 'Member retrieved successfully',
            'data' => $member
        ]);
    }

    /**
     * Update the specified member
     * 
     * @OA\Put(
     *     path="/api/v1/members/{id}",
     *     operationId="updateMember",
     *     tags={"Members"},
     *     summary="Update member details",
     *     description="Updates an existing member's information",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="first_name", type="string"),
     *             @OA\Property(property="last_name", type="string"),
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="phone", type="string"),
     *             @OA\Property(property="address", type="string"),
     *             @OA\Property(property="date_of_birth", type="string", format="date"),
     *             @OA\Property(property="gender", type="string"),
     *             @OA\Property(property="marital_status", type="string"),
     *             @OA\Property(property="occupation", type="string"),
     *             @OA\Property(property="emergency_contact_name", type="string"),
     *             @OA\Property(property="emergency_contact_phone", type="string"),
     *             @OA\Property(property="baptism_date", type="string", format="date"),
     *             @OA\Property(property="membership_date", type="string", format="date"),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="notes", type="string"),
     *             @OA\Property(property="upload_token", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member updated successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="member", type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Member not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation failed"
     *     )
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:members,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'marital_status' => 'nullable|in:single,married,divorced,widowed',
            'occupation' => 'nullable|string|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'baptism_date' => 'nullable|date',
            'membership_date' => 'nullable|date',
            'is_active' => 'sometimes|boolean',
            'notes' => 'nullable|string|max:1000',
            'upload_token' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        if ($user && $user->hasRole('family-head')) {
            $member = Member::where('user_id', $user->id)->first();
            if (!$member || !$member->family) {
                return response()->json([
                    'success' => false,
                    'message' => 'Family Head must be associated with a family to update members'
                ], 403);
            }
        }

        // Handle profile image upload if an image was uploaded
        if ($request->has('upload_token') && !empty($request->upload_token)) {
            $attachedFile = $this->fileUploadService->attachFileToModel(
                $request->upload_token,
                Member::class,
                $member->id
            );

            if ($attachedFile) {
                $member->profile_image_path = $attachedFile->path;
            }
        }

        // Update member fields
        $member->fill($request->except(['upload_token', 'profile_image_path']));
        $member->updated_by = Auth::id();
        $member->save();

        return response()->json([
            'success' => true,
            'message' => 'Member updated successfully',
            'data' => [
                'member' => $member->load(['creator', 'updater'])
            ]
        ]);
    }

    /**
     * Get member statistics
     * 
     * @OA\Get(
     *     path="/api/v1/members/statistics",
     *     operationId="getMemberStatistics",
     *     tags={"Members"},
     *     summary="Get member statistics",
     *     description="Returns comprehensive statistics about members",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Statistics retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="total_members", type="integer", example=150),
     *                 @OA\Property(property="active_members", type="integer", example=140),
     *                 @OA\Property(property="inactive_members", type="integer", example=10),
     *                 @OA\Property(property="new_members_this_month", type="integer", example=5),
     *                 @OA\Property(property="new_members_this_year", type="integer", example=25),
     *                 @OA\Property(property="gender_distribution", type="object"),
     *                 @OA\Property(property="marital_status_distribution", type="object"),
     *                 @OA\Property(property="age_groups", type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function statistics(): JsonResponse
    {
        try {
            // Check if user is a Family Head and restrict to their family members
            $user = Auth::user();
            $query = Member::query();
            
            if ($user && $user->hasRole('family-head')) {
                // Get the member record for the authenticated user
                $member = Member::where('user_id', $user->id)->first();
                if ($member && $member->family) {
                    // Only count members from the same family
                    $query->whereHas('families', function ($q) use ($member) {
                        $q->where('family_id', $member->family->id)->where('is_active', true);
                    });
                } else {
                    // If family head has no family, return empty statistics
                    return response()->json([
                        'success' => true,
                        'message' => 'No family found for Family Head',
                        'data' => [
                            'total_members' => 0,
                            'active_members' => 0,
                            'inactive_members' => 0,
                            'new_members_this_month' => 0,
                            'new_members_this_year' => 0,
                            'gender_distribution' => [],
                            'marital_status_distribution' => [],
                            'age_groups' => [],
                        ]
                    ]);
                }
            }

            $totalMembers = (clone $query)->count();
            $activeMembers = (clone $query)->active()->count();
            $inactiveMembers = (clone $query)->inactive()->count();
            $newMembersThisMonth = (clone $query)->where('created_at', '>=', now()->startOfMonth())->count();
            $newMembersThisYear = (clone $query)->where('created_at', '>=', now()->startOfYear())->count();

            // Gender distribution
            $genderDistribution = (clone $query)->selectRaw('gender, COUNT(*) as count')
                ->whereNotNull('gender')
                ->groupBy('gender')
                ->pluck('count', 'gender')
                ->toArray();

            // Marital status distribution
            $maritalStatusDistribution = (clone $query)->selectRaw('marital_status, COUNT(*) as count')
                ->whereNotNull('marital_status')
                ->groupBy('marital_status')
                ->pluck('count', 'marital_status')
                ->toArray();

            // Age groups
            $ageGroups = (clone $query)->selectRaw('
                CASE 
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) < 18 THEN "Under 18"
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 18 AND 25 THEN "18-25"
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 26 AND 35 THEN "26-35"
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 36 AND 50 THEN "36-50"
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 51 AND 65 THEN "51-65"
                    WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) > 65 THEN "Over 65"
                    ELSE "Unknown"
                END as age_group,
                COUNT(*) as count
            ')
                ->whereNotNull('date_of_birth')
                ->groupBy('age_group')
                ->pluck('count', 'age_group')
                ->toArray();

            return response()->json([
                'success' => true,
                'message' => 'Statistics retrieved successfully',
                'data' => [
                    'total_members' => $totalMembers,
                    'active_members' => $activeMembers,
                    'inactive_members' => $inactiveMembers,
                    'new_members_this_month' => $newMembersThisMonth,
                    'new_members_this_year' => $newMembersThisYear,
                    'gender_distribution' => $genderDistribution,
                    'marital_status_distribution' => $maritalStatusDistribution,
                    'age_groups' => $ageGroups,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified member
     * 
     * @OA\Delete(
     *     path="/api/v1/members/{id}",
     *     operationId="deleteMember",
     *     tags={"Members"},
     *     summary="Delete a member",
     *     description="Removes a member from the system",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
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
     *         description="Member not found"
     *     )
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        $member->deleted = 1;
        $member->save();

        return response()->json([
            'success' => true,
            'message' => 'Member deleted successfully'
        ]);
    }

    /**
     * Get member's groups
     * 
     * @OA\Get(
     *     path="/api/v1/members/{id}/groups",
     *     operationId="getMemberGroups",
     *     tags={"Members"},
     *     summary="Get member's groups",
     *     description="Returns all groups that a member belongs to",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member groups retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member groups retrieved successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="member", type="object"),
     *                 @OA\Property(property="groups", type="array", @OA\Items(type="object"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Member not found"
     *     )
     * )
     */
    public function getGroups(int $id): JsonResponse
    {
        $member = Member::with(['groups' => function ($query) {
            $query->where('deleted', 0);
        }])->find($id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Member groups retrieved successfully',
            'data' => [
                'member' => [
                    'id' => $member->id,
                    'first_name' => $member->first_name,
                    'last_name' => $member->last_name,
                    'email' => $member->email,
                    'full_name' => $member->full_name
                ],
                'groups' => $member->groups->map(function ($group) {
                    return [
                        'id' => $group->id,
                        'name' => $group->name,
                        'description' => $group->description,
                        'category' => $group->category,
                        'status' => $group->status,
                        'pivot' => [
                            'role' => $group->pivot->role,
                            'joined_at' => $group->pivot->joined_at,
                            'is_active' => $group->pivot->is_active,
                            'notes' => $group->pivot->notes
                        ]
                    ];
                })
            ]
        ]);
    }

    /**
     * Add member to groups
     * 
     * @OA\Post(
     *     path="/api/v1/members/{id}/groups",
     *     operationId="addMemberToGroups",
     *     tags={"Members"},
     *     summary="Add member to groups",
     *     description="Adds a member to one or more groups",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"group_ids"},
     *             @OA\Property(property="group_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3}),
     *             @OA\Property(property="role", type="string", enum={"member", "leader", "coordinator", "mentor"}, example="member"),
     *             @OA\Property(property="notes", type="string", example="Added via member management")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member added to groups successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member added to groups successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="added_groups", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="skipped_groups", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="errors", type="array", @OA\Items(type="string"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Member not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation failed"
     *     )
     * )
     */
    public function addToGroups(Request $request, int $id): JsonResponse
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'group_ids' => 'required|array|min:1',
            'group_ids.*' => 'integer|exists:groups,id',
            'role' => 'nullable|string|in:member,leader,coordinator,mentor',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $groupIds = $request->group_ids;
        $role = $request->role ?? 'member';
        $notes = $request->notes;
        
        $addedGroups = [];
        $skippedGroups = [];
        $errors = [];

        foreach ($groupIds as $groupId) {
            try {
                $group = \App\Models\Group::find($groupId);
                
                if (!$group || $group->deleted) {
                    $errors[] = "Group ID {$groupId} not found or deleted";
                    continue;
                }

                // Check if member is already in the group
                if ($member->groups()->where('group_id', $groupId)->exists()) {
                    $skippedGroups[] = [
                        'id' => $groupId,
                        'name' => $group->name,
                        'reason' => 'Already a member'
                    ];
                    continue;
                }

                // Check if group is full
                if ($group->is_full) {
                    $skippedGroups[] = [
                        'id' => $groupId,
                        'name' => $group->name,
                        'reason' => 'Group is full'
                    ];
                    continue;
                }

                // Add member to group
                $member->groups()->attach($groupId, [
                    'role' => $role,
                    'notes' => $notes,
                    'joined_at' => now(),
                    'is_active' => true,
                ]);

                $addedGroups[] = [
                    'id' => $groupId,
                    'name' => $group->name,
                    'role' => $role
                ];

            } catch (Exception $e) {
                $errors[] = "Failed to add member to group {$groupId}: " . $e->getMessage();
            }
        }

        $message = count($addedGroups) > 0 ? 'Member added to groups successfully' : 'No groups were added';
        
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'added_groups' => $addedGroups,
                'skipped_groups' => $skippedGroups,
                'errors' => $errors
            ]
        ]);
    }

    /**
     * Remove member from groups
     * 
     * @OA\Delete(
     *     path="/api/v1/members/{id}/groups",
     *     operationId="removeMemberFromGroups",
     *     tags={"Members"},
     *     summary="Remove member from groups",
     *     description="Removes a member from one or more groups",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"group_ids"},
     *             @OA\Property(property="group_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member removed from groups successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member removed from groups successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="removed_groups", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="not_found_groups", type="array", @OA\Items(type="object"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Member not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation failed"
     *     )
     * )
     */
    public function removeFromGroups(Request $request, int $id): JsonResponse
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'group_ids' => 'required|array|min:1',
            'group_ids.*' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $groupIds = $request->group_ids;
        $removedGroups = [];
        $notFoundGroups = [];

        foreach ($groupIds as $groupId) {
            $group = \App\Models\Group::find($groupId);
            
            if (!$group) {
                $notFoundGroups[] = $groupId;
                continue;
            }

            // Check if member is actually in this group
            if ($member->groups()->where('group_id', $groupId)->exists()) {
                $member->groups()->detach($groupId);
                $removedGroups[] = [
                    'id' => $groupId,
                    'name' => $group->name
                ];
            } else {
                $notFoundGroups[] = $groupId;
            }
        }

        $message = count($removedGroups) > 0 ? 'Member removed from groups successfully' : 'No groups were removed';
        
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'removed_groups' => $removedGroups,
                'not_found_groups' => $notFoundGroups
            ]
        ]);
    }

    /**
     * Update member's group role
     * 
     * @OA\Put(
     *     path="/api/v1/members/{id}/groups/{group_id}",
     *     operationId="updateMemberGroupRole",
     *     tags={"Members"},
     *     summary="Update member's group role",
     *     description="Updates a member's role in a specific group",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="group_id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="role", type="string", enum={"member", "leader", "coordinator", "mentor"}, example="leader"),
     *             @OA\Property(property="notes", type="string", example="Promoted to leader"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member group role updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member group role updated successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Member or group not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation failed"
     *     )
     * )
     */
    public function updateGroupRole(Request $request, int $id, int $group_id): JsonResponse
    {
        $member = Member::find($id);
        $group = \App\Models\Group::find($group_id);

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        // Check if member is in this group
        if (!$member->groups()->where('group_id', $group_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Member is not in this group'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'role' => 'nullable|string|in:member,leader,coordinator,mentor',
            'notes' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = [];
        if ($request->has('role')) {
            $updateData['role'] = $request->role;
        }
        if ($request->has('notes')) {
            $updateData['notes'] = $request->notes;
        }
        if ($request->has('is_active')) {
            $updateData['is_active'] = $request->is_active;
        }

        if (!empty($updateData)) {
            $member->groups()->updateExistingPivot($group_id, $updateData);
        }

        return response()->json([
            'success' => true,
            'message' => 'Member group role updated successfully'
        ]);
    }

    /**
     * Create a user account for an existing member
     * 
     * @OA\Post(
     *     path="/api/v1/members/{id}/create-user-account",
     *     operationId="createUserAccountForMember",
     *     tags={"Members"},
     *     summary="Create user account for member",
     *     description="Creates a user account for an existing member who doesn't have one",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User account created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User account created successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="member", type="object"),
     *                 @OA\Property(property="user_account_created", type="boolean", example=true),
     *                 @OA\Property(property="existing_user", type="boolean", example=false),
     *                 @OA\Property(property="generated_password", type="string", example="abc123def456")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Member not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Member already has user account"
     *     )
     * )
     */
    public function createUserAccount(int $id): JsonResponse
    {
        $result = $this->memberService->createUserAccountForMember($id);

        if (!$result['success']) {
            $statusCode = $result['message'] === 'Member not found' ? 404 : 422;
            return response()->json($result, $statusCode);
        }

        return response()->json($result);
    }
}
