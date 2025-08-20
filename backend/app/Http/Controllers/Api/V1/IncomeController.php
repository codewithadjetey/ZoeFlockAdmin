<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Income;
use App\Models\IncomeCategory;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $incomes = Income::with('category')->orderBy('id', 'desc')->paginate($perPage);
        return response()->json([
            'data' => $incomes->items(),
            'meta' => [
                'current_page' => $incomes->currentPage(),
                'last_page' => $incomes->lastPage(),
                'per_page' => $incomes->perPage(),
                'total' => $incomes->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:income_categories,id',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'received_date' => 'required|date',
            'due_date' => 'nullable|date',
            'is_received' => 'boolean',
        ]);
        $income = Income::create($validated);
        return response()->json($income->load('category'), 201);
    }

    public function show($id)
    {
        $income = Income::with('category')->findOrFail($id);
        return response()->json($income);
    }

    public function update(Request $request, $id)
    {
        $income = Income::findOrFail($id);
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:income_categories,id',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0',
            'received_date' => 'sometimes|required|date',
            'due_date' => 'nullable|date',
            'is_received' => 'boolean',
        ]);
        $income->update($validated);
        return response()->json($income->load('category'));
    }

    public function destroy($id)
    {
        $income = Income::findOrFail($id);
        $income->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}