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
        $query = Group::with(['creator']);


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

        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Group deleted successfully'
        ]);
    }



}
