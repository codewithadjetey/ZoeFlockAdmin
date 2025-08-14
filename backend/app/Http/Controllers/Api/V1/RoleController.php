<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    /**
     * Display a listing of roles
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