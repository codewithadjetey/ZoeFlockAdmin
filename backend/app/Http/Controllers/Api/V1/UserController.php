<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        try {
            $query = User::with(['roles', 'permissions']);

            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            // Filter by role
            if ($request->has('role')) {
                $role = $request->role;
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            }

            // Filter by status
            if ($request->has('status')) {
                $status = $request->status === 'active' ? 1 : 0;
                $query->where('is_active', $status);
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $users = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $users,
                'message' => 'Users retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        try {
            // Debug logging
            \Log::info('Creating user with data:', $request->all());
            \Log::info('Date of birth value:', ['date_of_birth' => $request->date_of_birth]);
            \Log::info('Date of birth type:', ['type' => gettype($request->date_of_birth)]);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:male,female,other',
                'roles' => 'required|array',
                'roles.*' => 'exists:roles,name'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Handle empty date_of_birth - convert empty string to null
            $dateOfBirth = $request->date_of_birth;
            if ($dateOfBirth === '' || $dateOfBirth === null) {
                $dateOfBirth = null;
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'address' => $request->address,
                'date_of_birth' => $dateOfBirth,
                'gender' => $request->gender,
                'is_active' => true,
            ]);

            // Debug logging after creation
            \Log::info('User created:', $user->toArray());

            // Assign roles
            $user->assignRole($request->roles);

            DB::commit();

            $user->load(['roles', 'permissions']);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error creating user:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Error creating user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified user
     */
    public function show(User $user)
    {
        try {
            $user->load(['roles', 'permissions']);
            
            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        try {
            // Debug logging
            \Log::info('Updating user with data:', $request->all());
            \Log::info('Date of birth value:', ['date_of_birth' => $request->date_of_birth]);
            \Log::info('Date of birth type:', ['type' => gettype($request->date_of_birth)]);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:male,female,other',
                'is_active' => 'sometimes|boolean',
                'roles' => 'sometimes|array',
                'roles.*' => 'exists:roles,name'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $updateData = $request->only([
                'name', 'email', 'phone', 'address', 'date_of_birth', 'gender', 'is_active'
            ]);

            // Handle empty date_of_birth - convert empty string to null
            if (isset($updateData['date_of_birth']) && ($updateData['date_of_birth'] === '' || $updateData['date_of_birth'] === null)) {
                $updateData['date_of_birth'] = null;
            }

            // Debug logging before update
            \Log::info('Update data:', $updateData);

            $user->update($updateData);

            // Debug logging after update
            \Log::info('User updated:', $user->fresh()->toArray());

            // Update roles if provided
            if ($request->has('roles')) {
                $user->syncRoles($request->roles);
            }

            DB::commit();

            $user->load(['roles', 'permissions']);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error updating user:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Error updating user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        try {
            // Prevent deleting the last admin user
            if ($user->hasRole('admin')) {
                $adminCount = User::role('admin')->count();
                if ($adminCount <= 1) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot delete the last admin user'
                    ], 400);
                }
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request, User $user)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 400);
            }

            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error changing password: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle user active status
     */
    public function toggleStatus(User $user)
    {
        try {
            // Prevent deactivating the last admin user
            if ($user->hasRole('admin') && $user->is_active) {
                $adminCount = User::role('admin')->where('is_active', true)->count();
                if ($adminCount <= 1) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot deactivate the last admin user'
                    ], 400);
                }
            }

            $user->update([
                'is_active' => !$user->is_active
            ]);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User status updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating user status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'inactive_users' => User::where('is_active', false)->count(),
                'users_by_role' => [],
                'recent_users' => User::with('roles')
                    ->latest()
                    ->take(5)
                    ->get()
            ];

            // Get user count by role
            $roles = Role::all();
            foreach ($roles as $role) {
                $stats['users_by_role'][$role->name] = User::role($role->name)->count();
            }

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'User statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving user statistics: ' . $e->getMessage()
            ], 500);
        }
    }
} 