<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Income;
use App\Models\Expense;
use App\Models\IncomeCategory;
use App\Models\ExpenseCategory;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Get income report data
     */
    public function getIncomeReport(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'category' => 'nullable|string',
            'period' => 'nullable|in:daily,weekly,monthly,quarterly,yearly'
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $category = $request->category;

        // Build query
        $query = Income::with('category')
            ->whereBetween('received_date', [$startDate, $endDate])
            ->where('is_received', true);

        if ($category && $category !== 'all') {
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('name', 'like', "%{$category}%");
            });
        }

        // Get total income
        $totalIncome = $query->sum('amount');
        
        // Get total transactions
        $totalTransactions = $query->count();
        
        // Get average amount
        $averageAmount = $totalTransactions > 0 ? $totalIncome / $totalTransactions : 0;

        // Get category breakdown
        $categoryBreakdown = $query->select(
            'income_categories.name as category',
            DB::raw('SUM(incomes.amount) as amount'),
            DB::raw('COUNT(*) as count'),
            DB::raw('AVG(incomes.amount) as avg_amount')
        )
        ->join('income_categories', 'incomes.category_id', '=', 'income_categories.id')
        ->groupBy('income_categories.id', 'income_categories.name')
        ->orderBy('amount', 'desc')
        ->get()
        ->map(function ($item) {
            // Calculate trend (mock data for now)
            $trend = $this->calculateTrend($item->amount);
            return [
                'category' => $item->category,
                'amount' => $item->amount,
                'count' => $item->count,
                'avgAmount' => round($item->avg_amount, 2),
                'trend' => $trend
            ];
        });

        // Get monthly trends
        $monthlyTrends = $this->getMonthlyTrends($startDate, $endDate, $category);

        // Calculate growth rate (mock data for now)
        $growthRate = $this->calculateGrowthRate($totalIncome);

        return response()->json([
            'totalIncome' => $totalIncome,
            'totalTransactions' => $totalTransactions,
            'averageAmount' => round($averageAmount, 2),
            'growthRate' => $growthRate,
            'categoryBreakdown' => $categoryBreakdown,
            'monthlyTrends' => $monthlyTrends
        ]);
    }

    /**
     * Get expense report data
     */
    public function getExpenseReport(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'category' => 'nullable|string',
            'period' => 'nullable|in:daily,weekly,monthly,quarterly,yearly'
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $category = $request->category;

        // Build query
        $query = Expense::with('category')
            ->whereBetween('paid_date', [$startDate, $endDate])
            ->where('is_paid', true);

        if ($category && $category !== 'all') {
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('name', 'like', "%{$category}%");
            });
        }

        // Get total expenses
        $totalExpenses = $query->sum('amount');
        
        // Get total budget (mock data for now)
        $totalBudget = $totalExpenses * 0.9; // Assume budget is 90% of actual
        
        // Calculate variance
        $variance = $totalBudget - $totalExpenses;
        
        // Calculate average per month
        $monthsDiff = $startDate->diffInMonths($endDate) + 1;
        $averagePerMonth = $monthsDiff > 0 ? $totalExpenses / $monthsDiff : 0;

        // Get category breakdown
        $categoryBreakdown = $query->select(
            'expense_categories.name as category',
            DB::raw('SUM(expenses.amount) as amount'),
            DB::raw('COUNT(*) as count'),
            DB::raw('AVG(expenses.amount) as avg_amount')
        )
        ->join('expense_categories', 'expenses.category_id', '=', 'expense_categories.id')
        ->groupBy('expense_categories.id', 'expense_categories.name')
        ->orderBy('amount', 'desc')
        ->get()
        ->map(function ($item) {
            // Mock budget for each category
            $budget = $item->amount * 0.9;
            $trend = $this->calculateTrend($item->amount);
            $status = $this->getBudgetStatus($item->amount, $budget);
            
            return [
                'category' => $item->category,
                'amount' => $item->amount,
                'budget' => round($budget, 2),
                'count' => $item->count,
                'avgAmount' => round($item->avg_amount, 2),
                'trend' => $trend,
                'status' => $status
            ];
        });

        // Get monthly trends
        $monthlyTrends = $this->getExpenseMonthlyTrends($startDate, $endDate, $category);

        return response()->json([
            'totalExpenses' => $totalExpenses,
            'totalBudget' => round($totalBudget, 2),
            'variance' => round($variance, 2),
            'averagePerMonth' => round($averagePerMonth, 2),
            'categoryBreakdown' => $categoryBreakdown,
            'monthlyTrends' => $monthlyTrends
        ]);
    }

    /**
     * Get income vs expenses comparison report
     */
    public function getComparisonReport(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'period' => 'nullable|in:daily,weekly,monthly,quarterly,yearly'
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);

        // Get income data
        $totalIncome = Income::whereBetween('received_date', [$startDate, $endDate])
            ->where('is_received', true)
            ->sum('amount');

        // Get expense data
        $totalExpenses = Expense::whereBetween('paid_date', [$startDate, $endDate])
            ->where('is_paid', true)
            ->sum('amount');

        // Calculate net profit and margin
        $netProfit = $totalIncome - $totalExpenses;
        $profitMargin = $totalIncome > 0 ? ($netProfit / $totalIncome) * 100 : 0;

        // Get monthly comparison
        $monthlyComparison = $this->getMonthlyComparison($startDate, $endDate);

        // Get category comparison
        $categoryComparison = $this->getCategoryComparison($startDate, $endDate);

        return response()->json([
            'totalIncome' => $totalIncome,
            'totalExpenses' => $totalExpenses,
            'netProfit' => $netProfit,
            'profitMargin' => round($profitMargin, 2),
            'monthlyComparison' => $monthlyComparison,
            'categoryComparison' => $categoryComparison
        ]);
    }

    /**
     * Export report
     */
    public function exportReport(Request $request): JsonResponse
    {
        $request->validate([
            'reportType' => 'required|in:comprehensive,income,expenses,comparison,budget,custom',
            'startDate' => 'required|date',
            'endDate' => 'required|date|after:startDate',
            'format' => 'required|in:excel,pdf,csv,json',
            'includeCharts' => 'boolean',
            'includeTables' => 'boolean'
        ]);

        // Mock export process
        $filename = "financial_report_{$request->reportType}_{$request->startDate}_{$request->endDate}.{$request->format}";
        $downloadUrl = "/storage/exports/{$filename}";

        return response()->json([
            'downloadUrl' => $downloadUrl,
            'filename' => $filename
        ]);
    }

    /**
     * Download exported report
     */
    public function downloadReport($id): JsonResponse
    {
        // Mock download process
        return response()->json([
            'message' => 'Download started',
            'fileId' => $id
        ]);
    }

    /**
     * Delete exported report
     */
    public function deleteExport($id): JsonResponse
    {
        // Mock delete process
        return response()->json([
            'message' => 'Export deleted successfully',
            'fileId' => $id
        ]);
    }

    /**
     * Get export history
     */
    public function getExportHistory(): JsonResponse
    {
        // Mock export history
        $history = [
            [
                'id' => 1,
                'name' => 'Q1 Financial Report',
                'type' => 'Quarterly',
                'format' => 'Excel',
                'date' => '2024-04-01',
                'status' => 'completed',
                'size' => '2.4 MB'
            ],
            [
                'id' => 2,
                'name' => 'Annual Income Summary',
                'type' => 'Annual',
                'format' => 'PDF',
                'date' => '2024-01-15',
                'status' => 'completed',
                'size' => '1.8 MB'
            ]
        ];

        return response()->json($history);
    }

    /**
     * Get dashboard summary
     */
    public function getDashboardSummary(): JsonResponse
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        // Current month data
        $currentIncome = Income::whereMonth('received_date', $currentMonth->month)
            ->where('is_received', true)
            ->sum('amount');

        $currentExpenses = Expense::whereMonth('paid_date', $currentMonth->month)
            ->where('is_paid', true)
            ->sum('amount');

        // Last month data
        $lastMonthIncome = Income::whereMonth('received_date', $lastMonth->month)
            ->where('is_received', true)
            ->sum('amount');

        $lastMonthExpenses = Expense::whereMonth('paid_date', $lastMonth->month)
            ->where('is_paid', true)
            ->sum('amount');

        // Calculate net profit
        $currentProfit = $currentIncome - $currentExpenses;
        $lastMonthProfit = $lastMonthIncome - $lastMonthExpenses;

        // Mock pending payments
        $pendingPayments = Income::where('is_received', false)
            ->where('due_date', '>=', Carbon::now())
            ->sum('amount');

        // Get monthly trends for the last 6 months
        $monthlyTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $income = Income::whereMonth('received_date', $month->month)
                ->where('is_received', true)
                ->sum('amount');
            $expenses = Expense::whereMonth('paid_date', $month->month)
                ->where('is_paid', true)
                ->sum('amount');
            $profit = $income - $expenses;

            $monthlyTrends[] = [
                'month' => $month->format('M'),
                'income' => $income,
                'expenses' => $expenses,
                'profit' => $profit
            ];
        }

        return response()->json([
            'totalIncome' => $currentIncome,
            'totalExpenses' => $currentExpenses,
            'netProfit' => $currentProfit,
            'pendingPayments' => $pendingPayments,
            'monthlyTrends' => $monthlyTrends
        ]);
    }

    /**
     * Get financial insights
     */
    public function getFinancialInsights(): JsonResponse
    {
        $currentMonth = Carbon::now()->startOfMonth();

        // Get top income category
        $topIncomeCategory = Income::with('category')
            ->whereMonth('received_date', $currentMonth->month)
            ->where('is_received', true)
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->orderBy('total', 'desc')
            ->first();

        // Get top expense category
        $topExpenseCategory = Expense::with('category')
            ->whereMonth('paid_date', $currentMonth->month)
            ->where('is_paid', true)
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->orderBy('total', 'desc')
            ->first();

        // Mock insights
        $growthOpportunities = [
            'Expand partnership programs to diversify income sources',
            'Implement automated giving platforms to increase offerings',
            'Develop corporate sponsorship opportunities'
        ];

        $riskFactors = [
            'High dependency on traditional giving methods',
            'Seasonal fluctuations in income',
            'Limited expense control mechanisms'
        ];

        return response()->json([
            'topIncomeCategory' => $topIncomeCategory ? $topIncomeCategory->category->name : 'N/A',
            'topExpenseCategory' => $topExpenseCategory ? $topExpenseCategory->category->name : 'N/A',
            'budgetVariance' => 0, // Mock data
            'growthOpportunities' => $growthOpportunities,
            'riskFactors' => $riskFactors
        ]);
    }

    /**
     * Helper methods
     */
    public function calculateTrend($amount): string
    {
        // Mock trend calculation
        $trends = ['+12.5%', '+8.2%', '+15.7%', '+5.3%', '+2.1%', '-3.1%'];
        return $trends[array_rand($trends)];
    }

    private function calculateGrowthRate($amount): string
    {
        // Mock growth rate calculation
        $rates = ['+12.5%', '+8.2%', '+15.7%', '+5.3%', '+2.1%'];
        return $rates[array_rand($rates)];
    }

    private function getBudgetStatus($amount, $budget): string
    {
        $percentage = ($amount / $budget) * 100;
        if ($percentage <= 90) return 'under_budget';
        if ($percentage <= 110) return 'on_budget';
        return 'over_budget';
    }

    private function getMonthlyTrends($startDate, $endDate, $category = null): array
    {
        // Mock monthly trends data
        $months = [];
        $current = $startDate->copy();
        
        while ($current <= $endDate) {
            $months[] = [
                'month' => $current->format('M'),
                'tithes' => rand(800, 2000),
                'offerings' => rand(600, 1400),
                'partnerships' => rand(400, 1200),
                'total' => rand(2000, 4000)
            ];
            $current->addMonth();
        }

        return $months;
    }

    private function getExpenseMonthlyTrends($startDate, $endDate, $category = null): array
    {
        // Mock monthly trends data
        $months = [];
        $current = $startDate->copy();
        
        while ($current <= $endDate) {
            $months[] = [
                'month' => $current->format('M'),
                'utilities' => rand(600, 900),
                'maintenance' => rand(400, 800),
                'office' => rand(200, 400),
                'events' => rand(500, 1000),
                'tech' => rand(300, 600),
                'total' => rand(2000, 3500)
            ];
            $current->addMonth();
        }

        return $months;
    }

    private function getMonthlyComparison($startDate, $endDate): array
    {
        // Mock monthly comparison data
        $months = [];
        $current = $startDate->copy();
        
        while ($current <= $endDate) {
            $income = rand(3000, 4500);
            $expenses = rand(2500, 3500);
            $profit = $income - $expenses;
            $profitMargin = $income > 0 ? ($profit / $income) * 100 : 0;

            $months[] = [
                'month' => $current->format('M'),
                'income' => $income,
                'expenses' => $expenses,
                'profit' => $profit,
                'profitMargin' => round($profitMargin, 1)
            ];
            $current->addMonth();
        }

        return $months;
    }

    private function getCategoryComparison($startDate, $endDate): array
    {
        // Mock category comparison data
        return [
            [
                'category' => 'Tithes',
                'income' => 18500,
                'expenses' => 0,
                'net' => 18500,
                'percentage' => 40.8
            ],
            [
                'category' => 'Offerings',
                'income' => 12400,
                'expenses' => 0,
                'net' => 12400,
                'percentage' => 27.4
            ],
            [
                'category' => 'Partnerships',
                'income' => 9800,
                'expenses' => 0,
                'net' => 9800,
                'percentage' => 21.6
            ],
            [
                'category' => 'Utilities',
                'income' => 0,
                'expenses' => 8500,
                'net' => -8500,
                'percentage' => 18.8
            ],
            [
                'category' => 'Maintenance',
                'income' => 0,
                'expenses' => 6200,
                'net' => -6200,
                'percentage' => 13.7
            ],
            [
                'category' => 'Events',
                'income' => 0,
                'expenses' => 7800,
                'net' => -7800,
                'percentage' => 17.2
            ]
        ];
    }
} 