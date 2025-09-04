<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EmailVerificationController;
use App\Http\Controllers\Api\V1\MemberController;
use App\Http\Controllers\Api\V1\DocumentationController;
use App\Http\Controllers\Api\V1\FileUploadController;
use App\Http\Controllers\Api\V1\GroupController;
use App\Http\Controllers\Api\V1\FamilyController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\EntityController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\GeneralAttendanceController;
use App\Http\Controllers\Api\V1\EventCategoryController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\PartnershipController;
use App\Http\Controllers\Api\V1\FirstTimerController;
use App\Http\Controllers\Api\V1\ExpenseCategoryController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\IncomeController;
use App\Http\Controllers\Api\V1\IncomeCategoryController;
use App\Http\Controllers\Api\V1\TitheController;
use App\Http\Controllers\Api\V1\ImportController;
use App\Http\Controllers\Api\V1\BackupController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\PartnershipCategoryController;
use App\Http\Controllers\Api\V1\ReportsController;
use App\Http\Controllers\Api\V1\TithePaymentController;

// Get the API version from config
$apiVersion = config('app.version', 'v1');

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Version all API routes
Route::prefix($apiVersion)->group(function () {
    // Public routes (no authentication required)
    require __DIR__.'/frontend.php';
    
    // Individual attendance statistics (should be inside the group if versioned)
    Route::get('attendance/statistics/individual', [\App\Http\Controllers\Api\V1\AttendanceController::class, 'getIndividualStatistics']);

    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        
        // Email verification routes
        Route::post('/send-verification-email', [EmailVerificationController::class, 'sendVerificationEmail']);
        Route::post('/verify-email', [EmailVerificationController::class, 'verifyEmail']);
    });

    // Documentation routes
    Route::get('/info', [DocumentationController::class, 'info']);
    Route::get('/health', [DocumentationController::class, 'health']);

    // Protected routes (authentication required)
    Route::middleware('auth:sanctum')->group(function () {
        // Auth routes
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/profile', [AuthController::class, 'profile'])->middleware('permission:view-profile');
            Route::put('/profile', [AuthController::class, 'updateProfile'])->middleware('permission:edit-profile');
            Route::put('/change-password', [AuthController::class, 'changePassword'])->middleware('permission:change-password');
            Route::post('/resend-verification-email', [EmailVerificationController::class, 'resendVerificationEmail'])->middleware('permission:resend-verification-email');
        });

        // Dashboard routes
        Route::prefix('dashboard')->group(function () {
            Route::get('/data', [DashboardController::class, 'getDashboardData'])->middleware('permission:get-dashboard-data');
        });

        // First-timers routes
        Route::prefix('first-timers')->group(function () {
            Route::get('/', [FirstTimerController::class, 'index'])->middleware('permission:view-first-timers');
            Route::post('/', [FirstTimerController::class, 'store'])->middleware('permission:create-first-timers');
            Route::get('/{firstTimer}', [FirstTimerController::class, 'show'])->middleware('permission:view-first-timers');
            Route::put('/{firstTimer}', [FirstTimerController::class, 'update'])->middleware('permission:edit-first-timers');
            Route::delete('/{firstTimer}', [FirstTimerController::class, 'destroy'])->middleware('permission:delete-first-timers');
        });

        // Members routes
        Route::prefix('members')->group(function () {
            Route::get('/', [MemberController::class, 'index'])->middleware('permission:view-members');
            Route::post('/', [MemberController::class, 'store'])->middleware('permission:create-members');
            Route::get('/statistics', [MemberController::class, 'statistics'])->middleware('permission:view-member-statistics');
            Route::get('/{member}', [MemberController::class, 'show'])->middleware('permission:view-members');
            Route::put('/{member}', [MemberController::class, 'update'])->middleware('permission:edit-members');
            Route::delete('/{member}', [MemberController::class, 'destroy'])->middleware('permission:delete-members');
            
            // Member group management routes
            Route::get('/{member}/groups', [MemberController::class, 'getGroups'])->middleware('permission:manage-member-groups');
            Route::post('/{member}/groups', [MemberController::class, 'addToGroups'])->middleware('permission:manage-member-groups');
            Route::delete('/{member}/groups', [MemberController::class, 'removeFromGroups'])->middleware('permission:manage-member-groups');
            Route::put('/{member}/groups/{group_id}', [MemberController::class, 'updateGroupRole'])->middleware('permission:update-member-group-role');
            
            // User account management routes
            Route::post('/{member}/create-user-account', [MemberController::class, 'createUserAccount'])->middleware('permission:create-user-account');
            
            // Member identification routes
            Route::get('/{memberId}/identification-id', [AttendanceController::class, 'getMemberIdentificationId'])->middleware('permission:get-member-identification-id');
            Route::post('/{memberId}/generate-identification-id', [AttendanceController::class, 'generateMemberIdentificationId'])->middleware('permission:generate-member-identification-id');
        });

        // File upload routes
        Route::prefix('files')->group(function () {
            Route::post('/upload', [FileUploadController::class, 'upload'])->middleware('permission:upload-files');
            Route::post('/upload-multiple', [FileUploadController::class, 'uploadMultiple'])->middleware('permission:upload-multiple-files');
            Route::get('/by-model', [FileUploadController::class, 'getByModel'])->middleware('permission:get-files-by-model');
            Route::get('/{token}', [FileUploadController::class, 'show'])->middleware('permission:view-files');
            Route::delete('/{token}', [FileUploadController::class, 'delete'])->middleware('permission:delete-files');
        });

        // Groups management routes
        Route::prefix('groups')->group(function () {
            Route::get('/', [GroupController::class, 'index'])->middleware('permission:view-groups');
            Route::post('/', [GroupController::class, 'store'])->middleware('permission:create-groups');
            Route::get('/{id}', [GroupController::class, 'show'])->middleware('permission:view-groups');
            Route::put('/{id}', [GroupController::class, 'update'])->middleware('permission:edit-groups');
            Route::delete('/{id}', [GroupController::class, 'destroy'])->middleware('permission:delete-groups');
            
            // Group statistics and analytics
            Route::get('/statistics/overall', [GroupController::class, 'getOverallStats'])->middleware('permission:view-group-overall-stats');
            Route::get('/statistics/needing-attention', [GroupController::class, 'getGroupsNeedingAttention'])->middleware('permission:view-groups-needing-attention');
            
            // Advanced search
            Route::post('/search', [GroupController::class, 'searchGroups'])->middleware('permission:search-groups');
            
            // Bulk operations
            Route::post('/bulk-update-status', [GroupController::class, 'bulkUpdateStatus'])->middleware('permission:bulk-update-group-status');
            
            // Group member management routes
            Route::get('/{id}/members', [GroupController::class, 'getMembers'])->middleware('permission:manage-group-members');
            Route::post('/{id}/members', [GroupController::class, 'addMember'])->middleware('permission:manage-group-members');
            Route::delete('/{id}/members/{member_id}', [GroupController::class, 'removeMember'])->middleware('permission:manage-group-members');
            Route::put('/{id}/members/{member_id}/role', [GroupController::class, 'updateMemberRole'])->middleware('permission:update-group-member-role');
            
            // Group statistics
            Route::get('/{id}/statistics', [GroupController::class, 'getGroupStats'])->middleware('permission:view-group-statistics');
        });

        // Families management routes
        Route::prefix('families')->group(function () {
            Route::get('/', [FamilyController::class, 'index'])->middleware('permission:view-families');
            Route::post('/', [FamilyController::class, 'store'])->middleware('permission:create-families');
            Route::get('/{id}', [FamilyController::class, 'show'])->middleware('permission:view-families');
            Route::put('/{id}', [FamilyController::class, 'update'])->middleware('permission:edit-families');
            Route::delete('/{id}', [FamilyController::class, 'destroy'])->middleware('permission:delete-families');
            
            // Family member management routes
            Route::get('/{id}/members', [FamilyController::class, 'getMembers'])->middleware('permission:manage-family-members');
            Route::post('/{id}/members', [FamilyController::class, 'addMember'])->middleware('permission:manage-family-members');
            Route::delete('/{id}/members/{member_id}', [FamilyController::class, 'removeMember'])->middleware('permission:manage-family-members');
            
            // Get family events
            Route::get('/{id}/events', [FamilyController::class, 'getFamilyEvents'])->middleware('permission:get-family-events');
            
            // Get current user's family
            Route::get('/my-family', [FamilyController::class, 'getMyFamily'])->middleware('permission:get-my-family');
            
            // Get family statistics
            Route::get('/statistics', [FamilyController::class, 'getStatistics'])->middleware('permission:get-family-statistics');
        });

        // Entities endpoint for form data
        Route::get('/entities', [EntityController::class, 'index'])->middleware('permission:view-entities');

        // Events management routes
        Route::prefix('events')->group(function () {
            Route::get('/', [EventController::class, 'index'])->middleware('permission:view-eventsss');
            Route::post('/', [EventController::class, 'store'])->middleware('permission:create-events');
            Route::get('/{event}', [EventController::class, 'show'])->middleware('permission:view-events');
            Route::put('/{event}', [EventController::class, 'update'])->middleware('permission:edit-events');
            Route::delete('/{event}', [EventController::class, 'destroy'])->middleware('permission:delete-events');
            
            // Event management actions
            Route::post('/{event}/cancel', [EventController::class, 'cancel'])->middleware('permission:cancel-events');
            Route::post('/{event}/publish', [EventController::class, 'publish'])->middleware('permission:publish-events');
            
            // Event-family relationship management
            Route::get('/{event}/families', [EventController::class, 'getEventFamilies'])->middleware('permission:manage-event-families');
            Route::post('/{event}/families', [EventController::class, 'addFamiliesToEvent'])->middleware('permission:manage-event-families');
            Route::put('/{event}/families/{family_id}', [EventController::class, 'updateEventFamily'])->middleware('permission:manage-event-families');
            Route::delete('/{event}/families/{family_id}', [EventController::class, 'removeFamilyFromEvent'])->middleware('permission:manage-event-families');
            
            // Event-group relationship management
            Route::get('/{event}/groups', [EventController::class, 'getEventGroups'])->middleware('permission:manage-event-groups');
            Route::post('/{event}/groups', [EventController::class, 'addGroupsToEvent'])->middleware('permission:manage-event-groups');
            Route::put('/{event}/groups/{group_id}', [EventController::class, 'updateEventGroup'])->middleware('permission:manage-event-groups');
            Route::delete('/{event}/groups/{group_id}', [EventController::class, 'removeGroupFromEvent'])->middleware('permission:manage-event-groups');
            
            // Member-specific events
            Route::get('/member/{memberId}', [EventController::class, 'getMemberEvents'])->middleware('permission:view-member-events');
            
            // Attendance management routes
            Route::prefix('{event}/attendance')->group(function () {
                Route::get('/', [AttendanceController::class, 'getEventAttendance'])->middleware('permission:get-event-attendance');
                Route::get('/eligible-members', [AttendanceController::class, 'getEligibleMembers'])->middleware('permission:get-eligible-members');
                Route::put('/{memberId}/status', [AttendanceController::class, 'updateAttendanceStatus'])->middleware('permission:update-attendance-status');
                Route::post('/{memberId}/check-in', [AttendanceController::class, 'markCheckIn'])->middleware('permission:mark-check-in');
                Route::post('/{memberId}/check-out', [AttendanceController::class, 'markCheckOut'])->middleware('permission:mark-check-out');
                Route::post('/bulk-update', [AttendanceController::class, 'bulkUpdateAttendance'])->middleware('permission:bulk-update-attendance');
                Route::post('/ensure-records', [AttendanceController::class, 'ensureAttendanceRecords'])->middleware('permission:ensure-attendance-records');
            });
        });

        // Member ID-based attendance routes
        Route::prefix('attendance')->group(function () {
            Route::post('/scan-member-id', [AttendanceController::class, 'scanMemberId'])->middleware('permission:scan-member-id');
        });

        // Event Categories management routes
        Route::prefix('event-categories')->group(function () {
            Route::get('/', [EventCategoryController::class, 'index'])->middleware('permission:view-event-categories');
            Route::post('/', [EventCategoryController::class, 'store'])->middleware('permission:create-event-categories');
            Route::get('/{category}', [EventCategoryController::class, 'show'])->middleware('permission:view-event-categories');
            Route::put('/{category}', [EventCategoryController::class, 'update'])->middleware('permission:edit-event-categories');
            Route::delete('/{category}', [EventCategoryController::class, 'destroy'])->middleware('permission:delete-event-categories');
            
            // Category-specific operations
            Route::get('/{category}/events', [EventCategoryController::class, 'getCategoryEvents'])->middleware('permission:view-category-events');
            Route::post('/{category}/generate-events', [EventCategoryController::class, 'generateEvents'])->middleware('permission:generate-category-events');
            Route::post('/{category}/generate-one-time-event', [EventCategoryController::class, 'generateOneTimeEvent'])->middleware('permission:generate-one-time-event');
            Route::post('/{category}/toggle-status', [EventCategoryController::class, 'toggleStatus'])->middleware('permission:toggle-category-status');
            Route::get('/{category}/statistics', [EventCategoryController::class, 'getStatistics'])->middleware('permission:view-category-statistics');
        });

        // General attendance routes
        Route::prefix('general-attendance')->group(function () {
            Route::get('/event/{eventId}', [GeneralAttendanceController::class, 'getEventGeneralAttendance'])->middleware('permission:get-event-general-attendance');
            Route::post('/event/{eventId}', [GeneralAttendanceController::class, 'updateGeneralAttendance'])->middleware('permission:update-general-attendance');
            Route::get('/analytics', [GeneralAttendanceController::class, 'getAttendanceAnalytics'])->middleware('permission:get-attendance-analytics');
            Route::get('/summary', [GeneralAttendanceController::class, 'getGeneralAttendanceSummary'])->middleware('permission:get-general-attendance-summary');
            Route::get('/statistics', [GeneralAttendanceController::class, 'getStatistics'])->middleware('permission:get-general-attendance-statistics');
            Route::get('/test', [GeneralAttendanceController::class, 'testStatistics'])->middleware('permission:get-general-attendance-statistics');
            Route::get('/families', [GeneralAttendanceController::class, 'getFamilies'])->middleware('permission:get-general-attendance-families');
        });

        // User Management routes
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index'])->middleware('permission:view-users');
            Route::post('/', [UserController::class, 'store'])->middleware('permission:create-users');
            Route::get('/statistics', [UserController::class, 'statistics'])->middleware('permission:view-users');
            Route::get('/{user}', [UserController::class, 'show'])->middleware('permission:view-users');
            Route::put('/{user}', [UserController::class, 'update'])->middleware('permission:edit-users');
            Route::delete('/{user}', [UserController::class, 'destroy'])->middleware('permission:delete-users');
            Route::put('/{user}/password', [UserController::class, 'changePassword'])->middleware('permission:change-user-password');
            Route::put('/{user}/toggle-status', [UserController::class, 'toggleStatus'])->middleware('permission:toggle-user-status');
        });

        // Role Management routes
        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index'])->middleware('permission:view-roles');
            Route::post('/', [RoleController::class, 'store'])->middleware('permission:create-roles');
            Route::get('/statistics', [RoleController::class, 'statistics'])->middleware('permission:view-role-statistics');
            Route::get('/permissions', [RoleController::class, 'permissions'])->middleware('permission:view-role-permissions');
            Route::get('/{role}', [RoleController::class, 'show'])->middleware('permission:view-roles');
            Route::put('/{role}', [RoleController::class, 'update'])->middleware('permission:edit-roles');
            Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware('permission:delete-roles');
            Route::post('/{role}/duplicate', [RoleController::class, 'duplicate'])->middleware('permission:duplicate-role');
        });

        // Partnership management routes
        Route::prefix('partnerships')->group(function () {
            Route::get('/', [PartnershipController::class, 'index'])->middleware('permission:view-partnerships');
            Route::post('/', [PartnershipController::class, 'store'])->middleware('permission:create-partnerships');
            Route::get('/{partnership}', [PartnershipController::class, 'show'])->middleware('permission:view-partnerships');
            Route::put('/{partnership}', [PartnershipController::class, 'update'])->middleware('permission:edit-partnerships');
            Route::delete('/{partnership}', [PartnershipController::class, 'destroy'])->middleware('permission:delete-partnerships');
            Route::post('/{id}/generate-schedule', [PartnershipController::class, 'generateSchedule'])->middleware('permission:generate-partnership-schedule');
        });

        // Partnership Category resource routes
        Route::prefix('partnership-categories')->group(function () {
            Route::get('/', [PartnershipCategoryController::class, 'index'])->middleware('permission:view-partnership-categories');
            Route::post('/', [PartnershipCategoryController::class, 'store'])->middleware('permission:create-partnership-categories');
            Route::get('/{id}', [PartnershipCategoryController::class, 'show'])->middleware('permission:view-partnership-categories');
            Route::put('/{id}', [PartnershipCategoryController::class, 'update'])->middleware('permission:edit-partnership-categories');
            Route::delete('/{id}', [PartnershipCategoryController::class, 'destroy'])->middleware('permission:delete-partnership-categories');
        });

        // Expense Category resource routes
        Route::prefix('expense-categories')->group(function () {
            Route::get('/', [ExpenseCategoryController::class, 'index'])->middleware('permission:view-expense-categories');
            Route::post('/', [ExpenseCategoryController::class, 'store'])->middleware('permission:create-expense-categories');
            Route::get('/{expenseCategory}', [ExpenseCategoryController::class, 'show'])->middleware('permission:view-expense-categories');
            Route::put('/{expenseCategory}', [ExpenseCategoryController::class, 'update'])->middleware('permission:edit-expense-categories');
            Route::delete('/{expenseCategory}', [ExpenseCategoryController::class, 'destroy'])->middleware('permission:delete-expense-categories');
        });

        // Expense resource routes
        Route::prefix('expenses')->group(function () {
            Route::get('/', [ExpenseController::class, 'index'])->middleware('permission:view-expenses');
            Route::post('/', [ExpenseController::class, 'store'])->middleware('permission:create-expenses');
            Route::get('/{expense}', [ExpenseController::class, 'show'])->middleware('permission:view-expenses');
            Route::put('/{expense}', [ExpenseController::class, 'update'])->middleware('permission:edit-expenses');
            Route::delete('/{expense}', [ExpenseController::class, 'destroy'])->middleware('permission:delete-expenses');
        });

        // Income Category resource routes
        Route::prefix('income-categories')->group(function () {
            Route::get('/', [IncomeCategoryController::class, 'index'])->middleware('permission:view-income-categories');
            Route::post('/', [IncomeCategoryController::class, 'store'])->middleware('permission:create-income-categories');
            Route::get('/{incomeCategory}', [IncomeCategoryController::class, 'show'])->middleware('permission:view-income-categories');
            Route::put('/{incomeCategory}', [IncomeCategoryController::class, 'update'])->middleware('permission:edit-income-categories');
            Route::delete('/{incomeCategory}', [IncomeCategoryController::class, 'destroy'])->middleware('permission:delete-income-categories');
        });

        // Income resource routes
        Route::prefix('incomes')->group(function () {
            Route::get('/', [IncomeController::class, 'index'])->middleware('permission:view-incomes');
            Route::post('/', [IncomeController::class, 'store'])->middleware('permission:create-incomes');
            Route::get('/{income}', [IncomeController::class, 'show'])->middleware('permission:view-incomes');
            Route::put('/{income}', [IncomeController::class, 'update'])->middleware('permission:edit-incomes');
            Route::delete('/{income}', [IncomeController::class, 'destroy'])->middleware('permission:delete-incomes');
        });

        // Tithe management routes
        Route::prefix('tithes')->group(function () {
            Route::get('/', [TitheController::class, 'index'])->middleware('permission:view-tithes');
            Route::post('/', [TitheController::class, 'store'])->middleware('permission:create-tithes');
            Route::get('/statistics', [TitheController::class, 'statistics'])->middleware('permission:view-tithe-statistics');
            Route::get('/monthly-trends', [TitheController::class, 'monthlyTrends'])->middleware('permission:view-monthly-trends');
            Route::get('/member-performance', [TitheController::class, 'memberPerformance'])->middleware('permission:view-member-performance');
            Route::get('/frequency-analysis', [TitheController::class, 'frequencyAnalysis'])->middleware('permission:view-frequency-analysis');
            Route::get('/recent-activity', [TitheController::class, 'recentActivity'])->middleware('permission:view-recent-activity');
            Route::post('/export', [TitheController::class, 'exportReport'])->middleware('permission:export-tithe-report');
            Route::get('/{tithe}', [TitheController::class, 'show'])->middleware('permission:view-tithes');
            Route::put('/{tithe}', [TitheController::class, 'update'])->middleware('permission:edit-tithes');
            Route::delete('/{tithe}', [TitheController::class, 'destroy'])->middleware('permission:delete-tithes');
            Route::post('/{tithe}/mark-paid', [TitheController::class, 'markAsPaid'])->middleware('permission:mark-tithe-paid');
            
            // Tithe payment routes
            Route::prefix('{tithe}/payments')->group(function () {
                Route::get('/', [TithePaymentController::class, 'index'])->middleware('permission:view-tithe-payments');
                Route::post('/', [TithePaymentController::class, 'store'])->middleware('permission:create-tithe-payments');
                Route::get('/{payment}', [TithePaymentController::class, 'show'])->middleware('permission:view-tithe-payments');
                Route::put('/{payment}', [TithePaymentController::class, 'update'])->middleware('permission:edit-tithe-payments');
                Route::delete('/{payment}', [TithePaymentController::class, 'destroy'])->middleware('permission:delete-tithe-payments');
            });
        });

        // Reports routes
        Route::prefix('reports')->group(function () {
            Route::get('/income', [ReportsController::class, 'getIncomeReport'])->middleware('permission:get-income-report');
            Route::get('/expenses', [ReportsController::class, 'getExpenseReport'])->middleware('permission:get-expense-report');
            Route::get('/comparison', [ReportsController::class, 'getComparisonReport'])->middleware('permission:get-comparison-report');
            Route::post('/export', [ReportsController::class, 'exportReport'])->middleware('permission:export-report');
            Route::get('/export/history', [ReportsController::class, 'getExportHistory'])->middleware('permission:get-export-history');
            Route::get('/export/{id}/download', [ReportsController::class, 'downloadReport'])->middleware('permission:download-report');
            Route::delete('/export/{id}', [ReportsController::class, 'deleteExport'])->middleware('permission:delete-export');
            Route::get('/dashboard-summary', [ReportsController::class, 'getDashboardSummary'])->middleware('permission:get-dashboard-summary');
            Route::get('/insights', [ReportsController::class, 'getFinancialInsights'])->middleware('permission:get-financial-insights');
            Route::get('/recent-activity', [ReportsController::class, 'getRecentActivity'])->middleware('permission:get-recent-activity');
        });

        // Import/Export routes
        Route::prefix('import')->group(function () {
            Route::get('/', [ImportController::class, 'index'])->middleware('permission:view-imports');
            Route::get('/sample/{type}', [ImportController::class, 'downloadSample'])->middleware('permission:download-import-sample')->name('api.v1.import.sample');
            Route::post('/{type}', [ImportController::class, 'processImport'])->middleware('permission:process-import')->name('api.v1.import.process');
            Route::get('/audit-logs', [ImportController::class, 'getAuditLogs'])->middleware('permission:get-audit-logs');
        });

        // Backup management routes
        Route::prefix('backups')->group(function () {
            Route::get('/', [BackupController::class, 'index'])->middleware('permission:view-backups');
            Route::post('/', [BackupController::class, 'store'])->middleware('permission:create-backups');
            Route::get('/stats', [BackupController::class, 'stats'])->middleware('permission:view-backup-stats');
            Route::post('/process', [BackupController::class, 'process'])->middleware('permission:process-backups');
            Route::get('/{backup}', [BackupController::class, 'show'])->middleware('permission:view-backups');
            Route::get('/{backup}/download', [BackupController::class, 'download'])->middleware('permission:download-backup');
            Route::post('/{backup}/restore', [BackupController::class, 'restore'])->middleware('permission:restore-backups');
            Route::delete('/{backup}', [BackupController::class, 'destroy'])->middleware('permission:delete-backups');
        });
    });

    // Test route
    Route::get('/test', function () {
        return response()->json([
            'message' => 'API is working!',
            'timestamp' => now()
        ]);
    });
}); 