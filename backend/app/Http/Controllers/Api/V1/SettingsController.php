<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /**
     * Get church settings
     * 
     * @OA\Get(
     *     path="/api/v1/settings",
     *     operationId="getSettings",
     *     tags={"Settings"},
     *     summary="Get church settings",
     *     description="Retrieves church information and configuration settings",
     *     @OA\Response(
     *         response=200,
     *         description="Settings retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Settings retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="church", type="object"),
     *                 @OA\Property(property="registration", type="object"),
     *                 @OA\Property(property="service_times", type="object"),
     *                 @OA\Property(property="contact", type="object"),
     *                 @OA\Property(property="social_media", type="object"),
     *                 @OA\Property(property="features", type="object")
     *             )
     *         )
     *     )
     * )
     */
    public function getSettings(): JsonResponse
    {
        $settings = [
            'church' => [
                'name' => config('church.name'),
                'address' => config('church.address'),
                'phone' => config('church.phone'),
                'email' => config('church.email'),
                'website' => config('church.website'),
                'pastor_name' => config('church.pastor_name'),
                'established_year' => config('church.established_year'),
                'denomination' => config('church.denomination'),
            ],
            'registration' => [
                'allow_self_registration' => config('church.allow_self_registration'),
                'require_email_verification' => config('church.require_email_verification'),
                'require_admin_approval' => config('church.require_admin_approval'),
            ],
            'service_times' => config('church.service_times'),
            'contact' => [
                'phone' => config('church.contact_phone'),
                'email' => config('church.contact_email'),
                'emergency_contact' => config('church.emergency_contact'),
            ],
            'social_media' => config('church.social_media'),
            'features' => config('church.features'),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Settings retrieved successfully',
            'data' => $settings
        ]);
    }
}
