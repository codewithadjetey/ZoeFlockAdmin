<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PartnershipCategory;

class PartnershipCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = PartnershipCategory::query();
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%");
        }
        $perPage = $request->input('per_page', 10);
        $categories = $query->paginate($perPage);
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function show($id)
    {
        $category = PartnershipCategory::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $category = PartnershipCategory::create($validated);
        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function update(Request $request, $id)
    {
        $category = PartnershipCategory::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found'], 404);
        }
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $category->update($validated);
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroy($id)
    {
        $category = PartnershipCategory::find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found'], 404);
        }
        $category->delete();
        return response()->json(['success' => true, 'message' => 'Category deleted successfully']);
    }
}