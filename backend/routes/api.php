<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EmailVerificationController;
use App\Http\Controllers\Api\V1\MemberController;
use App\Http\Controllers\Api\V1\DocumentationController;

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
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/resend-verification-email', [EmailVerificationController::class, 'resendVerificationEmail']);
    });

    // Member management routes
    Route::prefix('members')->group(function () {
        Route::get('/', [MemberController::class, 'index']);
        Route::post('/', [MemberController::class, 'store']);
        Route::get('/statistics', [MemberController::class, 'statistics']);
        Route::get('/{member}', [MemberController::class, 'show']);
        Route::put('/{member}', [MemberController::class, 'update']);
        Route::delete('/{member}', [MemberController::class, 'destroy']);
    });

    // TODO: Add routes for other modules (Groups, Events, Donations, Communications, etc.)
    // Route::prefix('groups')->group(function () {
    //     Route::get('/', [GroupController::class, 'index']);
    //     Route::post('/', [GroupController::class, 'store']);
    //     Route::get('/{group}', [GroupController::class, 'show']);
    //     Route::put('/{group}', [GroupController::class, 'update']);
    //     Route::delete('/{group}', [GroupController::class, 'destroy']);
    // });

    // Route::prefix('events')->group(function () {
    //     Route::get('/', [EventController::class, 'index']);
    //     Route::post('/', [EventController::class, 'store']);
    //     Route::get('/{event}', [EventController::class, 'show']);
    //     Route::put('/{event}', [EventController::class, 'update']);
    //     Route::delete('/{event}', [EventController::class, 'destroy']);
    // });

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
}); 