<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\IncomeCategory;
use Illuminate\Http\Request;

class IncomeCategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $categories = IncomeCategory::orderBy('id', 'desc')->paginate($perPage);
        return response()->json([
            'data' => $categories->items(),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        $category = IncomeCategory::create($validated);
        return response()->json($category, 201);
    }

    public function show($id)
    {
        $category = IncomeCategory::findOrFail($id);
        return response()->json($category);
    }

    public function update(Request $request, $id)
    {
        $category = IncomeCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        $category->update($validated);
        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = IncomeCategory::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}