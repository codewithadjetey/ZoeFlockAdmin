<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Services\FileUploadService;
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

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
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
     *             @OA\Property(
     *                 property="members",
     *                 type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
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
     *                 @OA\Property(property="first_page_url", type="string"),
     *                 @OA\Property(property="from", type="integer", nullable=true),
     *                 @OA\Property(property="last_page", type="integer"),
     *                 @OA\Property(property="last_page_url", type="string"),
     *                 @OA\Property(property="links", type="array",
     *                     @OA\Items(type="object",
     *                         @OA\Property(property="url", type="string", nullable=true),
     *                         @OA\Property(property="label", type="string"),
     *                         @OA\Property(property="active", type="boolean")
     *                     )
     *                 ),
     *                 @OA\Property(property="total", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="current_page", type="integer")
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
        $query = Member::query();

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

        // Sorting
        $sortBy = $request->get('sort_by', 'first_name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        if (in_array($sortBy, ['first_name', 'last_name', 'email', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $members = $query->with(['creator', 'updater'])->paginate($perPage);

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

        $member = Member::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'marital_status' => $request->marital_status,
            'occupation' => $request->occupation,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_phone' => $request->emergency_contact_phone,
            'baptism_date' => $request->baptism_date,
            'membership_date' => $request->membership_date,
            'notes' => $request->notes,
            'is_active' => true,
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

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
                'member' => $member->load(['creator'])
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

        return response()->json([
            'success' => true,
            'data' => [
                'member' => $member
            ]
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
     *             @OA\Property(property="data", type="object,
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
            $totalMembers = Member::count();
            $activeMembers = Member::active()->count();
            $inactiveMembers = Member::inactive()->count();
            $newMembersThisMonth = Member::where('created_at', '>=', now()->startOfMonth())->count();
            $newMembersThisYear = Member::where('created_at', '>=', now()->startOfYear())->count();

            // Gender distribution
            $genderDistribution = Member::selectRaw('gender, COUNT(*) as count')
                ->whereNotNull('gender')
                ->groupBy('gender')
                ->pluck('count', 'gender')
                ->toArray();

            // Marital status distribution
            $maritalStatusDistribution = Member::selectRaw('marital_status, COUNT(*) as count')
                ->whereNotNull('marital_status')
                ->groupBy('marital_status')
                ->pluck('count', 'marital_status')
                ->toArray();

            // Age groups
            $ageGroups = Member::selectRaw('
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

        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Member deleted successfully'
        ]);
    }
}
