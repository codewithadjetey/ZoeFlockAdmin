<?php

use App\Http\Controllers\Api\V1\Frontend\FirstTimerController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Frontend\EventController;


Route::prefix('frontend')->group(function () {
    // Public event category info (no auth)
    Route::post('/first-timer', [FirstTimerController::class, 'createFirstTimerGuest']);
    Route::get('/event-category/{id}', [FirstTimerController::class, 'getTodayEvent']);

});
