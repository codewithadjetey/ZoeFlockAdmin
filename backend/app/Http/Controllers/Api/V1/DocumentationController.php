<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(
 *     name="Documentation",
 *     description="API Documentation endpoints"
 * )
 */
class DocumentationController extends Controller
{
    /**
     * Get API information
     * 
     * @OA\Get(
     *     path="/info",
     *     operationId="getApiInfo",
     *     tags={"Documentation"},
     *     summary="Get API information",
     *     description="Returns basic information about the API",
     *     @OA\Response(
     *         response=200,
     *         description="API information retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="API information retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="name", type="string", example="Zoe Flock Admin API"),
     *                 @OA\Property(property="version", type="string", example="1.0.0"),
     *                 @OA\Property(property="description", type="string", example="Church Management System API"),
     *                 @OA\Property(property="documentation_url", type="string", example="/api/documentation"),
     *                 @OA\Property(property="base_url", type="string", example="http://localhost:8000/api/v1")
     *             )
     *         )
     *     )
     * )
     */
    public function info(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'API information retrieved successfully',
            'data' => [
                'name' => 'Zoe Flock Admin API',
                'version' => '1.0.0',
                'description' => 'Church Management System API',
                'documentation_url' => '/api/documentation',
                'base_url' => config('app.url') . '/api/v1',
                'features' => [
                    'Authentication & Authorization',
                    'Member Management',
                    'Event Management',
                    'Donation Tracking',
                    'Communication Tools',
                    'Group Management'
                ],
                'authentication' => [
                    'type' => 'Bearer Token',
                    'header' => 'Authorization: Bearer {token}'
                ]
            ]
        ]);
    }

    /**
     * Get API health status
     * 
     * @OA\Get(
     *     path="/health",
     *     operationId="getApiHealth",
     *     tags={"Documentation"},
     *     summary="Get API health status",
     *     description="Returns the health status of the API",
     *     @OA\Response(
     *         response=200,
     *         description="API is healthy",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="API is healthy"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="status", type="string", example="healthy"),
     *                 @OA\Property(property="timestamp", type="string", format="date-time"),
     *                 @OA\Property(property="version", type="string", example="1.0.0")
     *             )
     *         )
     *     )
     * )
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'API is healthy',
            'data' => [
                'status' => 'healthy',
                'timestamp' => now()->toISOString(),
                'version' => '1.0.0'
            ]
        ]);
    }
} 