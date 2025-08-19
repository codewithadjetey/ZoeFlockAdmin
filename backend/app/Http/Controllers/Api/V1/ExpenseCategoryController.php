<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    public function index()
    {
        return response()->json(ExpenseCategory::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        $category = ExpenseCategory::create($validated);
        return response()->json($category, 201);
    }

    public function show($id)
    {
        $category = ExpenseCategory::findOrFail($id);
        return response()->json($category);
    }

    public function update(Request $request, $id)
    {
        $category = ExpenseCategory::findOrFail($id);
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
        $category = ExpenseCategory::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}