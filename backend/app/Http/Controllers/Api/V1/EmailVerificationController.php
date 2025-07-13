<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\URL;

/**
 * @OA\Tag(
 *     name="Email Verification",
 *     description="Email verification endpoints"
 * )
 */
class EmailVerificationController extends Controller
{
    /**
     * Send verification email
     * 
     * @OA\Post(
     *     path="/auth/send-verification-email",
     *     operationId="sendVerificationEmail",
     *     tags={"Email Verification"},
     *     summary="Send verification email",
     *     description="Sends a verification email to the user's email address",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", description="User's email address")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Verification email sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Verification email sent successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="User not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="User not found")
     *         )
     *     )
     * )
     */
    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email is already verified'
            ], 400);
        }

        // Generate verification token
        $token = Str::random(64);
        $user->email_verification_token = $token;
        $user->email_verification_expires_at = now()->addHours(24);
        $user->save();

        // Generate verification URL for frontend
        $verificationUrl = config('app.frontend_url') . '/auth/verify-email?token=' . $token . '&email=' . urlencode($user->email);

        // Send verification email
        try {
            Mail::raw($this->getVerificationEmailContent($user, $verificationUrl), function ($message) use ($user) {
                $message->to($user->email);
                $message->subject('Verify Your Email Address - Zoe Flock Admin');
            });

            return response()->json([
                'success' => true,
                'message' => 'Verification email sent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email'
            ], 500);
        }
    }

    /**
     * Verify email
     * 
     * @OA\Post(
     *     path="/auth/verify-email",
     *     operationId="verifyEmail",
     *     tags={"Email Verification"},
     *     summary="Verify email address",
     *     description="Verifies the user's email address using the verification token",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","token"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", description="User's email address"),
     *             @OA\Property(property="token", type="string", example="abc123...", description="Verification token")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Email verified successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Email verified successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid or expired token",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid or expired verification token")
     *         )
     *     )
     * )
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email is already verified'
            ], 400);
        }

        if ($user->email_verification_token !== $request->token) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification token'
            ], 400);
        }

        if ($user->email_verification_expires_at && $user->email_verification_expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Verification token has expired'
            ], 400);
        }

        // Mark email as verified
        $user->email_verified_at = now();
        $user->email_verification_token = null;
        $user->email_verification_expires_at = null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully'
        ]);
    }

    /**
     * Resend verification email
     * 
     * @OA\Post(
     *     path="/auth/resend-verification-email",
     *     operationId="resendVerificationEmail",
     *     tags={"Email Verification"},
     *     summary="Resend verification email",
     *     description="Resends a verification email to the user's email address",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Verification email resent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Verification email resent successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Email already verified",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Email is already verified")
     *         )
     *     )
     * )
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email is already verified'
            ], 400);
        }

        // Generate new verification token
        $token = Str::random(64);
        $user->email_verification_token = $token;
        $user->email_verification_expires_at = now()->addHours(24);
        $user->save();

        // Generate verification URL for frontend
        $verificationUrl = config('app.frontend_url') . '/auth/verify-email?token=' . $token . '&email=' . urlencode($user->email);

        // Send verification email
        try {
            Mail::raw($this->getVerificationEmailContent($user, $verificationUrl), function ($message) use ($user) {
                $message->to($user->email);
                $message->subject('Verify Your Email Address - Zoe Flock Admin');
            });

            return response()->json([
                'success' => true,
                'message' => 'Verification email resent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email'
            ], 500);
        }
    }

    /**
     * Get verification email content
     */
    private function getVerificationEmailContent(User $user, string $verificationUrl): string
    {
        return "
Hello {$user->name},

Thank you for registering with Zoe Flock Admin. To complete your registration and verify your email address, please click the link below:

{$verificationUrl}

If the link doesn't work, you can copy and paste it into your browser.

Important: This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification email.

If you didn't create an account with us, please ignore this email.

Best regards,
The Zoe Flock Admin Team

---
This email was sent from Zoe Flock Admin. Please do not reply to this email.
© " . date('Y') . " Zoe Flock Admin. All rights reserved.
        ";
    }
} 