<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="Zoe Flock Admin API",
 *     description="Church Management System API Documentation",
 *     @OA\Contact(
 *         email="support@zoeflockadmin.com",
 *         name="API Support"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * 
 * @OA\Server(
 *     url="http://zoeflockadmin.org/api/v1",
 *     description="Local Development Server"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
class AuthController extends Controller
{
    /**
     * Register a new user
     * 
     * @OA\Post(
     *     path="/auth/register",
     *     operationId="registerUser",
     *     tags={"Authentication"},
     *     summary="Register a new user",
     *     description="Creates a new user account with member role",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *             @OA\Property(property="name", type="string", example="John Doe", description="User's full name"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", description="User's email address"),
     *             @OA\Property(property="password", type="string", format="password", example="password123", description="User's password"),
     *             @OA\Property(property="password_confirmation", type="string", example="password123", description="Password confirmation"),
     *             @OA\Property(property="phone", type="string", example="+1234567890", description="User's phone number"),
     *             @OA\Property(property="address", type="string", example="123 Church St", description="User's address"),
     *             @OA\Property(property="date_of_birth", type="string", format="date", example="1990-01-01", description="User's date of birth"),
     *             @OA\Property(property="gender", type="string", enum={"male","female","other"}, example="male", description="User's gender")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User registered successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User registered successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="user", type="object"),
     *                 @OA\Property(property="token", type="string", example="1|abc123..."),
     *                 @OA\Property(property="token_type", type="string", example="Bearer")
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
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
        ]);

        // Assign default role (member)
        $user->assignRole('member');

        // Send verification email
        try {
            $emailVerificationController = new \App\Http\Controllers\Api\V1\EmailVerificationController();
            $emailVerificationController->sendVerificationEmail($request);
        } catch (\Exception $e) {
            // Log the error but don't fail registration
            \Log::error('Failed to send verification email: ' . $e->getMessage());
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully. Please check your email to verify your account.',
            'data' => [
                'user' => $user->load('roles'),
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }

    /**
     * Login user
     * 
     * @OA\Post(
     *     path="/auth/login",
     *     operationId="loginUser",
     *     tags={"Authentication"},
     *     summary="Login user",
     *     description="Authenticates a user and returns access token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", description="User's email address"),
     *             @OA\Property(property="password", type="string", format="password", example="password123", description="User's password")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Login successful"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="user",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="John Doe"),
     *                     @OA\Property(property="email", type="string", example="john@example.com"),
     *                     @OA\Property(property="phone", type="string", example="+1234567890"),
     *                     @OA\Property(property="address", type="string", example="123 Church St"),
     *                     @OA\Property(property="date_of_birth", type="string", format="date", example="1990-01-01"),
     *                     @OA\Property(property="gender", type="string", enum={"male","female","other"}, example="male"),
     *                     @OA\Property(property="profile_picture", type="string", example="https://example.com/avatar.jpg"),
     *                     @OA\Property(property="is_active", type="boolean", example=true),
     *                     @OA\Property(property="email_verified_at", type="string", format="date-time", example="2023-01-01T00:00:00Z"),
     *                     @OA\Property(property="created_at", type="string", format="date-time", example="2023-01-01T00:00:00Z"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time", example="2023-01-01T00:00:00Z"),
     *                     @OA\Property(property="role_display_name", type="string", example="Administrator"),
     *                     @OA\Property(property="is_admin", type="boolean", example=true),
     *                     @OA\Property(property="is_pastor", type="boolean", example=false),
     *                     @OA\Property(property="is_member", type="boolean", example=false),
     *                     @OA\Property(
     *                         property="roles",
     *                         type="array",
     *                         @OA\Items(
     *                             type="object",
     *                             @OA\Property(property="id", type="integer", example=1),
     *                             @OA\Property(property="name", type="string", example="admin"),
     *                             @OA\Property(property="display_name", type="string", example="Administrator"),
     *                             @OA\Property(property="description", type="string", example="Full system access"),
     *                             @OA\Property(
     *                                 property="permissions",
     *                                 type="array",
     *                                 @OA\Items(
     *                                     type="object",
     *                                     @OA\Property(property="id", type="integer", example=1),
     *                                     @OA\Property(property="name", type="string", example="manage_users"),
     *                                     @OA\Property(property="display_name", type="string", example="Manage Users"),
     *                                     @OA\Property(property="description", type="string", example="Can manage all users")
     *                                 )
     *                             )
     *                         )
     *                     ),
     *                     @OA\Property(
     *                         property="permissions",
     *                         type="array",
     *                         @OA\Items(
     *                             type="object",
     *                             @OA\Property(property="id", type="integer", example=1),
     *                             @OA\Property(property="name", type="string", example="manage_users"),
     *                             @OA\Property(property="display_name", type="string", example="Manage Users"),
     *                             @OA\Property(property="description", type="string", example="Can manage all users")
     *                         )
     *                     )
     *                 ),
     *                 @OA\Property(property="token", type="string", example="1|abc123..."),
     *                 @OA\Property(property="token_type", type="string", example="Bearer"),
     *                 @OA\Property(property="expires_in", type="integer", example=3600),
     *                 @OA\Property(property="refresh_token", type="string", nullable=true, example=null)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid credentials",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid credentials")
     *         )
     *     )
     * )
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = User::where('email', $request->email)->first();
        
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is deactivated'
            ], 401);
        }

        // Check if email is verified
        if (!$user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email address before logging in. Check your inbox for a verification link.',
                'email_verification_required' => true
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Load user with roles and permissions
        $user->load(['roles.permissions']);

        // Prepare user data with additional computed fields
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'date_of_birth' => $user->date_of_birth,
            'gender' => $user->gender,
            'profile_picture' => $user->profile_picture,
            'is_active' => $user->is_active,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'roles' => $user->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name,
                    'description' => $role->description,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                            'display_name' => $permission->display_name,
                            'description' => $permission->description
                        ];
                    })
                ];
            }),
            'permissions' => $user->getAllPermissions()->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'display_name' => $permission->display_name,
                    'description' => $permission->description
                ];
            }),
            'role_display_name' => $user->role_display_name,
            'is_admin' => $user->isAdmin(),
            'is_pastor' => $user->isPastor(),
            'is_member' => $user->isMember(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $userData,
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => config('sanctum.expiration') * 60, // Convert to seconds
                'refresh_token' => null // For future implementation
            ]
        ]);
    }

    /**
     * Logout user
     * 
     * @OA\Post(
     *     path="/auth/logout",
     *     operationId="logoutUser",
     *     tags={"Authentication"},
     *     summary="Logout user",
     *     description="Logs out the authenticated user by revoking the current token",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Logged out successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     )
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user profile
     * 
     * @OA\Get(
     *     path="/auth/profile",
     *     operationId="getUserProfile",
     *     tags={"Authentication"},
     *     summary="Get user profile",
     *     description="Returns the profile of the authenticated user",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Profile retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="user", type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     )
     * )
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user
            ]
        ]);
    }

    /**
     * Update user profile
     * 
     * @OA\Put(
     *     path="/auth/profile",
     *     operationId="updateUserProfile",
     *     tags={"Authentication"},
     *     summary="Update user profile",
     *     description="Updates the profile of the authenticated user",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="John Doe", description="User's full name"),
     *             @OA\Property(property="phone", type="string", example="+1234567890", description="User's phone number"),
     *             @OA\Property(property="address", type="string", example="123 Church St", description="User's address"),
     *             @OA\Property(property="date_of_birth", type="string", format="date", example="1990-01-01", description="User's date of birth"),
     *             @OA\Property(property="gender", type="string", enum={"male","female","other"}, example="male", description="User's gender"),
     *             @OA\Property(property="profile_picture", type="string", example="https://example.com/avatar.jpg", description="User's profile picture URL")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Profile updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Profile updated successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="user", type="object")
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
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'profile_picture' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only([
            'name', 'phone', 'address', 'date_of_birth', 'gender', 'profile_picture'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'user' => $user->load('roles')
            ]
        ]);
    }

    /**
     * Change password
     * 
     * @OA\Put(
     *     path="/auth/change-password",
     *     operationId="changePassword",
     *     tags={"Authentication"},
     *     summary="Change password",
     *     description="Changes the password of the authenticated user",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"current_password","new_password","new_password_confirmation"},
     *             @OA\Property(property="current_password", type="string", format="password", example="oldpassword123", description="Current password"),
     *             @OA\Property(property="new_password", type="string", format="password", example="newpassword123", description="New password"),
     *             @OA\Property(property="new_password_confirmation", type="string", example="newpassword123", description="New password confirmation")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password changed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Password changed successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Current password is incorrect",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Current password is incorrect")
     *         )
     *     )
     * )
     */
    public function changePassword(Request $request): JsonResponse
    {
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

        $user = $request->user();

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
    }

    /**
     * Send password reset link
     * 
     * @OA\Post(
     *     path="/auth/forgot-password",
     *     operationId="forgotPassword",
     *     tags={"Authentication"},
     *     summary="Send password reset link",
     *     description="Sends a password reset link to the user's email",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", description="User's email address")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password reset link sent",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Password reset link sent to your email")
     *         )
     *     )
     * )
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // TODO: Implement password reset logic
        // For now, just return success message

        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent to your email'
        ]);
    }

    /**
     * Reset password
     * 
     * @OA\Post(
     *     path="/auth/reset-password",
     *     operationId="resetPassword",
     *     tags={"Authentication"},
     *     summary="Reset password",
     *     description="Resets the user's password using the reset token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token","email","password","password_confirmation"},
     *             @OA\Property(property="token", type="string", example="reset-token-123", description="Password reset token"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", description="User's email address"),
     *             @OA\Property(property="password", type="string", format="password", example="newpassword123", description="New password"),
     *             @OA\Property(property="password_confirmation", type="string", example="newpassword123", description="New password confirmation")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password reset successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Password reset successfully")
     *         )
     *     )
     * )
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|string|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // TODO: Implement password reset logic
        // For now, just return success message

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully'
        ]);
    }
}
