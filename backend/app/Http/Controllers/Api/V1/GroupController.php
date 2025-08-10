<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\FileUpload; // added
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB; // Added for DB facade

/**
 * @OA\Tag(
 *     name="Groups",
 *     description="API Endpoints for managing church groups"
 * )
 */
class GroupController extends Controller
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/groups",
     *     summary="Get all groups",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search term for group name or description",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="category",
     *         in="query",
     *         description="Filter by category",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"Active", "Inactive", "Full"})
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
     *         description="Groups retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Groups retrieved successfully"),
     *             @OA\Property(
     *                 property="groups",
     *                 type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="data", type="array",
     *                     @OA\Items(type="object",
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="Youth Ministry"),
     *                         @OA\Property(property="description", type="string", example="Engaging young people in faith"),
     *                         @OA\Property(property="category", type="string", example="Ministry"),
     *                         @OA\Property(property="max_members", type="integer", example=30),
     *                         @OA\Property(property="meeting_day", type="string", example="Sunday"),
     *                         @OA\Property(property="meeting_time", type="string", example="4:00 PM"),
     *                         @OA\Property(property="location", type="string", example="Youth Room"),
     *                         @OA\Property(property="status", type="string", example="Active"),
     *                         @OA\Property(property="img_path", type="string", nullable=true, example="uploads/2025/08/07/abc123.jpg"),
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
     *                 @OA\Property(property="next_page_url", type="string", nullable=true),
     *                 @OA\Property(property="path", type="string"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="prev_page_url", type="string", nullable=true),
     *                 @OA\Property(property="to", type="integer", nullable=true),
     *                 @OA\Property(property="total", type="integer")
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

        $perPage = $request->per_page ?? 10;
        $query = Group::where('deleted', 0)->with(['creator']);


        // Search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->has('category') && !empty($request->category)) {
            $query->byCategory($request->category);
        }

        // Status filter
        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        $groups = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Groups retrieved successfully',
            'groups' => $groups
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/groups",
     *     summary="Create a new group",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "description", "category", "max_members", "meeting_day", "meeting_time", "location"},
     *             @OA\Property(property="name", type="string", example="Youth Ministry"),
     *             @OA\Property(property="description", type="string", example="Engaging young people in faith"),
     *             @OA\Property(property="category", type="string", example="Ministry"),
     *             @OA\Property(property="max_members", type="integer", example=30),
     *             @OA\Property(property="meeting_day", type="string", example="Sunday"),
     *             @OA\Property(property="meeting_time", type="string", example="4:00 PM"),
     *             @OA\Property(property="location", type="string", example="Youth Room"),
     *             @OA\Property(property="status", type="string", example="Active"),
     *             @OA\Property(property="upload_token", type="string", nullable=true, example="abc123def456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Group created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Group created successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="description", type="string"),
     *                 @OA\Property(property="category", type="string"),
     *                 @OA\Property(property="max_members", type="integer"),
     *                 @OA\Property(property="meeting_day", type="string"),
     *                 @OA\Property(property="meeting_time", type="string"),
     *                 @OA\Property(property="location", type="string"),
     *                 @OA\Property(property="status", type="string"),
     *                 @OA\Property(property="img_path", type="string", nullable=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
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
            'description' => 'required|string|max:1000',
            'category' => 'required|string|max:100',

            'max_members' => 'required|integer|min:1|max:1000',
            'meeting_day' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'meeting_time' => 'required|string|max:50',
            'location' => 'required|string|max:255',
            'status' => 'nullable|string|in:Active,Inactive,Full',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $group = Group::create([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'max_members' => $request->max_members,
            'meeting_day' => $request->meeting_day,
            'meeting_time' => $request->meeting_time,
            'location' => $request->location,
            'status' => $request->status ?? 'Active',
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ]);

        $attachedFile = null;
        if ($request->has('upload_token') && !empty($request->upload_token)) {
            $attachedFile = $this->fileUploadService->attachFileToModel(
                $request->upload_token,
                Group::class,
                $group->id
            );

            if ($attachedFile) {
                $group->img_path = $attachedFile->path;
                $group->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Group created successfully',
            'data' => $group->load(['creator']),
            'uploaded_file' => $attachedFile ? "File uploaded successfully" : "No file uploaded",
        ], 201);
    }


    /**
     * @OA\Put(
     *     path="/api/v1/groups/{id}",
     *     summary="Update a group",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="category", type="string"),
     *             @OA\Property(property="max_members", type="integer"),
     *             @OA\Property(property="meeting_day", type="string"),
     *             @OA\Property(property="meeting_time", type="string"),
     *             @OA\Property(property="location", type="string"),
     *             @OA\Property(property="status", type="string"),
     *             @OA\Property(property="upload_token", type="string", nullable=true, example="abc123def456")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Group updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Group updated successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Group not found"
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
    public function update(Request $request, int $id): JsonResponse
    {
        $group = Group::find($id);

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string|max:1000',
            'category' => 'sometimes|required|string|max:100',

            'max_members' => 'sometimes|required|integer|min:1|max:1000',
            'meeting_day' => 'sometimes|required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'meeting_time' => 'sometimes|required|string|max:50',
            'location' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:Active,Inactive,Full',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        //check if has upload_token
        if ($request->has('upload_token') && !empty($request->upload_token)) {
            $attachedFile = $this->fileUploadService->attachFileToModel(
                $request->upload_token,
                Group::class,
                $group->id
            );

            if ($attachedFile) {
                $group->img_path = $attachedFile->path;
            }
        }

        $group->name = $request->name;
        $group->description = $request->description;
        $group->category = $request->category;
        $group->max_members = $request->max_members;
        $group->meeting_day = $request->meeting_day;
        $group->meeting_time = $request->meeting_time;
        $group->location = $request->location;
        $group->status = $request->status;
        $group->updated_by = Auth::id();
        $group->save();


        return response()->json([
            'success' => true,
            'message' => 'Group updated successfully',
            'data' => $group->load(['creator']),
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/groups/{id}",
     *     summary="Delete a group",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Group deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Group deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Group not found"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $group = Group::find($id);

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        $group->deleted = 1;
        $group->save();

        return response()->json([
            'success' => true,
            'message' => 'Group deleted successfully'
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/groups/{id}",
     *     summary="Get a specific group",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Group retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Group retrieved successfully"),
     *             @OA\Property(property="group", ref="#/components/schemas/Group")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Group not found"
     *     )
     * )
     */
    public function show(int $id): JsonResponse
    {
        $group = Group::with(['creator', 'members'])->find($id);

        if (!$group || $group->deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Group retrieved successfully',
            'group' => $group
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/groups/{id}/members",
     *     summary="Add a member to a group",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"member_id"},
     *             @OA\Property(property="member_id", type="integer", example=1),
     *             @OA\Property(property="role", type="string", enum={"member", "leader", "coordinator", "mentor"}, example="member"),
     *             @OA\Property(property="notes", type="string", example="New member")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member added to group successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member added to group successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Group or member not found"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function addMember(Request $request, int $id): JsonResponse
    {
        $group = Group::find($id);
        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'member_id' => 'required|integer|exists:members,id',
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

        // Check if member is already in the group
        if ($group->members()->where('member_id', $request->member_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Member is already in this group'
            ], 422);
        }

        // Check if group is full
        if ($group->is_full) {
            return response()->json([
                'success' => false,
                'message' => 'Group is full'
            ], 422);
        }

        $group->members()->attach($request->member_id, [
            'role' => $request->role ?? 'member',
            'notes' => $request->notes,
            'joined_at' => now(),
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member added to group successfully'
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/groups/{id}/members/{member_id}",
     *     summary="Remove a member from a group",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
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
     *         description="Member removed from group successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member removed from group successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Group or member not found"
     *     )
     * )
     */
    public function removeMember(int $id, int $member_id): JsonResponse
    {
        $group = Group::find($id);
        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        $group->members()->detach($member_id);

        return response()->json([
            'success' => true,
            'message' => 'Member removed from group successfully'
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/groups/{id}/members",
     *     summary="Get group members",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Group members retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Group members retrieved successfully"),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function getMembers(int $id): JsonResponse
    {
        $group = Group::find($id);
        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        $members = $group->members()->with(['creator'])->get();

        return response()->json([
            'success' => true,
            'message' => 'Group members retrieved successfully',
            'data' => $members
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/groups/{id}/members/{member_id}/role",
     *     summary="Update member role in group",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
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
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"role"},
     *             @OA\Property(property="role", type="string", enum={"member", "leader", "coordinator", "mentor", "assistant", "secretary", "treasurer"}, example="leader")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Member role updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Member role updated successfully")
     *         )
     *     )
     * )
     */
    public function updateMemberRole(Request $request, int $id, int $member_id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|string|in:member,leader,coordinator,mentor,assistant,secretary,treasurer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $group = Group::find($id);
        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        $group->members()->updateExistingPivot($member_id, [
            'role' => $request->role,
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member role updated successfully'
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/groups/{id}/statistics",
     *     summary="Get group statistics",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Group ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Group statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Group statistics retrieved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function getGroupStats(int $id): JsonResponse
    {
        $group = Group::with(['members', 'events'])->find($id);
        
        if (!$group || $group->deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        $stats = [
            'total_members' => $group->member_count,
            'available_spots' => $group->available_spots,
            'is_full' => $group->is_full,
            'total_events_count' => $group->events()->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Group statistics retrieved successfully',
            'data' => $stats
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/groups/statistics/overall",
     *     summary="Get overall groups statistics",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Overall statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Overall statistics retrieved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function getOverallStats(): JsonResponse
    {
        $stats = [
            'total_groups' => Group::where('deleted', 0)->count(),
            'active_groups' => Group::where('deleted', 0)->active()->count(),
            'full_groups' => Group::where('deleted', 0)->full()->count(),
            'groups_by_category' => Group::where('deleted', 0)
                ->selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category')
                ->toArray(),
            'total_members_across_groups' => DB::table('group_members')
                ->where('is_active', true)
                ->distinct('member_id')
                ->count('member_id'),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Overall statistics retrieved successfully',
            'data' => $stats
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/groups/statistics/needing-attention",
     *     summary="Get groups that need attention",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Groups needing attention retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Groups needing attention retrieved successfully"),
     *             @OA\Property(property="data", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function getGroupsNeedingAttention(): JsonResponse
    {
        $groups = Group::where('deleted', 0)
            ->where(function ($query) {
                $query->where('status', 'Full')
                      ->orWhere('status', 'Inactive')
                      ->orWhereRaw('(SELECT COUNT(*) FROM group_members WHERE group_members.group_id = groups.id AND group_members.is_active = 1) = 0');
            })
            ->with(['creator'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Groups needing attention retrieved successfully',
            'data' => $groups
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/groups/search",
     *     summary="Search groups with advanced filters",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="search", type="string", example="youth"),
     *             @OA\Property(property="category", type="string", example="Ministry"),
     *             @OA\Property(property="status", type="string", example="Active"),
     *             @OA\Property(property="min_members", type="integer", example=5),
     *             @OA\Property(property="max_members", type="integer", example=20),
     *             @OA\Property(property="meeting_day", type="string", example="Sunday"),
     *             @OA\Property(property="with_available_spots", type="boolean", example=true),
     *             @OA\Property(property="sort_by", type="string", example="name"),
     *             @OA\Property(property="sort_order", type="string", example="asc"),
     *             @OA\Property(property="per_page", type="integer", example=15)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Groups search completed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Groups search completed successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function searchGroups(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'category', 'status', 'min_members', 'max_members',
            'meeting_day', 'with_available_spots', 'sort_by', 'sort_order'
        ]);

        $perPage = $request->per_page ?? 15;
        $query = Group::with(['creator'])->where('deleted', 0);

        // Text search
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Category filter
        if (!empty($filters['category'])) {
            $query->byCategory($filters['category']);
        }

        // Status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Member count filter
        if (!empty($filters['min_members'])) {
            $query->whereRaw('(SELECT COUNT(*) FROM group_members WHERE group_members.group_id = groups.id AND group_members.is_active = 1) >= ?', [$filters['min_members']]);
        }

        if (!empty($filters['max_members'])) {
            $query->whereRaw('(SELECT COUNT(*) FROM group_members WHERE group_members.group_id = groups.id AND group_members.is_active = 1) <= ?', [$filters['max_members']]);
        }

        // Meeting day filter
        if (!empty($filters['meeting_day'])) {
            $query->where('meeting_day', $filters['meeting_day']);
        }

        // Available spots filter
        if (!empty($filters['with_available_spots'])) {
            $query->withAvailableSpots();
        }

        // Sort options
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        
        if (in_array($sortBy, ['name', 'created_at', 'updated_at', 'max_members'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $groups = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Groups search completed successfully',
            'data' => $groups
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/groups/bulk-update-status",
     *     summary="Bulk update group statuses",
     *     tags={"Groups"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"group_ids", "status"},
     *             @OA\Property(property="group_ids", type="array", @OA\Items(type="integer"), example={1,2,3}),
     *             @OA\Property(property="status", type="string", enum={"Active", "Inactive", "Full", "Suspended", "Archived"}, example="Active")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Groups updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Updated 3 groups successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'group_ids' => 'required|array|min:1',
            'group_ids.*' => 'integer|exists:groups,id',
            'status' => 'required|string|in:Active,Inactive,Full,Suspended,Archived',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updatedCount = Group::whereIn('id', $request->group_ids)
            ->where('deleted', 0)
            ->update([
                'status' => $request->status,
                'updated_by' => Auth::id()
            ]);

        return response()->json([
            'success' => true,
            'message' => "Updated {$updatedCount} groups successfully",
            'data' => ['updated_count' => $updatedCount]
        ]);
    }
}
