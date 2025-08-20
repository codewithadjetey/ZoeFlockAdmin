<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $expenses = Expense::with('category')->orderBy('id', 'desc')->paginate($perPage);
        return response()->json([
            'data' => $expenses->items(),
            'meta' => [
                'current_page' => $expenses->currentPage(),
                'last_page' => $expenses->lastPage(),
                'per_page' => $expenses->perPage(),
                'total' => $expenses->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:expense_categories,id',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'paid_date' => 'required|date',
            'due_date' => 'nullable|date',
            'is_paid' => 'boolean',
        ]);
        $expense = Expense::create($validated);
        return response()->json($expense->load('category'), 201);
    }

    public function show($id)
    {
        $expense = Expense::with('category')->findOrFail($id);
        return response()->json($expense);
    }

    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:expense_categories,id',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0',
            'paid_date' => 'sometimes|required|date',
            'due_date' => 'nullable|date',
            'is_paid' => 'boolean',
        ]);
        $expense->update($validated);
        return response()->json($expense->load('category'));
    }

    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}