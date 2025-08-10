<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Family;
use App\Models\Member;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Families",
 *     description="API Endpoints for managing church families"
 * )
 */
class FamilyController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/families",
     *     summary="Get all families",
     *     tags={"Families"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search term for family name or description",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="active",
     *         in="query",
     *         description="Filter by active status",
     *         required=false,
     *         @OA\Schema(type="boolean")
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
     *         description="Families retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Families retrieved successfully"),
     *             @OA\Property(property="families", type="object")
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
        $perPage = $request->per_page ?? 10;
        $query = Family::where('deleted', false)->with(['familyHead']);

        // Search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('slogan', 'like', "%{$search}%");
            });
        }

        // Active filter
        if ($request->has('active') && $request->active !== null) {
            $query->where('active', $request->boolean('active'));
        }

        $families = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Families retrieved successfully',
            'families' => $families
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/families",
     *     summary="Create a new family",
     *     tags={"Families"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "family_head_id"},
     *             @OA\Property(property="name", type="string", example="Johnson Family"),
     *             @OA\Property(property="slogan", type="string", example="Faith, Love, Unity"),
     *             @OA\Property(property="description", type="string", example="A loving family dedicated to serving God"),
     *             @OA\Property(property="family_head_id", type="integer", example=1),
     *             @OA\Property(property="upload_token", type="string", nullable=true, example="abc123def456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Family created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Family created successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slogan' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'family_head_id' => 'required|integer|exists:members,id',
            'upload_token' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if the family head is already in another family
        $familyHead = Member::find($request->family_head_id);
        if ($familyHead->family) {
            return response()->json([
                'success' => false,
                'message' => 'Family head is already a member of another family'
            ], 422);
        }

        $family = Family::create([
            'name' => $request->name,
            'slogan' => $request->slogan,
            'description' => $request->description,
            'family_head_id' => $request->family_head_id,
            'active' => true,
            'deleted' => false,
        ]);

        // Add the family head as a member with 'head' role
        $family->members()->attach($request->family_head_id, [
            'role' => 'head',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        // Handle file upload if provided
        $attachedFile = null;
        if ($request->has('upload_token') && !empty($request->upload_token)) {
            $attachedFile = $this->fileUploadService->attachFileToModel(
                $request->upload_token,
                Family::class,
                $family->id
            );

            if ($attachedFile) {
                $family->img_url = $attachedFile->path;
                $family->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Family created successfully',
            'data' => $family->load(['familyHead', 'members']),
            'uploaded_file' => $attachedFile ? "File uploaded successfully" : "No file uploaded",
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/families/{id}",
     *     summary="Get a specific family",
     *     tags={"Families"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Family ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Family retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Family retrieved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Family not found"
     *     )
     * )
     */
    public function show(int $id): JsonResponse
    {
        $family = Family::where('deleted', false)
            ->with(['familyHead', 'activeMembers'])
            ->find($id);

        if (!$family) {
            return response()->json([
                'success' => false,
                'message' => 'Family not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Family retrieved successfully',
            'data' => $family
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/families/{id}",
     *     summary="Update a family",
     *     tags={"Families"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Family ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="slogan", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="active", type="boolean"),
     *             @OA\Property(property="upload_token", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Family updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Family updated successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Family not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $family = Family::where('deleted', false)->find($id);

        if (!$family) {
            return response()->json([
                'success' => false,
                'message' => 'Family not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'slogan' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'active' => 'sometimes|boolean',
            'upload_token' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle file upload if provided
        if ($request->has('upload_token') && !empty($request->upload_token)) {
            $attachedFile = $this->fileUploadService->attachFileToModel(
                $request->upload_token,
                Family::class,
                $family->id
            );

            if ($attachedFile) {
                $family->img_url = $attachedFile->path;
            }
        }

        $family->fill($request->only(['name', 'slogan', 'description', 'active']));
        $family->save();

        return response()->json([
            'success' => true,
            'message' => 'Family updated successfully',
            'data' => $family->load(['familyHead', 'activeMembers']),
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/families/{id}",
     *     summary="Delete a family",
     *     tags={"Families"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Family ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Family deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Family deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Family not found"
     *     )
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $family = Family::where('deleted', false)->find($id);

        if (!$family) {
            return response()->json([
                'success' => false,
                'message' => 'Family not found'
            ], 404);
        }

        $family->deleted = true;
        $family->save();

        return response()->json([
            'success' => true,
            'message' => 'Family deleted successfully'
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/families/{id}/members",
     *     summary="Add a member to a family",
     *     tags={"Families"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Family ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"member_id"},
     *             @OA\Property(property="member_id", type="integer", example=1),
     *             @OA\Property(property="role", type="string", enum={"member", "deputy"}, example="member"),
     *             @OA\Property(property="notes", type="string", example="New family member")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member added to family successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member added to family successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Family or member not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function addMember(Request $request, int $id): JsonResponse
    {
        $family = Family::where('deleted', false)->find($id);
        if (!$family) {
            return response()->json([
                'success' => false,
                'message' => 'Family not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'member_id' => 'required|integer|exists:members,id',
            'role' => 'nullable|string|in:member,deputy',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if member is already in this family
        if ($family->members()->where('member_id', $request->member_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Member is already in this family'
            ], 422);
        }

        // Check if member is already in another family
        $member = Member::find($request->member_id);
        if ($member->family) {
            return response()->json([
                'success' => false,
                'message' => 'Member is already a member of another family'
            ], 422);
        }

        // Check if family is active
        if (!$family->active) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add members to inactive family'
            ], 422);
        }

        $family->members()->attach($request->member_id, [
            'role' => $request->role ?? 'member',
            'notes' => $request->notes,
            'joined_at' => now(),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member added to family successfully'
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/families/{id}/members/{member_id}",
     *     summary="Remove a member from a family",
     *     tags={"Families"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Family ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="member_id",
     *         in="path",
     *         description="Member ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member removed from family successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member removed from family successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Family or member not found"
     *     )
     * )
     */
    public function removeMember(int $id, int $member_id): JsonResponse
    {
        $family = Family::where('deleted', false)->find($id);
        if (!$family) {
            return response()->json([
                'success' => false,
                'message' => 'Family not found'
            ], 404);
        }

        // Prevent removing the family head
        if ($family->family_head_id === $member_id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot remove the family head'
            ], 422);
        }

        $family->members()->detach($member_id);

        return response()->json([
            'success' => true,
            'message' => 'Member removed from family successfully'
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/families/{id}/members",
     *     summary="Get family members",
     *     tags={"Families"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Family ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Family members retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Family members retrieved successfully"),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function getMembers(int $id): JsonResponse
    {
        $family = Family::where('deleted', false)->find($id);
        if (!$family) {
            return response()->json([
                'success' => false,
                'message' => 'Family not found'
            ], 404);
        }

        $members = $family->activeMembers()->with(['creator'])->get();

        return response()->json([
            'success' => true,
            'message' => 'Family members retrieved successfully',
            'data' => $members
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/families/my-family",
     *     summary="Get current user's family",
     *     tags={"Families"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="User's family retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User's family retrieved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User not found or not a family member"
     *     )
     * )
     */
    public function getMyFamily(): JsonResponse
    {
        $user = Auth::user();
        $member = Member::where('user_id', $user->id)->first();

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found'
            ], 404);
        }

        $family = $member->family;
        if (!$family) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a member of any family'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Your family retrieved successfully',
            'data' => $family->load(['familyHead', 'activeMembers'])
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/families/statistics",
     *     summary="Get family statistics",
     *     tags={"Families"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Family statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Family statistics retrieved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function getStatistics(): JsonResponse
    {
        $familyService = app(FamilyService::class);
        $statistics = $familyService->getFamilyStatistics();

        return response()->json([
            'success' => true,
            'message' => 'Family statistics retrieved successfully',
            'data' => $statistics
        ]);
    }

    /**
     * Get events for a specific family
     */
    public function getFamilyEvents(int $id): JsonResponse
    {
        try {
            $family = Family::where('deleted', false)->find($id);
            
            if (!$family) {
                return response()->json([
                    'success' => false,
                    'message' => 'Family not found'
                ], 404);
            }

            $events = $family->events()
                ->where('status', 'published')
                ->where('deleted', false)
                ->with(['groups', 'creator'])
                ->orderBy('start_date')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Family events retrieved successfully',
                'data' => $events
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get family events',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 