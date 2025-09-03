<?php

namespace App\Http\Controllers\Api\V1\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use App\Models\EventCategory;

/**
 * @OA\Tag(
 *     name="Frontend Events",
 *     description="Public API Endpoints for event information (no authentication required)"
 * )
 */
class EventController extends Controller
{
    /**
     * Display the specified event category (public/guest).
     * 
     * @OA\Get(
     *     path="/api/v1/frontend/event-category/{id}",
     *     summary="Get today's events for a specific category",
     *     tags={"Frontend Events"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Event category ID",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Events retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="category_id", type="integer", example=1),
     *                 @OA\Property(property="title", type="string", example="Sunday Service"),
     *                 @OA\Property(property="description", type="string", example="Weekly Sunday worship service"),
     *                 @OA\Property(property="start_date", type="string", format="date-time"),
     *                 @OA\Property(property="end_date", type="string", format="date-time"),
     *                 @OA\Property(property="start_time", type="string", example="10:00:00"),
     *                 @OA\Property(property="end_time", type="string", example="12:00:00"),
     *                 @OA\Property(property="location", type="string", example="Main Auditorium"),
     *                 @OA\Property(property="is_active", type="boolean", example=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             ))
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Event category not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Event category not found.")
     *         )
     *     )
     * )
     */
    public function show($id)
    {
        $category = EventCategory::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Event category not found.'], 404);
        }

        //look for Event under this category where is held today
        $events = Event::where('category_id', $id)->where('date', now()->toDateString())->get();

        return response()->json(['success' => true, 'data' => $events]);
    }
}