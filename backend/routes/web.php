<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Add a GET route for login page
Route::get('/auth/login', function () {
    // Option 1: Redirect to frontend login page
    return redirect()->away(config('app.frontend_url', 'http://localhost:3000') . '/auth/login');
    
    // Option 2: Return a simple response
    // return response()->json(['message' => 'Please use POST /api/v1/auth/login for authentication'], 405);
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Catch-all route for undefined routes
Route::fallback(function () {
    return response()->json([
        'message' => 'Route not found',
        'suggestion' => 'Please check the API documentation at /api/v1/info'
    ], 404);
});