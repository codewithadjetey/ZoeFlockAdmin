<?php

namespace App\Http\Controllers\Api\V1\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use App\Models\EventCategory;

class EventController extends Controller
{
    /**
     * Display the specified event category (public/guest).
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