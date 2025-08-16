<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Partnership;
use App\Models\PartnershipCategory;
use App\Models\Member;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PartnershipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Partnership::with(['member', 'category']);
        if ($request->has('member_id')) {
            $query->where('member_id', $request->member_id);
        }
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('frequency')) {
            $query->where('frequency', $request->frequency);
        }
        $partnerships = $query->paginate($request->get('per_page', 15));
        return response()->json(['success' => true, 'data' => $partnerships]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'member_id' => 'required|exists:members,id',
            'category_id' => 'required|exists:partnership_categories,id',
            'pledge_amount' => 'required|numeric|min:0',
            'frequency' => 'required|in:weekly,monthly,yearly,one-time',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        $partnership = Partnership::create($request->all());
        // TODO: Generate schedule records based on frequency
        return response()->json([
            'success' => true,
            'message' => 'Partnership created successfully',
            'data' => $partnership->load(['member', 'category'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $partnership = Partnership::with(['member', 'category'])->find($id);
        if (!$partnership) {
            return response()->json(['success' => false, 'message' => 'Partnership not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $partnership]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $partnership = Partnership::find($id);
        if (!$partnership) {
            return response()->json(['success' => false, 'message' => 'Partnership not found'], 404);
        }
        $validator = Validator::make($request->all(), [
            'member_id' => 'sometimes|required|exists:members,id',
            'category_id' => 'sometimes|required|exists:partnership_categories,id',
            'pledge_amount' => 'sometimes|required|numeric|min:0',
            'frequency' => 'sometimes|required|in:weekly,monthly,yearly,one-time',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        $partnership->fill($request->all());
        $partnership->save();
        // TODO: Update schedule records if needed
        return response()->json([
            'success' => true,
            'message' => 'Partnership updated successfully',
            'data' => $partnership->load(['member', 'category'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $partnership = Partnership::find($id);
        if (!$partnership) {
            return response()->json(['success' => false, 'message' => 'Partnership not found'], 404);
        }
        $partnership->delete();
        // TODO: Delete schedule records if implemented
        return response()->json(['success' => true, 'message' => 'Partnership deleted successfully']);
    }

    // Additional endpoint for schedule generation (stub)
    public function generateSchedule($id)
    {
        // TODO: Implement schedule generation logic based on frequency
        return response()->json(['success' => true, 'message' => 'Schedule generation not yet implemented']);
    }
}
