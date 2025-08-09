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
     *         description="Search term for group name, description, or leader",
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
     *     @OA\Response(
     *         response=200,
     *         description="Groups retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Groups retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="Youth Ministry"),
     *                     @OA\Property(property="description", type="string", example="Engaging young people in faith"),
     *                     @OA\Property(property="category", type="string", example="Ministry"),
     *                     @OA\Property(property="leader_name", type="string", example="Sarah Johnson"),
     *                     @OA\Property(property="max_members", type="integer", example=30),
     *                     @OA\Property(property="member_count", type="integer", example=25),
     *                     @OA\Property(property="meeting_day", type="string", example="Sunday"),
     *                     @OA\Property(property="meeting_time", type="string", example="4:00 PM"),
     *                     @OA\Property(property="location", type="string", example="Youth Room"),
     *                     @OA\Property(property="status", type="string", example="Active"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time")
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
     *             required={"name", "description", "category", "leader_name", "max_members", "meeting_day", "meeting_time", "location"},
     *             @OA\Property(property="name", type="string", example="Youth Ministry"),
     *             @OA\Property(property="description", type="string", example="Engaging young people in faith"),
     *             @OA\Property(property="category", type="string", example="Ministry"),
     *             @OA\Property(property="leader_id", type="integer", example=1),
     *             @OA\Property(property="leader_name", type="string", example="Sarah Johnson"),
     *             @OA\Property(property="max_members", type="integer", example=30),
     *             @OA\Property(property="meeting_day", type="string", example="Sunday"),
     *             @OA\Property(property="meeting_time", type="string", example="4:00 PM"),
     *             @OA\Property(property="location", type="string", example="Youth Room"),
     *             @OA\Property(property="status", type="string", example="Active")
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
     *                 @OA\Property(property="name", type="string", example="Youth Ministry"),
     *                 @OA\Property(property="description", type="string", example="Engaging young people in faith"),
     *                 @OA\Property(property="category", type="string", example="Ministry"),
     *                 @OA\Property(property="leader_name", type="string", example="Sarah Johnson"),
     *                 @OA\Property(property="max_members", type="integer", example=30),
     *                 @OA\Property(property="member_count", type="integer", example=0),
     *                 @OA\Property(property="meeting_day", type="string", example="Sunday"),
     *                 @OA\Property(property="meeting_time", type="string", example="4:00 PM"),
     *                 @OA\Property(property="location", type="string", example="Youth Room"),
     *                 @OA\Property(property="status", type="string", example="Active"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
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
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Youth Ministry"),
     *                 @OA\Property(property="description", type="string", example="Engaging young people in faith"),
     *                 @OA\Property(property="category", type="string", example="Ministry"),
     *                 @OA\Property(property="leader_name", type="string", example="Sarah Johnson"),
     *                 @OA\Property(property="max_members", type="integer", example=30),
     *                 @OA\Property(property="member_count", type="integer", example=25),
     *                 @OA\Property(property="meeting_day", type="string", example="Sunday"),
     *                 @OA\Property(property="meeting_time", type="string", example="4:00 PM"),
     *                 @OA\Property(property="location", type="string", example="Youth Room"),
     *                 @OA\Property(property="status", type="string", example="Active"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
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
    public function show(int $id): JsonResponse
    {
        $group = Group::with(['creator', 'fileUploads'])->find($id);

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        // Transform the group data to include file information
        $groupData = $group->toArray();
        $groupData['files'] = $group->fileUploads->map(function ($file) {
            return [
                'id' => $file->id,
                'upload_token' => $file->upload_token,
                'filename' => $file->filename,
                'url' => $file->url,
                'size' => $file->human_size,
                'mime_type' => $file->mime_type,
                'is_image' => $file->isImage(),
                'is_document' => $file->isDocument(),
                'created_at' => $file->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Group retrieved successfully',
            'data' => $groupData
        ]);
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
     *             @OA\Property(property="name", type="string", example="Youth Ministry"),
     *             @OA\Property(property="description", type="string", example="Engaging young people in faith"),
     *             @OA\Property(property="category", type="string", example="Ministry"),
     *             @OA\Property(property="leader_id", type="integer", example=1),
     *             @OA\Property(property="leader_name", type="string", example="Sarah Johnson"),
     *             @OA\Property(property="max_members", type="integer", example=30),
     *             @OA\Property(property="meeting_day", type="string", example="Sunday"),
     *             @OA\Property(property="meeting_time", type="string", example="4:00 PM"),
     *             @OA\Property(property="location", type="string", example="Youth Room"),
     *             @OA\Property(property="status", type="string", example="Active")
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

    /**
     * @OA\Get(
     *     path="/api/v1/groups/{id}/files",
     *     summary="Get all files for a group",
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
     *         description="Files retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Files retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="upload_token", type="string", example="abc123def456..."),
     *                     @OA\Property(property="filename", type="string", example="group-document.pdf"),
     *                     @OA\Property(property="url", type="string", example="http://example.com/storage/uploads/2024/01/15/abc123.pdf"),
     *                     @OA\Property(property="size", type="string", example="2.5 MB"),
     *                     @OA\Property(property="mime_type", type="string", example="application/pdf"),
     *                     @OA\Property(property="is_image", type="boolean", example=false),
     *                     @OA\Property(property="is_document", type="boolean", example=true),
     *                     @OA\Property(property="created_at", type="string", format="date-time")
     *                 )
     *             )
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
    public function getFiles(int $id): JsonResponse
    {
        $group = Group::with(['fileUploads'])->find($id);

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        $files = $group->fileUploads->map(function ($file) {
            return [
                'id' => $file->id,
                'upload_token' => $file->upload_token,
                'filename' => $file->filename,
                'url' => $file->url,
                'size' => $file->human_size,
                'mime_type' => $file->mime_type,
                'is_image' => $file->isImage(),
                'is_document' => $file->isDocument(),
                'created_at' => $file->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Files retrieved successfully',
            'data' => $files
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/groups/{id}/files/{token}",
     *     summary="Delete a file from a group",
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
     *         name="token",
     *         in="path",
     *         description="File upload token",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="File deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="File deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Group or file not found"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function deleteFile(int $id, string $token): JsonResponse
    {
        $group = Group::find($id);
        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Group not found'
            ], 404);
        }

        try {
            $fileUpload = $this->fileUploadService->getFileByToken($token);

            if (!$fileUpload) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found',
                ], 404);
            }

            // Check if the file belongs to this group
            if ($fileUpload->model_type !== Group::class || $fileUpload->model_id !== $group->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'File does not belong to this group',
                ], 403);
            }

            $this->fileUploadService->deleteFile($fileUpload);

            return response()->json([
                'success' => true,
                'message' => 'File deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


}
