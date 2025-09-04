<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Roles",
 *     description="API Endpoints for role management"
 * )
 */
class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-roles');
        
        // Apply specific permissions to methods
        $this->middleware('permission:create-roles')->only(['store']);
        $this->middleware('permission:edit-roles')->only(['update']);
        $this->middleware('permission:delete-roles')->only(['destroy']);
        $this->middleware('permission:view-role-statistics')->only(['statistics']);
        $this->middleware('permission:view-role-permissions')->only(['permissions']);
        $this->middleware('permission:duplicate-role')->only(['duplicate']);
    }

    /**
     * Display a listing of roles
     * 
     * @OA\Get(
     *     path="/api/v1/roles",
     *     summary="Get all roles",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search roles by name, display_name, or description",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of roles per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Roles retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="data", type="array", @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="admin"),
     *                     @OA\Property(property="display_name", type="string", example="Administrator"),
     *                     @OA\Property(property="description", type="string", example="Full system access"),
     *                     @OA\Property(property="guard_name", type="string", example="web"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time"),
     *                     @OA\Property(property="permissions", type="array", @OA\Items(type="object"))
     *                 )),
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=1),
     *                 @OA\Property(property="per_page", type="integer", example=15),
     *                 @OA\Property(property="total", type="integer", example=1)
     *             ),
     *             @OA\Property(property="message", type="string", example="Roles retrieved successfully")
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
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error retrieving roles")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = Role::with(['permissions']);

            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('display_name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $roles = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $roles,
                'message' => 'Roles retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving roles: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created role
     * 
     * @OA\Post(
     *     path="/api/v1/roles",
     *     summary="Create a new role",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","display_name"},
     *             @OA\Property(property="name", type="string", example="editor", description="Unique role name"),
     *             @OA\Property(property="display_name", type="string", example="Editor", description="Human-readable role name"),
     *             @OA\Property(property="description", type="string", example="Can edit content", description="Role description"),
     *             @OA\Property(property="permissions", type="array", @OA\Items(type="string"), example={"edit_posts","view_posts"}, description="Array of permission names")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Role created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=2),
     *                 @OA\Property(property="name", type="string", example="editor"),
     *                 @OA\Property(property="display_name", type="string", example="Editor"),
     *                 @OA\Property(property="description", type="string", example="Can edit content"),
     *                 @OA\Property(property="guard_name", type="string", example="web"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="permissions", type="array", @OA\Items(type="object"))
     *             ),
     *             @OA\Property(property="message", type="string", example="Role created successfully")
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
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error creating role")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:roles,name',
                'display_name' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
                'permissions' => 'array',
                'permissions.*' => 'exists:permissions,name'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $role = Role::create([
                'name' => $request->name,
                'display_name' => $request->display_name,
                'description' => $request->description,
                'guard_name' => 'web',
            ]);

            // Assign permissions if provided
            if ($request->has('permissions')) {
                $role->syncPermissions($request->permissions);
            }

            DB::commit();

            $role->load(['permissions']);

            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Role created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified role
     * 
     * @OA\Get(
     *     path="/api/v1/roles/{role}",
     *     summary="Get a specific role",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="role",
     *         in="path",
     *         description="Role ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Role retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="admin"),
     *                 @OA\Property(property="display_name", type="string", example="Administrator"),
     *                 @OA\Property(property="description", type="string", example="Full system access"),
     *                 @OA\Property(property="guard_name", type="string", example="web"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="permissions", type="array", @OA\Items(type="object"))
     *             ),
     *             @OA\Property(property="message", type="string", example="Role retrieved successfully")
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
     *         description="Role not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Role not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error retrieving role")
     *         )
     *     )
     * )
     */
    public function show(Role $role)
    {
        try {
            $role->load(['permissions']);
            
            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Role retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified role
     * 
     * @OA\Put(
     *     path="/api/v1/roles/{role}",
     *     summary="Update a role",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="role",
     *         in="path",
     *         description="Role ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="editor", description="Unique role name"),
     *             @OA\Property(property="display_name", type="string", example="Editor", description="Human-readable role name"),
     *             @OA\Property(property="description", type="string", example="Can edit content", description="Role description"),
     *             @OA\Property(property="permissions", type="array", @OA\Items(type="string"), example={"edit_posts","view_posts"}, description="Array of permission names")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Role updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=2),
     *                 @OA\Property(property="name", type="string", example="editor"),
     *                 @OA\Property(property="display_name", type="string", example="Editor"),
     *                 @OA\Property(property="description", type="string", example="Can edit content"),
     *                 @OA\Property(property="guard_name", type="string", example="web"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="permissions", type="array", @OA\Items(type="object"))
     *             ),
     *             @OA\Property(property="message", type="string", example="Role updated successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad request",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="System roles cannot be modified")
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
     *         description="Role not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Role not found")
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
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error updating role")
     *         )
     *     )
     * )
     */
    public function update(Request $request, Role $role)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:roles,name,' . $role->id,
                'display_name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:500',
                'permissions' => 'sometimes|array',
                'permissions.*' => 'exists:permissions,name'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Prevent updating system roles
            if (in_array($role->name, ['admin', 'pastor', 'member'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'System roles cannot be modified'
                ], 400);
            }

            DB::beginTransaction();

            $role->update($request->only([
                'name', 'display_name', 'description'
            ]));

            // Update permissions if provided
            if ($request->has('permissions')) {
                $role->syncPermissions($request->permissions);
            }

            DB::commit();

            $role->load(['permissions']);

            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Role updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified role
     * 
     * @OA\Delete(
     *     path="/api/v1/roles/{role}",
     *     summary="Delete a role",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="role",
     *         in="path",
     *         description="Role ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Role deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Role deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Bad request",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="System roles cannot be deleted")
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
     *         description="Role not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Role not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error deleting role")
     *         )
     *     )
     * )
     */
    public function destroy(Role $role)
    {
        try {
            // Prevent deleting system roles
            if (in_array($role->name, ['admin', 'pastor', 'member'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'System roles cannot be deleted'
                ], 400);
            }

            // Check if role is assigned to any users
            $userCount = $role->users()->count();
            if ($userCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete role. It is assigned to {$userCount} user(s)"
                ], 400);
            }

            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting role: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all permissions
     * 
     * @OA\Get(
     *     path="/api/v1/roles/permissions",
     *     summary="Get all permissions",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Permissions retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="manage_users"),
     *                 @OA\Property(property="display_name", type="string", example="Manage Users"),
     *                 @OA\Property(property="description", type="string", example="Can manage all users"),
     *                 @OA\Property(property="guard_name", type="string", example="web"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )),
     *             @OA\Property(property="message", type="string", example="Permissions retrieved successfully")
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
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error retrieving permissions")
     *         )
     *     )
     * )
     */
    public function permissions()
    {
        try {
            $permissions = Permission::orderBy('display_name')->get();
            
            return response()->json([
                'success' => true,
                'data' => $permissions,
                'message' => 'Permissions retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving permissions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get role statistics
     * 
     * @OA\Get(
     *     path="/api/v1/roles/statistics",
     *     summary="Get role statistics",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Role statistics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="total_roles", type="integer", example=5),
     *                 @OA\Property(property="total_permissions", type="integer", example=20),
     *                 @OA\Property(property="roles_by_user_count", type="object", example={"admin":2,"member":50}),
     *                 @OA\Property(property="recent_roles", type="array", @OA\Items(type="object"))
     *             ),
     *             @OA\Property(property="message", type="string", example="Role statistics retrieved successfully")
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
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error retrieving role statistics")
     *         )
     *     )
     * )
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_roles' => Role::count(),
                'total_permissions' => Permission::count(),
                'roles_by_user_count' => [],
                'recent_roles' => Role::with('permissions')
                    ->latest()
                    ->take(5)
                    ->get()
            ];

            // Get user count by role
            $roles = Role::all();
            foreach ($roles as $role) {
                $stats['roles_by_user_count'][$role->name] = $role->users()->count();
            }

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Role statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving role statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Duplicate a role
     * 
     * @OA\Post(
     *     path="/api/v1/roles/{role}/duplicate",
     *     summary="Duplicate a role",
     *     tags={"Roles"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="role",
     *         in="path",
     *         description="Role ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Role duplicated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=3),
     *                 @OA\Property(property="name", type="string", example="editor_copy_1234567890"),
     *                 @OA\Property(property="display_name", type="string", example="Editor (Copy)"),
     *                 @OA\Property(property="description", type="string", example="Can edit content (Duplicated)"),
     *                 @OA\Property(property="guard_name", type="string", example="web"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="permissions", type="array", @OA\Items(type="object"))
     *             ),
     *             @OA\Property(property="message", type="string", example="Role duplicated successfully")
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
     *         description="Role not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Role not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Error duplicating role")
     *         )
     *     )
     * )
     */
    public function duplicate(Role $role)
    {
        try {
            DB::beginTransaction();

            $newRole = Role::create([
                'name' => $role->name . '_copy_' . time(),
                'display_name' => $role->display_name . ' (Copy)',
                'description' => $role->description . ' (Duplicated)',
                'guard_name' => 'web',
            ]);

            // Copy permissions
            $newRole->syncPermissions($role->permissions);

            DB::commit();

            $newRole->load(['permissions']);

            return response()->json([
                'success' => true,
                'data' => $newRole,
                'message' => 'Role duplicated successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error duplicating role: ' . $e->getMessage()
            ], 500);
        }
    }
} 