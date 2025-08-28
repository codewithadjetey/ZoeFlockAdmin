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

    // Public first-timer registration (QR/self-registration, no auth)

    // Protected routes (authentication required)
    Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/resend-verification-email', [EmailVerificationController::class, 'resendVerificationEmail']);
    });

    // create resource routes first-timers
    Route::prefix('first-timers')->group(function () {
        Route::get('/', [FirstTimerController::class, 'index']);
        Route::post('/', [FirstTimerController::class, 'store']);
        Route::get('/{firstTimer}', [FirstTimerController::class, 'show']);
        Route::put('/{firstTimer}', [FirstTimerController::class, 'update']);
        Route::delete('/{firstTimer}', [FirstTimerController::class, 'destroy']);
    });

    Route::prefix('members')->group(function () {
        Route::get('/', [MemberController::class, 'index']);
        Route::post('/', [MemberController::class, 'store']);
        Route::get('/statistics', [MemberController::class, 'statistics']);
        Route::get('/{member}', [MemberController::class, 'show']);
        Route::put('/{member}', [MemberController::class, 'update']);
        Route::delete('/{member}', [MemberController::class, 'destroy']);
        
        // Member group management routes
        Route::get('/{member}/groups', [MemberController::class, 'getGroups']);
        Route::post('/{member}/groups', [MemberController::class, 'addToGroups']);
        Route::delete('/{member}/groups', [MemberController::class, 'removeFromGroups']);
        Route::put('/{member}/groups/{group_id}', [MemberController::class, 'updateGroupRole']);
        
        // User account management routes
        Route::post('/{member}/create-user-account', [MemberController::class, 'createUserAccount']);
    });

    // File upload routes
    Route::prefix('files')->group(function () {
        Route::post('/upload', [FileUploadController::class, 'upload']);
        Route::post('/upload-multiple', [FileUploadController::class, 'uploadMultiple']);
        Route::get('/by-model', [FileUploadController::class, 'getByModel']);
        Route::get('/{token}', [FileUploadController::class, 'show']);
        Route::delete('/{token}', [FileUploadController::class, 'delete']);
    });

    // Groups management routes
    Route::prefix('groups')->group(function () {
        Route::get('/', [GroupController::class, 'index']);
        Route::post('/', [GroupController::class, 'store']);
        Route::get('/{id}', [GroupController::class, 'show']);
        Route::put('/{id}', [GroupController::class, 'update']);
        Route::delete('/{id}', [GroupController::class, 'destroy']);
        
        // Group statistics and analytics
        Route::get('/statistics/overall', [GroupController::class, 'getOverallStats']);
        Route::get('/statistics/needing-attention', [GroupController::class, 'getGroupsNeedingAttention']);
        
        // Advanced search
        Route::post('/search', [GroupController::class, 'searchGroups']);
        
        // Bulk operations
        Route::post('/bulk-update-status', [GroupController::class, 'bulkUpdateStatus']);
        
        // Group member management routes
        Route::get('/{id}/members', [GroupController::class, 'getMembers']);
        Route::post('/{id}/members', [GroupController::class, 'addMember']);
        Route::delete('/{id}/members/{member_id}', [GroupController::class, 'removeMember']);
        Route::put('/{id}/members/{member_id}/role', [GroupController::class, 'updateMemberRole']);
        
        // Group statistics
        Route::get('/{id}/statistics', [GroupController::class, 'getGroupStats']);
    });

    // Families management routes
    Route::prefix('families')->group(function () {
        Route::get('/', [FamilyController::class, 'index']);
        Route::post('/', [FamilyController::class, 'store']);
        Route::get('/{id}', [FamilyController::class, 'show']);
        Route::put('/{id}', [FamilyController::class, 'update']);
        Route::delete('/{id}', [FamilyController::class, 'destroy']);
        
        // Family member management routes
        Route::get('/{id}/members', [FamilyController::class, 'getMembers']);
        Route::post('/{id}/members', [FamilyController::class, 'addMember']);
        Route::delete('/{id}/members/{member_id}', [FamilyController::class, 'removeMember']);
        
        // Get family events
        Route::get('/{id}/events', [FamilyController::class, 'getFamilyEvents']);
        
        // Get current user's family
        Route::get('/my-family', [FamilyController::class, 'getMyFamily']);
        
        // Get family statistics
        Route::get('/statistics', [FamilyController::class, 'getStatistics']);
    });

    // Entities endpoint for form data
    Route::get('/entities', [EntityController::class, 'index']);

    // Events management routes
    Route::prefix('events')->group(function () {
        Route::get('/', [EventController::class, 'index']);
        Route::post('/', [EventController::class, 'store']);
        Route::get('/{event}', [EventController::class, 'show']);
        Route::put('/{event}', [EventController::class, 'update']);
        Route::delete('/{event}', [EventController::class, 'destroy']);
        
        // Event management actions
        Route::post('/{event}/cancel', [EventController::class, 'cancel']);
        Route::post('/{event}/publish', [EventController::class, 'publish']);
        
        // Event-family relationship management
        Route::get('/{event}/families', [EventController::class, 'getEventFamilies']);
        Route::post('/{event}/families', [EventController::class, 'addFamiliesToEvent']);
        Route::put('/{event}/families/{family_id}', [EventController::class, 'updateEventFamily']);
        Route::delete('/{event}/families/{family_id}', [EventController::class, 'removeFamilyFromEvent']);
        
        // Event-group relationship management
        Route::get('/{event}/groups', [EventController::class, 'getEventGroups']);
        Route::post('/{event}/groups', [EventController::class, 'addGroupsToEvent']);
        Route::put('/{event}/groups/{group_id}', [EventController::class, 'updateEventGroup']);
        Route::delete('/{event}/groups/{group_id}', [EventController::class, 'removeGroupFromEvent']);
        
        // Member-specific events
        Route::get('/member/{memberId}', [EventController::class, 'getMemberEvents']);
        
            // Attendance management routes
    Route::prefix('{event}/attendance')->group(function () {
        Route::get('/', [AttendanceController::class, 'getEventAttendance']);
        Route::get('/eligible-members', [AttendanceController::class, 'getEligibleMembers']);
        Route::put('/{memberId}/status', [AttendanceController::class, 'updateAttendanceStatus']);
        Route::post('/{memberId}/check-in', [AttendanceController::class, 'markCheckIn']);
        Route::post('/{memberId}/check-out', [AttendanceController::class, 'markCheckOut']);
        Route::post('/bulk-update', [AttendanceController::class, 'bulkUpdateAttendance']);
        Route::post('/ensure-records', [AttendanceController::class, 'ensureAttendanceRecords']);
    });
    });

    // Barcode-based attendance routes
    Route::prefix('attendance')->group(function () {
        Route::post('/scan-barcode', [AttendanceController::class, 'scanBarcode']);
    });

    // Member barcode routes
    Route::prefix('members')->group(function () {
        Route::get('/{memberId}/barcode', [AttendanceController::class, 'getMemberBarcode']);
        Route::post('/{memberId}/generate-barcode', [AttendanceController::class, 'generateMemberBarcode']);
    });

    // Event Categories management routes
    Route::prefix('event-categories')->group(function () {
        Route::get('/', [EventCategoryController::class, 'index']);
        Route::post('/', [EventCategoryController::class, 'store']);
        Route::get('/{category}', [EventCategoryController::class, 'show']);
        Route::put('/{category}', [EventCategoryController::class, 'update']);
        Route::delete('/{category}', [EventCategoryController::class, 'destroy']);
        
        // Category-specific operations
        Route::get('/{category}/events', [EventCategoryController::class, 'getCategoryEvents']);
        Route::post('/{category}/generate-events', [EventCategoryController::class, 'generateEvents']);
        Route::post('/{category}/generate-one-time-event', [EventCategoryController::class, 'generateOneTimeEvent']);
        Route::post('/{category}/toggle-status', [EventCategoryController::class, 'toggleStatus']);
        Route::get('/{category}/statistics', [EventCategoryController::class, 'getStatistics']);
    });

    // General attendance routes
    Route::prefix('general-attendance')->group(function () {
        Route::get('/event/{eventId}', [GeneralAttendanceController::class, 'getEventGeneralAttendance']);
        Route::post('/event/{eventId}', [GeneralAttendanceController::class, 'updateGeneralAttendance']);
        Route::get('/analytics', [GeneralAttendanceController::class, 'getAttendanceAnalytics']);
        Route::get('/summary', [GeneralAttendanceController::class, 'getGeneralAttendanceSummary']);
        Route::get('/statistics', [GeneralAttendanceController::class, 'getStatistics']);
        Route::get('/test', [GeneralAttendanceController::class, 'testStatistics']);
        Route::get('/families', [GeneralAttendanceController::class, 'getFamilies']);
    });

    // User Management routes
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('/statistics', [UserController::class, 'statistics']);
        Route::get('/{user}', [UserController::class, 'show']);
        Route::put('/{user}', [UserController::class, 'update']);
        Route::delete('/{user}', [UserController::class, 'destroy']);
        Route::put('/{user}/password', [UserController::class, 'changePassword']);
        Route::put('/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    });

    // Role Management routes
    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index']);
        Route::post('/', [RoleController::class, 'store']);
        Route::get('/statistics', [RoleController::class, 'statistics']);
        Route::get('/permissions', [RoleController::class, 'permissions']);
        Route::get('/{role}', [RoleController::class, 'show']);
        Route::put('/{role}', [RoleController::class, 'update']);
        Route::delete('/{role}', [RoleController::class, 'destroy']);
        Route::post('/{role}/duplicate', [RoleController::class, 'duplicate']);
    });

    // Partnership management routes
    Route::apiResource('partnerships', PartnershipController::class);
    Route::post('partnerships/{id}/generate-schedule', [PartnershipController::class, 'generateSchedule']);

    // Partnership Category resource routes
    Route::prefix('partnership-categories')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\V1\PartnershipCategoryController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\V1\PartnershipCategoryController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\Api\V1\PartnershipCategoryController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Api\V1\PartnershipCategoryController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\V1\PartnershipCategoryController::class, 'destroy']);
    });

    // Expense Category resource routes
    Route::apiResource('expense-categories', ExpenseCategoryController::class);

    // Expense resource routes
    Route::apiResource('expenses', ExpenseController::class);

    // Income Category resource routes
    Route::apiResource('income-categories', IncomeCategoryController::class);

    // Income resource routes
    Route::apiResource('incomes', IncomeController::class);

    // Tithe management routes
    Route::prefix('tithes')->group(function () {
        Route::get('/', [TitheController::class, 'index']);
        Route::post('/', [TitheController::class, 'store']);
        Route::get('/statistics', [TitheController::class, 'statistics']);
        Route::get('/{tithe}', [TitheController::class, 'show']);
        Route::put('/{tithe}', [TitheController::class, 'update']);
        Route::delete('/{tithe}', [TitheController::class, 'destroy']);
        Route::post('/{tithe}/mark-paid', [TitheController::class, 'markAsPaid']);
        
        // Tithe payment routes
        Route::prefix('{tithe}/payments')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\TithePaymentController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\V1\TithePaymentController::class, 'store']);
            Route::get('/{payment}', [\App\Http\Controllers\Api\V1\TithePaymentController::class, 'show']);
            Route::put('/{payment}', [\App\Http\Controllers\Api\V1\TithePaymentController::class, 'update']);
            Route::delete('/{payment}', [\App\Http\Controllers\Api\V1\TithePaymentController::class, 'destroy']);
        });
    });

    // Reports routes
    Route::prefix('reports')->group(function () {
        Route::get('/income', [\App\Http\Controllers\Api\V1\ReportsController::class, 'getIncomeReport']);
        Route::get('/expenses', [\App\Http\Controllers\Api\V1\ReportsController::class, 'getExpenseReport']);
        Route::get('/comparison', [\App\Http\Controllers\Api\V1\ReportsController::class, 'getComparisonReport']);
        Route::post('/export', [\App\Http\Controllers\Api\V1\ReportsController::class, 'exportReport']);
        Route::get('/export/history', [\App\Http\Controllers\Api\V1\ReportsController::class, 'getExportHistory']);
        Route::get('/export/{id}/download', [\App\Http\Controllers\Api\V1\ReportsController::class, 'downloadReport']);
        Route::delete('/export/{id}', [\App\Http\Controllers\Api\V1\ReportsController::class, 'deleteExport']);
        Route::get('/dashboard-summary', [\App\Http\Controllers\Api\V1\ReportsController::class, 'getDashboardSummary']);
        Route::get('/insights', [\App\Http\Controllers\Api\V1\ReportsController::class, 'getFinancialInsights']);
    });

    // Route::prefix('donations')->group(function () {
    //     Route::get('/', [DonationController::class, 'index']);
    //     Route::post('/', [DonationController::class, 'store']);
    //     Route::get('/{donation}', [DonationController::class, 'show']);
    //     Route::put('/{donation}', [DonationController::class, 'update']);
    //     Route::delete('/{donation}', [DonationController::class, 'destroy']);
    // });

    // Route::prefix('communications')->group(function () {
    //     Route::get('/', [CommunicationController::class, 'index']);
    //     Route::post('/', [CommunicationController::class, 'store']);
    //     Route::get('/{communication}', [CommunicationController::class, 'show']);
    //     Route::put('/{communication}', [CommunicationController::class, 'update']);
    //     Route::delete('/{communication}', [CommunicationController::class, 'destroy']);
    // });
    });

    // Test route
    Route::get('/test', function () {
        return response()->json([
            'message' => 'API is working!',
            'timestamp' => now()
        ]);
    });

    // Individual attendance statistics
    Route::get('attendance/statistics/individual', [\App\Http\Controllers\Api\V1\AttendanceController::class, 'getIndividualStatistics']);
}); 